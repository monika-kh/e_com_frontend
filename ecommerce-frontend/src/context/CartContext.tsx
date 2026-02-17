import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import cartService from "../services/cartService";

export interface CartItemState {
  productId: number;
  quantity: number;
  price?: number;
}

interface CartContextType {
  items: CartItemState[];
  totalCount: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateCartItem: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  resetError: () => void;
  
  // Helper: Get current quantity of a product in cart
  getProductQuantity: (productId: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItemState[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  /**
   * Fetch cart from backend on mount and when needed
   */
  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const cartItems = await cartService.getCart();
      
      // Transform API response to local state
      const transformedItems: CartItemState[] = cartItems.map((item: any) => ({
        productId: item.product_id || item.productId,
        quantity: item.quantity,
        price: item.price,
      }));
      
      setItems(transformedItems);
    } catch (err: any) {
      console.error("Failed to fetch cart:", err);
      // Only set error if not a 401 (auth interceptor handles redirects)
      if (err.response?.status !== 401) {
        setError(err.message || "Failed to fetch cart");
      }
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch cart on component mount - only if user is authenticated
   */
  useEffect(() => {
    // Check if user has authentication token
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    
    // Only fetch cart if user is authenticated
    if (token) {
      fetchCart();
    } else {
      // User not authenticated, clear cart state
      setItems([]);
      setError(null);
    }
  }, [fetchCart]);

  /**
   * Add product to cart - handles both new additions and quantity increments
   * Smart logic:
   * - If product already in cart → increment quantity
   * - If product NOT in cart → add with quantity 1
   * - Prevents duplicate entries
   */
  const addToCart = useCallback(
    async (productId: number, quantity: number = 1) => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if user is authenticated
        const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
        if (!token) {
          setError("Please login to add products to cart");
          setIsLoading(false);
          return;
        }
        
        // Find if product already exists in cart
        const existingItem = items.find((item) => item.productId === productId);
        const newQuantity = (existingItem?.quantity || 0) + quantity;

        // Cap at max quantity (5)
        if (newQuantity > 5) {
          setError("Maximum quantity is 5 per product");
          return;
        }

        // If product exists, update; if not, add
        if (existingItem) {
          // Product already in cart → use update endpoint
          const response = await cartService.updateCart(productId, newQuantity);
          
          setItems((prev) =>
            prev.map((item) =>
              item.productId === productId
                ? { 
                    productId,
                    quantity: response.quantity, 
                    price: response.price 
                  }
                : item
            )
          );
        } else {
          // Product NOT in cart → use add endpoint
          const response = await cartService.addToCart(productId, quantity);
          
          setItems((prev) => [
            ...prev,
            {
              productId,
              quantity: response.quantity,
              price: response.price,
            },
          ]);
        }
      } catch (err: any) {
        console.error("Failed to add to cart:", err);
        setError(err.message || "Failed to add to cart");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [items]
  );

  /**
   * Update cart item quantity - direct quantity set
   * Handles:
   * - Incrementing quantity
   * - Decrementing quantity
   * - If quantity = 0 → remove from cart
   */
  const updateCartItem = useCallback(
    async (productId: number, newQuantity: number) => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if user is authenticated
        const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
        if (!token) {
          setError("Please login to modify cart");
          setIsLoading(false);
          return;
        }

        // Validate quantity
        if (newQuantity < 0) {
          setError("Quantity cannot be negative");
          return;
        }

        if (newQuantity > 5) {
          setError("Maximum quantity is 5 per product");
          return;
        }

        // If quantity becomes 0, remove from cart
        if (newQuantity === 0) {
          await removeFromCart(productId);
          return;
        }

        // Update quantity via API
        const response = await cartService.updateCart(productId, newQuantity);
        
        // Update local state
        setItems((prev) =>
          prev.map((item) =>
            item.productId === productId
              ? { 
                  productId,
                  quantity: response.quantity, 
                  price: response.price 
                }
              : item
          )
        );
      } catch (err: any) {
        console.error("Failed to update cart:", err);
        setError(err.message || "Failed to update cart");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Remove product from cart
   */
  const removeFromCart = useCallback(
    async (productId: number) => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if user is authenticated
        const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
        if (!token) {
          setError("Please login to modify cart");
          setIsLoading(false);
          return;
        }

        await cartService.removeFromCart(productId);
        
        setItems((prev) => prev.filter((item) => item.productId !== productId));
      } catch (err: any) {
        console.error("Failed to remove from cart:", err);
        setError(err.message || "Failed to remove from cart");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await cartService.clearCart();
      setItems([]);
    } catch (err: any) {
      console.error("Failed to clear cart:", err);
      setError(err.message || "Failed to clear cart");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Helper: Get current quantity of a product in cart
   * Used to sync quantity display across components
   * Returns 0 if product not in cart
   */
  const getProductQuantity = useCallback(
    (productId: number) => {
      return items.find((item) => item.productId === productId)?.quantity || 0;
    },
    [items]
  );

  const value: CartContextType = {
    items,
    totalCount,
    totalPrice,
    isLoading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
    resetError,
    getProductQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/**
 * Hook to use cart context
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
