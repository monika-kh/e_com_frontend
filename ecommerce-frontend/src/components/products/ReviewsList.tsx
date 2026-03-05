import React from "react";
import { ProductReview } from "../../types/review";
import ReviewItem from "./ReviewItem";

interface ReviewsListProps {
  reviews: ProductReview[];
  page: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  error?: string | null;
  onEdit: (review: ProductReview) => void;
  onDelete: (reviewId: number) => void;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
  reviews,
  page,
  totalCount,
  pageSize,
  onPageChange,
  isLoading,
  error,
  onEdit,
  onDelete,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  if (isLoading && !reviews.length) {
    return <div className="reviews-loading">Loading reviews...</div>;
  }

  if (error && !reviews.length) {
    return <div className="reviews-error">{error}</div>;
  }

  if (!reviews.length) {
    return <div className="reviews-empty">No reviews yet. Be the first to review!</div>;
  }

  return (
    <div className="reviews-section">
      <h3 className="reviews-title">Customer Reviews</h3>

      <ul className="reviews-list">
        {reviews.map((review) => (
          <ReviewItem
            key={review.id}
            review={review}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ul>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="reviews-pagination">
          <button
            type="button"
            className="btn-page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </button>

          <span className="page-info">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            className="btn-page"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;

