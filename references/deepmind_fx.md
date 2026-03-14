# DeepMind 12 FX Reference (Patchwork/MCP)

This document is intended for *AI reasoning* and human debugging.

It describes:
- FX type numbers
- the typed derived snapshot key prefixes used by `decoded-patch-map.ts`
- the per-type parameter key ordering, UI abbreviations, and (optionally) full UI names

## Conventions

- The DeepMind has 4 FX blocks (`fx1`..`fx4`).
- Each FX block exposes raw params as `fxN.param.1` .. `fxN.param.12`.
- When `fxN.type` matches a known effect type, the snapshot also exposes *typed* derived fields.
- Typed fields are normalized to `0..1` and include UI metadata (`ui.abbr` and optionally `ui.name`).

### Parameter ordering

Unless otherwise stated:
- `param.1` corresponds to the first key listed for that type
- `param.2` → second key, etc.

## Manual Effects List (order only)

This is the manual’s list of effect names and categories.

Important: the manual ordering (1–35) does not appear to match the DeepMind’s internal `fxN.type` numeric values used in patch data.
Use the per-type sections below (e.g. “FX Type 22 — …”) for the actual internal type values.

| Manual index | Manual name | Category |
|-----------:|-------------|----------|
| 1 | TC-DeepVRB | Reverb |
| 2 | AmbVerb | Reverb |
| 3 | RoomRev | Reverb |
| 4 | VintageRev | Reverb |
| 5 | HallRev | Reverb |
| 6 | ChamberRev | Reverb |
| 7 | PlateRev | Reverb |
| 8 | RichPltRev | Reverb |
| 9 | GatedRev | Reverb |
| 10 | Reverse | Reverb |
| 11 | ChorusVerb | Processing |
| 12 | DelayVerb | Processing |
| 13 | FlangVerb | Processing |
| 14 | MidasEQ | Processing |
| 15 | Enhancer | Processing |
| 16 | FairComp | Processing |
| 17 | MulBndDist | Processing |
| 18 | RackAmp | Processing |
| 19 | EdisonEX1 | Processing |
| 20 | Auto Pan | Processing |
| 21 | NoiseGate | Processing |
| 22 | Delay | Delay |
| 23 | 3-Tap Delay | Delay |
| 24 | 4-Tap Delay | Delay |
| 25 | T-RayDelay | Delay |
| 26 | DecimDelay | Delay |
| 27 | ModDlyRev | Delay |
| 28 | Chorus | Creative |
| 29 | Chorus D | Creative |
| 30 | Flanger | Creative |
| 31 | Phaser | Creative |
| 32 | Mood Filter | Creative |
| 33 | DualPitch | Creative |
| 34 | Vintage Pitch | Creative |
| 35 | RotarySpkr | Creative |

## FX Type 20 — Auto Pan

- Type value: `20`
- Typed prefix: `fxN.autoPan.*`

| Param | Key | UI Abbr | UI Name |
|------:|-----|---------|---------|
| 1 | `spd` | `SPD` | — |
| 2 | `phs` | `PHS` | — |
| 3 | `wav` | `WAV` | — |
| 4 | `dep` | `DEP` | — |
| 5 | `esp` | `ESP` | — |
| 6 | `edp` | `EDP` | — |
| 7 | `atk` | `ATK` | — |
| 8 | `hld` | `HLD` | — |
| 9 | `rel` | `REL` | — |

## FX Type 1 — HallRev

- Type value: `1`
- Typed prefix: `fxN.hallRev.*`

| Param | Key | UI Abbr | UI Name |
|------:|-----|---------|---------|
| 1 | `preDelay` | `PD` | `PreDelay` |
| 2 | `decay` | `DCY` | `Decay` |
| 3 | `size` | `SIZ` | `Size` |
| 4 | `damping` | `DMP` | `Damping` |
| 5 | `diffusion` | `DIF` | `Diffusion` |
| 6 | `mix` | `MIX` | `Mix` |
| 7 | `loCut` | `LC` | `LoCut` |
| 8 | `hiCut` | `HI` | `HiCut` |
| 9 | `bassMult` | `LFX` | `BassMult` |
| 10 | `spread` | `SPR` | `Spread` |
| 11 | `shape` | `SHP` | `Shape` |
| 12 | `modSpeed` | `MOD` | `ModSpeed` |

