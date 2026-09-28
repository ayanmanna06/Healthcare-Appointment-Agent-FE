import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  LocalHospital as HospitalIcon,
  AccountCircle as AccountIcon,
  SmartToy as AgentIcon,
  CalendarMonth as CalendarIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, isAuthenticated, logout, role } = useAuth();
  const { mode, toggleColorMode } = useAppTheme();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin';
    if (role === 'doctor') return '/doctor';
    return '/patient';
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', color: 'text.primary' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => navigate(isAuthenticated ? getDashboardPath() : '/')}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'white',
              mr: 1.5,
              boxShadow: '0 4px 10px rgba(14, 165, 233, 0.35)',
            }}
          >
            <HospitalIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1, fontFamily: "'Outfit', sans-serif" }}>
              Health<span style={{ color: '#0EA5E9' }}>Agent</span>
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.5 }}>
              AI APPOINTMENT SYSTEM
            </Typography>
          </Box>
        </Box>

        {/* Right action controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Theme Mode Toggle */}
          <Tooltip title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}>
            <IconButton onClick={toggleColorMode} color="inherit" size="small" sx={{ p: 1, border: 1, borderColor: 'divider' }}>
              {mode === 'dark' ? <LightIcon fontSize="small" sx={{ color: '#FBBF24' }} /> : <DarkIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {isAuthenticated ? (
            <>
              <Chip
                label={role?.toUpperCase()}
                size="small"
                color={role === 'admin' ? 'error' : role === 'doctor' ? 'secondary' : 'primary'}
                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
              />
              <IconButton onClick={handleMenu} size="small" sx={{ p: 0.5, border: 2, borderColor: 'primary.main' }}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.light', fontSize: '0.9rem', fontWeight: 700 }}>
                  {user?.full_name ? user.full_name[0] : 'U'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: { mt: 1, minWidth: 200, borderRadius: 2, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
                }}
              >
                <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {user?.full_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {user?.email}
                  </Typography>
                </Box>
                <MenuItem onClick={() => { handleClose(); navigate(getDashboardPath()); }}>
                  <CalendarIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} /> Dashboard
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                  <AccountIcon fontSize="small" sx={{ mr: 1.5, color: 'secondary.main' }} /> Profile & Settings
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} /> Sign Out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button component={Link} to="/login" variant="text" color="inherit" sx={{ fontWeight: 600 }}>
                Sign In
              </Button>
              <Button component={Link} to="/register" variant="contained" color="primary" sx={{ fontWeight: 600 }}>
                Get Started
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
