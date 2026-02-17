import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "../../types/product";
import { useCart } from "../../context/CartContext";
import ProductImageSlider from "./ProductImageSlider";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { getProductQuantity, updateCartItem, isLoading } = useCart();

  // Get current quantity from global cart state
  const quantity = getProductQuantity(product.id);

  const isOutOfStock = product.available === false;
  const maxQuantity = 5;

  /**
   * Handle product card click - navigate to product detail
   * Should NOT trigger when clicking quantity buttons
   */
  const handleCardClick = useCallback(() => {
    // Navigate using product ID (matches /product/:id route)
    navigate(`/product/${product.id}`);
  }, [product.id, navigate]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        navigate(`/product/${product.id}`);
      }
    },
    [product.id, navigate]
  );

  /**
   * Increment quantity
   * If quantity = 0 → add to cart with qty 1
   * If quantity > 0 → increase by 1 (prevents duplicates)
   */
  const handleIncrement = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      
      if (isOutOfStock || quantity >= maxQuantity) return;

      try {
        const newQuantity = quantity + 1;
        await updateCartItem(product.id, newQuantity);
      } catch (error) {
        console.error("Failed to increment quantity:", error);
      }
    },
    [product.id, quantity, isOutOfStock, updateCartItem]
  );

  /**
   * Decrement quantity
   * If quantity = 1 → remove from cart completely
   * If quantity > 1 → reduce by 1
   */
  const handleDecrement = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      if (quantity <= 0) return;

      try {
        const newQuantity = quantity - 1;
        // updateCartItem handles removal when newQuantity = 0
        await updateCartItem(product.id, newQuantity);
      } catch (error) {
        console.error("Failed to decrement quantity:", error);
      }
    },
    [product.id, quantity, updateCartItem]
  );

  return (
    <div
      className="product-card"
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      aria-label={`Product: ${product.name}`}
    >
      {/* Stock Badge */}
      <div className="product-badge">
        {isOutOfStock ? (
          <span className="badge badge-out-of-stock">Out of Stock</span>
        ) : (
          <span className="badge badge-in-stock">In Stock</span>
        )}
      </div>

      {/* Image Slider */}
      <ProductImageSlider
        images={product.images}
        fallbackImage={product.image}
        productName={product.name}
      />

      {/* Product Info */}
      <div className="product-info">
        <h4 className="product-name">{product.name}</h4>

        <div className="product-price">{product.price ? `₹${product.price}` : "-"}</div>

        {/* Quantity Selector */}
        <div
          className={`quantity-selector ${isOutOfStock ? "disabled" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="qty-btn qty-minus"
            onClick={handleDecrement}
            disabled={quantity === 0 || isLoading || isOutOfStock}
            aria-label="Decrease quantity"
            title={quantity === 0 ? "Add to cart first" : "Decrease quantity"}
          >
            −
          </button>

          <span className="qty-display" aria-live="polite" aria-atomic="true">
            {quantity}
          </span>

          <button
            className="qty-btn qty-plus"
            onClick={handleIncrement}
            disabled={quantity >= maxQuantity || isLoading || isOutOfStock}
            aria-label="Increase quantity"
            title={
              quantity >= maxQuantity
                ? "Maximum quantity reached"
                : "Increase quantity"
            }
          >
            +
          </button>

          {isLoading && <span className="qty-loading" aria-live="polite">…</span>}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
