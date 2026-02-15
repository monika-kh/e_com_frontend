import React, { useState, useCallback } from "react";
import "../../styles/product-image-slider.css";

interface ProductImageSliderProps {
  images?: string[];
  fallbackImage?: string | null;
  productName: string;
}

const ProductImageSlider: React.FC<ProductImageSliderProps> = ({
  images = [],
  fallbackImage,
  productName,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use provided images, or fallback to single image, or show placeholder
  const imageList = images && images.length > 0 ? images : fallbackImage ? [fallbackImage] : [];
  const hasImages = imageList.length > 0;
  const canSlide = imageList.length > 1;

  const handlePrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
    },
    [imageList.length]
  );

  const handleNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
    },
    [imageList.length]
  );

  const handleDotClick = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex(index);
    },
    []
  );

  return (
    <div className="product-image-slider">
      {hasImages ? (
        <>
          {/* Main Image */}
          <div className="slider-image-container">
            <img
              src={imageList[currentIndex]}
              alt={`${productName} - Image ${currentIndex + 1}`}
              className="slider-image"
            />

            {/* Navigation Arrows - Only show if multiple images */}
            {canSlide && (
              <>
                <button
                  className="slider-arrow slider-arrow-prev"
                  onClick={handlePrev}
                  aria-label="Previous image"
                  title="Previous"
                >
                  ‹
                </button>
                <button
                  className="slider-arrow slider-arrow-next"
                  onClick={handleNext}
                  aria-label="Next image"
                  title="Next"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Pagination Dots - Only show if multiple images */}
          {canSlide && (
            <div className="slider-dots">
              {imageList.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentIndex ? "active" : ""}`}
                  onClick={(e) => handleDotClick(index, e)}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="slider-placeholder">
          <div className="placeholder-text">{productName?.[0]?.toUpperCase() || "P"}</div>
        </div>
      )}
    </div>
  );
};

export default ProductImageSlider;
