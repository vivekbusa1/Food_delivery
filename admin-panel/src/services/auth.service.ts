import api, { unwrap, unwrapEntity } from './api';
import type { AdminUser, AuthResponse, LoginPayload } from '@/types';

const mapUser = (user: Record<string, unknown>): AdminUser => {
  const id = String(user.id ?? user._id ?? '');
  return {
    id,
    name: String(user.name ?? ''),
    email: String(user.email ?? ''),
    phone: user.phone ? String(user.phone) : undefined,
    role: String(user.role ?? 'admin'),
    avatar:
      typeof user.avatar === 'object' && user.avatar
        ? String((user.avatar as { url?: string }).url ?? '')
        : user.avatar
          ? String(user.avatar)
          : undefined,
    permissions: Array.isArray(user.permissions) ? (user.permissions as string[]) : undefined,
    createdAt: user.createdAt ? String(user.createdAt) : undefined,
  };
};

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await api.post('/auth/login', payload);
    const data = unwrap<{ user: Record<string, unknown>; accessToken: string; refreshToken: string }>(res);
    return {
      user: mapUser(data.user),
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  },

  logout: async (refreshToken?: string | null): Promise<void> => {
    await api.post('/auth/logout', { refreshToken: refreshToken || undefined }).catch(() => undefined);
  },

  me: async (): Promise<AdminUser> => {
    const res = await api.get('/auth/me');
    const user = unwrapEntity<Record<string, unknown>>(res, 'user');
    const mapped = mapUser(user);
    if (mapped.role !== 'admin' && mapped.role !== 'super_admin') {
      throw new Error('This account does not have admin access');
    }
    return mapped;
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const res = await api.post('/auth/refresh-token', { refreshToken });
    const data = unwrap<{ user?: Record<string, unknown>; accessToken: string; refreshToken: string }>(res);
    return {
      user: data.user ? mapUser(data.user) : ({} as AdminUser),
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  },

  changePassword: async (payload: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.post('/auth/change-password', payload);
  },
};
