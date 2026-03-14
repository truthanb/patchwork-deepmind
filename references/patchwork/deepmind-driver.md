# DeepMind Driver Implementation Plan

## Status update: DeepMind MCP (patchwork-deepmind)

As of 2026-01-10, a **DeepMind-first MCP server** exists in this workspace (separate from Patchwork’s multi-synth driver framework) and already hits the original “Phase 0 → Phase 1” goals:

- MCP tools implemented:
  - `set_param` (deterministic param spec + deterministic alias resolution; no fuzzy matching)
  - `set_params` (batched NRPN; sorted to maximize address caching)
  - `snapshot_state` (edit-buffer SysEx dump; returns raw + decoded payload)
- Transport reliability:
  - Universal Device Inquiry + DeepMind App Notify handshake on connect
  - deterministic MIDI port selection: env override (`MIDI_IN`/`MIDI_OUT`), optional shared hint (`MIDI_PORT`), else conservative autodetect
  - stderr-only logging
- SysEx snapshot decoding:
  - DeepMind “Packed MS bit” unpacking implemented
  - fixture-based tests validate `.syx -> decoded` against stored `.bin` / `.bin242`
  - snapshot returns both the full decoded payload (typically 245 bytes) and a trimmed form (typically 242 bytes, dropping up to 3 trailing `0x00` padding bytes)

Practical reverse-engineering win:

- In the decoded edit-buffer payload, **filter cutoff** is a single `u8` at **byte offset 39 (0-based)**.
  - This was identified by sweeping cutoff via NRPN and diffing snapshots.

What’s still intentionally out of scope (for now):

- Full decode of the 242-byte edit-buffer into a complete `{ paramName: value }` map.
- A full generated DeepMind parameter spec (we currently keep a curated subset to stay shippable).

## Why DeepMind is “flagship”

Behringer DeepMind 12 is the first target in Patchwork where:

- parameter count is large (hundreds)
- the primary control surface is **NRPN** (not CC)
- the synth supports **SysEx dumps** that can move a lot of state efficiently
- DeepMind 12 adds **two independent layers** (addressing/partitioning)

This doc describes how to implement a DeepMind driver that fits the existing Patchwork architecture without a rewrite.

## Current framework constraints (as of today)

Patchwork already has the right abstraction points:

- MCP tools are intent-level (`set_param`, `set_modulation`, `set_synth_feature`, `init`, etc.)
- Drivers implement `SynthAdapter` with `setParam()` and **bulk** `setParams()`
- MIDI layer supports CC, NRPN, SysEx

However:

- `SynthCapabilities.parameterMap` is currently shaped as CC-only (`{ cc: number, description: string }`)
- MCP does **not** currently expose a bulk tool for `setParams()`

DeepMind should push us toward a **data-driven mapping format** that supports NRPN and optional SysEx bulk transfer.

## Framework adaptations (shared changes)

DeepMind should remain mostly **driver-local**, but there are a couple of small, high-leverage framework updates we should do early so the driver fits cleanly.

### Must-have adaptations

1. **Make `dump_preset` driver-delegated**
  - Current state: MCP `dump_preset` is MicroFreak-specific and reaches into a `midiPort` field.
  - Change: update the MCP handler to call `synth.dumpPreset?.()` (and/or a dedicated “dump state” method if we add one), so DeepMind can implement **edit-buffer SysEx snapshot** without MCP knowing the protocol.
  - Result: enables the “current state snapshot” goal as a normal MCP tool.

2. **Expose a bulk parameter MCP tool (wrap `setParams`)**
  - Current state: `SynthAdapter.setParams()` exists, but MCP only exposes single `set_param`.
  - Change: add a tool (e.g. `set_parameters`) that sends an array of `{ param: string, value: number }` to the driver.
  - Note: avoid constraining this tool to canonical-only params; DeepMind will need lots of synth-specific names.

### Nice-to-adapt

