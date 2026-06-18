import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, alpha } from '@mui/material';

import Navbar from './components/Navbar';
import AllNotifications from './pages/AllNotifications';
import PriorityInbox from './pages/PriorityInbox';

// ── Premium Theme ────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4338ca',
      light: '#6366f1',
      dark: '#312e81',
    },
    secondary: {
      main: '#ec4899',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    success: { main: '#10b981', light: alpha('#10b981', 0.1), dark: '#065f46' },
    info:    { main: '#0ea5e9', light: alpha('#0ea5e9', 0.1), dark: '#0c4a6e' },
    warning: { main: '#f59e0b', light: alpha('#f59e0b', 0.1), dark: '#78350f' },
    error:   { main: '#ef4444', light: alpha('#ef4444', 0.1), dark: '#7f1d1d' },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", sans-serif',
    h4: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: '8px', padding: '7px 16px' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: '7px' },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: '8px' },
      },
    },
  },
});

function App() {
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {/* Navbar receives the live unread count for the badge */}
        <Navbar unreadCount={unreadCount} />
        <Routes>
          <Route
            path="/"
            element={<AllNotifications onUnreadCountChange={setUnreadCount} />}
          />
          <Route path="/priority" element={<PriorityInbox />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
