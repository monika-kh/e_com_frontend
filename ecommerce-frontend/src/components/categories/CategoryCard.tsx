import { useNavigate } from "react-router-dom";

interface Props {
  category: any;
  onClick?: (category: any) => void;
}

const CategoryCard: React.FC<Props> = ({ category, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) return onClick(category);
    navigate(`/category/${category.slug}`);
  };

  return (
    <div
      className="card"
      style={{ cursor: "pointer" }}
      onClick={handleClick}
    >
      <div className="card-body">
        <h3>{category.name}</h3>
      </div>
    </div>
  );
};

export default CategoryCard;
