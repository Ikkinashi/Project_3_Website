// src/pages/Trainers/TrainersListPage.jsx
//
// Rule 5.3: "Trainer profiles are visible to all users (registered or
// not)." So this page never checks auth state before rendering.
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { getTrainers, getTrainerSkills } from "../../api/trainersApi";
import TrainerCard from "../../components/TrainerCard";
import Eyebrow from "../../components/Eyebrow";

export default function TrainersListPage() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const list = await getTrainers();
        const withSkills = await Promise.all(
          list.map(async (t) => ({ ...t, skills: await getTrainerSkills(t.id).catch(() => []) }))
        );
        if (!cancelled) setTrainers(withSkills);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = trainers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Eyebrow>Our team</Eyebrow>
      <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
        Meet the trainers who'll<br />
        <span className="text-cyan-400">push you further.</span>
      </h1>
      <p className="text-slate-400 mt-4 max-w-xl">
        Browse every trainer at Forge Fitness. No account needed to look around.
      </p>

      <div className="relative mt-6 w-full sm:w-80">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search trainers by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#0d1420] border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
        />
      </div>

      {loading && <p className="mt-10 text-slate-400">Loading trainers...</p>}
      {error && <p className="mt-10 text-red-400">Couldn't load trainers: {error}</p>}

      {!loading && !error && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} />
          ))}
          {filtered.length === 0 && (
            <p className="text-slate-500 col-span-full">No trainers match your search.</p>
          )}
        </div>
      )}
    </div>
  );
}
