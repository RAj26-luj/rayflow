const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));
  
  console.log('Navigating to /login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  
  console.log('Filling demo credentials...');
  await page.fill('input[type="email"]', 'arjun@auraathletics.com');
  await page.fill('input[type="password"]', 'demo123');
  
  console.log('Submitting form...');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);
  
  console.log('Final URL:', page.url());
  const body = await page.innerText('body');
  console.log('Body preview:', body.substring(0, 300));
  await browser.close();
})();
