import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { MainStackNavigationProp, MainStackParamList } from "../../navigation/types";
import { useRestaurantsInfinite, useToggleFavoriteRestaurant } from "../../hooks/useRestaurants";
import { useLocation } from "../../hooks/useLocation";
import { useFilterStore } from "../../store/useFilterStore";
import { RestaurantCard } from "../../components/RestaurantCard";
import { RestaurantCardSkeleton } from "../../components/Skeleton";
import { SearchBar } from "../../components/SearchBar";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { spacing } from "../../constants/theme";

type Props = NativeStackScreenProps<MainStackParamList, "RestaurantList">;

export function RestaurantListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const route = useRoute<Props["route"]>();
  const categoryId = route.params?.categoryId;
  const [search, setSearch] = useState("");

  const { coordinates } = useLocation();
  const filters = useFilterStore();
  const toggleFavorite = useToggleFavoriteRestaurant();

  const queryParams = useMemo(
    () => ({
      categoryId,
      search: search || undefined,
      minRating: filters.minRating || undefined,
      maxPrice: filters.maxPrice ?? undefined,
      sortBy: filters.sortBy ?? undefined,
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
    }),
    [categoryId, search, filters, coordinates],
  );

  const { data, isLoading, isError, isRefetching, refetch, fetchNextPage, hasNextPage } =
    useRestaurantsInfinite(queryParams);

  const restaurants = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  if (isError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["bottom"]}>
      <View style={styles.searchWrapper}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search restaurants"
          onFilterPress={() => navigation.navigate("Filter")}
        />
      </View>

      {isLoading ? (
        <View style={styles.list}>
          <RestaurantCardSkeleton />
          <RestaurantCardSkeleton />
          <RestaurantCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={isRefetching}
          onRefresh={refetch}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage) void fetchNextPage();
          }}
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              onPress={() => navigation.navigate("RestaurantDetails", { restaurantId: item.id })}
              onToggleFavorite={() => toggleFavorite.mutate({ id: item.id, isFavorite: !!item.isFavorite })}
            />
          )}
          ListEmptyComponent={
            <EmptyState icon="store-search-outline" title="No restaurants found" description="Try a different search or filter." />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrapper: { padding: spacing.lg, paddingBottom: 0 },
  list: { padding: spacing.lg },
});
