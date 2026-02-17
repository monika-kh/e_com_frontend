import React from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "../../types/product";
import ProductCard from "./ProductCard";
import "../../styles/products.css";
import "../../styles/product-card.css";

interface ProductGridProps {
	products: Product[];
}

/**
 * ProductGrid Component
 * Renders a responsive grid of product cards with:
 * - Multiple product images with carousel
 * - In-stock/Out-of-stock badges
 * - Quantity selector with cart API integration
 * - Accessible navigation
 */
const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
	const navigate = useNavigate();

	if (!products || products.length === 0) {
		return (
			<div className="no-products">
				<div style={{ textAlign: "center", padding: "3rem 1rem" }}>
					<h3 style={{ marginBottom: "1rem", color: "#333" }}>
						No products found
					</h3>
					<p style={{ color: "#666", marginBottom: "1.5rem" }}>
						Try adjusting your filters or search criteria to find what you're looking for.
					</p>
					<button
						className="btn btn-primary"
						onClick={() => navigate("/home")}
						style={{ padding: "0.75rem 1.5rem", fontSize: "1rem" }}
					>
						Browse Categories
					</button>
				</div>
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