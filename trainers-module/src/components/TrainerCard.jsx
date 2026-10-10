// src/components/TrainerCard.jsx
// Summary card shown in the trainers grid. Visible to everyone per rule 5.3,
// so this component makes no assumptions about the viewer being logged in.
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import StarRating from "./StarRating";

export default function TrainerCard({ trainer }) {
  const initials = trainer.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Link
      to={`/trainers/${trainer.id}`}
      className="group block bg-[#0d1420] border border-slate-800 rounded-xl p-4 hover:border-cyan-400/60 hover:bg-[#0f1826] transition"
    >
      <div className="w-11 h-11 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 flex items-center justify-center font-bold text-sm overflow-hidden">
        {trainer.avatar_url ? (
          <img src={trainer.avatar_url} alt={trainer.name} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <p className="mt-3 font-semibold text-white">{trainer.name}</p>
      <p className="text-sm text-slate-400 truncate">
        {(trainer.skills || []).slice(0, 3).map((s) => s.skill_name).join(", ") || "General fitness"}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <StarRating value={trainer.avg_rating || 0} size={14} />
        <ArrowRight size={14} className="text-slate-600 group-hover:text-cyan-400 transition" />
      </div>
    </Link>
  );
}
