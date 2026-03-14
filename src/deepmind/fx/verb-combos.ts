// ============================================================================
// Reverb Combo Effects (FlangVerb, ChorusVerb, DelayVerb)
// ============================================================================

export const FLANG_VERB_PARAM_KEYS = [
  'speed',
  'depth',
  'delay',
  'phase',
  'feed',
  'balance',
  'preDelay',
  'decay',
  'size',
  'damping',
  'loCut',
  'mix'
] as const;

export const CHORUS_VERB_PARAM_KEYS = [
  'speed',
  'depth',
  'delay',
  'phase',
  'wave',
  'balance',
  'preDelay',
  'decay',
  'size',
  'damping',
  'loCut',
  'mix'
] as const;

export const DELAY_VERB_PARAM_KEYS = [
  'time',
  'pattern',
  'feedHC',
  'feedback',
  'xFeed',
  'balance',
  'preDelay',
  'decay',
  'size',
  'damping',
  'loCut',
  'mix'
] as const;

export const MOD_DLYT_REV_PARAM_KEYS = [
  'time',
  'factor',
  'feedback',
  'feedHC',
  'depth',
  'speed',
  'mode',
  'rType',
  'decay',
  'damping',
  'balance',
  'mix',
] as const;
