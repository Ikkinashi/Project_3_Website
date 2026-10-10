-- =====================================================================
-- Forge Fitness — TRAINERS slice of the database (Supabase / Postgres)
-- =====================================================================
-- Run this in your Supabase project's SQL Editor (Dashboard > SQL Editor
-- > New query > paste this whole file > Run).
--
-- This covers the tables that belong to the "trainer" part of the ERD:
--   trainers, trainer_skills, courses, reviews
--
-- It also creates a small STUB `locations` table, guarded with "if not
-- exists" — if a teammate has already created a fuller version, Postgres
-- will just skip creating it and use theirs instead, as long as the table
-- name and the `id uuid primary key` column match. `profiles` is NOT
-- stub-created here since your project already has one (see below).
-- =====================================================================

-- Supabase enables pgcrypto by default, but this makes sure gen_random_uuid() exists.
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- `profiles` (owned by a teammate — do NOT recreate it)
-- ---------------------------------------------------------------------
-- Your project's Schema Visualizer confirms `public.profiles` already
-- exists with `role` and `created_at`. This block doesn't touch it beyond
-- making sure the columns this trainer slice needs are present — it will
-- not overwrite or duplicate anything a teammate already built.
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists email text;
-- `role` already exists per the schema screenshot; this line only matters
-- if someone spins up a brand new copy of the database from scratch.
alter table public.profiles add column if not exists role text default 'member';

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  hours text,
  contact_info text
);

-- ---------------------------------------------------------------------
-- TRAINERS SLICE (this is your part)
-- ---------------------------------------------------------------------

create table if not exists public.trainers (
  id uuid primary key default gen_random_uuid(),
  -- Links a trainer record to the login account that's allowed to edit it
  -- (rule 5.2). The ERD doesn't include this column — it's added so the
  -- database itself can enforce "only this trainer can edit this profile"
  -- instead of trusting the frontend.
  user_id uuid unique references public.profiles(id) on delete set null,
  location_id uuid references public.locations(id) on delete set null,
  bio text,
  specialties text[] default '{}',
  avatar_url text
  -- Note: there is deliberately no `name` or `avg_rating` column here.
  -- Display name comes from profiles.full_name via user_id, and rating
  -- is calculated live from reviews - see the trainer_profiles view below.
);

create table if not exists public.trainer_skills (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  skill_name text not null
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  name text not null,
  description text,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  rating numeric(2, 1) not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- A read-friendly view joining a trainer's row to their display name
-- (from profiles) and their live average rating (from reviews), since
-- neither is a real column on `trainers`. The frontend reads trainers
-- through this view instead of querying the raw table directly.
-- ---------------------------------------------------------------------

create or replace view public.trainer_profiles as
select
  t.id,
  t.user_id,
  t.location_id,
  t.bio,
  t.avatar_url,
  t.specialties,
  coalesce(p.full_name, 'Trainer') as name,
  coalesce(
    (select round(avg(r.rating)::numeric, 2) from public.reviews r where r.trainer_id = t.id),
    0
  ) as avg_rating
from public.trainers t
left join public.profiles p on p.id = t.user_id;

grant select on public.trainer_profiles to anon, authenticated;

-- ---------------------------------------------------------------------
-- Row Level Security — who can read/write what, enforced by the database
-- ---------------------------------------------------------------------

alter table public.trainers enable row level security;
alter table public.trainer_skills enable row level security;
alter table public.courses enable row level security;
alter table public.reviews enable row level security;

-- Small helper so policies can check "is this user an admin" (rule 7.1/7.2).
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- TRAINERS: visible to everyone, including logged-out visitors (rule 5.3).
-- Only the trainer who owns the row, or an admin, can update it (rule 5.2, 7.2).
-- Only admins can create/delete trainer records (rule 7.1).
create policy "Trainers are viewable by everyone"
  on public.trainers for select
  using (true);

create policy "Trainer can update own profile, admin can update any"
  on public.trainers for update
  using (auth.uid() = user_id or public.is_admin());

create policy "Only admins add trainers"
  on public.trainers for insert
  with check (public.is_admin());

create policy "Only admins remove trainers"
  on public.trainers for delete
  using (public.is_admin());

-- TRAINER_SKILLS: public read; a trainer manages their own skill list as
-- part of their profile (rule 5.2), admins can too.
create policy "Skills are viewable by everyone"
  on public.trainer_skills for select
  using (true);

create policy "Trainer manages own skills (insert)"
  on public.trainer_skills for insert
  with check (
    exists (
      select 1 from public.trainers t
      where t.id = trainer_id and (t.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Trainer manages own skills (delete)"
  on public.trainer_skills for delete
  using (
    exists (
      select 1 from public.trainers t
      where t.id = trainer_id and (t.user_id = auth.uid() or public.is_admin())
    )
  );

-- COURSES: public read; only admins create/update/delete course details
-- (rule 7.2 — "only administrators may update packages, courses or
-- trainers details").
create policy "Courses are viewable by everyone"
  on public.courses for select
  using (true);

create policy "Only admins add courses"
  on public.courses for insert
  with check (public.is_admin());

create policy "Only admins update courses"
  on public.courses for update
  using (public.is_admin());

create policy "Only admins remove courses"
  on public.courses for delete
  using (public.is_admin());

-- REVIEWS: public read; a logged-in member can post/edit their own review;
-- the author or an admin can delete one.
create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using (true);

create policy "Members post their own review"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Members edit their own review"
  on public.reviews for update
  using (auth.uid() = user_id);

create policy "Author or admin can delete a review"
  on public.reviews for delete
  using (auth.uid() = user_id or public.is_admin());
