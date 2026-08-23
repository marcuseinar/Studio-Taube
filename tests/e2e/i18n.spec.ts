import { expect, test } from '@playwright/test';
import { BASE, url } from './site-paths.ts';

test('the language switch keeps the visitor on the same page', async ({ page }) => {
  await page.goto(url('/kontakt/'));
  await page.getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL(/\/en\/kontakt\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await page.getByRole('link', { name: 'Svenska' }).click();
  await expect(page).toHaveURL(/(?<!\/en)\/kontakt\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'sv-SE');
});

test('every page declares alternates for both locales', async ({ page }) => {
  await page.goto(url('/priser/'));

  await expect(page.locator('link[hreflang="sv-SE"]')).toHaveAttribute(
    'href',
    `https://marcuseinar.github.io${BASE}/priser/`,
  );
  await expect(page.locator('link[hreflang="en"]')).toHaveAttribute(
    'href',
    `https://marcuseinar.github.io${BASE}/en/priser/`,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    `https://marcuseinar.github.io${BASE}/priser/`,
  );
});
