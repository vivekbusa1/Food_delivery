import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Card, Text, useTheme } from "react-native-paper";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";

import type { MainStackNavigationProp } from "../../navigation/types";
import { useCategories } from "../../hooks/useCategories";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { spacing } from "../../constants/theme";

export function CategoriesScreen() {
  const theme = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const { data, isLoading, isError, refetch } = useCategories();

  if (isError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["bottom"]}>
      <FlatList
        data={Array.isArray(data) ? data : []}
        keyExtractor={(item, index) => item.id || `category-${index}`}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.column}
        refreshing={isLoading}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() => navigation.navigate("RestaurantList", { categoryId: item.id, title: item.name })}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" />
            <Card.Content style={styles.cardContent}>
              <Text variant="titleSmall">{item.name}</Text>
              {item.itemCount !== undefined && (
                <Text variant="bodySmall" style={styles.count}>
                  {item.itemCount} items
                </Text>
              )}
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          !isLoading ? <EmptyState icon="shape-outline" title="No categories available" /> : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  grid: { padding: spacing.md },
  column: { gap: spacing.md },
  card: { flex: 1, marginBottom: spacing.md, borderRadius: 16, overflow: "hidden" },
  image: { width: "100%", height: 100 },
  cardContent: { paddingVertical: spacing.sm },
  count: { opacity: 0.6, marginTop: 2 },
});
