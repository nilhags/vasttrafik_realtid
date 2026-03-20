create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.job_sources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  base_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  external_id text,
  source_id uuid references public.job_sources (id) on delete set null,
  title text not null,
  employer text not null,
  location_name text,
  region text,
  latitude double precision,
  longitude double precision,
  remote_mode text,
  employment_type text,
  seniority text,
  language_requirements text,
  salary_text text,
  description text,
  source_name text,
  source_url text,
  original_url text,
  published_at timestamptz,
  application_deadline timestamptz,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists jobs_source_external_unique
  on public.jobs (source_name, external_id)
  where external_id is not null;

create index if not exists jobs_published_at_idx
  on public.jobs (published_at desc);

create index if not exists jobs_location_idx
  on public.jobs (location_name, region);

create index if not exists jobs_coordinates_idx
  on public.jobs (latitude, longitude);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  filters jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.job_sources enable row level security;
alter table public.favorites enable row level security;
alter table public.saved_searches enable row level security;

create policy "profiles owner can read own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles owner can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id);

create policy "authenticated users can read jobs"
  on public.jobs
  for select
  to authenticated
  using (true);

create policy "authenticated users can read job sources"
  on public.job_sources
  for select
  to authenticated
  using (true);

create policy "users manage own favorites"
  on public.favorites
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users manage own saved searches"
  on public.saved_searches
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
