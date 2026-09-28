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
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  MenuItem,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  HowToReg as RegisterIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    gender: 'Other',
    blood_group: 'O+',
    medical_history: '',
    qualification: 'MD, General Medicine',
    experience_years: 5,
    consultation_fee: 50.0,
    specialization_id: 1,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        role,
        experience_years: Number(formData.experience_years),
        consultation_fee: Number(formData.consultation_fee),
        specialization_id: Number(formData.specialization_id),
      };

      const user = await register(payload);
      if (user.role === 'doctor') navigate('/doctor');
      else navigate('/patient');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
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
              bgcolor: 'secondary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1.5,
              boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)',
            }}
          >
            <RegisterIcon />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Create Your Account
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Join the Healthcare AI Appointment Management System
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role selector */}
          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel component="legend" sx={{ fontWeight: 700, mb: 1 }}>
              Select Account Type:
            </FormLabel>
            <RadioGroup
              row
              value={role}
              onChange={(e) => setRole(e.target.value)}
              sx={{ gap: 2 }}
            >
              <Paper variant="outlined" sx={{ p: 1, px: 2, borderRadius: 2, flex: 1 }}>
                <FormControlLabel value="patient" control={<Radio />} label="Patient (Book appointments)" />
              </Paper>
              <Paper variant="outlined" sx={{ p: 1, px: 2, borderRadius: 2, flex: 1 }}>
                <FormControlLabel value="doctor" control={<Radio />} label="Doctor (Manage consultations)" />
              </Paper>
            </RadioGroup>
          </FormControl>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="email"
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type={showPassword ? 'text' : 'password'}
                label="Password (min 6 chars)"
                name="password"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
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

            {/* Patient Specific Fields */}
            {role === 'patient' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Blood Group"
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <MenuItem key={bg} value={bg}>{bg}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Existing Medical History / Allergies (Optional)"
                    name="medical_history"
                    placeholder="e.g. Asthma, Penicillin allergy"
                    value={formData.medical_history}
                    onChange={handleChange}
                  />
                </Grid>
              </>
            )}

            {/* Doctor Specific Fields */}
            {role === 'doctor' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Specialization"
                    name="specialization_id"
                    value={formData.specialization_id}
                    onChange={handleChange}
                  >
                    <MenuItem value={1}>General Physician</MenuItem>
                    <MenuItem value={2}>Cardiologist</MenuItem>
                    <MenuItem value={3}>Neurologist</MenuItem>
                    <MenuItem value={4}>Orthopedic</MenuItem>
                    <MenuItem value={5}>Dermatologist</MenuItem>
                    <MenuItem value={6}>Pediatrician</MenuItem>
                    <MenuItem value={7}>ENT</MenuItem>
                    <MenuItem value={8}>Gynecologist</MenuItem>
                  </TextField>
                </Grid>
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
                    label="Years of Experience"
                    name="experience_years"
                    value={formData.experience_years}
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
              </>
            )}
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ mt: 4, mb: 2, py: 1.3, fontWeight: 700 }}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </Button>
        </form>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#0EA5E9', fontWeight: 700, textDecoration: 'none' }}>
              Sign In
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
