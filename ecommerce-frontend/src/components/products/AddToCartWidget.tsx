import React, { useState, useCallback } from "react";
import { useCart } from "../../context/CartContext";
import "../../styles/add-to-cart-widget.css";

interface AddToCartWidgetProps {
  productId: number;
  productName: string;
  price: number;
  stock: number;
  onSuccess?: () => void;
}

const AddToCartWidget: React.FC<AddToCartWidgetProps> = ({
  productId,
  productName,
  price,
  stock,
  onSuccess,
}) => {
  const { addToCart, isLoading, error, resetError } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isOutOfStock = stock <= 0;
  const maxQuantity = Math.min(5, stock);

  /**
   * Handle increment quantity
   */
  const handleIncrement = useCallback(() => {
    if (quantity < maxQuantity) {
      setQuantity((prev) => prev + 1);
      setLocalError(null);
    }
  }, [quantity, maxQuantity]);

  /**
   * Handle decrement quantity
   */
  const handleDecrement = useCallback(() => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
      setLocalError(null);
    }
  }, [quantity]);

  /**
   * Handle quantity input change
   */
  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value >= 1 && value <= maxQuantity) {
        setQuantity(value);
        setLocalError(null);
      } else if (isNaN(value) || value < 1) {
        setLocalError("Quantity must be at least 1");
      } else if (value > maxQuantity) {
        setLocalError(`Maximum quantity is ${maxQuantity}`);
      }
    },
    [maxQuantity]
  );

  /**
   * Handle add to cart
   */
  const handleAddToCart = useCallback(async () => {
    try {
      setLocalError(null);
      setSuccessMessage(null);

      if (quantity < 1 || quantity > maxQuantity) {
        setLocalError(`Quantity must be between 1 and ${maxQuantity}`);
        return;
      }

      await addToCart(productId, quantity);
      
      setSuccessMessage(`${quantity} ${productName} added to cart!`);
      setQuantity(1);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Failed to add to cart:", err);
      setLocalError(err.response?.data?.error || "Failed to add to cart");
    }
  }, [productId, quantity, maxQuantity, productName, addToCart, onSuccess]);

  const displayError = localError || error;

  return (
    <div className="add-to-cart-widget">
      {/* Stock Status */}
      <div className="stock-status">
        {isOutOfStock ? (
          <span className="out-of-stock">Out of Stock</span>
        ) : stock <= 5 ? (
          <span className="low-stock">Only {stock} left in stock</span>
        ) : (
          <span className="in-stock">In Stock</span>
        )}
      </div>

      {/* Price Display */}
      <div className="price-display">
        <span className="price">₹{price.toLocaleString("en-IN")}</span>
      </div>

      {/* Error Message */}
      {displayError && (
        <div className="error-message">
          <p>{displayError}</p>
          <button
            className="close-btn"
            onClick={resetError}
            aria-label="Close error message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          <p>✓ {successMessage}</p>
        </div>
      )}

      {/* Quantity Selector */}
      {!isOutOfStock && (
        <>
          <div className="quantity-selector">
            <label htmlFor={`quantity-${productId}`}>Quantity:</label>
            <div className="quantity-controls">
              <button
                className="qty-btn qty-minus"
                onClick={handleDecrement}
                disabled={quantity <= 1 || isLoading}
                aria-label="Decrease quantity"
              >
                −
              </button>

              <input
                id={`quantity-${productId}`}
                type="number"
                min="1"
                max={maxQuantity}
                value={quantity}
                onChange={handleQuantityChange}
                className="qty-input"
                aria-label="Product quantity"
              />

              <button
                className="qty-btn qty-plus"
                onClick={handleIncrement}
                disabled={quantity >= maxQuantity || isLoading}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            className="btn btn-primary btn-add-to-cart"
            onClick={handleAddToCart}
            disabled={isLoading || quantity < 1 || quantity > maxQuantity}
            aria-label={`Add ${quantity} ${productName} to cart`}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Adding to Cart...
              </>
            ) : (
              <>
                <span className="cart-icon">🛒</span>
                Add {quantity > 1 ? `${quantity} items` : "to Cart"}
              </>
            )}
          </button>
        </>
      )}

      {/* Out of Stock Message */}
      {isOutOfStock && (
        <button className="btn btn-disabled" disabled>
          Out of Stock
        </button>
      )}

      {/* Information */}
      <div className="cart-info">
        <p className="info-text">
          Maximum {maxQuantity} {maxQuantity === 1 ? "item" : "items"} per order
        </p>
      </div>
    </div>
  );
};

export default AddToCartWidget;
