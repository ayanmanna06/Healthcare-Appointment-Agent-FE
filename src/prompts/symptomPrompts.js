import presetSymptomsRaw from '../../../backend/prompts/preset_symptoms.txt?raw';

/**
 * Quick preset symptom prompts loaded directly from root prompts/preset_symptoms.txt
 */
export const PRESET_SYMPTOM_PROMPTS = presetSymptomsRaw
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

export default PRESET_SYMPTOM_PROMPTS;
