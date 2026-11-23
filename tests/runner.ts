import { World, LevelDef, InputState } from '../src/game/world';
import { INFO } from './helpers';

export interface Step {
  /** FWD: towards the exit on the right, whichever way the controls are flipped */
  hold?: 'L' | 'R' | '' | 'FWD';
  /** ticks to hold jump from the start of the step (0 = no jump) */
  jump?: number;
  ticks?: number;
  until?: (w: World) => boolean;
  max?: number;
  note?: string;
  /** reflex: while this step runs, hop anything (shot, rider, roller) coming at Dad within this many px */
  dodge?: number;
  /** reflex: lean into any gust that is blowing on Dad (a human holds against the wind) */
  brace?: boolean;
  /** a deliberate "hold to jump higher" moment (the jump audit lets it need more than a tap) */
  long?: boolean;
  /** per-tick steering that overrides `hold` (eg. keeping balance on a bobbing board) */
  steer?: (w: World) => 'L' | 'R' | '';
  /** per-tick control of both moving and jumping (overrides hold, steer and jump) */
  policy?: (w: World) => { move: 'L' | 'R' | ''; jump: boolean };
}

export function play(def: LevelDef, steps: Step[], info = INFO, trace = false) {
  const w = new World(def, info);
  def.build?.(w);
  const log: string[] = [];
  let jumpLeft = 0;
  let prevJump = false;
  for (const [i, s] of steps.entries()) {
    let t = 0;
    const max = s.max ?? 3000;
    if (s.jump) jumpLeft = s.jump;
    while (w.state === 'play') {
      let reflex = false;
      if (s.dodge && w.player.onGround && jumpLeft <= 0 && incoming(w, s.dodge)) {
        jumpLeft = 12;
        reflex = true;
      }
      const lean = s.brace ? windOn(w) : 0;
      const pol = s.policy ? s.policy(w) : null;
      const hold = pol ? pol.move : s.steer ? s.steer(w) : s.hold;
      const input: InputState = {
        left: hold === 'L' || (hold === 'FWD' && w.flipped) || lean > 0,
        right: hold === 'R' || (hold === 'FWD' && !w.flipped) || lean < 0,
        jump: pol ? pol.jump || jumpLeft > 0 : jumpLeft > 0,
        jumpPressed: pol ? (pol.jump && !prevJump) || reflex : (t === 0 && !!s.jump) || reflex,
      };
      prevJump = input.jump;
      if (jumpLeft > 0) jumpLeft--;
      (globalThis as any).__lddRec?.push((input.left ? 1 : 0) | (input.right ? 2 : 0) | (input.jump ? 4 : 0) | (input.jumpPressed ? 8 : 0));
      w.step(input);
      t++;
      if (trace && t % (+(process.env.LDD_EVERY ?? 6)) === 0) log.push(`step${i} t${w.tick} x=${w.player.x} y=${w.player.y} g=${w.player.onGround ? 1 : 0} vx=${w.player.vx.toFixed(0)} vy=${w.player.vy.toFixed(0)}` + ((globalThis as any).__lddWatch ? ' | ' + (globalThis as any).__lddWatch(w) : ''));
      if (s.ticks !== undefined && t >= s.ticks) break;
      if (s.until && s.until(w)) break;
      if (t >= max) {
        if (trace) console.log(log.slice(-(+(process.env.LDD_N ?? 30))).join("\n"));
        throw new Error(`${def.id}: step ${i} (${s.note ?? ''}) timed out at x=${w.player.x},y=${w.player.y}`);
      }
    }
    if (w.state !== 'play') {
      if (trace) log.push(`ended in step ${i}: ${w.state} ${w.deathCause} at x=${w.player.x},y=${w.player.y} tick ${w.tick}`);
      break;
    }
  }
  // let a final walk-in settle
  let guard = 0;
  while (w.state === 'play' && guard++ < 10) w.step({ left: false, right: false, jump: false, jumpPressed: false });
  return { w, log };
}

export const X = (tx: number) => (w: World) => w.player.x >= tx * 16;
/** the force of a gust blowing on Dad right now (0 if none) */
export function windOn(w: World): number {
  const p = w.player;
  for (const e of w.entities) {
    if (!(e instanceof Gust)) continue;
    const g = e as Gust;
    const on = g.schedule ? scheduleOn(w, g.schedule) : g.on;
    const z = g.zone;
    if (on && p.x < z.x + z.w && p.x + p.w > z.x && p.y < z.y + z.h && p.y + p.h > z.y) return g.force;
  }
  return 0;
}
export const XL = (tx: number) => (w: World) => w.player.x <= tx * 16;
export const ground = (w: World) => w.player.onGround;
export const and = (...fs: ((w: World) => boolean)[]) => (w: World) => fs.every((f) => f(w));
export const done = (w: World) => w.state !== 'play';

import { Vehicle } from '../src/game/entities/traffic';
export const veh = (w: World, kind: string, i = 0) => w.entities.filter((e) => e instanceof Vehicle && (e as Vehicle).kind === kind)[i] as Vehicle;
export const onVeh = (kind: string) => (w: World) => w.standing(veh(w, kind).solid);
export const vehAt = (kind: string, x: number) => (w: World) => Math.abs(veh(w, kind).x - x) < 0.6 && veh(w, kind).v === 0;

import { Platform, Water, Floater } from '../src/game/entities/mumbai';
export const plat = (w: World, i = 0) => w.entities.filter((e) => e instanceof Platform)[i] as Platform;
export const floodLevel = (w: World) => (w.entities.find((e) => e instanceof Water) as Water).level;
export const float = (w: World, i = 0) => w.entities.filter((e) => e instanceof Floater)[i] as Floater;

