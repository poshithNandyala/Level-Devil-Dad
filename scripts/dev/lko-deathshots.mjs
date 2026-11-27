// scratch (not committed): one frame just before each recorded death, from /tmp/lko-deaths/<ID>__<kind>.json
// node scripts/dev/lko-deathshots.mjs LKO-02,LKO-03
import { chromium } from 'playwright';
import { readFileSync, readdirSync, mkdirSync } from 'fs';
const [, , list = ''] = process.argv;
const want = list.split(',').filter(Boolean);
const files = readdirSync('/tmp/lko-deaths').filter((f) => f.endsWith('.json') && (!want.length || want.includes(f.slice(0, 6))));
mkdirSync('shots/deaths', { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(700);
for (const f of files) {
  const id = f.slice(0, 6);
  const d = JSON.parse(readFileSync(`/tmp/lko-deaths/${f}`, 'utf8'));
  await page.evaluate((id) => {
    const a = window.__ldd;
    a.store.data.seenControls = true;
    a.input.usingTouch = true;
    a.store.stage(id.slice(0, 3) + '-01').attempts = 1;
    a.startStage(id, null);
    a.session.paused = true;
  }, id);
  await page.waitForTimeout(200);
  // the frame a few ticks before the end (the moment of the mistake), then the death card
  const to = Math.max(0, d.rec.length - 10);
  for (const [from, upto, tag] of [[0, to, 'a'], [to, d.rec.length + 40, 'b']]) {
    await page.evaluate(([rec, from, upto]) => {
      const s = window.__ldd.session;
      s.paused = false;
      for (let i = from; i < upto; i++) {
        const b = i < rec.length ? rec[i] : 0;
        s.tick({ left: !!(b & 1), right: !!(b & 2), jump: !!(b & 4), jumpPressed: !!(b & 8) });
      }
      s.paused = true;
    }, [d.rec, from, upto]);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `shots/deaths/${f.slice(0, -5)}-${tag}.png` });
  }
}
console.log(errors.length ? errors.join('\n') : 'no errors');
await browser.close();
