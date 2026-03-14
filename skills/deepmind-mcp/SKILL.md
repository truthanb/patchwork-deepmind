---
name: deepmind-mcp
description: Build and modify the DeepMind 12 MCP server. Use for adding MCP tools (set_param, set_params, snapshot_state), implementing DeepMind MIDI protocols (NRPN, SysEx dumps, App Notify handshake), and maintaining deterministic parameter naming/alias ergonomics.
compatibility: Node.js >=22, npm, macOS MIDI. Requires a connected DeepMind 12 (or fixtures) for full end-to-end validation.
metadata:
  repo: patchwork-deepmind
  focus: deepmind12
---

## Purpose

This skill helps an agent work effectively in this repository by capturing:

- the intended tool surface (MCP)
- DeepMind-specific protocol constraints (App Notify, packed SysEx payloads)
- repo commands and structure
- naming/alias rules for parameter ergonomics

## When to split into new skills

Keep this SKILL focused and short. Create additional skills (a small “skill tree”) when any of the following becomes true:

- This file grows beyond ~300–500 lines or includes long protocol tables.
- There are 2+ distinct workflows with different pitfalls (e.g. NRPN batching vs SysEx snapshot vs param-spec generation).
- Agents frequently need only one area of knowledge and loading everything slows work or causes confusion.

How to split:

- Create a new folder under `skills/` (name must be lowercase + hyphens and match the folder name).
- Keep the new SKILL narrowly scoped (one workflow) and link to supporting files in `references/` or `fixtures/`.
- Leave a short pointer here so agents discover the right skill quickly.

### Related skills

- `skills/deepmind-parameter-guide/` — read before setting params; has
  per-section guides for what parameters do and how they interact.
- `skills/owners-manual-transcription/` — workflow for adding new sections
  to the parameter guide from the Owner's Manual PDF.

## Quick commands

- Install: `npm install`
- Build: `npm run build`
- Test: `npm test`
- Run MCP server (stdio): `npm start`

## Repo structure

- `src/mcp/` MCP server wiring and tool handlers
  - `src/mcp/server.ts` entrypoint
  - `src/mcp/tools.ts` tool schemas
  - `src/mcp/handlers.ts` tool implementation (calls DeepMind modules)
- `src/deepmind/` DeepMind-specific logic
  - `src/deepmind/params/` parameter spec + encoding + aliases

- `references/` documentation inputs (NRPN tables, historical notes)
- `fixtures/` captured SysEx dumps and decoded payloads for validation

## Protocol notes (DeepMind)

### App Notify handshake

DeepMind often requires an “App Notify” handshake per MIDI interface before NRPN/SysEx behaves as expected.

Implementation rule:

- run handshake on connect/initialization for the chosen port
- assume the driver owns NRPN state for that interface

### SysEx dumps + packed payload decoding

DeepMind dumps use MIDI-safe packed bytes (MSB packing). Decode into raw bytes for analysis/snapshots.

Snapshot policy:

- always preserve raw `.syx` bytes
- also store decoded payload bytes
- do not attempt full parameter-level decode in the initial phase

Where to store captures:

- `fixtures/sysex/deepmind-dumps/`

## Parameter naming + aliases

Goals:

- structured, semantic parameter names
- deterministic aliasing for common synonyms
- avoid fuzzy matching and avoid collisions

Resolution rules:

1. If the parameter exists in the declared DeepMind param spec, use it.
2. Else apply deterministic alias mapping (e.g. `filter.frequency` -> `filter.cutoff`).
3. Else reject as unsupported.

Alias implementation:

- `src/deepmind/params/aliases.ts`

## Development workflow

- Start by implementing Phase 0/1 in `deepmind-greenfield-plan.md`:
  - MCP server runs
  - a single NRPN write works
  - `snapshot_state` can dump edit buffer SysEx
- Only then scale up the parameter map (generated spec from cleaned docs).

## Common pitfalls

- Writing to stdout from an MCP server breaks the protocol; prefer stderr logging.
- NRPN transport does not imply 14-bit resolution; scale per parameter kind (u7/u8/u14).
- Layer behavior must be validated on hardware (front-panel selection vs addressable layers).

## Testing philosophy (pragmatic)

- Prefer implementing protocol logic in **pure functions** (byte-level encode/decode, parsing, scaling) so it can be unit-tested without hardware.
- Use **fixtures** for SysEx validation whenever possible (compare decoded payloads to stored `.bin`/`.bin242`).
- Treat hardware-only behavior (port quirks, timing, real handshake responses) as **manual validation**, but keep those code paths thin and well-logged to stderr.
- Aim for “confidence coverage” over dogma: tests for tricky parsing/encoding and regressions; avoid brittle tests for incidental formatting.
