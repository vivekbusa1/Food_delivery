import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Button, IconButton, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { MainStackNavigationProp, MainStackParamList } from "../../navigation/types";
import { useLocation } from "../../hooks/useLocation";
import { spacing } from "../../constants/theme";

type Props = NativeStackScreenProps<MainStackParamList, "MapPicker">;

const DEFAULT_REGION: Region = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export function MapPickerScreen() {
  const theme = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const route = useRoute<Props["route"]>();
  const { coordinates, refresh, isLoading } = useLocation(!route.params?.latitude);

  const initialRegion: Region = route.params?.latitude
    ? {
        latitude: route.params.latitude,
        longitude: route.params.longitude ?? DEFAULT_REGION.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : DEFAULT_REGION;

  const [selected, setSelected] = useState<{ latitude: number; longitude: number }>({
    latitude: initialRegion.latitude,
    longitude: initialRegion.longitude,
  });

  const effectiveCoordinates = coordinates ?? selected;

  const confirmLocation = () => {
    navigation.navigate("AddAddress", {
      addressId: route.params?.latitude ? undefined : undefined,
      latitude: selected.latitude,
      longitude: selected.longitude,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        onRegionChangeComplete={(region) => setSelected({ latitude: region.latitude, longitude: region.longitude })}
      >
        <Marker coordinate={selected} draggable onDragEnd={(e) => setSelected(e.nativeEvent.coordinate)} />
      </MapView>

      <View style={styles.centerPin} pointerEvents="none">
        <IconButton icon="map-marker" size={40} iconColor={theme.colors.primary} />
      </View>

      <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
        <Text variant="bodySmall" style={styles.coordsText}>
          Lat {effectiveCoordinates.latitude.toFixed(5)}, Lng {effectiveCoordinates.longitude.toFixed(5)}
        </Text>
        <Button icon="crosshairs-gps" mode="outlined" onPress={() => void refresh()} loading={isLoading} style={styles.locateButton}>
          Use Current Location
        </Button>
        <Button mode="contained" onPress={confirmLocation} contentStyle={styles.confirmContent}>
          Confirm Location
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  centerPin: { position: "absolute", top: "50%", left: "50%", marginTop: -60, marginLeft: -20 },
  footer: { padding: spacing.lg, gap: spacing.sm, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  coordsText: { textAlign: "center", opacity: 0.6 },
  locateButton: { marginBottom: spacing.xs },
  confirmContent: { height: 50 },
});
