import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Divider,
  Grid,
  Link,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { registerSchema, type RegisterFormValues } from '@/schemas/authSchemas';
import { extractErrorMessage } from '@/services/apiClient';
import { CUISINE_TYPES } from '@/utils/constants';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Bihar', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu',
  'Telangana', 'Uttar Pradesh', 'West Bengal',
];

export default function RegisterPage() {
  const { register: registerRestaurant } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      restaurantName: '',
      ownerName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      cuisineType: '',
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setErrorMessage(null);
    try {
      const { confirmPassword: _confirmPassword, ...payload } = values;
      await registerRestaurant(payload);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, 'Could not create your account'));
    }
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Register your restaurant
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Create a partner account to start receiving orders.
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

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
              label="Email address"
              type="email"
              fullWidth
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              {...register('email')}
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
            <TextField
              label="Password"
              type="password"
              fullWidth
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              {...register('password')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Confirm password"
              type="password"
              fullWidth
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }}>
              <Typography variant="caption" color="text.secondary">
                RESTAURANT ADDRESS
              </Typography>
            </Divider>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Address"
              fullWidth
              error={Boolean(errors.address)}
              helperText={errors.address?.message}
              {...register('address')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="City"
              fullWidth
              error={Boolean(errors.city)}
              helperText={errors.city?.message}
              {...register('city')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller
              control={control}
              name="state"
              render={({ field }) => (
                <Autocomplete
                  freeSolo
                  options={INDIAN_STATES}
                  value={field.value}
                  onChange={(_, value) => field.onChange(value ?? '')}
                  onInputChange={(_, value) => field.onChange(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="State"
                      error={Boolean(errors.state)}
                      helperText={errors.state?.message}
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Pincode"
              fullWidth
              error={Boolean(errors.pincode)}
              helperText={errors.pincode?.message}
              {...register('pincode')}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Primary cuisine type (optional)"
              select
              fullWidth
              defaultValue=""
              {...register('cuisineType')}
            >
              <MenuItem value="">Select a cuisine</MenuItem>
              {CUISINE_TYPES.map((cuisine) => (
                <MenuItem key={cuisine} value={cuisine}>
                  {cuisine}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Stack sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" size="large" disabled={isSubmitting} sx={{ py: 1.25 }}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </Stack>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
        Already have an account?{' '}
        <Link component={RouterLink} to="/login" fontWeight={700} underline="hover">
          Sign in
        </Link>
      </Typography>
    </Box>
  );
}
