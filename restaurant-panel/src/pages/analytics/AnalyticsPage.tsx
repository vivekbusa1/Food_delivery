import { useMemo, useState } from 'react';
import {
  Box,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import ShoppingBasketRoundedIcon from '@mui/icons-material/ShoppingBasketRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { useAnalytics } from '@/hooks/useAnalytics';
import { formatCurrency, formatStatusLabel } from '@/utils/formatters';
import { ORDER_STATUS_LABELS } from '@/utils/constants';
import type { AnalyticsRange } from '@/types';

const RANGE_OPTIONS: { label: string; value: AnalyticsRange }[] = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: '#F0A202',
  accepted: '#3B82C4',
  rejected: '#E03B3B',
  preparing: '#D8402A',
  ready: '#ED5A2C',
  out_for_delivery: '#3B82C4',
  delivered: '#2E9E5B',
  completed: '#2E9E5B',
  cancelled: '#9E9E9E',
};

export default function AnalyticsPage() {
  const [range, setRange] = useState<AnalyticsRange>('7d');
  const { data: analytics, isLoading } = useAnalytics(range);

  const chartData = useMemo(() => {
    const trend = analytics?.revenueTrend ?? [];
    return {
      labels: trend.map((point) => point.date.slice(5)),
      revenue: trend.map((point) => point.revenue),
      orders: trend.map((point) => point.orders),
    };
  }, [analytics]);

  const pieData = useMemo(() => {
    const statuses = analytics?.ordersByStatus ?? {};
    return Object.entries(statuses)
      .filter(([, count]) => (count ?? 0) > 0)
      .map(([status, count], index) => ({
        id: index,
        value: count ?? 0,
        label: ORDER_STATUS_LABELS[status] ?? formatStatusLabel(status),
        color: STATUS_COLORS[status] ?? '#ED5A2C',
      }));
  }, [analytics]);

  const summary = analytics?.summary;

  return (
    <Box>
      <PageHeader
        title="Analytics"
        description="Track your restaurant's performance over time."
        actions={
          <ToggleButtonGroup
            size="small"
            exclusive
            value={range}
            onChange={(_, value) => value && setRange(value)}
          >
            {RANGE_OPTIONS.map((option) => (
              <ToggleButton key={option.value} value={option.value}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        }
      />

      {isLoading ? (
        <LoadingScreen label="Crunching your numbers…" />
      ) : (
        <>
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                label="Total revenue"
                value={formatCurrency(summary?.totalRevenue)}
                icon={<PaymentsRoundedIcon />}
                color="#2E9E5B"
                changePercent={summary?.revenueChangePercent}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                label="Total orders"
                value={String(summary?.totalOrders ?? 0)}
                icon={<ReceiptLongRoundedIcon />}
                color="#ED5A2C"
                changePercent={summary?.ordersChangePercent}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                label="Average order value"
                value={formatCurrency(summary?.avgOrderValue)}
                icon={<ShoppingBasketRoundedIcon />}
                color="#FFB238"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                label="Total customers"
                value={String(summary?.totalCustomers ?? 0)}
                icon={<GroupRoundedIcon />}
                color="#3B82C4"
                subtitle={`${summary?.newCustomers ?? 0} new`}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2.5}>
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Revenue & orders trend
                </Typography>
                {chartData.labels.length > 0 ? (
                  <LineChart
                    height={320}
                    series={[
                      {
                        data: chartData.revenue,
                        label: 'Revenue (₹)',
                        color: '#ED5A2C',
                        yAxisId: 'revenue',
                        area: true,
                      },
                      {
                        data: chartData.orders,
                        label: 'Orders',
                        color: '#3B82C4',
                        yAxisId: 'orders',
                      },
                    ]}
                    xAxis={[{ scaleType: 'point', data: chartData.labels }]}
                    yAxis={[{ id: 'revenue' }, { id: 'orders' }]}
                    rightAxis="orders"
                    margin={{ left: 60, right: 60, top: 30, bottom: 30 }}
                  />
                ) : (
                  <EmptyState title="No data for this period" />
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Orders by status
                </Typography>
                {pieData.length > 0 ? (
                  <PieChart
                    series={[{ data: pieData, innerRadius: 40, paddingAngle: 2, cornerRadius: 4 }]}
                    height={280}
                  />
                ) : (
                  <EmptyState title="No orders in this period" />
                )}
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  Top selling items
                </Typography>
                {(analytics?.topSellingItems.length ?? 0) === 0 ? (
                  <EmptyState title="No sales data yet" />
                ) : (
                  <List>
                    {analytics?.topSellingItems.map((item, index) => (
                      <ListItem
                        key={item.foodId}
                        disableGutters
                        secondaryAction={
                          <Typography variant="subtitle2" fontWeight={700}>
                            {formatCurrency(item.revenue)}
                          </Typography>
                        }
                      >
                        <ListItemText
                          primary={`${index + 1}. ${item.name}`}
                          secondary={`${item.quantity} sold`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
