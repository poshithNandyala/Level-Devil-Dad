import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox'] });
const sizes = [
  ['phone-small', 640, 360],
  ['tablet', 1024, 768],
  ['portrait', 390, 844],
];
const errors = [];
for (const [name, w, hh] of sizes) {
  const ctx = await browser.newContext({ viewport: { width: w, height: hh }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(name + ' ' + e.message));
  await page.goto(`file://${process.cwd()}/dist-single/index.html`);
  await page.waitForTimeout(800);
  await page.screenshot({ path: `shots/size-${name}-title.png` });
  await page.evaluate(() => { const a = window.__ldd; a.store.data.seenControls = true; a.input.usingTouch = true; a.startStage('BLR-03', null); });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `shots/size-${name}-play.png` });
  if (name === 'portrait') {
    await page.locator('button', { hasText: 'Play upright anyway' }).click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `shots/size-${name}-play2.png` });
  }
  await ctx.close();
}
console.log(errors.length ? errors.join('\n') : 'no errors');
await browser.close();
