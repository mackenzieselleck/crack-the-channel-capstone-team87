import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';

export type Db = PoolClient;

const url = process.env.TEST_DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
if (!/@(127\.0\.0\.1|localhost)(:\d+)?\//.test(url)) {
  throw new Error(`Refuse to run DB tests against non local database: ${url}`);
}

const pool = new Pool({ connectionString: url });
export const closePool = () => pool.end();

// tests run in transactions that roll back
export async function withTx(fn: (db: Db) => Promise<void>) {
  const db = await pool.connect();
  try {
    await db.query('begin');
    await fn(db);
  } finally {
    await db.query('rollback');
    db.release();
  }
}

// runs as a user or anon guest
export async function asRole<T>(db: Db, role: 'authenticated' | 'anon', userId: string | null, fn: () => Promise<T>) {
  await db.query('savepoint as_role');
  try {
    await db.query(`select set_config('request.jwt.claims', $1, true)`, [
      JSON.stringify(userId ? { sub: userId, role } : { role }),
    ]);
    await db.query(`set local role ${role}`);
    const result = await fn();
    await db.query('reset role');
    await db.query(`select set_config('request.jwt.claims', '', true)`);
    await db.query('release savepoint as_role');
    return result;
  } catch (err) {
    await db.query('rollback to savepoint as_role');
    throw err;
  }
}

export async function createUser(db: Db) {
  const id = randomUUID();
  await db.query(`insert into auth.users (id, email, aud, role) values ($1, $2, 'authenticated', 'authenticated')`, [
    id,
    `${id}@modules.test`,
  ]);
  await db.query(
    `insert into profiles (id, first_name, last_name) values ($1, 'Test', 'User') on conflict (id) do nothing`,
    [id],
  );
  return id;
}

// module: 4 pages, 10 questions, 70% pass mark
// published inside test transaction
export async function quizModule(db: Db) {
  await db.query(`update modules set is_published = true where slug = 'quantum-basics'`);
  const { rows } = await db.query(
    `select m.id, m.pass_mark, m.xp_reward,
            (select count(*)::int from module_pages p where p.module_id = m.id) as pages,
            (select count(*)::int from quiz_questions q where q.module_id = m.id) as questions
       from modules m where m.slug = 'quantum-basics'`,
  );
  if (!rows[0]) throw new Error('Module "quantum-basics" missing: run the BB84 content pack migration');
  return rows[0] as { id: string; pass_mark: number; xp_reward: number; pages: number; questions: number };
}

export const next = (db: Db, userId: string, moduleId: string, pageIndex: number) =>
  asRole(db, 'authenticated', userId, async () => {
    const { rows } = await db.query('select * from increment_progress($1, $2)', [moduleId, pageIndex]);
    return rows[0] as { pages_completed: number };
  });

export async function readAll(db: Db, userId: string, mod: { id: string; pages: number }) {
  for (let i = 0; i < mod.pages; i++) await next(db, userId, mod.id, i);
}

export const submit = (db: Db, userId: string, moduleId: string, answers: Record<string, number>) =>
  asRole(db, 'authenticated', userId, async () => {
    const { rows } = await db.query('select submit_quiz($1, $2::jsonb) as r', [moduleId, JSON.stringify(answers)]);
    return rows[0].r as { score: number; passed: boolean; xpAwarded: number };
  });

// answers with exactly `correct` right, the rest wrong
export async function answers(db: Db, moduleId: string, correct: number) {
  const { rows } = await db.query(
    `select q.id, k.correct_index, jsonb_array_length(q.options) as n
       from quiz_questions q join answer_keys k on k.question_id = q.id
      where q.module_id = $1 order by q.position`,
    [moduleId],
  );
  return Object.fromEntries(rows.map((r, i) => [r.id, i < correct ? r.correct_index : (r.correct_index + 1) % r.n]));
}

export async function progress(db: Db, userId: string, moduleId: string) {
  const { rows } = await db.query(
    'select pages_completed, quiz_passed, best_score, completed_at from module_progress where user_id = $1 and module_id = $2',
    [userId, moduleId],
  );
  return rows[0] ?? null;
}