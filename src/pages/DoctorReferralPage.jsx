import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Avatar,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  MedicalServices as StethoscopeIcon,
  Person as PersonIcon,
  Send as SendIcon,
  LocalHospital as HospitalIcon,
  AccessTime as TimeIcon,
  Medication as MedIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorAPI, patientAPI } from '../api/client';
import Sidebar from '../components/Sidebar';

export default function DoctorReferralPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { doctorId } = useParams();

  const [targetDoctor, setTargetDoctor] = useState(location.state?.targetDoctor || null);
  const [allDoctors, setAllDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const initialPatient = location.state?.selectedPatient;
  const [myPatients, setMyPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState(
    initialPatient?.patient_id || location.state?.patientId || ''
  );

  const [referralForm, setReferralForm] = useState({
    disease_condition: initialPatient?.last_diagnosis || location.state?.disease_condition || '',
    symptom_duration: '',
    current_medications: initialPatient?.last_prescription || '',
    chief_complaints: initialPatient?.chief_complaint || '',
    clinical_notes: '',
    urgency_level: 'routine',
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoadingPatients(true);
    try {
      const [patientsRes, docsRes] = await Promise.all([
        doctorAPI.getMyPatients(),
        patientAPI.getDoctors(),
      ]);

      if (patientsRes.data.success) {
        setMyPatients(patientsRes.data.patients || []);
      }

      if (docsRes.data.success) {
        const docs = docsRes.data.doctors || [];
        setAllDoctors(docs);

        // If targetDoctor wasn't provided via state, resolve by doctorId param
        if (!targetDoctor && doctorId) {
          const matched = docs.find((d) => d.id === parseInt(doctorId, 10));
          if (matched) setTargetDoctor(matched);
        }
      }
    } catch (err) {
      console.error('Failed to load initial referral data:', err);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handlePatientChange = (patientId) => {
    setSelectedPatientId(patientId);
    const chosen = myPatients.find((p) => p.patient_id === patientId);
    if (chosen) {
      setReferralForm((prev) => ({
        ...prev,
        disease_condition: chosen.last_diagnosis || prev.disease_condition,
        chief_complaints: chosen.chief_complaint || prev.chief_complaints,
        current_medications: chosen.last_prescription || prev.current_medications,
      }));
    }
  };

  const handleDoctorChange = (docId) => {
    const doc = allDoctors.find((d) => d.id === docId);
    if (doc) setTargetDoctor(doc);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!targetDoctor) {
      setFeedback({ text: 'Please select a target specialist to refer the patient to.', type: 'error' });
      return;
    }
    if (!selectedPatientId) {
      setFeedback({ text: 'Please select a patient from your consultations list.', type: 'error' });
      return;
    }
    if (!referralForm.disease_condition.trim()) {
      setFeedback({ text: 'Please specify the diagnosis or suspected disease condition.', type: 'error' });
      return;
    }

    const chosenPatient = myPatients.find((p) => p.patient_id === selectedPatientId);

    setSubmitting(true);
    setFeedback({ text: '', type: '' });

    try {
      const payload = {
        referred_to_doctor_id: targetDoctor.id,
        patient_id: selectedPatientId,
        appointment_id: chosenPatient?.last_appointment_id || null,
        disease_condition: referralForm.disease_condition.trim(),
        symptom_duration: referralForm.symptom_duration.trim() || 'Not specified',
        current_medications: referralForm.current_medications.trim() || 'None',
        chief_complaints: referralForm.chief_complaints.trim() || 'Referred for specialized clinical management',
        clinical_notes: referralForm.clinical_notes.trim(),
        urgency_level: referralForm.urgency_level,
      };

      const res = await doctorAPI.sendReferral(payload);
      if (res.data.success) {
        setFeedback({
          text: `Referral successfully dispatched to Dr. ${targetDoctor.full_name?.replace('Dr. ', '')}! Redirecting to Sent Referrals...`,
          type: 'success',
        });
        setTimeout(() => {
          navigate('/doctors', { state: { defaultTab: 2 } });
        }, 1500);
      }
    } catch (err) {
      setFeedback({
        text: err.response?.data?.error || 'Failed to dispatch patient referral.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const chosenPatientDetails = myPatients.find((p) => p.patient_id === selectedPatientId);

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, bgcolor: 'background.default' }}>
        {/* Navigation & Header */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/doctors')}
            sx={{ mb: 1.5, textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
          >
            Back to Doctor Directory
          </Button>

          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Refer Patient to Specialist
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Send comprehensive clinical case details, current medical regimen, and urgency classification to a consulting physician.
          </Typography>
        </Box>

        {feedback.text && (
          <Alert severity={feedback.type} sx={{ mb: 3, borderRadius: 2 }}>
            {feedback.text}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Target Specialist Card */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ borderRadius: 3, border: 1, borderColor: 'primary.200', bgcolor: 'background.paper', position: 'sticky', top: 80 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 1 }}>
                  CONSULTING SPECIALIST
                </Typography>

                {targetDoctor ? (
                  <Box sx={{ mt: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: 'primary.main',
                          fontWeight: 800,
                          fontSize: '1.2rem',
                          boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
                        }}
                      >
                        {targetDoctor.full_name ? targetDoctor.full_name.replace('Dr. ', '')[0] : 'D'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {targetDoctor.full_name}
                        </Typography>
                        <Chip
                          icon={<StethoscopeIcon fontSize="small" />}
                          label={targetDoctor.specialization_name || 'Specialist'}
                          size="small"
                          color="secondary"
                          sx={{ mt: 0.5, fontWeight: 700 }}
                        />
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Qualification:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{targetDoctor.qualification || 'Board Certified'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Experience:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{targetDoctor.experience_years} Years</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Consultation Fee:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>${targetDoctor.consultation_fee}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Clinic Room:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{targetDoctor.room_number || 'Main Consultation Room'}</Typography>
                      </Box>
                    </Box>

                    <Button
                      fullWidth
                      variant="text"
                      color="primary"
                      onClick={() => setTargetDoctor(null)}
                      sx={{ mt: 2.5, textTransform: 'none', fontWeight: 700 }}
                    >
                      Change Consulting Specialist
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      Select a certified physician from the directory to receive this referral:
                    </Typography>
                    <FormControl fullWidth size="small">
                      <InputLabel id="target-doctor-label">Select Specialist</InputLabel>
                      <Select
                        labelId="target-doctor-label"
                        label="Select Specialist"
                        value=""
                        onChange={(e) => handleDoctorChange(e.target.value)}
                      >
                        {allDoctors
                          .filter((d) => d.user_id !== user?.id && d.id !== user?.doctor?.id)
                          .map((d) => (
                            <MenuItem key={d.id} value={d.id}>
                              {d.full_name} ({d.specialization_name})
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Clinical Case Referral Form */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3, border: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Clinical Handover Documentation
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Provide precise clinical details so the receiving specialist has immediate context to proceed with specialized treatment.
              </Typography>

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Patient Selection Dropdown */}
                <FormControl fullWidth required sx={{ '& .MuiInputLabel-root': { bgcolor: 'background.paper', px: 0.8, borderRadius: 0.5 } }}>
                  <InputLabel id="patient-select-label" shrink>Select Patient from Your Consultations</InputLabel>
                  <Select
                    labelId="patient-select-label"
                    value={selectedPatientId}
                    notched
                    label="Select Patient from Your Consultations"
                    onChange={(e) => handlePatientChange(e.target.value)}
                  >
                    {loadingPatients ? (
                      <MenuItem disabled value="">
                        Loading patient records...
                      </MenuItem>
                    ) : myPatients.length === 0 ? (
                      <MenuItem disabled value="">
                        No recent patient consultations found
                      </MenuItem>
                    ) : (
                      myPatients.map((p) => (
                        <MenuItem key={p.patient_id} value={p.patient_id}>
                          {p.full_name} &bull; {p.phone || 'No phone'} (Last Visit: {p.last_appointment_date || 'Recent'})
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                {chosenPatientDetails && (
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>GENDER</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{chosenPatientDetails.gender || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>BLOOD GROUP</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{chosenPatientDetails.blood_group || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>CONTACT</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{chosenPatientDetails.phone || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>LAST CONSULTATION</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{chosenPatientDetails.last_appointment_date || 'Recent'}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                <Grid container spacing={2}>
                  {/* Diagnosis / Condition */}
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      required
                      label="Diagnosis / Suspected Disease Condition"
                      placeholder="e.g. Acute Dilated Cardiomyopathy with Pulmonary Edema"
                      value={referralForm.disease_condition}
                      onChange={(e) => setReferralForm({ ...referralForm, disease_condition: e.target.value })}
                      InputLabelProps={{ shrink: true, sx: { bgcolor: 'background.paper', px: 0.8, borderRadius: 0.5 } }}
                    />
                  </Grid>

                  {/* Symptom Duration */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Condition Duration"
                      placeholder="e.g. 3 weeks, 2 months"
                      value={referralForm.symptom_duration}
                      onChange={(e) => setReferralForm({ ...referralForm, symptom_duration: e.target.value })}
                      InputLabelProps={{ shrink: true, sx: { bgcolor: 'background.paper', px: 0.8, borderRadius: 0.5 } }}
                    />
                  </Grid>
                </Grid>

                {/* Current Medications */}
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Current Medications & Dosages"
                  placeholder="e.g. Tab Metoprolol 25mg OD, Tab Lasix 40mg OD, Tab Aspirin 75mg OD"
                  value={referralForm.current_medications}
                  onChange={(e) => setReferralForm({ ...referralForm, current_medications: e.target.value })}
                  InputLabelProps={{ shrink: true, sx: { bgcolor: 'background.paper', px: 0.8, borderRadius: 0.5 } }}
                />

                {/* Chief Complaints */}
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Chief Complaints & Clinical Presentation"
                  placeholder="e.g. Persistent exertional chest tightness, orthopnea, bilateral lower limb edema"
                  value={referralForm.chief_complaints}
                  onChange={(e) => setReferralForm({ ...referralForm, chief_complaints: e.target.value })}
                  InputLabelProps={{ shrink: true, sx: { bgcolor: 'background.paper', px: 0.8, borderRadius: 0.5 } }}
                />

                {/* Reason for Specialist Referral */}
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Reason for Specialist Referral & Clinical Notes"
                  placeholder="e.g. Patient requires tertiary 2D-Echocardiography, Holter monitoring, and electrophysiology evaluation. Exceeds primary clinic setup."
                  value={referralForm.clinical_notes}
                  onChange={(e) => setReferralForm({ ...referralForm, clinical_notes: e.target.value })}
                  InputLabelProps={{ shrink: true, sx: { bgcolor: 'background.paper', px: 0.8, borderRadius: 0.5 } }}
                />

                {/* Urgency Level */}
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default', border: 1, borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                    CLINICAL URGENCY LEVEL
                  </Typography>
                  <RadioGroup
                    row
                    value={referralForm.urgency_level}
                    onChange={(e) => setReferralForm({ ...referralForm, urgency_level: e.target.value })}
                  >
                    <FormControlLabel
                      value="routine"
                      control={<Radio size="small" />}
                      label="Routine (Review within 3-7 days)"
                    />
                    <FormControlLabel
                      value="urgent"
                      control={<Radio size="small" color="warning" />}
                      label="Urgent (Review within 24-48 hours)"
                    />
                    <FormControlLabel
                      value="emergency"
                      control={<Radio size="small" color="error" />}
                      label="Emergency (Immediate tertiary handover)"
                    />
                  </RadioGroup>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => navigate('/doctors')}
                    sx={{ textTransform: 'none', fontWeight: 600, px: 3 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    sx={{
                      fontWeight: 700,
                      px: 4,
                      py: 1.2,
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #0284C7, #0369A1)',
                    }}
                  >
                    {submitting ? 'Sending Referral...' : `Send Referral to Dr. ${targetDoctor?.full_name?.replace('Dr. ', '') || 'Specialist'} ➜`}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
