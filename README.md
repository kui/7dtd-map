# 7DtD Map Renderer

Map renderer for 7 Day to Die.

- https://kui.github.io/7dtd-map/

## Build

1. Create 'local.json' at project root like:

```
{
 "vanillaDir": "/Users/<UserName>/Library/Application Support/Steam/steamapps/common/7 Days To Die/7DaysToDie.app"
}
```

2. Execute in your teminal:

```
npm run build
```

3. Copy all bundle worlds:

```
npx tsx ./tools/copy-map-files.ts
```

### Build: Font subset

To build ".subset.woff2", you need to require fonttools or docker. If you already have fonttools, run:

```
./tools/fonts/subset.sh
```

Or use docker wrapper:

```
./tools/fonts/subset-docker.sh
```

## Code lint

```
npm run lint
```

## Serve pages for development

```
npm run serve
```

Note: You need to use HTTPS for development or access it using "localhost" because 7dtd-map uses `navigator.storage` which requires "[Secure Contexts][]".

[Secure Contexts]: https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts
