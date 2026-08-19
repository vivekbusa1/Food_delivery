import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import StatusChip from '@/components/StatusChip';
import { ordersService } from '@/services/orders.service';
import { extractErrorMessage } from '@/services/api';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { ORDER_STATUS_OPTIONS } from '@/utils/constants';
import type { OrderStatus } from '@/types';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [statusDraft, setStatusDraft] = useState<OrderStatus | ''>('');
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersService.get(id as string),
    enabled: Boolean(id),
  });

  const statusMutation = useMutation({
    mutationFn: (status: OrderStatus) => ordersService.updateStatus(id as string, status),
    onSuccess: () => {
      enqueueSnackbar('Order status updated', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const refundMutation = useMutation({
    mutationFn: () => ordersService.refund(id as string, { amount: Number(refundAmount), reason: refundReason }),
    onSuccess: () => {
      enqueueSnackbar('Refund processed', { variant: 'success' });
      setRefundOpen(false);
      setRefundAmount('');
      setRefundReason('');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  if (isLoading) return <Loading minHeight={400} />;
  if (!order) return <Typography>Order not found</Typography>;

  return (
    <Box>
      <PageHeader
        title={`Order #${order.orderNumber}`}
        subtitle={`Placed on ${formatDateTime(order.createdAt)}`}
        actions={
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/orders')}>
            Back to Orders
          </Button>
        }
      />

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                Order Items
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1} maxWidth={280} ml="auto">
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body2">{formatCurrency(order.subtotal)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Tax</Typography>
                  <Typography variant="body2">{formatCurrency(order.tax)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Delivery Fee</Typography>
                  <Typography variant="body2">{formatCurrency(order.deliveryFee)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Discount</Typography>
                  <Typography variant="body2" color="success.main">-{formatCurrency(order.discount)}</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
                  <Typography variant="subtitle1" fontWeight={700}>{formatCurrency(order.total)}</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Stack spacing={2.5}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>
                  Status
                </Typography>
                <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
                  <StatusChip status={order.status} />
                  <StatusChip status={order.paymentStatus} />
                </Stack>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Update Status"
                  value={statusDraft || order.status}
                  onChange={(e) => setStatusDraft(e.target.value as OrderStatus)}
                  sx={{ mb: 1.5 }}
                >
                  {ORDER_STATUS_OPTIONS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </TextField>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={statusMutation.isPending || !statusDraft || statusDraft === order.status}
                    onClick={() => statusMutation.mutate(statusDraft as OrderStatus)}
                  >
                    Update
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    disabled={order.paymentStatus === 'refunded'}
                    onClick={() => {
                      setRefundAmount(String(order.total));
                      setRefundOpen(true);
                    }}
                  >
                    Refund
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
                  Customer
                </Typography>
                <Typography variant="body2">{order.customer.name}</Typography>
                <Typography variant="body2" color="text.secondary">{order.customer.phone}</Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="subtitle2" fontWeight={700} mb={0.5}>Delivery Address</Typography>
                <Typography variant="body2" color="text.secondary">{order.deliveryAddress}</Typography>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
                  Restaurant
                </Typography>
                <Typography variant="body2">{order.restaurant.name}</Typography>
              </CardContent>
            </Card>

            {order.deliveryPartner && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
                    Delivery Partner
                  </Typography>
                  <Typography variant="body2">{order.deliveryPartner.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{order.deliveryPartner.phone}</Typography>
                </CardContent>
              </Card>
            )}

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
                  Payment
                </Typography>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2" color="text.secondary">Method</Typography>
                  <Chip label={order.paymentMethod} size="small" />
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Dialog open={refundOpen} onClose={() => setRefundOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Process Refund</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Refund Amount"
              type="number"
              fullWidth
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
            />
            <TextField
              label="Reason"
              fullWidth
              multiline
              minRows={2}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRefundOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={refundMutation.isPending || !refundAmount || !refundReason}
            onClick={() => refundMutation.mutate()}
          >
            Confirm Refund
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderDetail;
