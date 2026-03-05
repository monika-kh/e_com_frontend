export interface RatingSummary {
  average_rating: number;
  total_ratings: number;
  user_rating: number | null;
}

export interface ProductReview {
  id: number;
  user_name: string;
  user_email: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  is_owner: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

