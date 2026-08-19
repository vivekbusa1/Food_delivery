import { useMemo } from 'react';
import {
  Box,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import { Link as RouterLink } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { EmptyState } from '@/components/common/EmptyState';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useOrders } from '@/hooks/useOrders';
import { formatCurrency, formatRelativeTime } from '@/utils/formatters';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/utils/constants';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: analytics, isLoading: isAnalyticsLoading } = useAnalytics('7d');
  const { data: pendingOrders, isLoading: isPendingLoading } = useOrders(
    { status: 'pending', page: 1, limit: 5 },
    { realtime: true }
  );
  const { data: recentOrders, isLoading: isRecentLoading } = useOrders({
    status: 'all',
    page: 1,
    limit: 6,
  });

  const chartData = useMemo(() => {
    const trend = analytics?.revenueTrend ?? [];
    return {
      labels: trend.map((point) => point.date.slice(5)),
      revenue: trend.map((point) => point.revenue),
    };
  }, [analytics]);

  const summary = analytics?.summary;

  return (
    <Box>
      <PageHeader
        title={`Welcome back, ${user?.restaurantName ?? 'Partner'}`}
        description="Here's how your restaurant is performing today."
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Orders (7 days)"
            value={String(summary?.totalOrders ?? 0)}
            icon={<ReceiptLongRoundedIcon />}
            color="#ED5A2C"
            changePercent={summary?.ordersChangePercent}
            isLoading={isAnalyticsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Revenue (7 days)"
            value={formatCurrency(summary?.totalRevenue)}
            icon={<PaymentsRoundedIcon />}
            color="#2E9E5B"
            changePercent={summary?.revenueChangePercent}
            isLoading={isAnalyticsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Average rating"
            value={(summary?.avgRating ?? 0).toFixed(1)}
            icon={<StarRoundedIcon />}
            color="#FFB238"
            isLoading={isAnalyticsLoading}
            subtitle="Based on recent reviews"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="New customers"
            value={String(summary?.newCustomers ?? 0)}
            icon={<GroupRoundedIcon />}
            color="#3B82C4"
            isLoading={isAnalyticsLoading}
            subtitle="Last 7 days"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                Revenue trend
              </Typography>
              <Chip label="Last 7 days" size="small" variant="outlined" />
            </Stack>
            {chartData.labels.length > 0 ? (
              <LineChart
                height={300}
                series={[
                  {
                    data: chartData.revenue,
                    label: 'Revenue',
                    color: '#ED5A2C',
                    area: true,
                    showMark: false,
                  },
                ]}
                xAxis={[{ scaleType: 'point', data: chartData.labels }]}
                margin={{ left: 60, right: 20, top: 20, bottom: 30 }}
              />
            ) : (
              <EmptyState title="No revenue data yet" description="Once you start receiving orders, your revenue trend will show up here." />
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                New orders awaiting action
              </Typography>
              <Chip
                component={RouterLink}
                to="/orders"
                clickable
                label="View all"
                size="small"
                color="primary"
                variant="outlined"
              />
            </Stack>

            {!isPendingLoading && (pendingOrders?.data.length ?? 0) === 0 && (
              <EmptyState
                title="No pending orders"
                description="New orders will appear here in real time."
              />
            )}

            <List disablePadding>
              {pendingOrders?.data.map((order, index) => (
                <Box key={order.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem
                    disableGutters
                    secondaryAction={
                      <Chip
                        size="small"
                        label={ORDER_STATUS_LABELS[order.status]}
                        color={ORDER_STATUS_COLORS[order.status]}
                      />
                    }
                  >
                    <ListItemText
                      primary={`#${order.orderNumber} · ${order.customer.name}`}
                      secondary={`${formatCurrency(order.total)} · ${formatRelativeTime(order.createdAt)}`}
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                Recent orders
              </Typography>
              <Chip
                component={RouterLink}
                to="/orders"
                clickable
                label="Manage orders"
                size="small"
                color="primary"
                variant="outlined"
              />
            </Stack>

            {!isRecentLoading && (recentOrders?.data.length ?? 0) === 0 && (
              <EmptyState title="No orders yet" description="Your recent orders will show up here." />
            )}

            <List disablePadding>
              {recentOrders?.data.map((order, index) => (
                <Box key={order.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem
                    disableGutters
                    secondaryAction={
                      <Stack alignItems="flex-end" spacing={0.5}>
                        <Chip
                          size="small"
                          label={ORDER_STATUS_LABELS[order.status]}
                          color={ORDER_STATUS_COLORS[order.status]}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatCurrency(order.total)}
                        </Typography>
                      </Stack>
                    }
                  >
                    <ListItemText
                      primary={`#${order.orderNumber} · ${order.customer.name}`}
                      secondary={`${order.items.length} items · ${formatRelativeTime(order.createdAt)}`}
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
