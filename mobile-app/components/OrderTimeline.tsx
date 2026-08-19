import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, useTheme } from "react-native-paper";

import type { OrderStatus, OrderTimelineEntry } from "../types";
import { formatDateTime, formatOrderStatus } from "../utils/formatters";
import { spacing } from "../constants/theme";

const ORDER: OrderStatus[] = [
  "placed",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "picked_up",
  "on_the_way",
  "delivered",
];

const iconByStatus: Record<OrderStatus, keyof typeof MaterialCommunityIcons.glyphMap> = {
  placed: "receipt",
  confirmed: "check-circle-outline",
  preparing: "chef-hat",
  ready_for_pickup: "shopping-outline",
  picked_up: "bike-fast",
  on_the_way: "map-marker-distance",
  delivered: "package-variant-closed",
  cancelled: "close-circle-outline",
};

interface OrderTimelineProps {
  timeline: OrderTimelineEntry[];
  currentStatus: OrderStatus;
}

export function OrderTimeline({ timeline, currentStatus }: OrderTimelineProps) {
  const theme = useTheme();

  if (currentStatus === "cancelled") {
    const cancelledEntry = timeline.find((entry) => entry.status === "cancelled");
    return (
      <View style={styles.row}>
        <MaterialCommunityIcons name="close-circle-outline" size={22} color={theme.colors.error} />
        <View style={styles.textWrapper}>
          <Text variant="titleSmall" style={{ color: theme.colors.error }}>
            Order cancelled
          </Text>
          {cancelledEntry?.note && <Text variant="bodySmall">{cancelledEntry.note}</Text>}
        </View>
      </View>
    );
  }

  const currentIndex = ORDER.indexOf(currentStatus);

  return (
    <View>
      {ORDER.map((status, index) => {
        const entry = timeline.find((item) => item.status === status);
        const isDone = index <= currentIndex;
        const isLast = index === ORDER.length - 1;
        return (
          <View key={status} style={styles.row}>
            <View style={styles.iconColumn}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: isDone ? theme.colors.primary : theme.colors.surfaceVariant,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={iconByStatus[status]}
                  size={16}
                  color={isDone ? "#fff" : theme.colors.onSurfaceVariant}
                />
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.connector,
                    { backgroundColor: index < currentIndex ? theme.colors.primary : theme.colors.surfaceVariant },
                  ]}
                />
              )}
            </View>
            <View style={styles.textWrapper}>
              <Text variant="titleSmall" style={{ opacity: isDone ? 1 : 0.5 }}>
                {formatOrderStatus(status)}
              </Text>
              {entry && (
                <Text variant="labelSmall" style={styles.timestamp}>
                  {formatDateTime(entry.timestamp)}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start" },
  iconColumn: { alignItems: "center", marginRight: spacing.sm },
  iconCircle: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  connector: { width: 2, flex: 1, minHeight: 24 },
  textWrapper: { flex: 1, paddingBottom: spacing.md },
  timestamp: { opacity: 0.5, marginTop: 2 },
});
