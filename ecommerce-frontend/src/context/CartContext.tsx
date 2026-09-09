import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import cartService from "../services/cartService";
import { DebouncedMap } from "../utils/debounce";

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
  totalCount: number; // Total quantity of all items
  itemCount: number; // Number of unique products
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
  isSyncing: boolean; // Whether there are pending debounced updates
  
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

// Debounce delay in milliseconds
const CART_UPDATE_DEBOUNCE_MS = 400;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItemState[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Reference to debounced update map - persists across renders
  const debouncedUpdateMapRef = useRef<DebouncedMap<number, number> | null>(null);

  // Initialize debounced update map
  useEffect(() => {
    if (!debouncedUpdateMapRef.current) {
      debouncedUpdateMapRef.current = new DebouncedMap(
        CART_UPDATE_DEBOUNCE_MS,
        async (productId: number, quantity: number) => {
          console.log(`[CartContext] Debounce triggered: Updating product ${productId} to quantity ${quantity}`);
          
          try {
            // If quantity is 0, remove from cart
            if (quantity === 0) {
              const response = await cartService.removeFromCart(productId);
              if (!response || typeof response.success !== 'boolean') {
                throw new Error("Invalid response from server");
              }
              
              setItems((prev) => prev.filter((item) => item.productId !== productId));
            } else {
              // Update quantity
              const response = await cartService.updateCart(productId, quantity);
              if (!response || typeof response !== 'object') {
                throw new Error("Invalid response from server");
              }
              
              setItems((prev) =>
                prev.map((item) =>
                  item.productId === productId
                    ? {
                        ...item,
                        quantity: response.quantity || quantity,
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
            }
          } catch (err: any) {
            console.error(`[CartContext] Failed to debounced update product ${productId}:`, err);
            // On error, sync cart with backend to recover state
            try {
              await fetchCart();
            } catch (syncErr) {
              console.error("[CartContext] Failed to sync cart after error:", syncErr);
              setError("Failed to sync cart. Please refresh the page.");
            }
          }
        }
      );
    }
  }, []);

  // Calculate totals
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0); // Total quantity
  const itemCount = items.length; // Number of unique products
  const totalPrice = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  /**
   * Fetch cart from backend on mount and when needed
   * This is the source of truth for cart state
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
      // Silently handle 401 errors - user is not authenticated, which is fine
      if (err.response?.status === 401) {
        console.log("[CartContext] User not authenticated, cart will be empty");
        setItems([]);
        setError(null);
      } else {
        console.error("Failed to fetch cart:", err);
        setError(err.message || "Failed to fetch cart");
        setItems([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch cart on component mount
   * Authentication is handled via HttpOnly cookies - API will return 401 if not authenticated
   */
  useEffect(() => {
    fetchCart().catch((err) => {
      if (err.response?.status === 401) {
        setItems([]);
        setError(null);
        setIsLoading(false);
      }
    });
  }, [fetchCart]);

  /**
   * Flush pending cart updates when user navigates away or component unmounts
   * This ensures data is synced with backend before page unload
   */
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (debouncedUpdateMapRef.current?.hasPending()) {
        console.log("[CartContext] Flushing pending updates before navigation");
        try {
          await debouncedUpdateMapRef.current.flushAll();
        } catch (err) {
          console.error("[CartContext] Error flushing updates on unload:", err);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  /**
   * Flush pending updates on component unmount
   */
  useEffect(() => {
    return () => {
      if (debouncedUpdateMapRef.current?.hasPending()) {
        console.log("[CartContext] Flushing pending updates on unmount");
        debouncedUpdateMapRef.current.flushAll().catch((err) => {
          console.error("[CartContext] Error flushing updates on unmount:", err);
        });
      }
    };
  }, []);

  /**
   * Monitor pending updates and update sync state
   */
  useEffect(() => {
    const updateSyncState = () => {
      const hasPending = debouncedUpdateMapRef.current?.hasPending() ?? false;
      setIsSyncing(hasPending);
    };

    const interval = setInterval(updateSyncState, 100);
    return () => clearInterval(interval);
  }, []);

  /**
   * Add product to cart
   * Handles both first-time add and quantity increment
   * @param productId - ID of product to add
   * @param quantity - Quantity to add (default 1)
   */
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
   * Update cart item quantity with DEBOUNCING
   * 
   * FLOW:
   * 1. Update UI immediately (optimistic update)
   * 2. Queue API call with 400ms debounce
   * 3. Multiple rapid clicks = single API call with final quantity
   * 4. If quantity = 0 → remove from cart
   * 
   * @param productId - ID of product to update
   * @param newQuantity - New quantity to set (0-5)
   */
  const updateCartItem = useCallback(
    async (productId: number, newQuantity: number) => {
      try {
        // Validate inputs
        if (!productId || productId <= 0) {
          throw new Error("Invalid product ID");
        }

        if (newQuantity < 0 || newQuantity > 5) {
          throw new Error(`Quantity must be between 0 and 5, got ${newQuantity}`);
        }

        console.log(
          `[CartContext] updateCartItem: Product ${productId} queued for update to quantity ${newQuantity}`
        );

        // STEP 1: Update UI immediately (optimistic update)
        setItems((prev) => {
          if (newQuantity === 0) {
            // Remove item from cart
            return prev.filter((item) => item.productId !== productId);
          } else {
            // Update quantity
            return prev.map((item) =>
              item.productId === productId
                ? { ...item, quantity: newQuantity }
                : item
            );
          }
        });

        // STEP 2: Queue debounced API call
        // Multiple rapid calls within 400ms will be coalesced into single API call
        await debouncedUpdateMapRef.current!.set(productId, newQuantity);
        
        console.log(
          `[CartContext] updateCartItem: API call queued (debounced) for product ${productId}`
        );
      } catch (err: any) {
        console.error("[CartContext] updateCartItem: Error", err);
        setError(err.message || "Failed to update cart");
        // Re-sync cart with backend on error
        try {
          await fetchCart();
        } catch (syncErr) {
          console.error("[CartContext] Failed to sync cart after error:", syncErr);
        }
        throw err;
      }
    },
    [fetchCart]
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

        if (!productId || productId <= 0) {
          throw new Error("Invalid product ID");
        }

        console.log(`[CartContext] removeFromCart: Calling API to remove product`);
        const response = await cartService.removeFromCart(productId);

        if (!response || typeof response.success !== 'boolean') {
          throw new Error("Invalid response from server");
        }

        // Update local state - filter out the removed product
        setItems((prev) => {
          const filtered = prev.filter((item) => item.productId !== productId);
          console.log(`[CartContext] removeFromCart: Removed product ${productId}, items remaining: ${filtered.length}`);
          return filtered;
        });
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
      
      // Flush any pending updates before clearing
      if (debouncedUpdateMapRef.current?.hasPending()) {
        console.log("[CartContext] clearCart: Flushing pending updates first");
        await debouncedUpdateMapRef.current.flushAll();
      }

      console.log("[CartContext] clearCart: Calling API to clear cart");
      const response = await cartService.clearCart();

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
    itemCount,
    totalPrice,
    isLoading,
    error,
    isSyncing,
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
