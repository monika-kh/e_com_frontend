import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

export interface Order {
  id: number;
  user_id: number;
  total_price: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  payment_status: "pending" | "completed" | "failed";
  shipping_address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: {
    name: string;
    slug: string;
  };
}

export interface CreateOrderPayload {
  shipping_address: string;
  billing_address?: string;
  notes?: string;
  coupon_code?: string;
}

export interface OrderResponse {
  order: Order;
  items: OrderItem[];
}

const orderAPI = axios.create({
  baseURL: `${API_BASE}/orders`,
  withCredentials: true,
});

/**
 * Get authentication token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
};

/**
 * Add authorization header to requests
 */
orderAPI.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Handle authentication errors
 */
orderAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.error("Unauthorized: Token may be expired");
      // Clear stored tokens
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
      // Optionally redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

class OrderService {
  /**
   * Create a new order from cart
   * @requires authentication
   */
  async createOrder(payload: CreateOrderPayload): Promise<OrderResponse> {
    try {
      const response = await orderAPI.post<OrderResponse>("/create/", {
        shipping_address: payload.shipping_address,
        billing_address: payload.billing_address,
        notes: payload.notes,
        coupon_code: payload.coupon_code,
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
  async getOrders(page: number = 1, limit: number = 10): Promise<{
    results: Order[];
    count: number;
    next: string | null;
    previous: string | null;
  }> {
    try {
      const response = await orderAPI.get("/", {
        params: { page, limit },
      });
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
  async getOrderById(orderId: number): Promise<OrderResponse> {
    try {
      const response = await orderAPI.get<OrderResponse>(`/${orderId}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  }

  /**
   * Get order items for a specific order
   * @requires authentication
   */
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    try {
      const response = await orderAPI.get<OrderItem[]>(`/${orderId}/items/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order items:", error);
      throw error;
    }
  }

  /**
   * Cancel an order (only if status is pending)
   * @requires authentication
   */
  async cancelOrder(orderId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await orderAPI.post<{ success: boolean; message: string }>(
        `/${orderId}/cancel/`
      );
      return response.data;
    } catch (error) {
      console.error("Error cancelling order:", error);
      throw error;
    }
  }

  /**
   * Track order status
   * @requires authentication
   */
  async trackOrder(orderId: number): Promise<{
    orderId: number;
    status: string;
    lastUpdate: string;
    estimatedDelivery?: string;
  }> {
    try {
      const response = await orderAPI.get(`/${orderId}/track/`);
      return response.data;
    } catch (error) {
      console.error("Error tracking order:", error);
      throw error;
    }
  }

  /**
   * Update order status (Admin only)
   * @requires authentication + admin role
   */
  async updateOrderStatus(
    orderId: number,
    status: Order["status"]
  ): Promise<{ success: boolean }> {
    try {
      const response = await orderAPI.patch(`/${orderId}/update-status/`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }
}

export default new OrderService();
