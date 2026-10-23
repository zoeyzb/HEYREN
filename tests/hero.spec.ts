import { expect, test } from '@playwright/test';

test('robot poster is visible immediately and does not load WebGL', async ({ page }) => {
  const heavyRequests: string[] = [];
  page.on('request', request => {
    if (/splinecode|prod\.spline|three.*\.js|wasm|runtime-webgpu/i.test(request.url())) heavyRequests.push(request.url());
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const poster = page.locator('.hero-robot-poster');
  await expect(poster).toBeVisible();
  await expect(poster).toHaveJSProperty('complete', true);
  await page.waitForTimeout(800);
  expect(heavyRequests).toEqual([]);
  expect(await page.locator('#home canvas').count()).toBe(0);
  await page.screenshot({path:'review/hero-stable-desktop.png',animations:'disabled'});
});

test('robot video starts and the site remains interactive', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  const video = page.locator('.hero-robot-loop');
  await expect(video).toHaveClass(/is-playing/, { timeout:10000 });
  expect(await video.evaluate((v: HTMLVideoElement)=>v.readyState)).toBeGreaterThanOrEqual(2);
  await expect(page.locator('#home h1')).toContainText('Meet the voice');
  await page.getByRole('button',{name:/Hear Heyrin in Action/}).click();
  await expect(page).toHaveURL(/#experience|\/$/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
});

test('failed media and reduced motion preserve the robot image', async ({page})=>{
  await page.route('**/hero-robot-loop.mp4', r=>r.abort());
  await page.goto('/');
  await page.waitForTimeout(1000);
  await expect(page.locator('.hero-robot-poster')).toBeVisible();
  await expect(page.locator('.hero-robot-loop')).not.toHaveClass(/is-playing/);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('.hero-robot-loop')).toHaveCSS('display','none');
});

test('mobile shows stable hero without downloading spline or overflow',async({page})=>{
  const urls: string[]=[];page.on('request',r=>{if(/splinecode|runtime-webgpu/i.test(r.url()))urls.push(r.url())});
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await expect(page.locator('.hero-robot-poster')).toBeVisible();
  await expect(page.getByRole('button',{name:'Toggle menu'})).toBeVisible();
  await page.waitForTimeout(1600);
  expect(urls).toEqual([]);
  expect(await page.locator('#home canvas').count()).toBe(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  await page.screenshot({path:'review/hero-stable-mobile.png',animations:'disabled'});
});
