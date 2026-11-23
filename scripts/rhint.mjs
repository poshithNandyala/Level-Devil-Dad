// Screenshot: the hint ghost (and the room banner) in a room.
import { chromium } from 'playwright';
const [, , id = 'MUM-3', out = 'shots'] = process.argv;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(800);
await page.evaluate((id) => {
  const a = window.__ldd;
  a.input.usingTouch = true;
  a.startRoom(id);
}, id);
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}/${id}-banner.png` });
await page.evaluate(() => {
  const s = window.__ldd.session;
  s.deaths = 5;
});
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}/${id}-hintbtn.png` });
await page.evaluate(() => {
  const s = window.__ldd.session;
  s.startGuide();
  s.restart();
});
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/${id}-hint.png` });
await browser.close();
