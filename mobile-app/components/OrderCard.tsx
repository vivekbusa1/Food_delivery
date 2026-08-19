import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Button, Chip, Text, useTheme } from "react-native-paper";

import type { Order } from "../types";
import { formatCurrency, formatDate, formatOrderStatus, pluralize } from "../utils/formatters";
import { statusColors, spacing } from "../constants/theme";

interface OrderCardProps {
  order: Order;
  onPress: () => void;
  onReorder?: () => void;
  onRate?: () => void;
}

export function OrderCard({ order, onPress, onReorder, onRate }: OrderCardProps) {
  const theme = useTheme();
  const statusColor = statusColors[order.status] ?? theme.colors.primary;
  const isCompleted = order.status === "delivered" || order.status === "cancelled";

  return (
    <Pressable onPress={onPress} style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Image source={{ uri: order.restaurant.imageUrl }} style={styles.image} contentFit="cover" />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text variant="titleSmall" numberOfLines={1} style={styles.title}>
            {order.restaurant.name}
          </Text>
          <Chip
            compact
            style={{ backgroundColor: `${statusColor}22` }}
            textStyle={{ color: statusColor, fontSize: 11 }}
          >
            {formatOrderStatus(order.status)}
          </Chip>
        </View>
        <Text variant="bodySmall" style={styles.subtitle}>
          {pluralize(order.items.length, "item")} · {formatCurrency(order.total)}
        </Text>
        <Text variant="bodySmall" style={styles.date}>
          {formatDate(order.placedAt)} · #{order.orderNumber}
        </Text>
        {isCompleted && (onReorder || onRate) && (
          <View style={styles.actions}>
            {onReorder && (
              <Button mode="outlined" compact onPress={onReorder} style={styles.actionButton}>
                Reorder
              </Button>
            )}
            {onRate && order.status === "delivered" && (
              <Button mode="text" compact onPress={onRate} style={styles.actionButton}>
                {order.rating ? "View review" : "Rate order"}
              </Button>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", borderRadius: 14, padding: spacing.sm, marginBottom: spacing.md },
  image: { width: 64, height: 64, borderRadius: 10, marginRight: spacing.sm },
  content: { flex: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.xs },
  title: { flex: 1 },
  subtitle: { opacity: 0.7, marginTop: 2 },
  date: { opacity: 0.5, marginTop: 2 },
  actions: { flexDirection: "row", marginTop: spacing.xs, gap: spacing.sm },
  actionButton: { marginLeft: -spacing.sm },
});
