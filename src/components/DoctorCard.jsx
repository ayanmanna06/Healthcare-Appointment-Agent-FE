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
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  MedicalServices as StethoscopeIcon,
  WorkOutline as ExpIcon,
  AttachMoney as FeeIcon,
  MeetingRoom as RoomIcon,
  EventAvailable as SlotIcon,
  SwapHoriz as SwapHorizIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircleOutline as CheckCircleIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  HistoryEdu as HistoryEduIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function DoctorCard({
  doctor,
  onSelectDoctor,
  earliestSlot,
  isRecommended,
  isSelected,
  onCardClick,
  onReferPatient,
  onEditDoctor,
  onToggleStatus,
  onDeleteDoctor,
  onViewHistory,
}) {
  const { isAuthenticated, role, user } = useAuth();
  if (!doctor) return null;

  const isAdmin = role === 'admin';
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
        opacity: isAdmin && doctor.is_active === false ? 0.75 : 1,
      }}
    >
      {/* Top Badges */}
      {isAdmin ? (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 1,
          }}
        >
          <Chip
            label={doctor.is_active !== false ? 'ACTIVE' : 'DEACTIVATED'}
            size="small"
            color={doctor.is_active !== false ? 'success' : 'default'}
            sx={{
              fontWeight: 800,
              fontSize: '0.65rem',
              height: 22,
              letterSpacing: 0.5,
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            }}
          />
        </Box>
      ) : (isSelected || isRecommended) ? (
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
      ) : null}

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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap', mt: 0.5 }}>
              <Chip
                icon={<StethoscopeIcon fontSize="small" sx={{ color: '#2DD4BF !important' }} />}
                label={`Specialization: ${doctor.specialization_name || 'Specialist'}`}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  bgcolor: 'rgba(20, 184, 166, 0.15)',
                  color: '#2DD4BF',
                  border: '1px solid rgba(20, 184, 166, 0.4)',
                }}
              />
              {doctor.qualification && (
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  • {doctor.qualification}
                </Typography>
              )}
            </Box>
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
          {isAdmin && doctor.email && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, gridColumn: 'span 2' }}>
              <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {doctor.email} {doctor.phone ? `• ${doctor.phone}` : ''}
              </Typography>
            </Box>
          )}

          {isAdmin && (
            <Box
              sx={{
                gridColumn: 'span 2',
                p: 1.2,
                borderRadius: 2,
                bgcolor: 'rgba(14, 165, 233, 0.08)',
                border: '1px solid rgba(14, 165, 233, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <PeopleIcon fontSize="small" sx={{ color: 'primary.main' }} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Assigned Patients:
                </Typography>
              </Box>
              <Chip
                label={`${doctor.today_patients_count || 0} Today (${doctor.total_patients_count || 0} Total)`}
                size="small"
                color={doctor.today_patients_count > 0 ? 'primary' : 'default'}
                sx={{ fontWeight: 800, fontSize: '0.72rem', height: 22 }}
              />
            </Box>
          )}
        </Box>

        {isAuthenticated && !isAdmin && earliestSlot && (
          <Box sx={{ mb: 2, p: 1.2, bgcolor: 'rgba(14, 165, 233, 0.08)', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SlotIcon fontSize="small" sx={{ color: 'primary.main' }} />
            <Typography variant="caption" sx={{ color: 'primary.dark', fontWeight: 600 }}>
              Earliest: {earliestSlot.date} at {earliestSlot.start_time}
            </Typography>
          </Box>
        )}
      </CardContent>

      <Box sx={{ p: 2, pt: 0, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
        {isAdmin ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.8 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditDoctor && onEditDoctor(doctor);
                }}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  textTransform: 'none',
                  py: 0.75,
                  borderRadius: 2,
                }}
              >
                Edit Profile
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<HistoryEduIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewHistory && onViewHistory(doctor);
                }}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  textTransform: 'none',
                  py: 0.75,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #0D9488, #0F766E)',
                  boxShadow: '0 3px 10px rgba(13, 148, 136, 0.3)',
                }}
              >
                Patient History
              </Button>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 0.8 }}>
              <Button
                variant="outlined"
                color="info"
                size="small"
                startIcon={<SlotIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDoctor && onSelectDoctor(doctor);
                }}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  borderRadius: 1.5,
                  py: 0.5,
                }}
              >
                Roster
              </Button>

              <Button
                variant="outlined"
                color={doctor.is_active !== false ? 'warning' : 'success'}
                size="small"
                startIcon={doctor.is_active !== false ? <BlockIcon /> : <CheckCircleIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStatus && onToggleStatus(doctor);
                }}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  borderRadius: 1.5,
                  py: 0.5,
                }}
              >
                {doctor.is_active !== false ? 'Deactivate' : 'Activate'}
              </Button>

              <Tooltip title="Delete Specialist">
                <IconButton
                  color="error"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDoctor && onDeleteDoctor(doctor);
                  }}
                  sx={{
                    border: '1px solid',
                    borderColor: 'error.main',
                    borderRadius: 1.5,
                    px: 1,
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ) : onCardClick ? (
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
