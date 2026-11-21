# Geometry, paint, and animation

## Geometry and materials

Project a world point `(x, y, z)` into the illustration as `screenX = cx + 0.866 * (x - y)` and `screenY = cy + 0.5 * (x + y) - z`. Using these same axes for the base, the equipment, and the moving parts keeps objects aligned when they dock or slide. Use layer-specific contact shadows below the equipment and one broad, soft shadow below the base.

Start with a focal silhouette and one secondary prop. Use separate gradients for top and side planes, radii consistent with the material, fine strokes on structural edges, and a few small highlights at contact points. Keep a margin around the full motion, including any shadow bleed. Group all parts of a moving object so faces and highlights travel together.

Draw the scene so it explains one product feature. Examples in NOIR include `workflow-relay.svg` for signal routing, `checkout-terminal.svg` for a physical transaction, and `stroke-lesion-review.svg` for a comparison in which the two colours have distinct meanings.

## Paint roles

Use literal colours for `fill`, `stroke`, and `stop-color`. The gallery reads these attributes when it prepares a branded download. Wrap only the affected paint in a role.

```svg
<linearGradient id="example-accent" data-paint-policy="accent">
  <stop offset="0" stop-color="#c3b2fa"/>
  <stop offset="1" stop-color="#7259cb"/>
</linearGradient>
<path data-paint-policy="annotation" fill="none" stroke="#cf8440" stroke-dasharray="4 3" d="M42 36l11 3"/>
```

For protected meanings, add a shape or line style as well as colour. Keep medically illustrative scans synthetic and avoid implying that a model score applies to the displayed sample.

## Animation

Use a local keyframe name and put the complete still in the SVG attributes. Let the CSS animation describe the movement, including the pause at the end. Disable every named animation under reduced motion.

```svg
<style>
  .example-packet { animation: example-packet 7s ease-in-out infinite; }
  @keyframes example-packet {
    0%, 17% { transform: translate(0, 0); }
    43%, 86% { transform: translate(24px, 14px); }
    100% { transform: translate(0, 0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .example-packet { animation: none; }
  }
</style>
```

In actual art, position the group at the final state and keyframe the offset from that point, or render a separate static state when the completed scene is clearer. Use CSS-only motion so the delivered SVG works as an image without scripts or linked resources.
