import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider, adaptNavigationTheme } from "react-native-paper";
import {
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import * as SplashScreenModule from "expo-splash-screen";
import Toast from "react-native-toast-message";

import { RootNavigator } from "./navigation/RootNavigator";
import { AuthProvider } from "./store/AuthContext";
import { ResponsiveShell } from "./components/ResponsiveShell";
import { lightTheme } from "./constants/theme";

void SplashScreenModule.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

const { LightTheme: NavLightTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
});

const navigationTheme = {
  ...NavigationDefaultTheme,
  ...NavLightTheme,
  fonts: NavigationDefaultTheme.fonts,
  colors: {
    ...NavigationDefaultTheme.colors,
    ...NavLightTheme.colors,
    primary: lightTheme.colors.primary,
    background: lightTheme.colors.background,
    card: lightTheme.colors.surface,
    text: lightTheme.colors.onSurface,
    border: lightTheme.colors.outlineVariant,
  },
};

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    setAppReady(true);
  }, []);

  useEffect(() => {
    if (appReady) {
      void SplashScreenModule.hideAsync();
    }
  }, [appReady]);

  if (!appReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <PaperProvider theme={lightTheme}>
              <NavigationThemeProvider value={navigationTheme}>
                <StatusBar style="dark" />
                <ResponsiveShell>
                  <RootNavigator />
                </ResponsiveShell>
                <Toast />
              </NavigationThemeProvider>
            </PaperProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
