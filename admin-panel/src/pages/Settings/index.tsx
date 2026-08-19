import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import { settingsService } from '@/services/settings.service';
import { authService } from '@/services/auth.service';
import { extractErrorMessage } from '@/services/api';
import type { AppSettings } from '@/types';

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Settings: React.FC = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.get,
  });

  const { register, handleSubmit, reset } = useForm<AppSettings>();

  useEffect(() => {
    if (settings) {
      reset(settings);
      setMaintenanceMode(Boolean(settings.maintenanceMode));
    }
  }, [settings, reset]);

  const saveMutation = useMutation({
    mutationFn: (values: Partial<AppSettings>) => settingsService.update({ ...values, maintenanceMode }),
    onSuccess: () => {
      enqueueSnackbar('Settings saved', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const {
    register: registerPwd,
    handleSubmit: handlePwdSubmit,
    reset: resetPwd,
    watch,
  } = useForm<PasswordFormValues>({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const passwordMutation = useMutation({
    mutationFn: (values: PasswordFormValues) =>
      authService.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
    onSuccess: () => {
      enqueueSnackbar('Password changed successfully', { variant: 'success' });
      resetPwd();
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');
  const passwordMismatch = Boolean(newPassword) && Boolean(confirmPassword) && newPassword !== confirmPassword;

  if (isLoading) return <Loading minHeight={400} />;

  return (
    <Box>
      <PageHeader title="Settings" subtitle="Configure platform-wide preferences" />

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <Card variant="outlined">
            <CardHeader title="General Settings" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label="Site Name" fullWidth {...register('siteName')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Currency" fullWidth {...register('currency')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Support Email" fullWidth {...register('supportEmail')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Support Phone" fullWidth {...register('supportPhone')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Delivery Radius"
                    type="number"
                    fullWidth
                    InputProps={{ endAdornment: <InputAdornment position="end">km</InputAdornment> }}
                    {...register('deliveryRadiusKm')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Default Commission Rate"
                    type="number"
                    fullWidth
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    {...register('defaultCommissionRate')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Minimum Order Value" type="number" fullWidth {...register('minOrderValue')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Tax Percentage"
                    type="number"
                    fullWidth
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    {...register('taxPercent')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <FormControlLabel
                    control={<Switch checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} color="warning" />}
                    label="Maintenance Mode"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    When enabled, customer-facing apps will show a maintenance message.
                  </Typography>
                </Grid>
              </Grid>
              <Stack direction="row" justifyContent="flex-end" mt={3}>
                <Button variant="contained" disabled={saveMutation.isPending} onClick={handleSubmit((v) => saveMutation.mutate(v))}>
                  Save Settings
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card variant="outlined">
            <CardHeader title="Change Password" subheader="Update your admin account password" />
            <CardContent>
              <Stack spacing={2}>
                <TextField label="Current Password" type="password" fullWidth {...registerPwd('currentPassword', { required: true })} />
                <TextField label="New Password" type="password" fullWidth {...registerPwd('newPassword', { required: true, minLength: 6 })} />
                <TextField
                  label="Confirm New Password"
                  type="password"
                  fullWidth
                  error={passwordMismatch}
                  helperText={passwordMismatch ? 'Passwords do not match' : ' '}
                  {...registerPwd('confirmPassword', { required: true })}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  disabled={passwordMutation.isPending || passwordMismatch}
                  onClick={handlePwdSubmit((v) => passwordMutation.mutate(v))}
                >
                  Update Password
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
