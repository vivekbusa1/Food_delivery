import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";

import type { MainTabParamList } from "./types";
import { HomeScreen } from "../screens/Home";
import { SearchScreen } from "../screens/Search";
import { CartScreen } from "../screens/Cart";
import { OrderHistoryScreen } from "../screens/Order/OrderHistoryScreen";
import { ProfileScreen } from "../screens/Profile";
import { useCart } from "../hooks/useCart";

const Tab = createBottomTabNavigator<MainTabParamList>();

const icons: Record<keyof MainTabParamList, keyof typeof MaterialCommunityIcons.glyphMap> = {
  HomeTab: "home-variant",
  SearchTab: "magnify",
  CartTab: "cart-outline",
  OrdersTab: "receipt",
  ProfileTab: "account-outline",
};

export function MainTabNavigator() {
  const theme = useTheme();
  const { data: cart } = useCart();
  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name={icons[route.name as keyof MainTabParamList]} color={color} size={size} />
        ),
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
          height: 60,
          paddingBottom: 6,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: "Home" }} />
      <Tab.Screen name="SearchTab" component={SearchScreen} options={{ title: "Search" }} />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{ title: "Cart", tabBarBadge: cartCount > 0 ? cartCount : undefined }}
      />
      <Tab.Screen name="OrdersTab" component={OrderHistoryScreen} options={{ title: "Orders" }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: "Profile" }} />
    </Tab.Navigator>
  );
}
