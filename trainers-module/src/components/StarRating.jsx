// src/components/StarRating.jsx
import { Star } from "lucide-react";

export default function StarRating({ value = 0, size = 16 }) {
  const rounded = Math.round(value * 2) / 2; // nearest half star

  return (
    <span className="inline-flex items-center gap-1" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= rounded ? "fill-amber-400 text-amber-400" : "text-slate-700"}
        />
      ))}
      <span className="text-sm text-slate-400 ml-1">{value.toFixed(1)}</span>
    </span>
  );
}
