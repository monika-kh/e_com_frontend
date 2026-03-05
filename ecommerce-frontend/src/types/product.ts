export interface Product {
  id: number;
  name: string;
  slug?: string;
  price?: number;
  image?: string | null;
  images?: string[];
  description?: string | null;
  target_gender?: string | null;
  available?: boolean;
  stock?: number;
  average_rating?: number;
  total_ratings?: number;
  ratings_count?: number;
  reviews_count?: number;
  category?: {
    id?: number;
    name: string;
    slug: string;
  };
}

export interface CartItem {
  productId: number;
  quantity: number;
  price?: number;
}

export interface CartResponse {
  id?: number;
  productId: number;
  quantity: number;
  product?: Product;
  createdAt?: string;
  updatedAt?: string;
  price?: number;
  items?: CartItem[];

  product_name?: string;
  product_slug?: string;
  product_stock?: number;
  product_images?: string[];
  subtotal?: number;
}
