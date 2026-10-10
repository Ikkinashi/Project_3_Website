-- =====================================================================
-- Internal messaging (rule 5.5: trainers and members communicate only
-- through the system's messaging feature). Run after 001 and 002.
-- =====================================================================

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_trainer_id uuid not null references public.trainers(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "A member can send a message"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create policy "Sender, the recipient trainer, or an admin can read it"
  on public.messages for select
  using (
    auth.uid() = sender_id
    -- A trainer's own id doubles as their account id, so this is just a
    -- direct comparison rather than a join through the trainers table.
    or auth.uid() = recipient_trainer_id
    or public.is_admin()
  );

-- =====================================================================
-- Public-safe profile view: reviews and messages need to show a member's
-- display name, but the `users` table also holds email/role, which
-- shouldn't be publicly readable. This view exposes only id + full_name,
-- and (being a view owned by the table owner) bypasses the users table's
-- row-level security to stay readable by everyone - the standard Supabase
-- pattern for "public profile" data.
-- =====================================================================

create or replace view public.public_profiles as
  select id, full_name from public.profiles;

grant select on public.public_profiles to anon, authenticated;
