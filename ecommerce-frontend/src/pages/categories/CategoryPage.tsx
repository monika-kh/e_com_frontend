import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { CategoryService } from "../../services/category";
import CategoryGrid, { Category } from "../../components/categories/CategoryGrid";
import ProductListingWrapper from "../../components/products/ProductListingWrapper";
import Header from "../../components/layout/Header";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      const res = await CategoryService.getAll();

      // 1. Find parent category by slug
      const parent = res.data.find(
        (cat) => cat.slug === slug && cat.parent === cat.id
      );

      if (!parent) {
        setLoading(false);
        return;
      }

      setParentCategory(parent);

      // 2. Find child categories
      const children = res.data.filter(
        (cat) => cat.parent === parent.id && cat.id !== parent.id
      );

      setChildCategories(children);
      setLoading(false);
    };

    loadCategories();
  }, [slug]);

  if (loading) return <p>Loading...</p>;

  // If no child categories, show products for the parent category
  if (childCategories.length === 0 && parentCategory) {
    return (
      <>
        <Header />
        <ProductListingWrapper
          categoryName={parentCategory.name}
          title={parentCategory.name}
          subtitle={`Showing all products in ${parentCategory.name}`}
        />
      </>
    );
  }

  // If child categories exist, show them
  return (
    <>
      <Header />

      <main className="bg-soft" style={{ padding: "2rem" }}>
        <h2>{parentCategory?.name}</h2>

        <CategoryGrid
          categories={childCategories}
          onClick={(cat) => {
            // navigate to product list filtered by category name
            navigate(`/products?categoryName=${encodeURIComponent(cat.name)}`);
          }}
        />
      </main>
    </>
  );
};

export default CategoryPage;
