// src/components/ReviewItem.jsx
// Renders one row from the "reviews" table (user_id, trainer_id, rating,
// comment, created_at). Reviewer name should come from a joined users query
// on the backend - never expose password_hash or email here.
import StarRating from "./StarRating";

export default function ReviewItem({ review }) {
  return (
    <div className="border-b border-slate-800 py-3 last:border-none">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white">{review.reviewer_name || "Member"}</p>
        <StarRating value={review.rating} size={12} />
      </div>
      {review.comment && (
        <p className="text-sm text-slate-400 mt-1">{review.comment}</p>
      )}
      <p className="text-xs text-slate-600 mt-1">
        {new Date(review.created_at).toLocaleDateString()}
      </p>
    </div>
  );
}
