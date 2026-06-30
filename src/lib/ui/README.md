Small UI components that just work between the other components. Donot put here
any app specific components.

Modules under this directory MUST NOT carry page-specific domain knowledge (e.g.
element IDs, `data-*` keys, or feature lists tied to a particular page such as
`public/index.html`). Such code belongs next to the page it serves. For
`index.html` that means `src/index.ts` or `src/index/`.
