# 7DtD Map Renderer

Map renderer for 7 Day to Die.

- https://kui.github.io/7dtd-map/

## Build

Linux, macOS, and Windows are supported.

1. Point the project at your installed copy of the game by creating a
   `tools/vanilla` link at the project root. The path appears in the task
   `sources` globs in `mise.toml`, so it must be a static project-local path,
   not a runtime config file. Pick the command for your OS:

   - **macOS / Linux** (symlink):

     ```
     ln -s "/Users/<UserName>/Library/Application Support/Steam/steamapps/common/7 Days To Die/7DaysToDie.app" tools/vanilla
     ```

     Linux Steam example:

     ```
     ln -s "$HOME/.local/share/Steam/steamapps/common/7 Days To Die" tools/vanilla
     ```

   - **Windows** (directory junction, no admin required). Run from the project
     root in `cmd.exe`:

     ```
     mklink /J tools\vanilla "C:\Program Files (x86)\Steam\steamapps\common\7 Days To Die"
     ```

     Or in PowerShell:

     ```
     New-Item -ItemType Junction -Path tools\vanilla -Target "C:\Program Files (x86)\Steam\steamapps\common\7 Days To Die"
     ```

2. Install [mise](https://mise.jdx.dev/). It installs the Node version pinned
   in `mise.toml` and runs the build tasks defined there.

3. Install dependencies and build:

   ```
   mise install
   npm ci
   mise run build
   ```

   On a second run each task skips itself when neither its source files nor
   the matched game files have changed since the last run.

## Code lint

```
npm run fix
```

## Serve pages for development

```
npm run serve
```

Note: You need to use HTTPS for development or access it using "localhost"
because 7dtd-map uses `navigator.storage` which requires
"[Secure Contexts][Secure Contexts]".

[Secure Contexts]: https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts
