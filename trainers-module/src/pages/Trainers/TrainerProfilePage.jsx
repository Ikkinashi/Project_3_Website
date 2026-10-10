// src/pages/Trainers/TrainerProfilePage.jsx
//
// Public detail view (rule 5.3). Shows bio/qualification/background
// (rule 5.1), the courses this trainer teaches, reviews, and an edit
// entry point that only renders for the trainer's own logged-in account
// (rule 5.2). Messaging goes through the internal system only (rule 5.5) -
// this page never shows an email/phone number.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Pencil, Send } from "lucide-react";
import {
  getTrainerById,
  getTrainerSkills,
  getTrainerCourses,
  getTrainerReviews,
  sendMessageToTrainer,
} from "../../api/trainersApi";
import { useAuth, canEditTrainer } from "../../context/AuthContext";
import StarRating from "../../components/StarRating";
import SkillBadge from "../../components/SkillBadge";
import CourseListItem from "../../components/CourseListItem";
import ReviewItem from "../../components/ReviewItem";
import Eyebrow from "../../components/Eyebrow";
import Button from "../../components/Button";

export default function TrainerProfilePage() {
  const { trainerId } = useParams();
  const { user } = useAuth();

  const [trainer, setTrainer] = useState(null);
  const [skills, setSkills] = useState([]);
  const [courses, setCourses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [message, setMessage] = useState("");
  const [sendStatus, setSendStatus] = useState(null); // null | "sending" | "sent" | "error"

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const [t, s, c, r] = await Promise.all([
          getTrainerById(trainerId),
          getTrainerSkills(trainerId),
          getTrainerCourses(trainerId),
          getTrainerReviews(trainerId),
        ]);
        if (!cancelled) {
          setTrainer(t);
          setSkills(s);
          setCourses(c);
          setReviews(r);
        }
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
  }, [trainerId]);

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      setSendStatus("sending");
      await sendMessageToTrainer(trainerId, message.trim());
      setMessage("");
      setSendStatus("sent");
    } catch {
      setSendStatus("error");
    }
  }

  if (loading) return <p className="max-w-3xl mx-auto px-4 py-12 text-slate-400">Loading trainer...</p>;
  if (error) return <p className="max-w-3xl mx-auto px-4 py-12 text-red-400">Couldn't load this trainer: {error}</p>;
  if (!trainer) return null;

  const canEdit = canEditTrainer(user, trainer.id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 flex items-center justify-center text-xl font-bold overflow-hidden">
            {trainer.avatar_url ? (
              <img src={trainer.avatar_url} alt={trainer.name} className="w-full h-full object-cover" />
            ) : (
              trainer.name.split(" ").map((p) => p[0]).slice(0, 2).join("")
            )}
          </div>
          <div>
            <Eyebrow>Trainer profile</Eyebrow>
            <h1 className="text-2xl font-black text-white -mt-1">{trainer.name}</h1>
            <div className="mt-1">
              <StarRating value={trainer.avg_rating || 0} />
            </div>
          </div>
        </div>

        {canEdit && (
          <Link to={`/trainers/${trainer.id}/edit`}>
            <Button variant="secondary" icon={Pencil} showArrow={false}>
              Edit profile
            </Button>
          </Link>
        )}
      </div>

      {trainer.bio && <p className="text-slate-400 mt-5 leading-relaxed">{trainer.bio}</p>}

      {skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((s) => (
            <SkillBadge key={s.id} label={s.skill_name} />
          ))}
        </div>
      )}

      <section className="mt-10">
        <Eyebrow>What they teach</Eyebrow>
        <h2 className="text-lg font-bold text-white mb-3">Courses</h2>
        <div className="border border-slate-800 rounded-xl divide-y divide-slate-800 bg-[#0d1420]">
          {courses.length > 0 ? (
            courses.map((c) => <CourseListItem key={c.id} course={c} />)
          ) : (
            <p className="text-sm text-slate-500 px-3 py-4">No courses listed yet.</p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <Eyebrow>In their words</Eyebrow>
        <h2 className="text-lg font-bold text-white mb-3">Member reviews</h2>
        <div className="border border-slate-800 rounded-xl px-3 bg-[#0d1420]">
          {reviews.length > 0 ? (
            reviews.map((r) => <ReviewItem key={r.id} review={r} />)
          ) : (
            <p className="text-sm text-slate-500 py-4">No reviews yet.</p>
          )}
        </div>
      </section>

      {/* Rule 5.5: trainers and members can only communicate through the
          system's internal messaging - no direct contact info shown. */}
      {user && user.role === "member" && (
        <section className="mt-10">
          <Eyebrow>Get in touch</Eyebrow>
          <h2 className="text-lg font-bold text-white mb-3">Message {trainer.name}</h2>
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message"
              className="flex-1 bg-[#0d1420] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
            />
            <Button type="submit" icon={Send} showArrow={false} disabled={sendStatus === "sending"}>
              Send
            </Button>
          </form>
          {sendStatus === "sent" && <p className="text-sm text-emerald-400 mt-2">Message sent.</p>}
          {sendStatus === "error" && <p className="text-sm text-red-400 mt-2">Couldn't send that message. Try again.</p>}
        </section>
      )}

      {!user && (
        <p className="mt-10 text-sm text-slate-500">
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300">Log in</Link> as a member to message this trainer or leave a review.
        </p>
      )}
    </div>
  );
}
