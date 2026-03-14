// ============================================================================
// Creative Effects
// ============================================================================

export const DUAL_PITCH_PARAM_KEYS = [
  'semi1',
  'cent1',
  'delay1',
  'gain1',
  'pan1',
  'mix',
  'semi2',
  'cent2',
  'delay2',
  'gain2',
  'pan2',
  'hiCut'
] as const;

export const VINTG_PITCH_PARAM_KEYS = [
  'semi1',
  'cent1',
  'delay1',
  'feedback1',
  'pan1',
  'mix',
  'semi2',
  'cent2',
  'delay2',
  'feedback2',
  'pan2',
  'hiCut'
] as const;

export const MOOD_FILTER_PARAM_KEYS = [
  'speed',
  'depth',
  'reso',
  'base freq',
  'type',
  'mix',
  'wave',
  'envMod',
  'attack',
  'release',
  'drive',
  'poles',
] as const;

export const RACK_AMP_PARAM_KEYS = [
  'preAmp',
  'buzz',
  'punch',
  'crunch',
  'drive',
  'level',
  'low',
  'high',
  'cabinet',
] as const;

export const EDISON_EX1_PARAM_KEYS = [
  'on',
  'inMode',
  'outMode',
  'stSpread',
  'lmfSpread',
  'balance',
  'cntrDist',
  'gain'
] as const;
