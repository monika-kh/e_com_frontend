import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import cartService from "../services/cartService";

export interface CartItemState {
  productId: number;
  quantity: number;
  price?: number;
  product_name?: string;
  product_slug?: string;
  product_stock?: number;
  product_images?: string[];
  subtotal?: number;
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
      const cartData = await cartService.getCart();
      
      // Handle both array response and new structured response
      let cartItems: any[] = [];
      if (Array.isArray(cartData)) {
        cartItems = cartData;
      } else if (cartData && typeof cartData === 'object' && 'items' in cartData) {
        cartItems = (cartData as any).items;
      }

      // Transform API response to local state
      const transformedItems: CartItemState[] = cartItems.map((item: any) => ({
        productId: item.product_id || item.productId,
        quantity: item.quantity,
        price: item.price,
        product_name: item.product_name,
        product_slug: item.product_slug,
        product_stock: item.product_stock,
        product_images: item.product_images || [],
        subtotal: item.subtotal,
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
   * Add product to cart - directly calls API
   * Handles both first-time add and quantity increment
   * @param productId - ID of product to add
   * @param quantity - Quantity to add (default 1)
   */
  // const addToCart = useCallback(
  //   async (productId: number, quantity: number = 1) => {
  //     try {
  //       setIsLoading(true);
  //       setError(null);
        
  //       console.log(`[CartContext] addToCart: Starting for product ${productId}, qty ${quantity}`);
        
  //       // Check if user is authenticated
  //       const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
  //       if (!token) {
  //         const errMsg = "Authentication required. Please login to add items to cart.";
  //         console.error("[CartContext] Auth error:", errMsg);
  //         setError(errMsg);
  //         setIsLoading(false);
  //         return;
  //       }
        
  //       // Validate inputs
  //       if (!productId || productId <= 0) {
  //         const errMsg = "Invalid product ID";
  //         console.error("[CartContext] Validation error:", errMsg);
  //         setError(errMsg);
  //         setIsLoading(false);
  //         return;
  //       }
        
  //       if (quantity < 1 || quantity > 5) {
  //         const errMsg = `Invalid quantity. Must be between 1 and 5, got ${quantity}`;
  //         console.error("[CartContext] Validation error:", errMsg);
  //         setError(errMsg);
  //         setIsLoading(false);
  //         return;
  //       }

  //       // OPTIMISTIC UPDATE: update UI immediately, then call API and reconcile
  //       let previousItems: CartItemState[] = [];
  //       setItems((prev) => {
  //         // capture previous state for potential rollback
  //         previousItems = prev;
  //         const existing = prev.find((it) => it.productId === productId);

  //         if (existing) {
  //           return prev.map((it) =>
  //             it.productId === productId ? { ...it, quantity: Math.min(5, it.quantity + quantity) } : it
  //           );
  //         }

  //         // Add a minimal optimistic item entry; other fields will be filled from server response
  //         return [
  //           ...prev,
  //           {
  //             productId,
  //             quantity,
  //             price: 0,
  //             product_name: "...",
  //             product_slug: undefined,
  //             product_stock: undefined,
  //             product_images: [],
  //             subtotal: 0,
  //           },
  //         ];
  //       });

  //       console.log(`[CartContext] addToCart: Performed optimistic state update`);

  //       // Call API to add product to cart
  //       console.log(`[CartContext] addToCart: Calling API for product ${productId}`);
  //       const response = await cartService.addToCart(productId, quantity);
  //       console.log(`[CartContext] addToCart: API response received`, response);

  //       // Validate response has required fields
  //       if (!response || typeof response !== 'object') {
  //         // rollback
  //         setItems(previousItems);
  //         throw new Error("Invalid response from server");
  //       }

  //       // Reconcile optimistic update with authoritative server response
  //       setItems((prev) => {
  //         const existingIndex = prev.findIndex((item) => item.productId === productId);
  //         const reconciled: CartItemState = {
  //           productId,
  //           quantity: response.quantity || Math.max(1, quantity),
  //           price: response.price || 0,
  //           product_name: response.product_name || "Unknown",
  //           product_slug: response.product_slug,
  //           product_stock: response.product_stock,
  //           product_images: response.product_images || [],
  //           subtotal: response.subtotal || 0,
  //         };

  //         if (existingIndex >= 0) {
  //           const updated = [...prev];
  //           updated[existingIndex] = reconciled;
  //           return updated;
  //         }
  //         return [...prev, reconciled];
  //       });

  //       console.log(`[CartContext] addToCart: Reconciled optimistic update with server response`);
  //     } catch (err: any) {
  //       const errorMsg = err?.message || err?.response?.data?.error || "Failed to add to cart";
  //       console.error("[CartContext] addToCart: Error", errorMsg, err);
  //       setError(errorMsg);
  //       throw err;
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   },
  //   []
  // );

  const addToCart = useCallback(
  async (productId: number, quantity: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!productId || productId <= 0) {
        throw new Error("Invalid product ID");
      }

      if (quantity < 1 || quantity > 5) {
        throw new Error("Quantity must be between 1 and 5");
      }

      // Optimistic update
      let previousItems: CartItemState[] = [];

      setItems((prev) => {
        previousItems = prev;
        const existing = prev.find((it) => it.productId === productId);

        if (existing) {
          return prev.map((it) =>
            it.productId === productId
              ? { ...it, quantity: Math.min(5, it.quantity + quantity) }
              : it
          );
        }

        return [
          ...prev,
          {
            productId,
            quantity,
            price: 0,
            product_name: "...",
            product_images: [],
          },
        ];
      });

      // API call (cookie automatically sent)
      const response = await cartService.addToCart(productId, quantity);

      if (!response || typeof response !== "object") {
        setItems(previousItems);
        throw new Error("Invalid server response");
      }

      // Reconcile with server
      setItems((prev) =>
        prev.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: response.quantity,
                price: response.price,
                product_name: response.product_name,
                subtotal: response.subtotal,
              }
            : item
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to add to cart");
      throw err;
    } finally {
      setIsLoading(false);
    }
  },
  []
);


