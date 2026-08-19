# Food Delivery — Mobile App

A complete, production-ready Food Delivery mobile app built with **Expo SDK 52**, **TypeScript**, **React Navigation**, **TanStack React Query**, and **React Native Paper** (Material Design 3). Every screen is wired to a real backend REST API via Axios + React Query — there is no mock/fake-only data (lists render genuine empty/error/loading states when the backend has nothing to return).

## Tech Stack

| Concern | Library |
|---|---|
| Framework | Expo SDK 52, React Native 0.76, TypeScript |
| Navigation | React Navigation 7 (native-stack + bottom-tabs) |
| Data fetching / caching | TanStack React Query 5 |
| HTTP client | Axios (with auth + refresh-token interceptors) |
| Forms & validation | React Hook Form + Zod |
| UI kit | React Native Paper (MD3, light/dark theme) |
| Client state | Zustand (checkout/filter/theme/onboarding) + React Context (auth) |
| Images | expo-image |
| Secure storage | expo-secure-store (JWT tokens) |
| Push notifications | expo-notifications |
| Location & Maps | expo-location + react-native-maps |

## Project Structure

```
mobile-app/
  App.tsx                 # Root providers: QueryClient, Paper, Auth, Navigation
  index.js                # Expo entry point
  navigation/              # RootNavigator, AuthNavigator, MainNavigator, DeliveryNavigator, types
  screens/                 # All 30+ screens, grouped by feature
  components/              # Reusable UI: FoodCard, RestaurantCard, CartBar, Skeletons, EmptyState...
  services/                # Axios instance + one service module per REST resource
  hooks/                   # React Query hooks wrapping each service
  store/                   # AuthContext + zustand stores (theme, checkout, filters, onboarding)
  constants/                # theme, API config, React Query key factory
  types/                   # Shared domain TypeScript types
  utils/                   # formatters, zod schemas, secure-storage helpers
  assets/                  # App icons / splash (placeholders — replace with real artwork)
```

## Screens Implemented (all connected to the backend)

**Onboarding & Auth**
Splash → Onboarding (swiper) → Login (role switch: Customer / Delivery Partner) → Signup → OTP Verification

**Customer — Home & Discovery**
Home (categories, offers, popular, recommended, nearby restaurants w/ infinite scroll), Restaurant List, Restaurant Details, Search (with recent searches + debounce), Filter (modal), Categories, Offers, Popular Foods, Recommended, Food Details (option groups, quantity, reviews)

**Customer — Cart & Ordering**
Cart, Wishlist, Favorite Restaurants, Apply Coupon, Checkout, Address List (select/edit/delete), Add/Edit Address, Map Picker (current location + draggable pin), Order Summary (post-purchase confirmation), Live Order Tracking (map + timeline + cancel), Order History (Active/Past tabs), Order Details, Reorder, Ratings & Reviews

**Customer — Account**
Notifications, Profile, Edit Profile (with avatar upload), Change Password, Language, Logout, Delete Account

**Delivery Partner** (separate navigator, selected automatically when `user.role === "delivery_partner"`)
Login (shared screen, role toggle), Dashboard (online/offline, today stats, active order), Orders (Available → Accept/Reject, History), Live Delivery Map (pickup → drop-off, status progression), Wallet (balance + transactions), Profile

## Navigation Structure

```
RootNavigator (native-stack, decided by auth state)
├─ Splash
├─ Onboarding
├─ AuthNavigator (Login, Signup, OtpVerification)
├─ MainNavigator (customer)            ── used when role = customer
│   ├─ MainTabs (bottom tabs)
│   │   ├─ HomeTab, SearchTab, CartTab (badge), OrdersTab, ProfileTab
│   └─ Pushed detail screens shared by every tab:
│       RestaurantList/Details, Categories, Offers, PopularFoods, Recommended,
│       FoodDetails, Filter, Wishlist, FavoriteRestaurants, ApplyCoupon, Checkout,
│       AddressList, AddAddress, MapPicker, OrderSummary, LiveOrderTracking,
│       OrderDetails, RatingsReviews, Notifications, EditProfile, ChangePassword,
│       Language, DeleteAccount
└─ DeliveryNavigator (delivery partner) ── used when role = delivery_partner
    ├─ DeliveryTabs (Dashboard, Orders, Wallet, Profile)
    └─ DeliveryOrderMap
```

## Getting Started

```bash
cd mobile-app
npm install
cp .env.example .env   # then edit EXPO_PUBLIC_API_URL if needed
npm run start
```

Then press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

### Backend URL configuration

The API base URL is read from `EXPO_PUBLIC_API_URL` (Expo automatically inlines `EXPO_PUBLIC_*` vars into the JS bundle — no extra config needed).

- **iOS Simulator / web**: `http://localhost:5000/api/v1`
- **Android Emulator (AVD)**: the emulator can't reach your host's `localhost`; use the special alias **`http://10.0.2.2:5000/api/v1`**
- **Physical device**: use your computer's LAN IP, e.g. `http://192.168.1.10:5000/api/v1`

The expected REST contract (paths, payload shapes) is defined by the `services/*.ts` files and `types/index.ts` — point any backend implementing that contract at the app and every screen will render live data.

### Type-checking

```bash
npm run typecheck
```

## Notes on Implementation Choices

- **Auth**: JWT access/refresh tokens are stored in `expo-secure-store`. An Axios response interceptor automatically retries a request once with a refreshed token on `401`, and clears the session (routing back to `Auth`) if the refresh also fails.
- **React Query** is the single source of truth for all server data — every list supports pull-to-refresh, and paginated lists (restaurants, foods) use `useInfiniteQuery` for infinite scroll.
- **Empty/error states**: every screen distinguishes between loading (skeletons), error (retry CTA), and genuinely empty (helpful call-to-action) — there is no hard-coded fallback data.
- **Cart & checkout** are fully server-driven; only ephemeral UI selections (selected address id, payment method) live in a lightweight Zustand store (`store/useCheckoutStore.ts`).
- **Dark mode** is powered by React Native Paper's MD3 theme (`constants/theme.ts`) and toggled from the Profile screen, persisted via `store/useThemeStore.ts`.
- **Assets**: `assets/*.png` are 1×1 placeholder PNGs so `app.json` validates out of the box — swap them for real icon/splash artwork before shipping.
