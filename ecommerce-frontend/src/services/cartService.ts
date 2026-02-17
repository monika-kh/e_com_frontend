import api from "./api";
import { CartItem, CartResponse } from "../types/product";

/**
 * Cart Service - Uses shared API instance with proper authentication
 * The shared api instance handles:
 * - Cookie-based auth with withCredentials: true
 * - Token-based auth headers automatically
 * - 401 error handling and redirect to login
 */
class CartService {
  /**
   * Add a product to cart or update quantity if already exists
   * @requires authentication
   */
  async addToCart(productId: number, quantity: number): Promise<CartResponse> {
    try {
      const response = await api.post<CartResponse>("/cart/add-to-cart/", {
        product_id: productId,
        quantity,
      });
      return response.data;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  }

  /**
   * Update cart item quantity
   * @requires authentication
   */
  async updateCart(productId: number, quantity: number): Promise<CartResponse> {
    try {
      const response = await api.patch<CartResponse>("/cart/cart-update/", {
        product_id: productId,
        quantity,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating cart:", error);
      throw error;
    }
  }

  /**
   * Remove item from cart
   * @requires authentication
   */
  async removeFromCart(productId: number): Promise<{ success: boolean }> {
    try {
      const response = await api.delete<{ success: boolean }>("/cart/cart-remove/", {
        data: { product_id: productId },
      });
      return response.data;
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  }

  /**
   * Get current cart contents
   * @requires authentication
   */
  async getCart(): Promise<CartResponse[]> {
    try {
      const response = await api.get<CartResponse[]>("/cart/cart-list");
      return response.data;
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw error;
    }
  }

  /**
   * Clear entire cart
   * @requires authentication
   */
  async clearCart(): Promise<{ success: boolean }> {
    try {
      const response = await api.post<{ success: boolean }>("/cart/cart-clear/");
      return response.data;
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  }
}

export default new CartService();
