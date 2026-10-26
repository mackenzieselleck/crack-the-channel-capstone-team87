-- Badge unlocks: badge catalogue, central award function and unseen-popup tracking

-- 1. Schema:
-- slug: readable id, also used for PNG file name
-- artboard: artboard name used by the unlock popup
-- position: display order on profile page
alter table badges
  add column slug     text unique,
  add column artboard text,
  add column position int not null default 0;

-- null = earned, butunlock popup hasn't been dismissed by user
alter table user_badges add column seen_at timestamptz;


-- Module badges are matched by module slug so module_id can be nulled
alter table badges drop constraint badges_module_id_fkey;
alter table badges
  add constraint badges_module_id_fkey
  foreign key (module_id) references modules(id) on delete set null;


-- 2. Central award function:
-- awards every badge the user qualifies for and doesn't already have
-- returns only newly awarded ones
-- threshold formats:
--   module_pass:<module slug>   passed module's test
--   daily_solve:first           solved at least one Daily Challenge
--   streak:<n>                  best Daily Challenge streak of at least n days
--   all_modules                 earned every module_pass badge
create function award_badges(p_user_id uuid)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_new  uuid[];
  v_more uuid[];
begin
  if p_user_id is null then return '[]'::jsonb; end if;

  -- pass 1: badges with a direct rule
  with p as (
    select coalesce(best_streak, 0) as best_streak, last_challenge
      from profiles where id = p_user_id
  ),
  eligible as (
    select b.id
      from badges b
      left join p on true
     where b.slug is not null
       and (
             (b.threshold like 'module_pass:%' and exists (
                select 1
                  from module_progress mp
                  join modules m on m.id = mp.module_id
                 where mp.user_id = p_user_id
                   and m.slug = split_part(b.threshold, ':', 2)
                   and mp.quiz_passed))
          or (b.threshold = 'daily_solve:first' and p.last_challenge is not null)
          or (b.threshold like 'streak:%'
              and coalesce(p.best_streak, 0) >= split_part(b.threshold, ':', 2)::int)
           )
  ),
  ins as (
    insert into user_badges (user_id, badge_id)
    select p_user_id, id from eligible
    on conflict do nothing
    returning badge_id
  )
  select coalesce(array_agg(badge_id), '{}') into v_new from ins;

  -- pass 2: champion badge, earned once every module badge is unlocked by user
  with ins as (
    insert into user_badges (user_id, badge_id)
    select p_user_id, b.id
      from badges b
     where b.threshold = 'all_modules'
       -- at least one module badge must exist
       and exists (select 1 from badges o where o.threshold like 'module_pass:%')
       and not exists (
             select 1 from badges o
              where o.threshold like 'module_pass:%'
                and not exists (select 1 from user_badges ub
                                 where ub.user_id = p_user_id and ub.badge_id = o.id))
    on conflict do nothing
    returning badge_id
  )
  select coalesce(array_agg(badge_id), '{}') into v_more from ins;

  v_new := v_new || v_more;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
             'id', b.id, 'slug', b.slug, 'title', b.title,
             'description', b.description, 'artboard', b.artboard,
             'iconUrl', b.icon_url)
           order by b.position)
      from badges b where b.id = any(v_new)
  ), '[]'::jsonb);
end $$;

-- submit_quiz and record_daily_solve can call because they run as service role
revoke all on function award_badges(uuid) from public, anon, authenticated;
grant execute on function award_badges(uuid) to service_role;


-- 3. Popup dismissal:

-- only way a user can modify user_badges: set seen_at
create function mark_badges_seen(p_badge_ids uuid[])
returns void
language sql security definer set search_path = public as $$
  update user_badges
     set seen_at = now()
   where user_id = auth.uid()
     and badge_id = any(p_badge_ids)
     and seen_at is null;
$$;

revoke all on function mark_badges_seen(uuid[]) from public, anon;
grant execute on function mark_badges_seen(uuid[]) to authenticated;


-- 4. Realtime: push new badge rows to browser
alter publication supabase_realtime add table public.user_badges;

-- 5. Badge catalogue:
-- artboard must match public/rive/badges.riv
-- icon_url points at public/images/badges/<slug>.png

insert into badges (slug, title, description, threshold, module_id, artboard, icon_url, position)
select v.slug, v.title, v.description, v.threshold, m.id, v.artboard,
       '/images/badges/' || v.slug || '.png', v.position
from (values
  ('quantum-starter',        'Quantum Starter',        'Passed Quantum Computing Basics.',                  'module_pass:quantum-basics',       'QuantumStarter',        1),
  ('basis-explorer',         'Basis Explorer',         'Passed Bases, Normalisation and Quantum Circuits.', 'module_pass:bases-gates-circuits', 'BasisExplorer',         2),
  ('key-sifter',             'Key Sifter',             'Passed BB84: Alice, Bob and the Sifted Key.',       'module_pass:bb84-alice-bob',       'KeySifter',             3),
  ('eavesdropper-detective', 'Eavesdropper Detective', 'Passed Eve, QBER and Post-processing.',             'module_pass:eve-and-qber',         'EavesdropperDetective', 4),
  ('qiskit-practitioner',    'Qiskit Practitioner',    'Passed Qiskit and the Practical BB84 Experience.',  'module_pass:qiskit-bb84-practice', 'QiskitPractitioner',    5),
  ('daily-challenge',        'Daily Challenge',       'Solved your first Daily Challenge.',                'daily_solve:first',                'DailyChallenge',        6),
  ('consistency-master',     'Consistency Master',     'Reached a 7-day Daily Challenge streak.',           'streak:7',                         'ConsistencyMaster',     7),
  ('overall-champion',       'Overall Champion',       'Earned all five module badges.',                    'all_modules',                      'OverallChampion',       8)
) as v(slug, title, description, threshold, artboard, position)
left join modules m
  on v.threshold like 'module_pass:%' and m.slug = split_part(v.threshold, ':', 2);


-- 6. Backfill users who already qualify:
select award_badges(id) from profiles;


notify pgrst, 'reload schema';