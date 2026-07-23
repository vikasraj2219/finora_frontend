import { useState } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';
import Topbar from './Topbar';
import MobileBottomNav from './MobileBottomNav';

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box display="flex" minHeight="100vh">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box
        component="main"
        flexGrow={1}
        width={{ md: `calc(100% - ${DRAWER_WIDTH}px)` }}
        display="flex"
        flexDirection="column"
      >
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <Box p={{ xs: 2, md: 3 }} pb={{ xs: 9, md: 3 }} flexGrow={1}>
          <Outlet />
        </Box>
      </Box>
      <MobileBottomNav />
    </Box>
  );
};

export default AppLayout;
