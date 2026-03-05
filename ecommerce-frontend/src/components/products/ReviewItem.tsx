import React from "react";
import { ProductReview } from "../../types/review";
import StarRating from "./StarRating";

interface ReviewItemProps {
  review: ProductReview;
  onEdit: (review: ProductReview) => void;
  onDelete: (reviewId: number) => void;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review, onEdit, onDelete }) => {
  return (
    <li className="review-item">
      <div className="review-line-1">
        <span className="review-username">
          {review.user_name || review.user_email}
        </span>
        <StarRating value={review.rating} readOnly size="sm" />
      </div>

      <div className="review-line-2">
        <p className="review-text">{review.comment}</p>
        <span className="review-date">
          {new Date(review.created_at).toLocaleDateString()}
        </span>
      </div>

      {review.is_owner && (
        <div className="review-actions">
          <button type="button" className="btn-link" onClick={() => onEdit(review)}>
            Edit
          </button>
          <button
            type="button"
            className="btn-link btn-link-danger"
            onClick={() => onDelete(review.id)}
          >
            Delete
          </button>
        </div>
      )}
    </li>
  );
};

export default ReviewItem;

