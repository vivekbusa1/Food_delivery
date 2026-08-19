import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, useTheme } from "react-native-paper";

import type { AppNotification } from "../types";
import { formatRelativeTime } from "../utils/formatters";
import { spacing } from "../constants/theme";

interface NotificationItemProps {
  notification: AppNotification;
  onPress: () => void;
}

const iconByType: Record<AppNotification["type"], keyof typeof MaterialCommunityIcons.glyphMap> = {
  order: "receipt",
  offer: "tag-outline",
  system: "bell-outline",
};

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: notification.isRead ? "transparent" : `${theme.colors.primary}0F` },
      ]}
    >
      <View style={[styles.iconWrapper, { backgroundColor: theme.colors.surfaceVariant }]}>
        <MaterialCommunityIcons name={iconByType[notification.type]} size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.content}>
        <Text variant="titleSmall">{notification.title}</Text>
        <Text variant="bodySmall" style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text variant="labelSmall" style={styles.time}>
          {formatRelativeTime(notification.createdAt)}
        </Text>
      </View>
      {!notification.isRead && <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: spacing.md,
    borderRadius: 14,
    marginBottom: spacing.sm,
    alignItems: "flex-start",
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  content: { flex: 1 },
  message: { opacity: 0.7, marginTop: 2 },
  time: { opacity: 0.5, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginLeft: spacing.xs },
});
