import React, { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Button, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCoupons } from "../../hooks/useCoupons";
import { useApplyCoupon } from "../../hooks/useCart";
import { useCart } from "../../hooks/useCart";
import { CouponCard } from "../../components/CouponCard";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { spacing } from "../../constants/theme";

export function ApplyCouponScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const [code, setCode] = useState("");
  const { data: couponsData, isLoading, isError, refetch } = useCoupons();
  const coupons = Array.isArray(couponsData) ? couponsData : [];
  const { data: cart } = useCart();
  const applyCoupon = useApplyCoupon();

  const handleApply = (couponCode: string) => {
    applyCoupon.mutate(couponCode, {
      onSuccess: () => navigation.goBack(),
    });
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
      <View style={styles.inputRow}>
        <TextInput
          mode="outlined"
          label="Enter coupon code"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          style={styles.input}
        />
        <Button
          mode="contained"
          onPress={() => handleApply(code)}
          disabled={!code.trim() || applyCoupon.isPending}
          loading={applyCoupon.isPending}
        >
          Apply
        </Button>
      </View>

      <FlatList
        data={coupons}
        keyExtractor={(item, index) => item.id || `coupon-${index}`}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <CouponCard
            coupon={item}
            applied={cart?.appliedCoupon?.id === item.id}
            onApply={() => handleApply(item.code)}
          />
        )}
        ListEmptyComponent={!isLoading ? <EmptyState icon="ticket-percent-outline" title="No coupons available" /> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.lg },
  input: { flex: 1 },
  list: { paddingHorizontal: spacing.lg },
});
