# 7DtD Map Renderer

Map renderer for 7 Day to Die.

- https://kui.github.io/7dtd-map/

## Build

Linux, macOS, and Windows are supported.

1. Point the project at your installed copy of the game by creating a
   `tools/vanilla` link at the project root. The path is wired into `deno task`
   input-based caching, so it must be a static project-local path — not a
   runtime config file. Pick the command for your OS:

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

2. Execute in your terminal:

   ```
   deno task build
   ```

   On a second run the tasks declared in `deno.jsonc` skip themselves
   (`cached, inputs unchanged`) when neither the source TS nor the matched game
   files have changed.

## Code lint

```
deno task fix
```

## Serve pages for development

```
deno task serve
```

Note: You need to use HTTPS for development or access it using "localhost"
because 7dtd-map uses `navigator.storage` which requires
"[Secure Contexts][Secure Contexts]".

[Secure Contexts]: https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts
