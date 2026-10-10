// src/api/trainersApi.js
//
// Data layer for everything on the ERD that touches "trainer": trainers,
// trainer_skills, courses, reviews, plus internal messages. In real mode
// this talks to Supabase directly with supabase-js - Supabase's
// auto-generated API + Row Level Security IS the backend, there's no
// separate server. See supabase/001-003 *.sql for the schema and RLS
// policies these calls rely on.
//
// DEMO MODE: by default (or when VITE_USE_MOCK is not set to "false") this
// still serves data from src/mockData.js instead of hitting Supabase, so
// the app also runs with zero setup for quick demos. Set VITE_USE_MOCK=false
// in a .env file (with VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY filled in)
// to switch every function below to the real database - no component code
// needs to change either way.

import { supabase } from "../lib/supabaseClient";
import {
  trainers as mockTrainers,
  trainerSkills as mockSkills,
  courses as mockCourses,
  reviews as mockReviews,
  generateId,
} from "../mockData";

const USE_MOCK = import.meta.env?.VITE_USE_MOCK !== "false";
const MOCK_DELAY_MS = 300;

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

function unwrap({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("You need to be logged in to do that.");
  return data.user.id;
}

// ---- Reads: visible to everyone, registered or not (rule 5.3) ----

export async function getTrainers({ locationId } = {}) {
  if (USE_MOCK) {
    const list = locationId ? mockTrainers.filter((t) => t.location_id === locationId) : mockTrainers;
    return delay(list.map((t) => ({ ...t })));
  }
  // Reads go through the trainer_profiles view (see supabase/001 + 005),
  // which joins in the display name from `profiles` and a live average
  // rating from `reviews` - neither is a real column on `trainers` itself.
  let query = supabase.from("trainer_profiles").select("*").order("name");
  if (locationId) query = query.eq("location_id", locationId);
  return unwrap(await query);
}

export async function getTrainerById(trainerId) {
  if (USE_MOCK) {
    const found = mockTrainers.find((t) => t.id === trainerId);
    return found ? delay({ ...found }) : Promise.reject(new Error("Trainer not found"));
  }
  return unwrap(
    await supabase.from("trainer_profiles").select("*").eq("id", trainerId).single()
  );
}

export async function getTrainerSkills(trainerId) {
  if (USE_MOCK) {
    return delay(mockSkills.filter((s) => s.trainer_id === trainerId).map((s) => ({ ...s })));
  }
  return unwrap(
    await supabase.from("trainer_skills").select("*").eq("trainer_id", trainerId)
  );
}

export async function getTrainerCourses(trainerId) {
  if (USE_MOCK) {
    return delay(mockCourses.filter((c) => c.trainer_id === trainerId).map((c) => ({ ...c })));
  }
  // Your team's courses table calls this column `name`, not `title` - map
  // it here so every component can keep using course.title either way.
  const rows = unwrap(
    await supabase.from("courses").select("*").eq("trainer_id", trainerId)
  );
  return rows.map((c) => ({ ...c, title: c.name }));
}

// A single course, plus the trainer who teaches it (name + id), for the
// course detail page.
export async function getCourseById(courseId) {
  if (USE_MOCK) {
    const course = mockCourses.find((c) => c.id === courseId);
    if (!course) return Promise.reject(new Error("Course not found"));
    const trainer = mockTrainers.find((t) => t.id === course.trainer_id);
    return delay({ ...course, trainer_name: trainer?.name || "Unknown trainer" });
  }

  const row = unwrap(await supabase.from("courses").select("*").eq("id", courseId).single());
  const trainer = unwrap(
    await supabase.from("trainer_profiles").select("id, name").eq("id", row.trainer_id).maybeSingle()
  );

  return { ...row, title: row.name, trainer_name: trainer?.name || "Unknown trainer" };
}

export async function getTrainerReviews(trainerId) {
  if (USE_MOCK) {
    return delay(mockReviews.filter((r) => r.trainer_id === trainerId).map((r) => ({ ...r })));
  }
  const reviews = unwrap(
    await supabase
      .from("reviews")
      .select("*")
      .eq("trainer_id", trainerId)
      .order("created_at", { ascending: false })
  );
  if (reviews.length === 0) return reviews;

  // Reviews only store user_id; pull display names from the public,
  // column-limited profiles view (see 003_messages_and_profiles.sql).
  const userIds = [...new Set(reviews.map((r) => r.user_id))];
  const profiles = unwrap(
    await supabase.from("public_profiles").select("id, full_name").in("id", userIds)
  );
  const nameById = Object.fromEntries(profiles.map((p) => [p.id, p.full_name]));

  return reviews.map((r) => ({ ...r, reviewer_name: nameById[r.user_id] || "Member" }));
}

// ---- Writes: only the logged-in trainer editing their own profile (rule 5.2) ----

// Updates a trainer's bio (stored on `trainers`) and their display name
// (stored on `profiles.full_name`). A trainer's row shares the exact same
// id as their profiles/account row, so both updates use the same id -
// no extra lookup needed.
export async function updateTrainerProfile(trainerId, { name, bio }) {
  if (USE_MOCK) {
    const trainer = mockTrainers.find((t) => t.id === trainerId);
    if (!trainer) return Promise.reject(new Error("Trainer not found"));
    trainer.name = name;
    trainer.bio = bio;
    return delay({ ...trainer });
  }

  const results = await Promise.all([
    supabase.from("trainers").update({ bio }).eq("id", trainerId),
    // Requires `profiles` to have an update policy letting a user edit
    // their own row (using auth.uid() = id) - ask whoever owns that
    // table to add it if this starts failing with a permissions error.
    supabase.from("profiles").update({ full_name: name }).eq("id", trainerId),
  ]);

  const failed = results.find((r) => r.error);
  if (failed) throw new Error(failed.error.message);

  return { id: trainerId, name, bio };
}

// Uploads an image to the "trainer-avatars" bucket under this trainer's own
// folder, then saves the resulting public URL onto trainers.avatar_url.
// In mock mode it just previews the picked file locally in memory.
export async function uploadTrainerAvatar(trainerId, file) {
  if (USE_MOCK) {
    const url = URL.createObjectURL(file);
    const trainer = mockTrainers.find((t) => t.id === trainerId);
    if (trainer) trainer.avatar_url = url;
    return delay({ avatar_url: url });
  }

  const ext = file.name.split(".").pop();
  const path = `${trainerId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("trainer-avatars")
    .upload(path, file, { upsert: true, cacheControl: "3600" });
  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrlData } = supabase.storage.from("trainer-avatars").getPublicUrl(path);
  // Cache-bust so the new image shows immediately even though the path is the same.
  const avatar_url = `${publicUrlData.publicUrl}?t=${Date.now()}`;

  return unwrap(
    await supabase.from("trainers").update({ avatar_url }).eq("id", trainerId).select().single()
  );
}

export async function addTrainerSkill(trainerId, skillName) {
  if (USE_MOCK) {
    const skill = { id: generateId("sk"), trainer_id: trainerId, skill_name: skillName };
    mockSkills.push(skill);
    return delay({ ...skill });
  }
  return unwrap(
    await supabase
      .from("trainer_skills")
      .insert({ trainer_id: trainerId, skill_name: skillName })
      .select()
      .single()
  );
}

export async function removeTrainerSkill(trainerId, skillId) {
  if (USE_MOCK) {
    const idx = mockSkills.findIndex((s) => s.id === skillId);
    if (idx !== -1) mockSkills.splice(idx, 1);
    return delay({ success: true });
  }
  unwrap(await supabase.from("trainer_skills").delete().eq("id", skillId));
  return { success: true };
}

// ---- Reviews: any logged-in member can write one ----

export async function postReview(trainerId, { rating, comment }) {
  if (USE_MOCK) {
    const review = {
      id: generateId("r"),
      trainer_id: trainerId,
      user_id: "u1",
      reviewer_name: "You",
      rating,
      comment,
      created_at: new Date().toISOString(),
    };
    mockReviews.push(review);
    return delay({ ...review });
  }
  const userId = await currentUserId();
  return unwrap(
    await supabase
      .from("reviews")
      .insert({ trainer_id: trainerId, user_id: userId, rating, comment })
      .select()
      .single()
  );
}

// ---- Internal messaging (rule 5.5: trainer <-> member only via the system) ----

export async function sendMessageToTrainer(trainerId, message) {
  if (USE_MOCK) {
    console.log(`[mock message] to trainer ${trainerId}: ${message}`);
    return delay({ success: true });
  }
  const userId = await currentUserId();
  return unwrap(
    await supabase
      .from("messages")
      .insert({ sender_id: userId, recipient_trainer_id: trainerId, body: message })
      .select()
      .single()
  );
}
