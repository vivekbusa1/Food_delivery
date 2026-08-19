import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Button, Card, Switch, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import type { DeliveryStackNavigationProp } from "../../navigation/types";
import { useDeliveryDashboard, useSetOnlineStatus } from "../../hooks/useDelivery";
import { LoadingOverlay } from "../../components/LoadingOverlay";
import { ErrorState } from "../../components/ErrorState";
import { OrderCard } from "../../components/OrderCard";
import { formatCurrency } from "../../utils/formatters";
import { spacing } from "../../constants/theme";

export function DeliveryDashboardScreen() {
  const theme = useTheme();
  const navigation = useNavigation<DeliveryStackNavigationProp>();
  const { data, isLoading, isError, refetch } = useDeliveryDashboard();
  const setOnlineStatus = useSetOnlineStatus();

  if (isLoading) return <LoadingOverlay />;
  if (isError || !data) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text variant="titleLarge">Dashboard</Text>
            <Text variant="bodyMedium" style={styles.statusLabel}>
              {data.isOnline ? "You're online" : "You're offline"}
            </Text>
          </View>
          <Switch
            value={data.isOnline}
            onValueChange={(value) => setOnlineStatus.mutate(value)}
            disabled={setOnlineStatus.isPending}
          />
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="labelMedium" style={styles.statLabel}>
                Today's Earnings
              </Text>
              <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                {formatCurrency(data.todayEarnings)}
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="labelMedium" style={styles.statLabel}>
                Deliveries
              </Text>
              <Text variant="headlineSmall">{data.todayDeliveries}</Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="labelMedium" style={styles.statLabel}>
                Rating
              </Text>
              <Text variant="headlineSmall">⭐ {data.rating.toFixed(1)}</Text>
            </Card.Content>
          </Card>
        </View>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Active Delivery
        </Text>
        {data.activeOrder ? (
          <OrderCard order={data.activeOrder} onPress={() => navigation.navigate("DeliveryOrderMap", { orderId: data.activeOrder!.id })} />
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.emptyText}>
                {data.isOnline
                  ? "No active delivery right now. New orders will appear on the Orders tab."
                  : "Go online to start receiving delivery requests."}
              </Text>
            </Card.Content>
          </Card>
        )}

        {!data.isOnline && (
          <Button mode="contained" style={styles.goOnlineButton} onPress={() => setOnlineStatus.mutate(true)}>
            Go Online
          </Button>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
  statusLabel: { opacity: 0.6, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1 },
  statLabel: { opacity: 0.6, marginBottom: 4 },
  sectionTitle: { marginBottom: spacing.sm },
  emptyCard: { borderStyle: "dashed", borderWidth: 1 },
  emptyText: { opacity: 0.6, textAlign: "center" },
  goOnlineButton: { marginTop: spacing.lg },
});
