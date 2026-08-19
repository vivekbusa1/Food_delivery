import React, { type ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { lightTheme } from "../constants/theme";
import { useResponsive } from "../hooks/useResponsive";

interface ResponsiveShellProps {
  children: ReactNode;
}

/**
 * On web/tablet/desktop, centers the app in a readable column with side gutters.
 * On native phones it is a no-op passthrough.
 */
export function ResponsiveShell({ children }: ResponsiveShellProps) {
  const { width, shellMaxWidth, isPhone } = useResponsive();

  if (Platform.OS !== "web" && isPhone) {
    return <>{children}</>;
  }

  const framed = width > shellMaxWidth + 24;

  return (
    <View style={[styles.outer, framed && styles.outerFramed]}>
      <View
        style={[
          styles.inner,
          {
            maxWidth: shellMaxWidth,
            borderRadius: framed ? 20 : 0,
            overflow: "hidden",
          },
          framed && styles.innerShadow,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    backgroundColor: lightTheme.colors.background,
  },
  outerFramed: {
    backgroundColor: "#E8E2DC",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  inner: {
    flex: 1,
    width: "100%",
    backgroundColor: lightTheme.colors.background,
  },
  innerShadow: {
    // Web-friendly elevation for the app frame
    shadowColor: "#1C1917",
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
