import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Paper,
  Stack,
  Divider,
  Alert,
  Avatar,
} from '@mui/material';
import {
  SmartToy as AgentIcon,
  LocalHospital as HospitalIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  NotificationsActive as NotificationIcon,
  ArrowForward as ArrowIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  Search as SearchIcon,
  CalendarMonth as CalendarIcon,
  MedicalServices as StethoscopeIcon,
  Psychology as BrainIcon,
  ShieldOutlined as ShieldIcon,
  Lock as LockIcon,
  HealthAndSafety as SafetyIcon,
  AccessTime as TimeIcon,
  AutoAwesome as SparkleIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const SPECIALTIES = [
  { name: 'General Physician', desc: 'Primary care, fever, routine medical wellness, and systemic evaluations.', icon: '🩺' },
  { name: 'Cardiologist', desc: 'Heart care, chest discomfort, hypertension, and cardiovascular health.', icon: '❤️' },
  { name: 'Neurologist', desc: 'Brain, nerves, severe headaches, migraines, and cognitive care.', icon: '🧠' },
  { name: 'Orthopedic', desc: 'Bone fractures, joint pains, sports injuries, and arthritis management.', icon: '🦴' },
  { name: 'Dermatologist', desc: 'Skin rashes, acne, allergic reactions, and dermatological conditions.', icon: '🧴' },
  { name: 'Pediatrician', desc: 'Specialized healthcare and developmental care for infants, children & teens.', icon: '👶' },
  { name: 'ENT', desc: 'Ear infections, throat pain, sinusitis, and audiological diagnostics.', icon: '👂' },
  { name: 'Gynecologist', desc: "Women's reproductive health, prenatal care, and endocrine balance.", icon: '🌸' },
];

const AGENT_WORKFLOW_STEPS = [
  {
    step: '01',
    agent: 'Patient Intake Agent',
    desc: 'Patient submits symptoms in free natural language without needing complex medical terms.',
    highlight: 'Natural Language Input',
    color: '#0EA5E9',
  },
  {
    step: '02',
    agent: 'AI Symptom Analysis Agent',
    desc: 'Powered by Mistral-24B & clinical taxonomy to extract keywords, urgency, and specialty probabilities.',
    highlight: 'Clinical Urgency & NLP',
    color: '#8B5CF6',
  },
  {
    step: '03',
    agent: 'Doctor Matching Agent',
    desc: 'Filters certified physicians matching the required department with verified medical licenses.',
    highlight: 'Specialization Filtering',
    color: '#10B981',
  },
  {
    step: '04',
    agent: 'Availability Agent',
    desc: 'Scans live doctor schedules, cross-references existing bookings, and identifies open 30-min slots.',
    highlight: 'Real-Time Calendar Sync',
    color: '#F59E0B',
  },
  {
    step: '05',
    agent: 'Smart Decision Engine',
    desc: 'Calculates optimal matches using a multi-factor formula balancing doctor rating, experience, fee, and slot earliness.',
    highlight: 'Multi-Factor Scoring',
    color: '#EC4899',
  },
  {
    step: '06',
    agent: 'Appointment Booking Agent',
    desc: 'Transactionally reserves and locks the chosen slot in the MySQL database to prevent double-booking.',
    highlight: 'Atomic Database Lock',
    color: '#06B6D4',
  },
  {
    step: '07',
    agent: 'Notification & Reminder Agent',
    desc: 'Dispatches HTML confirmation emails and schedules automated reminder jobs via APScheduler.',
    highlight: 'Email & Auto Reminders',
    color: '#14B8A6',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const handleSpecialtyClick = (specialtyName) => {
    navigate('/doctors', { state: { specialization: specialtyName } });
  };

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin';
    if (role === 'doctor') return '/doctor';
    return '/patient';
  };

  return (
    <Box sx={{ minHeight: '100vh', pb: 12 }}>
      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 12 },
          background: 'linear-gradient(180deg, rgba(14, 165, 233, 0.09) 0%, rgba(20, 184, 166, 0.04) 100%)',
          borderBottom: 1,
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                icon={<AgentIcon sx={{ color: '#0EA5E9' }} />}
                label="Next-Generation Autonomous Clinical Agent"
                color="primary"
                variant="outlined"
                sx={{ mb: 2.5, fontWeight: 700, px: 1, py: 0.5 }}
              />
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '2.5rem', sm: '3.2rem', md: '3.8rem' },
                  lineHeight: 1.15,
                  mb: 2.5,
                  letterSpacing: '-0.02em',
                }}
              >
                Describe Symptoms.{' '}
                <span className="health-gradient-text">Our AI Agent Schedules</span> the Best Doctor.
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, mb: 4, lineHeight: 1.65, fontSize: { xs: '1rem', md: '1.15rem' } }}>
                A multi-agent autonomous system that parses patient symptoms, cross-checks certified specialist availability in real-time, eliminates scheduling conflicts, and delivers seamless healthcare appointments.
              </Typography>

              {/* Action Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => navigate('/doctors')}
                  startIcon={<SearchIcon />}
                  sx={{
                    px: 3.5,
                    py: 1.4,
                    fontWeight: 700,
                    fontSize: '1rem',
                    boxShadow: '0 8px 20px rgba(14, 165, 233, 0.35)',
                  }}
                >
                  Find Doctors & Specialists
                </Button>

                {isAuthenticated ? (
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    onClick={() => navigate('/consult')}
                    startIcon={<AgentIcon />}
                    sx={{ px: 3, py: 1.4, fontWeight: 700, borderWidth: 2 }}
                  >
                    Start AI Consultation
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    onClick={() => navigate('/login')}
                    startIcon={<LockIcon />}
                    sx={{ px: 3, py: 1.4, fontWeight: 700, borderWidth: 2 }}
                  >
                    Sign In for AI Consultation
                  </Button>
                )}
              </Stack>

              {/* Public Exploration Notice */}
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 4 }}>
                ℹ️ <strong>Open Access:</strong> Anyone can search certified doctors and view upcoming open slots. Booking an appointment or starting an AI consultation requires a free patient account.
              </Typography>

              {/* Trust Badges */}
              <Grid container spacing={2}>
                {[
                  { label: '99.4% Matching Accuracy', icon: <CheckIcon color="success" fontSize="small" /> },
                  { label: 'Real-Time Slot Verification', icon: <CalendarIcon color="primary" fontSize="small" /> },
                  { label: 'Zero Double-Booking Guarantee', icon: <SafetyIcon color="info" fontSize="small" /> },
                  { label: 'Automated Reminders (APScheduler)', icon: <NotificationIcon color="secondary" fontSize="small" /> },
                ].map((badge, idx) => (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {badge.icon}
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.88rem' }}>
                        {badge.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Hero Right Visual: Live Agent Architecture Simulation */}
            <Grid item xs={12} md={5}>
              <Paper
                elevation={6}
                sx={{
                  p: 3.5,
                  borderRadius: 4,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  position: 'relative',
                  boxShadow: '0 20px 40px -15px rgba(0,0,0,0.15)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                      <BrainIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Autonomous Agent Workflow
                    </Typography>
                  </Box>
                  <Chip label="ACTIVE" color="success" size="small" sx={{ fontWeight: 800, height: 22 }} />
                </Box>

                {/* Patient Intake Simulation */}
                <Box sx={{ p: 2, bgcolor: 'rgba(14, 165, 233, 0.08)', borderRadius: 2.5, mb: 2 }}>
                  <Typography variant="caption" sx={{ color: 'primary.dark', fontWeight: 800, letterSpacing: 0.5, display: 'block' }}>
                    SAMPLE PATIENT SYMPTOMS:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    "I have severe chest pain and breathlessness for 2 days"
                  </Typography>
                </Box>

                {/* Multi-Agent Execution Progress */}
                <Stack spacing={1.2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>1. AI Symptom Analysis</Typography>
                    <Chip label="Cardiologist (96%) &bull; Urgent" color="error" size="small" sx={{ fontWeight: 700 }} />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>2. Doctor Matching</Typography>
                    <Chip label="3 Specialists Filtered" color="info" size="small" sx={{ fontWeight: 700 }} />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>3. Live Calendar Check</Typography>
                    <Chip label="Slots Verified" color="primary" size="small" sx={{ fontWeight: 700 }} />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>4. Smart Decision Engine</Typography>
                    <Chip label="Score: 94.2%" color="success" size="small" sx={{ fontWeight: 700 }} />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>5. Automated Email Reminders</Typography>
                    <Chip label="SMTP Dispatch" color="secondary" size="small" sx={{ fontWeight: 700 }} />
                  </Box>
                </Stack>

                <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(20, 184, 166, 0.1)', borderRadius: 2.5, textAlign: 'center', border: 1, borderColor: 'secondary.light' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'secondary.dark' }}>
                    Recommended: Dr. Marcus Vance (Cardiologist)
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                    Earliest Slot: Tomorrow at 10:00 AM &bull; Rating: 4.9 &bull; Experience: 16 Yrs
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* KPI Stats Section */}
      <Container maxWidth="lg" sx={{ mt: -4 }}>
        <Paper
          elevation={4}
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Grid container spacing={3} textAlign="center" divider={<Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />}>
            {[
              { stat: '8+', label: 'Specialized Clinical Departments', icon: <StethoscopeIcon color="primary" /> },
              { stat: '< 3s', label: 'Average Autonomous Triage Time', icon: <SpeedIcon color="secondary" /> },
              { stat: '100%', label: 'Conflict-Free Calendar Sync', icon: <CalendarIcon color="success" /> },
              { stat: '24/7', label: 'Continuous Agent Scheduling', icon: <TimeIcon color="warning" /> },
            ].map((item, idx) => (
              <Grid item xs={6} md={3} key={idx}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>{item.icon}</Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary' }}>
                  {item.stat}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.85rem' }}>
                  {item.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      {/* About The Project Section */}
      <Container maxWidth="lg" sx={{ mt: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 7 }}>
          <Chip label="ABOUT THE PLATFORM" color="primary" variant="outlined" sx={{ fontWeight: 700, mb: 1.5 }} />
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>
            Transforming Healthcare Scheduling with Agentic AI
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 800, mx: 'auto', fontWeight: 400, lineHeight: 1.6 }}>
            Healthcare Appointment Agent is designed to solve the critical bottlenecks in traditional healthcare:
            misdiagnosed specialties, long phone hold times, scheduling conflicts, and missed appointments.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderRadius: 3, p: 2, border: 1, borderColor: 'divider' }}>
              <CardContent>
                <Avatar sx={{ bgcolor: 'rgba(14, 165, 233, 0.12)', color: 'primary.main', mb: 2, width: 50, height: 50 }}>
                  <BrainIcon fontSize="medium" />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Autonomous Clinical Triage
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  Patients describe their condition in everyday words. The AI analyzes symptoms against medical taxonomies to pinpoint the most appropriate specialization with confidence ratings, severity flags, and emergency warnings.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderRadius: 3, p: 2, border: 1, borderColor: 'divider' }}>
              <CardContent>
                <Avatar sx={{ bgcolor: 'rgba(20, 184, 166, 0.12)', color: 'secondary.main', mb: 2, width: 50, height: 50 }}>
                  <SparkleIcon fontSize="medium" />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Multi-Factor Doctor Scoring
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  Rather than showing a random list, our intelligent decision engine evaluates verified physician experience, patient ratings, consultation fees, and the earliness of available openings to recommend the optimal match.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderRadius: 3, p: 2, border: 1, borderColor: 'divider' }}>
              <CardContent>
                <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', mb: 2, width: 50, height: 50 }}>
                  <NotificationIcon fontSize="medium" />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Automated Scheduling & Alerts
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  Appointments are atomically reserved in the database to prevent double-booking. The system dispatches HTML email confirmations via Flask-Mail and triggers background reminder jobs using APScheduler.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* 7-Step Multi-Agent Architecture Deep Dive */}
      <Box sx={{ mt: 12, py: 10, bgcolor: 'background.paper', borderTop: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <Chip label="CORE ARCHITECTURE" color="secondary" variant="outlined" sx={{ fontWeight: 700, mb: 1.5 }} />
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>
              The 7-Step Autonomous Agent Pipeline
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 750, mx: 'auto', fontWeight: 400 }}>
              Each step in the workflow is executed by an isolated, specialized agent working collaboratively to deliver accurate, conflict-free appointments.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {AGENT_WORKFLOW_STEPS.map((item, idx) => (
              <Grid item xs={12} sm={6} md={idx === 6 ? 12 : 4} key={item.step}>
                <Card
                  className="hover-lift"
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    p: 2.5,
                    border: 1,
                    borderColor: 'divider',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      bgcolor: item.color,
                    }}
                  />
                  <CardContent sx={{ p: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: item.color, opacity: 0.9 }}>
                        {item.step}
                      </Typography>
                      <Chip label={item.highlight} size="small" sx={{ fontWeight: 700, bgcolor: 'action.hover' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontSize: '1.05rem' }}>
                      {item.agent}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      {item.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Explore Medical Specialties Section */}
      <Container maxWidth="lg" sx={{ mt: 10 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'flex-end' }, justifyContent: 'space-between', mb: 5 }}>
          <Box>
            <Chip label="CLINICAL DEPARTMENTS" color="primary" variant="outlined" sx={{ fontWeight: 700, mb: 1.5 }} />
            <Typography variant="h3" sx={{ fontWeight: 900 }}>
              Explore Medical Specializations
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
              Browse certified physicians across departments. Click any specialization to view available doctors.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate('/doctors')}
            endIcon={<ArrowIcon />}
            sx={{ mt: { xs: 2, md: 0 }, fontWeight: 700 }}
          >
            View All Doctors
          </Button>
        </Box>

        <Grid container spacing={3}>
          {SPECIALTIES.map((spec) => (
            <Grid item xs={12} sm={6} md={3} key={spec.name}>
              <Card
                className="hover-lift"
                onClick={() => handleSpecialtyClick(spec.name)}
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  cursor: 'pointer',
                  border: 1,
                  borderColor: 'divider',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 8px 25px rgba(14, 165, 233, 0.15)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h3" sx={{ mb: 1.5 }}>
                    {spec.icon}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontSize: '1.05rem' }}>
                    {spec.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.84rem', mb: 2, minHeight: 40 }}>
                    {spec.desc}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    Explore Doctors <ArrowIcon fontSize="inherit" />
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Comparison: Traditional vs. HealthAgent AI */}
      <Container maxWidth="lg" sx={{ mt: 12 }}>
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1.5 }}>
              Why Choose Autonomous Agentic Scheduling?
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              How our intelligent multi-agent platform compares to legacy clinic booking systems.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(239, 68, 68, 0.05)', border: 1, borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'error.main', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  ❌ Traditional Booking Systems
                </Typography>
                <Stack spacing={2}>
                  {[
                    'Long phone hold times and busy receptionist queues',
                    'Patients guessing the wrong medical department',
                    'Double-booking and scheduling overlap conflicts',
                    'No objective doctor comparison or rating breakdown',
                    'High patient no-show rate due to lack of automated reminders',
                  ].map((text, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <Typography sx={{ color: 'error.main', fontWeight: 800 }}>&bull;</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{text}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(16, 185, 129, 0.05)', border: 1, borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.main', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  ✅ HealthAgent Autonomous AI
                </Typography>
                <Stack spacing={2}>
                  {[
                    'Instant 24/7 symptom triage in under 3 seconds',
                    'Precise AI matching based on clinical symptom taxonomy',
                    'Real-time calendar verification eliminating double-bookings',
                    'Transparent profiles with verified ratings, experience & fees',
                    'Automated email notifications and reminders via APScheduler',
                  ].map((text, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <CheckIcon sx={{ color: 'success.main', fontSize: 18, mt: 0.2 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{text}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Emergency Medical Disclaimer */}
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Alert
          severity="warning"
          icon={<SafetyIcon fontSize="large" />}
          sx={{
            borderRadius: 3,
            p: 2.5,
            border: 1,
            borderColor: 'warning.light',
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
            Clinical Safety & Emergency Disclaimer
          </Typography>
          <Typography variant="body2">
            This AI platform provides clinical scheduling and preliminary outpatient triage assistance. It is not an emergency response service. If you or someone you know is experiencing acute life-threatening symptoms (such as severe chest pain, stroke symptoms, major trauma, or difficulty breathing), please immediately contact <strong>911</strong> or visit your nearest emergency room.
          </Typography>
        </Alert>
      </Container>

      {/* System Credentials Preview Card */}
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'primary.light',
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Ready to Experience the Platform?
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Sign in with one of the pre-configured accounts or create a new account to test all roles:
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Chip label="PATIENT" color="primary" size="small" sx={{ fontWeight: 700, mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>patient@example.com</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>password123</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Chip label="DOCTOR" color="secondary" size="small" sx={{ fontWeight: 700, mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>doctor.sarah@healthagent.ai</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>doctor123</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Chip label="ADMIN" color="error" size="small" sx={{ fontWeight: 700, mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>admin@healthagent.ai</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>admin123</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(isAuthenticated ? getDashboardPath() : '/login')}
              sx={{ fontWeight: 700, px: 3 }}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Sign In to Account'}
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate('/doctors')}
              sx={{ fontWeight: 700, px: 3 }}
            >
              Explore Doctors
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
