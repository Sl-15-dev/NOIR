# NOIR

A grayscale library with 155 live components across 10 categories. Browser-native HTML, CSS, and JavaScript; no application framework or build step.

## Run locally

Node.js 20 or later:

```sh
npm run dev
```

The server defaults to port 3000. Set `PORT` or use `npm run dev -- --port 8080`. No installation is needed to run the application. ES modules require HTTP; opening index.html directly will not load the catalog.

## Explore

- Browse, search, filter, and save components in this browser.
- Switch the entire library between light and dark; your preference persists. Initial appearance follows your system.
- Open a component to try its controls, test a narrow canvas, adjust motion speed, or pause CSS/Web Animations.
- Preview theme changes update component surfaces, text, borders, SVG, and canvas artwork together.
- Copy HTML, CSS, JavaScript, or a complete standalone example. Downloads bundle the selected appearance and both CSS palettes. Remove `data-theme` from an export to follow system appearance, or set it to `light` / `dark`.
- Press Ctrl/Cmd+K or / to search; use arrows and Enter to choose results.

## Catalog

UI essentials; navigation; forms and inputs; layouts and grids; text and typography; motion and interactions; backgrounds and effects; data display; feedback and overlays; mockups.

The latest 22 studies add six typography components, six backgrounds, five layouts, and five motion examples. Try **Physical spring**, **Layout flip grid**, **Elastic gesture**, **Drawn route**, **Shared indicator tabs**, **Moiré interference**, or **Adaptive bento**.

The removed page sections, full-page templates, discovery patterns, interactive figures, and playable diagrams are no longer part of the catalog or source modules.

## Direct reference studies

Eight original visual adaptations follow inspection of Board UI, Rare UI, and Motion UI's footer category. Try **Fused editorial toolbar**, **Selection cards**, **Commit date picker**, **Duration capsule**, **Type fall**, **Folio folder**, **Under-page footer**, and **Newsletter closing note**. They live within the existing categories; removed categories remain absent. The newsletter demonstrates local validation and confirmation without sending data.

## Development and checks

```sh
npm ci
npm run check
npm test
npm run test:browser
```

Browser tests use Chromium at `/usr/bin/chromium` by default. Set `CHROMIUM_PATH` to another Chromium executable if needed. Tests start a server on port 3100. The cloud executor may require elevated execution permission for local ports and browser processes.

The browser suite renders every component in both themes at 320px and 960px, checks runtime errors and horizontal overflow, and exercises library navigation, saved state, theme persistence, preview, downloads, and search. Focused interaction and reduced-motion regression tests cover repaired and new components.

## Source and theming

`dist/index.html`, `dist/style.css`, and `dist/app.js` define the library. `dist/catalog.js` is the central catalog, and `dist/catalog-studio.js` contains the motion studies; `dist/catalog-references.js` contains the eight direct reference studies. Every catalog entry exports its own markup, styles, and script; previews run in isolated iframes.

`dist/preview.js` prepares existing neutral colors as theme tokens and creates previews and standalone exports through the same path. New components use semantic tokens (`--bg`, `--surface`, `--surface-2`, `--text`, `--muted`, `--border`, `--accent`, `--on-accent`). Explicit light surfaces use inverse text tokens. Theme preparation preserves native color values and data attributes.

Modern browsers are required for CSS color-mix, native dialogs, Web Animations, and pointer events. Reduced motion is respected; timer-driven text updates and live charts have their own scripts. Content and metrics are illustrative.

## References and hosting

See [SOURCES.md](SOURCES.md) for animation research and provenance. The Sites deployment serves `dist` using `.openai/hosting.json`.
