import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button, Text, useTheme } from "react-native-paper";

import type { Coupon } from "../types";
import { formatDate } from "../utils/formatters";
import { spacing } from "../constants/theme";

interface CouponCardProps {
  coupon: Coupon;
  applied?: boolean;
  onApply: () => void;
}

export function CouponCard({ coupon, applied, onApply }: CouponCardProps) {
  const theme = useTheme();
  return (
    <Pressable style={[styles.container, { borderColor: theme.colors.outlineVariant }]} onPress={onApply}>
      <MaterialCommunityIcons name="ticket-percent-outline" size={28} color={theme.colors.primary} />
      <View style={styles.content}>
        <Text variant="titleSmall">{coupon.code}</Text>
        <Text variant="bodySmall" style={styles.description}>
          {coupon.description}
        </Text>
        {coupon.expiresAt && (
          <Text variant="labelSmall" style={styles.expiry}>
            Valid till {formatDate(coupon.expiresAt)}
          </Text>
        )}
      </View>
      <Button mode={applied ? "contained" : "outlined"} compact onPress={onApply}>
        {applied ? "Applied" : "Apply"}
      </Button>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  content: { flex: 1 },
  description: { opacity: 0.7, marginTop: 2 },
  expiry: { opacity: 0.5, marginTop: 2 },
});
