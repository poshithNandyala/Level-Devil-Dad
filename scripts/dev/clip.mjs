// frames of a stretch of a recorded route, for a how-to clip: node scripts/dev/clip.mjs ID from to every
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
const [, , id, fromS, toS, everyS = '4'] = process.argv;
const d = JSON.parse(readFileSync(`/tmp/rec/${id}.json`, 'utf8'));
const from = +fromS, to = Math.min(+toS, d.end), every = +everyS;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(700);
await page.evaluate((id) => {
  const a = window.__ldd;
  a.store.data.seenControls = true;
  a.input.usingTouch = true;
  a.store.stage(id.slice(0, 3) + '-01').attempts = 1;
  a.startStage(id, null);
  a.session.paused = true;
}, id);
await page.waitForTimeout(250);
const run = (a, b) => page.evaluate(([rec, a, b]) => {
  const s = window.__ldd.session;
  s.paused = false;
  for (let i = a; i < b && i < rec.length; i++) {
    const v = rec[i];
    s.tick({ left: !!(v & 1), right: !!(v & 2), jump: !!(v & 4), jumpPressed: !!(v & 8) });
  }
  s.paused = true;
}, [d.rec, a, b]);
await run(0, from);
let n = 0;
for (let t = from; t <= to; t += every) {
  await run(t, Math.min(t + every, to));
  await page.waitForTimeout(40);
  await page.screenshot({ path: `shots/clip/${id}-${String(n++).padStart(4, '0')}.png` });
}
console.log('frames', n);
await browser.close();
