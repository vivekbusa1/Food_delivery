import { apiClient } from './apiClient';
import type {
  ApiResponse,
  AuthResponse,
  AuthTokens,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  RestaurantUser,
} from '@/types';

/** Backend login/register/refresh put tokens flat on `data`, not under `data.tokens`. */
type BackendAuthData = {
  user?: Record<string, unknown>;
  accessToken?: string;
  refreshToken?: string;
  tokens?: AuthTokens;
};

const mapUser = (raw: Record<string, unknown> | undefined): RestaurantUser => {
  const user = raw ?? {};
  const avatar =
    typeof user.avatar === 'object' && user.avatar
      ? String((user.avatar as { url?: string }).url ?? '')
      : user.avatar
        ? String(user.avatar)
        : '';

  return {
    id: String(user.id ?? user._id ?? ''),
    email: String(user.email ?? ''),
    phone: String(user.phone ?? ''),
    ownerName: String(user.ownerName ?? user.name ?? ''),
    restaurantName: String(user.restaurantName ?? user.name ?? ''),
    role: 'restaurant',
    isVerified: Boolean(user.isEmailVerified ?? user.isVerified ?? false),
    isActive: user.isActive !== false && user.isBlocked !== true,
    logoUrl: (user.logoUrl as string | null | undefined) ?? (avatar || null),
    createdAt: String(user.createdAt ?? ''),
  };
};

const normalizeAuth = (payload: BackendAuthData): AuthResponse => {
  const accessToken = payload.accessToken ?? payload.tokens?.accessToken ?? '';
  const refreshToken = payload.refreshToken ?? payload.tokens?.refreshToken ?? '';
  return {
    user: mapUser(payload.user),
    tokens: { accessToken, refreshToken },
  };
};

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<BackendAuthData>>('/auth/login', payload);
    const auth = normalizeAuth(data.data ?? {});
    if (data.data?.user && String(data.data.user.role) !== 'restaurant') {
      throw new Error('This account is not a restaurant partner account');
    }
    if (!auth.tokens.accessToken) {
      throw new Error('Login succeeded but no access token was returned');
    }
    return auth;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<BackendAuthData>>('/auth/register', {
      name: payload.ownerName || payload.restaurantName,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      role: 'restaurant',
    });
    return normalizeAuth(data.data ?? {});
  },

  async logout(refreshToken: string | null): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken }).catch(() => undefined);
  },

  async me(): Promise<RestaurantUser> {
    const { data } = await apiClient.get<ApiResponse<BackendAuthData | RestaurantUser | Record<string, unknown>>>(
      '/auth/me'
    );
    const payload = data.data as BackendAuthData & Record<string, unknown>;
    const rawUser =
      payload && typeof payload === 'object' && 'user' in payload && payload.user
        ? (payload.user as Record<string, unknown>)
        : (payload as Record<string, unknown>);

    if (rawUser && String(rawUser.role) !== 'restaurant') {
      throw new Error('This account is not a restaurant partner account');
    }

    return mapUser(rawUser);
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await apiClient.post('/auth/change-password', payload);
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    await apiClient.post('/auth/forgot-password', payload);
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await apiClient.post('/auth/reset-password', {
      token: payload.token,
      password: payload.newPassword,
    });
  },
};
