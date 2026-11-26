// Proven routes for the western chapters (Goa onwards): each stage's room, its acts, and its door.
// Merged into SOLUTIONS, ACT_ROUTES and ENDING_POLICIES by solutions.ts, acts.ts and endings.ts.
import type { World } from '../src/game/world';
import type { Door } from '../src/game/entities/basics';
import { Step, X, and, ground } from './runner';
import { Gossip } from '../src/game/cities/pnj/levels';
import type { Brush, IceBlock, PedalBoat, PlankChain, RopeFerry, Scale } from '../src/game/cities/dmn/entities';
import type { Football, Parade, Parasail, Rope, Roulette } from '../src/game/cities/pnj/entities';
import type { Sunbeam } from '../src/game/cities/gnr/entities';
import { Dino, Feathers, GarbaRing, Lion, Naka, type FeatherPickup } from '../src/game/cities/gnr/entities';
import { Balloon, Bangle, Bowl, Elephant, Ghodi, Pots, Rocket, Talwar, type Strings } from '../src/game/cities/jai/entities';
import { Lake, Sailboat, Shelter, Bison, Thread, Katori, Morph, Sher, Chumbak, Surma, Tawa } from '../src/game/cities/bpl/entities';
import { Baaj, Chapda, Gedi, Ghadi, Hand, Heap, Kosa, Sack, Swarm, Top } from '../src/game/entities/raipur';
import type { Player } from '../src/game/player';

type Move = 'L' | 'R' | '';
type Out = { move: Move; jump: boolean };
interface Mem {
  hold: number;
  steer: Move;
  [k: string]: any;
}
type Policy = (w: World, m: Mem, d: Door) => Out;
const px = (t: number) => t * 16;
const go = (move: Move): Out => ({ move, jump: false });
const toward = (w: World, x: number, slack = 2): Move => {
  const c = w.player.cx;
  return c < x - slack ? 'R' : c > x + slack ? 'L' : '';
};
/** a policy that presses jump for `ticks` (after a tick with the button up) and steers meanwhile */
function presser() {
  let hold = 0,
    steer: Move = '',
    world: World | null = null;
  return {
    reset(w: World) {
      if (world !== w) {
        world = w;
        hold = 0;
      }
    },
    busy: () => hold > 0,
    next(): Out {
      hold--;
      return { move: steer, jump: true };
    },
    press(w: World, ticks: number, s: Move): Out {
      if (w.input.jump) return { move: s, jump: false };
      hold = ticks - 1;
      steer = s;
      return { move: s, jump: true };
    },
  };
}

// ------------------------------------------------------------------ Goa
const lane = (w: World) => w.flags.lane as { a: Gossip; b: Gossip };
/** the bubble Dad is standing on, if it's one of the near aunty's */
const myBubble = (w: World) => {
  const p = w.player;
  return lane(w).a.live.find((q) => !q.sharp && p.onGround && p.y + p.h === Math.round(q.y) && p.x + p.w > q.x && p.x < q.x + 40) ?? null;
};


/** walk out on rope r to world x `at` (Dad's left), let it sag to `depth`, then a full jump, steering
 *  right after `after` ticks */
function bounce(get: (w: World) => Rope, at: number, depth: number, after = 0): Step {
  const j = presser();
  let t = -1,
    world: World | null = null;
  return {
    policy: (w: World): Out => {
      if (world !== w) {
        world = w;
        t = -1;
      }
      j.reset(w);
      const r = get(w);
      if (t >= 0) {
        t++;
        return { move: t > after ? "R" : "", jump: t < 70 };
      }
      const p = w.player;
      if (!w.standing(r.solid)) return go(p.x < at ? 'R' : '');
      if (p.x < at - 1) return go('R');
      if (r.depth >= depth && !w.input.jump) {
        t = 0;
        return { move: '', jump: true };
      }
      return go('');
    },
    until: (w) => t > 2 && w.player.onGround && !w.standing(get(w).solid),
    max: 900,
    long: true,
    note: `out on the rope, let it sag to ${depth}, and jump`,
  };
}


/** wait (standing) for the wheel to start a spin with `need` s of it left, then run right to tile `toX`,
 *  hopping each gap between the chips (steering for the middle of the next chip) */
function chipRun(table: (w: World) => Roulette, toX: number, need: number): Step {
  const j = presser();
  let going = false,
    aim = -1,
    world: World | null = null;
  const solidAt = (w: World, x: number, y: number) => !!w.solidAt(x, y, 1, 2);
  return {
    policy: (w: World): Out => {
      if (world !== w) {
        world = w;
        going = false;
        aim = -1;
      }
      j.reset(w);
      const p = w.player;
      const feet = p.y + p.h;
      if (j.busy()) {
        const o = j.next();
        return { move: aim > 0 ? toward(w, aim, 2) : 'R', jump: o.jump };
      }
      const st = table(w).at(w.tick / 120);
      if (!going) {
        if (p.onGround && st.spinning && st.left >= need) going = true;
        else return go('');
      }
      if (!p.onGround) return go(aim > 0 ? toward(w, aim, 2) : 'R');
      // on something: the gap ahead, and the next thing to stand on after it
      let g0 = -1;
      for (let x = p.x + p.w; x < p.x + p.w + 40; x++)
        if (!solidAt(w, x, feet + 1)) {
          g0 = x;
          break;
        }
      if (g0 < 0 || g0 - (p.x + p.w) > 3) return go('R');
      let p0 = -1,
        p1 = -1;
      for (let x = g0; x < g0 + 120; x++) {
        const s = solidAt(w, x, feet + 1);
        if (s && p0 < 0) p0 = x;
        if (!s && p0 >= 0) {
          p1 = x;
          break;
        }
      }
      if (p0 < 0) return go('');
      if (p1 < 0) p1 = p0 + 32;
      aim = Math.min((p0 + p1) / 2, p0 + 16);
      return j.press(w, 10, 'R');
    },
    until: (w) => w.player.onGround && w.player.x >= px(toX),
    max: 2400,
    note: `wait for a spin, then across the chips to ${toX}`,
  };
}


type Gap = { x: number; a: number; b: number };
/** grab the parasail's bar, thread each gate's gap, and let go above `landX` (px) */
function fly(get: (w: World) => Parasail, gates: (w: World) => Gap[], landX: number): Step {
  const j = presser();
  return {
    policy: (w: World): Out => {
      j.reset(w);
      if (j.busy()) return j.next();
      const ps = get(w);
      const p = w.player;
      if (!ps.started) {
        if (p.onGround) return p.cx < ps.hx - 9 ? go('R') : j.press(w, 12, 'R');
        return go('R');
      }
      if (ps.held) {
        if (ps.hx >= landX) return j.press(w, 8, 'R');
        const g = gates(w).find((q) => q.x + 16 > ps.hx - 6);
        const sea = 247;
        const target = g ? (Math.max(g.a, 30) + Math.min(g.b, sea - 22)) / 2 - 7 : sea - 70;
        return go(ps.hy > target + 3 ? 'R' : ps.hy < target - 3 ? 'L' : '');
      }
      return go('R');
    },
    until: (w) => get(w).done && w.player.onGround,
    max: 2400,
    note: 'fly the parasail through the gates, let go over the beach',
  };
}


/** down the parade street: keep walking while the band plays, and be up on a float when it stops */
function paradeRun(get: (w: World) => Parade, toX: number): Step {
  let hold = 0,
    target: { x: number; w: number } | null = null,
    world: World | null = null;
  return {
    policy: (w: World): Out => {
      if (world !== w) {
        world = w;
        hold = 0;
        target = null;
      }
      const pr = get(w);
      const p = w.player;
      if (hold > 0) {
        hold--;
        return { move: target ? toward(w, target.x + target.w / 2, 3) : '', jump: true };
      }
      const m = pr.tune(w.tick / 120);
      const on = pr.solids.find((s) => s.collidable && w.standing(s));
      if (p.cx >= pr.x1 + 4) return go('R');
      if (!m.playing) return go('');
      const danger = m.left < 1.3;
      if (on) {
        if (!danger) return go('R');
        // stay well on the deck until it's over
        return go(toward(w, on.x + on.w / 2, 6));
      }
      if (!p.onGround) return go(target ? toward(w, target.x + target.w / 2, 3) : 'R');
      if (!danger) return go('R');
      // the stop is coming: the nearest float, under it, and up
      const fl = pr.solids.filter((s) => s.collidable).sort((a, b) => Math.abs(a.x + a.w / 2 - p.cx) - Math.abs(b.x + b.w / 2 - p.cx))[0];
      if (!fl) return go('R');
      target = fl;
      if (p.x + p.w > fl.x + 6 && p.x < fl.x + fl.w - 6 && !w.input.jump) {
        hold = 24;
        return { move: toward(w, fl.x + fl.w / 2, 3), jump: true };
      }
      return go(toward(w, fl.x + fl.w / 2, 3));
    },
    until: (w) => w.player.onGround && w.player.x >= px(toX),
    max: 4000,
    long: true,
    note: 'walk the parade; on a float whenever the music stops',
  };
}


/** pedal a boat to tile `toX`: hop each low mooring line (y > 200), never jump near a high one, and
 *  walk off when it bumps the far bank */
function boatRun(get: (w: World) => PedalBoat, lines: (w: World) => number[], toX: number): Step {
  let hold = 0,
    world: World | null = null;
  return {
    policy: (w: World): Out => {
      if (world !== w) {
        world = w;
        hold = 0;
      }
      if (hold > 0) {
        hold--;
        return { move: '', jump: true };
      }
      const p = w.player;
      const b = get(w);
      const on = w.standing(b.solid);
      if (on) {
        for (const x of lines(w)) {
          const hz = w.hazards.find((h: any) => h.cause === 'moored' && h.hits(x + 1, 200, 2, 30));
          const dx = x - (p.x + p.w);
          if (hz && dx >= 2 && dx <= 12 && !w.input.jump) {
            hold = 11;
            return { move: '', jump: true };
          }
        }
        return go('R');
      }
      return go(p.onGround ? 'R' : '');
    },
    until: (w) => w.player.onGround && w.player.x >= px(toX) && !w.standing(get(w).solid),
    max: 3000,
    note: 'pedal across, hopping the low lines',
  };
}

/** hop from solid to solid (ice blocks, chips) to tile `toX`, aiming each jump at the middle of the
 *  next thing to stand on and pressing longer for wider gaps */
function hopAcross(toX: number, note = 'hop across'): Step {
  let hold = 0,
    aim = -1,
    world: World | null = null;
  const solid = (w: World, x: number, y: number) => !!w.solidAt(x, y, 1, 2);
  return {
    policy: (w: World): Out => {
      if (world !== w) {
        world = w;
        hold = 0;
        aim = -1;
      }
      const p = w.player;
      if (hold > 0) {
        hold--;
        return { move: aim > 0 ? toward(w, aim, 3) : 'R', jump: true };
      }
      if (!p.onGround) return go(aim > 0 ? toward(w, aim, 3) : 'R');
      const feet = p.y + p.h;
      let g0 = -1;
      for (let x = p.x + p.w; x < p.x + p.w + 40; x++)
        if (!solid(w, x, feet + 1)) {
          g0 = x;
          break;
        }
      if (g0 < 0 || g0 - (p.x + p.w) > 3) return go('R');
      let p0 = -1,
        p1 = -1;
      for (let x = g0; x < g0 + 110; x++) {
        const s = solid(w, x, Math.min(feet + 1, 247)) || solid(w, x, 241) || solid(w, x, 235);
        if (s && p0 < 0) p0 = x;
        if (!s && p0 >= 0) {
          p1 = x;
          break;
        }
      }
      if (p0 < 0 || w.input.jump) return go('');
      if (p1 < 0) p1 = p0 + 40;
      aim = Math.min((p0 + p1) / 2, p0 + 18);
      hold = Math.max(9, Math.min(30, Math.round(6 + (p0 - g0) / 2.2)));
      return { move: 'R', jump: true };
    },
    until: (w) => w.player.onGround && w.player.x >= px(toX),
    max: 2400,
    long: true,
    note,
  };
}


/** ride the carpenters' plank: board it while it rests at the bottom (on a round nobody will drop it),
 *  keep to its middle, and hop right off the top on to the deck at tile `deckX` */
function chainRide(get: (w: World) => PlankChain, deckX: number, deckTop: number): Step {
  let hold = 0,
    steer: Move = '',
    world: World | null = null;
  return {
    policy: (w: World): Out => {
      if (world !== w) {
        world = w;
        hold = 0;
      }
      const c = get(w);
      const p = w.player;
      const s = c.solid;
      const mid = s.x + 20;
      if (hold > 0) {
        hold--;
        return { move: steer === 'C' as any ? toward(w, mid, 2) : steer, jump: true };
      }
      const q = c.at(w.tick / 120);
      const on = w.standing(s);
      const last = c.spots.length - 1;
      if (on) {
        if (!q.passing && !q.back && q.i === last && !w.input.jump) {
          hold = 12;
          steer = 'R';
          return { move: 'R', jump: true };
        }
        return go(toward(w, mid, 3));
      }
      if (!p.onGround) return go(steer === 'R' ? 'R' : toward(w, mid, 2));
      const sp = c.spots[0];
      if (!q.passing && !q.back && q.i === 0 && q.k < 0.55 && !c.dozing(q.round) && Math.abs(p.cx - (sp.x + 20)) < 34 && !w.input.jump) {
        hold = 12;
        steer = 'C' as any;
        return { move: toward(w, mid, 2), jump: true };
      }
      // wait on the bank, short of the water
      return go(toward(w, sp.x - 10, 2));
    },
    until: (w) => w.player.onGround && w.player.y + w.player.h === deckTop && w.player.x >= px(deckX),
    max: 4000,
    note: 'ride the plank up the chain of carpenters',
  };
}


/** on to the raft, tap jump every `every` ticks to haul it over, and off at the far dock (tile `toX`) */
function ferryRun(get: (w: World) => RopeFerry, toX: number, every = 18): Step {
  let t = 0,
    world: World | null = null;
  return {
    policy: (w: World): Out => {
      if (world !== w) {
        world = w;
        t = 0;
      }
      const r = get(w);
      if (!w.standing(r.solid) || r.docked) return go('R');
      t++;
      return { move: '', jump: t % every < 2 };
    },
    until: (w) => w.player.onGround && w.player.x >= px(toX) && !w.standing(get(w).solid),
    max: 3000,
    note: 'haul the raft across, tap by tap',
  };
}


/** a full jump on to the scale's free pan, ride it up crate by crate, and hop on to the ledge at
 *  `ledgeTop` (tile `toX`) when it's level */
