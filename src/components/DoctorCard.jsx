import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Rating,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import {
  MedicalServices as StethoscopeIcon,
  WorkOutline as ExpIcon,
  AttachMoney as FeeIcon,
  MeetingRoom as RoomIcon,
  EventAvailable as SlotIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function DoctorCard({ doctor, onSelectDoctor, earliestSlot, isRecommended }) {
  const { isAuthenticated } = useAuth();
  if (!doctor) return null;

  return (
    <Card
      className="hover-lift"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 3,
        border: isRecommended ? '2px solid #0EA5E9' : '1px solid',
        borderColor: isRecommended ? 'primary.main' : 'divider',
        boxShadow: isRecommended ? '0 10px 25px -5px rgba(14, 165, 233, 0.25)' : undefined,
      }}
    >
      {isRecommended && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: 'primary.main',
            color: 'white',
            px: 1.5,
            py: 0.4,
            borderRadius: 5,
            fontSize: '0.7rem',
            fontWeight: 800,
            letterSpacing: 0.5,
            zIndex: 1,
          }}
        >
          AI RECOMMENDED
        </Box>
      )}

      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              width: 58,
              height: 58,
              bgcolor: 'primary.main',
              fontWeight: 800,
              fontSize: '1.2rem',
              boxShadow: '0 4px 10px rgba(14, 165, 233, 0.3)',
            }}
          >
            {doctor.full_name ? doctor.full_name.replace('Dr. ', '')[0] : 'D'}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.2 }}>
              {doctor.full_name}
            </Typography>
            <Chip
              icon={<StethoscopeIcon fontSize="small" />}
              label={doctor.specialization_name || 'Specialist'}
              size="small"
              color="secondary"
              variant="outlined"
              sx={{ mt: 0.5, fontWeight: 600, fontSize: '0.72rem' }}
            />
          </Box>
        </Box>

        {/* Rating and Reviews */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Rating value={parseFloat(doctor.rating) || 4.5} precision={0.1} size="small" readOnly />
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {doctor.rating}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            ({doctor.experience_years * 14}+ reviews)
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, minHeight: 40, fontSize: '0.85rem' }}>
          {doctor.bio || 'Board certified specialist providing advanced diagnostics and patient-centered clinical care.'}
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        {/* Doctor Details Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ExpIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Experience</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{doctor.experience_years} Years</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FeeIcon fontSize="small" sx={{ color: 'secondary.main' }} />
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Consultation</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                ${doctor.consultation_fee}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, gridColumn: 'span 2' }}>
            <RoomIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Clinic: <strong>{doctor.room_number || 'Main Consultation Suite'}</strong>
            </Typography>
          </Box>
        </Box>

        {isAuthenticated && earliestSlot && (
          <Box sx={{ mb: 2, p: 1.2, bgcolor: 'rgba(14, 165, 233, 0.08)', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SlotIcon fontSize="small" sx={{ color: 'primary.main' }} />
            <Typography variant="caption" sx={{ color: 'primary.dark', fontWeight: 600 }}>
              Earliest: {earliestSlot.date} at {earliestSlot.start_time}
            </Typography>
          </Box>
        )}
      </CardContent>

      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant={isRecommended ? 'contained' : 'outlined'}
          color="primary"
          onClick={() => onSelectDoctor && onSelectDoctor(doctor)}
          sx={{ fontWeight: 700 }}
        >
          {isAuthenticated ? 'Book Appointment' : 'Sign In to Book'}
        </Button>
      </Box>
    </Card>
  );
}
