# Voice Configuration (Poly / Pitch / Chain) — Parameter Guide

> Source: DeepMind 12 Owner's Manual, §8.4 (pp. 74–81)

## What this controls

The POLY section governs **voice allocation** (polyphony, unison, and
mono modes with up to 12 independent analog voices), **pitch** settings
(transpose, portamento, pitch bend, global tuning), and **analog drift**
emulation (oscillator and parameter drift for vintage character). The
POLY EDIT menu has three pages: Voice Parameters, Pitch Parameters,
and Chain Parameters (multi-unit poly chain / keyboard split).

## Parameters — Voice

| Parameter (manual name) | paramKey                    | NRPN | Range  | What it does                                                      |
|-------------------------|-----------------------------|------|--------|-------------------------------------------------------------------|
| Polyphony               | `voice.polyphonyMode`       | 85   | 0–12   | Voice allocation mode (see Polyphony Mode table below)            |
| Unison Detune           | `voice.unisonDetune`        | 87   | 0–255  | Detuning spread across unison voices: ±0.0 cents (0) → ±50.0 cents (255). Default: 0 |
| Priority                | `voice.priorityMode`        | 84   | 0–2    | Note priority when voices run out (see Priority table below). Default: Last (2) |
| Env-Trigger             | `voice.envelopeTriggerMode` | 86   | 0–3    | How envelopes trigger on new notes (see Env-Trigger table below). Default: Mono (0) |
| OSC-Drift               | `voice.drift`               | 88   | 0–255  | Oscillator pitch drift amount, applied to both OSC 1 and OSC 2. Default: 0 |
| Param-Drift             | `voice.parameterDrift`      | 89   | 0–255  | Parameter drift amount for VCF, resonance, PWM, etc. Default: 0  |
| Drift-Rate              | `voice.driftRate`            | 90   | 0–255  | Speed of drift modulation: 0 = 25–50 ms, 255 = 2.5–5.0 s. Default: 0 |

### Polyphony Mode values

| Value | Mode      | Description                                                           |
|-------|-----------|-----------------------------------------------------------------------|
| 0     | Poly      | One voice per note, full 12-voice polyphony                           |
| 1     | Unison 2  | Two voices per note (max 6 notes). Detuning spread evenly; root note not played |
| 2     | Unison 3  | Three voices per note (max 4 notes). One voice plays root note        |
| 3     | Unison 4  | Four voices per note (max 3 notes). Root not played                   |
| 4     | Unison 6  | Six voices per note (max 2 notes). Root not played                    |
| 5     | Unison 12 | All 12 voices on every note (monophonic). Root not played             |
| 6     | Mono      | Single voice, monophonic                                              |
| 7     | Mono 2    | Same two voices always allocated (monophonic), spread like Unison 2   |
| 8     | Mono 3    | Same three voices always allocated (monophonic), spread like Unison 3 |
| 9     | Mono 4    | Same four voices always allocated (monophonic), spread like Unison 4  |
| 10    | Mono 6    | Same six voices always allocated (monophonic), spread like Unison 6   |
| 11    | Poly 6    | One voice per note, polyphony limited to 6 voices                     |
| 12    | Poly 8    | One voice per note, polyphony limited to 8 voices                     |

> Note: With an even number of unison/mono voices (2, 4, 6, 12), voices
> are spread symmetrically around the root pitch — the root note itself
> is **not** played. With an odd number (3), one voice plays the root.

### Priority values

| Value | Mode    | Description                                                              |
|-------|---------|--------------------------------------------------------------------------|
| 0     | Lowest  | Lowest note wins; steals the highest voice when voices run out           |
| 1     | Highest | Highest note wins; steals the lowest voice when voices run out           |
| 2     | Last    | Most recent note wins; steals the oldest voice. **(Default)**            |

> Note: Priority is not available when Poly Chain is enabled; excess
> notes are passed to other DeepMind units in the chain instead.

### Env-Trigger values

| Value | Mode       | Description                                                           |
|-------|------------|-----------------------------------------------------------------------|
| 0     | Mono       | Attack starts from the current envelope level (last release value). **(Default)** |
| 1     | Re-Trigger | Envelope resets to zero, then starts attack                           |
| 2     | Legato     | Envelope does not re-trigger on overlapping notes; attack restarts only after full release |
| 3     | One-Shot   | Envelope resets to zero, starts attack; after decay, jumps immediately to release (no sustain phase) |

## Parameters — Pitch

