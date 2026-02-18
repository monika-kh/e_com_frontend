import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "../../styles/cart-icon.css";

const CartIcon: React.FC = () => {
  const navigate = useNavigate();
  const cart = useCart();
  const [showMiniCart, setShowMiniCart] = useState(false);

  const totalCount =
    (cart as any).totalCount ??
    (Array.isArray((cart as any).items)
      ? (cart as any).items.reduce((sum: number, item: any) => sum + (item.quantity ?? 1), 0)
      : 0);

  const totalPrice = (cart as any).totalPrice || 0;

  /**
   * Handle cart icon click
   * Check if user is authenticated before navigating
   */
  const handleCartClick = useCallback(() => {
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");

    if (!token) {
      // Not logged in - redirect to login
      navigate("/login");
    } else {
      // Logged in - go to cart
      navigate("/cart");
      setShowMiniCart(false);
    }
  }, [navigate]);

  /**
   * Handle mouse enter - show mini cart
   */
  const handleMouseEnter = useCallback(() => {
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (token && totalCount > 0) {
      setShowMiniCart(true);
    }
  }, [totalCount]);

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
        await (cart as any).removeFromCart(productId);
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
        aria-label={`Shopping cart with ${totalCount} items`}
        title={`Cart (${totalCount})`}
      >
        <span className="cart-icon">🛒</span>
        {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
      </button>

      {/* Mini Cart Dropdown */}
      {showMiniCart && totalCount > 0 && (
        <div className="mini-cart-dropdown">
          <div className="mini-cart-header">
            <h4>Shopping Cart</h4>
          </div>

          <div className="mini-cart-items">
            {(cart as any).items && (cart as any).items.length > 0 ? (
              (cart as any).items.slice(0, 3).map((item: any) => (
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

          {totalCount > 3 && (
            <div className="mini-cart-more">
              <p>+{totalCount - 3} more item{totalCount - 3 > 1 ? "s" : ""}</p>
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
