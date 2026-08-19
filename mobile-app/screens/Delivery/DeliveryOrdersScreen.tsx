import React, { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Button, Card, SegmentedButtons, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import type { DeliveryStackNavigationProp } from "../../navigation/types";
import {
  useAcceptDeliveryOrder,
  useAvailableDeliveryOrders,
  useDeliveryHistory,
  useRejectDeliveryOrder,
} from "../../hooks/useDelivery";
import { OrderCard } from "../../components/OrderCard";
import { ListRowSkeleton } from "../../components/Skeleton";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { formatCurrency, formatDistance } from "../../utils/formatters";
import { spacing } from "../../constants/theme";

type Tab = "available" | "history";

export function DeliveryOrdersScreen() {
  const theme = useTheme();
  const navigation = useNavigation<DeliveryStackNavigationProp>();
  const [tab, setTab] = useState<Tab>("available");

  const availableOrders = useAvailableDeliveryOrders(tab === "available");
  const history = useDeliveryHistory();
  const acceptOrder = useAcceptDeliveryOrder();
  const rejectOrder = useRejectDeliveryOrder();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text variant="titleLarge">Orders</Text>
        <SegmentedButtons
          value={tab}
          onValueChange={(value) => setTab(value as Tab)}
          style={styles.segmented}
          buttons={[
            { value: "available", label: "Available" },
            { value: "history", label: "History" },
          ]}
        />
      </View>

      {tab === "available" ? (
        availableOrders.isError ? (
          <ErrorState onRetry={() => availableOrders.refetch()} />
        ) : availableOrders.isLoading ? (
          <View style={styles.list}>
            <ListRowSkeleton />
          </View>
        ) : (
          <FlatList
            data={Array.isArray(availableOrders.data) ? availableOrders.data : []}
            keyExtractor={(item, index) => item.order?.id || `available-${index}`}
            contentContainerStyle={styles.list}
            refreshing={availableOrders.isRefetching}
            onRefresh={() => availableOrders.refetch()}
            renderItem={({ item }) => (
              <Card style={styles.requestCard}>
                <Card.Content>
                  <Text variant="titleSmall">{item.order.restaurant.name}</Text>
                  <Text variant="bodySmall" style={styles.requestMeta}>
                    {formatDistance(item.distanceKm)} away · Est. earnings {formatCurrency(item.estimatedEarnings)}
                  </Text>
                  <View style={styles.requestActions}>
                    <Button
                      mode="outlined"
                      style={styles.requestButton}
                      onPress={() => rejectOrder.mutate(item.order.id)}
                      loading={rejectOrder.isPending}
                    >
                      Reject
                    </Button>
                    <Button
                      mode="contained"
                      style={styles.requestButton}
                      onPress={() =>
                        acceptOrder.mutate(item.order.id, {
                          onSuccess: () => navigation.navigate("DeliveryOrderMap", { orderId: item.order.id }),
                        })
                      }
                      loading={acceptOrder.isPending}
                    >
                      Accept
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            )}
            ListEmptyComponent={
              <EmptyState icon="moped-outline" title="No delivery requests" description="New orders will appear here when you're online." />
            }
          />
        )
      ) : history.isError ? (
        <ErrorState onRetry={() => history.refetch()} />
      ) : history.isLoading ? (
        <View style={styles.list}>
          <ListRowSkeleton />
        </View>
      ) : (
        <FlatList
          data={Array.isArray(history.data) ? history.data : []}
          keyExtractor={(item, index) => item.id || `history-${index}`}
          contentContainerStyle={styles.list}
          refreshing={history.isRefetching}
          onRefresh={() => history.refetch()}
          renderItem={({ item }) => <OrderCard order={item} onPress={() => {}} />}
          ListEmptyComponent={<EmptyState icon="package-variant-closed" title="No completed deliveries yet" />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md, gap: spacing.md },
  segmented: {},
  list: { paddingHorizontal: spacing.lg },
  requestCard: { marginBottom: spacing.md },
  requestMeta: { opacity: 0.6, marginTop: 2, marginBottom: spacing.md },
  requestActions: { flexDirection: "row", gap: spacing.sm },
  requestButton: { flex: 1 },
});
