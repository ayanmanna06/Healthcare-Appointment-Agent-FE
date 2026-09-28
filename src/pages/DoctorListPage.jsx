import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Alert,
  Paper,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon, EventAvailable as SlotIcon } from '@mui/icons-material';
import { patientAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import DoctorCard from '../components/DoctorCard';
import Sidebar from '../components/Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';

export default function DoctorListPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters (support pre-selected specialization from landing page)
  const [selectedSpec, setSelectedSpec] = useState(location.state?.specialization || 'All');
  const [searchTerm, setSearchTerm] = useState('');
  const [minRating, setMinRating] = useState(0);

  // Slot booking modal
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorSlots, setDoctorSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [chosenSlot, setChosenSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [docsRes, specsRes] = await Promise.all([
        patientAPI.getDoctors(),
        patientAPI.getSpecializations(),
      ]);

      if (docsRes.data.success) setDoctors(docsRes.data.doctors);
      if (specsRes.data.success) setSpecializations(specsRes.data.specializations);
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSlots = async (doctor) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/doctors' } });
      return;
    }
    setSelectedDoctor(doctor);
    setChosenSlot(null);
    setBookingMessage({ text: '', type: '' });
    setSlotsLoading(true);

    try {
      const res = await patientAPI.getDoctorSlots(doctor.id, 10);
      if (res.data.success) {
        setDoctorSlots(res.data.slots || []);
      }
    } catch (err) {
      console.error('Failed to load slots:', err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!selectedDoctor || !chosenSlot) return;

    setBookingLoading(true);
    setBookingMessage({ text: '', type: '' });

    try {
      const res = await patientAPI.bookAppointment({
        doctor_id: selectedDoctor.id,
        appointment_date: chosenSlot.date,
        start_time: chosenSlot.start_time,
        chief_complaint: 'Routine consultation via Doctor Directory',
        booking_source: 'manual',
      });

      if (res.data.success) {
        setBookingMessage({
          text: `Success! Appointment booked with ${selectedDoctor.full_name} on ${chosenSlot.date} at ${chosenSlot.start_time}. Confirmation email dispatched.`,
          type: 'success',
        });
        setTimeout(() => {
          setSelectedDoctor(null);
          navigate('/history');
        }, 1800);
      }
    } catch (err) {
      setBookingMessage({
        text: err.response?.data?.error || 'Failed to book slot. It may have been taken.',
        type: 'error',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSpec = selectedSpec === 'All' || doc.specialization_name === selectedSpec;
    const matchesRating = parseFloat(doc.rating) >= minRating;
    const matchesSearch =
      doc.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.qualification?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSpec && matchesRating && matchesSearch;
  });

  const pageContent = (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Find & Book Medical Specialists
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Explore our certified physician network across multiple clinical departments.
        </Typography>
      </Box>

      {/* Filter Toolbar */}
      <Paper elevation={1} sx={{ p: 2.5, mb: 4, borderRadius: 3, border: 1, borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by doctor name or qualification..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Specialization"
              value={selectedSpec}
              onChange={(e) => setSelectedSpec(e.target.value)}
            >
              <MenuItem value="All">All Specializations</MenuItem>
              {specializations.map((s) => (
                <MenuItem key={s.id} value={s.name}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Minimum Rating"
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
            >
              <MenuItem value={0}>Any Rating</MenuItem>
              <MenuItem value={4.5}>4.5+ Stars</MenuItem>
              <MenuItem value={4.8}>4.8+ Stars</MenuItem>
              <MenuItem value={4.9}>4.9+ Stars</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Doctor Grid */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={45} color="primary" />
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading doctor profiles...
          </Typography>
        </Box>
      ) : filteredDoctors.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            No doctors matched your criteria.
          </Typography>
          <Button variant="text" color="primary" onClick={() => { setSelectedSpec('All'); setSearchTerm(''); setMinRating(0); }} sx={{ mt: 1 }}>
            Reset Filters
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredDoctors.map((doc) => (
            <Grid item xs={12} sm={6} md={4} key={doc.id}>
              <DoctorCard doctor={doc} onSelectDoctor={handleOpenSlots} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Live Slot Selection Dialog */}
      <Dialog
        open={Boolean(selectedDoctor)}
        onClose={() => setSelectedDoctor(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Select Appointment Slot &bull; {selectedDoctor?.full_name}
        </DialogTitle>
        <DialogContent dividers>
          {bookingMessage.text && (
            <Alert severity={bookingMessage.type} sx={{ mb: 2 }}>
              {bookingMessage.text}
            </Alert>
          )}

          {!isAuthenticated ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                🔒 Sign In Required to View Availability
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, maxWidth: 450, mx: 'auto' }}>
                Doctor availability and scheduling calendar are only visible to authenticated patients. Please sign in or register to select an appointment opening.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/login', { state: { from: '/doctors' } })}
                sx={{ fontWeight: 700, px: 3 }}
              >
                Sign In to View Openings & Book
              </Button>
            </Box>
          ) : slotsLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={35} />
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Fetching real-time available time slots...
              </Typography>
            </Box>
          ) : doctorSlots.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                No active slots open in the next 10 days for this physician.
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Please check another specialist or try the AI Symptom consultation tool for auto-recommendations.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary' }}>
                AVAILABLE OPENINGS (NEXT 10 DAYS):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, maxHeight: 320, overflowY: 'auto', p: 1 }}>
                {doctorSlots.map((slot, idx) => {
                  const isChosen = chosenSlot && chosenSlot.slot_datetime === slot.slot_datetime;
                  return (
                    <Chip
                      key={idx}
                      label={`${slot.date} (${slot.start_time} - ${slot.end_time})`}
                      color={isChosen ? 'primary' : 'default'}
                      variant={isChosen ? 'filled' : 'outlined'}
                      onClick={() => setChosenSlot(slot)}
                      clickable
                      sx={{
                        fontWeight: 600,
                        py: 2,
                        px: 1,
                        fontSize: '0.8rem',
                        borderColor: isChosen ? 'primary.main' : 'divider',
                      }}
                    />
                  );
                })}
              </Box>

              {chosenSlot && (
                <Paper variant="outlined" sx={{ p: 2, mt: 3, borderRadius: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    Selected Time:
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
                    {chosenSlot.day_name}, {chosenSlot.date} from {chosenSlot.start_time} to {chosenSlot.end_time}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Consultation Fee: ${selectedDoctor?.consultation_fee} &bull; Room: {selectedDoctor?.room_number || 'Main Consultation'}
                  </Typography>
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedDoctor(null)} color="inherit">
            Cancel
          </Button>
          {!isAuthenticated ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/login', { state: { from: '/doctors' } })}
              sx={{ fontWeight: 700, px: 3 }}
            >
              Sign In to Book Appointment
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              disabled={!chosenSlot || bookingLoading}
              onClick={handleConfirmBooking}
              sx={{ fontWeight: 700, px: 3 }}
            >
              {bookingLoading ? 'Booking...' : 'Confirm Appointment'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );

  if (isAuthenticated) {
    return (
      <Box sx={{ display: 'flex' }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 4 },
            minHeight: '100vh',
            bgcolor: 'background.default',
            overflowX: 'hidden',
          }}
        >
          {pageContent}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {pageContent}
      </Container>
    </Box>
  );
}
