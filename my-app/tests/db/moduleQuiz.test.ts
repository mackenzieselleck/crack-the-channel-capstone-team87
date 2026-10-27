import { afterAll, describe, expect, it } from 'vitest';
import { answers, asRole, closePool, createUser, next, progress, quizModule, readAll, submit, withTx } from './helpers';

afterAll(closePool);

describe('submit_quiz', () => {
  it('requires every page to be read first', () =>
    withTx(async (db) => {
      const user = await createUser(db);
      const mod = await quizModule(db);
      await next(db, user, mod.id, 0);
      await expect(submit(db, user, mod.id, {})).rejects.toThrow('finish the reading before taking the test');
    }));

  it('passes at exactly the pass mark and fails one answer below it', () =>
    withTx(async (db) => {
      const user = await createUser(db);
      const mod = await quizModule(db);
      await readAll(db, user, mod);
      const needed = Math.ceil((mod.pass_mark * mod.questions) / 100);

      expect((await submit(db, user, mod.id, await answers(db, mod.id, needed - 1))).passed).toBe(false);
      expect((await submit(db, user, mod.id, await answers(db, mod.id, needed))).passed).toBe(true);
    }));

  it('counts unanswered questions as wrong', () =>
    withTx(async (db) => {
      const user = await createUser(db);
      const mod = await quizModule(db);
      await readAll(db, user, mod);
      expect(await submit(db, user, mod.id, {})).toMatchObject({ score: 0, passed: false });
    }));

  it('keeps the pass, best score and completion date after a worse retake', () =>
    withTx(async (db) => {
      const user = await createUser(db);
      const mod = await quizModule(db);
      await readAll(db, user, mod);

      await submit(db, user, mod.id, await answers(db, mod.id, mod.questions));
      const afterPass = await progress(db, user, mod.id);
      await submit(db, user, mod.id, {});

      expect(await progress(db, user, mod.id)).toEqual({ ...afterPass, best_score: 100, quiz_passed: true });
    }));

  it('awards XP only on the first pass', () =>
    withTx(async (db) => {
      const user = await createUser(db);
      const mod = await quizModule(db);
      await readAll(db, user, mod);
      const all = await answers(db, mod.id, mod.questions);

      expect((await submit(db, user, mod.id, all)).xpAwarded).toBe(mod.xp_reward);
      expect((await submit(db, user, mod.id, all)).xpAwarded).toBe(0);
    }));

  it('never lets learners read the answer keys', () =>
    withTx(async (db) => {
      const user = await createUser(db);
      await quizModule(db);
      const rows = await asRole(db, 'authenticated', user, async () => (await db.query('select * from answer_keys')).rows)
        .catch((err) => (err.code === '42501' ? [] : Promise.reject(err)));
      expect(rows).toEqual([]);
    }));
});