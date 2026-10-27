import { asRole } from './helpers';
import { afterAll, describe, expect, it } from 'vitest';
import { closePool, createUser, next, progress, quizModule, withTx } from './helpers';

afterAll(closePool);

describe('increment_progress', () => {
  it('records the first page as read', () =>
    withTx(async (db) => {
      const user = await createUser(db);
      const mod = await quizModule(db);
      expect((await next(db, user, mod.id, 0)).pages_completed).toBe(1);
    }));

  it('cannot skip ahead past the next unread page', () =>
    withTx(async (db) => {
      const user = await createUser(db);
      const mod = await quizModule(db);
      await next(db, user, mod.id, 0);
      await expect(next(db, user, mod.id, 2)).rejects.toThrow('cannot skip ahead');
    }));

  it('going back to an earlier page never reduces progress', () =>
    withTx(async (db) => {
      const user = await createUser(db);
      const mod = await quizModule(db);
      for (let i = 0; i < 3; i++) await next(db, user, mod.id, i);
      expect((await next(db, user, mod.id, 0)).pages_completed).toBe(3);
    }));

  it('rejects a page index outside the module', () =>
    withTx(async (db) => {
      const user = await createUser(db);
      const mod = await quizModule(db);
      await expect(next(db, user, mod.id, -1)).rejects.toThrow('invalid page index');
      await expect(next(db, user, mod.id, mod.pages)).rejects.toThrow('invalid page index');
    }));

  it('rejects unpublished modules', () =>
    withTx(async (db) => {
      const user = await createUser(db);
      const mod = await quizModule(db);
      await db.query('update modules set is_published = false where id = $1', [mod.id]);
      await expect(next(db, user, mod.id, 0)).rejects.toThrow('module not available');
    }));

  it('cannot be faked by editing progress directly', () =>
    withTx(async (db) => {
      const user = await createUser(db);
      const mod = await quizModule(db);
      await next(db, user, mod.id, 0);

      const { asRole } = await import('./helpers');
      await asRole(db, 'authenticated', user, () =>
        db.query('update module_progress set pages_completed = 99, quiz_passed = true where user_id = $1', [user]),
      ).catch(() => undefined);

      expect(await progress(db, user, mod.id)).toMatchObject({ pages_completed: 1, quiz_passed: false });
    }));
});

describe('anonymous visitors', () => {
  it('cannot read any learning content or call the module functions', () =>
    withTx(async (db) => {
      const mod = await quizModule(db); // published, so only the role decides access

      // a blocked read either errors or returns no rows
      for (const sql of [
        'select id from modules',
        'select id from module_pages',
        'select id from quiz_questions',
        'select question_id from answer_keys',
      ]) {
        const rows = await asRole(db, 'anon', null, async () => (await db.query(sql)).rows).catch((err) =>
          err.code === '42501' ? [] : Promise.reject(err),
        );
        expect(rows, sql).toEqual([]);
      }

      await expect(
        asRole(db, 'anon', null, () => db.query('select increment_progress($1, 0)', [mod.id])),
      ).rejects.toMatchObject({ code: '42501' });
      await expect(
        asRole(db, 'anon', null, () => db.query(`select submit_quiz($1, '{}'::jsonb)`, [mod.id])),
      ).rejects.toMatchObject({ code: '42501' });
    }));
});