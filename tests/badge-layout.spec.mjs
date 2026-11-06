import {test,expect} from '@playwright/test';

for(const width of [1440,1024,768,640,390,320])test(`portfolio geometry and compact landscape board at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});await page.goto('/');
  const frame=Math.min(740,width-(width>=768?40:24)),padding=width>=640?24:20,content=frame-padding*2;
  await expect(page.locator('#previewFrameWidth')).toHaveText(String(frame));
  await expect(page.locator('#previewContentWidth')).toHaveText(String(content));
  const geometry=await page.evaluate(()=>{
    const box=selector=>document.querySelector(selector).getBoundingClientRect().toJSON();
    return {frame:box('#badgeCollection'),timeline:box('.badge-timeline'),nav:box('.topbar'),stage:box('.badge-stage'),filters:box('.badge-filters'),wood:box('.badge-frame'),cards:[...document.querySelectorAll('[data-badge] .badge-face')].map(el=>el.getBoundingClientRect().toJSON()),overflow:document.documentElement.scrollWidth};
  });
  expect(geometry.frame.width).toBeCloseTo(frame,0);expect(geometry.frame.x).toBeCloseTo((width-frame)/2,0);
  expect(geometry.timeline.width).toBeCloseTo(content,0);expect(geometry.nav.width).toBe(width);expect(geometry.nav.x).toBe(0);
  expect(geometry.filters.x).toBeGreaterThanOrEqual(geometry.stage.x);
  expect(geometry.wood.width).toBeLessThanOrEqual(640);
  expect(geometry.stage.width/geometry.stage.height).toBeCloseTo(1228/800,2);
  expect(geometry.wood.height).toBeLessThan(geometry.wood.width);
  expect(geometry.overflow).toBe(width);
  const hooks=await page.locator('[data-badge]').evaluateAll(items=>items.map(el=>parseFloat(el.style.top)));
  expect(Math.max(...hooks)-Math.min(...hooks)).toBeLessThanOrEqual(6);
  for(const card of geometry.cards){expect(card.x).toBeGreaterThanOrEqual(geometry.stage.x);expect(card.right).toBeLessThanOrEqual(geometry.stage.right+1);expect(card.bottom).toBeLessThan(geometry.stage.bottom);}
});

test('filters preserve the compact frame dimensions',async({page})=>{
  await page.goto('/');const full=await page.locator('.badge-stage').evaluate(el=>el.offsetHeight);
  await page.locator('[data-badge-category="Technology"]').click();
  await page.locator('[data-badge-year="2025"]').click();
  await expect(page.locator('[data-badge]:not(.is-filtered)')).toHaveCount(2);
  await expect.poll(()=>page.locator('.badge-stage').evaluate(el=>el.offsetHeight)).toBe(full);
  await page.locator('#badgeYearReset').click();await page.locator('[data-badge-category="All"]').click();
  await expect(page.locator('[data-badge]:not(.is-filtered)')).toHaveCount(14);
  await expect.poll(()=>page.locator('.badge-stage').evaluate(el=>el.offsetHeight)).toBe(full);
});


for(const width of [390,1440])test(`story inspection uses ${width<768?'a bottom sheet':'an anchored panel'} at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});await page.goto('/');
  await page.locator('[data-badge="openai"] .badge-face').click();
  await expect(page.locator('.badge-inspection-art .badge-face')).toBeVisible();
  const dialog=await page.locator('.badge-story').boundingBox();
  expect(dialog.x).toBeGreaterThanOrEqual(0);expect(dialog.x+dialog.width).toBeLessThanOrEqual(width);
  if(width<768)await expect.poll(async()=>{const r=await page.locator('.badge-story').boundingBox();return Math.abs(r.y+r.height-900);}).toBeLessThan(.5);
  await page.keyboard.press('Escape');await expect(page.locator('[data-badge="openai"]')).toBeFocused();
});
