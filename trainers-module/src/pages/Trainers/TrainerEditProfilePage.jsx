// src/pages/Trainers/TrainerEditProfilePage.jsx
//
// Rule 5.2: "Only registered trainers may edit their own profile."
// This page double-checks that the logged-in user IS the trainer whose
// id is in the URL before rendering the form. The server must enforce
// this too - never trust a client-side check alone.
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Plus, Upload } from "lucide-react";
import {
  getTrainerById,
  getTrainerSkills,
  updateTrainerProfile,
  addTrainerSkill,
  removeTrainerSkill,
  uploadTrainerAvatar,
} from "../../api/trainersApi";
import { useAuth, canEditTrainer } from "../../context/AuthContext";
import SkillBadge from "../../components/SkillBadge";
import Eyebrow from "../../components/Eyebrow";
import Button from "../../components/Button";

export default function TrainerEditProfilePage() {
  const { trainerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", bio: "" });
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [t, s] = await Promise.all([
          getTrainerById(trainerId),
          getTrainerSkills(trainerId),
        ]);
        if (!cancelled) {
          setForm({ name: t.name, bio: t.bio || "" });
          setAvatarUrl(t.avatar_url || null);
          setSkills(s);
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

  // Guard AFTER hooks are declared (rules of hooks), but before rendering
  // the form. Anyone who isn't this trainer gets bounced to the public view.
  if (!loading && !canEditTrainer(user, trainerId)) {
    return <Navigate to={`/trainers/${trainerId}`} replace />;
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name can't be empty.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await updateTrainerProfile(trainerId, form);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddSkill(e) {
    e.preventDefault();
    const name = newSkill.trim();
    if (!name) return;
    try {
      const created = await addTrainerSkill(trainerId, name);
      setSkills((prev) => [...prev, created]);
      setNewSkill("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveSkill(skillId) {
    try {
      await removeTrainerSkill(trainerId, skillId);
      setSkills((prev) => prev.filter((s) => s.id !== skillId));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      setError(null);
      const result = await uploadTrainerAvatar(trainerId, file);
      setAvatarUrl(result.avatar_url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingAvatar(false);
    }
  }

  if (loading) return <p className="max-w-2xl mx-auto px-4 py-12 text-slate-400">Loading...</p>;

  const inputClass =
    "w-full bg-[#0d1420] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400";

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Eyebrow>Trainer settings</Eyebrow>
      <h1 className="text-3xl font-black text-white">Edit your profile</h1>
      <p className="text-slate-400 mt-2">Members see this on your public trainer page.</p>

      <form onSubmit={handleSave} className="mt-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Profile photo</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 flex items-center justify-center font-bold overflow-hidden shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile preview" className="w-full h-full object-cover" />
              ) : (
                form.name.split(" ").map((p) => p[0]).slice(0, 2).join("")
              )}
            </div>
            <label className="inline-flex items-center gap-2 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 hover:border-cyan-400 hover:text-cyan-300 cursor-pointer transition">
              <Upload size={14} />
              {uploadingAvatar ? "Uploading..." : "Upload photo"}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Bio / qualifications / background
          </label>
          <textarea
            rows={5}
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            className={inputClass}
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {saved && <p className="text-sm text-emerald-400">Profile updated.</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
          <Button type="button" variant="secondary" showArrow={false} onClick={() => navigate(`/trainers/${trainerId}`)}>
            Cancel
          </Button>
        </div>
      </form>

      <section className="mt-12">
        <Eyebrow>Specialties</Eyebrow>
        <h2 className="text-lg font-bold text-white mb-3">Skills</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((s) => (
            <SkillBadge key={s.id} label={s.skill_name} onRemove={() => handleRemoveSkill(s.id)} />
          ))}
        </div>
        <form onSubmit={handleAddSkill} className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill, e.g. Strength training"
            className={`flex-1 ${inputClass}`}
          />
          <Button type="submit" variant="secondary" icon={Plus} showArrow={false}>
            Add
          </Button>
        </form>
      </section>
    </div>
  );
}
