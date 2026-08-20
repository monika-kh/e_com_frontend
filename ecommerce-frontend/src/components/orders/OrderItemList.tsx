import React from "react";

interface OrderItem {
  product_name?: string;
  quantity: number;
  price: number;
}

interface OrderItemListProps {
  items: OrderItem[];
  totalAmount: number;
}

const OrderItemList: React.FC<OrderItemListProps> = ({ items, totalAmount }) => {
  return (
    <ul className="order-items-list">
      {items.map((item, idx) => (
        <li key={idx} className="order-item-line">
          <span>
            {item.product_name || "Product"} × {item.quantity}
          </span>
          <span>₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}</span>
        </li>
      ))}
      <li className="order-item-line" style={{ marginTop: "0.5rem", fontWeight: 700 }}>
        <span>Total</span>
        <span>₹{Number(totalAmount).toLocaleString("en-IN")}</span>
      </li>
    </ul>
  );
};

export default OrderItemList;

