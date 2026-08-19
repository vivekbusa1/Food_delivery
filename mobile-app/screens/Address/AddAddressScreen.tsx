import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Button, Chip, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { MainStackNavigationProp, MainStackParamList } from "../../navigation/types";
import { FormTextInput } from "../../components/FormTextInput";
import { addressSchema, type AddressFormValues } from "../../utils/validation";
import { useAddress, useCreateAddress, useUpdateAddress } from "../../hooks/useAddresses";
import { useLocation } from "../../hooks/useLocation";
import { reverseGeocodeCoordinates } from "../../services/locationService";
import { getErrorMessage } from "../../services/api";
import { spacing } from "../../constants/theme";

type Props = NativeStackScreenProps<MainStackParamList, "AddAddress">;

const labelOptions = ["Home", "Work", "Other"];

export function AddAddressScreen() {
  const theme = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const route = useRoute<Props["route"]>();
  const { addressId } = route.params ?? {};

  const { data: existingAddress } = useAddress(addressId);
  const { coordinates } = useLocation(!route.params?.latitude && !addressId);
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const [isGeocoding, setIsGeocoding] = useState(false);

  const { control, handleSubmit, setValue, watch } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: "Home",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      instructions: "",
      latitude: route.params?.latitude ?? coordinates?.latitude ?? 0,
      longitude: route.params?.longitude ?? coordinates?.longitude ?? 0,
    },
  });

  const selectedLabel = watch("label");
  const latitude = watch("latitude");
  const longitude = watch("longitude");

  useEffect(() => {
    if (existingAddress) {
      setValue("label", existingAddress.label);
      setValue("addressLine1", existingAddress.addressLine1);
      setValue("addressLine2", existingAddress.addressLine2 ?? "");
      setValue("city", existingAddress.city);
      setValue("state", existingAddress.state);
      setValue("postalCode", existingAddress.postalCode);
      setValue("country", existingAddress.country);
      setValue("instructions", existingAddress.instructions ?? "");
      setValue("latitude", existingAddress.latitude);
      setValue("longitude", existingAddress.longitude);
    }
  }, [existingAddress, setValue]);

  useEffect(() => {
    if (route.params?.latitude !== undefined) {
      setValue("latitude", route.params.latitude);
      setValue("longitude", route.params.longitude ?? 0);
    } else if (coordinates && !addressId) {
      setValue("latitude", coordinates.latitude);
      setValue("longitude", coordinates.longitude);
    }
  }, [route.params?.latitude, route.params?.longitude, coordinates, addressId, setValue]);

  const handleUseCurrentLocation = async () => {
    setIsGeocoding(true);
    try {
      const geo = await reverseGeocodeCoordinates({ latitude, longitude });
      if (geo) {
        setValue("addressLine1", [geo.name, geo.street].filter(Boolean).join(" ") || geo.street || "");
        setValue("city", geo.city ?? "");
        setValue("state", geo.region ?? "");
        setValue("postalCode", geo.postalCode ?? "");
        setValue("country", geo.country ?? "");
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Could not auto-fill address", text2: getErrorMessage(error) });
    } finally {
      setIsGeocoding(false);
    }
  };

  const onSubmit = (values: AddressFormValues) => {
    const payload = { ...values, addressLine2: values.addressLine2 || undefined, instructions: values.instructions || undefined };
    const onSuccess = () => navigation.goBack();
    const onError = (error: unknown) =>
      Toast.show({ type: "error", text1: "Could not save address", text2: getErrorMessage(error) });

    if (addressId) {
      updateAddress.mutate({ id: addressId, payload }, { onSuccess, onError });
    } else {
      createAddress.mutate(payload, { onSuccess, onError });
    }
  };

  const isSubmitting = createAddress.isPending || updateAddress.isPending;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="titleSmall" style={styles.sectionLabel}>
          Label
        </Text>
        <View style={styles.chipRow}>
          {labelOptions.map((label) => (
            <Chip key={label} selected={selectedLabel === label} onPress={() => setValue("label", label)} style={styles.chip}>
              {label}
            </Chip>
          ))}
        </View>

        <Button
          icon="map-marker-radius-outline"
          mode="outlined"
          style={styles.mapButton}
          onPress={() => navigation.navigate("MapPicker", { latitude, longitude })}
        >
          Pick Location on Map
        </Button>
        <Button
          icon="crosshairs-gps"
          mode="text"
          onPress={handleUseCurrentLocation}
          loading={isGeocoding}
          style={styles.autofillButton}
        >
          Auto-fill from location
        </Button>

        <FormTextInput control={control} name="addressLine1" label="Address Line 1" />
        <FormTextInput control={control} name="addressLine2" label="Address Line 2 (optional)" />
        <FormTextInput control={control} name="city" label="City" />
        <FormTextInput control={control} name="state" label="State" />
        <FormTextInput control={control} name="postalCode" label="Postal Code" keyboardType="number-pad" />
        <FormTextInput control={control} name="country" label="Country" />
        <FormTextInput control={control} name="instructions" label="Delivery Instructions (optional)" multiline numberOfLines={3} />

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isSubmitting}
          contentStyle={styles.saveContent}
          style={styles.saveButton}
        >
          Save Address
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  sectionLabel: { marginBottom: spacing.sm },
  chipRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  chip: {},
  mapButton: { marginBottom: spacing.xs },
  autofillButton: { marginBottom: spacing.md, alignSelf: "flex-start" },
  saveButton: { marginTop: spacing.md },
  saveContent: { height: 50 },
});
