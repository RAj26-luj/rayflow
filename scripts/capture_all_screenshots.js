const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '../screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log(`Starting Visual Screenshot Capture against ${BASE_URL}...`);
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // ==========================================
  // 1. DESKTOP CAPTURES (1440 x 900)
  // ==========================================
  console.log('\n--- Capturing Desktop Screens (1440x900) ---');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });

  const desktopPage = await desktopContext.newPage();

  // Desktop Public & Shop
  console.log('Capturing Desktop: /');
  await desktopPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop_01_home.png') });

  console.log('Capturing Desktop: /shop');
  await desktopPage.goto(`${BASE_URL}/shop`, { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop_02_shop.png') });

  // Merchant Login & Auth
  console.log('Logging in as Merchant for Dashboard Screens...');
  await desktopPage.goto(`${BASE_URL}/merchant/login`, { waitUntil: 'networkidle' });
  await desktopPage.fill('input[type="email"]', 'arjun@auraathletics.com');
  await desktopPage.fill('input[type="password"]', 'password123');
  await desktopPage.click('button[type="submit"]');
  await desktopPage.waitForURL(url => url.pathname.includes('/overview') || url.pathname.includes('/'), { timeout: 10000 });
  await desktopPage.waitForTimeout(1000);

  // Desktop Merchant Screens
  const merchantRoutes = [
    { route: '/overview', name: 'desktop_03_overview.png' },
    { route: '/opportunities', name: 'desktop_04_opportunities.png' },
    { route: '/agent', name: 'desktop_05_agent.png' },
    { route: '/catalogue', name: 'desktop_06_catalogue.png' },
    { route: '/customers', name: 'desktop_07_customers.png' },
    { route: '/campaigns', name: 'desktop_08_campaigns.png' },
    { route: '/payments', name: 'desktop_09_payments.png' },
    { route: '/policies', name: 'desktop_10_policies.png' },
    { route: '/audit', name: 'desktop_11_audit.png' },
    { route: '/settings', name: 'desktop_12_settings.png' },
  ];

  for (const item of merchantRoutes) {
    console.log(`Capturing Desktop: ${item.route}`);
    await desktopPage.goto(`${BASE_URL}${item.route}`, { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(1200);
    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, item.name) });
  }

  // ==========================================
  // 2. DESKTOP PAYMENT FLOW CAPTURES
  // ==========================================
  console.log('\n--- Capturing Desktop Payment States ---');
  const buyerContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const buyerPage = await buyerContext.newPage();

  await buyerPage.goto(`${BASE_URL}/shop`, { waitUntil: 'networkidle' });
  await buyerPage.waitForTimeout(1000);

  // Add product to cart
  const addBtn = await buyerPage.waitForSelector('button:has-text("Add to Cart"), button:has-text("Add")', { timeout: 5000 });
  if (addBtn) {
    await addBtn.click();
    await buyerPage.waitForTimeout(1000);
  }

  // Click proceed to checkout inside cart drawer
  const checkoutBtn = await buyerPage.waitForSelector('button:has-text("Proceed to Checkout"), button:has-text("Checkout")', { timeout: 5000 });
  if (checkoutBtn) {
    await checkoutBtn.click();
    await buyerPage.waitForTimeout(1200);
  }

  // Check if Customer Auth Modal appeared and click 1-Click Demo Customer
  const demoCustomerBtn = await buyerPage.$('button:has-text("Continue as Demo Customer")');
  if (demoCustomerBtn) {
    console.log('Signing in as Demo Customer...');
    await demoCustomerBtn.click();
    await buyerPage.waitForTimeout(2000);
  }

  // 1. Payment Modal: Method Selection
  console.log('Capturing Desktop: Payment Modal (Method Selection)');
  try {
    await buyerPage.waitForSelector('text=Select Payment Method', { timeout: 8000 });
  } catch (e) {
    console.log('Proceeding with fallback selector for Payment Modal');
  }
  await buyerPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop_13_payment_modal.png') });

  // 2. Payment Modal: OTP Step
  try {
    const continueToOtpBtn = await buyerPage.waitForSelector('button:has-text("Continue to Payment Verification"), button:has-text("Continue")', { timeout: 5000 });
    if (continueToOtpBtn) {
      await continueToOtpBtn.click();
      await buyerPage.waitForTimeout(1000);
    }
  } catch (e) {
    console.log('Continue button not clicked or already on OTP step');
  }

  console.log('Capturing Desktop: Payment Modal (OTP)');
  await buyerPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop_14_payment_otp.png') });

  // 3. Test Bank Decline (000000)
  try {
    const declineBtn = await buyerPage.$('button:has-text("Test Bank Decline")');
    if (declineBtn) {
      await declineBtn.click();
      await buyerPage.waitForTimeout(1200);
      console.log('Capturing Desktop: Payment Declined');
      await buyerPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop_15_payment_declined.png') });
    }
  } catch (e) {
    console.log('Decline step skipped:', e.message);
  }

  // 4. Test Gateway Failure (999999)
  try {
    const tryAgainBtn = await buyerPage.$('button:has-text("Try Again")');
    if (tryAgainBtn) {
      await tryAgainBtn.click();
      await buyerPage.waitForTimeout(800);
      const failBtn = await buyerPage.$('button:has-text("Test Gateway Failure"), button:has-text("Test Gateway Timeout")');
      if (failBtn) {
        await failBtn.click();
        await buyerPage.waitForTimeout(1200);
        console.log('Capturing Desktop: Payment Failed');
        await buyerPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop_16_payment_failed.png') });
      }
    }
  } catch (e) {
    console.log('Failure step skipped:', e.message);
  }

  // 5. Test Payment Success (123456)
  try {
    const tryAgainBtn2 = await buyerPage.$('button:has-text("Try Again")');
    if (tryAgainBtn2) {
      await tryAgainBtn2.click();
      await buyerPage.waitForTimeout(800);
      const autofillSuccessBtn = await buyerPage.$('button:has-text("Autofill & Verify"), button:has-text("123456")');
      if (autofillSuccessBtn) {
        await autofillSuccessBtn.click();
        await buyerPage.waitForTimeout(1500);
        console.log('Capturing Desktop: Payment Success');
        await buyerPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop_17_payment_success.png') });
      }
    }
  } catch (e) {
    console.log('Success step skipped:', e.message);
  }

  await buyerContext.close();
  await desktopContext.close();

  // ==========================================
  // 3. MOBILE CAPTURES (390 x 844)
  // ==========================================
  console.log('\n--- Capturing Mobile Screens (390x844) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15',
    isMobile: true,
    hasTouch: true
  });
  const mobilePage = await mobileContext.newPage();

  console.log('Capturing Mobile: /shop');
  await mobilePage.goto(`${BASE_URL}/shop`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_01_shop.png') });

  // Mobile Checkout & Payment Flow
  try {
    const mobAddBtn = await mobilePage.waitForSelector('button:has-text("Add to Cart"), button:has-text("Add")', { timeout: 5000 });
    if (mobAddBtn) {
      await mobAddBtn.click();
      await mobilePage.waitForTimeout(1000);
    }

    const mobCheckoutBtn = await mobilePage.waitForSelector('button:has-text("Proceed to Checkout"), button:has-text("Checkout")', { timeout: 5000 });
    if (mobCheckoutBtn) {
      await mobCheckoutBtn.click();
      await mobilePage.waitForTimeout(1200);
    }

    const mobDemoCustomer = await mobilePage.$('button:has-text("Continue as Demo Customer")');
    if (mobDemoCustomer) {
      console.log('Signing in as Demo Customer on mobile...');
      await mobDemoCustomer.click();
      await mobilePage.waitForTimeout(2000);
    }

    console.log('Capturing Mobile: Checkout Modal');
    try {
      await mobilePage.waitForSelector('text=Select Payment Method', { timeout: 8000 });
    } catch (e) {}
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_02_checkout.png') });

    const mobContinueBtn = await mobilePage.waitForSelector('button:has-text("Continue to Payment Verification"), button:has-text("Continue")', { timeout: 5000 });
    if (mobContinueBtn) {
      await mobContinueBtn.click();
      await mobilePage.waitForTimeout(1000);
      console.log('Capturing Mobile: Payment OTP');
      await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_03_payment_otp.png') });
    }

    // Mobile Failure test
    const mobFailBtn = await mobilePage.$('button:has-text("Test Gateway Failure"), button:has-text("Test Gateway Timeout")');
    if (mobFailBtn) {
      await mobFailBtn.click();
      await mobilePage.waitForTimeout(1200);
      console.log('Capturing Mobile: Payment Failure');
      await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_04_payment_failure.png') });
    }

    // Mobile Success test
    const mobTryAgain = await mobilePage.$('button:has-text("Try Again")');
    if (mobTryAgain) {
      await mobTryAgain.click();
      await mobilePage.waitForTimeout(800);
      const mobSuccessOtp = await mobilePage.$('button:has-text("Autofill & Verify"), button:has-text("123456")');
      if (mobSuccessOtp) {
        await mobSuccessOtp.click();
        await mobilePage.waitForTimeout(1500);
        console.log('Capturing Mobile: Payment Success');
        await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_05_payment_success.png') });
      }
    }
  } catch (e) {
    console.log('Mobile checkout flow skipped:', e.message);
  }

  // Mobile Merchant Screens
  console.log('Logging in as Merchant for Mobile Screens...');
  await mobilePage.goto(`${BASE_URL}/merchant/login`, { waitUntil: 'networkidle' });
  await mobilePage.fill('input[type="email"]', 'arjun@auraathletics.com');
  await mobilePage.fill('input[type="password"]', 'password123');
  await mobilePage.click('button[type="submit"]');
  await mobilePage.waitForURL(url => url.pathname.includes('/overview') || url.pathname.includes('/'), { timeout: 10000 });
  await mobilePage.waitForTimeout(1000);

  const mobileMerchantRoutes = [
    { route: '/overview', name: 'mobile_06_overview.png' },
    { route: '/opportunities', name: 'mobile_07_opportunities.png' },
    { route: '/agent', name: 'mobile_08_agent.png' },
    { route: '/catalogue', name: 'mobile_09_catalogue.png' },
    { route: '/payments', name: 'mobile_10_payments.png' },
  ];

  for (const item of mobileMerchantRoutes) {
    console.log(`Capturing Mobile: ${item.route}`);
    await mobilePage.goto(`${BASE_URL}${item.route}`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(1200);
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, item.name) });
  }

  await mobileContext.close();
  await browser.close();

  console.log(`\nAll screenshots successfully saved to: ${SCREENSHOT_DIR}`);
}

run().catch(err => {
  console.error('Screenshot capture error:', err);
  process.exit(1);
});
