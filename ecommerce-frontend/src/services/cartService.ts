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
   * @param productId - ID of the product to add
   * @param quantity - Quantity to add (1-5)
   * @requires authentication
   * @throws Error if product not found, out of stock, or invalid quantity
   */
  async addToCart(productId: number, quantity: number): Promise<CartResponse> {
    try {
      // Input validation
      if (!productId || productId <= 0) {
        throw new Error("Invalid product ID");
      }
      if (quantity < 1 || quantity > 5) {
        throw new Error("Quantity must be between 1 and 5");
      }

      console.log(`[CartService] addToCart: Adding product ${productId} with quantity ${quantity}`);
      
      const response = await api.post<CartResponse>("/cart/add-to-cart/", {
        product_id: productId,
        quantity,
      });

      // Validate response format
      if (!response.data || typeof response.data !== 'object') {
        throw new Error("Invalid response format from server");
      }

      console.log(`[CartService] addToCart: Success`, response.data);
      return response.data;
    } catch (error: any) {
      console.error("[CartService] Error adding to cart:", error);
      throw new Error(error?.response?.data?.error || error?.message || "Failed to add to cart");
    }
  }

  /**
   * Update cart item quantity
   * @param productId - ID of the product to update
   * @param quantity - New quantity (1-5, or 0 to remove)
   * @requires authentication
   * @throws Error if product not in cart or invalid quantity
   */
  async updateCart(productId: number, quantity: number): Promise<CartResponse> {
    try {
      // Input validation
      if (!productId || productId <= 0) {
        throw new Error("Invalid product ID");
      }
      if (quantity < 0 || quantity > 5) {
        throw new Error("Quantity must be between 0 and 5");
      }

      console.log(`[CartService] updateCart: Updating product ${productId} to quantity ${quantity}`);
      
      const response = await api.patch<CartResponse>("/cart/cart-update/", {
        product_id: productId,
        quantity,
      });

      // Validate response format
      if (!response.data || typeof response.data !== 'object') {
        throw new Error("Invalid response format from server");
      }

      console.log(`[CartService] updateCart: Success`, response.data);
      return response.data;
    } catch (error: any) {
      console.error("[CartService] Error updating cart:", error);
      throw new Error(error?.response?.data?.error || error?.message || "Failed to update cart");
    }
  }

  /**
   * Remove item from cart
   * @param productId - ID of the product to remove
   * @requires authentication
   * @throws Error if product not in cart
   */
  async removeFromCart(productId: number): Promise<{ success: boolean }> {
    try {
      // Input validation
      if (!productId || productId <= 0) {
        throw new Error("Invalid product ID");
      }

      console.log(`[CartService] removeFromCart: Removing product ${productId}`);
      
      const response = await api.delete<{ success: boolean }>("/cart/cart-remove/", {
        data: { product_id: productId },
      });

      // Validate response
      if (!response.data || typeof response.data.success !== 'boolean') {
        throw new Error("Invalid response format from server");
      }

      console.log(`[CartService] removeFromCart: Success`, response.data);
      return response.data;
    } catch (error: any) {
      console.error("[CartService] Error removing from cart:", error);
      throw new Error(error?.response?.data?.error || error?.message || "Failed to remove from cart");
    }
  }

  /**
   * Increment cart item by 1
   * Convenience method for clicking "+"
   * @requires authentication
   */
  async incrementCart(productId: number): Promise<CartResponse> {
    return this.addToCart(productId, 1);
  }

  /**
   * Decrement cart item (removes from cart)
   * Convenience method for clicking "-"
   * @requires authentication
   */
  async decrementCart(productId: number): Promise<{ success: boolean }> {
    return this.removeFromCart(productId);
  }

  /**
   * Get current cart contents
   * Returns either array of items or structured object with items + totals
   * @requires authentication
   * @throws Error if fetch fails
   */
  async getCart(): Promise<CartResponse[] | { items: CartResponse[]; total_items: number; total_price: number }> {
    try {
      console.log("[CartService] getCart: Fetching cart contents");
      
      const response = await api.get("/cart/cart-list");

      // Validate response
      if (!response.data) {
        throw new Error("Empty response from server");
      }

      console.log("[CartService] getCart: Success", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[CartService] Error fetching cart:", error);
      throw new Error(error?.response?.data?.error || error?.message || "Failed to fetch cart");
    }
  }

  /**
   * Clear entire cart
   * @requires authentication
   * @throws Error if clear fails
   */
  async clearCart(): Promise<{ success: boolean }> {
    try {
      console.log("[CartService] clearCart: Clearing entire cart");
      
      const response = await api.post<{ success: boolean }>("/cart/cart-clear/");

      // Validate response
      if (!response.data || typeof response.data.success !== 'boolean') {
        throw new Error("Invalid response format from server");
      }

      console.log("[CartService] clearCart: Success", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[CartService] Error clearing cart:", error);
      throw new Error(error?.response?.data?.error || error?.message || "Failed to clear cart");
    }
  }
}

export default new CartService();
