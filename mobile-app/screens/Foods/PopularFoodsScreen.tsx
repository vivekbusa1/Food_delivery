import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import type { MainStackNavigationProp } from "../../navigation/types";
import { usePopularFoods } from "../../hooks/useFoods";
import { useToggleWishlist } from "../../hooks/useWishlist";
import { FoodCard } from "../../components/FoodCard";
import { ListRowSkeleton } from "../../components/Skeleton";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { spacing } from "../../constants/theme";

export function PopularFoodsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const { data, isLoading, isError, refetch } = usePopularFoods();
  const toggleWishlist = useToggleWishlist();

  if (isError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ListRowSkeleton />
        <ListRowSkeleton />
        <ListRowSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["bottom"]}>
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <FoodCard
            food={item}
            layout="horizontal"
            onPress={() => navigation.navigate("FoodDetails", { foodId: item.id })}
            onToggleWishlist={() => toggleWishlist.mutate({ foodId: item.id, isWishlisted: !!item.isWishlisted })}
          />
        )}
        ListEmptyComponent={<EmptyState icon="fire" title="No popular foods yet" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: spacing.lg },
});
