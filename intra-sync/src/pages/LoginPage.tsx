import { Container, Typography, TextField, Button, Box, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import logoBlack from '../assets/intrasync-logo-black.png';
import logoWhite from '../assets/intrasync-logo-white.png';

const LoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 1, sm: 0 }, mt: { xs: 2, sm: 6 }, mx: 'auto', maxWidth: 420 }}>
      <Card elevation={4} sx={{ width: { xs: '100%', sm: 400 }, borderRadius: 4, p: { xs: 1.5, sm: 2 }, bgcolor: 'background.paper' }}>
        <CardContent>
          <Typography variant={{ xs: 'h5', sm: 'h4' }} align="center" fontWeight={700} gutterBottom sx={{ mb: 3, color: theme.palette.primary.main, fontSize: { xs: 28, sm: 34 } }}>
            <img src={theme.palette.mode === 'dark' ? logoWhite : logoBlack} alt="intrasync" style={{ height: 48, marginBottom: 8 }} />
          </Typography>
          <Typography align="center" color="text.secondary" sx={{ mb: 4, fontSize: { xs: 15, sm: 16 } }}>
            Mirësevini! Ju lutem identifikohuni për të vazhduar.
          </Typography>
          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {error && <Typography color="error" align="center">{error}</Typography>}
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              size="large"
              autoFocus
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              size="large"
            />
            <Button type="submit" variant="contained" color="primary" size="large" sx={{ fontWeight: 600, borderRadius: 3, mt: 2, bgcolor: theme.palette.primary.main, ':hover': { bgcolor: theme.palette.secondary.main } }} fullWidth>
              LOGIN
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default LoginPage; 