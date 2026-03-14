export type DeepMindDumpKind = 'program' | 'edit' | 'global' | 'unknown';

export type DeepMindDumpMeta = {
  kind: DeepMindDumpKind;
  cmd: string;
  protocol?: number;
  bank?: number;
  program?: number;
  packedBytes: number;
  decodedLength: number;
};

export function trimTrailingZeros(bytes: Uint8Array, maxTrim: number): { trimmed: Uint8Array; trimmedCount: number } {
  let end = bytes.length;
  let trimmedCount = 0;
  while (trimmedCount < maxTrim && end > 0 && bytes[end - 1] === 0x00) {
    end--;
    trimmedCount++;
  }
  if (trimmedCount === 0) {
    return { trimmed: bytes, trimmedCount: 0 };
  }
  return { trimmed: bytes.slice(0, end), trimmedCount };
}

export function unpackPackedMsb(packed: Uint8Array): Uint8Array {
  // DeepMind "Packed MS bit" format:
  // Every 8 MIDI data bytes represent 7 original 8-bit bytes.
  // Byte0 holds the MSBs for the next 7 bytes (bit j is MSB for byte j).
  const out: number[] = [];
  for (let i = 0; i + 7 < packed.length; i += 8) {
    const msbByte = packed[i] & 0x7f;
    for (let j = 0; j < 7; j++) {
      const low7 = packed[i + 1 + j] & 0x7f;
      const msb = (msbByte >> j) & 0x01;
      out.push(low7 | (msb << 7));
    }
  }
  return Uint8Array.from(out);
}

export function makeDeepMindDumpRequest(opts: {
  type: 'program' | 'edit' | 'global';
  deviceId: number;
  bank?: number;
  program?: number;
}): Uint8Array {
  // Manual: F0 00 20 32 20 <deviceId> <cmd> ... F7
  // cmd:
  //  0x01 Program Dump Request (bank, program)
  //  0x03 Edit Buffer Dump Request
  //  0x05 Global Parameter Dump Request
  const header = [0xf0, 0x00, 0x20, 0x32, 0x20, opts.deviceId & 0x0f];

  if (opts.type === 'program') {
    const bank = opts.bank ?? 0;
    const program = opts.program ?? 0;
    return Uint8Array.from([...header, 0x01, bank & 0x07, program & 0x7f, 0xf7]);
  }

  if (opts.type === 'global') {
    return Uint8Array.from([...header, 0x05, 0xf7]);
  }

  return Uint8Array.from([...header, 0x03, 0xf7]);
}

export function decodeDeepMindDumpResponse(rawSysex: Uint8Array): {
  meta: DeepMindDumpMeta;
  decodedPayload: Uint8Array;
} {
  if (rawSysex.length < 8) {
    throw new Error(`SysEx too short (${rawSysex.length} bytes)`);
  }
  if (rawSysex[0] !== 0xf0 || rawSysex[rawSysex.length - 1] !== 0xf7) {
    throw new Error('Not a SysEx frame (missing F0..F7)');
  }

  // DeepMind frame: F0 00 20 32 20 <dev> <cmd> <proto?> ... F7
  const cmd = rawSysex[6];

  if (cmd === 0x02 && rawSysex.length >= 12) {
    const protocol = rawSysex[7];
    const bank = rawSysex[8];
    const program = rawSysex[9];
    const packed = rawSysex.slice(10, -1);
    const decodedPayload = unpackPackedMsb(packed);
    return {
      meta: {
        kind: 'program',
        cmd: '0x02',
        protocol,
        bank,
        program,
        packedBytes: packed.length,
        decodedLength: decodedPayload.length,
      },
      decodedPayload,
    };
  }

  if (cmd === 0x04 && rawSysex.length >= 10) {
    const protocol = rawSysex[7];
    const packed = rawSysex.slice(8, -1);
    const decodedPayload = unpackPackedMsb(packed);
    return {
      meta: {
        kind: 'edit',
        cmd: '0x04',
        protocol,
        packedBytes: packed.length,
        decodedLength: decodedPayload.length,
      },
      decodedPayload,
    };
  }

  // Global response differs; attempt to decode assuming proto at byte 7.
  const protocol = rawSysex[7];
  const packed = rawSysex.slice(8, -1);
  const decodedPayload = unpackPackedMsb(packed);
  return {
    meta: {
      kind: 'unknown',
      cmd: `0x${cmd.toString(16).padStart(2, '0')}`,
      protocol,
      packedBytes: packed.length,
      decodedLength: decodedPayload.length,
    },
    decodedPayload,
  };
}

export function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}
