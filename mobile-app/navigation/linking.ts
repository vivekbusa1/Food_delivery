import * as Linking from "expo-linking";
import type { LinkingOptions } from "@react-navigation/native";

import type { RootStackParamList } from "./types";

const prefix = Linking.createURL("/");

/**
 * Deep-link / web URL map so refresh keeps the current page on Expo web,
 * and native deep links resolve to the right screen.
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [prefix, "fooddelivery://"],
  config: {
    screens: {
      Splash: "splash",
      Onboarding: "onboarding",
      Auth: {
        path: "auth",
        screens: {
          Login: "login",
          Signup: "signup",
          OtpVerification: "otp",
        },
      },
      Main: {
        path: "",
        screens: {
          MainTabs: {
            path: "",
            screens: {
              HomeTab: "",
              SearchTab: "search",
              CartTab: "cart",
              OrdersTab: "orders",
              ProfileTab: "profile",
            },
          },
          RestaurantList: "restaurants",
          RestaurantDetails: "restaurants/:restaurantId",
          Categories: "categories",
          Offers: "offers",
          PopularFoods: "foods/popular",
          Recommended: "foods/recommended",
          FoodDetails: "foods/:foodId",
          Filter: "filter",
          Wishlist: "wishlist",
          FavoriteRestaurants: "favorites",
          ApplyCoupon: "coupons",
          Checkout: "checkout",
          AddressList: "addresses",
          AddAddress: "addresses/add",
          MapPicker: "addresses/map",
          OrderSummary: "order/:orderId/summary",
          LiveOrderTracking: "order/:orderId/track",
          OrderDetails: "order/:orderId",
          RatingsReviews: "order/:orderId/rate",
          Notifications: "notifications",
          EditProfile: "profile/edit",
          ChangePassword: "profile/password",
          Language: "profile/language",
          DeleteAccount: "profile/delete",
        },
      },
      Delivery: {
        path: "delivery",
        screens: {
          DeliveryTabs: {
            path: "",
            screens: {
              DeliveryDashboard: "",
              DeliveryOrders: "orders",
              DeliveryWallet: "wallet",
              DeliveryProfile: "profile",
            },
          },
          DeliveryOrderMap: "orders/:orderId/map",
        },
      },
    },
  },
};

export const NAV_STATE_STORAGE_KEY = "fooddelivery_nav_state_v1";
