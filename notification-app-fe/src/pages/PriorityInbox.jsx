import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Select, MenuItem, FormControl, InputLabel, CircularProgress, Paper, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import NotificationCard from '../components/NotificationCard';
import { fetchNotifications } from '../services/api';
import { PriorityInbox as PriorityQueue } from '../utils/priority';

const PriorityInbox = () => {
  const [priorityNotifications, setPriorityNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topN, setTopN] = useState(10);
  const [filterType, setFilterType] = useState('All');
  
  const [viewedIds, setViewedIds] = useState(() => {
    const saved = localStorage.getItem('viewedNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  const loadPriorityNotifications = async () => {
    setLoading(true);
    try {
      const promises = [1, 2, 3].map(page => fetchNotifications(page, 20));
      const results = await Promise.all(promises);
      const allFetched = results.flat();

      const pInbox = new PriorityQueue(topN);
      
      allFetched.forEach(notif => {
        if (filterType === 'All' || notif.Type === filterType) {
          pInbox.addNotification(notif);
        }
      });

      setPriorityNotifications(pInbox.getTopNotifications());
    } catch (error) {
      console.error("Error loading priority", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPriorityNotifications();
  }, [topN, filterType]);

  const markAsViewed = (id) => {
    if (!viewedIds.includes(id)) {
      const newViewed = [...viewedIds, id];
      setViewedIds(newViewed);
      localStorage.setItem('viewedNotifications', JSON.stringify(newViewed));
    }
  };

  const markAllAsRead = () => {
    const allIds = priorityNotifications.map(n => n.ID);
    const newViewed = Array.from(new Set([...viewedIds, ...allIds]));
    setViewedIds(newViewed);
    localStorage.setItem('viewedNotifications', JSON.stringify(newViewed));
  };

  return (
    <Container maxWidth="md" sx={{ pb: 8 }}>
      <Box sx={{ mb: 5, mt: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ p: 1.5, bgcolor: 'secondary.main', color: 'white', borderRadius: 2, display: 'flex' }}>
          <InboxIcon />
        </Box>
        <Box>
          <Typography variant="h4" color="primary.main" gutterBottom sx={{ mb: 0 }}>
            Priority Inbox
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your most critical alerts, intelligently ranked.
          </Typography>
        </Box>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 4, 
          borderRadius: 3, 
          bgcolor: 'white', 
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box display="flex" gap={2} flexWrap="wrap">
          <FormControl size="small" sx={{ width: 120 }}>
            <InputLabel>Show Top</InputLabel>
            <Select value={topN} label="Show Top" onChange={(e) => setTopN(e.target.value)}>
              <MenuItem value={5}>Top 5</MenuItem>
              <MenuItem value={10}>Top 10</MenuItem>
              <MenuItem value={15}>Top 15</MenuItem>
              <MenuItem value={20}>Top 20</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Filter Category</InputLabel>
            <Select value={filterType} label="Filter Category" onChange={(e) => setFilterType(e.target.value)}>
              <MenuItem value="All">All Categories</MenuItem>
              <MenuItem value="Placement">Placement</MenuItem>
              <MenuItem value="Result">Result</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Button 
          variant="text" 
          color="primary" 
          onClick={markAllAsRead}
          disabled={priorityNotifications.length === 0}
        >
          Mark all as read
        </Button>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress size={40} thickness={4} />
        </Box>
      ) : (
        <Box>
          {priorityNotifications.length === 0 ? (
            <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, bgcolor: 'background.paper', border: '1px dashed #cbd5e1' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Inbox Zero!
              </Typography>
              <Typography variant="body2" color="text.disabled">
                No priority notifications match your criteria right now.
              </Typography>
            </Paper>
          ) : (
            priorityNotifications.map((notif, index) => (
              <Box key={notif.ID} position="relative">
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    left: -30, 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: 'text.disabled',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  #{index + 1}
                </Box>
                <NotificationCard 
                  notification={notif} 
                  isViewed={viewedIds.includes(notif.ID)}
                  onClick={markAsViewed}
                />
              </Box>
            ))
          )}
        </Box>
      )}
    </Container>
  );
};

export default PriorityInbox;
