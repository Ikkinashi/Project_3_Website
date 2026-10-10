// src/lib/supabaseClient.js
//
// One shared Supabase client for the whole app. The URL and anon key come
// from your Supabase project settings (Project Settings > API) and are
// read from environment variables so they're never hardcoded or committed.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if ((!supabaseUrl || !supabaseAnonKey) && import.meta.env?.VITE_USE_MOCK === "false") {
  // Only warn when the app is actually configured to hit the real backend -
  // no point nagging while still in mock/demo mode.
  console.warn(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill them in from your Supabase project settings."
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
