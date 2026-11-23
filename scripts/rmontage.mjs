// Screenshots of the fail montage and the result card for a room.
import { chromium } from 'playwright';
const [, , id = 'MUM-1', out = 'shots'] = process.argv;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(800);
await page.evaluate((id) => {
  const r = window.__lddRoom(id);
  const tries = [r.natural, r.fix ?? r.natural, r.natural, r.solution];
  window.__ldd.input.usingTouch = true;
  window.__ldd.debugTries(id, tries);
}, id);
const t0 = Date.now();
while (Date.now() - t0 < 30000) {
  const sc = await page.evaluate(() => window.__ldd.screen);
  if (sc === 'montage') break;
  await page.waitForTimeout(50);
}
await page.waitForTimeout(1600);
await page.screenshot({ path: `${out}/${id}-montage.png` });
while (Date.now() - t0 < 45000) {
  const sc = await page.evaluate(() => window.__ldd.screen);
  if (sc === 'result') break;
  await page.waitForTimeout(50);
}
await page.waitForTimeout(700);
await page.screenshot({ path: `${out}/${id}-result.png` });
console.log(errors.length ? errors.join('\n') : 'no errors');
await browser.close();
