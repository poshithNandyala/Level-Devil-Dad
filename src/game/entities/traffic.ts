import { Solid } from '../body';
import { approach, DT, overlapXYWH, Rect, secs } from '../constants';
import { Entity, World } from '../world';
import { drawPedButton, drawSignal, drawVehicle, VEHICLE_SIZE, VehicleKind } from '../../render/art/vehicles';
import { Ctx } from '../../render/art/common';

export type Light = 'red' | 'amber' | 'green';

export interface PhaseDef {
  light: Light;
  /** seconds; omit for "until something advances it" */
  dur?: number;
  /** custom countdown text, e.g. the Silk Board "99" */
  show?: (remaining: number, w: World) => string;
}

/** Bengaluru's signature: a signal whose phases rearrange the vehicles you stand on. */
export class Signal extends Entity {
  x: number;
  baseY: number;
  phases: PhaseDef[];
  idx = 0;
  start = 0;
  private listeners: ((idx: number, w: World) => void)[] = [];
  changes = 0;

  constructor(x: number, baseY: number, phases: PhaseDef[]) {
    super();
    this.layer = -3;
    this.x = x;
    this.baseY = baseY;
    this.phases = phases;
  }

  get phase() {
    return this.phases[this.idx];
  }
  get light() {
    return this.phase.light;
  }

  remaining(w: World): number {
    const d = this.phase.dur;
    return d === undefined ? Infinity : d - (w.tick - this.start) * DT;
  }

  onChange(fn: (idx: number, w: World) => void) {
    this.listeners.push(fn);
  }

  go(w: World, idx: number) {
    this.idx = ((idx % this.phases.length) + this.phases.length) % this.phases.length;
    this.start = w.tick;
    this.changes++;
    w.sfx(this.light === 'green' ? 'signalGo' : this.light === 'red' ? 'signalStop' : 'beep', this.x, this.baseY - 60);
    for (const l of this.listeners) l(this.idx, w);
  }

  next(w: World) {
    this.go(w, this.idx + 1);
  }

  update(w: World) {
    const d = this.phase.dur;
    if (d !== undefined && w.tick - this.start >= secs(d)) this.next(w);
  }

  display(w: World): string {
    const rem = this.remaining(w);
    if (this.phase.show) return this.phase.show(rem, w);
    if (!isFinite(rem)) return '--';
    return String(Math.max(0, Math.ceil(rem - 1e-6)));
  }

  draw(ctx: Ctx, w: World) {
    drawSignal(ctx, this.x, this.baseY, this.light, this.display(w), this.light === 'amber' && w.tick % 30 < 15);
  }
}

type VAction =
  | { kind: 'drive'; x: number; maxV?: number }
  | { kind: 'wait'; until: number; secs: number; started: boolean }
  | { kind: 'warp'; x: number }
  | { kind: 'call'; fn: (w: World) => void };

/** A car, bus or scooter you can stand on. Moves only when told to. */
export class Vehicle extends Entity {
  solid: Solid;
  kind: VehicleKind;
  facing: 1 | -1;
  color: string;
  label: string;
  queue: VAction[] = [];
  v = 0;
  maxV: number;
  accel: number;
  rot = 0;
  honked = false;

  constructor(kind: VehicleKind, x: number, groundY: number, opts: { facing?: 1 | -1; color?: string; label?: string; maxV?: number; accel?: number } = {}) {
    super();
    this.layer = 2;
    this.kind = kind;
    const [w, h] = VEHICLE_SIZE[kind];
    this.solid = new Solid(x, groundY - h, w, h);
    this.facing = opts.facing ?? 1;
    this.color = opts.color ?? (kind === 'bus' ? '#C0392B' : kind === 'scooter' ? '#E9ECEF' : '#3D7DCA');
    this.label = opts.label ?? '';
    this.maxV = opts.maxV ?? (kind === 'bus' ? 135 : 160);
    this.accel = opts.accel ?? (kind === 'bus' ? 260 : 360);
  }

  get x() {
    return this.solid.x + this.solid.xr;
  }

