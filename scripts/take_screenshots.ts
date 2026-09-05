import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.BASE_URL || 'https://rayflow-omega.vercel.app';
const SCREENSHOT_DIR = path.join(process.cwd(), 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log(`Starting Playwright screenshot capture for ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Browser Context (1440x900)
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const desktopPage = await desktopContext.newPage();

  // Helper for desktop screenshot
  const captureDesktop = async (urlPath: string, filename: string) => {
    console.log(`[Desktop] Navigating to ${urlPath}...`);
    await desktopPage.goto(`${BASE_URL}${urlPath}`, { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(1500);
    await desktopPage.screenshot({
      path: path.join(SCREENSHOT_DIR, filename),
      fullPage: false,
    });
    console.log(`Saved ${filename}`);
  };

  // Capture public desktop pages
  await captureDesktop('/', 'desktop_01_home.png');
  await captureDesktop('/shop', 'desktop_02_shop.png');

  // Login as Merchant for admin pages
  console.log('[Desktop] Logging in as merchant...');
  await desktopPage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.fill('input[type="email"]', 'arjun@auraathletics.com');
  await desktopPage.fill('input[type="password"]', 'demo123');
  await desktopPage.click('button[type="submit"]');
  await desktopPage.waitForURL('**/overview', { timeout: 15000 }).catch(() => {});
  await desktopPage.waitForTimeout(2000);

  // Capture merchant pages
  await captureDesktop('/overview', 'desktop_03_overview.png');
  await captureDesktop('/opportunities', 'desktop_04_opportunities.png');
  await captureDesktop('/agent', 'desktop_05_agent.png');
  await captureDesktop('/catalogue', 'desktop_06_catalogue.png');
  await captureDesktop('/customers', 'desktop_07_customers.png');
  await captureDesktop('/campaigns', 'desktop_08_campaigns.png');
  await captureDesktop('/payments', 'desktop_09_payments.png');
  await captureDesktop('/policies', 'desktop_10_policies.png');
  await captureDesktop('/audit', 'desktop_11_audit.png');
  await captureDesktop('/settings', 'desktop_12_settings.png');

  await desktopContext.close();

  // 2. Mobile Browser Context (Pixel 5: 393x851)
  const mobileContext = await browser.newContext({
    viewport: { width: 393, height: 851 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();

  const captureMobile = async (urlPath: string, filename: string) => {
    console.log(`[Mobile] Navigating to ${urlPath}...`);
    await mobilePage.goto(`${BASE_URL}${urlPath}`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(1500);
    await mobilePage.screenshot({
      path: path.join(SCREENSHOT_DIR, filename),
      fullPage: false,
    });
    console.log(`Saved ${filename}`);
  };

  await captureMobile('/shop', 'mobile_01_shop.png');

  // Login on mobile
  await mobilePage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.fill('input[type="email"]', 'arjun@auraathletics.com');
  await mobilePage.fill('input[type="password"]', 'demo123');
  await mobilePage.click('button[type="submit"]');
  await mobilePage.waitForURL('**/overview', { timeout: 15000 }).catch(() => {});
  await mobilePage.waitForTimeout(2000);

  await captureMobile('/overview', 'mobile_02_overview.png');
  await captureMobile('/agent', 'mobile_03_agent.png');

  await mobileContext.close();
  await browser.close();
  console.log('All production screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Error taking screenshots:', err);
  process.exit(1);
});
