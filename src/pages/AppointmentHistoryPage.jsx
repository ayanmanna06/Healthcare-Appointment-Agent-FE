import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Cancel as CancelIcon,
  EventRepeat as RescheduleIcon,
  Visibility as ViewNotesIcon,
  FilterList as FilterIcon,
  PictureAsPdf as PdfIcon,
  OpenInNew as OpenIcon,
  CheckCircle as ApproveIcon,
} from '@mui/icons-material';
import { patientAPI, doctorAPI, adminAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

export default function AppointmentHistoryPage() {
  const { role } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Cancel Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [targetAppt, setTargetAppt] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Reschedule Modal
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00');

  // Notes Modal
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [viewNotes, setViewNotes] = useState(null);

  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchAppointments();
  }, [role]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let res;
      if (role === 'admin') {
        res = await adminAPI.getAppointments();
        if (res.data.success) setAppointments(res.data.appointments || []);
      } else if (role === 'doctor') {
        res = await doctorAPI.getAppointments();
        if (res.data.success) setAppointments(res.data.all_appointments || []);
      } else {
        res = await patientAPI.getAppointments();
        if (res.data.success) setAppointments(res.data.appointments || []);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubmit = async () => {
    if (!targetAppt) return;
    try {
      await patientAPI.cancelAppointment({
        appointment_id: targetAppt.id,
        reason: cancelReason || 'User requested cancellation',
      });
      setMessage({ text: 'Appointment cancelled successfully.', type: 'success' });
      setCancelModalOpen(false);
      fetchAppointments();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Cancellation failed.', type: 'error' });
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!targetAppt || !newDate || !newTime) {
      alert('Please select both a new date and time.');
      return;
    }
    try {
      await patientAPI.rescheduleAppointment({
        appointment_id: targetAppt.id,
        new_date: newDate,
        new_start_time: newTime,
      });
      setMessage({ text: 'Appointment rescheduled successfully. Notification email sent.', type: 'success' });
      setRescheduleModalOpen(false);
      fetchAppointments();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Rescheduling failed.', type: 'error' });
    }
  };

  const handleApprove = async (apptId) => {
    try {
      await doctorAPI.approveAppointment(apptId);
      setMessage({ text: 'Appointment approved successfully.', type: 'success' });
      fetchAppointments();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to approve appointment.', type: 'error' });
    }
  };

  const handleReject = async (apptId) => {
    const reason = prompt('Please enter reason for rejection:', 'Schedule conflict / Doctor unavailable');
    if (!reason) return;
    try {
      await doctorAPI.rejectAppointment(apptId, reason);
      setMessage({ text: 'Appointment rejected.', type: 'success' });
      fetchAppointments();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to reject appointment.', type: 'error' });
    }
  };

  const handleOpenNotes = async (appt) => {
    try {
      const res = await doctorAPI.getNotes(appt.id);
      if (res.data.success) {
        setViewNotes(res.data.notes);
        setNotesModalOpen(true);
      }
    } catch (err) {
      alert('No clinical notes recorded yet for this appointment.');
    }
  };

  const filtered = appointments.filter((a) => {
    if (statusFilter === 'All') return true;
    return a.status.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default' }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {role === 'admin' ? 'Practice-Wide Appointments & Master Schedule' : 'Appointment Records & Scheduling History'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {role === 'admin'
                ? 'Master administrative log of all booked consultations across all network physicians, patients, and AI agents.'
                : 'Track past and upcoming clinical consultations, download notes, or reschedule openings.'}
            </Typography>
          </Box>
          <TextField
            select
            size="small"
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="All">All Statuses</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </TextField>
        </Box>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ text: '', type: '' })}>
            {message.text}
          </Alert>
        )}

        <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
          ) : filtered.length === 0 ? (
            <Typography variant="body2" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              No appointments found matching filter criteria.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                    {role === 'admin' ? (
                      <>
                        <TableCell sx={{ fontWeight: 700 }}>Patient</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Doctor</TableCell>
                      </>
                    ) : (
                      <TableCell sx={{ fontWeight: 700 }}>{role === 'doctor' ? 'Patient' : 'Doctor'}</TableCell>
                    )}
                    <TableCell sx={{ fontWeight: 700 }}>Specialization</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Source</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((appt) => (
                    <TableRow key={appt.id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>#A{appt.id}</TableCell>
                      {role === 'admin' ? (
                        <>
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {appt.patient_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {appt.patient_phone || appt.patient_email || 'Patient'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              Dr. {appt.doctor_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {appt.chief_complaint || 'Consultation'}
                            </Typography>
                          </TableCell>
                        </>
                      ) : (
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {role === 'doctor' ? appt.patient_name : `Dr. ${appt.doctor_name}`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {appt.chief_complaint || 'General Checkup'}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell>{appt.specialization || 'Clinical Care'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{appt.appointment_date}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {appt.start_time} - {appt.end_time}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={appt.booking_source === 'agent_auto' ? 'AI Agent' : 'Manual'}
                          size="small"
                          color={appt.booking_source === 'agent_auto' ? 'primary' : 'default'}
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={appt.cancellation_reason ? `Cancellation Reason: ${appt.cancellation_reason}` : `Status: ${appt.status}`}>
                          <Chip
                            label={appt.status.toUpperCase()}
                            size="small"
                            color={
                              appt.status === 'confirmed' ? 'success' :
                              appt.status === 'completed' ? 'primary' :
                              appt.status === 'cancelled' ? 'error' : 'warning'
                            }
                            sx={{ fontWeight: 700, fontSize: '0.68rem', cursor: appt.cancellation_reason ? 'help' : 'default' }}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          {/* Completed: View Notes */}
                          {appt.status === 'completed' && (
                            <Tooltip title="View Clinical Notes">
                              <IconButton size="small" color="primary" onClick={() => handleOpenNotes(appt)}>
                                <ViewNotesIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {/* Pending: Doctor / Admin can Approve or Reject */}
                          {appt.status === 'pending' && (
                            <>
                              {(role === 'doctor' || role === 'admin') && (
                                <Tooltip title="Approve Appointment">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => handleApprove(appt.id)}
                                  >
                                    <ApproveIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title={role === 'doctor' || role === 'admin' ? 'Reject Request' : 'Cancel Request'}>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    if (role === 'doctor' || role === 'admin') {
                                      handleReject(appt.id);
                                    } else {
                                      setTargetAppt(appt);
                                      setCancelModalOpen(true);
                                    }
                                  }}
                                >
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}

                          {/* Confirmed: Reschedule or Cancel */}
                          {appt.status === 'confirmed' && (
                            <>
                              <Tooltip title="Reschedule">
                                <IconButton
                                  size="small"
                                  color="secondary"
                                  onClick={() => {
                                    setTargetAppt(appt);
                                    setNewDate(appt.appointment_date);
                                    setRescheduleModalOpen(true);
                                  }}
                                >
                                  <RescheduleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Cancel">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setTargetAppt(appt);
                                    setCancelModalOpen(true);
                                  }}
                                >
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Cancel Modal */}
        <Dialog open={cancelModalOpen} onClose={() => setCancelModalOpen(false)}>
          <DialogTitle sx={{ fontWeight: 800 }}>Cancel Appointment #A{targetAppt?.id}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Are you sure you want to cancel your consultation with Dr. {targetAppt?.doctor_name}?
            </Typography>
            <TextField
              fullWidth
              label="Reason for cancellation"
              placeholder="e.g. Schedule conflict"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setCancelModalOpen(false)} color="inherit">Keep Appointment</Button>
            <Button variant="contained" color="error" onClick={handleCancelSubmit}>Confirm Cancellation</Button>
          </DialogActions>
        </Dialog>

        {/* Reschedule Modal */}
        <Dialog open={rescheduleModalOpen} onClose={() => setRescheduleModalOpen(false)}>
          <DialogTitle sx={{ fontWeight: 800 }}>Reschedule Appointment #A{targetAppt?.id}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, minWidth: 320 }}>
              <TextField
                fullWidth
                type="date"
                label="New Appointment Date"
                InputLabelProps={{ shrink: true }}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
              <TextField
                select
                fullWidth
                label="New Start Time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              >
                {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'].map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setRescheduleModalOpen(false)} color="inherit">Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleRescheduleSubmit}>Save New Time</Button>
          </DialogActions>
        </Dialog>

        {/* View Medical Notes Modal */}
        <Dialog open={notesModalOpen} onClose={() => setNotesModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 800 }}>Physician Consultation Notes</DialogTitle>
          <DialogContent dividers>
            {viewNotes && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>DIAGNOSIS:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{viewNotes.diagnosis}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>PRESCRIPTION:</Typography>
                  <Typography variant="body2" sx={{ bgcolor: 'background.default', p: 1.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                    {viewNotes.prescription || 'No medications prescribed.'}
                  </Typography>
                </Box>
                {viewNotes.prescription_file_url && (
                  <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.200', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <PdfIcon color="error" sx={{ fontSize: 32 }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          Official Doctor's Prescription File
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Uploaded medical prescription / scanned document
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<OpenIcon />}
                      href={viewNotes.prescription_file_url}
                      target="_blank"
                      rel="noreferrer"
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      View / Download
                    </Button>
                  </Box>
                )}
                {viewNotes.clinical_notes && (
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>CLINICAL ADVICE:</Typography>
                    <Typography variant="body2">{viewNotes.clinical_notes}</Typography>
                  </Box>
                )}
                {viewNotes.follow_up_date && (
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>FOLLOW-UP REQUIRED BY:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{viewNotes.follow_up_date}</Typography>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setNotesModalOpen(false)} color="inherit">Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
