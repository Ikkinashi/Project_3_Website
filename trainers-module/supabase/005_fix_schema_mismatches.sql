-- =====================================================================
-- Fixes the gap between what 001_trainers_schema.sql assumed and what
-- your team's real `trainers`/`courses` tables actually look like. Run
-- this in a NEW query, after 001 has already run (even though 001 hit
-- an error partway on the first try, its trigger/function still got
-- created — this migration replaces them properly).
-- =====================================================================

-- Your `trainers` table has no `name` or `avg_rating` column — the
-- trainer's display name comes from `profiles.full_name` via `user_id`,
-- and rating should be calculated from reviews on the fly rather than
-- stored on the row. So: drop the old trigger/function from 001 that
-- tried to write to a `trainers.avg_rating` column that doesn't exist
-- (it would have thrown an error the first time anyone posted a review).
drop trigger if exists trg_update_avg_rating on public.reviews;
drop function if exists public.update_trainer_avg_rating();

-- A read-friendly view combining a trainer's row with their display name
-- and live average rating. The frontend reads trainers through this
-- instead of querying the raw `trainers` table directly.
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

-- Your `courses` table uses `name` instead of `title` (the frontend
-- adapts to that on its own — see trainersApi.js), and has no
-- `difficulty` column yet. Add it so the difficulty badge in the UI has
-- somewhere to read/write. Safe to run even if it's already there.
alter table public.courses add column if not exists difficulty text;

do $$
begin
  alter table public.courses
    add constraint courses_difficulty_check check (difficulty in ('beginner', 'intermediate', 'advanced'));
exception
  when duplicate_object then null;
end $$;

-- =====================================================================
-- Heads up for whoever owns the `profiles` table: editing a trainer's
-- display name (as opposed to their bio) writes to `profiles.full_name`,
-- not `trainers`. That only works if `profiles` has an update policy
-- letting a user edit their own row. If it doesn't yet, ask them to add:
--
--   create policy "Users can update own profile"
--     on public.profiles for update
--     using (auth.uid() = id);
--
-- Until that exists, bio changes will save fine but name changes will
-- silently fail with a permissions error.
-- =====================================================================
