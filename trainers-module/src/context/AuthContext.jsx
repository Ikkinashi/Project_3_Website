// src/context/AuthContext.jsx
//
// In real mode (VITE_USE_MOCK=false) this tracks the actual Supabase Auth
// session and hydrates it with the app-specific fields (role, trainer_id)
// from the `users` and `trainers` tables. In mock mode it falls back to
// plain local state, driven by the "Viewing as" buttons in App.jsx, so the
// UI can still be demoed with no backend at all.
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const USE_MOCK = import.meta.env?.VITE_USE_MOCK !== "false";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(!USE_MOCK);

  useEffect(() => {
    if (USE_MOCK) return; // demo role switcher drives user state instead
    let cancelled = false;

    async function hydrateUser(session) {
      if (!session?.user) {
        if (!cancelled) setUserState(null);
        return;
      }
      const authUser = session.user;

      const [{ data: profile }, { data: trainerRow }] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", authUser.id)
          .maybeSingle(),
        // A trainer's row shares the same id as their account, so this
        // just checks whether a trainers row exists for this user at all.
        supabase.from("trainers").select("id").eq("id", authUser.id).maybeSingle(),
      ]);

      if (!cancelled) {
        setUserState({
          id: authUser.id,
          email: authUser.email,
          full_name: profile?.full_name || authUser.email,
          role: profile?.role || "member",
          trainer_id: trainerRow?.id || null,
        });
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      hydrateUser(session).finally(() => !cancelled && setLoading(false));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      hydrateUser(session);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Mock mode: the role-switcher buttons call this directly.
  // Real mode: auth state comes from Supabase, so this is a no-op - use
  // signIn/signUp/signOut below instead.
  const setUser = USE_MOCK
    ? setUserState
    : () => console.warn("setUser is a no-op in real (Supabase) mode - use signIn/signUp/signOut.");

  async function signIn(email, password) {
    if (USE_MOCK) {
      // No real accounts in demo mode - a light heuristic lets you test both
      // views: any email containing "trainer" logs in as the demo trainer.
      setUserState(
        email.toLowerCase().includes("trainer")
          ? { id: "t1-user", full_name: "Jane Doe", role: "trainer", trainer_id: "t1" }
          : { id: "u1", full_name: email.split("@")[0] || "Member", role: "member", membership_status: "active" }
      );
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signUp(email, password, fullName) {
    if (USE_MOCK) {
      setUserState({ id: `u-${Date.now()}`, full_name: fullName || email.split("@")[0], role: "member", membership_status: "active" });
      return;
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      // Rule 1.1/6.3-adjacent: make sure the app-side profile row has a
      // name and email as soon as the account does. Uses upsert rather
      // than insert in case a teammate's DB trigger already creates a
      // profiles row automatically on signup - this just fills in the
      // fields this app needs without erroring on a duplicate.
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ id: data.user.id, email, full_name: fullName }, { onConflict: "id" });
      if (profileError) throw profileError;
    }
  }

  async function signOut() {
    if (USE_MOCK) {
      setUserState(null);
      return;
    }
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, signIn, signUp, signOut, useMock: USE_MOCK }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

// Rule 5.2: a trainer may only edit their own profile.
export function canEditTrainer(user, trainerId) {
  return !!user && user.role === "trainer" && user.trainer_id === trainerId;
}

// Rule 4.4 / membership gating for course video content - belongs to the
// membership/billing slice, kept here as a stub other pages can import.
export function isActiveMember(user) {
  return !!user && user.role === "member" && user.membership_status === "active";
}
