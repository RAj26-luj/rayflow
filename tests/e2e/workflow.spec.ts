import { test, expect } from '@playwright/test';

async function loginAsMerchant(page: any) {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'arjun@auraathletics.com');
  await page.fill('input[type="password"]', 'demo123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/overview', { timeout: 15000 });
}

test.describe('RAYFLOW E2E Production Workflows', () => {
  test('1. Landing page renders dual entry points', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/RAYFLOW/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('AI-Powered Commerce for Customers');
    await expect(page.getByRole('link', { name: /Shop with RAYFLOW/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Merchant Login/i }).first()).toBeVisible();
  });

  test('2. Merchant Login Flow authenticates and navigates to Overview Dashboard', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in to RAYFLOW' })).toBeVisible();

    await loginAsMerchant(page);
    await expect(page.getByText('Autonomous Revenue Copilot')).toBeVisible();
    await expect(page.getByText('Revenue Influenced')).toBeVisible();
  });

  test('3. Opportunities Feed renders AI revenue opportunities', async ({ page }) => {
    await loginAsMerchant(page);
    await page.goto('/opportunities');
    await expect(page.getByRole('heading', { name: 'AI Revenue Opportunities' })).toBeVisible();
  });

  test('4. AI Agent interface loads chat workspace and guard state', async ({ page }) => {
    await loginAsMerchant(page);
    await page.goto('/agent');
    await expect(page.getByRole('heading', { name: 'Revenue Agent' })).toBeVisible();
    await expect(page.getByText('Active Policy Guard')).toBeVisible();
  });

  test('5. Shop AI Buyer Storefront renders catalog and conversational shopping', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.getByText('Shop Performance Activewear')).toBeVisible();
  });

  test('6. Policy Engine evaluates governance and discount bounds', async ({ page }) => {
    await loginAsMerchant(page);
    await page.goto('/policies');
    await expect(page.getByRole('heading', { name: 'Agent Policy Engine' })).toBeVisible();
    await expect(page.getByText('Hard Economic Caps')).toBeVisible();
    await expect(page.getByText('Maximum Discount (%)')).toBeVisible();
  });

  test('7. Compliance & Audit Trail displays verifiable ledger', async ({ page }) => {
    await loginAsMerchant(page);
    await page.goto('/audit');
    await expect(page.getByRole('heading', { name: 'Autonomous Agent Audit Trail' })).toBeVisible();
  });
});
