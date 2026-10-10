// src/App.jsx
//
// Top-level shell: a nav bar (hidden on the full-screen login page) plus,
// in demo/mock mode, a "log in as" switcher so you can show the group how
// the Trainers pages change for a guest, a member, and a trainer editing
// their own profile - without needing a real account. In real mode the nav
// shows who's actually signed in via Supabase Auth, with a link to /login.
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { demoUsers } from "./mockData";
import TrainerRoutes from "./routes/TrainerRoutes";
import LoginPage from "./pages/Auth/LoginPage";
import Button from "./components/Button";

export default function App() {
  const { user, setUser, signOut, useMock } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  const roleButtons = [
    { label: "Guest", value: demoUsers.guest, key: "guest" },
    { label: "Member", value: demoUsers.member, key: "member" },
    { label: "Trainer (Jane)", value: demoUsers.trainer, key: "trainer" },
  ];
  const activeKey = user?.role || "guest";

  return (
    <div className="min-h-screen bg-[#0a0e17]">
      {!isLoginPage && (
        <header className="border-b border-slate-800 bg-[#0a0e17]/95 backdrop-blur sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/trainers" className="text-cyan-400 text-sm font-bold uppercase tracking-[0.2em]">
              Forge Fitness
            </Link>

            {useMock ? (
              <div className="flex items-center gap-3 text-sm">
                <span className="hidden sm:inline text-slate-400">
                  Viewing as <strong className="text-slate-100">{user ? user.full_name : "Guest"}</strong>
                </span>
                <div className="flex gap-1.5">
                  {roleButtons.map((r) => (
                    <button
                      key={r.key}
                      onClick={() => setUser(r.value)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide border transition ${
                        activeKey === r.key
                          ? "bg-cyan-400 text-slate-950 border-cyan-400"
                          : "border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-cyan-300"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : user ? (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-400">
                  Signed in as <strong className="text-slate-100">{user.full_name}</strong>{" "}
                  <span className="text-cyan-400">({user.role})</span>
                </span>
                <Button variant="secondary" showArrow={false} onClick={signOut} className="!px-3 !py-1.5 !text-xs">
                  Sign out
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="secondary" showArrow={false} className="!px-4 !py-1.5 !text-xs">
                  Log in
                </Button>
              </Link>
            )}
          </div>
        </header>
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/trainers" replace />} />
        <Route path="/login" element={<LoginPage />} />
        {TrainerRoutes}
        <Route
          path="*"
          element={
            <div className="max-w-md mx-auto px-4 py-24 text-center">
              <p className="text-cyan-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">Not found</p>
              <h1 className="text-2xl font-black text-white mb-2">That page doesn't exist yet</h1>
              <p className="text-slate-400 mb-6">
                This route hasn't been built in this part of the app.
              </p>
              <Link to="/trainers" className="text-cyan-400 hover:text-cyan-300 font-medium">
                Back to trainers
              </Link>
            </div>
          }
        />
      </Routes>
    </div>
  );
}
