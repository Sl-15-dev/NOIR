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

test('zoom controls, wheel, keyboard and dragging change the board without opening a story',async({page})=>{
  await page.setViewportSize({width:1440,height:1100});await page.goto('/');
  const stage=page.locator('.badge-stage'),world=page.locator('.badge-world');
  await page.locator('[data-zoom="in"]').click();await expect(page.locator('#badgeZoom')).toHaveText('120%');
  const r=await stage.boundingBox();await page.mouse.move(r.x+r.width*.7,r.y+80);await page.mouse.wheel(0,-100);
  await expect.poll(async()=>Number((await page.locator('#badgeZoom').textContent()).replace('%',''))).toBeGreaterThan(120);
  const before=await world.getAttribute('style');
  await page.mouse.move(r.x+r.width*.7,r.y+75);await page.mouse.down();await page.mouse.move(r.x+r.width*.7-110,r.y+110,{steps:12});await page.mouse.up();
  await expect(world).not.toHaveAttribute('style',before);await expect(page.locator('.badge-story')).toBeHidden();
  // Dragging from a card must also suppress its synthetic click.
  const card=await face(page,'google-io').boundingBox();
  await page.mouse.move(card.x+15,card.y+20);await page.mouse.down();await page.mouse.move(card.x-65,card.y+20,{steps:10});await page.mouse.up();
  await expect(page.locator('.badge-story')).toBeHidden();
  await stage.focus();await page.keyboard.press('0');await expect(page.locator('#badgeZoom')).toHaveText('100%');
  await page.keyboard.press('+');await expect(page.locator('#badgeZoom')).toHaveText('120%');
  await page.keyboard.press('-');await expect(page.locator('#badgeZoom')).toHaveText('100%');
});

for(const width of [320,768])test(`responsive board, filters and library navigation work at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});await page.goto('/');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
  if(width<600)await page.locator('.badge-filters summary').click();
  await page.locator('[data-badge-category="Technology"]').click();
  await page.locator('[data-badge-year="2025"]').click();
  await expect(shown(page)).toHaveCount(2);
  if(width<600)await page.locator('.badge-filters summary').click();
  // Keyboard focus pans offscreen cards into view and Enter opens the same details.
  await page.locator('[data-badge="openai"]').focus();await page.keyboard.press('Enter');
  await expect(page.locator('#badgeStoryTitle')).toHaveText('OpenAI DevDay');
  expect(await page.locator('.badge-story').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBeTruthy();
  await page.keyboard.press('Escape');
  await page.locator('#navLibrary').click();await expect(page.locator('#library')).toBeVisible();
  await page.locator('#navBadges').click();await expect(page.locator('#badgeCollection')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
});

test('touch drag and two-finger pinch work without opening an accidental story',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const page=await context.newPage();await page.goto('/');
  await page.locator('#badgeTouchMode').tap();
  const stage=page.locator('.badge-stage');await stage.scrollIntoViewIfNeeded();const r=await stage.boundingBox();
  const cdp=await context.newCDPSession(page);
  const send=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(([x,y,id])=>({x,y,id}))});
  const x=r.x+r.width*.7,y=r.y+r.height*.45;
  await send('touchStart',[[x,y,1]]);await send('touchMove',[[x-80,y+20,1]]);await send('touchEnd',[]);
  await expect(page.locator('.badge-story')).toBeHidden();
  const zoom=await page.locator('#badgeZoom').textContent();
  await send('touchStart',[[x-30,y,1],[x+30,y,2]]);
  await send('touchMove',[[x-65,y,1],[x+65,y,2]]);await send('touchEnd',[]);
  await expect(page.locator('#badgeZoom')).not.toHaveText(zoom);
  await expect(page.locator('.badge-story')).toBeHidden();
  await page.waitForTimeout(450);await page.locator('.badge-filters summary').tap();
  await page.locator('[data-badge-category="Workshops"]').tap();await expect(shown(page)).toHaveCount(3);
  await page.locator('[data-badge-year="2024"]').tap();
  await page.locator('.badge-filters summary').tap();
  await face(page,'react').tap();await expect(page.locator('#badgeStoryTitle')).toHaveText('React Advanced');
  await context.close();
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
  const worldWidth=await page.locator('.badge-world').evaluate(el=>el.offsetWidth);
  expect(worldWidth).toBeGreaterThan(1200);
  await page.locator('[data-badge="new-memory"]').focus();await page.keyboard.press('Enter');
  await expect(page.locator('#badgeStoryTitle')).toHaveText('A new memory');
  const photo=page.getByAltText('Illustrated Lisbon streets');await expect(photo).toBeVisible();
  await expect.poll(()=>photo.evaluate(el=>el.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('.badge-story-photos figcaption')).toHaveText('A little travel keepsake');
  await expect(page.locator('[data-badge="new-memory"] img')).toHaveAttribute('src','./badges/lisbon.svg');
});
