import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { App } from '@capacitor/app';

export const isNative = Capacitor.isNativePlatform();
/** The lightweight Android test wrapper (android-test/) exposes window.AndroidHost. */
const host: any = (() => {
  try {
    return (window as any).AndroidHost ?? null;
  } catch {
    return null;
  }
})();
export const inAndroidShell = !!host;
export function exitShell() {
  try {
    host?.exit();
  } catch {
    /* ignore */
  }
}
export const platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'
export const inFrame = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

export function buzz(kind: 'light' | 'medium' | 'heavy' | 'success') {
  if (host) {
    try {
      host.vibrate(kind === 'light' ? 12 : kind === 'medium' ? 24 : kind === 'heavy' ? 45 : 30);
    } catch {
      /* ignore */
    }
    return;
  }
  if (isNative) {
    if (kind === 'success') Haptics.notification({ type: NotificationType.Success }).catch(() => {});
    else Haptics.impact({ style: kind === 'light' ? ImpactStyle.Light : kind === 'medium' ? ImpactStyle.Medium : ImpactStyle.Heavy }).catch(() => {});
    return;
  }
  try {
    navigator.vibrate?.(kind === 'light' ? 10 : kind === 'medium' ? 22 : kind === 'heavy' ? 40 : [12, 40, 18]);
  } catch {
    /* ignore */
  }
}

export interface ShareResult {
  ok: boolean;
  how: 'native' | 'web-files' | 'web-text' | 'none';
}

async function canvasToBlob(c: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((res) => c.toBlob((b) => res(b), 'image/png'));
}

/** Share a result card. Falls back gracefully; the caller shows a copy box when this returns ok:false. */
export async function shareCard(card: HTMLCanvasElement, text: string, url: string): Promise<ShareResult> {
  const full = url ? `${text}\n${url}` : text;
  if (host) {
    try {
      host.share(full);
      return { ok: true, how: 'native' };
    } catch {
      return { ok: false, how: 'none' };
    }
  }
  if (isNative) {
    try {
      const data = card.toDataURL('image/png').split(',')[1];
      const name = `ldd-${Date.now()}.png`;
      const f = await Filesystem.writeFile({ path: name, data, directory: Directory.Cache });
      await Share.share({ title: 'Level Devil Dad', text: full, files: [f.uri], dialogTitle: 'Challenge a friend' });
      return { ok: true, how: 'native' };
    } catch (e: any) {
      if (String(e?.message ?? e).toLowerCase().includes('cancel')) return { ok: false, how: 'native' };
      try {
        await Share.share({ title: 'Level Devil Dad', text: full });
        return { ok: true, how: 'native' };
      } catch {
        return { ok: false, how: 'none' };
      }
    }
  }
  if (inFrame || !navigator.share) return { ok: false, how: 'none' };
  try {
    const blob = await canvasToBlob(card);
    if (blob) {
      const file = new File([blob], 'level-devil-dad.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: full });
        return { ok: true, how: 'web-files' };
      }
    }
    await navigator.share({ text: full });
    return { ok: true, how: 'web-text' };
  } catch {
    return { ok: false, how: 'none' };
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export interface NativeHooks {
  onPause: () => void;
  onResume: () => void;
  onBack: () => void;
}

export async function initNative(h: NativeHooks) {
  document.addEventListener('visibilitychange', () => (document.hidden ? h.onPause() : h.onResume()));
  if (!isNative) return;
  try {
    await StatusBar.hide();
  } catch {
    /* ignore */
  }
  try {
    await ScreenOrientation.lock({ orientation: 'landscape' });
  } catch {
    /* ignore */
  }
  App.addListener('pause', h.onPause);
  App.addListener('resume', h.onResume);
  App.addListener('backButton', h.onBack);
  setTimeout(() => SplashScreen.hide().catch(() => {}), 150);
}

export async function tryFullscreen() {
  if (isNative || host || !document.fullscreenEnabled) return;
  const el = document.documentElement as any;
  try {
    if (!document.fullscreenElement && el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
    await (screen.orientation as any)?.lock?.('landscape');
  } catch {
    /* not allowed here; fine */
  }
}
