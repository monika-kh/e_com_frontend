import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { ProductService } from "../../services/product";
import { Product } from "../../types/product";
import { useCart } from "../../context/CartContext";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateCartItem, getProductQuantity, isLoading: cartLoading } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);

  // Get current quantity from global cart state
  const cartQuantity = product ? getProductQuantity(product.id) : 0;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch by ID or slug
        const productData = await ProductService.getProductById(Number(id)).catch(() =>
          ProductService.getProductBySlug(id)
        );

        setProduct(productData);
      } catch (err: any) {
        console.error("Failed to fetch product:", err);
        setError(err.message || "Product not found");
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  /**
   * Handle Add to Cart button click
   * If product not in cart → add with quantity 1
   * If product already in cart → increase by 1 (no duplicate)
   */
  const handleAddToCart = useCallback(async () => {
    if (!product) return;

    try {
      const newQuantity = cartQuantity + 1;
      
      if (newQuantity > 5) {
        setError("Maximum quantity is 5 per product");
        return;
      }

      await updateCartItem(product.id, newQuantity);
      setAddToCartSuccess(true);
      setTimeout(() => setAddToCartSuccess(false), 2000);
    } catch (err: any) {
      console.error("Failed to add to cart:", err);
      setError(err.message || "Failed to add to cart");
    }
  }, [product, cartQuantity, updateCartItem]);

  /**
   * Handle quantity increment
   */
  const handleIncrement = useCallback(async () => {
    if (!product) return;
    if (cartQuantity >= 5) return;

    try {
      await updateCartItem(product.id, cartQuantity + 1);
    } catch (err: any) {
      console.error("Failed to increment quantity:", err);
      setError(err.message || "Failed to update quantity");
    }
  }, [product, cartQuantity, updateCartItem]);

  /**
   * Handle quantity decrement
   */
  const handleDecrement = useCallback(async () => {
    if (!product) return;
    if (cartQuantity <= 0) return;

    try {
      // updateCartItem handles removal when quantity = 0
      await updateCartItem(product.id, cartQuantity - 1);
    } catch (err: any) {
      console.error("Failed to decrement quantity:", err);
      setError(err.message || "Failed to update quantity");
    }
  }, [product, cartQuantity, updateCartItem]);

  if (isLoading) {
    return (
      <main style={{ padding: "2rem" }}>
        <p>Loading product...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main style={{ padding: "2rem" }}>
        <h2>Product not found</h2>
        <p>{error || "The product you're looking for doesn't exist"}</p>
        <button className="btn btn-primary" onClick={() => navigate("/products")}>
          Back to Products
        </button>
      </main>
    );
  }

  const isOutOfStock = product.available === false;
  const maxQuantity = 5;

  return (
    <main className="bg-soft" style={{ padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: "1.5rem" }}>
          <button
            onClick={() => navigate("/products")}
            style={{
              background: "none",
              border: "none",
              color: "#007bff",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Products
          </button>
          <span style={{ margin: "0 0.5rem" }}>/</span>
          <span>{product.name}</span>
        </div>

        {/* Product Content */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          {/* Image Section */}
          <div>
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                style={{ width: "100%", borderRadius: "8px", marginBottom: "1rem" }}
              />
            )}
          </div>

          {/* Info Section */}
          <div>
            <h2>{product.name}</h2>

            {/* Stock Badge */}
            <div style={{ marginBottom: "1rem" }}>
              {isOutOfStock ? (
                <span style={{ color: "#dc3545", fontWeight: "bold" }}>Out of Stock</span>
              ) : (
                <span style={{ color: "#28a745", fontWeight: "bold" }}>In Stock</span>
              )}
            </div>

            {/* Price */}
            <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
              ₹{product.price || "N/A"}
            </h3>

            {/* Description */}
            {product.description && (
              <p style={{ marginBottom: "1.5rem", lineHeight: "1.6" }}>
                {product.description}
              </p>
            )}

            {/* Details */}
            {product.target_gender && (
              <p style={{ marginBottom: "1rem" }}>
                <strong>For:</strong> {product.target_gender}
              </p>
            )}

            {/* Error Message */}
            {error && <div style={{ color: "#dc3545", marginBottom: "1rem" }}>{error}</div>}

            {/* Success Message */}
            {addToCartSuccess && (
              <div style={{ color: "#28a745", marginBottom: "1rem", fontWeight: "bold" }}>
                ✓ Added to cart successfully!
              </div>
            )}

            {/* Quantity & CTA */}
            <div style={{ marginTop: "2rem" }}>
              {/* Show quantity selector if product is in cart */}
              {cartQuantity > 0 && (
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ marginRight: "0.5rem", fontWeight: "bold" }}>
                    In Cart: {cartQuantity}
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <button
                      onClick={handleDecrement}
                      disabled={cartQuantity === 0 || cartLoading || isOutOfStock}
                      style={{
                        padding: "0.5rem 1rem",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        cursor: "pointer",
                        backgroundColor: "#fff",
                      }}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span
                      style={{
                        width: "60px",
                        textAlign: "center",
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        backgroundColor: "#f9f9f9",
                      }}
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      {cartQuantity}
                    </span>
                    <button
                      onClick={handleIncrement}
                      disabled={cartQuantity >= 5 || cartLoading || isOutOfStock}
                      style={{
                        padding: "0.5rem 1rem",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        cursor: "pointer",
                        backgroundColor: "#fff",
                      }}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary"
                onClick={handleAddToCart}
                disabled={isOutOfStock || cartLoading}
                style={{ width: "100%", padding: "0.75rem" }}
                aria-label={
                  cartQuantity > 0
                    ? `Increase quantity (currently ${cartQuantity})`
                    : "Add to cart"
                }
              >
                {cartLoading ? "Processing..." : cartQuantity > 0 ? "Add More to Cart" : "Add to Cart"}
              </button>

              <button
                className="btn btn-outline"
                onClick={() => navigate("/products")}
                style={{ width: "100%", padding: "0.75rem", marginTop: "0.5rem" }}
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetails;
