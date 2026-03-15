import { resolveParamAlias } from '../deepmind/params/aliases.js';
import { encodeNormalizedToNrpnValue } from '../deepmind/params/codec.js';
import { getParamSpec, hasParamSpec, type DeepMindParamSpec } from '../deepmind/params/param-spec.js';
import { NRPN_SPECS } from '../deepmind/nrpn-spec.js';
import { getParamInfo } from '../deepmind/params/registry.js';
import { snapshotEditBuffer } from '../deepmind/snapshot.js';
import { getDeepMindTransport } from '../deepmind/transport.js';

function resolveParamOrThrow(input: string): string {
  // Rule: exact spec match wins, else deterministic alias, else reject.
  if (hasParamSpec(input)) return input;
  const alias = resolveParamAlias(input);
  if (alias && hasParamSpec(alias)) return alias;
  throw new Error(`Unsupported param: ${input}`);
}

export type ValueInput = { value?: number; rawValue?: number; label?: string };

/**
 * Resolve a value input (normalized, raw integer, or enum label) to the raw
 * NRPN value to send and a human-readable display string.
 * Exported for testing.
 */
export function resolveNrpnValue(
  resolved: string,
  spec: DeepMindParamSpec,
  input: ValueInput,
): { nrpnValue: number; displayValue: string } {
  const provided = [input.value !== undefined, input.rawValue !== undefined, input.label !== undefined].filter(
    Boolean,
  ).length;
  if (provided !== 1) {
    throw new Error('Provide exactly one of: value (normalized 0..1), rawValue (raw integer), or label (enum string)');
  }

  if (input.label !== undefined) {
    const info = getParamInfo(resolved);
    if (!info?.enum) throw new Error(`Param ${resolved} is not an enum — cannot use label`);
    const match = info.enum.values.find((v) => v.label.toLowerCase() === input.label!.toLowerCase());
    if (!match) {
      const valid = info.enum.values.map((v) => v.label).join(', ');
      throw new Error(`Unknown label "${input.label}" for ${resolved}. Valid: ${valid}`);
    }
    return { nrpnValue: match.value, displayValue: `"${match.label}" (raw ${match.value})` };
  }

  if (input.rawValue !== undefined) {
    const rawMin = spec.rawMin ?? 0;
    const rawMax = spec.rawMax ?? 255;
    const raw = Math.round(input.rawValue);
    if (raw < rawMin || raw > rawMax) {
      throw new Error(`rawValue ${raw} out of range ${rawMin}..${rawMax} for ${resolved}`);
    }
    return { nrpnValue: raw, displayValue: `raw ${raw}` };
  }

  // Normalized value (existing behavior)
  const nrpnValue = encodeNormalizedToNrpnValue(spec, input.value!);
  return { nrpnValue, displayValue: input.value!.toFixed(3) };
}


export async function handleDescribeNrpn(params: { query?: string }): Promise<{
  success: boolean;
  count: number;
  items: Array<{ nrpn: number; msb: number; lsb: number; name: string; range: string; notes?: string }>;
  resources?: string[];
}> {
  const q = params.query?.trim().toLowerCase();
  const filtered = q
    ? NRPN_SPECS.filter((s) => {
        const hay = `${s.name} ${s.range} ${s.notes ?? ''}`.toLowerCase();
        return hay.includes(q);
      })
    : [...NRPN_SPECS];

  const items = filtered
    .map((s) => {
      const msb = (s.nrpn >> 7) & 0x7f;
      const lsb = s.nrpn & 0x7f;
      return { nrpn: s.nrpn, msb, lsb, name: s.name, range: s.range, notes: s.notes };
    })
    .sort((a, b) => a.nrpn - b.nrpn);

  return {
    success: true,
    count: items.length,
    items,
    resources: ['deepmind12://references/deepmind_nrpn'],
  };
}

export async function handleDescribeParam(params: { param: string }): Promise<{
  success: boolean;
  inputParam: string;
  resolvedParam: string;
  resources?: string[];
  paramSpec?: {
    nrpn: { msb: number; lsb: number };
    kind: string;
    rawMin: number;
    rawMax: number;
    normalizedMin: number;
    normalizedMax: number;
  };
  decodedField?: {
    offset: number;
    kind: string;
    rawMin: number;
    rawMax: number;
    normalizedMin: number;
    normalizedMax: number;
    ui?: { abbr?: string; name?: string; index?: number };
    value?: { units?: string; min?: number; max?: number; modDestination?: boolean };
    notes?: string;
    condition?: { field: string; equals: number };
  };
  enum?: {
    count: number;
    values: Array<{ value: number; label: string }>;
  };
}> {
  const info = getParamInfo(params.param);
  if (!info) {
    throw new Error(`Unknown param: ${params.param}`);
  }

  const resources: string[] = ['deepmind12://capabilities/param-description'];

  return {
    success: true,
    inputParam: params.param,
    resolvedParam: info.name,
    resources,
    paramSpec: info.settable
      ? {
          nrpn: info.settable.nrpn,
          kind: info.settable.kind,
          rawMin: info.settable.rawMin,
          rawMax: info.settable.rawMax,
          normalizedMin: info.settable.normalizedMin,
          normalizedMax: info.settable.normalizedMax,
        }
      : undefined,
    decodedField: info.decoded
      ? {
          offset: info.decoded.offset,
          kind: info.decoded.kind,
          rawMin: info.decoded.rawMin,
          rawMax: info.decoded.rawMax,
          normalizedMin: info.decoded.normalizedMin,
          normalizedMax: info.decoded.normalizedMax,
          ui: info.decoded.ui,
          value: info.decoded.value,
          notes: info.decoded.notes,
          condition: info.decoded.condition,
        }
      : undefined,
    enum: info.enum
      ? {
          count: info.enum.values.length,
          values: info.enum.values,
        }
      : undefined,
  };
}

