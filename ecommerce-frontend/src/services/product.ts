import api from "./api";
import { Product } from "../types/product";
import { RatingSummary, ProductReview, PaginatedResponse } from "../types/review";

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
    api.get(`/products/${slug}/`),

  /**
   * Get product by slug with full details
   */
  getProductBySlug: async (slug: string): Promise<Product> => {
    try {
      const response = await api.get<Product>(`/products/${slug}/`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Product not found");
      }

      const message =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to fetch product";

      throw new Error(message);
    }
  },

  /**
   * Get related products by category (same category as current product)
   */
  getRelatedProducts: async (
    categorySlug: string,
    excludeSlug?: string,
    limit: number = 6
  ): Promise<Product[]> => {
    const params: Record<string, any> = { limit, category: categorySlug };
    if (excludeSlug) params.exclude_slug = excludeSlug;

    const response = await api.get(`/products/related/`, { params });
    return response.data.results || response.data;
  },

  /**
   * Server-side filtering endpoint
   */
  filter: (params: Record<string, any>) => api.get(`/products/filter/`, { params }),

  /**
   * Rating APIs
   */
  getRatingSummary: async (slug: string): Promise<RatingSummary> => {
    const response = await api.get<RatingSummary>(`/reviews/${slug}/rating/`);
    return response.data;
  },

  setRating: async (slug: string, rating: number): Promise<RatingSummary> => {
    const response = await api.post(`/reviews/${slug}/rating/`, { rating });
    return {
      average_rating: response.data.average_rating,
      total_ratings: response.data.total_ratings,
      user_rating: response.data.rating ?? null,
    };
  },

  /**
   * Review APIs
   */
  getReviews: async (
    slug: string,
    page: number = 1
  ): Promise<PaginatedResponse<ProductReview>> => {
    const response = await api.get<PaginatedResponse<ProductReview>>(
      `/reviews/${slug}/reviews/`,
      { params: { page } }
    );
    return response.data;
  },

  createOrUpdateReview: async (
    slug: string,
    payload: { rating: number; comment: string }
  ): Promise<ProductReview> => {
    const response = await api.post<ProductReview>(`/reviews/${slug}/reviews/`, payload);
    return response.data;
  },

  updateReview: async (
    slug: string,
    reviewId: number,
    payload: { rating: number; comment: string }
  ): Promise<ProductReview> => {
    const response = await api.put<ProductReview>(
      `/reviews/${slug}/reviews/${reviewId}/`,
      payload
    );
    return response.data;
  },

  deleteReview: async (slug: string, reviewId: number): Promise<void> => {
    await api.delete(`/reviews/${slug}/reviews/${reviewId}/`);
  },
};
