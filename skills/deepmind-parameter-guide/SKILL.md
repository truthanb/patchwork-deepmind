---
name: deepmind-parameter-guide
description: >
  Quick-reference guide for DeepMind 12 parameters, organized by synth area.
  Read the relevant section before calling set_param / set_params to
  understand what a parameter does, what values make sense, and what other
  parameters you should consider setting alongside it.
compatibility: No runtime dependencies. Used as read-only context by agents.
metadata:
  repo: mcp-deepmind12
  focus: parameter-knowledge
---

## How to use this skill

When you need to set one or more DeepMind 12 parameters:

1. Identify which synth area the parameter belongs to (oscillators, filter,
   envelopes, etc.) from the table below.
2. Read that section file for parameter details, value guidance, and
   interactions.
3. Set the parameter(s) with `set_param` or `set_params` using the
   `paramKey` from the section's Parameters table.

If you're designing a specific type of sound, check the "Sound recipes"
section at the bottom for which sections to read together.

## Sections

| Section file                                        | Covers                                     | Status  |
|-----------------------------------------------------|--------------------------------------------|---------|
| [oscillators.md](sections/oscillators.md)            | OSC 1 (saw/square/PWM), OSC 2 (pitch/tone mod/sync), noise, waveform enables | done    |
| [filter.md](sections/filter.md)                      | VCF cutoff, resonance, 2/4-pole, env depth/polarity/velocity, LFO mod, key tracking, HPF, bass boost | done    |
| [envelopes.md](sections/envelopes.md)                | VCA/VCF/MOD envelope ADSR, trigger modes, per-stage curve shaping | done    |
| [lfos.md](sections/lfos.md)                          | LFO 1 & 2 rate, delay, shape, key/arp sync, phase/mono, slew rate, clock divide | done    |
| [vca.md](sections/vca.md)                            | VCA level, envelope depth, velocity sensitivity, pan spread | done    |
| [mod-matrix.md](sections/mod-matrix.md)              | 8 mod busses: 24 sources, 132 destinations, bipolar depth, meta-modulation, FX modulation | done    |
| [arp-sequencer.md](sections/arp-sequencer.md)        | Arpeggiator on/off, mode, rate, clock divider, gate, hold, pattern, swing, octaves; control sequencer enable, clock, length, swing, key/loop, slew, step values; ARP settings | done    |
| [effects.md](sections/effects.md)                    | FX architecture (4 slots, routing, NRPNs), master effects table (35 types), links to category detail files | done    |
| [effects/reverbs.md](sections/effects/reverbs.md)    | 13 reverb effects: TC-DeepVRB, AmbVerb, RoomRev, VintageRev, HallRev, ChamberRev, PlateRev, RichPltRev, GatedRev, Reverse, ChorusVerb, DelayVerb, FlangVerb | done    |
| [effects/delays.md](sections/effects/delays.md)      | 6 delay effects: Delay, 3TapDelay, 4TapDelay, T-RayDelay, DecimDelay, ModDlyRev | done    |
| [effects/creative.md](sections/effects/creative.md)  | 8 creative effects: Chorus, Chorus-D, Flanger, Phaser, MoodFilter, DualPitch, VintgPitch, RotarySpkr | done    |
| [effects/processing.md](sections/effects/processing.md) | 8 processing effects: MidasEQ, Enhancer, FairComp, MulBndDist, RackAmp, EdisonEX1, AutoPan, NoiseGate | done    |
| [playing-controls.md](sections/playing-controls.md)      | Performance control index: pitch bend, mod wheel, aftertouch, velocity, expression pedal → parameter cross-references and setup recipes | done    |
| [global-settings.md](sections/global-settings.md)        | Global menu reference (no NRPNs): MIDI connectivity, keyboard curves, pedal modes, sustain/gate, panel, calibration | done    |

<!-- Example of a completed row:
| [oscillators.md](sections/oscillators.md)           | OSC 1, OSC 2, noise, mixer, pitch controls | done    |
| [filter.md](sections/filter.md)                     | VCF cutoff, resonance, envelope, key track | done    |
-->

## Quick signal flow

```
                    ┌─ OSC 1 ─┐
PITCH/KEY ─────────►│  OSC 2  │──► MIXER ──► VCF (filter) ──► VCA ──► FX 1–4 ──► OUTPUT
                    │  NOISE  │
                    └─────────┘
                         ▲                      ▲               ▲
                    MOD MATRIX             ENV / LFO        ENV / LFO
```

## Sound recipes

*(To be added after enough sections are transcribed. Each recipe lists
which sections to read and which parameters to focus on for a given
sound type — pad, bass, lead, pluck, etc.)*

<!-- Example recipe format:
### Warm pad
Read: oscillators.md, filter.md, envelopes.md, effects.md
Key params:
- `osc1.waveform` = Saw (2), `osc2.waveform` = Saw (2), slight detune
- `filter.cutoff` = 120–160, `filter.resonance` = 20–40
- `ampEnv.attack` = 80–120, `ampEnv.release` = 100–150
- FX: Hall Reverb, mix ~60
-->

## See also

- Use with the `mcp-deepmind12` MCP server for full parameter control (`set_param`, `describe_param`, `snapshot_state`).
