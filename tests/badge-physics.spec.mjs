import {test,expect} from '@playwright/test';

const pendant=(page,id)=>page.locator(`[data-badge="${id}"] .badge-pendant`);
const face=(page,id)=>page.locator(`[data-badge="${id}"] .badge-face`);
const translation=locator=>locator.evaluate(el=>{const m=new DOMMatrixReadOnly(getComputedStyle(el).transform);return {x:m.e,y:m.f};});
async function setup(page){await page.setViewportSize({width:1440,height:1150});await page.goto('/');await expect(page.locator('.badge-world')).toHaveAttribute('style',/scale\(/);}
async function grab(page,id,dx=75,dy=-55){
  const r=await face(page,id).boundingBox(),x=r.x+r.width*.4,y=r.y+r.height*.4;
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+dx,y+dy,{steps:10});
}

test('dragging a badge bends its own fabric, keeps its hook and board fixed, and settles without an idle loop',async({page})=>{
  await page.addInitScript(()=>{const frame=window.requestAnimationFrame;window.scheduledFrames=0;window.requestAnimationFrame=callback=>{window.scheduledFrames++;return frame(callback);};});
  await setup(page);
  const world=await page.locator('.badge-world').getAttribute('style');
  const hook=await page.locator('[data-badge="react"] .badge-hook').boundingBox();
  const ribbon=page.locator('[data-badge="react"] .badge-ribbon'),original=await ribbon.getAttribute('d');
  await grab(page,'react');
  await expect(page.locator('[data-badge="react"]')).toHaveClass(/is-grabbed/);
  const held=await translation(pendant(page,'react'));expect(held.x).toBeGreaterThan(60);expect(held.y).toBeLessThan(-40);
  await expect(ribbon).not.toHaveAttribute('d',original);
  expect(await page.locator('[data-badge="react"] .badge-hook').boundingBox()).toEqual(hook);
  await expect(page.locator('.badge-world')).toHaveAttribute('style',world);
  expect(await translation(pendant(page,'community'))).toEqual({x:0,y:0});
  await page.mouse.up();await page.mouse.move(1420,80);
  await expect(page.locator('.badge-story')).toBeHidden();
  await expect.poll(async()=>Math.abs((await translation(pendant(page,'react'))).x),{timeout:5000}).toBeLessThan(.1);
  await expect(page.locator('.badge-hanging.is-moving')).toHaveCount(0);
  const frames=await page.evaluate(()=>window.scheduledFrames);await page.waitForTimeout(250);
  expect(await page.evaluate(()=>window.scheduledFrames)).toBe(frames);
  await face(page,'react').click();await expect(page.locator('#badgeStoryTitle')).toHaveText('React Advanced');
});

test('moving near fabric excites local independent springs and they return to rest',async({page})=>{
  await setup(page);const svg=await page.locator('[data-badge="react"] .badge-lanyard').boundingBox();
  const x=svg.x+svg.width/2,y=svg.y+svg.height*.65;
  await page.mouse.move(x-25,y);await page.mouse.move(x+25,y,{steps:6});
  await expect.poll(async()=>Math.abs((await translation(pendant(page,'react'))).x)).toBeGreaterThan(.15);
  expect(await translation(pendant(page,'community'))).toEqual({x:0,y:0});
  await page.mouse.move(1420,80);
  await expect(page.locator('.badge-hanging.is-moving')).toHaveCount(0,{timeout:5000});
});

test('fabric can be grabbed directly and badges stay inside the cork while dragged toward an edge',async({page})=>{
  await setup(page);
  const point=await page.locator('[data-badge="react"] .badge-ribbon').evaluate(path=>{const point=path.getPointAtLength(path.getTotalLength()*.3);const p=new DOMPoint(point.x,point.y).matrixTransform(path.getScreenCTM());return {x:p.x,y:p.y};});
  await page.mouse.move(point.x,point.y);await page.mouse.down();await page.mouse.move(point.x+60,point.y-30,{steps:10});
  await expect(page.locator('[data-badge="react"]')).toHaveClass(/is-grabbed/);
  expect((await translation(pendant(page,'react'))).x).toBeGreaterThan(40);
  await page.mouse.up();await page.mouse.move(1420,80);await expect(page.locator('.badge-hanging.is-moving')).toHaveCount(0,{timeout:5000});
  await grab(page,'community',700,650);
  const board=await page.locator('.badge-stage').boundingBox(),card=await face(page,'community').boundingBox();
  expect(card.x).toBeGreaterThanOrEqual(board.x);expect(card.y).toBeGreaterThanOrEqual(board.y);
  expect(card.x+card.width).toBeLessThanOrEqual(board.x+board.width);expect(card.y+card.height).toBeLessThanOrEqual(board.y+board.height);
  await page.mouse.up();await expect(page.locator('.badge-story')).toBeHidden();
});

