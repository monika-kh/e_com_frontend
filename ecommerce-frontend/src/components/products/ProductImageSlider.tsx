import React, { useState, useCallback, useEffect } from "react";
import { getProductImages } from "../../services/imageService";
// import "../../styles/product-image-slider.css";
import "../../styles/product-image-slider.css";

interface ProductImageSliderProps {
  images?: string[];
  fallbackImage?: string | null;
  productName: string;
}

const ProductImageSlider: React.FC<ProductImageSliderProps> = ({
  images,
  fallbackImage,
  productName,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState<boolean>(false);

  // Use image service to format and validate image URLs
  const imageList = getProductImages(images, fallbackImage);
  const hasImages = imageList.length > 0;
  const canSlide = imageList.length > 1;

  const handlePrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
      setImageError(false);
    },
    [imageList.length]
  );

  const handleNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
      setImageError(false);
    },
    [imageList.length]
  );

  const handleDotClick = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex(index);
      setImageError(false);
    },
    []
  );

  const handleImageError = useCallback(() => {
    console.warn(`Failed to load image at index ${currentIndex}:`, imageList[currentIndex]);
    setImageError(true);
  }, [currentIndex, imageList]);

  const handleImageLoad = useCallback(() => {
    setImageError(false);
  }, []);

  return (
    <div className="product-image-slider">
      {hasImages ? (
        <>
          {/* Main Image */}
          <div className="slider-image-container">
            {imageError ? (
              <div className="slider-image-error">
                <div className="error-text">Unable to load image</div>
              </div>
            ) : (
              <img
                src={imageList[currentIndex]}
                alt={`${productName} - Image ${currentIndex + 1}`}
                className="slider-image"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            )}

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
