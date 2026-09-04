const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));
  
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  
  const result = await page.evaluate(async () => {
    try {
      const res = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          email: 'arjun@auraathletics.com',
          password: 'demo123',
          userType: 'merchant',
          json: 'true'
        })
      });
      const data = await res.json();
      return { status: res.status, data };
    } catch (e) {
      return { error: e.message };
    }
  });

  console.log('Direct Auth Response:', JSON.stringify(result, null, 2));
  await browser.close();
})();
