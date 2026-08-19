import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { LoadingScreen } from '@/components/common/LoadingScreen';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const WorkingHoursPage = lazy(() => import('@/pages/hours/WorkingHoursPage'));
const CategoriesPage = lazy(() => import('@/pages/categories/CategoriesPage'));
const FoodManagementPage = lazy(() => import('@/pages/food/FoodManagementPage'));
const OffersPage = lazy(() => import('@/pages/offers/OffersPage'));
const OrdersPage = lazy(() => import('@/pages/orders/OrdersPage'));
const AnalyticsPage = lazy(() => import('@/pages/analytics/AnalyticsPage'));
const ReviewsPage = lazy(() => import('@/pages/reviews/ReviewsPage'));
const NotificationsPage = lazy(() => import('@/pages/notifications/NotificationsPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function SuspenseFallback() {
  return <LoadingScreen />;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/food" element={<FoodManagementPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/working-hours" element={<WorkingHoursPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
