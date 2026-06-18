import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Select, MenuItem, FormControl, InputLabel,
  Box, Button, CircularProgress, Paper, Chip, alpha
} from '@mui/material';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import NotificationCard from '../components/NotificationCard';
import { fetchNotifications } from '../services/api';

// Summary chips at the top
const STAT_CHIPS = [
  { label: 'Placements', value: 'Placement', icon: <BusinessCenterRoundedIcon sx={{ fontSize: 16 }} />, color: '#10b981' },
  { label: 'Results',    value: 'Result',    icon: <AssessmentRoundedIcon    sx={{ fontSize: 16 }} />, color: '#0ea5e9' },
  { label: 'Events',    value: 'Event',     icon: <CelebrationRoundedIcon   sx={{ fontSize: 16 }} />, color: '#f59e0b' },
];

const AllNotifications = ({ onUnreadCountChange }) => {
  const [notifications, setNotifications]   = useState([]);
  const [loading, setLoading]               = useState(false);
  const [page, setPage]                     = useState(1);
  const [filterType, setFilterType]         = useState('All');

  const [viewedIds, setViewedIds] = useState(() => {
    const saved = localStorage.getItem('viewedNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  const loadNotifications = useCallback(async (currentPage, type) => {
    setLoading(true);
    const data = await fetchNotifications(currentPage, 10, type);
    setNotifications(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadNotifications(page, filterType);
  }, [page, filterType, loadNotifications]);

  // Let parent App know unread count
  useEffect(() => {
    const unread = notifications.filter(n => !viewedIds.includes(n.ID)).length;
    if (onUnreadCountChange) onUnreadCountChange(unread);
  }, [notifications, viewedIds, onUnreadCountChange]);

  const handleFilterChange = (type) => {
    setFilterType(type);
    setPage(1);
  };

  const markAsViewed = (id) => {
    if (!viewedIds.includes(id)) {
      const updated = [...viewedIds, id];
      setViewedIds(updated);
      localStorage.setItem('viewedNotifications', JSON.stringify(updated));
    }
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.ID);
    const updated = Array.from(new Set([...viewedIds, ...allIds]));
    setViewedIds(updated);
    localStorage.setItem('viewedNotifications', JSON.stringify(updated));
  };

  const unreadCount = notifications.filter(n => !viewedIds.includes(n.ID)).length;

  return (
    <Container maxWidth="md" sx={{ pb: 8 }}>

      {/* ── Page Header ── */}
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" color="primary" fontWeight={700} gutterBottom>
          Campus Updates
        </Typography>
        <Typography variant="body1" color="text.secondary">
          All your placements, results, and events in one place.
        </Typography>
      </Box>

      {/* ── Quick Category Filter Chips ── */}
      <Box display="flex" gap={1.5} mb={3} flexWrap="wrap">
        <Chip
          label="All"
          onClick={() => handleFilterChange('All')}
          sx={{
            fontWeight: 600,
            px: 1,
            bgcolor: filterType === 'All' ? 'primary.main' : 'white',
            color: filterType === 'All' ? 'white' : 'text.secondary',
            border: '1px solid',
            borderColor: filterType === 'All' ? 'primary.main' : '#e2e8f0',
            '&:hover': { bgcolor: filterType === 'All' ? 'primary.dark' : '#f1f5f9' },
            transition: 'all 0.2s ease',
          }}
        />
        {STAT_CHIPS.map(chip => (
          <Chip
            key={chip.value}
            icon={React.cloneElement(chip.icon, { style: { color: filterType === chip.value ? 'white' : chip.color } })}
            label={chip.label}
            onClick={() => handleFilterChange(chip.value)}
            sx={{
              fontWeight: 600,
              px: 1,
              bgcolor: filterType === chip.value ? chip.color : alpha(chip.color, 0.08),
              color: filterType === chip.value ? 'white' : chip.color,
              border: `1px solid ${alpha(chip.color, filterType === chip.value ? 1 : 0.3)}`,
              '&:hover': { bgcolor: filterType === chip.value ? chip.color : alpha(chip.color, 0.15) },
              transition: 'all 0.2s ease',
            }}
          />
        ))}
      </Box>

      {/* ── Filter Bar ── */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          bgcolor: 'white'
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <FilterListRoundedIcon sx={{ color: 'text.secondary' }} />
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={filterType}
              label="Filter by Type"
              onChange={(e) => handleFilterChange(e.target.value)}
              sx={{ borderRadius: '8px' }}
            >
              <MenuItem value="All">All Types</MenuItem>
              <MenuItem value="Placement">Placement</MenuItem>
              <MenuItem value="Result">Result</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
            </Select>
          </FormControl>
          {unreadCount > 0 && (
            <Typography variant="body2" color="text.secondary">
              <b>{unreadCount}</b> unread
            </Typography>
          )}
        </Box>

        <Button
          startIcon={<DoneAllRoundedIcon />}
          variant="outlined"
          size="small"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
        >
          Mark all as read
        </Button>
      </Paper>

      {/* ── Notification List ── */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
          <CircularProgress size={44} thickness={4} />
        </Box>
      ) : notifications.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: 'center',
            borderRadius: 4,
            border: '2px dashed #e2e8f0',
            bgcolor: '#f8fafc'
          }}
        >
          <InboxRoundedIcon sx={{ fontSize: 56, color: '#cbd5e1', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            Nothing here yet
          </Typography>
          <Typography variant="body2" color="text.disabled" mt={1}>
            No notifications found for the selected filter.
          </Typography>
        </Paper>
      ) : (
        <Box>
          {notifications.map(notif => (
            <NotificationCard
              key={notif.ID}
              notification={notif}
              isViewed={viewedIds.includes(notif.ID)}
              onClick={markAsViewed}
            />
          ))}

          {/* ── Pagination ── */}
          <Box display="flex" justifyContent="center" alignItems="center" gap={2} mt={5}>
            <Button
              variant="outlined"
              startIcon={<NavigateBeforeRoundedIcon />}
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              sx={{ borderRadius: '8px', px: 2.5 }}
            >
              Previous
            </Button>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Page {page}
            </Typography>
            <Button
              variant="contained"
              disableElevation
              endIcon={<NavigateNextRoundedIcon />}
              onClick={() => setPage(p => p + 1)}
              disabled={notifications.length < 10}
              sx={{ borderRadius: '8px', px: 2.5 }}
            >
              Next
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default AllNotifications;
