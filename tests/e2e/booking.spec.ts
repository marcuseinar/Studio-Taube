import { expect, test } from '@playwright/test';

test.describe('booking journey', () => {
  test('a visitor can reach the correct Bokadirekt page for a treatment', async ({ page }) => {
    await page.goto('/behandlingar/');

    const headSpa = page.getByRole('link', { name: 'Head spa 60 minuter' });
    await expect(headSpa).toBeVisible();
    await headSpa.click();

    await expect(page).toHaveURL(/\/behandlingar\/head-spa-60-minuter\/$/);

    const bookingLink = page.getByRole('link', { name: /Boka behandling/ }).first();
    await expect(bookingLink).toHaveAttribute(
      'href',
      'https://www.bokadirekt.se/boka-tjanst/studio-taube-56559/head-spa-60-minuter-3077572',
    );
    await expect(bookingLink).toHaveAttribute('target', '_blank');
    await expect(bookingLink).toHaveAttribute('rel', /noopener/);
  });

  test('every booking link points at this salon on Bokadirekt', async ({ page }) => {
    await page.goto('/behandlingar/');

    const hrefs = await page
      .locator('a[href*="bokadirekt.se"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));

    expect(hrefs.length).toBeGreaterThan(10);
    for (const href of hrefs) {
      expect(href).toMatch(/^https:\/\/www\.bokadirekt\.se\/(boka-tjanst|places)\/studio-taube-56559/);
    }
  });

  test('a treatment requiring consultation says so', async ({ page }) => {
    await page.goto('/behandlingar/co2-laser-hander/');
    await expect(page.getByText(/konsultation krävs/i)).toBeVisible();
  });
});
