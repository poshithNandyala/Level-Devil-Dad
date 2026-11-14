import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ' ' + m.text()); });
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(700);
await page.locator('button', { hasText: 'Play' }).first().click();
await page.waitForTimeout(400);
// controls intro appears first time
const lets = page.locator('button', { hasText: "Let's go" });
if (await lets.count()) await lets.click();
await page.waitForTimeout(300);
// play every sound once and run a few seconds of each city's music
const res = await page.evaluate(async () => {
  const a = window.__ldd;
  const names = ['jump','land','bonk','die','win','stamp','collapse','rumble','slide','spikes','poof','thud','creak','snap','honk','signalGo','signalStop','beep','click','ui','uiBack','laugh','monkey','gasp','shove','train','splash','remote'];
  for (const n of names) { a.audio.play(n); await new Promise((r) => setTimeout(r, 60)); }
  for (const c of ['HYD','BLR','BOM']) { a.audio.setMusic(c); await new Promise((r) => setTimeout(r, 1500)); }
  return { state: a.audio.ctx?.state, sr: a.audio.ctx?.sampleRate };
});
console.log(JSON.stringify(res));
// keyboard play in HYD-01 for a bit
await page.keyboard.down('ArrowRight');
for (let i = 0; i < 6; i++) { await page.keyboard.press('Space'); await page.waitForTimeout(350); }
await page.keyboard.up('ArrowRight');
await page.waitForTimeout(500);
console.log(errors.length ? errors.join('\n') : 'no errors');
await browser.close();
