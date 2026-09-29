import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  NoteAlt as NoteIcon,
  CalendarToday as CalendarIcon,
  PendingActions as PendingIcon,
  Check as CompletedIcon,
  CloudUpload as UploadIcon,
  AttachFile as AttachFileIcon,
  DeleteOutline as DeleteIcon,
  OpenInNew as OpenIcon,
  PictureAsPdf as PdfIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import { doctorAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    today_appointments: [],
    pending_appointments: [],
    all_appointments: [],
  });
  const [loading, setLoading] = useState(true);

  // Notes Modal state
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [noteForm, setNoteForm] = useState({
    diagnosis: '',
    prescription: '',
    prescription_file_url: '',
    prescription_filename: '',
    clinical_notes: '',
    follow_up_date: '',
  });
  const [uploadingPrescription, setUploadingPrescription] = useState(false);
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await doctorAPI.getAppointments();
      if (res.data.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Failed to load doctor appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await doctorAPI.approveAppointment(id);
      setActionSuccess('Appointment approved successfully.');
      fetchAppointments();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve.');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejection:', 'Doctor emergency rescheduling required');
    if (!reason) return;
    try {
      await doctorAPI.rejectAppointment(id, reason);
      setActionSuccess('Appointment rejected.');
      fetchAppointments();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject.');
    }
  };

  const handleOpenNoteModal = async (appt) => {
    setActiveAppointment(appt);
    setNoteForm({
      diagnosis: '',
      prescription: '',
      prescription_file_url: '',
      prescription_filename: '',
      clinical_notes: '',
      follow_up_date: '',
    });
    try {
      const res = await doctorAPI.getNotes(appt.id);
      if (res.data.success && res.data.notes) {
        const n = res.data.notes;
        setNoteForm({
          diagnosis: n.diagnosis || '',
          prescription: n.prescription || '',
          prescription_file_url: n.prescription_file_url || '',
          prescription_filename: n.prescription_file_url ? n.prescription_file_url.split('/').pop() : '',
          clinical_notes: n.clinical_notes || '',
          follow_up_date: n.follow_up_date || '',
        });
      }
    } catch (err) {
      // No existing notes, keep blank form
    }
    setNoteModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPrescription(true);
    try {
      const res = await doctorAPI.uploadPrescription(file);
      if (res.data.success) {
        setNoteForm((prev) => ({
          ...prev,
          prescription_file_url: res.data.file_url,
          prescription_filename: res.data.filename,
        }));
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload prescription file.');
    } finally {
      setUploadingPrescription(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!activeAppointment || !noteForm.diagnosis.trim()) {
      alert('Diagnosis is required.');
      return;
    }

    setNoteSubmitting(true);
    try {
      await doctorAPI.addNotes({
        appointment_id: activeAppointment.id,
        diagnosis: noteForm.diagnosis,
        prescription: noteForm.prescription,
        prescription_file_url: noteForm.prescription_file_url || null,
        clinical_notes: noteForm.clinical_notes,
        follow_up_date: noteForm.follow_up_date || null,
      });
      setNoteModalOpen(false);
      setActionSuccess('Medical notes & prescription recorded! Consultation marked as Completed.');
      fetchAppointments();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save notes.');
    } finally {
      setNoteSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default' }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Doctor Clinical Portal
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Welcome, Dr. {user?.full_name}. Manage patient requests, consultation logs, and medical records.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<CalendarIcon />}
            onClick={() => navigate('/doctor/availability')}
            sx={{
              borderRadius: 2,
              px: 2.5,
              py: 1.2,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #10B981, #059669)',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669, #047857)',
              }
            }}
          >
            Manage Availability (Week & Month)
          </Button>
        </Box>

        {actionSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {actionSuccess}
          </Alert>
        )}

        {/* Metric Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(14, 165, 233, 0.1)', color: 'primary.main' }}>
                <CalendarIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  TODAY'S CONSULTATIONS
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {dashboardData.today_appointments?.length || 0}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                <PendingIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  PENDING APPROVAL
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {dashboardData.pending_appointments?.length || 0}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(20, 184, 166, 0.1)', color: 'secondary.main' }}>
                <CompletedIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  TOTAL PATIENTS SERVED
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {dashboardData.all_appointments?.length || 0}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
        ) : (
          <Grid container spacing={3}>
            {/* Today's Appointments Table */}
            <Grid item xs={12} lg={7}>
              <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Today's Consultations Schedule
                </Typography>
                {dashboardData.today_appointments.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary', py: 3, textAlign: 'center' }}>
                    No consultations scheduled for today.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Patient</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Chief Complaint</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="right">Notes</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dashboardData.today_appointments.map((appt) => (
                          <TableRow key={appt.id} hover>
                            <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                              {appt.start_time} - {appt.end_time}
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {appt.patient_name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {appt.patient_phone || appt.patient_email}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ maxWidth: 200, fontSize: '0.82rem' }}>
                              {appt.chief_complaint || 'General Consultation'}
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  startIcon={<NoteIcon />}
                                  onClick={() => handleOpenNoteModal(appt)}
                                  sx={{ fontWeight: 600 }}
                                >
                                  Notes
                                </Button>
                                <Tooltip title="Refer to Another Specialist">
                                  <IconButton
                                    size="small"
                                    color="secondary"
                                    onClick={() => navigate('/doctors')}
                                  >
                                    <SwapHorizIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>

            {/* Pending Requests Table */}
            <Grid item xs={12} lg={5}>
              <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Pending Appointment Requests
                </Typography>
                {dashboardData.pending_appointments.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary', py: 3, textAlign: 'center' }}>
                    No pending booking requests pending approval.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Patient</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Requested Slot</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dashboardData.pending_appointments.map((appt) => (
                          <TableRow key={appt.id} hover>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {appt.patient_name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {appt.chief_complaint}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {appt.appointment_date}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {appt.start_time}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Approve">
                                <IconButton size="small" color="success" onClick={() => handleApprove(appt.id)}>
                                  <ApproveIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton size="small" color="error" onClick={() => handleReject(appt.id)}>
                                  <RejectIcon fontSize="small" />
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
          </Grid>
        )}

        {/* Patient Notes & Prescription Dialog */}
        <Dialog open={noteModalOpen} onClose={() => setNoteModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 800 }}>
            Clinical Notes & Prescription &bull; {activeAppointment?.patient_name}
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                fullWidth
                required
                label="Diagnosis"
                placeholder="e.g. Acute Viral Bronchitis with mild pyrexia"
                value={noteForm.diagnosis}
                onChange={(e) => setNoteForm({ ...noteForm, diagnosis: e.target.value })}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Prescription & Dosages (Text)"
                placeholder="e.g. Paracetamol 500mg TDS for 3 days, Azithromycin 500mg OD"
                value={noteForm.prescription}
                onChange={(e) => setNoteForm({ ...noteForm, prescription: e.target.value })}
              />

              {/* Upload Prescription Document / Scan */}
              <Box sx={{ p: 2, border: '1px dashed', borderColor: 'primary.main', borderRadius: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachFileIcon fontSize="small" color="primary" /> Upload Prescription Document / Scan (PDF or Image)
                </Typography>
                
                {noteForm.prescription_file_url ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'background.paper', p: 1.5, borderRadius: 1.5, border: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                      <PdfIcon color="error" />
                      <Typography variant="body2" sx={{ fontWeight: 600, noWrap: true }}>
                        {noteForm.prescription_filename || 'Uploaded Prescription'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<OpenIcon />}
                        href={noteForm.prescription_file_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </Button>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setNoteForm(prev => ({ ...prev, prescription_file_url: '', prescription_filename: '' }))}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<UploadIcon />}
                      disabled={uploadingPrescription}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      {uploadingPrescription ? 'Uploading...' : 'Choose File (PDF, PNG, JPG)'}
                      <input
                        type="file"
                        hidden
                        accept=".pdf,image/png,image/jpeg,image/webp"
                        onChange={handleFileUpload}
                      />
                    </Button>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Upload handwritten scan, digital PDF, or photo of prescription
                    </Typography>
                  </Box>
                )}
              </Box>

              <TextField
                fullWidth
                multiline
                rows={2}
                label="Clinical Advice / Lifestyle Notes"
                placeholder="e.g. Hydration, steam inhalation twice daily, review if fever persists."
                value={noteForm.clinical_notes}
                onChange={(e) => setNoteForm({ ...noteForm, clinical_notes: e.target.value })}
              />
              <TextField
                fullWidth
                type="date"
                label="Follow-up Date"
                InputLabelProps={{ shrink: true }}
                value={noteForm.follow_up_date}
                onChange={(e) => setNoteForm({ ...noteForm, follow_up_date: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<SwapHorizIcon />}
              onClick={() => {
                setNoteModalOpen(false);
                navigate('/doctors');
              }}
              sx={{ fontWeight: 700, textTransform: 'none' }}
            >
              Refer to Another Specialist ➜
            </Button>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={() => setNoteModalOpen(false)} color="inherit">
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                disabled={noteSubmitting}
                onClick={handleSaveNotes}
                sx={{ fontWeight: 700 }}
              >
                {noteSubmitting ? 'Saving...' : 'Save & Complete Consultation'}
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
