const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR STACK:', err.stack || err.message);
  });
  
  page.on('console', msg => {
    console.log(`PAGE [${msg.type()}]:`, msg.text());
  });

  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await browser.close();
})();
