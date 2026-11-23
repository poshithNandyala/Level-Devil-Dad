// Screenshots of the new game: title, map, and every room mid-action.
// node scripts/rshots.mjs [w] [h] [outdir] [ids...]
import { chromium } from 'playwright';
const [, , w = '844', hgt = '390', out = 'shots', ...only] = process.argv;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: +w, height: +hgt }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`); });
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(1200);
const tag = `${w}x${hgt}`;
const menusOnly = only[0] === 'menus';
if (!only.length || menusOnly) {
  await page.screenshot({ path: `${out}/title-${tag}.png` });
  await page.evaluate(() => window.__ldd.showMap());
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/map-${tag}.png` });
}
const ids = menusOnly ? [] : only.length ? only : await page.evaluate(() => window.__lddRoomIds());
for (const id of ids) {
  // the solution, frozen at 3 moments
  for (const [k, at] of [[0, 300], [1, 1500], [2, 2600]]) {
    await page.evaluate((id) => { const a = window.__ldd; a.input.usingTouch = true; a.debugRun(id, window.__lddRoom(id).solution); }, id);
    await page.waitForTimeout(at);
    await page.screenshot({ path: `${out}/${id}-${k}-${tag}.png` });
  }
  // the natural first try, at its death
  await page.evaluate((id) => window.__ldd.debugRun(id, window.__lddRoom(id).natural), id);
  await page.waitForTimeout(400);
  const t0 = Date.now();
  while (Date.now() - t0 < 6000) {
    const dead = await page.evaluate(() => window.__ldd.session && window.__ldd.session.world.state === 'dead');
    if (dead) break;
    await page.waitForTimeout(16);
  }
  await page.screenshot({ path: `${out}/${id}-dies-${tag}.png` });
}
console.log(errors.length ? errors.join('\n') : 'no console errors');
await browser.close();
