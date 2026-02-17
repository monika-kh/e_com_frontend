import api from "./api";
import { Product } from "../types/product";

export const fetchProducts = async (categoryIds: number[]) => {
  const params =
    categoryIds.length > 0
      ? { category: categoryIds.join(",") }
      : {};

  const response = await api.get("/products/products/", { params });
  console.log("Fetched products:", response.data);
  return response.data;
};

export const ProductService = {
  /**
   * Get products by category
   */
  getByCategory: (categoryId: number) =>
    api.get(`/products/products/?category=${categoryId}`),

  /**
   * Get product details by slug
   */
  getDetails: (slug: string) =>
    api.get(`/products/products/${slug}/`),

  /**
   * Get product by slug with full details
   */
  getProductBySlug: async (slug: string): Promise<Product> => {
    const response = await api.get(`/products/products/${slug}/`);
    return response.data;
  },

  /**
   * Get product by ID
   */
  getProductById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/products/${id}/`);
    return response.data;
  },

  /**
   * Get related products by category or filters
   */
  getRelatedProducts: async (
    category?: string,
    childCategory?: string,
    limit: number = 6
  ): Promise<Product[]> => {
    const params: Record<string, any> = { limit };
    if (category) params.category = category;
    if (childCategory) params.child_category = childCategory;

    const response = await api.get(`/products/related/`, { params });
    return response.data.results || response.data;
  },

  /**
   * Server-side filtering endpoint
   */
  filter: (params: Record<string, any>) => api.get(`/products/filter/`, { params }),
};
