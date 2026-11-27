// Migration proof shots: node shot.mjs OUTDIR CODE[,CODE...]  (run from the worktree, after build:single)
// For each city: stages 01 and 05, frames at tick 0, 150 and 400 of a fixed input (right held, jump every 40 ticks).
// Deterministic: a fresh page per stage, a fake clock, and a seeded Math.random.
import { chromium } from '/local/home/saiposh/personal/level-devil-dad/node_modules/playwright/index.mjs';
const [, , out, list] = process.argv;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--no-sandbox'] });
const errors = [];
for (const code of list.split(',')) {
  for (const n of ['01', '05']) {
    const id = `${code}-${n}`;
    const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(id + ' PAGEERROR ' + e.message));
    await page.addInitScript(() => {
      let a = 12345;
      let q = [], now = 0;
      window.requestAnimationFrame = (cb) => { q.push(cb); return q.length; };
      window.__pump = (n) => { for (let i = 0; i < n; i++) { const c = q; q = []; now += 1000 / 60; for (const f of c) f(now); } };
      Math.random = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    });
    await page.goto(`file://${process.cwd()}/dist-single/index.html`);
    await page.waitForTimeout(500); await page.evaluate(() => window.__pump(40));
    await page.evaluate((id) => {
      const a = window.__ldd;
      a.store.data.seenControls = true;
      a.input.usingTouch = true;
      a.store.stage(id.slice(0, 3) + '-01').attempts = 1;
      a.startStage(id, null);
      a.session.paused = true;
    }, id);
    await page.waitForTimeout(200); await page.evaluate(() => window.__pump(15));
    let at = 0;
    for (const t of [0, 150, 400]) {
      await page.evaluate(([from, to]) => {
        const s = window.__ldd.session;
        s.paused = false;
        for (let i = from; i < to; i++) s.tick({ left: false, right: true, jump: i % 40 < 12, jumpPressed: i % 40 === 0 });
        s.paused = true;
      }, [at, t]);
      at = t;
      await page.evaluate(() => window.__pump(18)); await page.waitForTimeout(150);
      await page.screenshot({ path: `${out}/${id}-t${t}.png`, animations: 'disabled', caret: 'hide' });
    }
    await ctx.close();
  }
}
console.log(errors.length ? errors.join('\n') : 'no errors');
await browser.close();
