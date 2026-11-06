import {test,expect} from '@playwright/test';
import all from '../dist/catalog.js';
import {componentDocument} from '../dist/preview.js';

const studioIds=[
  'adaptive-bento','resizable-workspace','masonry-journal','expanding-gallery','sticky-reading-layout',
  'physical-spring','flip-sort-grid','elastic-gesture','drawn-route','shared-indicator',
  'studio-mask-reveal','studio-type-weight','studio-circular-type','studio-reading-highlight','studio-glyph-wave','studio-outline-type',
  'contour-field','paper-grain','cursor-lumen','constellation-lattice','moire-interference','light-curtain',
];
async function show(page,id,options={}){
  const component=all.find(c=>c.id===id);
  expect(component,`Missing studio component ${id}`).toBeTruthy();
  // Each export is its own document; clear global lexical declarations first.
  await page.goto('about:blank');
  await page.setContent(componentDocument(component,options));
}

test('typography controls change the rendered specimen',async({page})=>{
  await show(page,'studio-type-weight');
  await page.locator('#weight-range').fill('900');
  await expect(page.locator('#weight-word')).toHaveCSS('font-weight','900');
  await expect(page.locator('#weight-output')).toHaveText('900');

  await show(page,'studio-outline-type');
  await page.locator('#ink-range').fill('80');
  await expect(page.locator('#ink-output')).toHaveText('80%');
  expect(await page.locator('.ink-copy').evaluate(el=>el.style.getPropertyValue('--ink'))).toBe('80%');

  await show(page,'studio-circular-type');
  await page.locator('#type-angle').fill('180');
  await expect(page.locator('#type-rotor')).toHaveCSS('transform','matrix(-1, 0, 0, -1, 0, 0)');
  await page.locator('#type-spin').click();
  await expect(page.locator('#type-spin')).toHaveAttribute('aria-pressed','true');
  expect(await page.locator('#type-rotor').evaluate(el=>el.getAnimations().length)).toBe(1);
  await page.locator('#type-spin').click();
  expect(await page.locator('#type-rotor').evaluate(el=>el.getAnimations().length)).toBe(0);
});

