# Filter (VCF + HPF) — Parameter Guide

> Source: DeepMind 12 Owner's Manual, pp. 82–88 (§8.5 VCF, §8.7 HPF)

## What this controls

The Voltage Controlled Filter (VCF) is a fully analog low-pass filter that shapes the tone of the oscillator/noise mix by cutting higher frequencies. It can operate as a 4-pole (24 dB/oct) or 2-pole (12 dB/oct) filter. Resonance emphasizes the cutoff frequency and can be driven into self-oscillation — uniquely, the DeepMind 12 maintains accurate pitch tracking in self-oscillation, making the filter usable as a polyphonic 3rd oscillator. The High Pass Filter (HPF) sits after the VCA and removes low frequencies from all voices simultaneously.

## Parameters

| Parameter (manual name)              | paramKey                       | NRPN | Range   | What it does                                                    |
|--------------------------------------|--------------------------------|------|---------|-----------------------------------------------------------------|
| VCF Frequency                        | `filter.cutoff`                | 39   | 0–255   | Cutoff frequency: 50.0 Hz – 20000.0 Hz. Default: 255 (fully open) |
| VCF Resonance                        | `filter.resonance`             | 41   | 0–255   | Resonance: 0.0% – 100.0%. Emphasizes cutoff; self-oscillation at high values. Default: 0 |
| VCF 2-Pole Mode                      | `filter.twoPoleMode`           | 51   | 0–1     | 0 = 4-Pole (24 dB/oct), 1 = 2-Pole (12 dB/oct). Default: 0 (4-Pole) |
| VCF Envelope Depth                   | `filter.envDepth`              | 42   | 0–255   | VCF Envelope → cutoff modulation amount: 0.0% – 100.0%. Default: 0 |
| VCF Envelope Polarity (Invert)       | `filter.envPolarity`           | 50   | 0–1     | 0 = Inverted, 1 = Normal. Default: 1 (Normal, panel INVERT LED off) |
| VCF Envelope Velocity Sensitivity    | `filter.envVelocity`           | 43   | 0–255   | How much key velocity scales VCF envelope depth. Default: 128   |
| VCF Pitch Bend → Freq               | `filter.pitchBendToCutoff`     | 44   | 0–255   | Pitch bend wheel → cutoff. Forward = brighter, back = darker. Default: 128 |
| VCF LFO Depth                        | `filter.lfoDepth`              | 45   | 0–255   | LFO → cutoff modulation amount: 0.0% – 100.0%. Default: 0      |
| VCF LFO Select                       | `filter.lfoSelect`             | 46   | 0–1     | 0 = LFO 1, 1 = LFO 2. Default: 1 (LFO 2)                      |
| VCF Aftertouch → LFO Depth           | `filter.aftertouchToLfoDepth`  | 47   | 0–255   | Aftertouch scales VCF LFO depth. Default: 0                    |
| VCF Mod Wheel → LFO Depth            | `filter.modWheelToLfoDepth`    | 48   | 0–255   | Mod wheel scales VCF LFO depth. Default: 0                     |
| VCF Keyboard Tracking                | `filter.keyTracking`           | 49   | 0–255   | Cutoff follows keyboard pitch: 0.0% – 100.0%. Center = middle C. Default: 0 |
| VCF Bass Boost                       | `filter.bassBoost`             | 52   | 0–1     | 0 = Off, 1 = On. Analog shelving boost at 100 Hz (+6 dB). Default: 0 |
| HPF Frequency                        | `filter.hpfCutoff`             | 40   | 0–255   | High-pass cutoff: 20.0 Hz – 2000.0 Hz. Default: 0 (20 Hz, fully open) |

## Value guidance

