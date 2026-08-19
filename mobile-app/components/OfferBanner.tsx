import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Text } from "react-native-paper";

import type { Offer } from "../types";
import { spacing } from "../constants/theme";

interface OfferBannerProps {
  offer: Offer;
  onPress: () => void;
}

export function OfferBanner({ offer, onPress }: OfferBannerProps) {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image source={{ uri: offer.imageUrl }} style={styles.image} contentFit="cover" />
      <View style={styles.overlay}>
        <Text variant="titleMedium" style={styles.title}>
          {offer.title}
        </Text>
        <Text variant="bodySmall" style={styles.description} numberOfLines={1}>
          {offer.description}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { width: 280, height: 130, borderRadius: 16, overflow: "hidden", marginRight: spacing.md },
  image: { width: "100%", height: "100%" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
    padding: spacing.md,
    justifyContent: "flex-end",
  },
  title: { color: "#fff", fontWeight: "700" },
  description: { color: "#fff", opacity: 0.9 },
});
