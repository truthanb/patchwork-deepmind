import { HardwareMidiPort } from '../midi/hardware-port.js';
import { decodeDerivedFieldsFromEditBuffer, type DerivedValue } from './decoded-patch-map.js';
import { decodeDeepMindDumpResponse, makeDeepMindDumpRequest, toBase64, trimTrailingZeros } from './sysex.js';

export type DeepMindSnapshot = {
  rawSysexBase64: string;
  decodedPayloadBase64: string;
  decodedTrimmedBase64: string;
  derived?: Record<string, DerivedValue>;
  meta: {
    kind: string;
    cmd: string;
    protocol?: number;
    packedBytes: number;
    decodedLength: number;
    decodedTrimmedLength: number;
    trimmedCount: number;
  };
};

export async function snapshotEditBuffer(opts: {
  port: HardwareMidiPort;
  deviceId: number;
  timeoutMs: number;
}): Promise<DeepMindSnapshot> {
  const request = makeDeepMindDumpRequest({ type: 'edit', deviceId: opts.deviceId });

  const response = await opts.port.requestSysEx(request, opts.timeoutMs, (msg) => {
    // F0 00 20 32 20 <dev> 04 ... F7
    if (msg.length < 10) return false;
    if (msg[1] !== 0x00 || msg[2] !== 0x20 || msg[3] !== 0x32 || msg[4] !== 0x20) return false;
    if ((msg[5] & 0x0f) !== (opts.deviceId & 0x0f)) return false;
    return msg[6] === 0x04;
  });

  const { meta, decodedPayload } = decodeDeepMindDumpResponse(response);
  const trimmed = trimTrailingZeros(decodedPayload, 3);

  return {
    rawSysexBase64: toBase64(response),
    decodedPayloadBase64: toBase64(decodedPayload),
    decodedTrimmedBase64: toBase64(trimmed.trimmed),
    derived: meta.kind === 'edit' ? decodeDerivedFieldsFromEditBuffer(trimmed.trimmed) : undefined,
    meta: {
      kind: meta.kind,
      cmd: meta.cmd,
      protocol: meta.protocol,
      packedBytes: meta.packedBytes,
      decodedLength: meta.decodedLength,
      decodedTrimmedLength: trimmed.trimmed.length,
      trimmedCount: trimmed.trimmedCount,
    },
  };
}
