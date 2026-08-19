import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import { useAuth } from '@/context/AuthContext';
import { loginSchema, type LoginFormValues } from '@/schemas/authSchemas';
import { extractErrorMessage } from '@/services/apiClient';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginFormValues) {
    if (isSubmitting) return;
    setErrorMessage(null);
    try {
      await login(values);
      const redirectTo =
        (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
        '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, 'Invalid email or password'));
    }
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Welcome back
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Sign in to manage your restaurant, orders and menu.
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2.5}>
          <TextField
            label="Email address"
            type="email"
            fullWidth
            autoComplete="email"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            autoComplete="current-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            {...register('password')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                    {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isSubmitting}
            sx={{ py: 1.25 }}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </Stack>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
        Don't have a restaurant account?{' '}
        <Link component={RouterLink} to="/register" fontWeight={700} underline="hover">
          Register your restaurant
        </Link>
      </Typography>
    </Box>
  );
}
