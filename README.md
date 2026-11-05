# NOIR

A minimal black, white, and gray UI library with 150 distinct live components across 12 categories. Built with browser-native HTML, CSS and JavaScript, without a framework or build step.

## Run locally

From this directory:

```sh
npm run dev
```

Open http://localhost:3000. Node.js 20 or later is required; no dependency installation is needed. Set `PORT` or use `npm run dev -- --port 8080` to choose another port. ES modules require an HTTP server; opening index.html directly from a file manager will not load the catalog.

## Explore

- Browse 12 categories, search names and descriptions, filter styles, or open curated collections.
- Bookmark components. Bookmarks are stored in localStorage in the current browser.
- Open any component for an interactive playground, mobile canvas and CSS/Web Animation speed controls.
- Copy HTML, CSS, JavaScript, or a full standalone example. Download any component as a standalone HTML file.
- Press Ctrl/Cmd+K or / to search; use arrow keys and Enter to navigate results.

## Source

`dist/index.html`, `dist/style.css`, and `dist/app.js` define the library. The catalog modules export standalone component objects containing markup, styles, and scripts. Iframe isolation prevents component styles from affecting the library.

The main site hosts 150 examples. Full-page template content, product metrics, people, and testimonials inside previews are illustrative. Components have no external dependencies. The library uses system fonts.

## Design

The library and all 150 demos use a neutral grayscale palette, system typography, thin borders, and restrained controls. Previous colored accent preferences are cleared automatically. Demo source colors are grayscale, so copied code and downloads match their previews.

## Interaction details

Motion speed and pause apply to CSS and Web Animations. Timer-driven JavaScript and canvas effects follow their own scripts. The Light canvas control changes the backdrop; individual component surfaces retain their own styles. Use modern browsers for CSS color-mix, native dialogs, and Web Animations.

## Hosting

The Sites deployment serves the `dist` directory using `.openai/hosting.json`. No credentials are included in source.
