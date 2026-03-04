import React from "react";
import { Product } from "../../types/product";
import ProductCard from "../../components/products/ProductCard";
import "../../styles/products.css";

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <div className="product-grid__empty">
        <p>No products found.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
