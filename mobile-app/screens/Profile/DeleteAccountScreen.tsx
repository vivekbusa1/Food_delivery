import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button, Checkbox, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { useDeleteAccount } from "../../hooks/useProfile";
import { useAuth } from "../../store/AuthContext";
import { getErrorMessage } from "../../services/api";
import { spacing } from "../../constants/theme";

const consequences = [
  "All your order history will be permanently deleted",
  "Saved addresses and payment preferences will be removed",
  "Your wishlist and favorite restaurants will be lost",
  "This action cannot be undone",
];

export function DeleteAccountScreen() {
  const theme = useTheme();
  const { logout } = useAuth();
  const deleteAccount = useDeleteAccount();
  const [confirmed, setConfirmed] = useState(false);

  const handleDelete = () => {
    deleteAccount.mutate(undefined, {
      onSuccess: async () => {
        Toast.show({ type: "success", text1: "Account deleted" });
        await logout();
      },
      onError: (error) => Toast.show({ type: "error", text1: "Could not delete account", text2: getErrorMessage(error) }),
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color={theme.colors.error} style={styles.icon} />
        <Text variant="headlineSmall" style={styles.title}>
          Delete your account?
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Please review what happens before you continue.
        </Text>

        {consequences.map((item) => (
          <View key={item} style={styles.bulletRow}>
            <MaterialCommunityIcons name="circle-small" size={22} color={theme.colors.error} />
            <Text variant="bodyMedium" style={styles.bulletText}>
              {item}
            </Text>
          </View>
        ))}

        <View style={styles.confirmRow}>
          <Checkbox status={confirmed ? "checked" : "unchecked"} onPress={() => setConfirmed((c) => !c)} />
          <Text variant="bodyMedium" style={styles.confirmText} onPress={() => setConfirmed((c) => !c)}>
            I understand this action is permanent and cannot be undone.
          </Text>
        </View>

        <Button
          mode="contained"
          buttonColor={theme.colors.error}
          disabled={!confirmed || deleteAccount.isPending}
          loading={deleteAccount.isPending}
          onPress={handleDelete}
          contentStyle={styles.submitContent}
        >
          Delete My Account
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  icon: { alignSelf: "center", marginBottom: spacing.md },
  title: { textAlign: "center", fontWeight: "700" },
  subtitle: { textAlign: "center", opacity: 0.6, marginTop: spacing.xs, marginBottom: spacing.lg },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: spacing.xs },
  bulletText: { flex: 1 },
  confirmRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.lg, marginBottom: spacing.lg },
  confirmText: { flex: 1 },
  submitContent: { height: 50 },
});
