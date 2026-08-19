import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

import { authService } from "../services/authService";
import { useAuth } from "../store/AuthContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Registers the device for push notifications once the user is authenticated
// and forwards the Expo push token to the backend so it can send order updates.
export function usePushNotifications() {
  const { isAuthenticated } = useAuth();
  const registered = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || registered.current) return;

    (async () => {
      try {
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
          });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted") return;

        const tokenResponse = await Notifications.getExpoPushTokenAsync();
        await authService.registerPushToken(tokenResponse.data);
        registered.current = true;
      } catch {
        // Push registration is best-effort; failures shouldn't block app usage.
      }
    })();
  }, [isAuthenticated]);
}
