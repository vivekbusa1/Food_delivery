import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Switch,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useRestaurantProfile, useToggleOpenStatus } from '@/hooks/useRestaurantProfile';
import { useNotifications } from '@/hooks/useNotifications';
import { DRAWER_WIDTH } from '@/utils/constants';
import { getInitials, resolveAssetUrl } from '@/utils/formatters';
import { ASSET_BASE_URL } from '@/utils/constants';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: profile } = useRestaurantProfile();
  const toggleOpenStatus = useToggleOpenStatus();
  const { data: notificationsPage } = useNotifications(1);
  const unreadCount = Array.isArray(notificationsPage?.data)
    ? notificationsPage.data.filter((n) => !n.isRead).length
    : 0;

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  async function handleLogout() {
    setAnchorEl(null);
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ gap: 1.5 }}>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
        >
          <MenuRoundedIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        {profile && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              size="small"
              label={profile.isOpen ? 'Accepting orders' : 'Offline'}
              color={profile.isOpen ? 'success' : 'default'}
              variant={profile.isOpen ? 'filled' : 'outlined'}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            />
            <Tooltip title={profile.isOpen ? 'Go offline' : 'Go online'}>
              <Switch
                checked={profile.isOpen}
                color="success"
                onChange={(_, checked) => toggleOpenStatus.mutate(checked)}
                disabled={toggleOpenStatus.isPending}
              />
            </Tooltip>
          </Stack>
        )}

        <Tooltip title="Notifications">
          <IconButton onClick={() => navigate('/notifications')}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsRoundedIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title="Account">
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
            <Avatar
              src={resolveAssetUrl(user?.logoUrl, ASSET_BASE_URL)}
              sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}
            >
              {getInitials(user?.restaurantName)}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {user?.restaurantName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate('/profile');
            }}
          >
            <ListItemIcon>
              <PersonRoundedIcon fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate('/settings');
            }}
          >
            <ListItemIcon>
              <SettingsRoundedIcon fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <LogoutRoundedIcon fontSize="small" color="error" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
