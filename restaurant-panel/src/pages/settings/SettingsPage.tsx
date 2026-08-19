import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Alert,
  Box,
  Button,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/schemas/authSchemas';
import { authService } from '@/services/authService';
import { extractErrorMessage } from '@/services/apiClient';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/hooks/useNotifications';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  });

  const changePassword = useMutation({
    mutationFn: (values: ChangePasswordFormValues) =>
      authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    onSuccess: () => {
      enqueueSnackbar('Password updated successfully', { variant: 'success' });
      reset();
      setPasswordError(null);
    },
    onError: (error) => setPasswordError(extractErrorMessage(error, 'Could not update password')),
  });

  const { data: preferences, isLoading: isPreferencesLoading } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  function onPasswordSubmit(values: ChangePasswordFormValues) {
    setPasswordError(null);
    changePassword.mutate(values);
  }

  return (
    <Box>
      <PageHeader title="Settings" description="Manage your account security and preferences." />

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Account
            </Typography>
            <Stack spacing={0.5} sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Email: {user?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Phone: {user?.phone}
              </Typography>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Change password
            </Typography>

            {passwordError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {passwordError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onPasswordSubmit)} noValidate>
              <Stack spacing={2}>
                <TextField
                  label="Current password"
                  type="password"
                  fullWidth
                  error={Boolean(errors.currentPassword)}
                  helperText={errors.currentPassword?.message}
                  {...register('currentPassword')}
                />
                <TextField
                  label="New password"
                  type="password"
                  fullWidth
                  error={Boolean(errors.newPassword)}
                  helperText={errors.newPassword?.message}
                  {...register('newPassword')}
                />
                <TextField
                  label="Confirm new password"
                  type="password"
                  fullWidth
                  error={Boolean(errors.confirmNewPassword)}
                  helperText={errors.confirmNewPassword?.message}
                  {...register('confirmNewPassword')}
                />
                <Stack direction="row" justifyContent="flex-end">
                  <Button type="submit" variant="contained" disabled={changePassword.isPending}>
                    {changePassword.isPending ? 'Updating…' : 'Update password'}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Notification preferences
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose how you'd like to be notified about activity on your restaurant.
            </Typography>

            {isPreferencesLoading || !preferences ? (
              <LoadingScreen label="Loading preferences…" />
            ) : (
              <Stack spacing={0.5}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.newOrderPush}
                      onChange={(_, checked) => updatePreferences.mutate({ newOrderPush: checked })}
                    />
                  }
                  label="Push notification for new orders"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.newOrderEmail}
                      onChange={(_, checked) => updatePreferences.mutate({ newOrderEmail: checked })}
                    />
                  }
                  label="Email me for new orders"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.newOrderSms}
                      onChange={(_, checked) => updatePreferences.mutate({ newOrderSms: checked })}
                    />
                  }
                  label="SMS me for new orders"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.reviewAlerts}
                      onChange={(_, checked) => updatePreferences.mutate({ reviewAlerts: checked })}
                    />
                  }
                  label="Alert me about new reviews"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.payoutAlerts}
                      onChange={(_, checked) => updatePreferences.mutate({ payoutAlerts: checked })}
                    />
                  }
                  label="Alert me about payouts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.marketingUpdates}
                      onChange={(_, checked) => updatePreferences.mutate({ marketingUpdates: checked })}
                    />
                  }
                  label="Marketing tips & product updates"
                />
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
