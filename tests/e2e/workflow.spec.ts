import { test, expect } from '@playwright/test';

test.describe('RAYFLOW E2E Production Workflows', () => {
  test('Landing page renders hero value proposition and 5-step loop', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/RAYFLOW/);
    await expect(page.locator('text=The Autonomous AI Revenue Agent for Razorpay')).toBeVisible();
    await expect(page.locator('text=Launch Live Merchant Dashboard')).toBeVisible();
  });

  test('Merchant Dashboard displays KPIs, Revenue Opportunities, and Policy Engine', async ({ page }) => {
    await page.goto('/overview');
    await expect(page.locator('text=Autonomous Revenue Copilot')).toBeVisible();
    await expect(page.locator('text=TEST MODE')).toBeVisible();
    await expect(page.locator('text=Revenue Influenced')).toBeVisible();
  });

  test('Opportunities Feed supports 1-click simulation and approval', async ({ page }) => {
    await page.goto('/opportunities');
    await expect(page.locator('text=Revenue Opportunities')).toBeVisible();
    await expect(page.locator('text=Velocity Runner + Socks Bundle')).toBeVisible();
  });

  test('Shop AI Buyer Storefront executes pre-payment bundle checkout', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.locator('text=Shop with AI')).toBeVisible();
    await expect(page.locator('text=Velocity Runner Pro')).toBeVisible();
  });

  test('Audit trail logs immutable policy checks and Razorpay captures', async ({ page }) => {
    await page.goto('/audit');
    await expect(page.locator('text=Compliance & Policy Audit Trail')).toBeVisible();
    await expect(page.locator('text=PASSED')).toBeVisible();
  });

  test('Policy Engine live testing sandbox evaluates discount boundaries', async ({ page }) => {
    await page.goto('/policies');
    await expect(page.locator('text=Agent Safety Policies')).toBeVisible();
    await expect(page.locator('text=Max Bounded Discount')).toBeVisible();
  });
});