export async function handleSetParam(params: {
  param: string;
  value?: number;
  rawValue?: number;
  label?: string;
  synthId?: string;
}): Promise<{ success: boolean; message: string; resolvedParam?: string }> {
  const resolved = resolveParamOrThrow(params.param);
  const spec = getParamSpec(resolved);
  const { nrpnValue, displayValue } = resolveNrpnValue(resolved, spec, params);

  const transport = await getDeepMindTransport();
  transport.nrpn.send(spec.nrpn, nrpnValue, { enableAddressCaching: true });

  return {
    success: true,
    resolvedParam: resolved,
    message: `Set ${resolved} to ${displayValue} (NRPN ${spec.nrpn.msb}/${spec.nrpn.lsb} -> ${nrpnValue})`,
  };
}

export async function handleSetParams(params: {
  params: Array<{ param: string; value?: number; rawValue?: number; label?: string }>;
  synthId?: string;
}): Promise<{ success: boolean; message: string; resolvedCount: number }> {
  const transport = await getDeepMindTransport();

  const resolved = params.params.map((p) => {
    const resolvedName = resolveParamOrThrow(p.param);
    const spec = getParamSpec(resolvedName);
    const { nrpnValue } = resolveNrpnValue(resolvedName, spec, p);
    return { spec, nrpnValue, param: resolvedName };
  });

  // Sort by NRPN address to maximize the benefit of address caching.
  resolved.sort((a, b) => (a.spec.nrpn.msb - b.spec.nrpn.msb) || (a.spec.nrpn.lsb - b.spec.nrpn.lsb));

  for (const item of resolved) {
    transport.nrpn.send(item.spec.nrpn, item.nrpnValue, { enableAddressCaching: true });
  }

  return {
    success: true,
    resolvedCount: resolved.length,
    message: `Applied ${resolved.length} params via NRPN`,
  };
}

export async function handleSnapshotState(_params: { synthId?: string }): Promise<{
  success: boolean;
  message: string;
  state?: unknown;
  sysex?: unknown;
}> {
  const transport = await getDeepMindTransport();

  const timeoutMsRaw = process.env.SNAPSHOT_TIMEOUT_MS;
  const timeoutMs = timeoutMsRaw ? Number(timeoutMsRaw) : 15000;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error(`Invalid SNAPSHOT_TIMEOUT_MS: ${timeoutMsRaw}`);
  }

  const snapshot = await snapshotEditBuffer({
    port: transport.port,
    deviceId: transport.deviceId,
    timeoutMs,
  });

  const includeSysex = (_params as { includeSysex?: boolean }).includeSysex ?? false;
  const includeBytes = (_params as { includeBytes?: boolean }).includeBytes ?? true;

  const bytes = Buffer.from(snapshot.decodedTrimmedBase64, 'base64');

  return {
    success: true,
    message: `Captured edit-buffer snapshot (decoded ${snapshot.meta.decodedLength} bytes, trimmed ${snapshot.meta.decodedTrimmedLength} bytes)`,
    state: {
      meta: snapshot.meta,
      params: snapshot.derived ?? {},
      ...(includeBytes ? { editBufferBytes: Array.from(bytes.values()) } : {}),
    },
    ...(includeSysex
      ? {
          sysex: {
            rawSysexBase64: snapshot.rawSysexBase64,
            decodedPayloadBase64: snapshot.decodedPayloadBase64,
            decodedTrimmedBase64: snapshot.decodedTrimmedBase64,
          },
        }
      : {}),
  };
}

export async function handleSendNrpn(params: {
  nrpn: number;
  value: number;
  synthId?: string;
}): Promise<{ success: boolean; message: string }> {
  const transport = await getDeepMindTransport();
  
  // Convert NRPN number to MSB/LSB
  const msb = (params.nrpn >> 7) & 0x7F;
  const lsb = params.nrpn & 0x7F;
  
  transport.nrpn.send({ msb, lsb }, params.value, { enableAddressCaching: false });
  
  return {
    success: true,
    message: `Sent NRPN ${params.nrpn} (MSB ${msb}, LSB ${lsb}) with value ${params.value}`,
  };
}

