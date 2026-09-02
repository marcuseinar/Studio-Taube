import { readFileSync } from 'node:fs';
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

test('a campaign card links to its own page with the full description', async ({ page }) => {
  await page.goto(url('/erbjudanden/'));

  // The card's hit area is stretched over the whole thing (see .card-link in
  // global.css), so the "Läs mer" label is decorative, not its own link — the
  // title carries the real, accessible link.
  await page
    .getByRole('article')
    .filter({ hasText: 'Cool Peel CO2-laser ansikte & hals' })
    .getByRole('link', { name: 'Cool Peel CO2-laser ansikte & hals' })
    .click();

  await expect(page).toHaveURL(/\/erbjudanden\/cool-peel-erbjudande\/$/);
  await expect(
    page.getByRole('heading', { level: 3, name: 'Att tänka på inför och efter din behandling' }),
  ).toBeVisible();
  // The catalogue price, not whatever the content file happens to say — see D11.
  await expect(page.getByRole('main')).toContainText('2 999');
});

test('a treatment description with a bulleted list renders as a real list, not a run-on paragraph', async ({
  page,
}) => {
  await page.goto(url('/behandlingar/head-spa-60-minuter/'));

  const items = page.getByRole('main').getByRole('listitem');
  await expect(items).toHaveCount(9);
  await expect(items.first()).toContainText('Ångbad för hår och ansikte');
});

test('the price list carries a price for every treatment', async ({ page }) => {
  await page.goto(url('/priser/'));

  const rows = page.locator('tbody tr');
  await expect(rows).toHaveCount(30);
});

test('every published price is the one Bokadirekt is currently charging', async ({ page }) => {
  const catalogue = JSON.parse(readFileSync('data/bokadirekt-catalogue.json', 'utf8')) as {
    services?: { id: number; name: string; price: number }[];
  }[];

  const priceById = new Map(
    catalogue.flatMap((category) => (category.services ?? []).map((service) => [service.id, service.price])),
  );

  await page.goto(url('/priser/'));

  // Each row carries its Bokadirekt id, so a price that drifted from the
  // catalogue fails here rather than on the live site. See DECISIONS.md D11.
  const rows = await page.locator('tbody tr[data-bokadirekt-service-id]').all();
  expect(rows.length).toBeGreaterThan(0);

  for (const row of rows) {
    const id = Number(await row.getAttribute('data-bokadirekt-service-id'));
    const expected = priceById.get(id);
    expect(expected, `service ${id} is on the site but not in the catalogue`).toBeDefined();

    const rendered = (await row.innerText()).replace(/\s/gu, '');
    expect(rendered, `service ${id} shows a price the catalogue does not`).toContain(
      // Thousands are grouped for reading, so compare digits against digits.
      expected === 0 ? 'Kostnadsfri' : String(expected),
    );
  }
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
