-- Hardening for award_badges:
--   1. a user with no profile row returns [] instead of failing the user_badges foreign key
--   2. a malformed streak threshold (e.g. 'streak:seven') is ignored

create or replace function award_badges(p_user_id uuid)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_new  uuid[];
  v_more uuid[];
begin
  if p_user_id is null then return '[]'::jsonb; end if;

  -- user_badges references profiles, so there is nothing to award without a profile
  if not exists (select 1 from profiles where id = p_user_id) then
    return '[]'::jsonb;
  end if;

  -- pass 1: badges with a direct rule
  with p as (
    select coalesce(best_streak, 0) as best_streak, last_challenge
      from profiles where id = p_user_id
  ),
  eligible as (
    select b.id
      from badges b
      cross join p
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
          or (b.threshold ~ '^streak:[0-9]+$'
              and p.best_streak >= split_part(b.threshold, ':', 2)::int)
           )
  ),
  ins as (
    insert into user_badges (user_id, badge_id)
    select p_user_id, id from eligible
    on conflict do nothing
    returning badge_id
  )
  select coalesce(array_agg(badge_id), '{}') into v_new from ins;

  -- pass 2: champion badge, earned once every module badge is held
  with ins as (
    insert into user_badges (user_id, badge_id)
    select p_user_id, b.id
      from badges b
     where b.threshold = 'all_modules'
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

-- create or replace keeps existing privileges
revoke all on function award_badges(uuid) from public, anon, authenticated;
grant execute on function award_badges(uuid) to service_role;