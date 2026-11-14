// Drive the real build with keyboard input and capture frames.
import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(700);
await page.evaluate(() => { window.__ldd.store.data.seenControls = true; window.__ldd.input.usingTouch = true; });
const shot = (n) => page.screenshot({ path: `shots/play-${n}.png` });
// HYD-01: run right into the collapse -> death, quip
await page.evaluate(() => window.__ldd.startStage('HYD-01', null));
await page.waitForTimeout(300);
await page.keyboard.down('ArrowRight');
await page.waitForTimeout(560);
await page.keyboard.down('Space'); await page.waitForTimeout(250); await page.keyboard.up('Space');
await page.waitForTimeout(500);
await page.keyboard.down('Space'); await page.waitForTimeout(250); await page.keyboard.up('Space');
await page.waitForTimeout(1250);
await shot('hyd01-death');
await page.keyboard.up('ArrowRight');
await page.waitForTimeout(600);
// HYD-02: walk away -> auto picks you up -> results
await page.evaluate(() => window.__ldd.startStage('HYD-02', null));
await page.waitForTimeout(300);
await page.keyboard.down('ArrowLeft');
await page.waitForTimeout(700);
await shot('hyd02-auto-coming');
await page.waitForTimeout(900);
await shot('hyd02-board');
await page.keyboard.up('ArrowLeft');
await page.waitForTimeout(1500);
await shot('hyd02-result');
const state = await page.evaluate(() => ({ screen: window.__ldd.screen, rec: window.__ldd.store.data.stages['HYD-02'] }));
console.log(JSON.stringify(state));
console.log(errors.length ? errors.join('\n') : 'no errors');
await browser.close();
