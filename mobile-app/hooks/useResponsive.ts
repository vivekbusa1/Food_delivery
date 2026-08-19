import { useWindowDimensions } from "react-native";

export const BREAKPOINTS = {
  phone: 0,
  tablet: 600,
  desktop: 960,
} as const;

/**
 * Shared layout metrics for phone / tablet / desktop (especially Expo web).
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isPhone = width < BREAKPOINTS.tablet;
  const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
  const isDesktop = width >= BREAKPOINTS.desktop;

  // Centered app column: keeps mobile UX readable on large monitors.
  const shellMaxWidth = isDesktop ? 960 : isTablet ? 720 : width;
  const contentPadding = isPhone ? 16 : 20;
  const restaurantColumns = width >= 700 ? 2 : 1;
  const foodCardWidth = isPhone ? 160 : 180;

  return {
    width,
    height,
    isPhone,
    isTablet,
    isDesktop,
    shellMaxWidth,
    contentPadding,
    restaurantColumns,
    foodCardWidth,
  };
}
