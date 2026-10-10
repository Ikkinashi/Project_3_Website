// src/pages/Auth/LoginPage.jsx
//
// Matches the reference design: dark split screen, bold headline on the
// left, a compact sign-in/sign-up form on the right with the cyan "LOGIN"
// button and arrow. Handles both rule 1.1 (register with a password) and
// ordinary sign-in, using signIn/signUp from AuthContext - which work in
// both mock/demo mode and against real Supabase Auth (see AuthContext.jsx).
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import Eyebrow from "../../components/Eyebrow";

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const isSignIn = mode === "signin";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // Rule 1.2: password must meet a minimum length.
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setBusy(true);
      if (isSignIn) {
        await signIn(email, password);
      } else {
        await signUp(email, password, fullName);
      }
      navigate("/trainers");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full bg-[#0d1420] border border-slate-700 rounded-lg px-3 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400";

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left: brand / hero panel */}
      <div className="hidden lg:flex flex-col justify-center px-16 bg-[#0a0e17] border-r border-slate-800 relative overflow-hidden">
        <div className="absolute -left-24 top-1/3 w-72 h-72 bg-cyan-400/10 blur-3xl rounded-full" />
        <div className="relative">
          <Eyebrow>Forge Fitness</Eyebrow>
          <h1 className="text-5xl font-black leading-tight text-white">
            FORGE YOUR
            <br />
            <span className="text-cyan-400">STRONGER</span>
            <br />
            <span className="text-cyan-400">SELF.</span>
          </h1>
          <p className="text-slate-400 mt-6 max-w-sm">
            Train harder. Recover smarter. Build the version of yourself you've always wanted.
          </p>
          <div className="w-16 h-0.5 bg-cyan-400 mt-10 mb-4" />
          <p className="text-xs text-slate-500 uppercase tracking-[0.3em]">
            Performance &bull; Discipline &bull; Progress
          </p>
        </div>
      </div>

      {/* Right: auth form */}
      <div className="flex items-center justify-center px-6 py-16 bg-[#0a0e17]">
        <div className="w-full max-w-sm">
          <Eyebrow>Member access</Eyebrow>
          <h2 className="text-3xl font-black text-white">
            {isSignIn ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-slate-400 mt-2 mb-8">
            {isSignIn ? "Sign in to continue your Forge journey." : "Join Forge Fitness today."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isSignIn && (
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1.5">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  className={inputClass}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={inputClass}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-200">Password</label>
                {isSignIn && (
                  <button
                    type="button"
                    onClick={() => setError("Password reset isn't wired up in this demo yet.")}
                    className="text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={inputClass}
                required
                minLength={8}
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button type="submit" disabled={busy} className="w-full !py-3.5 !text-base">
              {busy ? "Please wait..." : isSignIn ? "Login" : "Sign up"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {isSignIn ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setMode(isSignIn ? "signup" : "signin");
                setError(null);
              }}
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              {isSignIn ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
