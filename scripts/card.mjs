import { chromium } from 'playwright';
import fs from 'fs';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 900, height: 500 } });
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(900);
for (const code of process.argv.slice(2)) {
  const url = await page.evaluate((c) => window.__ldd.debugCard(c), code);
  fs.writeFileSync(`shots/card-${code}.png`, Buffer.from(url.split(',')[1], 'base64'));
}
await browser.close();
console.log('ok');
