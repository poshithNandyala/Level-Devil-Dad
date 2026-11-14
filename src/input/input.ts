import type { InputState } from '../game/world';
import type { TouchButtonDraw } from '../render/renderer';
import type { View } from '../render/view';

/** Elements that keep their own touches (everything else on screen is game input while playing). */
const UI_CONTROLS = 'button, a, input, select, textarea, label, [role="button"], .btn, .scroll, .rotate';

export interface TouchPrefs {
  size: number; // multiplier 0.8 .. 1.45
  opacity: number;
  swap: boolean;
}

/**
 * Keyboard, multi-touch and gamepad merged into one per-tick state.
 * Touch: the left half of the screen steers (slide your thumb between
 * left and right), the right half jumps. Swappable for left-handed play.
 */
export class Input {
  private keys = new Set<string>();
  private pointers = new Map<number, { x: number; y: number; zone: 'move' | 'jump' }>();
  private jumpLatch = false;
  private padJumpPrev = false;
  private padStartPrev = false;
  enabled = true;
  /** True while a stage is being played (set by the app every frame). */
  live = false;
  usingTouch = false;
  prefs: TouchPrefs = { size: 1, opacity: 0.35, swap: false };
  layout: { left: TouchButtonDraw; right: TouchButtonDraw; jump: TouchButtonDraw; split: number; moveSide: 'L' | 'R' } | null = null;
  onPause: (() => void) | null = null;
  onRestart: (() => void) | null = null;
  onAnyInput: (() => void) | null = null;

