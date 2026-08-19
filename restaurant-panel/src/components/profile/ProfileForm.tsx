import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { profileSchema, type ProfileFormValues } from '@/schemas/profileSchemas';
import { ImageUploader } from '@/components/common/ImageUploader';
import { CUISINE_TYPES } from '@/utils/constants';
import { ASSET_BASE_URL } from '@/utils/constants';
import { resolveAssetUrl } from '@/utils/formatters';
import {
  useUpdateProfile,
  useUploadCoverImage,
  useUploadLogo,
} from '@/hooks/useRestaurantProfile';
import type { RestaurantProfile } from '@/types';

interface ProfileFormProps {
  profile: RestaurantProfile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const updateProfile = useUpdateProfile();
  const uploadLogo = useUploadLogo();
  const uploadCover = useUploadCoverImage();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: mapProfileToForm(profile),
  });

  useEffect(() => {
    reset(mapProfileToForm(profile));
  }, [profile, reset]);

  function onSubmit(values: ProfileFormValues) {
    updateProfile.mutate(values);
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} sx={{ mb: 3 }}>
        <ImageUploader
          shape="circle"
          size={110}
          label="Restaurant logo"
          imageUrl={resolveAssetUrl(profile.logoUrl, ASSET_BASE_URL)}
          isUploading={uploadLogo.isPending}
          onUpload={(file) => uploadLogo.mutate(file)}
        />
        <ImageUploader
          shape="square"
          size={110}
          label="Cover image"
          imageUrl={resolveAssetUrl(profile.coverImageUrl, ASSET_BASE_URL)}
          isUploading={uploadCover.isPending}
          onUpload={(file) => uploadCover.mutate(file)}
        />
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Restaurant name"
              fullWidth
              error={Boolean(errors.restaurantName)}
              helperText={errors.restaurantName?.message}
              {...register('restaurantName')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Owner name"
              fullWidth
              error={Boolean(errors.ownerName)}
              helperText={errors.ownerName?.message}
              {...register('ownerName')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Phone number"
              fullWidth
              error={Boolean(errors.phone)}
              helperText={errors.phone?.message}
              {...register('phone')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Email" fullWidth value={profile.email} disabled />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={3}
              error={Boolean(errors.description)}
              helperText={errors.description?.message}
              {...register('description')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              control={control}
              name="cuisineTypes"
              render={({ field }) => (
                <Autocomplete
                  multiple
                  options={CUISINE_TYPES}
                  value={field.value}
                  onChange={(_, value) => field.onChange(value)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip label={option} size="small" {...getTagProps({ index })} key={option} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cuisine types"
                      error={Boolean(errors.cuisineTypes)}
                      helperText={errors.cuisineTypes?.message}
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              label="Min order value (₹)"
              type="number"
              fullWidth
              error={Boolean(errors.minOrderValue)}
              helperText={errors.minOrderValue?.message}
              {...register('minOrderValue')}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              label="Avg prep time (min)"
              type="number"
              fullWidth
              error={Boolean(errors.avgPreparationTime)}
              helperText={errors.avgPreparationTime?.message}
              {...register('avgPreparationTime')}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }}>
              <Typography variant="caption" color="text.secondary">
                ADDRESS
              </Typography>
            </Divider>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Address line 1"
              fullWidth
              error={Boolean(errors.address?.line1)}
              helperText={errors.address?.line1?.message}
              {...register('address.line1')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Address line 2 (optional)" fullWidth {...register('address.line2')} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="City"
              fullWidth
              error={Boolean(errors.address?.city)}
              helperText={errors.address?.city?.message}
              {...register('address.city')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="State"
              fullWidth
              error={Boolean(errors.address?.state)}
              helperText={errors.address?.state?.message}
              {...register('address.state')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Pincode"
              fullWidth
              error={Boolean(errors.address?.pincode)}
              helperText={errors.address?.pincode?.message}
              {...register('address.pincode')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Country"
              fullWidth
              error={Boolean(errors.address?.country)}
              helperText={errors.address?.country?.message}
              {...register('address.country')}
            />
          </Grid>
        </Grid>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={!isDirty || updateProfile.isPending}
          >
            {updateProfile.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

function mapProfileToForm(profile: RestaurantProfile): ProfileFormValues {
  return {
    restaurantName: profile.restaurantName,
    ownerName: profile.ownerName,
    phone: profile.phone,
    description: profile.description ?? '',
    cuisineTypes: profile.cuisineTypes ?? [],
    minOrderValue: profile.minOrderValue ?? 0,
    avgPreparationTime: profile.avgPreparationTime ?? 30,
    address: {
      line1: profile.address?.line1 ?? '',
      line2: profile.address?.line2 ?? '',
      city: profile.address?.city ?? '',
      state: profile.address?.state ?? '',
      pincode: profile.address?.pincode ?? '',
      country: profile.address?.country ?? 'India',
    },
  };
}
