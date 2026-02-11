import { Box, AppBar, Toolbar, Typography, CssBaseline } from '@mui/material';
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';

const drawerWidth = 240;

export const Layout = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            🏭 Production Control System
          </Typography>
        </Toolbar>
      </AppBar>

      {}
      <Sidebar />

      {}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar /> {}
        <Outlet /> {}
      </Box>
    </Box>
  );
};