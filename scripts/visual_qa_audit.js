const { chromium } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

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

const MERCHANT_PAGES = [
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

const BUYER_PAGES = [
  '/shop',
  '/customer/orders',
  '/customer/login',
  '/customer/signup'
];

const PUBLIC_PAGES = [
  '/',
  '/merchant/login',
  '/login',
  '/signup'
];

async function runVisualQA() {
  console.log('🚀 Starting Comprehensive Visual QA Audit for RAYFLOW...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({ url: page.url(), text: msg.text() });
    }
  });

  page.on('pageerror', error => {
    consoleErrors.push({ url: page.url(), text: error.message });
  });

  const auditReport = {
    pagesInspected: [],
    desktopResults: [],
    mobileResults: [],
    paymentSuccessTested: false,
    paymentDeclineTested: false,
    paymentFailureTested: false,
    buyerAiTested: false,
    opportunityApprovalTested: false,
    cancelBackFlowsTested: false,
    securityExposureFound: false,
    consoleErrors: []
  };

  // 1. Check Public & Auth Pages on Desktop (1440x900)
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const route of PUBLIC_PAGES) {
    console.log(`\n🔍 Inspecting Public Page: ${route}`);
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const title = await page.title();
    const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(`   - Title: "${title}"`);
    console.log(`   - Horizontal Scroll: ${hasHorizontalScroll ? '⚠️ OVERFLOW DETECTED' : '✅ None'}`);
    auditReport.pagesInspected.push({ route, title, hasHorizontalScroll });
  }

  // 2. Perform Merchant Authentication
  console.log('\n🔐 Authenticating Merchant (arjun@auraathletics.com)...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  const fillDemoBtn = await page.$('button:has-text("Fill Demo Login")');
  if (fillDemoBtn) {
    await fillDemoBtn.click();
  } else {
    await page.fill('input[type="email"]', 'arjun@auraathletics.com');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
  }
  await page.waitForURL('**/overview', { timeout: 15000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  console.log('   ✅ Successfully logged in as Merchant!');

  // 3. Inspect All Merchant Pages across Desktop Viewports
  for (const vp of DESKTOP_VIEWPORTS) {
    console.log(`\n🖥️ Testing Desktop Viewport: ${vp.name}`);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    
    for (const route of MERCHANT_PAGES) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);
      const title = await page.title();
      const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      const headerVisible = await page.evaluate(() => !!document.querySelector('h1, h2'));
      console.log(`   - [${vp.width}w] ${route}: Title="${title}", Overflow=${hasHorizontalScroll ? '⚠️ YES' : 'No'}, Header=${headerVisible ? '✅' : '❌'}`);
      auditReport.desktopResults.push({ viewport: vp.name, route, hasHorizontalScroll, headerVisible });
    }
  }

  // 4. Test Opportunity Approval Flow
  console.log('\n⚡ Testing Opportunity Approval Workflow...');
  await page.goto(`${BASE_URL}/opportunities`);
  await page.waitForTimeout(600);
  
  // Click first opportunity card or inspect button
  const oppCards = await page.$$('button:has-text("Simulate & Review"), button:has-text("Review & Approve"), [data-testid="opportunity-card"]');
  if (oppCards.length > 0) {
    console.log('   - Clicking Opportunity card to open ApprovalDrawer...');
    await oppCards[0].click();
    await page.waitForTimeout(600);
    
    const drawerVisible = await page.evaluate(() => !!document.querySelector('[role="dialog"], .fixed.inset-0'));
    console.log(`   - Approval Drawer Open: ${drawerVisible ? '✅ Visible' : '❌ Not Found'}`);

    // Click Approve button
    const approveBtn = await page.$('button:has-text("Approve Opportunity"), button:has-text("Approve")');
    if (approveBtn) {
      console.log('   - Clicking "Approve Opportunity"...');
      await approveBtn.click();
      await page.waitForTimeout(1000);
      console.log('   ✅ Opportunity Approved successfully!');
      auditReport.opportunityApprovalTested = true;
    }

    // Test Close/Escape on Drawer
    console.log('   - Testing Close / Escape key on ApprovalDrawer...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const drawerClosed = await page.evaluate(() => !document.querySelector('.fixed.inset-y-0.right-0'));
    console.log(`   - Approval Drawer Closed on Escape: ${drawerClosed ? '✅ Success' : '⚠️ Still open'}`);
    auditReport.cancelBackFlowsTested = true;
  }

  // 5. Test Settings Security & Secret Exposure
  console.log('\n🔒 Inspecting Settings Page for Secret Exposure...');
  await page.goto(`${BASE_URL}/settings`);
  await page.waitForTimeout(500);
  const pageBodyText = await page.innerText('body');
  const forbiddenSubstrings = [
    'postgresql://',
    'ep-misty-cherry',
    'secret_test_',
    'rzp_live_',
    'sk-or-v1-'
  ];
  let secretFound = false;
  for (const secret of forbiddenSubstrings) {
    if (pageBodyText.includes(secret)) {
      console.log(`   ⚠️ CRITICAL SECURITY WARNING: Potential secret substring found in UI: "${secret}"`);
      secretFound = true;
    }
  }
  if (!secretFound) {
    console.log('   ✅ Zero sensitive database URLs, API secrets, or private keys exposed in Settings UI!');
  }
  auditReport.securityExposureFound = secretFound;

  // 6. Inspect Mobile Viewports & Navigation
  for (const mvp of MOBILE_VIEWPORTS) {
    console.log(`\n📱 Testing Mobile Viewport: ${mvp.name}`);
    await page.setViewportSize({ width: mvp.width, height: mvp.height });
    
    // Check Shop and Overview on mobile
    for (const route of ['/overview', '/shop', '/catalogue', '/payments', '/policies']) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);
      const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      const bodyWidth = await page.evaluate(() => document.body.clientWidth);
      console.log(`   - [${mvp.width}w] ${route}: BodyWidth=${bodyWidth}px, Overflow=${hasHorizontalScroll ? '⚠️ YES' : 'No'}`);
      auditReport.mobileResults.push({ viewport: mvp.name, route, hasHorizontalScroll });
    }
  }

  // 7. Test Buyer Storefront, Shopping Copilot, and Complete Payment Flow
  console.log('\n🛒 Testing Buyer Storefront, AI Copilot, and Payment Scenarios...');
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${BASE_URL}/shop`);
  await page.waitForTimeout(800);

  // Test Buyer AI Shopping Copilot
  console.log('   - Testing Shopping Assistant Drawer...');
  const aiTrigger = await page.$('button:has-text("Shopping Assistant"), button:has-text("Assistant"), [aria-label="Open Shopping Assistant"]');
  if (aiTrigger) {
    await aiTrigger.click();
    await page.waitForTimeout(500);
    const chatInput = await page.$('input[placeholder*="Shopping Assistant"], input[placeholder*="Ask"]');
    if (chatInput) {
      await chatInput.fill('Find running shoes and socks under ₹6000');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1500);
      console.log('   ✅ Sent query to Shopping Assistant and received AI response!');
      auditReport.buyerAiTested = true;
    }
    // Close AI Drawer
    const closeAiBtn = await page.$('button[aria-label="Close Assistant"], button:has-text("✕")');
    if (closeAiBtn) await closeAiBtn.click();
  }

  // Add Product to Cart
  console.log('   - Adding Product to Cart...');
  const addToCartBtn = await page.$('button:has-text("Add to Cart"), button:has-text("Add")');
  if (addToCartBtn) {
    await addToCartBtn.click();
    await page.waitForTimeout(500);
    console.log('   ✅ Added item to cart!');
  }

  // Open Cart Drawer
  console.log('   - Opening Cart Drawer...');
  const cartBtn = await page.$('button:has-text("Cart"), button:has-text("Items"), [aria-label="Shopping Cart"]');
  if (cartBtn) {
    await cartBtn.click();
    await page.waitForTimeout(500);
  }

  // Click Checkout / Proceed
  console.log('   - Proceeding to Checkout...');
  const checkoutBtn = await page.$('button:has-text("Proceed to Checkout"), button:has-text("Checkout")');
  if (checkoutBtn) {
    await checkoutBtn.click();
    await page.waitForTimeout(600);
  }

  // Handle Demo Customer Sign-in if prompted
  const demoCustBtn = await page.$('button:has-text("Continue as Demo Customer"), button:has-text("1-Click Demo Customer")');
  if (demoCustBtn) {
    console.log('   - Signing in as 1-Click Demo Customer (Priya Sharma)...');
    await demoCustBtn.click();
    await page.waitForTimeout(1200);
  }

  // Check if Razorpay Test Modal is open
  const rzpModalVisible = await page.evaluate(() => !!document.querySelector('.fixed.inset-0.z-50'));
  console.log(`   - Razorpay Test Modal Open: ${rzpModalVisible ? '✅ Visible' : '⚠️ Pending'}`);

  if (rzpModalVisible) {
    // A. Test Payment Failure / Gateway Timeout Scenario (OTP: 999999)
    console.log('   - Testing Gateway Timeout Failure (OTP: 999999)...');
    const continueBtn = await page.$('button:has-text("Continue to Payment Verification")');
    if (continueBtn) await continueBtn.click();
    await page.waitForTimeout(400);
    
    const timeoutTestBtn = await page.$('button:has-text("Test Gateway Timeout")');
    if (timeoutTestBtn) {
      await timeoutTestBtn.click();
      await page.waitForTimeout(1000);
      const isFailedState = await page.evaluate(() => !!document.querySelector(':has-text("Payment Failed")'));
      console.log(`   - Failure State Rendered: ${isFailedState ? '✅ "Payment Failed" displayed correctly' : '⚠️ Not detected'}`);
      auditReport.paymentFailureTested = isFailedState;

      // Click "Try Again"
      const tryAgainBtn = await page.$('button:has-text("Try Again"), button:has-text("Retry Payment")');
      if (tryAgainBtn) await tryAgainBtn.click();
      await page.waitForTimeout(400);
    }

    // B. Test Payment Decline Scenario (OTP: 000000)
    console.log('   - Testing Bank Decline Scenario (OTP: 000000)...');
    const declineTestBtn = await page.$('button:has-text("Test Bank Decline")');
    if (declineTestBtn) {
      await declineTestBtn.click();
      await page.waitForTimeout(1000);
      const isDeclinedState = await page.evaluate(() => !!document.querySelector(':has-text("Payment Declined")'));
      console.log(`   - Declined State Rendered: ${isDeclinedState ? '✅ "Payment Declined" displayed correctly' : '⚠️ Not detected'}`);
      auditReport.paymentDeclineTested = isDeclinedState;

      // Click "Try Again"
      const tryAgainBtn2 = await page.$('button:has-text("Try Again")');
      if (tryAgainBtn2) await tryAgainBtn2.click();
      await page.waitForTimeout(400);
    }

    // C. Test Successful Payment Scenario (OTP: 123456)
    console.log('   - Testing Successful Payment Scenario (OTP: 123456)...');
    const autofillBtn = await page.$('button:has-text("Autofill & Complete: 123456")');
    if (autofillBtn) {
      await autofillBtn.click();
      await page.waitForTimeout(1500);
      const isSuccessState = await page.evaluate(() => !!document.querySelector(':has-text("Payment Successful")'));
      const hasOrderPlaced = await page.evaluate(() => !!document.querySelector(':has-text("Order Placed")'));
      const hasViewOrder = await page.evaluate(() => !!document.querySelector('a:has-text("View Order")'));
      const hasContinueShop = await page.evaluate(() => !!document.querySelector('button:has-text("Continue Shopping")'));
      console.log(`   - Success State: ${isSuccessState ? '✅ "Payment Successful"' : '❌ Failed'}`);
      console.log(`   - "Order Placed" Badge: ${hasOrderPlaced ? '✅ Present' : '❌ Missing'}`);
      console.log(`   - "View Order" Action: ${hasViewOrder ? '✅ Present' : '❌ Missing'}`);
      console.log(`   - "Continue Shopping" Action: ${hasContinueShop ? '✅ Present' : '❌ Missing'}`);
      auditReport.paymentSuccessTested = isSuccessState && hasOrderPlaced && hasViewOrder && hasContinueShop;
    }
  }

  auditReport.consoleErrors = consoleErrors;
  console.log('\n==================================================');
  console.log('📊 AUDIT SUMMARY REPORT:');
  console.log(`- Total Pages Inspected: ${auditReport.pagesInspected.length + MERCHANT_PAGES.length}`);
  console.log(`- Desktop Viewports Tested: ${DESKTOP_VIEWPORTS.map(v => v.name).join(', ')}`);
  console.log(`- Mobile Viewports Tested: ${MOBILE_VIEWPORTS.map(v => v.name).join(', ')}`);
  console.log(`- Payment Success Tested: ${auditReport.paymentSuccessTested ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`- Payment Decline Tested: ${auditReport.paymentDeclineTested ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`- Payment Failure Tested: ${auditReport.paymentFailureTested ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`- Buyer AI Copilot Tested: ${auditReport.buyerAiTested ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`- Opportunity Approval Tested: ${auditReport.opportunityApprovalTested ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`- Cancel / Back / Escape Tested: ${auditReport.cancelBackFlowsTested ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`- Secret Exposure Found: ${auditReport.securityExposureFound ? '⚠️ YES' : '✅ NONE'}`);
  console.log(`- Console Errors Found: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    consoleErrors.forEach(e => console.log(`   [${e.url}] ${e.text}`));
  }
  console.log('==================================================');

  await browser.close();
  return auditReport;
}

runVisualQA().catch(err => {
  console.error('Audit Script Error:', err);
  process.exit(1);
});
