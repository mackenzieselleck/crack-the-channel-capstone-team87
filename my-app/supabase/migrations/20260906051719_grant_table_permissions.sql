grant select, insert, update, delete on profiles to authenticated;
grant select on badges to authenticated;
grant select, insert, update, delete on user_badges to authenticated;
grant usage on schema public to authenticated;