import {test,expect} from '@playwright/test';
import {badges} from '../dist/badges/data.js';

const face=(page,id)=>page.locator(`[data-badge="${id}"] .badge-face`);
const shown=page=>page.locator('[data-badge]:not(.is-filtered)');

test('the collection opens each memory, expands the story, and restores keyboard focus',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:1440,height:1100});await page.goto('/');
  await expect(page.locator('#badgeCollection')).toBeVisible();
  await expect(page.locator('#library')).toBeHidden();
  await expect(shown(page)).toHaveCount(badges.length);
  // Every card remains directly clickable, even with the overlapping collection layout.
  for(const badge of badges){
    await face(page,badge.id).click();
    await expect(page.locator('.badge-story')).toBeVisible();
    await expect(page.locator('#badgeStoryTitle')).toHaveText(badge.eventName);
    await expect(page.locator('.badge-story-location')).toContainText(badge.location);
    await expect(page.locator('.badge-story-meta')).toContainText(badge.date);
    await expect(page.locator('.badge-story-meta')).toContainText(badge.role);
    await expect(page.locator('.badge-story-organization')).toHaveText(badge.organization);
    await expect(page.locator('#badgeCollection')).toHaveClass(/has-badge-spotlight/);
    await expect(page.locator(`[data-badge="${badge.id}"]`)).toHaveAttribute('aria-pressed','true');
    await page.locator('.badge-read-more').click();
    await expect(page.locator('#badgeFullStory')).toContainText(badge.fullStory);
    await expect(page.locator('.badge-read-more')).toHaveAttribute('aria-expanded','true');
    await page.keyboard.press('Escape');
    await expect(page.locator('.badge-story')).toBeHidden();
    await expect(page.locator('#badgeCollection')).not.toHaveClass(/has-badge-spotlight/);
    await expect(page.locator(`[data-badge="${badge.id}"]`)).toBeFocused();
  }
  expect(errors).toEqual([]);
});

test('category and year filters combine, empty state resets, and story navigation respects filters',async({page})=>{
  await page.setViewportSize({width:1440,height:1100});await page.goto('/');
  await page.locator('[data-badge-category="Hackathons"]').click();
  await expect(shown(page)).toHaveCount(2);
  await expect(page.locator('[data-badge="config"]')).toHaveAttribute('inert','');
  await page.locator('[data-badge-year="2025"]').click();
  await expect(shown(page)).toHaveCount(1);await expect(page.locator('#badgeCount')).toHaveText('1 of 14 stories');
  await face(page,'hackday').click();
  await page.locator('[data-story-nav="next"]').click();await expect(page.locator('#badgeStoryTitle')).toHaveText('Local Hack Day');
  await page.locator('.badge-story-close').click();
  await page.locator('[data-badge-year="2026"]').click();
  await expect(shown(page)).toHaveCount(0);await expect(page.locator('.badge-empty')).toBeVisible();
  await page.locator('.badge-empty button').click();
  await expect(shown(page)).toHaveCount(badges.length);await expect(page.locator('.badge-empty')).toBeHidden();
  await expect(page.locator('[data-badge-year="2026"]')).toHaveAttribute('aria-pressed','false');
});

test('the board stays fixed while wheel, keyboard and empty-cork dragging preserve badge inspection',async({page})=>{
  await page.setViewportSize({width:1440,height:1100});await page.goto('/');
  await expect(page.locator('.badge-zoom-tools,[data-zoom],#badgeTouchMode')).toHaveCount(0);
  const stage=page.locator('.badge-stage'),world=page.locator('.badge-world');
  await expect(world).toHaveAttribute('style',/scale\(/);const before=await world.getAttribute('style');
  const r=await stage.boundingBox();await page.mouse.move(r.x+r.width*.7,r.y+80);await page.mouse.wheel(0,-100);
  await page.mouse.down();await page.mouse.move(r.x+r.width*.7-100,r.y+100,{steps:10});await page.mouse.up();
  await stage.focus();await page.keyboard.press('+');await page.keyboard.press('ArrowLeft');
  await expect(world).toHaveAttribute('style',before);
  await face(page,'react').click();await expect(page.locator('#badgeStoryTitle')).toHaveText('React Advanced');
});

for(const width of [320,768])test(`responsive board, filters and library navigation work at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});await page.goto('/');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
  await page.locator('[data-badge-category="Technology"]').click();
  await page.locator('[data-badge-year="2025"]').click();
  await expect(shown(page)).toHaveCount(2);
  // Keyboard focus and Enter open badge details without moving the board.
  await page.locator('[data-badge="openai"]').focus();await page.keyboard.press('Enter');
  await expect(page.locator('#badgeStoryTitle')).toHaveText('OpenAI DevDay');
  expect(await page.locator('.badge-story').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBeTruthy();
  await page.keyboard.press('Escape');
  await page.locator('#navLibrary').click();await expect(page.locator('#library')).toBeVisible();
  await page.locator('#navBadges').click();await expect(page.locator('#badgeCollection')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
});

test('warm collection survives theme changes and respects reduced motion',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await page.locator('#themeToggle').click();await expect(page.locator('#badgeCollection')).toBeVisible();
  const transition=await page.locator('.badge-swing').first().evaluate(el=>getComputedStyle(el).transitionDuration);
  expect(transition.split(',').every(v=>parseFloat(v)===0)).toBeTruthy();
  await page.locator('[data-badge="config"]').focus();await page.keyboard.press('Enter');
  await expect(page.locator('#badgeStoryTitle')).toHaveText('Config');
  expect(await page.locator('.badge-story').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
});

test('adding a data record grows the board and renders custom artwork and optional photos',async({page})=>{
  await page.route('**/badges/data.js',async route=>{
    const response=await route.fetch();
    const extra=`badges.push({...badges[0],id:'new-memory',eventName:'A new memory',badgeImage:'./badges/lisbon.svg',photos:[{src:'./badges/lisbon.svg',alt:'Illustrated Lisbon streets',caption:'A little travel keepsake'}]});\nconst strapLengths=`;
    await route.fulfill({response,body:(await response.text()).replace('const strapLengths=',extra)});
  });
  await page.goto('/');await expect(shown(page)).toHaveCount(15);
  await expect(page.locator('#badgeCount')).toHaveText('15 stories & counting');
  await expect(page.locator('.badge-stage')).toHaveAttribute('data-columns','4');
  const boardHeight=await page.locator('.badge-world').evaluate(el=>el.offsetHeight);
  expect(boardHeight).toBeGreaterThan(340);
  await page.locator('[data-badge="new-memory"]').focus();await page.keyboard.press('Enter');
  await expect(page.locator('#badgeStoryTitle')).toHaveText('A new memory');
  const photo=page.getByAltText('Illustrated Lisbon streets');await expect(photo).toBeVisible();
  await expect.poll(()=>photo.evaluate(el=>el.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('.badge-story-photos figcaption')).toHaveText('A little travel keepsake');
  await expect(page.locator('[data-badge="new-memory"] img')).toHaveAttribute('src','./badges/lisbon.svg');
});
