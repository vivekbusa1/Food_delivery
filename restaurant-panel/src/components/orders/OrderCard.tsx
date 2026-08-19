import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/utils/constants';
import { formatCurrency, formatRelativeTime, formatStatusLabel } from '@/utils/formatters';
import { useUpdateOrderStatus } from '@/hooks/useOrders';
import type { Order, OrderStatus } from '@/types';

interface OrderCardProps {
  order: Order;
  onReject: (order: Order) => void;
  onAssignDelivery: (order: Order) => void;
  onViewDetails: (order: Order) => void;
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  accepted: 'preparing',
  preparing: 'ready',
  ready: 'out_for_delivery',
  out_for_delivery: 'delivered',
};

const NEXT_ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  accepted: 'Start preparing',
  preparing: 'Mark ready',
  ready: 'Out for delivery',
  out_for_delivery: 'Mark delivered',
};

export function OrderCard({ order, onReject, onAssignDelivery, onViewDetails }: OrderCardProps) {
  const updateStatus = useUpdateOrderStatus();

  const nextStatus = NEXT_STATUS[order.status];
  const nextLabel = NEXT_ACTION_LABEL[order.status];

  function handleAccept() {
    updateStatus.mutate({ id: order.id, payload: { status: 'accepted' } });
  }

  function handleAdvance() {
    if (nextStatus) {
      updateStatus.mutate({ id: order.id, payload: { status: nextStatus } });
    }
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
          <Box sx={{ cursor: 'pointer' }} onClick={() => onViewDetails(order)}>
            <Typography variant="subtitle1" fontWeight={800}>
              #{order.orderNumber}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {order.customer.name} · {order.customer.phone}
            </Typography>
          </Box>
          <Chip
            size="small"
            label={ORDER_STATUS_LABELS[order.status] ?? formatStatusLabel(order.status)}
            color={ORDER_STATUS_COLORS[order.status]}
          />
        </Stack>

        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          Placed {formatRelativeTime(order.createdAt)}
        </Typography>

        <Divider sx={{ my: 1 }} />

        <Stack spacing={0.5}>
          {order.items.slice(0, 3).map((item, index) => (
            <Stack key={index} direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                {item.quantity} × {item.name}
                {item.variant ? ` (${item.variant})` : ''}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatCurrency(item.price * item.quantity)}
              </Typography>
            </Stack>
          ))}
          {order.items.length > 3 && (
            <Typography variant="caption" color="text.secondary">
              + {order.items.length - 3} more item(s)
            </Typography>
          )}
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" color="text.secondary">
            Total
          </Typography>
          <Typography variant="subtitle1" fontWeight={800}>
            {formatCurrency(order.total)}
          </Typography>
        </Stack>

        {order.deliveryPartner && (
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1 }}>
            <LocalShippingRoundedIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {order.deliveryPartner.name} · {order.deliveryPartner.phone}
            </Typography>
          </Stack>
        )}

        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }} useFlexGap>
          {order.status === 'pending' && (
            <>
              <Button
                size="small"
                variant="contained"
                color="primary"
                disabled={updateStatus.isPending}
                onClick={handleAccept}
              >
                Accept
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                disabled={updateStatus.isPending}
                onClick={() => onReject(order)}
              >
                Reject
              </Button>
            </>
          )}

          {nextStatus && (
            <Button
              size="small"
              variant="contained"
              disabled={updateStatus.isPending}
              onClick={handleAdvance}
            >
              {nextLabel}
            </Button>
          )}

          {(order.status === 'ready' || order.status === 'out_for_delivery') && (
            <Button size="small" variant="outlined" onClick={() => onAssignDelivery(order)}>
              {order.deliveryPartner ? 'Reassign delivery' : 'Assign delivery'}
            </Button>
          )}

          {order.status === 'delivered' && (
            <Button
              size="small"
              variant="contained"
              color="success"
              disabled={updateStatus.isPending}
              onClick={() => updateStatus.mutate({ id: order.id, payload: { status: 'completed' } })}
            >
              Mark completed
            </Button>
          )}

          <Button size="small" variant="text" onClick={() => onViewDetails(order)}>
            View details
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
