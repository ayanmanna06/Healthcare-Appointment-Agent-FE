import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SymptomConsultationPage from './pages/SymptomConsultationPage';
import DoctorListPage from './pages/DoctorListPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAvailabilityPage from './pages/DoctorAvailabilityPage';
import DoctorReferralPage from './pages/DoctorReferralPage';
import AdminDashboard from './pages/AdminDashboard';
import AppointmentHistoryPage from './pages/AppointmentHistoryPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', color: 'text.primary' }}>
        <Navbar />
        <Box sx={{ pt: '64px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/doctors" element={<DoctorListPage />} />

            {/* Authenticated Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/history" element={<AppointmentHistoryPage />} />
              <Route path="/profile" element={<ProfileSettingsPage />} />
            </Route>

            {/* Role-Specific Protected routes */}
            <Route element={<ProtectedRoute allowedRoles={['patient', 'admin']} />}>
              <Route path="/consult" element={<SymptomConsultationPage />} />
              <Route path="/patient" element={<PatientDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['doctor', 'admin']} />}>
              <Route path="/doctor" element={<DoctorDashboard />} />
              <Route path="/doctor/availability" element={<DoctorAvailabilityPage />} />
              <Route path="/doctor/refer-patient" element={<DoctorReferralPage />} />
              <Route path="/doctor/refer/:doctorId" element={<DoctorReferralPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  );
}
