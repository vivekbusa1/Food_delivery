import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Text, useTheme } from "react-native-paper";

import type { Category } from "../types";

interface CategoryChipProps {
  category: Category;
  selected?: boolean;
  onPress: () => void;
}

export function CategoryChip({ category, selected, onPress }: CategoryChipProps) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View
        style={[
          styles.imageWrapper,
          {
            borderColor: selected ? theme.colors.primary : "transparent",
            backgroundColor: theme.colors.surfaceVariant,
          },
        ]}
      >
        <Image source={{ uri: category.imageUrl }} style={styles.image} contentFit="cover" />
      </View>
      <Text variant="labelMedium" numberOfLines={1} style={styles.label}>
        {category.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", width: 72 },
  imageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "100%", height: "100%" },
  label: { marginTop: 6, textAlign: "center" },
});
