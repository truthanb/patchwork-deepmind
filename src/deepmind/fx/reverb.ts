import type { DecodedValueMeta } from '../decoded-patch-map.js';

// ============================================================================
// HallRev (HALL REVERB)
// ============================================================================

export const HALL_REV_PARAM_KEYS = [
  'preDelay',
  'decay',
  'size',
  'damping',
  'diffusion',
  'mix',
  'loCut',
  'hiCut',
  'bassMult',
  'spread',
  'shape',
  'modSpeed',
] as const;

// From the owner's manual "HallRev (HALL REVERB)" effect parameters table.
export const HALL_REV_UI_BY_KEY: Record<string, { abbr?: string; name?: string }> = {
  preDelay: { abbr: 'PD', name: 'PreDelay' },
  decay: { abbr: 'DCY', name: 'Decay' },
  size: { abbr: 'SIZ', name: 'Size' },
  damping: { abbr: 'DMP', name: 'Damping' },
  diffusion: { abbr: 'DIF', name: 'Diffusion' },
  mix: { abbr: 'MIX', name: 'Mix' },
  loCut: { abbr: 'LC', name: 'LoCut' },
  hiCut: { abbr: 'HC', name: 'HiCut' },
  bassMult: { abbr: 'LFX', name: 'BassMult' },
  spread: { abbr: 'SPR', name: 'Spread' },
  shape: { abbr: 'SHP', name: 'Shape' },
  modSpeed: { abbr: 'MOD', name: 'ModSpeed' },
};

// From the owner's manual "HallRev (HALL REVERB)" effect parameters table.
// Note: These are *display* ranges/units; raw storage is 0..255.
export const HALL_REV_VALUE_BY_KEY: Record<string, DecodedValueMeta> = {
  preDelay: { units: 'ms', min: 0.0, max: 200.0 },
  decay: { units: 's', min: 0.2, max: 4.9, modDestination: true },
  size: { min: 2.0, max: 200.0 },
  damping: { units: 'Hz', min: 1000, max: 20000, modDestination: true },
  diffusion: { min: 1.0, max: 30.0 },
  mix: { units: '%', min: 0.0, max: 100.0, modDestination: true },
  loCut: { units: 'Hz', min: 10.0, max: 500.0, modDestination: true },
  hiCut: { units: 'Hz', min: 200.0, max: 20000.0, modDestination: true },
  bassMult: { min: 0.5, max: 2.0, modDestination: true },
  spread: { min: 0.0, max: 50.0 },
  shape: { min: 0.0, max: 250.0, modDestination: true },
  modSpeed: { min: 0.0, max: 100.0 },
};

// ============================================================================
// PlateRev (PLATE REVERB)
// ============================================================================

export const PLATE_REV_PARAM_KEYS = [
  'preDelay',
  'decay',
  'size',
  'damping',
  'diffusion',
  'mix',
  'loCut',
  'hiCut',
  'bassMult',
  'xover',
  'modDepth',
  'modSpeed',
] as const;

// From the owner's manual "PlateRev (PLATE REVERB)" effect parameters table.
export const PLATE_REV_UI_BY_KEY: Record<string, { abbr?: string; name?: string }> = {
  preDelay: { abbr: 'PD', name: 'PreDelay' },
  decay: { abbr: 'DCY', name: 'Decay' },
  size: { abbr: 'SIZ', name: 'Size' },
  damping: { abbr: 'DMP', name: 'Damping' },
  diffusion: { abbr: 'DIF', name: 'Diffusion' },
  mix: { abbr: 'MIX', name: 'Mix' },
  loCut: { abbr: 'LC', name: 'LoCut' },
  hiCut: { abbr: 'HC', name: 'HiCut' },
  bassMult: { abbr: 'LFX', name: 'BassMult' },
  xover: { abbr: 'XOV', name: 'Xover' },
  modDepth: { abbr: 'MOD', name: 'ModDepth' },
  modSpeed: { abbr: 'MDS', name: 'ModSpeed' },
};

// From the owner's manual "PlateRev (PLATE REVERB)" effect parameters table.
// Note: These are *display* ranges/units; raw storage is 0..255.
export const PLATE_REV_VALUE_BY_KEY: Record<string, DecodedValueMeta> = {
  preDelay: { units: 'ms', min: 0.0, max: 200.0 },
  decay: { units: 's', min: 0.5, max: 10.0, modDestination: true },
  size: { min: 2.0, max: 200.0 },
  damping: { units: 'Hz', min: 1000, max: 20000, modDestination: true },
  diffusion: { min: 1.0, max: 30.0 },
  mix: { units: '%', min: 0.0, max: 100.0, modDestination: true },
  loCut: { units: 'Hz', min: 10.0, max: 500.0, modDestination: true },
  hiCut: { units: 'Hz', min: 200.0, max: 20000.0, modDestination: true },
  bassMult: { min: 0.5, max: 2.0, modDestination: true },
  xover: { units: 'Hz', min: 10.0, max: 500.0, modDestination: true },
  modDepth: { min: 1.0, max: 50.0 },
  modSpeed: { min: 0.0, max: 100.0 },
};

