import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  People as PatientIcon,
  LocalHospital as DoctorIcon,
  CalendarMonth as ApptIcon,
  SmartToy as AgentIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
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
  const [analytics, setAnalytics] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, decisionsRes] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getDecisions(),
      ]);

      if (analyticsRes.data.success) setAnalytics(analyticsRes.data);
      if (decisionsRes.data.success) setDecisions(decisionsRes.data.decisions);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

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
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: 'background.default' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Executive Healthcare Analytics
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Real-time monitoring of patients, clinical workloads, appointments per day, and AI decision telemetry.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Metric KPI Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(14, 165, 233, 0.1)', color: 'primary.main' }}>
                    <PatientIcon fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      TOTAL PATIENTS
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                      {analytics?.metrics?.total_patients || 0}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(20, 184, 166, 0.1)', color: 'secondary.main' }}>
                    <DoctorIcon fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      TOTAL DOCTORS
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                      {analytics?.metrics?.total_doctors || 0}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                    <ApptIcon fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      TOTAL APPOINTMENTS
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                      {analytics?.metrics?.total_appointments || 0}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                    <AgentIcon fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      AI DECISIONS LOGGED
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                      {analytics?.metrics?.total_decisions || 0}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Chart.js Analytics Visualizations */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Chart 1: Appointments Per Day */}
              <Grid item xs={12} lg={8}>
                <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
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
                <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
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

            {/* AI Decision Audit Trail */}
            <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AgentIcon sx={{ color: 'secondary.main' }} /> AI Agent Decision Audit Trail
              </Typography>

              {decisions.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', py: 3, textAlign: 'center' }}>
                  No decisions logged yet. Run a symptom consultation to view audit logs.
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
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
                      {decisions.map((dec) => (
                        <TableRow key={dec.id} hover>
                          <TableCell sx={{ fontWeight: 700 }}>#{dec.id}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{dec.recommended_doctor_name || `Doctor #${dec.recommended_doctor_id}`}</TableCell>
                          <TableCell>{dec.recommended_slot}</TableCell>
                          <TableCell>
                            <Chip
                              label={`${Math.round(dec.decision_score * 100)}%`}
                              color="success"
                              size="small"
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>
                          <TableCell sx={{ maxWidth: 350, fontSize: '0.8rem' }}>
                            {dec.decision_reason}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                            {new Date(dec.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </>
        )}
      </Box>
    </Box>
  );
}
