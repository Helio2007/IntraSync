import { useEffect, useState } from 'react';
import { Box, Button, Typography, Paper, CircularProgress, Tooltip, Divider } from '@mui/material';
import { useCheckInStatus } from '../context/CheckInStatusContext';
import axios from 'axios';

const FloatingCheckInBox = () => {
  const { checkedIn, checkInTime, checkOutTime, refreshStatus } = useCheckInStatus();
  const [error, setError] = useState('');
  const [timer, setTimer] = useState('');

  // Live timer for how long user has been checked in
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (checkedIn && checkInTime) {
      const updateTimer = () => {
        const diff = Date.now() - new Date(checkInTime).getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimer(`${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setTimer('');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [checkedIn, checkInTime]);

  // Poll for status every 10 seconds for robustness
  useEffect(() => {
    const interval = setInterval(() => {
      refreshStatus();
    }, 10000);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  return (
    <Box sx={{
      position: 'fixed',
      bottom: { xs: 16, sm: 24 },
      right: { xs: 16, sm: 24 },
      width: { xs: '85vw', sm: 'auto' },
      maxWidth: { xs: 260, sm: 340 },
      zIndex: 1300,
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      pointerEvents: 'none',
    }}>
      <Paper elevation={8} sx={{
        p: { xs: 1.5, sm: 3 },
        width: '100%',
        borderRadius: 4,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        boxShadow: 6,
        pointerEvents: 'auto',
      }}>
        <Typography variant="subtitle1" fontWeight={700} color="primary.main" sx={{ fontSize: { xs: 15, sm: 18 } }}>
          Check-In/Out
        </Typography>
        <Divider sx={{ width: '100%', my: 1 }} />
        {checkedIn ? (
          <>
            <Typography color="success.main" sx={{ fontSize: { xs: 12, sm: 15 }, textAlign: 'center' }}>You are checked in</Typography>
            {checkInTime && <Typography variant="caption" sx={{ fontSize: { xs: 11, sm: 13 } }}>Since: {new Date(checkInTime).toLocaleTimeString()}</Typography>}
            {timer && <Typography color="primary" sx={{ mt: 1, fontSize: { xs: 12, sm: 15 } }}>Worked: {timer}</Typography>}
            <Tooltip title="Use QR page to check out" placement="top">
              <span>
                <Button variant="contained" color="secondary" disabled sx={{ mt: 2, borderRadius: 2, fontSize: { xs: 12, sm: 15 }, py: { xs: 0.8, sm: 1.2 } }} fullWidth>
                  Check Out
                </Button>
              </span>
            </Tooltip>
          </>
        ) : (
          <>
            <Typography color="text.secondary" sx={{ fontSize: { xs: 12, sm: 15 }, textAlign: 'center' }}>You are checked out</Typography>
            {checkOutTime && <Typography variant="caption" sx={{ fontSize: { xs: 11, sm: 13 } }}>Last out: {new Date(checkOutTime).toLocaleTimeString()}</Typography>}
            <Tooltip title="Use QR page to check in" placement="top">
              <span>
                <Button variant="contained" color="primary" disabled sx={{ mt: 2, borderRadius: 2, fontSize: { xs: 12, sm: 15 }, py: { xs: 0.8, sm: 1.2 } }} fullWidth>
                  Check In
                </Button>
              </span>
            </Tooltip>
          </>
        )}
        {error && <Typography color="error" variant="caption" align="center">{error}</Typography>}
      </Paper>
    </Box>
  );
};

export default FloatingCheckInBox; 