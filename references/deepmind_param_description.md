# DeepMind 12 — Parameter Description Capability

This MCP server exposes a `describe_param` tool so an assistant can discover **valid/eligible values** for a parameter *before* writing anything.

## Recommended Workflow

When working with the DeepMind 12, use these tools in sequence:

1. **`snapshot_state`** — Discover what parameters exist and their current values
   - Returns all available parameters with current raw/normalized values and labels
   - Use this first to see what's available on the synth
   - Shows current state but *not* all possible enum values

2. **`describe_param`** — Look up details for specific parameters
   - Get enum options (e.g., "What modulation sources are available?")
   - Check value ranges and data types
   - Find NRPN addresses if needed
   - Use when you need to know what values a parameter can be set to

3. **`set_params` or `set_param`** — Apply changes
   - Set multiple parameters efficiently in one call with `set_params`
   - Use normalized values (0.0–1.0) for all parameters
   - For enums, you can reference them by raw value (from describe_param)

## Tool: `describe_param`

**Input**

- `param` (string, required): Parameter name. Aliases are accepted (e.g., `vcf.cutoff` → `filter.cutoff`).

**Output (JSON)**

- `resolvedParam`: Canonical name used by the server.
- `paramSpec` (when the parameter is settable via NRPN; otherwise omitted):
	- `nrpn`: `{ msb, lsb }` (when settable via the curated NRPN param-spec table)
	- `rawMin`, `rawMax`: raw value bounds
	- `normalizedMin`, `normalizedMax`: normalized value bounds (typically 0..1)
- `decodedField` (when decodable from edit-buffer snapshots):
	- `offset`: byte offset in decoded edit-buffer payload
	- `kind`: `u8 | u7 | u14_be`
	- `notes`: provenance / discovery notes
- `enum` (when the parameter has a known value map):
	- `values`: array of `{ value, label }` entries

## Example

Query mod matrix source options:

```json
{ "param": "modMatrix.1.source" }
```

The response includes an `enum.values` list such as:

```json
{ "value": 7, "label": "LFO 1" }
```
