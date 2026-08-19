import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Button, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { MainStackNavigationProp, MainStackParamList } from "../../navigation/types";
import { useAddresses, useDeleteAddress } from "../../hooks/useAddresses";
import { useCheckoutStore } from "../../store/useCheckoutStore";
import { AddressCard } from "../../components/AddressCard";
import { ListRowSkeleton } from "../../components/Skeleton";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { spacing } from "../../constants/theme";

type Props = NativeStackScreenProps<MainStackParamList, "AddressList">;

export function AddressListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const route = useRoute<Props["route"]>();
  const selectMode = !!route.params?.selectMode;

  const { data: addressesData, isLoading, isError, refetch } = useAddresses();
  const addresses = Array.isArray(addressesData) ? addressesData : [];
  const deleteAddress = useDeleteAddress();
  const { selectedAddressId, setSelectedAddressId } = useCheckoutStore();

  if (isError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["bottom"]}>
      {isLoading ? (
        <View style={styles.list}>
          <ListRowSkeleton />
          <ListRowSkeleton />
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item, index) => item.id || `address-${index}`}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <AddressCard
              address={item}
              selectable={selectMode}
              selected={selectedAddressId === item.id}
              onPress={() => {
                if (selectMode) {
                  setSelectedAddressId(item.id);
                  navigation.goBack();
                }
              }}
              onEdit={() => navigation.navigate("AddAddress", { addressId: item.id })}
              onDelete={() => deleteAddress.mutate(item.id)}
            />
          )}
          ListEmptyComponent={
            <EmptyState icon="map-marker-off-outline" title="No saved addresses" description="Add an address to start ordering." />
          }
        />
      )}

      <View style={styles.footer}>
        <Button icon="plus" mode="contained" onPress={() => navigation.navigate("AddAddress", {})}>
          Add New Address
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: spacing.lg },
  footer: { padding: spacing.lg },
});
