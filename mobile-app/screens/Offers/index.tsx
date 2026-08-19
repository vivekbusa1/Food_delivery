import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Button, Card, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";

import { useOffers } from "../../hooks/useCategories";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { formatDate } from "../../utils/formatters";
import { spacing } from "../../constants/theme";

export function OffersScreen() {
  const theme = useTheme();
  const { data, isLoading, isError, refetch } = useOffers();

  const copyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Toast.show({ type: "success", text1: "Coupon code copied", text2: code });
  };

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
        keyExtractor={(item, index) => item.id || `offer-${index}`}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" />
            <Card.Content style={styles.content}>
              <Text variant="titleMedium">{item.title}</Text>
              <Text variant="bodyMedium" style={styles.description}>
                {item.description}
              </Text>
              {item.validUntil && (
                <Text variant="labelSmall" style={styles.validity}>
                  Valid until {formatDate(item.validUntil)}
                </Text>
              )}
              {item.code && (
                <View style={styles.codeRow}>
                  <Text variant="titleSmall" style={{ color: theme.colors.primary }}>
                    {item.code}
                  </Text>
                  <Button mode="outlined" compact onPress={() => copyCode(item.code as string)}>
                    Copy Code
                  </Button>
                </View>
              )}
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={!isLoading ? <EmptyState icon="tag-off-outline" title="No offers right now" description="Check back soon for new deals." /> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: spacing.lg },
  card: { marginBottom: spacing.lg, borderRadius: 16, overflow: "hidden" },
  image: { width: "100%", height: 140 },
  content: { paddingVertical: spacing.md },
  description: { opacity: 0.7, marginTop: spacing.xs },
  validity: { opacity: 0.5, marginTop: spacing.xs },
  codeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 10,
    padding: spacing.sm,
  },
});
