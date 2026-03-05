import React from "react";
import "../../styles/rating-review.css";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  totalRatings?: number;
}

const StarIcon = ({
  active,
}: {
  active: boolean;
}) => {
  return (
    <svg
      className="star-icon"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 2.2l2.93 5.93 6.55.95-4.74 4.62 1.12 6.52L12 17.98 6.14 20.22l1.12-6.52-4.74-4.62 6.55-.95L12 2.2z"
        fill={active ? "currentColor" : "transparent"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readOnly = false,
  max = 5,
  size = "md",
  showValue = false,
  totalRatings,
}) => {
  const handleClick = (index: number) => {
    if (readOnly || !onChange) return;
    onChange(index);
  };

  const sizeClass =
    size === "sm" ? "star-rating-sm" : size === "lg" ? "star-rating-lg" : "star-rating-md";

  return (
    <div className={`star-rating ${sizeClass}`}>
      {Array.from({ length: max }, (_, i) => {
        const index = i + 1;
        const isActive = index <= Math.round(value);

        return (
          <button
            key={index}
            type="button"
            className={`star ${isActive ? "star-active" : ""} ${
              readOnly ? "star-readonly" : ""
            }`}
            onClick={() => handleClick(index)}
            aria-label={`Rate ${index} star${index > 1 ? "s" : ""}`}
          >
            <StarIcon active={isActive} />
          </button>
        );
      })}

      {showValue && (
        <span className="star-rating-value">
          {value.toFixed(1)}{" "}
          {typeof totalRatings === "number" && (
            <span className="star-rating-count">({totalRatings} ratings)</span>
          )}
        </span>
      )}
    </div>
  );
};

export default StarRating;

