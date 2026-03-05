import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { Product } from "../../types/product";
import { ProductService } from "../../services/product";
import { RatingSummary, ProductReview } from "../../types/review";
import ProductImageSlider from "../../components/products/ProductImageSlider";
import RelatedProductsCarousel from "../../components/products/RelatedProductsCarousel";
import StarRating from "../../components/products/StarRating";
import ReviewForm from "../../components/products/ReviewForm";
import ReviewsList from "../../components/products/ReviewsList";
import "../../styles/product-detail.css";
// Header is already rendered on surrounding pages when needed

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, updateCartItem, getProductQuantity, isLoading: cartLoading } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);

  // Rating state
  const [ratingSummary, setRatingSummary] = useState<RatingSummary | null>(null);
  const [isRatingLoading, setIsRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);

  // Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalCount, setReviewsTotalCount] = useState(0);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState<ProductReview | null>(null);

  /**
   * Fetch product details
   */
  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch product details
        const productData = await ProductService.getProductBySlug(slug);
        setProduct(productData);

        // Fetch rating summary and first page of reviews
        if (productData.slug) {
          await Promise.all([
            loadRatingSummary(productData.slug),
            loadReviews(productData.slug, 1),
          ]);
        }

        // Fetch related products (same category, excluding current product)
        try {
          if (productData.category?.slug) {
            setIsFetching(true);
            const related = await ProductService.getRelatedProducts(
              productData.category.slug,
              productData.slug
            );
            setRelatedProducts(related.slice(0, 10));
          } else {
            setRelatedProducts([]);
          }
        } catch (err) {
          console.error("Failed to fetch related products:", err);
          setRelatedProducts([]);
        } finally {
          setIsFetching(false);
        }
      } catch (err: any) {
        console.error("Failed to fetch product:", err);
        setError(err.message || "Failed to load product");
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const loadRatingSummary = useCallback(
    async (productSlug: string) => {
      try {
        setIsRatingLoading(true);
        setRatingError(null);
        const summary = await ProductService.getRatingSummary(productSlug);
        setRatingSummary(summary);
      } catch (err: any) {
        console.error("Failed to load rating summary:", err);
        setRatingError(err.message || "Failed to load rating information.");
      } finally {
        setIsRatingLoading(false);
      }
    },
    []
  );

  const loadReviews = useCallback(
    async (productSlug: string, page: number) => {
      try {
        setIsReviewsLoading(true);
        setReviewsError(null);
        const response = await ProductService.getReviews(productSlug, page);
        setReviews(response.results);
        setReviewsPage(page);
        setReviewsTotalCount(response.count);
      } catch (err: any) {
        console.error("Failed to load reviews:", err);
        setReviewsError(err.message || "Failed to load reviews.");
      } finally {
        setIsReviewsLoading(false);
      }
    },
    []
  );

  /**
   * Handle add to cart
   */
  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setIsAddingToCart(true);
      // If not in cart, add 1. If already in cart, increment by 1.
      const currentQty = getProductQuantity(product.id);
      const nextQty = Math.min(5, currentQty + 1);
      if (currentQty === 0) {
        await addToCart(product.id, 1);
      } else {
        await updateCartItem(product.id, nextQty);
      }
      setAddToCartSuccess(true);
      // Reset success message after 2 seconds
      setTimeout(() => setAddToCartSuccess(false), 2000);
    } catch (err: any) {
      console.error("Failed to add to cart:", err);
      setError(err.message || "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleRatingChange = async (newRating: number) => {
    if (!product?.slug) return;

    try {
      setIsRatingLoading(true);
      setRatingError(null);
      const summary = await ProductService.setRating(product.slug, newRating);
      setRatingSummary(summary);
    } catch (err: any) {
      console.error("Failed to update rating:", err);
      setRatingError(
        err.response?.status === 401
          ? "Please login to rate this product."
          : err.message || "Failed to update rating."
      );
    } finally {
      setIsRatingLoading(false);
    }
  };

  const handleSubmitReview = async (payload: { rating: number; comment: string }) => {
    if (!product?.slug) return;

    try {
      setIsSubmittingReview(true);
      setReviewsError(null);

      if (editingReview) {
        await ProductService.updateReview(product.slug, editingReview.id, payload);
        setEditingReview(null);
      } else {
        await ProductService.createOrUpdateReview(product.slug, payload);
      }

      // Refresh rating + reviews
      await Promise.all([
        loadRatingSummary(product.slug),
        loadReviews(product.slug, 1),
      ]);
    } catch (err: any) {
      console.error("Failed to submit review:", err);
      setReviewsError(
        err.response?.status === 401
          ? "Please login to write a review."
          : err.message || "Failed to submit review."
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleEditReview = (review: ProductReview) => {
    setEditingReview(review);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!product?.slug) return;

    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await ProductService.deleteReview(product.slug, reviewId);
      await Promise.all([
        loadRatingSummary(product.slug),
        loadReviews(product.slug, 1),
      ]);
    } catch (err: any) {
      console.error("Failed to delete review:", err);
      setReviewsError(err.message || "Failed to delete review.");
    }
  };

  if (isLoading) {
    return (
      <main className="product-detail-page">
        <div className="detail-loading">Loading product...</div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="product-detail-page">
        <div className="detail-error">
          <h2>Product not found</h2>
          <p>{error || "The product you're looking for doesn't exist"}</p>
          <button className="btn btn-primary" onClick={() => navigate("/products")}>
            Back to Products
          </button>
        </div>
      </main>
    );
  }

  const cartQty = getProductQuantity(product.id);
  const productStock = typeof product.stock === "number" ? product.stock : undefined;
  const stockLeft = typeof productStock === "number" ? Math.max(productStock - cartQty, 0) : undefined;
  const isOutOfStock =
    typeof stockLeft === "number" ? stockLeft <= 0 : product.available === false;
  const maxQuantity = Math.min(5, typeof productStock === "number" ? productStock : 5);

  const handleIncrementQty = async () => {
    if (!product) return;
    if (cartQty >= maxQuantity) return;
    if (isOutOfStock) return;

    try {
      setIsAddingToCart(true);
      if (cartQty === 0) {
        await addToCart(product.id, 1);
      } else {
        await updateCartItem(product.id, cartQty + 1);
      }
    } catch (err: any) {
      console.error("Failed to update cart quantity:", err);
      setError(err.message || "Failed to update quantity");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleDecrementQty = async () => {
    if (!product) return;
    if (cartQty <= 0) return;

    try {
      setIsAddingToCart(true);
      await updateCartItem(product.id, Math.max(0, cartQty - 1));
    } catch (err: any) {
      console.error("Failed to update cart quantity:", err);
      setError(err.message || "Failed to update quantity");
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <main className="product-detail-page">
      <div className="detail-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          {product.category?.slug && product.category?.name ? (
            <button
              onClick={() => navigate(`/category/${product.category!.slug}`)}
              className="breadcrumb-link"
            >
              {product.category!.name}
            </button>
          ) : (
            <button onClick={() => navigate("/products")} className="breadcrumb-link">
              Products
            </button>
          )}
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </div>

        {/* Product Content */}
        <div className="product-detail-content">
          {/* Image Section */}
          <div className="detail-image-section">
            <ProductImageSlider
              images={product.images}
              fallbackImage={product.image}
              productName={product.name}
            />
          </div>

          {/* Info Section */}
          <div className="detail-info-section">
            <div className="detail-header">
              <h1 className="detail-name">{product.name}</h1>

              {/* Stock Badge */}
              <div className="detail-badge">
                {isOutOfStock ? (
                  <span className="badge badge-out-of-stock">Out of Stock</span>
                ) : (
                  <span className="badge badge-in-stock">In Stock</span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="detail-price">
              {product.price ? `₹${product.price}` : "Price not available"}
            </div>

            {/* Description */}
            {product.description && (
              <div className="detail-description">
                <p>{product.description}</p>
              </div>
            )}

            {/* Details Grid */}
            <div className="detail-specs">
              {product.target_gender && (
                <div className="spec-item">
                  <span className="spec-label">Target Gender:</span>
                  <span className="spec-value">{product.target_gender}</span>
                </div>
              )}

              <div className="spec-item">
                <span className="spec-label">Availability:</span>
                <span className="spec-value">{isOutOfStock ? "Out of Stock" : "Available"}</span>
              </div>
            </div>

            {/* Quantity & CTA */}
            <div className="detail-cta">
              <div className="quantity-input-group">
                <label htmlFor="quantity">Quantity:</label>
                <div className="quantity-selector">
                  <button
                    className="qty-btn"
                    onClick={handleDecrementQty}
                    disabled={cartQty === 0 || cartLoading || isAddingToCart}
                  >
                    −
                  </button>
                  <span id="quantity" className="qty-display" aria-live="polite" aria-atomic="true">
                    {cartQty}
                  </span>
                  <button
                    className="qty-btn"
                    onClick={handleIncrementQty}
                    disabled={cartQty >= maxQuantity || cartLoading || isAddingToCart || isOutOfStock}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                className="btn btn-primary btn-add-to-cart"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAddingToCart}
              >
                {isAddingToCart ? "Adding..." : "Add to Cart"}
              </button>
            </div>

            {/* Success Message */}
            {addToCartSuccess && (
              <div className="success-message">✓ Added to cart successfully!</div>
            )}

            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>

        {/* Rating summary + user rating */}
        <section className="detail-rating-section">
          <div className="rating-summary-card">
            <h3 className="section-title">Ratings & Reviews</h3>

            <div className="rating-summary-layout">
              <div className="rating-summary-top-row">
                <div className="rating-summary-average">
                  {ratingSummary ? ratingSummary.average_rating.toFixed(1) : "0.0"}
                </div>
                <div className="rating-summary-stars">
                  <StarRating value={ratingSummary?.average_rating ?? 0} readOnly size="lg" />
                </div>
              </div>

              <div className="rating-summary-counts">
                {ratingSummary?.total_ratings ?? 0} ratings • {product.reviews_count ?? 0} reviews
              </div>

              <div className="rating-summary-your-rating">
                <span className="rating-your-label">Rate this product</span>
                <StarRating
                  value={ratingSummary?.user_rating ?? 0}
                  onChange={handleRatingChange}
                  readOnly={isRatingLoading}
                />
                {ratingError && <div className="rating-error">{ratingError}</div>}
              </div>
            </div>
          </div>
        </section>

        {/* Review form */}
        <section className="detail-review-form-section">
          <ReviewForm
            initialRating={editingReview?.rating ?? (ratingSummary?.user_rating ?? 0)}
            initialComment={editingReview?.comment ?? ""}
            submitLabel={editingReview ? "Update Review" : "Save Review"}
            onSubmit={handleSubmitReview}
            isSubmitting={isSubmittingReview}
            error={reviewsError}
          />
        </section>

        {/* Reviews list */}
        <section className="detail-reviews-list-section">
          <ReviewsList
            reviews={reviews}
            page={reviewsPage}
            totalCount={reviewsTotalCount}
            pageSize={5}
            onPageChange={(page) => {
              if (product?.slug) {
                loadReviews(product.slug, page);
              }
            }}
            isLoading={isReviewsLoading}
            error={reviewsError}
            onEdit={handleEditReview}
            onDelete={handleDeleteReview}
          />
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <RelatedProductsCarousel products={relatedProducts} isLoading={isFetching} />
        )}
      </div>
    </main>
  );
};

export default ProductDetailPage;
