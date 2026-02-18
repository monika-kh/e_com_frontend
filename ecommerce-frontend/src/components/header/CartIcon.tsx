import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "../../styles/cart-icon.css";

const CartIcon: React.FC = () => {
  const navigate = useNavigate();
  const cart = useCart();
  const [showMiniCart, setShowMiniCart] = useState(false);

  // Safely get cart values with fallbacks
  const itemCount = cart?.itemCount ?? 0; // Number of unique products (for badge)
  const totalCount = cart?.totalCount ?? 0; // Total quantity (for display in mini cart)
  const totalPrice = cart?.totalPrice ?? 0;
  const cartItems = cart?.items ?? [];

  /**
   * Handle cart icon click
   * Always navigate to cart page - authentication is handled via cookies
   */
  const handleCartClick = useCallback(() => {
    navigate("/cart");
    setShowMiniCart(false);
  }, [navigate]);

  /**
   * Handle mouse enter - show mini cart
   */
  const handleMouseEnter = useCallback(() => {
    // Show mini cart if there are items (authentication handled by API)
    if (itemCount > 0) {
      setShowMiniCart(true);
    }
  }, [itemCount]);

  /**
   * Handle mouse leave - hide mini cart
   */
  const handleMouseLeave = useCallback(() => {
    setShowMiniCart(false);
  }, []);

  /**
   * Handle remove item from mini cart (don't close the cart)
   */
  const handleRemoveItem = useCallback(
    async (productId: number) => {
      try {
        if (cart?.removeFromCart) {
          await cart.removeFromCart(productId);
        }
      } catch (err) {
        console.error("Failed to remove item:", err);
      }
    },
    [cart]
  );

  return (
    <div
      className="cart-icon-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="cart-icon-button"
        onClick={handleCartClick}
        aria-label={`Shopping cart with ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
        title={`Cart (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`}
      >
        <span className="cart-icon">🛒</span>
        {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
      </button>

      {/* Mini Cart Dropdown */}
      {showMiniCart && itemCount > 0 && (
        <div className="mini-cart-dropdown">
          <div className="mini-cart-header">
            <h4>Shopping Cart</h4>
          </div>

          <div className="mini-cart-items">
            {cartItems && cartItems.length > 0 ? (
              cartItems.slice(0, 3).map((item: any) => (
                <div key={item.productId} className="mini-cart-item">
                  <div className="mini-item-image">
                    {item.product_images && item.product_images.length > 0 ? (
                      <img
                        src={item.product_images[0]}
                        alt={item.product_name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "placeholder.jpg";
                        }}
                      />
                    ) : (
                      <div className="placeholder">{item.product_name?.[0]}</div>
                    )}
                  </div>

                  <div className="mini-item-details">
                    <p className="mini-item-name">{item.product_name}</p>
                    <div className="mini-item-meta">
                      <span className="mini-item-qty">Qty: {item.quantity}</span>
                      <span className="mini-item-price">₹{(item.price || 0).toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <button
                    className="mini-item-remove"
                    onClick={() => handleRemoveItem(item.productId)}
                    title="Remove from cart"
                    aria-label="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <p className="mini-cart-empty">Cart is empty</p>
            )}
          </div>

          {itemCount > 3 && (
            <div className="mini-cart-more">
              <p>+{itemCount - 3} more item{itemCount - 3 > 1 ? "s" : ""}</p>
            </div>
          )}

          <div className="mini-cart-footer">
            <div className="mini-cart-summary">
              <span>Subtotal:</span>
              <span className="price">₹{totalPrice.toLocaleString("en-IN")}</span>
            </div>

            <button
              className="btn btn-primary btn-view-cart"
              onClick={handleCartClick}
            >
              View Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartIcon;
