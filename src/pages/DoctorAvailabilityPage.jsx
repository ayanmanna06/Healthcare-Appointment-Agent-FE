import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Card,
  CardContent,
  Tooltip,
} from '@mui/material';
import {
  CalendarMonth as MonthIcon,
  ViewWeek as WeekIcon,
  AccessTime as TimeIcon,
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
  CheckCircle as ActiveIcon,
  Block as BlockIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Today as TodayIcon,
  EventBusy as LeaveIcon,
  AutoAwesome as TemplateIcon,
  Save as SaveIcon,
  EventAvailable as SlotIcon,
  Person as PatientIcon,
} from '@mui/icons-material';
import { doctorAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DURATION_OPTIONS = [15, 20, 30, 45, 60];

export default function DoctorAvailabilityPage() {
  const { user } = useAuth();

  // Active view: 0 = Week View, 1 = Month View
  const [activeTab, setActiveTab] = useState(0);

  // Weekly Schedule State
  const [weeklySchedule, setWeeklySchedule] = useState([
    { day_of_week: 0, day_name: 'Monday', is_active: true, slot_duration_minutes: 30, shifts: [{ start_time: '09:00', end_time: '13:00' }, { start_time: '14:00', end_time: '17:00' }] },
    { day_of_week: 1, day_name: 'Tuesday', is_active: true, slot_duration_minutes: 30, shifts: [{ start_time: '09:00', end_time: '13:00' }, { start_time: '14:00', end_time: '17:00' }] },
    { day_of_week: 2, day_name: 'Wednesday', is_active: true, slot_duration_minutes: 30, shifts: [{ start_time: '09:00', end_time: '13:00' }, { start_time: '14:00', end_time: '17:00' }] },
    { day_of_week: 3, day_name: 'Thursday', is_active: true, slot_duration_minutes: 30, shifts: [{ start_time: '09:00', end_time: '13:00' }, { start_time: '14:00', end_time: '17:00' }] },
    { day_of_week: 4, day_name: 'Friday', is_active: true, slot_duration_minutes: 30, shifts: [{ start_time: '09:00', end_time: '13:00' }, { start_time: '14:00', end_time: '17:00' }] },
    { day_of_week: 5, day_name: 'Saturday', is_active: true, slot_duration_minutes: 30, shifts: [{ start_time: '10:00', end_time: '14:00' }] },
    { day_of_week: 6, day_name: 'Sunday', is_active: false, slot_duration_minutes: 30, shifts: [] },
  ]);
  const [weekLoading, setWeekLoading] = useState(false);
  const [weekSaving, setWeekSaving] = useState(false);

  // Month Schedule State
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1); // 1-12
  const [monthData, setMonthData] = useState(null);
  const [monthLoading, setMonthLoading] = useState(false);

  // Alert Feedback
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Dialog for single date override
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayDialogMode, setDayDialogMode] = useState('off'); // 'default', 'off', 'custom'
  const [dayCustomShift, setDayCustomShift] = useState({ start_time: '09:00', end_time: '14:00', slot_duration_minutes: 30, reason: '' });
  const [dayLeaveReason, setDayLeaveReason] = useState('Personal Leave / Vacation');
  const [dialogSaving, setDialogSaving] = useState(false);

  // Range Leave Dialog
  const [rangeLeaveOpen, setRangeLeaveOpen] = useState(false);
  const [rangeForm, setRangeForm] = useState({
    start_date: '',
    end_date: '',
    reason: 'Vacation / Annual Leave',
  });
  const [rangeSaving, setRangeSaving] = useState(false);

  useEffect(() => {
    fetchWeeklyAvailability();
    fetchMonthSchedule(currentYear, currentMonth);
  }, []);

  const showNotification = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
  };

  // Fetch weekly availability
  const fetchWeeklyAvailability = async () => {
    setWeekLoading(true);
    try {
      const res = await doctorAPI.getAvailability();
      if (res.data.success && res.data.weekly_schedule) {
        setWeeklySchedule(res.data.weekly_schedule);
      }
    } catch (err) {
      console.error('Failed to fetch weekly schedule', err);
    } finally {
      setWeekLoading(false);
    }
  };

  // Fetch month schedule
  const fetchMonthSchedule = async (year, month) => {
    setMonthLoading(true);
    try {
      const res = await doctorAPI.getMonthSchedule(year, month);
      if (res.data.success) {
        setMonthData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch month schedule', err);
    } finally {
      setMonthLoading(false);
    }
  };

  // Month navigation
  const handlePrevMonth = () => {
    let y = currentYear;
    let m = currentMonth - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setCurrentYear(y);
    setCurrentMonth(m);
    fetchMonthSchedule(y, m);
  };

  const handleNextMonth = () => {
    let y = currentYear;
    let m = currentMonth + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setCurrentYear(y);
    setCurrentMonth(m);
    fetchMonthSchedule(y, m);
  };

  const handleJumpToToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    setCurrentYear(y);
    setCurrentMonth(m);
    fetchMonthSchedule(y, m);
  };

  // Weekly Schedule Helpers
  const handleToggleDay = (dow) => {
    setWeeklySchedule((prev) =>
      prev.map((item) => {
        if (item.day_of_week === dow) {
          const nextActive = !item.is_active;
          return {
            ...item,
            is_active: nextActive,
            shifts: nextActive && item.shifts.length === 0 ? [{ start_time: '09:00', end_time: '17:00' }] : item.shifts,
          };
        }
        return item;
      })
    );
  };

  const handleAddShift = (dow) => {
    setWeeklySchedule((prev) =>
      prev.map((item) => {
        if (item.day_of_week === dow) {
          return {
            ...item,
            is_active: true,
            shifts: [...item.shifts, { start_time: '14:00', end_time: '18:00' }],
          };
        }
        return item;
      })
    );
  };

  const handleRemoveShift = (dow, index) => {
    setWeeklySchedule((prev) =>
      prev.map((item) => {
        if (item.day_of_week === dow) {
          const newShifts = item.shifts.filter((_, idx) => idx !== index);
          return {
            ...item,
            shifts: newShifts,
            is_active: newShifts.length > 0,
          };
        }
        return item;
      })
    );
  };

  const handleShiftChange = (dow, index, field, value) => {
    setWeeklySchedule((prev) =>
      prev.map((item) => {
        if (item.day_of_week === dow) {
          const newShifts = [...item.shifts];
          newShifts[index] = { ...newShifts[index], [field]: value };
          return { ...item, shifts: newShifts };
        }
        return item;
      })
    );
  };

  const handleDurationChange = (dow, duration) => {
    setWeeklySchedule((prev) =>
      prev.map((item) => (item.day_of_week === dow ? { ...item, slot_duration_minutes: duration } : item))
    );
  };

  const applyWeeklyTemplate = (type) => {
    if (type === 'standard') {
      setWeeklySchedule([
        { day_of_week: 0, day_name: 'Monday', is_active: true, slot_duration_minutes: 30, shifts: [{ start_time: '09:00', end_time: '13:00' }, { start_time: '14:00', end_time: '17:00' }] },
        { day_of_week: 1, day_name: 'Tuesday', is_active: true, slot_duration_minutes: 30, shifts: [{ start_time: '09:00', end_time: '13:00' }, { start_time: '14:00', end_time: '17:00' }] },
        { day_of_week: 2, day_name: 'Wednesday', is_active: true, slot_duration_minutes: 30, shifts: [{ start_time: '09:00', end_time: '13:00' }, { start_time: '14:00', end_time: '17:00' }] },
        { day_of_week: 3, day_name: 'Thursday', is_active: true, slot_duration_minutes: 30, shifts: [{ start_time: '09:00', end_time: '13:00' }, { start_time: '14:00', end_time: '17:00' }] },
        { day_of_week: 4, day_name: 'Friday', is_active: true, slot_duration_minutes: 30, shifts: [{ start_time: '09:00', end_time: '13:00' }, { start_time: '14:00', end_time: '17:00' }] },
        { day_of_week: 5, day_name: 'Saturday', is_active: false, slot_duration_minutes: 30, shifts: [] },
        { day_of_week: 6, day_name: 'Sunday', is_active: false, slot_duration_minutes: 30, shifts: [] },
      ]);
      showNotification('success', 'Applied Standard Mon-Fri 9:00 - 17:00 template!');
    } else if (type === 'six_days') {
      setWeeklySchedule([
        { day_of_week: 0, day_name: 'Monday', is_active: true, slot_duration_minutes: 30, shifts: [{ start_time: '09:00', end_time: '13:00' }, { start_time: '14:00', end_time: '17:00' }] },
        { day_of_week: 1, day_name: 'Tuesday', is_active: true, slot_duration_minutes: 30, shifts: [{ start_time: '09:00', end_time: '13:00' }, { start_time: '14:00', end_time: '17:00' }] },
        { day_of_week: 2, day_name: 'Wednesday', is_active: true, slot_duration_minutes: 30, shifts: [{ start_time: '09:00', end_time: '13:00' }, { start_time: '14:00', end_time: '17:00' }] },
        { day_of_week: 3, day_name: 'Thursday', is_active: true, slot_duration_minutes: 30, shifts: [{ start_time: '09:00', end_time: '13:00' }, { start_time: '14:00', end_time: '17:00' }] },
        { day_of_week: 4, day_name: 'Friday', is_active: true, slot_duration_minutes: 30, shifts: [{ start_time: '09:00', end_time: '13:00' }, { start_time: '14:00', end_time: '17:00' }] },
        { day_of_week: 5, day_name: 'Saturday', is_active: true, slot_duration_minutes: 30, shifts: [{ start_time: '10:00', end_time: '14:00' }] },
        { day_of_week: 6, day_name: 'Sunday', is_active: false, slot_duration_minutes: 30, shifts: [] },
      ]);
      showNotification('success', 'Applied 6-Day (Mon-Sat) clinic template!');
    }
  };

  const handleSaveWeeklySchedule = async () => {
    setWeekSaving(true);
    try {
      const res = await doctorAPI.setAvailability({ days: weeklySchedule }, true);
      if (res.data.success) {
        showNotification('success', 'Weekly availability schedule saved successfully!');
        fetchMonthSchedule(currentYear, currentMonth);
      }
    } catch (err) {
      showNotification('error', err.response?.data?.error || 'Failed to save weekly schedule.');
    } finally {
      setWeekSaving(false);
    }
  };

  // Month Calendar Click Handler
  const handleDayClick = (dayObj) => {
    setSelectedDay(dayObj);
    if (dayObj.is_override) {
      if (dayObj.status === 'off') {
        setDayDialogMode('off');
        setDayLeaveReason(dayObj.override_info?.reason || 'On Leave / Vacation');
      } else {
        setDayDialogMode('custom');
        const s = dayObj.shifts[0] || {};
        setDayCustomShift({
          start_time: s.start_time || '09:00',
          end_time: s.end_time || '15:00',
          slot_duration_minutes: s.slot_duration_minutes || 30,
          reason: dayObj.override_info?.reason || 'Custom Shift Hours',
        });
      }
    } else {
      setDayDialogMode(dayObj.status === 'off' ? 'off' : 'default');
      setDayLeaveReason('Personal Off / Leave');
      setDayCustomShift({
        start_time: '09:00',
        end_time: '15:00',
        slot_duration_minutes: 30,
        reason: 'Special Clinic Hours',
      });
    }
  };

  const handleSaveDayOverride = async () => {
    if (!selectedDay) return;
    setDialogSaving(true);
    try {
      if (dayDialogMode === 'default') {
        // Delete override and return to weekly template
        await doctorAPI.deleteDateOverride({ date: selectedDay.date });
        showNotification('success', `Reset ${selectedDay.date} back to weekly schedule.`);
      } else if (dayDialogMode === 'off') {
        // Mark as Leave
        await doctorAPI.setDateOverride({
          override_date: selectedDay.date,
          is_available: false,
          reason: dayLeaveReason,
        });
        showNotification('success', `Marked ${selectedDay.date} as Day Off / Leave.`);
      } else if (dayDialogMode === 'custom') {
        // Mark as Custom shift
        await doctorAPI.setDateOverride({
          override_date: selectedDay.date,
          is_available: true,
          start_time: dayCustomShift.start_time,
          end_time: dayCustomShift.end_time,
          slot_duration_minutes: dayCustomShift.slot_duration_minutes,
          reason: dayCustomShift.reason,
        });
        showNotification('success', `Set custom hours (${dayCustomShift.start_time}-${dayCustomShift.end_time}) on ${selectedDay.date}.`);
      }
      setSelectedDay(null);
      fetchMonthSchedule(currentYear, currentMonth);
    } catch (err) {
      showNotification('error', err.response?.data?.error || 'Failed to update day override.');
    } finally {
      setDialogSaving(false);
    }
  };

  // Submit Range Leave
  const handleSaveRangeLeave = async () => {
    if (!rangeForm.start_date || !rangeForm.end_date) {
      alert('Please choose start and end date for leave.');
      return;
    }
    setRangeSaving(true);
    try {
      const res = await doctorAPI.setDateOverride({
        start_date: rangeForm.start_date,
        end_date: rangeForm.end_date,
        is_available: false,
        reason: rangeForm.reason,
      });
      if (res.data.success) {
        showNotification('success', res.data.message || 'Leave range scheduled successfully!');
        setRangeLeaveOpen(false);
        setRangeForm({ start_date: '', end_date: '', reason: 'Vacation / Annual Leave' });
        fetchMonthSchedule(currentYear, currentMonth);
      }
    } catch (err) {
      showNotification('error', err.response?.data?.error || 'Failed to schedule leave range.');
    } finally {
      setRangeSaving(false);
    }
  };

  // Compute month layout: pad days for start of month
  const monthCalendarGrid = useMemo(() => {
    if (!monthData?.days || monthData.days.length === 0) return [];
    const firstDay = monthData.days[0];
    // firstDay.day_of_week: 0=Mon, 6=Sun
    // standard calendar: Sun=0, Mon=1...
    // Let's use Monday as first column (0=Mon, 6=Sun)
    const paddingCount = firstDay.day_of_week;
    const padding = Array.from({ length: paddingCount }, (_, i) => ({ is_padding: true, key: `pad-${i}` }));
    return [...padding, ...monthData.days];
  }, [monthData]);

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Doctor Availability & Scheduling
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Configure your weekly working roster and manage full monthly calendar availability, leave dates, and custom shifts.
            </Typography>
          </Box>

          {/* Quick Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<LeaveIcon />}
              onClick={() => setRangeLeaveOpen(true)}
              sx={{ fontWeight: 700 }}
            >
              Schedule Leave / Vacation
            </Button>
            {activeTab === 0 && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSaveWeeklySchedule}
                disabled={weekSaving}
                sx={{ fontWeight: 800, px: 3 }}
              >
                {weekSaving ? 'Saving...' : 'Save Weekly Roster'}
              </Button>
            )}
          </Box>
        </Box>

        {/* Feedback alert */}
        {feedback.message && (
          <Alert severity={feedback.type || 'info'} sx={{ mb: 3 }}>
            {feedback.message}
          </Alert>
        )}

        {/* View Switcher Tabs: Week View vs Month View */}
        <Paper sx={{ mb: 4, borderRadius: 3, border: 1, borderColor: 'divider', overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                py: 2,
                fontWeight: 800,
                fontSize: '0.95rem',
                textTransform: 'none',
              },
            }}
          >
            <Tab icon={<WeekIcon />} iconPosition="start" label="Weekly Recurring Schedule (Roster)" />
            <Tab icon={<MonthIcon />} iconPosition="start" label="Monthly Calendar Schedule (Full Month Overview)" />
          </Tabs>
        </Paper>

        {/* ========================================================= */}
        {/* TAB 0: WEEKLY RECURRING SCHEDULE */}
        {/* ========================================================= */}
        {activeTab === 0 && (
          <Box>
            {/* Quick Templates Bar */}
            <Paper sx={{ p: 2.5, mb: 4, borderRadius: 3, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TemplateIcon color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Quick Schedule Templates:
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button size="small" variant="outlined" onClick={() => applyWeeklyTemplate('standard')} sx={{ fontWeight: 700 }}>
                  Standard Mon - Fri (9 AM - 5 PM)
                </Button>
                <Button size="small" variant="outlined" onClick={() => applyWeeklyTemplate('six_days')} sx={{ fontWeight: 700 }}>
                  Hospital 6-Day Clinic (Mon - Sat)
                </Button>
              </Box>
            </Paper>

            {weekLoading ? (
              <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
            ) : (
              <Grid container spacing={3}>
                {weeklySchedule.map((day) => (
                  <Grid item xs={12} key={day.day_of_week}>
                    <Paper
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: 1.5,
                        borderColor: day.is_active ? 'primary.main' : 'divider',
                        bgcolor: day.is_active ? 'rgba(14, 165, 233, 0.03)' : 'background.paper',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={day.is_active}
                                onChange={() => handleToggleDay(day.day_of_week)}
                                color="primary"
                              />
                            }
                            label={
                              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                {day.day_name}
                              </Typography>
                            }
                          />
                          <Chip
                            label={day.is_active ? 'Practicing' : 'Closed / Off'}
                            color={day.is_active ? 'primary' : 'default'}
                            size="small"
                            variant={day.is_active ? 'filled' : 'outlined'}
                            sx={{ fontWeight: 700 }}
                          />
                        </Box>

                        {day.is_active && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <TextField
                              select
                              size="small"
                              label="Slot Duration"
                              value={day.slot_duration_minutes || 30}
                              onChange={(e) => handleDurationChange(day.day_of_week, Number(e.target.value))}
                              sx={{ minWidth: 140 }}
                            >
                              {DURATION_OPTIONS.map((dur) => (
                                <MenuItem key={dur} value={dur}>
                                  {dur} Minutes
                                </MenuItem>
                              ))}
                            </TextField>
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<AddIcon />}
                              onClick={() => handleAddShift(day.day_of_week)}
                              sx={{ fontWeight: 700 }}
                            >
                              Add Shift
                            </Button>
                          </Box>
                        )}
                      </Box>

                      {/* Shifts List for this day */}
                      {day.is_active && day.shifts && day.shifts.length > 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                          {day.shifts.map((shift, sIdx) => (
                            <Box
                              key={sIdx}
                              sx={{
                                p: 1.5,
                                bgcolor: 'background.default',
                                borderRadius: 2,
                                border: 1,
                                borderColor: 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                flexWrap: 'wrap',
                              }}
                            >
                              <TimeIcon sx={{ color: 'primary.main', fontSize: '1.2rem' }} />
                              <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 60 }}>
                                Shift #{sIdx + 1}:
                              </Typography>

                              <TextField
                                label="Start Time"
                                type="time"
                                size="small"
                                value={shift.start_time}
                                onChange={(e) => handleShiftChange(day.day_of_week, sIdx, 'start_time', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ width: 140 }}
                              />
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>to</Typography>
                              <TextField
                                label="End Time"
                                type="time"
                                size="small"
                                value={shift.end_time}
                                onChange={(e) => handleShiftChange(day.day_of_week, sIdx, 'end_time', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ width: 140 }}
                              />

                              <Tooltip title="Delete this shift">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveShift(day.day_of_week, sIdx)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ))}
                        </Box>
                      ) : day.is_active ? (
                        <Alert severity="warning" sx={{ py: 0.5 }}>
                          No working hours defined. Click "Add Shift" to set morning or evening hours.
                        </Alert>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                          No clinic hours scheduled. Patients cannot book consultations on {day.day_name}.
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Bottom Save Bar */}
            <Box sx={{ mt: 4, textAlign: 'right' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<SaveIcon />}
                onClick={handleSaveWeeklySchedule}
                disabled={weekSaving}
                sx={{ fontWeight: 800, px: 4, py: 1.2 }}
              >
                {weekSaving ? 'Saving Changes...' : 'Save Weekly Availability Schedule'}
              </Button>
            </Box>
          </Box>
        )}

        {/* ========================================================= */}
        {/* TAB 1: MONTHLY CALENDAR SCHEDULE VIEW */}
        {/* ========================================================= */}
        {activeTab === 1 && (
          <Box>
            {/* Month Header Controller */}
            <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconButton onClick={handlePrevMonth} color="primary">
                  <PrevIcon />
                </IconButton>
                <Typography variant="h5" sx={{ fontWeight: 800, minWidth: 200, textAlign: 'center' }}>
                  {monthData?.month_name} {currentYear}
                </Typography>
                <IconButton onClick={handleNextMonth} color="primary">
                  <NextIcon />
                </IconButton>
                <Button size="small" variant="outlined" startIcon={<TodayIcon />} onClick={handleJumpToToday} sx={{ ml: 1, fontWeight: 700 }}>
                  Today
                </Button>
              </Box>

              {/* Legend */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#10B981' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>Available</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#8B5CF6' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>Custom Shift</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#EF4444' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>Leave / Day Off</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>Patient Bookings</Typography>
                </Box>
              </Box>
            </Paper>

            {monthLoading ? (
              <Box sx={{ textAlign: 'center', py: 10 }}><CircularProgress /></Box>
            ) : (
              <Box>
                {/* Day of Week Header: Mon - Sun */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1, textAlign: 'center' }}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((dName) => (
                    <Paper key={dName} sx={{ py: 1, bgcolor: 'rgba(14, 165, 233, 0.08)', borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {dName.slice(0, 3)}
                      </Typography>
                    </Paper>
                  ))}
                </Box>

                {/* 7-column Calendar Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1.5 }}>
                  {monthCalendarGrid.map((item, idx) => {
                    if (item.is_padding) {
                      return (
                        <Box
                          key={item.key}
                          sx={{
                            minHeight: 120,
                            bgcolor: 'rgba(255,255,255,0.01)',
                            borderRadius: 2.5,
                            border: '1px dashed',
                            borderColor: 'divider',
                            opacity: 0.3,
                          }}
                        />
                      );
                    }

                    const isAvailable = item.status === 'available';
                    const isCustom = item.status === 'custom';
                    const isOff = item.status === 'off';
                    const isToday = item.is_today;
                    const hasAppointments = item.booked_count > 0;

                    return (
                      <Paper
                        key={item.date}
                        className="hover-lift"
                        onClick={() => handleDayClick(item)}
                        sx={{
                          minHeight: 120,
                          p: 1.5,
                          borderRadius: 2.5,
                          border: isToday ? 2 : 1,
                          borderColor: isToday ? 'primary.main' : item.is_override ? (isOff ? '#EF4444' : '#8B5CF6') : 'divider',
                          bgcolor: isOff
                            ? 'rgba(239, 68, 68, 0.04)'
                            : isCustom
                            ? 'rgba(139, 92, 246, 0.05)'
                            : isAvailable
                            ? 'rgba(16, 185, 129, 0.03)'
                            : 'background.paper',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          position: 'relative',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: 'primary.light',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        {/* Day Number and Badges */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 800,
                              color: isToday ? 'primary.main' : 'text.primary',
                              width: 26,
                              height: 26,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: isToday ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
                            }}
                          >
                            {item.day}
                          </Typography>

                          {item.is_override && (
                            <Chip
                              label={isOff ? 'OFF' : 'CUSTOM'}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                bgcolor: isOff ? 'rgba(239, 68, 68, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                                color: isOff ? '#EF4444' : '#8B5CF6',
                              }}
                            />
                          )}
                        </Box>

                        {/* Schedule Content Preview */}
                        <Box sx={{ flexGrow: 1, my: 0.5 }}>
                          {isOff ? (
                            <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 700, display: 'block' }}>
                              🛑 {item.override_info?.reason || 'Day Off'}
                            </Typography>
                          ) : (
                            <Box>
                              {item.shifts && item.shifts.slice(0, 1).map((s, sIdx) => (
                                <Typography key={sIdx} variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                                  🕒 {s.start_time}-{s.end_time}
                                </Typography>
                              ))}
                              {item.shifts?.length > 1 && (
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                  +{item.shifts.length - 1} more shift
                                </Typography>
                              )}
                              <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 700, display: 'block', mt: 0.3 }}>
                                {item.total_slots} Slots
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        {/* Existing booked appointments on this day */}
                        {hasAppointments && (
                          <Box sx={{ mt: 1, p: 0.5, bgcolor: 'rgba(245, 158, 11, 0.1)', borderRadius: 1.5, textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#F59E0B', fontWeight: 800, fontSize: '0.7rem' }}>
                              📅 {item.booked_count} Booked
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* ========================================================= */}
        {/* DIALOG 1: SINGLE DAY OVERRIDE / AVAILABILITY EDITOR */}
        {/* ========================================================= */}
        <Dialog
          open={Boolean(selectedDay)}
          onClose={() => setSelectedDay(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
            Manage Date Schedule & Availability
            <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700, mt: 0.5 }}>
              {selectedDay?.day_name}, {selectedDay?.date}
            </Typography>
          </DialogTitle>

          <DialogContent dividers>
            {/* Current Day Status */}
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 1 }}>
              CHOOSE AVAILABILITY OPTION FOR THIS DATE:
            </Typography>

            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant={dayDialogMode === 'default' ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => setDayDialogMode('default')}
                  sx={{ py: 1.2, fontWeight: 700, fontSize: '0.8rem' }}
                >
                  Weekly Default
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant={dayDialogMode === 'off' ? 'contained' : 'outlined'}
                  color="error"
                  onClick={() => setDayDialogMode('off')}
                  sx={{ py: 1.2, fontWeight: 700, fontSize: '0.8rem' }}
                >
                  Mark as Off / Leave
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant={dayDialogMode === 'custom' ? 'contained' : 'outlined'}
                  color="secondary"
                  onClick={() => setDayDialogMode('custom')}
                  sx={{ py: 1.2, fontWeight: 700, fontSize: '0.8rem' }}
                >
                  Custom Hours
                </Button>
              </Grid>
            </Grid>

            {/* Mode: Default */}
            {dayDialogMode === 'default' && (
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Following Standard {selectedDay?.day_name} Schedule
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  This date will automatically use your recurring weekly schedule for {selectedDay?.day_name}s.
                </Typography>
              </Box>
            )}

            {/* Mode: Day Off / Leave */}
            {dayDialogMode === 'off' && (
              <Box sx={{ p: 2, bgcolor: 'rgba(239, 68, 68, 0.05)', borderRadius: 2, border: 1, borderColor: 'error.main' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#EF4444', mb: 1 }}>
                  Mark Doctor Unavailable / Vacation on this Date
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  label="Reason for Leave"
                  value={dayLeaveReason}
                  onChange={(e) => setDayLeaveReason(e.target.value)}
                  placeholder="e.g. Annual Vacation, Conference, Personal Leave"
                  sx={{ mt: 1 }}
                />
              </Box>
            )}

            {/* Mode: Custom Working Hours */}
            {dayDialogMode === 'custom' && (
              <Box sx={{ p: 2, bgcolor: 'rgba(139, 92, 246, 0.05)', borderRadius: 2, border: 1, borderColor: 'secondary.main' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'secondary.main', mb: 1.5 }}>
                  Define Custom Clinic Hours for {selectedDay?.date}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Start Time"
                      type="time"
                      size="small"
                      value={dayCustomShift.start_time}
                      onChange={(e) => setDayCustomShift({ ...dayCustomShift, start_time: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="End Time"
                      type="time"
                      size="small"
                      value={dayCustomShift.end_time}
                      onChange={(e) => setDayCustomShift({ ...dayCustomShift, end_time: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Slot Duration"
                      value={dayCustomShift.slot_duration_minutes}
                      onChange={(e) => setDayCustomShift({ ...dayCustomShift, slot_duration_minutes: Number(e.target.value) })}
                    >
                      {DURATION_OPTIONS.map((dur) => (
                        <MenuItem key={dur} value={dur}>{dur} Minutes</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Note / Shift Tag"
                      value={dayCustomShift.reason}
                      onChange={(e) => setDayCustomShift({ ...dayCustomShift, reason: e.target.value })}
                      placeholder="e.g. Morning Emergency Only"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Existing patient bookings on this date */}
            {selectedDay?.appointments && selectedDay.appointments.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  Confirmed Patient Appointments on this Date ({selectedDay.appointments.length}):
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {selectedDay.appointments.map((appt) => (
                    <Box
                      key={appt.id}
                      sx={{
                        p: 1.2,
                        bgcolor: 'background.default',
                        borderRadius: 2,
                        border: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {appt.patient_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Complaint: {appt.chief_complaint || 'Clinical Consultation'}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${appt.start_time} - ${appt.end_time}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setSelectedDay(null)} color="inherit" sx={{ fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveDayOverride}
              disabled={dialogSaving}
              sx={{ fontWeight: 800, px: 3 }}
            >
              {dialogSaving ? 'Saving...' : 'Apply Date Setting'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ========================================================= */}
        {/* DIALOG 2: RANGE LEAVE / VACATION PLANNER */}
        {/* ========================================================= */}
        <Dialog
          open={rangeLeaveOpen}
          onClose={() => setRangeLeaveOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
            Schedule Leave or Vacation Period
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Block multiple dates across the month so patients cannot book during your time away.
            </Typography>
          </DialogTitle>

          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                value={rangeForm.start_date}
                onChange={(e) => setRangeForm({ ...rangeForm, start_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date"
                type="date"
                fullWidth
                value={rangeForm.end_date}
                onChange={(e) => setRangeForm({ ...rangeForm, end_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Leave Description / Reason"
                fullWidth
                value={rangeForm.reason}
                onChange={(e) => setRangeForm({ ...rangeForm, reason: e.target.value })}
                placeholder="e.g. Annual Vacation, Medical Conference"
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setRangeLeaveOpen(false)} color="inherit" sx={{ fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={handleSaveRangeLeave}
              disabled={rangeSaving}
              sx={{ fontWeight: 800 }}
            >
              {rangeSaving ? 'Saving...' : 'Confirm Leave Range'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
