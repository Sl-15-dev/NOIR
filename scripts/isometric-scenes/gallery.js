(() => {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const PAINTS = ['fill', 'stroke', 'stop-color', 'flood-color', 'lighting-color'];
  /* GALLERY_INTERACTIONS */
  const actionConfigs = /* SCENE_ACTION_DATA */ {};
  const NOIR_THEME = 'noir-theme';
  const STORAGE = 'isometric-scenes.appearance.v1';
  const COLOUR_FALLBACK = '#7861d8';

  function normaliseHex(value) {
    if (typeof value !== 'string') return '';
    const input = value.trim().replace(/^#/, '');
    return /^[a-f\d]{6}$/i.test(input) ? '#' + input.toLowerCase() : '';
  }

  function toHsl(value) {
    const hex = value.slice(1);
    const digits = hex.length === 3 ? Array.from(hex, c => c + c) : hex.match(/../g);
    const [r, g, b] = digits.map(pair => parseInt(pair, 16) / 255);
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    const d = max - min;
    const l = (max + min) / 2;
    if (!d) return { h: 0, s: 0, l };
    let h;
    if (max === r) h = (g - b) / d;
    else if (max === g) h = 2 + (b - r) / d;
    else h = 4 + (r - g) / d;
    return { h: (h * 60 + 360) % 360, s: d / (1 - Math.abs(2 * l - 1)), l };
  }

  function fromHsl(h, s, l) {
    const chroma = (1 - Math.abs(2 * l - 1)) * s;
    const segment = (h + 360) % 360 / 60;
    const x = chroma * (1 - Math.abs(segment % 2 - 1));
    const offsets = [[chroma, x, 0], [x, chroma, 0], [0, chroma, x], [0, x, chroma], [x, 0, chroma], [chroma, 0, x]];
    return '#' + offsets[Math.floor(segment)].map(channel => {
      const value = 255 * (channel + l - chroma / 2);
      return Math.round(Math.min(255, Math.max(0, value))).toString(16).padStart(2, '0');
    }).join('');
  }

  function paintRole(element, value, key) {
    const policy = element.closest('[data-paint-policy]')?.getAttribute('data-paint-policy');
    if (policy === 'fixed' || policy === 'annotation' || policy === 'accent') return policy;
    const { h, s, l } = value;
    const amber = h >= 12 && h <= 62 && s >= .44 && l > .25 && l < .89;
    if (amber && (key === 'cryptopulse-mqtt' || key === 'stroke-lesion-review')) return 'annotation';
    if (/(?:shadow|contact|soft)/i.test(element.getAttribute('filter') || '')) return 'shadow';
    if (l < .15 || s < .25) return 'material';
    if (key === 'agent' && (h < 33 || h >= 350) && (l < .83 || s > .68)) return 'accent';
    if ((key === 'workflow' || key === 'stroke-lesion-review') && h >= 220 && h <= 302) return 'accent';
    if ((key === 'analytics' || key === 'cryptopulse-mqtt') && h >= 125 && h <= 179) return 'accent';
    return 'material';
  }

  function findPaints(svg, key) {
    const entries = [];
    for (const element of [svg, ...svg.querySelectorAll(PAINTS.map(paint => `[${paint}]`).join(','))]) {
      for (const attribute of PAINTS) {
        const original = element.getAttribute(attribute);
        if (!original || !/^#(?:[a-f\d]{3}|[a-f\d]{6})$/i.test(original)) continue;
        const colour = toHsl(original);
        entries.push({ element, attribute, original, colour, role: paintRole(element, colour, key) });
      }
    }
    return entries;
  }

  function paintValue(entry, brand, dark) {
    const { original, colour, role, element } = entry;
    const { h, s, l } = colour;
    if (role === 'fixed' || role === 'annotation') return original;
    if (role === 'accent') {
      if (!brand && !dark) return original;
      const bias = brand ? (brand.l - .52) * (.12 + .15 * (1 - (2 * l - 1) ** 2)) : 0;
      const lightness = Math.min(.97, Math.max(.11, l + bias + (dark && l > .48 ? .035 : 0)));
      const saturation = brand ? Math.min(.99, brand.s * (.63 + .53 * s)) : s;
      return fromHsl(brand?.h ?? h, saturation, lightness);
    }
    if (!dark) return original;
    if (role === 'shadow') return '#05080d';
    if (element.localName === 'text') {
      return l >= .52 ? fromHsl(214, .13, .87 + l * .08) : fromHsl(219, .19, .095 + l * .17);
    }
    const materialLightness = .06 + .61 * l;
    const materialHue = h >= 185 && h <= 285 ? (h * .3 + 219 * .7) : 218;
    return fromHsl(materialHue, .11 + s * .16, materialLightness);
  }

  function tint(paints, colour, dark) {
    for (const entry of paints) {
      const next = paintValue(entry, colour, dark);
      if (entry.element.getAttribute(entry.attribute) !== next) entry.element.setAttribute(entry.attribute, next);
    }
  }

  function exportSvg(scene, brand, appearance) {
    const svg = scene.source.cloneNode(true);
    const paints = findPaints(svg, scene.key);
    tint(paints, brand, appearance === 'dark');
    if (appearance === 'system') {
      const darkStyles = new Map();
      for (const entry of paints) {
        const dark = paintValue(entry, brand, true);
        if (entry.element.getAttribute(entry.attribute) === dark) continue;
        if (!darkStyles.has(entry.element)) darkStyles.set(entry.element, []);
        darkStyles.get(entry.element).push(`${entry.attribute}:${dark}`);
      }
      const selectors = new Map();
      for (const [element, properties] of darkStyles) {
        const rule = properties.join(';');
        if (!selectors.has(rule)) selectors.set(rule, String(selectors.size));
        element.setAttribute('data-gallery-paint', selectors.get(rule));
      }
      if (selectors.size) {
        const style = document.createElementNS(SVG_NS, 'style');
        const rules = [...selectors].map(([rule, id]) => `[data-gallery-paint="${id}"]{${rule}}`);
        style.textContent = '@media (prefers-color-scheme: dark) {\n' + rules.join('\n') + '\n}';
        svg.append(style);
      }
    }
    return new XMLSerializer().serializeToString(svg);
  }

  /* GALLERY_ZIP */

  const root = document.documentElement;
  const originalPage = root.cloneNode(true);
  const gallery = document.querySelector('.preview-gallery');
  const tablist = gallery.querySelector('[role="tablist"]');
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const status = document.getElementById('preview-status');
  const toggle = gallery.querySelector('.preview-toggle');
  const replay = gallery.querySelector('.preview-replay');
  const interact = gallery.querySelector('.preview-interact');
  const download = gallery.querySelector('.preview-download');
  const bundle = gallery.querySelector('.preview-bundle');
  const appearanceSelect = document.getElementById('appearance');
  const picker = document.getElementById('brand-picker');
  const hex = document.getElementById('brand-hex');
  const colourError = document.getElementById('brand-error');
  const presets = [...document.querySelectorAll('.preview-swatch')];
  const keys = [...document.querySelectorAll('[data-key-for]')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const darkMode = matchMedia('(prefers-color-scheme: dark)');
  const horizontalTabs = matchMedia('(max-width: 900px)');
  const sceneActions = createSceneActions(gallery, actionConfigs, animations, reducedMotion);
  const isExport = root.dataset.exportViewer === 'yes';
  let stored = {};
  let libraryAppearance;
  if (!isExport) {
    try {
      libraryAppearance = localStorage.getItem(NOIR_THEME);
      stored = JSON.parse(localStorage.getItem(STORAGE)) || {};
    } catch { /* Storage is optional. */ }
  }
  let appearance = isExport ? root.dataset.exportAppearance : (libraryAppearance || stored.appearance);
  if (!['system', 'light', 'dark'].includes(appearance)) appearance = 'system';
  let brand = normaliseHex(isExport ? root.dataset.exportBrand : stored.brand);
  let brandHsl = brand ? toHsl(brand) : null;
  let active = 0;
  let playing = !reducedMotion.matches;
  let motionRequested = false;

  const scenes = tabs.map(tab => {
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    const source = panel.querySelector('template').content.querySelector('svg');
    const svg = source.cloneNode(true);
    const scene = { panel, svg, source, key: tab.dataset.key, file: tab.dataset.file };
    scene.paints = findPaints(svg, scene.key);
    scene.styles = Array.from(svg.querySelectorAll('style'), element => ({ element, text: element.textContent }));
    const shadow = panel.querySelector('.preview-mount').attachShadow({ mode: 'open' });
    const frameStyle = document.createElement('style');
    frameStyle.textContent = `
      :host > svg { display:block; width:100%; height:100%; transform:scale(1.06) }
      svg[data-si-demo] * { animation:none !important }
      svg[data-si-demo] [data-si-part], svg[data-si-demo] [data-si-route] { transition:opacity .35s ease, translate .4s cubic-bezier(.24,.79,.31,1) }
      svg[data-si-demo] [data-si-part="call"], svg[data-si-demo] [data-si-part="chat"], svg[data-si-demo] [data-si-part="email"] { opacity:.49 }
      svg[data-si-demo] [data-si-route] { opacity:.15 }
      svg[data-si-demo] [data-si-part="brief"], svg[data-si-demo] [data-si-part="transcript"], svg[data-si-demo] [data-si-part="saved"] { opacity:0; translate:0 11px; pointer-events:none }
      svg[data-si-demo] [data-si-selected], svg[data-si-demo] [data-si-visible] { opacity:1 !important }
      svg[data-si-demo] [data-si-visible] { translate:0 0 !important }
      @media (prefers-reduced-motion: reduce) {
        svg[data-si-demo] [data-si-part], svg[data-si-demo] [data-si-route] { transition:none }
      }
    `;
    shadow.append(frameStyle, svg);
    return scene;
  });

  function savePreferences() {
    if (isExport) return;
    try { localStorage.setItem(STORAGE, JSON.stringify({ appearance, brand })); } catch { /* Storage is optional. */ }
  }

  function paintActiveScene() {
    gallery.style.setProperty('--scene-colour', tabs[active].dataset.accent);
    tint(scenes[active].paints, brandHsl, root.dataset.theme === 'dark');
  }

  function applyAppearance() {
    const prefersDark = appearance === 'dark' || (appearance === 'system' && darkMode.matches);
    root.dataset.theme = prefersDark ? 'dark' : 'light';
    appearanceSelect.value = appearance;
    paintActiveScene();
  }

  function applyBrand(updateText = true) {
    if (brand) gallery.style.setProperty('--brand', brand);
    else gallery.style.removeProperty('--brand');
    for (const preset of presets) preset.setAttribute('aria-pressed', String(preset.dataset.colour === brand));
    picker.value = brand || COLOUR_FALLBACK;
    if (updateText) hex.value = brand.toUpperCase();
    paintActiveScene();
  }

  function setBrand(value, updateText = true) {
    brand = value;
    brandHsl = brand ? toHsl(brand) : null;
    hex.removeAttribute('aria-invalid');
    colourError.hidden = true;
    applyBrand(updateText);
    savePreferences();
  }

  function animations(scene) {
    scene.svg.getBoundingClientRect();
    return scene.svg.getAnimations({ subtree: true });
  }

  function run(scene, restart) {
    for (const animation of animations(scene)) {
      if (restart) animation.currentTime = 0;
      if (playing) animation.play();
      else animation.pause();
    }
  }

  function showPlayback() {
    toggle.querySelector('span').textContent = playing ? 'Pause' : 'Play';
    toggle.querySelector('[data-icon="pause"]').toggleAttribute('hidden', !playing);
    toggle.querySelector('[data-icon="play"]').toggleAttribute('hidden', playing);
  }

  function applyMotionPreference() {
    for (const scene of scenes) {
      for (const { element, text } of scene.styles) {
        const css = reducedMotion.matches && (motionRequested || sceneActions.usesTimeline)
          ? text.replace(/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/gi, '@media not all')
          : text;
        if (element.textContent !== css) element.textContent = css;
      }
    }
  }

  function selectScene(next, { focus = false, updateUrl = false } = {}) {
    if (next !== active) {
      const wasInteractive = sceneActions.active;
      sceneActions.close();
      for (const animation of animations(scenes[active])) animation.pause();
      tabs[active].setAttribute('aria-selected', 'false');
      tabs[active].tabIndex = -1;
      scenes[active].panel.hidden = true;
      active = next;
      gallery.dataset.scene = scenes[active].key;
      tabs[active].setAttribute('aria-selected', 'true');
      tabs[active].tabIndex = 0;
      paintActiveScene();
      scenes[active].panel.hidden = false;
      if (wasInteractive || actionConfigs[scenes[active].key].kind === 'case') setInteractive(true);
      else {
        applyMotionPreference();
        run(scenes[active], true);
      }
    }
    for (const key of keys) key.hidden = key.dataset.keyFor !== scenes[active].key;
    if (focus) tabs[active].focus();
    if (updateUrl && !isExport) {
      const url = new URL(window.location.href);
      url.searchParams.set('scene', scenes[active].key);
      window.history.replaceState(null, '', url);
    }
  }

  function setInteractive(enabled) {
    if (sceneActions.active === enabled) return;
    if (enabled) {
      playing = false;
      sceneActions.open(scenes[active]);
    } else sceneActions.close();
    applyMotionPreference();
    run(scenes[active], false);
    sceneActions.settle();
    interact.setAttribute('aria-pressed', String(enabled));
    showPlayback();
  }

  function setPlaying(value, restart = false) {
    if (value && sceneActions.active) setInteractive(false);
    if (value && reducedMotion.matches && !motionRequested) {
      motionRequested = true;
      applyMotionPreference();
    }
    playing = value;
    run(scenes[active], restart);
    showPlayback();
  }

  function saveFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 3000);
    status.textContent = 'Downloading ' + filename;
  }

  tabs.forEach((tab, index) => tab.addEventListener('click', () => selectScene(index, { updateUrl: true })));
  tablist.addEventListener('keydown', event => {
    let next;
    const forward = horizontalTabs.matches ? 'ArrowRight' : 'ArrowDown';
    const backward = horizontalTabs.matches ? 'ArrowLeft' : 'ArrowUp';
    if (event.key === forward) next = (active + 1) % tabs.length;
    else if (event.key === backward) next = (active + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    selectScene(next, { focus: true, updateUrl: true });
  });

  appearanceSelect.addEventListener('change', () => {
    appearance = appearanceSelect.value;
    if (!isExport) {
      try {
        if (appearance === 'system') localStorage.removeItem(NOIR_THEME);
        else localStorage.setItem(NOIR_THEME, appearance);
      } catch { /* Storage is optional. */ }
    }
    applyAppearance();
    savePreferences();
  });
  presets.forEach(button => button.addEventListener('click', () => setBrand(button.dataset.colour)));
  picker.addEventListener('input', () => setBrand(picker.value));
  hex.addEventListener('input', () => {
    const value = normaliseHex(hex.value);
    if (value) setBrand(value, false);
    else {
      hex.removeAttribute('aria-invalid');
      colourError.hidden = true;
    }
  });
  hex.addEventListener('change', () => {
    const value = normaliseHex(hex.value);
    if (value || !hex.value.trim()) setBrand(value);
    else {
      hex.setAttribute('aria-invalid', 'true');
      colourError.hidden = false;
    }
  });
  interact.addEventListener('click', () => setInteractive(!sceneActions.active));
  toggle.addEventListener('click', () => setPlaying(!playing));
  replay.addEventListener('click', () => setPlaying(true, true));
  download.addEventListener('click', () => {
    const scene = scenes[active];
    const svg = exportSvg(scene, brandHsl, appearance);
    saveFile(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), scene.file);
  });
  bundle.addEventListener('click', event => {
    event.preventDefault();
    const page = originalPage.cloneNode(true);
    page.dataset.exportViewer = 'yes';
    page.dataset.exportAppearance = appearance;
    page.dataset.exportBrand = brand;
    page.dataset.exportScene = scenes[active].key;
    page.dataset.exportMode = sceneActions.active ? 'interact' : 'loop';
    const files = [['animated-isometric-scenes.html', '<!doctype html>\n' + page.outerHTML]];
    for (const scene of scenes) files.push([scene.file, exportSvg(scene, brandHsl, appearance)]);
    saveFile(makeZip(files), 'animated-isometric-scenes.zip');
  });
  reducedMotion.addEventListener('change', () => {
    motionRequested = false;
    playing = !sceneActions.active && !reducedMotion.matches;
    applyMotionPreference();
    run(scenes[active], !sceneActions.active);
    sceneActions.settle();
    showPlayback();
  });
  darkMode.addEventListener('change', applyAppearance);
  const orient = () => tablist.setAttribute('aria-orientation', horizontalTabs.matches ? 'horizontal' : 'vertical');
  horizontalTabs.addEventListener('change', orient);

  const search = new URLSearchParams(window.location.search);
  const requested = isExport ? root.dataset.exportScene : search.get('scene');
  const requestedMode = isExport ? root.dataset.exportMode : search.get('mode');
  const initial = scenes.findIndex(scene => scene.key === requested);
  applyAppearance();
  applyBrand();
  selectScene(Math.max(0, initial));
  if (requestedMode === 'interact') setInteractive(true);
  if (requestedMode === 'loop') {
    setInteractive(false);
    if (!reducedMotion.matches) setPlaying(true, true);
  }
  orient();
  showPlayback();
})();
