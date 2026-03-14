import { describe, expect, it } from 'vitest';

import { listResources, readResource } from './resources.js';

describe('mcp resources', () => {
  it('lists the reference resources', () => {
    const resources = listResources();

    const uris = resources.map((r) => r.uri);
    expect(uris).toContain('deepmind12://capabilities/param-description');
    expect(uris).toContain('deepmind12://references/deepmind_sysex');
    expect(uris).not.toContain('deepmind12://references/deepmind_nrpn');
    expect(uris).not.toContain('deepmind12://references/deepmind_fx');
  });

  it('reads markdown content for deepmind_sysex', async () => {
    const content = await readResource('deepmind12://references/deepmind_sysex');
    expect(content.mimeType).toBe('text/markdown');
    expect(content.text.length).toBeGreaterThan(100);
  });
});
