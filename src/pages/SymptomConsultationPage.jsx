import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Avatar,
  Stack,
} from '@mui/material';
import {
  SmartToy as AgentIcon,
  Send as SendIcon,
  CheckCircle as SuccessIcon,
  Stars as StarsIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  HelpOutline as HelpIcon,
  WbSunny as MorningIcon,
  NightsStay as AfternoonIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { patientAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import DoctorCard from '../components/DoctorCard';

export default function SymptomConsultationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [symptoms, setSymptoms] = useState(location.state?.initialSymptom || '');
  const [autoBook, setAutoBook] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Interactive Doctor & Date/Time Slot Picker state
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorSlots, setDoctorSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    // If navigated from landing page with initial symptom, auto analyze
    if (location.state?.initialSymptom && !result) {
      handleAnalyze(location.state.initialSymptom);
    }
  }, []);

  const handleAnalyze = async (textToAnalyze = symptoms) => {
    if (!textToAnalyze.trim()) {
      setError('Please describe your symptoms first.');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await patientAPI.consultSymptoms({
        symptoms: textToAnalyze,
        auto_book: autoBook && isAuthenticated,
      });

      if (res.data.success) {
        setResult(res.data);
      } else {
        setError(res.data.error || 'Failed to complete symptom analysis.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error communicating with AI agents.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSchedule = async (doctor, defaultSlot = null) => {
    setSelectedDoctor(doctor);
    setSelectedSlot(defaultSlot);
    setSelectedDate(defaultSlot ? defaultSlot.date : '');
    setBookingError('');
    setSlotsLoading(true);

    try {
      const res = await patientAPI.getDoctorSlots(doctor.id, 14);
      const slots = res.data?.slots || [];
      setDoctorSlots(slots);
      if (slots.length > 0) {
        if (defaultSlot) {
          const matched = slots.find((s) => s.date === defaultSlot.date && s.start_time === defaultSlot.start_time);
          setSelectedSlot(matched || slots[0]);
          setSelectedDate(matched ? matched.date : slots[0].date);
        } else {
          setSelectedDate(slots[0].date);
          setSelectedSlot(slots[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load doctor slots', err);
      setBookingError('Failed to fetch doctor live schedule.');
    } finally {
      setSlotsLoading(false);
    }
  };

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped = {};
    doctorSlots.forEach((slot) => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  }, [doctorSlots]);

  const uniqueDates = useMemo(() => Object.keys(slotsByDate).sort(), [slotsByDate]);

  const currentDaySlots = useMemo(() => {
    return slotsByDate[selectedDate] || [];
  }, [slotsByDate, selectedDate]);

  const morningSlots = useMemo(() => {
    return currentDaySlots.filter((s) => s.start_time < '13:00');
  }, [currentDaySlots]);

  const afternoonSlots = useMemo(() => {
    return currentDaySlots.filter((s) => s.start_time >= '13:00');
  }, [currentDaySlots]);

  const handleManualBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!selectedDoctor || !selectedSlot) {
      setBookingError('Please choose a date and time slot first.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    try {
      const res = await patientAPI.bookAppointment({
        doctor_id: selectedDoctor.id,
        appointment_date: selectedSlot.date,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        chief_complaint: symptoms || 'Clinical Consultation',
        booking_source: 'manual',
      });

      if (res.data.success) {
        setBookingSuccess({
          appointment: res.data.appointment,
          doctor: selectedDoctor,
          slot: selectedSlot,
        });
        setSelectedDoctor(null);
        setSelectedSlot(null);
      }
    } catch (err) {
      setBookingError(err.response?.data?.error || 'Booking slot conflict. Please choose another slot.');
    } finally {
      setBookingLoading(false);
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
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Chip
          icon={<AgentIcon sx={{ color: '#0EA5E9' }} />}
          label="AI Symptom Consultation & Autonomous Scheduling"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 700, mb: 1.5 }}
        />
        <Typography variant="h3" sx={{ fontWeight: 800 }}>
          Interactive AI Clinical Agent
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 700, mx: 'auto', mt: 1 }}>
          Describe what you're experiencing in plain language. Our multi-agent pipeline extracts clinical taxonomy,
          matches specialists, and automatically computes optimal scheduling.
        </Typography>
      </Box>

      {/* Input Consultation Card */}
      <Paper elevation={3} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3, mb: 4, border: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AgentIcon sx={{ color: 'primary.main' }} /> Describe Your Symptoms
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {bookingSuccess && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            Appointment successfully confirmed! An email receipt with preparation notes has been dispatched to your email address.
          </Alert>
        )}

        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="e.g. I have had a high fever and throbbing headache for 3 days, feeling exhausted and slightly dizzy..."
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={autoBook}
                onChange={(e) => setAutoBook(e.target.checked)}
                color="secondary"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Autonomous Booking: Automatically confirm the #1 recommended slot if authenticated
              </Typography>
            }
          />

          <Button
            variant="contained"
            color="primary"
            size="large"
            disabled={loading || !symptoms.trim()}
            onClick={() => handleAnalyze()}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            sx={{ px: 4, py: 1.2, fontWeight: 700 }}
          >
            {loading ? 'Consulting Agents...' : 'Run Agent Analysis'}
          </Button>
        </Box>

        {/* Quick Example Symptom Buttons */}
        <Box sx={{ mt: 2.5, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, mr: 1 }}>
            QUICK PRESETS:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {[
              'I have fever and headache for 3 days',
              'Chest pain, shortness of breath, and palpitations',
              'Sharp pain in my right knee after a sports sprain',
              'Severe migraine with numbness in left fingers',
              'Itchy red skin rash and hives on my neck',
            ].map((preset) => (
              <Chip
                key={preset}
                label={preset}
                size="small"
                onClick={() => {
                  setSymptoms(preset);
                  handleAnalyze(preset);
                }}
                clickable
                sx={{ fontSize: '0.75rem', fontWeight: 500 }}
              />
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Results Section */}
      {loading && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress size={50} color="primary" />
          <Typography variant="h6" sx={{ mt: 2, fontWeight: 700 }}>
            Coordinating AI Agents...
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Analyzing symptom vectors &bull; Matching doctors &bull; Calculating availability matrix
          </Typography>
        </Box>
      )}

      {/* Booking Success Banner */}
      {bookingSuccess && (
        <Alert
          severity="success"
          sx={{ my: 3, borderRadius: 3, p: 2.5, boxShadow: '0 4px 20px rgba(16, 185, 129, 0.2)' }}
          action={
            <Button
              color="inherit"
              size="small"
              variant="outlined"
              onClick={() => navigate('/history')}
              sx={{ fontWeight: 700 }}
            >
              View In History
            </Button>
          }
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            🎉 Appointment Successfully Confirmed!
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Appointment #{bookingSuccess.appointment?.id} with <strong>{bookingSuccess.doctor?.full_name}</strong> on{' '}
            <strong>
              {bookingSuccess.slot?.day_name}, {bookingSuccess.slot?.date} ({bookingSuccess.slot?.start_time} - {bookingSuccess.slot?.end_time})
            </strong>{' '}
            in Room {bookingSuccess.doctor?.room_number || '301'}. A confirmation email has been dispatched.
          </Typography>
        </Alert>
      )}

      {result && (
        <Box sx={{ mt: 4 }}>
          {/* Top Recommendation Highlight Card */}
          {result.recommendation?.doctor && (
            <Card
              sx={{
                mb: 4,
                borderRadius: 3,
                border: 2,
                borderColor: 'primary.main',
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(20, 184, 166, 0.08) 100%)',
                boxShadow: '0 10px 30px rgba(14, 165, 233, 0.15)',
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip
                    icon={<StarsIcon />}
                    label="OPTIMAL AI SELECTION"
                    color="primary"
                    sx={{ fontWeight: 800, px: 1 }}
                  />
                  <Chip
                    label={`Agent Match Score: ${Math.round(result.recommendation.decision_score * 100)}%`}
                    color="success"
                    sx={{ fontWeight: 800 }}
                  />
                </Box>

                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {result.recommendation.doctor.full_name}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: 'secondary.main', fontWeight: 700, mb: 1 }}>
                      {result.recommendation.doctor.specialization_name} &bull; {result.recommendation.doctor.qualification}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      {result.recommendation.decision_reason}
                    </Typography>

                    {/* Breakdown Chips */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip
                        label={`Rating Score: ${Math.round(result.recommendation.score_breakdown?.rating_score * 100)}%`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`Experience Score: ${Math.round(result.recommendation.score_breakdown?.experience_score * 100)}%`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`Earliness Score: ${Math.round(result.recommendation.score_breakdown?.earliness_score * 100)}%`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`Low Wait Queue: ${Math.round(result.recommendation.score_breakdown?.load_score * 100)}%`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                    {result.recommendation.slot ? (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>
                          EARLIEST RECOMMENDED OPENING:
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.dark' }}>
                          {result.recommendation.slot.date}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {result.recommendation.slot.start_time} - {result.recommendation.slot.end_time}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        Flexible schedule available
                      </Typography>
                    )}

                    {result.booked_appointment ? (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<SuccessIcon />}
                        disabled
                        sx={{ fontWeight: 700, px: 3 }}
                      >
                        Auto-Booked (#A{result.booked_appointment.id})
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={() => {
                          handleOpenSchedule(result.recommendation.doctor, result.recommendation.slot);
                        }}
                        sx={{ fontWeight: 800, px: 3, py: 1.2 }}
                      >
                        Select & Choose Time Slot ➜
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Multiple Matched Doctors Section */}
          {result.candidate_doctors && result.candidate_doctors.length > 0 && (
            <Box sx={{ mt: 5 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Choose Your Preferred Specialist
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Select any doctor below to view their calendar and choose the day & time you are free.
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {result.candidate_doctors.map((doc) => {
                  const isTop = result.recommendation?.doctor?.id === doc.id;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={doc.id}>
                      <DoctorCard
                        doctor={doc}
                        isRecommended={isTop}
                        earliestSlot={isTop ? result.recommendation?.slot : null}
                        onSelectDoctor={(d) => handleOpenSchedule(d, isTop ? result.recommendation?.slot : null)}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}
        </Box>
      )}

      {/* Interactive Date & Time Slot Picker Dialog */}
      <Dialog
        open={Boolean(selectedDoctor)}
        onClose={() => setSelectedDoctor(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Choose Appointment Date & Time
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Select a day and time slot that fits your schedule with {selectedDoctor?.full_name}
            </Typography>
          </Box>
          {selectedDoctor && (
            <Chip
              label={`Fee: $${selectedDoctor.consultation_fee}`}
              color="secondary"
              sx={{ fontWeight: 700 }}
            />
          )}
        </DialogTitle>

        <DialogContent dividers>
          {bookingError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {bookingError}
            </Alert>
          )}

          {slotsLoading ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <CircularProgress size={40} />
              <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary' }}>
                Fetching doctor's live availability schedule...
              </Typography>
            </Box>
          ) : doctorSlots.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                No open slots found for this doctor in the next 14 days.
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                Please select another specialist or check back later.
              </Typography>
            </Box>
          ) : (
            <Box>
              {/* Doctor Details Summary Bar */}
              <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, fontWeight: 700 }}>
                  {selectedDoctor?.full_name ? selectedDoctor.full_name.replace('Dr. ', '')[0] : 'D'}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {selectedDoctor?.full_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 600 }}>
                    {selectedDoctor?.specialization_name} &bull; {selectedDoctor?.qualification}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                    Clinic Suite: {selectedDoctor?.room_number || 'Room 301'} &bull; Rating: ⭐ {selectedDoctor?.rating} ({selectedDoctor?.experience_years} yrs exp)
                  </Typography>
                </Box>
              </Box>

              {/* STEP 1: Select Day / Date */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon fontSize="small" sx={{ color: 'primary.main' }} />
                1. SELECT DAY / DATE (WHEN ARE YOU FREE?):
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1.5, mb: 3 }}>
                {uniqueDates.map((dateStr) => {
                  const isSelected = selectedDate === dateStr;
                  const dateObj = new Date(dateStr + 'T00:00:00');
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  const count = slotsByDate[dateStr]?.length || 0;

                  return (
                    <Paper
                      key={dateStr}
                      onClick={() => {
                        setSelectedDate(dateStr);
                        if (slotsByDate[dateStr]?.length > 0) {
                          setSelectedSlot(slotsByDate[dateStr][0]);
                        }
                      }}
                      sx={{
                        p: 1.5,
                        minWidth: 105,
                        textAlign: 'center',
                        cursor: 'pointer',
                        borderRadius: 2,
                        border: 2,
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: isSelected ? 'rgba(14, 165, 233, 0.12)' : 'background.paper',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700, color: isSelected ? 'primary.main' : 'text.secondary', display: 'block' }}>
                        {dayName.toUpperCase()}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: isSelected ? 'primary.main' : 'text.primary' }}>
                        {monthDay}
                      </Typography>
                      <Chip
                        label={`${count} slots`}
                        size="small"
                        color={isSelected ? 'primary' : 'default'}
                        variant={isSelected ? 'filled' : 'outlined'}
                        sx={{ mt: 0.5, height: 18, fontSize: '0.65rem', fontWeight: 600 }}
                      />
                    </Paper>
                  );
                })}
              </Box>

              {/* STEP 2: Select Time Slot */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon fontSize="small" sx={{ color: 'secondary.main' }} />
                2. SELECT TIME SLOT FOR {selectedDate}:
              </Typography>

              {morningSlots.length > 0 && (
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <MorningIcon fontSize="inherit" sx={{ color: '#F59E0B' }} /> MORNING (09:00 - 13:00)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {morningSlots.map((slot, idx) => {
                      const isChosen = selectedSlot?.slot_datetime === slot.slot_datetime;
                      return (
                        <Chip
                          key={`m-${idx}`}
                          label={`${slot.start_time} - ${slot.end_time}`}
                          color={isChosen ? 'primary' : 'default'}
                          variant={isChosen ? 'filled' : 'outlined'}
                          onClick={() => setSelectedSlot(slot)}
                          clickable
                          sx={{
                            fontWeight: 700,
                            py: 2,
                            px: 1,
                            fontSize: '0.85rem',
                            borderColor: isChosen ? 'primary.main' : 'divider',
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              )}

              {afternoonSlots.length > 0 && (
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <AfternoonIcon fontSize="inherit" sx={{ color: '#0EA5E9' }} /> AFTERNOON / EVENING (14:00 - 17:00)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {afternoonSlots.map((slot, idx) => {
                      const isChosen = selectedSlot?.slot_datetime === slot.slot_datetime;
                      return (
                        <Chip
                          key={`a-${idx}`}
                          label={`${slot.start_time} - ${slot.end_time}`}
                          color={isChosen ? 'primary' : 'default'}
                          variant={isChosen ? 'filled' : 'outlined'}
                          onClick={() => setSelectedSlot(slot)}
                          clickable
                          sx={{
                            fontWeight: 700,
                            py: 2,
                            px: 1,
                            fontSize: '0.85rem',
                            borderColor: isChosen ? 'primary.main' : 'divider',
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/* STEP 3: Summary Box */}
              {selectedSlot && (
                <Paper variant="outlined" sx={{ p: 2, mt: 3, borderRadius: 2, bgcolor: 'background.default', border: '1px solid #0EA5E9' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                    ✅ Selected Appointment Summary:
                  </Typography>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Doctor:</strong> {selectedDoctor?.full_name} ({selectedDoctor?.specialization_name})
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Clinic Room:</strong> {selectedDoctor?.room_number || 'Room 301'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Date:</strong> {selectedSlot.day_name}, {selectedSlot.date}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Time:</strong> {selectedSlot.start_time} - {selectedSlot.end_time}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Consultation fee (${selectedDoctor?.consultation_fee}) payable at reception upon arrival.
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button onClick={() => setSelectedDoctor(null)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleManualBooking}
            variant="contained"
            color="primary"
            disabled={!selectedSlot || bookingLoading}
            startIcon={bookingLoading ? <CircularProgress size={18} color="inherit" /> : <SuccessIcon />}
            sx={{ fontWeight: 800, px: 3, py: 1 }}
          >
            {bookingLoading ? 'Confirming...' : 'Confirm Appointment'}
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  </Box>
  );
}
