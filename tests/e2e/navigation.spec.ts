import { expect, test } from '@playwright/test';

test.describe('mobile navigation', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the menu opens from a native disclosure and navigates', async ({ page }) => {
    await page.goto('/');

    const nav = page.getByRole('navigation', { name: 'Meny' });
    await expect(nav).toBeHidden();

    await page.getByText('Meny', { exact: true }).click();
    await expect(nav).toBeVisible();

    await nav.getByRole('link', { name: 'Priser' }).click();
    await expect(page).toHaveURL(/\/priser\/$/);
  });

  test('the sticky header stays out of the way', async ({ page }) => {
    await page.goto('/');

    const header = page.locator('header');
    const height = (await header.boundingBox())?.height ?? 0;
    expect(height).toBeLessThan(100);
  });
});

test.describe('desktop navigation', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('marks the current page for assistive technology', async ({ page }) => {
    await page.goto('/priser/');

    const current = page.getByRole('navigation', { name: 'Meny' }).getByRole('link', { name: 'Priser' });
    await expect(current).toHaveAttribute('aria-current', 'page');
  });
});
