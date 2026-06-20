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
