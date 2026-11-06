import {test,expect} from '@playwright/test';
import all from '../dist/catalog.js';
import {componentDocument} from '../dist/preview.js';

async function show(page,id,theme='dark') {
  await page.goto('about:blank');
  await page.setContent(componentDocument(all.find(component=>component.id===id),{theme}));
}

for(const theme of ['light','dark']) {
  test(`wizard preserves edits going back and accepts Enter (${theme})`,async({page})=>{
    await show(page,'onboarding-wizard',theme);
    await page.getByRole('textbox',{name:'Workspace name'}).fill('A considered workspace');
    await page.keyboard.press('Enter');
    await page.getByRole('combobox').selectOption('Team collaboration');
    await page.getByRole('button',{name:'Back'}).click();
    await expect(page.getByRole('textbox',{name:'Workspace name'})).toHaveValue('A considered workspace');
    await page.getByRole('button',{name:'Continue'}).click();
    await expect(page.getByRole('combobox')).toHaveValue('Team collaboration');
    await page.getByRole('button',{name:'Continue'}).click();
    await expect(page.locator('.wizard-panel p')).toHaveText('A considered workspace · Team collaboration');
  });
  test(`confirmation updates status and toast dismissal restores focus (${theme})`,async({page})=>{
    await show(page,'confirmation-dialog',theme);
    await page.getByRole('button',{name:'Create workspace',exact:true}).click();
    await page.getByRole('button',{name:"Let's create it"}).click();
    await expect(page.locator('.dialog-status')).toHaveText('✓ Your new workspace is ready.');
    await expect(page.locator('dialog')).not.toBeVisible();
    await show(page,'toast-notification',theme);
    await page.getByRole('button',{name:'Dismiss notification'}).click();
    await expect(page.locator('.toast')).toHaveAttribute('inert','');
    await expect(page.getByRole('button',{name:'Show notification'})).toBeFocused();
    await page.getByRole('button',{name:'Show notification'}).click();
    await expect(page.locator('.toast')).not.toHaveAttribute('inert','');
  });
}
