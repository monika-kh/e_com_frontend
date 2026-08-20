import api from "./api";

// Summary shape returned by GET /orders/order-list
export interface Order {
  order_id: number;
  payment_status: string;
  payment_method: string | null;
  delivery_status: string;
  total_amount: number;
  total_quantity: number;
  created_at: string;
}

class OrderService {
  async createOrder(addressId: number): Promise<{ order_id: number }> {
    try {
      const response = await api.post<{ order_id: number }>("/orders/create/", {
        address_id: addressId,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  /**
   * Get all orders for the current user
   * @requires authentication
   */
  async getOrders(): Promise<Order[]> {
    try {
      const response = await api.get<Order[]>("/orders/order-list");
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  }

  /**
   * Get order details by ID
   * @requires authentication
   */
  async getOrderById(orderId: number): Promise<any> {
    try {
      const response = await api.get<any>(`/orders/${orderId}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  }

}

export default new OrderService();
