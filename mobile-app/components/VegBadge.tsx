import React from "react";
import { StyleSheet, View } from "react-native";

interface VegBadgeProps {
  isVeg: boolean;
}

export function VegBadge({ isVeg }: VegBadgeProps) {
  const color = isVeg ? "#3BB273" : "#E5484D";
  return (
    <View style={[styles.box, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
