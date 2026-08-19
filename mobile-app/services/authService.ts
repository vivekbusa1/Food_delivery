import { api } from "./api";
import type { AuthResponse, AuthTokens, User, UserRole } from "../types";

export interface LoginPayload {
  email: string;
  password: string;
  role?: UserRole;
}

export interface SignupPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
  purpose: "signup" | "login" | "reset_password" | "verification";
}

type BackendAuthData = {
  user?: Record<string, unknown>;
  accessToken?: string;
  refreshToken?: string;
  tokens?: AuthTokens;
};

type Envelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

/** Map UI role names to backend role enum (`delivery`, not `delivery_partner`). */
export function toBackendRole(role?: UserRole): "customer" | "delivery" | undefined {
  if (!role) return undefined;
  if (role === "delivery_partner") return "delivery";
  return "customer";
}

export function fromBackendRole(role: unknown): UserRole {
  if (role === "delivery" || role === "delivery_partner") return "delivery_partner";
  return "customer";
}

const mapUser = (raw: Record<string, unknown> | undefined): User => {
  const user = raw ?? {};
  const avatarUrl =
    typeof user.avatar === "object" && user.avatar
      ? String((user.avatar as { url?: string }).url ?? "") || null
      : user.avatarUrl
        ? String(user.avatarUrl)
        : user.avatar
          ? String(user.avatar)
          : null;

  return {
    id: String(user.id ?? user._id ?? ""),
    name: String(user.name ?? ""),
    email: String(user.email ?? ""),
    phone: String(user.phone ?? ""),
    avatarUrl,
    role: fromBackendRole(user.role),
    createdAt: String(user.createdAt ?? ""),
  };
};

/** Accept either the API envelope or already-unwrapped `data`. */
function unwrapData<T>(body: Envelope<T> | T): T {
  if (body && typeof body === "object" && "data" in (body as object)) {
    return ((body as Envelope<T>).data ?? body) as T;
  }
  return body as T;
}

export function normalizeAuthResponse(body: unknown): AuthResponse {
  const data = unwrapData<BackendAuthData>(body as Envelope<BackendAuthData>);
  const accessToken = data.accessToken ?? data.tokens?.accessToken ?? "";
  const refreshToken = data.refreshToken ?? data.tokens?.refreshToken ?? "";
  return {
    user: mapUser(data.user),
    tokens: { accessToken, refreshToken },
  };
}

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { role, ...credentials } = payload;
    const res = await api.post("/auth/login", credentials);
    const auth = normalizeAuthResponse(res.data);
    if (role && auth.user.role !== role) {
      throw new Error(
        role === "delivery_partner"
          ? "This account is not a delivery partner account"
          : "This account is not a customer account",
      );
    }
    if (!auth.tokens.accessToken) {
      throw new Error("Login succeeded but no access token was returned");
    }
    return auth;
  },

  signup: async (payload: SignupPayload): Promise<AuthResponse> => {
    const res = await api.post("/auth/register", {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      role: toBackendRole(payload.role) ?? "customer",
    });
    return normalizeAuthResponse(res.data);
  },

  requestOtp: (email: string, purpose: VerifyOtpPayload["purpose"] = "signup") =>
    api
      .post("/auth/otp/send", {
        email,
        purpose: purpose === "signup" || purpose === "login" ? "verification" : purpose,
      })
      .then((res) => unwrapData(res.data)),

  verifyOtp: async (payload: VerifyOtpPayload): Promise<AuthResponse> => {
    const res = await api.post("/auth/otp/verify", {
      email: payload.email,
      otp: payload.otp,
      purpose:
        payload.purpose === "signup" || payload.purpose === "login"
          ? "verification"
          : payload.purpose,
    });
    return normalizeAuthResponse(res.data);
  },

  me: async (): Promise<User> => {
    const res = await api.get("/auth/me");
    const data = unwrapData<BackendAuthData | Record<string, unknown>>(res.data);
    if (data && typeof data === "object" && "user" in data && (data as BackendAuthData).user) {
      return mapUser((data as BackendAuthData).user);
    }
    return mapUser(data as Record<string, unknown>);
  },

  logout: () => api.post("/auth/logout").then((res) => unwrapData(res.data)),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }).then((res) => unwrapData(res.data)),

  changePassword: (currentPassword: string, newPassword: string) =>
    api
      .post("/auth/change-password", { currentPassword, newPassword })
      .then((res) => unwrapData(res.data)),

  deleteAccount: () => api.delete("/auth/me").then((res) => unwrapData(res.data)),

  registerPushToken: (pushToken: string) =>
    api.post("/auth/push-token", { pushToken }).then((res) => unwrapData(res.data)),
};
