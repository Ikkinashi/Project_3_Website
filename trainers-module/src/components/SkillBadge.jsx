// src/components/SkillBadge.jsx
// Renders a single row from trainer_skills (skill_name), with an optional
// remove button used only in the trainer's own edit-profile view.
import { X } from "lucide-react";

export default function SkillBadge({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-sm px-3 py-1">
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="hover:text-white"
        >
          <X size={14} />
        </button>
      )}
    </span>
  );
}