// ============================================================================
// RichPltRev (RICH PLATE REVERB)
// ============================================================================

export const RICH_PLT_REV_PARAM_KEYS = [
  'preDelay',
  'decay',
  'size',
  'damping',
  'diffusion',
  'mix',
  'loCut',
  'hiCut',
  'bassMult',
  'spread',
  'attack',
  'spin',
] as const;

// From the owner's manual "RichPltRev (RICH PLATE REVERB)" effect parameters table.
export const RICH_PLT_REV_UI_BY_KEY: Record<string, { abbr?: string; name?: string }> = {
  preDelay: { abbr: 'PD', name: 'PreDelay' },
  decay: { abbr: 'DCY', name: 'Decay' },
  size: { abbr: 'SIZ', name: 'Size' },
  damping: { abbr: 'DMP', name: 'Damping' },
  diffusion: { abbr: 'DIF', name: 'Diffusion' },
  mix: { abbr: 'MIX', name: 'Mix' },
  loCut: { abbr: 'LC', name: 'LoCut' },
  hiCut: { abbr: 'HC', name: 'HiCut' },
  bassMult: { abbr: 'LFX', name: 'BassMult' },
  spread: { abbr: 'SPR', name: 'Spread' },
  attack: { abbr: 'ATK', name: 'Attack' },
  spin: { abbr: 'SPN', name: 'Spin' },
};

// From the owner's manual "RichPltRev (RICH PLATE REVERB)" effect parameters table.
// Note: These are *display* ranges/units; raw storage is 0..255.
export const RICH_PLT_REV_VALUE_BY_KEY: Record<string, DecodedValueMeta> = {
  preDelay: { units: 'ms', min: 0.0, max: 200.0 },
  decay: { units: 's', min: 0.3, max: 28.9, modDestination: true },
  size: { units: 'm', min: 4.0, max: 39.0 },
  damping: { units: 'Hz', min: 1000, max: 20000, modDestination: true },
  diffusion: { units: '%', min: 0.0, max: 100.0 },
  mix: { units: '%', min: 0.0, max: 100.0, modDestination: true },
  loCut: { units: 'Hz', min: 10.0, max: 500.0, modDestination: true },
  hiCut: { units: 'Hz', min: 200.0, max: 20000.0, modDestination: true },
  bassMult: { min: 0.2, max: 4.0, modDestination: true },
  spread: { min: 0.0, max: 50.0 },
  attack: { min: 0.0, max: 100.0, modDestination: true },
  spin: { units: '%', min: 0.0, max: 100.0, modDestination: true },
};

// ============================================================================
// AmbVerb (AMBIENT REVERB)
// ============================================================================

export const AMB_VERB_PARAM_KEYS = [
  'preDelay',
  'decay',
  'size',
  'damping',
  'diffusion',
  'mix',
  'loCut',
  'hiCut',
  'mod',
  'tailGain',
] as const;

// From the owner's manual "AmbVerb (AMBIENT REVERB)" effect parameters table.
export const AMB_VERB_UI_BY_KEY: Record<string, { abbr?: string; name?: string }> = {
  preDelay: { abbr: 'PD', name: 'PreDelay' },
  decay: { abbr: 'DCY', name: 'Decay' },
  size: { abbr: 'SIZ', name: 'Size' },
  damping: { abbr: 'DMP', name: 'Damping' },
  diffusion: { abbr: 'DIF', name: 'Diffusion' },
  mix: { abbr: 'MIX', name: 'Mix' },
  loCut: { abbr: 'LC', name: 'LoCut' },
  hiCut: { abbr: 'HC', name: 'HiCut' },
  mod: { abbr: 'MOD', name: 'Mod' },
  tailGain: { abbr: 'TGN', name: 'TailGain' },
};

