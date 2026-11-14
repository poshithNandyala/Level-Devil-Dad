// one live (unpaused) frame mid-stage, with the touch buttons showing: node scripts/dev/subshot.mjs ID frac
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
const [, , id = 'BLR-04', f = '0.2'] = process.argv;
const d = JSON.parse(readFileSync(`/tmp/rec/${id}.json`, 'utf8'));
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(700);
await page.evaluate((id) => { const a = window.__ldd; a.store.data.seenControls = true; a.input.usingTouch = true; a.store.stage(id.slice(0,3)+'-01').attempts = 1; a.startStage(id, null); a.session.paused = true; }, id);
await page.waitForTimeout(250);
const t = Math.round(d.from + (d.end - d.from) * +f);
await page.evaluate(([rec, to]) => { const s = window.__ldd.session; s.paused = false; for (let i = 0; i < to; i++) { const b = rec[i]; s.tick({ left: !!(b & 1), right: !!(b & 2), jump: !!(b & 4), jumpPressed: !!(b & 8) }); } }, [d.rec, t]);
await page.waitForTimeout(160);
await page.screenshot({ path: `shots/sub-${id}.png` });
await browser.close();
