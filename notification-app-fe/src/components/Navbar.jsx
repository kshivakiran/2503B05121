import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import InboxIcon from '@mui/icons-material/Inbox';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  return (
    <AppBar position="sticky" sx={{ background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)', boxShadow: 3, mb: 4 }}>
      <Container maxWidth="md">
        <Toolbar disableGutters>
          <NotificationsIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: 1,
            }}
          >
            Campus Connect
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              component={Link}
              to="/"
              sx={{
                color: 'white',
                display: 'block',
                fontWeight: location.pathname === '/' ? 'bold' : 'normal',
                backgroundColor: location.pathname === '/' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)' }
              }}
            >
              All Notifications
            </Button>
            <Button
              component={Link}
              to="/priority"
              startIcon={<InboxIcon />}
              sx={{
                color: 'white',
                display: 'flex',
                fontWeight: location.pathname === '/priority' ? 'bold' : 'normal',
                backgroundColor: location.pathname === '/priority' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)' }
              }}
            >
              Priority Inbox
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
