import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

const NotificationCard = ({ notification, isViewed, onClick }) => {
  const { ID, Type, Message, Timestamp } = notification;

  const getTypeColor = (type) => {
    switch (type) {
      case 'Placement': return 'success';
      case 'Result': return 'info';
      case 'Event': return 'warning';
      default: return 'default';
    }
  };

  // Convert "2026-04-22 17:50:42" to valid Date object
  // Safari/some browsers might need replacing '-' with '/' or parsing properly, 
  // but for local testing `new Date` should work if format is standard.
  const dateObj = new Date(Timestamp.replace(' ', 'T'));
  const timeAgo = isNaN(dateObj.getTime()) ? Timestamp : formatDistanceToNow(dateObj, { addSuffix: true });

  return (
    <Card 
      onClick={() => onClick(ID)}
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        bgcolor: isViewed ? 'background.default' : '#f0f7ff',
        borderLeft: isViewed ? '4px solid transparent' : '4px solid #1976d2',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 3
        }
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Chip label={Type} color={getTypeColor(Type)} size="small" />
          <Typography variant="caption" color="text.secondary">
            {timeAgo}
          </Typography>
        </Box>
        <Typography variant="body1" fontWeight={isViewed ? 'normal' : 'bold'}>
          {Message}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
