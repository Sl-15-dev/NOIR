import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir:'./tests',testMatch:'*.spec.mjs',timeout:120000,workers:2,
  use:{baseURL:'http://127.0.0.1:3100',headless:true,launchOptions:{executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']}},
  webServer:{command:'npm run dev -- --host 127.0.0.1 --port 3100',url:'http://127.0.0.1:3100',reuseExistingServer:!process.env.CI},
});
