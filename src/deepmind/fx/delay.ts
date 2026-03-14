// ============================================================================
// Delay Effects
// ============================================================================

export const DELAY_PARAM_KEYS = [
  'mix',
  'time',
  'mode',
  'factorL',
  'factorR',
  'offset',
  'loCut',
  'hiCut',
  'feedLc',
  'feedL',
  'feedR',
  'feedHC',
] as const;

export const THREE_TAP_DELAY_PARAM_KEYS = [
  'time',
  'gainT',
  'panT',
  'feedback',
  'factorA',
  'gainA',
  'panA',
  'factorB',
  'gainB',
  'panB',
  'x-feed',
  'mix',
] as const;

export const FOUR_TAP_DELAY_PARAM_KEYS = [
  'time',
  'gain',
  'feedback',
  'spread',
  'factorA',
  'gainA',
  'factorB',
  'gainB',
  'factorC',
  'gainC',
  'x-feed',
  'mix',
] as const;

export const T_RAY_DELAY_PARAM_KEYS = [
  'mix',
  'delay',
  'sustain',
  'wobble',
  'tone'
] as const;

export const DECIM_DELAY_PARAM_KEYS = [
  'mix',
  'time',
  'downSample',
  'factorL',
  'factorR',
  'bitReduce',
  'cutoff',
  'resonance',
  'type',
  'feedL',
  'feedR',
  'decimate'
] as const;
