import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PageHeader from '@/components/PageHeader';
import DataTable, { DataTableColumn } from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { ordersService } from '@/services/orders.service';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { ORDER_STATUS_OPTIONS } from '@/utils/constants';
import type { Order } from '@/types';

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { page, setPage, limit, setLimit, search, setSearch, filters, setFilter, params } = useTableQueryState();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersService.list(params),
  });

  const columns: DataTableColumn<Order>[] = [
    {
      key: 'orderNumber',
      label: 'Order #',
      render: (row) => (
        <Typography variant="body2" fontWeight={700} color="primary.main">
          #{row.orderNumber}
        </Typography>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (row) => (
        <Box>
          <Typography variant="body2">{row.customer?.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.customer?.phone}
          </Typography>
        </Box>
      ),
    },
    { key: 'restaurant', label: 'Restaurant', render: (row) => row.restaurant?.name },
    { key: 'total', label: 'Total', render: (row) => formatCurrency(row.total) },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (row) => <StatusChip status={row.paymentStatus} />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusChip status={row.status} />,
    },
    { key: 'createdAt', label: 'Placed On', render: (row) => formatDateTime(row.createdAt) },
  ];

  return (
    <Box>
      <PageHeader title="Orders" subtitle="Track and manage all customer orders" />

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        page={page}
        limit={limit}
        total={data?.total ?? 0}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onRowClick={(row) => navigate(`/orders/${row.id}`)}
        toolbar={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              placeholder="Search by order # or customer"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 280 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              size="small"
              label="Status"
              value={(filters.status as string) ?? ''}
              onChange={(e) => setFilter('status', e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {ORDER_STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        }
      />
    </Box>
  );
};

export default Orders;
