import { useLocation, useNavigate } from 'react-router-dom';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHorizOutlined';
import AccountBalanceIcon from '@mui/icons-material/AccountBalanceOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFileOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHorizOutlined';

const ITEMS = [
  { label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
  { label: 'Transactions', icon: SwapHorizIcon, path: '/transactions' },
  { label: 'Accounts', icon: AccountBalanceIcon, path: '/accounts' },
  { label: 'Import', icon: UploadFileIcon, path: '/imports' },
  { label: 'Settings', icon: MoreHorizIcon, path: '/settings' },
];

// Thumb-reachable primary navigation on small screens — the full Sidebar stays available
// via the hamburger drawer for the less-frequent destinations (Categories, Merchants, Reports).
const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const current = ITEMS.findIndex((item) => location.pathname.startsWith(item.path));

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        display: { xs: 'block', md: 'none' },
      }}
    >
      <BottomNavigation
        value={current === -1 ? false : current}
        onChange={(e, newValue) => navigate(ITEMS[newValue].path)}
        showLabels
      >
        {ITEMS.map((item) => (
          <BottomNavigationAction key={item.path} label={item.label} icon={<item.icon fontSize="small" />} />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default MobileBottomNav;
