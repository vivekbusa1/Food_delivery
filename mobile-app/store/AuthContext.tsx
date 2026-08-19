import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { authService, type LoginPayload, type SignupPayload, type VerifyOtpPayload } from "../services/authService";
import { registerUnauthorizedHandler } from "../services/api";
import { SECURE_STORE_KEYS } from "../constants/config";
import { deleteSecureItem, getSecureItem, setSecureItem } from "../utils/secureStorage";
import type { AuthResponse, AuthTokens, User, UserRole } from "../types";

interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  signup: (payload: SignupPayload) => Promise<AuthResponse>;
  requestOtp: (email: string, purpose?: VerifyOtpPayload["purpose"]) => Promise<void>;
  verifyOtp: (payload: VerifyOtpPayload) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function persistSession(tokens: AuthTokens, role: UserRole) {
  await setSecureItem(SECURE_STORE_KEYS.accessToken, tokens.accessToken);
  await setSecureItem(SECURE_STORE_KEYS.refreshToken, tokens.refreshToken);
  await setSecureItem(SECURE_STORE_KEYS.userRole, role);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const clearSession = useCallback(async () => {
    await deleteSecureItem(SECURE_STORE_KEYS.accessToken);
    await deleteSecureItem(SECURE_STORE_KEYS.refreshToken);
    await deleteSecureItem(SECURE_STORE_KEYS.userRole);
    setUser(null);
    setRole(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      void clearSession();
    });
  }, [clearSession]);

  useEffect(() => {
    (async () => {
      try {
        const token = await getSecureItem(SECURE_STORE_KEYS.accessToken);
        const storedRole = (await getSecureItem(SECURE_STORE_KEYS.userRole)) as UserRole | null;
        if (token) {
          const me = await authService.me();
          setUser(me);
          setRole(storedRole ?? me.role);
        }
      } catch {
        await clearSession();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [clearSession]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authService.login(payload);
    await persistSession(response.tokens, response.user.role);
    setUser(response.user);
    setRole(response.user.role);
    return response;
  }, []);

  const signup = useCallback(async (payload: SignupPayload) => {
    const response = await authService.signup(payload);
    await persistSession(response.tokens, response.user.role);
    setUser(response.user);
    setRole(response.user.role);
    return response;
  }, []);

  const requestOtp = useCallback(async (email: string, purpose: VerifyOtpPayload["purpose"] = "signup") => {
    await authService.requestOtp(email, purpose);
  }, []);

  const verifyOtp = useCallback(async (payload: VerifyOtpPayload) => {
    const response = await authService.verifyOtp(payload);
    await persistSession(response.tokens, response.user.role);
    setUser(response.user);
    setRole(response.user.role);
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore network errors on logout; still clear local session
    }
    await clearSession();
  }, [clearSession]);

  const updateUser = useCallback((updated: User) => setUser(updated), []);

  const switchRole = useCallback((newRole: UserRole) => {
    setRole(newRole);
    void setSecureItem(SECURE_STORE_KEYS.userRole, newRole);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      isLoading,
      isAuthenticated: !!user,
      login,
      signup,
      requestOtp,
      verifyOtp,
      logout,
      updateUser,
      switchRole,
    }),
    [user, role, isLoading, login, signup, requestOtp, verifyOtp, logout, updateUser, switchRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
