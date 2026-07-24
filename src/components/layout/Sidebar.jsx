import { NavLink } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import AccountBalanceIcon from '@mui/icons-material/AccountBalanceOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHorizOutlined';
import ChecklistIcon from '@mui/icons-material/ChecklistOutlined';
import CategoryIcon from '@mui/icons-material/CategoryOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFileOutlined';
import StorefrontIcon from '@mui/icons-material/StorefrontOutlined';
import AssessmentIcon from '@mui/icons-material/AssessmentOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import Logo from '../common/Logo';

const DRAWER_WIDTH = 272;

const navItems = [
  { label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
  { label: 'Accounts', icon: AccountBalanceIcon, path: '/accounts' },
  { label: 'Transactions', icon: SwapHorizIcon, path: '/transactions' },
  { label: 'Allocation', icon: ChecklistIcon, path: '/allocation' },
  { label: 'Categories', icon: CategoryIcon, path: '/categories' },
  { label: 'Import Statement', icon: UploadFileIcon, path: '/imports' },
  { label: 'Merchants', icon: StorefrontIcon, path: '/merchants' },
  { label: 'Reports', icon: AssessmentIcon, path: '/reports' },
  { label: 'Settings', icon: SettingsIcon, path: '/settings' },
];

const SidebarContent = () => {
  const theme = useTheme();
  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box display="flex" alignItems="center" px={2.5} py={3}>
        <Box
          sx={{
            bgcolor: '#ffffff',
            borderRadius: 2,
            px: 1.5,
            py: 1,
            display: 'inline-flex',
            alignItems: 'center',
            boxShadow: '0 1px 2px rgba(11, 38, 67, 0.08)',
          }}
        >
          <Logo variant="full" height={30} />
        </Box>
      </Box>

      <List sx={{ px: 1.5, flexGrow: 1 }}>
        {navItems.map(({ label, icon: Icon, path }) => (
          <ListItemButton
            key={path}
            component={NavLink}
            to={path}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.active': {
                bgcolor: `${theme.palette.secondary.main}1F`,
                borderLeft: `3px solid ${theme.palette.secondary.main}`,
                '.MuiListItemIcon-root, .MuiListItemText-primary': {
                  color: theme.palette.secondary.dark,
                  fontWeight: 600,
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Icon />
            </ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>

      <Box
        m={2}
        p={2}
        borderRadius={2}
        borderLeft={`3px solid ${theme.palette.secondary.main}`}
        bgcolor="background.default"
      >
        <Typography variant="caption" color="text.secondary">
          Finora v1.0
        </Typography>
      </Box>
    </Box>
  );
};

const Sidebar = ({ mobileOpen, onClose }) => (
  <>
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        width: DRAWER_WIDTH,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none' },
      }}
    >
      <SidebarContent />
    </Drawer>
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'block', md: 'none' },
        [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      <SidebarContent />
    </Drawer>
  </>
);

export default Sidebar;
export { DRAWER_WIDTH };
