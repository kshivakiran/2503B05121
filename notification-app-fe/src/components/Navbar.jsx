import React from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box,
  Container, Badge
} from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import InboxIcon from '@mui/icons-material/Inbox';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ unreadCount = 0 }) => {
  const location = useLocation();

  const navBtn = (to, label, icon) => {
    const active = location.pathname === to;
    return (
      <Button
        component={Link}
        to={to}
        startIcon={icon}
        sx={{
          color: 'white',
          fontWeight: active ? 700 : 500,
          fontSize: '0.875rem',
          px: 2,
          py: 0.8,
          borderRadius: '8px',
          backgroundColor: active ? 'rgba(255,255,255,0.18)' : 'transparent',
          backdropFilter: 'blur(4px)',
          border: active ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
          }
        }}
      >
        {label}
      </Button>
    );
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 1 }}>
          {/* Brand */}
          <Box display="flex" alignItems="center" gap={1.2} sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                borderRadius: '10px',
                p: 0.8,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <NotificationsNoneIcon sx={{ color: 'white', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                component={Link}
                to="/"
                sx={{
                  color: 'white',
                  textDecoration: 'none',
                  fontFamily: '"Outfit", sans-serif',
                  fontWeight: 700,
                  fontSize: '1.15rem',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                  display: 'block',
                }}
              >
                Campus Connect
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1 }}>
                Notification Hub
              </Typography>
            </Box>
          </Box>

          {/* Nav Links */}
          <Box display="flex" alignItems="center" gap={1}>
            {navBtn('/', 'All Updates', <DashboardIcon fontSize="small" />)}
            <Button
              component={Link}
              to="/priority"
              startIcon={<InboxIcon fontSize="small" />}
              sx={{
                color: 'white',
                fontWeight: location.pathname === '/priority' ? 700 : 500,
                fontSize: '0.875rem',
                px: 2,
                py: 0.8,
                borderRadius: '8px',
                backgroundColor: location.pathname === '/priority' ? 'rgba(255,255,255,0.18)' : 'transparent',
                backdropFilter: 'blur(4px)',
                border: location.pathname === '/priority' ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }
              }}
            >
              <Badge
                badgeContent={unreadCount > 0 ? unreadCount : null}
                color="error"
                sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', minWidth: 16, height: 16, p: '0 4px' } }}
              >
                Priority Inbox
              </Badge>
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
