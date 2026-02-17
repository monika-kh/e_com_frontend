import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "../../types/product";
import "../../styles/related-products.css";

interface RelatedProductsCarouselProps {
  products: Product[];
  isLoading?: boolean;
}

const RelatedProductsCarousel: React.FC<RelatedProductsCarouselProps> = ({
  products,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const itemsPerView = 3;
  const totalSlides = Math.ceil(products.length / itemsPerView);
  const visibleProducts = products.slice(
    currentIndex * itemsPerView,
    (currentIndex + 1) * itemsPerView
  );

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  }, [totalSlides]);

  const handleProductClick = useCallback(
    (slug?: string) => {
      if (slug) {
        navigate(`/product/${slug}`);
      }
    },
    [navigate]
  );

  if (isLoading) {
    return (
      <div className="related-products">
        <h3>Related Products</h3>
        <div className="carousel-loading">Loading related products...</div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="related-products">
      <h3>Related Products</h3>

      <div className="carousel-container">
        {/* Navigation Arrows */}
        {totalSlides > 1 && (
          <>
            <button className="carousel-arrow carousel-prev" onClick={handlePrev} aria-label="Previous">
              ‹
            </button>
            <button className="carousel-arrow carousel-next" onClick={handleNext} aria-label="Next">
              ›
            </button>
          </>
        )}

        {/* Products Grid */}
        <div className="carousel-content">
          <div className="products-grid">
            {visibleProducts.map((product) => (
              <div
                key={product.id}
                className="carousel-product-card"
                onClick={() => handleProductClick(product.slug)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleProductClick(product.slug);
                }}
              >
                <div className="carousel-product-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <div className="placeholder">{product.name?.[0]}</div>
                  )}
                </div>

                <div className="carousel-product-info">
                  <h4 className="carousel-product-name">{product.name}</h4>
                  <div className="carousel-product-price">
                    {product.price ? `₹${product.price}` : "-"}
                  </div>

                  {product.available === false && (
                    <div className="carousel-badge-out-stock">Out of Stock</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      {totalSlides > 1 && (
        <div className="carousel-dots">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RelatedProductsCarousel;
