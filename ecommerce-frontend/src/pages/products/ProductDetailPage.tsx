import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { Product } from "../../types/product";
import { ProductService } from "../../services/product";
import ProductImageSlider from "../../components/products/ProductImageSlider";
import RelatedProductsCarousel from "../../components/products/RelatedProductsCarousel";
import "../../styles/product-detail.css";

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);

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

        // Fetch related products
        try {
          setIsFetching(true);
          const category = productData.target_gender || "General";
          const related = await ProductService.getRelatedProducts(category);
          // Filter out current product
          setRelatedProducts(related.filter((p) => p.id !== productData.id).slice(0, 6));
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

  /**
   * Handle add to cart
   */
  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setIsAddingToCart(true);
      await addToCart(product.id, quantity);
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

  const isOutOfStock = product.available === false;
  const maxQuantity = 5;

  return (
    <main className="product-detail-page">
      <div className="detail-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <button onClick={() => navigate("/products")} className="breadcrumb-link">
            Products
          </button>
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
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                  >
                    −
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max={maxQuantity}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(Math.min(Math.max(val, 1), maxQuantity));
                    }}
                    disabled={isOutOfStock}
                    className="qty-input"
                  />
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    disabled={quantity >= maxQuantity || isOutOfStock}
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

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <RelatedProductsCarousel products={relatedProducts} isLoading={isFetching} />
        )}
      </div>
    </main>
  );
};

export default ProductDetailPage;
