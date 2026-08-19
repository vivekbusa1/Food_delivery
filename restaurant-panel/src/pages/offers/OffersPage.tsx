import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { OfferFormDialog } from '@/components/offers/OfferFormDialog';
import { useDeleteOffer, useOffers, useToggleOffer } from '@/hooks/useOffers';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Offer } from '@/types';

function offerValueLabel(offer: Offer): string {
  if (offer.type === 'percentage') return `${offer.value}% off`;
  if (offer.type === 'flat') return `${formatCurrency(offer.value)} off`;
  return 'Free delivery';
}

export default function OffersPage() {
  const { data: offers, isLoading } = useOffers();
  const toggleOffer = useToggleOffer();
  const deleteOffer = useDeleteOffer();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; offer: Offer } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Offer | null>(null);

  function openCreate() {
    setSelectedOffer(null);
    setFormOpen(true);
  }

  function openEdit(offer: Offer) {
    setSelectedOffer(offer);
    setFormOpen(true);
    setMenuAnchor(null);
  }

  return (
    <Box>
      <PageHeader
        title="Offers"
        description="Create promo codes and discounts to attract more customers."
        actions={
          <Chip
            icon={<AddRoundedIcon />}
            label="Create offer"
            color="primary"
            onClick={openCreate}
            sx={{ px: 1, cursor: 'pointer' }}
          />
        }
      />

      {isLoading && (
        <Grid container spacing={2}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rounded" height={170} />
            </Grid>
          ))}
        </Grid>
      )}

      {!isLoading && (offers?.length ?? 0) === 0 && (
        <EmptyState
          title="No offers yet"
          description="Create your first promo code to start attracting more orders."
          icon={<LocalOfferRoundedIcon fontSize="inherit" />}
          actionLabel="Create offer"
          onAction={openCreate}
        />
      )}

      <Grid container spacing={2}>
        {offers?.map((offer) => {
          const isExpired = new Date(offer.endDate) < new Date();
          return (
            <Grid item xs={12} sm={6} md={4} key={offer.id}>
              <Card sx={{ position: 'relative', overflow: 'visible' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {offer.title}
                      </Typography>
                      <Chip
                        size="small"
                        label={offer.code}
                        variant="outlined"
                        color="primary"
                        sx={{ fontWeight: 700, mt: 0.5 }}
                      />
                    </Box>
                    <IconButton size="small" onClick={(e) => setMenuAnchor({ el: e.currentTarget, offer })}>
                      <MoreVertRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>

                  <Typography variant="h6" color="primary.main" fontWeight={800} sx={{ mt: 1.5 }}>
                    {offerValueLabel(offer)}
                  </Typography>

                  {offer.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {offer.description}
                    </Typography>
                  )}

                  <Stack spacing={0.5} sx={{ mt: 1.5 }}>
                    {Boolean(offer.minOrderValue) && (
                      <Typography variant="caption" color="text.secondary">
                        Min. order: {formatCurrency(offer.minOrderValue)}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Valid {formatDate(offer.startDate)} – {formatDate(offer.endDate)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Used {offer.usedCount}
                      {offer.usageLimit ? ` / ${offer.usageLimit}` : ''} times
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
                    <Chip
                      size="small"
                      label={isExpired ? 'Expired' : offer.isActive ? 'Active' : 'Paused'}
                      color={isExpired ? 'default' : offer.isActive ? 'success' : 'warning'}
                    />
                    <Switch
                      size="small"
                      checked={offer.isActive}
                      disabled={isExpired}
                      onChange={(_, checked) => toggleOffer.mutate({ id: offer.id, isActive: checked })}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Menu anchorEl={menuAnchor?.el} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => menuAnchor && openEdit(menuAnchor.offer)}>Edit</MenuItem>
        <MenuItem
          sx={{ color: 'error.main' }}
          onClick={() => {
            if (menuAnchor) setDeleteTarget(menuAnchor.offer);
            setMenuAnchor(null);
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      <OfferFormDialog open={formOpen} onClose={() => setFormOpen(false)} offer={selectedOffer} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete offer"
        description={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        isDestructive
        isLoading={deleteOffer.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteOffer.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </Box>
  );
}
