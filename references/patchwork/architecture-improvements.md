# MCP Server Architecture Improvements

## Overview

This document outlines proposed improvements for handling synthesizers with extensive parameter sets (400+ parameters like the Behringer DeepMind) while maintaining the current architecture's strengths.

## Current Architecture Assessment

**What's Already Working:**
- ✅ `SynthAdapter.setParams()` - Bulk parameter updates already implemented
- ✅ Parameter maps - `parameterMap` and `getParamDescriptions()` provide parameter metadata
- ✅ MCP resources - `synth://<id>/params` exposes parameter information
- ✅ Specialized tools - `set_modulation`, `set_synth_feature` provide intent clarity
- ✅ NRPN support - 14-bit parameter control already in MIDI layer

**Current Limitations:**
- ❌ Bulk operations not exposed as MCP tool (internal-only)
- ❌ No parameter caching to reduce redundant MIDI traffic
- ❌ No SysEx bulk transfer support (DeepMind sends 400+ params efficiently)
- ❌ No multi-timbral/layer addressing (needed for DeepMind 12's 2 layers)
- ❌ Limited MIDI bandwidth management (no throttling/prioritization)

## Proposed Improvements

### 1. Expose Bulk Parameter Tool

Add MCP tool wrapper for existing `setParams()` functionality:

```typescript
set_parameters: {
  parameters: {
    params: Array<{ param: string; value: number }>;
    synthId?: string;
  }
}
```

**Implementation:** Simple - just expose existing `SynthAdapter.setParams()` method through MCP handler.

### 2. Parameter Value Caching

Track last-sent values to avoid redundant MIDI messages:

```typescript
class CachedSynthDriver {
  private paramCache = new Map<string, number>();
  
  async setParam(param: string, value: number): Promise<boolean> {
    const cached = this.paramCache.get(param);
    if (cached !== undefined && Math.abs(cached - value) < 0.001) {
      return true; // Skip redundant send
    }
    
    const success = await this.sendMidiParam(param, value);
    if (success) {
      this.paramCache.set(param, value);
    }
    return success;
  }
}
```

**Considerations:**
- Clear cache on preset load
- Clear cache on hardware disconnect/reconnect
- Optional bypass for critical parameters

### 3. SysEx Bulk Transfer Support

DeepMind and other modern synths support bulk parameter updates via SysEx:

```typescript
interface BulkTransferCapability {
  supportsBulkSysEx: boolean;
  maxBulkMessageSize: number;  // Typically ~1KB
  
  /** Encode multiple parameters into a single SysEx message */
  encodeBulkParams?(params: ParamSetting[]): Uint8Array[];
  
  /** Decode bulk parameter response */
  decodeBulkParams?(sysex: Uint8Array): ParamSetting[];
}
```

**Benefits:**
- DeepMind: 400+ parameters → 10-20 SysEx messages instead of 400 MIDI commands
- Faster preset loading
- Reduced MIDI bus congestion

### 4. Multi-Timbral/Layer Support

DeepMind 12 has 2 independent synthesizer layers:

```typescript
interface ParamSetting {
  param: CanonicalParam | string;
  value: NormalizedValue;
  layer?: number;  // Optional layer/part identifier
}

// Driver handles layer routing
setParam(param: string, value: number, layer?: number): Promise<boolean>
```

**Alternative:** Prefix parameter names with layer: `layer1.filter.cutoff`, `layer2.osc.frequency`

### 5. MIDI Bandwidth Management

Add throttling and prioritization for parameter-heavy operations:

```typescript
class MidiThrottler {
  private queue: Array<{ priority: number; fn: () => Promise<void> }> = [];
  private messagesPerSecond = 300;  // Typical MIDI limit
  
  async send(fn: () => Promise<void>, priority: number = 0): Promise<void> {
    // High priority = user-triggered changes
    // Low priority = automation/bulk updates
  }
}
```

**Priorities:**
1. High: Direct user parameter changes (set_param)
2. Medium: Bulk operations (set_parameters)
3. Low: Preset restoration, automation

### 6. Enhanced MCP Resources

Extend existing parameter resources with filtering:

```typescript
// Already exists: synth://<id>/params

// Add category filtering via query parameters (future enhancement)
synth://<id>/params?category=oscillator
synth://<id>/params?category=filter

// Or add dedicated category resources
synth://<id>/categories           // List all categories
synth://<id>/categories/oscillator // Oscillator params only
```

**Note:** Current MCP resources are static. Adding "current state" would require state tracking in drivers, which adds significant complexity. Consider if benefits outweigh costs.

### 7. Parameter Interdependency Handling

Some parameters affect others (e.g., changing oscillator type changes available waveshapes):

```typescript
interface FeatureResult {
  success: boolean;
  feature: string;
  value: string;
  message: string;
  relatedChanges?: Array<{ param: string; newValue: number }>;  // New field
}
```

Driver can warn LLM about cascade effects: "Changing oscillatorType to 'Wavetable' reset waveShape to 0 because previous wave isn't available."

## Implementation Strategy

**Philosophy:** Incremental improvements, not rewrites. Current architecture is solid.

### Phase 1: Expose Existing Capabilities (Low Effort, High Value)
- [ ] Add `set_parameters` MCP tool (wraps existing `setParams()`)
- [ ] Enhance param map resources with category info
- [ ] Document bulk operation patterns for LLM

**Estimated Effort:** 2-4 hours  
**Value:** Enables efficient multi-parameter updates today

### Phase 2: DeepMind Basic Support (Medium Effort)
- [ ] Map all 400+ NRPN parameters
- [ ] Implement DeepMindDriver with standard NRPN sends
- [ ] Add modulation matrix mappings (8×16)
- [ ] Effect parameter support with type switching
- [ ] Basic layer addressing (DM12)

**Estimated Effort:** 20-40 hours (mostly parameter mapping)  
**Value:** Full DeepMind control via existing MCP tools

### Phase 3: Performance Optimization (Medium Effort)
- [ ] Parameter value caching
- [ ] Bulk SysEx protocol implementation
- [ ] MIDI bandwidth throttling/prioritization
- [ ] Smart batching (group related params)

**Estimated Effort:** 10-20 hours  
**Value:** Faster preset loading, reduced MIDI congestion

### Phase 4: Advanced Features (Future)
- [ ] Preset interdependency warnings
- [ ] Category-filtered resources
- [ ] Advanced layer management
- [ ] Mod matrix visualization/discovery tools

**Estimated Effort:** Ongoing  
**Value:** Enhanced user experience, better LLM guidance

## Key Design Decisions

### Keep Specialized Tools
**Decision:** Do NOT deprecate `set_modulation`, `set_synth_feature`, etc.

**Rationale:**
- They express clear intent to the LLM
- Better than generic `set_parameter` for common operations
- `set_parameters` supplements, doesn't replace them
- LLM can choose appropriate tool for context

### Parameter Name Resolution
**Decision:** Do NOT add fuzzy parameter name matching.

**Rationale:**
- LLM already maps "filter cutoff" → "filter.cutoff" reliably
- Adds complexity without clear benefit
- Exact matching is more predictable and debuggable

### State Tracking
**Decision:** Start WITHOUT state tracking. Add only if clearly needed.

**Rationale:**
- Current stateless design is simpler and more reliable
- Synths maintain their own state
- Parameter caching is different from full state tracking
- Adds complexity for questionable benefit

### Layer Addressing (DeepMind 12)
**Decision:** TBD - prototype both approaches:
1. Separate synth instances: `deepmind12-layer1`, `deepmind12-layer2`
2. Layer parameter: `setParam('filter.cutoff', 0.5, { layer: 1 })`

**Test criteria:**
- Which is more intuitive for LLM?
- Which handles global vs per-layer params better?
- Which fits existing architecture with minimal changes?

## Behringer DeepMind 6/12 Implementation Plan

### Parameter Scale
- **400+ NRPN parameters**: Oscillators, filters, envelopes, LFOs, effects, mod matrix
- **8×16 modulation matrix**: 128 possible mod routings (vs MicroFreak's 5×7 = 35)
- **2 independent layers**: DeepMind 12 only - each layer is a full synth voice
- **5 effect types**: Each with ~10 parameters (Chorus, Delay, Reverb, etc.)
- **Per-voice parameters**: Some parameters apply per-voice in paraphonic mode

### DeepMind SysEx Capabilities

The DeepMind supports efficient bulk parameter operations:

```
Bulk Parameter Dump (Request):
F0 00 20 32 00 01 06 02 F7

Bulk Parameter Dump (Response):
F0 00 20 32 00 01 06 02 [~1KB of param data] F7

Parameter Write (Multiple params):
F0 00 20 32 00 01 06 03 [param blocks] F7
```

**Benefits:**
- Load/save entire preset: 1 SysEx message instead of 400+ NRPN messages
- Bulk parameter updates: Group changes into ~10-20 messages
- Significantly faster preset switching

**Implementation Priority:**
1. ✅ Basic NRPN parameter control (individual params)
2. ✅ Modulation matrix NRPN mappings
3. ✅ Effect parameter control
4. ⚠️ Layer addressing (DM12 only)
5. ⚠️ Bulk SysEx read/write
6. ⚠️ Parameter caching

### Driver Architecture

```typescript
class DeepMindDriver implements SynthAdapter {
  private paramCache = new Map<string, number>();
  private layerCount: 1 | 2;  // DM6=1, DM12=2
  
  // Use bulk SysEx when updating many parameters
  async setParams(settings: ParamSetting[]): Promise<ApplyResult> {
    if (settings.length > 10) {
      return this.bulkSysExUpdate(settings);
    }
    return this.individualNrpnUpdate(settings);
  }
  
  private async bulkSysExUpdate(settings: ParamSetting[]): Promise<ApplyResult> {
    // Encode params into SysEx bulk format
    // Send via midiPort.sendSysEx()
  }
}
```

### DeepMind-Specific Challenges

1. **Layer Management** (DM12)
   - Option A: Prefix params with layer: `layer1.filter.cutoff`
   - Option B: Add layer field to ParamSetting
   - Option C: Treat as separate synths: `deepmind12-layer1`, `deepmind12-layer2`

2. **Effect Parameters**
   - Effects are global (not per-layer)
   - 5 effect types, each with different parameter sets
   - Need feature switching: `set_synth_feature("effectType", "Chorus")` changes available effect params

3. **Modulation Matrix Scale**
   - 128 possible routings (8 sources × 16 destinations)
   - Current `set_modulation` tool works but documentation needs updating
   - Consider adding `list_mod_sources` and `list_mod_destinations` tools

4. **Parameter Caching Critical**
   - 400+ parameters = potential for many redundant sends
   - Implement cache with bypass for critical real-time params
   - Clear cache on preset load/hardware disconnect

### Testing Strategy Without Hardware

1. **MIDI Message Validation**
   - Unit tests for NRPN encoding (MSB/LSB splitting)
   - Validate SysEx message structure
   - Test parameter normalization (0.0-1.0 → NRPN 0-16383)

2. **Mock MIDI Port**
   - Capture sent messages
   - Verify correct addressing and values
   - Test bulk vs individual sending logic

3. **Parameter Map Completeness**
   - Document all 400+ parameters from manual
   - Map to NRPN addresses
   - Add descriptions and sound design tips

4. **Layer Addressing**
   - Test parameter routing to correct layer
   - Validate global vs per-layer parameters

## Parameter Discovery & Validation (With Hardware)

Once hardware is available, runtime discovery and validation can significantly improve implementation quality and catch documentation errors.

### Discovery Capabilities

#### 1. SysEx Preset Dump Analysis
The most valuable discovery technique:

```typescript
// Request full preset dump via SysEx
async function analyzePresetStructure(midiPort: HardwareMidiPort): Promise<void> {
  // Send: F0 00 20 32 00 01 06 02 F7 (request bulk dump)
  const dump = await midiPort.requestSysEx([0xF0, 0x00, 0x20, 0x32, 0x00, 0x01, 0x06, 0x02, 0xF7]);
  
  // Analyze:
  // - Total size (~1KB expected)
  // - Parameter layout (sequential? grouped by category?)
  // - Checksum/validation bytes
  // - Compare multiple presets to identify parameter positions
}
```

**Discoveries:**
- Actual parameter order in memory
- Parameter byte sizes (7-bit? 14-bit? packed?)
- Which parameters are stored vs computed
- Preset structure for efficient bulk operations

#### 2. Parameter Range Validation
Systematically test documented ranges against actual hardware behavior:

```typescript
async function validateParameter(
  param: { msb: number; lsb: number; name: string },
  docRange: [number, number]
): Promise<ValidationResult> {
  // Send boundary values
  await setNRPN(param.msb, param.lsb, docRange[0]);  // Min
  await delay(50);
  await setNRPN(param.msb, param.lsb, docRange[1]);  // Max
  await delay(50);
  await setNRPN(param.msb, param.lsb, Math.floor((docRange[0] + docRange[1]) / 2));  // Mid
  
  // Request preset dump after each to confirm value was accepted
  const dump = await requestPresetDump();
  
  return {
    param: param.name,
    actualRange: extractRangeFromDump(dump),
    matchesDoc: actualRange === docRange,
  };
}
```

**Discoveries:**
- Actual vs documented ranges (catch manual errors)
- Quantization (does parameter use all 256/16384 values or is it coarse?)
- Default/init values
- Read-only parameters (value doesn't change)

#### 3. Discrete Parameter Discovery
For parameters documented as "see list" with no details:

```typescript
async function discoverDiscreteValues(
  msb: number,
  lsb: number,
  name: string
): Promise<number[]> {
  const validValues = [];
  
  for (let i = 0; i < 256; i++) {
    await setNRPN(msb, lsb, i);
    await delay(50);
    
    const dump = await requestPresetDump();
    const storedValue = extractParamValue(dump, msb, lsb);
    
    // If stored value differs from sent value, we hit the ceiling
    if (storedValue !== i) {
      break;
    }
    
    validValues.push(i);
  }
  
  return validValues;
}
```

**Discoveries:**
- Actual number of valid options (e.g., "0-12" might really be 0-7)
- Whether values are sequential or have gaps
- Hidden/undocumented options

#### 4. Bipolar Parameter Validation
Confirm bipolar encoding (-128 to +127 → 0 to 255):

```typescript
async function validateBipolarEncoding(param: BipolarParam): Promise<void> {
  // Test zero point
  await setNRPN(param.msb, param.lsb, 128);
  const zeroValue = await readbackValue(param);
  
  // Test negative extreme
  await setNRPN(param.msb, param.lsb, 0);
  const minValue = await readbackValue(param);
  
  // Test positive extreme  
  await setNRPN(param.msb, param.lsb, 255);
  const maxValue = await readbackValue(param);
  
  console.log(`Bipolar encoding for ${param.name}:`);
  console.log(`  Zero at: ${zeroValue} (expected: 128)`);
  console.log(`  Min: ${minValue}, Max: ${maxValue}`);
}
```

**Discoveries:**
- Confirm zero point (0, 128, or other?)
- Validate symmetric range
- Check if center detent exists

#### 5. Modulation Matrix Analysis
Analyze factory presets to understand modulation routing patterns:

```typescript
async function analyzeModRoutings(): Promise<ModRoutingDatabase> {
  const routings = new Map<string, PresetUsage[]>();
  
  // Sample factory presets
  for (const slot of [1, 10, 20, 30, 40, 50, 100, 200, 300, 400, 500]) {
    await loadPreset(slot);
    await delay(100);
    
    const dump = await requestPresetDump();
    const modMatrix = extractModMatrix(dump);
    
    // Record which presets use which routings
    for (const routing of modMatrix) {
      const key = `${routing.source}->${routing.destination}`;
      if (!routings.has(key)) {
        routings.set(key, []);
      }
      routings.get(key)!.push({ slot, amount: routing.amount });
    }
  }
  
  return routings;
}
```

**Discoveries:**
- Common modulation patterns in factory presets
- Typical modulation amounts
- Which sources/destinations are used most
- Inspiration for sound design tips

### Discovery Scripts

Create utility scripts for runtime validation:

#### `src/scripts/deepmind-discover-params.ts`
```typescript
/**
 * DeepMind Parameter Discovery Tool
 * 
 * Validates and enriches parameter data by testing against actual hardware.
 * Outputs enriched CSV with validated ranges and discovered features.
 */

async function main() {
  const dm = await connectDeepMind();
  
  console.log('Phase 1: Preset Structure Analysis');
  const structure = await analyzePresetStructure(dm);
  await writeJSON('analysis/preset-structure.json', structure);
  
  console.log('Phase 2: Parameter Range Validation');
  const validation = await validateAllParameters(dm, PARAM_DATABASE);
  await writeCSV('analysis/param-validation.csv', validation);
  
  console.log('Phase 3: Discrete Parameter Discovery');
  const discrete = await discoverAllDiscreteParams(dm);
  await writeCSV('analysis/discrete-params.csv', discrete);
  
  console.log('Phase 4: Bipolar Encoding Validation');
  const bipolar = await validateBipolarParams(dm, BIPOLAR_PARAMS);
  await writeCSV('analysis/bipolar-validation.csv', bipolar);
  
  console.log('Phase 5: Modulation Matrix Analysis');
  const modMatrix = await analyzeModRoutings(dm);
  await writeJSON('analysis/mod-matrix-usage.json', modMatrix);
  
  console.log('✅ Discovery complete. Review analysis/ directory.');
}
```

#### `src/scripts/deepmind-validate-csv.ts`
```typescript
/**
 * Validates existing parameter CSV against hardware
 * Reports discrepancies for manual review
 */

async function main() {
  const dm = await connectDeepMind();
  const csvParams = await loadCSV('src/drivers/deepmind/nrpn-params.csv');
  
  const issues = [];
  
  for (const param of csvParams) {
    const result = await validateParameter(dm, param);
    if (!result.matchesDoc) {
      issues.push({
        param: param.name,
        expected: param.range,
        actual: result.actualRange,
      });
    }
  }
  
  if (issues.length > 0) {
    console.log(`⚠️  Found ${issues.length} discrepancies:`);
    for (const issue of issues) {
      console.log(`  ${issue.param}: expected ${issue.expected}, got ${issue.actual}`);
    }
  } else {
    console.log('✅ All parameters validated successfully');
  }
}
```

### Enrichment Workflow

1. **Start with manual CSV** (from documentation)
   ```csv
   msb,lsb,param_name,type,range_min,range_max,category,notes
   0,45,vcf.lfo.depth,continuous,0,255,filter,
   0,46,vcf.lfo.select,discrete,0,1,filter,LFO 1 or LFO 2
   ```

2. **Run discovery script** (with hardware)
   ```bash
   npm run deepmind:discover
   ```

3. **Review validation results**
   ```csv
   param_name,doc_range,actual_range,match,issues
   vcf.lfo.depth,0-255,0-255,true,
   vcf.lfo.select,0-1,0-1,true,
   polyphony.mode,0-12,0-8,false,Manual says 0-12 but synth only accepts 0-8
   ```

4. **Update CSV with findings**
   - Fix range errors
   - Add discovered discrete values
   - Annotate with actual behavior

5. **Regenerate TypeScript** (from enriched CSV)
   ```bash
   npm run generate:param-map
   ```

### Benefits

✅ **Catches documentation errors** - Manuals have typos/omissions
✅ **Validates implementation** - Confirms NRPN encoding works correctly
✅ **Discovers hidden features** - Finds undocumented parameters/values
✅ **Tests SysEx protocol** - Validates bulk dump format early
✅ **Builds confidence** - Know your mappings are correct before complex features

### Risks & Mitigations

**Risk:** Discovery script could corrupt preset data  
**Mitigation:** 
- Backup all presets via SysEx dump first
- Work on a single "test" preset slot
- Add safety checks (validate writes before continuing)

**Risk:** Takes significant time (400+ params × multiple tests)  
**Mitigation:**
- Run overnight or in background
- Prioritize critical parameters first
- Sample validation (test every 10th parameter first)

**Risk:** Hardware differences (firmware versions)  
**Mitigation:**
- Document firmware version used for discovery
- Re-validate when firmware updates available
- Note any version-specific behavior

## Test Fixture Generation from Real Hardware

Test fixtures are real-world data samples captured from actual hardware that serve as "ground truth" for unit tests. Instead of using synthetic test data, capture actual presets from the DeepMind to validate encode/decode logic.

### Capture Process

#### Fixture Capture Script

```typescript
// src/scripts/deepmind-capture-fixtures.ts

async function capturePresetFixtures(midiPort: HardwareMidiPort): Promise<void> {
  const fixtures = [];
  
  // Capture a variety of factory presets covering different features
  const interestingPresets = [
    { slot: 1, name: 'Init Program' },      // Basic init sound - baseline
    { slot: 50, name: 'Fat Brass' },        // Uses layers (DM12)
    { slot: 100, name: 'Poly Arp' },        // Uses arpeggiator
    { slot: 200, name: 'Heavy Bass' },      // Complex modulation matrix
    { slot: 300, name: 'Pad with FX' },     // Effects parameters
    { slot: 400, name: 'Sequenced Lead' },  // Sequencer data
  ];
  
  for (const preset of interestingPresets) {
    console.log(`Capturing preset ${preset.slot}: ${preset.name}...`);
    
    // Load preset on hardware
    await loadPreset(midiPort, preset.slot);
    await delay(200);  // Let preset settle
    
    // Request SysEx dump
    const sysexDump = await requestPresetDump(midiPort);
    
    // Save raw SysEx as binary file
    await fs.writeFile(
      `test/fixtures/deepmind/preset-${String(preset.slot).padStart(3, '0')}.syx`,
      Buffer.from(sysexDump)
    );
    
    // Parse and save as JSON for debugging/inspection
    const parsed = parsePresetDump(sysexDump);
    await fs.writeFile(
      `test/fixtures/deepmind/preset-${String(preset.slot).padStart(3, '0')}.json`,
      JSON.stringify(parsed, null, 2)
    );
    
    fixtures.push({
      slot: preset.slot,
      name: preset.name,
      sysexFile: `preset-${String(preset.slot).padStart(3, '0')}.syx`,
      jsonFile: `preset-${String(preset.slot).padStart(3, '0')}.json`,
      metadata: {
        capturedAt: new Date().toISOString(),
        firmwareVersion: await getFirmwareVersion(midiPort),
      },
    });
  }
  
  // Save index file
  await fs.writeFile(
    'test/fixtures/deepmind/index.json',
    JSON.stringify(fixtures, null, 2)
  );
  
  console.log(`✅ Captured ${fixtures.length} preset fixtures`);
}
```

#### What Gets Captured

Each fixture includes:

**Raw SysEx Binary** (`preset-001.syx`):
```
F0 00 20 32 00 01 06 02 [~1KB of preset data] F7
```

**Parsed JSON** (`preset-001.json`):
```json
{
  "slot": 1,
  "name": "Init Program",
  "firmware": "1.2.0",
  "parameters": {
    "osc1.waveform": 0,
    "osc1.pitch": 128,
    "osc2.waveform": 0,
    "osc2.pitch": 128,
    "filter.cutoff": 255,
    "filter.resonance": 0,
    "vcf.env.attack": 0,
    "vcf.env.decay": 64,
    "vcf.env.sustain": 128,
    "vcf.env.release": 64
  },
  "modulationMatrix": [
    { "source": "none", "destination": "none", "amount": 0 }
  ],
  "effects": {
    "type": "none",
    "params": {}
  }
}
```

### Using Fixtures in Tests

#### Test 1: SysEx Parsing Validation
```typescript
// test/drivers/deepmind/preset.test.ts

describe('DeepMind Preset Parser', () => {
  it('should parse factory preset 1 (Init Program) correctly', async () => {
    // Load captured fixture
    const sysexData = await fs.readFile('test/fixtures/deepmind/preset-001.syx');
    const expectedJson = await fs.readJSON('test/fixtures/deepmind/preset-001.json');
    
    // Parse the SysEx
    const parsed = parsePresetDump(sysexData);
    
    // Validate against captured JSON
    expect(parsed.name).toBe(expectedJson.name);
    expect(parsed.parameters['filter.cutoff']).toBe(expectedJson.parameters['filter.cutoff']);
    expect(parsed.parameters['osc1.waveform']).toBe(expectedJson.parameters['osc1.waveform']);
  });
  
  it('should handle all captured factory presets without errors', async () => {
    const fixtures = await fs.readJSON('test/fixtures/deepmind/index.json');
    
    for (const fixture of fixtures) {
      const sysex = await fs.readFile(`test/fixtures/deepmind/${fixture.sysexFile}`);
      
      // Should parse without throwing
      expect(() => parsePresetDump(sysex)).not.toThrow();
    }
  });
});
```

#### Test 2: Round-Trip Encoding
```typescript
describe('DeepMind Preset Encoding', () => {
  it('should round-trip encode/decode preset 1', async () => {
    // Load original SysEx from fixture
    const originalSysex = await fs.readFile('test/fixtures/deepmind/preset-001.syx');
    
    // Decode it
    const decoded = parsePresetDump(originalSysex);
    
    // Re-encode it
    const reencoded = encodePresetDump(decoded);
    
    // Should produce identical SysEx (validates encoding logic)
    expect(reencoded).toEqual(originalSysex);
  });
  
  it('should correctly encode parameter modifications', async () => {
    const originalSysex = await fs.readFile('test/fixtures/deepmind/preset-001.syx');
    const preset = parsePresetDump(originalSysex);
    
    // Modify a parameter
    preset.parameters['filter.cutoff'] = 200;
    
    // Re-encode
    const modified = encodePresetDump(preset);
    
    // Parse back
    const reparsed = parsePresetDump(modified);
    
    // Should have the new value
    expect(reparsed.parameters['filter.cutoff']).toBe(200);
    
    // Everything else should be unchanged
    expect(reparsed.parameters['osc1.waveform']).toBe(preset.parameters['osc1.waveform']);
  });
});
```

#### Test 3: Parameter Normalization
```typescript
describe('DeepMind Parameter Normalization', () => {
  it('should normalize filter cutoff correctly', async () => {
    const preset = await fs.readJSON('test/fixtures/deepmind/preset-001.json');
    
    // Preset has filter cutoff at max (255)
    const rawValue = preset.parameters['filter.cutoff'];
    expect(rawValue).toBe(255);
    
    // Should normalize to 1.0
    const normalized = normalizeParameter('filter.cutoff', rawValue);
    expect(normalized).toBe(1.0);
    
    // Should denormalize back to original
    const denormalized = denormalizeParameter('filter.cutoff', normalized);
    expect(denormalized).toBe(255);
  });
  
  it('should handle bipolar parameters correctly', async () => {
    const preset = await fs.readJSON('test/fixtures/deepmind/preset-200.json');
    
    // Preset has portamento balance at center (128 = zero for bipolar)
    const rawValue = preset.parameters['osc.portamento.balance'];
    expect(rawValue).toBe(128);
    
    // Should normalize to 0.0 (center of bipolar -1.0 to +1.0 range)
    const normalized = normalizeParameter('osc.portamento.balance', rawValue);
    expect(normalized).toBe(0.0);
    
    // Test negative extreme (0 → -1.0)
    expect(normalizeParameter('osc.portamento.balance', 0)).toBe(-1.0);
    
    // Test positive extreme (255 → +1.0)
    expect(normalizeParameter('osc.portamento.balance', 255)).toBe(1.0);
  });
});
```

#### Test 4: Modulation Matrix
```typescript
describe('DeepMind Modulation Matrix', () => {
  it('should parse preset 200 modulation routings', async () => {
    // Preset 200 is known to have complex mod matrix
    const preset = await fs.readJSON('test/fixtures/deepmind/preset-200.json');
    
    // Validate specific mod routing captured from hardware
    expect(preset.modulationMatrix[0]).toEqual({
      source: 'LFO1',
      destination: 'Pitch',
      amount: 64,
    });
    
    expect(preset.modulationMatrix[1]).toEqual({
      source: 'Envelope2',
      destination: 'Cutoff',
      amount: 100,
    });
  });
});
```

## Live Synth State Query: `get_current_state` Tool

### Purpose
Enable the MCP server (and AI assistant) to query the current state of all synth parameters, providing a complete, real-time snapshot of the patch loaded on the hardware. This empowers smarter patch editing, validation, and regression testing.

### API
```ts
// Example MCP tool signature
get_current_state(): Promise<PatchState>
// PatchState: { [paramName: string]: number | string | boolean }
```

### Implementation
- For synths supporting bulk parameter queries (SysEx dump, NRPN bulk read, etc.), implement a driver method that requests all parameter values and parses the response into a PatchState object.
- For synths with only individual parameter reads, iterate over the parameter map and query each value (rate-limited to avoid MIDI bandwidth issues).
- For synths with no read capability, return a stub PatchState (e.g., last written values, or an empty object) and set a flag indicating the state is not live.

### Benefits
- Enables AI-driven patch editing with full context, reducing risk of overwriting user tweaks.
- Supports regression tests and patch validation against real hardware.
- Allows for smarter UI/assistant workflows (e.g., diffing, undo, patch recall).

### Fallback Strategies
- If a synth cannot support live state queries, the tool should:
  - Return a stub PatchState with a `live: false` flag.
  - Optionally warn the user/assistant that edits may be lossy or incomplete.
  - Consider caching last written values for best-effort recall.

### Risks & Limitations
- Some synths may not support parameter reads at all, or may only support partial reads.
- Bulk queries may be slow or bandwidth-intensive; rate limiting and caching are recommended.
- Always document the capabilities and limitations per synth in the driver and MCP resource docs.

---

## Implementation Plan

### Phase 1: Expose Existing Capabilities (Low Effort, High Value)
- [x] Add `set_parameters` MCP tool (wraps existing `setParams()`)
- [x] Enhance param map resources with category info
- [x] Document bulk operation patterns for LLM

**Estimated Effort:** 2-4 hours  
**Value:** Enables efficient multi-parameter updates today

### Phase 2: DeepMind Basic Support (Medium Effort)
- [x] Map all 400+ NRPN parameters
- [x] Implement DeepMindDriver with standard NRPN sends
- [x] Add modulation matrix mappings (8×16)
- [x] Effect parameter support with type switching
- [x] Basic layer addressing (DM12)

**Estimated Effort:** 20-40 hours (mostly parameter mapping)  
**Value:** Full DeepMind control via existing MCP tools

### Phase 3: Performance Optimization (Medium Effort)
- [x] Parameter value caching
- [x] Bulk SysEx protocol implementation
- [x] MIDI bandwidth throttling/prioritization
- [x] Smart batching (group related params)

**Estimated Effort:** 10-20 hours  
**Value:** Faster preset loading, reduced MIDI congestion

### Phase 4: Advanced Features (Future)
- [ ] Preset interdependency warnings
- [ ] Category-filtered resources
- [ ] Advanced layer management
- [ ] Mod matrix visualization/discovery tools

**Estimated Effort:** Ongoing  
**Value:** Enhanced user experience, better LLM guidance

## Key Design Decisions

### Keep Specialized Tools
**Decision:** Do NOT deprecate `set_modulation`, `set_synth_feature`, etc.

**Rationale:**
- They express clear intent to the LLM
- Better than generic `set_parameter` for common operations
- `set_parameters` supplements, doesn't replace them
- LLM can choose appropriate tool for context

### Parameter Name Resolution
**Decision:** Do NOT add fuzzy parameter name matching.

**Rationale:**
- LLM already maps "filter cutoff" → "filter.cutoff" reliably
- Adds complexity without clear benefit
- Exact matching is more predictable and debuggable

### State Tracking
**Decision:** Start WITHOUT state tracking. Add only if clearly needed.

**Rationale:**
- Current stateless design is simpler and more reliable
- Synths maintain their own state
- Parameter caching is different from full state tracking
- Adds complexity for questionable benefit

### Layer Addressing (DeepMind 12)
**Decision:** TBD - prototype both approaches:
1. Separate synth instances: `deepmind12-layer1`, `deepmind12-layer2`
2. Layer parameter: `setParam('filter.cutoff', 0.5, { layer: 1 })`

**Test criteria:**
- Which is more intuitive for LLM?
- Which handles global vs per-layer params better?
- Which fits existing architecture with minimal changes?

## Behringer DeepMind 6/12 Implementation Plan

### Parameter Scale
- **400+ NRPN parameters**: Oscillators, filters, envelopes, LFOs, effects, mod matrix
- **8×16 modulation matrix**: 128 possible mod routings (vs MicroFreak's 5×7 = 35)
- **2 independent layers**: DeepMind 12 only - each layer is a full synth voice
- **5 effect types**: Each with ~10 parameters (Chorus, Delay, Reverb, etc.)
- **Per-voice parameters**: Some parameters apply per-voice in paraphonic mode

### DeepMind SysEx Capabilities

The DeepMind supports efficient bulk parameter operations:

```
Bulk Parameter Dump (Request):
F0 00 20 32 00 01 06 02 F7

Bulk Parameter Dump (Response):
F0 00 20 32 00 01 06 02 [~1KB of param data] F7

Parameter Write (Multiple params):
F0 00 20 32 00 01 06 03 [param blocks] F7
```

**Benefits:**
- Load/save entire preset: 1 SysEx message instead of 400+ NRPN messages
- Bulk parameter updates: Group changes into ~10-20 messages
- Significantly faster preset switching

**Implementation Priority:**
1. ✅ Basic NRPN parameter control (individual params)
2. ✅ Modulation matrix NRPN mappings
3. ✅ Effect parameter control
4. ⚠️ Layer addressing (DM12 only)
5. ⚠️ Bulk SysEx read/write
6. ⚠️ Parameter caching

### Driver Architecture

```typescript
class DeepMindDriver implements SynthAdapter {
  private paramCache = new Map<string, number>();
  private layerCount: 1 | 2;  // DM6=1, DM12=2
  
  // Use bulk SysEx when updating many parameters
  async setParams(settings: ParamSetting[]): Promise<ApplyResult> {
    if (settings.length > 10) {
      return this.bulkSysExUpdate(settings);
    }
    return this.individualNrpnUpdate(settings);
  }
  
  private async bulkSysExUpdate(settings: ParamSetting[]): Promise<ApplyResult> {
    // Encode params into SysEx bulk format
    // Send via midiPort.sendSysEx()
  }
}
```

### DeepMind-Specific Challenges

1. **Layer Management** (DM12)
   - Option A: Prefix params with layer: `layer1.filter.cutoff`
   - Option B: Add layer field to ParamSetting
   - Option C: Treat as separate synths: `deepmind12-layer1`, `deepmind12-layer2`

2. **Effect Parameters**
   - Effects are global (not per-layer)
   - 5 effect types, each with different parameter sets
   - Need feature switching: `set_synth_feature("effectType", "Chorus")` changes available effect params

3. **Modulation Matrix Scale**
   - 128 possible routings (8 sources × 16 destinations)
   - Current `set_modulation` tool works but documentation needs updating
   - Consider adding `list_mod_sources` and `list_mod_destinations` tools

4. **Parameter Caching Critical**
   - 400+ parameters = potential for many redundant sends
   - Implement cache with bypass for critical real-time params
   - Clear cache on preset load/hardware disconnect

### Testing Strategy Without Hardware

1. **MIDI Message Validation**
   - Unit tests for NRPN encoding (MSB/LSB splitting)
   - Validate SysEx message structure
   - Test parameter normalization (0.0-1.0 → NRPN 0-16383)

2. **Mock MIDI Port**
   - Capture sent messages
   - Verify correct addressing and values
   - Test bulk vs individual sending logic

3. **Parameter Map Completeness**
   - Document all 400+ parameters from manual
   - Map to NRPN addresses
   - Add descriptions and sound design tips

4. **Layer Addressing**
   - Test parameter routing to correct layer
   - Validate global vs per-layer parameters

## Parameter Discovery & Validation (With Hardware)

Once hardware is available, runtime discovery and validation can significantly improve implementation quality and catch documentation errors.

### Discovery Capabilities

#### 1. SysEx Preset Dump Analysis
The most valuable discovery technique:

```typescript
// Request full preset dump via SysEx
async function analyzePresetStructure(midiPort: HardwareMidiPort): Promise<void> {
  // Send: F0 00 20 32 00 01 06 02 F7 (request bulk dump)
  const dump = await midiPort.requestSysEx([0xF0, 0x00, 0x20, 0x32, 0x00, 0x01, 0x06, 0x02, 0xF7]);
  
  // Analyze:
  // - Total size (~1KB expected)
  // - Parameter layout (sequential? grouped by category?)
  // - Checksum/validation bytes
  // - Compare multiple presets to identify parameter positions
}
```

**Discoveries:**
- Actual parameter order in memory
- Parameter byte sizes (7-bit? 14-bit? packed?)
- Which parameters are stored vs computed
- Preset structure for efficient bulk operations

#### 2. Parameter Range Validation
Systematically test documented ranges against actual hardware behavior:

```typescript
async function validateParameter(
  param: { msb: number; lsb: number; name: string },
  docRange: [number, number]
): Promise<ValidationResult> {
  // Send boundary values
  await setNRPN(param.msb, param.lsb, docRange[0]);  // Min
  await delay(50);
  await setNRPN(param.msb, param.lsb, docRange[1]);  // Max
  await delay(50);
  await setNRPN(param.msb, param.lsb, Math.floor((docRange[0] + docRange[1]) / 2));  // Mid
  
  // Request preset dump after each to confirm value was accepted
  const dump = await requestPresetDump();
  
  return {
    param: param.name,
    actualRange: extractRangeFromDump(dump),
    matchesDoc: actualRange === docRange,
  };
}
```

**Discoveries:**
- Actual vs documented ranges (catch manual errors)
- Quantization (does parameter use all 256/16384 values or is it coarse?)
- Default/init values
- Read-only parameters (value doesn't change)

#### 3. Discrete Parameter Discovery
For parameters documented as "see list" with no details:

```typescript
async function discoverDiscreteValues(
  msb: number,
  lsb: number,
  name: string
): Promise<number[]> {
  const validValues = [];
  
  for (let i = 0; i < 256; i++) {
    await setNRPN(msb, lsb, i);
    await delay(50);
    
    const dump = await requestPresetDump();
    const storedValue = extractParamValue(dump, msb, lsb);
    
    // If stored value differs from sent value, we hit the ceiling
    if (storedValue !== i) {
      break;
    }
    
    validValues.push(i);
  }
  
  return validValues;
}
```

**Discoveries:**
- Actual number of valid options (e.g., "0-12" might really be 0-7)
- Whether values are sequential or have gaps
- Hidden/undocumented options

#### 4. Bipolar Parameter Validation
Confirm bipolar encoding (-128 to +127 → 0 to 255):

```typescript
async function validateBipolarEncoding(param: BipolarParam): Promise<void> {
  // Test zero point
  await setNRPN(param.msb, param.lsb, 128);
  const zeroValue = await readbackValue(param);
  
  // Test negative extreme
  await setNRPN(param.msb, param.lsb, 0);
  const minValue = await readbackValue(param);
  
  // Test positive extreme  
  await setNRPN(param.msb, param.lsb, 255);
  const maxValue = await readbackValue(param);
  
  console.log(`Bipolar encoding for ${param.name}:`);
  console.log(`  Zero at: ${zeroValue} (expected: 128)`);
  console.log(`  Min: ${minValue}, Max: ${maxValue}`);
}
```

**Discoveries:**
- Confirm zero point (0, 128, or other?)
- Validate symmetric range
- Check if center detent exists

#### 5. Modulation Matrix Analysis
Analyze factory presets to understand modulation routing patterns:

```typescript
async function analyzeModRoutings(): Promise<ModRoutingDatabase> {
  const routings = new Map<string, PresetUsage[]>();
  
  // Sample factory presets
  for (const slot of [1, 10, 20, 30, 40, 50, 100, 200, 300, 400, 500]) {
    await loadPreset(slot);
    await delay(100);
    
    const dump = await requestPresetDump();
    const modMatrix = extractModMatrix(dump);
    
    // Record which presets use which routings
    for (const routing of modMatrix) {
      const key = `${routing.source}->${routing.destination}`;
      if (!routings.has(key)) {
        routings.set(key, []);
      }
      routings.get(key)!.push({ slot, amount: routing.amount });
    }
  }
  
  return routings;
}
```

**Discoveries:**
- Common modulation patterns in factory presets
- Typical modulation amounts
- Which sources/destinations are used most
- Inspiration for sound design tips

### Discovery Scripts

Create utility scripts for runtime validation:

#### `src/scripts/deepmind-discover-params.ts`
```typescript
/**
 * DeepMind Parameter Discovery Tool
 * 
 * Validates and enriches parameter data by testing against actual hardware.
 * Outputs enriched CSV with validated ranges and discovered features.
 */

async function main() {
  const dm = await connectDeepMind();
  
  console.log('Phase 1: Preset Structure Analysis');
  const structure = await analyzePresetStructure(dm);
  await writeJSON('analysis/preset-structure.json', structure);
  
  console.log('Phase 2: Parameter Range Validation');
  const validation = await validateAllParameters(dm, PARAM_DATABASE);
  await writeCSV('analysis/param-validation.csv', validation);
  
  console.log('Phase 3: Discrete Parameter Discovery');
  const discrete = await discoverAllDiscreteParams(dm);
  await writeCSV('analysis/discrete-params.csv', discrete);
  
  console.log('Phase 4: Bipolar Encoding Validation');
  const bipolar = await validateBipolarParams(dm, BIPOLAR_PARAMS);
  await writeCSV('analysis/bipolar-validation.csv', bipolar);
  
  console.log('Phase 5: Modulation Matrix Analysis');
  const modMatrix = await analyzeModRoutings(dm);
  await writeJSON('analysis/mod-matrix-usage.json', modMatrix);
  
  console.log('✅ Discovery complete. Review analysis/ directory.');
}
```

#### `src/scripts/deepmind-validate-csv.ts`
```typescript
/**
 * Validates existing parameter CSV against hardware
 * Reports discrepancies for manual review
 */

async function main() {
  const dm = await connectDeepMind();
  const csvParams = await loadCSV('src/drivers/deepmind/nrpn-params.csv');
  
  const issues = [];
  
  for (const param of csvParams) {
    const result = await validateParameter(dm, param);
    if (!result.matchesDoc) {
      issues.push({
        param: param.name,
        expected: param.range,
        actual: result.actualRange,
      });
    }
  }
  
  if (issues.length > 0) {
    console.log(`⚠️  Found ${issues.length} discrepancies:`);
    for (const issue of issues) {
      console.log(`  ${issue.param}: expected ${issue.expected}, got ${issue.actual}`);
    }
  } else {
    console.log('✅ All parameters validated successfully');
  }
}
```

### Enrichment Workflow

1. **Start with manual CSV** (from documentation)
   ```csv
   msb,lsb,param_name,type,range_min,range_max,category,notes
   0,45,vcf.lfo.depth,continuous,0,255,filter,
   0,46,vcf.lfo.select,discrete,0,1,filter,LFO 1 or LFO 2
   ```

2. **Run discovery script** (with hardware)
   ```bash
   npm run deepmind:discover
   ```

3. **Review validation results**
   ```csv
   param_name,doc_range,actual_range,match,issues
   vcf.lfo.depth,0-255,0-255,true,
   vcf.lfo.select,0-1,0-1,true,
   polyphony.mode,0-12,0-8,false,Manual says 0-12 but synth only accepts 0-8
   ```

4. **Update CSV with findings**
   - Fix range errors
   - Add discovered discrete values
   - Annotate with actual behavior

5. **Regenerate TypeScript** (from enriched CSV)
   ```bash
   npm run generate:param-map
   ```

### Benefits

✅ **Catches documentation errors** - Manuals have typos/omissions
✅ **Validates implementation** - Confirms NRPN encoding works correctly
✅ **Discovers hidden features** - Finds undocumented parameters/values
✅ **Tests SysEx protocol** - Validates bulk dump format early
✅ **Builds confidence** - Know your mappings are correct before complex features

### Risks & Mitigations

**Risk:** Discovery script could corrupt preset data  
**Mitigation:** 
- Backup all presets via SysEx dump first
- Work on a single "test" preset slot
- Add safety checks (validate writes before continuing)

**Risk:** Takes significant time (400+ params × multiple tests)  
**Mitigation:**
- Run overnight or in background
- Prioritize critical parameters first
- Sample validation (test every 10th parameter first)

**Risk:** Hardware differences (firmware versions)  
**Mitigation:**
- Document firmware version used for discovery
- Re-validate when firmware updates available
- Note any version-specific behavior

## Test Fixture Generation from Real Hardware

Test fixtures are real-world data samples captured from actual hardware that serve as "ground truth" for unit tests. Instead of using synthetic test data, capture actual presets from the DeepMind to validate encode/decode logic.

### Capture Process

#### Fixture Capture Script

```typescript
// src/scripts/deepmind-capture-fixtures.ts

async function capturePresetFixtures(midiPort: HardwareMidiPort): Promise<void> {
  const fixtures = [];
  
  // Capture a variety of factory presets covering different features
  const interestingPresets = [
    { slot: 1, name: 'Init Program' },      // Basic init sound - baseline
    { slot: 50, name: 'Fat Brass' },        // Uses layers (DM12)
    { slot: 100, name: 'Poly Arp' },        // Uses arpeggiator
    { slot: 200, name: 'Heavy Bass' },      // Complex modulation matrix
    { slot: 300, name: 'Pad with FX' },     // Effects parameters
    { slot: 400, name: 'Sequenced Lead' },  // Sequencer data
  ];
  
  for (const preset of interestingPresets) {
    console.log(`Capturing preset ${preset.slot}: ${preset.name}...`);
    
    // Load preset on hardware
    await loadPreset(midiPort, preset.slot);
    await delay(200);  // Let preset settle
    
    // Request SysEx dump
    const sysexDump = await requestPresetDump(midiPort);
    
    // Save raw SysEx as binary file
    await fs.writeFile(
      `test/fixtures/deepmind/preset-${String(preset.slot).padStart(3, '0')}.syx`,
      Buffer.from(sysexDump)
    );
    
    // Parse and save as JSON for debugging/inspection
    const parsed = parsePresetDump(sysexDump);
    await fs.writeFile(
      `test/fixtures/deepmind/preset-${String(preset.slot).padStart(3, '0')}.json`,
      JSON.stringify(parsed, null, 2)
    );
    
    fixtures.push({
      slot: preset.slot,
      name: preset.name,
      sysexFile: `preset-${String(preset.slot).padStart(3, '0')}.syx`,
      jsonFile: `preset-${String(preset.slot).padStart(3, '0')}.json`,
      metadata: {
        capturedAt: new Date().toISOString(),
        firmwareVersion: await getFirmwareVersion(midiPort),
      },
    });
  }
  
  // Save index file
  await fs.writeFile(
    'test/fixtures/deepmind/index.json',
    JSON.stringify(fixtures, null, 2)
  );
  
  console.log(`✅ Captured ${fixtures.length} preset fixtures`);
}
```

#### What Gets Captured

Each fixture includes:

**Raw SysEx Binary** (`preset-001.syx`):
```
F0 00 20 32 00 01 06 02 [~1KB of preset data] F7
```

**Parsed JSON** (`preset-001.json`):
```json
{
  "slot": 1,
  "name": "Init Program",
  "firmware": "1.2.0",
  "parameters": {
    "osc1.waveform": 0,
    "osc1.pitch": 128,
    "osc2.waveform": 0,
    "osc2.pitch": 128,
    "filter.cutoff": 255,
    "filter.resonance": 0,
    "vcf.env.attack": 0,
    "vcf.env.decay": 64,
    "vcf.env.sustain": 128,
    "vcf.env.release": 64
  },
  "modulationMatrix": [
    { "source": "none", "destination": "none", "amount": 0 }
  ],
  "effects": {
    "type": "none",
    "params": {}
  }
}
```

### Using Fixtures in Tests

#### Test 1: SysEx Parsing Validation
```typescript
// test/drivers/deepmind/preset.test.ts

describe('DeepMind Preset Parser', () => {
  it('should parse factory preset 1 (Init Program) correctly', async () => {
    // Load captured fixture
    const sysexData = await fs.readFile('test/fixtures/deepmind/preset-001.syx');
    const expectedJson = await fs.readJSON('test/fixtures/deepmind/preset-001.json');
    
    // Parse the SysEx
    const parsed = parsePresetDump(sysexData);
    
    // Validate against captured JSON
    expect(parsed.name).toBe(expectedJson.name);
    expect(parsed.parameters['filter.cutoff']).toBe(expectedJson.parameters['filter.cutoff']);
    expect(parsed.parameters['osc1.waveform']).toBe(expectedJson.parameters['osc1.waveform']);
  });
  
  it('should handle all captured factory presets without errors', async () => {
    const fixtures = await fs.readJSON('test/fixtures/deepmind/index.json');
    
    for (const fixture of fixtures) {
      const sysex = await fs.readFile(`test/fixtures/deepmind/${fixture.sysexFile}`);
      
      // Should parse without throwing
      expect(() => parsePresetDump(sysex)).not.toThrow();
    }
  });
});
```

#### Test 2: Round-Trip Encoding
```typescript
describe('DeepMind Preset Encoding', () => {
  it('should round-trip encode/decode preset 1', async () => {
    // Load original SysEx from fixture
    const originalSysex = await fs.readFile('test/fixtures/deepmind/preset-001.syx');
    
    // Decode it
    const decoded = parsePresetDump(originalSysex);
    
    // Re-encode it
    const reencoded = encodePresetDump(decoded);
    
    // Should produce identical SysEx (validates encoding logic)
    expect(reencoded).toEqual(originalSysex);
  });
  
  it('should correctly encode parameter modifications', async () => {
    const originalSysex = await fs.readFile('test/fixtures/deepmind/preset-001.syx');
    const preset = parsePresetDump(originalSysex);
    
    // Modify a parameter
    preset.parameters['filter.cutoff'] = 200;
    
    // Re-encode
    const modified = encodePresetDump(preset);
    
    // Parse back
    const reparsed = parsePresetDump(modified);
    
    // Should have the new value
    expect(reparsed.parameters['filter.cutoff']).toBe(200);
    
    // Everything else should be unchanged
    expect(reparsed.parameters['osc1.waveform']).toBe(preset.parameters['osc1.waveform']);
  });
});
```

#### Test 3: Parameter Normalization
```typescript
describe('DeepMind Parameter Normalization', () => {
  it('should normalize filter cutoff correctly', async () => {
    const preset = await fs.readJSON('test/fixtures/deepmind/preset-001.json');
    
    // Preset has filter cutoff at max (255)
    const rawValue = preset.parameters['filter.cutoff'];
    expect(rawValue).toBe(255);
    
    // Should normalize to 1.0
    const normalized = normalizeParameter('filter.cutoff', rawValue);
    expect(normalized).toBe(1.0);
    
    // Should denormalize back to original
    const denormalized = denormalizeParameter('filter.cutoff', normalized);
    expect(denormalized).toBe(255);
  });
  
  it('should handle bipolar parameters correctly', async () => {
    const preset = await fs.readJSON('test/fixtures/deepmind/preset-200.json');
    
    // Preset has portamento balance at center (128 = zero for bipolar)
    const rawValue = preset.parameters['osc.portamento.balance'];
    expect(rawValue).toBe(128);
    
    // Should normalize to 0.0 (center of bipolar -1.0 to +1.0 range)
    const normalized = normalizeParameter('osc.portamento.balance', rawValue);
    expect(normalized).toBe(0.0);
    
    // Test negative extreme (0 → -1.0)
    expect(normalizeParameter('osc.portamento.balance', 0)).toBe(-1.0);
    
    // Test positive extreme (255 → +1.0)
    expect(normalizeParameter('osc.portamento.balance', 255)).toBe(1.0);
  });
});
```

#### Test 4: Modulation Matrix
```typescript
describe('DeepMind Modulation Matrix', () => {
  it('should parse preset 200 modulation routings', async () => {
    // Preset 200 is known to have complex mod matrix
    const preset = await fs.readJSON('test/fixtures/deepmind/preset-200.json');
    
    // Validate specific mod routing captured from hardware
    expect(preset.modulationMatrix[0]).toEqual({
      source: 'LFO1',
      destination: 'Pitch',
      amount: 64,
    });
    
    expect(preset.modulationMatrix[1]).toEqual({
      source: 'Envelope2',
      destination: 'Cutoff',
      amount: 100,
    });
  });
});
```

## Live Synth State Query: `get_current_state` Tool

### Purpose
Enable the MCP server (and AI assistant) to query the current state of all synth parameters, providing a complete, real-time snapshot of the patch loaded on the hardware. This empowers smarter patch editing, validation, and regression testing.

### API
```ts
// Example MCP tool signature
get_current_state(): Promise<PatchState>
// PatchState: { [paramName: string]: number | string | boolean }
```

### Implementation
- For synths supporting bulk parameter queries (SysEx dump, NRPN bulk read, etc.), implement a driver method that requests all parameter values and parses the response into a PatchState object.
- For synths with only individual parameter reads, iterate over the parameter map and query each value (rate-limited to avoid MIDI bandwidth issues).
- For synths with no read capability, return a stub PatchState (e.g., last written values, or an empty object) and set a flag indicating the state is not live.

### Benefits
- Enables AI-driven patch editing with full context, reducing risk of overwriting user tweaks.
- Supports regression tests and patch validation against real hardware.
- Allows for smarter UI/assistant workflows (e.g., diffing, undo, patch recall).

### Fallback Strategies
- If a synth cannot support live state queries, the tool should:
  - Return a stub PatchState with a `live: false` flag.
  - Optionally warn the user/assistant that edits may be lossy or incomplete.
  - Consider caching last written values for best-effort recall.

### Risks & Limitations
- Some synths may not support parameter reads at all, or may only support partial reads.
- Bulk queries may be slow or bandwidth-intensive; rate limiting and caching are recommended.
- Always document the capabilities and limitations per synth in the driver and MCP resource docs.

---