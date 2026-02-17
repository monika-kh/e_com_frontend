import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import ProductGrid from "../../components/products/ProductGrid";
import { ProductService } from "../../services/product";

const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const categoryName = params.get("categoryName") ?? null;

  const [products, setProducts] = useState<any[]>([]);

  // Filters
  const genderOptions = ["Men", "Women", "Unisex"];
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);

  const priceOptions = [
    { id: 1, label: "Under ₹500", min: 0, max: 499 },
    { id: 2, label: "₹500 - ₹999", min: 500, max: 999 },
    { id: 3, label: "₹1000 - ₹4999", min: 1000, max: 4999 },
    { id: 4, label: "₹5000+", min: 5000, max: Infinity },
  ];
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<number[]>([]);

  const availabilityOptions = [
    { id: 1, label: "Active" },
    { id: 0, label: "Inactive" },
  ];
  const [selectedAvailability, setSelectedAvailability] = useState<number[]>([]);

  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<string>("price-asc");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    if (!categoryName) {
      setProducts([]);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const q: Record<string, any> = { category_name: categoryName };

        if (searchText.trim()) q.search = searchText.trim();
        if (selectedGenders.length) q.target_gender = selectedGenders.join(",");
        if (selectedAvailability.length) q.available = selectedAvailability.join(",");
        if (selectedPriceRanges.length) q.price_ranges = selectedPriceRanges.join(",");
        if (sortBy) q.sort = sortBy;

        const res = await ProductService.filter(q);
        if (cancelled) return;
        setProducts(res.data.results ?? res.data);
      } catch (err) {
        console.error("Failed to load products", err);
      }
    };

    const timer = setTimeout(load, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [categoryName, searchText, selectedGenders, selectedAvailability, selectedPriceRanges, sortBy]);

  if (!categoryName) {
    return (
      <>
        <Header />
        <main className="bg-soft" style={{ padding: "2rem" }}>
          <h2>Products</h2>
          <p>Please select a category first from the Shop by Category page.</p>
          <button className="btn btn-primary" onClick={() => navigate("/")}>Go to Categories</button>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="bg-soft" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flex: 1 }}>
            <span style={{ opacity: 0.6 }}>🔍</span>
            <input
              placeholder={`Search products in "${categoryName}"`}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ padding: "0.5rem", minWidth: 240 }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="alpha-asc">Name: A → Z</option>
              <option value="alpha-desc">Name: Z → A</option>
            </select>

            <div style={{ position: "relative" }}>
              <button className="btn btn-outline" onClick={() => setFilterOpen((s) => !s)}>Filters ▾</button>

              {filterOpen && (
                <div className="filter-dropdown" style={{ position: "absolute", right: 0, top: "110%", zIndex: 40 }}>
                  <div className="card" style={{ padding: "1rem", minWidth: 320 }}>
                    <h4 style={{ marginTop: 0 }}>Filters</h4>

                    <div style={{ marginBottom: "0.5rem" }}>
                      <strong>Target Gender</strong>
                      {genderOptions.map((g) => (
                        <label key={g} className="filter-option">
                          <input
                            type="checkbox"
                            checked={selectedGenders.includes(g)}
                            onChange={() => setSelectedGenders((prev) => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])}
                          />
                          <span>{g}</span>
                        </label>
                      ))}
                    </div>

                    <div style={{ marginBottom: "0.5rem" }}>
                      <strong>Price</strong>
                      {priceOptions.map((p) => (
                        <label key={p.id} className="filter-option">
                          <input
                            type="checkbox"
                            checked={selectedPriceRanges.includes(p.id)}
                            onChange={() => setSelectedPriceRanges(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])}
                          />
                          <span>{p.label}</span>
                        </label>
                      ))}
                    </div>

                    <div>
                      <strong>Availability</strong>
                      {availabilityOptions.map((a) => (
                        <label key={a.id} className="filter-option">
                          <input
                            type="checkbox"
                            checked={selectedAvailability.includes(a.id)}
                            onChange={() => setSelectedAvailability(prev => prev.includes(a.id) ? prev.filter(x => x !== a.id) : [...prev, a.id])}
                          />
                          <span>{a.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <h3 style={{ marginBottom: "1rem" }}>Products in "{categoryName}"</h3>
        <ProductGrid products={products} />
      </main>
    </>
  );
};

export default ProductListPage;
