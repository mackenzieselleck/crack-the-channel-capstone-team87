create function prevent_user_edit_protected_columns()
returns trigger as $$
begin
    if auth.uid() = old.id then
        if new.xp is distinct from old.xp then
            raise exception 'User cannot modify xp directly';
        end if;
        if new.last_challenge is distinct from old.last_challenge then
            raise exception 'User cannot modify last challange date directly';
        end if;
        if new.challenge_streak is distinct from old.challenge_streak then
            raise exception 'User cannot modify challenge streak directly';
        end if;
        if new.created_at is distinct from old.created_at then
             raise exception 'User cannot modify profile creation date directly';
        end if;
    end if;
    return new;
end;
$$ language plpgsql security definer;

create trigger enforce_protected_columns
    before update on profiles
    for each row execute function prevent_user_edit_protected_columns();
            