test('reading layouts report actual scroll position and update the outline',async({page})=>{
  await show(page,'studio-reading-highlight');
  const article=page.locator('.reading-scroll');
  await article.focus();await article.press('End');
  await expect(page.locator('#reading-progress')).toHaveText('100%');
  await expect(page.locator('.reading-scroll span').last()).toHaveClass('read');

  await show(page,'sticky-reading-layout');
  await page.locator('[data-section="read-finish"]').click();
  await expect(page.locator('[data-section="read-finish"]')).toHaveAttribute('aria-current','true');
  expect(await page.locator('.reading-layout article').evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
});

test('background controls alter their visual parameters',async({page})=>{
  await show(page,'paper-grain',{theme:'light'});
  await page.locator('#grain-density').fill('40');
  await expect(page.locator('.grain-overlay')).toHaveCSS('opacity','0.4');
  await expect(page.locator('#grain-value')).toHaveText('40%');

  await show(page,'cursor-lumen');
  await page.locator('#lumen-x').fill('80');
  expect(await page.locator('.lumen-demo').evaluate(el=>el.style.getPropertyValue('--lx'))).toBe('80%');

  await show(page,'moire-interference');
  await page.locator('#moire-angle').fill('20');
  await expect(page.locator('#moire-value')).toHaveText('20°');
  expect(await page.locator('#moire-turn').evaluate(el=>el.style.transform)).toBe('rotate(20deg)');

  await show(page,'constellation-lattice');
  await page.locator('#lattice-strength').fill('80');
  expect(await page.locator('.lattice-demo').evaluate(el=>el.style.getPropertyValue('--signal'))).toBe('0.8');
});

test('layout controls reorganize content and preserve entries',async({page})=>{
  await page.setViewportSize({width:320,height:500});
  await show(page,'adaptive-bento');
  await page.locator('#bento-toggle').click();
  await expect(page.locator('.adaptive-bento')).toHaveClass('adaptive-bento focus');
  expect(await page.locator('.adaptive-bento').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(1);

  await show(page,'resizable-workspace');
  await page.locator('#split-range').fill('60');
  await expect(page.locator('#split-value')).toHaveText('60 / 40');
  expect(await page.locator('.split-workspace').evaluate(el=>el.style.getPropertyValue('--split'))).toBe('60%');

  await show(page,'masonry-journal');
  const original=await page.locator('.journal-grid article').allTextContents();
  await page.locator('#journal-shuffle').click();
  const rearranged=await page.locator('.journal-grid article').allTextContents();
  expect(rearranged[0]).toBe(original[1]);
  expect([...rearranged].sort()).toEqual([...original].sort());

  await show(page,'expanding-gallery');
  await page.locator('.gallery-panel').nth(1).click();
  await expect(page.locator('.gallery-panel').nth(1)).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#gallery-caption')).toContainText('Rhythm');
});

test('spring, FLIP and bounded gesture controls produce their intended movement',async({page})=>{
  await page.setViewportSize({width:320,height:500});
  await show(page,'physical-spring');
  await page.locator('#spring-play').click();
  await expect(page.locator('#spring-state')).toHaveText('Resting right');
  await expect.poll(()=>page.locator('.spring-orb').evaluate(el=>el.getAnimations().some(a=>a.playState==='running'))).toBe(false);
  const bounds=await page.locator('.spring-track').evaluate(el=>({right:el.getBoundingClientRect().right,orbRight:el.querySelector('.spring-orb').getBoundingClientRect().right}));
  expect(Math.abs(bounds.right-bounds.orbRight)).toBeLessThan(1);

  await show(page,'flip-sort-grid');
  await page.locator('#flip-sort').click();
  expect(await page.locator('.flip-item').evaluateAll(items=>items.map(el=>el.dataset.order))).toEqual(['5','4','3','2','1','0']);
  await page.locator('#flip-sort').click();
  expect(await page.locator('.flip-item').evaluateAll(items=>items.map(el=>el.dataset.order))).toEqual(['0','1','2','3','4','5']);

  await show(page,'elastic-gesture');
  const tile=page.locator('.gesture-tile');await tile.focus();
  for(let i=0;i<30;i++)await tile.press('ArrowRight');
  expect(await tile.evaluate(el=>el.getBoundingClientRect().right<=el.parentElement.getBoundingClientRect().right)).toBeTruthy();
  expect(await tile.evaluate(el=>el.style.transform)).not.toBe('translate(0px, 0px)');
  await tile.press('Escape');
  await expect(page.locator('#gesture-value')).toHaveText('Centered');
  expect(await tile.evaluate(el=>el.style.transform)).toBe('translate(0px, 0px)');
});

test('route selection and keyboard tabs update the visible content',async({page})=>{
  await show(page,'drawn-route');
  const wave=await page.locator('#route-path').getAttribute('d');
  await page.locator('[data-route="step"]').click();
  expect(await page.locator('#route-path').getAttribute('d')).not.toBe(wave);
  await expect(page.locator('.route-canvas')).toHaveAttribute('aria-label','Animated step path');
  await expect(page.locator('[data-route="wave"]')).toHaveAttribute('aria-pressed','false');

  await show(page,'shared-indicator');
  await page.locator('[data-tab="0"]').focus();await page.keyboard.press('End');
  await expect(page.locator('[data-tab="2"]')).toHaveAttribute('aria-selected','true');
  await expect(page.locator('[data-tab="2"]')).toBeFocused();
  await expect(page.locator('#shared-content')).toContainText('Keep what contributes.');
  await expect(page.locator('#shared-content')).toHaveAttribute('aria-labelledby','shared-tab-2');
  await page.keyboard.press('Home');
  await expect(page.locator('#shared-content')).toContainText('Follow your curiosity.');
});

test('all 22 new studies settle without running animation under reduced motion',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  expect(all.filter(c=>studioIds.includes(c.id))).toHaveLength(22);
  for(const id of studioIds){
    await show(page,id,{theme:'light'});
    await expect.poll(()=>page.evaluate(()=>document.getAnimations().some(a=>a.playState==='running')),{message:id}).toBe(false);
  }
  await show(page,'physical-spring');await page.locator('#spring-play').click();
  await expect(page.locator('#spring-state')).toHaveText('Resting right');
  expect(await page.evaluate(()=>document.getAnimations().some(a=>a.playState==='running'))).toBe(false);
  expect(errors).toEqual([]);
});