function scaleRide(get: (w: World) => Scale, toX: number, ledgeTop: number): Step {
  let hold = 0,
    steer: Move = '',
    world: World | null = null;
  return {
    policy: (w: World): Out => {
      if (world !== w) {
        world = w;
        hold = 0;
      }
      const B = get(w).mine;
      const p = w.player;
      if (hold > 0) {
        hold--;
        return { move: steer === ('C' as Move) ? toward(w, B.x + 16, 2) : steer, jump: true };
      }
      if (w.standing(B)) {
        if (B.y <= ledgeTop - 3 && !w.input.jump) {
          hold = 10;
          steer = 'R';
          return { move: 'R', jump: true };
        }
        return go(toward(w, B.x + 16, 3));
      }
      if (!p.onGround) return go(steer === 'R' ? 'R' : toward(w, B.x + 16, 3));
      // to just short of the pan, but never off the edge of what we're standing on
      const edge = !w.solidAt(p.x + p.w + 3, p.y + p.h + 1, 2, 2);
      if (p.cx < B.x - 15 && !edge) return go('R');
      if (p.cx > B.x - 9) return go('L');
      // only when the pan is low enough to reach (when the last lot has just been sold)
      if (w.input.jump || p.y + p.h - B.y > 46) return go('');
      hold = 40;
      steer = 'C' as Move;
      return { move: 'R', jump: true };
    },
    until: (w) => w.player.onGround && w.player.y + w.player.h === ledgeTop && w.player.x >= px(toX),
    max: 3000,
    long: true,
    note: 'on to the pan, up crate by crate, off at the top',
  };
}


/** walk the Warli path right behind the brush (never ahead), hopping where it lifted, to tile `toX` */
function brushRun(get: (w: World) => Brush, toX: number): Step {
  let hold = 0,
    world: World | null = null;
  return {
    policy: (w: World): Out => {
      if (world !== w) {
        world = w;
        hold = 0;
      }
      const p = w.player;
      if (hold > 0) {
        hold--;
        return { move: 'R', jump: true };
      }
      const hx = get(w).hx;
      if (!p.onGround) return go('R');
      if (hx < 0) return go(get(w).started >= 0 || p.x + p.w < get(w).o.startX + 30 ? 'R' : '');
      // a lifted stretch the brush has already passed: hop it
      const feet = p.y + p.h;
      const under = (x: number) => !!w.solidAt(x, feet - 3, 1, 8);
      let gap = false;
      for (let x = p.x + p.w + 1; x < p.x + p.w + 4; x++) if (!under(x)) gap = true;
      if (gap) {
        // where the paint starts again, and only once the brush is well past it
        let end = -1;
        for (let x = p.x + p.w + 4; x < p.x + p.w + 60; x++)
          if (under(x)) {
            end = x;
            break;
          }
        if (end > 0 && hx > end + 28 && !w.input.jump) {
          hold = 10;
          return { move: 'R', jump: true };
        }
        if (end > 0 || hx < p.x + 40) return go('');
      }
      if (p.cx < hx - 22) return go('R');
      return go('');
    },
    until: (w) => w.player.onGround && w.player.x >= px(toX),
    max: 3000,
    note: 'right behind the brush',
  };
}


// ------------------------------------------------------------------ Gandhinagar
/** walk to x (Dad's left, px) and stand still there */
function standAt(x: number, note = 'to the mark'): Step {
  return {
    policy: (w: World): Out => {
      const p = w.player;
      const d = x - p.x;
      if (Math.abs(d) <= 1) return go('');
      if (Math.abs(d) <= 5 && Math.abs(p.vx) > 25) return go('');
      return go(d > 0 ? 'R' : 'L');
    },
    until: (w) => Math.abs(w.player.x - x) <= 1 && Math.abs(w.player.vx) < 1 && w.player.onGround,
    max: 900,
    note,
  };
}
/** a pole vault: stand at `start`, run right, and plant the bamboo when Dad's left reaches `takeoff` */
function vaultFrom(start: number, takeoff: number, note: string): Step[] {
  return [
    standAt(start, `${note}: back to the run-up mark`),
    { hold: 'R', until: (w) => w.player.x >= takeoff, max: 400, note: `${note}: run-up` },
    { hold: 'R', jump: 1, ticks: 1, note: `${note}: vault` },
    { hold: 'R', until: (w) => w.player.onGround && w.tick - (w.flags.vault?.tick ?? -99) > 10, max: 400, note: `${note}: over` },
  ];
}

/** on a floor whose top is `top`, past x */
const onTop = (top: number, x: number) => (w: World) => w.player.onGround && w.player.y + w.player.h === top && w.player.cx > x;
/** climb a sunbeam from a floor ([x0, x1, top]): wait (at `wait`) for its low part to come within a
 *  hop with the sun out long enough, jump up through it from under it, land on it and walk up */
function beamClimb(get: (w: World) => Sunbeam, floor: [number, number, number], wait: number, note: string, done: (w: World) => boolean): Step {
  const j = presser();
  return {
    policy: (w: World): Out => {
      j.reset(w);
      if (j.busy()) return j.next();
      const p = w.player,
        b = get(w),
        t = w.tick * (1 / 120);
      const up: Move = b.side < 0 ? 'R' : 'L';
      if (b.solid.collidable && p.isRiding(b.solid)) return go(up);
      if (!p.onGround) return go('');
      const [fx0, fx1, top] = floor;
      if (p.y + p.h !== top) return go(up);
      const tanA = Math.tan(b.a);
      let cx = b.tx + b.side * ((top - 24 - b.ty) / tanA);
      if ((cx - b.tx) * b.side > b.reach) cx = top - b.by < 34 ? b.bx - b.side * 3 : NaN;
      const ok = Number.isFinite(cx) && cx > fx0 + 6 && cx < fx1 - 6 && b.lit && b.clearFor(t) > b.len / 150 + 0.6;
      if (!ok) return go(toward(w, wait, 3));
      if (Math.abs(p.cx - cx) > 2) return go(toward(w, cx, 2));
      if (Math.abs(p.vx) > 30) return go('');
      return j.press(w, 14, '');
    },
    until: done,
    max: 3000,
    note,
  };
}

/** will a dinosaur's shockwave pass under Dad within `ticks`? */
function waveSoon(w: World, ticks: number): boolean {
  const p = w.player;
  for (const d of w.entities) {
    if (!(d instanceof Dino) || d.floor !== p.y + p.h) continue;
    const lo = d.o.x0 ?? -1e9,
      hi = d.o.x1 ?? 1e9;
    for (const q of d.waves) {
      const v = (q.dir * d.speed) / 120;
      const k = (p.cx - q.x) / v;
      const at = q.x + v * Math.max(0, k);
      if (k >= -0.5 && k <= ticks && at >= lo && at <= hi) return true;
    }
  }
  return false;
}
/** walk right to tile `to`, hopping every shockwave as it reaches you */
function waveWalk(to: number, note: string): Step {
  const j = presser();
  return {
    policy: (w: World): Out => {
      j.reset(w);
      if (j.busy()) return j.next();
      const p = w.player;
      if (!p.onGround) return go('R');
      if (waveSoon(w, 3)) return j.press(w, 8, 'R');
      return go(p.x >= px(to) ? '' : 'R');
    },
    until: (w) => w.player.onGround && w.player.x >= px(to) && !waveSoon(w, 6),
    max: 1500,
    note,
  };
}
/** stand with Dad's centre at x until a wave throws him, rise straight up, then drift right on to
 *  the floor whose top is `top` */
function throwUp(x: number, top: number, note: string): Step {
  return {
    policy: (w: World): Out => {
      const p = w.player;
      if (!p.onGround) return go(p.y + p.h < top - 4 ? 'R' : '');
      return go(toward(w, x, 1));
    },
    until: (w) => w.player.onGround && w.player.y + w.player.h === top,
    max: 1500,
    note,
  };
}

/** walk right to tile `to` past lions: stare down any that gets close behind (they back off), wait
 *  at shut gates looking back, hop sleeping lions and rock faces, and jump an awake lion ahead once
 *  you've backed it up, turning round in the air to face it as you land */
function lionWalk(to: number, note: string, rocks: number[] = []): Step {
  const j = presser();
  return {
    policy: (w: World): Out => {
      j.reset(w);
      if (j.busy()) return j.next();
      const p = w.player,
        t = w.tick / 120;
      const lions = w.entities.filter((e) => e instanceof Lion) as Lion[];
      const awake = lions.filter((L) => L.state !== 'sleep' && !L.o.vain);
      if (!p.onGround) {
        // in the air: once past the nearest lion, turn to face it before landing
        let near: Lion | null = null;
        for (const L of awake) if (!near || Math.abs(L.x - p.cx) < Math.abs(near.x - p.cx)) near = L;
        if (near && near.x < p.cx - 12 && Math.abs(near.x - p.cx) < 80) return go(p.facing > 0 ? 'L' : '');
        return go(p.facing > 0 ? 'R' : '');
      }
      const behind = awake.filter((L) => L.x < p.cx && p.cx - L.x < 260);
      if (behind.some((L) => p.cx - L.x < 50)) return go(p.facing > 0 ? 'L' : '');
      const gate = (w.entities.filter((e) => e instanceof Naka) as Naka[]).find((g) => g.x - (p.x + p.w) >= -1 && g.x - (p.x + p.w) < 20);
      if (gate && gate.openFor(t) < 0.45) return go(behind.length && p.facing > 0 ? 'L' : '');
      if (p.x >= px(to)) return go('');
      for (const L of lions) {
        if (L.o.vain || L.x < p.cx) continue;
        const gap = L.x - 12 - (p.x + p.w);
        if (gap >= 0 && gap <= (L.state === 'sleep' ? 8 : 5)) return j.press(w, L.state === 'sleep' ? 10 : 14, 'R');
      }
      for (const rx of rocks) {
        const gap = rx - (p.x + p.w);
        if (gap >= 0 && gap <= 6) return j.press(w, 12, 'R');
      }
      return go('R');
    },
    until: (w) => w.player.onGround && w.player.x >= px(to),
    max: 3000,
    note,
  };
}

/** run right from wherever Dad is, take off when his left reaches `takeoff`, and flap `flaps` times,
 *  each at the top of the last rise */
function flapJump(flaps: number, takeoff: number, note: string, done: (w: World) => boolean): Step {
  let used = 0,
    flying = false,
    world: World | null = null;
  return {
    policy: (w: World): Out => {
      if (world !== w) {
        world = w;
        used = 0;
        flying = false;
      }
      const p = w.player;
      if (p.onGround) {
        if (flying) return go('R');
        if (p.x < takeoff) return go('R');
        if (w.input.jump) return go('R');
        flying = true;
        used = 0;
        return { move: 'R', jump: true };
      }
      if (used < flaps && p.vy >= -20) {
        if (w.input.jump) return { move: 'R', jump: false };
        used++;
        return { move: 'R', jump: true };
      }
      return { move: 'R', jump: true };
    },
    until: done,
    max: 900,
    long: true,
    note,
  };
}
const feathers = (k: number) => (w: World) => (w.flags.feathers ?? 0) >= k;

/** walk right to tile `to` through garba rings: go on only while the next 0.4 s of walking is clear of
 *  every dancer crossing your path; otherwise wait (or back off if a dancer is coming to where you stand) */
function garbaWalk(to: number, note: string): Step {
  return {
    policy: (w: World): Out => {
      const p = w.player;
      if (!p.onGround) return go('R');
      if (p.x >= px(to)) return go('');
      const rings = w.entities.filter((e) => e instanceof GarbaRing) as GarbaRing[];
      const hit = (x: number, dt: number) => rings.some((g) => g.hitsAt(x, p.y, p.w, p.h, dt));
      let goOk = true,
        stayOk = true;
      for (let k = 1; k <= 52 && (goOk || stayOk); k++) {
        const dt = k / 120;
        if (goOk && hit(p.x + Math.min(140 * dt, Math.max(0, p.vx) * dt + 950 * dt * dt), dt)) goOk = false;
        if (stayOk && hit(p.x, dt)) stayOk = false;
      }
      return go(goOk ? 'R' : stayOk ? '' : 'L');
    },
    until: (w) => w.player.onGround && w.player.x >= px(to),
    max: 3000,
    note,
  };
}

/** run right to tile `to` over uneven moving ground (the market chart): hop anything at shin height
 *  in front, and any hole (no floor below for a long way) just ahead */
function bumpRun(to: number, note: string): Step {
  const j = presser();
  return {
    policy: (w: World): Out => {
      j.reset(w);
      if (j.busy()) return j.next();
      const p = w.player;
      if (!p.onGround) return go('R');
      if (p.x >= px(to)) return go('');
      const feet = p.y + p.h;
      for (let dx = 1; dx <= 7; dx++) if (w.solidAt(p.x + p.w - 1 + dx, feet - 14, 1, 8)) return j.press(w, 14, 'R');
      const ax = p.x + p.w + 3;
      if (!w.solidAt(ax, feet, 2, 130)) return j.press(w, 20, 'R');
      return go('R');
    },
    until: (w) => w.player.onGround && w.player.x >= px(to),
    max: 3000,
    note,
  };
}

// ------------------------------------------------------------------ Jaipur
/** on puppet strings: stand with Dad's left at `x` until the next beat yanks him, steer right through
 *  the hop, and stop once he's down (on a floor whose top is `land`, past `past`) */
function beatHop(get: (w: World) => Strings, x: number, note: string, past: number, land?: number): Step[] {
  let yanked = -1,
    world: World | null = null;
  return [
    standAt(x, `${note}: to the edge`),
    {
      policy: (w: World): Out => {
        if (world !== w) {
          world = w;
          yanked = -1;
        }
        const s = get(w);
        if (yanked < 0 && s.lastBeat === w.tick) yanked = w.tick;
        if (yanked < 0) return go(s.until(w) <= 1 ? 'R' : '');
        return go('R');
      },
      until: (w) => yanked >= 0 && w.player.onGround && w.player.x >= past && (land === undefined || w.player.y + w.player.h === land),
      max: 600,
      note: `${note}: the beat`,
    },
  ];
}
/** on puppet strings: wait at `x` (hopping in place) until a beat starts a long gap, then walk through to `to` */
function beatPass(get: (w: World) => Strings, x: number, to: number, long: number, note: string): Step[] {
  let go_ = false,
    world: World | null = null;
  return [
    standAt(x, `${note}: wait short of it`),
    {
      policy: (w: World): Out => {
        if (world !== w) {
          world = w;
          go_ = false;
        }
        const s = get(w);
        const p = w.player;
        if (!go_ && p.onGround && w.tick - s.lastBeat < 70 && s.until(w) >= long) go_ = true;
        return go(go_ ? 'R' : p.x < x - 1 ? 'R' : p.x > x + 1 ? 'L' : '');
      },
      until: (w) => w.player.x >= to,
      max: 900,
      note: `${note}: through on the long beat`,
    },
  ];
}

/** the elephant nearest behind (or under) Dad */
function haathiOf(w: World): Elephant | undefined {
  const p = w.player;
  return (w.entities.filter((e) => e instanceof Elephant) as Elephant[]).filter((e) => e.x < p.x + 40).sort((a, b) => b.x - a.x)[0];
}
/** use the elephant as a step over the wall whose left face is at tile `wall`: wait at the wall till she
 *  has followed, hop back on to her (before the trunk gets ideas), ride her to the wall, jump up */
function haathiOver(wall: number, to: number, note: string): Step {
  const j = presser();
  return {
    policy: (w: World): Out => {
      j.reset(w);
      if (j.busy()) return j.next();
      const p = w.player;
      const e = haathiOf(w);
      if (p.x >= px(wall)) return go('R');
      if (!e) return go('R');
      if (p.isRiding(e.solid)) {
        // drive her to the wall, then up off her back
        if (e.x + Elephant.W < px(wall) - 1) return go('R');
        return j.press(w, 34, 'R');
      }
      if (!p.onGround) return go(p.x + p.w < e.x + 12 ? 'R' : p.x > e.x + Elephant.W - 12 ? 'L' : '');
      // she's in the way: on to her back from behind
      if (p.x + p.w <= e.x + 1) return e.x - (p.x + p.w) > 12 ? go('R') : j.press(w, 26, 'R');
      const at = px(wall) - 14 - p.w;
      if (p.x < at - 2) return go('R');
      if (e.facing === 1 && e.gap(w) <= 26 && !e.moving) return j.press(w, 22, 'L');
      return go('');
    },
    until: (w) => w.player.onGround && w.player.x >= px(to),
    max: 4000,
    long: true,
    note,
  };
}

