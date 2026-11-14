// Screenshot Tara's talk bar: the intro, then an idle poke. node scripts/talkshot.mjs TVM-02
import { chromium } from 'playwright';
const [, , id = 'TVM-02', w = '844', h = '390'] = process.argv;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(700);
await page.evaluate((id) => { const a = window.__ldd; a.store.data.seenControls = true; a.input.usingTouch = true; a.store.stage(id.slice(0, 3) + '-01').attempts = 1; a.startStage(id, null); }, id);
await page.waitForTimeout(1600);
await page.screenshot({ path: `shots/talk-${id}-intro.png` });
await page.waitForTimeout(5200);
await page.screenshot({ path: `shots/talk-${id}-idle.png` });
console.log(errors.length ? errors.join('\n') : 'no errors');
await browser.close();
