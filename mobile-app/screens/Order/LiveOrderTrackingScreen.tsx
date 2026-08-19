import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Avatar, Button, IconButton, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { MainStackNavigationProp, MainStackParamList } from "../../navigation/types";
import { useCancelOrder, useOrderTracking } from "../../hooks/useOrders";
import { OrderTimeline } from "../../components/OrderTimeline";
import { LoadingOverlay } from "../../components/LoadingOverlay";
import { ErrorState } from "../../components/ErrorState";
import { formatOrderStatus } from "../../utils/formatters";
import { spacing } from "../../constants/theme";

type Props = NativeStackScreenProps<MainStackParamList, "LiveOrderTracking">;

const ACTIVE_STATUSES = ["placed", "confirmed", "preparing", "ready_for_pickup", "picked_up", "on_the_way"];

export function LiveOrderTrackingScreen() {
  const theme = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const route = useRoute<Props["route"]>();
  const { orderId } = route.params;

  const { data: order, isLoading, isError, refetch } = useOrderTracking(orderId);
  const cancelOrder = useCancelOrder();

  if (isLoading) return <LoadingOverlay />;
  if (isError || !order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  const restaurantCoords = { latitude: order.restaurant.latitude, longitude: order.restaurant.longitude };
  const destinationCoords = { latitude: order.address.latitude, longitude: order.address.longitude };
  const partnerCoords =
    order.deliveryPartner?.latitude && order.deliveryPartner?.longitude
      ? { latitude: order.deliveryPartner.latitude, longitude: order.deliveryPartner.longitude }
      : null;

  const canCancel = ACTIVE_STATUSES.includes(order.status) && order.status === "placed";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["bottom"]}>
      <View style={styles.mapWrapper}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: restaurantCoords.latitude,
            longitude: restaurantCoords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={restaurantCoords} title={order.restaurant.name} pinColor={theme.colors.primary} />
          <Marker coordinate={destinationCoords} title="Delivery Address" pinColor="#2E86DE" />
          {partnerCoords && <Marker coordinate={partnerCoords} title="Delivery Partner" pinColor="#3BB273" />}
          <Polyline
            coordinates={[restaurantCoords, ...(partnerCoords ? [partnerCoords] : []), destinationCoords]}
            strokeColor={theme.colors.primary}
            strokeWidth={3}
          />
        </MapView>
        <IconButton icon="arrow-left" mode="contained" style={styles.backButton} onPress={() => navigation.goBack()} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="titleMedium">Order #{order.orderNumber}</Text>
        <Text variant="bodyMedium" style={styles.statusText}>
          Current status: {formatOrderStatus(order.status)}
        </Text>

        {order.deliveryPartner && (
          <View style={[styles.partnerCard, { backgroundColor: theme.colors.surface }]}>
            {order.deliveryPartner.avatarUrl ? (
              <Avatar.Image size={48} source={{ uri: order.deliveryPartner.avatarUrl }} />
            ) : (
              <Avatar.Text size={48} label={order.deliveryPartner.name.slice(0, 2).toUpperCase()} />
            )}
            <View style={styles.partnerInfo}>
              <Text variant="titleSmall">{order.deliveryPartner.name}</Text>
              <Text variant="bodySmall" style={styles.partnerMeta}>
                {order.deliveryPartner.vehicleNumber ?? "Delivery Partner"} · ⭐ {order.deliveryPartner.rating.toFixed(1)}
              </Text>
            </View>
            <IconButton icon="phone" mode="contained-tonal" onPress={() => {}} />
          </View>
        )}

        <View style={styles.timelineWrapper}>
          <OrderTimeline timeline={order.timeline} currentStatus={order.status} />
        </View>

        {canCancel && (
          <Button
            mode="outlined"
            textColor={theme.colors.error}
            onPress={() => cancelOrder.mutate({ id: order.id })}
            loading={cancelOrder.isPending}
          >
            Cancel Order
          </Button>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapWrapper: { height: 260 },
  map: { flex: 1 },
  backButton: { position: "absolute", top: spacing.md, left: spacing.sm },
  content: { padding: spacing.lg },
  statusText: { opacity: 0.6, marginTop: 2, marginBottom: spacing.lg },
  partnerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: 14,
    marginBottom: spacing.lg,
  },
  partnerInfo: { flex: 1, marginLeft: spacing.sm },
  partnerMeta: { opacity: 0.6, marginTop: 2 },
  timelineWrapper: { marginBottom: spacing.lg },
});
