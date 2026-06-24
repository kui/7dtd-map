# AGENTS.md

This file provides critical instructions for AI agents working on this
repository. Agents must read and follow these rules closely.

## Critical Rules

1. **Language**
   - **All generated comments and documentation must be written in English.**

2. **Deno Version Management**
   - **Never run `deno upgrade`** in this project.
   - `deno` is managed by `mise` (see `mise.toml`).
   - To update Deno, modify `mise.toml` and run `mise install` instead.
   - Running `deno upgrade` directly can lead to version mismatches and
     unexpected behavior with mise.

3. **Fail Fast in `tools/`**
   - Code under `tools/` parses upstream game data files (prefab xmls,
     rwgmixer.xml, .tts/.nim blobs, etc.). When the schema drifts in a
     future game version, we want the build to break loudly.
   - **Throw on unknown data shapes; never silently drop or coerce.** Prefer
     explicit type guards that reject unrecognised entries with a descriptive
     `Error`, not lenient fall-through that returns an empty/default value.
   - Default to fail-fast over fail-safe in the tooling pipeline: a missing
     property, an unexpected XML element, or an unknown variant tag should
     surface as an exception that names the offending file/value, not as a
     hidden gap in the generated JSON.
   - This rule applies to `tools/` specifically. Runtime code under `src/`
     can still degrade gracefully where appropriate (e.g. UI fallbacks).
