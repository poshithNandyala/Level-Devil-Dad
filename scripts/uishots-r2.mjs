// UI round 2 screenshots and checks: the hint's "You are here" part, the 36-city picker, the home preview
// and the coming-soon postcard, at two phone sizes (plus the picker upright at 390 px wide).
// npm run build:single && node scripts/uishots-r2.mjs [outDir]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const out = process.argv[2] || 'shots/ui-r2';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox'] });
const errors = [];
const report = [];
const open = async (W, H, tag) => {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${tag} PAGEERROR ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`${tag} ${m.text()}`));
  await page.goto(`file://${process.cwd()}/dist-single/index.html`);
  await page.waitForTimeout(800);
  return { ctx, page };
};

for (const [W, H] of [
  [780, 360],
  [844, 390],
]) {
  const tag = `${W}x${H}`;
  const { ctx, page } = await open(W, H, tag);
  // B. the picker on first launch: every chapter, its state, built or coming soon
  const pick = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.hp-city')];
    const txt = (r, s) => r.querySelector(s)?.firstChild?.textContent ?? '';
    return {
      screen: window.__ldd.screen,
      rows: rows.length,
      soon: rows.filter((r) => r.classList.contains('soon')).length,
      built: rows.filter((r) => r.classList.contains('built')).length,
      chandigarh: rows.filter((r) => txt(r, '.hp-name') === 'Chandigarh').map((r) => `${txt(r, '.hp-name')} / ${txt(r, '.hp-state')} / ${r.querySelector('.hp-tag').textContent}`),
    };
  });
  report.push(`${tag} picker: screen ${pick.screen}, ${pick.rows} rows, ${pick.built} ready, ${pick.soon} coming soon; ${pick.chandigarh.join(' | ')}`);
  await page.screenshot({ path: `${out}/picker-top-${tag}.png` });
  await page.evaluate(() => document.querySelector('.hp-scroll').scrollTo(0, 99999));
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${out}/picker-bottom-${tag}.png` });

  // home = Hyderabad, built but locked (only TVM and CHN escaped)
  await page.locator('.hp-city', { hasText: 'Hyderabad' }).first().tap();
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const a = window.__ldd;
    a.store.data.seenControls = true;
    a.input.usingTouch = true;
    for (const c of ['TVM', 'CHN']) {
      for (let i = 1; i <= 8; i++) Object.assign(a.store.stage(`${c}-0${i}`), { cleared: true, best: 9, firstClearDeaths: 2, deaths: 2 });
      a.store.data.stamps[c] = 16;
    }
    a.store.save(true);
    a.showJourney('HYD');
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}/map-peek-${tag}.png` });
  report.push(`${tag} map card, peek button: ${await page.evaluate(() => document.querySelector('.cc-peek')?.textContent ?? 'none')}`);

  // C. the preview run: badge, then a clear goes back to the map and leaves the save untouched
  const before = await page.evaluate(() => JSON.stringify({ s: window.__ldd.store.data.stages['HYD-01'] ?? null, st: window.__ldd.store.data.stamps, d: window.__ldd.store.data.totalDeaths }));
  await page.locator('.cc-peek').tap();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}/preview-badge-${tag}.png` });
  report.push(`${tag} preview: screen ${await page.evaluate(() => window.__ldd.screen)}, stage ${await page.evaluate(() => window.__ldd.session?.def.id)}, badge "${await page.evaluate(() => document.querySelector('.previewbadge')?.textContent)}"`);
  await page.evaluate(() => {
    const a = window.__ldd;
    a.session.deaths = 3;
    a.store.stage('HYD-01').deaths += 3;
    a.store.data.totalDeaths += 3;
    a.onStageClear(a.session);
  });
  await page.waitForTimeout(700);
  const after = await page.evaluate(() => JSON.stringify({ s: window.__ldd.store.data.stages['HYD-01'] ?? null, st: window.__ldd.store.data.stamps, d: window.__ldd.store.data.totalDeaths }));
  report.push(`${tag} preview clear: screen ${await page.evaluate(() => window.__ldd.screen)}, save unchanged ${before === after}, HYD-02 unlocked ${await page.evaluate(() => window.__ldd.isUnlocked({ id: 'HYD-02', city: 'HYD', index: 2 }))}`);
  await page.screenshot({ path: `${out}/preview-cleared-${tag}.png` });
  // leaving a preview from the pause menu also goes back to the map
  await page.locator('.cc-peek').tap();
  await page.waitForTimeout(600);
  await page.evaluate(() => window.__ldd.pause());
  await page.waitForTimeout(300);
  await page.locator('button', { hasText: 'Leave' }).first().tap();
  await page.waitForTimeout(500);
  report.push(`${tag} preview leave: screen ${await page.evaluate(() => window.__ldd.screen)}, save unchanged ${before === (await page.evaluate(() => JSON.stringify({ s: window.__ldd.store.data.stages['HYD-01'] ?? null, st: window.__ldd.store.data.stamps, d: window.__ldd.store.data.totalDeaths })))}`);

  // home not built yet: the postcard
  await page.evaluate(() => {
    const a = window.__ldd;
    a.store.data.home = 'PAT';
    a.showJourney('PAT');
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}/home-soon-postcard-${tag}.png` });
  report.push(`${tag} PAT postcard: ${await page.evaluate(() => document.querySelector('.homepost')?.textContent ?? 'none')}; map tag ${await page.evaluate(() => [...document.querySelectorAll('.hometag text')].map((t) => t.textContent).join(' / '))}`);

  // A. a long stage: the hint opens on the stretch Dad is in
  for (const id of ['RNC-05']) {
    const info = await page.evaluate((id) => {
      const a = window.__ldd;
      a.startStage(id, null);
      const def = a.session.def;
      return { parts: def.hintParts?.length ?? 0, at: def.hintAt };
    }, id);
    report.push(`${tag} ${id}: ${info.parts} hint parts, starting at tiles ${JSON.stringify(info.at)}`);
    for (const k of [0, Math.min(2, info.parts - 1)]) {
      await page.evaluate(
        ({ k, at }) => {
          const a = window.__ldd;
          a.startStage(a.session.def.id, null);
          const p = a.session.world.player;
          // put Dad a few tiles into stretch k (16 px tiles)
          if (k > 0) {
            p.x = (at[k] + 2) * 16;
            p.y = 10 * 16;
          }
          a.session.deaths = 5;
          a.showHint();
        },
        { k, at: info.at },
      );
      await page.waitForTimeout(500);
      const r = await page.evaluate(() => {
        const el = document.querySelector('.hintsheet');
        const b = el.getBoundingClientRect();
        return { tag: el.querySelector('.hs-tag').textContent, here: el.classList.contains('here'), back: !el.querySelector('.hs-b').classList.contains('off'), top: Math.round(b.top), bottom: Math.round(b.bottom), text: el.querySelector('.hs-text').textContent.slice(0, 70) };
      });
      report.push(`${tag} ${id} Dad in part ${k}: strip "${r.tag}" here=${r.here} back=${r.back} y ${r.top}-${r.bottom}: ${r.text}`);
      await page.screenshot({ path: `${out}/hint-here-${id}-part${k}-${tag}.png` });
      // tap forward: next page, no longer marked unless it is the same stretch; back returns to it
      await page.locator('.hintsheet').tap();
      await page.waitForTimeout(200);
      const r2 = await page.evaluate(() => {
        const el = document.querySelector('.hintsheet');
        return el ? `${el.querySelector('.hs-tag').textContent} here=${el.classList.contains('here')}` : 'closed';
      });
      if (r2 !== 'closed') {
        await page.locator('.hs-b').tap();
        await page.waitForTimeout(200);
      }
      const r3 = await page.evaluate(() => {
        const el = document.querySelector('.hintsheet');
        return el ? `${el.querySelector('.hs-tag').textContent} here=${el.classList.contains('here')}` : 'closed';
      });
      report.push(`${tag} ${id} part ${k}: after tap "${r2}", after back "${r3}"`);
      if (k === 0) await page.screenshot({ path: `${out}/hint-next-${id}-${tag}.png` });
      const rs = await page.evaluate(() => {
        const a = window.__ldd;
        a.session.restart();
        return JSON.stringify({ restarts: a.session.restarts, at: a.hintAt, done: a.session.done });
      });
      await page.waitForTimeout(500);
      report.push(`${tag} ${id} after restart: ${await page.evaluate(() => (document.querySelector('.hintsheet') ? 'still open' : 'closed'))} ${rs}`);
    }
  }
  // an old 8-stage room hint still uses the sentence splitter
  await page.evaluate(() => {
    const a = window.__ldd;
    a.startStage('TVM-03', null);
    a.session.deaths = 5;
    a.showHint();
  });
  await page.waitForTimeout(400);
  report.push(`${tag} TVM-03 (no hint parts): "${await page.evaluate(() => document.querySelector('.hintsheet .hs-tag').textContent)}" here=${await page.evaluate(() => document.querySelector('.hintsheet').classList.contains('here'))}`);
  await ctx.close();
}

// the picker upright on a 390 px wide phone (from settings)
{
  const { ctx, page } = await open(390, 844, '390x844');
  await page.screenshot({ path: `${out}/picker-upright-390x844.png` });
  const rows = await page.evaluate(() => {
    const r = document.querySelector('.hp-city').getBoundingClientRect();
    const sc = document.querySelector('.hp-scroll');
    return { w: Math.round(r.width), h: Math.round(r.height), cols: getComputedStyle(document.querySelector('.hp-grid')).gridTemplateColumns, overflowX: document.documentElement.scrollWidth > innerWidth, scrolls: sc.scrollHeight > sc.clientHeight };
  });
  report.push(`390x844 picker: row button ${rows.w}x${rows.h}px, columns ${rows.cols}, page scrolls sideways ${rows.overflowX}, list scrolls ${rows.scrolls}`);
  await page.evaluate(() => document.querySelector('.hp-scroll').scrollTo(0, 1100));
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${out}/picker-upright-north-390x844.png` });
  await ctx.close();
}
console.log(report.join('\n'));
console.log(errors.length ? errors.join('\n') : 'no errors');
await browser.close();
