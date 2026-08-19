import { Box, Paper, Stack, Typography } from '@mui/material';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import { Outlet } from 'react-router-dom';
import { APP_NAME } from '@/utils/constants';

export function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'stretch',
        background:
          'linear-gradient(135deg, #FFF3EC 0%, #FBF7F4 45%, #FDEBE3 100%)',
      }}
    >
      <Stack
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '46%',
          background:
            'radial-gradient(circle at 20% 20%, #FF8A5C 0%, #ED5A2C 45%, #C6431A 100%)',
          color: '#fff',
          p: 6,
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              bgcolor: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RestaurantRoundedIcon />
          </Box>
          <Typography variant="h6" fontWeight={800}>
            {APP_NAME}
          </Typography>
        </Stack>

        <Box>
          <Typography variant="h3" fontWeight={800} sx={{ mb: 2, lineHeight: 1.2 }}>
            Grow your restaurant business with us
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 420 }}>
            Manage your menu, track orders in real time, run offers, and understand your
            customers — all from one powerful partner dashboard.
          </Typography>
        </Box>

        <Typography variant="caption" sx={{ opacity: 0.75 }}>
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </Typography>
      </Stack>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 460,
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Outlet />
        </Paper>
      </Box>
    </Box>
  );
}
