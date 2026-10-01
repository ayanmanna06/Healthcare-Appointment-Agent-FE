import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
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
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  CheckCircle as CompletedIcon,
  CalendarToday as CalendarIcon,
  PendingActions as PendingIcon,
  Cancel as CancelIcon,
  MedicalServices as StethoscopeIcon,
  AttachMoney as FeeIcon,
  MeetingRoom as RoomIcon,
  PictureAsPdf as PdfIcon,
  EventAvailable as SlotIcon,
} from '@mui/icons-material';
import { adminAPI } from '../api/client';
import Sidebar from '../components/Sidebar';

export default function DoctorPatientHistoryPage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [doctor, setDoctor] = useState(location.state?.doctor || null);
  const [appointments, setAppointments] = useState([]);
  const [metrics, setMetrics] = useState({
    today_patients_count: 0,
    total_patients_count: 0,
    completed_count: 0,
    upcoming_count: 0,
    cancelled_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (doctorId) {
      fetchDoctorHistory(doctorId);
    }
  }, [doctorId]);

  const fetchDoctorHistory = async (id) => {
    setLoading(true);
    try {
      const res = await adminAPI.getDoctorPatientHistory(id);
      if (res.data.success) {
        if (res.data.doctor) setDoctor(res.data.doctor);
        setAppointments(res.data.appointments || []);
        setMetrics(res.data.metrics || {
          today_patients_count: 0,
          total_patients_count: 0,
          completed_count: 0,
          upcoming_count: 0,
          cancelled_count: 0,
        });
      }
    } catch (err) {
      console.error('Failed to load doctor patient history:', err);
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
      list = list.filter((a) => a.appointment_date >= todayStr && (a.status === 'confirmed' || a.status === 'pending'));
    } else if (filterTab === 'completed') {
      list = list.filter((a) => a.status === 'completed');
    } else if (filterTab === 'cancelled') {
      list = list.filter((a) => a.status === 'cancelled');
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((a) =>
        (a.patient_name && a.patient_name.toLowerCase().includes(q)) ||
        (a.chief_complaint && a.chief_complaint.toLowerCase().includes(q)) ||
        (a.patient_phone && a.patient_phone.includes(q)) ||
        (a.patient_email && a.patient_email.toLowerCase().includes(q)) ||
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
            onClick={() => navigate('/doctors')}
            sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
          >
            Back to Physician Directory
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/doctors')}
              sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
            >
              Manage All Specialists
            </Button>
          </Box>
        </Box>

        {/* Doctor Header Banner */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            border: 1,
            borderColor: 'divider',
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.09) 0%, rgba(30, 41, 59, 0.45) 100%)',
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
                bgcolor: 'primary.main',
                fontSize: '1.5rem',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)',
              }}
            >
              {doctor?.full_name ? doctor.full_name.replace('Dr. ', '')[0] : 'D'}
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {doctor?.full_name || 'Physician Profile'}
                </Typography>
                <Chip
                  icon={<StethoscopeIcon fontSize="small" sx={{ color: '#2DD4BF !important' }} />}
                  label={`Specialization: ${doctor?.specialization_name || 'Specialist'}`}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.76rem',
                    bgcolor: 'rgba(20, 184, 166, 0.15)',
                    color: '#2DD4BF',
                    border: '1px solid rgba(20, 184, 166, 0.4)',
                  }}
                />
                <Chip
                  label={doctor?.is_active !== false ? 'ACTIVE ROSTER' : 'DEACTIVATED'}
                  size="small"
                  color={doctor?.is_active !== false ? 'success' : 'default'}
                  sx={{ fontWeight: 800, fontSize: '0.68rem' }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                {doctor?.qualification && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    🎓 {doctor.qualification} ({doctor.experience_years} years experience)
                  </Typography>
                )}
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  🚪 Room: <strong>{doctor?.room_number || 'Main Suite'}</strong>
                </Typography>
                <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                  💵 Fee: ${doctor?.consultation_fee}
                </Typography>
                {doctor?.rating && (
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    ⭐ {doctor.rating} Rating
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* 5 Metrics Summary Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1.5px solid rgba(14, 165, 233, 0.3)', bgcolor: 'rgba(14, 165, 233, 0.06)', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: 0.5, display: 'block' }}>
                TODAY'S PATIENTS
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#0EA5E9', my: 0.5 }}>
                {metrics.today_patients_count || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Queue for today
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: 0.5, display: 'block' }}>
                TOTAL PATIENTS
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, my: 0.5 }}>
                {metrics.total_patients_count || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                All consultations
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1.5px solid rgba(16, 185, 129, 0.3)', bgcolor: 'rgba(16, 185, 129, 0.06)', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: 0.5, display: 'block' }}>
                COMPLETED
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#10B981', my: 0.5 }}>
                {metrics.completed_count || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Prescriptions given
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
                Rescheduled / cancelled
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Search & Tabs Filter Section */}
        <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider', mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Tabs
              value={filterTab}
              onChange={(e, val) => setFilterTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ '& .MuiTab-root': { fontWeight: 700 } }}
            >
              <Tab label={`All Consultations (${metrics.total_patients_count || 0})`} value="all" />
              <Tab label={`Today's Queue (${metrics.today_patients_count || 0})`} value="today" />
              <Tab label={`Upcoming (${metrics.upcoming_count || 0})`} value="upcoming" />
              <Tab label={`Completed (${metrics.completed_count || 0})`} value="completed" />
              <Tab label={`Cancelled (${metrics.cancelled_count || 0})`} value="cancelled" />
            </Tabs>

            <TextField
              size="small"
              placeholder="Search by patient, phone, symptoms, diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 320 }}
            />
          </Box>

          {/* Patient Roster Table */}
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CircularProgress size={45} />
              <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary', fontWeight: 600 }}>
                Loading doctor patient history and clinical records...
              </Typography>
            </Box>
          ) : filteredAppointments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                No patient consultation records found.
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {searchTerm
                  ? 'No patient records matched your search query. Try clearing the search bar.'
                  : 'There are currently no patient consultations under this filter tab.'}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>#ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Patient Details</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Appointment Schedule</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Chief Complaint / Symptoms</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Diagnosis & Clinical Notes</TableCell>
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
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {appt.patient_name || 'Patient'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          {appt.patient_phone || appt.patient_email || 'No contact recorded'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {appt.appointment_date}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
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
                          sx={{ fontWeight: 800, fontSize: '0.68rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 240 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          {appt.chief_complaint || 'General clinical consultation request'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        {appt.medical_note ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'secondary.main', fontSize: '0.85rem' }}>
                              🩺 {appt.medical_note.diagnosis}
                            </Typography>
                            {appt.medical_note.prescription && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                                <strong>Rx:</strong> {appt.medical_note.prescription}
                              </Typography>
                            )}
                            {appt.medical_note.prescription_file_url && (
                              <Button
                                size="small"
                                variant="text"
                                color="primary"
                                href={appt.medical_note.prescription_file_url}
                                target="_blank"
                                sx={{ fontSize: '0.72rem', p: 0, minWidth: 0, textTransform: 'none', mt: 0.5 }}
                              >
                                View Prescription File 📄
                              </Button>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                            {appt.status === 'completed' ? 'No notes recorded' : 'Pending doctor consultation'}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={appt.booking_source === 'agent_auto' ? 'AI Auto-Booked' : 'Manual Booking'}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
