import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Button, Chip, SegmentedButtons, Switch, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { useFilterStore, type SortOption } from "../../store/useFilterStore";
import { spacing } from "../../constants/theme";

const ratingOptions = [0, 3, 3.5, 4, 4.5];
const priceOptions = [
  { label: "Any", value: null },
  { label: "$", value: 1 },
  { label: "$$", value: 2 },
  { label: "$$$", value: 3 },
  { label: "$$$$", value: 4 },
];
const sortOptions: { label: string; value: SortOption }[] = [
  { label: "Rating", value: "rating" },
  { label: "Delivery Time", value: "deliveryTime" },
  { label: "Distance", value: "distance" },
];

export function FilterScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const filterStore = useFilterStore();

  const [minRating, setMinRating] = useState(filterStore.minRating);
  const [maxPrice, setMaxPrice] = useState<number | null>(filterStore.maxPrice);
  const [sortBy, setSortBy] = useState<SortOption | null>(filterStore.sortBy);
  const [vegOnly, setVegOnly] = useState(filterStore.vegOnly);

  const applyFilters = () => {
    filterStore.setMinRating(minRating);
    filterStore.setMaxPrice(maxPrice);
    filterStore.setSortBy(sortBy);
    filterStore.setVegOnly(vegOnly);
    navigation.goBack();
  };

  const clearFilters = () => {
    setMinRating(0);
    setMaxPrice(null);
    setSortBy(null);
    setVegOnly(false);
    filterStore.reset();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Minimum Rating
        </Text>
        <View style={styles.chipRow}>
          {ratingOptions.map((rating) => (
            <Chip key={rating} selected={minRating === rating} onPress={() => setMinRating(rating)} style={styles.chip}>
              {rating === 0 ? "Any" : `${rating}+`}
            </Chip>
          ))}
        </View>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Price Range
        </Text>
        <View style={styles.chipRow}>
          {priceOptions.map((option) => (
            <Chip
              key={option.label}
              selected={maxPrice === option.value}
              onPress={() => setMaxPrice(option.value)}
              style={styles.chip}
            >
              {option.label}
            </Chip>
          ))}
        </View>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Sort By
        </Text>
        <SegmentedButtons
          value={sortBy ?? ""}
          onValueChange={(value) => setSortBy((value || null) as SortOption | null)}
          buttons={sortOptions.map((option) => ({ label: option.label, value: option.value }))}
        />

        <View style={styles.switchRow}>
          <Text variant="titleMedium">Vegetarian Only</Text>
          <Switch value={vegOnly} onValueChange={setVegOnly} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button mode="outlined" onPress={clearFilters} style={styles.footerButton}>
          Clear All
        </Button>
        <Button mode="contained" onPress={applyFilters} style={styles.footerButton}>
          Apply Filters
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  sectionTitle: { marginTop: spacing.lg, marginBottom: spacing.sm },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: { marginBottom: spacing.xs },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xl,
  },
  footer: { flexDirection: "row", gap: spacing.md, padding: spacing.lg },
  footerButton: { flex: 1 },
});