1. **Driver-provided MIDI reference resources**
  - Current state: `synth://<id>/midi-reference` is hard-coded by synth name.
  - Change: have MCP resources consult `synth.getDocumentationResources?.()` so DeepMind can publish docs without editing shared code.

2. **Parameter-map modeling for NRPN** (optional; can be postponed)
  - Current state: `SynthCapabilities.parameterMap` is CC-only.
  - Preferred approach: keep DeepMind’s large NRPN map in driver-local “param spec” and rely on `getParamDescriptions()` for discoverability.
  - Optional later: generalize a framework-level “parameter spec” concept if multiple NRPN-heavy synths need it.

## Goals

- **Data-driven**: the 400+ DeepMind params should live in generated data, not handwritten switch statements.
- **Fast interactive control**: single param updates should feel immediate (NRPN sends).
- **Efficient bulk apply**: multi-param changes (init patch, macro changes, preset restore) should use `setParams()` and optimize traffic.
- **Layer-aware (DM12)**: support controlling layer 1 vs layer 2 without changing the MCP tool schemas.
- **Good LLM ergonomics**: parameter names should be predictable and discoverable via `describe_synth` / `synth://.../params`.
- **SysEx docs integration**: ingest the DeepMind SysEx documentation (uploaded in the same style as the NRPN docs), clean it into a structured reference, and use it to drive:
  - dump/request helpers in `src/drivers/deepmind/sysex.ts`
  - fixture capture (raw `.syx` + decoded bytes)
  - eventual bulk write support (once payload format is understood)
- **Current state snapshots**: add a “read current state” capability for DeepMind using **edit-buffer SysEx dump** as the source of truth, returning a raw/decoded snapshot suitable for iteration, comparison, and restore.

## Non-goals (initially)

- Full parameter-level decode of the entire edit-buffer into a complete `{ paramName: value }` map (nice-to-have; not required for iteration)
- Automated parameter offset discovery / reverse engineering workflows
- Automatic fuzzy matching of param names (keep strict/explicit)
- Perfect effect-type-specific param modeling on day 1

## Proposed driver shape

### New driver folder

Create:

- `src/drivers/deepmind/`
  - `index.ts` (factory registration + detection)
  - `driver.ts` (implements `SynthAdapter`)
  - `param-spec.ts` (generated/static spec; see below)
  - `param-names.ts` (optional helpers/constants)
  - `mod-matrix.ts` (DeepMind mod routing abstraction)
  - `sysex.ts` (DeepMind SysEx helpers: app-notify, dumps, packing/unpacking)
  - `docs/` (optional DeepMind MIDI reference resource)

### Key architectural decision: “param spec” instead of CC-only parameterMap

DeepMind needs more than `{ cc }` entries. Introduce a driver-local spec type (no framework change required), e.g.:

```ts
export type DeepMindValueKind =
  | { type: 'u7' }           // 0..127
  | { type: 'u8' }           // 0..255
  | { type: 'u14' }          // 0..16383
  | { type: 'bipolar8' }     // -128..+127 encoded as 0..255 (center=0 -> 128)
  | { type: 'enum'; labels: Record<number, string> };

export interface DeepMindParamSpec {
  name: string;              // the string users/LLM pass to set_param
  nrpn: number;              // 14-bit NRPN param number
  kind: DeepMindValueKind;
  description: string;
  group?: string;            // for doc grouping (LFO, Filter, Env, FX, ...)
  layer?: 'layer1' | 'layer2' | 'global' | 'either';
}
```

This can live entirely in `src/drivers/deepmind/*` at first.

Later, if we want cross-synth reuse, we can generalize this into a framework-level “parameter spec” capability. But we do not need that to ship.

#### Design the spec to be promotable later

To avoid redoing this work when the next NRPN/SysEx-heavy synth arrives, shape the DeepMind spec so it can be promoted to a framework-level concept with minimal churn.

Practical guidance:

