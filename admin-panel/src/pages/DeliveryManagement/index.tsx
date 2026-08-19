import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PageHeader from '@/components/PageHeader';
import DataTable, { DataTableColumn } from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { deliveryManagementService, deliveryPartnersService } from '@/services/delivery.service';
import { extractErrorMessage } from '@/services/api';
import { formatDateTime } from '@/utils/formatters';
import type { DeliveryAssignment } from '@/types';

const DeliveryManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { page, setPage, limit, setLimit, filters, setFilter, params } = useTableQueryState();

  const [assignTarget, setAssignTarget] = useState<DeliveryAssignment | null>(null);
  const [selectedPartner, setSelectedPartner] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['delivery-assignments', params],
    queryFn: () => deliveryManagementService.listAssignments(params),
    refetchInterval: 20000,
  });

  const { data: availablePartners } = useQuery({
    queryKey: ['delivery-partners-online'],
    queryFn: () => deliveryPartnersService.list({ limit: 100, status: 'active' }),
    enabled: Boolean(assignTarget),
  });

  const assignMutation = useMutation({
    mutationFn: () =>
      assignTarget?.partner
        ? deliveryManagementService.reassign(assignTarget.id, selectedPartner)
        : deliveryManagementService.assign(assignTarget!.id, selectedPartner),
    onSuccess: () => {
      enqueueSnackbar('Delivery partner assigned', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['delivery-assignments'] });
      setAssignTarget(null);
      setSelectedPartner('');
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => deliveryManagementService.cancel(id, 'Cancelled by admin'),
    onSuccess: () => {
      enqueueSnackbar('Assignment cancelled', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['delivery-assignments'] });
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const columns: DataTableColumn<DeliveryAssignment>[] = [
    { key: 'orderNumber', label: 'Order #', render: (row) => `#${row.orderNumber}` },
    { key: 'pickupAddress', label: 'Pickup', render: (row) => row.pickupAddress },
    { key: 'dropAddress', label: 'Drop', render: (row) => row.dropAddress },
    { key: 'partner', label: 'Partner', render: (row) => row.partner?.name ?? '-' },
    { key: 'distance', label: 'Distance', render: (row) => (row.distance ? `${row.distance.toFixed(1)} km` : '-') },
    { key: 'eta', label: 'ETA', render: (row) => row.eta ?? '-' },
    { key: 'status', label: 'Status', render: (row) => <StatusChip status={row.status} /> },
    { key: 'createdAt', label: 'Created', render: (row) => formatDateTime(row.createdAt) },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          {row.status !== 'delivered' && row.status !== 'failed' && (
            <>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setAssignTarget(row);
                  setSelectedPartner(row.partner?.id ?? '');
                }}
              >
                {row.partner ? 'Reassign' : 'Assign'}
              </Button>
              <Button size="small" color="error" onClick={() => cancelMutation.mutate(row.id)}>
                Cancel
              </Button>
            </>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader title="Delivery Management" subtitle="Track and assign live delivery orders" />

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
        toolbar={
          <TextField
            select
            size="small"
            label="Status"
            value={(filters.status as string) ?? ''}
            onChange={(e) => setFilter('status', e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="unassigned">Unassigned</MenuItem>
            <MenuItem value="assigned">Assigned</MenuItem>
            <MenuItem value="picked_up">Picked Up</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </TextField>
        }
      />

      <Dialog open={Boolean(assignTarget)} onClose={() => setAssignTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Assign Delivery Partner</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Order #{assignTarget?.orderNumber}
          </Typography>
          <TextField
            select
            fullWidth
            label="Delivery Partner"
            value={selectedPartner}
            onChange={(e) => setSelectedPartner(e.target.value)}
          >
            {(availablePartners?.items ?? []).map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name} {p.isOnline ? '(Online)' : '(Offline)'}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAssignTarget(null)}>Cancel</Button>
          <Button variant="contained" disabled={!selectedPartner || assignMutation.isPending} onClick={() => assignMutation.mutate()}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeliveryManagement;