// From the owner's manual "AmbVerb (AMBIENT REVERB)" effect parameters table.
// Note: These are *display* ranges/units; raw storage is 0..255.
export const AMB_VERB_VALUE_BY_KEY: Record<string, DecodedValueMeta> = {
  preDelay: { units: 'ms', min: 0.0, max: 200.0 },
  decay: { units: 's', min: 0.2, max: 7.3, modDestination: true },
  size: { min: 2.0, max: 100.0 },
  damping: { units: 'Hz', min: 1000, max: 20000, modDestination: true },
  diffusion: { min: 1.0, max: 30.0 },
  mix: { units: '%', min: 0.0, max: 100.0, modDestination: true },
  loCut: { units: 'Hz', min: 10.0, max: 500.0, modDestination: true },
  hiCut: { units: 'Hz', min: 200.0, max: 20000.0, modDestination: true },
  mod: { units: '%', min: 0.0, max: 100.0 },
  tailGain: { units: '%', min: 0.0, max: 100.0, modDestination: true },
};

// ============================================================================
// GatedRev (GATED REVERB)
// ============================================================================

export const GATED_REV_PARAM_KEYS = [
  'preDelay',
  'decay',
  'attack',
  'density',
  'spread',
  'mix',
  'loCut',
  'hiSvFreq',
  'hiSvGain',
  'diffusion',
] as const;

// ============================================================================
// ReverseRev (REVERSE REVERB)
// ============================================================================

export const REVERSE_REV_PARAM_KEYS = [
  'preDelay',
  'decay',
  'rise',
  'diffusion',
  'spread',
  'mix',
  'loCut',
  'hiSvFreq',
  'hiSvGain',
] as const;

// ============================================================================
// ChamberRev (CHAMBER REVERB)
// ============================================================================

export const CHAMBER_REV_PARAM_KEYS = [
  'preDelay',
  'decay',
  'size',
  'damping',
  'diffusion',
  'mix',
  'loCut',
  'hiCut',
  'bassMult',
  'spread',
  'shape',
  'spin'
] as const;

// From the owner's manual "ChamberRev (CHAMBER REVERB)" effect parameters table.
export const CHAMBER_REV_UI_BY_KEY: Record<string, { abbr?: string; name?: string }> = {
  preDelay: { abbr: 'PRE', name: 'PreDelay' },
  decay: { abbr: 'DCY', name: 'Decay' },
  size: { abbr: 'SIZ', name: 'Size' },
  damping: { abbr: 'DMP', name: 'Damping' },
  diffusion: { abbr: 'DIF', name: 'Diffusion' },
  mix: { abbr: 'MIX', name: 'Mix' },
  loCut: { abbr: 'LC', name: 'LoCut' },
  hiCut: { abbr: 'HC', name: 'HiCut' },
  bassMult: { abbr: 'LFX', name: 'BassMult' },
  spread: { abbr: 'SPR', name: 'Spread' },
  shape: { abbr: 'SHP', name: 'Shape' },
  spin: { abbr: 'SPI', name: 'Spin' },
};

// From the owner's manual "ChamberRev (CHAMBER REVERB)" effect parameters table.
// Note: These are *display* ranges/units; raw storage is 0..255.
export const CHAMBER_REV_VALUE_BY_KEY: Record<string, DecodedValueMeta> = {
  preDelay: { units: 'ms', min: 0.0, max: 200.0 },
  decay: { units: 's', min: 0.3, max: 28.9, modDestination: true },
  size: { units: 'm', min: 4.0, max: 76.0 },
  damping: { units: 'Hz', min: 1000, max: 20000, modDestination: true },
  diffusion: { units: '%', min: 0.0, max: 100.0 },
  mix: { units: '%', min: 0.0, max: 100.0, modDestination: true },
  loCut: { units: 'Hz', min: 10.0, max: 500.0, modDestination: true },
  hiCut: { units: 'Hz', min: 200.0, max: 20000.0, modDestination: true },
  bassMult: { min: 0.2, max: 4.0, modDestination: true },
  spread: { min: 0.0, max: 50.0 },
  shape: { min: 0.0, max: 250.0, modDestination: true },
  spin: { units: '%', min: 0.0, max: 100.0 },
};

// ============================================================================
// RoomRev (ROOM REVERB)
// ============================================================================

export const ROOM_REV_PARAM_KEYS = [
  'preDelay',
  'decay',
  'size',
  'damping',
  'diffusion',
  'mix',
  'loCut',
  'hiCut',
  'bassMult',
  'spread',
  'shape',
  'spin'
] as const;

