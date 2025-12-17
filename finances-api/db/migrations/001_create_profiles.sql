-- Profiles table for linking with Supabase Auth users

-- Create table
create table if not exists public.profiles (
  id uuid primary key,
  username text unique,
  full_name text,
  email text,
  avatar_url text,
  role text default 'user',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Public read access policy (adjust as needed)
create policy if not exists "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

-- Users can insert their own profile
create policy if not exists "Users can insert their own profile"
  on public.profiles for insert with check ((select auth.uid()) = id);

-- Users can update their own profile
create policy if not exists "Users can update their own profile"
  on public.profiles for update using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Keep updated_at current
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger if not exists set_updated_at
  before update on public.profiles
  for each row
  execute procedure public.set_updated_at();

-- Trigger to create a profile row when a new auth.user is created
-- This assumes you have permission to create functions on the auth schema
create or replace function public.handle_auth_user_added()
returns trigger as $$
begin
  -- Insert minimal profile record if it does not exist
  insert into public.profiles (id, email, created_at)
  values (new.id, new.email, now())
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Register trigger on auth.users
create trigger if not exists auth_user_insert_trigger
  after insert on auth.users
  for each row
  execute procedure public.handle_auth_user_added();
