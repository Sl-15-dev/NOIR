---
name: isometric-scenes
description: Create, revise, and validate animated isometric SVG illustrations like the NOIR Scenes collection. Use for product workflows, hardware dioramas, and research processes shown as self-contained isometric loops with editable vectors, brand accents, and reduced-motion fallbacks.
---

# Isometric scenes

Apply this skill when the deliverable is an animated isometric illustration or an update to the NOIR Scenes collection. Use the project's requested subject and brand as the brief. When no brand is supplied, choose a single accent and a neutral material palette.

## Design the scene

1. Choose one action the viewer can follow, such as a payment terminal approving a tap. Describe its resting state, the trigger, and the visible result before drawing.
2. Build the scene on an orthographic 30° isometric grid. Give the main object the most space and keep signals, props, and shadows subordinate. Compare the silhouette against nearby scenes and choose a focal object specific to the action. Use a screen when the interface itself is the subject. Use depth, bevels, and a consistent upper-left light to make parts feel physical.
3. Draw an original, transparent 800 × 640 SVG. Keep meaningful objects in named groups. Add a short `<title>` and `<desc>` and connect them with `aria-labelledby`. Prefix IDs and keyframe names with the scene slug.
4. Use CSS keyframes to animate the action and a restrained secondary detail. Prefer transforms, opacity, or a stroke moving along a path. Leave time to read the result before the loop resets. Make the completed or clearest state visible from the base SVG and disable keyframes in `@media (prefers-reduced-motion: reduce)`.
5. Use solid hex paint values so the gallery can recolour the vector. Mark accent-only artwork or gradient stops with `data-paint-policy="accent"`. Mark paint that carries its own meaning with `data-paint-policy="annotation"`, and use `data-paint-policy="fixed"` for art whose colours must be preserved. Keep the groups narrowly scoped so recolouring an accent leaves neutral materials intact.

See [Geometry, paint, and animation](references/art-direction.md) for projection math, a minimal motion pattern, and concrete reference scenes.

## Add it to NOIR

- Put the standalone file in `dist/isometric-scenes/` and add one entry to `scripts/isometric-scenes/scenes.json`. Use a unique lowercase hyphenated key, the SVG filename, a short title and summary, a six-digit accent hex, and a 24 × 24 line icon path.
- Map visible objects to named actions in `scripts/isometric-scenes/actions.json`. Use SVG coordinates for each marker and time a one-shot action to its loop interval. Provide keyboard-accessible buttons and a clear result for each action. For a stateful scene, expose meaningfully separate SVG layers so choices change the art.
- Run `npm run build:scenes` to regenerate the integrated gallery and offline ZIP. Update the gallery through its manifest, template, CSS, and JavaScript in `scripts/isometric-scenes/`. Keep generated HTML and ZIP in sync with their source.
- Run `npm run check`, `npm test`, and `npm run test:browser -- isometric-scenes.spec.mjs` where Chromium and Playwright are available. Open `/isometric-scenes/?scene=<key>` to check the new scene directly.

Outside NOIR, the SVG is the complete asset. Test it as a standalone file or in an `<img>` and confirm theme contrast in the target layout.

## Check before handing off

- Confirm the action reads in the first seconds and the resting pose makes sense with motion disabled.
- Check crisp edges, uncut shadows, and readable labels at desktop and narrow sizes.
- Test a custom brand accent and both light and dark appearances. Check that annotation accents remain legible and the SVG download reflects the selected appearance.
- Check pointer and keyboard actions. With reduced motion, an action should show its result immediately.
- Check the new scene's direct link, SVG and ZIP exports, and any existing scenes affected by shared changes.