| Parameter (manual name) | paramKey             | NRPN | Range  | What it does                                                       |
|-------------------------|----------------------|------|--------|--------------------------------------------------------------------|
| Transpose               | `pitch.transpose`    | —    | 0–96   | Semitone transposition: raw 0 = −48, raw 48 = 0, raw 96 = +48. Default: 0 (no transpose) |
| Porta-Time              | `portamento.time`    | 34   | 0–255  | Portamento glide time: 0 = 0.00 s (instant), 255 = 10.00 s. Default: 0 |
| Porta-Mode              | `portamento.mode`    | 35   | 0–13   | Portamento behaviour (see Porta-Mode table below). Default: Normal (0) |
| Porta-OSC-Bal           | `portamento.balance` | 91   | 0–255  | OSC 1/2 portamento balance: bipolar −128…+127 (raw − 128). Default: 0 |
| P.Bend Range+           | `pitchBend.upDepth`  | 36   | 0–24   | Pitch wheel upper range in semitones. Bipolar (−24 to +24 in manual). Default: +2 |
| P.Bend Range−           | `pitchBend.downDepth`| 37   | 0–24   | Pitch wheel lower range in semitones. Bipolar (−24 to +24 in manual). Default: −2 |
| Global-Tune             | `pitch.globalTune`   | —    | 0–255  | Master tuning offset: raw 0 = −128, raw 128 = centre, raw 255 = +127. Default: 0 (centre) |

> Note: Transpose and Global-Tune are global / menu settings. Their
> NRPNs are not yet confirmed — they may be menu-only items without
> edit-buffer equivalents.

### Porta-Mode values

| Value | Mode               | Description                                                    |
|-------|--------------------|----------------------------------------------------------------|
| 0     | Normal             | Fixed time, always slides, linear glide                        |
| 1     | Fingered           | Fixed time, slides only on overlapping (legato) notes, linear  |
| 2     | Fix-Rate           | Fixed rate (distance affects time), always slides, linear      |
| 3     | Fix-Fing           | Fixed rate, slides only on overlapping notes, linear           |
| 4     | Exp                | Fixed rate, always slides, exponential curve                   |
| 5     | Exp-Fing           | Fixed rate, slides only on overlapping notes, exponential      |
| 6     | Fixed +2           | Always starts 2 semitones above target, exponential slide down |
| 7     | Fixed −2           | Always starts 2 semitones below target, exponential slide up   |
| 8     | Fixed +5           | Always starts 5 semitones above target, exponential            |
| 9     | Fixed −5           | Always starts 5 semitones below target, exponential            |
| 10    | Fixed +12          | Always starts 1 octave above target, exponential               |
| 11    | Fixed −12          | Always starts 1 octave below target, exponential               |
| 12    | Fixed +24          | Always starts 2 octaves above target, exponential              |
| 13    | Fixed −24          | Always starts 2 octaves below target, exponential              |

> Note: "Fixed ±N" modes ignore the previous note — the slide always
> begins offset by exactly N semitones from the target pitch, regardless
> of what was played before. They are great for kick drums, laser
> effects, and pitch-drop transitions.

## Parameters — Chain

These are multi-unit configuration settings. They are **not per-program
parameters** and have no known NRPNs — they are set via the Chain
Parameters menu and persist globally.

| Parameter (manual name) | paramKey | NRPN | Range | What it does                                            |
|-------------------------|----------|------|-------|---------------------------------------------------------|
| Poly-Chain              | —        | —    | 0–1   | Off (0) / On (1). Enables poly chain to downstream units |
| Program Link            | —        | —    | 0–1   | Off (0) / On (1). Downstream units mirror program changes. Only available when Poly-Chain = On |
| Key Range               | —        | —    | 0–1   | Off (0) / On (1). Enables keyboard split for this unit  |
| Range-Lower             | —        | —    | 0–127 | MIDI note for low end of keyboard split                 |
| Range-Upper             | —        | —    | 0–127 | MIDI note for high end of keyboard split                |

> Note: Poly Chain / keyboard split only works over 5-pin MIDI (not USB
> or WiFi). The first unit in the chain sends MIDI OUT to the next unit's
> MIDI IN. For keyboard split, use MIDI THRU (not MIDI OUT) from the
> second unit to a third.

## Value guidance

- **voice.polyphonyMode**: Poly (0) is the default 12-voice mode. Unison
  modes stack voices for thickness — higher unison counts are fatter but
  reduce available polyphony. Mono modes always use the same physical
  voices (consistent timbre), while Unison modes allocate the next
  available voices (potentially different voice characteristics).
- **voice.unisonDetune**: 0 = no detuning (all unison voices in tune).
  Higher values spread ±0 to ±50 cents across unison voices. Start
  around 30–60 for subtle chorus, 150+ for bold analog stacks. Only
  audible in Unison or Mono-N modes.
- **voice.priorityMode**: "Last" (2) is the most natural default. Use
  "Lowest" (0) for bass synth patches where the lowest note must never
  drop out. Use "Highest" (1) for lead patches.
- **voice.envelopeTriggerMode**: "Mono" (0) gives smooth legato
  transitions (attack resumes from current level). "Re-Trigger" (1)
  always resets — snappier, more percussive. "Legato" (2) only triggers
  on the first note of a phrase — ideal for portamento leads. "One-Shot"
  (3) ignores sustain — good for percussive hits and plucks.