test('reduced motion keeps direct manipulation but removes ambient movement and spring oscillation',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await setup(page);await grab(page,'react');
  expect((await translation(pendant(page,'react'))).x).toBeGreaterThan(50);
  await page.mouse.up();expect(await translation(pendant(page,'react'))).toEqual({x:0,y:0});
  await expect(page.locator('.badge-hanging.is-moving')).toHaveCount(0);
  const r=await face(page,'react').boundingBox();await page.mouse.move(r.x+15,r.y+20,{steps:6});
  expect(await translation(pendant(page,'react'))).toEqual({x:0,y:0});
  await face(page,'react').click();await expect(page.locator('#badgeStoryTitle')).toHaveText('React Advanced');
});

async function touchPage(browser){
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const page=await context.newPage();await page.goto('/');
  const session=await context.newCDPSession(page);
  const send=(type,points)=>session.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(([x,y,id=1])=>({x,y,id}))});
  return {context,page,send};
}

test('a finger drags just the badge; cancellation springs it back and a fresh tap opens its details',async({browser})=>{
  const {context,page,send}=await touchPage(browser);
  try{
    await page.locator('.badge-filters summary').tap();await page.locator('[data-badge-category="Workshops"]').tap();await page.locator('[data-badge-year="2024"]').tap();await page.locator('.badge-filters summary').tap();
    await face(page,'react').scrollIntoViewIfNeeded();const r=await face(page,'react').boundingBox(),x=r.x+r.width/2,y=r.y+r.height/2;
    const world=await page.locator('.badge-world').getAttribute('style'),scroll=await page.evaluate(()=>scrollY);
    await send('touchStart',[[x,y]]);await send('touchMove',[[x+55,y-45]]);
    await expect(page.locator('[data-badge="react"]')).toHaveClass(/is-grabbed/);
    expect((await translation(pendant(page,'react'))).x).toBeGreaterThan(50);
    await expect(page.locator('.badge-world')).toHaveAttribute('style',world);expect(await page.evaluate(()=>scrollY)).toBe(scroll);
    await send('touchCancel',[]);await expect(page.locator('[data-badge="react"]')).not.toHaveClass(/is-grabbed/);
    await expect(page.locator('.badge-hanging.is-moving')).toHaveCount(0,{timeout:5000});
    await face(page,'react').tap();await expect(page.locator('#badgeStoryTitle')).toHaveText('React Advanced');
  }finally{await context.close();}
});

test('empty-cork swipes scroll the page by default, while Explore board enables panning and pinch',async({browser})=>{
  const {context,page,send}=await touchPage(browser);
  try{
    const stage=page.locator('.badge-stage');await stage.scrollIntoViewIfNeeded();
    await expect(page.locator('#badgeTouchMode')).toHaveAttribute('aria-pressed','false');
    expect(await stage.evaluate(el=>getComputedStyle(el).touchAction)).toBe('pan-y');
    let r=await stage.boundingBox();const before=await page.evaluate(()=>scrollY),world=await page.locator('.badge-world').getAttribute('style');
    const x=r.x+r.width*.87,y=r.y+113;
    await send('touchStart',[[x,y]]);for(let n=1;n<=8;n++)await send('touchMove',[[x,y-n*10]]);await send('touchEnd',[]);
    await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(before);
    await expect(page.locator('.badge-world')).toHaveAttribute('style',world);
    await page.locator('#badgeTouchMode').tap();await stage.scrollIntoViewIfNeeded();
    expect(await stage.evaluate(el=>getComputedStyle(el).touchAction)).toBe('none');
    r=await stage.boundingBox();const px=r.x+r.width*.7,py=r.y+115;
    const initial=await page.locator('.badge-world').getAttribute('style');
    await send('touchStart',[[px,py]]);await send('touchMove',[[px-55,py+20]]);await send('touchEnd',[]);
    await expect(page.locator('.badge-world')).not.toHaveAttribute('style',initial);
    const zoom=await page.locator('#badgeZoom').textContent();
    await send('touchStart',[[px-30,py,1],[px+30,py,2]]);await send('touchMove',[[px-65,py,1],[px+65,py,2]]);await send('touchEnd',[]);
    await expect(page.locator('#badgeZoom')).not.toHaveText(zoom);await expect(page.locator('.badge-story')).toBeHidden();
    await page.locator('#badgeTouchMode').tap();await expect(page.locator('#badgeTouchMode')).toHaveAttribute('aria-pressed','false');
  }finally{await context.close();}
});

