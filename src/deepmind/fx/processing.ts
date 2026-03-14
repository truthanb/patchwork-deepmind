// ============================================================================
// Processing Effects
// ============================================================================

export const MIDAS_EQ_PARAM_KEYS = [
  'loShelfGain',
  'loShelfFreq',
  'loMidGain',
  'loMidFreq',
  'loMidQ',
  'hiMidGain',
  'hiMidFreq',
  'hiMidQ',
  'hiShelfGain',
  'hiShelfFreq',
  'eq'
] as const;

export const FAIR_COMP_PARAM_KEYS = [
  'mode',
  'inGainLM',
  'threshLM',
  'timeLM',
  'dcBiasLM',
  'outGainLM',
  'biasBal',
  'inGainRS',
  'threshRS',
  'timeRS',
  'dcBiasRS',
  'outGainRS'
] as const;

export const MUL_BND_DIST_PARAM_KEYS = [
  'inGain',
  'distType',
  'lowBandLev',
  'lowDrive',
  'xoverLowMid',
  'midBandLev',
  'midDrive',
  'xoverMidHi',
  'hiBandLev',
  'hiDrive',
  'cabinet',
  'outGain'
] as const;

export const NOISE_GATE_PARAM_KEYS = [
  'threshold',
  'range',
  'attack',
  'release',
  'hold',
  'punch',
  'mode',
  'power'
] as const;

export const ENHANCER_PARAM_KEYS = [
  'outGain',
  'spread',
  'bassGain',
  'bassFreq',
  'midGain',
  'midQ',
  'hiGain',
  'hiFreq',
  'solo',
] as const;
