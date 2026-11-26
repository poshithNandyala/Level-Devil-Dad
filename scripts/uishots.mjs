// Screenshots of the hint strip, the home-city picker, the map pin and the badge at two phone sizes.
// npm run build:single && node scripts/uishots.mjs [outDir]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const out = process.argv[2] || 'shots/ui';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox'] });
const errors = [];
const report = [];
for (const [W, H] of [
  [780, 360],
  [844, 390],
]) {
  const tag = `${W}x${H}`;
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${tag} PAGEERROR ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`${tag} ${m.text()}`));
  await page.goto(`file://${process.cwd()}/dist-single/index.html`);
  await page.waitForTimeout(800);
  // first launch: the picker comes up by itself
  const firstScreen = await page.evaluate(() => window.__ldd.screen);
  report.push(`${tag} first screen: ${firstScreen}`);
  await page.screenshot({ path: `${out}/picker-${tag}.png` });
  // pick a city by tapping it
  await page.locator('.hp-city', { hasText: 'Hyderabad' }).first().tap();
  await page.waitForTimeout(400);
  report.push(`${tag} after pick: screen ${await page.evaluate(() => window.__ldd.screen)}, home ${await page.evaluate(() => window.__ldd.store.data.home)}`);
  // some progress so "N cities away" means something: TVM + CHN cleared
  await page.evaluate(() => {
    const a = window.__ldd;
    a.store.data.seenControls = true;
    a.input.usingTouch = true;
    for (const c of ['TVM', 'CHN']) {
      for (let i = 1; i <= 8; i++) Object.assign(a.store.stage(`${c}-0${i}`), { cleared: true, best: 9, firstClearDeaths: 2, deaths: 2 });
      a.store.data.stamps[c] = 16;
    }
    a.showJourney('HYD');
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}/map-home-${tag}.png` });
  report.push(`${tag} map tag: ${await page.evaluate(() => [...document.querySelectorAll('.hometag text')].map((t) => t.textContent).join(' / '))}`);
  report.push(`${tag} card badge: ${await page.evaluate(() => document.querySelector('.citycard .homebadge')?.textContent)}`);
  await page.evaluate(() => window.__ldd.showStages('HYD'));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/stages-badge-${tag}.png` });
  // the hint, opened from the pause menu after a few deaths, on two stages
  for (const id of ['HYD-03', 'TVM-04']) {
    await page.evaluate((id) => {
      const a = window.__ldd;
      a.startStage(id, null);
      a.session.deaths = 5;
      a.pause();
    }, id);
    await page.waitForTimeout(500);
    await page.locator('button', { hasText: 'Hint' }).first().tap();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${out}/hint-${id}-${tag}.png` });
    const r = await page.evaluate(() => {
      const el = document.querySelector('.hintsheet');
      const b = el.getBoundingClientRect();
      const a = window.__ldd;
      return { top: Math.round(b.top), bottom: Math.round(b.bottom), h: Math.round(b.height), pct: Math.round((b.height / innerHeight) * 100), paused: a.session.paused, text: el.textContent.slice(0, 60) };
    });
    report.push(`${tag} ${id} hint strip y ${r.top}-${r.bottom} (${r.pct}% of height), paused=${r.paused}: ${r.text}`);
    // tap: the next part
    await page.locator('.hintsheet').tap();
    await page.waitForTimeout(250);
    report.push(`${tag} ${id} after tap: ${await page.evaluate(() => document.querySelector('.hintsheet')?.querySelector('.hs-tag')?.textContent ?? 'closed')}`);
    // a restart closes it
    await page.evaluate(() => window.__ldd.session.restart());
    await page.waitForTimeout(300);
    report.push(`${tag} ${id} after restart: ${await page.evaluate(() => (document.querySelector('.hintsheet') ? 'still open' : 'closed'))}`);
  }
  // swipe up closes it
  await page.evaluate(() => window.__ldd.showHint());
  await page.waitForTimeout(400);
  const b = await page.locator('.hintsheet').boundingBox();
  await page.evaluate(({ x, y }) => {
    const el = document.querySelector('.hintsheet');
    const ev = (type, yy) => el.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: x, clientY: yy, pointerId: 7, pointerType: 'touch' }));
    ev('pointerdown', y);
    ev('pointermove', y - 20);
    ev('pointerup', y - 40);
  }, { x: b.x + b.width / 2, y: b.y + b.height / 2 });
  await page.waitForTimeout(400);
  report.push(`${tag} after swipe up: ${await page.evaluate(() => (document.querySelector('.hintsheet') ? 'still open' : 'closed'))}`);
  // a death closes it
  await page.evaluate(() => window.__ldd.showHint());
  await page.waitForTimeout(200);
  await page.evaluate(() => (window.__ldd.session.deaths += 1));
  await page.waitForTimeout(300);
  report.push(`${tag} after a death: ${await page.evaluate(() => (document.querySelector('.hintsheet') ? 'still open' : 'closed'))}`);
  // the talk card (Tara's intro) and the death callouts, to check they leave Dad and the door clear
  await page.evaluate(() => window.__ldd.startStage('TVM-02', null));
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${out}/talk-TVM-02-${tag}.png` });
  await page.evaluate(() => window.__ldd.seven('Ezhu thavana! Thala for a reason. | Seven deaths! Back to the start.'));
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}/death-seven-${tag}.png` });
  await page.evaluate(() => window.__ldd.nearMiss('Ichiri koodi! | Just a little more!'));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/death-near-${tag}.png` });
  // settings has the row, and the picker opens from it
  await page.evaluate(() => window.__ldd.showSettings('title'));
  await page.waitForTimeout(300);
  await page.locator('.setting', { hasText: 'Where are you from' }).locator('button').tap();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/picker-settings-${tag}.png` });
  report.push(`${tag} picker from settings: ${await page.evaluate(() => window.__ldd.screen)}, selected ${await page.evaluate(() => document.querySelector('.hp-city.on .hp-name')?.firstChild?.textContent)}`);
  await ctx.close();
}
console.log(report.join('\n'));
console.log(errors.length ? errors.join('\n') : 'no errors');
await browser.close();
