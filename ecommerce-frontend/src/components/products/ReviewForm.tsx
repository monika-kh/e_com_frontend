import React, { useState, useEffect } from "react";
import StarRating from "./StarRating";

interface ReviewFormProps {
  initialRating?: number;
  initialComment?: string;
  submitLabel?: string;
  onSubmit: (payload: { rating: number; comment: string }) => Promise<void> | void;
  isSubmitting: boolean;
  error?: string | null;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  initialRating = 0,
  initialComment = "",
  submitLabel = "Save Review",
  onSubmit,
  isSubmitting,
  error,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setRating(initialRating);
    setComment(initialComment);
  }, [initialRating, initialComment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!comment.trim()) {
      setLocalError("Review cannot be empty.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setLocalError("Please select a rating between 1 and 5 stars.");
      return;
    }

    await onSubmit({ rating, comment: comment.trim() });
    setComment("");
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3 className="review-form-title">Write a review</h3>

      <div className="review-form-rating">
        <label className="review-label">Your rating</label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div className="review-form-row">
        <div className="review-form-field">
          <label htmlFor="review-comment" className="review-label">
            Your review
          </label>
          <textarea
            id="review-comment"
            className="review-textarea"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
          />
        </div>

        <div className="review-form-actions">
          <button
            type="submit"
            className="btn btn-primary review-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
        </div>
      </div>

      {(localError || error) && (
        <div className="review-error">
          {localError || error}
        </div>
      )}
    </form>
  );
};

export default ReviewForm;

