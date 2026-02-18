import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import cartService from "../../services/cartService";
import "../../styles/cart-item-card.css";

interface CartItemCardProps {
  item: {
    productId: number;
    quantity: number;
    price?: number;
    product_name?: string;
    product_slug?: string;
    product_stock?: number;
    product_images?: string[];
    subtotal?: number;
  };
  onUpdate?: () => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({ item, onUpdate }) => {
  const navigate = useNavigate();
  const { updateCartItem, removeFromCart, isLoading, fetchCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const quantity = item.quantity || 0;
  const price = item.price || 0;
  const totalCost = item.subtotal || price * quantity;
  const productName = item.product_name || "Product";
  const productImages = item.product_images || [];
  const maxQuantity = 5;

  /**
   * Handle card click - navigate to product detail
   */
  const handleCardClick = useCallback(() => {
    if (item.product_slug) {
      navigate(`/product/${item.product_slug}`);
    } else {
      navigate(`/product/${item.productId}`);
    }
  }, [item.productId, item.product_slug, navigate]);

  /**
   * Handle increment quantity
   */
  const handleIncrement = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      if (quantity >= maxQuantity) {
        return;
      }

      try {
        setIsUpdating(true);
        const newQuantity = quantity + 1;
        await cartService.updateCart(item.productId, newQuantity);
        await fetchCart();
        onUpdate?.();
      } catch (error: any) {
        console.error("[CartItemCard] Error incrementing quantity:", error);
      } finally {
        setIsUpdating(false);
      }
    },
    [item.productId, quantity, fetchCart, onUpdate]
  );

  /**
   * Handle decrement quantity
   */
  const handleDecrement = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      if (quantity <= 1) {
        // Remove from cart
        try {
          setIsUpdating(true);
          await cartService.removeFromCart(item.productId);
          await fetchCart();
          onUpdate?.();
        } catch (error: any) {
          console.error("[CartItemCard] Error removing item:", error);
        } finally {
          setIsUpdating(false);
        }
        return;
      }

      try {
        setIsUpdating(true);
        const newQuantity = quantity - 1;
        await cartService.updateCart(item.productId, newQuantity);
        await fetchCart();
        onUpdate?.();
      } catch (error: any) {
        console.error("[CartItemCard] Error decrementing quantity:", error);
      } finally {
        setIsUpdating(false);
      }
    },
    [item.productId, quantity, fetchCart, onUpdate]
  );

  /**
   * Handle remove item
   */
  const handleRemove = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      if (window.confirm(`Remove ${productName} from cart?`)) {
        try {
          setIsUpdating(true);
          await cartService.removeFromCart(item.productId);
          await fetchCart();
          onUpdate?.();
        } catch (error: any) {
          console.error("[CartItemCard] Error removing item:", error);
        } finally {
          setIsUpdating(false);
        }
      }
    },
    [item.productId, productName, fetchCart, onUpdate]
  );

  return (
    <div
      className="cart-item-card"
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      aria-label={`Cart item: ${productName}`}
    >
      {/* Product Image */}
      <div className="cart-item-image">
        {productImages.length > 0 ? (
          <img
            src={productImages[0]}
            alt={productName}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.jpg";
            }}
          />
        ) : (
          <div className="placeholder">{productName[0]}</div>
        )}
      </div>

      {/* Product Info */}
      <div className="cart-item-info">
        <h4 className="cart-item-name">{productName}</h4>

        <div className="cart-item-price-section">
          <div className="cart-item-unit-price">
            ₹{price.toLocaleString("en-IN")} <span className="per-item">per item</span>
          </div>
          <div className="cart-item-total-cost">
            Total: ₹{totalCost.toLocaleString("en-IN")}
          </div>
        </div>

        {/* Quantity Selector */}
        <div
          className="quantity-selector"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="qty-btn qty-minus"
            onClick={handleDecrement}
            disabled={quantity === 0 || isLoading || isUpdating}
            aria-label="Decrease quantity"
            title="Decrease quantity"
          >
            {isUpdating ? "⋯" : "−"}
          </button>

          <span className="qty-display" aria-live="polite" aria-atomic="true">
            {quantity}
          </span>

          <button
            className="qty-btn qty-plus"
            onClick={handleIncrement}
            disabled={quantity >= maxQuantity || isLoading || isUpdating}
            aria-label="Increase quantity"
            title="Increase quantity"
          >
            {isUpdating ? "⋯" : "+"}
          </button>
        </div>

        {/* Remove Button */}
        <button
          className="remove-item-btn"
          onClick={handleRemove}
          disabled={isLoading || isUpdating}
          aria-label="Remove from cart"
          title="Remove from cart"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItemCard;
