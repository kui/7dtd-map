# AGENTS.md

Rules for AI agents working on this repository.

## Critical Rules

1. **Language**
   - Everything written into the repository or GitHub must be in English:
     code comments, documentation, commit messages, PR titles/descriptions,
     issues, and review comments.
   - This holds regardless of the chat language. When asked in Japanese to
     "open an issue", file the issue in English.

2. **mise and Node Version Management**
   - mise is required. It pins the Node version and defines the build tasks
     (`mise run build`) in `mise.toml`.
   - Keep the set of tools contributors must install (outside `npm ci`)
     minimal. Prefer leaning on mise or Node over adding a new one. npm
     packages are covered by rule 4.
   - To update Node, modify `mise.toml`.
   - Assume contributors run commands in a mise-activated shell.

3. **Fail Fast in `tools/`**
   - Code under `tools/` parses upstream game data (prefab XMLs, rwgmixer.xml,
     .tts/.nim blobs, etc.). When the schema drifts in a future game version,
     the build must break loudly: throw a descriptive `Error` naming the
     offending file/value on any unknown shape, missing property, or unknown
     variant. Never silently drop, coerce, or default.
   - Runtime code under `src/` is the opposite: degrade gracefully. Tolerate
     missing JSON entries with nullish-coalescing defaults so a partial dataset
     still renders a usable page.

4. **Adding npm Dependencies**
   - Before hand-writing generic infrastructure (an HTTP server, a parser for a
     standard format, etc.), check whether a widely used package already does
     it. Choosing a package is fine; a hand-rolled version needs a reason.
   - Before adding a package, check and state in the PR: its latest release
     and commit dates, open issues about the features you rely on, weekly
     downloads compared with the main alternatives, and its transitive
     dependency count. Prefer the maintained, mainstream option; do not pick an
     unmaintained one because it is smaller.

5. **PR Descriptions State Only What Was Verified**
   - Mark a checklist item done, or claim a behavior ("handled by X",
     "returns 404"), only after running something that shows it: a command, a
     request, a test. Put what you ran in the Verification section.
   - If something was not verified, or is only partly met, say so explicitly
     instead of checking the box.
