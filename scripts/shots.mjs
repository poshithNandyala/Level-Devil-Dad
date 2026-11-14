import { chromium } from 'playwright';
const [, , which = 'all', w = '844', hgt = '390'] = process.argv;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: +w, height: +hgt }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`); });
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(900);
const tag = `${w}x${hgt}`;
if (which === 'all' || which === 'menus') {
  await page.screenshot({ path: `shots/title-${tag}.png` });
  await page.evaluate(() => { const a = window.__ldd; a.store.data.seenControls = true; a.showJourney(); });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `shots/journey-${tag}.png` });
  await page.evaluate(() => window.__ldd.showStages('HYD'));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `shots/stages-${tag}.png` });
  await page.evaluate(() => window.__ldd.showSettings('title'));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `shots/settings-${tag}.png` });
  await page.evaluate(() => window.__ldd.showControlsIntro(() => {}));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `shots/intro-${tag}.png` });
}
if (which === 'all' || which === 'levels') {
  const ids = await page.evaluate(() => ['HYD','BLR','BOM'].flatMap(c => [1,2,3,4,5].map(i => `${c}-0${i}`)));
  await page.evaluate(() => { window.__ldd.store.data.seenControls = true; window.__ldd.input.usingTouch = true; });
  for (const id of ids) {
    await page.evaluate((id) => window.__ldd.startStage(id, null), id);
    await page.waitForTimeout(1100);
    await page.screenshot({ path: `shots/${id}-${tag}.png` });
  }
}
console.log(errors.length ? errors.join('\n') : 'no console errors');
await browser.close();
