// ============================================================================
// Modulation Effects
// ============================================================================

export const CHORUS_PARAM_KEYS = [
  'speed',
  'widthL',
  'widthR',
  'delayL',
  'delayR',
  'mix',
  'loCut',
  'hiCut',
  'phase',
  'wave',
  'spread',
] as const;

export const CHORUS_D_PARAM_KEYS = [
  'on',
  'mode',
  'mix',
  'sw1',
  'sw2',
  'sw3',
  'sw4',
] as const;

export const FLANGER_PARAM_KEYS = [
  'speed',
  'widthL',
  'widthR',
  'delayL',
  'delayR',
  'mix',
  'loCut',
  'hiCut',
  'phase',
  'feedLC',
  'feedHC',
  'feed',
] as const;

export const PHASER_PARAM_KEYS = [
  'speed',
  'depth',
  'reso',
  'base',
  'stages',
  'mix',
  'wave',
  'phase',
  'envMod',
  'attack',
  'hold',
  'release',
] as const;

export const AUTO_PAN_PARAM_KEYS = [
  'speed',
  'phase',
  'wave',
  'depth',
  'envSpd',
  'envDepth',
  'attack',
  'hold',
  'release',
] as const;

export const ROTARY_SPKR_PARAM_KEYS = [
  'loSpeed',
  'hiSpeed',
  'accel',
  'distance',
  'balance',
  'mix',
  'motor',
  'speed',
] as const;
