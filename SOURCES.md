# NOIR reference studies

All studies use original NOIR HTML, CSS, and JavaScript, semantic light/dark tokens, responsive layouts, and reduced-motion behavior. They are standalone visual interpretations, not imports or framework ports of the reference components.

## Direct references reviewed November 6, 2026

After the environment was published, the reference sites became accessible. Board UI's supplied `/ar?via=componest` path returns 404; its current root and component documentation were used instead. Rare UI's pages and Motion UI's footer category were inspected as HTML and in Chromium.

The user explicitly chose **original visual adaptations** after the source licensing and Motion+ access differences were explained. Rare UI source is not copied or redistributed, and no Motion+ source, registry item, or paid asset is included.

| Reference reviewed | NOIR study | What was adapted and changed |
| --- | --- | --- |
| [Board UI: Button Group](https://www.boardui.com/components/button-group) | Fused editorial toolbar | Shared border, hairline separators, pressed states; controls now modify a live typography specimen. |
| [Board UI: Checkbox](https://www.boardui.com/components/checkbox) | Selection cards | Mixed/checked states and selectable rows; a native checkbox manifest updates its file summary. |
| [Board UI: Date Picker](https://www.boardui.com/components/date-picker) | Commit date picker | Pending versus committed selection, editable date chip, Cancel/Apply; rebuilt with native dialog, month grid, and keyboard navigation. |
| [Rare UI: Duration Picker](https://www.rareui.com/components/durationpicker) | Duration capsule | Segments separate for editing and join on confirmation; original CSS, native numeric inputs, clamping, Escape cancellation, and saved state. |
| [Rare UI: Gravity Letters](https://www.rareui.com/components/gravityletters) | Type fall | Type dropping into a composition; new bounded four-column letterpress layout and native keyframe motion, rather than Rare UI's physics simulation. |
| [Rare UI: Folder component](https://www.rareui.com/components/foldercomponent) | Folio folder | Fanning documents and a tilting flap; new three-document reader with keyboard opening and content selection. |
| [Motion UI: Footer: Sticky reveal](https://motion.dev/ui/footers) | Under-page footer | Public under-page reveal pattern, scroll feedback, and staggered wordmark; original nested-scroll implementation with reveal/reset controls. |
| [Motion UI: Footer: Newsletter](https://motion.dev/ui/footers) | Newsletter closing note | Public newsletter/footer pattern, quiet hover motion, and inline feedback; original local validation/confirmation/reset flow. No backend subscription occurs. |

Board UI's free Button Group, Checkbox, and Date Picker registry sources and [MIT license](https://github.com/BoardUI/boardui/blob/main/LICENSE) were consulted to understand the documented states. The implementation here does not bundle those React sources or dependencies. Board UI Pro templates were not used.

Rare UI's [license](https://github.com/swamimalode07/rare-ui/blob/main/LICENSE) prohibits republishing its components or ports as a competing library. These are independently written studies of public interaction concepts, with visible source links in NOIR's detail panels. No Rare UI component implementation source was copied.

Motion's footer category is public; editable footer source is offered through [Motion+](https://motion.dev/plus). The separately hosted live example frames were blocked by the preview-host allowlist, so the two original footer studies follow the category's public patterns and are not represented as pixel-matched ports of its live demos.

Reference links also travel inside standalone HTML exports as provenance comments.

## Earlier motion studies

The earlier 22 additions include six typography, six background, five layout, and five motion studies. Motion's [official repository documentation](https://github.com/motiondivision/motion) and [animation skill](https://github.com/motiondivision/ai-kit) informed spring-like movement, transforms, layout continuity, SVG paths, gestures, staggering, and reduced motion. They use native browser APIs; Motion is not a runtime dependency.

## Skill discovery

[Vercel find-skills](https://github.com/vercel-labs/skills/tree/main/skills/find-skills) and Motion's official skill were installed. Source records are retained in `skills-lock.json`. Initial discovery searches returned no matches while skills.sh was blocked; the official Motion skill was found through Motion's own README.
