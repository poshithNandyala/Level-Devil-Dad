import './rooms/rooms.css';
import { Capacitor } from '@capacitor/core';
import { RoomApp } from './rooms/app';
import { ROOM_BY_ID } from './rooms/doors';
import { inAndroidShell } from './platform/device';

// ?classic opens the old long-stage game (frozen; kept for reference)
const classic = new URLSearchParams(location.search).has('classic');

function fail(e: any) {
  console.error(e);
  document.body.insertAdjacentHTML('beforeend', `<pre style="position:fixed;inset:auto 0 0 0;color:#fff;background:#a00;padding:8px;font:12px monospace;z-index:999">${String(e?.stack ?? e)}</pre>`);
}

if (classic) {
  Promise.all([import('./ui/style.css'), import('./app/app')])
    .then(([, m]) => {
      const app = new m.App(document.getElementById('app')!);
      (window as any).__ldd = app;
      return app.boot();
    })
    .catch(fail);
} else {
  const app = new RoomApp(document.getElementById('app')!);
  (window as any).__ldd = app;
  (window as any).__lddRoomIds = () => Object.keys(ROOM_BY_ID);
  (window as any).__lddRoom = (id: string) => ROOM_BY_ID[id];
  app.boot().catch(fail);
}

// Offline support for the hosted web build (not inside the native app or the single-file preview).
if (!__SINGLE__ && !Capacitor.isNativePlatform() && 'serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

// Test APK only: put runtime errors on screen so a tester can screenshot and report them.
if (inAndroidShell) {
  const seen = new Set<string>();
  const show = (msg: string) => {
    if (!msg || seen.has(msg) || /ResizeObserver loop/.test(msg)) return;
    seen.add(msg);
    const el = document.createElement('pre');
    el.textContent = `Bug — screenshot this for the dev:\n${msg.slice(0, 400)}`;
    el.style.cssText =
      'position:fixed;left:8px;right:8px;top:8px;margin:0;color:#fff;background:#a00e;padding:8px 10px;border-radius:8px;font:11px/1.35 monospace;white-space:pre-wrap;z-index:9999';
    el.onclick = () => el.remove();
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 12000);
  };
  window.addEventListener('error', (e) => show(e.message || String(e.error)));
  window.addEventListener('unhandledrejection', (e) => show(String(e.reason?.stack ?? e.reason?.message ?? e.reason)));
}