## FX Type 2 — PlateRev

- Type value: `2`
- Typed prefix: `fxN.plateRev.*`

| Param | Key |
|------:|-----|
| 1 | `preDelay` |
| 2 | `decay` |
| 3 | `size` |
| 4 | `damping` |
| 5 | `diffusion` |
| 6 | `mix` |
| 7 | `loCut` |
| 8 | `hiCut` |
| 9 | `bassMult` |
| 10 | `xover` |
| 11 | `modDepth` |
| 12 | `modSpeed` |

## FX Type 3 — RichPltRev

- Type value: `3`
- Typed prefix: `fxN.richPltRev.*`

| Param | Key |
|------:|-----|
| 1 | `preDelay` |
| 2 | `decay` |
| 3 | `size` |
| 4 | `damping` |
| 5 | `diffusion` |
| 6 | `mix` |
| 7 | `loCut` |
| 8 | `hiCut` |
| 9 | `bassMult` |
| 10 | `spread` |
| 11 | `attack` |
| 12 | `spin` |

## FX Type 4 — AmbVerb

- Type value: `4`
- Typed prefix: `fxN.ambVerb.*`

| Param | Key |
|------:|-----|
| 1 | `preDelay` |
| 2 | `decay` |
| 3 | `size` |
| 4 | `damping` |
| 5 | `diffusion` |
| 6 | `mix` |
| 7 | `loCut` |
| 8 | `hiCut` |
| 9 | `mod` |
| 10 | `tailGain` |

Manual parameter details (from “AmbVerb (AMBIENT REVERB)” page):

| Param | UI | Name | Units | Min | Max | Notes |
|------:|:---|:-----|:------|:----|:----|:------|
| 1 | `PD` | PreDelay | ms | 0.0 | 200.0 | |
| 2 | `DCY` | Decay | s | 0.2 | 7.3 | Mod Matrix destination |
| 3 | `SIZ` | Size | — | 2.0 | 100.0 | |
| 4 | `DMP` | Damping | Hz | 1000 | 20000 | Mod Matrix destination |
| 5 | `DIF` | Diffusion | — | 1.0 | 30.0 | |
| 6 | `MIX` | Mix | % | 0.0 | 100.0 | Mod Matrix destination |
| 7 | `LC` | LoCut | Hz | 10.0 | 500.0 | |
| 8 | `HC` | HiCut | Hz | 200.0 | 20000.0 | Mod Matrix destination |
| 9 | `MOD` | Mod | % | 0.0 | 100.0 | |
| 10 | `TGN` | TailGain | % | 0.0 | 100.0 | Mod Matrix destination |

## FX Type 5 — GatedRev

- Type value: `5`
- Typed prefix: `fxN.gatedRev.*`

| Param | Key |
|------:|-----|
| 1 | `preDelay` |
| 2 | `decay` |
| 3 | `attack` |
| 4 | `density` |
| 5 | `spread` |
| 6 | `mix` |
| 7 | `loCut` |
| 8 | `hiSvFreq` |
| 9 | `hiSvGain` |
| 10 | `diffusion` |

## FX Type 6 — ReverseRev

- Type value: `6`
- Typed prefix: `fxN.reverseRev.*`

| Param | Key |
|------:|-----|
| 1 | `preDelay` |
| 2 | `decay` |
| 3 | `rise` |
| 4 | `diffusion` |
| 5 | `spread` |
| 6 | `mix` |
| 7 | `loCut` |
| 8 | `hiSvFreq` |
| 9 | `hiSvGain` |

