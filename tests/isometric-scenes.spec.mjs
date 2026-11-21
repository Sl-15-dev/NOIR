import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

const manifest = JSON.parse(await readFile(new URL('../scripts/isometric-scenes/scenes.json', import.meta.url), 'utf8'));
const galleryPath = '/isometric-scenes/';
const activeMount = '.preview-panel:not([hidden]) .preview-mount';

function scenePaint(page) {
  return page.locator(activeMount).evaluate(mount => {
    const colours = mount.shadowRoot.querySelectorAll('[fill], [stroke], [stop-color]');
    return Array.from(colours).map(node => [node.getAttribute('fill'), node.getAttribute('stroke'), node.getAttribute('stop-color')]);
  });
}

test('NOIR navigation opens the gallery and keeps the library theme', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('noir-theme', 'dark'));
  for (const origin of ['/#components', '/#badges']) {
    await page.goto(origin);
    const link = page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Scenes', exact: true });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/isometric-scenes\/$/);
    await expect(page.getByRole('heading', { name: 'Isometric scenes', exact: true })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('tab')).toHaveCount(manifest.length);
  }
  await page.getByRole('navigation', { name: 'NOIR navigation' }).getByRole('link', { name: 'Components' }).click();
  await expect(page).toHaveURL(/#components$/);
});

test('scenes respond to selection, reduced motion, brand colours and downloads', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 820 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${galleryPath}?scene=checkout-terminal`);
  await expect(page.getByRole('tab', { name: 'Checkout Terminal', exact: true })).toHaveAttribute('aria-selected', 'true');
  const svg = page.locator(activeMount).locator('svg');
  await expect(svg).toBeVisible();
  expect(await svg.evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
  const originalPaint = await scenePaint(page);
  await page.getByRole('button', { name: 'Teal', exact: true }).click();
  expect(await scenePaint(page)).not.toEqual(originalPaint);
  await page.getByLabel('Appearance').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect.poll(() => svg.evaluate(node => node.getAnimations({ subtree: true }).length)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect.poll(() => svg.evaluate(node => node.getAnimations({ subtree: true }).every(animation => animation.playState === 'paused'))).toBe(true);

  for (const scene of manifest) {
    await page.getByRole('tab', { name: scene.title, exact: true }).click();
    await expect(svg.locator('title')).not.toBeEmpty();
    await expect(page).toHaveURL(new RegExp(`\\?scene=${scene.key}$`));
  }
  const last = manifest.at(-1);
  const svgDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download SVG' }).click();
  const asset = await svgDownload;
  expect(asset.suggestedFilename()).toBe(last.file);
  expect(await readFile(await asset.path(), 'utf8')).toMatch(/<svg\b/);
  const zipDownload = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download all scenes + preview' }).click();
  const archive = await zipDownload;
  expect(archive.suggestedFilename()).toBe('animated-isometric-scenes.zip');
  const zipBytes = await readFile(await archive.path());
  expect(zipBytes.subarray(0, 4)).toEqual(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  for (const scene of manifest) expect(zipBytes.includes(scene.file)).toBe(true);
});

test('hotspots trigger one-shot actions and remain keyboard operable', async ({ page }) => {
  await page.goto(`${galleryPath}?scene=access-key&mode=interact`);
  const stage = page.getByRole('region', { name: 'Scene actions' });
  const result = stage.getByRole('status');
  const svg = page.locator(activeMount).locator('svg');
  await expect(stage).toBeVisible();
  await expect(page.getByRole('button', { name: 'Interact' })).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.preview-hotspots [data-action="open"] .preview-hit-dot').click();
  await expect(result).toHaveText('The latch releases and the door swings open.');
  const times = await svg.evaluate(node => node.getAnimations({ subtree: true }).map(animation => [animation.playState, animation.currentTime]));
  expect(times.length).toBeGreaterThan(0);
  expect(times.every(([state, time]) => state === 'paused' && time === 4530)).toBe(true);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const lock = stage.getByRole('button', { name: 'Lock vault' });
  await lock.focus();
  await page.keyboard.press('Enter');
  await expect(result).toHaveText('The vault door closes and locks.');
  await expect.poll(() => svg.evaluate(node => {
    const animations = node.getAnimations({ subtree: true });
    return animations.length > 0 && animations.every(animation => Math.abs(animation.currentTime - 8050) < 1 && animation.playState === 'paused');
  })).toBe(true);
  await page.getByRole('button', { name: 'Interact' }).click();
  await expect(stage).toBeHidden();
  expect(await svg.evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
});

test('Siyaq assembles a case from the selected sources', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${galleryPath}?scene=siyaq-call-brief`);
  const stage = page.getByRole('region', { name: 'Scene actions' });
  const result = stage.getByRole('status');
  const svg = page.locator(activeMount).locator('svg');
  const part = name => svg.locator(`[data-si-part="${name}"]`);
  const brief = stage.getByRole('button', { name: 'Build brief' });
  const answer = stage.getByRole('button', { name: 'Answer call' });
  const save = stage.getByRole('button', { name: 'Save record' });
  await expect(brief).toBeDisabled();
  await expect(answer).toBeDisabled();
  await expect(save).toBeDisabled();
  await expect(part('brief')).toHaveCSS('opacity', '0');
  await page.locator('.preview-hotspots [data-action="email"] .preview-hit-dot').click();
  await expect(part('email')).toHaveAttribute('data-si-selected', '');
  await expect(result).toContainText('revised delivery estimate');
  const chat = stage.getByRole('button', { name: 'Add chat history' });
  await chat.focus();
  await page.keyboard.press('Enter');
  await expect(chat).toHaveAttribute('aria-pressed', 'true');
  await brief.click();
  await expect(part('brief')).toHaveCSS('opacity', '1');
  await expect(result).toContainText('delivery window was missed');
  await expect(result).toContainText('Confirm the revised delivery estimate');
  await answer.click();
  await expect(part('transcript')).toHaveCSS('opacity', '1');
  await expect(result).toContainText('أين وصل طلبي؟');
  await save.click();
  await expect(part('saved')).toHaveCSS('opacity', '1');
  await expect(result).toContainText('Example interaction saved');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await stage.getByRole('button', { name: 'Reset case' }).click();
  await expect(brief).toBeDisabled();
  await expect(part('saved')).toHaveCSS('opacity', '0');
});
