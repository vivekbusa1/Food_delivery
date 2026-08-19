import {
  Avatar,
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import { navSections } from './navConfig';
import { DRAWER_WIDTH } from '@/utils/constants';
import { useAuth } from '@/context/AuthContext';
import { getInitials, resolveAssetUrl } from '@/utils/formatters';
import { ASSET_BASE_URL, APP_NAME } from '@/utils/constants';

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

function SidebarContent() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.25}
        sx={{ px: 2.5, py: 2.75 }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          <RestaurantRoundedIcon fontSize="small" />
        </Box>
        <Typography variant="subtitle1" fontWeight={800} noWrap>
          {APP_NAME}
        </Typography>
      </Stack>
      <Divider />

      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 1.5 }}>
        {navSections.map((section) => (
          <Box key={section.title} sx={{ mb: 1.5 }}>
            <Typography
              variant="caption"
              sx={{
                px: 1.5,
                color: 'text.disabled',
                fontWeight: 700,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
              }}
            >
              {section.title}
            </Typography>
            <List dense sx={{ mt: 0.5 }}>
              {section.items.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <ListItemButton
                    key={item.path}
                    component={NavLink}
                    to={item.path}
                    selected={isActive}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      color: isActive ? 'primary.main' : 'text.secondary',
                      bgcolor: isActive ? 'action.selected' : 'transparent',
                      '&.Mui-selected': {
                        bgcolor: (theme) => `${theme.palette.primary.main}1A`,
                      },
                      '&.Mui-selected:hover': {
                        bgcolor: (theme) => `${theme.palette.primary.main}26`,
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                      <Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 700 : 500 }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Divider />
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ p: 2 }}>
        <Avatar src={resolveAssetUrl(user?.logoUrl, ASSET_BASE_URL)} sx={{ width: 36, height: 36 }}>
          {getInitials(user?.restaurantName)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} noWrap>
            {user?.restaurantName ?? 'Restaurant'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {user?.email}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
      >
        <SidebarContent />
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
        open
      >
        <SidebarContent />
      </Drawer>
    </Box>
  );
}
