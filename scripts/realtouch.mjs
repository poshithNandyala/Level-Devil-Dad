// Real-finger QA: every touch goes through the browser's hit-testing (CDP touch events),
// exactly like a phone. Fresh profile, Android test-shell bridge mocked.
// Usage: CHROME_PATH=/usr/bin/google-chrome node scripts/realtouch.mjs   (after npm run build:single)
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 800, height: 360 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
await ctx.addInitScript(() => {
  window.__calls = [];
  window.AndroidHost = {
    vibrate: (ms) => window.__calls.push('vibrate:' + ms),
    share: (t) => window.__calls.push('share'),
    exit: () => window.__calls.push('exit'),
    version: () => 'test',
  };
});
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(800);

const cdp = await ctx.newCDPSession(page);
const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y, id]) => ({ x, y, id })) });
const wait = (ms) => page.waitForTimeout(ms);
const st = () => page.evaluate(() => { const a = window.__ldd, s = a.session; return { screen: a.screen, x: s?.world.player.x, y: s?.world.player.y, ground: s?.world.player.onGround, paused: s?.paused, deaths: s?.deaths }; });
let fails = 0;
const check = (ok, label, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${extra ? '  ' + extra : ''}`); if (!ok) fails++; };

// 1. menus with real taps, first-run flow
await page.tap('button.btn.big'); // ▶ Play
await wait(300);
check((await st()).screen === 'intro', 'tap Play opens How to play');
await page.tap("text=Let's go");
await wait(400);
check((await st()).screen === 'play', "tap Let's go starts the first stage");

// 2. nothing covers the controls
const L = await page.evaluate(() => {
  const L = window.__ldd.input.layout;
  const who = (x, y) => { const e = document.elementFromPoint(x, y); return e ? e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') : null; };
  return { left: [L.left.x, L.left.y], right: [L.right.x, L.right.y], jump: [L.jump.x, L.jump.y], hits: [who(L.left.x, L.left.y), who(L.right.x, L.right.y), who(L.jump.x, L.jump.y), who(400, 180)] };
});
check(L.hits.every((h) => h === 'canvas#game'), 'move/jump zones hit the game canvas', L.hits.join(','));

// 3. hold right, slide to left, jump with a second finger
let a = await st();
await touch('touchStart', [[...L.right, 1]]);
await wait(250);
let b = await st();
check(b.x > a.x, 'hold ▶ moves right', `${a.x} -> ${b.x}`);
await touch('touchMove', [[L.right[0] - 40, L.right[1], 1]]);
await touch('touchMove', [[...L.left, 1]]);
await wait(250);
let c = await st();
check(c.x < b.x, 'slide thumb to ◀ moves left (no cancel)', `${b.x} -> ${c.x}`);
await touch('touchStart', [[...L.left, 1], [...L.jump, 2]]);
await wait(90);
let d = await st();
check(d.y < c.y && !d.ground, 'second finger jumps while moving', `y ${c.y} -> ${d.y}`);
await touch('touchEnd', []);
await wait(500);
let e = await st();
await wait(200);
let f = await st();
check(e.x === f.x, 'release stops', `${e.x} == ${f.x}`);

// 4. HUD pause button and Resume, by tap
await page.tap('.hud button[aria-label="Pause"]');
await wait(200);
check((await st()).paused === true, 'tap pause button pauses');
await page.tap('text=Resume');
await wait(250);
check((await st()).paused === false, 'tap Resume resumes');

// 5. safety net: even a stray full-screen overlay cannot eat the controls
await page.evaluate(() => { const o = document.createElement('div'); o.id = 'stray'; o.style.cssText = 'position:absolute;inset:0;z-index:50'; document.getElementById('ui').appendChild(o); });
a = await st();
await touch('touchStart', [[...L.right, 3]]);
await wait(250);
await touch('touchMove', [[L.right[0] + 10, L.right[1], 3]]);
await wait(150);
b = await st();
await touch('touchEnd', []);
await page.evaluate(() => document.getElementById('stray').remove());
check(b.x > a.x, 'controls still work under a stray overlay', `${a.x} -> ${b.x}`);

// 6. die by real touch, and the phone vibrates through the bridge
await page.evaluate(() => { const a = window.__ldd; a.startStage('TVM-02', null); });
await wait(300);
await touch('touchStart', [[...L.right, 4]]);
for (let i = 0; i < 30 && (await st()).deaths === 0; i++) await wait(200);
await touch('touchEnd', []);
const calls = await page.evaluate(() => window.__calls);
check((await st()).deaths > 0 && calls.some((c) => c.startsWith('vibrate')), 'walking right on TVM-02 dies, phone buzzes', calls.slice(0, 3).join(','));

check(errors.length === 0, 'no page errors', errors.join(' | '));
console.log(fails ? `${fails} FAILED` : 'ALL PASS');
await browser.close();
process.exit(fails ? 1 : 0);
