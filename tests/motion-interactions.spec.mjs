import {test,expect} from '@playwright/test';
import catalog from '../dist/catalog.js';
import {componentDocument} from '../dist/preview.js';

async function mount(page,id,{theme='dark',reducedMotion='no-preference'}={}) {
  await page.goto('about:blank');
  await page.emulateMedia({reducedMotion});
  const component=catalog.find(item=>item.id===id);
  expect(component,`Catalog includes ${id}`).toBeTruthy();
  await page.setContent(componentDocument(component,{theme}),{waitUntil:'load'});
}

for(const theme of ['dark','light']) {
  test(`notes stay inside their canvas with pointer and keyboard in ${theme} mode`,async({page})=>{
    await page.setViewportSize({width:320,height:440});
    await mount(page,'draggable-notes',{theme});
    const note=page.locator('.drag-note').first();
    // The initial ResizeObserver pass places percentage-based notes inside the canvas.
    await expect.poll(()=>note.evaluate(n=>Boolean(n.style.left&&n.style.top))).toBe(true);
    const bounds=await note.boundingBox();
    await page.mouse.move(bounds.x+bounds.width/2,bounds.y+bounds.height/2);
    await page.mouse.down();
    await page.mouse.move(319,439,{steps:8});
    await page.mouse.up();
    await expect.poll(()=>note.evaluate(n=>n.offsetLeft>=0&&n.offsetTop>=0&&n.offsetLeft+n.offsetWidth<=n.parentElement.clientWidth&&n.offsetTop+n.offsetHeight<=n.parentElement.clientHeight)).toBe(true);
    await note.focus();
    for(let i=0;i<35;i++)await page.keyboard.press('ArrowLeft');
    await expect.poll(()=>note.evaluate(n=>n.offsetLeft)).toBe(12);
    for(let i=0;i<35;i++)await page.keyboard.press('ArrowDown');
    await expect.poll(()=>note.evaluate(n=>n.offsetTop+n.offsetHeight<=n.parentElement.clientHeight)).toBe(true);
  });

  test(`charts support keyboard inspection in ${theme} mode`,async({page})=>{
    await mount(page,'area-chart',{theme});
    await page.locator('.area-svg').focus();
    await page.keyboard.press('End');
    await expect(page.locator('#chart-day')).toHaveText('Sunday');
    await expect(page.locator('.area-svg')).toHaveAttribute('aria-valuenow','6');
    await page.keyboard.press('Home');
    await expect(page.locator('#chart-day')).toHaveText('Monday');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#chart-day')).toHaveText('Tuesday');
    await mount(page,'bar-chart',{theme});
    const bar=page.locator('.bar-col').nth(2);
    await bar.focus();
    await page.keyboard.press('Enter');
    await expect(bar).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('#bar-value')).toHaveText('3.8 h');
  });
}

test('notification flyout hides keyboard targets and Escape returns focus',async({page})=>{
  await mount(page,'x-notification-flyout');
  const toggle=page.locator('#flyout-toggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded','false');
  await expect.poll(()=>page.locator('.flyout-panel').evaluate(n=>n.inert)).toBe(true);
  await toggle.click();
  await page.locator('#flyout-clear').focus();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded','false');
  await toggle.click();
  await page.locator('#flyout-clear').click();
  await expect(page.locator('.flyout-message')).toHaveCount(0);
  await expect(page.locator('#flyout-clear')).toBeDisabled();
  await expect(page.locator('.flyout-empty')).toHaveText('All caught up. Enjoy the quiet. ✳');
});

test('reduced motion keeps scramble and counter at their readable final states',async({page})=>{
  await mount(page,'rolling-counter',{reducedMotion:'reduce'});
  await expect(page.locator('#number')).toHaveText('2,048');
  await page.locator('#count-replay').click();
  await expect(page.locator('#number')).toHaveText('2,048');
  await mount(page,'text-scramble',{reducedMotion:'reduce'});
  await page.locator('#decode').click();
  await expect(page.locator('#decode')).toHaveText('DECODE THE FUTURE');
});
