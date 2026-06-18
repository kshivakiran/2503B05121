import React from 'react';
import { Card, CardContent, Typography, Box, Chip, alpha, Tooltip } from '@mui/material';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { formatDistanceToNow } from 'date-fns';

const TYPE_CONFIG = {
  Placement: {
    icon: <BusinessCenterRoundedIcon fontSize="small" />,
    chipColor: '#10b981',
    bgColor: '#ecfdf5',
    borderColor: '#6ee7b7',
    dotColor: '#10b981',
    label: 'Placement',
  },
  Result: {
    icon: <AssessmentRoundedIcon fontSize="small" />,
    chipColor: '#0ea5e9',
    bgColor: '#f0f9ff',
    borderColor: '#7dd3fc',
    dotColor: '#0ea5e9',
    label: 'Result',
  },
  Event: {
    icon: <CelebrationRoundedIcon fontSize="small" />,
    chipColor: '#f59e0b',
    bgColor: '#fffbeb',
    borderColor: '#fcd34d',
    dotColor: '#f59e0b',
    label: 'Event',
  },
};

const NotificationCard = ({ notification, isViewed, onClick }) => {
  const { ID, Type, Message, Timestamp } = notification;
  const config = TYPE_CONFIG[Type] || TYPE_CONFIG['Event'];

  const dateObj = new Date(Timestamp.replace(' ', 'T'));
  const timeAgo = isNaN(dateObj.getTime())
    ? Timestamp
    : formatDistanceToNow(dateObj, { addSuffix: true });

  return (
    <Tooltip title={isViewed ? 'Already read' : 'Click to mark as read'} placement="left" arrow>
      <Card
        onClick={() => onClick(ID)}
        sx={{
          mb: 2,
          cursor: 'pointer',
          borderRadius: '14px',
          border: '1px solid',
          borderColor: isViewed ? '#e2e8f0' : config.borderColor,
          bgcolor: isViewed ? '#ffffff' : config.bgColor,
          borderLeft: `5px solid ${isViewed ? '#cbd5e1' : config.chipColor}`,
          boxShadow: 'none',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: `0 12px 24px -8px ${alpha(config.chipColor, isViewed ? 0.1 : 0.25)}`,
            borderColor: config.chipColor,
          }
        }}
      >
        {/* Unread dot */}
        {!isViewed && (
          <FiberManualRecordIcon
            sx={{
              position: 'absolute',
              top: 14,
              right: 14,
              fontSize: 10,
              color: config.dotColor,
              filter: `drop-shadow(0 0 3px ${config.dotColor})`,
            }}
          />
        )}

        <CardContent sx={{ py: 2, px: 2.5, pb: '16px !important' }}>
          {/* Top row: Chip + Time */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5} pr={2}>
            <Chip
              icon={config.icon}
              label={config.label}
              size="small"
              sx={{
                bgcolor: alpha(config.chipColor, 0.12),
                color: config.chipColor,
                fontWeight: 700,
                borderRadius: '6px',
                fontSize: '0.73rem',
                px: 0.5,
                '& .MuiChip-icon': { color: config.chipColor, ml: '4px' },
              }}
            />
            <Box display="flex" alignItems="center" gap={0.5}>
              <AccessTimeIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.disabled" fontWeight={500}>
                {timeAgo}
              </Typography>
            </Box>
          </Box>

          {/* Message */}
          <Typography
            variant="body2"
            sx={{
              fontWeight: isViewed ? 400 : 600,
              color: isViewed ? 'text.secondary' : 'text.primary',
              lineHeight: 1.6,
              fontSize: '0.92rem',
            }}
          >
            {Message}
          </Typography>
        </CardContent>
      </Card>
    </Tooltip>
  );
};

export default NotificationCard;
