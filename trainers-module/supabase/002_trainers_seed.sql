-- =====================================================================
-- Seed data for the trainers slice.
--
-- IMPORTANT: because trainers.id is a foreign key straight to
-- profiles.id (which itself is a foreign key to a real Supabase Auth
-- account), you CANNOT seed a trainer with a made-up id the way you can
-- for locations. A trainer row can only exist for an account that
-- already exists.
--
-- BEFORE running this file:
--   1. In the Supabase dashboard, go to Authentication > Users > Add user.
--   2. Create 3 users with these exact emails (any password is fine,
--      turn on "Auto Confirm User" so no email verification is needed):
--        jane.trainer@forgefitness.test
--        mike.trainer@forgefitness.test
--        sara.trainer@forgefitness.test
--   3. Then run this file - it looks each one up by email automatically,
--      so you don't need to copy/paste any UUIDs by hand.
-- =====================================================================

insert into public.locations (id, name, address, hours, contact_info)
values ('11111111-1111-1111-1111-111111111111', 'Forge Fitness Downtown',
        '123 Main St, Cape Town', '6am - 10pm daily', 'downtown@forgefitness.example')
on conflict (id) do nothing;

-- Make sure each account has a profiles row with the right name/role.
insert into public.profiles (id, email, full_name, role)
select u.id, u.email, v.full_name, 'trainer'
from auth.users u
join (values
  ('jane.trainer@forgefitness.test', 'Jane Doe'),
  ('mike.trainer@forgefitness.test', 'Mike Kim'),
  ('sara.trainer@forgefitness.test', 'Sara Ndlovu')
) as v(email, full_name) on v.email = u.email
on conflict (id) do update set full_name = excluded.full_name, role = 'trainer';

-- Create each trainer's row, using their real account id.
insert into public.trainers (id, location_id, bio, specialties)
select u.id, '11111111-1111-1111-1111-111111111111', v.bio, v.specialties
from auth.users u
join (values
  ('jane.trainer@forgefitness.test',
   'Certified strength coach with 8 years of experience helping members build sustainable routines.',
   array['Strength training', 'HIIT', 'Nutrition coaching']),
  ('mike.trainer@forgefitness.test',
   'Yoga and mobility specialist focused on injury prevention and long-term flexibility.',
   array['Yoga', 'Mobility']),
  ('sara.trainer@forgefitness.test',
   'HIIT and conditioning coach who loves turning beginners into regulars.',
   array['HIIT', 'Conditioning'])
) as v(email, bio, specialties) on v.email = u.email
on conflict (id) do update set bio = excluded.bio, specialties = excluded.specialties;

-- Skills, as individual rows (used for the add/remove UI on the edit page).
insert into public.trainer_skills (trainer_id, skill_name)
select u.id, v.skill_name
from auth.users u
join (values
  ('jane.trainer@forgefitness.test', 'Strength training'),
  ('jane.trainer@forgefitness.test', 'HIIT'),
  ('jane.trainer@forgefitness.test', 'Nutrition coaching'),
  ('mike.trainer@forgefitness.test', 'Yoga'),
  ('mike.trainer@forgefitness.test', 'Mobility'),
  ('sara.trainer@forgefitness.test', 'HIIT'),
  ('sara.trainer@forgefitness.test', 'Conditioning')
) as v(email, skill_name) on v.email = u.email;

-- Courses.
insert into public.courses (trainer_id, name, description, difficulty)
select u.id, v.name, v.description, v.difficulty
from auth.users u
join (values
  ('jane.trainer@forgefitness.test', 'Beginner strength', 'Build a foundation with barbell basics.', 'beginner'),
  ('jane.trainer@forgefitness.test', 'Advanced HIIT circuit', 'High intensity intervals for experienced members.', 'advanced'),
  ('mike.trainer@forgefitness.test', 'Morning flow yoga', 'Gentle mobility and breathing work.', 'beginner'),
  ('sara.trainer@forgefitness.test', 'Metabolic conditioning', 'Full-body conditioning circuits.', 'intermediate')
) as v(email, name, description, difficulty) on v.email = u.email;

-- Reviews still need a real member account the same way - once you have
-- one (sign up as a member through the app, or add another test user),
-- add a review like this:
--
-- insert into public.reviews (user_id, trainer_id, rating, comment)
-- select
--   (select id from auth.users where email = 'some.member@forgefitness.test'),
--   (select id from auth.users where email = 'jane.trainer@forgefitness.test'),
--   5, 'Pushed me further than I thought I could go.';