/** burn or not, to hold the basket's floor at height `alt`; and if a rocket ahead would be in the air
 *  as we cross it, dip in to the middle wind (it blows back) until it wouldn't be */
function balloonHold(w: World, b: Balloon, alt: number): Out {
  const t = w.tick / 120;
  const cruise = b.wind(alt);
  let want = alt;
  if (cruise > 0 && alt < 500) {
    const low = alt > 176;
    for (const R of w.entities.filter((e) => e instanceof Rocket) as Rocket[]) {
      const d = R.x - b.bx;
      if (d < (low ? 52 : 64) || d > (low ? 110 : 150)) continue;
      let bad = false;
      for (let s = (d - 22) / cruise - 0.08; s <= (d + 22) / cruise + 0.08; s += 0.03) if (R.yAt(t + s) !== null) bad = true;
      if (bad) want = low ? 166 : 122;
    }
  }
  return { move: '', jump: b.by + b.vy * 0.25 > want };
}
/** fly whatever balloon he's in by a plan (hold `alt` until its floor's x passes `to`, then the next;
 *  after the last, let it sink and land); on foot, walk right to the next balloon */
function balloonFly(plans: (w: World) => [number, number][][], to: number, note: string): Step {
  return {
    policy: (w: World): Out => {
      const bs = w.entities.filter((e) => e instanceof Balloon) as Balloon[];
      const i = bs.findIndex((b) => b.riding);
      if (i < 0) return go('R');
      const b = bs[i];
      for (const [x, alt] of plans(w)[i] ?? []) if (b.bx < x) return balloonHold(w, b, alt);
      return go('');
    },
    until: (w) => w.player.onGround && !(w.entities.filter((e) => e instanceof Balloon) as Balloon[]).some((b) => b.riding) && w.player.x >= px(to),
    max: 9000,
    long: true,
    note,
  };
}

/** what to press in the dummy horse (it never stops): jump what's in the way, and if the sword dancers
 *  ahead will be down when we get there, turn round (and straight back) to use up the time */
function ghodiDrive(w: World, j: ReturnType<typeof presser>, g: Ghodi): Out {
  const p = w.player;
  const key = g.dir > 0 ? 'R' : 'L';
  if (g.rear > 0) return go('');
  if (!p.onGround) return go(key);
  const t = w.tick / 120;
  const feet = p.y + p.h;
  if (g.dir < 0) {
    // going back: far enough from whatever turned us round for a run-up, then round again
    for (let k = 1; k <= 34; k++) if (w.solidAt(p.x + p.w - 1 + k, feet - 12, 1, 8)) return go('L');
    return go('R');
  }
  for (const T of w.entities.filter((e) => e instanceof Talwar) as Talwar[]) {
    if (Math.abs(T.floor - feet) > 40) continue;
    const d = T.x - p.cx;
    if (d < 14 || d > 110) continue;
    let bad = false;
    for (let s = (d - 14) / 170 - 0.06; s <= (d + 16) / 170 + 0.06; s += 0.02) if (T.downAt(t + s)) bad = true;
    if (bad) return go('L');
  }
  for (const s of g.snags) {
    const d = s.x - (p.x + p.w);
    if (d > 26 && d < 46) return j.press(w, 40, key);
  }
  // a drum or a riser ahead: jump it (hold longer for a tall one)
  for (let k = 1; k <= 26; k++)
    if (w.solidAt(p.x + p.w - 1 + k, feet - 12, 1, 8)) {
      const tall = w.solidAt(p.x + p.w - 1 + k, feet - 30, 1, 8);
      // another one right behind it: clear both in one long jump
      const two = w.solidAt(p.x + p.w - 1 + k + 40, feet - 12, 24, 8);
      return j.press(w, tall || two ? 24 : 10, key);
    }
  if (!w.solidAt(p.cx + 10, feet, 2, 120)) return j.press(w, 24, key);
  return go(key);
}
function ghodiRun(to: number, note: string): Step {
  const j = presser();
  return {
    policy: (w: World): Out => {
      j.reset(w);
      if (j.busy()) return j.next();
      const g = (w.entities.filter((e) => e instanceof Ghodi) as Ghodi[]).find((e) => e.on);
      if (g) return ghodiDrive(w, j, g);
      return go('R');
    },
    until: (w) => w.player.onGround && !w.flags.ghodi && w.player.x >= px(to),
    max: 6000,
    long: true,
    note,
  };
}

/** the bangle Dad is riding */
function ridden(w: World): Bangle | undefined {
  return (w.entities.filter((e) => e instanceof Bangle) as Bangle[]).find((b) => b.riding);
}
/** roll right in whatever bangle is to hand: full speed over glass and gaps, brake to a stop short of
 *  anything it can't pass, hop out there and carry on on foot to the next */
function bangleRun(to: number, note: string): Step {
  const j = presser();
  return {
    policy: (w: World): Out => {
      j.reset(w);
      if (j.busy()) return j.next();
      const p = w.player;
      const b = ridden(w);
      if (b) {
        // how far ahead is something it can't roll past?
        let d = 999;
        for (let k = 0; k <= 70; k += 2)
          if (w.solidAt(b.x + b.r - 1 + k, b.y - b.r + 4, 2, 2 * b.r - 10)) {
            d = k;
            break;
          }
        if (d < (b.vx * b.vx) / 680 + 12) {
          if (Math.abs(b.vx) > 14) return go(b.vx > 0 ? 'L' : 'R');
          return j.press(w, 18, 'R');
        }
        return go('R');
      }
      if (p.onGround) for (let dx = 1; dx <= 9; dx++) if (w.solidAt(p.x + p.w - 1 + dx, p.y + p.h - 14, 1, 8)) return j.press(w, 16, 'R');
      return go('R');
    },
    until: (w) => w.player.onGround && !ridden(w) && w.player.x >= px(to),
    max: 4000,
    long: true,
    note,
  };
}

/** the bowl Dad is in (or the next one ahead of him) */
function bowlOf(w: World): Bowl | undefined {
  const bs = w.entities.filter((e) => e instanceof Bowl) as Bowl[];
  return bs.find((b) => b.in) ?? bs.filter((b) => b.xR > w.player.cx).sort((a, b) => a.xL - b.xL)[0];
}
/** pump: push the way the marble is already carrying him (towards the bottom from a standstill) */
function pump(b: Bowl): Out {
  // both ways while it's low; once it's nearly rim-high, only on the rightward swings, so it's the right rim he clears
  if (b.speed >= -4) return go('R');
  const e = (b.speed * b.speed) / 2 + Bowl.G * b.R * (1 - Math.cos(b.phi));
  return go(e < 0.9 * Bowl.G * b.R * (1 - Math.cos(b.maxL)) ? 'L' : '');
}
/** walk in to the marble bowl ahead, pump it up and fly out over its right rim on to tile `to` */
function bowlOut(to: number, note: string): Step {
  const j = presser();
  return {
    policy: (w: World): Out => {
      j.reset(w);
      const b = bowlOf(w);
      if (b?.in) return pump(b);
      if (j.busy()) return j.next();
      const p = w.player;
      // up the steps to the rim
      if (p.onGround) for (let dx = 1; dx <= 9; dx++) if (w.solidAt(p.x + p.w - 1 + dx, p.y + p.h - 14, 1, 8)) return j.press(w, 16, 'R');
      return go('R');
    },
    until: (w) => w.player.onGround && w.player.x >= px(to) && !bowlOf(w)?.in,
    max: 4000,
    long: true,
    note,
  };
}

/** walk right to tile `to` with the tower of pots: start only once it has settled, keep a steady run,
 *  jump obstacles on the run, and wait short of a breeze unless it'll stay calm while you cross */
function potsWalk(to: number, note: string): Step {
  const j = presser();
  return {
    policy: (w: World): Out => {
      j.reset(w);
      if (j.busy()) return j.next();
      const p = w.player;
      const pots = w.entities.find((e) => e instanceof Pots) as Pots;
      const t = w.tick / 120;
      if (!p.onGround) return go('R');
      if (p.x >= px(to)) return go('');
      const calm = Math.abs(pots.th) < 0.08 && Math.abs(pots.om) < 0.3;
      // a breeze just ahead that would blow while we're in it: wait here for a long enough lull
      for (const b of pots.breezes) {
        const ahead = b.x0 - (p.x + p.w);
        if (ahead < -2 || ahead > 26) continue;
        const cross = (b.x1 - p.cx + 16) / 130 + 0.3;
        let blows = false;
        for (let k = 0; k <= cross * 20; k++) if (pots.blowing(b, t + k / 20)) blows = true;
        if (blows) return go('');
      }
      if (Math.abs(p.vx) < 5 && !calm) return go('');
      const feet = p.y + p.h;
      for (let dx = 1; dx <= 9; dx++) if (w.solidAt(p.x + p.w - 1 + dx, feet - 14, 1, 8)) return j.press(w, 16, 'R');
      if (!w.solidAt(p.x + p.w + 4, feet, 2, 120)) return j.press(w, 16, 'R');
      return go('R');
    },
    until: (w) => w.player.onGround && w.player.x >= px(to),
    max: 4000,
    long: true,
    note,
  };
}

// ------------------------------------------------------------------ Raipur
const all = <T>(w: World, C: new (...a: any[]) => T) => w.entities.filter((e) => e instanceof C) as T[];
/** seconds until a hornet swarm reaches Dad (undefined: none in the next 1.6 s) */
function swarmEta(w: World): number | undefined {
  const p = w.player;
  const t = w.tick / 120;
  for (let s = 0; s <= 1.6; s += 0.05)
    for (const sw of all(w, Swarm)) {
      const x = sw.xAt(t + s);
      if (x !== null && x - p.cx < 30 && x - p.cx > -22 && Math.abs(sw.floor - (p.y + p.h)) < 60) return s;
    }
  return undefined;
}
/** on the gedi: stalk right through the mud, full jumps at walls and gaps steering for the far side,
 *  and hands off before every landing. With `still`, stop dead in good time for hornets. */
function gediRun(to: number, note: string, still = false): Step {
  const j = presser();
  let seenWorld: World | null = null;
  let tx: number | null = null;
  return {
    policy: (w: World): Out => {
      if (seenWorld !== w) {
        seenWorld = w;
        tx = null;
      }
      j.reset(w);
      if (j.busy()) return j.next();
      const p = w.player;
      const feet = p.y + p.h;
      const up = !!w.flags.gedi;
      if (!p.onGround) {
        // hands off just before coming down, or it's off the stilts
        if (up && p.vy > 0 && w.solidAt(p.x, feet, p.w, 26)) return go('');
        if (tx !== null) return go(toward(w, tx, 3));
        return go(up && p.vy > 0 ? '' : 'R');
      }
      tx = null;
      const eta = still ? swarmEta(w) : undefined;
      if (eta !== undefined && eta < 1.0) return go('');
      for (let k = 1; k <= 10; k++)
        if (w.solidAt(p.x + p.w - 1 + k, feet - 10, 1, 6)) {
          if (eta !== undefined) return go('');
          tx = p.x + p.w + k + 14;
          return j.press(w, 40, 'R');
        }
      if (!w.solidAt(p.cx + 8, feet + 1, 2, 130)) {
        if (eta !== undefined) return go('');
        // where does the ground start again?
        let far = 0;
        for (let k = 12; k < 120; k += 2)
          if (w.solidAt(p.cx + k, feet + 1, 2, 30)) {
            far = k;
            break;
          }
        tx = p.cx + far + 9;
        return j.press(w, far > 50 ? 40 : 14, 'R');
      }
      return go('R');
    },
    until: (w) => w.player.onGround && w.player.x >= px(to) && !w.flags.gedi,
    max: 6000,
    long: true,
    note,
  };
}
/** Ghadi Chowk: stop short of each clock hand, work out (time only moves as we do) whether walking
 *  straight through would meet it, and if so jump on the spot to wind the clock on, and look again */
function ghadiRun(to: number, note: string): Step {
  const j = presser();
  let seenWorld: World | null = null;
  let until = -1;
  return {
    policy: (w: World): Out => {
      if (seenWorld !== w) {
        seenWorld = w;
        until = -1;
      }
      j.reset(w);
      if (j.busy()) return j.next();
      const p = w.player;
      if (!p.onGround) return go(p.cx < until ? 'R' : '');
      if (p.cx < until) return go('R');
      const hands = all(w, Hand);
      const h = hands.filter((q) => q.cx + q.len + 14 > p.cx).sort((a, b) => a.cx - a.len - (b.cx - b.len))[0];
      if (!h) return go('R');
      const zs = h.cx - h.len - 16;
      if (p.cx < zs - 3) return go('R');
      const end = h.cx + h.len + 16;
      let ok = true;
      for (let d = 0; d <= end - p.cx && ok; d += 2) for (const q of hands) if (q.g === h.g && q.hitsAt(h.g.t + d / 140, p.x + d, p.y, p.w, p.h)) ok = false;
      if (ok) {
        until = end;
        return go('R');
      }
      return j.press(w, 3, '');
    },
    until: (w) => w.player.onGround && w.player.x >= px(to),
    max: 9000,
    long: true,
    note,
  };
}
/** the mandi: pull each sack's cord, stand under it and ride the hill up, then walk (and hop) on up */
function riceRun(to: number, note: string): Step {
  const j = presser();
  return {
    policy: (w: World): Out => {
      j.reset(w);
      if (j.busy()) return j.next();
      const p = w.player;
      const feet = p.y + p.h;
      if (!p.onGround) return go('R');
      const sacks = all(w, Sack);
      if (sacks.some((s) => s.open && s.left > 0 && Math.abs(s.x - p.cx) < 70)) return go('');
      const s = sacks.filter((q) => !q.open && q.x > p.cx - 8 && q.x - p.cx < 230).sort((a, b) => a.x - b.x)[0];
      if (s && Math.abs(s.x - p.cx) > 2) return go(toward(w, s.x, 1));
      if (w.solidAt(p.x + p.w, feet - 8, 1, 6)) return j.press(w, 16, 'R');
      return go('R');
    },
    until: (w) => w.player.onGround && w.player.x >= px(to),
    max: 12000,
    long: true,
    note,
  };
}
/** top to top: jump for the next spinning top when it's in reach and going, steering for its crown;
 *  while waiting on one, hop to keep it up */
