import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Paper,
  Button, Chip, alpha, Divider
} from '@mui/material';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import NotificationCard from '../components/NotificationCard';
import { fetchNotifications } from '../services/api';
import { PriorityInbox as PriorityQueue } from '../utils/priority';

const PriorityInboxPage = () => {
  const [priorityNotifications, setPriorityNotifications] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [topN, setTopN]         = useState(10);
  const [filterType, setFilterType] = useState('All');

  const [viewedIds, setViewedIds] = useState(() => {
    const saved = localStorage.getItem('viewedNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  const loadPriority = useCallback(async () => {
    setLoading(true);
    try {
      const promises = [1, 2, 3].map(p => fetchNotifications(p, 20));
      const results  = await Promise.all(promises);
      const all      = results.flat();

      const pInbox = new PriorityQueue(topN);
      all.forEach(notif => {
        if (filterType === 'All' || notif.Type === filterType) {
          pInbox.addNotification(notif);
        }
      });
      setPriorityNotifications(pInbox.getTopNotifications());
    } catch (err) {
      console.error('Priority load error', err);
    } finally {
      setLoading(false);
    }
  }, [topN, filterType]);

  useEffect(() => { loadPriority(); }, [loadPriority]);

  const markAsViewed = (id) => {
    if (!viewedIds.includes(id)) {
      const updated = [...viewedIds, id];
      setViewedIds(updated);
      localStorage.setItem('viewedNotifications', JSON.stringify(updated));
    }
  };

  const markAllAsRead = () => {
    const allIds = priorityNotifications.map(n => n.ID);
    const updated = Array.from(new Set([...viewedIds, ...allIds]));
    setViewedIds(updated);
    localStorage.setItem('viewedNotifications', JSON.stringify(updated));
  };

  const unreadCount = priorityNotifications.filter(n => !viewedIds.includes(n.ID)).length;

  return (
    <Container maxWidth="md" sx={{ pb: 8 }}>

      {/* ── Page Header ── */}
      <Box sx={{ mt: 4, mb: 4, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box
          sx={{
            bgcolor: 'secondary.main',
            borderRadius: '14px',
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(236,72,153,0.35)',
          }}
        >
          <AutoAwesomeIcon sx={{ color: 'white', fontSize: 26 }} />
        </Box>
        <Box>
          <Typography variant="h4" color="primary" fontWeight={700} sx={{ mb: 0.5 }}>
            Priority Inbox
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your most important notifications, intelligently ranked by urgency &amp; recency.
          </Typography>
        </Box>
      </Box>

      {/* ── Priority Legend ── */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          bgcolor: alpha('#4338ca', 0.04),
          border: '1px solid',
          borderColor: alpha('#4338ca', 0.15),
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
          <EmojiEventsRoundedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
          <Typography variant="body2" fontWeight={700} color="primary">
            Priority Order (Highest → Lowest)
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          <Chip
            icon={<BusinessCenterRoundedIcon sx={{ fontSize: 14, color: '#10b981 !important' }} />}
            label="Placement — Weight 3"
            size="small"
            sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 700, borderRadius: '6px' }}
          />
          <Typography color="text.disabled" fontWeight={700}>&gt;</Typography>
          <Chip
            icon={<AssessmentRoundedIcon sx={{ fontSize: 14, color: '#0ea5e9 !important' }} />}
            label="Result — Weight 2"
            size="small"
            sx={{ bgcolor: alpha('#0ea5e9', 0.1), color: '#0ea5e9', fontWeight: 700, borderRadius: '6px' }}
          />
          <Typography color="text.disabled" fontWeight={700}>&gt;</Typography>
          <Chip
            icon={<CelebrationRoundedIcon sx={{ fontSize: 14, color: '#f59e0b !important' }} />}
            label="Event — Weight 1"
            size="small"
            sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', fontWeight: 700, borderRadius: '6px' }}
          />
          <Typography variant="caption" color="text.disabled" sx={{ ml: 1 }}>
            · Tie-broken by newest timestamp
          </Typography>
        </Box>
      </Paper>

      {/* ── Controls Bar ── */}
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
          <TuneRoundedIcon sx={{ color: 'text.secondary' }} />
          <FormControl size="small" sx={{ width: 130 }}>
            <InputLabel>Show Top</InputLabel>
            <Select value={topN} label="Show Top" onChange={e => setTopN(e.target.value)} sx={{ borderRadius: '8px' }}>
              <MenuItem value={5}>Top 5</MenuItem>
              <MenuItem value={10}>Top 10</MenuItem>
              <MenuItem value={15}>Top 15</MenuItem>
              <MenuItem value={20}>Top 20</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Filter Type</InputLabel>
            <Select value={filterType} label="Filter Type" onChange={e => setFilterType(e.target.value)} sx={{ borderRadius: '8px' }}>
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

      {/* ── List ── */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
          <CircularProgress size={44} thickness={4} />
        </Box>
      ) : priorityNotifications.length === 0 ? (
        <Paper
          elevation={0}
          sx={{ p: 8, textAlign: 'center', borderRadius: 4, border: '2px dashed #e2e8f0', bgcolor: '#f8fafc' }}
        >
          <InboxRoundedIcon sx={{ fontSize: 56, color: '#cbd5e1', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            Inbox Zero! 🎉
          </Typography>
          <Typography variant="body2" color="text.disabled" mt={1}>
            No priority notifications match your current filter.
          </Typography>
        </Paper>
      ) : (
        <Box>
          {priorityNotifications.map((notif, index) => (
            <Box key={notif.ID} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              {/* Rank Badge */}
              <Box
                sx={{
                  minWidth: 32,
                  height: 32,
                  mt: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  bgcolor: index < 3 ? 'primary.main' : alpha('#64748b', 0.08),
                  color: index < 3 ? 'white' : 'text.disabled',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  flexShrink: 0,
                  boxShadow: index < 3 ? '0 2px 8px rgba(67,56,202,0.3)' : 'none',
                }}
              >
                #{index + 1}
              </Box>
              <Box sx={{ flex: 1 }}>
                <NotificationCard
                  notification={notif}
                  isViewed={viewedIds.includes(notif.ID)}
                  onClick={markAsViewed}
                />
              </Box>
            </Box>
          ))}
          <Divider sx={{ mt: 2, mb: 3 }} />
          <Typography variant="caption" color="text.disabled" textAlign="center" display="block">
            Showing top {priorityNotifications.length} notifications · Algorithm: Min-Heap O(log N) · Min-Heap sorted by weight + recency
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default PriorityInboxPage;
