import { test, expect } from '@playwright/test';

test.describe('Bahar Core Loop', () => {
  test('Complete flow: onboarding -> today -> outside -> progress', async ({ page }) => {
    // 1. Onboarding
    await page.goto('/onboarding');
    await expect(page.getByText('Welcome to Bahar')).toBeVisible();
    
    await page.getByRole('button', { name: /start training/i }).click();

    // 2. Today (Plan Generation)
    // Wait for AI/fallback to generate the plan
    await page.waitForURL('/today');
    await expect(page.getByText("Today's Plan")).toBeVisible();
    
    // Check that at least one drill is rendered
    await expect(page.locator('li').first()).toBeVisible();

    // 3. Start Workout (Go to Outside mode)
    await page.getByRole('button', { name: /start workout/i }).click();
    await page.waitForURL('/outside');
    
    // 4. Outside Mode
    await expect(page.getByText('Current Drill')).toBeVisible();
    await expect(page.getByRole('button', { name: /start workout/i })).toBeVisible();
    
    // Start the timer
    await page.getByRole('button', { name: /start workout/i }).click();
    
    // The button should change to Pause
    await expect(page.getByRole('button', { name: /pause/i })).toBeVisible();
    
    // Skip through all drills
    let hasNext = await page.getByRole('button', { name: /skip to next/i }).isVisible();
    while (hasNext) {
      await page.getByRole('button', { name: /skip to next/i }).click();
      // wait a tiny bit for state update
      await page.waitForTimeout(100);
      hasNext = await page.getByRole('button', { name: /skip to next/i }).isVisible();
    }
    
    // 5. Done State
    await expect(page.getByText('Done!')).toBeVisible();
    await page.getByRole('button', { name: /save & return/i }).click();

    // 6. Progress Page
    await page.waitForURL('/progress');
    await expect(page.getByText('Your Progress')).toBeVisible();
    await expect(page.getByText('Completed').first()).toBeVisible();
  });
});
