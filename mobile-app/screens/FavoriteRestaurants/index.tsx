import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import type { MainStackNavigationProp } from "../../navigation/types";
import { useFavoriteRestaurants, useToggleFavoriteRestaurant } from "../../hooks/useRestaurants";
import { RestaurantCard } from "../../components/RestaurantCard";
import { RestaurantCardSkeleton } from "../../components/Skeleton";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { spacing } from "../../constants/theme";

export function FavoriteRestaurantsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const { data, isLoading, isError, refetch } = useFavoriteRestaurants();
  const toggleFavorite = useToggleFavoriteRestaurant();

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
        <RestaurantCardSkeleton />
        <RestaurantCardSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["bottom"]}>
      <FlatList
        data={Array.isArray(data) ? data : []}
        keyExtractor={(item, index) => item.id || `favorite-${index}`}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => navigation.navigate("RestaurantDetails", { restaurantId: item.id })}
            onToggleFavorite={() => toggleFavorite.mutate({ id: item.id, isFavorite: true })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="No favorite restaurants yet"
            description="Tap the heart icon on a restaurant to add it here."
            actionLabel="Browse Restaurants"
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
