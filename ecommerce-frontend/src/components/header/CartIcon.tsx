import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "../../styles/cart-icon.css";

const CartIcon: React.FC = () => {
  const navigate = useNavigate();
  const cart = useCart();

  const totalCount =
    (cart as any).totalCount ??
    (Array.isArray((cart as any).items)
      ? (cart as any).items.reduce((sum: number, item: any) => sum + (item.quantity ?? 1), 0)
      : 0);

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
    }
  }, [navigate]);

  return (
    <button
      className="cart-icon-button"
      onClick={handleCartClick}
      aria-label={`Shopping cart with ${totalCount} items`}
      title={`Cart (${totalCount})`}
    >
      <span className="cart-icon">🛒</span>
      {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
    </button>
  );
};

export default CartIcon;
