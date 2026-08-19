import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { Avatar, Box, InputAdornment, MenuItem, Stack, Switch, TextField, Tooltip, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PageHeader from '@/components/PageHeader';
import DataTable, { DataTableColumn } from '@/components/DataTable';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { customersService } from '@/services/users.service';
import { extractErrorMessage } from '@/services/api';
import { formatCurrency, formatDate, getInitials } from '@/utils/formatters';
import type { Customer } from '@/types';

const Customers: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { page, setPage, limit, setLimit, search, setSearch, filters, setFilter, params } = useTableQueryState();
  const [toConfirm, setToConfirm] = useState<Customer | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['customers', params],
    queryFn: () => customersService.list(params),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'blocked' }) => customersService.setStatus(id, status),
    onSuccess: (_data, variables) => {
      enqueueSnackbar(variables.status === 'blocked' ? 'Customer blocked' : 'Customer unblocked', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setToConfirm(null);
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const columns: DataTableColumn<Customer>[] = [
    {
      key: 'name',
      label: 'Customer',
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar src={row.avatar} sx={{ width: 34, height: 34 }}>
            {getInitials(row.name)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>{row.name}</Typography>
            <Typography variant="caption" color="text.secondary">{row.email}</Typography>
          </Box>
        </Stack>
      ),
    },
    { key: 'phone', label: 'Phone', render: (row) => row.phone },
    { key: 'totalOrders', label: 'Orders', align: 'right', render: (row) => row.totalOrders ?? 0 },
    { key: 'totalSpent', label: 'Total Spent', align: 'right', render: (row) => formatCurrency(row.totalSpent) },
    { key: 'createdAt', label: 'Joined', render: (row) => formatDate(row.createdAt) },
    {
      key: 'status',
      label: 'Active',
      render: (row) => (
        <Tooltip title={row.status === 'active' ? 'Block customer' : 'Unblock customer'}>
          <Switch
            checked={row.status === 'active'}
            color="success"
            onClick={(e) => e.stopPropagation()}
            onChange={() => setToConfirm(row)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader title="Customers" subtitle="Manage registered customers" />

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
        onRowClick={(row) => navigate(`/customers/${row.id}`)}
        toolbar={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              placeholder="Search by name, email or phone"
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
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="blocked">Blocked</MenuItem>
            </TextField>
          </Stack>
        }
      />

      <ConfirmDialog
        open={Boolean(toConfirm)}
        title={toConfirm?.status === 'active' ? 'Block Customer' : 'Unblock Customer'}
        description={`Are you sure you want to ${toConfirm?.status === 'active' ? 'block' : 'unblock'} ${toConfirm?.name}?`}
        confirmLabel={toConfirm?.status === 'active' ? 'Block' : 'Unblock'}
        confirmColor={toConfirm?.status === 'active' ? 'error' : 'success'}
        loading={statusMutation.isPending}
        onClose={() => setToConfirm(null)}
        onConfirm={() =>
          toConfirm &&
          statusMutation.mutate({ id: toConfirm.id, status: toConfirm.status === 'active' ? 'blocked' : 'active' })
        }
      />
    </Box>
  );
};

export default Customers;