// From the owner's manual "RoomRev (ROOM REVERB)" effect parameters table.
export const ROOM_REV_UI_BY_KEY: Record<string, { abbr?: string; name?: string }> = {
  preDelay: { abbr: 'PRE', name: 'PreDelay' },
  decay: { abbr: 'DCY', name: 'Decay' },
  size: { abbr: 'SIZ', name: 'Size' },
  damping: { abbr: 'DMP', name: 'Damping' },
  diffusion: { abbr: 'DIF', name: 'Diffusion' },
  mix: { abbr: 'MIX', name: 'Mix' },
  loCut: { abbr: 'LC', name: 'LoCut' },
  hiCut: { abbr: 'HC', name: 'HiCut' },
  bassMult: { abbr: 'LFX', name: 'BassMult' },
  spread: { abbr: 'SPR', name: 'Spread' },
  shape: { abbr: 'SHP', name: 'Shape' },
  spin: { abbr: 'SPI', name: 'Spin' },
};

// From the owner's manual "RoomRev (ROOM REVERB)" effect parameters table.
// Note: These are *display* ranges/units; raw storage is 0..255.
export const ROOM_REV_VALUE_BY_KEY: Record<string, DecodedValueMeta> = {
  preDelay: { units: 'ms', min: 0.0, max: 200.0 },
  decay: { units: 's', min: 0.3, max: 28.9, modDestination: true },
  size: { units: 'm', min: 4.0, max: 76.0 },
  damping: { units: 'Hz', min: 1000, max: 20000, modDestination: true },
  diffusion: { units: '%', min: 0.0, max: 100.0 },
  mix: { units: '%', min: 0.0, max: 100.0, modDestination: true },
  loCut: { units: 'Hz', min: 10.0, max: 500.0, modDestination: true },
  hiCut: { units: 'Hz', min: 200.0, max: 20000.0, modDestination: true },
  bassMult: { min: 0.2, max: 4.0, modDestination: true },
  spread: { min: 0.0, max: 50.0 },
  shape: { min: 0.0, max: 250.0, modDestination: true },
  spin: { units: '%', min: 0.0, max: 100.0 },
};

// ============================================================================
// VintageRev (VINTAGE REVERB)
// ============================================================================

export const VINTAGE_REV_PARAM_KEYS = [
  'preDelay',
  'size',
  'decay',
  'loMult',
  'hiMult',
  'density',
  'loCut',
  'hiCut',
  'erLevel',
  'erDelay',
  'mix',
  'freeze'
] as const;

// From the owner's manual "VintageRev (VINTAGE REVERB)" effect parameters table.
export const VINTAGE_REV_UI_BY_KEY: Record<string, { abbr?: string; name?: string }> = {
  preDelay: { abbr: 'PRE', name: 'PreDelay' },
  size: { abbr: 'SIZ', name: 'Size' },
  decay: { abbr: 'DCY', name: 'Decay' },
  loMult: { abbr: 'LFX', name: 'Lo Mult' },
  hiMult: { abbr: 'HFX', name: 'Hi Mult' },
  density: { abbr: 'DEN', name: 'Density' },
  loCut: { abbr: 'LC', name: 'LoCut' },
  hiCut: { abbr: 'HC', name: 'HiCut' },
  erLevel: { abbr: 'ERL', name: 'ER Level' },
  erDelay: { abbr: 'ERD', name: 'ER Delay' },
  mix: { abbr: 'MIX', name: 'Mix' },
  freeze: { abbr: 'FRZ', name: 'Freeze' },
};

// From the owner's manual "VintageRev (VINTAGE REVERB)" effect parameters table.
// Note: These are *display* ranges/units; raw storage is 0..255.
export const VINTAGE_REV_VALUE_BY_KEY: Record<string, DecodedValueMeta> = {
  preDelay: { units: 'ms', min: 0.0, max: 200.0 },
  size: { units: '%', min: 1.0, max: 100.0 },
  decay: { units: 's', min: 0.1, max: 20.7, modDestination: true },
  loMult: { min: 0.1, max: 10.0, modDestination: true },
  hiMult: { min: 0.1, max: 10.0, modDestination: true },
  density: { units: '%', min: 0.0, max: 100.0, modDestination: true },
  loCut: { units: 'Hz', min: 10.0, max: 500.0, modDestination: true },
  hiCut: { units: 'Hz', min: 200.0, max: 20000.0, modDestination: true },
  erLevel: { units: '%', min: 0.0, max: 100.0, modDestination: true },
  erDelay: { units: 'ms', min: 0.0, max: 200.0 },
  mix: { units: '%', min: 0.0, max: 100.0, modDestination: true },
  freeze: { modDestination: true },
};

// Freeze is an ON/OFF toggle. Assuming raw 0=OFF, 1=ON.
export const VINTAGE_REV_FREEZE_VALUE_MAP: Record<number, string> = {
  0: 'OFF',
  1: 'ON',
};
