import { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, Alert, Card, CardContent, Fade, CircularProgress } from '@mui/material';
import QRScanner from '../components/QRScanner';
import { getEvents, addEvent } from '../services/eventService';

const MOCK_USER_ID = 'user123'; // Replace with real user ID when available

const CheckOutPage = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch latest check-in/out event to determine status
  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const events = await getEvents();
        // Find the latest check-in or check-out event for the mock user
        const userEvents = events.filter(e => e.type === 'checkin' || e.type === 'checkout');
        if (userEvents.length > 0) {
          const latest = userEvents[userEvents.length - 1];
          setCheckedIn(latest.type === 'checkin');
          setCheckedOut(latest.type === 'checkout');
        } else {
          setCheckedIn(false);
          setCheckedOut(false);
        }
      } catch (err) {
        setError('Nuk mund të merret statusi i check-out.');
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleError = (err: any) => {
    setError('Gabim gjatë skanimit.');
  };

  const handleCheckOut = async () => {
    setError(null);
    try {
      await addEvent({
        title: 'Check-Out',
        time: new Date().toISOString(),
        type: 'checkout',
        status: 'complete',
      });
      setCheckedIn(false);
      setCheckedOut(true);
      setScanResult(null);
    } catch (err) {
      setError('Gabim gjatë regjistrimit të check-out.');
    }
  };

  const handleRetry = () => {
    setScanResult(null);
    setError(null);
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 1, sm: 0 } }}>
      <Card elevation={4} sx={{ width: { xs: '100%', sm: 400 }, borderRadius: 4, p: { xs: 1.5, sm: 2 }, bgcolor: 'background.paper' }}>
        <CardContent>
          <Typography variant={{ xs: 'h5', sm: 'h4' }} align="center" fontWeight={700} gutterBottom sx={{ mb: 3, color: 'primary.main', fontSize: { xs: 28, sm: 34 } }}>
            Check-Out
          </Typography>
          <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            {loading && <CircularProgress />}
            {!loading && checkedOut && (
              <Alert severity="success" sx={{ width: '100%' }}>Jeni i checkuar jashtë!</Alert>
            )}
            {!loading && !checkedOut && checkedIn && !scanResult && !error && (
              <Fade in timeout={500}>
                <Box>
                  <QRScanner onScan={setScanResult} onError={handleError} />
                </Box>
              </Fade>
            )}
            {scanResult && !checkedOut && checkedIn && (
              <Alert severity="info" sx={{ mb: 2, width: '100%' }}>QR Code: {scanResult}</Alert>
            )}
            {scanResult && !checkedOut && checkedIn && (
              <Button variant="contained" color="success" size="large" fullWidth sx={{ fontWeight: 600, borderRadius: 3 }} onClick={handleCheckOut}>
                Konfirmo Check-Out
              </Button>
            )}
            {!checkedIn && !checkedOut && !loading && (
              <Alert severity="info" sx={{ width: '100%' }}>Nuk jeni i checkuar brenda. Fillimisht kryeni check-in.</Alert>
            )}
            {(error && !loading) && (
              <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
            )}
            {(!!scanResult || !!error) && !checkedOut && checkedIn && !loading && (
              <Button variant="outlined" color="primary" sx={{ mt: 2 }} onClick={handleRetry}>
                Provo përsëri
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CheckOutPage; 