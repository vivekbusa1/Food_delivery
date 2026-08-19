import type { SvgIconComponent } from '@mui/icons-material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import TwoWheelerOutlinedIcon from '@mui/icons-material/TwoWheelerOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import RedeemOutlinedIcon from '@mui/icons-material/RedeemOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';

export interface NavItem {
  label: string;
  path: string;
  icon: SvgIconComponent;
  permission?: string;
}

export interface NavSection {
  section: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: DashboardOutlinedIcon, permission: 'dashboard.view' },
      { label: 'Analytics', path: '/analytics', icon: InsightsOutlinedIcon, permission: 'reports.view' },
      { label: 'Reports', path: '/reports', icon: SummarizeOutlinedIcon, permission: 'reports.view' },
    ],
  },
  {
    section: 'Operations',
    items: [
      { label: 'Orders', path: '/orders', icon: ReceiptLongOutlinedIcon, permission: 'orders.view' },
      { label: 'Customers', path: '/customers', icon: PeopleAltOutlinedIcon, permission: 'customers.view' },
      { label: 'Restaurants', path: '/restaurants', icon: StorefrontOutlinedIcon, permission: 'restaurants.view' },
      { label: 'Delivery Partners', path: '/delivery-partners', icon: TwoWheelerOutlinedIcon, permission: 'delivery.view' },
      { label: 'Delivery Management', path: '/delivery-management', icon: MapOutlinedIcon, permission: 'delivery.view' },
      { label: 'Payments', path: '/payments', icon: PaymentsOutlinedIcon, permission: 'payments.view' },
    ],
  },
  {
    section: 'Catalog & Marketing',
    items: [
      { label: 'Food Categories', path: '/categories', icon: CategoryOutlinedIcon, permission: 'catalog.manage' },
      { label: 'Banners', path: '/banners', icon: ViewCarouselOutlinedIcon, permission: 'marketing.manage' },
      { label: 'Coupons', path: '/coupons', icon: RedeemOutlinedIcon, permission: 'marketing.manage' },
      { label: 'Offers', path: '/offers', icon: LocalOfferOutlinedIcon, permission: 'marketing.manage' },
    ],
  },
  {
    section: 'Engagement',
    items: [
      { label: 'Notifications', path: '/notifications', icon: NotificationsActiveOutlinedIcon, permission: 'notifications.manage' },
      { label: 'CMS Pages', path: '/cms', icon: ArticleOutlinedIcon, permission: 'cms.manage' },
    ],
  },
  {
    section: 'Administration',
    items: [
      { label: 'User Management', path: '/user-management', icon: ManageAccountsOutlinedIcon, permission: 'settings.manage' },
      { label: 'Role Management', path: '/roles', icon: AdminPanelSettingsOutlinedIcon, permission: 'roles.manage' },
      { label: 'Settings', path: '/settings', icon: SettingsOutlinedIcon, permission: 'settings.manage' },
      { label: 'Logs', path: '/logs', icon: HistoryOutlinedIcon, permission: 'logs.view' },
    ],
  },
];
