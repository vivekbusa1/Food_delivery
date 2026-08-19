import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import Loading from '@/components/Loading';
import { analyticsService } from '@/services/analytics.service';
import { formatCurrency, formatNumber, getInitials } from '@/utils/formatters';

const CHART_COLORS = ['#FF5722', '#FFC107', '#2F80ED', '#2E9E5B', '#9C27B0', '#00BCD4'];

const Dashboard: React.FC = () => {
  const statsQuery = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: analyticsService.dashboardStats,
  });

  const revenueQuery = useQuery({
    queryKey: ['dashboard-revenue'],
    queryFn: () => analyticsService.revenueSeries({ range: 'monthly' }),
  });

  const ordersQuery = useQuery({
    queryKey: ['dashboard-orders'],
    queryFn: () => analyticsService.ordersSeries({ range: 'monthly' }),
  });

  const usersQuery = useQuery({
    queryKey: ['dashboard-users'],
    queryFn: () => analyticsService.usersSeries({ range: 'monthly' }),
  });

  const restaurantsQuery = useQuery({
    queryKey: ['dashboard-restaurants'],
    queryFn: () => analyticsService.restaurantsSeries({ range: 'monthly' }),
  });

  const topFoodsQuery = useQuery({
    queryKey: ['dashboard-top-foods'],
    queryFn: () => analyticsService.topFoods({ limit: 5 }),
  });

  const topRestaurantsQuery = useQuery({
    queryKey: ['dashboard-top-restaurants'],
    queryFn: () => analyticsService.topRestaurants({ limit: 5 }),
  });

  const stats = statsQuery.data;

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="Overview of your platform's performance" />

      <Grid container spacing={2.5} mb={1}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats?.totalRevenue)}
            change={stats?.revenueChange}
            icon={<PaymentsOutlinedIcon />}
            color="primary"
            isLoading={statsQuery.isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Orders"
            value={formatNumber(stats?.totalOrders)}
            change={stats?.ordersChange}
            icon={<ReceiptLongOutlinedIcon />}
            color="info"
            isLoading={statsQuery.isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Users"
            value={formatNumber(stats?.totalUsers)}
            change={stats?.usersChange}
            icon={<PeopleAltOutlinedIcon />}
            color="success"
            isLoading={statsQuery.isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Restaurants"
            value={formatNumber(stats?.totalRestaurants)}
            change={stats?.restaurantsChange}
            icon={<StorefrontOutlinedIcon />}
            color="warning"
            isLoading={statsQuery.isLoading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} mt={0.5}>
        <Grid item xs={12} lg={8}>
          <Card variant="outlined">
            <CardHeader title="Revenue Trend" subheader="Monthly platform revenue" />
            <CardContent>
              {revenueQuery.isLoading ? (
                <Loading minHeight={300} />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueQuery.data ?? []}>
                    <defs>
                      <linearGradient id="revenueColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF5722" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#FF5722" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="label" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Area type="monotone" dataKey="value" stroke="#FF5722" fill="url(#revenueColor)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardHeader title="Top Restaurants" subheader="By total orders" />
            <CardContent>
              {topRestaurantsQuery.isLoading ? (
                <Loading minHeight={260} />
              ) : (
                <List disablePadding>
                  {(topRestaurantsQuery.data ?? []).map((r, idx) => (
                    <ListItem key={r.id} disableGutters>
                      <ListItemAvatar>
                        <Avatar src={r.image} sx={{ bgcolor: CHART_COLORS[idx % CHART_COLORS.length] }}>
                          {getInitials(r.name)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={r.name}
                        secondary={`${formatNumber(r.value)} ${r.metric}`}
                      />
                    </ListItem>
                  ))}
                  {(topRestaurantsQuery.data ?? []).length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No data available
                    </Typography>
                  )}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardHeader title="Monthly Orders" />
            <CardContent>
              {ordersQuery.isLoading ? (
                <Loading minHeight={260} />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={ordersQuery.data ?? []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="label" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2F80ED" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardHeader title="User & Restaurant Growth" />
            <CardContent>
              {usersQuery.isLoading || restaurantsQuery.isLoading ? (
                <Loading minHeight={260} />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={usersQuery.data ?? []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="label" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" name="Users" stroke="#2E9E5B" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardHeader title="Top Selling Foods" />
            <CardContent>
              {topFoodsQuery.isLoading ? (
                <Loading minHeight={280} />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={topFoodsQuery.data ?? []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => entry.name}
                    >
                      {(topFoodsQuery.data ?? []).map((entry, idx) => (
                        <Cell key={entry.id} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardHeader title="Top Foods (Ranked)" />
            <CardContent>
              <List disablePadding>
                {(topFoodsQuery.data ?? []).map((food, idx) => (
                  <ListItem key={food.id} disableGutters>
                    <ListItemAvatar>
                      <Avatar src={food.image} sx={{ bgcolor: CHART_COLORS[idx % CHART_COLORS.length] }}>
                        {idx + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={food.name} secondary={`${formatNumber(food.value)} ${food.metric}`} />
                  </ListItem>
                ))}
                {(topFoodsQuery.data ?? []).length === 0 && !topFoodsQuery.isLoading && (
                  <Typography variant="body2" color="text.secondary">
                    No data available
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
