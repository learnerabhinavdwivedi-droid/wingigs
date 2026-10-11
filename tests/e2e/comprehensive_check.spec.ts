import { test, expect } from '@playwright/test';

test.describe('Bahar Comprehensive Runtime Verification', () => {
  test('All pages render without console errors and respond to interactions', async ({ page }) => {
    test.setTimeout(180000);
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', err => {
      consoleErrors.push(err.message);
    });

    // 1. Marketing Page
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /expect failure/i })).toBeVisible();

    // 2. Onboarding Page
    await page.goto('/onboarding', { waitUntil: 'domcontentloaded' });
    const startBtn = page.getByRole('button', { name: /start training/i });
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await page.waitForURL('/today', { timeout: 30000 });
    } else {
      await page.goto('/today', { waitUntil: 'domcontentloaded' });
    }

    // 3. Today Page
    await expect(page.getByText("Today's Plan")).toBeVisible({ timeout: 35000 });

    // 4. Spots Directory
    await page.goto('/spots', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /training spots & walls/i })).toBeVisible();
    
    // Search filter test
    const searchInput = page.getByPlaceholder(/search by court name/i);
    await searchInput.fill('Seattle');
    await expect(page.getByText('Green Lake Community Courts')).toBeVisible();

    // Add Spot modal test
    await page.getByRole('button', { name: /add training spot/i }).click();
    await expect(page.getByText("Directory Contribution")).toBeVisible();
    await page.getByRole('button', { name: /cancel/i }).click();

    // 5. Buddy Page
    await page.goto('/buddy', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /training buddies/i })).toBeVisible();
    await expect(page.getByText("Active Accountability Pairs")).toBeVisible();
    
    // Send High-Five
    const highFiveBtn = page.getByRole('button', { name: /high-five/i }).first();
    await highFiveBtn.click({ force: true });
    await expect(page.getByText("High-five delivered")).toBeVisible();

    // 6. Progress Analytics Page
    await page.goto('/progress', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /your progress/i })).toBeVisible();
    await expect(page.getByText("Screen vs Court Volume")).toBeVisible();

    // 7. Settings Page & Data Vault
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /settings & data vault/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /export json/i })).toBeVisible();

    // 8. Sunday Review Page
    await page.goto('/week', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /sunday review/i })).toBeVisible();

    // 9. Retest Page
    await page.goto('/retest', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /fitness retest/i })).toBeVisible();

    // Verify no unhandled exceptions occurred
    const fatalErrors = consoleErrors.filter(e => 
      !e.includes('Wake Lock') && 
      !e.includes('Silent audio') && 
      !e.includes('speechSynthesis') &&
      !e.includes('Download the React DevTools')
    );
    expect(fatalErrors).toEqual([]);
  });
});
