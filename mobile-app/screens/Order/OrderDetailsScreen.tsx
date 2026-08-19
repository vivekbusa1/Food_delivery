import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Button, Chip, Divider, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { MainStackNavigationProp, MainStackParamList } from "../../navigation/types";
import { useOrder, useReorder } from "../../hooks/useOrders";
import { LoadingOverlay } from "../../components/LoadingOverlay";
import { ErrorState } from "../../components/ErrorState";
import { OrderTimeline } from "../../components/OrderTimeline";
import { formatCurrency, formatDateTime, formatOrderStatus } from "../../utils/formatters";
import { statusColors, spacing } from "../../constants/theme";

type Props = NativeStackScreenProps<MainStackParamList, "OrderDetails">;

export function OrderDetailsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const route = useRoute<Props["route"]>();
  const { orderId } = route.params;

  const { data: order, isLoading, isError, refetch } = useOrder(orderId);
  const reorder = useReorder();

  if (isLoading) return <LoadingOverlay />;
  if (isError || !order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  const statusColor = statusColors[order.status] ?? theme.colors.primary;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text variant="titleMedium">{order.restaurant.name}</Text>
            <Text variant="bodySmall" style={styles.subtitle}>
              Order #{order.orderNumber} · {formatDateTime(order.placedAt)}
            </Text>
          </View>
          <Chip style={{ backgroundColor: `${statusColor}22` }} textStyle={{ color: statusColor }}>
            {formatOrderStatus(order.status)}
          </Chip>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          {(order.items ?? []).map((item, index) => (
            <View key={item.id || `item-${index}`} style={styles.itemRow}>
              <Image source={{ uri: item.food?.imageUrl }} style={styles.itemImage} contentFit="cover" />
              <Text variant="bodyMedium" style={styles.itemName} numberOfLines={1}>
                {item.quantity} × {item.food?.name}
              </Text>
              <Text variant="bodyMedium">{formatCurrency(item.itemTotal)}</Text>
            </View>
          ))}
          <Divider style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text variant="titleMedium">Total</Text>
            <Text variant="titleMedium">{formatCurrency(order.total)}</Text>
          </View>
          <Text variant="bodySmall" style={styles.paymentText}>
            Paid via {order.paymentMethod.toUpperCase()}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleSmall" style={styles.cardTitle}>
            Delivered to
          </Text>
          <Text variant="bodyMedium">{order.address.label}</Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            {order.address.addressLine1}, {order.address.city}, {order.address.state} {order.address.postalCode}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleSmall" style={styles.cardTitle}>
            Order Timeline
          </Text>
          <OrderTimeline timeline={order.timeline} currentStatus={order.status} />
        </View>

        <View style={styles.actions}>
          {order.status === "delivered" && (
            <Button
              mode="outlined"
              style={styles.actionButton}
              onPress={() => navigation.navigate("RatingsReviews", { orderId: order.id, restaurantId: order.restaurant.id })}
            >
              {order.rating ? "View Review" : "Rate Order"}
            </Button>
          )}
          {(order.status === "delivered" || order.status === "cancelled") && (
            <Button mode="contained" style={styles.actionButton} onPress={() => reorder.mutate(order.id)} loading={reorder.isPending}>
              Reorder
            </Button>
          )}
          {order.status !== "delivered" && order.status !== "cancelled" && (
            <Button mode="contained" style={styles.actionButton} onPress={() => navigation.navigate("LiveOrderTracking", { orderId: order.id })}>
              Track Order
            </Button>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.lg },
  subtitle: { opacity: 0.6, marginTop: 2 },
  card: { padding: spacing.md, borderRadius: 14, marginBottom: spacing.lg },
  cardTitle: { marginBottom: spacing.sm },
  itemRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm, gap: spacing.sm },
  itemImage: { width: 40, height: 40, borderRadius: 8 },
  itemName: { flex: 1 },
  divider: { marginVertical: spacing.sm },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  paymentText: { opacity: 0.5, marginTop: spacing.xs },
  actions: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.xl },
  actionButton: { flex: 1 },
});
