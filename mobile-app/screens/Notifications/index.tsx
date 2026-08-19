import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Button, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import type { MainStackNavigationProp } from "../../navigation/types";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../../hooks/useNotifications";
import { NotificationItem } from "../../components/NotificationItem";
import { ListRowSkeleton } from "../../components/Skeleton";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { spacing } from "../../constants/theme";
import type { AppNotification } from "../../types";

export function NotificationsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const { data, isLoading, isError, refetch } = useNotifications();
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();

  const handlePress = (notification: AppNotification) => {
    if (!notification.isRead) markAsRead.mutate(notification.id);
    if (notification.type === "order" && notification.data?.orderId) {
      navigation.navigate("OrderDetails", { orderId: String(notification.data.orderId) });
    }
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
      {(Array.isArray(data) ? data.length : 0) > 0 && (
        <View style={styles.header}>
          <Button compact onPress={() => markAllAsRead.mutate()}>
            Mark all as read
          </Button>
        </View>
      )}

      {isLoading ? (
        <View style={styles.list}>
          <ListRowSkeleton />
          <ListRowSkeleton />
        </View>
      ) : (
        <FlatList
          data={Array.isArray(data) ? data : []}
          keyExtractor={(item, index) => item.id || `notification-${index}`}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={refetch}
          renderItem={({ item }) => <NotificationItem notification={item} onPress={() => handlePress(item)} />}
          ListEmptyComponent={
            <EmptyState icon="bell-off-outline" title="No notifications yet" description="We'll let you know when something important happens." />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: "flex-end", paddingHorizontal: spacing.md },
  list: { padding: spacing.lg },
});
