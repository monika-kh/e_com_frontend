import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import ProductListingWrapper from "../../components/products/ProductListingWrapper";

const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const categoryName = params.get("categoryName") ?? null;

  if (!categoryName) {
    return (
      <>
        <Header />
        <main className="bg-soft" style={{ padding: "2rem" }}>
          <h2>Products</h2>
          <p>Please select a category first from the Shop by Category page.</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/home")}
          >
            Go to Categories
          </button>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <ProductListingWrapper
        categoryName={categoryName}
        title={`Products in "${categoryName}"`}
        subtitle={`Browse all products in ${categoryName}`}
      />
    </>
  );
};

export default ProductListPage;
