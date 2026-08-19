import React, { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Button, Divider, RadioButton, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import type { MainStackNavigationProp } from "../../navigation/types";
import { useAddresses } from "../../hooks/useAddresses";
import { useCart } from "../../hooks/useCart";
import { usePlaceOrder } from "../../hooks/useOrders";
import { useCheckoutStore } from "../../store/useCheckoutStore";
import { AddressCard } from "../../components/AddressCard";
import { EmptyState } from "../../components/EmptyState";
import { LoadingOverlay } from "../../components/LoadingOverlay";
import { formatCurrency } from "../../utils/formatters";
import { useResponsive } from "../../hooks/useResponsive";
import { spacing } from "../../constants/theme";
import type { Order } from "../../types";

const paymentMethods: { value: Order["paymentMethod"]; label: string; icon: string }[] = [
  { value: "cash", label: "Cash on Delivery", icon: "cash" },
  { value: "card", label: "Credit / Debit Card", icon: "credit-card-outline" },
  { value: "upi", label: "UPI", icon: "qrcode" },
  { value: "wallet", label: "Wallet", icon: "wallet-outline" },
];

export function CheckoutScreen() {
  const theme = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const { contentPadding } = useResponsive();
  const { data: addressesData, isLoading: isLoadingAddresses } = useAddresses();
  const { data: cart, isLoading: isLoadingCart } = useCart();
  const placeOrder = usePlaceOrder();
  const { selectedAddressId, paymentMethod, setSelectedAddressId, setPaymentMethod } = useCheckoutStore();
  const addresses = Array.isArray(addressesData) ? addressesData : [];

  useEffect(() => {
    if (!selectedAddressId && addresses.length > 0) {
      const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
      setSelectedAddressId(defaultAddress.id);
    }
  }, [addresses, selectedAddressId, setSelectedAddressId]);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const handlePlaceOrder = () => {
    if (!selectedAddressId) return;
    placeOrder.mutate(
      { addressId: selectedAddressId, paymentMethod, couponCode: cart?.appliedCoupon?.code },
      {
        onSuccess: (order) => navigation.replace("OrderSummary", { orderId: order.id }),
      },
    );
  };

  if (isLoadingAddresses || isLoadingCart) return <LoadingOverlay />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={[styles.content, { padding: contentPadding }]}>
        <View style={styles.sectionHeaderRow}>
          <Text variant="titleMedium">Delivery Address</Text>
          <Button compact onPress={() => navigation.navigate("AddressList", { selectMode: true })}>
            Change
          </Button>
        </View>
        {selectedAddress ? (
          <AddressCard address={selectedAddress} />
        ) : (
          <EmptyState
            icon="map-marker-off-outline"
            title="No address selected"
            actionLabel="Add Address"
            onAction={() => navigation.navigate("AddAddress", {})}
          />
        )}

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Payment Method
        </Text>
        <RadioButton.Group onValueChange={(value) => setPaymentMethod(value as Order["paymentMethod"])} value={paymentMethod}>
          {paymentMethods.map((method) => (
            <RadioButton.Item
              key={method.value}
              label={method.label}
              value={method.value}
              style={styles.radioItem}
            />
          ))}
        </RadioButton.Group>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Bill Details
        </Text>
        <View style={[styles.billCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium">Subtotal</Text>
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
          <Divider style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text variant="titleMedium">Total</Text>
            <Text variant="titleMedium">{formatCurrency(cart?.total ?? 0)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.surface, padding: contentPadding }]}>
        <Button
          mode="contained"
          contentStyle={styles.placeOrderContent}
          onPress={handlePlaceOrder}
          loading={placeOrder.isPending}
          disabled={placeOrder.isPending || !selectedAddressId}
        >
          Place Order · {formatCurrency(cart?.total ?? 0)}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 },
  sectionTitle: { marginTop: spacing.lg, marginBottom: spacing.sm },
  radioItem: { paddingHorizontal: 0 },
  billCard: { padding: spacing.md, borderRadius: 14 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs, gap: spacing.sm },
  divider: { marginVertical: spacing.sm },
  footer: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  placeOrderContent: { height: 50 },
});
