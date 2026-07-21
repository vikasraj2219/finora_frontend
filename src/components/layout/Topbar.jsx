import { AppBar, Toolbar, IconButton, Box, Avatar, Typography, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4Outlined';
import Brightness7Icon from '@mui/icons-material/Brightness7Outlined';
import { useThemeMode } from '../../context/ThemeModeContext';
import { useAuth } from '../../context/AuthContext';

const Topbar = ({ onMenuClick }) => {
  const { mode, toggleMode } = useThemeMode();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
    >
      <Toolbar>
        <IconButton sx={{ display: { md: 'none' }, mr: 1 }} onClick={onMenuClick}>
          <MenuIcon />
        </IconButton>
        <Box flexGrow={1} />
        <IconButton onClick={toggleMode} sx={{ mr: 1 }}>
          {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
        </IconButton>
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main' }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </Avatar>
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem disabled>
            <Typography variant="body2">{user?.email}</Typography>
          </MenuItem>
          <MenuItem onClick={logout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
