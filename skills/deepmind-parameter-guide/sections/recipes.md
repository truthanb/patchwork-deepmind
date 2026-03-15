# Sound recipes — non-obvious DeepMind parameter interactions

Techniques that exploit DeepMind-specific behaviors. Use labels for
enum params (`set_param` with `label:`), normalized 0–1 for continuous.
Run `describe_param` to see valid labels for any param.

---

## Envelope as complex LFO (loop mode)

`env.amp.triggerMode` label `"Loop"` — envelope cycles ADR continuously, skipping sustain. Use asymmetric curve values (`attackCurve`, `decayCurve`, `releaseCurve`) to shape the cycling waveform into patterns no LFO can produce. All three envelopes support Loop independently.

Read: [envelopes.md](envelopes.md)

## Sustain slope — notes that evolve while held

`env.*.sustainCurve` — midpoint (0.5) is flat. Below 0.5 the level falls during sustain; above 0.5 it rises. Set amp sustain curve high + filter sustain curve low → note gets louder but darker while held. Per-envelope, so amp and filter can slope in opposite directions.

Read: [envelopes.md](envelopes.md)

## Keyboard-scaled envelope shape via mod matrix

Route Note Number → envelope curve params (SusCurve, EnvDepth). The envelope *shape* changes across the keyboard — low notes get falling sustain, high notes get rising sustain. Different from pitch/filter key tracking.

Read: [mod-matrix.md](mod-matrix.md)

## Envelope-driven oscillator crossfade

Route VCA Envelope → OSC 2 Level in mod matrix. OSC 2 presence follows the note lifecycle — fades in during attack, out during release. Use negative depth to invert (OSC 2 present at rest, fades out on note).

Read: [mod-matrix.md](mod-matrix.md), [oscillators.md](oscillators.md)

## Fixed-offset portamento

`portamento.mode` values 6–13 are fixed-interval slides — every note swoops from a set interval regardless of previous note. Not legato glides; they're built-in pitch transients. Pair with slow attack for organic pitch-rise effects.

Read: [voice-config.md](voice-config.md)

## Expression → OSC 2 pitch

Route Expression → OSC 2 Pitch in mod matrix with OSC 2 detuned low. Foot pedal sweeps OSC 2 through harmonic intervals in real time — from detuned sub rumble to unison lock.

Read: [mod-matrix.md](mod-matrix.md)

## Aftertouch → LFO rate

Route Pressure → LFO Rate in mod matrix. Harder press = faster LFO, not just deeper. The *character* of vibrato/filter wobble changes with finger pressure — more expressive than simple aftertouch→depth.

Read: [mod-matrix.md](mod-matrix.md), [lfos.md](lfos.md)

## Envelope → Tone Mod

Route VCA Envelope → TMod Depth in mod matrix. Tone Mod (DeepMind-unique) splits OSC 2's square wave with a pulse insert for metallic harmonics. Envelope routing makes that metallic character follow the note shape — FM-like attack transients without FM.

Read: [oscillators.md](oscillators.md), [mod-matrix.md](mod-matrix.md)

## Mod wheel → FX parameters

Mod matrix destinations include FX slot params (destinations 115+). Route Mod Wheel to FX parameters for real-time performance control over effect character.

Read: [mod-matrix.md](mod-matrix.md), [effects.md](effects.md)

## Delayed LFO onset

`lfo*.delayTime` — first 40% of range is silence, remaining 60% is fade-in. Stagger LFO 1 (short delay) and LFO 2 (long delay) to layer modulation that arrives at different points in the note.

Read: [lfos.md](lfos.md)

## Self-oscillating filter as 3rd oscillator

`filter.keyTracking` at max (1.0) + high resonance (>0.78). Filter tracks pitch 1:1 and self-oscillates into a pitch-accurate sine — a playable 3rd oscillator across the keyboard.

Read: [filter.md](filter.md)
