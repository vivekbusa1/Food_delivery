import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { AUTH_LOGOUT_EVENT, authEvents } from '@/services/apiClient';
import { clearRestaurantIdCache } from '@/services/restaurantService';
import { tokenStorage } from '@/utils/tokenStorage';
import type { LoginPayload, RegisterPayload, RestaurantUser } from '@/types';

interface AuthContextValue {
  user: RestaurantUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: RestaurantUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<RestaurantUser | null>(() => tokenStorage.getUser());
  const [isInitializing, setIsInitializing] = useState(true);
  const queryClient = useQueryClient();

  const setUser = useCallback((nextUser: RestaurantUser) => {
    tokenStorage.setUser(nextUser);
    setUserState(nextUser);
  }, []);

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    clearRestaurantIdCache();
    setUserState(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const accessToken = tokenStorage.getAccessToken();
      if (!accessToken) {
        setIsInitializing(false);
        return;
      }
      try {
        const me = await authService.me();
        if (isMounted) setUser(me);
      } catch {
        if (isMounted) clearSession();
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    }

    bootstrap();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = () => clearSession();
    authEvents.addEventListener(AUTH_LOGOUT_EVENT, handler);
    return () => authEvents.removeEventListener(AUTH_LOGOUT_EVENT, handler);
  }, [clearSession]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { user: loggedInUser, tokens } = await authService.login(payload);
      if (!tokens.accessToken || !tokens.refreshToken) {
        throw new Error('Login succeeded but tokens were missing');
      }
      tokenStorage.setTokens(tokens);
      setUser(loggedInUser);
    },
    [setUser]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { user: newUser, tokens } = await authService.register(payload);
      if (!tokens.accessToken || !tokens.refreshToken) {
        throw new Error('Registration succeeded but tokens were missing');
      }
      tokenStorage.setTokens(tokens);
      setUser(newUser);
    },
    [setUser]
  );

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    // Clear local session first so restaurant UI never stays half-logged-in.
    clearSession();
    await authService.logout(refreshToken);
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      login,
      register,
      logout,
      setUser,
    }),
    [user, isInitializing, login, register, logout, setUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
