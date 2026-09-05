create function public.handle_new_user()
return trigger as $$
begin
    insert into public.profiles (id)
    values (new.id);
    return new;
end;
$$ language plpsql security definer;