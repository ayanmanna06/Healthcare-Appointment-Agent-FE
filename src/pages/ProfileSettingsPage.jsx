import React, { useState } from 'react';
import {
  Box,
  Container,
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
} from '@mui/material';
import {
  Person as PersonIcon,
  DarkMode as DarkIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { authAPI } from '../api/client';
import Sidebar from '../components/Sidebar';

export default function ProfileSettingsPage() {
  const { user, role, refreshUser } = useAuth();
  const { mode, toggleColorMode } = useAppTheme();

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    // Patient
    gender: user?.patient?.gender || '',
    blood_group: user?.patient?.blood_group || '',
    address: user?.patient?.address || '',
    emergency_contact: user?.patient?.emergency_contact || '',
    medical_history: user?.patient?.medical_history || '',
    // Doctor
    qualification: user?.doctor?.qualification || '',
    consultation_fee: user?.doctor?.consultation_fee || 50,
    bio: user?.doctor?.bio || '',
    room_number: user?.doctor?.room_number || '',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await authAPI.updateProfile({
        ...formData,
        consultation_fee: Number(formData.consultation_fee),
      });

      if (res.data.success) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        refreshUser();
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to update profile.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: 'background.default' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Account Settings & Health Profile
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Update your personal details, clinical profile, and interface preferences.
          </Typography>
        </Box>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

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
                color={role === 'admin' ? 'error' : role === 'doctor' ? 'secondary' : 'primary'}
                size="small"
                sx={{ fontWeight: 700 }}
              />

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

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </Grid>

                  {role === 'patient' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Blood Group"
                          name="blood_group"
                          value={formData.blood_group}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Residential Address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Emergency Contact"
                          name="emergency_contact"
                          value={formData.emergency_contact}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label="Known Allergies & Clinical History"
                          name="medical_history"
                          value={formData.medical_history}
                          onChange={handleChange}
                        />
                      </Grid>
                    </>
                  )}

                  {role === 'doctor' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Qualification"
                          name="qualification"
                          value={formData.qualification}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Consultation Fee ($)"
                          name="consultation_fee"
                          value={formData.consultation_fee}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Clinic Room / Suite"
                          name="room_number"
                          value={formData.room_number}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Practitioner Biography"
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={saving}
                  sx={{ mt: 3, fontWeight: 700, px: 3 }}
                >
                  {saving ? 'Saving Changes...' : 'Save Profile Changes'}
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