- **voice.drift** / **voice.parameterDrift**: Emulates vintage analog
  instability. OSC-Drift randomly modulates oscillator pitch; Param-Drift
  randomly modulates VCF freq, resonance, PWM, envelope depths, and
  more. Each of the 12 voices has independent drift generators, so the
  effect is organic and poly-realistic.
- **voice.driftRate**: At 0, each drift cycle is 25–50 ms (fast, jittery).
  At 255, cycles are 2.5–5.0 s (slow, gentle wandering). The actual
  time per cycle is randomized between 1× and 2× the rate setting.
  Lower = more nervous vintage, higher = gentle slow drift.
- **portamento.time**: 0 = instant pitch change (off). Small values
  (10–40) give fast slides good for leads. Higher values (100+) give
  long, dramatic glides. 255 = 10 seconds maximum glide time.
- **portamento.mode**: "Normal" and "Fingered" are the most common.
  Fingered only slides when notes overlap — allows both staccato
  (instant pitch) and legato (glide) from the same patch depending on
  playing style. Fix-Rate modes make the slide time proportional to the
  interval — large intervals take longer, which can sound more natural.
- **portamento.balance**: At 0 (raw 128), both oscillators glide at the
  same rate. Positive values reduce OSC 1 glide time; at +127 (raw 255),
  OSC 1 jumps instantly while OSC 2 still glides. Negative values reduce
  OSC 2 glide time. Creates pitch separation effects during slides.
- **pitchBend.upDepth** / **pitchBend.downDepth**: Default ±2 semitones.
  Set to ±12 for full-octave bends. The up and down ranges are
  independent — you can set asymmetric ranges (e.g., +12 up, −2 down).
  Bipolar encoding means you can reverse the wheel direction.
- **pitch.globalTune**: Use to match tuning with other instruments.
  Keep at 0 (centre) unless detuning to match A=432 Hz or similar.

## Interactions

- `voice.unisonDetune` has no effect in Poly, Mono, Poly-6, or Poly-8
  modes — it only applies when multiple voices stack on a single note
  (Unison-N and Mono-N modes).
- `voice.priorityMode` is only relevant when more notes are played than
  voices are available. In Poly mode with 12 voices, it rarely triggers
  unless playing very dense chords. In Mono modes it governs which note
  sounds when multiple keys are held simultaneously.
- `voice.envelopeTriggerMode` affects all three envelopes (VCA, VCF,
  Mod) simultaneously. This is separate from the per-envelope trigger
  source (Key, LFO 1, LFO 2, Loop, Ctrl Seq) set via NRPNs 57, 66, 75.
- `voice.drift`, `voice.parameterDrift`, and `voice.driftRate` work
  together. Drift and Param-Drift set the amount; Drift-Rate sets the
  speed. Param-Drift affects: OSC1 Pitch Mod, OSC1 PWM, OSC2 Pitch Mod,
  OSC2 Tone Mod, VCF Freq, VCF Res, VCF Env Depth, VCF LFO Depth,
  VCA Env Depth, and Mod Env Depth.
- `portamento.time` is shared by both oscillators, but `portamento.balance`
  can split the effective glide time between OSC 1 and OSC 2.
- `portamento.mode` "Fingered" variants require legato playing to
  activate — if you release each note before pressing the next, no glide
  occurs.
- OSC Key-Down Reset (in the OSC1 EDIT menu, NRPN 92) interacts with
  `voice.unisonDetune` — when enabled, all oscillators start from the
  same waveform phase, making detuning phase-drift effects more
  pronounced.

## Signal flow

```
  Key press ──► Priority ──► Voice Allocation (Polyphony Mode)
                                    │
                      ┌─────────────┤
                      ▼             ▼
               Main voices     Unison stack
                      │             │
                      ▼             ▼
               ┌─────────────────────────┐
               │  Unison Detune spread   │
               │  (± 0–50 cents)         │
               └────────────┬────────────┘
                            │
           ┌────────────────┤
           ▼                ▼
     OSC 1 pitch      OSC 2 pitch
           │                │
           ▼                ▼
     Portamento       Portamento
     (balance ◄──── porta.balance)
           │                │
           ▼                ▼
     Transpose + Global Tune applied
           │
           ▼
     Envelope Trigger Mode ──► ENV 1/2/3
           │
           ▼
     Drift generators (per voice) ──► OSC pitch + params
```

## Related sections

- → [oscillators.md](oscillators.md) — OSC Key-Down Reset interacts with unison detune
- → [envelopes.md](envelopes.md) — envelope trigger source (Key, LFO, Loop, Ctrl Seq) is separate from trigger mode
- → [filter.md](filter.md) — Param-Drift affects VCF freq, resonance, env depth, LFO depth
- → [mod-matrix.md](mod-matrix.md) — portamento and pitch bend can be mod matrix destinations
- → [arp-sequencer.md](arp-sequencer.md) — control sequencer can trigger envelopes (trigger source = 4)
