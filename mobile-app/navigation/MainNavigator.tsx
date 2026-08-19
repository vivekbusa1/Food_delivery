import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { MainStackParamList } from "./types";
import { MainTabNavigator } from "./MainTabNavigator";
import { RestaurantListScreen } from "../screens/Restaurant/RestaurantListScreen";
import { RestaurantDetailsScreen } from "../screens/Restaurant/RestaurantDetailsScreen";
import { CategoriesScreen } from "../screens/Categories";
import { OffersScreen } from "../screens/Offers";
import { PopularFoodsScreen } from "../screens/Foods/PopularFoodsScreen";
import { RecommendedScreen } from "../screens/Foods/RecommendedScreen";
import { FoodDetailsScreen } from "../screens/Foods/FoodDetailsScreen";
import { FilterScreen } from "../screens/Search/FilterScreen";
import { WishlistScreen } from "../screens/Wishlist";
import { FavoriteRestaurantsScreen } from "../screens/FavoriteRestaurants";
import { ApplyCouponScreen } from "../screens/Coupon/ApplyCouponScreen";
import { CheckoutScreen } from "../screens/Checkout";
import { AddressListScreen } from "../screens/Address/AddressListScreen";
import { AddAddressScreen } from "../screens/Address/AddAddressScreen";
import { MapPickerScreen } from "../screens/Address/MapPickerScreen";
import { OrderSummaryScreen } from "../screens/Order/OrderSummaryScreen";
import { LiveOrderTrackingScreen } from "../screens/Order/LiveOrderTrackingScreen";
import { OrderDetailsScreen } from "../screens/Order/OrderDetailsScreen";
import { RatingsReviewsScreen } from "../screens/Reviews/RatingsReviewsScreen";
import { NotificationsScreen } from "../screens/Notifications";
import { EditProfileScreen } from "../screens/Profile/EditProfileScreen";
import { ChangePasswordScreen } from "../screens/Profile/ChangePasswordScreen";
import { LanguageScreen } from "../screens/Profile/LanguageScreen";
import { DeleteAccountScreen } from "../screens/Profile/DeleteAccountScreen";

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#FAF8F6" },
        headerTintColor: "#FF6B35",
        headerTitleStyle: { fontWeight: "700", color: "#1C1917" },
        contentStyle: { backgroundColor: "#FAF8F6" },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="RestaurantList"
        component={RestaurantListScreen}
        options={({ route }) => ({ title: route.params?.title ?? "Restaurants" })}
      />
      <Stack.Screen
        name="RestaurantDetails"
        component={RestaurantDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: "Categories" }} />
      <Stack.Screen name="Offers" component={OffersScreen} options={{ title: "Offers" }} />
      <Stack.Screen name="PopularFoods" component={PopularFoodsScreen} options={{ title: "Popular Foods" }} />
      <Stack.Screen name="Recommended" component={RecommendedScreen} options={{ title: "Recommended for you" }} />
      <Stack.Screen name="FoodDetails" component={FoodDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="Filter"
        component={FilterScreen}
        options={{ title: "Filters", presentation: "modal" }}
      />
      <Stack.Screen name="Wishlist" component={WishlistScreen} options={{ title: "Wishlist" }} />
      <Stack.Screen
        name="FavoriteRestaurants"
        component={FavoriteRestaurantsScreen}
        options={{ title: "Favorite Restaurants" }}
      />
      <Stack.Screen
        name="ApplyCoupon"
        component={ApplyCouponScreen}
        options={{ title: "Apply Coupon", presentation: "modal" }}
      />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Checkout" }} />
      <Stack.Screen
        name="AddressList"
        component={AddressListScreen}
        options={{ title: "Saved Addresses" }}
      />
      <Stack.Screen
        name="AddAddress"
        component={AddAddressScreen}
        options={{ title: "Add Address" }}
      />
      <Stack.Screen
        name="MapPicker"
        component={MapPickerScreen}
        options={{ title: "Choose Location", presentation: "fullScreenModal" }}
      />
      <Stack.Screen
        name="OrderSummary"
        component={OrderSummaryScreen}
        options={{ title: "Order Summary", headerBackVisible: false }}
      />
      <Stack.Screen
        name="LiveOrderTracking"
        component={LiveOrderTrackingScreen}
        options={{ title: "Track Order" }}
      />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ title: "Order Details" }} />
      <Stack.Screen
        name="RatingsReviews"
        component={RatingsReviewsScreen}
        options={{ title: "Rate your order" }}
      />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: "Notifications" }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: "Edit Profile" }} />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: "Change Password" }}
      />
      <Stack.Screen name="Language" component={LanguageScreen} options={{ title: "Language" }} />
      <Stack.Screen
        name="DeleteAccount"
        component={DeleteAccountScreen}
        options={{ title: "Delete Account" }}
      />
    </Stack.Navigator>
  );
}
