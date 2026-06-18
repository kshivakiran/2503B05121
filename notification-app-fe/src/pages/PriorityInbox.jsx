import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material';
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
    // To generate a meaningful priority inbox, we fetch a larger chunk of notifications.
    // The API might return them paginated, so we fetch the first 3 pages (60 items)
    // to feed into our PriorityQueue.
    try {
      const promises = [1, 2, 3].map(page => fetchNotifications(page, 20));
      const results = await Promise.all(promises);
      const allFetched = results.flat();

      const pInbox = new PriorityQueue(topN);
      
      allFetched.forEach(notif => {
        // Apply filter before adding to queue if necessary
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

  return (
    <Container maxWidth="md">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h4" fontWeight="bold">Priority Inbox</Typography>
        
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ width: 100 }}>
            <InputLabel>Top N</InputLabel>
            <Select value={topN} label="Top N" onChange={(e) => setTopN(e.target.value)}>
              <MenuItem value={5}>Top 5</MenuItem>
              <MenuItem value={10}>Top 10</MenuItem>
              <MenuItem value={15}>Top 15</MenuItem>
              <MenuItem value={20}>Top 20</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type Filter</InputLabel>
            <Select value={filterType} label="Type Filter" onChange={(e) => setFilterType(e.target.value)}>
              <MenuItem value="All">All Types</MenuItem>
              <MenuItem value="Placement">Placement</MenuItem>
              <MenuItem value="Result">Result</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}><CircularProgress /></Box>
      ) : (
        <>
          {priorityNotifications.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" my={5}>No priority notifications found.</Typography>
          ) : (
            priorityNotifications.map(notif => (
              <NotificationCard 
                key={notif.ID} 
                notification={notif} 
                isViewed={viewedIds.includes(notif.ID)}
                onClick={markAsViewed}
              />
            ))
          )}
        </>
      )}
    </Container>
  );
};

export default PriorityInbox;
