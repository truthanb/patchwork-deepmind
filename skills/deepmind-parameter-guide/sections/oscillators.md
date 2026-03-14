# Oscillators — Parameter Guide

> Source: DeepMind 12 Owner's Manual, pp. 62–73 (§8.3 OSC)

## What this controls

The oscillator section generates the raw audio material for the synth. OSC 1 is a dual-waveform oscillator (sawtooth + square, independently switchable). OSC 2 is a single square-wave oscillator with pitch offset and tone modulation. A pink noise generator is also mixed in here. All oscillator pitch control is digital (stable tuning); the audio signal path is fully analog.

## Parameters

| Parameter (manual name)         | paramKey                    | NRPN | Range   | What it does                                         |
|---------------------------------|-----------------------------|------|---------|------------------------------------------------------|
| OSC 1 Range                     | `osc1.range`                | 14   | 0–2     | Octave: 16' (0), 8' (1), 4' (2)                     |
| OSC 1 Saw Enable                | `osc1.sawtooth`             | 19   | 0–1     | Off (0), On (1). Default: On                         |
| OSC 1 Pulse Enable              | `osc1.square`               | 18   | 0–1     | Off (0), On (1). Default: On                         |
| OSC 1 Pitch Mod Depth           | `osc1.pitchMod`             | 21   | 0–255   | Pitch mod amount (non-linear fader: 0–36 semitones)  |
| OSC 1 Pitch Mod Select          | `osc1.pitchModSelect`       | 22   | 0–6     | Mod source (see enum below)                          |
| OSC 1 Aftertouch > Pitch Mod    | `osc1.aftertouch.pitchMod`  | 23   | 0–255   | Aftertouch scales pitch mod depth. Default: 0        |
| OSC 1 Mod Wheel > Pitch Mod     | `osc1.modWheel.pitchMod`    | 24   | 0–255   | Mod wheel scales pitch mod depth. Default: 0         |
| OSC 1 PWM Depth                 | `osc1.pwm`                  | 25   | 0–255   | Pulse width (manual) or PWM depth (mod source)       |
| OSC 1 PWM Source                | `osc1.pwmSource`            | 16   | 0–5     | PWM mod source (see enum below)                      |
| OSC 1 Pitch Mod Mode            | `osc1.pitchModMode`         | 38   | 0–1     | 0 = OSC1+2 (both), 1 = OSC 1 Only                   |
| OSC Key Down Reset              | `osc.keyDownReset`          | 92   | 0–1     | Off (0), On (1). Resets osc phase on key-down        |
| OSC Sync Enable                 | `osc2.sync`                 | 20   | 0–1     | Off (0), On (1). Hard-syncs OSC 2 to OSC 1           |
| OSC 2 Range                     | `osc2.range`                | 15   | 0–2     | Octave: 16' (0), 8' (1), 4' (2)                     |
| OSC 2 Pitch                     | `osc2.pitch`                | 27   | 0–255   | Pitch offset: -12.0 to +12.0 semitones               |
| OSC 2 Level                     | `osc2.level`                | 26   | 0–255   | Off / -48.0 dB to 0.0 dB. Default: Off              |
| OSC 2 Pitch Mod Depth           | `osc2.pitchMod`             | 29   | 0–255   | Pitch mod amount (non-linear: 0–36 semitones)        |
| OSC 2 Pitch Mod Select          | `osc2.pitchModSelect`       | 32   | 0–6     | Mod source (see enum below)                          |
| OSC 2 Aftertouch > Pitch Mod    | `osc2.aftertouch.pitchMod`  | 30   | 0–255   | Aftertouch scales OSC 2 pitch mod. Default: 0        |
| OSC 2 Mod Wheel > Pitch Mod     | `osc2.modWheel.pitchMod`    | 31   | 0–255   | Mod wheel scales OSC 2 pitch mod. Default: 0         |
| OSC 2 Tone Mod Depth            | `osc2.toneMod`              | 28   | 0–255   | Tone mod depth: 50%–100%. Default: 50%               |
| OSC 2 Tone Mod Source           | `osc2.toneModSource`        | 17   | 0–5     | Tone mod source (see enum below)                     |
| Noise Level                     | `noise.level`               | 33   | 0–255   | Off / -48.1 dB to 0.0 dB. Default: Off              |

### Pitch Mod Source enum (NRPN 22, 32)

