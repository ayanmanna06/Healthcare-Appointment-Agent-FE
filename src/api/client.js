import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_JIRA_BASE_URL || import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('health_jwt_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthEndpoint = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthEndpoint) {
        localStorage.removeItem('health_jwt_token');
        localStorage.removeItem('health_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

export const patientAPI = {
  consultSymptoms: (payload) => api.post('/patient/symptoms', payload),
  getRecommendedDoctors: (params) => api.get('/patient/recommended-doctors', { params }),
  getDoctors: () => api.get('/patient/doctors'),
  getSpecializations: () => api.get('/patient/specializations'),
  getDoctorSlots: (doctorId, days = 7) => api.get(`/patient/doctor/${doctorId}/slots`, { params: { days } }),
  bookAppointment: (data) => api.post('/patient/appointments/book', data),
  cancelAppointment: (data) => api.post('/patient/appointments/cancel', data),
  rescheduleAppointment: (data) => api.post('/patient/appointments/reschedule', data),
  getAppointments: () => api.get('/patient/appointments'),
  getNotifications: () => api.get('/patient/notifications'),
};

export const doctorAPI = {
  getAvailability: () => api.get('/doctor/availability'),
  setAvailability: (slots, overwrite = false) => api.post('/doctor/availability', slots, { params: { overwrite } }),
  getAppointments: (status) => api.get('/doctor/appointments', { params: { status } }),
  approveAppointment: (appointmentId) => api.post('/doctor/appointment/approve', { appointment_id: appointmentId }),
  rejectAppointment: (appointmentId, reason) => api.post('/doctor/appointment/reject', { appointment_id: appointmentId, reason }),
  addNotes: (noteData) => api.post('/doctor/appointment/notes', noteData),
  getNotes: (appointmentId) => api.get(`/doctor/appointment/${appointmentId}/notes`),
};

export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getDoctors: () => api.get('/admin/doctors'),
  getPatients: () => api.get('/admin/patients'),
  getAppointments: () => api.get('/admin/appointments'),
  getDecisions: () => api.get('/admin/decisions'),
};

export default api;
