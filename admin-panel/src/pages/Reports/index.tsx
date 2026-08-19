import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import Loading from '@/components/Loading';
import { analyticsService } from '@/services/analytics.service';
import { extractErrorMessage } from '@/services/api';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';

const REPORT_TYPES = [
  { value: 'sales', label: 'Sales Report' },
  { value: 'orders', label: 'Orders Report' },
  { value: 'restaurants', label: 'Restaurant Performance' },
  { value: 'delivery', label: 'Delivery Performance' },
];

const RANGE_OPTIONS = [
  { value: 'weekly', label: 'Last 7 Days' },
  { value: 'monthly', label: 'Last 30 Days' },
  { value: 'quarterly', label: 'Last Quarter' },
  { value: 'yearly', label: 'Last Year' },
];

const Reports: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [reportType, setReportType] = useState('sales');
  const [range, setRange] = useState('monthly');
  const [exporting, setExporting] = useState(false);

  const summaryQuery = useQuery({
    queryKey: ['report-summary', reportType, range],
    queryFn: () => analyticsService.reportSummary({ type: reportType, range }),
  });

  const revenueQuery = useQuery({
    queryKey: ['report-revenue', range],
    queryFn: () => analyticsService.revenueSeries({ range }),
  });

  const ordersQuery = useQuery({
    queryKey: ['report-orders', range],
    queryFn: () => analyticsService.ordersSeries({ range }),
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await analyticsService.exportReport(reportType, { range });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}-report-${range}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      enqueueSnackbar('Report downloaded', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(extractErrorMessage(err), { variant: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const summary = summaryQuery.data;

  return (
    <Box>
      <PageHeader
        title="Reports"
        subtitle="Generate and export detailed business reports"
        actions={
          <Stack direction="row" spacing={1.5}>
            <TextField select size="small" label="Report" value={reportType} onChange={(e) => setReportType(e.target.value)} sx={{ minWidth: 200 }}>
              {REPORT_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Range" value={range} onChange={(e) => setRange(e.target.value)} sx={{ minWidth: 180 }}>
              {RANGE_OPTIONS.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="contained" startIcon={<DownloadOutlinedIcon />} disabled={exporting} onClick={handleExport}>
              Export CSV
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={2.5} mb={1}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(summary?.totalRevenue)}
            icon={<PaymentsOutlinedIcon />}
            color="primary"
            isLoading={summaryQuery.isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Orders"
            value={formatNumber(summary?.totalOrders)}
            icon={<ReceiptLongOutlinedIcon />}
            color="info"
            isLoading={summaryQuery.isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Active Restaurants"
            value={formatNumber(summary?.activeRestaurants)}
            icon={<StorefrontOutlinedIcon />}
            color="warning"
            isLoading={summaryQuery.isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="New Customers"
            value={formatNumber(summary?.newCustomers)}
            icon={<PeopleAltOutlinedIcon />}
            color="success"
            isLoading={summaryQuery.isLoading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={6}>
          <Card variant="outlined">
            <CardHeader title="Revenue Over Time" />
            <CardContent>
              {revenueQuery.isLoading ? (
                <Loading minHeight={280} />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={revenueQuery.data ?? []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="label" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="value" name="Revenue" stroke="#FF5722" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Card variant="outlined">
            <CardHeader title="Orders Over Time" />
            <CardContent>
              {ordersQuery.isLoading ? (
                <Loading minHeight={280} />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
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
      </Grid>

      {!summaryQuery.isLoading && !summary && (
        <Typography variant="body2" color="text.secondary" mt={2}>
          No summary data available for the selected filters.
        </Typography>
      )}
    </Box>
  );
};

export default Reports;
