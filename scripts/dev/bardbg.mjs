import { chromium } from 'playwright';
import { readFileSync } from 'fs';
const id = process.argv[2] ?? 'CHN-03', f = +(process.argv[3] ?? 0.2);
const d = JSON.parse(readFileSync(`/tmp/rec/${id}.json`, 'utf8'));
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(700);
await page.evaluate((id) => { const a = window.__ldd; a.store.data.seenControls = true; a.input.usingTouch = true; a.store.stage(id.slice(0,3)+'-01').attempts = 1; a.startStage(id, null); a.session.paused = true; }, id);
await page.waitForTimeout(250);
const t = Math.round(d.from + (d.end - d.from) * f);
await page.evaluate(([rec, to]) => { const s = window.__ldd.session; s.paused = false; for (let i = 0; i < to; i++) { const b = rec[i]; s.tick({ left: !!(b & 1), right: !!(b & 2), jump: !!(b & 4), jumpPressed: !!(b & 8) }); } s.paused = true; }, [d.rec, t]);
for (let i = 0; i < 4; i++) {
  await page.waitForTimeout(120);
  console.log(await page.evaluate(() => { const r = window.__ldd.renderer; const B = r.bar; const w = window.__ldd.session.world; return JSON.stringify({ x: Math.round(B.x), y: Math.round(B.y), w: B.w, h: Math.round(B.h), k: +B.k.toFixed(2), dim: +r.barDim.toFixed(2), side: B.side, pop: B.pop, facing: w.player.facing, camX: Math.round(r.camX), px: w.player.x, s: r.view.s, ox: r.view.ox }); }));
}
await browser.close();
