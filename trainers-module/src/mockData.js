// src/mockData.js
//
// In-memory stand-in for the backend, shaped exactly like the ERD tables
// (locations, trainers, trainer_skills, courses, reviews). Used only when
// VITE_USE_MOCK is not explicitly "false" - see api/trainersApi.js.
// Writes (edit profile, add/remove skill, post review, send message)
// mutate these arrays directly so the demo feels real across the session.
// Nothing here is persisted to disk - a refresh resets it.

export let locations = [
  {
    id: "loc1",
    name: "Forge Fitness Downtown",
    address: "123 Main St, Cape Town",
    hours: "6am - 10pm daily",
    contact_info: "downtown@forgefitness.example",
  },
];

export let trainers = [
  {
    id: "t1",
    location_id: "loc1",
    name: "Jane Doe",
    bio: "Certified strength coach with 8 years of experience helping members build sustainable routines.",
    avg_rating: 4.8,
    avatar_url: null,
  },
  {
    id: "t2",
    location_id: "loc1",
    name: "Mike Kim",
    bio: "Yoga and mobility specialist focused on injury prevention and long-term flexibility.",
    avg_rating: 4.6,
    avatar_url: null,
  },
  {
    id: "t3",
    location_id: "loc1",
    name: "Sara Ndlovu",
    bio: "HIIT and conditioning coach who loves turning beginners into regulars.",
    avg_rating: 4.9,
    avatar_url: null,
  },
];

export let trainerSkills = [
  { id: "sk1", trainer_id: "t1", skill_name: "Strength training" },
  { id: "sk2", trainer_id: "t1", skill_name: "HIIT" },
  { id: "sk3", trainer_id: "t1", skill_name: "Nutrition coaching" },
  { id: "sk4", trainer_id: "t2", skill_name: "Yoga" },
  { id: "sk5", trainer_id: "t2", skill_name: "Mobility" },
  { id: "sk6", trainer_id: "t3", skill_name: "HIIT" },
  { id: "sk7", trainer_id: "t3", skill_name: "Conditioning" },
];

export let courses = [
  { id: "c1", trainer_id: "t1", title: "Beginner strength", description: "Build a foundation with barbell basics.", difficulty: "beginner" },
  { id: "c2", trainer_id: "t1", title: "Advanced HIIT circuit", description: "High intensity intervals for experienced members.", difficulty: "advanced" },
  { id: "c3", trainer_id: "t2", title: "Morning flow yoga", description: "Gentle mobility and breathing work.", difficulty: "beginner" },
  { id: "c4", trainer_id: "t3", title: "Metabolic conditioning", description: "Full-body conditioning circuits.", difficulty: "intermediate" },
];

export let reviews = [
  { id: "r1", trainer_id: "t1", user_id: "u1", reviewer_name: "Alex", rating: 5, comment: "Pushed me further than I thought I could go.", created_at: "2026-08-01" },
  { id: "r2", trainer_id: "t1", user_id: "u2", reviewer_name: "Priya", rating: 4.5, comment: "Great communicator, adjusts the plan when I'm sore.", created_at: "2026-08-14" },
  { id: "r3", trainer_id: "t2", user_id: "u3", reviewer_name: "Tumi", rating: 4.5, comment: "Calm, patient, exactly what I needed after my injury.", created_at: "2026-07-20" },
  { id: "r4", trainer_id: "t3", user_id: "u1", reviewer_name: "Alex", rating: 5, comment: "Sessions fly by, never boring.", created_at: "2026-09-01" },
];

// Demo accounts for the role switcher in App.jsx
export const demoUsers = {
  guest: null,
  member: { id: "u1", full_name: "Alex", role: "member", membership_status: "active" },
  trainer: { id: "t1-user", full_name: "Jane Doe", role: "trainer", trainer_id: "t1" },
};

let nextId = 100;
export function generateId(prefix) {
  nextId += 1;
  return `${prefix}${nextId}`;
}
