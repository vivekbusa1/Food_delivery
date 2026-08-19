import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button, Text, useTheme } from "react-native-paper";

import { spacing } from "../constants/theme";

interface EmptyStateProps {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = "emoticon-sad-outline",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={64} color={theme.colors.outline} />
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>
      {description ? (
        <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button mode="contained" onPress={onAction} style={styles.button}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", padding: spacing.xxl, gap: spacing.sm },
  title: { marginTop: spacing.md, textAlign: "center" },
  description: { textAlign: "center" },
  button: { marginTop: spacing.md },
});
