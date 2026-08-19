// Centralized React Query key factory to keep cache invalidation consistent across hooks.
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  restaurants: {
    all: ["restaurants"] as const,
    list: (filters?: Record<string, unknown>) => ["restaurants", "list", filters ?? {}] as const,
    detail: (id: string) => ["restaurants", "detail", id] as const,
    favorites: ["restaurants", "favorites"] as const,
  },
  foods: {
    all: ["foods"] as const,
    list: (filters?: Record<string, unknown>) => ["foods", "list", filters ?? {}] as const,
    detail: (id: string) => ["foods", "detail", id] as const,
    popular: ["foods", "popular"] as const,
    recommended: ["foods", "recommended"] as const,
    search: (query: string) => ["foods", "search", query] as const,
  },
  categories: {
    all: ["categories"] as const,
  },
  offers: {
    all: ["offers"] as const,
  },
  cart: {
    detail: ["cart"] as const,
  },
  wishlist: {
    all: ["wishlist"] as const,
  },
  addresses: {
    all: ["addresses"] as const,
    detail: (id: string) => ["addresses", "detail", id] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: (status?: string) => ["orders", "list", status ?? "all"] as const,
    detail: (id: string) => ["orders", "detail", id] as const,
  },
  coupons: {
    all: ["coupons"] as const,
  },
  reviews: {
    forRestaurant: (id: string) => ["reviews", "restaurant", id] as const,
    forFood: (id: string) => ["reviews", "food", id] as const,
    forOrder: (id: string) => ["reviews", "order", id] as const,
  },
  notifications: {
    all: ["notifications"] as const,
  },
  delivery: {
    dashboard: ["delivery", "dashboard"] as const,
    availableOrders: ["delivery", "availableOrders"] as const,
    active: ["delivery", "active"] as const,
    history: ["delivery", "history"] as const,
    wallet: ["delivery", "wallet"] as const,
    profile: ["delivery", "profile"] as const,
  },
};