  /**
   * Update cart item quantity - direct quantity set
   * Handles:
   * - Incrementing quantity
   * - Decrementing quantity
   * - If quantity = 0 → remove from cart
   * @param productId - ID of product to update
   * @param newQuantity - New quantity to set (0-5)
   */
  const updateCartItem = useCallback(
    async (productId: number, newQuantity: number) => {
      try {
        setIsLoading(true);
        setError(null);

        console.log(`[CartContext] updateCartItem: Starting for product ${productId}, new qty ${newQuantity}`);
        
        // Check if user is authenticated
        const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
        if (!token) {
          const errMsg = "Authentication required. Please login to modify cart.";
          console.error("[CartContext] Auth error:", errMsg);
          setError(errMsg);
          setIsLoading(false);
          return;
        }

        // Validate inputs
        if (!productId || productId <= 0) {
          const errMsg = "Invalid product ID";
          console.error("[CartContext] Validation error:", errMsg);
          setError(errMsg);
          setIsLoading(false);
          return;
        }

        // Validate quantity
        if (newQuantity < 0) {
          const errMsg = "Quantity cannot be negative";
          console.error("[CartContext] Validation error:", errMsg);
          setError(errMsg);
          setIsLoading(false);
          return;
        }

        if (newQuantity > 5) {
          const errMsg = `Maximum quantity is 5 per product, requested ${newQuantity}`;
          console.error("[CartContext] Validation error:", errMsg);
          setError(errMsg);
          setIsLoading(false);
          return;
        }

        // If quantity is 0, remove from cart instead
        if (newQuantity === 0) {
          console.log(`[CartContext] updateCartItem: Quantity is 0, removing from cart`);
          await removeFromCart(productId);
          return;
        }

        // Update quantity via API
        console.log(`[CartContext] updateCartItem: Calling API to update quantity`);
        const response = await cartService.updateCart(productId, newQuantity);
        console.log(`[CartContext] updateCartItem: API response received`, response);
        
        // Validate response
        if (!response || typeof response !== 'object') {
          throw new Error("Invalid response from server");
        }
        
        // Update local state
        setItems((prev) =>
          prev.map((item) =>
            item.productId === productId
              ? { 
                  ...item,
                  quantity: response.quantity || newQuantity,
                  price: response.price || item.price,
                  product_name: response.product_name || item.product_name,
                  product_slug: response.product_slug || item.product_slug,
                  product_stock: response.product_stock || item.product_stock,
                  product_images: response.product_images || item.product_images,
                  subtotal: response.subtotal || 0,
                }
              : item
          )
        );
        console.log(`[CartContext] updateCartItem: State updated successfully`);
      } catch (err: any) {
        const errorMsg = err?.message || err?.response?.data?.error || "Failed to update cart";
        console.error("[CartContext] updateCartItem: Error", errorMsg, err);
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Remove product from cart
   * @param productId - ID of product to remove
   */
  const removeFromCart = useCallback(
    async (productId: number) => {
      try {
        setIsLoading(true);
        setError(null);

        console.log(`[CartContext] removeFromCart: Starting for product ${productId}`);
        
        // Check if user is authenticated
        const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
        if (!token) {
          const errMsg = "Authentication required. Please login to modify cart.";
          console.error("[CartContext] Auth error:", errMsg);
          setError(errMsg);
          setIsLoading(false);
          return;
        }

        // Validate product ID
        if (!productId || productId <= 0) {
          const errMsg = "Invalid product ID";
          console.error("[CartContext] Validation error:", errMsg);
          setError(errMsg);
          setIsLoading(false);
          return;
        }

        console.log(`[CartContext] removeFromCart: Calling API to remove product`);
        const response = await cartService.removeFromCart(productId);
        console.log(`[CartContext] removeFromCart: API response received`, response);
        
        // Validate response
        if (!response || typeof response.success !== 'boolean') {
          throw new Error("Invalid response from server");
        }
        
        // Update local state - filter out the removed product
        setItems((prev) => {
          const filtered = prev.filter((item) => item.productId !== productId);
          console.log(`[CartContext] removeFromCart: Removed product ${productId}, items remaining: ${filtered.length}`);
          return filtered;
        });
        console.log(`[CartContext] removeFromCart: State updated successfully`);
      } catch (err: any) {
        const errorMsg = err?.message || err?.response?.data?.error || "Failed to remove from cart";
        console.error("[CartContext] removeFromCart: Error", errorMsg, err);
        setError(errorMsg);
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

      console.log("[CartContext] clearCart: Starting to clear entire cart");
      
      // Check if user is authenticated
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      if (!token) {
        const errMsg = "Authentication required. Please login to modify cart.";
        console.error("[CartContext] Auth error:", errMsg);
        setError(errMsg);
        setIsLoading(false);
        return;
      }

      console.log("[CartContext] clearCart: Calling API to clear cart");
      const response = await cartService.clearCart();
      console.log("[CartContext] clearCart: API response received", response);
      
      // Validate response
      if (!response || typeof response.success !== 'boolean') {
        throw new Error("Invalid response from server");
      }
      
      setItems([]);
      console.log("[CartContext] clearCart: Cart cleared successfully");
    } catch (err: any) {
      const errorMsg = err?.message || err?.response?.data?.error || "Failed to clear cart";
      console.error("[CartContext] clearCart: Error", errorMsg, err);
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    console.log("[CartContext] resetError: Clearing error state");
    setError(null);
  }, []);

  /**
   * Helper: Get current quantity of a product in cart
   * Used to sync quantity display across components
   * Returns 0 if product not in cart
   * @param productId - ID of product to get quantity for
   * @returns Current quantity in cart, or 0 if not in cart
   */
  const getProductQuantity = useCallback(
    (productId: number): number => {
      if (!productId || productId <= 0) {
        console.warn("[CartContext] getProductQuantity: Invalid product ID", productId);
        return 0;
      }
      const item = items.find((item) => item.productId === productId);
      const quantity = item?.quantity || 0;
      return Math.max(0, Math.min(5, quantity)); // Ensure quantity is between 0-5
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
