import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { Avatar, Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import StatCard from '@/components/StatCard';
import DataTable, { DataTableColumn } from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { customersService } from '@/services/users.service';
import { extractErrorMessage } from '@/services/api';
import { formatCurrency, formatDate, formatDateTime, getInitials } from '@/utils/formatters';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import type { Order } from '@/types';

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { page, setPage, limit, setLimit, params } = useTableQueryState();

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersService.get(id as string),
    enabled: Boolean(id),
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['customer-orders', id, params],
    queryFn: () => customersService.getOrders(id as string, params),
    enabled: Boolean(id),
  });

  const statusMutation = useMutation({
    mutationFn: (status: 'active' | 'blocked') => customersService.setStatus(id as string, status),
    onSuccess: () => {
      enqueueSnackbar('Customer status updated', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const columns: DataTableColumn<Order>[] = [
    { key: 'orderNumber', label: 'Order #', render: (row) => `#${row.orderNumber}` },
    { key: 'restaurant', label: 'Restaurant', render: (row) => row.restaurant?.name },
    { key: 'total', label: 'Total', align: 'right', render: (row) => formatCurrency(row.total) },
    { key: 'status', label: 'Status', render: (row) => <StatusChip status={row.status} /> },
    { key: 'createdAt', label: 'Date', render: (row) => formatDateTime(row.createdAt) },
  ];

  if (isLoading) return <Loading minHeight={400} />;
  if (!customer) return <Typography>Customer not found</Typography>;

  return (
    <Box>
      <PageHeader
        title={customer.name}
        subtitle={customer.email}
        actions={
          <Stack direction="row" spacing={1.5}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/customers')}>
              Back
            </Button>
            <Button
              variant="contained"
              color={customer.status === 'active' ? 'error' : 'success'}
              disabled={statusMutation.isPending}
              onClick={() => statusMutation.mutate(customer.status === 'active' ? 'blocked' : 'active')}
            >
              {customer.status === 'active' ? 'Block Customer' : 'Unblock Customer'}
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={2.5} mb={1}>
        <Grid item xs={12} sm={4}>
          <StatCard title="Total Orders" value={customer.totalOrders ?? 0} icon={<ReceiptLongOutlinedIcon />} color="info" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Total Spent" value={formatCurrency(customer.totalSpent)} icon={<PaymentsOutlinedIcon />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Wallet Balance"
            value={formatCurrency(customer.walletBalance)}
            icon={<AccountBalanceWalletOutlinedIcon />}
            color="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={4}>
          <Card variant="outlined">
            <CardContent>
              <Stack alignItems="center" spacing={1.5} mb={2}>
                <Avatar src={customer.avatar} sx={{ width: 72, height: 72 }}>
                  {getInitials(customer.name)}
                </Avatar>
                <Chip label={customer.status} color={customer.status === 'active' ? 'success' : 'error'} size="small" />
              </Stack>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Phone</Typography>
                  <Typography variant="body2">{customer.phone}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Joined</Typography>
                  <Typography variant="body2">{formatDate(customer.createdAt)}</Typography>
                </Box>
              </Stack>
              {customer.addresses && customer.addresses.length > 0 && (
                <>
                  <Typography variant="subtitle2" fontWeight={700} mt={3} mb={1}>
                    Saved Addresses
                  </Typography>
                  <Stack spacing={1.5}>
                    {customer.addresses.map((addr) => (
                      <Box key={addr.id} p={1.5} borderRadius={2} bgcolor="action.hover">
                        <Typography variant="body2" fontWeight={600}>{addr.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {addr.line1}, {addr.city}, {addr.state} {addr.pincode}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
            Order History
          </Typography>
          <DataTable
            columns={columns}
            rows={orders?.items ?? []}
            rowKey={(row) => row.id}
            isLoading={ordersLoading}
            page={page}
            limit={limit}
            total={orders?.total ?? 0}
            onPageChange={setPage}
            onLimitChange={setLimit}
            onRowClick={(row) => navigate(`/orders/${row.id}`)}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerDetail;