- Keep the spec **transport-aware** (even if DeepMind initially only uses NRPN): model “how to write this param” as a discriminated union like `cc | nrpn | sysex`.
- Keep value scaling/encoding explicit (`u7`, `u8`, `u14`, `bipolar8`, `enum`, etc.) so the driver doesn’t hide magic conversion rules.
- Allow optional links to existing Patchwork concepts:
  - `canonical?: CanonicalParam` (when a param cleanly maps to the canonical set)
  - `group`/`tags` for documentation grouping

This lets us later introduce a generic `MidiParamSpec` (or similar) under `src/synth/` without changing how DeepMind data is authored.

#### Parameter resolution (7-bit vs 8-bit vs 14-bit)

DeepMind NRPN parameters are **not uniform resolution**. Some are enums or toggles, many appear 0–255, and some may be true 14-bit (0–16383).

Practical rules:

- Treat the manual’s stated ranges as the *authoritative starting point* for `kind`:
  - `0–127` → `u7`
  - `0–255` → `u8`
  - `0–16383` → `u14` (only when explicitly confirmed)
  - small discrete ranges (`0–6`, `0–12`, etc.) → `enum` whenever labels exist
  - bipolar parameters documented as “-128 … +127 (0 … 255)” → `bipolar8`
- Do **not** assume “NRPN implies 14-bit resolution”. NRPN is a *transport*, not a guarantee of precision.

Implementation note: Patchwork’s NRPN sender always transmits both Data Entry bytes (`CC 6` MSB + `CC 38` LSB) and expects a 14-bit integer payload.
That’s fine for 7-bit and 8-bit parameters as long as we scale correctly:

- For a `u7` parameter, send values `0..127` (MSB will be `0`, LSB is the value)
- For a `u8` parameter, send values `0..255` (MSB will be `0..1`, LSB is lower 7 bits)
- Only for `u14` parameters should we scale `0.0–1.0 → 0..16383`

Why this matters: if we mistakenly scale a `0–255` parameter as `0–16383`, we’ll still “hear changes” but at the wrong curve/step size, causing subtle but real sound discrepancies.

Validation approach (lightweight): for any uncertain parameter, test a few sentinel values (min / mid / max) and confirm the synth behavior matches expectation; treat that as part of building the curated Phase 1 subset.

## Parameter naming strategy (LLM ergonomics)

### Canonical params

Continue supporting a small set of canonical params (already used across synths):

- `filter.cutoff`, `filter.resonance`
- `env.amp.attack/decay/sustain/release`
- `env.filter.attack/decay/sustain/release`
- `lfo1.rate`, `lfo2.rate`

These map to DeepMind NRPN numbers via the DeepMind spec.

### DeepMind-specific params

For everything else, use structured names that mirror the panel/menu:

- `lfo1.rate`, `lfo1.shape`, `lfo1.fade`, ...
- `vcf.cutoff`, `vcf.resonance`, `vcf.hpCutoff`, ... (or alias these to `filter.*`)
- `modMatrix.slot1.source`, `modMatrix.slot1.dest`, `modMatrix.slot1.amount` (or expose only through `set_modulation`)
- `fx1.type`, `fx1.param1`, ...

Avoid “NRPN-123” style names; keep semantic names.

### Layer addressing without changing MCP tool schemas

Use a naming prefix convention:

- `layer1.<param>`
- `layer2.<param>`

Examples:

- `layer1.filter.cutoff`
- `layer2.lfo1.rate`

The driver strips the `layerN.` prefix and routes to the correct NRPN address space.

If the DeepMind protocol uses a global “active layer” selection rather than per-param NRPN ranges, the driver can implement this as an internal sequencing step inside `setParams()` (select layer, then send the param updates).

## Transport strategy

### Interactive updates: NRPN

- Default path: send NRPN for single parameter updates.
- Use the existing MIDI layer NRPN sending.

### Bulk operations: `setParams()`

All “multi-change” work should go through `setParams()`.

Inside DeepMindDriver:

- group by layer
- send any required “mode/type selects” first
- rate-limit bursts (if needed)
- optionally de-duplicate repeated values via a cache