  attach(canvas: HTMLElement, root: HTMLElement = canvas) {
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (['arrowleft', 'arrowright', 'arrowup', ' ', 'a', 'd', 'w', 'z', 'k'].includes(k)) e.preventDefault();
      if (this.isJumpKey(k) && !this.keys.has(k)) this.jumpLatch = true;
      this.keys.add(k);
      if (k === 'escape' || k === 'p') this.onPause?.();
      if (k === 'r') this.onRestart?.();
      this.onAnyInput?.();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.pointers.clear();
    });
    const opts = { passive: false } as AddEventListenerOptions;
    // Listen on the whole game root, not only the canvas: an overlay above the canvas
    // must never swallow the controls. Real UI controls (pause, hint, menus) keep their touches.
    root.addEventListener(
      'pointerdown',
      (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        const t = e.target as Element | null;
        if (t !== canvas && (!this.live || t?.closest?.(UI_CONTROLS))) return;
        e.preventDefault();
        this.usingTouch = e.pointerType !== 'mouse';
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        const zone = this.zoneFor(e.clientX);
        this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, zone });
        if (zone === 'jump') this.jumpLatch = true;
        this.onAnyInput?.();
      },
      opts,
    );
    root.addEventListener(
      'pointermove',
      (e) => {
        const p = this.pointers.get(e.pointerId);
        if (p) {
          p.x = e.clientX;
          p.y = e.clientY;
        }
      },
      opts,
    );
    const up = (e: PointerEvent) => this.pointers.delete(e.pointerId);
    root.addEventListener('pointerup', up);
    root.addEventListener('pointercancel', up);
    canvas.addEventListener('lostpointercapture', up);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private isJumpKey(k: string) {
    return k === ' ' || k === 'arrowup' || k === 'w' || k === 'z' || k === 'k';
  }

  private zoneFor(x: number): 'move' | 'jump' {
    if (!this.layout) return x < window.innerWidth / 2 ? 'move' : 'jump';
    const half = window.innerWidth / 2;
    const leftIsMove = this.layout.moveSide === 'L';
    return (x < half) === leftIsMove ? 'move' : 'jump';
  }

  clear() {
    this.pointers.clear();
    this.keys.clear();
    this.jumpLatch = false;
  }

  /** Called once per simulation tick. */
  sample(): InputState {
    let left = this.keys.has('arrowleft') || this.keys.has('a');
    let right = this.keys.has('arrowright') || this.keys.has('d');
    let jump = [...this.keys].some((k) => this.isJumpKey(k));
    for (const p of this.pointers.values()) {
      if (p.zone === 'jump') jump = true;
      else if (this.layout) {
        if (p.x < this.layout.split) left = true;
        else right = true;
      }
    }
    const pad = this.pollPad();
    if (pad) {
      left ||= pad.left;
      right ||= pad.right;
      jump ||= pad.jump;
      if (pad.jump && !this.padJumpPrev) this.jumpLatch = true;
      this.padJumpPrev = pad.jump;
      if (pad.start && !this.padStartPrev) this.onPause?.();
      this.padStartPrev = pad.start;
    }
    if (left && right) {
      // two thumbs on the move side: the newest wins via x position already; keyboard: cancel
      left = right = false;
    }
    const jumpPressed = this.jumpLatch;
    this.jumpLatch = false;
    if (!this.enabled) return { left: false, right: false, jump: false, jumpPressed: false };
    return { left, right, jump, jumpPressed };
  }

  private padBlocked = false;

  private pollPad() {
    if (this.padBlocked) return null;
    let pads: (Gamepad | null)[] | undefined;
    try {
      pads = navigator.getGamepads?.();
    } catch {
      // gamepads are blocked inside some embedded frames
      this.padBlocked = true;
      return null;
    }
    if (!pads) return null;
    for (const gp of pads) {
      if (!gp || !gp.connected) continue;
      const ax = gp.axes[0] ?? 0;
      const b = (i: number) => !!gp.buttons[i]?.pressed;
      return {
        left: ax < -0.35 || b(14),
        right: ax > 0.35 || b(15),
        jump: b(0) || b(1) || b(12),
        start: b(9),
      };
    }
    return null;
  }

  layoutFor(v: View) {
    const base = Math.round(Math.min(78, Math.max(54, v.H * 0.17)) * this.prefs.size);
    const r = base / 2;
    const pad = 14 + r;
    const bottom = v.H - Math.max(v.safe.b, 6) - pad;
    const moveSide: 'L' | 'R' = this.prefs.swap ? 'R' : 'L';
    const edgeL = Math.max(v.safe.l, 4) + pad;
    const edgeR = v.W - Math.max(v.safe.r, 4) - pad;
    let left: TouchButtonDraw, right: TouchButtonDraw, jump: TouchButtonDraw;
    const gap = r * 0.55;
    if (moveSide === 'L') {
      left = { kind: 'left', x: edgeL, y: bottom, r, pressed: false };
      right = { kind: 'right', x: edgeL + r * 2 + gap, y: bottom, r, pressed: false };
      jump = { kind: 'jump', x: edgeR - r * 0.15, y: bottom - r * 0.15, r: r * 1.15, pressed: false };
    } else {
      right = { kind: 'right', x: edgeR, y: bottom, r, pressed: false };
      left = { kind: 'left', x: edgeR - r * 2 - gap, y: bottom, r, pressed: false };
      jump = { kind: 'jump', x: edgeL + r * 0.15, y: bottom - r * 0.15, r: r * 1.15, pressed: false };
    }
    this.layout = { left, right, jump, split: (left.x + right.x) / 2, moveSide };
  }

  touchDraw(): TouchButtonDraw[] {
    if (!this.layout) return [];
    let l = false,
      rgt = false,
      j = false;
    for (const p of this.pointers.values()) {
      if (p.zone === 'jump') j = true;
      else if (p.x < this.layout.split) l = true;
      else rgt = true;
    }
    if (this.keys.has('arrowleft') || this.keys.has('a')) l = true;
    if (this.keys.has('arrowright') || this.keys.has('d')) rgt = true;
    return [
      { ...this.layout.left, pressed: l },
      { ...this.layout.right, pressed: rgt },
      { ...this.layout.jump, pressed: j },
    ];
  }
}
