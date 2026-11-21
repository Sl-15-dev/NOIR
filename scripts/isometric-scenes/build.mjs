import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { makeZip } from './zip.mjs';

const dir = new URL('../../dist/isometric-scenes/', import.meta.url);
const source = filename => readFile(new URL(filename, import.meta.url), 'utf8');
const output = (filename, content) => writeFile(new URL(filename, dir), content);
const [rawManifest, template, css, app, zipSource, motionSource, rawActions] = await Promise.all([
  source('scenes.json'), source('gallery.template.html'), source('gallery.css'), source('gallery.js'), source('zip.mjs'), source('interactions.js'), source('actions.json'),
]);
const manifest = JSON.parse(rawManifest);
const configs = JSON.parse(rawActions);
assert(Array.isArray(manifest) && manifest.length > 0, 'Add at least one scene to scenes.json');
const keys = new Set();
const files = new Set();
for (const scene of manifest) {
  const { key, file, title, summary, accent, icon } = scene;
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key), `Invalid scene key ${key}`);
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*\.svg$/.test(file), `Invalid SVG filename ${file}`);
  assert(!keys.has(key) && !files.has(file), `Duplicate scene or file ${key}`);
  assert(/^#[a-f\d]{6}$/i.test(accent), `Invalid accent for ${key}`);
  assert([title, summary, icon].every(value => typeof value === 'string' && value.trim()), `Incomplete scene ${key}`);
  const config = configs[key];
  assert(config && ['timeline', 'case'].includes(config.kind) && Array.isArray(config.actions), `Missing action configuration for ${key}`);
  const actions = new Set();
  for (const action of config.actions) {
    assert(action.id && action.label && !actions.has(action.id), `Invalid or repeated action for ${key}`);
    assert(Number.isFinite(action.x) && action.x >= 0 && action.x <= 800 && Number.isFinite(action.y) && action.y >= 0 && action.y <= 640, `Action must be inside the SVG in ${key}`);
    if (config.kind === 'timeline') assert(action.result && Number.isFinite(action.start) && action.start >= 0 && Number.isFinite(action.end) && action.end > action.start, `Invalid timeline action for ${key}`);
    actions.add(action.id);
  }
  assert(actions.size > 0, `No actions for ${key}`);
  if (config.kind === 'case') assert.deepEqual(actions, new Set(['call', 'chat', 'email', 'brief', 'answer', 'save']));
  keys.add(key);
  files.add(file);
}

function escape(value) {
  return value.replace(/[&"<>]/g, character => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' }[character]));
}

function renderTab({ key, file, title, summary, accent, icon }, index) {
  const inactive = index ? ' tabindex="-1"' : '';
  return `        <button class="preview-tab" type="button" role="tab" id="tab-${key}" data-key="${key}" data-file="${file}" data-accent="${accent}" aria-controls="panel-${key}" aria-labelledby="name-${key}" aria-describedby="detail-${key}" aria-selected="${!index}"${inactive}>
          <span class="preview-tab-icon" style="--icon-colour:${accent}" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round"><path d="${escape(icon)}"/></svg>
          </span>
          <span><span class="preview-tab-name" id="name-${key}">${escape(title)}</span><span class="preview-tab-detail" id="detail-${key}">${escape(summary)}</span></span>
        </button>`;
}

const scenes = await Promise.all(manifest.map(async (scene, index) => {
  const svg = await readFile(new URL(scene.file, dir), 'utf8');
  const artwork = svg.replace(/^\s*<\?xml[^]*?\?>\s*/, '').trim();
  assert(/^<svg\b[^>]*\bviewBox="0 0 800 640"/i.test(artwork) && artwork.endsWith('</svg>'), `Unexpected SVG or viewBox in ${scene.file}`);
  assert(/<title\b/.test(artwork) && /<desc\b/.test(artwork), `Accessible title and description required in ${scene.file}`);
  assert(/prefers-reduced-motion\s*:\s*reduce/.test(artwork), `Missing reduced-motion stylesheet in ${scene.file}`);
  assert(!/<(?:script|foreignObject)\b|\son\w+\s*=|(?:\bxlink:href|\bhref)\s*=\s*['"](?!#)/i.test(artwork), `Use standalone, script-free SVG in ${scene.file}`);
  if (configs[scene.key].kind === 'case') {
    for (const part of ['call', 'chat', 'email', 'brief', 'transcript', 'saved']) {
      assert(artwork.includes(`data-si-part="${part}"`), `Missing ${part} layer in ${scene.file}`);
    }
  }
  return { ...scene, svg, panel: `        <div class="preview-panel" id="panel-${scene.key}" role="tabpanel" aria-labelledby="tab-${scene.key}"${index ? ' hidden' : ''}>
          <template>${artwork}</template>
          <div class="preview-mount"></div>
        </div>` };
}));

function insert(text, marker, replacement) {
  assert(text.split(marker).length === 2, `Expected one ${marker} marker`);
  return text.replace(marker, () => replacement);
}

let script = insert(app, '  /* GALLERY_ZIP */', zipSource.replace('export function makeZip', 'function makeZip').trimEnd().split('\n').map(line => line ? '  ' + line : '').join('\n'));
script = insert(script, '  /* GALLERY_INTERACTIONS */', motionSource.trimEnd().split('\n').map(line => line ? '  ' + line : '').join('\n'));
script = insert(script, '/* SCENE_ACTION_DATA */ {}', rawActions.trim().replaceAll('<', '\\u003c'));
let page = insert(template, '/* GALLERY_STYLE */', css.trimEnd());
page = insert(page, '/* GALLERY_SCRIPT */', script.trimEnd());
page = insert(page, '<!-- SCENE_TABS -->', scenes.map(renderTab).join('\n'));
page = insert(page, '<!-- SCENE_PANELS -->', scenes.map(scene => scene.panel).join('\n'));
const offline = insert(page, '<html lang="en">', `<html lang="en" data-export-viewer="yes" data-export-appearance="system" data-export-scene="${scenes[0].key}">`);
const zip = makeZip([['animated-isometric-scenes.html', offline], ...scenes.map(scene => [scene.file, scene.svg])]);
await Promise.all([output('index.html', page), output('animated-isometric-scenes.zip', Buffer.from(await zip.arrayBuffer()))]);
console.log(`Built the NOIR gallery and ZIP for ${scenes.length} scenes.`);