  drive(x: number, maxV?: number) {
    this.queue.push({ kind: 'drive', x, maxV });
    return this;
  }
  wait(seconds: number) {
    this.queue.push({ kind: 'wait', until: 0, secs: seconds, started: false });
    return this;
  }
  warp(x: number) {
    this.queue.push({ kind: 'warp', x });
    return this;
  }
  call(fn: (w: World) => void) {
    this.queue.push({ kind: 'call', fn });
    return this;
  }
  clear() {
    this.queue = [];
    return this;
  }

  /** Re-plan whenever the signal enters one of the listed phases. */
  follow(sig: Signal, plans: Record<number, (v: Vehicle) => void>) {
    sig.onChange((idx) => {
      const p = plans[idx];
      if (p) {
        this.clear();
        p(this);
      }
    });
    return this;
  }

  update(w: World) {
    let guard = 4;
    while (this.queue.length && guard-- > 0) {
      const a = this.queue[0];
      if (a.kind === 'warp') {
        this.solid.place(a.x, this.solid.y);
        this.v = 0;
        this.queue.shift();
        continue;
      }
      if (a.kind === 'call') {
        this.queue.shift();
        a.fn(w);
        continue;
      }
      if (a.kind === 'wait') {
        if (!a.started) {
          a.started = true;
          a.until = w.tick + secs(a.secs);
        }
        if (w.tick >= a.until) {
          this.queue.shift();
          continue;
        }
        this.v = approach(this.v, 0, this.accel * DT);
        break;
      }
      // drive
      const cur = this.solid.x + this.solid.xr;
      const d = a.x - cur;
      const maxV = a.maxV ?? this.maxV;
      if (Math.abs(d) < 0.6 && Math.abs(this.v) < 12) {
        this.solid.moveBy(w, d, 0);
        this.v = 0;
        this.queue.shift();
        if (!this.honked && this.kind !== 'scooter') {
          this.honked = true;
        }
        continue;
      }
      const dir = Math.sign(d);
      const stopDist = (this.v * this.v) / (2 * this.accel);
      if (Math.sign(this.v) === dir && stopDist >= Math.abs(d) - 0.5) this.v = approach(this.v, dir * 10, this.accel * DT);
      else this.v = approach(this.v, dir * maxV, this.accel * DT);
      let step = this.v * DT;
      if (Math.abs(step) > Math.abs(d)) step = d;
      this.solid.moveBy(w, step, 0);
      break;
    }
    if (!this.queue.length) this.v = 0;
    this.rot += (this.solid.lastDx / 5) * this.facing;
  }

  draw(ctx: Ctx) {
    drawVehicle(ctx, this.kind, this.solid.x + this.solid.xr, this.solid.y + this.solid.yr, this.facing, this.color, this.rot, this.label);
  }
}

/** A pedestrian "PUSH" button. Touch it to press. */
export class PedButton extends Entity {
  x: number;
  y: number;
  zone: Rect;
  onPress: ((w: World) => void) | null = null;
  private inside = false;
  litUntil = 0;
  presses = 0;
  enabled = true;

  groundY: number;

  constructor(x: number, y: number, groundY: number, onPress?: (w: World) => void) {
    super();
    this.layer = -3;
    this.x = x;
    this.y = y;
    this.groundY = groundY;
    this.zone = { x: x - 1, y: y - 1, w: 10, h: groundY - y + 1 };
    this.onPress = onPress ?? null;
  }

  update(w: World) {
    const p = w.player;
    const inNow = w.state === 'play' && overlapXYWH(p.x, p.y, p.w, p.h, this.zone);
    if (inNow && !this.inside && this.enabled) {
      this.presses++;
      this.litUntil = w.tick + secs(0.6);
      w.sfx('click', this.x + 4, this.y);
      this.onPress?.(w);
    }
    this.inside = inNow;
  }

  draw(ctx: Ctx, w: World) {
    drawPedButton(ctx, this.x, this.y, this.groundY, w.tick < this.litUntil, w.tick);
  }
}
