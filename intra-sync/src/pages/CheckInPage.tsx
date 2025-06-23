import { useState } from 'react';
import { Container, Typography, Button, Box, Alert, Card, CardContent, Fade } from '@mui/material';
import QRScanner from '../components/QRScanner';

const CheckInPage = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);

  const handleError = (err: any) => {
    // opsionale: mund të shtosh një alert për error
    // console.error(err);
  };

  const handleCheckIn = () => {
    setCheckedIn(true);
    // Këtu do të dërgohet info në backend për check-in/check-out
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 1, sm: 0 } }}>
      <Card elevation={4} sx={{ width: { xs: '100%', sm: 400 }, borderRadius: 4, p: { xs: 1.5, sm: 2 }, bgcolor: 'background.paper' }}>
        <CardContent>
          <Typography variant={{ xs: 'h5', sm: 'h4' }} align="center" fontWeight={700} gutterBottom sx={{ mb: 3, color: 'primary.main', fontSize: { xs: 28, sm: 34 } }}>
            Check-In / Check-Out
          </Typography>
          <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            {!scanResult && !checkedIn && (
              <Fade in timeout={500}>
                <Box>
                  <QRScanner onScan={setScanResult} onError={handleError} />
                </Box>
              </Fade>
            )}
            {scanResult && !checkedIn && (
              <Alert severity="info" sx={{ mb: 2, width: '100%' }}>QR Code: {scanResult}</Alert>
            )}
            {scanResult && !checkedIn && (
              <Button variant="contained" color="success" size="large" fullWidth sx={{ fontWeight: 600, borderRadius: 3 }} onClick={handleCheckIn}>
                Konfirmo Check-In/Check-Out
              </Button>
            )}
            {checkedIn && (
              <Alert severity="success" sx={{ width: '100%' }}>Check-In/Check-Out u regjistrua me sukses!</Alert>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CheckInPage; 