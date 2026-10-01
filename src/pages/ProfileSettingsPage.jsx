import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  Avatar,
  Chip,
  MenuItem,
  Tabs,
  Tab,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  DarkMode as DarkIcon,
  Save as SaveIcon,
  MedicalServices as StethoscopeIcon,
  Tune as TuneIcon,
  Psychology as AIIcon,
  Notifications as NotifIcon,
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { authAPI, patientAPI, adminAPI } from '../api/client';
import Sidebar from '../components/Sidebar';

export default function ProfileSettingsPage() {
  const { user, role, refreshUser } = useAuth();
  const { mode, toggleColorMode } = useAppTheme();

  const isAdmin = role === 'admin';

  // Admin Active Tab: 0 = Practice Policies, 1 = AI Decision Engine, 2 = Notifications & Theme, 3 = Security & Profile
  const [adminTab, setAdminTab] = useState(0);

  // Common Profile State
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    // Patient specific
    gender: user?.patient?.gender || '',
    blood_group: user?.patient?.blood_group || '',
    address: user?.patient?.address || '',
    emergency_contact: user?.patient?.emergency_contact || '',
    medical_history: user?.patient?.medical_history || '',
    // Doctor specific
    specialization_id: user?.doctor?.specialization_id || 1,
    qualification: user?.doctor?.qualification || '',
    consultation_fee: user?.doctor?.consultation_fee || 75,
    bio: user?.doctor?.bio || '',
    room_number: user?.doctor?.room_number || '',
    // Password change
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Admin System Settings State
  const [systemSettings, setSystemSettings] = useState({
    practice_name: 'HealthAgent Specialist Medical Network',
    support_helpline: '+1-800-555-0199',
    support_email: 'support@healthagent.ai',
    default_slot_duration: 30,
    max_advance_booking_days: 14,
    cancellation_grace_hours: 2,
    ai_auto_booking: true,
    ai_confidence_threshold: 75,
    emergency_flagging: true,
    email_notifications: true,
    sms_notifications: false,
  });

  const [specializations, setSpecializations] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        full_name: user.full_name || prev.full_name,
        phone: user.phone || prev.phone,
        specialization_id: user.doctor?.specialization_id || prev.specialization_id,
        qualification: user.doctor?.qualification || prev.qualification,
        consultation_fee: user.doctor?.consultation_fee ?? prev.consultation_fee,
        bio: user.doctor?.bio || prev.bio,
        room_number: user.doctor?.room_number || prev.room_number,
      }));
    }

    if (isAdmin) {
      adminAPI
        .getSettings()
        .then((res) => {
          if (res.data?.success && res.data.settings) {
            setSystemSettings(res.data.settings);
          }
        })
        .catch((err) => console.error('Failed to load system settings:', err));
    } else {
      patientAPI
        .getSpecializations()
        .then((res) => {
          if (res.data?.success && res.data.specializations?.length) {
            setSpecializations(res.data.specializations);
          }
        })
        .catch((err) => console.error('Failed to load specializations:', err));
    }
  }, [user, isAdmin]);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleSettingsChange = (field, value) => {
    setSystemSettings({ ...systemSettings, [field]: value });
  };

  // Save Admin System Settings
  const handleSaveSystemSettings = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await adminAPI.updateSettings(systemSettings);
      if (res.data.success) {
        setMessage({ text: 'System settings successfully updated and applied.', type: 'success' });
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.error || 'Failed to save system settings.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  // Save User Profile & Password
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (profileForm.new_password && profileForm.new_password !== profileForm.confirm_password) {
      setMessage({ text: 'New password and confirm password do not match.', type: 'error' });
      return;
    }
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const payload = {
        full_name: profileForm.full_name,
        phone: profileForm.phone,
      };

      if (profileForm.new_password) {
        payload.current_password = profileForm.current_password;
        payload.new_password = profileForm.new_password;
      }

      if (role === 'doctor') {
        payload.specialization_id = Number(profileForm.specialization_id);
        payload.qualification = profileForm.qualification;
        payload.consultation_fee = Number(profileForm.consultation_fee);
        payload.bio = profileForm.bio;
        payload.room_number = profileForm.room_number;
      } else if (role === 'patient') {
        payload.gender = profileForm.gender;
        payload.blood_group = profileForm.blood_group;
        payload.address = profileForm.address;
        payload.emergency_contact = profileForm.emergency_contact;
        payload.medical_history = profileForm.medical_history;
      }

      const res = await authAPI.updateProfile(payload);

      if (res.data.success) {
        setMessage({
          text: profileForm.new_password
            ? 'Profile and security credentials updated successfully!'
            : 'Profile updated successfully!',
          type: 'success',
        });
        setProfileForm((prev) => ({
          ...prev,
          current_password: '',
          new_password: '',
          confirm_password: '',
        }));
        refreshUser();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.error || 'Failed to update profile details.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          minHeight: 'calc(100vh - 64px)',
          bgcolor: 'background.default',
          overflowX: 'hidden',
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 3.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
            {isAdmin ? 'System & Administrative Settings' : 'Account Settings & Health Profile'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {isAdmin
              ? 'Configure clinical practice policies, AI decision engine parameters, notification rules, and admin credentials.'
              : 'Update your personal details, clinical profile, and interface preferences.'}
          </Typography>
        </Box>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        {isAdmin ? (
          /* ================= ADMIN VIEW: 4 TABS ================= */
          <Box>
            <Paper sx={{ mb: 3.5, borderRadius: 2.5, border: 1, borderColor: 'divider' }}>
              <Tabs
                value={adminTab}
                onChange={(e, val) => {
                  setAdminTab(val);
                  setMessage({ text: '', type: '' });
                }}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  px: 2,
                  '& .MuiTab-root': {
                    py: 1.8,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                  },
                }}
              >
                <Tab icon={<TuneIcon />} iconPosition="start" label="Clinical Practice & Scheduling Policies" />
                <Tab icon={<AIIcon />} iconPosition="start" label="AI Decision Engine & Automation" />
                <Tab icon={<NotifIcon />} iconPosition="start" label="Notifications & Interface" />
                <Tab icon={<SecurityIcon />} iconPosition="start" label="Admin Profile & Security" />
              </Tabs>
            </Paper>

            {/* TAB 0: Clinical Practice & Scheduling Policies */}
            {adminTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3.5, borderRadius: 3, border: 1, borderColor: 'divider' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TuneIcon sx={{ color: 'primary.main' }} /> Clinical Practice & Booking Policies
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                      Set standard slot durations, booking lead times, and practice operational parameters.
                    </Typography>

                    <Grid container spacing={2.5}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Practice / Organization Display Name"
                          value={systemSettings.practice_name}
                          onChange={(e) => handleSettingsChange('practice_name', e.target.value)}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Default Consultation Slot Duration"
                          value={systemSettings.default_slot_duration}
                          onChange={(e) => handleSettingsChange('default_slot_duration', Number(e.target.value))}
                        >
                          <MenuItem value={15}>15 Minutes (Express Consult)</MenuItem>
                          <MenuItem value={30}>30 Minutes (Standard Medical Practice)</MenuItem>
                          <MenuItem value={45}>45 Minutes (Extended Review)</MenuItem>
                          <MenuItem value={60}>60 Minutes (Comprehensive Evaluation)</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Max Advance Booking Window"
                          value={systemSettings.max_advance_booking_days}
                          onChange={(e) => handleSettingsChange('max_advance_booking_days', Number(e.target.value))}
                        >
                          <MenuItem value={7}>7 Days Ahead</MenuItem>
                          <MenuItem value={14}>14 Days Ahead (Recommended)</MenuItem>
                          <MenuItem value={30}>30 Days Ahead</MenuItem>
                          <MenuItem value={60}>60 Days Ahead</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Cancellation Grace Period"
                          value={systemSettings.cancellation_grace_hours}
                          onChange={(e) => handleSettingsChange('cancellation_grace_hours', Number(e.target.value))}
                        >
                          <MenuItem value={1}>Up to 1 hour before appointment</MenuItem>
                          <MenuItem value={2}>Up to 2 hours before appointment (Standard)</MenuItem>
                          <MenuItem value={12}>Up to 12 hours before appointment</MenuItem>
                          <MenuItem value={24}>Up to 24 hours before appointment</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Dedicated Practice Helpline"
                          value={systemSettings.support_helpline}
                          onChange={(e) => handleSettingsChange('support_helpline', e.target.value)}
                          placeholder="+1-800-555-0199"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Patient Support & Query Email"
                          value={systemSettings.support_email}
                          onChange={(e) => handleSettingsChange('support_email', e.target.value)}
                          placeholder="support@healthagent.ai"
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 3.5, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        disabled={saving}
                        onClick={handleSaveSystemSettings}
                        sx={{ fontWeight: 800, px: 3.5, py: 1 }}
                      >
                        {saving ? <CircularProgress size={22} /> : 'Save Practice Policies'}
                      </Button>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: 'primary.main' }}>
                      Policy Overview
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                      These rules govern slot generation in physician calendars, patient cancellation windows, and official platform notifications.
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                          SLOT DURATION:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {systemSettings.default_slot_duration} Minutes per Session
                        </Typography>
                      </Box>
                      <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                          BOOKING WINDOW:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          Next {systemSettings.max_advance_booking_days} Days Open
                        </Typography>
                      </Box>
                      <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                          CANCELLATION POLICY:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {systemSettings.cancellation_grace_hours} Hours Prior Notice
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* TAB 1: AI Decision Engine & Automation */}
            {adminTab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3.5, borderRadius: 3, border: 1, borderColor: 'divider' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AIIcon sx={{ color: 'secondary.main' }} /> AI Decision Engine & Automation
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                      Configure the intelligence parameters that evaluate patient symptoms and match optimal specialists.
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      {/* Autonomous Booking Mode */}
                      <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default', border: 1, borderColor: 'divider' }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={systemSettings.ai_auto_booking}
                              onChange={(e) => handleSettingsChange('ai_auto_booking', e.target.checked)}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                Autonomous Booking Mode (Instant Confirmation)
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                When enabled, appointments with match confidence above the threshold are automatically confirmed without requiring manual physician pre-approval.
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>

                      {/* Confidence Threshold */}
                      <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default', border: 1, borderColor: 'divider' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                          Minimum AI Confidence Match Threshold
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                          The minimum algorithmic score required for the AI agent to recommend and auto-assign a specialist.
                        </Typography>
                        <TextField
                          select
                          size="small"
                          value={systemSettings.ai_confidence_threshold}
                          onChange={(e) => handleSettingsChange('ai_confidence_threshold', Number(e.target.value))}
                          sx={{ minWidth: 220 }}
                        >
                          <MenuItem value={60}>60% (Broad Specialist Matching)</MenuItem>
                          <MenuItem value={70}>70% (Standard Diagnostic Confidence)</MenuItem>
                          <MenuItem value={75}>75% (Recommended Balance)</MenuItem>
                          <MenuItem value={80}>80% (High Precision Matching)</MenuItem>
                          <MenuItem value={85}>85% (Strict Diagnostic Alignment)</MenuItem>
                        </TextField>
                      </Paper>

                      {/* Emergency Flagging */}
                      <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default', border: 1, borderColor: 'divider' }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={systemSettings.emergency_flagging}
                              onChange={(e) => handleSettingsChange('emergency_flagging', e.target.checked)}
                              color="error"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                Emergency Red-Flag Symptom Alerting
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Immediately marks appointments as urgent and displays immediate care advisories if symptoms indicate severe cardiovascular, neurological, or respiratory distress.
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>
                    </Box>

                    <Box sx={{ mt: 3.5, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        disabled={saving}
                        onClick={handleSaveSystemSettings}
                        sx={{ fontWeight: 800, px: 3.5, py: 1 }}
                      >
                        {saving ? <CircularProgress size={22} /> : 'Save AI Parameters'}
                      </Button>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'secondary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AIIcon fontSize="small" /> Decision Engine Weights
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                      The AI recommendation agent computes a multi-factor score for each specialist:
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.25)' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          CLINICAL SPECIALTY MATCH (40%)
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Semantic alignment between reported chief complaints and medical specialty domain.
                        </Typography>
                      </Box>
                      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(20, 184, 166, 0.08)', border: '1px solid rgba(20, 184, 166, 0.25)' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                          EARLIEST CALENDAR AVAILABILITY (30%)
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Prefers physicians with confirmed open consultation slots within the next 48 hours.
                        </Typography>
                      </Box>
                      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#10B981' }}>
                          EXPERIENCE & PATIENT RATING (30%)
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Weighted by verified clinical years in practice and average patient satisfaction rating.
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* TAB 2: Notifications & Interface */}
            {adminTab === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3.5, borderRadius: 3, border: 1, borderColor: 'divider' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <NotifIcon sx={{ color: 'primary.main' }} /> Notification & Interface Preferences
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                      Configure automated delivery channels and platform theme settings.
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default', border: 1, borderColor: 'divider' }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={systemSettings.email_notifications}
                              onChange={(e) => handleSettingsChange('email_notifications', e.target.checked)}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                Email Booking Confirmations & Reminders
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Send automated email notifications when an appointment is booked, rescheduled, or marked completed.
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>

                      <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default', border: 1, borderColor: 'divider' }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={systemSettings.sms_notifications}
                              onChange={(e) => handleSettingsChange('sms_notifications', e.target.checked)}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                SMS Alert Dispatch (Emergency Gateways)
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Send immediate SMS text messages for confirmed appointment reminders and queue changes.
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>

                      <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default', border: 1, borderColor: 'divider' }}>
                        <FormControlLabel
                          control={<Switch checked={mode === 'dark'} onChange={toggleColorMode} color="secondary" />}
                          label={
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                Platform Visual Theme: {mode === 'dark' ? 'Dark Mode (Active)' : 'Light Mode (Active)'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Toggle between curated clinical dark mode and bright daylight high-contrast palette.
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>
                    </Box>

                    <Box sx={{ mt: 3.5, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        disabled={saving}
                        onClick={handleSaveSystemSettings}
                        sx={{ fontWeight: 800, px: 3.5, py: 1 }}
                      >
                        {saving ? <CircularProgress size={22} /> : 'Save Notification Preferences'}
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* TAB 3: Admin Profile & Security */}
            {adminTab === 3 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider', textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        width: 72,
                        height: 72,
                        bgcolor: 'primary.main',
                        fontSize: '1.8rem',
                        fontWeight: 800,
                        mx: 'auto',
                        mb: 2,
                        boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
                      }}
                    >
                      {user?.full_name ? user.full_name[0] : 'A'}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {user?.full_name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                      {user?.email}
                    </Typography>
                    <Chip label="PRIMARY ADMINISTRATOR" color="error" size="small" sx={{ fontWeight: 800, fontSize: '0.68rem' }} />

                    <Divider sx={{ my: 2.5 }} />

                    <Box sx={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        SECURITY STATUS:
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CheckIcon fontSize="small" /> Two-Factor Access Authenticated
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Session encrypted via JWT token.
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3.5, borderRadius: 3, border: 1, borderColor: 'divider' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SecurityIcon sx={{ color: 'primary.main' }} /> Admin Credentials & Password
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                      Update administrative contact credentials and reset account login password.
                    </Typography>

                    <form onSubmit={handleSaveProfile}>
                      <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Administrator Full Name"
                            name="full_name"
                            value={profileForm.full_name}
                            onChange={handleProfileChange}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Official Contact Phone"
                            name="phone"
                            value={profileForm.phone}
                            onChange={handleProfileChange}
                            placeholder="+1-555-0100"
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Divider sx={{ my: 1.5 }}>
                            <Chip icon={<LockIcon />} label="CHANGE LOGIN PASSWORD" size="small" sx={{ fontWeight: 700 }} />
                          </Divider>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Current Password"
                            type="password"
                            name="current_password"
                            value={profileForm.current_password}
                            onChange={handleProfileChange}
                            placeholder="••••••••"
                          />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="New Password"
                            type="password"
                            name="new_password"
                            value={profileForm.new_password}
                            onChange={handleProfileChange}
                            placeholder="Min 6 characters"
                          />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Confirm New Password"
                            type="password"
                            name="confirm_password"
                            value={profileForm.confirm_password}
                            onChange={handleProfileChange}
                            placeholder="Re-type password"
                          />
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 3.5, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={<SaveIcon />}
                          disabled={saving}
                          sx={{ fontWeight: 800, px: 3.5, py: 1 }}
                        >
                          {saving ? <CircularProgress size={22} /> : 'Save Profile & Credentials'}
                        </Button>
                      </Box>
                    </form>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        ) : (
          /* ================= DOCTOR & PATIENT VIEW ================= */
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider', textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                    fontWeight: 700,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  {user?.full_name ? user.full_name[0] : 'U'}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {user?.full_name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  {user?.email}
                </Typography>
                <Chip
                  label={role?.toUpperCase()}
                  color={role === 'doctor' ? 'secondary' : 'primary'}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />

                {role === 'doctor' && (
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.8, alignItems: 'center' }}>
                    <Chip
                      icon={<StethoscopeIcon fontSize="small" />}
                      label={`Specialization: ${user?.doctor?.specialization_name || 'Specialist'}`}
                      color="secondary"
                      variant="outlined"
                      sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                    />
                    {user?.doctor?.qualification && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        {user.doctor.qualification}
                      </Typography>
                    )}
                    {user?.doctor?.room_number && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Suite: {user.doctor.room_number}
                      </Typography>
                    )}
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                    Interface Preferences:
                  </Typography>
                  <FormControlLabel
                    control={<Switch checked={mode === 'dark'} onChange={toggleColorMode} />}
                    label={`Dark Mode (${mode === 'dark' ? 'Enabled' : 'Disabled'})`}
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 4, borderRadius: 3, border: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Edit Profile Details
                </Typography>

                <form onSubmit={handleSaveProfile}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="full_name"
                        value={profileForm.full_name}
                        onChange={handleProfileChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                      />
                    </Grid>

                    {role === 'patient' && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Gender"
                            name="gender"
                            value={profileForm.gender}
                            onChange={handleProfileChange}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Blood Group"
                            name="blood_group"
                            value={profileForm.blood_group}
                            onChange={handleProfileChange}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Residential Address"
                            name="address"
                            value={profileForm.address}
                            onChange={handleProfileChange}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Emergency Contact"
                            name="emergency_contact"
                            value={profileForm.emergency_contact}
                            onChange={handleProfileChange}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Medical History / Allergies"
                            name="medical_history"
                            value={profileForm.medical_history}
                            onChange={handleProfileChange}
                          />
                        </Grid>
                      </>
                    )}

                    {role === 'doctor' && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            select
                            fullWidth
                            label="Specialization"
                            name="specialization_id"
                            value={profileForm.specialization_id}
                            onChange={handleProfileChange}
                          >
                            {specializations.map((spec) => (
                              <MenuItem key={spec.id} value={spec.id}>
                                {spec.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Qualification"
                            name="qualification"
                            value={profileForm.qualification}
                            onChange={handleProfileChange}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Consultation Fee ($)"
                            name="consultation_fee"
                            value={profileForm.consultation_fee}
                            onChange={handleProfileChange}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Clinical Suite / Room Number"
                            name="room_number"
                            value={profileForm.room_number}
                            onChange={handleProfileChange}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Professional Bio"
                            name="bio"
                            value={profileForm.bio}
                            onChange={handleProfileChange}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={saving}
                      startIcon={<SaveIcon />}
                      sx={{ fontWeight: 700, px: 3 }}
                    >
                      {saving ? <CircularProgress size={22} /> : 'Save Profile Changes'}
                    </Button>
                  </Box>
                </form>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
}
