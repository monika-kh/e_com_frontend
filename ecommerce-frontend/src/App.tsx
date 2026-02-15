import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/layout/Home";
import CategoryPage from "./pages/categories/CategoryPage";
import ProductListPage from "./pages/products/ProductListPage";
import ProductDetails from "./pages/products/ProductDetails";
import CartPage from "./pages/cart/CartPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* DEFAULT ROUTE */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth Routes - NO CartProvider (not needed) */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes - WITH CartProvider */}
        <Route
          path="/*"
          element={
            <CartProvider>
              <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/products" element={<ProductListPage />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<CartPage />} />
              </Routes>
            </CartProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
