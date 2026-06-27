# AGENTS.md

This file provides critical instructions for AI agents working on this
repository. Agents must read and follow these rules closely.

## Critical Rules

1. **Language**
   - **All generated artifacts written into the repository or GitHub must be in
     English.** This includes, but is not limited to: code comments,
     documentation (Markdown, JSDoc, etc.), commit messages, pull request
     titles/descriptions, GitHub issue titles/bodies, and review comments.
   - This rule applies regardless of the language used in the chat/prompt. For
     example, when an agent is instructed in Japanese to "open an issue", the
     issue itself must still be filed in English.

2. **Deno Version Management**
   - **Never run `deno upgrade`** in this project.
   - `deno` is managed by `mise` (see `mise.toml`).
   - To update Deno, modify `mise.toml` and run `mise install` instead.
   - Running `deno upgrade` directly can lead to version mismatches and
     unexpected behavior with mise.

3. **Fail Fast in `tools/`**
   - Code under `tools/` parses upstream game data files (prefab xmls,
     rwgmixer.xml, .tts/.nim blobs, etc.). When the schema drifts in a future
     game version, we want the build to break loudly.
   - **Throw on unknown data shapes; never silently drop or coerce.** Prefer
     explicit type guards that reject unrecognised entries with a descriptive
     `Error`, not lenient fall-through that returns an empty/default value.
   - Default to fail-fast over fail-safe in the tooling pipeline: a missing
     property, an unexpected XML element, or an unknown variant tag should
     surface as an exception that names the offending file/value, not as a
     hidden gap in the generated JSON.
   - This rule applies to `tools/` specifically. Runtime code under `src/`
     should prefer graceful degradation: missing JSON entries are tolerated via
     nullish-coalescing defaults so a partial dataset still produces a usable UI
     rather than crashing the page.

4. **Do Not Modify `public/old/` Directories**
   - Directories under `public/old/` (e.g., `a20/`, `a21/`, `v1.4/`, `v2.6/`)
     are frozen snapshots of previous major releases. They are self-contained.
   - **Do not edit files inside these old directories.** Do not apply refactors,
     renames, or style fixes to them.
   - The only exception is during a major version upgrade: copy the current
     system into a new `public/old/<version>/` directory, then edit `index.html`
     (or similar top-level files) within that new copy to update only the nav
     elements / version banner. No other edits to old snapshots are allowed.
