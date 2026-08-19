import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, TouchableRipple, useTheme } from "react-native-paper";

import { spacing } from "../constants/theme";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel = "See all", onAction }: SectionHeaderProps) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Text variant="titleMedium">{title}</Text>
      {onAction && (
        <TouchableRipple onPress={onAction} borderless style={styles.action}>
          <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
            {actionLabel}
          </Text>
        </TouchableRipple>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  action: { padding: spacing.xs },
});
