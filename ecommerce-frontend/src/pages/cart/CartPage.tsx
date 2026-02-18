import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import CartItemCard from "../../components/cart/CartItemCard";
import "../../styles/cart.css";
import "../../styles/products.css";

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, itemCount, totalCount, totalPrice, isLoading, error, resetError, fetchCart } =
    useCart();

  /**
   * Refresh cart after updates
   */
  const handleCartUpdate = useCallback(() => {
    fetchCart();
  }, [fetchCart]);

  if (isLoading && items.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-loading">Loading cart...</div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-empty">
          <h2>Your cart is empty</h2>
          <p>Start shopping to add items to your cart</p>
          <button className="btn btn-primary" onClick={() => navigate("/products")}>
            Continue Shopping
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-container">
        {/* Header */}
        <div className="cart-header">
          <h1>🛒 My Cart</h1>
          <p className="cart-item-count">
            {itemCount} {itemCount === 1 ? "item" : "items"} • {totalCount} {totalCount === 1 ? "piece" : "pieces"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="cart-error">
            <p>{error}</p>
            <button onClick={resetError} className="btn-close">
              ✕
            </button>
          </div>
        )}

        {/* Cart Items Grid */}
        <div className="cart-items-grid-container">
          <div className="product-grid">
            {items.map((item) => (
              <CartItemCard
                key={item.productId}
                item={item}
                onUpdate={handleCartUpdate}
              />
            ))}
          </div>
        </div>

        {/* Cart Summary */}
        <div className="cart-summary">
          <div className="summary-header">
            <h3>Price Details</h3>
          </div>
          <div className="summary-content">
            <div className="summary-row">
              <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"}):</span>
              <span>₹{totalPrice.toLocaleString("en-IN")}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Charges:</span>
              <span className="delivery-free">FREE</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row summary-total">
              <span>Total Amount:</span>
              <span>₹{totalPrice.toLocaleString("en-IN")}</span>
            </div>
            <div className="summary-savings">
              You will save ₹0 on this order
            </div>
          </div>

          <button
            className="btn btn-primary btn-checkout"
            disabled={isLoading || items.length === 0}
            onClick={() => navigate("/checkout")}
          >
            {isLoading ? (
              <>
                <span className="btn-spinner"></span>
                Processing...
              </>
            ) : (
              "Place Order"
            )}
          </button>

          <button
            className="btn btn-outline"
            onClick={() => navigate("/products")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </main>
  );
};

export default CartPage;
