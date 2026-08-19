import { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAssignDelivery, useAvailableDeliveryPartners } from '@/hooks/useOrders';
import type { Order } from '@/types';

interface AssignDeliveryDialogProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
}

export function AssignDeliveryDialog({ open, onClose, order }: AssignDeliveryDialogProps) {
  const { data: partners, isLoading } = useAvailableDeliveryPartners();
  const assignDelivery = useAssignDelivery();

  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [mode, setMode] = useState<'select' | 'manual'>('select');

  async function handleAssign() {
    if (!order) return;
    if (mode === 'select' && selectedPartnerId) {
      await assignDelivery.mutateAsync({ id: order.id, payload: { deliveryPartnerId: selectedPartnerId } });
    } else if (mode === 'manual' && manualName && manualPhone) {
      await assignDelivery.mutateAsync({
        id: order.id,
        payload: { name: manualName, phone: manualPhone },
      });
    } else {
      return;
    }
    setSelectedPartnerId('');
    setManualName('');
    setManualPhone('');
    onClose();
  }

  const canSubmit =
    (mode === 'select' && Boolean(selectedPartnerId)) ||
    (mode === 'manual' && Boolean(manualName) && Boolean(manualPhone));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Assign delivery partner</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Order #{order?.orderNumber}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button
            size="small"
            variant={mode === 'select' ? 'contained' : 'outlined'}
            onClick={() => setMode('select')}
          >
            Choose partner
          </Button>
          <Button
            size="small"
            variant={mode === 'manual' ? 'contained' : 'outlined'}
            onClick={() => setMode('manual')}
          >
            Enter manually
          </Button>
        </Stack>

        {mode === 'select' ? (
          isLoading ? (
            <Typography variant="body2" color="text.secondary">
              Loading available delivery partners…
            </Typography>
          ) : (partners?.length ?? 0) === 0 ? (
            <Alert severity="info">No delivery partners available right now.</Alert>
          ) : (
            <TextField
              select
              label="Delivery partner"
              fullWidth
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
            >
              {partners?.map((partner) => (
                <MenuItem key={partner.id} value={partner.id}>
                  {partner.name} · {partner.phone}
                </MenuItem>
              ))}
            </TextField>
          )
        ) : (
          <Stack spacing={2}>
            <TextField
              label="Delivery partner name"
              fullWidth
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
            />
            <TextField
              label="Phone number"
              fullWidth
              value={manualPhone}
              onChange={(e) => setManualPhone(e.target.value)}
            />
          </Stack>
        )}

        {order?.deliveryPartner && (
          <>
            <Divider sx={{ my: 2 }} />
            <Alert severity="info">
              Currently assigned: {order.deliveryPartner.name} ({order.deliveryPartner.phone})
            </Alert>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!canSubmit || assignDelivery.isPending}
          onClick={handleAssign}
        >
          {assignDelivery.isPending ? 'Assigning…' : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
