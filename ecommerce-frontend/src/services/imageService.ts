/**
 * Image Service - Utilities for handling product image URLs
 * Handles URL construction, validation, and formatting
 */

const DEFAULT_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f0f0f0' width='400' height='400'/%3E%3Ctext x='50%' y='50%' font-size='48' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

/**
 * Get API base URL for image requests
 * Handles both development and production environments
 */
export const getImageApiBase = (): string => {
  const apiBase = process.env.REACT_APP_API_BASE_URL || 
    `http://${window.location.hostname}:8000/api`;
  
  // Remove /api suffix if present
  return apiBase.replace(/\/api\/?$/, "");
};

/**
 * Check if a URL is absolute (starts with http:// or https://)
 */
export const isAbsoluteUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== "string") return false;
  return /^https?:\/\//.test(url);
};

/**
 * Format a single image URL
 * Converts relative URLs to absolute URLs if needed
 */
export const formatImageUrl = (imageUrl?: string | null): string | null => {
  // Ensure imageUrl is a string
  if (!imageUrl || typeof imageUrl !== "string") return null;
  
  // Trim whitespace
  const trimmedUrl = imageUrl.trim();
  if (!trimmedUrl) return null;
  
  // If already absolute, return as is
  if (isAbsoluteUrl(trimmedUrl)) {
    return trimmedUrl;
  }
  
  // For relative URLs, construct absolute URL
  const apiBase = getImageApiBase();
  
  // Remove leading slashes to avoid double slashes
  const cleanPath = trimmedUrl.startsWith("/") ? trimmedUrl : `/${trimmedUrl}`;
  
  return `${apiBase}${cleanPath}`;
};

/**
 * Format an array of image URLs
 * Filters out invalid URLs and returns formatted array
 */
export const formatImageUrls = (images?: string[] | null): string[] => {
  if (!images || !Array.isArray(images)) return [];
  
  return images
    .filter((img): img is string => Boolean(img)) // Filter out null/undefined
    .map(formatImageUrl)
    .filter((url): url is string => Boolean(url)); // Filter out null results
};

/**
 * Get product image URLs (multiple images with fallback to single image)
 * Returns formatted array of image URLs
 */
export const getProductImages = (
  images?: string[] | null,
  fallbackImage?: string | null
): string[] => {
  // Try to use multiple images array first
  if (images && Array.isArray(images) && images.length > 0) {
    return formatImageUrls(images);
  }
  
  // Fallback to single image
  if (fallbackImage) {
    const formatted = formatImageUrl(fallbackImage);
    return formatted ? [formatted] : [];
  }
  
  return [];
};

/**
 * Get a safe product image URL for display
 * Returns the first available image or a placeholder
 */
export const getProductImageUrl = (
  images?: string[] | null,
  fallbackImage?: string | null
): string => {
  const formattedImages = getProductImages(images, fallbackImage);
  return formattedImages[0] || DEFAULT_PLACEHOLDER;
};

/**
 * Preload an image URL (for performance optimization)
 */
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

/**
 * Batch preload multiple image URLs
 */
export const preloadImages = (urls: string[]): Promise<PromiseSettledResult<void>[]> => {
  return Promise.allSettled(urls.map(preloadImage));
};
