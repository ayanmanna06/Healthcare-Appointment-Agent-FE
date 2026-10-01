import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
} from '@mui/material';
import {
  People as PatientIcon,
  MedicalServices as DoctorIcon,
  CalendarMonth as ApptIcon,
  SmartToy as AgentIcon,
  TrendingUp as TrendingIcon,
  ArrowForward as ArrowIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CompletedIcon,
  PendingActions as PendingIcon,
  Cancel as CancelIcon,
  EventAvailable as ConfirmedIcon,
  MedicalServices as StethoscopeIcon,
  Group as PeopleGroupIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { adminAPI } from '../api/client';
import Sidebar from '../components/Sidebar';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination for Appointments Master Log
  const [apptPage, setApptPage] = useState(0);
  const [apptRowsPerPage, setApptRowsPerPage] = useState(6);

  // Pagination for AI Decisions Audit Trail
  const [decPage, setDecPage] = useState(0);
  const [decRowsPerPage, setDecRowsPerPage] = useState(6);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, decisionsRes, apptsRes] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getDecisions(),
        adminAPI.getAppointments(),
      ]);

      if (analyticsRes.data.success) setAnalytics(analyticsRes.data);
      if (decisionsRes.data.success) setDecisions(decisionsRes.data.decisions || []);
      if (apptsRes.data.success) setAppointments(apptsRes.data.appointments || []);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Estimated completed revenue
  const totalRevenue = useMemo(() => {
    return appointments
      .filter((a) => a.status === 'completed')
      .reduce((sum, a) => sum + (parseFloat(a.doctor_consultation_fee) || 75), 0);
  }, [appointments]);

  // Sliced appointments for current page
  const pagedAppointments = useMemo(() => {
    return appointments.slice(apptPage * apptRowsPerPage, (apptPage + 1) * apptRowsPerPage);
  }, [appointments, apptPage, apptRowsPerPage]);

  // Sliced decisions for current page
  const pagedDecisions = useMemo(() => {
    return decisions.slice(decPage * decRowsPerPage, (decPage + 1) * decRowsPerPage);
  }, [decisions, decPage, decRowsPerPage]);

  // Line Chart: Appointments Per Day
  const lineChartData = {
    labels: analytics?.appointments_per_day?.map((d) => d.date) || [],
    datasets: [
      {
        label: 'Scheduled Appointments',
        data: analytics?.appointments_per_day?.map((d) => d.count) || [],
        borderColor: '#0EA5E9',
        backgroundColor: 'rgba(14, 165, 233, 0.15)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#0EA5E9',
        pointRadius: 4,
      },
    ],
  };

  // Doughnut Chart: Most Requested Specializations
  const doughnutData = {
    labels: analytics?.specialization_distribution?.map((s) => s.specialization) || [],
    datasets: [
      {
        label: 'Doctor Count',
        data: analytics?.specialization_distribution?.map((s) => s.count) || [],
        backgroundColor: [
          '#0EA5E9',
          '#14B8A6',
          '#3B82F6',
          '#8B5CF6',
          '#EC4899',
          '#F59E0B',
          '#10B981',
          '#6366F1',
        ],
        borderWidth: 2,
      },
    ],
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
        {/* Header & Quick Navigation Shortcuts */}
        <Box sx={{ mb: 3.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
              Executive Healthcare Analytics
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Real-time monitoring of patients, clinical workloads, appointments per day, and AI decision telemetry.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<StethoscopeIcon />}
              onClick={() => navigate('/doctors')}
              sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
            >
              Manage Doctors
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<PeopleGroupIcon />}
              onClick={() => navigate('/admin/patients')}
              sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
            >
              Manage Patients
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ApptIcon />}
              onClick={() => navigate('/history')}
              sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
            >
              All Appointments
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress size={45} />
            <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
              Aggregating healthcare analytics and telemetry...
            </Typography>
          </Box>
        ) : (
          <>
            {/* 5 Metric KPI Cards */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={2.4}>
                <Paper sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(14, 165, 233, 0.1)', color: 'primary.main' }}>
                    <PatientIcon fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      TOTAL PATIENTS
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900 }}>
                      {analytics?.metrics?.total_patients || 0}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <Paper sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(20, 184, 166, 0.1)', color: 'secondary.main' }}>
                    <DoctorIcon fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      TOTAL DOCTORS
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900 }}>
                      {analytics?.metrics?.total_doctors || 0}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <Paper sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                    <ApptIcon fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      TOTAL APPOINTMENTS
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900 }}>
                      {analytics?.metrics?.total_appointments || 0}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <Paper sx={{ p: 2.5, borderRadius: 3, border: '1.5px solid rgba(16, 185, 129, 0.3)', bgcolor: 'rgba(16, 185, 129, 0.05)', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                    <MoneyIcon fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      CONSULTATION REVENUE
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#10B981' }}>
                      ${totalRevenue}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <Paper sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
                    <AgentIcon fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      AI DECISIONS LOGGED
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900 }}>
                      {analytics?.metrics?.total_decisions || 0}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Appointment Status Breakdown Pill Bar */}
            <Paper
              sx={{
                p: 2,
                mb: 4,
                borderRadius: 2.5,
                border: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingIcon fontSize="small" sx={{ color: 'primary.main' }} /> LIVE WORKFLOW STATUS:
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={<CompletedIcon fontSize="small" sx={{ color: '#10B981 !important' }} />}
                  label={`Completed: ${analytics?.status_breakdown?.completed || 0}`}
                  sx={{
                    fontWeight: 700,
                    bgcolor: 'rgba(16, 185, 129, 0.12)',
                    color: '#10B981',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                />
                <Chip
                  icon={<ConfirmedIcon fontSize="small" sx={{ color: '#0EA5E9 !important' }} />}
                  label={`Confirmed: ${analytics?.status_breakdown?.confirmed || 0}`}
                  sx={{
                    fontWeight: 700,
                    bgcolor: 'rgba(14, 165, 233, 0.12)',
                    color: '#0EA5E9',
                    border: '1px solid rgba(14, 165, 233, 0.3)',
                  }}
                />
                <Chip
                  icon={<PendingIcon fontSize="small" sx={{ color: '#F59E0B !important' }} />}
                  label={`Pending: ${analytics?.status_breakdown?.pending || 0}`}
                  sx={{
                    fontWeight: 700,
                    bgcolor: 'rgba(245, 158, 11, 0.12)',
                    color: '#F59E0B',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                  }}
                />
                <Chip
                  icon={<CancelIcon fontSize="small" sx={{ color: '#EF4444 !important' }} />}
                  label={`Cancelled: ${analytics?.status_breakdown?.cancelled || 0}`}
                  sx={{
                    fontWeight: 700,
                    bgcolor: 'rgba(239, 68, 68, 0.12)',
                    color: '#EF4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                />
              </Box>
            </Paper>

            {/* Chart.js Analytics Visualizations */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Chart 1: Appointments Per Day */}
              <Grid item xs={12} lg={8}>
                <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider', height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingIcon sx={{ color: 'primary.main' }} /> Appointments Per Day (Past 14 Days)
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                    Trendline tracking daily clinical bookings and agentic consultations.
                  </Typography>
                  <Box sx={{ height: 280 }}>
                    <Line
                      data={lineChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          y: { beginAtZero: true, ticks: { precision: 0 } },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* Chart 2: Most Requested Specialization */}
              <Grid item xs={12} lg={4}>
                <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider', height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Clinical Specializations
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                    Distribution of active medical practitioners by discipline.
                  </Typography>
                  <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Doughnut
                      data={doughnutData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Live Master Appointments Table with Pagination */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 3, border: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ApptIcon sx={{ color: 'primary.main' }} /> All Booked Appointments (Live Master Log)
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    All patient consultations booked via AI autonomous agent or manual scheduling.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip
                    label={`Total: ${appointments.length}`}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    endIcon={<ArrowIcon />}
                    onClick={() => navigate('/history')}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    Manage / Filter All
                  </Button>
                </Box>
              </Box>

              {appointments.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', py: 3, textAlign: 'center' }}>
                  No appointments booked in the system yet.
                </Typography>
              ) : (
                <>
                  <TableContainer>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Patient</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Doctor</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Specialization</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Source</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pagedAppointments.map((appt) => (
                          <TableRow key={appt.id} hover>
                            <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>#{appt.id}</TableCell>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                {appt.patient_name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {appt.patient_phone || appt.patient_email || 'Patient'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                Dr. {appt.doctor_name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {appt.chief_complaint || 'Consultation'}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.85rem' }}>{appt.specialization || 'General'}</TableCell>
                            <TableCell sx={{ fontSize: '0.85rem' }}>
                              <strong>{appt.appointment_date}</strong>
                              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                                {appt.start_time} - {appt.end_time}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={appt.booking_source === 'agent_auto' ? 'AI Agent' : 'Manual'}
                                size="small"
                                color={appt.booking_source === 'agent_auto' ? 'primary' : 'default'}
                                variant="outlined"
                                sx={{ fontSize: '0.68rem', fontWeight: 600, height: 22 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={appt.status?.toUpperCase()}
                                size="small"
                                color={
                                  appt.status === 'confirmed' ? 'success' :
                                  appt.status === 'completed' ? 'primary' :
                                  appt.status === 'cancelled' ? 'error' : 'warning'
                                }
                                sx={{ fontWeight: 700, fontSize: '0.68rem', height: 22 }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    rowsPerPageOptions={[5, 6, 10, 20]}
                    component="div"
                    count={appointments.length}
                    rowsPerPage={apptRowsPerPage}
                    page={apptPage}
                    onPageChange={(e, newPage) => setApptPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setApptRowsPerPage(parseInt(e.target.value, 10));
                      setApptPage(0);
                    }}
                  />
                </>
              )}
            </Paper>

            {/* AI Decision Audit Trail with Pagination */}
            <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AgentIcon sx={{ color: 'secondary.main' }} /> AI Agent Decision Audit Trail
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Historical telemetry of multi-factor scoring matching patients to physicians.
                  </Typography>
                </Box>
                <Chip
                  label={`Total Decisions: ${decisions.length}`}
                  color="secondary"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Box>

              {decisions.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', py: 3, textAlign: 'center' }}>
                  No decisions logged yet. Run a symptom consultation to view audit logs.
                </Typography>
              ) : (
                <>
                  <TableContainer>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Recommended Doctor</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Assigned Slot</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Match Score</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Agent Reasoning Breakdown</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Logged Time</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pagedDecisions.map((dec) => (
                          <TableRow key={dec.id} hover>
                            <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>#{dec.id}</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>
                              {dec.recommended_doctor_name || `Doctor #${dec.recommended_doctor_id}`}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{dec.recommended_slot}</TableCell>
                            <TableCell>
                              <Chip
                                label={`${Math.round(dec.decision_score * 100)}%`}
                                color="success"
                                size="small"
                                sx={{ fontWeight: 800, fontSize: '0.72rem' }}
                              />
                            </TableCell>
                            <TableCell sx={{ maxWidth: 420, fontSize: '0.8rem', lineHeight: 1.4 }}>
                              {dec.decision_reason}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                              {dec.created_at ? new Date(dec.created_at).toLocaleDateString() : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    rowsPerPageOptions={[5, 6, 10, 20]}
                    component="div"
                    count={decisions.length}
                    rowsPerPage={decRowsPerPage}
                    page={decPage}
                    onPageChange={(e, newPage) => setDecPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setDecRowsPerPage(parseInt(e.target.value, 10));
                      setDecPage(0);
                    }}
                  />
                </>
              )}
            </Paper>
          </>
        )}
      </Box>
    </Box>
  );
}
