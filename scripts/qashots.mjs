// Screens for visual QA: title, map (new player and mid-journey), a locked city card,
// a stage clear with stars, and the city-cleared stamp. node scripts/qashots.mjs [w] [h]
import { chromium } from 'playwright';
const [, , w = '844', h = '390'] = process.argv;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
const shot = async (name, wait = 700) => {
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `shots/qa-${name}.png` });
};
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(800);
await shot('title', 300);
await page.evaluate(() => {
  const a = window.__ldd;
  a.store.data.seenControls = true;
  a.showJourney();
});
await shot('map-new', 1200);
// a player half-way through the south
await page.evaluate(() => {
  const a = window.__ldd;
  const done = (id, t, got) => (a.store.data.stages[id] = { attempts: 3, deaths: 2, cleared: true, best: t, got });
  for (const c of ['TVM', 'KVT', 'CHN', 'PDY']) {
    const n = c === 'KVT' ? 3 : 5;
    for (let i = 1; i <= n; i++) done(`${c}-${String(i).padStart(2, "0")}`, 5 + i, i % 2 === 0);
    a.store.data.stamps[c] = 7;
  }
  a.store.save();
  a.showJourney('BLR', 'PDY');
});
await shot('map-mid', 2600);
await page.click('.mapzoom').catch(() => {});
await shot('map-mid-all', 1200);
// tap a locked city far north
await page.evaluate(() => window.__ldd.map?.select?.('JMU'));
await shot('card-locked', 900);
// clear a stage by walking Dad into the door
await page.evaluate(() => window.__ldd.startStage('BLR-01', null));
await page.waitForTimeout(800);
await page.evaluate(() => {
  const s = window.__ldd.session;
  const z = s.world.exits[0].zone();
  const p = s.world.player;
  p.x = z.x + z.w / 2 - p.w / 2;
  p.y = z.y + z.h - p.h;
});
await shot('clear', 2200);
console.log(errors.length ? errors.join('\n') : 'no errors');
await browser.close();
