import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { Box, Button, MenuItem, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import PageHeader from '@/components/PageHeader';
import DataTable, { DataTableColumn } from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { paymentsService } from '@/services/payments.service';
import { extractErrorMessage } from '@/services/api';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import type { Payment, RefundRequest } from '@/types';

const Payments: React.FC = () => {
  const [tab, setTab] = useState<'payments' | 'refunds'>('payments');
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { page, setPage, limit, setLimit, filters, setFilter, params } = useTableQueryState();
  const [action, setAction] = useState<{ refund: RefundRequest; status: RefundRequest['status'] } | null>(null);

  const paymentsQuery = useQuery({
    queryKey: ['payments', params],
    queryFn: () => paymentsService.list(params),
    enabled: tab === 'payments',
  });

  const refundsQuery = useQuery({
    queryKey: ['refunds', params],
    queryFn: () => paymentsService.listRefunds(params),
    enabled: tab === 'refunds',
  });

  const refundStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RefundRequest['status'] }) => paymentsService.updateRefundStatus(id, status),
    onSuccess: (_data, variables) => {
      enqueueSnackbar(`Refund ${variables.status}`, { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      setAction(null);
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const paymentColumns: DataTableColumn<Payment>[] = [
    { key: 'orderNumber', label: 'Order #', render: (row) => `#${row.orderNumber}` },
    { key: 'customer', label: 'Customer', render: (row) => row.customer?.name },
    { key: 'amount', label: 'Amount', align: 'right', render: (row) => formatCurrency(row.amount) },
    { key: 'method', label: 'Method', render: (row) => row.method },
    { key: 'status', label: 'Status', render: (row) => <StatusChip status={row.status} /> },
    { key: 'gatewayRef', label: 'Gateway Ref', render: (row) => row.gatewayRef || '-' },
    { key: 'createdAt', label: 'Date', render: (row) => formatDateTime(row.createdAt) },
  ];

  const refundColumns: DataTableColumn<RefundRequest>[] = [
    { key: 'orderNumber', label: 'Order #', render: (row) => `#${row.orderNumber}` },
    { key: 'customer', label: 'Customer', render: (row) => row.customer?.name },
    { key: 'amount', label: 'Amount', align: 'right', render: (row) => formatCurrency(row.amount) },
    { key: 'reason', label: 'Reason', render: (row) => row.reason },
    { key: 'status', label: 'Status', render: (row) => <StatusChip status={row.status} /> },
    { key: 'createdAt', label: 'Requested', render: (row) => formatDateTime(row.createdAt) },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) =>
        row.status === 'pending' ? (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button size="small" variant="contained" color="success" onClick={() => setAction({ refund: row, status: 'approved' })}>
              Approve
            </Button>
            <Button size="small" variant="outlined" color="error" onClick={() => setAction({ refund: row, status: 'rejected' })}>
              Reject
            </Button>
          </Stack>
        ) : (
          '-'
        ),
    },
  ];

  const isLoading = tab === 'payments' ? paymentsQuery.isLoading : refundsQuery.isLoading;
  const isError = tab === 'payments' ? paymentsQuery.isError : refundsQuery.isError;

  return (
    <Box>
      <PageHeader title="Payment Management" subtitle="Track transactions and process refunds" />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab value="payments" label="Payments" />
        <Tab value="refunds" label="Refund Requests" />
      </Tabs>

      {tab === 'payments' ? (
        <DataTable
          columns={paymentColumns}
          rows={paymentsQuery.data?.items ?? []}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          isError={isError}
          page={page}
          limit={limit}
          total={paymentsQuery.data?.total ?? 0}
          onPageChange={setPage}
          onLimitChange={setLimit}
          toolbar={
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
              <MenuItem value="success">Success</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
            </TextField>
          }
        />
      ) : (
        <DataTable
          columns={refundColumns}
          rows={refundsQuery.data?.items ?? []}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          isError={isError}
          page={page}
          limit={limit}
          total={refundsQuery.data?.total ?? 0}
          onPageChange={setPage}
          onLimitChange={setLimit}
          toolbar={
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
              <MenuItem value="processed">Processed</MenuItem>
            </TextField>
          }
        />
      )}

      <ConfirmDialog
        open={Boolean(action)}
        title={action?.status === 'approved' ? 'Approve Refund' : 'Reject Refund'}
        description={
          <Typography variant="body2">
            {action?.status === 'approved' ? 'Approve' : 'Reject'} refund of {formatCurrency(action?.refund.amount)} for order #
            {action?.refund.orderNumber}?
          </Typography>
        }
        confirmLabel={action?.status === 'approved' ? 'Approve' : 'Reject'}
        confirmColor={action?.status === 'approved' ? 'success' : 'error'}
        loading={refundStatusMutation.isPending}
        onClose={() => setAction(null)}
        onConfirm={() => action && refundStatusMutation.mutate({ id: action.refund.id, status: action.status })}
      />
    </Box>
  );
};

export default Payments;
