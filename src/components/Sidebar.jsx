import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  SmartToy as AgentIcon,
  People as PeopleIcon,
  CalendarMonth as CalendarIcon,
  History as HistoryIcon,
  MedicalServices as StethoscopeIcon,
  Settings as SettingsIcon,
  Assessment as AnalyticsIcon,
  EventAvailable as AvailabilityIcon,
  Assignment as NotesIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 260;

export default function Sidebar({ mobileOpen, handleDrawerToggle }) {
  const { role, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getMenuItems = () => {
    if (role === 'admin') {
      return [
        { label: 'Admin Analytics', path: '/admin', icon: <AnalyticsIcon /> },
        { label: 'Manage Doctors', path: '/doctors', icon: <StethoscopeIcon /> },
        { label: 'All Appointments', path: '/history', icon: <CalendarIcon /> },
        { label: 'AI Agent Consultation', path: '/consult', icon: <AgentIcon /> },
        { label: 'System Settings', path: '/profile', icon: <SettingsIcon /> },
      ];
    }
    if (role === 'doctor') {
      return [
        { label: 'Doctor Dashboard', path: '/doctor', icon: <DashboardIcon /> },
        { label: 'My Appointments', path: '/history', icon: <CalendarIcon /> },
        { label: 'Set Availability', path: '/doctor/availability', icon: <AvailabilityIcon /> },
        { label: 'Doctor Directory', path: '/doctors', icon: <StethoscopeIcon /> },
        { label: 'Profile & Clinic', path: '/profile', icon: <PersonIcon /> },
      ];
    }
    // Patient default
    return [
      { label: 'Patient Dashboard', path: '/patient', icon: <DashboardIcon /> },
      { label: 'AI Symptom Agent', path: '/consult', icon: <AgentIcon />, badge: 'Smart' },
      { label: 'Find & Book Doctors', path: '/doctors', icon: <StethoscopeIcon /> },
      { label: 'Appointment History', path: '/history', icon: <HistoryIcon /> },
      { label: 'Profile & Health', path: '/profile', icon: <PersonIcon /> },
    ];
  };

  const menuItems = getMenuItems();

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      {/* User profile summary in sidebar */}
      <Box sx={{ p: 2.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
          {role?.toUpperCase()} PORTAL
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.full_name || 'Healthcare User'}
        </Typography>
        <Chip
          label={role === 'doctor' ? (user?.doctor?.specialization_name || 'Specialist') : role}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mt: 0.5, fontSize: '0.75rem', fontWeight: 600 }}
        />
      </Box>

      {/* Nav List */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => {
                  navigate(item.path);
                  if (handleDrawerToggle) handleDrawerToggle();
                }}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  color: isSelected ? 'primary.main' : 'text.primary',
                  bgcolor: isSelected ? 'rgba(14, 165, 233, 0.08) !important' : 'transparent',
                  fontWeight: isSelected ? 700 : 500,
                  '&:hover': {
                    bgcolor: 'rgba(14, 165, 233, 0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isSelected ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isSelected ? 700 : 500,
                  }}
                />
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    color="secondary"
                    sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />
      {/* AI Assistant Badge footer */}
      <Box sx={{ p: 2, m: 1.5, borderRadius: 2, bgcolor: 'rgba(20, 184, 166, 0.08)', border: '1px solid rgba(20, 184, 166, 0.2)' }}>
        <Typography variant="subtitle2" sx={{ color: 'secondary.main', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AgentIcon fontSize="small" /> Decision Engine Active
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
          4-factor weighted scoring active for doctor matching.
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: 1, borderColor: 'divider' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Persistent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: 1, borderColor: 'divider', position: 'relative', height: 'calc(100vh - 64px)' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
