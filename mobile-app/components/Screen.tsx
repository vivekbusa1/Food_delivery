import React, { type ReactNode } from "react";
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";

import { useResponsive } from "../hooks/useResponsive";

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

/** Consistent padded screen container that respects responsive gutters. */
export function Screen({
  children,
  scroll = false,
  edges = ["bottom"],
  style,
  contentStyle,
}: ScreenProps) {
  const theme = useTheme();
  const { contentPadding } = useResponsive();

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.grow, { padding: contentPadding }, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.grow, { padding: contentPadding }, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }, style]} edges={edges}>
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  grow: { flexGrow: 1 },
});
