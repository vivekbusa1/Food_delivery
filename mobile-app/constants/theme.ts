import { MD3LightTheme, type MD3Theme } from "react-native-paper";

/** Shared brand palette used across mobile, admin, and restaurant panels. */
const brandColors = {
  primary: "#FF6B35",
  primaryDark: "#E85A2A",
  primaryLight: "#FF8A5C",
  secondary: "#2EC4B6",
  success: "#3BB273",
  warning: "#F4A259",
  error: "#E5484D",
  info: "#2E86DE",
};

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brandColors.primary,
    primaryContainer: "#FFE4D9",
    secondary: brandColors.secondary,
    secondaryContainer: "#D5F7F3",
    error: brandColors.error,
    errorContainer: "#FDECEC",
    background: "#FAF8F6",
    surface: "#FFFFFF",
    surfaceVariant: "#F3EEEA",
    onSurface: "#1C1917",
    onSurfaceVariant: "#5B5955",
    outline: "#D6D0CA",
    outlineVariant: "#E8E2DC",
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level1: "#FFFFFF",
      level2: "#FFFCFA",
      level3: "#FFF9F5",
    },
  },
  roundness: 14,
};

/** Kept for type compatibility; app is locked to light theme. */
export const darkTheme = lightTheme;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const statusColors: Record<string, string> = {
  placed: "#8D8D8D",
  confirmed: brandColors.info,
  preparing: brandColors.warning,
  ready_for_pickup: brandColors.warning,
  picked_up: brandColors.secondary,
  on_the_way: brandColors.secondary,
  delivered: brandColors.success,
  cancelled: brandColors.error,
};

export { brandColors };
