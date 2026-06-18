import React, { useState, useEffect } from 'react';
import { Container, Typography, Select, MenuItem, FormControl, InputLabel, Box, Button, CircularProgress, Paper } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import NotificationCard from '../components/NotificationCard';
import { fetchNotifications } from '../services/api';

const AllNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState('All');
  
  const [viewedIds, setViewedIds] = useState(() => {
    const saved = localStorage.getItem('viewedNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  const loadNotifications = async (currentPage, type) => {
    setLoading(true);
    const data = await fetchNotifications(currentPage, 20, type);
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications(page, filterType);
  }, [page, filterType]);

  const handleFilterChange = (event) => {
    setFilterType(event.target.value);
    setPage(1); // Reset to first page on filter change
  };

  const markAsViewed = (id) => {
    if (!viewedIds.includes(id)) {
      const newViewed = [...viewedIds, id];
      setViewedIds(newViewed);
      localStorage.setItem('viewedNotifications', JSON.stringify(newViewed));
    }
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.ID);
    const newViewed = Array.from(new Set([...viewedIds, ...allIds]));
    setViewedIds(newViewed);
    localStorage.setItem('viewedNotifications', JSON.stringify(newViewed));
  };

  return (
    <Container maxWidth="md" sx={{ pb: 8 }}>
      <Box sx={{ mb: 5, mt: 2 }}>
        <Typography variant="h4" color="primary.main" gutterBottom>
          Updates & Alerts
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Stay on top of your campus placements, results, and events.
        </Typography>
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
        <Box display="flex" alignItems="center" gap={1}>
          <FilterListIcon color="action" />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Filter by Category</InputLabel>
            <Select value={filterType} label="Filter by Category" onChange={handleFilterChange}>
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
          disabled={notifications.length === 0}
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
          {notifications.length === 0 ? (
            <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, bgcolor: 'background.paper', border: '1px dashed #cbd5e1' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                You're all caught up!
              </Typography>
              <Typography variant="body2" color="text.disabled">
                No new notifications found in this category.
              </Typography>
            </Paper>
          ) : (
            notifications.map(notif => (
              <NotificationCard 
                key={notif.ID} 
                notification={notif} 
                isViewed={viewedIds.includes(notif.ID)}
                onClick={markAsViewed}
              />
            ))
          )}
          
          {notifications.length > 0 && (
            <Box display="flex" justifyContent="center" gap={2} mt={5}>
              <Button 
                variant="outlined" 
                disabled={page === 1} 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                sx={{ minWidth: 120 }}
              >
                Previous
              </Button>
              <Button 
                variant="contained" 
                disableElevation
                onClick={() => setPage(p => p + 1)}
                disabled={notifications.length < 20}
                sx={{ minWidth: 120 }}
              >
                Next Page
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
};

export default AllNotifications;
