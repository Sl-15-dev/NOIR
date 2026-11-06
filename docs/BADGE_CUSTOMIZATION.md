# Customize your badge collection

The collection uses plain JavaScript, CSS, SVG, and local images. There is no build step. Most changes only require editing **`dist/badges/data.js`** and refreshing the page.

- [Quick file map](#quick-file-map)
- [Change colors](#change-colors)
- [Customize lanyards](#customize-lanyards)
- [Use your own badge image](#use-your-own-badge-image)
- [Add event photographs](#add-event-photographs)
- [Add a new badge](#add-a-new-badge)
- [Change a badge's shape, size, or position](#change-a-badges-shape-size-or-position)
- [Change the Field Notes filter](#change-the-field-notes-filter)
- [Preview and check your changes](#preview-and-check-your-changes)

## Quick file map

| What you want to change | File |
| --- | --- |
| Event information, stories, colors, image URLs, photos | `dist/badges/data.js` |
| Badge templates, fabric text, SVG logos and fabric patterns | `dist/badges/collection.js` |
| Badge design styles, sleeve shapes, fabric appearance | `dist/badges/collection.css` |
| Dark/light palettes, wooden frame, cork tint, plaque | `dist/badges/frame-theme.css` |
| Frame size, portfolio spacing, Field Notes paper and compact/mobile sizes | `dist/badges/portfolio-preview.css` |
| Spring behavior and drag constraints | `dist/badges/physics.js` |
| Your image files (create this folder) | `dist/badges/assets/` |

The files under `dist/` are the actual editable application source in this project, not generated build output. Keep the physics and pointer handlers intact when changing artwork so dragging and tapping continue to work.

## Change colors

### One badge and its lanyard

Find the badge's record in `dist/badges/data.js`. Change these fields:

```js
lanyardColor: '#38684c', // Fabric color
paper: '#f1f0dc',        // Printed card background
ink: '#193c2a',          // Printed card text and artwork
```

The same badge colors appear on the board and in enlarged story inspection. They stay colorful in both website themes.

Some preset designs have their own accents and backgrounds. For example, Config has colored circles and GitHub has a gradient. To change those too, edit the matching `.badge-design-config`, `.badge-design-github`, etc. rules in `collection.css`. For a simple card controlled by `paper` and `ink`, use a new design name such as `personal`, with a `label` and `mark` as shown in the new-badge example below.

If `badgeImage` is set, your image covers the printed face: changing `paper` and `ink` affects the fallback underneath, not the colors inside the image. Edit the image itself to recolor scanned artwork.

### Website, frame, and plaque

In `dist/badges/frame-theme.css`, the first `.badge-collection` block defines dark mode. The `[data-theme="light"] .badge-collection` block defines light mode. Edit the appropriate block, or both:

```css
/* Example replacements inside the existing dark-mode block */
--background: #0a0a0b;
--foreground: #f1efe8;
--foreground-secondary: #c1bdb4;
--lunar: #cbc5b8;
--frame-base: #252526;
--frame-edge: #393939;
--frame-light: #454442;
--cork-tint: #686056;
--plaque-face: #2a2928;
--plaque-edge: #45423c;
```

`--frame-base`, `--frame-edge`, and `--frame-light` work together to create the wood's depth. `--cork-tint` blends with `cork.svg`; the resulting cork color is not a flat hex fill. `--plaque-face` and `--plaque-edge` style the wooden “Badges” sign.

The original cork texture is `dist/badges/cork.svg`. To replace it, update the `.badge-stage` background image in `collection.css`, retaining the tint/shadow rules in `frame-theme.css`.

Stylesheets load in this order: `style.css`, `collection.css`, `frame-theme.css`, then `portfolio-preview.css`. A later, more specific rule can override an earlier one. Field Notes uses its own paper/ink variables in `portfolio-preview.css`, separately from the website surface colors.

## Customize lanyards

Lanyards are live SVG fabric, not static images. Their paths bend with the dragged badge.

### Solid or patterned fabric

```js
lanyardColor: '#405d9f',
lanyardPattern: 'mosaic', // Optional multicolor geometric print
```

Omit `lanyardPattern`, or remove it from the record, for solid woven fabric. `mosaic` is the currently supported named pattern. Its blue/base color comes from `lanyardColor`; its other colors are defined in the `mosaic-${b.id}` SVG pattern in `collection.js`.

There is no `lanyardImage` data field implemented. Simply adding that property will not change the strap. For a different fabric print, extend the SVG patterns in `collection.js` and choose that pattern when rendering `.badge-ribbon`; keep the deforming ribbon paths and `data-strap-left` / `data-strap-right` paths intact.

### Fabric text

The existing fabric text is generated from `organization`, `year`, and `role`. Update those fields to update the printed strap text. To change the wording independently of the event metadata, edit the two `<textPath>` contents in `collection.js`.

### Length, angle, and thickness

An optional `position` object lets you customize one hanging group:

```js
position: {
  x: 1130,     // Horizontal position in the board's internal coordinates
  y: 137,      // Vertical position of the hanging group
  angle: -0.5, // Resting rotation, in degrees
  strap: 560   // Lanyard length, before board scaling
},
```

Larger `strap` values make longer lanyards. Keep lengths at least 80 for the current curve design. If you omit `position`, the defaults near the end of `data.js` generate a hook position, slight rotation, and varied strap length automatically.

Thickness comes from the `.badge-lanyard .badge-ribbon`, `.badge-ribbon-shadow`, and `.badge-ribbon-weave` stroke widths in `collection.css`. Change all three together; the thin `.badge-ribbon-seam` is a separate stitching detail.

These coordinates and lengths are **not screen pixels**. Each hanging group is scaled to 68%, then the whole collection is scaled to fit the fixed board. The hook is approximately 80 internal units to the right of the group's `x` coordinate. Do not change the scaling in CSS alone; physics uses the same scale to track the pointer.

## Use your own badge image

1. Create `dist/badges/assets/` and put your artwork there, for example `my-conference-badge.webp`.
2. Set that badge's `badgeImage` URL:

```js
badgeImage: './badges/assets/my-conference-badge.webp',
```

3. Keep `eventName`, `design`, `label`, `mark`, `paper`, and `ink` populated. They provide the accessible event identity and a designed fallback if the image cannot load.

Image URLs resolve relative to the **page**, `dist/index.html`, not relative to `data.js`. A file at `dist/badges/assets/my-conference-badge.webp` therefore uses `./badges/assets/my-conference-badge.webp`, not `./assets/my-conference-badge.webp`. Match filename capitalization exactly.

A clean front-facing scan or photograph works best. Crop to the badge edges, correct perspective, and remove the surrounding table or lanyard. WebP, PNG, JPEG, and SVG artwork can be used. A 600 × 800px image is a useful starting point for a 150 × 200 portrait card; use a matching aspect ratio for other dimensions. Avoid putting important text against the edge.

The default image rule uses `object-fit: cover`, so mismatched proportions are cropped. Prefer matching the record's dimensions to the image. If you want every custom image to fit without cropping, change `.badge-custom-image` to `object-fit: contain` in `collection.css`; the card background may then show around the artwork.

To return to a generated badge design:

```js
badgeImage: null,
```

Available preset `design` names are `openai`, `config`, `ethglobal`, `github`, `websummit`, `react`, `devfest`, `merge`, `google`, `microsoft`, `devconf`, `hackday`, `designweek`, and `community`. These reuse the existing artwork and styling. A new design name uses the generic card and the record's `mark`; optionally add matching `.badge-design-your-name` CSS and artwork in `badgeArtwork()` in `collection.js` for a completely new template.

## Add event photographs

Store event photos in the same assets folder and add them to the record's `photos` array:

```js
photos: [
  {
    src: './badges/assets/meetup-team.webp',
    alt: 'Our team standing beside the finished hackathon demo',
    caption: 'The team, five minutes before the final presentation.'
  },
  {
    src: './badges/assets/meetup-stage.webp',
    alt: 'A speaker presenting an accessibility demonstration',
    caption: 'The session that changed how I test keyboard navigation.'
  }
],
```

Photos appear in the badge's story panel. They are optional; use `photos: []` when there are none. Write useful image descriptions in `alt`, and use `caption` for your personal context. Resize large camera files before adding them; around 1200–1600px on the long edge is usually enough for the story panel.

If a photo is missing, the panel shows a readable “Photo unavailable” message and preserves its caption.

## Add a new badge

In `dist/badges/data.js`, insert the following **before** the line `const strapLengths = ...` (the file currently writes that declaration without spaces around `=`). You can also append the object to the existing `badges.push(...)` call immediately above it.

```js
badges.push({
  id: 'local-developer-meetup-2026',
  eventName: 'Local Developer Meetup',
  organization: 'Developer Community',
  category: 'Conferences',
  year: 2026,
  date: 'June 12, 2026',
  dateISO: '2026-06-12',
  location: 'Riyadh, Saudi Arabia',
  role: 'Attendee',

  lanyardColor: '#38684c',
  // lanyardPattern: 'mosaic', // Uncomment for patterned fabric
  paper: '#f1f0dc',
  ink: '#193c2a',
  design: 'personal',
  label: 'DEV MEETUP',
  mark: '+',
  badgeImage: null, // Or './badges/assets/my-conference-badge.webp'

  shortDescription: 'An evening of useful ideas and new connections.',
  fullStory: 'I came to hear about accessible interfaces and left with a new group of people to build with. A short conversation after the talks became a plan for our next community project.',
  takeaway: 'The best conversations often happen after the final slide.',
  photos: [],

  dimensions: {width: 150, height: 200},
  shape: 'sleeve'
  // position is optional: omit it to use the automatic hook-line layout.
});
```

Insertion location matters: the code below `const strapLengths` fills optional defaults and calculates board dimensions and years. Adding a record after those calculations would leave the derived data out of date.

### Record checklist

| Field | What to enter |
| --- | --- |
| `id` | Unique, stable identifier. Use lowercase letters, numbers, and hyphens; never reuse another badge's ID. |
| `eventName`, `organization` | The full event and organizer names shown in story inspection. |
| `category` | Exactly one of `Technology`, `Conferences`, `Hackathons`, `Workshops`, or `Volunteering`. `All` is a filter, not a category for a record. |
| `year` | A number, such as `2026`, not a quoted string. |
| `date` | Human-readable date or date range. |
| `dateISO` | `YYYY-MM-DD`, using the event's starting date for chronological previous/next navigation. |
| `location`, `role` | City/country and participation type, such as Attendee, Speaker, Staff, Volunteer, or Hacker. |
| `label`, `mark`, `design` | Short printed badge title, fallback symbol, and template name. |
| `lanyardColor`, `paper`, `ink` | CSS colors; hex values are simplest. |
| `shortDescription` | A short introduction to the memory. |
| `fullStory`, `takeaway` | Expanded personal story and the closing quote/lesson. |
| `badgeImage`, `photos` | Optional artwork URL and event photo array; use `null` and `[]` when absent. |
| `dimensions`, `shape`, `position` | Optional display customization, described below. |

Field Notes totals, category counts, and year buttons update from the data automatically. The current event total groups records by event name, year, and location. Multiple badges for that same event contribute separate badges but one event.

To add a category of your own, add its exact name to the exported `categories` array at the bottom of `data.js`, then use the same string in the record. Existing categories require no UI changes. Category icons are chosen in the filter markup in `collection.js`; customize that mapping if you add a new category.

The board scales the complete collection into its fixed frame. As you add more badges, its internal coordinate width can grow and the cards can become smaller. Remove sample records as you replace them, or adjust the hook positions intentionally; this design does not automatically create additional rows.

## Change a badge's shape, size, or position

```js
dimensions: {width: 160, height: 210},
shape: 'rounded',
position: {x: 1130, y: 137, angle: -0.5, strap: 560},
```

Supported shapes:

| `shape` | Appearance |
| --- | --- |
| `sleeve` | Translucent sleeve-style edge |
| `rounded` | Softer rounded corners |
| `clipped` | Cut top corners |
| `landscape` | A compact card treatment with smaller artwork/title |

Set `dimensions` as well as `shape` for a genuinely wider or shorter card; the `landscape` name alone does not choose an image's aspect ratio. For example, try `{width: 180, height: 150}` with `shape: 'landscape'`. Check overlap and clipping after changing dimensions or angle.

For shared hook spacing and default strap lengths, edit the `strapLengths` array and the first `badges.forEach(...)` near the bottom of `data.js`. Defaults use `??=`, so explicitly supplied `position`, `dimensions`, or `shape` values take precedence.

## Change the Field Notes filter

In `dist/badges/portfolio-preview.css`:

- `--index-paper`, `--index-ink`, `--index-muted`, and `--index-rule` control the pinned paper card's colors. There is a separate light-mode paper override.
- `.badge-filters` rules near the end control the expanded desktop width and height limit.
- The final `.badge-filters:not([open])` rules control the collapsed tab; its title-only width is currently 112px on desktop and 100px on phones.
- The mobile media block sets the expanded width to 132px and keeps its height inside the cork, with scrolling controls.

The visible “Field Notes” text is in the filter `<summary>` in `collection.js`. Its collection counts are computed from the badge data; don't replace those expressions with hardcoded numbers.

For the frame itself, the scoped `.badge-frame` and `.badge-stage` rules in `portfolio-preview.css` control the 640px maximum width, 10px surround, and `1228 / 800` board aspect ratio. Changing frame geometry should be checked alongside the mobile filter's height bound.

## Preview and check your changes

From the repository root:

```sh
npm ci
npm run dev
```

View the BADGES section through the running development server and refresh after edits. If an image looks unchanged, hard-refresh the browser. Use the existing theme toggle to check dark and light mode.

Check the following:

1. Open every new badge and confirm its event information, artwork, full story, and photos.
2. Select its category and year in Field Notes. Check that totals and filter results make sense.
3. Drag the card and its fabric, release them, and confirm spring-back. A tap should open the story without dragging the board.
4. Check 320px and 390px phone widths, with Field Notes collapsed and expanded. Ensure all filters can be reached by scrolling inside the card.
5. Tab to a badge, press Enter, and close its story with Escape. Try reduced-motion mode as well.

Run the existing checks:

```sh
npm run check
npm test
npm run test:browser -- tests/badges.spec.mjs tests/badge-physics.spec.mjs tests/badge-layout.spec.mjs
```

Some browser assertions describe the current sample collection (for example, 14 records, specific event titles, and known category/year counts). If you intentionally replace the samples, update the affected fixture expectations to match your actual collection; retain the interaction, accessibility, and frame-containment assertions.

Common fixes:

| Problem | Check |
| --- | --- |
| Blank page after editing data | Missing commas, unmatched quotes, or a syntax error. Run `npm run check`. |
| Badge doesn't appear | Unique ID, insertion before defaults/derived values, and current category/year filters. |
| Image is missing | File exists under `dist/`, URL is relative to the page, and filename case matches. |
| New year doesn't appear | Numeric `year` and insertion before the exported `years` calculation. |
| Color doesn't change | A custom image or a preset's CSS background may cover `paper`; later CSS rules may override earlier ones. |
| Cards are too small | Too many records or far-apart positions enlarge the internal board; replace samples or tighten the composition. |
