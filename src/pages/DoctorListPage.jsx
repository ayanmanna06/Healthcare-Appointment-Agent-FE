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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
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
  Event as EventIcon,
  AccessTime as TimeIcon,
  WbSunny as MorningIcon,
  NightsStay as AfternoonIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ViewList as ListIcon,
  ViewModule as GridIcon,
  Block as InactiveIcon,
  CheckCircle as ActiveIcon,
  Visibility as VisibilityIcon,
  HistoryEdu as HistoryEduIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { patientAPI, doctorAPI, adminAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import DoctorCard from '../components/DoctorCard';
import Sidebar from '../components/Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';

export default function DoctorListPage() {
  const { isAuthenticated, role, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isDoctor = role === 'doctor';
  const isAdmin = role === 'admin';

  // Admin Doctor Management state
  const [adminViewMode, setAdminViewMode] = useState('table'); // 'table' | 'grid'
  const [adminStatusFilter, setAdminStatusFilter] = useState('All');
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState({ text: '', type: '' });

  const defaultDoctorForm = {
    full_name: '',
    email: '',
    password: '',
    phone: '',
    specialization_id: '',
    qualification: 'MBBS, MD',
    experience_years: 5,
    consultation_fee: 75,
    room_number: 'Consultation Suite 101',
    bio: '',
  };
  const [doctorForm, setDoctorForm] = useState(defaultDoctorForm);

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
  const [selectedDate, setSelectedDate] = useState('');
  const [chosenSlot, setChosenSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState({ text: '', type: '' });

  // Group slots by date for patient interactive slot picker modal
  const slotsByDate = useMemo(() => {
    const grouped = {};
    doctorSlots.forEach((slot) => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  }, [doctorSlots]);

  const uniqueDates = useMemo(() => Object.keys(slotsByDate).sort(), [slotsByDate]);

  const currentDaySlots = useMemo(() => {
    return slotsByDate[selectedDate] || [];
  }, [slotsByDate, selectedDate]);

  const morningSlots = useMemo(() => {
    return currentDaySlots.filter((s) => s.start_time < '13:00');
  }, [currentDaySlots]);

  const afternoonSlots = useMemo(() => {
    return currentDaySlots.filter((s) => s.start_time >= '13:00');
  }, [currentDaySlots]);

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
  }, [isDoctor, isAdmin]);

  useEffect(() => {
    if (location.state?.defaultTab !== undefined) {
      setActiveTab(location.state.defaultTab);
    }
  }, [location.state]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [docsRes, specsRes] = await Promise.all([
        isAdmin ? adminAPI.getDoctors() : patientAPI.getDoctors(),
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

    // Admin status filter
    if (isAdmin && adminStatusFilter !== 'All') {
      const activeBool = adminStatusFilter === 'Active';
      list = list.filter((doc) => Boolean(doc.is_active) === activeBool);
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
  }, [doctors, isDoctor, isAdmin, adminStatusFilter, user, selectedPatient, showAllSpecialists, matchedSpecialties, selectedSpec, minRating, searchTerm]);

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

  // Admin Doctor Management Handlers
  const handleOpenCreateDoctor = () => {
    setEditingDoctor(null);
    setDoctorForm({
      ...defaultDoctorForm,
      specialization_id: specializations[0]?.id || '',
    });
    setAdminFeedback({ text: '', type: '' });
    setDoctorModalOpen(true);
  };

  const handleOpenEditDoctor = (doc) => {
    setEditingDoctor(doc);
    const matchedSpec = specializations.find(
      (s) => s.id === doc.specialization_id || s.name.toLowerCase() === doc.specialization_name?.toLowerCase()
    );
    setDoctorForm({
      full_name: doc.full_name || '',
      email: doc.email || '',
      password: '',
      phone: doc.phone || '',
      specialization_id: matchedSpec ? matchedSpec.id : (doc.specialization_id || ''),
      qualification: doc.qualification || 'MBBS, MD',
      experience_years: doc.experience_years || 5,
      consultation_fee: doc.consultation_fee || 75,
      room_number: doc.room_number || 'Consultation Suite 101',
      bio: doc.bio || '',
    });
    setAdminFeedback({ text: '', type: '' });
    setDoctorModalOpen(true);
  };

  const handleSaveDoctor = async () => {
    if (!doctorForm.full_name || !doctorForm.email || !doctorForm.specialization_id) {
      setAdminFeedback({ text: 'Please fill in doctor full name, email, and specialization.', type: 'error' });
      return;
    }
    setAdminActionLoading(true);
    setAdminFeedback({ text: '', type: '' });
    try {
      if (editingDoctor) {
        const res = await adminAPI.updateDoctor(editingDoctor.id, doctorForm);
        if (res.data.success) {
          setAdminFeedback({ text: res.data.message || 'Doctor updated successfully.', type: 'success' });
          setTimeout(() => {
            setDoctorModalOpen(false);
            fetchInitialData();
          }, 800);
        }
      } else {
        const res = await adminAPI.createDoctor(doctorForm);
        if (res.data.success) {
          setAdminFeedback({ text: res.data.message || 'New doctor onboarded successfully.', type: 'success' });
          setTimeout(() => {
            setDoctorModalOpen(false);
            fetchInitialData();
          }, 800);
        }
      }
    } catch (err) {
      setAdminFeedback({
        text: err.response?.data?.error || 'Operation failed. Please verify fields.',
        type: 'error',
      });
    } finally {
      setAdminActionLoading(false);
    }
  };

  const handleToggleDoctorStatus = async (doc) => {
    try {
      const res = await adminAPI.toggleDoctorStatus(doc.id);
      if (res.data.success) {
        fetchInitialData();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update doctor status.');
    }
  };

  const handleDeleteDoctor = async (doc) => {
    if (!window.confirm(`Are you sure you want to remove Dr. ${doc.full_name}? This will revoke their credentials and clinical profile.`)) {
      return;
    }
    try {
      const res = await adminAPI.deleteDoctor(doc.id);
      if (res.data.success) {
        fetchInitialData();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete doctor.');
    }
  };

  const handleOpenDoctorHistory = (doc) => {
    navigate(`/admin/doctors/${doc.id}/history`, { state: { doctor: doc } });
  };


  // Patient booking handlers
  const handleOpenSlots = async (doctor) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/doctors' } });
      return;
    }
    setSelectedDoctor(doctor);
    setChosenSlot(null);
    setSelectedDate('');
    setBookingMessage({ text: '', type: '' });
    setSlotsLoading(true);

    try {
      const res = await patientAPI.getDoctorSlots(doctor.id, 14);
      if (res.data.success) {
        const slots = res.data.slots || [];
        setDoctorSlots(slots);
        if (slots.length > 0) {
          setSelectedDate(slots[0].date);
          setChosenSlot(slots[0]);
        }
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {isAdmin
              ? 'Physician Directory & Medical Staff Management'
              : isDoctor
              ? 'Patient Referrals & Specialist Network'
              : 'Find & Book Medical Specialists'}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {isAdmin
              ? 'Manage network doctors, configure consultation tariffs, assign suites, and onboard new medical specialists.'
              : isDoctor
              ? 'Select a patient from your consultations to find certified specialists matched to their condition, or review clinical referral handovers.'
              : 'Explore our certified physician network across multiple clinical departments.'}
          </Typography>
        </Box>

        {isAdmin && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <ToggleButtonGroup
              size="small"
              value={adminViewMode}
              exclusive
              onChange={(e, val) => val && setAdminViewMode(val)}
              sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
            >
              <ToggleButton value="table" sx={{ px: 2, fontWeight: 700, textTransform: 'none' }}>
                <ListIcon fontSize="small" sx={{ mr: 0.8 }} /> Table View
              </ToggleButton>
              <ToggleButton value="grid" sx={{ px: 2, fontWeight: 700, textTransform: 'none' }}>
                <GridIcon fontSize="small" sx={{ mr: 0.8 }} /> Cards View
              </ToggleButton>
            </ToggleButtonGroup>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDoctor}
              sx={{ fontWeight: 800, textTransform: 'none', px: 2.5, py: 1 }}
            >
              Onboard New Specialist
            </Button>
          </Box>
        )}
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
                      : 'Browse Other Medical Specialists ➜'}
                  </Button>
                </Box>
              )}
            </Paper>
          )}

          {/* Filter Toolbar (Search & Rating) */}
          {(!isDoctor || !selectedPatient || showAllSpecialists) && (
            <Paper elevation={1} sx={{ p: 2.5, mb: 4, borderRadius: 3, border: 1, borderColor: 'divider' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={isAdmin ? 4 : 5}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by doctor name, email, or qualification..."
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
                <Grid item xs={12} sm={6} md={isAdmin ? 3 : 4}>
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

                {isAdmin && (
                  <Grid item xs={12} sm={6} md={2.5}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Account Status"
                      value={adminStatusFilter}
                      onChange={(e) => setAdminStatusFilter(e.target.value)}
                    >
                      <MenuItem value="All">All Statuses</MenuItem>
                      <MenuItem value="Active">Active Only</MenuItem>
                      <MenuItem value="Inactive">Inactive / Suspended</MenuItem>
                    </TextField>
                  </Grid>
                )}

                <Grid item xs={12} sm={6} md={isAdmin ? 2.5 : 3}>
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

          {/* Doctor Cards / Table Content */}
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
                  View All Medical Specialists
                </Button>
              )}
            </Paper>
          ) : isAdmin && adminViewMode === 'table' ? (
            <Paper sx={{ borderRadius: 3, border: 1, borderColor: 'divider', overflow: 'hidden' }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Physician</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Specialization</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Qualification & Exp</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Assigned Patients</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Consultation Tariff</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Clinic Suite / Room</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Account Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Management Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {candidateDoctors.map((doc) => (
                      <TableRow key={doc.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700, width: 40, height: 40 }}>
                              {doc.full_name ? doc.full_name.replace('Dr. ', '')[0] : 'D'}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {doc.full_name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                {doc.email || 'No email recorded'} &bull; {doc.phone || 'No phone'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<StethoscopeIcon fontSize="small" sx={{ color: '#38BDF8 !important' }} />}
                            label={doc.specialization_name || 'General Physician'}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.74rem',
                              bgcolor: 'rgba(14, 165, 233, 0.16)',
                              color: '#38BDF8',
                              border: '1px solid rgba(14, 165, 233, 0.45)',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {doc.qualification}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {doc.experience_years} years experience
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {doc.today_patients_count > 0 ? (
                              <Chip
                                icon={<PeopleIcon fontSize="small" sx={{ color: '#0EA5E9 !important' }} />}
                                label={`${doc.today_patients_count} Today`}
                                size="small"
                                color="primary"
                                sx={{
                                  fontWeight: 800,
                                  fontSize: '0.74rem',
                                  bgcolor: 'rgba(14, 165, 233, 0.16)',
                                  color: '#38BDF8',
                                  border: '1px solid rgba(14, 165, 233, 0.45)',
                                }}
                              />
                            ) : (
                              <span style={{ color: 'text.secondary', fontWeight: 600 }}>0 Today</span>
                            )}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {doc.total_patients_count || 0} Total Consultations
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                            ${doc.consultation_fee}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {doc.room_number || 'Room 101'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            ⭐ {doc.rating}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={doc.is_active ? 'ACTIVE' : 'INACTIVE'}
                            size="small"
                            color={doc.is_active ? 'success' : 'default'}
                            sx={{ fontWeight: 700, fontSize: '0.68rem' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                            <Tooltip title="View All Patient History & Consultations">
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handleOpenDoctorHistory(doc)}
                                sx={{
                                  bgcolor: 'rgba(20, 184, 166, 0.12)',
                                  border: '1px solid rgba(20, 184, 166, 0.3)',
                                  '&:hover': { bgcolor: 'rgba(20, 184, 166, 0.25)' },
                                }}
                              >
                                <HistoryEduIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Doctor Profile & Tariff">
                              <IconButton size="small" color="primary" onClick={() => handleOpenEditDoctor(doc)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={doc.is_active ? 'Deactivate Doctor' : 'Activate Doctor'}>
                              <IconButton size="small" color={doc.is_active ? 'warning' : 'success'} onClick={() => handleToggleDoctorStatus(doc)}>
                                {doc.is_active ? <InactiveIcon fontSize="small" /> : <ActiveIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Preview Schedule & Openings">
                              <IconButton size="small" color="info" onClick={() => handleOpenSlots(doc)}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove Doctor">
                              <IconButton size="small" color="error" onClick={() => handleDeleteDoctor(doc)}>
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
                      onEditDoctor={handleOpenEditDoctor}
                      onToggleStatus={handleToggleDoctorStatus}
                      onDeleteDoctor={handleDeleteDoctor}
                      onViewHistory={handleOpenDoctorHistory}
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
                When other doctors in the specialist network refer complex patients to your specialty, their detailed clinical records will appear here.
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
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {isAdmin ? 'Doctor Clinical Schedule & Availability Roster' : 'Choose Appointment Date & Time'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {isAdmin
                ? `Inspecting active consultation roster and timetable for ${selectedDoctor?.full_name}`
                : `Select a day and time slot that fits your schedule with ${selectedDoctor?.full_name}`}
            </Typography>
          </Box>
          {selectedDoctor && (
            <Chip
              label={`Fee: $${selectedDoctor.consultation_fee}`}
              color="secondary"
              sx={{ fontWeight: 700 }}
            />
          )}
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
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <CircularProgress size={35} />
              <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary' }}>
                Fetching real-time available time slots...
              </Typography>
            </Box>
          ) : doctorSlots.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                No active slots open in the next 14 days for this physician.
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Please check another specialist or try the AI Symptom consultation tool for auto-recommendations.
              </Typography>
            </Box>
          ) : (
            <Box>
              {/* Doctor Details Summary Bar */}
              <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, fontWeight: 700 }}>
                  {selectedDoctor?.full_name ? selectedDoctor.full_name.replace('Dr. ', '')[0] : 'D'}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {selectedDoctor?.full_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 600 }}>
                    {selectedDoctor?.specialization_name} &bull; {selectedDoctor?.qualification}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                    Clinic Suite: {selectedDoctor?.room_number || 'Room 301'} &bull; Rating: ⭐ {selectedDoctor?.rating} ({selectedDoctor?.experience_years} yrs exp)
                  </Typography>
                </Box>
              </Box>

              {/* STEP 1: Select Day / Date */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon fontSize="small" sx={{ color: 'primary.main' }} />
                {isAdmin ? '1. SELECT ROSTER DATE TO INSPECT:' : '1. SELECT DAY / DATE (WHEN ARE YOU FREE?):'}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1.5, mb: 3 }}>
                {uniqueDates.map((dateStr) => {
                  const isSelected = selectedDate === dateStr;
                  const dateObj = new Date(dateStr + 'T00:00:00');
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  const count = slotsByDate[dateStr]?.length || 0;

                  return (
                    <Paper
                      key={dateStr}
                      onClick={() => {
                        setSelectedDate(dateStr);
                        if (slotsByDate[dateStr]?.length > 0) {
                          setChosenSlot(slotsByDate[dateStr][0]);
                        }
                      }}
                      sx={{
                        p: 1.5,
                        minWidth: 105,
                        textAlign: 'center',
                        cursor: 'pointer',
                        borderRadius: 2,
                        border: 2,
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: isSelected ? 'rgba(14, 165, 233, 0.12)' : 'background.paper',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700, color: isSelected ? 'primary.main' : 'text.secondary', display: 'block' }}>
                        {dayName.toUpperCase()}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: isSelected ? 'primary.main' : 'text.primary' }}>
                        {monthDay}
                      </Typography>
                      <Chip
                        label={`${count} slots`}
                        size="small"
                        color={isSelected ? 'primary' : 'default'}
                        variant={isSelected ? 'filled' : 'outlined'}
                        sx={{ mt: 0.5, height: 18, fontSize: '0.65rem', fontWeight: 600 }}
                      />
                    </Paper>
                  );
                })}
              </Box>

              {/* STEP 2: Select Time Slot */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon fontSize="small" sx={{ color: 'secondary.main' }} />
                {isAdmin ? `2. ACTIVE CONSULTATION OPENINGS FOR ${selectedDate}:` : `2. SELECT TIME SLOT FOR ${selectedDate}:`}
              </Typography>

              {morningSlots.length > 0 && (
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <MorningIcon fontSize="inherit" sx={{ color: '#F59E0B' }} /> MORNING (09:00 - 13:00)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {morningSlots.map((slot, idx) => {
                      const isChosen = chosenSlot?.slot_datetime === slot.slot_datetime;
                      return (
                        <Chip
                          key={`m-${idx}`}
                          label={`${slot.start_time} - ${slot.end_time}`}
                          color={isChosen ? 'primary' : 'default'}
                          variant={isChosen ? 'filled' : 'outlined'}
                          onClick={() => setChosenSlot(slot)}
                          clickable
                          sx={{
                            fontWeight: 700,
                            py: 2,
                            px: 1,
                            fontSize: '0.85rem',
                            borderColor: isChosen ? 'primary.main' : 'divider',
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              )}

              {afternoonSlots.length > 0 && (
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <AfternoonIcon fontSize="inherit" sx={{ color: '#0EA5E9' }} /> AFTERNOON / EVENING (14:00 - 17:00)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {afternoonSlots.map((slot, idx) => {
                      const isChosen = chosenSlot?.slot_datetime === slot.slot_datetime;
                      return (
                        <Chip
                          key={`a-${idx}`}
                          label={`${slot.start_time} - ${slot.end_time}`}
                          color={isChosen ? 'primary' : 'default'}
                          variant={isChosen ? 'filled' : 'outlined'}
                          onClick={() => setChosenSlot(slot)}
                          clickable
                          sx={{
                            fontWeight: 700,
                            py: 2,
                            px: 1,
                            fontSize: '0.85rem',
                            borderColor: isChosen ? 'primary.main' : 'divider',
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/* STEP 3: Summary Box */}
              {isAdmin ? (
                <Paper variant="outlined" sx={{ p: 2, mt: 3, borderRadius: 2, bgcolor: 'background.default', border: '1px solid #0EA5E9' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                    📋 Physician Roster & Slot Inspection:
                  </Typography>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Doctor:</strong> {selectedDoctor?.full_name} ({selectedDoctor?.specialization_name})
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Assigned Suite:</strong> {selectedDoctor?.room_number || 'Room 301'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Inspected Date:</strong> {selectedDate} ({slotsByDate[selectedDate]?.length || 0} active openings)
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Highlighted Slot:</strong> {chosenSlot ? `${chosenSlot.start_time} - ${chosenSlot.end_time}` : 'Click any slot above'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        This timetable is active for patient bookings and AI Decision Engine recommendations.
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              ) : (
                chosenSlot && (
                  <Paper variant="outlined" sx={{ p: 2, mt: 3, borderRadius: 2, bgcolor: 'background.default', border: '1px solid #0EA5E9' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                      ✅ Selected Appointment Summary:
                    </Typography>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Doctor:</strong> {selectedDoctor?.full_name} ({selectedDoctor?.specialization_name})
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Clinic Room:</strong> {selectedDoctor?.room_number || 'Room 301'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Date:</strong> {chosenSlot.day_name || chosenSlot.date}, {chosenSlot.date}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Time:</strong> {chosenSlot.start_time} - {chosenSlot.end_time}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Consultation fee (${selectedDoctor?.consultation_fee}) payable at reception upon arrival.
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                )
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          {isAdmin ? (
            <>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => {
                  const docToEdit = selectedDoctor;
                  setSelectedDoctor(null);
                  handleOpenEditDoctor(docToEdit);
                }}
                sx={{ fontWeight: 700 }}
              >
                Edit Doctor Profile & Tariffs
              </Button>
              <Button
                variant="contained"
                color="inherit"
                onClick={() => setSelectedDoctor(null)}
                sx={{ fontWeight: 700, px: 3 }}
              >
                Close Schedule
              </Button>
            </>
          ) : (
            <>
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
                  sx={{ fontWeight: 800, px: 3, py: 1 }}
                >
                  {bookingLoading ? 'Booking...' : 'Confirm Appointment'}
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Admin Doctor Onboarding & Edit Dialog */}
      <Dialog
        open={doctorModalOpen}
        onClose={() => setDoctorModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingDoctor ? `Edit Specialist Profile • ${editingDoctor.full_name}` : 'Onboard New Medical Specialist'}
        </DialogTitle>
        <DialogContent dividers>
          {adminFeedback.text && (
            <Alert severity={adminFeedback.type} sx={{ mb: 2 }}>
              {adminFeedback.text}
            </Alert>
          )}

          <Grid container spacing={2.5} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name (with Dr. prefix)"
                value={doctorForm.full_name}
                onChange={(e) => setDoctorForm({ ...doctorForm, full_name: e.target.value })}
                placeholder="Dr. Alexander Wright"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Clinical Specialization"
                value={doctorForm.specialization_id}
                onChange={(e) => setDoctorForm({ ...doctorForm, specialization_id: e.target.value })}
                required
              >
                {specializations.map((spec) => (
                  <MenuItem key={spec.id} value={spec.id}>
                    {spec.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Professional Email"
                type="email"
                value={doctorForm.email}
                onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                placeholder="alexander.wright@healthagent.ai"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              {!editingDoctor ? (
                <TextField
                  fullWidth
                  label="Temporary Password"
                  type="password"
                  value={doctorForm.password}
                  onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                  placeholder="Doctor@123"
                  helperText="Default: Doctor@123"
                />
              ) : (
                <TextField
                  fullWidth
                  label="Direct Contact Phone"
                  value={doctorForm.phone}
                  onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                  placeholder="+1 (555) 234-5678"
                />
              )}
            </Grid>
            {!editingDoctor && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Direct Contact Phone"
                  value={doctorForm.phone}
                  onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                  placeholder="+1 (555) 234-5678"
                />
              </Grid>
            )}
            <Grid item xs={12} sm={editingDoctor ? 6 : 6}>
              <TextField
                fullWidth
                label="Medical Qualifications & Degrees"
                value={doctorForm.qualification}
                onChange={(e) => setDoctorForm({ ...doctorForm, qualification: e.target.value })}
                placeholder="MD, MBBS, FACC, FRCP"
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Experience (Years)"
                value={doctorForm.experience_years}
                onChange={(e) => setDoctorForm({ ...doctorForm, experience_years: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Consultation Tariff ($)"
                value={doctorForm.consultation_fee}
                onChange={(e) => setDoctorForm({ ...doctorForm, consultation_fee: parseFloat(e.target.value) || 0 })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Clinic Room / Suite Number"
                value={doctorForm.room_number}
                onChange={(e) => setDoctorForm({ ...doctorForm, room_number: e.target.value })}
                placeholder="Cardiology Suite 402"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Clinical Focus & Biography"
                value={doctorForm.bio}
                onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
                placeholder="Expertise in interventional therapies, routine outpatient management..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDoctorModalOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveDoctor}
            disabled={adminActionLoading}
            sx={{ fontWeight: 800, px: 3 }}
          >
            {adminActionLoading ? 'Saving...' : editingDoctor ? 'Save Changes' : 'Onboard Specialist'}
          </Button>
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
