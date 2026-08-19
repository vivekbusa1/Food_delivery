import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { Button, Divider, IconButton, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import type { MainStackNavigationProp } from "../../navigation/types";
import { useCart, useClearCart, useRemoveCartItem, useRemoveCoupon, useUpdateCartItem } from "../../hooks/useCart";
import { QuantityStepper } from "../../components/QuantityStepper";
import { EmptyState } from "../../components/EmptyState";
import { LoadingOverlay } from "../../components/LoadingOverlay";
import { ErrorState } from "../../components/ErrorState";
import { formatCurrency, pluralize } from "../../utils/formatters";
import { useResponsive } from "../../hooks/useResponsive";
import { spacing } from "../../constants/theme";
import type { CartItem } from "../../types";

export function CartScreen() {
  const theme = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const { contentPadding } = useResponsive();
  const { data: cart, isLoading, isError, refetch } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();
  const removeCoupon = useRemoveCoupon();

  if (isLoading) return <LoadingOverlay />;
  if (isError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="cart-outline"
          title="Your cart is empty"
          description="Add items from a restaurant to get started."
          actionLabel="Browse Restaurants"
          onAction={() => navigation.navigate("MainTabs", { screen: "HomeTab" } as never)}
        />
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.itemRow}>
      <Image source={{ uri: item.food?.imageUrl }} style={styles.itemImage} contentFit="cover" />
      <View style={styles.itemContent}>
        <Text variant="titleSmall" numberOfLines={1}>
          {item.food?.name}
        </Text>
        {(item.selectedOptions?.length ?? 0) > 0 && (
          <Text variant="bodySmall" style={styles.optionsText} numberOfLines={2}>
            {item.selectedOptions
              .flatMap((s) => s.optionIds)
              .filter(Boolean)
              .join(" · ")}
          </Text>
        )}
        <Text variant="titleSmall" style={{ color: theme.colors.primary }}>
          {formatCurrency(item.itemTotal)}
        </Text>
      </View>
      <View style={styles.itemActions}>
        <QuantityStepper
          quantity={item.quantity}
          min={1}
          onIncrement={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
          onDecrement={() => {
            if (item.quantity === 1) removeItem.mutate(item.id);
            else updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 });
          }}
        />
        <IconButton icon="trash-can-outline" size={18} onPress={() => removeItem.mutate(item.id)} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["top", "bottom"]}>
      <View style={[styles.header, { paddingHorizontal: contentPadding }]}>
        <Text variant="titleLarge">My Cart</Text>
        <Button compact onPress={() => clearCart.mutate()}>
          Clear
        </Button>
      </View>

      {cart?.restaurantName && (
        <Text variant="bodyMedium" style={[styles.restaurantName, { paddingHorizontal: contentPadding }]}>
          Order from {cart.restaurantName}
        </Text>
      )}

      <FlatList
        data={items}
        keyExtractor={(item, index) => item.id || `cart-item-${index}`}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { paddingHorizontal: contentPadding }]}
        ItemSeparatorComponent={() => <Divider style={styles.separator} />}
      />

      <View style={[styles.summary, { backgroundColor: theme.colors.surface, padding: contentPadding }]}>
        {cart?.appliedCoupon ? (
          <View style={styles.couponRow}>
            <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
              Coupon "{cart.appliedCoupon.code}" applied
            </Text>
            <Button compact onPress={() => removeCoupon.mutate()}>
              Remove
            </Button>
          </View>
        ) : (
          <Button icon="ticket-percent-outline" mode="outlined" onPress={() => navigation.navigate("ApplyCoupon")} style={styles.couponButton}>
            Apply Coupon
          </Button>
        )}

        <View style={styles.summaryRow}>
          <Text variant="bodyMedium">Subtotal ({pluralize(items.length, "item")})</Text>
          <Text variant="bodyMedium">{formatCurrency(cart?.subtotal ?? 0)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text variant="bodyMedium">Delivery Fee</Text>
          <Text variant="bodyMedium">{formatCurrency(cart?.deliveryFee ?? 0)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text variant="bodyMedium">Taxes</Text>
          <Text variant="bodyMedium">{formatCurrency(cart?.taxes ?? 0)}</Text>
        </View>
        {(cart?.discount ?? 0) > 0 && (
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
              Discount
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
              -{formatCurrency(cart?.discount ?? 0)}
            </Text>
          </View>
        )}
        <Divider style={styles.separator} />
        <View style={styles.summaryRow}>
          <Text variant="titleMedium">Total</Text>
          <Text variant="titleMedium">{formatCurrency(cart?.total ?? 0)}</Text>
        </View>

        <Button mode="contained" style={styles.checkoutButton} contentStyle={styles.checkoutContent} onPress={() => navigation.navigate("Checkout")}>
          Proceed to Checkout
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.sm,
  },
  restaurantName: { opacity: 0.6, marginBottom: spacing.sm },
  list: {},
  separator: { marginVertical: spacing.sm },
  itemRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.xs },
  itemImage: { width: 64, height: 64, borderRadius: 10, marginRight: spacing.sm },
  itemContent: { flex: 1, minWidth: 120, gap: 2 },
  optionsText: { opacity: 0.6 },
  itemActions: { alignItems: "flex-end", gap: 4 },
  summary: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  couponButton: { marginBottom: spacing.md },
  couponRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
  checkoutButton: { marginTop: spacing.md, borderRadius: 12 },
  checkoutContent: { height: 50 },
});
