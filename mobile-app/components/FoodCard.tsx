import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { IconButton, Surface, Text, useTheme } from "react-native-paper";

import type { Food } from "../types";
import { formatCurrency } from "../utils/formatters";
import { spacing } from "../constants/theme";
import { RatingStars } from "./RatingStars";
import { VegBadge } from "./VegBadge";

interface FoodCardProps {
  food: Food;
  onPress: () => void;
  onAdd?: () => void;
  onToggleWishlist?: () => void;
  layout?: "vertical" | "horizontal";
}

export function FoodCard({ food, onPress, onAdd, onToggleWishlist, layout = "vertical" }: FoodCardProps) {
  const theme = useTheme();
  const hasDiscount = !!food.discountedPrice && food.discountedPrice < food.price;

  if (layout === "horizontal") {
    return (
      <Pressable onPress={onPress}>
        <Surface style={[styles.rowCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <Image source={{ uri: food.imageUrl }} style={styles.rowImage} contentFit="cover" />
          <View style={styles.rowContent}>
            <VegBadge isVeg={food.isVeg} />
            <Text variant="titleSmall" numberOfLines={1} style={styles.rowTitle}>
              {food.name}
            </Text>
            {!!food.restaurantName && (
              <Text variant="bodySmall" style={styles.subtitle} numberOfLines={1}>
                {food.restaurantName}
              </Text>
            )}
            <RatingStars rating={food.rating} count={food.ratingCount} size={11} />
            <View style={styles.priceRow}>
              <Text variant="titleSmall" style={{ color: theme.colors.primary }}>
                {formatCurrency(hasDiscount ? food.discountedPrice! : food.price)}
              </Text>
              {hasDiscount && (
                <Text variant="bodySmall" style={styles.strikethrough}>
                  {formatCurrency(food.price)}
                </Text>
              )}
            </View>
          </View>
          {onAdd && (
            <IconButton icon="plus-circle" iconColor={theme.colors.primary} size={28} onPress={onAdd} />
          )}
        </Surface>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={styles.verticalCard}>
      <Surface style={[styles.verticalSurface, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: food.imageUrl }} style={styles.verticalImage} contentFit="cover" />
          {onToggleWishlist && (
            <IconButton
              icon={food.isWishlisted ? "heart" : "heart-outline"}
              iconColor={food.isWishlisted ? theme.colors.error : "#fff"}
              size={16}
              style={styles.wishlistButton}
              onPress={onToggleWishlist}
            />
          )}
        </View>
        <View style={styles.verticalContent}>
          <VegBadge isVeg={food.isVeg} />
          <Text variant="titleSmall" numberOfLines={1}>
            {food.name}
          </Text>
          <RatingStars rating={food.rating} count={food.ratingCount} size={11} />
          <View style={styles.priceRow}>
            <Text variant="titleSmall" style={{ color: theme.colors.primary }}>
              {formatCurrency(hasDiscount ? food.discountedPrice! : food.price)}
            </Text>
            {hasDiscount && (
              <Text variant="bodySmall" style={styles.strikethrough}>
                {formatCurrency(food.price)}
              </Text>
            )}
          </View>
          {onAdd && (
            <IconButton
              icon="plus"
              mode="contained"
              size={16}
              style={styles.addButton}
              onPress={onAdd}
            />
          )}
        </View>
      </Surface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  verticalCard: { width: 160 },
  verticalSurface: { borderRadius: 16, overflow: "hidden" },
  imageWrapper: { height: 110, width: "100%" },
  verticalImage: { width: "100%", height: "100%" },
  wishlistButton: {
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    margin: 4,
  },
  verticalContent: { padding: spacing.sm, gap: 2 },
  rowCard: {
    flexDirection: "row",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: spacing.md,
    alignItems: "center",
  },
  rowImage: { width: 90, height: 90 },
  rowContent: { flex: 1, padding: spacing.sm, gap: 2 },
  rowTitle: { marginTop: 2 },
  subtitle: { opacity: 0.6 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  strikethrough: { textDecorationLine: "line-through", opacity: 0.5 },
  addButton: { position: "absolute", right: -4, bottom: -4, margin: 0 },
});
