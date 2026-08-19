import { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Pagination,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/hooks/useNotifications';
import { formatRelativeTime } from '@/utils/formatters';
import type { AppNotification, NotificationType } from '@/types';

const TYPE_ICON: Record<NotificationType, JSX.Element> = {
  order: <ReceiptLongRoundedIcon />,
  review: <StarRoundedIcon />,
  offer: <LocalOfferRoundedIcon />,
  payment: <PaymentsRoundedIcon />,
  system: <CampaignRoundedIcon />,
};

const TYPE_COLOR: Record<NotificationType, string> = {
  order: '#ED5A2C',
  review: '#FFB238',
  offer: '#3B82C4',
  payment: '#2E9E5B',
  system: '#6B5C57',
};

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data: notificationsPage, isLoading } = useNotifications(page);
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  const notifications = notificationsPage?.data ?? [];
  const totalPages = notificationsPage?.meta.totalPages ?? 1;
  const hasUnread = notifications.some((n) => !n.isRead);

  function handleClick(notification: AppNotification) {
    if (!notification.isRead) markAsRead.mutate(notification.id);
  }

  return (
    <Box>
      <PageHeader
        title="Notifications"
        description="Stay up to date with orders, reviews and platform updates."
        actions={
          <Button
            size="small"
            startIcon={<DoneAllRoundedIcon />}
            onClick={() => markAllAsRead.mutate()}
            disabled={!hasUnread || markAllAsRead.isPending}
          >
            Mark all as read
          </Button>
        }
      />

      {isLoading ? (
        <LoadingScreen label="Loading notifications…" />
      ) : notifications.length === 0 ? (
        <EmptyState title="You're all caught up" description="No notifications right now." />
      ) : (
        <Paper>
          <List disablePadding>
            {notifications.map((notification, index) => (
              <ListItem
                key={notification.id}
                divider={index < notifications.length - 1}
                onClick={() => handleClick(notification)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification.mutate(notification.id);
                    }}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: `${TYPE_COLOR[notification.type]}22`, color: TYPE_COLOR[notification.type] }}>
                    {TYPE_ICON[notification.type]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={notification.isRead ? 500 : 700}>
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <Stack spacing={0.25}>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {formatRelativeTime(notification.createdAt)}
                      </Typography>
                    </Stack>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {totalPages > 1 && (
        <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
        </Stack>
      )}
    </Box>
  );
}
