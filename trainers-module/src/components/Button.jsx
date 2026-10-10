// src/components/Button.jsx
// Matches the reference design: bold uppercase label, solid cyan primary
// button with a trailing arrow, bordered secondary/ghost variants for a
// dark background. Use this instead of one-off button classes so every
// CTA in the app stays visually consistent.
import { ArrowRight } from "lucide-react";

const VARIANTS = {
  primary: "bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-[0_0_24px_-8px_rgba(34,211,238,0.6)]",
  secondary: "border border-slate-700 text-slate-200 hover:border-cyan-400 hover:text-cyan-300 bg-transparent",
  ghost: "text-cyan-400 hover:text-cyan-300 bg-transparent px-2",
};

export default function Button({
  children,
  variant = "primary",
  showArrow = variant === "primary",
  icon: Icon,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-bold uppercase tracking-wide text-sm px-5 py-2.5 transition disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
      {showArrow && !Icon && <ArrowRight size={16} />}
    </button>
  );
}
