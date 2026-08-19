import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import type { MainStackNavigationProp } from "../../navigation/types";
import { useToggleWishlist, useWishlist } from "../../hooks/useWishlist";
import { FoodCard } from "../../components/FoodCard";
import { ListRowSkeleton } from "../../components/Skeleton";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { spacing } from "../../constants/theme";

export function WishlistScreen() {
  const theme = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const { data, isLoading, isError, refetch } = useWishlist();
  const items = Array.isArray(data) ? data : [];
  const toggleWishlist = useToggleWishlist();

  if (isError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ListRowSkeleton />
        <ListRowSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["bottom"]}>
      <FlatList
        data={items}
        keyExtractor={(item, index) => item.id || `wishlist-${index}`}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <FoodCard
            food={item}
            layout="horizontal"
            onPress={() => navigation.navigate("FoodDetails", { foodId: item.id })}
            onToggleWishlist={() => toggleWishlist.mutate({ foodId: item.id, isWishlisted: true })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="Your wishlist is empty"
            description="Tap the heart icon on any dish to save it here."
            actionLabel="Explore Food"
            onAction={() => navigation.navigate("MainTabs", { screen: "HomeTab" } as never)}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: spacing.lg },
});
