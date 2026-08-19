import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CommonActions, useNavigation, useRoute } from "@react-navigation/native";
import { Button, Divider, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { MainStackNavigationProp, MainStackParamList } from "../../navigation/types";
import { useOrder } from "../../hooks/useOrders";
import { LoadingOverlay } from "../../components/LoadingOverlay";
import { ErrorState } from "../../components/ErrorState";
import { formatCurrency, formatDateTime, pluralize } from "../../utils/formatters";
import { spacing } from "../../constants/theme";

type Props = NativeStackScreenProps<MainStackParamList, "OrderSummary">;

export function OrderSummaryScreen() {
  const theme = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const route = useRoute<Props["route"]>();
  const { orderId } = route.params;

  const { data: order, isLoading, isError, refetch } = useOrder(orderId);

  if (isLoading) return <LoadingOverlay />;
  if (isError || !order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.successBox}>
          <MaterialCommunityIcons name="check-circle" size={72} color={theme.colors.primary} />
          <Text variant="headlineSmall" style={styles.successTitle}>
            Order Placed!
          </Text>
          <Text variant="bodyMedium" style={styles.successSubtitle}>
            Order #{order.orderNumber} from {order.restaurant.name}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleSmall" style={styles.cardTitle}>
            {pluralize(order.items?.length ?? 0, "item")}
          </Text>
          {(order.items ?? []).map((item, index) => (
            <View key={item.id || `item-${index}`} style={styles.itemRow}>
              <Image source={{ uri: item.food?.imageUrl }} style={styles.itemImage} contentFit="cover" />
              <View style={styles.itemContent}>
                <Text variant="bodyMedium" numberOfLines={1}>
                  {item.quantity} × {item.food?.name}
                </Text>
              </View>
              <Text variant="bodyMedium">{formatCurrency(item.itemTotal)}</Text>
            </View>
          ))}
          <Divider style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium">Subtotal</Text>
            <Text variant="bodyMedium">{formatCurrency(order.subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium">Delivery Fee</Text>
            <Text variant="bodyMedium">{formatCurrency(order.deliveryFee)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium">Taxes</Text>
            <Text variant="bodyMedium">{formatCurrency(order.taxes)}</Text>
          </View>
          {order.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
                Discount
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
                -{formatCurrency(order.discount)}
              </Text>
            </View>
          )}
          <Divider style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text variant="titleMedium">Total</Text>
            <Text variant="titleMedium">{formatCurrency(order.total)}</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleSmall" style={styles.cardTitle}>
            Delivering to
          </Text>
          <Text variant="bodyMedium">{order.address.label}</Text>
          <Text variant="bodySmall" style={styles.addressText}>
            {order.address.addressLine1}, {order.address.city}, {order.address.state} {order.address.postalCode}
          </Text>
          {order.estimatedDeliveryAt && (
            <Text variant="bodySmall" style={styles.etaText}>
              Estimated delivery: {formatDateTime(order.estimatedDeliveryAt)}
            </Text>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
        <Button
          mode="contained"
          contentStyle={styles.footerButtonContent}
          onPress={() => navigation.replace("LiveOrderTracking", { orderId: order.id })}
        >
          Track Order
        </Button>
        <Button
          mode="text"
          onPress={() =>
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "MainTabs", params: { screen: "OrdersTab" } }],
              }),
            )
          }
        >
          View My Orders
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  successBox: { alignItems: "center", marginBottom: spacing.lg },
  successTitle: { marginTop: spacing.sm, fontWeight: "700" },
  successSubtitle: { opacity: 0.6, marginTop: 2 },
  card: { padding: spacing.md, borderRadius: 14, marginBottom: spacing.lg },
  cardTitle: { marginBottom: spacing.sm },
  itemRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  itemImage: { width: 40, height: 40, borderRadius: 8, marginRight: spacing.sm },
  itemContent: { flex: 1 },
  divider: { marginVertical: spacing.sm },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
  addressText: { opacity: 0.6, marginTop: 2 },
  etaText: { opacity: 0.6, marginTop: spacing.xs },
  footer: { padding: spacing.lg, gap: spacing.xs, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  footerButtonContent: { height: 50 },
});
