import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { Avatar, Box, Button, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PageHeader from '@/components/PageHeader';
import DataTable, { DataTableColumn } from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { restaurantsService } from '@/services/restaurants.service';
import { extractErrorMessage } from '@/services/api';
import { formatDate, getInitials } from '@/utils/formatters';
import type { Restaurant } from '@/types';

const Restaurants: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { page, setPage, limit, setLimit, search, setSearch, filters, setFilter, params } = useTableQueryState();
  const [action, setAction] = useState<{ restaurant: Restaurant; status: 'approved' | 'rejected' } | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['restaurants', params],
    queryFn: () => restaurantsService.list(params),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Restaurant['status'] }) => restaurantsService.setStatus(id, status),
    onSuccess: (_data, variables) => {
      enqueueSnackbar(`Restaurant ${variables.status}`, { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      setAction(null);
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const columns: DataTableColumn<Restaurant>[] = [
    {
      key: 'name',
      label: 'Restaurant',
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar src={row.logo} variant="rounded" sx={{ width: 36, height: 36 }}>
            {getInitials(row.name)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>{row.name}</Typography>
            <Typography variant="caption" color="text.secondary">{row.city}</Typography>
          </Box>
        </Stack>
      ),
    },
    { key: 'phone', label: 'Contact', render: (row) => row.phone },
    { key: 'cuisines', label: 'Cuisines', render: (row) => row.cuisines?.slice(0, 2).join(', ') || '-' },
    { key: 'rating', label: 'Rating', render: (row) => (row.rating ? row.rating.toFixed(1) : '-') },
    { key: 'status', label: 'Status', render: (row) => <StatusChip status={row.status} /> },
    { key: 'createdAt', label: 'Joined', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) =>
        row.status === 'pending' ? (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<CheckIcon />}
              onClick={(e) => {
                e.stopPropagation();
                setAction({ restaurant: row, status: 'approved' });
              }}
            >
              Approve
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<CloseIcon />}
              onClick={(e) => {
                e.stopPropagation();
                setAction({ restaurant: row, status: 'rejected' });
              }}
            >
              Reject
            </Button>
          </Stack>
        ) : (
          '-'
        ),
    },
  ];

  return (
    <Box>
      <PageHeader title="Restaurants" subtitle="Approve, monitor and manage partner restaurants" />

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
        onRowClick={(row) => navigate(`/restaurants/${row.id}`)}
        toolbar={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              placeholder="Search by name, city or owner"
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
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </TextField>
          </Stack>
        }
      />

      <ConfirmDialog
        open={Boolean(action)}
        title={action?.status === 'approved' ? 'Approve Restaurant' : 'Reject Restaurant'}
        description={`Are you sure you want to ${action?.status === 'approved' ? 'approve' : 'reject'} "${action?.restaurant.name}"?`}
        confirmLabel={action?.status === 'approved' ? 'Approve' : 'Reject'}
        confirmColor={action?.status === 'approved' ? 'success' : 'error'}
        loading={statusMutation.isPending}
        onClose={() => setAction(null)}
        onConfirm={() => action && statusMutation.mutate({ id: action.restaurant.id, status: action.status })}
      />
    </Box>
  );
};

export default Restaurants;