- **filter.cutoff**: 0 = 50 Hz (very dark, nearly silent), 255 = 20 kHz (fully open, no filtering). Musical sweet spots: 80–180 for pads, 40–100 for bass. The fader range is logarithmic with respect to frequency.
- **filter.resonance**: Emphasizes frequencies around the cutoff. At high values (above ~220) the filter enters self-oscillation and produces a pure sine-like tone at the cutoff frequency. Self-oscillation is pitch-tracked across the full keyboard, so it can be "played" as a 3rd oscillator.
- **filter.twoPoleMode**: 4-Pole (0) = steeper rolloff, deeper/more aggressive character. 2-Pole (1) = gentler slope, brighter/more natural — allows more harmonics above cutoff to pass through. 2-Pole is often better for pads and subtler filtering.
- **filter.envDepth**: How much the VCF Envelope opens/closes the filter per note. Use lower values with Normal polarity (cutoff adds to the fader position). Use higher values with Inverted polarity (cutoff subtracts). If `filter.cutoff` is already at 255, positive envelope cannot push it further.
- **filter.envPolarity**: Normal (1) = envelope opens filter above the cutoff fader position. Inverted (0) = envelope closes filter below the cutoff fader position. When inverted, set `filter.cutoff` higher and `filter.envDepth` higher for the sweep to be audible.
- **filter.envVelocity**: 0 = velocity has no effect on filter envelope. 128 = moderate velocity sensitivity (default). 255 = maximum — gentle keys barely open the filter, hard hits open it fully.
- **filter.pitchBendToCutoff**: 128 = moderate bend-to-cutoff. Pitch bend forward brightens, backward darkens. Set to 0 to disable, higher for more dramatic pitch-bend filter sweeps.
- **filter.lfoDepth**: LFO modulation of cutoff for wah/wobble effects. 0 = off. Low values (20–60) for subtle animation, high values (150+) for aggressive wah. Limited by current cutoff position — if filter is fully open, positive LFO peaks won't go higher.
- **filter.lfoSelect**: Default is LFO 2 (1), which keeps LFO 1 free for pitch vibrato. Set to LFO 1 (0) if you want a single LFO modulating both pitch and filter.
- **filter.keyTracking**: At 0% the filter cutoff is the same for all notes. At 100% the filter tracks the keyboard pitch 1:1 from middle C — higher notes open the filter, lower notes close it. Essential for consistent timbre across the range; especially important when using resonance as a tone source.
- **filter.bassBoost**: Analog shelving EQ that boosts frequencies around 100 Hz by approximately +6 dB with DC blocking. Adds depth and body, especially useful for bass and pad patches.
- **filter.hpfCutoff**: 0 = 20 Hz (fully open, no bass cut). Higher values remove low frequencies. Useful for cutting subsonic rumble, thinning out pads to sit in a mix, or creating highpass sweeps. Acts on all voices simultaneously (post-VCA). The HPF is -6 dB/octave (gentle slope). Available as a Mod Matrix destination.

## Interactions

- `filter.envDepth` works together with `filter.envPolarity` — with Normal polarity and a lower cutoff, the envelope sweeps the filter upward. With Inverted polarity, start with a higher cutoff and the envelope sweeps downward.
- `filter.envVelocity` scales the envelope depth based on key velocity — set `filter.envDepth` > 0 first or velocity sensitivity has no effect.
- `filter.lfoDepth` requires `filter.lfoSelect` to route the correct LFO. Shortcut: hold VCF EDIT and move the VCF LFO fader to switch between LFO 1/2 quickly.
- `filter.aftertouchToLfoDepth` and `filter.modWheelToLfoDepth` scale the LFO depth assigned by `filter.lfoDepth` — they add on top of the LFO depth fader value.
- `filter.keyTracking` pivots around **middle C** — notes above open the filter, notes below close it.
- `filter.cutoff` limits modulation: if already at 255 (fully open), no positive modulation (from envelope, LFO, or key tracking) can push it further. Set cutoff below maximum to leave headroom for upward modulation.
- `filter.bassBoost` (NRPN 52) mirrors the physical BOOST switch below the HPF fader — changing either updates both.
- `filter.hpfCutoff` sits **after the VCA** in the signal chain, so it affects all summed voices, not individual voices.
- The VCF cutoff is also available as a **Mod Matrix destination**, allowing modulation from any matrix source beyond the dedicated faders.

## Signal flow

```
OSC 1 ─┐
OSC 2 ─┤→ MIXER → VCF (LP filter) → VCA → HPF (HP filter) → FX → OUTPUT
NOISE ─┘              ▲                              ▲
               VCF Env / LFO /              Bass Boost (100 Hz)
               Key Track / Mod Matrix
```

## Related sections

- → [oscillators.md](oscillators.md) for the sound sources feeding the filter
- → [envelopes.md](envelopes.md) for VCF envelope ADSR shapes and curves (NRPNs 62–70)
- → [lfos.md](lfos.md) for LFO shapes, rates, and sync (mod sources for filter)
- → [vca.md](vca.md) for the amplifier stage between VCF and HPF
- → [mod-matrix.md](mod-matrix.md) for additional modulation routing to VCF cutoff and HPF cutoff
