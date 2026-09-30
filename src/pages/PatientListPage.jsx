import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  Search as SearchIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as InactiveIcon,
  CheckCircle as ActiveIcon,
  HistoryEdu as HistoryEduIcon,
  ViewList as ListIcon,
  ViewModule as GridIcon,
  CalendarToday as CalendarIcon,
  LocalHospital as HospitalIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Bloodtype as BloodIcon,
  Home as HomeIcon,
  MedicalInformation as MedInfoIcon,
} from '@mui/icons-material';
import { adminAPI } from '../api/client';
import Sidebar from '../components/Sidebar';

export default function PatientListPage() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [metrics, setMetrics] = useState({
    total_patients: 0,
    active_patients: 0,
    inactive_patients: 0,
    today_patients: 0,
    total_appointments: 0,
  });
  const [loading, setLoading] = useState(true);

  // View mode: 'table' or 'grid'
  const [viewMode, setViewMode] = useState('table');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bloodFilter, setBloodFilter] = useState('all');

  // Create / Edit Modal state
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  const defaultForm = {
    full_name: '',
    email: '',
    password: '',
    phone: '',
    date_of_birth: '',
    gender: 'Male',
    blood_group: 'O+',
    emergency_contact: '',
    address: '',
    medical_history: '',
  };
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPatients();
      if (res.data.success) {
        setPatients(res.data.patients || []);
        if (res.data.metrics) {
          setMetrics(res.data.metrics);
        }
      }
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingPatient(null);
    setFormData(defaultForm);
    setFeedback({ text: '', type: '' });
    setPatientModalOpen(true);
  };

  const handleOpenEditModal = (patient) => {
    setEditingPatient(patient);
    setFormData({
      full_name: patient.full_name || '',
      email: patient.email || '',
      password: '',
      phone: patient.phone || '',
      date_of_birth: patient.date_of_birth || '',
      gender: patient.gender || 'Male',
      blood_group: patient.blood_group || 'O+',
      emergency_contact: patient.emergency_contact || '',
      address: patient.address || '',
      medical_history: patient.medical_history || '',
    });
    setFeedback({ text: '', type: '' });
    setPatientModalOpen(true);
  };

  const handleSavePatient = async () => {
    if (!formData.full_name.trim() || !formData.email.trim()) {
      setFeedback({ text: 'Patient full name and email address are required.', type: 'error' });
      return;
    }
    setModalLoading(true);
    setFeedback({ text: '', type: '' });
    try {
      if (editingPatient) {
        const res = await adminAPI.updatePatient(editingPatient.id, formData);
        if (res.data.success) {
          setFeedback({ text: res.data.message || 'Patient updated successfully.', type: 'success' });
          setTimeout(() => {
            setPatientModalOpen(false);
            fetchPatients();
          }, 800);
        }
      } else {
        const res = await adminAPI.createPatient(formData);
        if (res.data.success) {
          setFeedback({ text: res.data.message || 'New patient onboarded successfully.', type: 'success' });
          setTimeout(() => {
            setPatientModalOpen(false);
            fetchPatients();
          }, 800);
        }
      }
    } catch (err) {
      setFeedback({
        text: err.response?.data?.error || 'Operation failed. Please verify submitted fields.',
        type: 'error',
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async (patient) => {
    try {
      const res = await adminAPI.togglePatientStatus(patient.id);
      if (res.data.success) {
        fetchPatients();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to toggle patient status.');
    }
  };

  const handleDeletePatient = async (patient) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently remove patient "${patient.full_name}"? All associated appointment records will be deleted.`
      )
    ) {
      return;
    }
    try {
      const res = await adminAPI.deletePatient(patient.id);
      if (res.data.success) {
        fetchPatients();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete patient.');
    }
  };

  const filteredPatients = useMemo(() => {
    let list = patients;

    // Filter tab
    if (statusFilter === 'active') {
      list = list.filter((p) => p.is_active);
    } else if (statusFilter === 'inactive') {
      list = list.filter((p) => !p.is_active);
    } else if (statusFilter === 'has_appointments') {
      list = list.filter((p) => (p.total_appointments || 0) > 0);
    } else if (statusFilter === 'today') {
      list = list.filter((p) => p.has_today_appointment);
    }

    // Blood group filter
    if (bloodFilter !== 'all') {
      list = list.filter((p) => p.blood_group === bloodFilter);
    }

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          (p.full_name && p.full_name.toLowerCase().includes(q)) ||
          (p.email && p.email.toLowerCase().includes(q)) ||
          (p.phone && p.phone.includes(q)) ||
          (p.address && p.address.toLowerCase().includes(q)) ||
          (p.blood_group && p.blood_group.toLowerCase().includes(q)) ||
          (p.medical_history && p.medical_history.toLowerCase().includes(q))
      );
    }

    return list;
  }, [patients, statusFilter, bloodFilter, searchTerm]);

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
        {/* Header Title & Onboard Button */}
        <Box sx={{ mb: 3.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
              Patient Management
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Network-wide patient roster, clinical histories, health profiles, and appointment records.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, next) => next && setViewMode(next)}
              size="small"
              sx={{ bgcolor: 'background.paper' }}
            >
              <ToggleButton value="table">
                <Tooltip title="Table View">
                  <ListIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="grid">
                <Tooltip title="Cards View">
                  <GridIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>

            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={handleOpenCreateModal}
              sx={{ fontWeight: 800, textTransform: 'none', px: 2.5, py: 1 }}
            >
              Onboard New Patient
            </Button>
          </Box>
        </Box>

        {/* 5 Summary Metric Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1.5px solid rgba(14, 165, 233, 0.3)', bgcolor: 'rgba(14, 165, 233, 0.06)', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: 0.5, display: 'block' }}>
                TOTAL PATIENTS
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#0EA5E9', my: 0.5 }}>
                {metrics.total_patients || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Registered Profiles
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: 0.5, display: 'block' }}>
                ACTIVE ACCOUNTS
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#10B981', my: 0.5 }}>
                {metrics.active_patients || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Can book visits
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1.5px solid rgba(245, 158, 11, 0.3)', bgcolor: 'rgba(245, 158, 11, 0.06)', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: 0.5, display: 'block' }}>
                TODAY'S SCHEDULED
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#F59E0B', my: 0.5 }}>
                {metrics.today_patients || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Consultations today
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: 0.5, display: 'block' }}>
                TOTAL CONSULTATIONS
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#8B5CF6', my: 0.5 }}>
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
                INACTIVE / ON HOLD
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: 'text.secondary', my: 0.5 }}>
                {metrics.inactive_patients || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Access suspended
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Search & Filter Toolbar */}
        <Paper elevation={1} sx={{ p: 2.5, mb: 4, borderRadius: 3, border: 1, borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by patient name, email, phone, medical history..."
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

            <Grid item xs={12} md={4}>
              <Tabs
                value={statusFilter}
                onChange={(e, val) => setStatusFilter(val)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    minHeight: 38,
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textTransform: 'none',
                  },
                }}
              >
                <Tab label={`All (${patients.length})`} value="all" />
                <Tab label="Active" value="active" />
                <Tab label="Today's Queue" value="today" />
                <Tab label="Has Bookings" value="has_appointments" />
                <Tab label="Inactive" value="inactive" />
              </Tabs>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Blood Group Filter"
                value={bloodFilter}
                onChange={(e) => setBloodFilter(e.target.value)}
              >
                <MenuItem value="all">All Blood Groups</MenuItem>
                <MenuItem value="A+">A+</MenuItem>
                <MenuItem value="A-">A-</MenuItem>
                <MenuItem value="B+">B+</MenuItem>
                <MenuItem value="B-">B-</MenuItem>
                <MenuItem value="AB+">AB+</MenuItem>
                <MenuItem value="AB-">AB-</MenuItem>
                <MenuItem value="O+">O+</MenuItem>
                <MenuItem value="O-">O-</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* Content Area */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress size={45} />
            <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
              Loading patient roster and clinical profiles...
            </Typography>
          </Box>
        ) : filteredPatients.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: 1, borderColor: 'divider' }}>
            <PeopleIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              No Patients Found
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 450, mx: 'auto', mt: 0.5 }}>
              {searchTerm || statusFilter !== 'all' || bloodFilter !== 'all'
                ? 'Try adjusting your search query or filter settings.'
                : 'No patients are currently registered in the clinical database. Use the button above to onboard a patient.'}
            </Typography>
          </Paper>
        ) : viewMode === 'table' ? (
          /* Table View */
          <Paper sx={{ borderRadius: 3, border: 1, borderColor: 'divider', overflow: 'hidden' }}>
            <TableContainer>
              <Table size="medium">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Patient Details</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Demographics</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Blood Group</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Appointments</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Medical History / Notes</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Account Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Management Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: 'secondary.main', fontWeight: 800, width: 42, height: 42 }}>
                            {patient.full_name ? patient.full_name[0].toUpperCase() : 'P'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                              {patient.full_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                              {patient.email || 'No email'} &bull; {patient.phone || 'No phone'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {patient.gender || 'Not specified'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          DOB: {patient.date_of_birth || 'Not recorded'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {patient.blood_group ? (
                          <Chip
                            icon={<BloodIcon fontSize="small" sx={{ color: '#EF4444 !important' }} />}
                            label={patient.blood_group}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              bgcolor: 'rgba(239, 68, 68, 0.12)',
                              color: '#EF4444',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                            }}
                          />
                        ) : (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Unknown
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {patient.total_appointments || 0} Total
                          </Typography>
                          {patient.has_today_appointment && (
                            <Chip
                              label="Today"
                              size="small"
                              color="warning"
                              sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20 }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {patient.upcoming_appointments || 0} upcoming &bull; {patient.completed_appointments || 0} completed
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ maxWidth: 220 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {patient.medical_history || 'No recorded pre-existing conditions'}
                        </Typography>
                        {patient.emergency_contact && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            Emergency: {patient.emergency_contact}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={patient.is_active ? 'ACTIVE' : 'INACTIVE'}
                          size="small"
                          color={patient.is_active ? 'success' : 'default'}
                          sx={{ fontWeight: 800, fontSize: '0.68rem' }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="View Complete Consultation & Appointment History">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => navigate(`/admin/patients/${patient.id}/history`, { state: { patient } })}
                              sx={{
                                bgcolor: 'rgba(20, 184, 166, 0.12)',
                                border: '1px solid rgba(20, 184, 166, 0.3)',
                                '&:hover': { bgcolor: 'rgba(20, 184, 166, 0.25)' },
                              }}
                            >
                              <HistoryEduIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit Patient Details">
                            <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(patient)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={patient.is_active ? 'Suspend / Deactivate Account' : 'Activate Patient Account'}>
                            <IconButton
                              size="small"
                              color={patient.is_active ? 'warning' : 'success'}
                              onClick={() => handleToggleStatus(patient)}
                            >
                              {patient.is_active ? <InactiveIcon fontSize="small" /> : <ActiveIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Permanently Delete Patient">
                            <IconButton size="small" color="error" onClick={() => handleDeletePatient(patient)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ) : (
          /* Grid / Cards View */
          <Grid container spacing={3}>
            {filteredPatients.map((patient) => (
              <Grid item xs={12} sm={6} md={4} key={patient.id}>
                <Card sx={{ height: '100%', borderRadius: 3, border: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'secondary.main', fontWeight: 800, width: 48, height: 48 }}>
                          {patient.full_name ? patient.full_name[0].toUpperCase() : 'P'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                            {patient.full_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Patient ID: #{patient.id}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={patient.is_active ? 'ACTIVE' : 'INACTIVE'}
                        size="small"
                        color={patient.is_active ? 'success' : 'default'}
                        sx={{ fontWeight: 800, fontSize: '0.68rem' }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {patient.blood_group && (
                        <Chip
                          icon={<BloodIcon fontSize="small" sx={{ color: '#EF4444 !important' }} />}
                          label={`Blood: ${patient.blood_group}`}
                          size="small"
                          sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}
                        />
                      )}
                      <Chip
                        label={`Gender: ${patient.gender || 'N/A'}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.72rem', fontWeight: 600 }}
                      />
                      {patient.has_today_appointment && (
                        <Chip
                          label="Scheduled Today"
                          size="small"
                          color="warning"
                          sx={{ fontSize: '0.72rem', fontWeight: 800 }}
                        />
                      )}
                    </Box>

                    <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.82rem' }}>
                        <EmailIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
                        {patient.email || 'No email recorded'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.82rem' }}>
                        <PhoneIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
                        {patient.phone || 'No phone recorded'}
                      </Typography>
                      {patient.address && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.82rem' }}>
                          <HomeIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
                          {patient.address}
                        </Typography>
                      )}
                    </Box>

                    <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.default', mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                          TOTAL BOOKINGS
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {patient.total_appointments || 0} Appointments
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                        {patient.upcoming_appointments || 0} Upcoming &bull; {patient.completed_appointments || 0} Completed
                      </Typography>
                    </Paper>

                    {patient.medical_history && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                          MEDICAL HISTORY:
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.primary' }}>
                          {patient.medical_history}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <Box sx={{ p: 1.5, pt: 0, display: 'flex', justifyContent: 'space-between', borderTop: 1, borderColor: 'divider' }}>
                    <Button
                      size="small"
                      startIcon={<HistoryEduIcon />}
                      color="secondary"
                      onClick={() => navigate(`/admin/patients/${patient.id}/history`, { state: { patient } })}
                      sx={{ fontWeight: 700, textTransform: 'none' }}
                    >
                      History
                    </Button>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(patient)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color={patient.is_active ? 'warning' : 'success'}
                        onClick={() => handleToggleStatus(patient)}
                      >
                        {patient.is_active ? <InactiveIcon fontSize="small" /> : <ActiveIcon fontSize="small" />}
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeletePatient(patient)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Onboard / Edit Patient Dialog */}
        <Dialog
          open={patientModalOpen}
          onClose={() => setPatientModalOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 800 }}>
            {editingPatient ? `Edit Patient Profile: ${editingPatient.full_name}` : 'Onboard New Patient'}
          </DialogTitle>
          <DialogContent dividers>
            {feedback.text && (
              <Alert severity={feedback.type} sx={{ mb: 2 }}>
                {feedback.text}
              </Alert>
            )}

            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Full Name *"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. John Doe"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email Address *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </Grid>

              {!editingPatient && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Default Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Defaults to Patient@123"
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={editingPatient ? 12 : 6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1-555-0199"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Date of Birth"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Blood Group"
                  value={formData.blood_group}
                  onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                >
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Emergency Contact (Name & Phone)"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  placeholder="e.g. Jane Doe (+1-555-0188)"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Residential Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, City, State, ZIP"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  label="Medical History / Pre-existing Conditions / Allergies"
                  value={formData.medical_history}
                  onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                  placeholder="e.g. Asthma, Penicillin allergy, Hypertension..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setPatientModalOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSavePatient}
              disabled={modalLoading}
              sx={{ fontWeight: 700, px: 3 }}
            >
              {modalLoading ? <CircularProgress size={22} /> : editingPatient ? 'Update Patient' : 'Create Patient'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