## FX Type 7 — RackAmp

- Type value: `7`
- Typed prefix: `fxN.rackAmp.*`

| Param | Key |
|------:|-----|
| 1 | `preAmp` |
| 2 | `buzz` |
| 3 | `punch` |
| 4 | `crunch` |
| 5 | `drive` |
| 6 | `level` |
| 7 | `low` |
| 8 | `high` |
| 9 | `cabinet` |

## FX Type 21 — T-RayDelay

- Type value: `21`
- Typed prefix: `fxN.tRayDelay.*`

| Param | Key | UI Abbr | UI Name |
|------:|-----|---------|---------|
| 1 | `mix` | `MIX` | — |
| 2 | `dly` | `DLY` | — |
| 3 | `sus` | `SUS` | — |
| 4 | `wob` | `WOB` | — |
| 5 | `ton` | `TON` | — |

## FX Type 22 — tcDeepRvrb

- Type value: `22`
- Typed prefix: `fxN.tcDeepRvrb.*`

| Param | Key |
|------:|-----|
| 1 | `preset` |
| 2 | `decay` |
| 3 | `tone` |
| 4 | `preDelay` |
| 5 | `mix` |

## FX Type 23 — flangVerb

- Type value: `23`
- Typed prefix: `fxN.flangVerb.*`

| Param | Key |
|------:|-----|
| 1 | `speed` |
| 2 | `depth` |
| 3 | `delay` |
| 4 | `phase` |
| 5 | `feedback` |
| 6 | `balance` |
| 7 | `preDelay` |
| 8 | `decay` |
| 9 | `size` |
| 10 | `damp` |
| 11 | `loCut` |
| 12 | `mix` |

## FX Type 24 — chorusVerb

- Type value: `24`
- Typed prefix: `fxN.chorusVerb.*`

| Param | Key |
|------:|-----|
| 1 | `speed` |
| 2 | `depth` |
| 3 | `delay` |
| 4 | `phase` |
| 5 | `wave` |
| 6 | `balance` |
| 7 | `preDelay` |
| 8 | `decay` |
| 9 | `size` |
| 10 | `damp` |
| 11 | `loCut` |
| 12 | `mix` |

## FX Type 25 — delayVerb

- Type value: `25`
- Typed prefix: `fxN.delayVerb.*`

| Param | Key |
|------:|-----|
| 1 | `time` |
| 2 | `pattern` |
| 3 | `feedHC` |
| 4 | `feedback` |
| 5 | `xFeed` |
| 6 | `balance` |
| 7 | `preDelay` |
| 8 | `decay` |
| 9 | `size` |
| 10 | `damp` |
| 11 | `loCut` |
| 12 | `mix` |

## FX Type 26 — chamberRev

- Type value: `26`
- Typed prefix: `fxN.chamberRev.*`

| Param | Key |
|------:|-----|
| 1 | `preDelay` |
| 2 | `decay` |
| 3 | `size` |
| 4 | `damping` |
| 5 | `diffusion` |
| 6 | `mix` |
| 7 | `loCut` |
| 8 | `hiCut` |
| 9 | `bassMult` |
| 10 | `spread` |
| 11 | `shape` |
| 12 | `spin` |

## FX Type 27 — roomRev

- Type value: `27`
- Typed prefix: `fxN.roomRev.*`

| Param | Key |
|------:|-----|
| 1 | `preDelay` |
| 2 | `decay` |
| 3 | `size` |
| 4 | `damping` |
| 5 | `diffusion` |
| 6 | `mix` |
| 7 | `loCut` |
| 8 | `hiCut` |
| 9 | `bassMult` |
| 10 | `spread` |
| 11 | `shape` |
| 12 | `spin` |

## FX Type 28 — vintageRev

- Type value: `28`
- Typed prefix: `fxN.vintageRev.*`

