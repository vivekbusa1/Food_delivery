import React from "react";
import { StyleSheet, Text, View, type ViewProps } from "react-native";

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type LatLng = { latitude: number; longitude: number };

type MapViewProps = ViewProps & {
  initialRegion?: Region;
  region?: Region;
  onRegionChangeComplete?: (region: Region) => void;
  children?: React.ReactNode;
};

type MarkerProps = {
  coordinate: LatLng;
  title?: string;
  pinColor?: string;
  draggable?: boolean;
  onDragEnd?: (e: { nativeEvent: { coordinate: LatLng } }) => void;
  children?: React.ReactNode;
};

type PolylineProps = {
  coordinates: LatLng[];
  strokeColor?: string;
  strokeWidth?: number;
};

export function Marker(_props: MarkerProps) {
  return null;
}

export function Polyline(_props: PolylineProps) {
  return null;
}

export default function MapView({ style, children, ...rest }: MapViewProps) {
  return (
    <View style={[styles.map, style]} {...rest}>
      <Text style={styles.label}>Maps are available on iOS and Android</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8EEF4",
  },
  label: {
    opacity: 0.6,
    textAlign: "center",
    paddingHorizontal: 16,
  },
});
