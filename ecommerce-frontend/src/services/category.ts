import api from "./api";
import { Category } from "../components/categories/CategoryGrid";

export const CategoryService = {
  // Fetch all categories
  getAll: () => api.get<Category[]>("/products/categories/"),

  // Fetch children by parent id
  getByParentId: (parentId: number) =>
    api.get<Category[]>(`/products/categories/?parent=${parentId}`),
};
