-- =====================================================================
-- Your `trainers.id` column has a foreign key straight to `profiles.id`
-- (confirmed by the error: "trainers_id_fkey" pointing at profiles) —
-- meaning a trainer's row shares the exact same UUID as their login
-- account, rather than using a separate `user_id` column like 001 and
-- 005 assumed. This patches those two files to match. Run this after 005.
-- =====================================================================

-- Drop what referenced the (soon to be removed) user_id column.
drop policy if exists "Trainer can update own profile, admin can update any" on public.trainers;
drop policy if exists "Trainer manages own skills (insert)" on public.trainer_skills;
drop policy if exists "Trainer manages own skills (delete)" on public.trainer_skills;
drop view if exists public.trainer_profiles;

-- The user_id column added earlier is redundant now that trainers.id
-- itself links straight to the account.
alter table public.trainers drop column if exists user_id;

-- Recreate the view, joining straight on id instead of user_id.
create or replace view public.trainer_profiles as
select
  t.id,
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
left join public.profiles p on p.id = t.id;

grant select on public.trainer_profiles to anon, authenticated;

-- Recreate the trainer/skill policies using id directly instead of user_id.
create policy "Trainer can update own profile, admin can update any"
  on public.trainers for update
  using (auth.uid() = id or public.is_admin());

create policy "Trainer manages own skills (insert)"
  on public.trainer_skills for insert
  with check (
    exists (
      select 1 from public.trainers t
      where t.id = trainer_id and (t.id = auth.uid() or public.is_admin())
    )
  );

create policy "Trainer manages own skills (delete)"
  on public.trainer_skills for delete
  using (
    exists (
      select 1 from public.trainers t
      where t.id = trainer_id and (t.id = auth.uid() or public.is_admin())
    )
  );
