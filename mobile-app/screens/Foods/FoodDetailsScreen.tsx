import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Button, Checkbox, Divider, IconButton, RadioButton, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { MainStackNavigationProp, MainStackParamList } from "../../navigation/types";
import { useFood } from "../../hooks/useFoods";
import { useAddToCart } from "../../hooks/useCart";
import { useToggleWishlist } from "../../hooks/useWishlist";
import { useFoodReviews } from "../../hooks/useReviews";
import { QuantityStepper } from "../../components/QuantityStepper";
import { VegBadge } from "../../components/VegBadge";
import { RatingStars } from "../../components/RatingStars";
import { ReviewCard } from "../../components/ReviewCard";
import { LoadingOverlay } from "../../components/LoadingOverlay";
import { ErrorState } from "../../components/ErrorState";
import { formatCurrency } from "../../utils/formatters";
import { spacing } from "../../constants/theme";
import type { CartItemOptionSelection } from "../../types";

type Props = NativeStackScreenProps<MainStackParamList, "FoodDetails">;

export function FoodDetailsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const route = useRoute<Props["route"]>();
  const { foodId } = route.params;

  const { data: food, isLoading, isError, refetch } = useFood(foodId);
  const { data: reviewsData } = useFoodReviews(foodId);
  const reviews = Array.isArray(reviewsData) ? reviewsData : [];
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();

  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Record<string, string[]>>({});

  const optionsTotal = useMemo(() => {
    if (!food?.optionGroups) return 0;
    return food.optionGroups.reduce((sum, group) => {
      const chosen = selections[group.id] ?? [];
      const groupTotal = group.options
        .filter((option) => chosen.includes(option.id))
        .reduce((groupSum, option) => groupSum + option.priceDelta, 0);
      return sum + groupTotal;
    }, 0);
  }, [food, selections]);

  const unitPrice = (food?.discountedPrice ?? food?.price ?? 0) + optionsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleOption = (groupId: string, optionId: string, multiSelect: boolean) => {
    setSelections((prev) => {
      const current = prev[groupId] ?? [];
      if (multiSelect) {
        const next = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return { ...prev, [groupId]: next };
      }
      return { ...prev, [groupId]: [optionId] };
    });
  };

  const handleAddToCart = () => {
    if (!food) return;
    const selectedOptions: CartItemOptionSelection[] = Object.entries(selections)
      .filter(([, optionIds]) => optionIds.length > 0)
      .map(([groupId, optionIds]) => ({ groupId, optionIds }));

    addToCart.mutate(
      { foodId: food.id, quantity, selectedOptions },
      {
        onSuccess: () => navigation.navigate("MainTabs", { screen: "CartTab" } as never),
      },
    );
  };

  if (isLoading) return <LoadingOverlay />;
  if (isError || !food) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  const hasDiscount = !!food.discountedPrice && food.discountedPrice < food.price;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["bottom"]}>
      <ScrollView>
        <View>
          <Image source={{ uri: food.imageUrl }} style={styles.image} contentFit="cover" />
          <IconButton icon="arrow-left" mode="contained" style={styles.backButton} onPress={() => navigation.goBack()} />
          <IconButton
            icon={food.isWishlisted ? "heart" : "heart-outline"}
            mode="contained"
            iconColor={food.isWishlisted ? theme.colors.error : undefined}
            style={styles.wishlistButton}
            onPress={() => toggleWishlist.mutate({ foodId: food.id, isWishlisted: !!food.isWishlisted })}
          />
        </View>

        <View style={styles.content}>
          <VegBadge isVeg={food.isVeg} />
          <Text variant="headlineSmall" style={styles.title}>
            {food.name}
          </Text>
          {!!food.restaurantName && (
            <Text variant="bodyMedium" style={styles.restaurant}>
              from {food.restaurantName}
            </Text>
          )}
          <RatingStars rating={food.rating} count={food.ratingCount} />
          <View style={styles.priceRow}>
            <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
              {formatCurrency(food.discountedPrice ?? food.price)}
            </Text>
            {hasDiscount && (
              <Text variant="titleMedium" style={styles.strikethrough}>
                {formatCurrency(food.price)}
              </Text>
            )}
          </View>
          {!!food.description && (
            <Text variant="bodyMedium" style={styles.description}>
              {food.description}
            </Text>
          )}

          {food.optionGroups?.map((group) => (
            <View key={group.id} style={styles.optionGroup}>
              <Divider style={styles.divider} />
              <View style={styles.optionGroupHeader}>
                <Text variant="titleSmall">{group.name}</Text>
                {group.required && (
                  <Text variant="labelSmall" style={{ color: theme.colors.error }}>
                    Required
                  </Text>
                )}
              </View>
              {group.options.map((option) => {
                const isSelected = (selections[group.id] ?? []).includes(option.id);
                return (
                  <View key={option.id} style={styles.optionRow}>
                    {group.multiSelect ? (
                      <Checkbox
                        status={isSelected ? "checked" : "unchecked"}
                        onPress={() => toggleOption(group.id, option.id, true)}
                      />
                    ) : (
                      <RadioButton
                        value={option.id}
                        status={isSelected ? "checked" : "unchecked"}
                        onPress={() => toggleOption(group.id, option.id, false)}
                      />
                    )}
                    <Text variant="bodyMedium" style={styles.optionLabel}>
                      {option.name}
                    </Text>
                    {option.priceDelta > 0 && (
                      <Text variant="bodySmall">+{formatCurrency(option.priceDelta)}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          ))}

          {reviews.length > 0 && (
            <View style={styles.reviewsSection}>
              <Divider style={styles.divider} />
              <Text variant="titleMedium" style={styles.reviewsTitle}>
                Reviews
              </Text>
              {reviews.slice(0, 3).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outlineVariant }]}>
        <QuantityStepper quantity={quantity} onIncrement={() => setQuantity((q) => q + 1)} onDecrement={() => setQuantity((q) => Math.max(1, q - 1))} />
        <Button
          mode="contained"
          style={styles.addButton}
          contentStyle={styles.addButtonContent}
          loading={addToCart.isPending}
          onPress={handleAddToCart}
        >
          Add to Cart · {formatCurrency(totalPrice)}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { width: "100%", height: 260 },
  backButton: { position: "absolute", top: spacing.md, left: spacing.sm },
  wishlistButton: { position: "absolute", top: spacing.md, right: spacing.sm },
  content: { padding: spacing.lg },
  title: { marginTop: spacing.xs, fontWeight: "700" },
  restaurant: { opacity: 0.6, marginTop: 2 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm },
  strikethrough: { textDecorationLine: "line-through", opacity: 0.5 },
  description: { marginTop: spacing.md, opacity: 0.8, lineHeight: 20 },
  optionGroup: { marginTop: spacing.md },
  divider: { marginBottom: spacing.md },
  optionGroupHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
  optionRow: { flexDirection: "row", alignItems: "center" },
  optionLabel: { flex: 1 },
  reviewsSection: { marginTop: spacing.md },
  reviewsTitle: { marginBottom: spacing.sm },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  addButton: { flex: 1, borderRadius: 12 },
  addButtonContent: { height: 44 },
});
