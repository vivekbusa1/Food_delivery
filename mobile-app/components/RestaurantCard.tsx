import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { IconButton, Surface, Text, useTheme } from "react-native-paper";

import type { Restaurant } from "../types";
import { formatDistance } from "../utils/formatters";
import { spacing } from "../constants/theme";
import { RatingStars } from "./RatingStars";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  onToggleFavorite?: () => void;
}

export function RestaurantCard({ restaurant, onPress, onToggleFavorite }: RestaurantCardProps) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress}>
      <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: restaurant.imageUrl }} style={styles.image} contentFit="cover" transition={150} />
          {restaurant.discountLabel ? (
            <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
              <Text variant="labelSmall" style={styles.badgeText}>
                {restaurant.discountLabel}
              </Text>
            </View>
          ) : null}
          {onToggleFavorite && (
            <IconButton
              icon={restaurant.isFavorite ? "heart" : "heart-outline"}
              iconColor={restaurant.isFavorite ? theme.colors.error : "#fff"}
              size={18}
              style={styles.favoriteButton}
              onPress={onToggleFavorite}
            />
          )}
          {!restaurant.isOpen && (
            <View style={styles.closedOverlay}>
              <Text style={styles.closedText} variant="labelLarge">
                Closed
              </Text>
            </View>
          )}
        </View>
        <View style={styles.content}>
          <Text variant="titleMedium" numberOfLines={1}>
            {restaurant.name}
          </Text>
          <Text variant="bodySmall" style={styles.subtitle} numberOfLines={1}>
            {restaurant.cuisines.join(" • ")}
          </Text>
          <View style={styles.metaRow}>
            <RatingStars rating={restaurant.rating} count={restaurant.ratingCount} size={12} />
            <Text variant="bodySmall" style={styles.dot}>
              •
            </Text>
            <Text variant="bodySmall">{restaurant.deliveryTimeMinutes} min</Text>
            {restaurant.distanceKm !== undefined && (
              <>
                <Text variant="bodySmall" style={styles.dot}>
                  •
                </Text>
                <Text variant="bodySmall">{formatDistance(restaurant.distanceKm)}</Text>
              </>
            )}
          </View>
        </View>
      </Surface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, overflow: "hidden", marginBottom: spacing.lg },
  imageWrapper: { height: 150, width: "100%" },
  image: { width: "100%", height: "100%" },
  badge: {
    position: "absolute",
    left: spacing.sm,
    top: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: { color: "#fff", fontWeight: "700" },
  favoriteButton: {
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    margin: 6,
  },
  closedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  closedText: { color: "#fff", fontWeight: "700" },
  content: { padding: spacing.md },
  subtitle: { opacity: 0.65, marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.xs, gap: 4 },
  dot: { opacity: 0.5, marginHorizontal: 2 },
});
