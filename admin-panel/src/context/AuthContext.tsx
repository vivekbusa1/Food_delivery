import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AUTH_LOGOUT_EVENT, clearAuthTokens, getAccessToken, getRefreshToken, setAuthTokens } from '@/services/api';
import { authService } from '@/services/auth.service';
import { ADMIN_USER_KEY } from '@/utils/constants';
import type { AdminUser, LoginPayload } from '@/types';

interface AuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readCachedUser = (): AdminUser | null => {
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const logout = useCallback(() => {
    const refreshToken = getRefreshToken();
    // Clear local session first so UI returns to login immediately.
    clearAuthTokens();
    setUser(null);
    // Revoke server-side refresh token without requiring a valid access token.
    void authService.logout(refreshToken).catch(() => undefined);
  }, []);

  useEffect(() => {
    window.addEventListener(AUTH_LOGOUT_EVENT, logout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, logout);
  }, [logout]);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const token = getAccessToken();
      if (!token) {
        if (!cancelled) {
          setUser(null);
          setIsInitializing(false);
        }
        return;
      }

      // Prefer cached profile for fast paint, then verify with /auth/me.
      const cached = readCachedUser();
      if (cached && !cancelled) setUser(cached);

      try {
        const me = await authService.me();
        if (cancelled) return;
        setUser(me);
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(me));
      } catch {
        if (cancelled) return;
        clearAuthTokens();
        setUser(null);
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await authService.login(payload);
    const role = String(res.user.role ?? '');
    if (role !== 'admin' && role !== 'super_admin') {
      clearAuthTokens();
      throw new Error('This account does not have admin access');
    }
    if (!res.accessToken) {
      throw new Error('Login succeeded but no access token was returned');
    }
    setAuthTokens(res.accessToken, res.refreshToken);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(res.user));
    setUser(res.user);
  }, []);

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;
      if (user.role === 'super_admin' || user.role === 'admin') return true;
      return Boolean(user.permissions?.includes(permission));
    },
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      login,
      logout,
      hasPermission,
    }),
    [user, isInitializing, login, logout, hasPermission]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
