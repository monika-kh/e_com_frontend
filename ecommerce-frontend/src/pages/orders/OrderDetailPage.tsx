import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/layout/Header";
import OrderService from "../../services/orderService";
import "../../styles/orders.css";

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const showSuccess = new URLSearchParams(location.search).get("success") === "1";

  useEffect(() => {
    if (!orderId) return;
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await OrderService.getOrderById(Number(orderId));
        setOrder(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load order.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [orderId]);

  return (
    <>
      <Header />
      <main className="orders-page">
        <div className="orders-container">
          <h2>Order Details</h2>

          {showSuccess && (
            <div className="order-success">
              Your order was placed successfully! Thank you for shopping with us.
            </div>
          )}

          {isLoading ? (
            <div className="orders-loading">Loading order...</div>
          ) : error ? (
            <div className="address-error">{error}</div>
          ) : !order ? (
            <div className="orders-empty">Order not found.</div>
          ) : (
            <>
              <p style={{ marginTop: "1rem" }}>
                <strong>Order #{order.order_id}</strong>{" "}
                <span style={{ textTransform: "capitalize" }}>({order.status})</span>
              </p>
              <p style={{ color: "var(--text-muted-light)", marginBottom: "1rem" }}>
                Placed on{" "}
                {order.created_at &&
                  new Date(order.created_at as any).toLocaleString("en-IN")}
              </p>

              <div className="order-detail-section">
                <section className="order-detail-card">
                  <h3>Items</h3>
                  <ul className="order-items-list">
                    {order.items?.map((item: any, idx: number) => (
                      <li key={idx} className="order-item-line">
                        <span>
                          {item.product_name || "Product"} × {item.quantity}
                        </span>
                        <span>
                          ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </li>
                    ))}
                    <li className="order-item-line" style={{ marginTop: "0.5rem", fontWeight: 700 }}>
                      <span>Total</span>
                      <span>₹{Number(order.total_amount).toLocaleString("en-IN")}</span>
                    </li>
                  </ul>
                </section>

                <section className="order-detail-card">
                  <h3>Delivery Address</h3>
                  <div className="order-address">
                    {order.address?.snapshot ||
                      [
                        order.address?.full_name,
                        order.address?.address_line,
                        `${order.address?.city}, ${order.address?.state} - ${order.address?.pincode}`,
                        `Phone: ${order.address?.phone}`,
                      ]
                        .filter(Boolean)
                        .join("\n")}
                  </div>
                </section>
              </div>
            </>
          )}

          <div style={{ marginTop: "1.5rem" }}>
            <button className="btn btn-outline" onClick={() => navigate("/orders")}>
              Back to Orders
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default OrderDetailPage;

