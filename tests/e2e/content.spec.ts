import { expect, test } from '@playwright/test';
import { url } from './site-paths.ts';

test('opening hours and address are visible on the contact page', async ({ page }) => {
  await page.goto(url('/kontakt/'));

  const main = page.getByRole('main');
  await expect(main.getByText('Spinnerivägen 1')).toBeVisible();
  await expect(page.getByRole('row', { name: /Torsdag/ })).toContainText('20:00');
  await expect(page.getByRole('row', { name: /Lördag/ })).toContainText('Stängt');
  await expect(page.getByRole('link', { name: /Visa på karta/ })).toBeVisible();
});

test('an active campaign appears with its ordinary price struck through', async ({ page }) => {
  await page.goto(url('/erbjudanden/'));

  const card = page.getByRole('article').filter({ hasText: 'Head spa 60 minuter' });
  await expect(card).toContainText('760');
  await expect(card.locator('s')).toContainText('950');
});

test('the price list carries a price for every treatment', async ({ page }) => {
  await page.goto(url('/priser/'));

  const rows = page.locator('tbody tr');
  await expect(rows).toHaveCount(30);
});

test('structured data describes the salon', async ({ page }) => {
  await page.goto(url('/'));

  const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
  const schema = JSON.parse(raw ?? '{}');

  expect(schema['@type']).toBe('BeautySalon');
  expect(schema.address.streetAddress).toBe('Spinnerivägen 1');
  expect(schema.address.postalCode).toBe('448 50');
  expect(schema.openingHoursSpecification).toHaveLength(5);
});
