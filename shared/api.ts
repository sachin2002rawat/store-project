export interface User {
  id: number;
  name: string;
  email: string;
  address: string;
  role: 'admin' | 'user' | 'store_owner';
}

export interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  average_rating: number;
  total_ratings: number;
}

export interface Rating {
  id: number;
  user_id: number;
  store_id: number;
  rating: number;
  created_at: Date;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}
