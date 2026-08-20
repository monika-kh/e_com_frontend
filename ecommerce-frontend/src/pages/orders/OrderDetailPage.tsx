import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/layout/Header";
import OrderService from "../../services/orderService";
import PaymentButton from "../../components/payments/PaymentButton";
import OrderItemList from "../../components/orders/OrderItemList";
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
                <span style={{ textTransform: "capitalize" }}>
                  (Delivery: {order.delivery_status || order.status})
                </span>
              </p>
              <p style={{ color: "var(--text-muted-light)", marginBottom: "1rem" }}>
                Placed on{" "}
                {order.created_at &&
                  new Date(order.created_at as any).toLocaleString("en-IN")}
              </p>

              <div className="order-detail-section">
                <section className="order-detail-card">
                  <h3>Items</h3>
                  <OrderItemList items={order.items || []} totalAmount={order.total_amount} />
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

              <div style={{ marginTop: "1rem" }}>
                <h3 style={{ marginBottom: "0.5rem" }}>Status</h3>
                <div style={{ color: "var(--text-muted-light)" }}>
                  Payment:{" "}
                  {order.payment_method === "cod"
                    ? "COD"
                    : order.payment_status === "success"
                      ? "paid"
                      : order.payment_status || "pending"}
                  {" "}• Delivery: {order.delivery_status || "pending"} • Qty:{" "}
                  {order.total_quantity ?? (order.items || []).reduce((s: number, i: any) => s + (i.quantity || 0), 0)}
                </div>
              </div>

              {(order.payment_method === "cod" ||
                (order.payment_status !== "success" && (order.delivery_status || order.status) !== "cancelled")) && (
                <div style={{ marginTop: "1rem" }}>
                  <h3 style={{ marginBottom: "0.5rem" }}>Payment</h3>
                  <PaymentButton
                    orderId={Number(order.order_id)}
                    amountInRupees={Number(order.total_amount)}
                    onPaid={async () => {
                      const data = await OrderService.getOrderById(Number(orderId));
                      setOrder(data);
                    }}
                  />
                </div>
              )}
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

