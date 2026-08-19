import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";

import type { DeliveryTabParamList } from "./types";
import { DeliveryDashboardScreen } from "../screens/Delivery/DeliveryDashboardScreen";
import { DeliveryOrdersScreen } from "../screens/Delivery/DeliveryOrdersScreen";
import { DeliveryWalletScreen } from "../screens/Delivery/DeliveryWalletScreen";
import { DeliveryProfileScreen } from "../screens/Delivery/DeliveryProfileScreen";

const Tab = createBottomTabNavigator<DeliveryTabParamList>();

const icons: Record<keyof DeliveryTabParamList, keyof typeof MaterialCommunityIcons.glyphMap> = {
  DeliveryDashboard: "view-dashboard-outline",
  DeliveryOrders: "moped-outline",
  DeliveryWallet: "wallet-outline",
  DeliveryProfile: "account-outline",
};

export function DeliveryTabNavigator() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name={icons[route.name as keyof DeliveryTabParamList]}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <Tab.Screen name="DeliveryDashboard" component={DeliveryDashboardScreen} options={{ title: "Dashboard" }} />
      <Tab.Screen name="DeliveryOrders" component={DeliveryOrdersScreen} options={{ title: "Orders" }} />
      <Tab.Screen name="DeliveryWallet" component={DeliveryWalletScreen} options={{ title: "Wallet" }} />
      <Tab.Screen name="DeliveryProfile" component={DeliveryProfileScreen} options={{ title: "Profile" }} />
    </Tab.Navigator>
  );
}