This is where the architecture improvements (caching/throttling) live.

### SysEx bulk (future / performance phase)

DeepMind supports SysEx dump reading. SysEx **write** support exists in some form, but we should verify early what the hardware actually accepts (whole-program only vs multi-parameter write).

Plan:

1. **Read**: use SysEx dump for preset capture/fixtures and (optionally) state snapshots.
2. **Write (verify first)**:
   - Confirm whether the DM12 accepts:
     - whole-program writes only (send full program dump back), or
     - true multi-parameter “write blocks” (smaller messages), and
     - any checksum/proprietary framing requirements.
   - If the device only accepts whole-program writes, we can still do bulk updates via `setParams()` (batched NRPN), and reserve SysEx writes for “restore preset/program” workflows.

Even with SysEx bulk support, keep the NRPN path: it’s simpler for interactive “turn the cutoff up” edits.

## App Notify / interface enablement (DeepMind-specific)

DeepMind requires the “App Notify” handshake on a given interface to enable NRPN/SysEx behavior.

Driver behavior:

- On detect/connect: run identity probe + app-notify on the MIDI port the driver is using.
- Treat this as part of `detect()` or driver init.

Important nuance: DeepMind tracks the selected NRPN parameter separately per interface (USB vs MIDI DIN vs Wi‑Fi). Our driver should assume it owns the selected NRPN state for its port.

## Layer addressing (DeepMind 12) without over-coupling the framework

DeepMind 12 has two independent layers, but we want to avoid baking “layers” into the Patchwork framework/tool schemas.

### Recommended approach: register two synth instances (DM12 only)

Treat each layer as its **own synthId**:

- `deepmind12-layer1`
- `deepmind12-layer2`

Benefits:

- No MCP schema changes (tools already accept `synthId`)
- Parameter names stay identical across layers (no `layer1.` prefix required)
- Keeps “two layers” as a DeepMind-driver concern, not a framework concern

Driver responsibilities:

- Ensure operations are serialized (shared MIDI port) to avoid interleaving layer-select + NRPN sends.
- If the hardware requires selecting the active layer, the driver performs that step at the start of each `setParam()` / `setParams()` call for the corresponding synth instance.

### Alternative: `layer1.` / `layer2.` parameter name prefixes

This also avoids framework changes, but it makes parameter names longer and forces the LLM to remember the prefix. The “two synth instances” approach is usually more ergonomic.

### Global vs per-layer parameters

If some parameters are global (e.g. certain FX/global settings), we can:

- expose them on both layer synths (safe/duplicated), or
- expose a third synthId like `deepmind12-global` (clean separation), or
- expose them on layer1 only and document it (simplest, but less discoverable)

Which option we pick can be deferred until we know the exact split.

## Effects & feature switching

Effects are a hard part because:

- FX type changes what params mean
- many params are “see list” in the docs

Proposed approach:

- Expose FX type as a **feature** (`set_synth_feature('fx1.type', 'Chorus')`) OR as a param with an enum mapping.
- For FX params, keep generic names initially:
  - `fx1.param1` … `fx1.param12`
- Document clearly that `param1..paramN` correspond to the **parameter order in Behringer’s manual** for the selected FX type.
- Later: attach per-type labels for `param1..N` based on the manual (so `describe_synth` is more helpful).

Discovery note (expected “ping-pong” work): FX is an area where documentation can be incomplete or ambiguous. When we implement FX support, plan on iterating with hardware to:

- confirm the **full list of valid FX types** and any hidden/invalid values
- confirm which `paramN` are meaningful per type (and which are ignored)
- confirm whether changing `fxN.type` implicitly **resets** parameter values (and whether the driver should warn or re-apply cached values)

The initial implementation should favor correctness and transparency: if type changes reset params, prefer to return a clear message/warning rather than silently guessing.

## Mod matrix

Follow the MicroFreak pattern:

