import { describe, expect, it } from 'vitest';

import { handleDescribeParam } from './handlers.js';

describe('describe_param', () => {
  it('returns enum values for mod matrix source', async () => {
    const result = await handleDescribeParam({ param: 'modMatrix.1.source' });

    expect(result.success).toBe(true);
    expect(result.resolvedParam).toBe('modMatrix.1.source');
    expect(result.enum?.values.find((v) => v.value === 7)?.label).toBe('LFO 1');
  });

  it('now includes paramSpec for all decoded params', async () => {
    const result = await handleDescribeParam({ param: 'modMatrix.1.source' });

    expect(result.success).toBe(true);
    expect(result.paramSpec).toBeDefined();
    expect(result.paramSpec?.nrpn).toEqual({ msb: 0, lsb: 93 });
    expect(result.decodedField).toBeDefined();
  });

  it('resolves aliases and returns NRPN address when known', async () => {
    const result = await handleDescribeParam({ param: 'vcf.cutoff' });

    expect(result.success).toBe(true);
    expect(result.resolvedParam).toBe('filter.cutoff');
    expect(result.paramSpec?.nrpn).toEqual({ msb: 0, lsb: 39 });
  });

  it('returns decoded UI + units/ranges for AmbVerb params', async () => {
    const result = await handleDescribeParam({ param: 'fx1.ambVerb.preDelay' });

    expect(result.success).toBe(true);
    expect(result.paramSpec).toBeDefined();
    expect(result.paramSpec?.nrpn).toEqual({ msb: 1, lsb: 39 });
    expect(result.decodedField?.kind).toBe('u8');
    expect(result.decodedField?.rawMin).toBe(0);
    expect(result.decodedField?.rawMax).toBe(255);
    expect(result.decodedField?.ui?.abbr).toBe('PD');
    expect(result.decodedField?.value).toMatchObject({ units: 'ms', min: 0, max: 200 });
  });

  it('returns decoded units/ranges for TC Deep Reverb params', async () => {
    const result = await handleDescribeParam({ param: 'fx1.tcDeepRvrb.tone' });

    expect(result.success).toBe(true);
    expect(result.decodedField?.ui?.abbr).toBe('TON');
    expect(result.decodedField?.value).toMatchObject({ units: '%', min: -50, max: 50, modDestination: true });
  });

  it('returns enum options for TC Deep Reverb preset', async () => {
    const result = await handleDescribeParam({ param: 'fx1.tcDeepRvrb.preset' });

    expect(result.success).toBe(true);
    expect(result.decodedField?.ui?.abbr).toBe('PST');
    expect(result.enum?.count).toBeGreaterThanOrEqual(11);
    expect(result.enum?.values.find((v) => v.value === 1)?.label).toBe('Church');
    expect(result.enum?.values.find((v) => v.value === 3)?.label).toBe('Hall');
    expect(result.enum?.values.find((v) => v.value === 10)?.label).toBe('Default');
  });

  it('returns decoded UI + units/ranges for VintageRev numeric params', async () => {
    const result = await handleDescribeParam({ param: 'fx1.vintageRev.decay' });

    expect(result.success).toBe(true);
    expect(result.paramSpec).toBeDefined();
    expect(result.paramSpec?.nrpn).toEqual({ msb: 1, lsb: 41 });
    expect(result.decodedField?.kind).toBe('u8');
    expect(result.decodedField?.rawMin).toBe(0);
    expect(result.decodedField?.rawMax).toBe(255);
    expect(result.decodedField?.ui?.abbr).toBe('DCY');
    expect(result.decodedField?.ui?.name).toBe('Decay');
    expect(result.decodedField?.value).toMatchObject({
      units: 's',
      min: 0.1,
      max: 20.7,
      modDestination: true,
    });
  });

  it('returns enum options for VintageRev freeze param', async () => {
    const result = await handleDescribeParam({ param: 'fx1.vintageRev.freeze' });

    expect(result.success).toBe(true);
    expect(result.decodedField?.ui?.abbr).toBe('FRZ');
    expect(result.decodedField?.value?.modDestination).toBe(true);
    expect(result.enum?.count).toBe(2);
    expect(result.enum?.values.find((v) => v.value === 0)?.label).toBe('OFF');
    expect(result.enum?.values.find((v) => v.value === 1)?.label).toBe('ON');
  });
});
