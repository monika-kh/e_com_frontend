import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import CategoryGrid, { Category } from "../../components/categories/CategoryGrid";
import { CategoryService } from "../../services/category";





const Home = () => {
  const navigate = useNavigate();
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [parentOptions, setParentOptions] = useState<Category[]>([]);
  const [selectedParent, setSelectedParent] = useState<number | "">("");
  const [childOptions, setChildOptions] = useState<Category[]>([]);
  const [selectedChild, setSelectedChild] = useState<number | "">("");

  useEffect(() => {
    const load = async () => {
      const res = await CategoryService.getAll();
      setAllCategories(res.data);

      // parent categories: where parent === id or parent === null
      const parents = res.data.filter((c: any) => c.parent === null || c.parent === c.id);
      setParentOptions(parents);
    };

    load();
  }, []);

  useEffect(() => {
    if (!selectedParent) {
      setChildOptions([]);
      setSelectedChild("");
      return;
    }

    const children = allCategories.filter((c) => c.parent === Number(selectedParent) && c.id !== Number(selectedParent));
    setChildOptions(children);
  }, [selectedParent, allCategories]);

  const handleGoToProducts = () => {
    // If child is selected, use child category name
    if (selectedChild) {
      const child = allCategories.find((c) => c.id === selectedChild);
      if (!child) return;
      navigate(`/products?categoryName=${encodeURIComponent(child.name)}`);
    }
    // If no child but parent is selected, check if parent has no children
    // In that case, use parent category name
    else if (selectedParent && childOptions.length === 0) {
      const parent = allCategories.find((c) => c.id === selectedParent);
      if (!parent) return;
      navigate(`/products?categoryName=${encodeURIComponent(parent.name)}`);
    }
  };

  // Check if selected parent has children
  const parentHasChildren = selectedParent && childOptions.length > 0;
  // Button should be enabled if: child is selected OR parent has no children
  const isButtonEnabled = selectedChild || (selectedParent && childOptions.length === 0);

  return (
    <>
      <Header />

      <main className="bg-soft" style={{ padding: "2rem" }}>
        <h2>Shop by Category</h2>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: "1rem" }}>
          <select value={selectedParent} onChange={(e) => setSelectedParent(e.target.value ? Number(e.target.value) : "")}>
            <option value="">Select Parent Category</option>
            {parentOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {parentHasChildren && (
            <select value={selectedChild} onChange={(e) => setSelectedChild(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Select Child Category</option>
              {childOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          {!parentHasChildren && selectedParent && (
            <p style={{ margin: 0, color: "#666" }}>This category has no sub-categories. Click below to view products.</p>
          )}

          <button 
            className="btn btn-primary" 
            disabled={!isButtonEnabled} 
            onClick={handleGoToProducts}
          >
            View Products
          </button>
        </div>

        {/* show top-level visuals */}
        <section style={{ marginTop: "2rem" }}>
          <CategoryGrid categories={parentOptions} />
        </section>
      </main>
    </>
  );
};

export default Home;
