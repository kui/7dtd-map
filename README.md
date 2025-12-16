# 7DtD Map Renderer

Map renderer for 7 Day to Die.

- https://kui.github.io/7dtd-map/

## Requirements

- [Deno](https://deno.com/) (v2.5+)

## Build

1. Create 'local.json' at project root like:

```json
{
  "vanillaDir": "/Users/<UserName>/Library/Application Support/Steam/steamapps/common/7 Days To Die/7DaysToDie.app"
}
```

2. Execute in your terminal:

```bash
deno task build
```

3. Copy all bundle worlds:

```bash
deno run -A ./tools/copy-map-files.ts
```

### Build: Font subset

To build ".subset.woff2", you need to require fonttools or docker. If you already have fonttools, run:

```bash
./tools/fonts/subset.sh
```

Or use docker wrapper:

```bash
./tools/fonts/subset-docker.sh
```

## Code lint & Format

```bash
deno task lint
deno task fix
```

## Serve pages for development

```bash
deno task serve
```

Note: You need to use HTTPS for development or access it using "localhost" because 7dtd-map uses `navigator.storage` which requires "[Secure Contexts][Secure Contexts]".

[Secure Contexts]: https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts
