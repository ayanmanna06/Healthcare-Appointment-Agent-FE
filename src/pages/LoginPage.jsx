import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  Stack,
  Chip,
} from '@mui/material';
import {
  LockOutlined as LockIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  LocalHospital as DoctorIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'doctor') navigate('/doctor');
      else navigate('/patient');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1.5,
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
            }}
          >
            <LockIcon />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Sign in to access your Healthcare AI portal
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Demo Quick-Fill Buttons */}
        <Box sx={{ p: 2, mb: 3, bgcolor: 'background.default', borderRadius: 2, border: 1, borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
            ONE-CLICK DEMO LOGIN:
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<PersonIcon />}
              onClick={() => handleQuickLogin('patient@example.com', 'password123')}
              sx={{ fontWeight: 600, flex: 1, fontSize: '0.75rem' }}
            >
              Patient
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              startIcon={<DoctorIcon />}
              onClick={() => handleQuickLogin('doctor.sarah@healthagent.ai', 'doctor123')}
              sx={{ fontWeight: 600, flex: 1, fontSize: '0.75rem' }}
            >
              Doctor
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<AdminIcon />}
              onClick={() => handleQuickLogin('admin@healthagent.ai', 'admin123')}
              sx={{ fontWeight: 600, flex: 1, fontSize: '0.75rem' }}
            >
              Admin
            </Button>
          </Stack>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            autoComplete="email"
          />
          <TextField
            fullWidth
            required
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            autoComplete="current-password"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.3, fontWeight: 700 }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#0EA5E9', fontWeight: 700, textDecoration: 'none' }}>
              Create an account
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
