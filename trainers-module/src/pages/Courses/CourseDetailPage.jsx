// src/pages/Courses/CourseDetailPage.jsx
//
// Public detail view for a single course - visible to everyone, same as
// a trainer's profile (rule 5.3 extends naturally to what a trainer
// teaches). Links back to the trainer who teaches it.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getCourseById } from "../../api/trainersApi";
import Eyebrow from "../../components/Eyebrow";

const difficultyColor = {
  beginner: "bg-emerald-400/10 text-emerald-300 border border-emerald-400/30",
  intermediate: "bg-amber-400/10 text-amber-300 border border-amber-400/30",
  advanced: "bg-red-400/10 text-red-300 border border-red-400/30",
};

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getCourseById(courseId)
      .then((c) => !cancelled && setCourse(c))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  if (loading) return <p className="max-w-2xl mx-auto px-4 py-12 text-slate-400">Loading course...</p>;
  if (error) return <p className="max-w-2xl mx-auto px-4 py-12 text-red-400">Couldn't load this course: {error}</p>;
  if (!course) return null;

  const colorClass =
    difficultyColor[(course.difficulty || "").toLowerCase()] ||
    "bg-slate-700/30 text-slate-300 border border-slate-700";

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link to={`/trainers/${course.trainer_id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-300 mb-6">
        <ArrowLeft size={14} /> Back to {course.trainer_name}
      </Link>

      <Eyebrow>Course</Eyebrow>
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-black text-white">{course.title}</h1>
        {course.difficulty && (
          <span className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap mt-2 ${colorClass}`}>
            {course.difficulty}
          </span>
        )}
      </div>

      <p className="text-slate-400 mt-4 leading-relaxed">{course.description}</p>

      <div className="mt-8 border-t border-slate-800 pt-6">
        <p className="text-sm text-slate-500">
          Taught by{" "}
          <Link to={`/trainers/${course.trainer_id}`} className="text-cyan-400 hover:text-cyan-300 font-medium">
            {course.trainer_name}
          </Link>
        </p>
      </div>
    </div>
  );
}
