import { useState } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';
import Topbar from './Topbar';

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
        <Box p={{ xs: 2, md: 3 }} flexGrow={1}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
