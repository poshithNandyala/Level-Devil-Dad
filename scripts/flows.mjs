import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(700);
const shot = (n) => page.screenshot({ path: `shots/flow-${n}.png` });
await page.evaluate(() => { const a = window.__ldd; a.store.data.seenControls = true; a.input.usingTouch = true; });
// pause menu with hint unlocked
await page.evaluate(() => { const a = window.__ldd; a.startStage('HYD-03', null); a.session.deaths = 5; a.pause(); });
await page.waitForTimeout(400);
await shot('pause');
await page.evaluate(() => window.__ldd.showHint());
await page.waitForTimeout(300);
await shot('hint');
// city escaped: mark HYD-01..07 as cleared, then clear HYD-08
await page.evaluate(() => {
  const a = window.__ldd;
  for (const [i, d] of [[1, 3], [2, 5], [3, 9], [4, 4], [5, 2], [6, 7], [7, 1]]) Object.assign(a.store.stage('HYD-' + String(i).padStart(2, '0')), { cleared: true, best: 5 + i, firstClearDeaths: d, deaths: d });
  a.startStage('HYD-08', null);
  a.session.deaths = 6; a.session.lastTime = 9.4; a.session.done = true;
  a.store.stage('HYD-08').deaths = 6;
  a.onStageClear(a.session);
});
await page.waitForTimeout(1200);
await shot('city');
// share fallback from the city screen
await page.locator('button', { hasText: 'Share' }).first().click();
await page.waitForTimeout(800);
await shot('share');
// journey with the stamp
await page.evaluate(() => window.__ldd.showJourney());
await page.waitForTimeout(400);
await shot('journey-stamped');
// challenge entry & hash link
await page.evaluate(() => window.__ldd.showChallengeEntry());
await page.waitForTimeout(300);
await page.keyboard.type('blr4');
await page.keyboard.press('Enter');
await page.waitForTimeout(900);
await shot('challenge-started');
console.log(await page.evaluate(() => window.__ldd.session?.def.id));
console.log(errors.length ? errors.join('\n') : 'no errors');
await browser.close();
