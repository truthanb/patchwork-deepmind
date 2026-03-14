# Sound recipes — DeepMind-specific techniques

These recipes highlight parameter interactions unique to the DeepMind 12.
They are derived from factory preset analysis and exploit behaviors you
won't find on a generic polysynth. Values are raw NRPN values (0–255).

Use `scan-presets.ts` (in `src/scripts/`) to dump and decode factory
presets from a connected synth — it flags unusual parameter combos
automatically.

---

## Envelope as complex LFO (loop mode)

Read: [envelopes.md](envelopes.md), [vca.md](vca.md)

The VCA envelope can be set to **Loop mode** (`env.amp.triggerMode` = 3),
which turns it into a cycling waveshape — attack→decay→release→repeat,
skipping sustain. Combined with per-stage curve shaping, this creates
rhythmic amplitude patterns far more complex than any LFO waveform.

Seen in factory preset "Vibro Pad KA":
- `env.amp.triggerMode` = 3 (Loop)
- `env.amp.attack` = 163, `env.amp.decay` = 221, `env.amp.release` = 107
- `env.amp.attackCurve` = 80, `env.amp.decayCurve` = 255, `env.amp.releaseCurve` = 117
- The asymmetric curves (attack=80 vs decay=255) create a lopsided
  amplitude pulse — not possible with standard LFO shapes.

Key insight: all three envelopes support Loop mode independently. You can
loop the VCA for tremolo, the VCF for rhythmic filter sweeps, and the MOD
envelope for cyclic modulation — each with different ADSR shapes and rates.

## Sustain slope — notes that evolve while held

Read: [envelopes.md](envelopes.md)

Sustain on the DeepMind is **not flat** by default — the `sustainCurve`
parameter (128 = flat) controls a slope during the sustain phase.

- Values < 128: level **drops** during sustain (notes slowly die while held)
- Values > 128: level **rises** during sustain (notes grow brighter/louder)

Seen in "Vibro Pad KA":
- `env.amp.sustainCurve` = 255 — volume rises while key is held
- `env.filter.sustainCurve` = 25 — filter cutoff falls during sustain
- Combined: the note gets louder but darker the longer you hold it.

This is per-envelope — you can have amplitude rising while filter falls,
creating timbral shifts impossible with static sustain.

## Keyboard-scaled envelope behavior via mod matrix

Read: [mod-matrix.md](mod-matrix.md), [envelopes.md](envelopes.md)

The mod matrix can route `Note Number` to envelope curve parameters,
making the envelope *shape itself differently* depending on where you
play on the keyboard.

Seen in "Vibro Pad KA":
- Mod bus 3: Note Number → VCF Env Depth — higher notes get more filter sweep
- Mod bus 4: Note Number → Env1 SusCurve, depth=+56 — low notes sustain
  with a falling slope, high notes sustain with a rising slope

This means a single patch plays with completely different envelope
contours across the keyboard — not just pitch and filter tracking.

## Envelope-driven oscillator crossfade

Read: [mod-matrix.md](mod-matrix.md), [oscillators.md](oscillators.md)

Routing VCA Envelope → OSC 2 Level via the mod matrix makes OSC 2's
presence in the mix follow the amplitude envelope — OSC 2 fades in
during the attack and out during release, creating a timbral shift
tied to the note lifecycle.

Seen in "Vibro Pad KA":
- Mod bus 1: Env 1 (VCA) → OSC2 Lvl, depth=+3
- OSC 2 at `osc2.pitch` = 255 (+12 semitones) with high `osc2.toneMod` = 244
- Result: the upper-octave metallic tone swells in with the note shape.

Variations: use Mod Envelope instead of VCA Envelope for independent
control, or use negative depth so OSC 2 is present at rest and fades
out when a note plays.

## Fixed-offset portamento as a sound design tool

Read: [voice-config.md](voice-config.md)

Portamento modes 6–13 are **fixed offset** — every note always slides
from a set interval regardless of what was played before. These are not
legato glides; they're built-in pitch transients.

Seen in "Blue Dolphin BC" (factory preset Bank 0, Program 0):
- `portamento.mode` = 9 (Fixed −5) — every note swoops up from a 4th below
- Combined with `env.amp.attack` = 113 (slow attack), the pitch slide
  arrives during the swell, creating an organic pitch-rise effect.

