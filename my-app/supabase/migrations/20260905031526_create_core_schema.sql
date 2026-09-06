create table profiles (
    id uuid references auth.users(id) primary key,
    first_name text,
    last_name text,
    avatar_url text,
    xp int default 0,
    last_challenge date,
    challenge_streak int default 0,
    created_at timestamptz default now()
);

create table badges (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    icon_url text,
    threshold text not null
);

create table user_badges (
    user_id uuid references profiles(id) not null,
    badge_id uuid references badges(id) not null,
    earned_at timestamptz default now(),
    primary key (user_id, badge_id)
);

alter table profiles enable row level security;
alter table badges enable row level security;
alter table user_badges enable row level security;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Anyone can view badges" on badges for select using (true);
create policy "Users can view own badges" on user_badges for select using (auth.uid() = user_id);
