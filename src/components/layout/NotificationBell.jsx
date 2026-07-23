import { useState, useEffect, useCallback } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Button,
  Divider,
} from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../../api/notificationApi';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    const { data } = await listNotifications({ limit: 10 });
    setItems(data.data.items);
    setUnreadCount(data.data.unreadCount);
  }, []);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
    load();
  };
  const handleClose = () => setAnchorEl(null);

  const handleItemClick = async (n) => {
    if (!n.isRead) {
      await markNotificationRead(n._id);
      load();
    }
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    load();
  };

  return (
    <>
      <IconButton onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsNoneIcon />
        </Badge>
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ width: 340, maxHeight: 420, overflowY: 'auto' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" px={2} py={1.5}>
            <Typography variant="subtitle2">Notifications</Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={handleMarkAll}>
                Mark all read
              </Button>
            )}
          </Box>
          <Divider />
          {items.length === 0 ? (
            <Box p={3} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                You're all caught up.
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {items.map((n) => (
                <ListItemButton key={n._id} onClick={() => handleItemClick(n)} sx={{ opacity: n.isRead ? 0.6 : 1 }}>
                  <ListItemText
                    primary={n.title}
                    secondary={n.message}
                    primaryTypographyProps={{ fontWeight: n.isRead ? 400 : 600, variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
