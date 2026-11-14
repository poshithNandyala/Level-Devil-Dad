// Replay a recorded solution in the real build and screenshot at chosen ticks.
//   LDD_LEVEL=TVM-07 LDD_REC=/tmp/rec.json npx vitest run tests/debug.test.ts
//   node scripts/solshot.mjs TVM-07 /tmp/rec.json 300,620,900 [w] [h]
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
const [, , id, recPath, ticks, w = '844', h = '390'] = process.argv;
const rec = JSON.parse(readFileSync(recPath, 'utf8'));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(700);
await page.evaluate((id) => {
  const a = window.__ldd;
  a.store.data.seenControls = true;
  a.input.usingTouch = true;
  a.store.stage(id.slice(0, 3) + '-01').attempts = 1;
  a.startStage(id, null);
  a.session.paused = true;
}, id);
await page.waitForTimeout(400);
let at = 0;
for (const t of ticks.split(',').map(Number)) {
  await page.evaluate(([rec, from, to]) => {
    const s = window.__ldd.session;
    s.paused = false;
    for (let i = from; i < to && i < rec.length; i++) {
      const b = rec[i];
      s.tick({ left: !!(b & 1), right: !!(b & 2), jump: !!(b & 4), jumpPressed: !!(b & 8) });
    }
    s.paused = true;
  }, [rec, at, t]);
  at = t;
  await page.waitForTimeout(450);
  await page.screenshot({ path: `shots/sol-${id}-${t}.png` });
}
console.log(errors.length ? errors.join('\n') : 'no errors');
await browser.close();
