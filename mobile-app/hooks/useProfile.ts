import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { queryKeys } from "../constants/queryKeys";
import { userService, type UpdateProfilePayload } from "../services/userService";
import { authService } from "../services/authService";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../store/AuthContext";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => userService.updateProfile(payload),
    onSuccess: (user) => {
      updateUser(user);
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      Toast.show({ type: "success", text1: "Profile updated" });
    },
    onError: (error) => Toast.show({ type: "error", text1: "Update failed", text2: getErrorMessage(error) }),
  });
}

export function useUploadAvatar() {
  const { updateUser, user } = useAuth();
  return useMutation({
    mutationFn: (uri: string) => userService.uploadAvatar(uri),
    onSuccess: ({ avatarUrl }) => {
      if (user) updateUser({ ...user, avatarUrl });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(currentPassword, newPassword),
    onSuccess: () => Toast.show({ type: "success", text1: "Password updated" }),
    onError: (error) => Toast.show({ type: "error", text1: "Could not change password", text2: getErrorMessage(error) }),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => authService.deleteAccount(),
    onError: (error) => Toast.show({ type: "error", text1: "Could not delete account", text2: getErrorMessage(error) }),
  });
}

export function useUpdateLanguage() {
  return useMutation({
    mutationFn: (languageCode: string) => userService.updateLanguage(languageCode),
  });
}