Other modes: Fixed +12/−12 for octave drops/rises (kick drums, risers),
Fixed ±24 for 2-octave sweeps, Fixed ±2 for subtle chromatic bends.

## Expression pedal as real-time oscillator tuning

Read: [mod-matrix.md](mod-matrix.md), [oscillators.md](oscillators.md)

Routing Expression → OSC 2 Pitch lets you continuously retune OSC 2
with your foot, shifting the harmonic interval between the two
oscillators in real time.

Seen in "Blue Dolphin BC":
- Mod bus 1: Expression → OSC 2 Pitch, depth=+40
- `osc2.pitch` = 1 (starts ~−12 semitones from OSC 1)
- Expression pedal sweeps OSC 2 pitch upward through dissonant intervals
  back toward unison — from a detuned sub rumble to a unison lock.

## Aftertouch → LFO rate for intensity control

Read: [mod-matrix.md](mod-matrix.md), [lfos.md](lfos.md)

Routing Pressure → LFO Rate speeds up the LFO the harder you press,
making vibrato/filter wobble intensify under finger pressure — mimicking
how acoustic performers add vibrato with effort.

Seen in "Blue Dolphin BC":
- Mod bus 3: Pressure → LFO 2 Rate, depth=+26
- LFO 2 controls filter modulation (`filter.lfoSelect` = 1)
- Result: light touch = slow filter movement, hard press = fast wobble.

This is more expressive than simple aftertouch→depth routing because
the *character* of the modulation changes, not just its amount.

## VCA Envelope → Tone Mod for timbral envelopes

Read: [oscillators.md](oscillators.md), [mod-matrix.md](mod-matrix.md)

OSC 2's Tone Mod splits the square wave cycle with a pulse insert,
creating metallic/bell-like harmonics. Routing an envelope to Tone Mod
Depth via the mod matrix makes the metallic character follow the note
shape.

Seen in "Blue Dolphin BC":
- Mod bus 2: Env 1 (VCA) → TMod Depth, depth=+38
- Mod bus 4: Mod Wheel → TMod Depth, depth=+14 (manual override)
- `osc2.toneMod` = 125 — high base tone mod
- Result: the metallic harmonic content peaks during the attack and
  fades with the note, then the mod wheel adds it back for emphasis.

Tone mod is unique to the DeepMind — most polysynths have no equivalent.
Combined with envelope modulation it creates FM-like attack transients
without actual FM.

## Mod wheel controlling FX parameters

Read: [mod-matrix.md](mod-matrix.md), [effects.md](effects.md)

Mod matrix destinations include FX slot parameters. Routing Mod Wheel to
FX parameters gives real-time performance control over effects.

Seen in "Blue Dolphin BC":
- Mod bus 5: Mod Wheel → destination 115, depth=+56
- Mod bus 6: Mod Wheel → destination 119, depth=+47
- These are FX parameter destinations — pushing the mod wheel morphs
  the effect character in real time.

This is powerful for live performance: the mod wheel simultaneously
controls synth modulation and effect intensity.

## Delayed LFO onset for staged modulation

Read: [lfos.md](lfos.md)

Both LFOs have a delay+fade parameter. The first 40% is pure silence,
the remaining 60% is a fade-in. At maximum (255), the LFO stays silent
for ~2.6 s then fades in over ~4 s.

Seen in "Vibro Pad KA":
- `lfo1.delayTime` = 255, `lfo2.delayTime` = 255 — both LFOs at max delay
- Combined with Loop envelope: the note starts with envelope-driven
  tremolo, then the LFO modulation gradually takes over.

Useful technique: set LFO 1 delay short and LFO 2 delay long to stage
two layers of modulation that arrive at different points in the note.

## Full key tracking as a timbral architecture

Read: [filter.md](filter.md)

Setting `filter.keyTracking` = 255 (100%) makes the filter track pitch
1:1 from middle C. With moderate resonance, this preserves harmonic
proportions across the full keyboard — the same timbre at every pitch.

Seen in "Vibro Pad KA":
- `filter.keyTracking` = 255 — full tracking
- `filter.cutoff` = 0 (not explicitly shown but filter is fully envelope-controlled)
- `filter.resonance` = 27 — mild emphasis that stays proportional

At extreme resonance values (>200) with full key tracking, the
self-oscillating filter becomes a **pitch-accurate 3rd oscillator**
across the entire keyboard — unique to the DeepMind.
