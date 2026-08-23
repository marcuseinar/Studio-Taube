import { expect, test } from '@playwright/test';

test.describe('treatment filter', () => {
  test('narrows the list by search term', async ({ page }) => {
    await page.goto('/behandlingar/');

    const cards = page.locator('[data-treatment]');
    await expect(cards).toHaveCount(30);

    await page.getByRole('searchbox').fill('head spa');
    await expect(cards.locator('visible=true')).toHaveCount(2);
    await expect(page.getByText('2 behandlingar')).toBeVisible();
  });

  test('narrows the list by category and hides empty headings', async ({ page }) => {
    await page.goto('/behandlingar/');

    await page.getByRole('button', { name: 'Massage', exact: true }).click();

    await expect(page.locator('[data-treatment]').locator('visible=true')).toHaveCount(2);
    await expect(page.getByRole('heading', { level: 2, name: 'CO2-laser' })).toBeHidden();
    await expect(page.getByRole('heading', { level: 2, name: 'Massage', exact: true })).toBeVisible();
  });

  test('reports when nothing matches and can be cleared', async ({ page }) => {
    await page.goto('/behandlingar/');

    await page.getByRole('searchbox').fill('något som inte finns');
    await expect(page.getByText('Inga behandlingar matchar din sökning.')).toBeVisible();

    await page.getByRole('button', { name: 'Rensa' }).click();
    await expect(page.locator('[data-treatment]').locator('visible=true')).toHaveCount(30);
  });

  test('the category buttons report their pressed state', async ({ page }) => {
    await page.goto('/behandlingar/');

    const massage = page.getByRole('button', { name: 'Massage', exact: true });
    await expect(massage).toHaveAttribute('aria-pressed', 'false');
    await massage.click();
    await expect(massage).toHaveAttribute('aria-pressed', 'true');
  });
});

/**
 * The filter is an enhancement layered over a server-rendered list, not the
 * thing that renders it. Disabling scripts is how we assert that: search
 * engines index the delivered HTML, and a local salon depends on local search,
 * so the catalogue must never be client-rendered.
 */
test.describe('content is server-rendered, not client-rendered', () => {
  test.use({ javaScriptEnabled: false });

  test('the full catalogue and its booking links are in the delivered HTML', async ({ page }) => {
    await page.goto('/behandlingar/');

    await expect(page.locator('[data-treatment]')).toHaveCount(30);
    await expect(page.locator('[data-treatment]').locator('visible=true')).toHaveCount(30);

    const bookingLink = page.getByRole('link', { name: /Boka behandling/ }).first();
    await expect(bookingLink).toHaveAttribute('href', /bokadirekt\.se/);
  });
});
