// src/components/CourseListItem.jsx
// Row for one course a trainer teaches (courses.trainer_id relationship).
// Links to the course detail page.
import { Link } from "react-router-dom";

const difficultyColor = {
  beginner: "bg-emerald-400/10 text-emerald-300 border border-emerald-400/30",
  intermediate: "bg-amber-400/10 text-amber-300 border border-amber-400/30",
  advanced: "bg-red-400/10 text-red-300 border border-red-400/30",
};

export default function CourseListItem({ course }) {
  const colorClass =
    difficultyColor[(course.difficulty || "").toLowerCase()] ||
    "bg-slate-700/30 text-slate-300 border border-slate-700";

  return (
    <Link
      to={`/courses/${course.id}`}
      className="flex items-center justify-between py-3 px-3 hover:bg-white/5 transition"
    >
      <div>
        <p className="text-sm font-medium text-white">{course.title}</p>
        <p className="text-xs text-slate-400 line-clamp-1">{course.description}</p>
      </div>
      {course.difficulty && (
        <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${colorClass}`}>
          {course.difficulty}
        </span>
      )}
    </Link>
  );
}
