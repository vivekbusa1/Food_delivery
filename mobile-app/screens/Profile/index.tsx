import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Avatar, Divider, List, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import type { MainStackNavigationProp } from "../../navigation/types";
import { useAuth } from "../../store/AuthContext";
import { spacing } from "../../constants/theme";

export function ProfileScreen() {
  const theme = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      Toast.show({ type: "error", text1: "Could not log out cleanly, but session was cleared locally." });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["top", "bottom"]}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          {user?.avatarUrl ? (
            <Avatar.Image size={72} source={{ uri: user.avatarUrl }} />
          ) : (
            <Avatar.Text
              size={72}
              label={(user?.name ?? "U").slice(0, 2).toUpperCase()}
              style={{ backgroundColor: theme.colors.primaryContainer }}
              labelStyle={{ color: theme.colors.primary }}
            />
          )}
          <View style={styles.headerText}>
            <Text variant="titleLarge">{user?.name ?? "Guest"}</Text>
            <Text variant="bodyMedium" style={styles.email}>
              {user?.email}
            </Text>
          </View>
        </View>

        <List.Section>
          <List.Item
            title="Edit Profile"
            left={(props) => <List.Icon {...props} icon="account-edit-outline" />}
            onPress={() => navigation.navigate("EditProfile")}
          />
          <List.Item
            title="Saved Addresses"
            left={(props) => <List.Icon {...props} icon="map-marker-outline" />}
            onPress={() => navigation.navigate("AddressList")}
          />
          <List.Item
            title="Favorite Restaurants"
            left={(props) => <List.Icon {...props} icon="heart-outline" />}
            onPress={() => navigation.navigate("FavoriteRestaurants")}
          />
          <List.Item
            title="Wishlist"
            left={(props) => <List.Icon {...props} icon="cards-heart-outline" />}
            onPress={() => navigation.navigate("Wishlist")}
          />
          <List.Item
            title="Notifications"
            left={(props) => <List.Icon {...props} icon="bell-outline" />}
            onPress={() => navigation.navigate("Notifications")}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Item
            title="Change Password"
            left={(props) => <List.Icon {...props} icon="lock-outline" />}
            onPress={() => navigation.navigate("ChangePassword")}
          />
          <List.Item
            title="Language"
            left={(props) => <List.Icon {...props} icon="translate" />}
            onPress={() => navigation.navigate("Language")}
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
          <List.Item
            title="Delete Account"
            titleStyle={{ color: theme.colors.error }}
            left={(props) => <List.Icon {...props} icon="trash-can-outline" color={theme.colors.error} />}
            onPress={() => navigation.navigate("DeleteAccount")}
          />
        </List.Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  headerText: { flex: 1 },
  email: { opacity: 0.6, marginTop: 2 },
});
