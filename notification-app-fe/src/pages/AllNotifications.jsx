import React, { useState, useEffect } from 'react';
import { Container, Typography, Select, MenuItem, FormControl, InputLabel, Box, Button, CircularProgress } from '@mui/material';
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

  return (
    <Container maxWidth="md">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">All Notifications</Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type Filter</InputLabel>
          <Select value={filterType} label="Type Filter" onChange={handleFilterChange}>
            <MenuItem value="All">All Types</MenuItem>
            <MenuItem value="Placement">Placement</MenuItem>
            <MenuItem value="Result">Result</MenuItem>
            <MenuItem value="Event">Event</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}><CircularProgress /></Box>
      ) : (
        <>
          {notifications.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" my={5}>No notifications found.</Typography>
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
          
          <Box display="flex" justifyContent="center" gap={2} mt={4} mb={4}>
            <Button 
              variant="outlined" 
              disabled={page === 1} 
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous Page
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => setPage(p => p + 1)}
              disabled={notifications.length < 20} // basic next page disable logic
            >
              Next Page
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default AllNotifications;
