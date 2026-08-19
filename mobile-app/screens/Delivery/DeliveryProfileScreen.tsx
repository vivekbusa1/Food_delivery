import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Chip, Divider, List, Switch, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { useDeliveryProfile } from "../../hooks/useDelivery";
import { useAuth } from "../../store/AuthContext";
import { useThemeStore } from "../../store/useThemeStore";
import { LoadingOverlay } from "../../components/LoadingOverlay";
import { ErrorState } from "../../components/ErrorState";
import { spacing } from "../../constants/theme";

export function DeliveryProfileScreen() {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { data: profile, isLoading, isError, refetch } = useDeliveryProfile();
  const { preference, setPreference } = useThemeStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      Toast.show({ type: "error", text1: "Session cleared locally" });
    }
  };

  if (isLoading) return <LoadingOverlay />;

  const displayUser = profile ?? user;

  if (isError && !displayUser) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["top", "bottom"]}>
      <ScrollView>
        <View style={styles.header}>
          {displayUser?.avatarUrl ? (
            <Avatar.Image size={72} source={{ uri: displayUser.avatarUrl }} />
          ) : (
            <Avatar.Text size={72} label={(displayUser?.name ?? "D").slice(0, 2).toUpperCase()} />
          )}
          <View style={styles.headerText}>
            <Text variant="titleLarge">{displayUser?.name ?? "Delivery Partner"}</Text>
            <Text variant="bodyMedium" style={styles.phone}>
              {displayUser?.phone}
            </Text>
            <Chip compact style={styles.roleChip} icon="moped-outline">
              Delivery Partner
            </Chip>
          </View>
        </View>

        <List.Section>
          <List.Item
            title="Dark Mode"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => <Switch value={preference === "dark"} onValueChange={(v) => setPreference(v ? "dark" : "light")} />}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Item
            title="Log Out"
            titleStyle={{ color: theme.colors.error }}
            left={(props) => <List.Icon {...props} icon="logout" color={theme.colors.error} />}
            onPress={handleLogout}
          />
        </List.Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.lg, gap: spacing.md },
  headerText: { flex: 1 },
  phone: { opacity: 0.6, marginTop: 2 },
  roleChip: { marginTop: spacing.sm, alignSelf: "flex-start" },
});
