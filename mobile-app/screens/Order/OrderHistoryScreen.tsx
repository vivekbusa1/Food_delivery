import React, { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SegmentedButtons, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import type { MainStackNavigationProp } from "../../navigation/types";
import { useOrders, useReorder } from "../../hooks/useOrders";
import { OrderCard } from "../../components/OrderCard";
import { ListRowSkeleton } from "../../components/Skeleton";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { spacing } from "../../constants/theme";

type Filter = "active" | "past";

export function OrderHistoryScreen() {
  const theme = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const [filter, setFilter] = useState<Filter>("active");
  const { data: ordersData, isLoading, isError, refetch, isRefetching } = useOrders(filter);
  const orders = Array.isArray(ordersData) ? ordersData : [];
  const reorder = useReorder();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text variant="titleLarge">My Orders</Text>
        <SegmentedButtons
          value={filter}
          onValueChange={(value) => setFilter(value as Filter)}
          style={styles.segmented}
          buttons={[
            { value: "active", label: "Active" },
            { value: "past", label: "Past Orders" },
          ]}
        />
      </View>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <View style={styles.list}>
          <ListRowSkeleton />
          <ListRowSkeleton />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item, index) => item.id || `order-${index}`}
          contentContainerStyle={styles.list}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() =>
                filter === "active"
                  ? navigation.navigate("LiveOrderTracking", { orderId: item.id })
                  : navigation.navigate("OrderDetails", { orderId: item.id })
              }
              onReorder={filter === "past" ? () => reorder.mutate(item.id) : undefined}
              onRate={
                filter === "past"
                  ? () => navigation.navigate("RatingsReviews", { orderId: item.id, restaurantId: item.restaurant.id })
                  : undefined
              }
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="receipt"
              title={filter === "active" ? "No active orders" : "No past orders"}
              description={
                filter === "active"
                  ? "Your ongoing orders will show up here."
                  : "Your delivered and cancelled orders will show up here."
              }
            />
          }
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
});
