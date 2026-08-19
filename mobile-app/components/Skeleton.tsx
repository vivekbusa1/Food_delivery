import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, type DimensionValue, type ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = "100%", height = 16, borderRadius = 8, style }: SkeletonProps) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 650, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: theme.colors.surfaceVariant, opacity },
        style,
      ]}
    />
  );
}

export function RestaurantCardSkeleton() {
  return (
    <View style={styles.restaurantCard}>
      <Skeleton height={150} borderRadius={16} />
      <View style={{ marginTop: 8, gap: 6 }}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="50%" height={12} />
        <Skeleton width="40%" height={12} />
      </View>
    </View>
  );
}

export function FoodCardSkeleton() {
  return (
    <View style={styles.foodCard}>
      <Skeleton height={110} borderRadius={16} />
      <View style={{ marginTop: 8, gap: 6 }}>
        <Skeleton width="80%" height={14} />
        <Skeleton width="50%" height={12} />
        <Skeleton width="60%" height={14} />
      </View>
    </View>
  );
}

export function ListRowSkeleton() {
  return (
    <View style={styles.rowSkeleton}>
      <Skeleton width={64} height={64} borderRadius={12} />
      <View style={{ flex: 1, gap: 6 }}>
        <Skeleton width="60%" height={14} />
        <Skeleton width="40%" height={12} />
        <Skeleton width="30%" height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  restaurantCard: { marginBottom: 16 },
  foodCard: { width: 160 },
  rowSkeleton: { flexDirection: "row", gap: 12, marginBottom: 16, alignItems: "center" },
});
