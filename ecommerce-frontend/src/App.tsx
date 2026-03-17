import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/layout/Home";
import CategoryPage from "./pages/categories/CategoryPage";
import ProductListPage from "./pages/products/ProductListPage";
import ProductDetailPage from "./pages/products/ProductDetailPage";
import CartPage from "./pages/cart/CartPage";
import ProfilePage from "./pages/profile/ProfilePage";
import AddressManagementPage from "./pages/profile/AddressManagementPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import OrdersListPage from "./pages/orders/OrdersListPage";
import OrderDetailPage from "./pages/orders/OrderDetailPage";

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          {/* DEFAULT ROUTE */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Auth Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersListPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/addresses" element={<AddressManagementPage />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
