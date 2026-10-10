-- =====================================================================
-- Trainer profile images. Run after 001-003.
-- Adds an avatar_url column to trainers, plus a public Storage bucket
-- with policies so a trainer can only upload/replace/delete a file
-- inside their own folder (path convention: "{trainer_id}/avatar.<ext>").
-- =====================================================================

alter table public.trainers
  add column if not exists avatar_url text;

insert into storage.buckets (id, name, public)
values ('trainer-avatars', 'trainer-avatars', true)
on conflict (id) do nothing;

-- Anyone can view avatar images (rule 5.3 - profiles are public).
create policy "Public can view trainer avatars"
  on storage.objects for select
  using (bucket_id = 'trainer-avatars');

-- A trainer can upload/replace/delete only inside their own folder,
-- i.e. a path like "<trainer_id>/avatar.jpg" where trainers.user_id
-- matches the logged-in user. Admins can manage any trainer's avatar too.
create policy "Trainer manages own avatar (insert)"
  on storage.objects for insert
  with check (
    bucket_id = 'trainer-avatars'
    and (
      public.is_admin()
      or exists (
        select 1 from public.trainers t
        where t.user_id = auth.uid()
          and t.id::text = (storage.foldername(name))[1]
      )
    )
  );

create policy "Trainer manages own avatar (update)"
  on storage.objects for update
  using (
    bucket_id = 'trainer-avatars'
    and (
      public.is_admin()
      or exists (
        select 1 from public.trainers t
        where t.user_id = auth.uid()
          and t.id::text = (storage.foldername(name))[1]
      )
    )
  );

create policy "Trainer manages own avatar (delete)"
  on storage.objects for delete
  using (
    bucket_id = 'trainer-avatars'
    and (
      public.is_admin()
      or exists (
        select 1 from public.trainers t
        where t.user_id = auth.uid()
          and t.id::text = (storage.foldername(name))[1]
      )
    )
  );
