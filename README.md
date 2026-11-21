# NOIR

A grayscale library with 155 live components across 10 categories. Browser-native HTML, CSS, and JavaScript; no application framework or build step.

## Run locally

Node.js 20 or later:

```sh
npm run dev
```

The server defaults to port 3000. Set `PORT` or use `npm run dev -- --port 8080`. No installation is needed to run the application. ES modules require HTTP; opening index.html directly will not load the catalog.

## Badge collection

The home view is **Badges — Every Badge Tells a Story**, an interactive, full-color corkboard in a portfolio-width test harness. The badge view has a full-width NOIR navigation bar; the existing component library keeps its original sidebar and layout. Use **Components** (or `/#components`) to return to the component library; `/#badges` opens the board directly.

For step-by-step instructions and a copyable new-badge example, see the **[Badge customization guide](docs/BADGE_CUSTOMIZATION.md)**. It covers colors, fabric, badge artwork, event photos, shapes, positions, and adding records.

The collection lives in `dist/badges/`:

- `data.js` holds the sample event records, categories, years, colors, roles, stories, and board positions. Replace these illustrative records with your own; category counts, years, navigation, and filters derive from the data.
- `collection.js` renders the board and story popups, combining category/year filtering with independent badge gestures, a fixed responsive board, and keyboard controls.
- `portfolio-preview.css` applies the test harness geometry: a centered 740px outer frame, 40px desktop / 24px mobile outer gutters, 24px inner padding at ≥640px and 20px below, and dividers within the resulting media column (692px at full width; 326px on a 390px screen). The board keeps the original single hook line and floating filters inside a centered landscape frame capped at 640px wide (about 425px tall), with a slimmer 10px wooden surround. It retains an anchored desktop inspection panel and a mobile bottom sheet with enlarged badge artwork. Width readouts and NOIR navigation are testing chrome, separate from the badge content.
- `physics.js` controls independent, damped springs. Metal hooks stay fixed while SVG fabric bends toward each dragged pendant. Animation frames run only while a spring is active, and stop at rest, on view exit, or when reduced motion is enabled.
- `collection.css` defines the warm scene, wooden frame, textured fabric, badge designs, responsive layout, and reduced-motion behavior. The surrounding NOIR navigation retains its existing theme.
- `frame-theme.css` scopes the portfolio palette to the collection: smoked charcoal wood and lunar highlights in dark mode, pale ash and warm alabaster in light mode. It styles the frame, plaque, surrounding surfaces, and panels without recoloring badges or changing their interactions.
- `cork.svg` and `lisbon.svg` are local texture and travel illustration assets; no external images or services are required.

To add a memory, copy a record in `data.js` and give it a unique `id`. Supply the event name, organization, category, numeric year, date, location, participation role, lanyard color, paper/ink colors, short description, full story, and takeaway. Choose an existing `design`, or provide a local `badgeImage` URL for custom artwork. Add optional photos as `{src, alt, caption}` objects in `photos`; they appear in the story popup. Photo `alt` text should describe the actual image. The original hook positions and long strap lengths come from `position` in the source records. The fixed landscape board scales the complete composition to fit without reflowing badges into stacked rows. An optional `lanyardPattern: 'mosaic'` adds a multicolor fabric print. Optional `dimensions: {width, height}` and `shape` (`sleeve`, `rounded`, `clipped`, or `landscape`) give each badge its own silhouette. Set `dateISO` (`YYYY-MM-DD`) for accurate chronological story navigation. Missing custom artwork falls back to the badge’s designed face; unavailable photos retain their caption and an accessible placeholder.

Object controls: grab a badge or its fabric to move the pendant; release to let it settle. A nearby mouse gently excites just the surrounding lanyards. The corkboard fits its frame responsively and remains fixed: there are no zoom controls, board panning, wheel zoom, or custom pinch zoom. Swipes on empty cork scroll the page normally. Badge dragging, tapping, lanyard motion, and story inspection remain available on mouse and touch devices. Tab focuses memories and Enter opens their stories; Escape closes a story and restores focus. Filtering excludes hidden memories from keyboard navigation while preserving all hook positions and frame dimensions. The floating filter is a pinned “Field Notes” card with paper grain, a metal pin, a folded corner, live badge/event/year counts, and ink-style category/year selections. It sits inside the corkboard and starts collapsed below 640px. Collapsed, it is a small title-only tab (112px on desktop, 100px on phones); collection counts appear when expanded. The expanded card is 150px wide on desktop and 132px on phones; its height is bounded by the corkboard. Expanded mobile controls scroll within the card beneath a sticky summary, so every category and year remains reachable without overflowing the frame. Collection totals live in the Field Notes; promotional headings, random discovery, the timeline, and closing copy are omitted so the board is the focus. Collection statistics derive from the data. Reduced motion retains direct dragging and inspection but disables ambient sway, oscillating spring-back, and animated transitions.

`npm run test:browser -- tests/badges.spec.mjs tests/badge-physics.spec.mjs tests/badge-layout.spec.mjs` covers every badge, expanded stories, combined/empty filters, mouse and keyboard navigation, drag-versus-click behavior, real touch input, reduced motion, narrow layouts, object dragging on a fixed board, fixed hooks, release bounds, spring settling with no idle frames, touch cancellation, page scrolling, live collection counts, chronological story navigation, and missing-image fallbacks.

## Isometric scenes

Choose **Scenes** in NOIR or open `/isometric-scenes/`. The gallery provides playback controls, brand accent presets or a custom hex colour, System, Light, and Dark appearance, individual animated SVGs, and an offline ZIP.

Add a standalone SVG to `dist/isometric-scenes/`, register it in `scripts/isometric-scenes/scenes.json`, and run `npm run build:scenes`. Use the [isometric-scenes agent skill](.agents/skills/isometric-scenes/SKILL.md) for the drawing, motion, and export workflow.

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
