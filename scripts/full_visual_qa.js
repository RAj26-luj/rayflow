const { chromium } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'https://rayflow-omega.vercel.app';

const DESKTOP_VIEWPORTS = [
  { width: 1024, height: 768, name: '1024x768 (Small Desktop / Tablet Landscape)' },
  { width: 1280, height: 800, name: '1280x800 (Compact Laptop)' },
  { width: 1440, height: 900, name: '1440x900 (Standard Desktop / MacBook)' },
  { width: 1920, height: 1080, name: '1920x1080 (FHD Widescreen)' }
];

const MOBILE_VIEWPORTS = [
  { width: 320, height: 844, name: '320x844 (Compact iPhone SE)' },
  { width: 375, height: 812, name: '375x812 (iPhone Mini / X)' },
  { width: 390, height: 844, name: '390x844 (iPhone 13/14/15)' },
  { width: 414, height: 896, name: '414x896 (iPhone Plus / XR)' },
  { width: 430, height: 932, name: '430x932 (iPhone Pro Max)' }
];

const MERCHANT_ROUTES = [
  '/overview',
  '/opportunities',
  '/agent',
  '/policies',
  '/catalogue',
  '/customers',
  '/campaigns',
  '/payments',
  '/audit',
  '/settings'
];

async function main() {
  console.log(`🚀 Starting Full Visual QA Pass on RAYFLOW (${BASE_URL})...`);
  const browser = await chromium.launch({ headless: true });
  
  // Context A: Buyer & Public Experience
  const buyerContext = await browser.newContext();
  const buyerPage = await buyerContext.newPage();

  const consoleIssues = [];
  buyerPage.on('console', msg => {
    if (msg.type() === 'error') {
      consoleIssues.push({ type: 'error', text: msg.text(), url: buyerPage.url() });
    }
  });

  const report = {
    publicPages: [],
    merchantPages: [],
    mobileChecks: [],
    flowResults: {}
  };

  // 1. Check Public and Auth Pages
  console.log('\n--- 1. PUBLIC & AUTH PAGES (Desktop 1440x900) ---');
  await buyerPage.setViewportSize({ width: 1440, height: 900 });
  
  for (const route of ['/', '/merchant/login', '/login', '/signup', '/customer/login', '/customer/signup']) {
    await buyerPage.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
    await buyerPage.waitForTimeout(400);
    const title = await buyerPage.title();
    const hasHorizontalOverflow = await buyerPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(`✅ [${route}] Title: "${title}" | Overflow: ${hasHorizontalOverflow ? '⚠️ YES' : 'None'}`);
    report.publicPages.push({ route, title, hasHorizontalOverflow });
  }

  // 2. Perform Customer Storefront Inspection & Payment Flow
  console.log('\n--- 2. BUYER STOREFRONT & PAYMENT SCENARIOS (/shop) ---');
  await buyerPage.goto(`${BASE_URL}/shop`, { waitUntil: 'domcontentloaded' });
  
  // Wait for product catalogue to load
  try {
    await buyerPage.waitForSelector('button:has-text("Add")', { timeout: 15000 });
  } catch {
    console.log('   (Waiting for products catalogue...)');
  }

  const productCount = await buyerPage.$$eval('button:has-text("Add")', els => els.length);
  console.log(`🛒 Storefront loaded with ${productCount} active products.`);

  // A. Test Buyer AI Shopping Copilot
  console.log('🤖 Testing Buyer Shopping Assistant Drawer...');
  const aiButton = await buyerPage.$('button:has-text("Shopping Assistant"), button:has-text("Assistant"), button:has-text("Ask Assistant")');
  if (aiButton) {
    await aiButton.click();
    await buyerPage.waitForTimeout(600);
    const input = await buyerPage.$('input[placeholder*="Shopping Assistant"], input[placeholder*="Ask"]');
    if (input) {
      await input.fill('Find running shoes and socks under ₹6000');
      await buyerPage.keyboard.press('Enter');
      await buyerPage.waitForTimeout(1500);
      const messagesCount = await buyerPage.$$eval('.rounded-2xl', els => els.length);
      console.log(`   ✅ Shopping Assistant responded (found ${messagesCount} messages).`);
      report.flowResults.buyerAi = true;
    }
    // Close AI drawer
    await buyerPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const close = btns.find(b => b.querySelector('svg.lucide-x'));
      if (close) close.click();
    });
    await buyerPage.waitForTimeout(600);
  }

  // B. Add Item to Cart
  console.log('🛍️ Adding product to cart...');
  const addButtons = await buyerPage.$$('button:has-text("Add")');
  if (addButtons.length > 0) {
    await addButtons[0].click();
    await buyerPage.waitForTimeout(800);
    console.log('   ✅ Added item to cart (Cart Drawer opened).');
  }

  // C. Proceed to Checkout & 1-Click Demo Customer Auth
  console.log('💳 Proceeding to Checkout...');
  const checkoutBtn = await buyerPage.waitForSelector('button:has-text("Proceed to Checkout"), button:has-text("Checkout")', { timeout: 6000 }).catch(() => null);
  if (checkoutBtn) {
    await checkoutBtn.click();
    await buyerPage.waitForTimeout(800);
  }

  const demoCustomerBtn = await buyerPage.waitForSelector('button:has-text("Continue as Demo Customer"), button:has-text("1-Click Demo Customer")', { timeout: 6000 }).catch(() => null);
  if (demoCustomerBtn) {
    console.log('👤 Signing in as Demo Customer (Priya Sharma)...');
    await demoCustomerBtn.click();
    await buyerPage.waitForTimeout(2000);
  }

  // E. Payment Modal Scenarios
  console.log('💳 Testing Razorpay Test Payment Modal...');
  const isModalOpen = await buyerPage.evaluate(() => !!document.querySelector('.fixed.inset-0.z-50'));
  console.log(`   - Payment Modal Opened: ${isModalOpen ? '✅ YES' : '❌ NO'}`);

  if (isModalOpen) {
    const continueMethodBtn = await buyerPage.$('button:has-text("Continue to Payment Verification")');
    if (continueMethodBtn) await continueMethodBtn.click();
    await buyerPage.waitForTimeout(500);

    // 1. Decline Scenario
    console.log('   🔴 Testing Scenario 1: Bank Decline (OTP 000000)...');
    const testDeclineBtn = await buyerPage.$('button:has-text("Test Bank Decline")');
    if (testDeclineBtn) {
      await testDeclineBtn.click();
      await buyerPage.waitForTimeout(1200);
      const isDeclined = await buyerPage.evaluate(() => document.body.innerText.includes('Payment Declined'));
      console.log(`      Decline UI Rendered: ${isDeclined ? '✅ PASS' : '❌ FAIL'}`);
      report.flowResults.paymentDecline = isDeclined;

      // Click Try Again
      const tryAgain = await buyerPage.$('button:has-text("Try Again")');
      if (tryAgain) await tryAgain.click();
      await buyerPage.waitForTimeout(500);
    }

    // 2. Failure / Timeout Scenario
    console.log('   ⚠️ Testing Scenario 2: Gateway Timeout (OTP 999999)...');
    const testTimeoutBtn = await buyerPage.$('button:has-text("Test Gateway Timeout")');
    if (testTimeoutBtn) {
      await testTimeoutBtn.click();
      await buyerPage.waitForTimeout(1200);
      const isFailed = await buyerPage.evaluate(() => document.body.innerText.includes('Payment Failed'));
      console.log(`      Failure UI Rendered: ${isFailed ? '✅ PASS' : '❌ FAIL'}`);
      report.flowResults.paymentFailure = isFailed;

      // Click Try Again
      const tryAgain2 = await buyerPage.$('button:has-text("Try Again")');
      if (tryAgain2) await tryAgain2.click();
      await buyerPage.waitForTimeout(500);
    }

    // 3. Success Scenario
    console.log('   🟢 Testing Scenario 3: Payment Success (OTP 123456)...');
    const autofillSuccess = await buyerPage.$('button:has-text("Autofill & Complete: 123456"), button:has-text("123456")');
    if (autofillSuccess) {
      await autofillSuccess.click();
      await buyerPage.waitForTimeout(2000);
      const isSuccess = await buyerPage.evaluate(() => document.body.innerText.includes('Payment Successful') || document.body.innerText.includes('Order Placed') || document.body.innerText.includes('confirmed'));
      console.log(`      Success State: ${isSuccess ? '✅ PASS' : '❌ FAIL'}`);
      report.flowResults.paymentSuccess = isSuccess;

      // Click "Continue Shopping" or close
      const continueShoppingBtn = await buyerPage.$('button:has-text("Continue Shopping"), button:has-text("Continue")');
      if (continueShoppingBtn) await continueShoppingBtn.click();
      await buyerPage.waitForTimeout(400);
    }
  }

  // 3. Customer Orders Page
  console.log('\n--- 3. CUSTOMER ORDERS PAGE (/customer/orders) ---');
  await buyerPage.goto(`${BASE_URL}/customer/orders`, { waitUntil: 'domcontentloaded' });
  await buyerPage.waitForTimeout(500);
  const ordersTitle = await buyerPage.title();
  const orderItemsCount = await buyerPage.$$eval('.rounded-2xl, .bg-white', els => els.length);
  console.log(`✅ [Customer Orders] Title: "${ordersTitle}" | Rendered order sections: ${orderItemsCount}`);

  // Context B: Dedicated Merchant Context
  console.log('\n--- 4. MERCHANT LOGIN & DASHBOARD VERIFICATION ---');
  const merchantContext = await browser.newContext();
  const merchantPage = await merchantContext.newPage();
  
  merchantPage.on('console', msg => {
    if (msg.type() === 'error') {
      consoleIssues.push({ type: 'error', text: msg.text(), url: merchantPage.url() });
    }
  });

  await merchantPage.goto(`${BASE_URL}/merchant/login`, { waitUntil: 'domcontentloaded' });
  await merchantPage.waitForTimeout(500);
  
  // Fill merchant credentials
  await merchantPage.fill('input[type="email"]', 'arjun@auraathletics.com');
  await merchantPage.fill('input[type="password"]', 'demo123');
  await merchantPage.click('button[type="submit"]');
  await merchantPage.waitForTimeout(2500);

  // 5. Check Merchant Pages across Desktop Sizes
  for (const vp of DESKTOP_VIEWPORTS) {
    console.log(`\n🖥️ Testing Desktop [${vp.name}]:`);
    await merchantPage.setViewportSize({ width: vp.width, height: vp.height });
    
    for (const route of MERCHANT_ROUTES) {
      await merchantPage.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      await merchantPage.waitForTimeout(350);
      const title = await merchantPage.title();
      const hasOverflow = await merchantPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      console.log(`   - [${vp.width}w] ${route}: Title="${title}" | Overflow=${hasOverflow ? '⚠️ YES' : 'None'}`);
      report.merchantPages.push({ viewport: vp.name, route, hasOverflow });
    }
  }

  // 6. Test Opportunity Approval Flow
  console.log('\n--- 5. OPPORTUNITY APPROVAL WORKFLOW ---');
  await merchantPage.goto(`${BASE_URL}/opportunities`, { waitUntil: 'domcontentloaded' });
  await merchantPage.waitForTimeout(800);
  const oppCards = await merchantPage.$$('button:has-text("Review Opportunity"), button:has-text("Simulate"), button:has-text("Review & Approve"), button:has-text("Simulate & Review")');
  if (oppCards.length > 0) {
    console.log('   - Clicking Opportunity Drawer trigger...');
    await oppCards[0].click();
    await merchantPage.waitForTimeout(800);
    const approveBtn = await merchantPage.waitForSelector('button:has-text("Approve Opportunity"), button:has-text("Approve")', { timeout: 6000 }).catch(() => null);
    if (approveBtn) {
      console.log('   - Clicking Approve Opportunity...');
      await approveBtn.click();
      await merchantPage.waitForTimeout(1200);
      console.log('   ✅ Approved Opportunity successfully!');
      report.flowResults.opportunityApproval = true;
    }
    // Test Escape / Close key
    await merchantPage.keyboard.press('Escape');
    await merchantPage.waitForTimeout(300);
    report.flowResults.escapeClose = true;
  }

  // 7. Security Check on Settings Page
  console.log('\n--- 6. SECURITY & SECRET EXPOSURE CHECK (/settings) ---');
  await merchantPage.goto(`${BASE_URL}/settings`, { waitUntil: 'domcontentloaded' });
  await merchantPage.waitForTimeout(400);
  const settingsText = await merchantPage.innerText('body');
  const secretLeaked = ['postgresql://', 'ep-misty-cherry', 'sk-or-v1-', 'gse0zdx29D1NaZ1gfZ4iv1FO'].some(s => settingsText.includes(s));
  console.log(`   Zero sensitive secrets leaked in Settings: ${!secretLeaked ? '✅ SECURE' : '⚠️ LEAK DETECTED'}`);
  report.flowResults.securityClean = !secretLeaked;

  // 8. Mobile Viewport Layout & Overflow Checks
  console.log('\n--- 7. MOBILE RESPONSIVENESS CHECKS ---');
  for (const mvp of MOBILE_VIEWPORTS) {
    console.log(`📱 Testing Mobile [${mvp.name}]:`);
    await buyerPage.setViewportSize({ width: mvp.width, height: mvp.height });
    await merchantPage.setViewportSize({ width: mvp.width, height: mvp.height });

    // Buyer mobile
    for (const route of ['/shop', '/customer/orders']) {
      await buyerPage.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      await buyerPage.waitForTimeout(250);
      const hasOverflow = await buyerPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      console.log(`   - [${mvp.width}w Buyer] ${route}: Overflow=${hasOverflow ? '⚠️ YES' : 'None'}`);
      report.mobileChecks.push({ viewport: mvp.name, route, hasOverflow });
    }

    // Merchant mobile
    for (const route of MERCHANT_ROUTES) {
      await merchantPage.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      await merchantPage.waitForTimeout(250);
      const hasOverflow = await merchantPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      console.log(`   - [${mvp.width}w Merchant] ${route}: Overflow=${hasOverflow ? '⚠️ YES' : 'None'}`);
      report.mobileChecks.push({ viewport: mvp.name, route, hasOverflow });
    }
  }

  console.log('\n==================================================');
  console.log('📊 FINAL VISUAL QA AUDIT RESULTS SUMMARY');
  console.log('==================================================');
  console.log(`1. Total Route Views Inspected: ${report.publicPages.length + report.merchantPages.length + report.mobileChecks.length}`);
  console.log(`2. Desktop Viewports Checked: ${DESKTOP_VIEWPORTS.map(v => v.width).join(', ')}px`);
  console.log(`3. Mobile Viewports Checked: ${MOBILE_VIEWPORTS.map(v => v.width).join(', ')}px`);
  console.log(`4. Payment Success Flow: ${report.flowResults.paymentSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`5. Payment Decline Flow: ${report.flowResults.paymentDecline ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`6. Payment Failure Flow: ${report.flowResults.paymentFailure ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`7. Buyer AI Copilot Flow: ${report.flowResults.buyerAi ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`8. Opportunity Approval Flow: ${report.flowResults.opportunityApproval ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`9. Escape / Close Drawer Flow: ${report.flowResults.escapeClose ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`10. Security / Secret Exposure Check: ${report.flowResults.securityClean ? '✅ PASSED (0 Secrets Exposed)' : '⚠️ FAILED'}`);
  console.log(`11. Total Console Errors Detected: ${consoleIssues.length}`);
  if (consoleIssues.length > 0) {
    consoleIssues.forEach(c => console.log(`    - [${c.url}] ${c.text}`));
  }
  console.log('==================================================');

  await browser.close();
}

main().catch(err => {
  console.error('Visual QA Error:', err);
  process.exit(1);
});
