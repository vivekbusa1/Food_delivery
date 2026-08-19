import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Divider, Grid, Stack, TextField, Typography } from '@mui/material';
import {
  businessDetailsSchema,
  type BusinessDetailsFormValues,
} from '@/schemas/profileSchemas';
import { useUpdateBusinessDetails } from '@/hooks/useRestaurantProfile';
import type { RestaurantProfile } from '@/types';

interface BusinessDetailsFormProps {
  profile: RestaurantProfile;
}

export function BusinessDetailsForm({ profile }: BusinessDetailsFormProps) {
  const updateBusinessDetails = useUpdateBusinessDetails();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<BusinessDetailsFormValues>({
    resolver: zodResolver(businessDetailsSchema),
    defaultValues: mapToForm(profile),
  });

  useEffect(() => {
    reset(mapToForm(profile));
  }, [profile, reset]);

  function onSubmit(values: BusinessDetailsFormValues) {
    updateBusinessDetails.mutate({
      gstNumber: values.gstNumber || undefined,
      fssaiLicense: values.fssaiLicense || undefined,
      panNumber: values.panNumber || undefined,
      bankDetails: values.bankDetails,
    });
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
        Legal & tax information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            label="GST number"
            fullWidth
            placeholder="22AAAAA0000A1Z5"
            error={Boolean(errors.gstNumber)}
            helperText={errors.gstNumber?.message}
            {...register('gstNumber')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="FSSAI license number"
            fullWidth
            placeholder="14-digit license number"
            error={Boolean(errors.fssaiLicense)}
            helperText={errors.fssaiLicense?.message}
            {...register('fssaiLicense')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="PAN number"
            fullWidth
            placeholder="ABCDE1234F"
            error={Boolean(errors.panNumber)}
            helperText={errors.panNumber?.message}
            {...register('panNumber')}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }}>
        <Typography variant="caption" color="text.secondary">
          BANK DETAILS FOR PAYOUTS
        </Typography>
      </Divider>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Account holder name"
            fullWidth
            error={Boolean(errors.bankDetails?.accountHolderName)}
            helperText={errors.bankDetails?.accountHolderName?.message}
            {...register('bankDetails.accountHolderName')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Bank name"
            fullWidth
            error={Boolean(errors.bankDetails?.bankName)}
            helperText={errors.bankDetails?.bankName?.message}
            {...register('bankDetails.bankName')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Account number"
            fullWidth
            error={Boolean(errors.bankDetails?.accountNumber)}
            helperText={errors.bankDetails?.accountNumber?.message}
            {...register('bankDetails.accountNumber')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="IFSC code"
            fullWidth
            placeholder="HDFC0000123"
            error={Boolean(errors.bankDetails?.ifscCode)}
            helperText={errors.bankDetails?.ifscCode?.message}
            {...register('bankDetails.ifscCode')}
          />
        </Grid>
      </Grid>

      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button type="submit" variant="contained" disabled={!isDirty || updateBusinessDetails.isPending}>
          {updateBusinessDetails.isPending ? 'Saving…' : 'Save business details'}
        </Button>
      </Stack>
    </Box>
  );
}

function mapToForm(profile: RestaurantProfile): BusinessDetailsFormValues {
  return {
    gstNumber: profile.gstNumber ?? '',
    fssaiLicense: profile.fssaiLicense ?? '',
    panNumber: profile.panNumber ?? '',
    bankDetails: {
      accountHolderName: profile.bankDetails?.accountHolderName ?? '',
      accountNumber: profile.bankDetails?.accountNumber ?? '',
      ifscCode: profile.bankDetails?.ifscCode ?? '',
      bankName: profile.bankDetails?.bankName ?? '',
    },
  };
}
