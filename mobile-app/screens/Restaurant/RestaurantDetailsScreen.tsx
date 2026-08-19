import React, { useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Chip, Divider, IconButton, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { MainStackNavigationProp, MainStackParamList } from "../../navigation/types";
import { useRestaurant, useToggleFavoriteRestaurant } from "../../hooks/useRestaurants";
import { useFoodsInfinite } from "../../hooks/useFoods";
import { useRestaurantReviews } from "../../hooks/useReviews";
import { useAddToCart } from "../../hooks/useCart";
import { FoodCard } from "../../components/FoodCard";
import { RatingStars } from "../../components/RatingStars";
import { ReviewCard } from "../../components/ReviewCard";
import { LoadingOverlay } from "../../components/LoadingOverlay";
import { ErrorState } from "../../components/ErrorState";
import { EmptyState } from "../../components/EmptyState";
import { formatCurrency, formatDistance } from "../../utils/formatters";
import { spacing } from "../../constants/theme";

type Props = NativeStackScreenProps<MainStackParamList, "RestaurantDetails">;

export function RestaurantDetailsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const route = useRoute<Props["route"]>();
  const { restaurantId } = route.params;

  const { data: restaurant, isLoading, isError, refetch } = useRestaurant(restaurantId);
  const { data: foodPages, fetchNextPage, hasNextPage } = useFoodsInfinite({ restaurantId });
  const { data: reviewsData } = useRestaurantReviews(restaurantId);
  const reviews = Array.isArray(reviewsData) ? reviewsData : [];
  const toggleFavorite = useToggleFavoriteRestaurant();
  const addToCart = useAddToCart();

  const foods = useMemo(() => foodPages?.pages.flatMap((page) => page.items) ?? [], [foodPages]);

  if (isLoading) return <LoadingOverlay />;
  if (isError || !restaurant) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  const ListHeader = (
    <View>
      <View>
        <Image source={{ uri: restaurant.coverImageUrl ?? restaurant.imageUrl }} style={styles.cover} contentFit="cover" />
        <IconButton icon="arrow-left" mode="contained" style={styles.backButton} onPress={() => navigation.goBack()} />
        <IconButton
          icon={restaurant.isFavorite ? "heart" : "heart-outline"}
          mode="contained"
          iconColor={restaurant.isFavorite ? theme.colors.error : undefined}
          style={styles.favoriteButton}
          onPress={() => toggleFavorite.mutate({ id: restaurant.id, isFavorite: !!restaurant.isFavorite })}
        />
      </View>
      <View style={styles.info}>
        <Text variant="headlineSmall" style={styles.name}>
          {restaurant.name}
        </Text>
        <Text variant="bodyMedium" style={styles.cuisines}>
          {restaurant.cuisines.join(" • ")}
        </Text>
        <View style={styles.metaRow}>
          <RatingStars rating={restaurant.rating} count={restaurant.ratingCount} />
          <Text style={styles.dot}>•</Text>
          <Text variant="bodySmall">{restaurant.deliveryTimeMinutes} min</Text>
          {restaurant.distanceKm !== undefined && (
            <>
              <Text style={styles.dot}>•</Text>
              <Text variant="bodySmall">{formatDistance(restaurant.distanceKm)}</Text>
            </>
          )}
        </View>
        <View style={styles.chipsRow}>
          <Chip icon="bike-fast" compact style={styles.metaChip}>
            {formatCurrency(restaurant.deliveryFee)} delivery
          </Chip>
          <Chip icon="cash" compact style={styles.metaChip}>
            Min {formatCurrency(restaurant.minOrderAmount)}
          </Chip>
          <Chip
            icon={restaurant.isOpen ? "check-circle-outline" : "clock-outline"}
            compact
            style={styles.metaChip}
          >
            {restaurant.isOpen ? "Open now" : "Closed"}
          </Chip>
        </View>
        {!!restaurant.description && (
          <Text variant="bodyMedium" style={styles.description}>
            {restaurant.description}
          </Text>
        )}
        <Text variant="bodySmall" style={styles.address}>
          {restaurant.address}
        </Text>
      </View>
      <Divider />
      <Text variant="titleMedium" style={styles.menuTitle}>
        Menu
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["bottom"]}>
      <FlatList
        data={foods}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage) void fetchNextPage();
        }}
        renderItem={({ item }) => (
          <View style={styles.foodItem}>
            <FoodCard
              food={item}
              layout="horizontal"
              onPress={() => navigation.navigate("FoodDetails", { foodId: item.id })}
              onAdd={() => addToCart.mutate({ foodId: item.id, quantity: 1 })}
            />
          </View>
        )}
        ListFooterComponent={
          reviews.length > 0 ? (
            <View style={styles.reviewsSection}>
              <Text variant="titleMedium" style={styles.menuTitle}>
                Reviews
              </Text>
              {reviews.slice(0, 5).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </View>
          ) : null
        }
        ListEmptyComponent={<EmptyState icon="silverware-fork-knife" title="No dishes available yet" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: spacing.xxl },
  cover: { width: "100%", height: 220 },
  backButton: { position: "absolute", top: spacing.md, left: spacing.sm },
  favoriteButton: { position: "absolute", top: spacing.md, right: spacing.sm },
  info: { padding: spacing.lg },
  name: { fontWeight: "700" },
  cuisines: { opacity: 0.6, marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.sm, gap: 4 },
  dot: { opacity: 0.5, marginHorizontal: 4 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.md },
  metaChip: { marginBottom: spacing.xs },
  description: { marginTop: spacing.md, opacity: 0.8 },
  address: { marginTop: spacing.sm, opacity: 0.5 },
  menuTitle: { paddingHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.sm },
  foodItem: { paddingHorizontal: spacing.lg },
  reviewsSection: { marginTop: spacing.lg, paddingHorizontal: spacing.lg },
});
