// Screenshot stages for visual QA: node scripts/stageshots.mjs TVM-01,TVM-02 [seconds] [w] [h]
import { chromium } from 'playwright';
const [, , list = 'TVM-01', secs = '1.2', w = '844', h = '390'] = process.argv;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(700);
await page.evaluate(() => { const a = window.__ldd; a.store.data.seenControls = true; a.input.usingTouch = true; });
for (const id of list.split(',')) {
  await page.evaluate((id) => window.__ldd.startStage(id, null), id);
  await page.waitForTimeout(+secs * 1000);
  await page.screenshot({ path: `shots/${id}.png` });
}
console.log(errors.length ? errors.join('\n') : 'no errors');
await browser.close();
