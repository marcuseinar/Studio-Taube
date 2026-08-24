import { expect, test } from '@playwright/test';
import { url } from './site-paths.ts';

const heroVideo = (page: import('@playwright/test').Page) => page.locator('#hero-loop');

test.describe('hero video', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('offers AV1 first and falls back to H.264', async ({ page }) => {
    await page.goto(url('/'));

    const sources = page.locator('#hero-loop source');
    await expect(sources).toHaveCount(2);
    await expect(sources.nth(0)).toHaveAttribute('type', /av01/);
    await expect(sources.nth(1)).toHaveAttribute('type', 'video/mp4');
  });

  test('carries a poster and stays silent', async ({ page }) => {
    await page.goto(url('/'));

    const video = heroVideo(page);
    await expect(video).toHaveAttribute('poster', /head-spa-poster\.jpg$/);
    await expect(video).toHaveAttribute('playsinline', '');
    await expect(video).toHaveAttribute('loop', '');
    // No audio track exists at all, so nothing can play out loud.
    expect(await video.evaluate((el: HTMLVideoElement) => el.muted)).toBe(true);
  });

  test('starts playing and can be paused again', async ({ page }) => {
    await page.goto(url('/'));

    const video = heroVideo(page);
    await expect.poll(async () => video.evaluate((el: HTMLVideoElement) => el.paused), { timeout: 10_000 }).toBe(false);

    // WCAG 2.2 SC 2.2.2: motion that starts on its own must be stoppable.
    const control = page.locator('figure button');
    await expect(control).toBeVisible();
    await control.click();
    await expect.poll(async () => video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
    await expect(control).toHaveAttribute('aria-pressed', 'false');

    await control.click();
    await expect.poll(async () => video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(false);
  });
});

test.describe('hero video with reduced motion', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('does not start on its own, and is never even downloaded', async ({ page }) => {
    // emulateMedia rather than test.use({ reducedMotion }): the fixture option
    // does not reach the page under this config, and a silently ineffective
    // preference would make this test assert nothing.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(url('/'));
    await page.waitForTimeout(1500);

    const video = heroVideo(page);
    expect(await video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
    expect(await video.evaluate((el: HTMLVideoElement) => el.currentTime)).toBe(0);
    // preload="none" plus no autoplay means the file is never fetched.
    expect(await video.evaluate((el: HTMLVideoElement) => el.readyState)).toBe(0);

    // The visitor may still choose to play it.
    await expect(page.locator('figure button')).toBeVisible();
  });
});

test.describe('hero video without scripting', () => {
  test.use({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });

  test('shows the poster and offers no control it cannot honour', async ({ page }) => {
    await page.goto(url('/'));

    await expect(heroVideo(page)).toHaveAttribute('poster', /head-spa-poster\.jpg$/);
    await expect(page.locator('figure button')).toHaveCount(0);
  });
});
