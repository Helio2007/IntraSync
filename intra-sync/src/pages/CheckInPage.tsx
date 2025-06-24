import { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import QRScanner from '../components/QRScanner';
import axios from 'axios';
import { useCheckInStatus } from '../context/CheckInStatusContext';

const COOLDOWN_SECONDS = 5;

const CheckInPage = () => {
  const { checkedIn, checkInTime, checkOutTime, setStatus, refreshStatus } = useCheckInStatus();
  const [error, setError] = useState('');
  const [qrResult, setQrResult] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    refreshStatus();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleScan = async (result: string) => {
    if (cooldown > 0) return;
    setQrResult(result);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not logged in');
      if (checkedIn) {
        const res = await axios.post('/api/checkin/out', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStatus({ checkedIn: false, checkInTime, checkOutTime: res.data.checkOutTime });
      } else {
        const res = await axios.post('/api/checkin/in', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStatus({ checkedIn: true, checkInTime: res.data.checkInTime, checkOutTime: null });
      }
      setCooldown(COOLDOWN_SECONDS);
      refreshStatus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'QR check-in/out failed');
      refreshStatus();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
      <Paper elevation={4} sx={{ p: 3, borderRadius: 4, maxWidth: 400, width: '100%', mb: 3 }}>
        <Typography variant="h5" fontWeight={700} align="center" color="primary.main" gutterBottom>
          QR Check-In/Out
        </Typography>
        <Typography align="center" color="text.secondary" sx={{ mb: 2 }}>
          Scan the QR code below to {checkedIn ? 'check out' : 'check in'}.
        </Typography>
        {cooldown > 0 ? (
          <Alert severity="info" sx={{ mb: 2, textAlign: 'center' }}>
            Please wait {cooldown} second{cooldown !== 1 ? 's' : ''} before scanning again.
          </Alert>
        ) : (
          <QRScanner onScan={handleScan} />
        )}
        {checkedIn && checkInTime && (
          <Typography align="center" color="success.main" sx={{ mt: 2 }}>
            You are checked in since {new Date(checkInTime).toLocaleTimeString()}.
          </Typography>
        )}
        {!checkedIn && checkOutTime && (
          <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
            Last checked out at {new Date(checkOutTime).toLocaleTimeString()}.
          </Typography>
        )}
        {qrResult && <Typography align="center" color="primary" sx={{ mt: 2 }}>QR Result: {qrResult}</Typography>}
        {error && <Typography color="error" align="center" sx={{ mt: 2 }}>{error}</Typography>}
      </Paper>
    </Box>
  );
};

export default CheckInPage; 