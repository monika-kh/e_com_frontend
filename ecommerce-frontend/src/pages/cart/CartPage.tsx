import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { Product } from "../../types/product";
import { ProductService } from "../../services/product";
import "../../styles/cart.css";

interface CartProductItem extends Product {
  cartQuantity: number;
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, isLoading, error, updateCartItem, removeFromCart, resetError } =
    useCart();
  const [products, setProducts] = useState<CartProductItem[]>([]);
  const [loadingProductIds, setLoadingProductIds] = useState<Set<number>>(new Set());
  const [productsLoading, setProductsLoading] = useState(false);

  /**
   * Fetch product details for cart items
   */
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (items.length === 0) {
        setProducts([]);
        return;
      }

      try {
        setProductsLoading(true);
        const productIds = items.map((item) => item.productId);

        // Fetch product details (adjust API call based on your backend)
        const allProducts = await Promise.all(
          productIds.map((id) =>
            ProductService.getProductById(id).catch(() => null)
          )
        );

        const validProducts = allProducts
          .filter((p): p is Product => p !== null)
          .map((product) => {
            const cartItem = items.find((item) => item.productId === product.id);
            return {
              ...product,
              cartQuantity: cartItem?.quantity || 0,
            };
          });

        setProducts(validProducts);
      } catch (err) {
        console.error("Failed to fetch product details:", err);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProductDetails();
  }, [items]);

  /**
   * Handle quantity increase
   */
  const handleIncreaseQuantity = async (productId: number, currentQuantity: number) => {
    if (currentQuantity >= 5) return;

    try {
      setLoadingProductIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(productId);
        return newSet;
      });
      await updateCartItem(productId, currentQuantity + 1);
    } catch (err) {
      console.error("Failed to update quantity:", err);
    } finally {
      setLoadingProductIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  /**
   * Handle quantity decrease
   */
  const handleDecreaseQuantity = async (productId: number, currentQuantity: number) => {
    if (currentQuantity <= 1) {
      // If quantity is 1, remove instead of decreasing to 0
      await handleRemoveProduct(productId);
      return;
    }

    try {
      setLoadingProductIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(productId);
        return newSet;
      });
      await updateCartItem(productId, currentQuantity - 1);
    } catch (err) {
      console.error("Failed to update quantity:", err);
    } finally {
      setLoadingProductIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  /**
   * Handle remove product
   */
  const handleRemoveProduct = async (productId: number) => {
    try {
      setLoadingProductIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(productId);
        return newSet;
      });
      await removeFromCart(productId);
    } catch (err) {
      console.error("Failed to remove product:", err);
    } finally {
      setLoadingProductIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  /**
   * Handle navigate to product detail
   */
  const handleProductClick = (slug?: string) => {
    if (slug) {
      navigate(`/product/${slug}`);
    }
  };

  if (productsLoading) {
    return (
      <main className="cart-page">
        <div className="cart-loading">Loading cart...</div>
      </main>
    );
  }

  if (products.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-empty">
          <h2>Your cart is empty</h2>
          <p>Start shopping to add items to your cart</p>
          <button className="btn btn-primary" onClick={() => navigate("/products")}>
            Continue Shopping
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-container">
        {/* Header */}
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <p className="cart-item-count">{products.length} items</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="cart-error">
            <p>{error}</p>
            <button onClick={resetError} className="btn-close">
              ✕
            </button>
          </div>
        )}

        {/* Cart Items */}
        <div className="cart-items-container">
          <table className="cart-items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="cart-item">
                  <td
                    className="cart-item-product"
                    onClick={() => handleProductClick(product.slug)}
                  >
                    <div className="cart-item-image">
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <div className="placeholder">{product.name?.[0]}</div>
                      )}
                    </div>
                    <div className="cart-item-name">{product.name}</div>
                  </td>

                  <td className="cart-item-price">
                    {product.price ? `₹${product.price}` : "-"}
                  </td>

                  <td className="cart-item-quantity">
                    <div className="quantity-controls">
                      <button
                        className="qty-btn"
                        onClick={() =>
                          handleDecreaseQuantity(product.id, product.cartQuantity)
                        }
                        disabled={loadingProductIds.has(product.id) || isLoading}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="qty-value">{product.cartQuantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() =>
                          handleIncreaseQuantity(product.id, product.cartQuantity)
                        }
                        disabled={
                          product.cartQuantity >= 5 ||
                          loadingProductIds.has(product.id) ||
                          isLoading
                        }
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </td>

                  <td className="cart-item-total">
                    ₹{((product.price || 0) * product.cartQuantity).toLocaleString("en-IN")}
                  </td>

                  <td className="cart-item-remove">
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveProduct(product.id)}
                      disabled={loadingProductIds.has(product.id) || isLoading}
                      aria-label="Remove product"
                      title="Remove from cart"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cart Summary */}
        <div className="cart-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{totalPrice.toLocaleString("en-IN")}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total:</span>
            <span>₹{totalPrice.toLocaleString("en-IN")}</span>
          </div>

          <button
            className="btn btn-primary btn-checkout"
            disabled={isLoading}
            onClick={() => navigate("/checkout")}
          >
            {isLoading ? "Processing..." : "Proceed to Checkout"}
          </button>

          <button
            className="btn btn-outline"
            onClick={() => navigate("/products")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </main>
  );
};

export default CartPage;
