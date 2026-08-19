import { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { DRAWER_WIDTH } from '@/utils/constants';

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Topbar onMenuClick={() => setMobileOpen(true)} />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minWidth: 0,
          overflowX: 'hidden',
        }}
      >
        <Toolbar />
        <Box
          sx={{
            px: { xs: 1.5, sm: 2.5, md: 3 },
            py: { xs: 2, sm: 3 },
            mx: 'auto',
            width: '100%',
            maxWidth: 1400,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
