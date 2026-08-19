import * as Location from "expo-location";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

export async function getCurrentCoordinates(): Promise<Coordinates | null> {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return null;

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return { latitude: position.coords.latitude, longitude: position.coords.longitude };
}

export async function reverseGeocodeCoordinates(coords: Coordinates) {
  const [result] = await Location.reverseGeocodeAsync(coords);
  return result ?? null;
}
