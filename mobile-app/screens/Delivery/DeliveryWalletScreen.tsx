import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Card, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDeliveryWallet } from "../../hooks/useDelivery";
import { LoadingOverlay } from "../../components/LoadingOverlay";
import { ErrorState } from "../../components/ErrorState";
import { EmptyState } from "../../components/EmptyState";
import { formatCurrency, formatDateTime } from "../../utils/formatters";
import { spacing } from "../../constants/theme";
import type { DeliveryWalletTransaction } from "../../types";

export function DeliveryWalletScreen() {
  const theme = useTheme();
  const { data, isLoading, isError, refetch } = useDeliveryWallet();

  if (isLoading) return <LoadingOverlay />;
  if (isError || !data) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  const renderTransaction = ({ item }: { item: DeliveryWalletTransaction }) => (
    <View style={styles.transactionRow}>
      <MaterialCommunityIcons
        name={item.type === "credit" ? "arrow-down-circle-outline" : "arrow-up-circle-outline"}
        size={28}
        color={item.type === "credit" ? "#3BB273" : theme.colors.error}
      />
      <View style={styles.transactionContent}>
        <Text variant="bodyMedium">{item.description}</Text>
        <Text variant="labelSmall" style={styles.transactionDate}>
          {formatDateTime(item.createdAt)}
        </Text>
      </View>
      <Text variant="titleSmall" style={{ color: item.type === "credit" ? "#3BB273" : theme.colors.error }}>
        {item.type === "credit" ? "+" : "-"}
        {formatCurrency(item.amount)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Card style={[styles.balanceCard, { backgroundColor: theme.colors.primary }]}>
          <Card.Content>
            <Text variant="labelLarge" style={styles.balanceLabel}>
              Wallet Balance
            </Text>
            <Text variant="displaySmall" style={styles.balanceAmount}>
              {formatCurrency(data.balance)}
            </Text>
            <Text variant="bodyMedium" style={styles.totalEarnings}>
              Total earnings: {formatCurrency(data.totalEarnings)}
            </Text>
          </Card.Content>
        </Card>
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Recent Transactions
      </Text>
      <FlatList
        data={data.transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={renderTransaction}
        ListEmptyComponent={<EmptyState icon="wallet-outline" title="No transactions yet" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing.lg },
  balanceCard: { borderRadius: 18 },
  balanceLabel: { color: "#fff", opacity: 0.85 },
  balanceAmount: { color: "#fff", fontWeight: "700", marginTop: spacing.xs },
  totalEarnings: { color: "#fff", opacity: 0.85, marginTop: spacing.sm },
  sectionTitle: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  list: { paddingHorizontal: spacing.lg },
  transactionRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md, gap: spacing.sm },
  transactionContent: { flex: 1 },
  transactionDate: { opacity: 0.5, marginTop: 2 },
});
