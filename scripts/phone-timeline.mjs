// Simulates a mid-range phone on ~Slow 4G and captures what the visitor sees over time.
import { chromium, devices } from 'playwright';
import fs from 'node:fs';

const url = process.argv[2] || 'https://heyren.vercel.app';
const out = '/tmp/timeline';
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ ...devices['iPhone 14'] });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send('Network.enable');
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

const log = [];
let bytes = 0;
cdp.on('Network.loadingFinished', (e) => { bytes += e.encodedDataLength; });
const t0 = Date.now();
page.on('console', (m) => log.push(`${((Date.now() - t0) / 1000).toFixed(1)}s console.${m.type()}: ${m.text().slice(0, 140)}`));
page.on('pageerror', (e) => log.push(`${((Date.now() - t0) / 1000).toFixed(1)}s PAGEERROR ${e.message.slice(0, 200)}`));

page.goto(url, { waitUntil: 'commit' }).catch(() => {});
const marks = [0.5, 1, 1.5, 2, 3, 4, 6, 8, 11, 15, 20, 28];
for (const s of marks) {
  const wait = s * 1000 - (Date.now() - t0);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  try {
    await page.screenshot({ path: `${out}/${String(s).padStart(4, '0')}s.png`, timeout: 15000 });
    const info = await page.evaluate(() => {
      const el = document.querySelector('.hero-static-preview');
      const h1 = document.querySelector('h1');
      return {
        poster: el ? el.className : null,
        h1: h1 ? getComputedStyle(h1).opacity : null,
        canvases: document.querySelectorAll('canvas').length,
        scrollW: document.documentElement.scrollWidth,
        innerW: innerWidth,
      };
    }).catch(() => ({}));
    log.push(`${s}s  bytes=${(bytes / 1024).toFixed(0)}KB  ${JSON.stringify(info)}`);
  } catch (e) {
    log.push(`${s}s screenshot failed: ${e.message.slice(0, 80)}`);
  }
}
fs.writeFileSync(`${out}/log.txt`, log.join('\n'));
await browser.close();
console.log('DONE');
