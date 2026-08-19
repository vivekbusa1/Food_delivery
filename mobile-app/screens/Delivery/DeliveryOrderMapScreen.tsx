import React, { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import { Button, IconButton, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { useActiveDeliveryOrder, useUpdateDeliveryLocation, useUpdateDeliveryOrderStatus } from "../../hooks/useDelivery";
import { useLocation } from "../../hooks/useLocation";
import { LoadingOverlay } from "../../components/LoadingOverlay";
import { ErrorState } from "../../components/ErrorState";
import { formatOrderStatus } from "../../utils/formatters";
import { spacing } from "../../constants/theme";
import type { OrderStatus } from "../../types";

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  confirmed: "preparing",
  preparing: "ready_for_pickup",
  ready_for_pickup: "picked_up",
  picked_up: "on_the_way",
  on_the_way: "delivered",
};

const ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  confirmed: "Mark as Preparing",
  preparing: "Mark Ready for Pickup",
  ready_for_pickup: "Confirm Pickup",
  picked_up: "Start Delivery",
  on_the_way: "Mark as Delivered",
};

export function DeliveryOrderMapScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { data: order, isLoading, isError, refetch } = useActiveDeliveryOrder();
  const updateStatus = useUpdateDeliveryOrderStatus();
  const { coordinates } = useLocation();
  const updateLocation = useUpdateDeliveryLocation();

  useEffect(() => {
    if (coordinates) updateLocation.mutate(coordinates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinates]);

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
  const nextStatus = NEXT_STATUS[order.status];

  const handleAdvanceStatus = () => {
    if (!nextStatus) return;
    updateStatus.mutate(
      { orderId: order.id, status: nextStatus },
      {
        onSuccess: () => {
          if (nextStatus === "delivered") navigation.goBack();
        },
      },
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["bottom"]}>
      <View style={styles.mapWrapper}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: coordinates?.latitude ?? restaurantCoords.latitude,
            longitude: coordinates?.longitude ?? restaurantCoords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={restaurantCoords} title={order.restaurant.name} pinColor={theme.colors.primary} />
          <Marker coordinate={destinationCoords} title="Customer" pinColor="#2E86DE" />
          {coordinates && <Marker coordinate={coordinates} title="You" pinColor="#3BB273" />}
          <Polyline coordinates={[restaurantCoords, destinationCoords]} strokeColor={theme.colors.primary} strokeWidth={3} />
        </MapView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="titleMedium">Order #{order.orderNumber}</Text>
        <Text variant="bodyMedium" style={styles.statusText}>
          Status: {formatOrderStatus(order.status)}
        </Text>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardRow}>
            <IconButton icon="storefront-outline" size={20} />
            <View style={styles.cardText}>
              <Text variant="titleSmall">Pickup</Text>
              <Text variant="bodySmall">{order.restaurant.name}</Text>
            </View>
          </View>
          <View style={styles.cardRow}>
            <IconButton icon="flag-checkered" size={20} />
            <View style={styles.cardText}>
              <Text variant="titleSmall">Drop-off</Text>
              <Text variant="bodySmall">
                {order.address.addressLine1}, {order.address.city}
              </Text>
            </View>
          </View>
        </View>

        {nextStatus && (
          <Button mode="contained" onPress={handleAdvanceStatus} loading={updateStatus.isPending} contentStyle={styles.actionContent}>
            {ACTION_LABEL[order.status]}
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
  content: { padding: spacing.lg },
  statusText: { opacity: 0.6, marginTop: 2, marginBottom: spacing.lg },
  card: { borderRadius: 14, padding: spacing.sm, marginBottom: spacing.lg },
  cardRow: { flexDirection: "row", alignItems: "center" },
  cardText: { flex: 1 },
  actionContent: { height: 50 },
});
