import { Container, Typography, TextField, Button, Box, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login, në të ardhmen do lidhet me backend
    if (email && password) {
      navigate('/dashboard');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 1, sm: 0 } }}>
      <Card elevation={4} sx={{ width: { xs: '100%', sm: 400 }, borderRadius: 4, p: { xs: 1.5, sm: 2 }, bgcolor: 'background.paper' }}>
        <CardContent>
          <Typography variant={{ xs: 'h5', sm: 'h4' }} align="center" fontWeight={700} gutterBottom sx={{ mb: 3, color: 'primary.main', fontSize: { xs: 28, sm: 34 } }}>
            IntraSync
          </Typography>
          <Typography align="center" color="text.secondary" sx={{ mb: 4, fontSize: { xs: 15, sm: 16 } }}>
            Mirësevini! Ju lutem identifikohuni për të vazhduar.
          </Typography>
          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
            <Button type="submit" variant="contained" color="primary" size="large" sx={{ fontWeight: 600, borderRadius: 3, mt: 2 }} fullWidth>
              Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default LoginPage; 