import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Paper,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Psychology as SymptomIcon,
  PersonSearch as MatchIcon,
  EventAvailable as AvailIcon,
  AutoAwesome as DecisionIcon,
  BookmarkAdded as BookIcon,
  MarkEmailRead as NotifyIcon,
  RecordVoiceOver as IntakeIcon,
} from '@mui/icons-material';

const STEP_ICONS = {
  1: <IntakeIcon sx={{ color: '#0EA5E9' }} />,
  2: <SymptomIcon sx={{ color: '#8B5CF6' }} />,
  3: <MatchIcon sx={{ color: '#3B82F6' }} />,
  4: <AvailIcon sx={{ color: '#F59E0B' }} />,
  5: <DecisionIcon sx={{ color: '#10B981' }} />,
  6: <BookIcon sx={{ color: '#0EA5E9' }} />,
  7: <NotifyIcon sx={{ color: '#14B8A6' }} />,
};

export default function AgentWorkflowStepper({ workflowTrace, activeStepIndex }) {
  if (!workflowTrace || workflowTrace.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', my: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
        <DecisionIcon sx={{ color: 'secondary.main' }} /> Multi-Agent Execution Pipeline
      </Typography>

      <Stepper orientation="vertical">
        {workflowTrace.map((stepItem, index) => {
          const stepNumber = stepItem.step || index + 1;
          const isDone = stepItem.status === 'completed';
          const icon = STEP_ICONS[stepNumber] || <CheckIcon />;

          return (
            <Step key={index} active={true} completed={isDone}>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: isDone ? 'rgba(20, 184, 166, 0.12)' : 'rgba(14, 165, 233, 0.12)',
                      border: 2,
                      borderColor: isDone ? 'secondary.main' : 'primary.main',
                    }}
                  >
                    {icon}
                  </Box>
                )}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Step {stepNumber}: {stepItem.agent}
                  </Typography>
                  <Chip
                    label={stepItem.status.toUpperCase()}
                    color={stepItem.status === 'completed' ? 'success' : 'warning'}
                    size="small"
                    sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                  />
                </Box>
              </StepLabel>

              <StepContent>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: 'background.default',
                    borderLeft: 3,
                    borderLeftColor: isDone ? 'secondary.main' : 'primary.main',
                  }}
                >
                  {typeof stepItem.output === 'string' ? (
                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                      {stepItem.output}
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {stepItem.output.detected_specialization && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            Target Specialty:
                          </Typography>
                          <Chip
                            label={stepItem.output.detected_specialization}
                            color="primary"
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                          <Chip
                            label={`Confidence: ${Math.round(stepItem.output.confidence_score * 100)}%`}
                            color="secondary"
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                          <Chip
                            label={`Urgency: ${stepItem.output.urgency_level?.toUpperCase()}`}
                            color={stepItem.output.urgency_level === 'emergency' ? 'error' : stepItem.output.urgency_level === 'high' ? 'warning' : 'info'}
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                        </Box>
                      )}

                      {stepItem.output.clinical_summary && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                          {stepItem.output.clinical_summary}
                        </Typography>
                      )}

                      {stepItem.output.top_candidates && (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          <strong>Ranked Candidates:</strong> {stepItem.output.top_candidates.join(', ')}
                        </Typography>
                      )}

                      {stepItem.output.decision_reason && (
                        <Box sx={{ mt: 1, p: 1.5, bgcolor: 'rgba(20, 184, 166, 0.08)', borderRadius: 1.5 }}>
                          <Typography variant="body2" sx={{ color: 'secondary.dark', fontWeight: 600 }}>
                            Optimal Selection Reasoning:
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.5 }}>
                            {stepItem.output.decision_reason}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                    Timestamp: {new Date(stepItem.timestamp).toLocaleTimeString()}
                  </Typography>
                </Paper>
              </StepContent>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
}
