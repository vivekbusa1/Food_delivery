import React, { useState } from 'react';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import { navSections } from './navConfig';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/utils/formatters';
import { APP_NAME } from '@/utils/constants';

const DRAWER_WIDTH = 264;

const DashboardLayout: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const drawerContent = (
    <Box display="flex" flexDirection="column" height="100%">
      <Toolbar sx={{ px: 2.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main', width: 34, height: 34 }}>
            <DeliveryDiningIcon fontSize="small" />
          </Avatar>
          <Typography variant="subtitle1" fontWeight={800} noWrap>
            {APP_NAME}
          </Typography>
        </Stack>
      </Toolbar>
      <Divider />
      <Box flex={1} overflow="auto" py={1}>
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => !item.permission || hasPermission(item.permission));
          if (visibleItems.length === 0) return null;
          return (
            <Box key={section.section} mb={1}>
              <Typography
                variant="caption"
                sx={{ px: 2.5, py: 1, display: 'block', color: 'text.secondary', fontWeight: 700, letterSpacing: 0.5 }}
              >
                {section.section.toUpperCase()}
              </Typography>
              <List disablePadding>
                {visibleItems.map((item) => {
                  const selected = location.pathname.startsWith(item.path);
                  const Icon = item.icon;
                  return (
                    <ListItemButton
                      key={item.path}
                      component={RouterLink}
                      to={item.path}
                      selected={selected}
                      onClick={() => setMobileOpen(false)}
                      sx={{
                        mx: 1,
                        my: 0.25,
                        borderRadius: 2,
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                          '&:hover': { bgcolor: 'primary.dark' },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 38 }}>
                        <Icon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}>
                        {item.label}
                      </ListItemText>
                    </ListItemButton>
                  );
                })}
              </List>
            </Box>
          );
        })}
      </Box>
    </Box>
  );

  return (
    <Box display="flex" minHeight="100vh">
      <AppBar
        position="fixed"
        elevation={0}
        color="inherit"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {!isDesktop && (
            <IconButton edge="start" onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <Box flex={1} />
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
              {getInitials(user?.name)}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <Box px={2} py={1}>
              <Typography variant="subtitle2" fontWeight={700}>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                navigate('/settings');
              }}
            >
              Account Settings
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                logout();
              }}
            >
              <ListItemIcon>
                <LogoutOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, borderRight: '1px solid', borderColor: 'divider' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        flexGrow={1}
        width={{ md: `calc(100% - ${DRAWER_WIDTH}px)` }}
        minWidth={0}
        sx={{ overflowX: 'hidden' }}
      >
        <Toolbar />
        <Box
          px={{ xs: 1.5, sm: 2.5, md: 3 }}
          py={{ xs: 2, sm: 3 }}
          mx="auto"
          width="100%"
          maxWidth={1400}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
