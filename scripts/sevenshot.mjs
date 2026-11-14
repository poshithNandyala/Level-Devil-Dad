// Lives QA: die repeatedly and screenshot the HUD hearts and the 7th-death callout.
import { chromium } from 'playwright';
const [, , id = 'BLR-03'] = process.argv;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(700);
await page.evaluate(() => { const a = window.__ldd; a.store.data.seenControls = true; a.input.usingTouch = true; });
await page.evaluate((id) => window.__ldd.startStage(id, null), id);
await page.waitForTimeout(2600);
const kill = () => page.evaluate(() => window.__ldd.session.world.die('test'));
for (let i = 1; i <= 7; i++) {
  await kill();
  await page.waitForTimeout(i === 7 ? 650 : 900);
  if (i === 5) await page.screenshot({ path: 'shots/lives-5.png' });
  if (i === 6) await page.screenshot({ path: 'shots/lives-6.png' });
  if (i === 7) await page.screenshot({ path: 'shots/lives-7.png' });
}
await page.waitForTimeout(3000);
await page.screenshot({ path: 'shots/lives-after.png' });
const st = await page.evaluate(() => ({ lives: window.__ldd.session.lives, deaths: window.__ldd.session.deaths, wipes: window.__ldd.session.wipes }));
console.log(JSON.stringify(st));
console.log(errors.length ? errors.join('\n') : 'no errors');
await browser.close();
