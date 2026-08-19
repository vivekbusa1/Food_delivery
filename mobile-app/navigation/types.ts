import type { NavigatorScreenParams } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  OtpVerification: { email: string; purpose: "signup" | "login" | "reset_password" };
};

export type MainTabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  CartTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  RestaurantList: { categoryId?: string; title?: string } | undefined;
  RestaurantDetails: { restaurantId: string };
  Categories: undefined;
  Offers: undefined;
  PopularFoods: undefined;
  Recommended: undefined;
  FoodDetails: { foodId: string };
  Filter: undefined;
  Wishlist: undefined;
  FavoriteRestaurants: undefined;
  ApplyCoupon: undefined;
  Checkout: undefined;
  AddressList: { selectMode?: boolean } | undefined;
  AddAddress: { addressId?: string; latitude?: number; longitude?: number } | undefined;
  MapPicker: { latitude?: number; longitude?: number } | undefined;
  OrderSummary: { orderId: string };
  LiveOrderTracking: { orderId: string };
  OrderDetails: { orderId: string };
  RatingsReviews: { orderId: string; restaurantId: string };
  Notifications: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Language: undefined;
  DeleteAccount: undefined;
};

export type DeliveryTabParamList = {
  DeliveryDashboard: undefined;
  DeliveryOrders: undefined;
  DeliveryWallet: undefined;
  DeliveryProfile: undefined;
};

export type DeliveryStackParamList = {
  DeliveryTabs: NavigatorScreenParams<DeliveryTabParamList>;
  DeliveryOrderMap: { orderId: string };
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
  Delivery: NavigatorScreenParams<DeliveryStackParamList>;
};

// Convenience type used by screens nested inside MainTabNavigator so they can still
// navigate to detail screens declared on the parent MainStackNavigator.
export type MainStackNavigationProp = NativeStackNavigationProp<MainStackParamList>;
export type DeliveryStackNavigationProp = NativeStackNavigationProp<DeliveryStackParamList>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
