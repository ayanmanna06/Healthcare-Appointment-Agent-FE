import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  CheckCircle as CompletedIcon,
  CalendarToday as CalendarIcon,
  MedicalServices as StethoscopeIcon,
  Bloodtype as BloodIcon,
  Psychology as AIIcon,
  LocalHospital as HospitalIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { adminAPI } from '../api/client';
import Sidebar from '../components/Sidebar';

export default function PatientHistoryPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [patient, setPatient] = useState(location.state?.patient || null);
  const [appointments, setAppointments] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [metrics, setMetrics] = useState({
    total_appointments: 0,
    today_count: 0,
    upcoming_count: 0,
    completed_count: 0,
    cancelled_count: 0,
    total_symptoms_reported: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (patientId) {
      fetchPatientHistory(patientId);
    }
  }, [patientId]);

  const fetchPatientHistory = async (id) => {
    setLoading(true);
    try {
      const res = await adminAPI.getPatientHistory(id);
      if (res.data.success) {
        if (res.data.patient) setPatient(res.data.patient);
        setAppointments(res.data.appointments || []);
        setSymptoms(res.data.symptoms || []);
        setMetrics(
          res.data.metrics || {
            total_appointments: 0,
            today_count: 0,
            upcoming_count: 0,
            completed_count: 0,
            cancelled_count: 0,
            total_symptoms_reported: 0,
          }
        );
      }
    } catch (err) {
      console.error('Failed to load patient history:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = useMemo(() => {
    let list = appointments;
    const todayStr = new Date().toISOString().split('T')[0];

    if (filterTab === 'today') {
      list = list.filter((a) => a.appointment_date === todayStr);
    } else if (filterTab === 'upcoming') {
      list = list.filter(
        (a) => a.appointment_date >= todayStr && (a.status === 'confirmed' || a.status === 'pending')
      );
    } else if (filterTab === 'completed') {
      list = list.filter((a) => a.status === 'completed');
    } else if (filterTab === 'cancelled') {
      list = list.filter((a) => a.status === 'cancelled');
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (a) =>
          (a.doctor_name && a.doctor_name.toLowerCase().includes(q)) ||
          (a.specialization_name && a.specialization_name.toLowerCase().includes(q)) ||
          (a.chief_complaint && a.chief_complaint.toLowerCase().includes(q)) ||
          (a.medical_note?.diagnosis && a.medical_note.diagnosis.toLowerCase().includes(q)) ||
          (a.medical_note?.prescription && a.medical_note.prescription.toLowerCase().includes(q))
      );
    }

    return list;
  }, [appointments, filterTab, searchTerm]);

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
        {/* Navigation Bar */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            onClick={() => navigate('/admin/patients')}
            sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
          >
            Back to Patient Directory
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/admin/patients')}
            sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
          >
            Manage All Patients
          </Button>
        </Box>

        {/* Patient Profile Header Banner */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            border: 1,
            borderColor: 'divider',
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(30, 41, 59, 0.45) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'secondary.main',
                fontSize: '1.6rem',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(20, 184, 166, 0.35)',
              }}
            >
              {patient?.full_name ? patient.full_name[0].toUpperCase() : 'P'}
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {patient?.full_name || 'Patient Profile'}
                </Typography>
                {patient?.blood_group && (
                  <Chip
                    icon={<BloodIcon fontSize="small" sx={{ color: '#EF4444 !important' }} />}
                    label={`Blood: ${patient.blood_group}`}
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.74rem',
                      bgcolor: 'rgba(239, 68, 68, 0.15)',
                      color: '#EF4444',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                    }}
                  />
                )}
                <Chip
                  label={patient?.is_active !== false ? 'ACTIVE ACCOUNT' : 'SUSPENDED'}
                  size="small"
                  color={patient?.is_active !== false ? 'success' : 'default'}
                  sx={{ fontWeight: 800, fontSize: '0.68rem' }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  ✉️ {patient?.email || 'No email recorded'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  📞 {patient?.phone || 'No phone'}
                </Typography>
                {patient?.gender && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    ⚧ {patient.gender}
                  </Typography>
                )}
                {patient?.date_of_birth && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    🎂 DOB: {patient.date_of_birth}
                  </Typography>
                )}
                {patient?.emergency_contact && (
                  <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 700 }}>
                    🚨 Emergency: {patient.emergency_contact}
                  </Typography>
                )}
              </Box>

              {patient?.medical_history && (
                <Box sx={{ mt: 1.2, p: 1, bgcolor: 'background.paper', borderRadius: 1.5, border: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                    KNOWN MEDICAL HISTORY & ALLERGIES:
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>
                    {patient.medical_history}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Paper>

        {/* 5 Metrics Summary Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1.5px solid rgba(14, 165, 233, 0.3)', bgcolor: 'rgba(14, 165, 233, 0.06)', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: 0.5, display: 'block' }}>
                TOTAL APPOINTMENTS
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#0EA5E9', my: 0.5 }}>
                {metrics.total_appointments || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Lifetime bookings
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: 0.5, display: 'block' }}>
                COMPLETED
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#10B981', my: 0.5 }}>
                {metrics.completed_count || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Consultations finished
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1.5px solid rgba(245, 158, 11, 0.3)', bgcolor: 'rgba(245, 158, 11, 0.06)', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: 0.5, display: 'block' }}>
                UPCOMING
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#F59E0B', my: 0.5 }}>
                {metrics.upcoming_count || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Scheduled visits
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: 0.5, display: 'block' }}>
                CANCELLED
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: 'text.secondary', my: 0.5 }}>
                {metrics.cancelled_count || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Revoked / No-shows
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: 0.5, display: 'block' }}>
                AI CONSULTATIONS
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#8B5CF6', my: 0.5 }}>
                {metrics.total_symptoms_reported || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Symptom analyses
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Search & Filter Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Tabs
            value={filterTab}
            onChange={(e, val) => setFilterTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: 40,
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'none',
              },
            }}
          >
            <Tab label={`All Appointments (${metrics.total_appointments || 0})`} value="all" />
            <Tab label={`Today's Queue (${metrics.today_count || 0})`} value="today" />
            <Tab label={`Upcoming (${metrics.upcoming_count || 0})`} value="upcoming" />
            <Tab label={`Completed (${metrics.completed_count || 0})`} value="completed" />
            <Tab label={`Cancelled (${metrics.cancelled_count || 0})`} value="cancelled" />
            <Tab label={`AI Symptoms History (${symptoms.length})`} value="symptoms" />
          </Tabs>

          {filterTab !== 'symptoms' && (
            <TextField
              size="small"
              placeholder="Search doctor, specialty, diagnosis, prescription..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 280 }}
            />
          )}
        </Box>

        {/* Content Section */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress size={45} />
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              Loading patient clinical history and appointment records...
            </Typography>
          </Box>
        ) : filterTab === 'symptoms' ? (
          /* Symptoms History Section */
          symptoms.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: 1, borderColor: 'divider' }}>
              <AIIcon sx={{ fontSize: 50, color: 'text.secondary', mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                No AI Symptom Consultations Recorded
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                This patient has not submitted any symptom evaluations through the AI agent.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2.5}>
              {symptoms.map((sym) => (
                <Grid item xs={12} md={6} key={sym.id}>
                  <Card sx={{ borderRadius: 3, border: 1, borderColor: 'divider', height: '100%' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Chip
                          icon={<AIIcon fontSize="small" />}
                          label={sym.detected_specialization_name || 'Specialty Analysis'}
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 700 }}
                        />
                        <Chip
                          label={`Confidence: ${Math.round((sym.confidence_score || 0.85) * 100)}%`}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        REPORTED SYMPTOMS:
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600 }}>
                        "{sym.symptom_text}"
                      </Typography>
                      {sym.detected_condition && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                            CLINICAL ASSESSMENT:
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {sym.detected_condition}
                          </Typography>
                        </Box>
                      )}
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                        Evaluated: {sym.created_at ? new Date(sym.created_at).toLocaleString() : 'Recent'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )
        ) : filteredAppointments.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: 1, borderColor: 'divider' }}>
            <CalendarIcon sx={{ fontSize: 50, color: 'text.secondary', mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              No Appointments Recorded
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {searchTerm ? 'No records match your search criteria.' : 'No appointments found under this filter category.'}
            </Typography>
          </Paper>
        ) : (
          /* Table of Appointments */
          <Paper sx={{ borderRadius: 3, border: 1, borderColor: 'divider', overflow: 'hidden' }}>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>#ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Attending Physician</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Specialization & Suite</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date & Slot</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Chief Complaint</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Diagnosis & Prescription</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Booking Channel</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAppointments.map((appt) => (
                    <TableRow key={appt.id} hover>
                      <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>
                        #{appt.id}
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {appt.doctor_name || 'Dr. Specialist'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Tariff: ${appt.doctor_consultation_fee || '75'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          icon={<StethoscopeIcon fontSize="small" sx={{ color: '#0EA5E9 !important' }} />}
                          label={appt.specialization_name || 'General Practice'}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            bgcolor: 'rgba(14, 165, 233, 0.12)',
                            color: '#0EA5E9',
                          }}
                        />
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                          {appt.doctor_room || 'Room 101'}
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
                          label={appt.status?.toUpperCase()}
                          size="small"
                          color={
                            appt.status === 'completed'
                              ? 'success'
                              : appt.status === 'confirmed'
                              ? 'primary'
                              : appt.status === 'pending'
                              ? 'warning'
                              : 'default'
                          }
                          sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                        />
                      </TableCell>

                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>
                          {appt.chief_complaint || 'General medical review'}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ maxWidth: 260 }}>
                        {appt.medical_note ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'secondary.main', fontSize: '0.82rem' }}>
                              🩺 {appt.medical_note.diagnosis}
                            </Typography>
                            {appt.medical_note.prescription && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                Rx: {appt.medical_note.prescription}
                              </Typography>
                            )}
                            {appt.medical_note.prescription_file_url && (
                              <Button
                                size="small"
                                variant="text"
                                color="primary"
                                href={appt.medical_note.prescription_file_url}
                                target="_blank"
                                sx={{ fontSize: '0.7rem', p: 0, minWidth: 0, textTransform: 'none' }}
                              >
                                View Prescription File 📄
                              </Button>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                            {appt.status === 'completed' ? 'No notes recorded' : 'Pending consultation'}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={appt.booking_source === 'agent_auto' ? 'AI Auto-Booked' : 'Manual Booking'}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.68rem', fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
