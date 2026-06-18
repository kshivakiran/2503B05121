import React from 'react';
import { Card, CardContent, Typography, Box, Chip, alpha } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EventIcon from '@mui/icons-material/Event';

const NotificationCard = ({ notification, isViewed, onClick }) => {
  const { ID, Type, Message, Timestamp } = notification;

  const getTypeConfig = (type) => {
    switch (type) {
      case 'Placement': return { color: 'success', icon: <BusinessCenterIcon fontSize="small" /> };
      case 'Result': return { color: 'info', icon: <AssessmentIcon fontSize="small" /> };
      case 'Event': return { color: 'warning', icon: <EventIcon fontSize="small" /> };
      default: return { color: 'default', icon: null };
    }
  };

  const config = getTypeConfig(Type);

  const dateObj = new Date(Timestamp.replace(' ', 'T'));
  const timeAgo = isNaN(dateObj.getTime()) ? Timestamp : formatDistanceToNow(dateObj, { addSuffix: true });

  return (
    <Card 
      onClick={() => onClick(ID)}
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        bgcolor: isViewed ? 'background.paper' : alpha('#4338ca', 0.04),
        borderLeft: isViewed ? '4px solid transparent' : '4px solid #4338ca',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          borderColor: isViewed ? '#cbd5e1' : '#4338ca'
        }
      }}
    >
      {!isViewed && (
        <Box 
          sx={{
            position: 'absolute',
            top: -6,
            right: -6,
            width: 12,
            height: 12,
            bgcolor: '#ef4444',
            borderRadius: '50%',
            border: '2px solid white'
          }}
        />
      )}
      <CardContent sx={{ pb: '16px !important' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Chip 
            icon={config.icon} 
            label={Type} 
            color={config.color} 
            size="small" 
            sx={{ 
              fontWeight: 600, 
              borderRadius: '6px',
              bgcolor: (theme) => theme.palette[config.color].light,
              color: (theme) => theme.palette[config.color].dark,
              '& .MuiChip-icon': { color: 'inherit' }
            }} 
          />
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {timeAgo}
          </Typography>
        </Box>
        <Typography 
          variant="body1" 
          fontWeight={isViewed ? 400 : 600}
          color={isViewed ? 'text.secondary' : 'text.primary'}
          sx={{ lineHeight: 1.5 }}
        >
          {Message}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
