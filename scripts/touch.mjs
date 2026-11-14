// Multi-touch check: hold the right-arrow zone with one finger, tap jump with another.
import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(700);
await page.evaluate(() => { const a = window.__ldd; a.store.data.seenControls = true; a.startStage('HYD-02', null); });
await page.waitForTimeout(300);
const r = await page.evaluate(async () => {
  const a = window.__ldd; const cv = document.getElementById('game');
  const L = a.input.layout;
  const fire = (type, id, x, y) => cv.dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType: 'touch', clientX: x, clientY: y, bubbles: true, cancelable: true, isPrimary: id === 1 }));
  const x0 = a.session.world.player.x;
  fire('pointerdown', 1, L.right.x, L.right.y);       // hold "right"
  await new Promise((r) => setTimeout(r, 400));
  const x1 = a.session.world.player.x;
  fire('pointerdown', 2, L.jump.x, L.jump.y);         // second finger: jump
  await new Promise((r) => setTimeout(r, 120));
  const yJump = a.session.world.player.y;
  fire('pointerup', 2, L.jump.x, L.jump.y);
  fire('pointermove', 1, L.left.x, L.left.y);         // slide thumb to "left"
  await new Promise((r) => setTimeout(r, 400));
  const x2 = a.session.world.player.x;
  fire('pointerup', 1, L.left.x, L.left.y);
  return { x0, x1, yJump, x2, deaths: a.session.deaths };
});
console.log(JSON.stringify(r));
await browser.close();
