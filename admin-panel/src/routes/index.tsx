import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '@/layouts/DashboardLayout';

import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Analytics from '@/pages/Analytics';
import Orders from '@/pages/Orders';
import OrderDetail from '@/pages/Orders/OrderDetail';
import Customers from '@/pages/Customers';
import CustomerDetail from '@/pages/Customers/CustomerDetail';
import Restaurants from '@/pages/Restaurants';
import RestaurantDetail from '@/pages/Restaurants/RestaurantDetail';
import DeliveryPartners from '@/pages/DeliveryPartners';
import Categories from '@/pages/Categories';
import Banners from '@/pages/Banners';
import Coupons from '@/pages/Coupons';
import Offers from '@/pages/Offers';
import UserManagement from '@/pages/UserManagement';
import DeliveryManagement from '@/pages/DeliveryManagement';
import Payments from '@/pages/Payments';
import Reports from '@/pages/Reports';
import CMS from '@/pages/CMS';
import Notifications from '@/pages/Notifications';
import Settings from '@/pages/Settings';
import RoleManagement from '@/pages/RoleManagement';
import Logs from '@/pages/Logs';
import NotFound from '@/pages/NotFound';

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/analytics', element: <Analytics /> },
          { path: '/orders', element: <Orders /> },
          { path: '/orders/:id', element: <OrderDetail /> },
          { path: '/customers', element: <Customers /> },
          { path: '/customers/:id', element: <CustomerDetail /> },
          { path: '/restaurants', element: <Restaurants /> },
          { path: '/restaurants/:id', element: <RestaurantDetail /> },
          { path: '/delivery-partners', element: <DeliveryPartners /> },
          { path: '/delivery-management', element: <DeliveryManagement /> },
          { path: '/categories', element: <Categories /> },
          { path: '/banners', element: <Banners /> },
          { path: '/coupons', element: <Coupons /> },
          { path: '/offers', element: <Offers /> },
          { path: '/user-management', element: <UserManagement /> },
          { path: '/payments', element: <Payments /> },
          { path: '/reports', element: <Reports /> },
          { path: '/cms', element: <CMS /> },
          { path: '/notifications', element: <Notifications /> },
          { path: '/settings', element: <Settings /> },
          { path: '/roles', element: <RoleManagement /> },
          { path: '/logs', element: <Logs /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

export default router;
