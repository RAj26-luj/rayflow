const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));
  
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  
  console.log('Clicking "Fill Demo Login"...');
  await page.click('button:has-text("Fill Demo Login")');
  
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(1000);
    console.log(`[t=${i+1}s] Current URL:`, page.url());
    if (page.url().includes('/overview')) {
      console.log('✅ Navigated to /overview successfully!');
      break;
    }
  }

  await browser.close();
})();
