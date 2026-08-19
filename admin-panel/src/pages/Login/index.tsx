import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '@/context/AuthContext';
import { extractErrorMessage } from '@/services/api';
import { APP_NAME } from '@/utils/constants';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await login(values);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(extractErrorMessage(err));
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        background: 'radial-gradient(circle at top, #2a1108 0%, #0F1115 55%)',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%' }} elevation={8}>
        <CardContent sx={{ p: 4 }}>
          <Stack alignItems="center" spacing={1} mb={3}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              <DeliveryDiningIcon fontSize="large" />
            </Avatar>
            <Typography variant="h5" fontWeight={800}>
              {APP_NAME}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to manage your platform
            </Typography>
          </Stack>

          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2.5}>
              <TextField
                label="Email address"
                type="email"
                fullWidth
                autoFocus
                error={!!errors.email}
                helperText={errors.email?.message}
                {...register('email')}
              />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
                {...register('password')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button type="submit" variant="contained" size="large" disabled={isSubmitting} fullWidth>
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
