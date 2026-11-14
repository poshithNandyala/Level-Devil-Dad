// Mid-level screenshots for colour/vibe QA: node scripts/vibeshots.mjs TVM-02,KVT-03 [frac] [tag]
import { chromium } from 'playwright';
const [, , list = 'TVM-02', frac = '0.45', tag = ''] = process.argv;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(700);
await page.evaluate(() => { const a = window.__ldd; a.store.data.seenControls = true; a.input.usingTouch = true; });
for (const id of list.split(',')) {
  await page.evaluate((id) => window.__ldd.startStage(id, null), id);
  await page.waitForTimeout(400);
  await page.evaluate((f) => {
    const w = window.__ldd.session.world;
    const p = w.player;
    // find a standable column near the fraction
    const T = 16;
    let tx = f > 1 ? Math.floor(f) : Math.floor((w.W * f) / T);
    for (let k = 0; k < 40; k++) {
      for (const d of [k, -k]) {
        const x = tx + d;
        for (let ty = 2; ty < 17; ty++) {
          if (w.tiles[ty * w.cols + x] === 1 && w.tiles[(ty - 1) * w.cols + x] === 0 && w.tiles[(ty - 2) * w.cols + x] === 0) {
            p.x = x * T; p.y = ty * T - p.h; p.vx = 0; p.vy = 0; window.__ldd.session.hold = true; return;
          }
        }
      }
    }
  }, +frac);
  await page.waitForTimeout(1300);
  await page.screenshot({ path: `shots/vibe-${id}${tag}.png` });
}
console.log(errors.length ? errors.join('\n') : 'no errors');
await browser.close();