test('a second touch switches a badge drag to pinch without leaving it stuck or opening a story',async({browser})=>{
  const {context,page,send}=await touchPage(browser);
  try{
    await page.locator('#badgeTouchMode').tap();await face(page,'react').scrollIntoViewIfNeeded();
    const r=await face(page,'react').boundingBox(),x=r.x+r.width/2,y=r.y+r.height/2;
    await send('touchStart',[[x,y,1]]);await send('touchMove',[[x+20,y-25,1]]);
    await expect(page.locator('[data-badge="react"]')).toHaveClass(/is-grabbed/);
    await send('touchStart',[[x+20,y-25,1],[x+70,y-25,2]]);
    const zoom=await page.locator('#badgeZoom').textContent();
    await send('touchMove',[[x-10,y-25,1],[x+105,y-25,2]]);
    await expect(page.locator('#badgeZoom')).not.toHaveText(zoom);
    await send('touchEnd',[[x-10,y-25,1]]);await send('touchMove',[[x,y-20,1]]);await send('touchEnd',[]);
    await expect(page.locator('.is-grabbed')).toHaveCount(0);await expect(page.locator('.badge-story')).toBeHidden();
    await expect(page.locator('.badge-world')).not.toHaveAttribute('style',/NaN/);
  }finally{await context.close();}
});

test('discovery, dynamic statistics, and the chronological journey reveal the appropriate memories',async({page})=>{
  await setup(page);await expect(page.locator('.badge-statistics')).toContainText('14 badges');await expect(page.locator('.badge-statistics')).toContainText('14 events');await expect(page.locator('.badge-statistics')).toContainText('4 years');
  await page.locator('[data-badge-category="Hackathons"]').click();await page.locator('[data-badge-year="2025"]').click();
  await page.locator('#badgeDiscover').click();await expect(page.locator('#badgeStoryTitle')).toHaveText('Local Hack Day');
  await page.keyboard.press('Escape');await expect(page.locator('#badgeDiscover')).toBeFocused();
  await page.locator('.badge-timeline summary').click();await page.locator('[data-timeline-year="2023"]').click();
  await expect(page.locator('[data-badge]:not(.is-filtered)')).toHaveCount(2);
  await page.locator('#badgeJourneyStart').click();await expect(page.locator('#badgeStoryTitle')).toHaveText('DevConf');
  await page.locator('[data-story-nav="next"]').click();await expect(page.locator('#badgeStoryTitle')).toHaveText('Web Summit');
  await page.keyboard.press('Escape');await expect(page.locator('#badgeJourneyStart')).toBeFocused();
});

test('missing custom badge art and missing event photos have readable fallbacks',async({page})=>{
  await page.route('**/badges/data.js',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('badgeImage:null, photos:[]',`badgeImage:'/missing-badge.png', photos:[{src:'/missing-photo.png',alt:'People at the event',caption:'A good day'}]`)});});
  await setup(page);await expect(page.locator('[data-badge="openai"] .badge-custom-image')).toBeHidden();
  await expect(page.locator('[data-badge="openai"] .badge-event')).toBeVisible();
  await face(page,'openai').click();await expect(page.locator('.badge-photo-missing')).toHaveText('Photo unavailable: People at the event');
  await expect(page.locator('.badge-story-photos figcaption')).toHaveText('A good day');
});

test('small touch screens start with readable, finger-sized badges',async({browser})=>{
  const context=await browser.newContext({viewport:{width:320,height:740},hasTouch:true,isMobile:true});
  try{
    const page=await context.newPage();await page.goto('/');
    await expect(page.locator('.badge-world')).toHaveAttribute('style',/scale\(/);
    const sizes=await page.locator('[data-badge] .badge-face').evaluateAll(items=>items.map(el=>el.getBoundingClientRect().width));
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(320);
    await page.locator('#badgeDiscover').tap();await expect(page.locator('.badge-story')).toBeVisible();
  }finally{await context.close();}
});
