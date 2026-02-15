import React from "react";
import "../../styles/categories.css";
import CategoryCard from "../categories/CategoryCard";


export interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
  image: string | null;
}

interface Props {
  categories: Category[];
  onClick?: (category: Category) => void;
}

const CategoryGrid: React.FC<Props> = ({ categories, onClick }) => {

return (
    // <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1.5rem" }}>

      <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)", // 👈 3 cards per row
        gap: "1.5rem",
        marginTop: "1.5rem",
        
      }}
    >
      {categories.map((cat: any) => (
        <CategoryCard key={cat.id} category={cat} onClick={onClick} />
      ))}
    </div>
  );
};


export default CategoryGrid;
