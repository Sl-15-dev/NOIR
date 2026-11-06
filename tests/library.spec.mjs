import {test,expect} from '@playwright/test';
import all from '../dist/catalog.js';
import {componentDocument} from '../dist/preview.js';
for(const width of [320,960])for(const theme of ['dark','light'])test(`all ${all.length} component exports render at ${width}px in ${theme}`,async({page})=>{
  await page.setViewportSize({width,height:500});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const c of all){
    await page.goto('about:blank');
    await page.setContent(componentDocument(c,{theme}));
    await page.waitForTimeout(65);
    expect(errors,`${c.id} runtime errors`).toEqual([]);
    const layout=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,bg:getComputedStyle(document.body).backgroundColor,text:getComputedStyle(document.body).color}));
    expect(layout.width,`${c.id} horizontal overflow`).toBeLessThanOrEqual(layout.viewport+1);
    expect(layout.bg).not.toBe(layout.text);
  }
});
test('library theme, removed categories, search, preview, saved state and export work',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page.locator('.component-card')).toHaveCount(18);
  await expect(page.locator('#categoryFilter option')).toHaveCount(11);
  await page.locator('#themeToggle').click();
  const theme=await page.locator('html').getAttribute('data-theme');
  await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
  await page.locator('#filterSearch').fill('Physical spring');await expect(page.locator('.component-card')).toHaveCount(1);
  await page.locator('.card-save').click();await expect(page.locator('.card-save')).toHaveAttribute('aria-pressed','true');
  await page.locator('.card-open').click();await expect(page.locator('#componentDialog')).toBeVisible();
  await page.locator('[data-canvas="light"]').click();
  const frame=page.frameLocator('#previewViewport iframe');await expect(frame.locator('html')).toHaveAttribute('data-theme','light');
  await frame.locator('#spring-play').click();
  await page.locator('[data-detail-tab="code"]').click();await page.locator('[data-code="full"]').click();
  await expect(page.locator('#codeContent')).toContainText('data-theme="light"');
  const downloadPromise=page.waitForEvent('download');await page.locator('#downloadDemo').click();const download=await downloadPromise;
  expect(download.suggestedFilename()).toBe('noir-physical-spring.html');
  await page.locator('#closeDetail').click();await page.locator('#searchTrigger').click();await page.locator('#commandSearch').fill('no-match-noir');await page.locator('#commandSearch').press('ArrowDown');await page.locator('#closeSearch').click();
  expect(errors).toEqual([]);
});
test('narrow library layout and navigation remain usable',async({page})=>{
  await page.setViewportSize({width:320,height:720});await page.goto('/');
  await page.locator('#mobileMenu').click();await page.locator('[data-category="layouts"]').click();
  await expect(page.locator('#libraryTitle')).toHaveText('Layouts & grids');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(320);
  await page.locator('.card-open').first().click();await expect(page.locator('#componentDialog')).toBeVisible();
  expect(await page.locator('#componentDialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBeTruthy();
});
