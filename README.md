# patchwork-deepmind

MCP server for the Behringer DeepMind 12 synthesizer. Gives AI agents real-time control over synth parameters via MIDI NRPN, plus edit-buffer snapshots via SysEx.

## Requirements

- Node.js >= 22
- DeepMind 12 connected via USB-MIDI
- macOS (uses native MIDI)

## Install

```bash
npm install patchwork-deepmind
```

## MCP client setup

Add to your MCP client config (Claude Desktop, VS Code, etc.):

```json
{
  "mcpServers": {
    "deepmind12": {
      "command": "npx",
      "args": ["patchwork-deepmind"]
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `set_param` | Set a parameter by name (normalized 0–1) |
| `set_params` | Batch-set multiple parameters in one call |
| `describe_param` | Look up a parameter's NRPN, range, and enum values |
| `describe_nrpn` | Search/list raw NRPN parameters |
| `snapshot_state` | Read current patch state via SysEx edit-buffer dump |
| `send_nrpn` | Send a raw NRPN message by number and value |

## Parameter guide skill (recommended)

The MCP tools give an agent the ability to control the synth, but not the knowledge of *what sounds good* — which parameters interact, what value ranges are musical, or how to approach building a specific type of sound.

The `skills/deepmind-parameter-guide/` folder is a portable agent skill that provides this. It's organized as a compact index with drill-down sections by synth area (oscillators, filter, envelopes, LFOs, effects, etc.), so an agent loads only the context it needs.

**To install the skill**, copy it into your project's `.claude/skills/` directory:

```bash
# From the cloned repo:
cp -r skills/deepmind-parameter-guide .claude/skills/

# Or from the installed npm package:
cp -r $(npm explore patchwork-deepmind -- pwd)/skills/deepmind-parameter-guide .claude/skills/
```

The skill is self-contained — no dependencies on this repo.

## Development

```bash
npm install
npm run build
npm test
```
