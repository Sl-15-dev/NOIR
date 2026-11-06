import {test, expect} from '@playwright/test';
import all from '../dist/catalog.js';
import {componentDocument} from '../dist/preview.js';

async function mount(page,id,theme='dark') {
  await page.goto('about:blank');
  await page.setViewportSize({width:320,height:560});
  await page.setContent(componentDocument(all.find(component=>component.id===id),{theme}));
}

test('combobox selects with Enter, reopens all options, and restores focus on Escape',async({page})=>{
  await mount(page,'searchable-combobox');
  const input=page.getByRole('combobox');
  await input.fill('studio');
  await input.press('Enter');
  await expect(input).toHaveValue('The studio');
  await expect(page.getByRole('listbox')).toBeHidden();
  await input.blur();
  await input.focus();
  await expect(page.getByRole('option')).toHaveCount(4);
  await input.press('ArrowDown');
  await page.keyboard.press('Escape');
  await expect(input).toBeFocused();
  await expect(page.getByRole('listbox')).toBeHidden();
});

test('upload rejects unsupported types and oversized files, then accepts an image',async({page})=>{
  await mount(page,'upload-dropzone');
  const input=page.locator('input[type=file]');
  await input.setInputFiles({name:'program.exe',mimeType:'application/octet-stream',buffer:Buffer.from('invalid')});
  await expect(page.locator('.upload-result')).toContainText('image or PDF');
  await input.setInputFiles({name:'large.png',mimeType:'image/png',buffer:Buffer.alloc(10*1024*1024+1)});
  await expect(page.locator('.upload-result')).toContainText('smaller than 10 MB');
  await input.setInputFiles({name:'sample.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>')});
  await expect(page.locator('.upload-result')).toContainText('sample.svg');
  await expect(page.locator('.upload-result')).toContainText('ready locally');
});

test('kanban arrow moves a card and updates counts on a narrow screen',async({page})=>{
  await mount(page,'mini-kanban');
  await page.locator('[data-lane="0"] article button').first().click();
  await expect(page.locator('[data-lane="0"] article')).toHaveCount(1);
  await expect(page.locator('[data-lane="1"] article')).toHaveCount(2);
  await expect(page.locator('[data-lane="1"] header b')).toHaveText('2');
  expect(await page.locator('.kanban-board').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(1);
});

test('collapsed sidebar keeps named keyboard destinations and selected state',async({page})=>{
  await mount(page,'mini-sidebar');
  await page.getByRole('button',{name:'Toggle sidebar'}).click();
  await expect(page.getByRole('button',{name:'Toggle sidebar'})).toHaveAttribute('aria-expanded','false');
  await page.getByRole('button',{name:'Settings',exact:true}).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.sidebar-page h3')).toHaveText('Settings');
  await expect(page.getByRole('button',{name:'Settings',exact:true})).toHaveAttribute('aria-current','page');
});

for(const theme of ['dark','light']) {
  test(`color picker keeps native values and readable custom dark surfaces in ${theme} mode`,async({page})=>{
    await mount(page,'color-picker',theme);
    await page.getByRole('button',{name:'Soft gray'}).click();
    await expect(page.locator('input[type=color]')).toHaveValue('#c6c6c6');
    await expect(page.locator('.color-hex')).toContainText('#C6C6C6');
    await page.locator('input[type=color]').evaluate(input=>{input.value='#050505';input.dispatchEvent(new Event('input',{bubbles:true}));});
    await expect(page.locator('.color-preview h2')).toHaveCSS('color','rgb(255, 255, 255)');
  });

  test(`inverse artwork preserves foreground contrast in ${theme} mode`,async({page})=>{
    for(const [id,textSelector,backgroundSelector] of [
      ['horizontal-gallery','.study-two b','.study-two'],
      ['before-after-slider','.comp-after h2','.comp-after'],
      ['masonry-layout','.type-one b','.type-one'],
      ['social-post','.post-art>span','.post-art'],
    ]) {
      await mount(page,id,theme);
      const contrast=await page.evaluate(([textSelector,backgroundSelector])=>{
        const rgb=value=>value.match(/[\d.]+/g).slice(0,3).map(Number);
        const luminance=values=>values.map(value=>{const channel=value/255;return channel<=.04045?channel/12.92:((channel+.055)/1.055)**2.4;}).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);
        const levels=[luminance(rgb(getComputedStyle(document.querySelector(textSelector)).color)),luminance(rgb(getComputedStyle(document.querySelector(backgroundSelector)).backgroundColor))].sort((a,b)=>a-b);
        return (levels[1]+.05)/(levels[0]+.05);
      },[textSelector,backgroundSelector]);
      expect(contrast,`${id} text contrast`).toBeGreaterThanOrEqual(4.5);
    }
  });
}
