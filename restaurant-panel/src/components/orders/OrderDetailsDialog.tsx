import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/utils/constants';
import { formatCurrency, formatDateTime, formatStatusLabel } from '@/utils/formatters';
import type { Order } from '@/types';

interface OrderDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
}

export function OrderDetailsDialog({ open, onClose, order }: OrderDetailsDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Order #{order.orderNumber}
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Chip
            label={ORDER_STATUS_LABELS[order.status] ?? formatStatusLabel(order.status)}
            color={ORDER_STATUS_COLORS[order.status]}
          />
          <Typography variant="caption" color="text.secondary">
            {formatDateTime(order.createdAt)}
          </Typography>
        </Stack>

        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Customer
        </Typography>
        <Typography variant="body2">{order.customer.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {order.customer.phone}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {order.deliveryAddress}
        </Typography>

        {order.specialInstructions && (
          <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="caption" fontWeight={700}>
              Special instructions
            </Typography>
            <Typography variant="body2">{order.specialInstructions}</Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Items
        </Typography>
        <Stack spacing={1}>
          {order.items.map((item, index) => (
            <Stack key={index} direction="row" justifyContent="space-between">
              <Box>
                <Typography variant="body2">
                  {item.quantity} × {item.name}
                  {item.variant ? ` (${item.variant})` : ''}
                </Typography>
                {item.addOns && item.addOns.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    + {item.addOns.map((a) => a.name).join(', ')}
                  </Typography>
                )}
              </Box>
              <Typography variant="body2">{formatCurrency(item.price * item.quantity)}</Typography>
            </Stack>
          ))}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={0.75}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Subtotal
            </Typography>
            <Typography variant="body2">{formatCurrency(order.subtotal)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Tax
            </Typography>
            <Typography variant="body2">{formatCurrency(order.tax)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Delivery fee
            </Typography>
            <Typography variant="body2">{formatCurrency(order.deliveryFee)}</Typography>
          </Stack>
          {order.discount > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="success.main">
                Discount
              </Typography>
              <Typography variant="body2" color="success.main">
                -{formatCurrency(order.discount)}
              </Typography>
            </Stack>
          )}
          <Divider sx={{ my: 0.5 }} />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight={800}>
              Total
            </Typography>
            <Typography variant="subtitle1" fontWeight={800}>
              {formatCurrency(order.total)}
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Payment: {order.paymentMethod.toUpperCase()}
          </Typography>
          <Chip
            size="small"
            label={formatStatusLabel(order.paymentStatus)}
            color={order.paymentStatus === 'paid' ? 'success' : 'default'}
            variant="outlined"
          />
        </Stack>

        {order.deliveryPartner && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Delivery partner
            </Typography>
            <Typography variant="body2">{order.deliveryPartner.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {order.deliveryPartner.phone}
            </Typography>
          </>
        )}

        {order.rejectionReason && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" fontWeight={700} color="error.main" gutterBottom>
              Rejection reason
            </Typography>
            <Typography variant="body2">{order.rejectionReason}</Typography>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
