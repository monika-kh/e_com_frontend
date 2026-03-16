import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

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
    setPage(1);
    setTotalPages(1);
    setTotalCount(0);
    setProducts([]);
  }, [categoryName]);

  useEffect(() => {
    if (!categoryName) return;

    let cancelled = false;

    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const q: any = { category_name: categoryName, page: 1 };
        if (searchText) q.search = searchText;
        if (selectedGenders.length) q.target_gender = selectedGenders.join(",");
        if (selectedAvailability.length)
          q.available = selectedAvailability.join(",");
        if (selectedPriceRanges.length)
          q.price_ranges = selectedPriceRanges.join(",");
        q.sort = sortBy;

        const res = await ProductService.filter(q);
        if (cancelled) return;

        const data = res.data;
        const results = data.results ?? data;

        setProducts(results);
        setPage(data.current_page ?? 1);
        setTotalPages(data.total_pages ?? 1);
        setTotalCount(data.count ?? results.length);
      } catch (e: any) {
        if (cancelled) return;
        setProducts([]);
        setTotalPages(1);
        setTotalCount(0);
        setError(e?.message || "Failed to load products.");
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

  // Infinite scrolling: load the next page when the sentinel becomes visible
  useEffect(() => {
    if (!loadMoreRef.current) return;
    if (!categoryName) return;

    const element = loadMoreRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          !isLoading &&
          !isLoadingMore &&
          page < totalPages
        ) {
          const nextPage = page + 1;
          setIsLoadingMore(true);

          const loadMore = async () => {
            try {
              const q: any = { category_name: categoryName, page: nextPage };
              if (searchText) q.search = searchText;
              if (selectedGenders.length)
                q.target_gender = selectedGenders.join(",");
              if (selectedAvailability.length)
                q.available = selectedAvailability.join(",");
              if (selectedPriceRanges.length)
                q.price_ranges = selectedPriceRanges.join(",");
              q.sort = sortBy;

              const res = await ProductService.filter(q);
              const data = res.data;
              const results = data.results ?? data;

              setProducts((prev) => [...prev, ...results]);
              setPage(data.current_page ?? nextPage);
              setTotalPages(data.total_pages ?? totalPages);
              setTotalCount(data.count ?? totalCount);
            } catch (e: any) {
              setError(e?.message || "Failed to load more products.");
            } finally {
              setIsLoadingMore(false);
            }
          };

          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [
    categoryName,
    isLoading,
    isLoadingMore,
    page,
    totalPages,
    searchText,
    selectedGenders,
    selectedAvailability,
    selectedPriceRanges,
    sortBy,
    totalCount,
  ]);

  return (
    <main className="bg-soft" style={{ padding: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2>{title || `Products in "${categoryName}"`}</h2>
        {subtitle && <p style={{ color: "#666" }}>{subtitle}</p>}
        <p style={{ color: "#999" }}>
          {isLoading
            ? "Loading..."
            : `${totalCount} product${totalCount === 1 ? "" : "s"} found`}
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

      {error && !isLoading && products.length === 0 && (
        <div style={{ textAlign: "center", padding: "2rem", color: "#c0392b" }}>
          {error}
        </div>
      )}

      {!isLoading && products.length > 0 && (
        <>
          <ProductGrid products={products} />
          <div
            ref={loadMoreRef}
            style={{ height: "1px", width: "100%", marginTop: "1rem" }}
          />
          {isLoadingMore && (
            <div style={{ textAlign: "center", padding: "1rem", color: "#666" }}>
              Loading more products...
            </div>
          )}
          {page >= totalPages && !isLoadingMore && (
            <div style={{ textAlign: "center", padding: "1rem", color: "#999" }}>
              You have reached the end of the list.
            </div>
          )}
        </>
      )}

      {!isLoading && !error && products.length === 0 && (
        <ProductGrid products={[]} />
      )}
    </main>
  );
};

export default ProductListingWrapper;