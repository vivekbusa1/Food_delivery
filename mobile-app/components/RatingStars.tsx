import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, useTheme } from "react-native-paper";

interface RatingStarsProps {
  rating?: number | null;
  size?: number;
  showValue?: boolean;
  count?: number | null;
}

export function RatingStars({ rating, size = 14, showValue = true, count }: RatingStarsProps) {
  const theme = useTheme();
  const value = Number.isFinite(Number(rating)) ? Number(rating) : 0;
  const rounded = Math.round(value * 2) / 2;

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((position) => {
        const icon =
          rounded >= position ? "star" : rounded + 0.5 === position ? "star-half-full" : "star-outline";
        return (
          <MaterialCommunityIcons
            key={position}
            name={icon as never}
            size={size}
            color={theme.colors.primary}
          />
        );
      })}
      {showValue && (
        <Text variant="labelSmall" style={styles.label}>
          {value.toFixed(1)}
          {count != null ? ` (${count})` : ""}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 2 },
  label: { marginLeft: 4, opacity: 0.7 },
});
