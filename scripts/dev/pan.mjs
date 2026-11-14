// Layout check: pan the camera across a whole stage (no play, Dad teleported along it).
//   node scripts/dev/pan.mjs KVT-06 [screens] [y]  → shots/pan/KVT-06-<i>.png
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const [, , id = 'KVT-06', n = '0', yArg = ''] = process.argv;
mkdirSync('shots/pan', { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(700);
const W = await page.evaluate((id) => {
  const a = window.__ldd;
  a.store.data.seenControls = true;
  a.input.usingTouch = false;
  a.store.stage(id.slice(0, 3) + '-01').attempts = 1;
  a.startStage(id, null);
  a.session.paused = true;
  return a.session.world.W;
}, id);
await page.waitForTimeout(300);
const screens = +n || Math.ceil(W / 420);
for (let i = 0; i < screens; i++) {
  const x = Math.round((W - 40) * (screens === 1 ? 0 : i / (screens - 1))) + 20;
  await page.evaluate(([x, y]) => {
    const a = window.__ldd;
    const p = a.session.world.player;
    p.x = x;
    if (y) p.y = +y;
    a.renderer.snapNext = true;
  }, [x, yArg]);
  await page.waitForTimeout(220);
  await page.screenshot({ path: `shots/pan/${id}-${i}.png` });
}
console.log(errors.length ? errors.join('\n') : `ok ${screens} shots, W=${W}`);
await browser.close();
