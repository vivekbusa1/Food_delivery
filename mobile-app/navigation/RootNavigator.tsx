import React, { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import {
  NavigationContainer,
  type NavigationState,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { RootStackParamList } from "./types";
import { linking, NAV_STATE_STORAGE_KEY } from "./linking";
import { SplashScreen } from "../screens/Splash";
import { OnboardingScreen } from "../screens/Onboarding";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { DeliveryNavigator } from "./DeliveryNavigator";
import { useAuth } from "../store/AuthContext";
import { useOnboardingStore } from "../store/useOnboardingStore";
import { usePushNotifications } from "../hooks/usePushNotifications";

const Stack = createNativeStackNavigator<RootStackParamList>();

async function loadNavigationState(): Promise<NavigationState | undefined> {
  try {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      // Prefer the URL (linking) on web; only restore stored state when there is no path.
      const path = window.location.pathname.replace(/\/$/, "") || "/";
      if (path !== "/" && path !== "") return undefined;
      const raw = window.sessionStorage.getItem(NAV_STATE_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as NavigationState) : undefined;
    }
    const raw = await AsyncStorage.getItem(NAV_STATE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as NavigationState) : undefined;
  } catch {
    return undefined;
  }
}

async function saveNavigationState(state: NavigationState | undefined): Promise<void> {
  try {
    if (!state) return;
    const serialized = JSON.stringify(state);
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.sessionStorage.setItem(NAV_STATE_STORAGE_KEY, serialized);
      return;
    }
    await AsyncStorage.setItem(NAV_STATE_STORAGE_KEY, serialized);
  } catch {
    // Ignore persistence failures — navigation still works without it.
  }
}

export function RootNavigator() {
  const { isLoading, isAuthenticated, role } = useAuth();
  const { hasOnboarded, hydrated, hydrate } = useOnboardingStore();
  usePushNotifications();

  const [isNavReady, setIsNavReady] = useState(false);
  const [initialState, setInitialState] = useState<NavigationState | undefined>();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const state = await loadNavigationState();
      if (!cancelled) {
        setInitialState(state);
        setIsNavReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onStateChange = useCallback((state: NavigationState | undefined) => {
    void saveNavigationState(state);
  }, []);

  const showSplash = isLoading || !hydrated || !isNavReady;

  return (
    <NavigationContainer
      linking={linking}
      initialState={initialState}
      onStateChange={onStateChange}
    >
      <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
        {showSplash ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : !hasOnboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : role === "delivery_partner" ? (
          <Stack.Screen name="Delivery" component={DeliveryNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
