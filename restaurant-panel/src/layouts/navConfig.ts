import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import type { SvgIconComponent } from '@mui/icons-material';

export interface NavItem {
  label: string;
  path: string;
  icon: SvgIconComponent;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: DashboardRoundedIcon },
      { label: 'Orders', path: '/orders', icon: ReceiptLongRoundedIcon },
      { label: 'Analytics', path: '/analytics', icon: InsightsRoundedIcon },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { label: 'Food Management', path: '/food', icon: RestaurantMenuRoundedIcon },
      { label: 'Categories', path: '/categories', icon: CategoryRoundedIcon },
      { label: 'Offers', path: '/offers', icon: LocalOfferRoundedIcon },
    ],
  },
  {
    title: 'Reputation',
    items: [{ label: 'Ratings & Reviews', path: '/reviews', icon: StarRoundedIcon }],
  },
  {
    title: 'Restaurant',
    items: [
      { label: 'Profile & Business', path: '/profile', icon: StorefrontRoundedIcon },
      { label: 'Working Hours', path: '/working-hours', icon: AccessTimeRoundedIcon },
      { label: 'Notifications', path: '/notifications', icon: NotificationsRoundedIcon },
      { label: 'Settings', path: '/settings', icon: SettingsRoundedIcon },
    ],
  },
];
