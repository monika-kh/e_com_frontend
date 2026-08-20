import api from "./api";
import { Product } from "../types/product";
import { RatingSummary, ProductReview, PaginatedResponse } from "../types/review";
import { formatImageUrl, formatImageUrls, getProductImages } from "./imageService";

/**
 * Extract image URLs from API response
 * Handles both formats: string URLs and objects with image property
 */
const extractImageUrls = (images: any[]): string[] => {
  if (!Array.isArray(images)) return [];
  
  return images
    .map((img) => {
      // Handle object format: { id: 22, image: "url" }
      if (typeof img === "object" && img !== null && img.image) {
        return img.image;
      }
      // Handle string format: "url"
      if (typeof img === "string") {
        return img;
      }
      return null;
    })
    .filter((url): url is string => Boolean(url));
};

/**
 * Format a single product's images for display
 * Ensures image URLs are properly formatted and absolute
 */
const formatProductImages = (product: any): Product => {
  // Extract image URLs from various possible formats
  const imagesArray = product.images ? extractImageUrls(product.images) : [];
  const formattedImages = formatImageUrls(imagesArray);
  
  // Use first image as fallback for single image field if not already set
  const singleImage = formatImageUrl(product.image) || (formattedImages[0] || null);
  
  // Format price - remove decimal part
  const formattedPrice = product.price !== undefined && product.price !== null 
    ? Math.floor(parseFloat(String(product.price)))
    : product.price;
  
  return {
    ...product,
    // Format single image URL
    image: singleImage,
    // Format array of image URLs
    images: formattedImages,
    // Format price - remove decimals
    price: formattedPrice,
  };
};

/**
 * Format array of products' images
 */
const formatProductsImages = (products: any[]): Product[] => {
  if (!Array.isArray(products)) return [];
  return products.map(formatProductImages);
};

export const fetchProducts = async (categoryIds: number[]) => {
  const params =
    categoryIds.length > 0
      ? { category: categoryIds.join(",") }
      : {};

  const response = await api.get("/products/products/", { params });
  console.log("Fetched products:", response.data);
  
  // Format images in the response
  const formattedData = {
    ...response.data,
    results: response.data.results 
      ? formatProductsImages(response.data.results)
      : formatProductsImages(response.data),
  };
  
  return formattedData;
};

export const ProductService = {
  /**
   * Get products by category
   */
  getByCategory: async (categoryId: number): Promise<Product[]> => {
    const response = await api.get(`/products/products/?category=${categoryId}`);
    const products = response.data.results || response.data;
    return formatProductsImages(products);
  },

  /**
   * Get product details by slug
   */
  getDetails: async (slug: string): Promise<Product> => {
    const response = await api.get(`/products/${slug}/`);
    return formatProductImages(response.data);
  },

  /**
   * Get product by slug with full details
   */
  getProductBySlug: async (slug: string): Promise<Product> => {
    try {
      const response = await api.get<Product>(`/products/${slug}/`);
      return formatProductImages(response.data);
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
    const products = response.data.results || response.data;
    return formatProductsImages(products);
  },

  /**
   * Server-side filtering endpoint
   */
  filter: async (params: Record<string, any>) => {
    const response = await api.get(`/products/filter/`, { params });
    
    if (!response.data) {
      return { data: { results: [], count: 0, current_page: 1, total_pages: 1 } };
    }
    
    // Format images in the response
    const formattedData = {
      ...response.data,
      results: response.data.results 
        ? formatProductsImages(response.data.results)
        : formatProductsImages(response.data),
    };
    
    // Return in the format expected by calling code
    return { data: formattedData };
  },

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