| Param | Key |
|------:|-----|
| 1 | `preDelay` |
| 2 | `size` |
| 3 | `decay` |
| 4 | `loMult` |
| 5 | `hiMult` |
| 6 | `density` |
| 7 | `loCut` |
| 8 | `hiCut` |
| 9 | `erLevel` |
| 10 | `erDelay` |
| 11 | `mix` |
| 12 | `freeze` |

## FX Type 29 — dualPitch

- Type value: `29`
- Typed prefix: `fxN.dualPitch.*`

| Param | Key |
|------:|-----|
| 1 | `semi1` |
| 2 | `cent1` |
| 3 | `delay1` |
| 4 | `gain1` |
| 5 | `pan1` |
| 6 | `mix` |
| 7 | `semi2` |
| 8 | `cent2` |
| 9 | `delay2` |
| 10 | `gain2` |
| 11 | `pan2` |
| 12 | `hiCut` |

## FX Type 30 — midasEQ

- Type value: `30`
- Typed prefix: `fxN.midasEQ.*`

| Param | Key |
|------:|-----|
| 1 | `loShelfGain` |
| 2 | `loShelfFreq` |
| 3 | `loMidGain` |
| 4 | `loMidFreq` |
| 5 | `loMidQ` |
| 6 | `hiMidGain` |
| 7 | `hiMidFreq` |
| 8 | `hiMidQ` |
| 9 | `hiShelfGain` |
| 10 | `hiShelfFreq` |
| 11 | `eq` |

## FX Type 31 — fairComp

- Type value: `31`
- Typed prefix: `fxN.fairComp.*`

| Param | Key |
|------:|-----|
| 1 | `mode` |
| 2 | `inGainLM` |
| 3 | `threshLM` |
| 4 | `timeLM` |
| 5 | `dcBiasLM` |
| 6 | `outGainLM` |
| 7 | `biasBal` |
| 8 | `inGainRS` |
| 9 | `threshRS` |
| 10 | `timeRS` |
| 11 | `dcBiasRS` |
| 12 | `outGainRS` |

## FX Type 32 — mulBndDist

- Type value: `32`
- Typed prefix: `fxN.mulBndDist.*`

| Param | Key |
|------:|-----|
| 1 | `inGain` |
| 2 | `distType` |
| 3 | `lowBandLev` |
| 4 | `lowDrive` |
| 5 | `xoverLowMid` |
| 6 | `midBandLev` |
| 7 | `midDrive` |
| 8 | `xoverMidHi` |
| 9 | `hiBandLev` |
| 10 | `hiDrive` |
| 11 | `cabinet` |
| 12 | `outGain` |

## FX Type 33 — noiseGate

- Type value: `33`
- Typed prefix: `fxN.noiseGate.*`

| Param | Key |
|------:|-----|
| 1 | `threshold` |
| 2 | `range` |
| 3 | `attack` |
| 4 | `release` |
| 5 | `hold` |
| 6 | `punch` |
| 7 | `mode` |
| 8 | `power` |

## FX Type 34 — decimDelay

- Type value: `34`
- Typed prefix: `fxN.decimDelay.*`

| Param | Key |
|------:|-----|
| 1 | `mix` |
| 2 | `time` |
| 3 | `downSample` |
| 4 | `factorL` |
| 5 | `factorR` |
| 6 | `bitReduce` |
| 7 | `cutoff` |
| 8 | `resonance` |
| 9 | `type` |
| 10 | `feedL` |
| 11 | `feedR` |
| 12 | `decimate` |

## FX Type 35 — vintgPitch

- Type value: `35`
- Typed prefix: `fxN.vintgPitch.*`

| Param | Key |
|------:|-----|
| 1 | `semi1` |
| 2 | `cent1` |
| 3 | `delay1` |
| 4 | `feedback1` |
| 5 | `pan1` |
| 6 | `mix` |
| 7 | `semi2` |
| 8 | `cent2` |
| 9 | `delay2` |
| 10 | `feedback2` |
| 11 | `pan2` |
| 12 | `hiCut` |