function topsRun(to: number, note: string): Step {
  const j = presser();
  let seenWorld: World | null = null;
  let aim: Top | null = null;
  return {
    policy: (w: World): Out => {
      if (seenWorld !== w) {
        seenWorld = w;
        aim = null;
      }
      j.reset(w);
      if (j.busy()) return j.next();
      const p = w.player;
      const tops = all(w, Top).sort((a, b) => a.x0 - b.x0);
      const mine = tops.find((t) => p.isRiding(t.solid));
      if (!p.onGround) {
        if (!aim) return go('R');
        // steer for its crown, allowing for the speed we're carrying
        const at = p.cx + p.vx * 0.12;
        return go(at < aim.x - 2 ? 'R' : at > aim.x + 2 ? 'L' : '');
      }
      aim = null;
      const next = tops.find((t) => t.x0 > p.cx + 14);
      if (!next || next.x0 - p.cx > 96) {
        // no top to make for: on to dry land (a full jump off the last one)
        if (mine) return p.x + p.w < mine.solid.x + mine.solid.w - 1 ? go('R') : j.press(w, 34, 'R');
        if (!w.solidAt(p.cx + 8, p.y + p.h + 1, 2, 60)) return go('');
        return go('R');
      }
      const dx = next.x - p.cx;
      const ready = next.down === 0 && next.s > 0.32;
      if (ready && dx >= 26 && dx <= 74) {
        aim = next;
        return j.press(w, dx > 54 || next.solid.y < p.y + p.h - 8 ? 36 : 20, 'R');
      }
      if (mine) {
        // waiting on a top: keep it spinning
        if (dx > 74 && p.x + p.w < mine.solid.x + mine.solid.w - 1) return go('R');
        if (mine.s < 0.62) return j.press(w, 3, '');
        return go('');
      }
      if (dx > 74 && w.solidAt(p.cx + 8, p.y + p.h + 1, 2, 60)) return go('R');
      return go('');
    },
    until: (w) => w.player.onGround && w.player.x >= px(to) && !all(w, Top).some((t) => w.player.isRiding(t.solid)),
    max: 9000,
    long: true,
    note,
  };
}
/** the sal forest: walk right; stop dead in good time for each hornet swarm (but not where a hawk
 *  will see the cocoon); jump the gaps between swarms */
function kosaRun(to: number, note: string): Step {
  const j = presser();
  let seenWorld: World | null = null;
  const m: { spot?: number } = {};
  return {
    policy: (w: World): Out => {
      if (seenWorld !== w) {
        seenWorld = w;
        m.spot = undefined;
      }
      j.reset(w);
      if (j.busy()) return j.next();
      const p = w.player;
      const feet = p.y + p.h;
      if (!p.onGround) return go('R');
      const eta = swarmEta(w);
      const hawks = all(w, Baaj);
      // would a hawk be over a cocoon sitting at x from s0 to s1 seconds from now?
      const seen = (x: number, s0: number, s1: number) => {
        for (let q = s0; q <= s1; q += 0.1) if (hawks.some((h) => Math.abs(h.xAt(Math.max(0, q)) - x) < 48)) return true;
        return false;
      };
      if (eta !== undefined) {
        if (m.spot !== undefined) {
          if (Math.abs(p.cx - m.spot) > 3 && eta > 0.42) return go(toward(w, m.spot, 2));
          return go('');
        }
        // pick somewhere we can reach in time, where no hawk will be over us while we're wrapped
        const t = w.tick / 120;
        const due = (x: number) => {
          for (let q = 0; q <= 3; q += 0.05) for (const sw of all(w, Swarm)) {
            const sx = sw.xAt(t + q);
            if (sx !== null && sx - x < 34 && sx - x > -22) return q;
          }
          return 9;
        };
        let best: number | undefined;
        for (let d = 0; d <= 220 && best === undefined; d += 12)
          for (const x of [p.cx + d, p.cx - d]) {
            if (best !== undefined || !w.solidAt(x, feet + 1, 2, 4)) continue;
            const walk = d / 140,
              hit = due(x);
            if (walk + 0.42 > hit) continue;
            if (!seen(x, walk + 0.25, hit + 0.4)) best = x;
          }
        m.spot = best ?? p.cx;
        return go(toward(w, m.spot, 2));
      }
      m.spot = undefined;
      if (!w.solidAt(p.cx + 9, feet + 1, 2, 60)) return j.press(w, 30, 'R');
      return go('R');
    },
    until: (w) => w.player.onGround && w.player.x >= px(to),
    max: 12000,
    long: true,
    note,
  };
}
/** the red ants: wait at each gap's edge till the bridge is whole, then run it */
function antRun(to: number, note: string): Step {
  return {
    policy: (w: World): Out => {
      const p = w.player;
      const cs = all(w, Chapda).sort((a, b) => a.g0 - b.g0);
      if (cs.some((c) => c.solid.collidable && p.isRiding(c.solid))) return go('R');
      if (!p.onGround) return go('R');
      const c = cs.find((q) => q.g0 > p.cx - 3);
      if (!c || c.g0 - p.cx > 9) return go('R');
      if (c.full) return go('R');
      return go(p.cx > c.g0 - 4 ? '' : toward(w, c.g0 - 5, 1));
    },
    until: (w) => w.player.onGround && w.player.x >= px(to),
    max: 12000,
    long: true,
    note,
  };
}

// ------------------------------------------------------------------ Bhopal
const XL2 = (tx: number) => (w: World) => w.player.x <= tx * 16;
/** the lake under (or just ahead of) Dad */
function lakeOf(w: World): Lake | undefined {
  const p = w.player;
  return (w.entities.filter((e) => e instanceof Lake) as Lake[]).find((l) => p.cx > l.x0 - 14 && p.cx < l.x1);
}
/** run right, taking a full running jump off every bank (and boat) and skipping across the water; with
 *  `clean`, tap jump at each touch so the skips cost nothing. Waits on the bank for a sailboat. */
function skipRun(to: number, note: string, clean = false): Step {
  const j = presser();
  return {
    policy: (w: World): Out => {
      j.reset(w);
      if (j.busy()) return j.next();
      const p = w.player;
      const feet = p.y + p.h;
      const l = lakeOf(w);
      if (!p.onGround) {
        if (clean && l && p.vy > 0 && feet >= l.y - 7 && feet < l.y && p.cx > l.x0) return j.press(w, 2, 'R');
        return go('R');
      }
      if (l && !w.solidAt(p.cx + 9, feet + 1, 2, 30) && p.cx < l.x0 + 4) {
        // at the bank: if a boat is tacking out there, go when it will be under our second touch
        const boat = boats(w).find((b) => b.solid.x > p.cx && b.xb < l.x1);
        if (boat) {
          const at = p.cx + 83 + 40;
          const bx = boat.xAt(w, 0.92);
          if (!(bx < at - 8 && bx + 30 > at + 8)) return go('');
        }
        return j.press(w, 40, 'R');
      }
      // off the end of a boat's deck (when the next boat, if there is one, will be where we come down)
      const mine = boats(w).find((b) => p.isRiding(b.solid));
      if (mine) {
        const end = mine.solid.x + 30 - p.w - 1;
        if (p.x < end - 1) return go('R');
        const nxt = boats(w).find((b) => b.solid.x > mine.solid.x + 40);
        if (nxt) {
          const at = p.cx + 83 + 40;
          const bx = nxt.xAt(w, 0.92);
          if (!(bx < at - 8 && bx + 30 > at + 8)) return go('');
        }
        return j.press(w, 40, 'R');
      }
      return go('R');
    },
    until: (w) => w.player.onGround && w.player.x >= px(to) && !lakeOf(w),
    max: 5000,
    long: true,
    note,
  };
}
const boats = (w: World) => w.entities.filter((e) => e instanceof Sailboat) as Sailboat[];
/** the jal tarang: at each of `plan`'s bowls (tile column, bounces wanted) get in, bounce that many
 *  times steering to stay over it, then steer on to the next thing */
function bowlsRun(plan: [number, number][], to: number, note: string): Step {
  const j = presser();
  let i = 0,
    world: World | null = null;
  return {
    policy: (w: World): Out => {
      j.reset(w);
      if (world !== w) {
        world = w;
        i = 0;
      }
      if (j.busy()) return j.next();
      const p = w.player;
      const feet = p.y + p.h;
      const all = w.entities.filter((e) => e instanceof Katori) as Katori[];
      let b: Katori | undefined;
      while (i < plan.length) {
        const bx = px(plan[i][0]) + 8;
        b = all.find((k) => Math.abs(k.x - bx) < 3);
        if (b && b.streak >= plan[i][1]) {
          i++;
          b = undefined;
          continue;
        }
        break;
      }
      if (!b) return go('R');
      if (!p.onGround) return go(toward(w, b.x, 1));
      if (b.dry) return go(toward(w, b.x - 24, 2));
      // in it (or level with it): hop
      if (Math.abs(p.cx - b.x) <= 2 && feet >= b.floor - 1) return j.press(w, 3, '');
      if (feet > b.floor + 2 && b.x - p.cx < 30) return j.press(w, 12, 'R');
      if (!w.solidAt(p.cx + 9, feet + 1, 2, 60)) return j.press(w, 10, 'R');
      return go(toward(w, b.x, 1));
    },
    until: (w) => w.player.onGround && w.player.x >= px(to),
    max: 6000,
    long: true,
    note,
  };
}
/** through one of Surma's stories: run, and jump the moment each thing he says is about to happen */
function taleRun(to: number, note: string): Step {
  const j = presser();
  return {
    policy: (w: World): Out => {
      j.reset(w);
      if (j.busy()) return j.next();
      const p = w.player;
      const feet = p.y + p.h;
      if (!p.onGround) return go('R');
      for (const m of w.entities.filter((e) => e instanceof Morph) as Morph[]) {
        const s = m.solid;
        if (!m.shown) continue;
        // on a plank over a drop: he's about to say it fell
        if (m.look === 'plank' && p.isRiding(s) && p.cx > s.x + 4) return j.press(w, 40, 'R');
        // a wall ahead (small or grown)
        if (m.look === 'stone' && s.y + s.h >= feet - 1 && s.y < feet - 2) {
          const d = s.x - (p.x + p.w);
          if (d >= 0 && d < 14) return j.press(w, feet - s.y > 20 ? 40 : 16, 'R');
        }
      }
      for (const t of w.entities.filter((e) => e instanceof Sher) as Sher[]) {
        const d = t.x - p.cx;
        if (t.live && d > 0 && d < 62) return j.press(w, 22, 'R');
      }
      if (!w.solidAt(p.cx + 9, feet + 1, 2, 60)) return j.press(w, 40, 'R');
      return go('R');
    },
    until: (w) => w.player.onGround && w.player.x >= px(to),
    max: 4000,
    long: true,
    note,
  };
}
/** the BHEL shop floor: wait under each crane magnet where it picks up, ride, steer right on being
 *  dropped; tap-hop the gaps under the spiked ones */
function craneRun(to: number, note: string): Step {
  const j = presser();
  let seenWorld: World | null = null;
  let last: Chumbak | null = null;
  return {
    policy: (w: World): Out => {
      if (seenWorld !== w) {
        seenWorld = w;
        last = null;
      }
      j.reset(w);
      if (j.busy()) return j.next();
      const p = w.player;
      const feet = p.y + p.h;
      const held = (w.entities.filter((e) => e instanceof Chumbak) as Chumbak[]).find((c) => c.stuck);
      if (held) last = held;
      if (!p.onGround) {
        // dropped by a crane: straight down. By a lift magnet: on to the wall beside it. A hop: on.
        return go(last && last.o.rail ? '' : 'R');
      }
      if (!held) last = null;
      if (w.flags.tawa)
        for (const c of w.entities.filter((e) => e instanceof Chumbak) as Chumbak[]) {
          if (c.o.spiked || c.hangs > 0) continue;
          const bx = c.o.rail ? c.o.rail[0] : c.x;
          if (bx < p.cx - 6 || bx - p.cx > 70) continue;
          return go(toward(w, bx, 2));
        }
      if (!w.solidAt(p.cx + 7, feet + 1, 2, 130)) return j.press(w, 10, 'R');
      return go('R');
    },
    until: (w) => w.player.onGround && w.player.x >= px(to) && !(w.entities.filter((e) => e instanceof Chumbak) as Chumbak[]).some((c) => c.stuck),
    max: 8000,
    long: true,
    note,
  };
}

/** through Bhimbetka: walk right, jump at each of `hands` (tile columns, in order) to change worlds,
 *  hop the painted bison, jump the gaps */
function caveRun(hands: number[], to: number, note: string): Step {
  const j = presser();
  let base = -1,
    world: World | null = null;
  return {
    policy: (w: World): Out => {
      j.reset(w);
      const sh = w.flags.shelter as Shelter;
      if (world !== w) {
        world = w;
        base = -1;
      }
      if (base < 0) base = sh.flips;
      if (j.busy()) return j.next();
      const p = w.player;
      const feet = p.y + p.h;
      if (!p.onGround) return go('R');
      if (sh.painted)
        for (const b of w.entities.filter((e) => e instanceof Bison) as Bison[]) {
          const d = b.x - p.cx;
          if (Math.abs(b.floor - feet) < 4 && d > 10 && d < 34 + (b.dir < 0 ? 10 : 0)) return j.press(w, 26, 'R');
        }
      const next = hands[sh.flips - base];
      if (next !== undefined) {
        const hx = px(next) + 8;
        if (Math.abs(p.cx - hx) <= 3) return j.press(w, 16, '');
        if (p.cx > hx) return go('L');
        if (hx - p.cx < 40) return go('R');
      }
      if (!w.solidAt(p.cx + 9, feet + 1, 2, 60)) return j.press(w, 40, 'R');
      return go('R');
    },
    until: (w) => w.player.onGround && w.player.x >= px(to),
    max: 5000,
    long: true,
    note,
  };
}

