import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  MenuItem,
  TextField,
} from '@mui/material';
import {
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
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import { analyticsService } from '@/services/analytics.service';
import { formatCurrency } from '@/utils/formatters';

const RANGE_OPTIONS = [
  { value: 'weekly', label: 'Last 7 Days' },
  { value: 'monthly', label: 'Last 30 Days' },
  { value: 'quarterly', label: 'Last Quarter' },
  { value: 'yearly', label: 'Last Year' },
];

const CHART_COLORS = ['#FF5722', '#FFC107', '#2F80ED', '#2E9E5B', '#9C27B0', '#00BCD4'];

const Analytics: React.FC = () => {
  const [range, setRange] = useState('monthly');

  const revenueQuery = useQuery({
    queryKey: ['analytics-revenue', range],
    queryFn: () => analyticsService.revenueSeries({ range }),
  });
  const ordersQuery = useQuery({
    queryKey: ['analytics-orders', range],
    queryFn: () => analyticsService.ordersSeries({ range }),
  });
  const usersQuery = useQuery({
    queryKey: ['analytics-users', range],
    queryFn: () => analyticsService.usersSeries({ range }),
  });
  const categoryQuery = useQuery({
    queryKey: ['analytics-category', range],
    queryFn: () => analyticsService.salesByCategory({ range }),
  });
  const topRestaurantsQuery = useQuery({
    queryKey: ['analytics-top-restaurants', range],
    queryFn: () => analyticsService.topRestaurants({ range, limit: 10 }),
  });

  return (
    <Box>
      <PageHeader
        title="Analytics"
        subtitle="Deep dive into platform performance metrics"
        actions={
          <TextField select size="small" label="Range" value={range} onChange={(e) => setRange(e.target.value)} sx={{ minWidth: 180 }}>
            {RANGE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        }
      />

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <Card variant="outlined">
            <CardHeader title="Revenue vs Orders" />
            <CardContent>
              {revenueQuery.isLoading || ordersQuery.isLoading ? (
                <Loading minHeight={320} />
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="label" allowDuplicatedCategory={false} fontSize={12} />
                    <YAxis yAxisId="left" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      data={revenueQuery.data ?? []}
                      type="monotone"
                      dataKey="value"
                      name="Revenue"
                      stroke="#FF5722"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      yAxisId="right"
                      data={ordersQuery.data ?? []}
                      type="monotone"
                      dataKey="value"
                      name="Orders"
                      stroke="#2F80ED"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardHeader title="Sales by Category" />
            <CardContent>
              {categoryQuery.isLoading ? (
                <Loading minHeight={280} />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={categoryQuery.data ?? []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {(categoryQuery.data ?? []).map((entry, idx) => (
                        <Cell key={entry.id} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card variant="outlined">
            <CardHeader title="New User Signups" />
            <CardContent>
              {usersQuery.isLoading ? (
                <Loading minHeight={280} />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={usersQuery.data ?? []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="label" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2E9E5B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card variant="outlined">
            <CardHeader title="Top Restaurants by Revenue" />
            <CardContent>
              {topRestaurantsQuery.isLoading ? (
                <Loading minHeight={280} />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topRestaurantsQuery.data ?? []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" fontSize={12} />
                    <YAxis type="category" dataKey="name" width={120} fontSize={12} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="value" fill="#FFC107" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
