// QA shots along a whole stage route (fractions of the recorded run): node scripts/dev/routeshots.mjs IDS fracs
import { chromium } from 'playwright';
import { readFileSync, readdirSync } from 'fs';
const [, , list = '', fracs = '0.12,0.5,0.88'] = process.argv;
const ids = (list ? list.split(',') : readdirSync('/tmp/rec').map((f) => f.slice(0, -5))).filter((id) => {
  const d = JSON.parse(readFileSync(`/tmp/rec/${id}.json`, 'utf8'));
  return true;
});
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(700);
for (const id of ids) {
  const d = JSON.parse(readFileSync(`/tmp/rec/${id}.json`, 'utf8'));
  await page.evaluate((id) => {
    const a = window.__ldd;
    a.store.data.seenControls = true;
    a.input.usingTouch = true;
    a.store.stage(id.slice(0, 3) + '-01').attempts = 1;
    a.startStage(id, null);
    a.session.paused = true;
  }, id);
  await page.waitForTimeout(250);
  let at = 0;
  for (const f of fracs.split(',').map(Number)) {
    const t = Math.round(d.end * f);
    await page.evaluate(([rec, from, to]) => {
      const s = window.__ldd.session;
      s.paused = false;
      for (let i = from; i < to && i < rec.length; i++) {
        const b = rec[i];
        s.tick({ left: !!(b & 1), right: !!(b & 2), jump: !!(b & 4), jumpPressed: !!(b & 8) });
      }
      s.paused = true;
    }, [d.rec, at, t]);
    at = t;
    await page.waitForTimeout(380);
    await page.screenshot({ path: `shots/route/${id}-${String(f).replace('.', '')}.png` });
  }
}
console.log(errors.length ? errors.join('\n') : 'no errors');
await browser.close();
