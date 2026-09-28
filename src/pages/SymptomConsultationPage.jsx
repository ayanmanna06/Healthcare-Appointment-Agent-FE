import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  SmartToy as AgentIcon,
  Send as SendIcon,
  CheckCircle as SuccessIcon,
  Stars as StarsIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  HelpOutline as HelpIcon,
} from '@mui/icons-material';
import { patientAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AgentWorkflowStepper from '../components/AgentWorkflowStepper';
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

  // Booking confirmation modal state for manual slot selection
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

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

  const handleManualBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!selectedDoctor || !selectedSlot) return;

    setBookingLoading(true);
    try {
      const res = await patientAPI.bookAppointment({
        doctor_id: selectedDoctor.id,
        appointment_date: selectedSlot.date,
        start_time: selectedSlot.start_time,
        chief_complaint: symptoms,
        booking_source: 'manual',
      });

      if (res.data.success) {
        setBookingSuccess(res.data.appointment);
        setSelectedDoctor(null);
        setSelectedSlot(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Booking slot conflict.');
    } finally {
      setBookingLoading(false);
    }
  };

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
                          RECOMMENDED SLOT:
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
                        Flexible schedule - contact reception
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
                          setSelectedDoctor(result.recommendation.doctor);
                          setSelectedSlot(result.recommendation.slot);
                        }}
                        sx={{ fontWeight: 800, px: 3, py: 1.2 }}
                      >
                        Confirm This Booking
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Stepper Multi-Agent Workflow Pipeline */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
            <AgentWorkflowStepper workflowTrace={result.workflow_trace} />
          </Paper>

          {/* Alternative Matched Doctors */}
          {result.candidate_doctors && result.candidate_doctors.length > 1 && (
            <Box sx={{ mt: 5 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                Other Qualified Specialists in {result.analysis?.primary_specialization}
              </Typography>
              <Grid container spacing={3}>
                {result.candidate_doctors.slice(1).map((doc) => (
                  <Grid item xs={12} sm={6} md={4} key={doc.id}>
                    <DoctorCard
                      doctor={doc}
                      onSelectDoctor={(d) => {
                        setSelectedDoctor(d);
                        // Fetch first available slot for manual modal
                        patientAPI.getDoctorSlots(d.id).then((slotRes) => {
                          if (slotRes.data.slots && slotRes.data.slots.length > 0) {
                            setSelectedSlot(slotRes.data.slots[0]);
                          }
                        });
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      )}

      {/* Manual Booking Confirmation Dialog */}
      <Dialog
        open={Boolean(selectedDoctor && selectedSlot)}
        onClose={() => setSelectedDoctor(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Confirm Doctor Consultation
        </DialogTitle>
        <DialogContent dividers>
          {selectedDoctor && selectedSlot && (
            <Box sx={{ py: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {selectedDoctor.full_name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 600, mb: 2 }}>
                {selectedDoctor.specialization_name} &bull; Room {selectedDoctor.room_number || '301'}
              </Typography>

              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, mb: 2 }}>
                <Typography variant="body2">
                  <strong>Date:</strong> {selectedSlot.date} ({selectedSlot.day_name || 'Upcoming'})
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>Time:</strong> {selectedSlot.start_time} - {selectedSlot.end_time}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>Consultation Fee:</strong> ${selectedDoctor.consultation_fee}
                </Typography>
              </Paper>

              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Note: An automated confirmation email and pre-appointment reminder will be dispatched by our Notification Agent upon confirmation.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedDoctor(null)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleManualBooking}
            variant="contained"
            color="primary"
            disabled={bookingLoading}
            sx={{ fontWeight: 700 }}
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
