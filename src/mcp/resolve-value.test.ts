import { describe, expect, it } from 'vitest';

import { getParamSpec } from '../deepmind/params/param-spec.js';
import { resolveNrpnValue } from './handlers.js';

describe('resolveNrpnValue', () => {
  // --- label mode ---

  it('resolves enum label to correct raw value', () => {
    const spec = getParamSpec('env.amp.triggerMode');
    const result = resolveNrpnValue('env.amp.triggerMode', spec, { label: 'Loop' });
    expect(result.nrpnValue).toBe(3);
    expect(result.displayValue).toContain('Loop');
  });

  it('label matching is case-insensitive', () => {
    const spec = getParamSpec('env.amp.triggerMode');
    const result = resolveNrpnValue('env.amp.triggerMode', spec, { label: 'lfo 1' });
    expect(result.nrpnValue).toBe(1);
  });

  it('throws on unknown label', () => {
    const spec = getParamSpec('env.amp.triggerMode');
    expect(() => resolveNrpnValue('env.amp.triggerMode', spec, { label: 'Bogus' })).toThrow(/Unknown label "Bogus"/);
  });

  it('throws when label used on non-enum param', () => {
    const spec = getParamSpec('filter.cutoff');
    expect(() => resolveNrpnValue('filter.cutoff', spec, { label: 'something' })).toThrow(/not an enum/);
  });

  // --- rawValue mode ---

  it('passes rawValue through as nrpnValue', () => {
    const spec = getParamSpec('env.amp.triggerMode');
    const result = resolveNrpnValue('env.amp.triggerMode', spec, { rawValue: 3 });
    expect(result.nrpnValue).toBe(3);
  });

  it('rounds fractional rawValue', () => {
    const spec = getParamSpec('filter.cutoff');
    const result = resolveNrpnValue('filter.cutoff', spec, { rawValue: 127.6 });
    expect(result.nrpnValue).toBe(128);
  });

  it('throws on out-of-range rawValue', () => {
    const spec = getParamSpec('env.amp.triggerMode'); // rawMax=4
    expect(() => resolveNrpnValue('env.amp.triggerMode', spec, { rawValue: 5 })).toThrow(/out of range/);
  });

  // --- normalized value mode ---

  it('encodes normalized value using codec', () => {
    const spec = getParamSpec('filter.cutoff'); // rawMax=255
    const result = resolveNrpnValue('filter.cutoff', spec, { value: 0.5 });
    expect(result.nrpnValue).toBe(128); // Math.round(0.5 * 255)
  });

  // --- validation ---

  it('throws when no value provided', () => {
    const spec = getParamSpec('filter.cutoff');
    expect(() => resolveNrpnValue('filter.cutoff', spec, {})).toThrow(/Provide exactly one/);
  });

  it('throws when multiple values provided', () => {
    const spec = getParamSpec('filter.cutoff');
    expect(() => resolveNrpnValue('filter.cutoff', spec, { value: 0.5, rawValue: 128 })).toThrow(
      /Provide exactly one/,
    );
  });
});
