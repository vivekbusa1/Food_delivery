import React, { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Badge, IconButton, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import type { MainStackNavigationProp } from "../../navigation/types";
import { SearchBar } from "../../components/SearchBar";
import { SectionHeader } from "../../components/SectionHeader";
import { CategoryChip } from "../../components/CategoryChip";
import { OfferBanner } from "../../components/OfferBanner";
import { FoodCard } from "../../components/FoodCard";
import { RestaurantCard } from "../../components/RestaurantCard";
import { RestaurantCardSkeleton, FoodCardSkeleton } from "../../components/Skeleton";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { useCategories, useOffers } from "../../hooks/useCategories";
import { usePopularFoods, useRecommendedFoods } from "../../hooks/useFoods";
import { useRestaurantsInfinite, useToggleFavoriteRestaurant } from "../../hooks/useRestaurants";
import { useNotifications } from "../../hooks/useNotifications";
import { useLocation } from "../../hooks/useLocation";
import { useResponsive } from "../../hooks/useResponsive";
import { spacing } from "../../constants/theme";
import type { Restaurant } from "../../types";

export function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const [search, setSearch] = useState("");
  const { coordinates } = useLocation();
  const { contentPadding, restaurantColumns } = useResponsive();

  const categories = useCategories();
  const offers = useOffers();
  const popularFoods = usePopularFoods();
  const recommendedFoods = useRecommendedFoods();
  const notifications = useNotifications();
  const toggleFavorite = useToggleFavoriteRestaurant();

  const restaurants = useRestaurantsInfinite(
    coordinates ? { latitude: coordinates.latitude, longitude: coordinates.longitude } : {},
  );

  const unreadCount = Array.isArray(notifications.data)
    ? notifications.data.filter((item) => !item.isRead).length
    : 0;
  const restaurantItems = useMemo(
    () => restaurants.data?.pages.flatMap((page) => page.items) ?? [],
    [restaurants.data],
  );

  const handleSearchSubmit = useCallback(() => {
    navigation.navigate("MainTabs", { screen: "SearchTab" } as never);
  }, [navigation]);

  const renderRestaurant = useCallback(
    ({ item }: { item: Restaurant }) => (
      <View style={restaurantColumns > 1 ? styles.gridItem : undefined}>
        <RestaurantCard
          restaurant={item}
          onPress={() => navigation.navigate("RestaurantDetails", { restaurantId: item.id })}
          onToggleFavorite={() => toggleFavorite.mutate({ id: item.id, isFavorite: !!item.isFavorite })}
        />
      </View>
    ),
    [navigation, toggleFavorite, restaurantColumns],
  );

  const ListHeader = (
    <View style={styles.headerContent}>
      <View style={styles.topRow}>
        <View>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Deliver to
          </Text>
          <Text variant="titleMedium">
            {coordinates ? "Current Location" : "Set your location"}
          </Text>
        </View>
        <View>
          <IconButton icon="bell-outline" onPress={() => navigation.navigate("Notifications")} />
          {unreadCount > 0 && <Badge style={styles.badge}>{unreadCount}</Badge>}
        </View>
      </View>

      <SearchBar
        value={search}
        onChangeText={setSearch}
        onSubmit={handleSearchSubmit}
        onFilterPress={() => navigation.navigate("Filter")}
        style={styles.searchBar}
      />

      <SectionHeader title="Categories" actionLabel="See all" onAction={() => navigation.navigate("Categories")} />
      {categories.isLoading ? (
        <Text style={styles.mutedText}>Loading categories…</Text>
      ) : (
        <FlatList
          data={categories.data ?? []}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => item.id || `category-${index}`}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <CategoryChip
              category={item}
              onPress={() => navigation.navigate("RestaurantList", { categoryId: item.id, title: item.name })}
            />
          )}
        />
      )}

      {(offers.data?.length ?? 0) > 0 && (
        <>
          <SectionHeader title="Offers for you" actionLabel="See all" onAction={() => navigation.navigate("Offers")} />
          <FlatList
            data={offers.data ?? []}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => item.id || `offer-${index}`}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => <OfferBanner offer={item} onPress={() => navigation.navigate("Offers")} />}
          />
        </>
      )}

      <SectionHeader
        title="Popular Foods"
        actionLabel="See all"
        onAction={() => navigation.navigate("PopularFoods")}
      />
      {popularFoods.isLoading ? (
        <View style={styles.horizontalList}>
          <FoodCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={popularFoods.data ?? []}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => item.id || `popular-${index}`}
          contentContainerStyle={styles.horizontalList}
          ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
          renderItem={({ item }) => (
            <FoodCard food={item} onPress={() => navigation.navigate("FoodDetails", { foodId: item.id })} />
          )}
        />
      )}

      <SectionHeader
        title="Recommended for you"
        actionLabel="See all"
        onAction={() => navigation.navigate("Recommended")}
      />
      {recommendedFoods.isLoading ? (
        <View style={styles.horizontalList}>
          <FoodCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={recommendedFoods.data ?? []}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => item.id || `recommended-${index}`}
          contentContainerStyle={styles.horizontalList}
          ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
          renderItem={({ item }) => (
            <FoodCard food={item} onPress={() => navigation.navigate("FoodDetails", { foodId: item.id })} />
          )}
        />
      )}

      <SectionHeader title="Restaurants near you" />
    </View>
  );

  if (restaurants.isError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState message="Could not load restaurants" onRetry={() => restaurants.refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <FlatList
        data={restaurantItems}
        key={`restaurants-${restaurantColumns}`}
        keyExtractor={(item, index) => item.id || `restaurant-${index}`}
        renderItem={renderRestaurant}
        ListHeaderComponent={ListHeader}
        numColumns={restaurantColumns}
        columnWrapperStyle={restaurantColumns > 1 ? styles.columnWrapper : undefined}
        contentContainerStyle={[styles.listContent, { padding: contentPadding }]}
        refreshing={restaurants.isRefetching}
        onRefresh={() => restaurants.refetch()}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (restaurants.hasNextPage) void restaurants.fetchNextPage();
        }}
        ListEmptyComponent={
          restaurants.isLoading ? (
            <View>
              <RestaurantCardSkeleton />
              <RestaurantCardSkeleton />
            </View>
          ) : (
            <EmptyState icon="store-search-outline" title="No restaurants found" description="Try adjusting your location or filters." />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: spacing.xxl },
  headerContent: { marginBottom: spacing.sm },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  badge: { position: "absolute", top: 4, right: 4 },
  searchBar: { marginTop: spacing.sm, marginBottom: spacing.lg },
  horizontalList: { paddingBottom: spacing.lg, gap: spacing.md },
  mutedText: { opacity: 0.6, marginBottom: spacing.lg },
  columnWrapper: { gap: spacing.md },
  gridItem: { flex: 1, marginBottom: spacing.md },
});
