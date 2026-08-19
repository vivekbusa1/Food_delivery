import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Chip, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import type { MainStackNavigationProp } from "../../navigation/types";
import { SearchBar } from "../../components/SearchBar";
import { FoodCard } from "../../components/FoodCard";
import { EmptyState } from "../../components/EmptyState";
import { ListRowSkeleton } from "../../components/Skeleton";
import { useDebounce } from "../../hooks/useDebounce";
import { useFoodSearch } from "../../hooks/useFoods";
import { ASYNC_STORAGE_KEYS } from "../../constants/config";
import { spacing } from "../../constants/theme";

const MAX_RECENT = 6;

export function SearchScreen() {
  const theme = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debouncedQuery = useDebounce(query, 400);
  const { data, isLoading, isFetching } = useFoodSearch(debouncedQuery);

  useEffect(() => {
    void AsyncStorage.getItem(ASYNC_STORAGE_KEYS.recentSearches).then((stored) => {
      if (stored) setRecentSearches(JSON.parse(stored));
    });
  }, []);

  const persistSearch = async (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.recentSearches, JSON.stringify(updated));
  };

  const handleSubmit = () => {
    void persistSearch(query);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <View style={styles.header}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onSubmit={handleSubmit}
          onFilterPress={() => navigation.navigate("Filter")}
          autoFocus
        />
      </View>

      {!debouncedQuery && recentSearches.length > 0 && (
        <View style={styles.recentContainer}>
          <Text variant="titleSmall" style={styles.recentTitle}>
            Recent Searches
          </Text>
          <View style={styles.chipRow}>
            {recentSearches.map((term) => (
              <Chip key={term} style={styles.chip} onPress={() => setQuery(term)} icon="history">
                {term}
              </Chip>
            ))}
          </View>
        </View>
      )}

      {debouncedQuery ? (
        isLoading || isFetching ? (
          <View style={styles.listContent}>
            <ListRowSkeleton />
            <ListRowSkeleton />
            <ListRowSkeleton />
          </View>
        ) : (
          <FlatList
            data={data ?? []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <FoodCard
                food={item}
                layout="horizontal"
                onPress={() => {
                  void persistSearch(debouncedQuery);
                  navigation.navigate("FoodDetails", { foodId: item.id });
                }}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                icon="magnify"
                title="No results found"
                description={`We couldn't find anything for "${debouncedQuery}"`}
              />
            }
          />
        )
      ) : (
        <EmptyState icon="silverware-fork-knife" title="Search for food or restaurants" description="Try 'pizza', 'burger', or a restaurant name" />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  recentContainer: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  recentTitle: { marginBottom: spacing.sm },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: { marginBottom: spacing.xs },
  listContent: { padding: spacing.lg },
});
