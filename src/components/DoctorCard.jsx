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
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function DoctorCard({ doctor, onSelectDoctor, earliestSlot, isRecommended, isSelected, onCardClick, onReferPatient }) {
  const { isAuthenticated, role, user } = useAuth();
  if (!doctor) return null;

  const isDoctorUser = role === 'doctor';
  const isSelf = isDoctorUser && (doctor.user_id === user?.id || doctor.id === user?.doctor?.id);

  return (
    <Card
      className="hover-lift"
      onClick={() => onCardClick && onCardClick(doctor)}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 3,
        border: isSelected ? '2.5px solid #0EA5E9' : isRecommended ? '1.5px solid #0EA5E9' : '1px solid',
        borderColor: isSelected ? 'primary.main' : isRecommended ? 'primary.light' : 'divider',
        boxShadow: isSelected
          ? '0 0 25px rgba(14, 165, 233, 0.4), 0 10px 25px -5px rgba(14, 165, 233, 0.3)'
          : isRecommended
          ? '0 10px 25px -5px rgba(14, 165, 233, 0.2)'
          : undefined,
        background: isSelected
          ? 'linear-gradient(180deg, rgba(14, 165, 233, 0.12) 0%, rgba(15, 23, 42, 0.9) 100%)'
          : undefined,
        cursor: onCardClick ? 'pointer' : 'default',
        transition: 'all 0.25s ease-in-out',
        transform: isSelected ? 'scale(1.02)' : 'none',
      }}
    >
      {(isSelected || isRecommended) && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: isSelected && isRecommended ? 'primary.main' : isSelected ? 'secondary.main' : 'primary.main',
            color: 'white',
            px: 1.5,
            py: 0.4,
            borderRadius: 5,
            fontSize: '0.68rem',
            fontWeight: 800,
            letterSpacing: 0.5,
            zIndex: 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          }}
        >
          {isSelected && isRecommended
            ? 'AI RECOMMENDED • ACTIVE'
            : isSelected
            ? 'SELECTED'
            : 'AI RECOMMENDED'}
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

      <Box sx={{ p: 2, pt: 0, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
        {onCardClick ? (
          <>
            <Button
              fullWidth
              variant={isSelected ? 'contained' : 'outlined'}
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                onCardClick && onCardClick(doctor);
              }}
              sx={{
                fontWeight: 800,
                fontSize: '0.85rem',
                py: 0.9,
                borderRadius: 2,
                boxShadow: isSelected ? '0 4px 14px rgba(14, 165, 233, 0.4)' : undefined,
                transition: 'all 0.2s ease',
              }}
            >
              {isSelected ? '✓ Showing in Big Card' : 'Select Specialist ➜'}
            </Button>

            <Button
              fullWidth
              size="small"
              variant="text"
              color="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onCardClick && onCardClick(doctor);
                onSelectDoctor && onSelectDoctor(doctor);
              }}
              sx={{ fontWeight: 700, fontSize: '0.78rem' }}
            >
              📅 {isAuthenticated ? 'Open Calendar & Choose Slot' : 'Sign In to Book'}
            </Button>
          </>
        ) : isDoctorUser ? (
          isSelf ? (
            <Chip
              label="★ Your Profile (Logged In Doctor)"
              color="primary"
              variant="outlined"
              sx={{ width: '100%', py: 1.5, fontWeight: 700 }}
            />
          ) : (
            <Button
              fullWidth
              variant="contained"
              startIcon={<SwapHorizIcon />}
              onClick={(e) => {
                e.stopPropagation();
                if (onReferPatient) {
                  onReferPatient(doctor);
                } else if (onSelectDoctor) {
                  onSelectDoctor(doctor);
                }
              }}
              sx={{
                fontWeight: 700,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
                },
              }}
            >
              Refer a Patient ➜
            </Button>
          )
        ) : (
          <Button
            fullWidth
            variant={isSelected || isRecommended ? 'contained' : 'outlined'}
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              onSelectDoctor && onSelectDoctor(doctor);
            }}
            sx={{ fontWeight: 700 }}
          >
            {isAuthenticated ? 'Select & Choose Slot' : 'Sign In to Book'}
          </Button>
        )}
      </Box>
    </Card>
  );
}
