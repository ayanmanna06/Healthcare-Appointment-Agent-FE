import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Alert,
  Paper,
  InputAdornment,
  Tabs,
  Tab,
  Badge,
  Divider,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  EventAvailable as SlotIcon,
  SwapHoriz as SwapHorizIcon,
  MoveToInbox as InboxIcon,
  Outbox as OutboxIcon,
  MedicalServices as StethoscopeIcon,
  CheckCircle as AcceptIcon,
  DoneAll as CompletedIcon,
  Person as PersonIcon,
  Psychology as AIIcon,
  Clear as ClearIcon,
  Check as CheckIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';
import { patientAPI, doctorAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import DoctorCard from '../components/DoctorCard';
import Sidebar from '../components/Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';

export default function DoctorListPage() {
  const { isAuthenticated, role, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isDoctor = role === 'doctor';

  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs for Doctor: 0 = Specialist Referral Network, 1 = Received Referrals, 2 = Sent Referrals
  const [activeTab, setActiveTab] = useState(location.state?.defaultTab ?? 0);

  // Patient Selection for Referral (Step 1)
  const [myPatients, setMyPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [showAllSpecialists, setShowAllSpecialists] = useState(false);

  // Filters (for manual filtering / patient view)
  const [selectedSpec, setSelectedSpec] = useState(location.state?.specialization || 'All');
  const [searchTerm, setSearchTerm] = useState('');
  const [minRating, setMinRating] = useState(0);

  // Slot booking modal (for patients)
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorSlots, setDoctorSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [chosenSlot, setChosenSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState({ text: '', type: '' });

  // Referrals Lists
  const [receivedReferrals, setReceivedReferrals] = useState([]);
  const [sentReferrals, setSentReferrals] = useState([]);
  const [referralsLoading, setReferralsLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
    if (isDoctor) {
      loadDoctorPatients();
      loadReferralsData();
    }
  }, [isDoctor]);

  useEffect(() => {
    if (location.state?.defaultTab !== undefined) {
      setActiveTab(location.state.defaultTab);
    }
  }, [location.state]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [docsRes, specsRes] = await Promise.all([
        patientAPI.getDoctors(),
        patientAPI.getSpecializations(),
      ]);

      if (docsRes.data.success) setDoctors(docsRes.data.doctors || []);
      if (specsRes.data.success) setSpecializations(specsRes.data.specializations || []);
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctorPatients = async () => {
    setLoadingPatients(true);
    try {
      const res = await doctorAPI.getMyPatients();
      if (res.data.success) {
        setMyPatients(res.data.patients || []);
      }
    } catch (err) {
      console.error('Failed to load doctor practice patients:', err);
    } finally {
      setLoadingPatients(false);
    }
  };

  const loadReferralsData = async () => {
    setReferralsLoading(true);
    try {
      const [recRes, sentRes] = await Promise.all([
        doctorAPI.getReceivedReferrals(),
        doctorAPI.getSentReferrals(),
      ]);
      if (recRes.data.success) setReceivedReferrals(recRes.data.referrals || []);
      if (sentRes.data.success) setSentReferrals(sentRes.data.referrals || []);
    } catch (err) {
      console.error('Failed to load referrals:', err);
    } finally {
      setReferralsLoading(false);
    }
  };

  // Find currently selected patient
  const selectedPatient = useMemo(() => {
    return myPatients.find((p) => p.patient_id === selectedPatientId) || null;
  }, [myPatients, selectedPatientId]);

  // Match clinical specialties based on patient complaint and diagnosis
  const matchedSpecialties = useMemo(() => {
    if (!selectedPatient) return [];
    const text = `${selectedPatient.chief_complaint || ''} ${selectedPatient.last_diagnosis || ''}`.toLowerCase();
    const matched = new Set();

    if (/chest|heart|palpitat|breathless|angina|cardiac|hypertens|blood pressure|pulse/i.test(text)) {
      matched.add('Cardiologist');
    }
    if (/headache|migraine|seizure|numb|tingl|dizz|faint|nerve|brain|neurop|stroke|tremor|paraly/i.test(text)) {
      matched.add('Neurologist');
    }
    if (/joint|bone|knee|fracture|back|spine|shoulder|sprain|swelling|leg|hip|arthrit|stiff/i.test(text)) {
      matched.add('Orthopedic');
    }
    if (/skin|rash|itch|acne|eczema|allergy|blister|hair|scalp|dermat/i.test(text)) {
      matched.add('Dermatologist');
    }
    if (/child|baby|infant|kid|toddler|growth|pediatric|colic/i.test(text)) {
      matched.add('Pediatrician');
    }
    if (/ear|nose|throat|sinus|hearing|cough|tonsil|voice|pharyng/i.test(text)) {
      matched.add('ENT');
    }
    if (/pregnan|maternal|period|uter|ovary|pelvic|women|gynec/i.test(text)) {
      matched.add('Gynecologist');
    }
    if (/fever|weakness|fatigue|cold|vomit|nausea|malaise|infect|body ache|chill|pyrexia/i.test(text) || matched.size === 0) {
      matched.add('General Physician');
    }

    return Array.from(matched);
  }, [selectedPatient]);

  // Filter doctors:
  // 1. In doctor mode, EXCLUDE the logged in doctor themselves ("r pkhane nijake show hobe na")
  // 2. If a patient is selected, show doctors matching that patient's problem!
  const candidateDoctors = useMemo(() => {
    // Exclude logged in doctor
    let list = doctors;
    if (isDoctor) {
      list = list.filter(
        (doc) => doc.user_id !== user?.id && doc.id !== user?.doctor?.id
      );
    }

    // If patient is selected and doctor hasn't toggled "show all", filter by matched specialties
    if (isDoctor && selectedPatient && !showAllSpecialists && matchedSpecialties.length > 0) {
      list = list.filter((doc) =>
        matchedSpecialties.some((spec) =>
          doc.specialization_name?.toLowerCase().includes(spec.toLowerCase())
        )
      );
    }

    // General search & rating filters
    if (selectedSpec !== 'All' && (!isDoctor || !selectedPatient || showAllSpecialists)) {
      list = list.filter((doc) => doc.specialization_name === selectedSpec);
    }
    if (minRating > 0) {
      list = list.filter((doc) => parseFloat(doc.rating) >= minRating);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (doc) =>
          doc.full_name?.toLowerCase().includes(q) ||
          doc.specialization_name?.toLowerCase().includes(q) ||
          doc.qualification?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [doctors, isDoctor, user, selectedPatient, showAllSpecialists, matchedSpecialties, selectedSpec, minRating, searchTerm]);

  // Navigate to dedicated referral page with BOTH target doctor & pre-selected patient
  const handleOpenReferPage = (targetDoc) => {
    navigate('/doctor/refer-patient', {
      state: {
        targetDoctor: targetDoc,
        selectedPatient: selectedPatient,
      },
    });
  };

  // Update Referral Status (for incoming referrals)
  const handleUpdateReferralStatus = async (referralId, newStatus) => {
    try {
      await doctorAPI.updateReferralStatus(referralId, newStatus);
      loadReferralsData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update referral status.');
    }
  };

  // Patient booking handlers
  const handleOpenSlots = async (doctor) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/doctors' } });
      return;
    }
    setSelectedDoctor(doctor);
    setChosenSlot(null);
    setBookingMessage({ text: '', type: '' });
    setSlotsLoading(true);

    try {
      const res = await patientAPI.getDoctorSlots(doctor.id, 10);
      if (res.data.success) {
        setDoctorSlots(res.data.slots || []);
      }
    } catch (err) {
      console.error('Failed to load slots:', err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!selectedDoctor || !chosenSlot) return;

    setBookingLoading(true);
    setBookingMessage({ text: '', type: '' });

    try {
      const res = await patientAPI.bookAppointment({
        doctor_id: selectedDoctor.id,
        appointment_date: chosenSlot.date,
        start_time: chosenSlot.start_time,
        chief_complaint: 'Routine consultation via Doctor Directory',
        booking_source: 'manual',
      });

      if (res.data.success) {
        setBookingMessage({
          text: `Success! Appointment booked with ${selectedDoctor.full_name} on ${chosenSlot.date} at ${chosenSlot.start_time}. Confirmation email dispatched.`,
          type: 'success',
        });
        setTimeout(() => {
          setSelectedDoctor(null);
          navigate('/history');
        }, 1800);
      }
    } catch (err) {
      setBookingMessage({
        text: err.response?.data?.error || 'Failed to book slot. It may have been taken.',
        type: 'error',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const pendingReceivedCount = receivedReferrals.filter((r) => r.status === 'pending').length;

  const pageContent = (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {isDoctor ? 'Patient Referrals & Specialist Network' : 'Find & Book Medical Specialists'}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
          {isDoctor
            ? 'Select a patient from your consultations to find certified specialists matched to their condition, or review clinical referral handovers.'
            : 'Explore our certified physician network across multiple clinical departments.'}
        </Typography>
      </Box>

      {/* Doctor Tabs: Referral Network / Incoming Referrals / Sent Referrals */}
      {isDoctor && (
        <Paper sx={{ mb: 3.5, borderRadius: 2.5, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 2, pt: 1 }}
          >
            <Tab
              icon={<SwapHorizIcon />}
              iconPosition="start"
              label="Specialist Referral Network"
              sx={{ fontWeight: 700, textTransform: 'none', py: 1.8 }}
            />
            <Tab
              icon={
                <Badge badgeContent={pendingReceivedCount} color="error" sx={{ '& .MuiBadge-badge': { right: -4, top: 4 } }}>
                  <InboxIcon />
                </Badge>
              }
              iconPosition="start"
              label={`Incoming Referrals (${receivedReferrals.length})`}
              sx={{ fontWeight: 700, textTransform: 'none', py: 1.8 }}
            />
            <Tab
              icon={<OutboxIcon />}
              iconPosition="start"
              label={`Outgoing Referrals (${sentReferrals.length})`}
              sx={{ fontWeight: 700, textTransform: 'none', py: 1.8 }}
            />
          </Tabs>
        </Paper>
      )}

      {/* TAB 0: Specialist Referral Network (Doctor Flow) or Browse Doctors (Patient Flow) */}
      {(!isDoctor || activeTab === 0) && (
        <>
          {/* DOCTOR STEP 1: PATIENT SELECTION HEADER */}
          {isDoctor && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                mb: 3.5,
                borderRadius: 3,
                border: '1.5px solid',
                borderColor: selectedPatient ? 'primary.main' : 'divider',
                bgcolor: selectedPatient ? 'rgba(14, 165, 233, 0.05)' : 'background.paper',
                boxShadow: selectedPatient ? '0 4px 20px rgba(14, 165, 233, 0.12)' : 'none',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: selectedPatient ? 'primary.main' : 'action.selected', color: selectedPatient ? '#fff' : 'text.primary' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Step 1: Select Patient to Refer
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Choose a patient to automatically match specialists with expertise in their diagnosed condition.
                    </Typography>
                  </Box>
                </Box>

                {selectedPatient && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    startIcon={<ClearIcon />}
                    onClick={() => {
                      setSelectedPatientId('');
                      setShowAllSpecialists(false);
                    }}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Clear Patient Filter
                  </Button>
                )}
              </Box>

              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={selectedPatient ? 5 : 8}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="doctor-patient-filter-label">Choose Patient from Practice</InputLabel>
                    <Select
                      labelId="doctor-patient-filter-label"
                      value={selectedPatientId}
                      label="Choose Patient from Practice"
                      onChange={(e) => {
                        setSelectedPatientId(e.target.value);
                        setShowAllSpecialists(false);
                      }}
                    >
                      <MenuItem value="">
                        <em>-- None (Browse All Specialists) --</em>
                      </MenuItem>
                      {myPatients.map((p) => (
                        <MenuItem key={p.patient_id} value={p.patient_id}>
                          <strong>{p.full_name}</strong> &bull; {p.chief_complaint ? `"${p.chief_complaint.slice(0, 35)}..."` : 'Consultation'} ({p.last_appointment_date || 'Recent'})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* If a patient is selected, display their clinical condition card */}
                {selectedPatient && (
                  <Grid item xs={12} md={7}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        borderColor: 'primary.light',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                          Patient: {selectedPatient.full_name} ({selectedPatient.phone || 'No phone'})
                        </Typography>
                        <Chip
                          icon={<AIIcon fontSize="small" />}
                          label={`Target Specialization: ${matchedSpecialties.join(' / ') || 'General'}`}
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Reported Condition: <strong>{selectedPatient.chief_complaint || 'General Clinical Review'}</strong>
                        {selectedPatient.last_diagnosis && ` • Diagnosis: ${selectedPatient.last_diagnosis}`}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>

              {/* Status Header for Matched Doctors */}
              {selectedPatient && (
                <Box sx={{ mt: 2.5, pt: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon fontSize="small" />
                    {showAllSpecialists
                      ? `Showing All Available Specialists (${candidateDoctors.length})`
                      : `Specialists Matched for ${selectedPatient.full_name}'s Condition (${candidateDoctors.length} Found)`}
                  </Typography>

                  <Button
                    size="small"
                    variant="text"
                    color="secondary"
                    onClick={() => setShowAllSpecialists(!showAllSpecialists)}
                    sx={{ fontWeight: 700, textTransform: 'none' }}
                  >
                    {showAllSpecialists
                      ? `← Filter Back to Matched (${matchedSpecialties.join(', ')})`
                      : 'Browse Other Hospital Specialists ➜'}
                  </Button>
                </Box>
              )}
            </Paper>
          )}

          {/* Filter Toolbar (Search & Rating) */}
          {(!isDoctor || !selectedPatient || showAllSpecialists) && (
            <Paper elevation={1} sx={{ p: 2.5, mb: 4, borderRadius: 3, border: 1, borderColor: 'divider' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by doctor name or qualification..."
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
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Specialization"
                    value={selectedSpec}
                    onChange={(e) => setSelectedSpec(e.target.value)}
                  >
                    <MenuItem value="All">All Specializations</MenuItem>
                    {specializations.map((s) => (
                      <MenuItem key={s.id} value={s.name}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Minimum Rating"
                    value={minRating}
                    onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  >
                    <MenuItem value={0}>Any Rating</MenuItem>
                    <MenuItem value={4.5}>4.5+ Stars</MenuItem>
                    <MenuItem value={4.8}>4.8+ Stars</MenuItem>
                    <MenuItem value={4.9}>4.9+ Stars</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Doctor Cards Grid */}
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CircularProgress size={45} color="primary" />
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Loading doctor profiles...
              </Typography>
            </Box>
          ) : candidateDoctors.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {selectedPatient
                  ? `No specialists found matching ${selectedPatient.full_name}'s condition.`
                  : 'No doctors matched your criteria.'}
              </Typography>
              {selectedPatient && !showAllSpecialists && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setShowAllSpecialists(true)}
                  sx={{ mt: 2, fontWeight: 700 }}
                >
                  View All Hospital Specialists
                </Button>
              )}
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {candidateDoctors.map((doc) => {
                const isConditionMatch =
                  selectedPatient &&
                  matchedSpecialties.some((spec) =>
                    doc.specialization_name?.toLowerCase().includes(spec.toLowerCase())
                  );

                return (
                  <Grid item xs={12} sm={6} md={4} key={doc.id}>
                    <DoctorCard
                      doctor={doc}
                      onSelectDoctor={handleOpenSlots}
                      onReferPatient={handleOpenReferPage}
                      isRecommended={Boolean(isConditionMatch)}
                    />
                  </Grid>
                );
              })}
            </Grid>
          )}
        </>
      )}

      {/* TAB 1: Incoming Referrals */}
      {isDoctor && activeTab === 1 && (
        <Box>
          {referralsLoading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CircularProgress size={40} />
            </Box>
          ) : receivedReferrals.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: 1, borderColor: 'divider' }}>
              <InboxIcon sx={{ fontSize: 50, color: 'text.secondary', mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                No Incoming Referrals Yet
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 450, mx: 'auto', mt: 0.5 }}>
                When other doctors in the hospital network refer complex patients to your specialty, their detailed clinical records will appear here.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {receivedReferrals.map((ref) => {
                const urgencyColor =
                  ref.urgency_level === 'emergency'
                    ? 'error'
                    : ref.urgency_level === 'urgent'
                    ? 'warning'
                    : 'info';

                const statusColor =
                  ref.status === 'completed'
                    ? 'success'
                    : ref.status === 'accepted'
                    ? 'primary'
                    : ref.status === 'declined'
                    ? 'default'
                    : 'warning';

                return (
                  <Grid item xs={12} md={6} key={ref.id}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        border: 1,
                        borderColor: ref.urgency_level === 'emergency' ? 'error.main' : 'divider',
                        boxShadow: ref.urgency_level === 'emergency' ? '0 4px 16px rgba(239, 68, 68, 0.2)' : 1,
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                              {ref.patient_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Gender: {ref.patient_gender || 'N/A'} &bull; Blood: {ref.patient_blood_group || 'N/A'} &bull; Phone: {ref.patient_phone || 'N/A'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip
                              label={ref.urgency_level?.toUpperCase()}
                              size="small"
                              color={urgencyColor}
                              sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                            />
                            <Chip
                              label={ref.status?.toUpperCase()}
                              size="small"
                              color={statusColor}
                              variant="outlined"
                              sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                            />
                          </Box>
                        </Box>

                        <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>
                            DIAGNOSIS / CONDITION:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 700 }}>
                            {ref.disease_condition}
                          </Typography>

                          <Grid container spacing={1.5} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                DURATION OF SYMPTOMS:
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {ref.symptom_duration || 'Not specified'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                CURRENT MEDICATIONS:
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {ref.current_medications || 'None recorded'}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Paper>

                        {ref.chief_complaints && (
                          <Box sx={{ mb: 1.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                              CHIEF COMPLAINTS / PRESENTATION:
                            </Typography>
                            <Typography variant="body2">{ref.chief_complaints}</Typography>
                          </Box>
                        )}

                        {ref.clinical_notes && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                              REFERRING CLINICAL REASON & NOTES:
                            </Typography>
                            <Typography variant="body2" sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1.5 }}>
                              {ref.clinical_notes}
                            </Typography>
                          </Box>
                        )}

                        <Divider sx={{ my: 1.5 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                              Referred by: <strong>{ref.referring_doctor_name}</strong> ({ref.referring_doctor_specialty})
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Date: {ref.created_at}
                            </Typography>
                          </Box>

                          {/* Action Buttons based on status */}
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {ref.status === 'pending' && (
                              <>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  onClick={() => handleUpdateReferralStatus(ref.id, 'declined')}
                                >
                                  Decline
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  startIcon={<AcceptIcon />}
                                  onClick={() => handleUpdateReferralStatus(ref.id, 'accepted')}
                                  sx={{ fontWeight: 700 }}
                                >
                                  Accept Case
                                </Button>
                              </>
                            )}
                            {ref.status === 'accepted' && (
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CompletedIcon />}
                                onClick={() => handleUpdateReferralStatus(ref.id, 'completed')}
                                sx={{ fontWeight: 700 }}
                              >
                                Mark Completed
                              </Button>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      {/* TAB 2: Outgoing Referrals */}
      {isDoctor && activeTab === 2 && (
        <Box>
          {referralsLoading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CircularProgress size={40} />
            </Box>
          ) : sentReferrals.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: 1, borderColor: 'divider' }}>
              <OutboxIcon sx={{ fontSize: 50, color: 'text.secondary', mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                No Outgoing Referrals Yet
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 450, mx: 'auto', mt: 0.5 }}>
                You have not referred any patient yet. Visit the Specialist Referral Network tab, select a patient, and refer to a matching specialist.
              </Typography>
              <Button variant="contained" color="primary" onClick={() => setActiveTab(0)} sx={{ mt: 2, fontWeight: 700 }}>
                Browse Specialists to Refer
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {sentReferrals.map((ref) => {
                const statusColor =
                  ref.status === 'completed'
                    ? 'success'
                    : ref.status === 'accepted'
                    ? 'primary'
                    : ref.status === 'declined'
                    ? 'error'
                    : 'warning';

                return (
                  <Grid item xs={12} md={6} key={ref.id}>
                    <Card sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                              Patient: {ref.patient_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Referred To: <strong>{ref.referred_to_doctor_name}</strong> ({ref.referred_to_doctor_specialty})
                            </Typography>
                          </Box>
                          <Chip
                            label={ref.status?.toUpperCase()}
                            size="small"
                            color={statusColor}
                            sx={{ fontWeight: 800, fontSize: '0.72rem' }}
                          />
                        </Box>

                        <Paper variant="outlined" sx={{ p: 2, mb: 1.5, borderRadius: 2, bgcolor: 'background.default' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                            CONDITION: {ref.disease_condition}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                            Duration: <strong>{ref.symptom_duration || 'N/A'}</strong> &bull; Urgency: <strong>{ref.urgency_level?.toUpperCase()}</strong>
                          </Typography>
                          {ref.current_medications && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                              Medications: {ref.current_medications}
                            </Typography>
                          )}
                        </Paper>

                        {ref.clinical_notes && (
                          <Box sx={{ mb: 1.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                              CLINICAL REASON FOR REFERRAL:
                            </Typography>
                            <Typography variant="body2">{ref.clinical_notes}</Typography>
                          </Box>
                        )}

                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                          Dispatched: {ref.created_at}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      {/* Patient Live Slot Selection Dialog (for patient booking) */}
      <Dialog
        open={Boolean(selectedDoctor)}
        onClose={() => setSelectedDoctor(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Select Appointment Slot &bull; {selectedDoctor?.full_name}
        </DialogTitle>
        <DialogContent dividers>
          {bookingMessage.text && (
            <Alert severity={bookingMessage.type} sx={{ mb: 2 }}>
              {bookingMessage.text}
            </Alert>
          )}

          {!isAuthenticated ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                🔒 Sign In Required to View Availability
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, maxWidth: 450, mx: 'auto' }}>
                Doctor availability and scheduling calendar are only visible to authenticated patients. Please sign in or register to select an appointment opening.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/login', { state: { from: '/doctors' } })}
                sx={{ fontWeight: 700, px: 3 }}
              >
                Sign In to View Openings & Book
              </Button>
            </Box>
          ) : slotsLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={35} />
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Fetching real-time available time slots...
              </Typography>
            </Box>
          ) : doctorSlots.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                No active slots open in the next 10 days for this physician.
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Please check another specialist or try the AI Symptom consultation tool for auto-recommendations.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary' }}>
                AVAILABLE OPENINGS (NEXT 10 DAYS):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, maxHeight: 320, overflowY: 'auto', p: 1 }}>
                {doctorSlots.map((slot, idx) => {
                  const isChosen = chosenSlot && chosenSlot.slot_datetime === slot.slot_datetime;
                  return (
                    <Chip
                      key={idx}
                      label={`${slot.date} (${slot.start_time} - ${slot.end_time})`}
                      color={isChosen ? 'primary' : 'default'}
                      variant={isChosen ? 'filled' : 'outlined'}
                      onClick={() => setChosenSlot(slot)}
                      clickable
                      sx={{
                        fontWeight: 600,
                        py: 2,
                        px: 1,
                        fontSize: '0.8rem',
                        borderColor: isChosen ? 'primary.main' : 'divider',
                      }}
                    />
                  );
                })}
              </Box>

              {chosenSlot && (
                <Paper variant="outlined" sx={{ p: 2, mt: 3, borderRadius: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    Selected Time:
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
                    {chosenSlot.day_name}, {chosenSlot.date} from {chosenSlot.start_time} to {chosenSlot.end_time}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Consultation Fee: ${selectedDoctor?.consultation_fee} &bull; Room: {selectedDoctor?.room_number || 'Main Consultation'}
                  </Typography>
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedDoctor(null)} color="inherit">
            Cancel
          </Button>
          {!isAuthenticated ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/login', { state: { from: '/doctors' } })}
              sx={{ fontWeight: 700, px: 3 }}
            >
              Sign In to Book Appointment
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              disabled={!chosenSlot || bookingLoading}
              onClick={handleConfirmBooking}
              sx={{ fontWeight: 700, px: 3 }}
            >
              {bookingLoading ? 'Booking...' : 'Confirm Appointment'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );

  if (isAuthenticated) {
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
          {pageContent}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {pageContent}
      </Container>
    </Box>
  );
}
