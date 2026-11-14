// Play a stage with keyboard input and take screenshots along the way, for visual QA of moving traps.
// node scripts/actionshot.mjs PDY-01 "W1.5 R1.2 RJ0.4 S:jump R1 S:after"
//   R<s>/L<s>: hold right/left for s seconds   RJ<s>/LJ<s>: same, with a jump tap at the start
//   J: jump in place   W<s>: wait   S:name: screenshot to shots/<id>-<name>.png
import { chromium } from 'playwright';
const [, , id = 'TVM-01', script = 'W1 S:a', w = '844', h = '390'] = process.argv;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(700);
await page.evaluate(
  ([id, visited]) => {
    const a = window.__ldd;
    a.store.data.seenControls = true;
    // VISITED=1: pretend the city was played before (stage banner instead of the city postcard)
    if (visited) a.store.stage(id.slice(0, 3) + '-01').attempts = 1;
  },
  [id, !!process.env.VISITED],
);
await page.evaluate((id) => window.__ldd.startStage(id, null), id);
await page.waitForTimeout(+(process.env.START_WAIT ?? 300));
const tap = async () => {
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(90);
  await page.keyboard.up('ArrowUp');
};
for (const tok of script.split(/\s+/).filter(Boolean)) {
  if (tok.startsWith('S:')) {
    await page.screenshot({ path: `shots/${id}-${tok.slice(2)}.png` });
    continue;
  }
  const m = tok.match(/^(RJ|LJ|R|L|W|J)([\d.]*)$/);
  if (!m) throw new Error('bad token ' + tok);
  const [, op, n] = m;
  const ms = (parseFloat(n || '0') || 0) * 1000;
  if (op === 'J') await tap();
  else if (op === 'W') await page.waitForTimeout(ms);
  else {
    const key = op[0] === 'R' ? 'ArrowRight' : 'ArrowLeft';
    await page.keyboard.down(key);
    if (op.length === 2) await tap();
    await page.waitForTimeout(Math.max(0, ms - (op.length === 2 ? 90 : 0)));
    await page.keyboard.up(key);
  }
}
console.log(errors.length ? errors.join('\n') : 'no errors');
await browser.close();
