import React from "react";
import { StyleSheet, View } from "react-native";
import { Badge, Button, Surface, Text, useTheme } from "react-native-paper";

import { formatCurrency, pluralize } from "../utils/formatters";
import { spacing } from "../constants/theme";

interface CartBarProps {
  itemCount: number;
  total: number;
  onPress: () => void;
  label?: string;
}

export function CartBar({ itemCount, total, onPress, label = "View Cart" }: CartBarProps) {
  const theme = useTheme();
  if (itemCount === 0) return null;

  return (
    <Surface style={[styles.wrapper, { backgroundColor: theme.colors.primary }]} elevation={4}>
      <Button
        onPress={onPress}
        textColor="#fff"
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        <View style={styles.row}>
          <Badge style={styles.badge} size={22}>
            {itemCount}
          </Badge>
          <Text style={styles.label}>
            {pluralize(itemCount, "item")} · {formatCurrency(total)}
          </Text>
          <Text style={styles.cta}>{label}</Text>
        </View>
      </Button>
    </Surface>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: "absolute", left: spacing.lg, right: spacing.lg, bottom: spacing.lg, borderRadius: 14 },
  button: { borderRadius: 14 },
  buttonContent: { height: 52 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flex: 1, gap: spacing.sm },
  badge: { backgroundColor: "rgba(255,255,255,0.3)", color: "#fff" },
  label: { color: "#fff", fontWeight: "600", flex: 1 },
  cta: { color: "#fff", fontWeight: "700" },
});