import { Roller, Thing } from '../src/game/entities/traps';
import { scheduleOn, scheduleLeft, Gust, Arc } from '../src/game/entities/traps';
export const thingOf = (w: World, kind: string, i = 0) => w.entities.filter((e) => e instanceof Thing && (e as Thing).kind === kind)[i] as Thing;
/** a rolling hazard ahead of the player (to the right) within `gap` px */
export const rollerNear = (gap: number) => (w: World) => w.entities.some((e) => e instanceof Roller && (e as Roller).alive && (e as Roller).x > w.player.x - 2 && (e as Roller).x - w.player.x < gap);
export const gustOn = (w: World) => w.entities.some((e) => e instanceof Gust && (e as Gust).schedule && scheduleOn(w, (e as Gust).schedule!));
export const gustLeft = (w: World) => { const g = w.entities.find((e) => e instanceof Gust) as Gust; return scheduleLeft(w, g.schedule!); };
/** the i-th gust: blowing now, and seconds until it flips */
export const gustNOn = (w: World, i: number) => { const g = (w.entities.filter((e) => e instanceof Gust) as Gust[])[i]; return scheduleOn(w, g.schedule!); };
export const gustNLeft = (w: World, i: number) => { const g = (w.entities.filter((e) => e instanceof Gust) as Gust[])[i]; return scheduleLeft(w, g.schedule!); };
export const arcOn = (w: World) => w.entities.some((e) => e instanceof Arc && scheduleOn(w, (e as Arc).schedule));
export const arcLeft = (w: World) => { const a = w.entities.find((e) => e instanceof Arc) as Arc; return scheduleLeft(w, a.schedule); };
import { Blinker } from '../src/game/entities/traps';
export const blinkers = (w: World) => w.entities.filter((e) => e instanceof Blinker) as Blinker[];
export const blinkerLeft = (w: World, i: number) => scheduleLeft(w, blinkers(w)[i].schedule!);
import { Shot } from '../src/game/entities/traps';
export const arcN = (w: World, i: number) => (w.entities.filter((e) => e instanceof Arc) as Arc[])[i];
export const arcNOn = (i: number) => (w: World) => scheduleOn(w, arcN(w, i).schedule);
export const arcNLeft = (w: World, i: number) => scheduleLeft(w, arcN(w, i).schedule);
export const shotAhead = (gap: number) => (w: World) => w.entities.some((e) => e instanceof Shot && (e as Shot).alive && (e as Shot).x > w.player.x && (e as Shot).x - w.player.x < gap);
export const or = (...fs: ((w: World) => boolean)[]) => (w: World) => fs.some((f) => f(w));
export const floaterOf = (w: World, i = 0) => w.entities.filter((e) => e instanceof Floater)[i] as Floater;
import { Geyser, Rider, Cascade } from '../src/game/entities/traps';
export const cascadeN = (w: World, i: number) => (w.entities.filter((e) => e instanceof Cascade) as Cascade[])[i];
/** waterfall stream i is dry now and for `need` seconds */
export const dry = (i: number, need = 0.5) => (w: World) => cascadeN(w, i).quietFor(w.tick * DT, need);
import { DT } from '../src/game/constants';
/** something on wheels coming at the player, within `gap` px (centre to centre) */
export const riderNear = (gap: number) => (w: World) =>
  w.entities.some((e) => {
    if (!(e instanceof Rider) || !e.alive) return false;
    const d = e.cx - w.player.cx;
    return (d > 0 && e.vx < 0 && d < gap) || (d < 0 && e.vx > 0 && -d < gap);
  });
export const geyserN = (w: World, i: number) => (w.entities.filter((e) => e instanceof Geyser) as Geyser[])[i];
export const quiet = (i: number, need = 0.55) => (w: World) => geyserN(w, i).quietFor(w.tick * DT, need);
/** a projectile flying at the player, within `gap` px */
export const shotNear = (gap: number) => (w: World) =>
  w.entities.some((e) => {
    if (!(e instanceof Shot) || !(e as Shot).alive) return false;
    const s = e as Shot;
    const p = w.player;
    return (s.vx < 0 && s.x > p.x && s.x - p.x < gap) || (s.vx > 0 && s.x + s.w < p.x + p.w && p.x - (s.x + s.w) < gap);
  });

/** something dangerous moving towards Dad at about his height, about to arrive (time to contact ~0.12 s) */
export function incoming(w: World, _gap: number) {
  const p = w.player;
  for (const e of w.entities as any[]) {
    if (!e.alive || e.vx === undefined || e.x === undefined || !e.hazard?.active) continue;
    const ew = e.w ?? 12,
      eh = e.h ?? 12;
    if (e.y + eh < p.y - 6 || e.y > p.y + p.h + 2) continue;
    const ahead = e.x - (p.x + p.w),
      behind = p.x - (e.x + ew);
    // riding something (a bus roof): its speed counts too
    const gs: any = p.onGround ? p.groundSolid : null;
    const pv = p.vx + (p.carryVx ?? 0) + (gs ? gs.velX ?? gs.lastDx / DT : 0);
    if (e.vx < 0 && ahead > -4) {
      const closing = -e.vx + Math.max(0, pv);
      if (closing > 20 && ahead / closing <= 0.13) return true;
    } else if (e.vx > 0 && behind > -4) {
      const closing = e.vx + Math.max(0, -pv);
      if (closing > 20 && behind / closing <= 0.13) return true;
    }
  }
  return false;
}
