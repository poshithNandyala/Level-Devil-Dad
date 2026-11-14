// Simulates the Android test wrapper's window.AndroidHost bridge.
import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await ctx.addInitScript(() => {
  window.__calls = [];
  window.AndroidHost = {
    vibrate: (ms) => window.__calls.push('vibrate:' + ms),
    share: (t) => window.__calls.push('share:' + t.slice(0, 40)),
    exit: () => window.__calls.push('exit'),
    version: () => 'android-test-2',
  };
});
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(800);
const out = await page.evaluate(async () => {
  const a = window.__ldd;
  a.store.data.seenControls = true;
  a.startStage('HYD-02', null);
  // die: run right into the collapse
  for (let i = 0; i < 400 && a.session.deaths === 0; i++) a.session.tick({ left: false, right: true, jump: false, jumpPressed: false });
  for (let i = 0; i < 60; i++) a.session.tick({ left: false, right: false, jump: false, jumpPressed: false });
  // win: walk away from the auto
  for (let i = 0; i < 600 && !a.session.done; i++) a.session.tick({ left: true, right: false, jump: false, jumpPressed: false });
  await new Promise((r) => setTimeout(r, 200));
  const shareBtn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Challenge a friend'));
  shareBtn?.click();
  await new Promise((r) => setTimeout(r, 300));
  a.back(); // result -> stages
  a.showTitle();
  a.back(); // title -> exit
  return { calls: window.__calls, screen: a.screen, deaths: a.store.data.stages['HYD-02'] };
});
console.log(JSON.stringify(out, null, 1));
// the test build should surface a runtime error on screen
const overlay = await page.evaluate(async () => {
  setTimeout(() => {
    throw new Error('boom-test');
  });
  await new Promise((r) => setTimeout(r, 150));
  return [...document.querySelectorAll('pre')].some((p) => p.textContent.includes('boom-test'));
});
console.log('error overlay shown:', overlay);
const real = errors.filter((e) => !e.includes('boom-test'));
console.log(real.length ? real.join('\n') : 'no errors');
await browser.close();
