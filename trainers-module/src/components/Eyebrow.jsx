// src/components/Eyebrow.jsx
// The small uppercase, letter-spaced, cyan label above headings —
// e.g. "MEMBER ACCESS" in the reference design.
export default function Eyebrow({ children }) {
  return (
    <p className="text-cyan-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">
      {children}
    </p>
  );
}
