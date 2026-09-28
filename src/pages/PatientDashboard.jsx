import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  SmartToy as AgentIcon,
  Notifications as NotifIcon,
  Cancel as CancelIcon,
  EventRepeat as RescheduleIcon,
  CheckCircle as SuccessIcon,
  MedicalServices as DoctorIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { patientAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [apptsRes, notifsRes, docsRes] = await Promise.all([
        patientAPI.getAppointments(),
        patientAPI.getNotifications(),
        patientAPI.getRecommendedDoctors({ min_rating: 4.8 }),
      ]);

      if (apptsRes.data.success) setAppointments(apptsRes.data.appointments);
      if (notifsRes.data.success) setNotifications(notifsRes.data.notifications);
      if (docsRes.data.success) setRecommendedDoctors(docsRes.data.doctors.slice(0, 3));
    } catch (err) {
      console.error('Error loading patient dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await patientAPI.cancelAppointment({ appointment_id: id, reason: 'Patient cancelled from dashboard' });
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || 'Cancellation failed.');
    }
  };

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'confirmed' || a.status === 'pending'
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Welcome Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Welcome back, {user?.full_name || 'Patient'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Here is your personal healthcare scheduling overview and active appointments.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AgentIcon />}
            onClick={() => navigate('/consult')}
            sx={{ fontWeight: 700, px: 2.5, py: 1 }}
          >
            Start AI Consultation
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Quick Metrics */}
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(14, 165, 233, 0.1)', color: 'primary.main' }}>
                  <CalendarIcon fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    UPCOMING APPOINTMENTS
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {upcomingAppointments.length}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(20, 184, 166, 0.1)', color: 'secondary.main' }}>
                  <SuccessIcon fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    TOTAL CONSULTATIONS
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {appointments.length}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                  <NotifIcon fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    EMAIL NOTIFICATIONS
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {notifications.length}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Upcoming Appointments Table */}
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Upcoming Scheduled Consultations
                  </Typography>
                  <Button size="small" onClick={() => navigate('/history')} endIcon={<ArrowIcon />}>
                    View All History
                  </Button>
                </Box>

                {upcomingAppointments.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      You have no upcoming consultations scheduled.
                    </Typography>
                    <Button variant="outlined" color="primary" onClick={() => navigate('/consult')} sx={{ mt: 1.5 }}>
                      Schedule with AI Agent
                    </Button>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Doctor</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {upcomingAppointments.map((appt) => (
                          <TableRow key={appt.id} hover>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                Dr. {appt.doctor_name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {appt.specialization} &bull; {appt.booking_source === 'agent_auto' ? 'AI Booked' : 'Manual'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {appt.appointment_date}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {appt.start_time} - {appt.end_time}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={appt.status.toUpperCase()}
                                color={appt.status === 'confirmed' ? 'success' : 'warning'}
                                size="small"
                                sx={{ fontWeight: 700, fontSize: '0.68rem' }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Cancel appointment">
                                <IconButton size="small" color="error" onClick={() => handleCancel(appt.id)}>
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>

            {/* Notifications & Recent Alerts Widget */}
            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider', height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotifIcon sx={{ color: 'secondary.main' }} /> Automated Alerts
                </Typography>

                {notifications.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                    No alerts yet. Notifications will appear here when appointments are booked.
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {notifications.slice(0, 4).map((n) => (
                      <Paper key={n.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.default' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                          <Chip
                            label={n.type.toUpperCase()}
                            size="small"
                            color={n.type === 'confirmation' ? 'success' : 'info'}
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                          />
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {new Date(n.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {n.subject}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Grid>

            {/* Recommended Doctors section */}
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Top Recommended Medical Specialists
                </Typography>
                <Grid container spacing={3}>
                  {recommendedDoctors.map((doc) => (
                    <Grid item xs={12} sm={6} md={4} key={doc.id}>
                      <Card variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {doc.full_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                          {doc.specialization_name} &bull; Rating: {doc.rating} ★
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontSize: '0.85rem' }}>
                          {doc.qualification} ({doc.experience_years} years experience)
                        </Typography>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => navigate('/consult', { state: { initialSymptom: `Consultation with ${doc.specialization_name}` } })}
                          sx={{ mt: 2, fontWeight: 700 }}
                        >
                          Consult Specialist
                        </Button>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
}
