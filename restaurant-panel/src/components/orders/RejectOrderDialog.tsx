import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useUpdateOrderStatus } from '@/hooks/useOrders';
import type { Order } from '@/types';

interface RejectOrderDialogProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
}

const REASON_SUGGESTIONS = [
  'Item(s) out of stock',
  'Kitchen is too busy right now',
  'Restaurant closing soon',
  'Unable to deliver to this address',
];

export function RejectOrderDialog({ open, onClose, order }: RejectOrderDialogProps) {
  const updateStatus = useUpdateOrderStatus();
  const [reason, setReason] = useState('');

  async function handleReject() {
    if (!order) return;
    await updateStatus.mutateAsync({
      id: order.id,
      payload: { status: 'rejected', rejectionReason: reason || undefined },
    });
    setReason('');
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Reject order #{order?.orderNumber}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Let the customer know why this order can't be accepted.
        </DialogContentText>
        <TextField
          label="Reason (optional)"
          fullWidth
          multiline
          minRows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          sx={{ mb: 1.5 }}
        />
        <DialogContentText variant="caption">Quick reasons:</DialogContentText>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
          {REASON_SUGGESTIONS.map((suggestion) => (
            <Button
              key={suggestion}
              size="small"
              variant="outlined"
              onClick={() => setReason(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" color="error" disabled={updateStatus.isPending} onClick={handleReject}>
          {updateStatus.isPending ? 'Rejecting…' : 'Reject order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
