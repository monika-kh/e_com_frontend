import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import OrderService, { Order } from "../../services/orderService";
import OrderCard from "../../components/orders/OrderCard";
import "../../styles/orders.css";

const OrdersListPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const list = await OrderService.getOrders();
        setOrders(list);
      } catch (e: any) {
        setError(e?.message || "Failed to load orders.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <Header />
      <main className="orders-page">
        <div className="orders-container">
          <h2>My Orders</h2>
          <p style={{ color: "var(--text-muted-light)" }}>
            View all your past orders and their status.
          </p>

          {isLoading ? (
            <div className="orders-loading">Loading orders...</div>
          ) : error ? (
            <div className="address-error">{error}</div>
          ) : !orders.length ? (
            <div className="orders-empty">
              You have not placed any orders yet.
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((o) => (
                <OrderCard
                  key={o.order_id}
                  order={o}
                  onClick={() => navigate(`/orders/${o.order_id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default OrdersListPage;

