import React from "react";
import { Order } from "../../services/orderService";

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const paymentText =
    order.payment_method === "cod"
      ? "COD"
      : order.payment_status === "success"
        ? "paid"
        : order.payment_status || "pending";

  return (
    <div className="orders-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="orders-left">
        <span className="orders-status">Order #{order.order_id}</span>
        <span style={{ color: "var(--text-muted-light)", fontSize: "0.9rem" }}>
          Qty: {order.total_quantity} • Payment: {paymentText} • Delivery:{" "}
          {(order.delivery_status || "pending").toString()}
        </span>
        <span style={{ color: "var(--text-muted-light)", fontSize: "0.9rem" }}>
          {order.created_at && new Date(order.created_at as any).toLocaleString("en-IN")}
        </span>
      </div>

      <div style={{ textAlign: "right" }}>
        <div className="orders-total">₹{Number(order.total_amount).toLocaleString("en-IN")}</div>
        <div style={{ fontSize: "0.9rem", textTransform: "capitalize" }}>
          {order.delivery_status}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;

