import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";

export function SplashScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <MaterialCommunityIcons name="food-drumstick" size={96} color="#fff" />
      <Text variant="headlineMedium" style={styles.title}>
        Food Delivery
      </Text>
      <ActivityIndicator color="#fff" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { color: "#fff", fontWeight: "700", marginTop: 16 },
  loader: { marginTop: 32 },
});
