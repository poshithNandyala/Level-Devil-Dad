// Step a stage deterministically inside the page with scripted inputs and snapshot states.
import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(700);
await page.evaluate(() => { const a = window.__ldd; a.store.data.seenControls = true; a.input.usingTouch = true; });
async function run(id, plan) {
  await page.evaluate((id) => { const a = window.__ldd; a.startStage(id, null); a.session.paused = true; }, id);
  for (const [i, seg] of plan.entries()) {
    await page.evaluate((seg) => {
      const a = window.__ldd; const s = a.session;
      s.paused = false;
      for (let t = 0; t < seg.t; t++) s.tick({ left: seg.k.includes('L'), right: seg.k.includes('R'), jump: seg.k.includes('J'), jumpPressed: seg.k.includes('J') && t === 0 });
      s.paused = true;
    }, seg);
    if (seg.shot) { await page.waitForTimeout(120); await page.screenshot({ path: `shots/scrub-${id}-${seg.shot}.png` }); }
  }
}
// HYD-03: take Tara's bait (die on the ground pit), then show her laughing on respawn
await run('HYD-03', [{ k: 'R', t: 115 }, { k: '', t: 60, shot: 'death' }, { k: '', t: 30, shot: 'laugh' }]);
// BLR-01: bus carrying Papa
await run('BLR-01', [{ k: 'R', t: 20 }, { k: 'RJ', t: 16 }, { k: '', t: 60 }, { k: 'R', t: 20 }, { k: 'RJ', t: 14 }, { k: '', t: 760, shot: 'ride' }]);
// BOM-01: walking right on the treadmill pulls the platform away
await run('BOM-01', [{ k: 'R', t: 90, shot: 'treadmill' }]);
// BOM-03: trusting Tara gets you shoved by the crowd
await run('BOM-03', [{ k: 'L', t: 72 }, { k: 'L', t: 12, shot: 'shove' }]);
// BOM-04: the flood mid-rise
await run('BOM-04', [{ k: '', t: 100 }, { k: 'R', t: 40 }, { k: 'RJ', t: 12 }, { k: '', t: 600, shot: 'flood' }]);
// BLR-05: jump flips the signal; bus comes under you
await run('BLR-05', [{ k: 'J', t: 30, shot: 'flip' }, { k: '', t: 140, shot: 'ride' }]);
console.log(errors.length ? errors.join('\n') : 'no errors');
await browser.close();
