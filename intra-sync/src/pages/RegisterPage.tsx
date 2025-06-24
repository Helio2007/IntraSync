import { Container, Typography, TextField, Button, Box, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/auth/register', { name, email, password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 1, sm: 0 } }}>
      <Card elevation={4} sx={{ width: { xs: '100%', sm: 400 }, borderRadius: 4, p: { xs: 1.5, sm: 2 }, bgcolor: 'background.paper' }}>
        <CardContent>
          <Typography variant={{ xs: 'h5', sm: 'h4' }} align="center" fontWeight={700} gutterBottom sx={{ mb: 3, color: 'primary.main', fontSize: { xs: 28, sm: 34 } }}>
            IntraSync Register
          </Typography>
          <Typography align="center" color="text.secondary" sx={{ mb: 4, fontSize: { xs: 15, sm: 16 } }}>
            Create your account to get started.
          </Typography>
          <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {error && <Typography color="error" align="center">{error}</Typography>}
            <TextField
              label="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              size="large"
              autoFocus
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              size="large"
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
              Register
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default RegisterPage; 