- keep the *tool* as `set_modulation(source, destination, amount)`
- driver maps those to the DeepMind’s mod-matrix addressing

If DeepMind’s mod matrix uses “slot” semantics (slot1..slot8) rather than direct source/dest addressing, implement routing logic inside driver:

- choose a slot (or require a slot in the destination string)
- set slot source/dest then amount

This is a place where `setParams()` helps a lot: it can perform a multi-step update atomically.

## MCP surface area changes (recommended)

### Add a bulk MCP tool

Expose a tool that directly calls `SynthAdapter.setParams()`.

Rationale:

- LLM can apply “init patch” or “macro” changes efficiently
- reduces tool chatter and MIDI traffic
- preserves existing intent-level tools

Suggested tool name: `set_parameters` or `set_params`.

### Keep specialized tools

Keep `set_modulation` and `set_synth_feature`. They’re clearer to the LLM than a generic bulk set.

## Testing strategy

### Unit tests without hardware

- Validate name → NRPN mapping correctness
- Validate normalization/encoding for each `kind`:
  - `u8` maps 0.0–1.0 → 0–255
  - `u14` maps 0.0–1.0 → 0–16383
  - `bipolar8` maps -1.0–1.0 → 0–255 with center at 128

### Fixture tests with real hardware

Use the existing dump tooling to capture:

- raw `.syx`
- decoded payload bytes
- any derived JSON view

Then write tests that:

- parse known fixtures
- optionally validate “round-trip” encode/decode once SysEx write is implemented

## Implementation phases (incremental, shippable)

### Phase 0 — Wiring + handshake

- Implement the **must-have framework adaptations** (driver-delegated `dump_preset`, bulk `set_parameters` tool)
- Add DeepMind driver factory detection
- Implement identity probe + app notify in driver init
- Confirm `set_param(filter.cutoff)` works

### Phase 1 — Minimal but real control surface

- Implement the canonical params + a small curated set (VCF, VCA env, VCF env, LFOs)
- Implement `getParamDescriptions()` for those
- (Nice) Add driver-provided documentation resources for a DeepMind MIDI/SysEx reference

### Phase 2 — Full NRPN mapping (data-driven)

- Generate/import the full NRPN param spec from `analysis/deepmind_nrpn.md`
- Provide all params via `getParamDescriptions()` (grouped)

### Phase 3 — DM12 layer support

- Implement `layer1.` / `layer2.` name routing
- Decide how to treat global vs per-layer params

### Phase 4 — Performance + bulk

- Add per-driver param caching (avoid redundant sends)
- Add throttling for large `setParams()` calls
- Implement SysEx bulk write once payload format is known

## Open questions to resolve early

1. **Layer addressing protocol**: does DeepMind expose per-layer NRPN ranges, or does it require “select layer then send params”? (Driver can hide either approach.)
2. **NRPN resolution per param**: many params appear 0–255; some might be 0–127 enums; confirm any 14-bit usage.
3. **FX param semantics**: build a minimal “works everywhere” layer first, then enrich per-type labels.

### Early probe to de-risk layer addressing

Do this early, before we design too much around assumptions:

1. Put the synth in a state where layers are clearly different (e.g., Layer 1 = bright patch, Layer 2 = dark patch).
2. Manually select **Layer 1** on the front panel, then send a single obvious NRPN (e.g., VCF cutoff) from Patchwork.
3. Manually select **Layer 2** on the front panel, then send the same NRPN.

Interpretation:

- If the NRPN always affects the currently selected layer on the panel, the protocol likely requires an “active layer select” step (not encoded in NRPN address).
- If the NRPN consistently affects the same layer regardless of panel selection, the layer may be encoded in NRPN ranges or another addressing mechanism.

We can then implement the appropriate layer-select behavior inside `setParams()` (once per batch, not per param).

---

## Next actionable step

- Create `src/drivers/deepmind/param-spec.ts` as a small hand-authored subset (10–30 params), get the driver working end-to-end.
- After that, generate the rest from the cleaned NRPN table.
