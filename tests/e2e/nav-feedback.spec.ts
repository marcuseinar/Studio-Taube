import { expect, test } from '@playwright/test';
import { url } from './site-paths.ts';

/**
 * The underline is drawn on a pseudo-element, so its state has to be read from
 * the computed transform. Only visible links are measured: a hidden element
 * reports `transform: none`, which would otherwise read as "underlined" and
 * let a broken state pass.
 */
async function underlineScale(page: import('@playwright/test').Page, name: string): Promise<number> {
  const scale = await page.evaluate((linkName) => {
    const links = [...document.querySelectorAll('header nav a.nav-link')].filter(
      (a) => a.textContent?.trim() === linkName && (a as HTMLElement).offsetParent !== null,
    );
    if (links.length !== 1) return { error: `expected one visible "${linkName}", found ${links.length}` };

    const label = links[0]!.querySelector('.nav-link-label');
    if (!label) return { error: `"${linkName}" has no label element` };

    const transform = getComputedStyle(label, '::after').transform;
    if (transform === 'none') return { error: `"${linkName}" underline has no transform` };

    return { value: Number(transform.match(/matrix\(([-\d.]+)/)?.[1] ?? NaN) };
  }, name);

  if ('error' in scale) throw new Error(scale.error as string);
  return scale.value as number;
}

test.describe('menu link feedback', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('the current page keeps its underline, others start without one', async ({ page }) => {
    await page.goto(url('/priser/'));

    expect(await underlineScale(page, 'Priser')).toBeCloseTo(1, 1);
    expect(await underlineScale(page, 'Kontakt')).toBeCloseTo(0, 1);
  });

  test('hovering a link draws its underline', async ({ page }) => {
    await page.goto(url('/priser/'));

    const kontakt = page.getByRole('navigation', { name: 'Meny' }).getByRole('link', { name: 'Kontakt' });
    await kontakt.hover();
    await page.waitForTimeout(300);

    expect(await underlineScale(page, 'Kontakt')).toBeCloseTo(1, 1);
  });

  test('keyboard focus gives the same feedback as the mouse', async ({ page }) => {
    await page.goto(url('/priser/'));

    await page.getByRole('navigation', { name: 'Meny' }).getByRole('link', { name: 'Kontakt' }).focus();
    await page.waitForTimeout(300);

    expect(await underlineScale(page, 'Kontakt')).toBeCloseTo(1, 1);
  });

  test('the current page is not signalled by colour alone', async ({ page }) => {
    await page.goto(url('/kontakt/'));

    // WCAG 2.2 SC 1.4.1: the underline must be present independently of colour.
    expect(await underlineScale(page, 'Kontakt')).toBeCloseTo(1, 1);
    await expect(page.getByRole('navigation', { name: 'Meny' }).getByRole('link', { name: 'Kontakt' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});

test.describe('menu link feedback on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the open menu marks the current page the same way', async ({ page }) => {
    await page.goto(url('/priser/'));

    await page.getByText('Meny', { exact: true }).click();
    const nav = page.getByRole('navigation', { name: 'Meny' });
    await expect(nav).toBeVisible();

    await expect(nav.getByRole('link', { name: 'Priser' })).toHaveAttribute('aria-current', 'page');
    expect(await underlineScale(page, 'Priser')).toBeCloseTo(1, 1);
    expect(await underlineScale(page, 'Kontakt')).toBeCloseTo(0, 1);
  });
});
