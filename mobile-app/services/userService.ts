import { api } from "./api";
import { fromBackendRole } from "./authService";
import { pickId, unwrapData } from "../utils/apiHelpers";
import type { User } from "../types";

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  gender?: string;
  dob?: string;
}

function mapUser(raw: unknown): User {
  const user = (raw ?? {}) as Record<string, unknown> & {
    avatar?: { url?: string } | string;
    avatarUrl?: string;
  };
  const avatarUrl =
    typeof user.avatar === "object" && user.avatar
      ? String(user.avatar.url ?? "") || null
      : user.avatarUrl
        ? String(user.avatarUrl)
        : typeof user.avatar === "string"
          ? user.avatar
          : null;

  return {
    id: pickId(user),
    name: String(user.name ?? ""),
    email: String(user.email ?? ""),
    phone: String(user.phone ?? ""),
    avatarUrl,
    role: fromBackendRole(user.role),
    createdAt: String(user.createdAt ?? ""),
  };
}

function unwrapUser(body: unknown): User {
  const data = unwrapData<{ user?: unknown } | unknown>(body);
  if (data && typeof data === "object" && "user" in (data as object)) {
    return mapUser((data as { user: unknown }).user);
  }
  return mapUser(data);
}

export const userService = {
  updateProfile: (payload: UpdateProfilePayload) =>
    api
      .patch("/users/me", {
        name: payload.name,
        gender: payload.gender,
        dob: payload.dob,
      })
      .then((res) => unwrapUser(res.data)),

  uploadAvatar: (uri: string) => {
    const formData = new FormData();
    const filename = uri.split("/").pop() ?? "avatar.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";
    formData.append("avatar", { uri, name: filename, type } as unknown as Blob);

    return api
      .patch("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        const user = unwrapUser(res.data);
        return { avatarUrl: user.avatarUrl ?? "" };
      });
  },

  // Backend has no language endpoint; keep a no-op success so the UI can persist locally.
  updateLanguage: async (_languageCode: string) => ({ success: true as const }),
};
