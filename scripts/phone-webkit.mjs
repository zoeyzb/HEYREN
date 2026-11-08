// Real WebKit (the engine every iPhone browser uses, including Chrome on iOS) with iPhone 14 emulation.
import { webkit, devices } from 'playwright';
import fs from 'node:fs';

const url = process.argv[2] || 'https://heyren.vercel.app';
const out = '/tmp/wk';
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const browser = await webkit.launch();
const ctx = await browser.newContext({ ...devices['iPhone 14'] });
const page = await ctx.newPage();
const log = [];
const t0 = Date.now();
const ts = () => ((Date.now() - t0) / 1000).toFixed(1) + 's';
let bytes = 0;
page.on('response', async (r) => { try { const b = await r.body(); bytes += b.length; } catch {} });
page.on('console', (m) => log.push(`${ts()} console.${m.type()}: ${m.text().slice(0, 200)}`));
page.on('pageerror', (e) => log.push(`${ts()} PAGEERROR ${String(e.message).slice(0, 300)}`));
page.on('requestfailed', (r) => log.push(`${ts()} REQFAILED ${r.url().slice(0, 100)} ${r.failure()?.errorText}`));

page.goto(url, { waitUntil: 'commit' }).catch((e) => log.push('goto ' + e.message));
for (const s of [1, 2, 4, 7, 12, 20]) {
  const wait = s * 1000 - (Date.now() - t0);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  try {
    await page.screenshot({ path: `${out}/t${String(s).padStart(2, '0')}.png`, timeout: 15000 });
    const info = await page.evaluate(() => {
      const el = document.querySelector('.hero-static-preview');
      return { poster: el && el.className, canvases: document.querySelectorAll('canvas').length, scrollW: document.documentElement.scrollWidth, innerW: innerWidth };
    }).catch((e) => ({ err: String(e).slice(0, 80) }));
    log.push(`${ts()} (target ${s}s) bytes=${(bytes / 1024).toFixed(0)}KB ${JSON.stringify(info)}`);
  } catch (e) {
    log.push(`${ts()} screenshot failed ${e.message.slice(0, 100)}`);
  }
}
fs.writeFileSync(`${out}/log.txt`, log.join('\n'));
await browser.close();
console.log('DONE');
