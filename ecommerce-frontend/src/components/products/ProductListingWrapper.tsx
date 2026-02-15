import React, { useEffect, useMemo, useState } from "react";
import ProductGrid from "./ProductGrid";
import { ProductService } from "../../services/product";
import "../../styles/filters.css";

interface ProductListingWrapperProps {
  categoryName: string | null;
  title?: string;
  subtitle?: string;
}

const ProductListingWrapper: React.FC<ProductListingWrapperProps> = ({
  categoryName,
  title,
  subtitle,
}) => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const genderOptions = ["Men", "Women", "Unisex"];
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);

  const priceOptions = [
    { id: 1, label: "Under ₹500" },
    { id: 2, label: "₹500 - ₹999" },
    { id: 3, label: "₹1000 - ₹4999" },
    { id: 4, label: "₹5000+" },
  ];
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<number[]>([]);

  const availabilityOptions = [
    { id: 1, label: "Active" },
    { id: 0, label: "Inactive" },
  ];
  const [selectedAvailability, setSelectedAvailability] = useState<number[]>([]);

  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("price-asc");
  const [filterOpen, setFilterOpen] = useState(false);

  const activeFiltersCount = useMemo(
    () =>
      selectedGenders.length +
      selectedPriceRanges.length +
      selectedAvailability.length +
      (searchText.trim() ? 1 : 0),
    [selectedGenders, selectedPriceRanges, selectedAvailability, searchText]
  );

  useEffect(() => {
    setSelectedGenders([]);
    setSelectedPriceRanges([]);
    setSelectedAvailability([]);
    setSearchText("");
    setSortBy("price-asc");
    setFilterOpen(false);
  }, [categoryName]);

  useEffect(() => {
    if (!categoryName) return;

    let cancelled = false;

    const fetchProducts = async () => {
      try {
        setIsLoading(true);

        const q: any = { category_name: categoryName };
        if (searchText) q.search = searchText;
        if (selectedGenders.length) q.target_gender = selectedGenders.join(",");
        if (selectedAvailability.length)
          q.available = selectedAvailability.join(",");
        if (selectedPriceRanges.length)
          q.price_ranges = selectedPriceRanges.join(",");
        q.sort = sortBy;

        const res = await ProductService.filter(q);
        if (!cancelled) setProducts(res.data.results ?? res.data);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    const t = setTimeout(fetchProducts, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [
    categoryName,
    searchText,
    selectedGenders,
    selectedAvailability,
    selectedPriceRanges,
    sortBy,
  ]);

  return (
    <main className="bg-soft" style={{ padding: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2>{title || `Products in "${categoryName}"`}</h2>
        {subtitle && <p style={{ color: "#666" }}>{subtitle}</p>}
        <p style={{ color: "#999" }}>
          {isLoading ? "Loading..." : `${products.length} products found`}
        </p>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        {/* Search */}
        <div className="search-section">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={`Search in "${categoryName}"`}
          />
          {searchText && (
            <button
              className="clear-search"
              onClick={() => setSearchText("")}
            >
              ✕
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="controls-section">
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="alpha-asc">Name: A → Z</option>
            <option value="alpha-desc">Name: Z → A</option>
          </select>

          {/* FILTER WRAPPER (FIXED) */}
          <div className="filter-wrapper">
            <button
              className="filter-button"
              onClick={() => setFilterOpen((v) => !v)}
            >
              Filters
              {activeFiltersCount > 0 && (
                <span className="filter-badge">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {filterOpen && (
              <div className="filter-panel">
                <div className="filter-panel-header">
                  <h4>Filters</h4>
                  {activeFiltersCount > 0 && (
                    <button
                      className="clear-filters-btn"
                      onClick={() => {
                        setSelectedGenders([]);
                        setSelectedPriceRanges([]);
                        setSelectedAvailability([]);
                        setSearchText("");
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Gender */}
                <div className="filter-section">
                  <h5>Target Gender</h5>
                  {genderOptions.map((g) => (
                    <label key={g} className="filter-option">
                      <input
                        type="checkbox"
                        checked={selectedGenders.includes(g)}
                        onChange={() =>
                          setSelectedGenders((p) =>
                            p.includes(g)
                              ? p.filter((x) => x !== g)
                              : [...p, g]
                          )
                        }
                      />
                      <span>{g}</span>
                    </label>
                  ))}
                </div>

                {/* Price */}
                <div className="filter-section">
                  <h5>Price Range</h5>
                  {priceOptions.map((p) => (
                    <label key={p.id} className="filter-option">
                      <input
                        type="checkbox"
                        checked={selectedPriceRanges.includes(p.id)}
                        onChange={() =>
                          setSelectedPriceRanges((r) =>
                            r.includes(p.id)
                              ? r.filter((x) => x !== p.id)
                              : [...r, p.id]
                          )
                        }
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>

                {/* Availability */}
                <div className="filter-section">
                  <h5>Availability</h5>
                  {availabilityOptions.map((a) => (
                    <label key={a.id} className="filter-option">
                      <input
                        type="checkbox"
                        checked={selectedAvailability.includes(a.id)}
                        onChange={() =>
                          setSelectedAvailability((v) =>
                            v.includes(a.id)
                              ? v.filter((x) => x !== a.id)
                              : [...v, a.id]
                          )
                        }
                      />
                      <span>{a.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products */}
      {isLoading && (
        <div className="loading-container" style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ fontSize: "1.1rem", color: "#666" }}>Loading products...</p>
        </div>
      )}
      
      {!isLoading && products.length > 0 && (
        <ProductGrid products={products} />
      )}

      {!isLoading && products.length === 0 && (
        <ProductGrid products={[]} />
      )}
    </main>
  );
};

export default ProductListingWrapper;