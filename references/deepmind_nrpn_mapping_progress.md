# DeepMind 12 NRPN → Edit Buffer Mapping Progress

This file tracks the discovery progress of NRPN parameters to edit-buffer byte offsets.

Note: Some early rows were discovered manually before the NRPN snapshot+diff workflow was standardized; as we verify via sweep+diff, offsets in this table may be corrected to match `src/deepmind/decoded-patch-map.ts`.

**Legend:**
- `✓ N` = Mapped to edit-buffer offset N
- `—` = Pending discovery
- `❌` = Skipped (not in edit buffer)

**Progress: 165/241 (68.5%)**

| NRPN | Parameter | Value Range | Status | Notes |
|---:|---|---|:---:|---|
| 0 | LFO 1 Rate | 0–255 | ✓ 0 | Contextual: free-running when arpSeq.sync=0 |
| 0 | LFO 1 Clock Divide | 20 values | ✓ 0 | Contextual: when arpSeq.sync=1 |
| 1 | LFO 1 Delay / Fade | 0–255 | ✓ 1 | |
| 2 | LFO 1 Shape | 0–6 | ✓ 2 | Sine, Triangle, Square, Ramp Up/Down, S&H, S&G |
| 3 | LFO 1 Key Sync | 0–1 | ✓ 3 | |
| 4 | LFO 1 Arp Sync | 0–1 | ✓ 4 | |
| 5 | LFO 1 Mono Mode (Phase) | 0–255 | ✓ 5 | Poly/Mono/Spread-1..254 |
| 6 | LFO 1 Slew Rate | 0–255 | ✓ 6 | |
| 7 | LFO 2 Rate | 0–255 | ✓ 7 | Contextual: free-running when arpSeq.sync=0 |
| 7 | LFO 2 Clock Divide | 20 values | ✓ 7 | Contextual: when arpSeq.sync=1 |
| 8 | LFO 2 Delay / Fade | 0–255 | ✓ 8 | |
| 9 | LFO 2 Shape | 0–6 | ✓ 9 | |
| 10 | LFO 2 Key Sync | 0–1 | ✓ 10 | |
| 11 | LFO 2 Arp Sync | 0–1 | ✓ 11 | |
| 12 | LFO 2 Mono Mode (Phase) | 0–255 | ✓ 12 | |
| 13 | LFO 2 Slew Rate | 0–255 | ✓ 13 | |
| 14 | OSC 1 Range | 0–2 | ✓ 14 | 16'/8'/4' |
| 15 | OSC 2 Range | 0–2 | ✓ 15 | 16'/8'/4' |
| 16 | OSC 1 PWM Source | 0–5 | ✓ 16 | Manual/LFO1/LFO2/VCA Env/VCF Env/Mod Env |
| 17 | OSC 2 Tone Mod Source | 0–5 | ✓ 17 | Manual/LFO1/LFO2/VCA Env/VCF Env/Mod Env |
| 18 | OSC 1 Pulse Enable | 0–1 | ✓ 18 | |
| 19 | OSC 1 Saw Enable | 0–1 | ✓ 19 | |
| 20 | OSC Sync Enable | 0–1 | ✓ 20 | OSC 2 sync to OSC 1 |
| 21 | OSC 1 Pitch Mod Depth | 0–255 | ✓ 21 | |
| 22 | OSC 1 Pitch Mod Select | 0–6 | ✓ 22 | LFO 1/2, VCA/VCF/Mod Envs, Unipolar LFO 1/2 |
| 23 | OSC 1 Aftertouch > Pitch Mod | 0–255 | ✓ 23 | |
| 24 | OSC 1 Mod Wheel > Pitch Mod | 0–255 | ✓ 24 | |
| 25 | OSC 1 PWM Depth | 0–255 | ✓ 25 | |
| 26 | OSC 2 Level | 0–255 | ✓ 26 | |
| 27 | OSC 2 Pitch | 0–255 | ✓ 27 | |
| 28 | OSC 2 Tone Mod Depth | 0–255 | ✓ 28 | |
| 29 | OSC 2 Pitch Mod Depth | 0–255 | ✓ 29 | |
| 30 | OSC 2 Aftertouch > Pitch Mod | 0–255 | ✓ 30 | |
| 31 | OSC 2 Mod Wheel > Pitch Mod | 0–255 | ✓ 31 | |
| 32 | OSC 2 Pitch Mod Select | 0–6 | ✓ 32 | LFO 1/2, VCA/VCF/Mod Envs, Unipolar LFO 1/2 |
| 33 | Noise Level | 0–255 | ✓ 33 | |
| 34 | Portamento Time | 0–255 | ✓ 34 | |
| 35 | Portamento Mode | 0–13 | ✓ 35 | Normal/Fingered/Fixed Rate/Exponential/Fixed +/-2/5/12/24 |
| 36 | Pitch Bend Up Depth | 0–24 | ✓ 36 | Semitones |
| 37 | Pitch Bend Down Depth | 0–24 | ✓ 37 | Semitones |
| 38 | OSC 1 Pitch Mod Mode | 0–1 | ✓ 38 | OSC1+2 or OSC 1 Only |
| 39 | VCF Frequency | 0–255 | ✓ 39 | Verified by NRPN sweep+diff |
| 40 | VCF HighPass Frequency | 0–255 | ✓ 40 | |
| 41 | VCF Resonance | 0–255 | ✓ 41 | Verified by NRPN sweep+diff |
| 42 | VCF Envelope Depth | 0–255 | ✓ 42 | |
| 43 | VCF Envelope Velocity Sens | 0–255 | ✓ 43 | |
| 44 | VCF Pitch Bend to Freq | 0–255 | ✓ 44 | |
| 45 | VCF LFO Depth | 0–255 | ✓ 45 | |
| 46 | VCF LFO Select | 0–1 | ✓ 46 | Semantics: 0=LFO 1, 1=LFO 2. Note: diff was only observable after setting VCF LFO Depth (NRPN 45) > 0. |
| 47 | VCF Aftertouch > LFO Depth | 0–255 | ✓ 47 | |
| 48 | VCF Mod Wheel > LFO Depth | 0–255 | ✓ 48 | |
| 49 | VCF Keyboard Tracking | 0–255 | ✓ 49 | |
| 50 | VCF Envelope Polarity | 0–1 | ✓ 50 | Note: Invert LED ON at 0, OFF at 1 |
| 51 | VCF 2 Pole Mode | 0–1 | ✓ 51 | Note: 2-POLE LED ON at 1 |
| 52 | VCF Bass Boost | 0–1 | ✓ 52 | |
| 53 | VCA Envelope Attack | 0–255 | ✓ 53 | |
| 54 | VCA Envelope Decay | 0–255 | ✓ 54 | |
| 55 | VCA Envelope Sustain | 0–255 | ✓ 55 | |
| 56 | VCA Envelope Release | 0–255 | ✓ 56 | |
| 57 | VCA Envelope Trigger Mode | 0–4 | ✓ 57 | Key/LFO1/LFO2/Loop/Control Seq Step |
| 58-61 | VCA Envelope Curves | 0–255 | ✓ 58-61 | Attack/Decay/Sustain/Release curves |
| 62-65 | VCF Envelope ADSR | 0–255 | ✓ 62-65 | |
| 66 | VCF Envelope Trigger Mode | 0–4 | ✓ 66 | |
| 67-70 | VCF Envelope Curves | 0–255 | ✓ 67-70 | Attack/Decay/Sustain/Release curves |
| 71-74 | Mod Envelope ADSR | 0–255 | ✓ 71-74 | |
| 75 | Mod Envelope Trigger Mode | 0–4 | ✓ 75 | Key/LFO1/LFO2/Loop/Control Seq Step |
| 76-79 | Mod Envelope Curves | 0–255 | ✓ 76-79 | Attack/Decay/Sustain/Release curves |
| 80 | VCA Level | 0–255 | ✓ 80 | |
| 81 | VCA Envelope Depth | 0–255 | ✓ 81 | |
| 82 | VCA Envelope Velocity Sens | 0–255 | ✓ 82 | |
| 83 | VCA Pan Spread | 0–255 | ✓ 83 | Display = raw - 128 (-128..+127) |
| 84 | Voice Priority Mode | 0–2 | ✓ 84 | Lowest/Highest/Last. Note: gated by Polyphony Mode (discovered in Mono). |
| 85 | Polyphony Mode | 0–12 | ✓ 85 | Poly/Unison2-12/Mono/Mono2-6/Poly6-8 |
| 86 | Envelope Trigger Mode | 0–3 | ✓ 86 | Mono/Re-Trigger/Legato/One-Shot |
| 87 | Unison Detune | 0–255 | ✓ 87 | Note: only applies in Unison polyphony modes. |
| 88 | Voice Drift | 0–255 | ✓ 88 | |
| 89 | Parameter Drift | 0–255 | ✓ 89 | |
| 90 | Drift Rate | 0–255 | ✓ 90 | |
| 91 | OSC Portamento Balance | 0–255 | ✓ 91 | Display = raw - 128 (-128..+127) |
| 92 | OSC Key Down Reset | 0–1 | ✓ 92 | |
| 93-95 | Mod Matrix 1 (Source/Dest/Depth) | varies | ✓ 93-95 | Depth display = raw - 128 (-128..+127) |
| 96-116 | Mod Matrix 2-8 (Source/Dest/Depth) | varies | ✓ 96-116 | Assumed same 3-byte pattern as slot 1 (NRPN 93–95). Spot-checked slot 8: NRPN 114/115/116 => offsets 114/115/116. Depth display = raw - 128 (-128..+127). |
| 117 | Ctrl Sequencer Enable | 0–1 | ✓ 117 | |
| 118 | Ctrl Seq Clock Divider | 0–15 | ✓ 118 | |
| 119 | Sequence Length | 0–31 | ✓ 119 | 1-32 steps |
| 120 | Sequencer Swing Timing | 0–25 | ✓ 120 | 50%-75% |
| 121 | Key Sync & Loop | 0–2 | ✓ 121 | Loop/Key Sync/Both |
| 122 | Slew Rate | 0–255 | ✓ 122 | |
| 123-154 | Seq Step Values 1-32 | 0–255 | ✓ 123-154 | Bipolar -127..+127, 0=skip. Spot-checked NRPN 123 => offset 123 and NRPN 154 => offset 154. |
| 155 | Arp On/Off | 0–1 | ✓ 155 | Spot-checked NRPN 155 => offset 155. |
| 156 | Arp Mode | 0–10 | ✓ 156 | |
| 157 | Arp Rate (tempo) | 0–255 | ✓ 157 | 20-275 bpm |
| 158 | Arp Clock | 0–12 | ✓ 158 | Clock divider |
| 159 | Arp Key Sync | 0–1 | ✓ 159 | |
| 160 | Arp Gate Time | 0–255 | ✓ 160 | |
| 161 | Arp Hold | 0–1 | ✓ 161 | |
| 162 | Arp Pattern | 0–64 | ✓ 162 | None/Preset1-32/User1-32 |
| 163 | Arp Swing | 0–25 | ✓ 163 | 50%-75% |
| 164 | Arp Octaves | 0–5 | ✓ 164 | Spot-checked NRPN 164 => offset 164. |
| 165 | FX Routing | 0–9 | ✓ 165 | Connection modes. Labels copied from manual (M-1..M-10) and spot-checked live: values 0..9 match M-1..M-10 order. |
| 166 | FX 1 Type | 0–35 | ✓ 166 | Enum discovered by sweep+observe (0=None, 16=RotarySpkr, 35=VintgPitch, etc). Values are not ordered like the manual list. |
| 167-178 | FX 1 Params 1-12 | 0–255 | — | Per-effect. HallRev (type=1) UI labels: FD, DCY, SI2, DMP, DIF, MIX, LC, HC, LFX, SPR, SHP, MOD (spot-checked: NRPN 167=FD, NRPN 178=MOD). PlateRev (type=2) UI labels: FD, DCY, SIZ, DMP, DIF, MIX, LC, HC, LFX, XOV, MDD, MDS. RichPltRev (type=3) UI labels: FD, DCY, SIZ, DMP, DIF, MIX, LC, HC, LFX, SPR, ATK, SPM. AmbVerb (type=4) UI labels (10): FD, DCY, SIZ, DMP, DIF, MIX, LC, HC, MOD, TGM. GatedRev (type=5) UI labels (10): FD, DCY, ATK, DEM, SPR, MIX, LC, HIF, HIS, DIF. ReverseRev (type=6) UI labels (9): FD, DCY, RIS, DIF, SPR, MIX, LC, HIF, HIS. RackAmp (type=7) UI labels (9): PRE, BUZ, PMC, CRM, DRV, LVL, LOW, HI, CAB. MoodFilter (type=8) UI labels (12): SPD, DEP, RES, FRQ, TYP, MIX, WAV, ENV, ATK, REL, DRV, POL. Phaser (type=9) UI labels (12): SPD, DEP, RES, RAS, STG, MIX, NAV, PHS, ENV, ATK, HLD, REL. Chorus (type=10) UI labels (11): SPD, NDL, NDR, DLL, DLR, MIX, LC, HC, PHS, NAV, SPR. Flanger (type=11) UI labels (12): SPD, NDL, NDR, DLL, DLR, MIX, LC, HS, PHS, FLC, FHC, FD. ModDlytRev (type=12) UI labels (12): TIM, FAC, FBK, FHC, DEP, SPD, MOD, RTY, DCY, DMP, BAL, MIX. Delay (type=13) UI labels (12): MIX, TIM, MOD, FCL, FCR, OFS, LC, HC, FLC, FBL, FBR, FHC. 3TapDelay (type=14) UI labels (12): TIM, GMT, PMT, FBK, FCA, GWA, PWA, FCB, GWB, PWB, XFD, MIX. 4TapDelay (type=15) UI labels (12): TIM, GW, FBK, SPR, FCA, GWA, FCB, GMB, FCC, GWC, XFD, MIX. RotarySpkr (type=16) UI labels (8): LOS, HIS, ACC, DIS, BAL, MIX, MOT, SPD. Chorus-D (type=17) UI labels (7): PWR, MOD, MOX, SM1, SM2, SM3, SM4. Enhancer (type=18) UI labels (9): OGW, SPR, EGW, BFR, MGW, MIQ, HIS, HIF, SOL. EdisonEX1 (type=19) UI labels (8): ON, IMD, OMD, STS, LMF, BAL, CNT, GN. Auto Pan (type=20) UI labels (9): SPD, PHS, WAV, DEP, ESP, EDP, ATK, HLD, REL. T-RayDelay (type=21) UI labels (5): MIX, DLY, SUS, WOB, TON. These label sets should apply to any FX slot when its type matches (FX2/3/4 params use different NRPN ranges but same label order). |
| 167-178 | FX 1 Params 1-12 | 0–255 | ✓ 167-178 | Per-effect. HallRev (type=1) UI labels: FD, DCY, SI2, DMP, DIF, MIX, LC, HC, LFX, SPR, SHP, MOD (spot-checked: NRPN 167=FD, NRPN 178=MOD). PlateRev (type=2) UI labels: FD, DCY, SIZ, DMP, DIF, MIX, LC, HC, LFX, XOV, MDD, MDS. RichPltRev (type=3) UI labels: FD, DCY, SIZ, DMP, DIF, MIX, LC, HC, LFX, SPR, ATK, SPM. AmbVerb (type=4) UI labels (10): FD, DCY, SIZ, DMP, DIF, MIX, LC, HC, MOD, TGM. GatedRev (type=5) UI labels (10): FD, DCY, ATK, DEM, SPR, MIX, LC, HIF, HIS, DMP. ReverseRev (type=6) UI labels (9): FD, DCY, RIS, DIF, SPR, MIX, LC, HIF, HIS. RackAmp (type=7) UI labels (9): PRE, BUZ, PMC, CRM, DRV, LVL, LOW, HI, CAB. MoodFilter (type=8) UI labels (12): SPD, DEP, RES, FRQ, TYP, MIX, WAV, ENV, ATK, REL, DRV, POL. Phaser (type=9) UI labels (12): SPD, DEP, RES, RAS, STG, MIX, NAV, PHS, ENV, ATK, HLD, REL. Chorus (type=10) UI labels (11): SPD, NDL, NDR, DLL, DLR, MIX, LC, HC, PHS, NAV, SPR. Flanger (type=11) UI labels (12): SPD, NDL, NDR, DLL, DLR, MIX, LC, HS, PHS, FLC, FHC, FD. ModDlytRev (type=12) UI labels (12): TIM, FAC, FBK, FHC, DEP, SPD, MOD, RTY, DCY, DMP, BAL, MIX. Delay (type=13) UI labels (12): MIX, TIM, MOD, FCL, FCR, OFS, LC, HC, FLC, FBL, FBR, FHC. 3TapDelay (type=14) UI labels (12): TIM, GMT, PMT, FBK, FCA, GWA, PWA, FCB, GWB, PWB, XFD, MIX. 4TapDelay (type=15) UI labels (12): TIM, GW, FBK, SPR, FCA, GWA, FCB, GMB, FCC, GWC, XFD, MIX. RotarySpkr (type=16) UI labels (8): LOS, HIS, ACC, DIS, BAL, MIX, MOT, SPD. Chorus-D (type=17) UI labels (7): PWR, MOD, MOX, SM1, SM2, SM3, SM4. Enhancer (type=18) UI labels (9): OGW, SPR, EGW, BFR, MGW, MIQ, HIS, HIF, SOL. EdisonEX1 (type=19) UI labels (8): ON, IMD, OMD, STS, LMF, BAL, CNT, GN. Auto Pan (type=20) UI labels (9): SPD, PHS, WAV, DEP, ESP, EDP, ATK, HLD, REL. T-RayDelay (type=21) UI labels (5): MIX, DLY, SUS, WOB, TON. Full type+param mapping for 0–35 tracked in `references/deepmind_fx.md`. |
| 179 | FX 2 Type | 0–35 | ✓ 179 | Uses same enum mapping as FX 1 Type (0–35). |
| 180-191 | FX 2 Params 1-12 | 0–255 | — | |
| 180-191 | FX 2 Params 1-12 | 0–255 | ✓ 180-191 | Per-effect; see `references/deepmind_fx.md` for full type+param mapping (0–35). |
| 192 | FX 3 Type | 0–35 | ✓ 192 | Uses same enum mapping as FX 1 Type (0–35). |
| 193-204 | FX 3 Params 1-12 | 0–255 | — | |
| 193-204 | FX 3 Params 1-12 | 0–255 | ✓ 193-204 | Per-effect; see `references/deepmind_fx.md` for full type+param mapping (0–35). |
| 205 | FX 4 Type | 0–35 | ✓ 205 | Uses same enum mapping as FX 1 Type (0–35). |
| 206-217 | FX 4 Params 1-12 | 0–255 | — | |
| 206-217 | FX 4 Params 1-12 | 0–255 | ✓ 206-217 | Per-effect; see `references/deepmind_fx.md` for full type+param mapping (0–35). |
| 218-221 | FX 1-4 Output Gain | 0–150 | ✓ 218-221 | Verified by sweep+snapshot diff: NRPN 218/219/220/221 change only bytes 218/219/220/221 respectively (`fx1.outputGain`..`fx4.outputGain`). |
| 222 | FX Mode | 0–2 | ✓ 222 | Verified by sweep+snapshot diff: NRPN 222 toggles only byte 222 (`fx.mode`). Raw values observed: 0, 1, 2 (Insert/Send/Bypass per manual). |
| 223-239 | Program Name | 0–127 | ❌ | ASCII string, likely not in edit buffer |
| 240 | Program Category | 0–16 | ❌ | Likely program metadata, not edit buffer |

## Next to discover

**Standard 0-255 ranges (fastest):**
- NRPN 14-15: OSC 1/2 Range (0-2 enum)
- NRPN 33: Noise Level
- NRPN 34: Portamento Time
- NRPN 40: VCF HighPass Frequency
- NRPN 42-49: VCF Envelope params
- NRPN 55-56: VCA Envelope Sustain/Release

**Custom ranges (need valueMap):**
- NRPN 16-17: OSC PWM/Tone Mod Source (0-5 enum)
- NRPN 22: OSC 1 Pitch Mod Select (0-6 enum)
- NRPN 35: Portamento Mode (0-13 enum)