| Value | Label           | Notes                              |
|------:|-----------------|------------------------------------|
| 0     | LFO 1           | Bipolar                            |
| 1     | LFO 2           | Bipolar                            |
| 2     | VCA Env (ENV 1)  | Unipolar (positive only from pitch)|
| 3     | VCF Env (ENV 2)  | Unipolar                           |
| 4     | Mod Env (ENV 3)  | Unipolar                           |
| 5     | LFO 1 Unipolar   | Positive-only LFO 1               |
| 6     | LFO 2 Unipolar   | Positive-only LFO 2               |

### PWM Source enum (NRPN 16)

| Value | Label           | Notes                                       |
|------:|-----------------|---------------------------------------------|
| 0     | Manual          | PWM fader sets pulse width directly (50–99%) |
| 1     | LFO 1           | PWM fader sets mod depth (0 to ±49%)         |
| 2     | LFO 2           | PWM fader sets mod depth (0 to ±49%)         |
| 3     | VCA Env (ENV 1)  | PWM fader sets mod depth (0 to ±49%)         |
| 4     | VCF Env (ENV 2)  | PWM fader sets mod depth (0 to ±49%)         |
| 5     | Mod Env (ENV 3)  | PWM fader sets mod depth (0 to ±49%)         |

### Tone Mod Source enum (NRPN 17)

Same structure as PWM Source (values 0–5). When Manual, fader controls tone directly (50–100%). When modulated, fader sets depth (0 to ±49%).

## Value guidance

- **osc1.range / osc2.range**: 16' = sub bass (C = 16.35 Hz), 8' = normal (C = 32.7 Hz), 4' = one octave up (C = 65.4 Hz). Default: 8'.
- **osc1.pitchMod / osc2.pitchMod**: The fader response is non-linear — most of the resolution is at small values (fine vibrato). Values 0–10 cover roughly 0–2 semitones; values above ~200 reach up to 36 semitones. For subtle vibrato, keep below 20. For FM-style effects, go above 100.
- **osc1.pwm**: When source is Manual, 0 = 50% (true square wave), 255 = 99% (very narrow pulse, clicks at low frequencies). For classic PWM strings, use LFO 1/2 source with depth 80–150.
- **osc2.pitch**: 128 = unison with OSC 1. Values near center have fine resolution in cents. ±12 semitones range. Slight detune (125–131) creates width; larger offsets (116 = -12, 140 = +12) for harmonic intervals.
- **osc2.level**: 0 = Off. For balanced two-oscillator sounds, set to 255 (0.0 dB). Reduce for subtle layering.
- **osc2.toneMod**: Splits the square wave cycle with a pulse insert. Creates metallic, bell-like timbres. Higher values = wider pulse interrupt. Good for complex textures and string-type sounds.
- **noise.level**: Pink noise with low-frequency roll-off. 0 = Off. Use ~100–150 for breathy/atmospheric textures without drowning the oscillators. 255 = full 0.0 dB level.

## Interactions

- `osc1.pwm` / `osc1.pwmSource` only affect the **square waveform** — no effect when only sawtooth is enabled (`osc1.square` = 0).
- `osc1.pitchModMode` (NRPN 38): When set to 0 (OSC1+2), the **OSC 1 Pitch Mod fader** controls vibrato for *both* oscillators. Set to 1 to modulate OSC 1 independently (useful with sync).
- `osc2.sync` hard-syncs OSC 2 to OSC 1. Varying `osc2.pitch` with sync on creates classic sync-sweep timbres. If OSC 2 frequency is less than half of OSC 1, OSC 2 may produce no output.
- `osc.keyDownReset` resets oscillator phase on each key press — useful for consistent attack transients (plucks, percussion), but removes the natural phase variation of analog oscillators.
- `osc2.level` must be > 0 for OSC 2 to be audible in the mix.
- The LFOs can reach audio rates, making true FM possible via pitch mod. Use `lfo1.rate` / `lfo2.rate` at high values for metallic/clangorous timbres.

## Signal flow

```
OSC 1 SAW ──┐
OSC 1 SQR ──┤
OSC 2 SQR ──┼──► [MIXER] ──► VCF (filter) ──► VCA ──► FX ──► OUTPUT
NOISE ──────┘
```

## Related sections

- → [filter.md](filter.md) for VCF (what processes the oscillator output)
- → [lfos.md](lfos.md) for LFO shapes, rates, and sync (mod sources for pitch/PWM/tone)
- → [envelopes.md](envelopes.md) for envelope shapes used as mod sources
- → [mod-matrix.md](mod-matrix.md) for additional modulation routing beyond the dedicated controls
- → [voice-config.md](voice-config.md) for unison detune, polyphony mode, portamento