export const WEST_ACT_ROUTES: Record<string, (x: number) => Step[]> = {
  'rpr02-khet': (x) => [gediRun(x + 41.2, 'over the bund, the canal, the high bund, and the post in the last canal')],
  'rpr03-chowk': (x) => [ghadiRun(x + 43, 'stop, look, wind the clock on the spot, and through')],
  'rpr04-kothi': (x) => [riceRun(x + 37, 'a higher hill; then one that has to spread'), { hold: 'R', until: and(ground, X(x + 43)), max: 600 }],
  'rpr05-mela': (x) => [topsRun(x + 18.2, 'three tops, the middle one wandering'), topsRun(x + 38.2, 'three more, taller each time'), { hold: 'R', until: and(ground, X(x + 45)), max: 600 }],
  'rpr06-jungle': (x) => [kosaRun(x + 45, 'wrap up for the hornets, but never under a hawk')],
  'rpr07-saal': (x) => [antRun(x + 47, 'the long one; the island; the post')],
  'rpr08-dussehra': (x) => [
    ghadiRun(x + 12.5, 'the clock hand'),
    riceRun(x + 26.5, 'the rice for the wall'),
    topsRun(x + 44.2, 'the tops'),
    antRun(x + 61, 'the ants'),
  ],
  'bpl05-mehfil': (x) => [
    bowlsRun(
      [
        [x + 7, 1],
        [x + 10, 1],
        [x + 13, 1],
        [x + 20, 5],
        [x + 30, 5],
      ],
      x + 33.2,
      'bowl to bowl over the drop; five bounces up the wall; and the bowl on the block',
    ),
    { hold: 'R', until: and(ground, X(x + 39)), max: 600 },
  ],
  'bpl06-chowk': (x) => [taleRun(x + 43, 'tiger, bridge, roof, wall, ground: jump as he says each one')],
  'bpl07-karkhana': (x) => [craneRun(x + 47, 'the two cranes in relay, the lift, small hops under the spiked ones')],
  'bpl08-bhojtal': (x) => [
    caveRun([x + 2, x + 12.5], x + 14.5, 'painted for the bridge, and out again'),
    bowlsRun([[x + 17.4, 5]], x + 20.2, 'five bounces up the wall'),
    craneRun(x + 40.5, 'the crane over the drop'),
    { hold: 'R', until: X(x + 43.7), max: 600 },
    { hold: 'R', jump: 30, until: and(ground, (w) => w.player.y + w.player.h <= 192), max: 200, long: true, note: 'up the step' },
    { hold: 'R', until: X(x + 45.7), max: 100 },
    { hold: 'R', jump: 34, until: and(ground, (w) => w.player.y + w.player.h <= 160), max: 200, long: true, note: 'through the sitara' },
    { hold: 'R', until: and(ground, X(x + 57)), max: 1500 },
  ],
  'bpl02-jheel': (x) => [skipRun(x + 47.2, 'skip to the sailboat and on; then the island and the far bank')],
  'bpl03-shelters': (x) => [caveRun([x + 3, x + 20, x + 33.5], x + 45, 'painted for the first bridge, real for the slab, painted again for the last')],
  'bpl04-karchob': (x) => [
    { hold: 'R', until: X(x + 32.3), max: 900, note: 'along the floor to the low sitara' },
    { hold: 'L', jump: 30, until: and(ground, (w) => w.player.y + w.player.h <= 192), max: 200, long: true, note: 'back up on to the middle level' },
    { hold: 'L', until: XL2(x + 7.1), max: 900 },
    { hold: 'L', jump: 8, until: and(ground, XL2(x + 5.4)), max: 200, note: 'hop to the block' },
    { hold: 'L', until: XL2(x + 4.4), max: 100 },
    { hold: 'R', jump: 40, until: and(ground, (w) => w.player.y + w.player.h <= 144), max: 300, long: true, note: 'up to the top' },
    { hold: 'R', until: X(x + 39.2), max: 1200, note: 'the high sitara, and out along the top' },
    { hold: 'R', until: and(ground, X(x + 45)), max: 600 },
  ],
  'jai08-amer': (x) => [
    haathiOver(x + 12, x + 15.5, 'the elephant for a step over the wall'),
    bangleRun(x + 34.2, 'a bangle over the glass and the gap, out at the shutter'),
    ghodiRun(x + 49.5, 'the horse past the drum and the swords'),
    bowlOut(x + 67.2, 'and out of the last bowl'),
    { hold: 'R', until: and(ground, X(x + 71)), max: 600 },
  ],
  'jai07-udaan': (x) => [
    balloonFly(
      () => [
        [[330, 106]],
        [
          [px(x + 19) + 58, 214],
          [px(x + 27), 106],
        ],
        [[px(x + 50) + 10, 106]],
      ],
      x + 53,
      'low under the canopy, wait out the rocket, over the wall; then the tall wall and two rockets',
    ),
    { hold: 'R', until: and(ground, X(x + 61)), max: 600 },
  ],
  'jai06-mela': (x) => [ghodiRun(x + 45.5, 'drums, the long jump, swords, the stairs at a gallop, swords again')],
  'jai05-rasta': (x) => [bangleRun(x + 43.2, 'change bangles at the shutter, both gaps at speed, brake for the step')],
  'jai04-yantras': (x) => [bowlOut(x + 18.5, 'pump out of the first bowl'), bowlOut(x + 36.5, 'and the deeper one'), { hold: 'R', until: and(ground, X(x + 43)), max: 400 }],
  'jai03-zenana': (x) => [potsWalk(x + 39, 'up the zenana, crossing each breeze in a lull')],
  'jai02-show': (x) => {
    const st = (w: World) => w.flags.show as Strings;
    return [
      ...beatHop(st, px(x + 6) - 12, 'up the step', px(x + 6), px(13)),
      ...beatHop(st, px(x + 11) - 12, 'over the gap from the top of the step', px(x + 14), px(13)),
      { hold: 'R', until: (w) => w.player.onGround && w.player.y + w.player.h === px(15) && w.player.x >= px(x + 18), max: 400, note: 'down off it' },
      ...beatPass(st, px(x + 21) - 14, px(x + 23) + 2, 60, 'under the spiky beam'),
      ...beatHop(st, px(x + 27) - 12, 'the first of the double gap', px(x + 30)),
      ...beatHop(st, Math.min(px(x + 32) - 12, px(x + 31)), 'and the second, a beat later', px(x + 35)),
      { hold: 'R', until: and(ground, X(x + 39)), max: 600, note: 'off the stage' },
    ];
  },
  'gnr08-towers': (x) => [
    { hold: 'R', until: (w) => !!w.flags.bamboo, max: 300, note: 'grab the bamboo' },
    ...vaultFrom(px(x + 1), px(x + 8) - 60, 'on to the podium under the kite string'),
    beamClimb((w) => w.flags.glass as Sunbeam, [px(x + 8), px(x + 15), px(10)], px(x + 12), 'up the sunlight off the glass', onTop(px(5), px(x + 20) + 6)),
    { hold: 'R', until: (w) => w.player.onGround && w.player.y + w.player.h === px(15) && w.player.x >= px(x + 27), max: 600, note: 'off the sky garden' },
    garbaWalk(x + 46, 'through the riverfront garba'),
  ],
  'gnr07-sheri': (x) => [garbaWalk(x + 42, 'through the touching rings and the double ring')],
  'gnr06-sabarmati': (x) => [
    { hold: 'R', until: feathers(1), max: 400, note: 'a feather' },
    flapJump(1, px(x + 4) - 12, 'over the first stretch of river', (w) => w.player.onGround && w.player.x >= px(x + 11)),
    standAt(px(x + 11) + 3, 'back for the first feather on the bank'),
    { hold: 'R', until: (w) => (w.flags.feathers ?? 0) >= 2, max: 200, note: 'and the second' },
    flapJump(2, px(x + 14) - 12, 'over the wide stretch with two flaps', (w) => w.player.onGround && w.player.x >= px(x + 24)),
    standAt(px(x + 25) + 3, 'the feather by the peacock'),
    flapJump(1, px(x + 30) - 20, 'up the ghat', onTop(px(9), px(x + 30))),
    { hold: 'R', until: and(ground, X(x + 42)), max: 600, note: 'along and down' },
  ],
  'gnr05-pride': (x) => [
    lionWalk(x + 34, 'past the pride: hop the sleeper, wait at the gate, jump the lioness', [px(x + 33)]),
    { hold: 'R', until: and(ground, X(x + 42)), max: 600, note: 'off the rock and away' },
  ],
  'gnr04-hatchery': (x) => [
    waveWalk(x + 9.2, 'under the thorns'),
    throwUp(px(x + 10), px(9), 'thrown up on to the first walkway'),
    { hold: 'R', until: (w) => w.player.onGround && w.player.y + w.player.h === px(15) && w.player.x >= px(x + 18), max: 600, note: 'off the end' },
    waveWalk(x + 26, 'waves from both sides under the thorns'),
    throwUp(px(x + 26.5), px(9), 'thrown up on to the second walkway'),
    { hold: 'R', until: and(ground, X(x + 42)), max: 900, note: 'along and down' },
  ],
  'gnr03-shaft': (x) => {
    const bm = (i: number) => (w: World) => (w.flags.shaft as Sunbeam[])[i];
    return [
      { hold: 'R', until: X(x + 1), max: 300 },
      beamClimb(bm(0), [px(x) - 80, px(x + 4), px(15)], px(x + 1), 'up to the first storey', onTop(px(11), px(x + 8) + 6)),
      beamClimb(bm(1), [px(x + 8), px(x + 12), px(11)], px(x + 9.5), 'up to the second storey', onTop(px(7), px(x + 16) + 6)),
      beamClimb(bm(2), [px(x + 16), px(x + 21), px(7)], px(x + 17.5), 'up to the top', onTop(px(3), px(x + 24) + 6)),
      { hold: 'R', until: and(ground, X(x + 42)), max: 600, note: 'out and down the steps' },
    ];
  },
  'gnr02-terraces': (x) => [
    ...vaultFrom(px(x + 4) - 80, px(x + 4) - 26, 'under the low string'),
    ...vaultFrom(px(x + 15) - 76, px(x + 15) - 26, 'off the last of the concrete'),
    { hold: 'R', until: and(ground, X(x + 33)), max: 600, note: 'over the top and down' },
  ],
  'dmn08-diu': (x) => [
    { hold: 'R', until: X(x + 1), max: 600 },
    ferryRun((w) => w.flags.diuRaft as RopeFerry, x + 15.2, 14),
    { hold: 'R', until: X(x + 16.3), max: 300 },
    boatRun((w) => w.flags.diuBoat as PedalBoat, (w) => w.flags.diuLines as number[], x + 35.2),
    scaleRide((w) => w.flags.diuScale as Scale, x + 46, 160),
    { hold: 'R', until: (w) => w.player.onGround && w.player.x >= px(x + 60), max: 900 },
  ],

  'dmn07-hills': (x) => [brushRun((w) => w.flags.hillBrush as Brush, x + 33.2), { hold: 'R', until: and(ground, X(x + 36)), max: 300 }],

  'dmn06-loft': (x) => {
    const sc = (i: number) => (w: World) => (w.flags.scales as Scale[])[i];
    return [
      { hold: 'R', until: (w) => w.player.onGround && w.player.x >= px(x + 0.5), max: 600 },
      scaleRide(sc(0), x + 13, 160),
      scaleRide(sc(1), x + 29, 96),
      { hold: 'R', until: (w) => w.player.onGround && w.player.x >= px(x + 34), max: 600 },
    ];
  },

  'dmn05-tide': (x) => {
    const r = (i: number) => (w: World) => (w.flags.tideRafts as RopeFerry[])[i];
    return [ferryRun(r(0), x + 15.2), ferryRun(r(1), x + 29.2, 16), ferryRun(r(2), x + 44.2, 14), { hold: 'R', until: and(ground, X(x + 46)), max: 300 }];
  },

  'dmn04-dozer': (x) => [
    { hold: 'R', until: (w) => w.player.onGround && w.player.x >= px(x + 0.5), max: 600 },
    chainRide((w) => w.flags.dozerChain as PlankChain, x + 31, 64),
    { hold: 'R', until: (w) => w.player.onGround && w.player.x >= px(x + 38), max: 600 },
  ],

  'dmn02-channel': (x) => [
    { hold: 'R', until: X(x + 1), max: 600 },
    boatRun((w) => w.flags.channelBoat as PedalBoat, (w) => w.flags.lines as number[], x + 37.2),
    { hold: 'R', until: and(ground, X(x + 40)), max: 400 },
  ],
  'dmn03-dispatch': (x) => {
    const blocks = (w: World) => w.flags.dispatch as IceBlock[];
    const steam = (w: World) => w.flags.steam as { x: number; P: number };
    return [
      { hold: 'R', until: X(x + 1.4), max: 600 },
      hopAcross(x + 12.2, 'over the first blocks, salted ones fast'),
      {
        policy: (w: World): Out => {
          const b = blocks(w)[3];
          const st = steam(w);
          const t = ((w.tick / 120) % st.P);
          const p = w.player;
          if (!b.gone && st.P - t > 0.75 && p.onGround) return { move: 'R', jump: !w.input.jump };
          return go(toward(w, blocks(w)[2].cx, 2));
        },
        until: (w) => !w.player.onGround,
        max: 600,
        note: 'wait for the steam to puff and the new block to slide out',
      },
      hopAcross(x + 33.2, 'past the steam and over the rest'),
      { hold: 'R', until: and(ground, X(x + 36)), max: 300 },
    ];
  },

  'pnj08-parade': (x) => [paradeRun((w) => w.flags.bigParade as Parade, x + 41), { hold: 'R', until: and(ground, X(x + 44)), max: 400 }],

  'pnj07-flight': (x) => [
    { hold: 'R', until: X(x + 1), max: 600 },
    fly((w) => w.flags.flight as Parasail, (w) => w.flags.flightGates as Gap[], px(x + 39.6)),
    { hold: 'R', until: and(ground, X(x + 44)), max: 400 },
  ],

  'pnj06-table': (x) => {
    const t = (w: World) => w.flags.bigTable as Roulette;
    return [
      { hold: 'R', until: X(x + 1.8), max: 600 },
      chipRun(t, x + 10.2, 1.05),
      chipRun(t, x + 19.2, 1.05),
      chipRun(t, x + 28.2, 1.05),
      chipRun(t, x + 34.2, 0.9),
      { hold: 'R', until: and(ground, X(x + 36)), max: 300 },
    ];
  },

  'pnj05-climb': (x) => {
    const r = (i: number) => (w: World) => (w.flags.climb as Rope[])[i];
    return [
      { hold: 'R', until: X(x + 0.6), max: 600 },
      { hold: 'R', jump: 12, ticks: 12, note: 'up to the first palm' },
      { hold: 'R', until: and(ground, X(x + 4.4)), max: 200 },
      { ...bounce(r(0), px(x + 10.5), 34, 0), until: (w) => w.standing(r(1)(w).solid), note: 'bounce up to the frayed rope' },
      { ...bounce(r(1), px(x + 20.4), 24, 0), until: (w) => w.standing(r(2)(w).solid), note: 'and off it before it snaps' },
      { hold: 'R', until: and(ground, X(x + 33.2)), max: 400, note: 'along the top rope' },
      { hold: 'R', until: and(ground, X(x + 36)), max: 400 },
    ];
  },

  'pnj04-street': (x) => [
    { hold: 'R', until: X(x + 7.1), max: 600, note: 'walk past the first dog' },
    { hold: 'R', jump: 12, ticks: 12, note: 'a short hop over the pothole, landing short of the cat' },
    { hold: 'R', until: and(ground, X(x + 12.1)), max: 300 },
    { hold: 'R', jump: 30, ticks: 30, long: true, note: 'a long jump over the cat’s whole ring' },
    { hold: 'R', until: and(ground, X(x + 25.1)), max: 400, note: 'walk past the big dog' },
    { hold: 'R', jump: 12, ticks: 12, note: 'a short hop, short of the uncle' },
    { hold: 'R', until: and(ground, X(x + 36)), max: 400 },
  ],

  'pnj03-wall': (x) => {
    const j = presser();
    return [
      { hold: 'R', until: X(x + 1), max: 600 },
      {
        policy: (w: World): Out => {
          j.reset(w);
          if (j.busy()) return j.next();
          const p = w.player;
          const ball = w.flags.kick as Football;
          // meet the ball in the air: jump just before reaching it
          if (p.onGround && ball.kicks === 0 && ball.x - (p.x + p.w) <= 4) return j.press(w, 10, 'R');
          return go(ball.kicks === 0 ? 'R' : '');
        },
        until: (w) => (w.flags.kick as Football).kicks > 0,
        max: 600,
        note: 'a volley over the wall',
      },
      { hold: '', until: (w) => !!(w.flags.kick as Football).goals[0].done, max: 600, note: 'in!' },
      { hold: 'R', until: X(x + 8.2), max: 300 },
      { hold: 'R', jump: 14, ticks: 14, note: 'over the defenders' },
      { hold: 'R', until: and(ground, X(x + 33)), max: 600, note: 'through the goal' },
    ];
  },

  'pnj02-lane': (x) => {
    const j = presser();
    return [
      { hold: 'R', until: X(x - 1.6), max: 600 },
      { hold: 'R', jump: 12, ticks: 12, note: 'up the step' },
      { hold: 'R', until: and(ground, X(x + 0.6)), max: 200 },
      { hold: 'R', jump: 12, ticks: 12, note: 'up to her balcony' },
      { hold: 'R', until: and(ground, (w) => w.player.x + w.player.w >= px(x + 5) - 1), max: 200 },
      { hold: '', until: (w) => lane(w).a.live.some((q) => q.age < 0.2), max: 600, note: 'wait for her next word' },
      {
        policy: (w: World): Out => {
          j.reset(w);
          if (j.busy()) return j.next();
          const p = w.player;
          const q = lane(w).a.live.reduce((a, b) => (b.age < a.age ? b : a));
          const steer = toward(w, q.x + 20, 3);
          if (p.onGround && p.y + p.h === px(11)) return j.press(w, 12, 'R');
          return go(steer);
        },
        until: (w) => !!myBubble(w),
        max: 200,
        note: 'on to it, steering for its middle',
      },
      {
        policy: (w: World): Out => {
          j.reset(w);
          if (j.busy()) return j.next();
          const p = w.player;
          const mine = myBubble(w);
          // the end of the ride: step off on to her balcony
          if (mine && mine.x + 40 >= px(x + 24) - 6) return go('R');
          if (!p.onGround) return go('');
          // a sharp reply coming: jump high over it (the plain ones float through)
          for (const q of lane(w).b.live) {
            if (!q.sharp) continue;
            const dx = q.x - (p.x + p.w);
            if (dx >= 2 && dx <= 9) return j.press(w, 30, "");
          }
          return go('');
        },
        until: (w) => w.player.onGround && w.player.y + w.player.h === px(9) && w.player.x >= px(x + 24),
        max: 1400,
        long: true,
        note: 'ride across, hopping the sharp replies',
      },
      { hold: 'R', until: and(ground, X(x + 33)), max: 400 },
    ];
  },
};

