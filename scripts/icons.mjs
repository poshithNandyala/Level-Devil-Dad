// Renders icons + splash from the game's own art into public/icons and assets/ (for @capacitor/assets).
import { chromium } from 'playwright';
import fs from 'fs';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 800, height: 450 } });
await page.goto(`file://${process.cwd()}/dist-single/index.html`);
await page.waitForTimeout(900);
const save = async (path, size, maskable = false, transparent = false) => {
  const url = await page.evaluate(([s, m, t]) => window.__ldd.debugIcon(s, m, t), [size, maskable, transparent]);
  fs.writeFileSync(path, Buffer.from(url.split(',')[1], 'base64'));
};
fs.mkdirSync('public/icons', { recursive: true });
fs.mkdirSync('assets', { recursive: true });
await save('public/icons/icon-192.png', 192);
await save('public/icons/icon-512.png', 512);
await save('public/icons/maskable-512.png', 512, true);
await save('public/icons/apple-touch-icon.png', 180);
await save('assets/icon-only.png', 1024);
await save('assets/icon-foreground.png', 1024, true, true);
// solid background layer for Android adaptive icons
const bg = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = c.height = 1024; const x = c.getContext('2d'); const g = x.createRadialGradient(512, 360, 50, 512, 560, 820); g.addColorStop(0, '#FFC174'); g.addColorStop(0.55, '#F28C28'); g.addColorStop(1, '#B83A0B'); x.fillStyle = g; x.fillRect(0, 0, 1024, 1024); return c.toDataURL(); });
fs.writeFileSync('assets/icon-background.png', Buffer.from(bg.split(',')[1], 'base64'));
// splash: the title screen look on a dark field
const splash = await page.evaluate(() => {
  const S = 2732, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d');
  x.fillStyle = '#120f1c'; x.fillRect(0, 0, S, S);
  const icon = new Image(); icon.src = window.__ldd.debugIcon(520, false, false);
  return new Promise((res) => { icon.onload = () => {
    x.save(); x.beginPath(); x.roundRect(S / 2 - 260, S / 2 - 470, 520, 520, 110); x.clip(); x.drawImage(icon, S / 2 - 260, S / 2 - 470); x.restore();
    x.textAlign = 'center'; x.lineJoin = 'round';
    x.font = '800 150px "Baloo 2"'; x.lineWidth = 22; x.strokeStyle = '#2a1710'; x.strokeText('LEVEL DEVIL', S / 2, S / 2 + 230); x.fillStyle = '#fff3d6'; x.fillText('LEVEL DEVIL', S / 2, S / 2 + 230);
    x.save(); x.translate(S / 2, S / 2 + 400); x.rotate(-0.07); x.font = '800 200px "Baloo 2"'; x.lineWidth = 28; x.strokeText('DAD', 0, 0); x.fillStyle = '#F28C28'; x.fillText('DAD', 0, 0); x.restore();
    res(c.toDataURL()); }; });
});
fs.writeFileSync('assets/splash.png', Buffer.from(splash.split(',')[1], 'base64'));
fs.copyFileSync('assets/splash.png', 'assets/splash-dark.png');
await browser.close();
console.log('icons ok');
