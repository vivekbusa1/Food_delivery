export interface RestaurantUser {
  id: string;
  email: string;
  phone: string;
  ownerName: string;
  restaurantName: string;
  role: 'restaurant';
  isVerified: boolean;
  isActive: boolean;
  logoUrl?: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: RestaurantUser;
  tokens: AuthTokens;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  restaurantName: string;
  ownerName: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  cuisineType?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}
