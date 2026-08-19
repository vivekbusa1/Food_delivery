import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import dayjs from 'dayjs';
import { offerSchema, type OfferFormValues } from '@/schemas/offerSchemas';
import { useCreateOffer, useUpdateOffer } from '@/hooks/useOffers';
import type { Offer } from '@/types';

interface OfferFormDialogProps {
  open: boolean;
  onClose: () => void;
  offer?: Offer | null;
}

const defaultValues: OfferFormValues = {
  title: '',
  description: '',
  code: '',
  type: 'percentage',
  value: 10,
  minOrderValue: 0,
  maxDiscount: undefined,
  startDate: dayjs().format('YYYY-MM-DD'),
  endDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
  usageLimit: undefined,
  isActive: true,
};

export function OfferFormDialog({ open, onClose, offer }: OfferFormDialogProps) {
  const isEditing = Boolean(offer);
  const createOffer = useCreateOffer();
  const updateOffer = useUpdateOffer();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(offer ? mapOfferToForm(offer) : defaultValues);
    }
  }, [open, offer, reset]);

  async function onSubmit(values: OfferFormValues) {
    if (isEditing && offer) {
      await updateOffer.mutateAsync({ id: offer.id, payload: values });
    } else {
      await createOffer.mutateAsync(values);
    }
    onClose();
  }

  const isSaving = createOffer.isPending || updateOffer.isPending;
  const offerType = watch('type');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Edit offer' : 'Create offer'}</DialogTitle>
      <Stack component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={7}>
              <TextField
                label="Offer title"
                fullWidth
                error={Boolean(errors.title)}
                helperText={errors.title?.message}
                {...register('title')}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                label="Promo code"
                fullWidth
                placeholder="SAVE20"
                error={Boolean(errors.code)}
                helperText={errors.code?.message}
                {...register('code', {
                  setValueAs: (value: string) => value.toUpperCase(),
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description (optional)"
                fullWidth
                multiline
                minRows={2}
                error={Boolean(errors.description)}
                helperText={errors.description?.message}
                {...register('description')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Discount type" select fullWidth {...register('type')}>
                <MenuItem value="percentage">Percentage off</MenuItem>
                <MenuItem value="flat">Flat amount off</MenuItem>
                <MenuItem value="free_delivery">Free delivery</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label={offerType === 'percentage' ? 'Discount (%)' : 'Discount (₹)'}
                type="number"
                fullWidth
                disabled={offerType === 'free_delivery'}
                error={Boolean(errors.value)}
                helperText={errors.value?.message}
                {...register('value')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Max discount (₹, optional)"
                type="number"
                fullWidth
                error={Boolean(errors.maxDiscount)}
                helperText={errors.maxDiscount?.message}
                {...register('maxDiscount')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Minimum order value (₹)"
                type="number"
                fullWidth
                error={Boolean(errors.minOrderValue)}
                helperText={errors.minOrderValue?.message}
                {...register('minOrderValue')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Usage limit (optional)"
                type="number"
                fullWidth
                error={Boolean(errors.usageLimit)}
                helperText={errors.usageLimit?.message}
                {...register('usageLimit')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={Boolean(errors.startDate)}
                helperText={errors.startDate?.message}
                {...register('startDate')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="End date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={Boolean(errors.endDate)}
                helperText={errors.endDate?.message}
                {...register('endDate')}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={watch('isActive')}
                    onChange={(_, checked) => setValue('isActive', checked, { shouldDirty: true })}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSaving}>
            {isSaving ? 'Saving…' : isEditing ? 'Save changes' : 'Create offer'}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
}

function mapOfferToForm(offer: Offer): OfferFormValues {
  return {
    title: offer.title,
    description: offer.description ?? '',
    code: offer.code,
    type: offer.type,
    value: offer.value,
    minOrderValue: offer.minOrderValue ?? 0,
    maxDiscount: offer.maxDiscount,
    startDate: dayjs(offer.startDate).format('YYYY-MM-DD'),
    endDate: dayjs(offer.endDate).format('YYYY-MM-DD'),
    usageLimit: offer.usageLimit,
    isActive: offer.isActive,
  };
}
