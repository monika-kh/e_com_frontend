import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import { AddressService } from "../../services/addressService";
import { Address } from "../../types/address";
import { useCart } from "../../context/CartContext";
import OrderService from "../../services/orderService";
import "../../styles/address.css";
import "../../styles/orders.css";

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, isLoading: cartLoading } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);

  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const raw = localStorage.getItem("selected_address_id");
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const list = await AddressService.list();
        if (!mounted) return;
        setAddresses(list);

        if (list.length > 0) {
          const stillExists = selectedId && list.some((a) => a.id === selectedId);
          if (!stillExists) setSelectedId(list[0].id);
        }
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load addresses.");
        setAddresses([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (selectedId) localStorage.setItem("selected_address_id", String(selectedId));
  }, [selectedId]);

  const handlePlaceOrder = async () => {
    if (!selectedId) return;
    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setIsPlacing(true);
      setError(null);
      const res = await OrderService.createOrder(selectedId);
      navigate(`/orders/${res.order_id}?success=1`);
    } catch (e: any) {
      setError(e?.message || "Failed to place order.");
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <>
      <Header />
      <main className="address-page">
        <div className="address-container">
          <h2 className="address-title">Checkout</h2>
          <p className="address-subtitle">Review your cart and choose a delivery address.</p>

          <div className="order-detail-section">
            {/* Left: Cart summary */}
            <section className="order-detail-card">
              <h3>Cart Items</h3>
              {cartLoading && !items.length ? (
                <div className="orders-loading">Loading cart...</div>
              ) : !items.length ? (
                <div className="address-empty">
                  Your cart is empty.
                  <div style={{ marginTop: "0.75rem" }}>
                    <button className="btn btn-primary" onClick={() => navigate("/products")}>
                      Browse Products
                    </button>
                  </div>
                </div>
              ) : (
                <ul className="order-items-list">
                  {items.map((item) => (
                    <li key={item.productId} className="order-item-line">
                      <span>
                        {item.product_name || "Product"} × {item.quantity}
                      </span>
                      <span>
                        ₹{((item.price || 0) * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </li>
                  ))}
                  <li className="order-item-line" style={{ marginTop: "0.5rem", fontWeight: 700 }}>
                    <span>Total</span>
                    <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                  </li>
                </ul>
              )}
            </section>

            {/* Right: Address selection */}
            <section className="order-detail-card">
              <h3>Delivery Address</h3>

              {isLoading ? (
                <div className="address-loading">Loading addresses...</div>
              ) : error ? (
                <div className="address-error">{error}</div>
              ) : addresses.length === 0 ? (
                <div className="address-empty">
                  No saved addresses. Please add one in your profile.
                  <div style={{ marginTop: "1rem" }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate("/profile/addresses")}
                    >
                      Add Address
                    </button>
                  </div>
                </div>
              ) : (
                <div className="saved-list">
                  {addresses.map((a) => (
                    <label
                      key={a.id}
                      className="saved-item"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="saved-item-main">
                        <div className="saved-name">
                          <input
                            type="radio"
                            name="selectedAddress"
                            checked={selectedId === a.id}
                            onChange={() => setSelectedId(a.id)}
                            style={{ marginRight: 10 }}
                          />
                          {a.full_name}
                        </div>
                        <div className="saved-lines">
                          {a.address_line}
                          <br />
                          {a.city}, {a.state} — {a.pincode}
                          <br />
                          Phone: {a.phone}
                        </div>
                      </div>
                    </label>
                  ))}

                  <div className="address-actions" style={{ justifyContent: "space-between" }}>
                    <button className="btn btn-outline" onClick={() => navigate("/cart")}>
                      Back to Cart
                    </button>
                    <button
                      className="btn btn-primary"
                      disabled={!selectedId || !items.length || isPlacing}
                      onClick={handlePlaceOrder}
                    >
                      {isPlacing ? "Placing..." : "Place Order"}
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
};

export default CheckoutPage;

