import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { DeliveryStackParamList } from "./types";
import { DeliveryTabNavigator } from "./DeliveryTabNavigator";
import { DeliveryOrderMapScreen } from "../screens/Delivery/DeliveryOrderMapScreen";

const Stack = createNativeStackNavigator<DeliveryStackParamList>();

export function DeliveryNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="DeliveryTabs" component={DeliveryTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="DeliveryOrderMap" component={DeliveryOrderMapScreen} options={{ title: "Live Delivery" }} />
    </Stack.Navigator>
  );
}