export const WEST_ENDING_POLICIES: Record<string, Policy> = {
  utar(w, m, d) {
    const k = w.flags.utar as { g: Gedi; dry: number };
    const p = w.player;
    if (m.hold > 0) {
      return { move: 'R', jump: true };
    }
    if (!k.g.on && k.g.topples === 0) return go(toward(w, k.g.x0, 1));
    if (k.g.on && p.onGround && p.cx >= k.dry - 66 && p.cx < k.dry - 40 && !w.input.jump) {
      m.hold = 39;
      return { move: 'R', jump: true };
    }
    return go('R');
  },

  ghanta(w, m, d) {
    const k = w.flags.ghanta as { hour: () => number; spot: number };
    const p = w.player;
    const h = k.hour();
    if (m.hold > 0) {
      return { move: '', jump: true };
    }
    if (m.go) return go('R');
    if (Math.abs(p.cx - k.spot) > 7 && !(h < 0.3)) return go(toward(w, k.spot, 2));
    if (h < 0.3 && p.onGround) {
      m.go = 1;
      return go('R');
    }
    if (!p.onGround) return go('');
    if (12 - h > 1.7 && !w.input.jump) {
      m.hold = 2;
      return { move: '', jump: true };
    }
    return go(w.tick % 10 < 5 ? 'L' : 'R');
  },

  khisko(w, m, d) {
    const k = w.flags.khisko as { s: Sack; crate: { x: number; y: number }; wall: number };
    const p = w.player;
    const feet = p.y + p.h;
    if (m.hold > 0) {
      return { move: 'R', jump: true };
    }
    const jump = (n: number): Out => {
      if (w.input.jump) return go('R');
      m.hold = n - 1;
      return { move: 'R', jump: true };
    };
    if (w.flags.twist === 'far') {
      if (p.x + p.w > k.crate.x + 1) return go('L');
      return go('R');
    }
    if (w.flags.twist === 'placed') {
      // up on to the crate: its cord is over the middle of it
      if (p.onGround && feet > k.crate.y + 2) return jump(10);
      return go(toward(w, k.s.x, 1));
    }
    if (k.s.left > 0) return go('');
    if (!p.onGround) return go('R');
    if (w.solidAt(p.x + p.w, feet - 8, 1, 6)) return jump(16);
    return go('R');
  },

  lattu(w, m, d) {
    const top = w.flags.lattu as Top;
    const p = w.player;
    if (m.hold > 0) {
      return { move: 'R', jump: true };
    }
    if (p.isRiding(top.solid)) return go(toward(w, top.x, 5));
    if (!p.onGround) return go(toward(w, top.x, 2));
    const dx = top.x - p.cx;
    if (top.down > 0) return go(dx > 60 ? 'R' : '');
    if (dx > 52) return go('R');
    if (dx < 30) return go('L');
    if (w.input.jump) return go('');
    m.hold = 17;
    return { move: 'R', jump: true };
  },

  reel(w, m, d) {
    const k = w.flags.reel as { mat: number; end: number };
    const p = w.player;
    if (p.x > k.end + 1) return go('R');
    if (w.flags.twist === 'reeled' || Math.abs(p.cx - k.mat) < 3) return go('');
    return go(toward(w, k.mat, 2));
  },

  gud(w, m, d) {
    const k = w.flags.gud as { ants: Chapda; gx: number; edge: number };
    const p = w.player;
    if (m.hold > 0) {
      return { move: '', jump: true };
    }
    if (w.flags.twist === 'nogud') {
      if (!p.onGround) return go('');
      if (Math.abs(p.cx - k.gx) > 2) return go(toward(w, k.gx, 1));
      if (w.input.jump) return go('');
      m.hold = 30;
      return { move: '', jump: true };
    }
    if (k.ants.solid.collidable && p.isRiding(k.ants.solid)) return go('R');
    if (p.cx > k.edge + 4) return go('R');
    if (!p.onGround) return go('R');
    if (k.edge - p.cx > 9) return go('R');
    if (k.ants.full) return go('R');
    return go(p.cx > k.edge - 4 ? '' : toward(w, k.edge - 5, 1));
  },

  rath(w, m, d) {
    const p = w.player;
    if (m.hold > 0) {
      return { move: 'R', jump: true };
    }
    // never a step on the ground: jump the moment we land
    if (p.onGround && !w.input.jump) {
      m.hold = 39;
      return { move: 'R', jump: true };
    }
    return go(p.onGround ? '' : 'R');
  },

  khaali(w, m, d) {
    const k = w.flags.khaali as { small: Katori; big: Katori; vx: number };
    const p = w.player;
    const feet = p.y + p.h;
    if (m.hold > 0) {
      m.hold--;
      return { move: m.steer, jump: true };
    }
    const hop = (b: Katori): Out => {
      if (!p.onGround) return go(toward(w, b.x, 1));
      if (Math.abs(p.cx - b.x) > 2) return go(toward(w, b.x, 1));
      if (w.input.jump) return go('');
      m.hold = 2;
      m.steer = '';
      return { move: '', jump: true };
    };
    if (w.flags.twist === 'dry') return go(toward(w, d.x + 8, 1));
    if (w.flags.twist === 'tap') {
      if (feet <= 176 && p.cx > k.small.x + 30) return go(toward(w, k.vx, 1));
      if (k.small.streak >= 5) return go('R');
      if (p.cx > k.small.x + 20 && p.onGround) return go('L');
      return hop(k.small);
    }
    return hop(k.big);
  },

  paan(w, m, d) {
    const k = w.flags.paan as { s: Surma; shop: number };
    if (w.flags.twist === 'chewing') return go(toward(w, d.x + 8, 1));
    if (w.flags.carrying) return go(toward(w, k.s.x, 1));
    return go(toward(w, k.shop, 1));
  },

  rakhdo(w, m, d) {
    if (w.flags.tawaDown) return go('R');
    return go(toward(w, w.flags.stand as number, 1));
  },

  kissa(w, m, d) {
    const k = w.flags.kissa as { step: number; lake: Lake; bowl: Katori; mag: Chumbak };
    const p = w.player;
    const feet = p.y + p.h;
    if (m.hold > 0) {
      m.hold--;
      return { move: m.steer, jump: true };
    }
    const jump = (ticks: number, steer: Move): Out => {
      if (w.input.jump) return go(steer);
      m.hold = ticks - 1;
      m.steer = steer;
      return { move: steer, jump: true };
    };
    const edge = (dir: 1 | -1) => p.onGround && !w.solidAt(p.cx + dir * 9, feet + 1, 2, 30);
    if (w.flags.twist === 'open' && !m.back) {
      // finish the third skip on to the left bank first
      if (p.onGround && p.cx < k.lake.x0) m.back = 1;
      return go('L');
    }
    if (w.flags.twist === 'open' || k.step < 0) {
      // to the door: a running jump at the pond
      if (edge(1) && p.cx < k.lake.x0 + 4) return jump(40, 'R');
      return go('R');
    }
    if (k.step === 0) {
      if (k.mag.stuck || p.stun > 0) return go('');
      if (!p.onGround) return go('');
      if (Math.abs(p.cx - k.mag.x) > 2) return go(toward(w, k.mag.x, 1));
      const t = w.tick / 120;
      if (k.mag.onAt(t + 0.1) && k.mag.onAt(t + 0.5)) return jump(30, '');
      return go('');
    }
    if (k.step === 1) {
      if (!p.onGround) return go(toward(w, k.bowl.x, 1));
      if (Math.abs(p.cx - k.bowl.x) > 2) return go(toward(w, k.bowl.x, 1));
      return jump(3, '');
    }
    // three skips: just run off the right bank, leftwards
    return go('L');
  },

  ghat(w, m, d) {
    const g = w.flags.ghat as { lake: Lake; x0: number; x1: number };
    const p = w.player;
    if (w.flags.twist === 'wading') return go(toward(w, d.x + 8, 1));
    if (m.hold > 0) {
      m.hold--;
      return { move: 'R', jump: true };
    }
    if (p.onGround && p.cx < g.lake.x0 + 4 && !w.solidAt(p.cx + 9, p.y + p.h + 1, 2, 30)) {
      m.hold = 39;
      return { move: 'R', jump: true };
    }
    // over the pale water: let go, and sink
    if (p.cx > g.x0 + 6) return go('');
    return go('R');
  },

  haath(w, m, d) {
    const spots = w.flags.spots as { x: number; made: boolean }[];
    const sh = w.flags.shelter as Shelter;
    const p = w.player;
    if (m.hold > 0) {
      m.hold--;
      return { move: '', jump: true };
    }
    // which hand do we need next? painted at the painted wall, real at the boulder
    const k = !spots[0].made || (!sh.painted ? false : !spots[1].made && p.cx < spots[0].x + 20) ? 0 : 1;
    const s = spots[k];
    const need = k === 0 ? sh.painted : !sh.painted;
    if (!need) return go(k === 0 ? toward(w, spots[1].x, 2) : 'R');
    if (Math.abs(p.cx - s.x) > 2) return go(toward(w, s.x, 2));
    if (!s.made || !p.onGround || w.input.jump) return go('');
    m.hold = 15;
    return { move: '', jump: true };
  },

  gaanth(w, m, d) {
    const k = w.flags.knotAt as { x0: number; x1: number };
    const p = w.player;
    if (w.flags.twist === 'tied') return go('R');
    if (!m.turned && p.cx >= k.x0 + 30) m.turned = 1;
    return go(m.turned ? 'L' : 'R');
  },

  salaami(w, m, d) {
    const e = w.flags.lastHaathi as Elephant;
    const p = w.player;
    const gate = w.flags.gateX as number;
    if (m.j === undefined) m.j = presser();
    const j = m.j as ReturnType<typeof presser>;
    j.reset(w);
    if (j.busy()) return j.next();
    if (w.flags.twist === 'up') return go(toward(w, d.x + 8, 1));
    const parked = e.x + Elephant.W >= gate - 1;
    if (p.isRiding(e.solid)) return parked ? j.press(w, 8, 'L') : go('R');
    if (p.stun > 0 || !p.onGround) return go(p.y + p.h < px(7) ? 'R' : p.x + p.w > e.x ? 'L' : '');
    if (parked) {
      // behind her tail: stand at her trunk and wait for it
      if (p.x + p.w <= e.x + 1) return go(e.x - (p.x + p.w) > 4 ? 'R' : '');
      return go('L');
    }
    // not parked yet: lead her to the wall, hop back on to her, ride her in
    if (p.x + p.w < e.x) {
      // she's between us and the wall and has come away from it: over her
      if (e.x - (p.x + p.w) > 14) return go('R');
      return j.press(w, 26, 'R');
    }
    const at = gate - 14 - p.w;
    if (p.x < at - 2) return go('R');
    if (e.facing === 1 && e.gap(w) <= 26 && !e.moving) return j.press(w, 22, 'L');
    return go('');
  },

  palat(w, m, d) {
    const b = w.flags.lastBalloon as Balloon;
    const D = Math.round(d.x / 16);
    if (b.done) return go(toward(w, d.x + 8, 1));
    if (!b.riding) return go(toward(w, b.bx, 1));
    // over the tower on the high wind, then back on to it on the middle one
    if (m.past === undefined) m.past = 0;
    if (b.bx > px(D + 2) + 12) m.past = 1;
    if (!m.past) return balloonHold(w, b, 104);
    if (b.bx > px(D) + 12) return { move: '', jump: b.by + b.vy * 0.25 > 128 };
    return go('');
  },

  dulha(w, m, d) {
    const { g } = w.flags.dulha as { g: Ghodi };
    const p = w.player;
    if (m.j === undefined) m.j = presser();
    const j = m.j as ReturnType<typeof presser>;
    j.reset(w);
    if (j.busy()) return j.next();
    // lost the horse: back to its stand
    if (!g.on) return go(toward(w, g.x0, 1));
    void p;
    return ghodiDrive(w, j, g);
  },

  naap(w, m, d) {
    const b = w.flags.lastBangle as Bangle;
    const c = w.flags.coals as { x0: number; x1: number };
    if (b.gone > 0) return go('');
    if (!b.riding) return go(toward(w, b.x, 1));
    // small enough: on through the little doorway
    if (b.r <= 14.6) return go('R');
    // park it on the coals
    const mid = (c.x0 + c.x1) / 2;
    const stop = (b.vx * Math.abs(b.vx)) / 680;
    if (b.x + stop < mid - 3) return go('R');
    if (b.x + stop > mid + 3) return go('L');
    return go('');
  },

  shant(w, m, d) {
    const b = w.flags.lastBowl as Bowl;
    if (w.flags.twist === 'open') return go('');
    if (!b.in) {
      const p = w.player;
      if (p.onGround && !w.input.jump)
        for (let dx = 1; dx <= 9; dx++)
          if (w.solidAt(p.x + p.w - 1 + dx, p.y + p.h - 14, 1, 8)) {
            m.hold = 16;
            m.steer = 'R';
            return { move: 'R', jump: true };
          }
      return go('R');
    }
    // kill the swing: push against the slide; near the bottom, hands off
    if (Math.abs(b.speed) < 12) return go('');
    return go(b.speed > 0 ? 'L' : 'R');
  },

  toran(w, m, d) {
    const p = w.player;
    const T = w.flags.toran as { mark: number };
    const pots = w.entities.find((e) => e instanceof Pots) as Pots;
    if (w.flags.twist === 'open') return go(toward(w, d.x + 8, 1));
    // back to the start of the run, let it settle, then a straight run, stopping dead on the mark
    const start = T.mark - 152;
    if (m.run === undefined) m.run = 0;
    if (m.run === 0) {
      if (Math.abs(p.cx - start) > 2) return go(toward(w, start, 2));
      if (Math.abs(p.vx) > 1 || Math.abs(pots.th) > 0.03 || Math.abs(pots.om) > 0.1) return go('');
      m.run = 1;
    }
    if (m.run === 1) {
      if (p.cx < T.mark - 4) return go('R');
      m.run = 2;
      m.waited = 0;
    }
    // stopped: wait for the swing; if it didn't strike, go round again
    m.waited++;
    if (m.waited > 300) m.run = 0;
    return go('');
  },

  sutradhar(w, m, d) {
    const p = w.player;
    const D = Math.round(d.x / 16);
    if (w.flags.twist === 'done') return go(toward(w, d.x + 8, 1));
    if (w.flags.twist !== 'puppet') return go(toward(w, px(D - 15) + 8, 1));
    // work the puppet: over the gap and up the step to her door
    const pu = w.flags.puppet as Player;
    if (!pu.onGround || w.input.jump) return go(pu.onGround ? '' : 'R');
    const gap = px(D - 8) - (pu.x + pu.w),
      step = px(D - 5) - (pu.x + pu.w);
    if ((gap >= 2 && gap <= 8) || (step >= 0 && step <= 6)) {
      m.hold = 14;
      m.steer = 'R';
      return { move: 'R', jump: true };
    }
    return go('R');
  },

  herd(w, m, d) {
    const p = w.player;
    const cols = w.flags.herd.cols as { s: { x: number; y: number } & object }[];
    const D = Math.round(d.x / 16);
    if (w.flags.twist === 'top') return go(toward(w, d.x + 8, 1));
    if (!p.onGround) return go('R');
    const i = cols.findIndex((c) => p.isRiding(c.s as never));
    if (w.input.jump) return go('');
    if (i < 0) {
      if (p.x + p.w < px(D - 12) - 4) return go('R');
      m.hold = 12;
      m.steer = 'R';
      return { move: 'R', jump: true };
    }
    if (i < cols.length - 1) {
      if (p.x + p.w < cols[i + 1].s.x - 6) return go('R');
      m.hold = 14;
      m.steer = 'R';
      return { move: 'R', jump: true };
    }
    // the last candle: keep buying (hop in place) till it's near enough, then jump to the door
    if (cols[i].s.y - px(4) <= 50) {
      if (p.x + p.w < px(D) - 3) return go('R');
      m.hold = 30;
      m.steer = 'R';
      return { move: 'R', jump: true };
    }
    m.hold = 6;
    m.steer = '';
    return { move: '', jump: true };
  },

  pravesh(w, _m, d) {
    const p = w.player;
    const g = w.flags.pravesh as GarbaRing;
    const cx = d.x + 8;
    if (g.joined) {
      const th = w.flags.danceTh as number;
      if (th !== undefined && Math.abs(th - 1.5 * Math.PI) < 0.12 && !w.input.jump) return { move: '', jump: true };
      return go('');
    }
    // just short of the ring's left end; join when the gap there is wide
    const spot = cx - 92;
    if (Math.abs(p.cx - spot) > 1.5) return go(toward(w, spot, 1));
    if (w.input.jump || Math.abs(p.vx) > 5) return go('');
    const a0 = g.angle(0, w.tick / 120);
    for (let k = 0; k < 6; k++) {
      let dth = (((a0 + (2 * Math.PI * k) / 6 - Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      if (dth > Math.PI) dth -= 2 * Math.PI;
      if (Math.abs(dth) < 0.42) return go('');
    }
    return { move: '', jump: true };
  },

  kichad(w, m, d) {
    const p = w.player;
    const bag = w.entities.find((e) => e instanceof Feathers) as Feathers;
    const hedges = w.flags.hedges as number[];
    if (!p.onGround) return go('R');
    const next = hedges.find((h) => h + 14 > p.x);
    if (next === undefined) return go(toward(w, d.x + 8, 1));
    if (next + 2 - (p.x + p.w) > 12) return go('R');
    if (bag.n > 0) {
      if (w.input.jump) return go('');
      m.hold = 14;
      m.steer = 'R';
      return { move: 'R', jump: true };
    }
    // out of feathers at a hedge: back to this stretch's peacock and wait for the thunder
    const spot = (w.flags.mudSpots as FeatherPickup[]).filter((f) => f.x < next).pop()!;
    return go(toward(w, spot.x, 1));
  },

  safari(w, m, d) {
    const p = w.player;
    const jeep = w.flags.jeep as { s: { x: number }; started: boolean; done: boolean };
    const js = w.flags.jeep.s;
    const on = p.isRiding(js);
    if (jeep.done) return go(toward(w, d.x + 8, 1));
    if (on || (!p.onGround && jeep.started)) {
      // ride looking back at the lions; hop each branch straight up
      if (!p.onGround) return go('');
      if (p.facing > 0) return go('L');
      for (const bx of w.flags.branches as number[]) {
        const gap = bx - (p.x + p.w);
        if (gap >= 0 && gap <= 4 && !w.input.jump) {
          m.hold = 14;
          m.steer = '';
          return { move: '', jump: true };
        }
      }
      return go('');
    }
    if (!p.onGround) return go('R');
    for (const L of w.flags.safariLions as Lion[]) {
      const gap = L.x - 12 - (p.x + p.w);
      if (L.state === 'sleep' && gap >= 0 && gap <= 8) {
        m.hold = 10;
        m.steer = 'R';
        return { move: 'R', jump: true };
      }
    }
    const gap = js.x - (p.x + p.w);
    if (gap >= 0 && gap <= 6) {
      m.hold = 10;
      m.steer = 'R';
      return { move: 'R', jump: true };
    }
    return go('R');
  },

  milan(w, m, d) {
    const p = w.player;
    const M = w.flags.meet as number;
    if (w.flags.twist === 'top') return go(toward(w, d.x + 8, 1));
    if (!p.onGround) return go(p.y + p.h < px(3) - 4 ? toward(w, d.x + 8, 2) : '');
    // under the thorns hop every wave; at the fossil footprint wait for the two to meet
    if (Math.abs(p.cx - M) > 6 && waveSoon(w, 3) && !w.input.jump) {
      m.hold = 8;
      m.steer = toward(w, M, 1);
      return { move: m.steer, jump: true };
    }
    return go(toward(w, M, 1));
  },

  jali(w, m, d) {
    const p = w.player;
    const b = w.flags.jali as Sunbeam;
    const D = Math.round(d.x / 16);
    const t = w.tick / 120;
    if (w.flags.twist === 'top') return go(toward(w, d.x + 8, 1));
    if (b.solid.collidable && p.isRiding(b.solid)) {
      // hop each shadow as it slides down to you
      const gw = (b.o.gaps!.w / 2) * b.reach;
      for (const u of b.gapsAt(t)) {
        const near = b.tx + b.side * u * b.reach - gw - (p.x + p.w);
        if (near >= 0 && near <= 7 && !w.input.jump) {
          m.hold = 12;
          m.steer = 'R';
          return { move: 'R', jump: true };
        }
      }
      return go('R');
    }
    if (!p.onGround) return go('R');
    // from the end of the road, hop on to the low end while the bottom half is clear of shadows
    if (p.x + p.w < px(D - 10) - 3) return go('R');
    if (!b.gapsAt(t).every((u) => u < 0.55) || w.input.jump) return go('');
    m.hold = 10;
    m.steer = 'R';
    return { move: 'R', jump: true };
  },

  setu(w, _m, d) {
    const p = w.player;
    const D = Math.round(d.x / 16);
    const edge = px(D - 9),
      ledgeX = px(D - 13);
    if (w.flags.twist === 'laid' || w.flags.twist === 'over') return go(toward(w, d.x + 8, 1));
    if (w.flags.twist === 'ledge' || (p.onGround && p.y + p.h === 208 && p.cx > ledgeX)) {
      // to the edge, stand still, then a standing press lays the bamboo across
      const want = edge - p.w - 1;
      if (!p.onGround) return go('');
      if (Math.abs(p.x - want) > 1) return go(Math.abs(p.vx) > 25 && Math.abs(p.x - want) <= 5 ? '' : p.x < want ? 'R' : 'L');
      if (Math.abs(p.vx) > 1 || w.input.jump) return go('');
      return { move: '', jump: true };
    }
    // up on to the ledge with a hop from right in front of it (any further back and the pole vaults you)
    if (!p.onGround) return go(toward(w, ledgeX + 14, 2));
    if (p.x + p.w < ledgeX - 6) return go('R');
    if (w.input.jump) return go('');
    return { move: 'R', jump: true };
  },

  tipjetty(w, m, d) {
    const p = w.player;
    const planks = w.flags.planks as { c: number; s: { collidable: boolean } }[];
    if (w.flags.twist === 'end') return go(toward(w, d.x + 8, 1));
    if (!p.onGround) return go(toward(w, (m.aim as number) ?? d.x, 2));
    // the next plank (or the far end), and a hop to its middle from just short of it
    const next = planks.find((q) => q.c > p.cx + 10 && q.s.collidable);
    const aim = next ? next.c : d.x + 8;
    const onPlank = planks.some((q) => Math.abs(p.cx - q.c) < 17 && p.y + p.h === 236);
    const fromX = onPlank ? p.cx : aim - 44;
    if (!onPlank && p.cx < fromX - 2) return go('R');
    if (w.input.jump) return go('');
    m.aim = aim;
    m.hold = 12;
    m.steer = toward(w, aim, 2) || 'R';
    return { move: m.steer, jump: true };
  },

  paintwall(w, _m, d) {
    if (w.flags.twist === 'done') return go(toward(w, d.x + 8, 1));
    return go(toward(w, d.x - px(9), 2));
  },

  slidedoor(w, _m, d) {
    const p = w.player;
    if (w.flags.twist === 'skidding') return go('');
    const gap = d.x + 3 - (p.x + p.w);
    if (gap > 70) return go(p.onGround && p.vx > 60 && gap < 110 ? '' : 'R');
    const want = Math.max(8, Math.min(40, gap * 1.5));
    if (p.vx < want - 6) return go('R');
    if (p.vx > want + 6) return go('L');
    return go('');
  },

  drawbridge(w, m, d) {
    const p = w.player;
    const b = w.flags.bridge as { a: number; bottom: boolean };
    const D = Math.round(d.x / 16);
    const ropeX = px(D - 8) + 8;
    if (p.cx > px(D - 1)) return go(toward(w, d.x + 8, 1));
    if ((p as any).grip) {
      if (b.bottom && !w.input.jump) {
        m.hold = 10;
        m.steer = 'R';
        return { move: 'R', jump: true };
      }
      return go('');
    }
    if (!p.onGround) return go(b.a < 0.3 && p.cx > ropeX ? 'R' : toward(w, ropeX, 2));
    if (b.a < 0.3 && p.cx > ropeX - 6) return go('R');
    if (Math.abs(p.cx - (ropeX - 14)) > 2) return go(toward(w, ropeX - 14, 2));
    if (!w.input.jump) {
      m.hold = 24;
      m.steer = 'R';
      return { move: 'R', jump: true };
    }
    return go('');
  },

  flag(w, m, d) {
    const p = w.player;
    const tw = w.flags.twist;
    if (tw === 'deck') return go(toward(w, d.x + 8, 1));
    const pens = w.flags.pennants as { active: boolean; y: number; at: () => { x: number } }[];
    const poleX = pens[0].at().x;
    if ((p as any).grip) {
      if (p.y + p.h < 144 - 14 && !w.input.jump) {
        m.hold = 10;
        m.steer = 'R';
        return { move: 'R', jump: true };
      }
      return go('');
    }
    if (!p.onGround) return go('R');
    // to the end of the jetty, then jump for a pennant just starting up
    if (Math.abs(p.cx - (poleX - 30)) > 2) return go(toward(w, poleX - 30, 2));
    const low = pens.find((pn) => pn.active && pn.y < 222 && pn.y > 204);
    if (low && !w.input.jump) {
      m.hold = 12;
      m.steer = 'R';
      return { move: 'R', jump: true };
    }
    return go('');
  },

  customs(w, _m, d) {
    const q = (w.flags.queue as { cx: number; gone: boolean }[]).filter((o) => !o.gone);
    const front = (w.flags.front as number) ?? d.x - 10;
    if (w.flags.twist === 'open') return go(toward(w, d.x + 8, 1));
    if (!q.length) return go(toward(w, front, 2));
    const last = Math.min(...q.map((o) => o.cx));
    return go(toward(w, last - 20, 3));
  },
  coldstore(w, m, d) {
    const p = w.player;
    const lv = w.flags.lever as { x: number };
    const target = w.flags.twist === 'open' ? d.x + 8 : lv.x + 2;
    const dir = toward(w, target, 1);
    if (p.onGround && dir && !w.input.jump && w.solidAt(dir === 'R' ? p.x + p.w + 1 : p.x - 3, p.y + 2, 2, p.h - 4)) {
      m.hold = 16;
      m.steer = dir;
      return { move: dir, jump: true };
    }
    return go(dir || 'R');
  },

  decree(w, m, d) {
    const p = w.player;
    const z0 = d.x - px(14);
    if (p.cx < z0 - 24) return go('R');
    const near = d.x + 8 - p.cx < 70;
    if (!p.onGround) return go(near ? toward(w, d.x + 8, 1) : 'R');
    if (w.input.jump) return go('');
    if (near) {
      // the last hop, steered into the door
      m.hold = 10;
      return { move: toward(w, d.x + 8, 1), jump: true };
    }
    // hop only when no dancer will be under us on the way down: predict the hop tick by tick
    const dancers = w.flags.dancers as { x0: number; span: number; p: number }[];
    let x = p.x,
      vx = p.vx,
      feet = p.y + p.h,
      vy = -375,
      clear = true;
    for (let k = 1; k <= 60 && clear; k++) {
      const t = (w.tick + k) / 120;
      vx = Math.min(140, vx + 1500 / 120);
      x += vx / 120;
      const g = k <= 13 ? 1150 : 1750;
      if (k === 14 && vy < 0) vy *= 0.5;
      vy += g / 120;
      feet += vy / 120;
      if (feet >= 240 && k > 4) break;
      for (const dn of dancers) {
        const dx = dn.x0 + (Math.sin((t / dn.p) * Math.PI * 2) * 0.5 + 0.5) * dn.span;
        if (x < dx + 12 && x + p.w > dx - 2 && feet > 240 - 28) clear = false;
      }
    }
    // (the landing spot too: no dancer standing there)
    if (!clear) return go('');
    m.hold = 10;
    return { move: 'R', jump: true };
  },

  sandcastle(w, _m, d) {
    const c = w.flags.castle as { x: number; t: number; edge: number };
    const D = 0;
    void D;
    // go for it when it's just been finished; otherwise wait up the beach, out of the waves' reach
    if (w.flags.twist === 'built' && (c.t >= 2.8 || c.t < 0.3)) return go(toward(w, d.x + 8, 1));
    return go(toward(w, c.edge > 0 ? Math.min(c.x, w.player.cx) - 0 : w.player.cx, 2) === 'R' ? '' : toward(w, d.x - px(9), 2));
  },

  gangway(w, m, d) {
    const p = w.player;
    const dk = w.flags.deck as { y: number; phase: number };
    const tw = w.flags.twist;
    if (m.hold > 0) return { move: 'R', jump: true };
    if (tw === 'aboard' || tw === 'plank' || !p.onGround) return go('R');
    // on the jetty: to its edge, then hop on just as the boat starts down from its highest
    const edge = d.x - px(11) - 11;
    if (p.x < edge - 1) return go('R');
    if (p.onGround && dk.phase > 0.93 && !w.input.jump) {
      m.hold = 9;
      return { move: 'R', jump: true };
    }
    return go('');
  },

  hammock(w, m, d) {
    const p = w.player;
    const h = w.flags.hammock as { x0: number; x1: number; n: number };
    const mid = (h.x0 + h.x1) / 2;
    if (w.flags.twist === 'top') return go(toward(w, d.x + 8, 1));
    if (m.hold > 0) return { move: m.steer, jump: true };
    if (p.onGround && p.y + p.h === 240) {
      // a full jump on to it from just short of it
      if (Math.abs(p.cx - (h.x0 - 14)) > 3) return go(toward(w, h.x0 - 14, 2));
      if (w.input.jump) return go('');
      m.hold = 30;
      m.steer = 'R';
      return { move: 'R', jump: true };
    }
    // in the air: over the middle, and on the way up from the second bounce, across to the platform
    if (h.n >= 2 && p.vy < 0) return go('R');
    if (h.n >= 2 && p.y + p.h < 112) return go('R');
    return go(toward(w, mid, 3));
  },

  clockhand(w, _m, d) {
    const h = w.flags.hand as { a: number; on: boolean };
    if (w.flags.twist === 'ledge') return go(toward(w, d.x + 8, 1));
    // riding: step off at twelve
    if (h.on) return go(h.a > Math.PI * 2 - 0.1 || h.a < 0.3 ? 'R' : '');
    // wait in the street where the hand sweeps past six
    return go(toward(w, d.x - px(3), 1));
  },

  penalty(w, _m, d) {
    const p = w.player;
    const ball = w.flags.spot as Football;
    if (w.flags.twist === 'dived') return go('R');
    // run through the ball from its left: he dives, then walk in
    if (ball.kicks === 0) return go(p.cx < ball.cx + 6 ? 'R' : 'L');
    return go(toward(w, d.x - px(6), 3));
  },

  poder(w, _m, d) {
    // wait by the house until the aunty has gone back in with her bread, then in before the door shuts
    if (w.flags.twist === 'open') return go('R');
    return go(toward(w, d.x - 40));
  },
};

/** the rooms' own routes (each long stage's acts and door are added by longRun) */
export function westSolutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  const gossip = (w: World) => (w.entities.find((e) => e instanceof Gossip) as Gossip).live;
  S['PNJ-02'] = [
    { hold: 'R', jump: 12, ticks: 12, note: 'on to the balcão' },
    { hold: 'R', until: and(ground, (w) => w.player.x + w.player.w >= px(7) - 1), max: 200 },
    { hold: '', until: (w) => gossip(w).some((q) => q.age < 0.25), max: 400, note: 'she says something' },
    { hold: 'R', jump: 10, ticks: 10, note: 'stand on it' },
    { hold: '', until: ground, max: 120 },
    { hold: '', until: (w) => w.player.y + w.player.h <= 95, max: 900, note: 'it floats up past the roof' },
    { hold: 'R', until: and(ground, X(13.4)), max: 200 },
    { hold: 'R', until: and(ground, X(31)), max: 600 },
  ];
  lengthen('PNJ-02', 0, []);
  S['PNJ-03'] = [
    { hold: 'R', until: (w) => (w.flags.goals ?? 0) >= 1, max: 600, note: 'run into the ball: it rolls into the goal' },
    { hold: 'R', until: and(ground, X(31)), max: 600, note: 'through the lifted net' },
  ];
  lengthen('PNJ-03', 0, []);
  S['PNJ-04'] = [
    { hold: 'R', until: X(16.6), max: 600, note: 'walk past the sleeping dog' },
    { hold: 'R', jump: 12, ticks: 12, note: 'over the flowerpot' },
    { hold: 'R', until: and(ground, X(21.2)), max: 300 },
    { hold: 'R', jump: 12, ticks: 12, note: 'a short hop over the pothole: short of the cat' },
    { hold: 'R', until: and(ground, X(31)), max: 400 },
  ];
  lengthen('PNJ-04', 0, []);
  {
    const r = (i: number) => (w: World) => (w.flags.ropes as Rope[])[i];
    S['PNJ-05'] = [
      { hold: 'R', until: X(1.6), max: 200 },
      { hold: 'R', jump: 12, ticks: 12, note: 'up the step' },
      { hold: 'R', until: and(ground, X(3.6)), max: 200 },
      { hold: 'R', jump: 12, ticks: 12, note: 'up to the palm' },
      { hold: 'R', until: and(ground, X(17.2)), max: 400, note: 'across the first rope without stopping' },
      { ...bounce(r(1), px(24.4), 34, 0), until: (w) => w.player.onGround && w.player.y + w.player.h === px(4), note: 'sag deep, then the rope throws you up on to the ledge' },
      { hold: 'R', until: and(ground, X(32)), max: 400 },
    ];
    lengthen('PNJ-05', 0, []);
  }
  {
    const t = (w: World) => w.flags.table as Roulette;
    S['PNJ-06'] = [
      { hold: 'R', until: X(4.8), max: 300, note: 'to the edge of the deck' },
      chipRun(t, 13.2, 1.25),
      chipRun(t, 25.2, 1.25),
      { hold: 'R', until: and(ground, X(31)), max: 300 },
    ];
    lengthen('PNJ-06', 0, []);
  }
  S['PNJ-07'] = [
    fly((w) => (w.flags.sails as Parasail[])[0], (w) => w.flags.gates as Gap[], px(26.4)),
    { hold: 'R', until: and(ground, X(31)), max: 400 },
  ];
  lengthen('PNJ-07', 0, []);
  S['PNJ-08'] = [paradeRun((w) => w.flags.parade as Parade, 30), { hold: 'R', until: and(ground, X(31)), max: 300 }];
  lengthen('PNJ-08', 0, []);
  S['DMN-02'] = [
    boatRun((w) => (w.flags.boats as PedalBoat[])[0], () => [px(15)], 27.2),
    { hold: 'R', until: and(ground, X(31)), max: 300 },
  ];
  lengthen('DMN-02', 0, []);
  S['DMN-03'] = [{ hold: 'R', until: X(3.2), max: 300 }, hopAcross(27.2, 'block to block before they melt'), { hold: 'R', until: and(ground, X(31)), max: 300 }];
  lengthen('DMN-03', 0, []);
  S['DMN-04'] = [chainRide((w) => w.flags.chain as PlankChain, 22, 112), { hold: 'R', until: (w) => w.player.onGround && w.player.x >= px(31), max: 600 }];
  lengthen('DMN-04', 0, []);
  S['DMN-05'] = [ferryRun((w) => (w.flags.rafts as RopeFerry[])[0], 27.2), { hold: 'R', until: and(ground, X(31)), max: 300 }];
  lengthen('DMN-05', 0, []);
  S['DMN-06'] = [scaleRide((w) => w.flags.scale as Scale, 18, 160), { hold: 'R', until: (w) => w.player.onGround && w.player.x >= px(31), max: 600 }];
  lengthen('DMN-06', 0, []);
  S['DMN-07'] = [brushRun((w) => (w.flags.brushes as Brush[])[0], 27.2), { hold: 'R', until: and(ground, X(31)), max: 300 }];
  lengthen('DMN-07', 0, []);
  S['DMN-08'] = [{ hold: 'R', until: X(3.2), max: 300 }, hopAcross(27.2, 'over the melting moat'), { hold: 'R', until: and(ground, X(31)), max: 300 }];
  lengthen('DMN-08', 0, []);
  S['GNR-02'] = [
    { hold: 'L', until: (w) => !!w.flags.bamboo, max: 400, note: 'back for the bamboo' },
    ...vaultFrom(68, 116, 'up on to the first roof'),
    ...vaultFrom(178, 274, 'across the tin, plant on the concrete'),
    { hold: 'R', until: and(ground, X(31)), max: 600, note: 'over the top and down' },
  ];
  lengthen('GNR-02', 0, []);
  S['GNR-03'] = [
    beamClimb((w) => (w.flags.beams as Sunbeam[])[0], [0, px(10), px(15)], px(5), 'up the sunbeam to the gallery', onTop(px(9), px(12) + 6)),
    { hold: 'R', until: and(ground, X(31)), max: 600, note: 'along the gallery and down' },
  ];
  lengthen('GNR-03', 0, []);
  S['GNR-04'] = [
    waveWalk(9.2, 'under the thorns, hopping the waves'),
    throwUp(px(10), px(9), 'thrown up on to the walkway'),
    { hold: 'R', until: and(ground, X(31)), max: 900, note: 'along the walkway and down' },
  ];
  lengthen('GNR-04', 0, []);
  S['GNR-05'] = [
    lionWalk(28, 'hop the sleeping lion, wait at the gate looking back, up the rocks', [px(27)]),
    { hold: 'R', until: and(ground, X(31.5)), max: 600, note: 'off the rocks' },
  ];
  lengthen('GNR-05', 0, []);
  S['GNR-06'] = [
    { hold: 'R', until: feathers(1), max: 400, note: 'pick up a feather' },
    flapJump(1, px(9) - 12, 'over the lotus pond: jump, and flap at the top', (w) => w.player.onGround && w.player.x >= px(16.2)),
    { hold: 'R', until: feathers(1), max: 400, note: 'another feather' },
    flapJump(1, px(20) - 20, 'up on to the terrace', onTop(px(10), px(20))),
    { hold: 'R', until: and(ground, X(31)), max: 600 },
  ];
  lengthen('GNR-06', 0, []);
  S['GNR-07'] = [garbaWalk(31, 'through both ends of both rings, each in a gap')];
  lengthen('GNR-07', 0, []);
  S['GNR-08'] = [bumpRun(28.6, 'across the scrolling chart, up the candles and over the halts'), { hold: 'R', until: and(ground, X(31)), max: 300 }];
  lengthen('GNR-08', 0, []);
  {
    const st = (w: World) => (w.flags.strings as Strings[])[0];
    S['JAI-02'] = [
      ...beatHop(st, px(10) - 12, 'over the first gap on a beat', px(13)),
      ...beatHop(st, px(17) - 12, 'and the second', px(19)),
      ...beatPass(st, px(21) - 14, px(23) + 2, 100, 'under the spiky beam on the long beat'),
      { hold: 'R', until: and(ground, X(31)), max: 600, note: 'off the stage' },
    ];
    lengthen('JAI-02', 0, []);
  }
  S['JAI-03'] = [potsWalk(28.5, 'along the Hawa Mahal with the pots, through the breeze in a lull'), { hold: 'R', until: and(ground, X(31)), max: 300 }];
  lengthen('JAI-03', 0, []);
  S['JAI-04'] = [bowlOut(20.5, 'in to the marble bowl, pump, and out over the far rim'), { hold: 'R', until: and(ground, X(28)), max: 400 }];
  lengthen('JAI-04', 0, []);
  S['JAI-05'] = [bangleRun(27, 'roll over the glass and the gap in the bangle, stop at the shutter and hop out'), { hold: 'R', until: and(ground, X(28)), max: 400 }];
  lengthen('JAI-05', 0, []);
  S['JAI-06'] = [ghodiRun(26.2, 'gallop: hop the drum, jump the gap, turn round to wait out the swords'), { hold: 'R', until: and(ground, X(28)), max: 400 }];
  lengthen('JAI-06', 0, []);
  S['JAI-07'] = [balloonFly(() => [[[330, 106]]], 20, 'up through the winds, over the wall on the high one, past the rocket, and down'), { hold: 'R', until: and(ground, X(28)), max: 600 }];
  lengthen('JAI-07', 0, []);
  S['BPL-02'] = [skipRun(18.5, 'a running jump off the bank and skip across'), { hold: 'R', until: and(ground, X(28)), max: 600 }];
  lengthen('BPL-02', 0, []);
  S['BPL-03'] = [caveRun([8, 21.5], 26, 'in to the painting past the boulder, hop the bison, out again before the painted wall'), { hold: 'R', until: and(ground, X(28)), max: 600 }];
  lengthen('BPL-03', 0, []);
  S['BPL-04'] = [
    { hold: 'R', until: X(4.7), max: 400 },
    { hold: 'R', jump: 30, until: and(ground, (w) => w.player.y + w.player.h <= 192), max: 200, long: true, note: 'up the step first' },
    { hold: 'R', until: X(6.7), max: 100 },
    { hold: 'R', jump: 34, until: and(ground, (w) => w.player.y + w.player.h <= 160), max: 200, long: true, note: 'through the sitara on to the top' },
    { hold: 'R', until: and(ground, X(28)), max: 1500, note: 'along the top, down, and through the panel' },
  ];
  lengthen('BPL-04', 0, []);
  S['BPL-05'] = [bowlsRun([[12, 5]], 15.2, 'in to the bowl, five bounces, and on to the wall'), { hold: 'R', until: and(ground, X(28)), max: 600 }];
  lengthen('BPL-05', 0, []);
  S['BPL-06'] = [taleRun(28, 'jump when he says the bridge fell; over the wall before it grows')];
  lengthen('BPL-06', 0, []);
  S['BPL-07'] = [craneRun(28, 'wait under the crane, ride it over, a small hop under the spiked one')];
  lengthen('BPL-07', 0, []);
  S['BPL-08'] = [skipRun(26.2, 'skip to the first boat, a running jump off it to the second, and on to the bank'), { hold: 'R', until: and(ground, X(28)), max: 600 }];
  lengthen('BPL-08', 0, []);
  S['RPR-02'] = [gediRun(27.2, 'through the mud on stilts, a full jump up the bund, off it gently')];
  lengthen('RPR-02', 0, []);
  S['RPR-03'] = [ghadiRun(28, 'stop before each hand; jump on the spot till the way through is clear')];
  lengthen('RPR-03', 0, []);
  S['RPR-04'] = [riceRun(20.5, 'pull the cord, ride the hill up, walk on to the wall'), { hold: 'R', until: and(ground, X(28)), max: 600 }];
  lengthen('RPR-04', 0, []);
  S['RPR-05'] = [topsRun(22.2, 'top to top, no standing about'), { hold: 'R', until: and(ground, X(28)), max: 600 }];
  lengthen('RPR-05', 0, []);
  S['RPR-06'] = [kosaRun(28, 'stand still for the hornets, jump the gap between them')];
  lengthen('RPR-06', 0, []);
  S['RPR-07'] = [antRun(28, 'wait for the whole bridge, then run it')];
  lengthen('RPR-07', 0, []);
  S['RPR-08'] = [gediRun(27.2, 'stilts and hornets: stand still in the mud for them; up the bund between swarms', true)];
  lengthen('RPR-08', 0, []);
  S['JAI-08'] = [haathiOver(18, 20.5, 'lead the elephant to the wall, hop on her back, and up'), { hold: 'R', until: and(ground, X(28)), max: 600 }];
  lengthen('JAI-08', 0, []);












}
