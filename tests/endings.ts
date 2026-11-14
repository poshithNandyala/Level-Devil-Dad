// How a careful player beats each ending at the door (src/game/levels/endings.ts).
// Each policy runs every tick and returns what to press; it reads only what a player could see
// (the flags each ending keeps up to date describe what's on screen).
import type { World } from '../src/game/world';
import type { Door } from '../src/game/entities/basics';
import { DT } from '../src/game/constants';

export type Move = 'L' | 'R' | '';
export type Out = { move: Move; jump: boolean };
export interface Mem {
  /** ticks left of the current jump press, and which way to steer meanwhile */
  hold: number;
  steer: Move;
  s: number;
  t: number;
  n: number;
  [k: string]: any;
}
export const freshMem = (): Mem => ({ hold: 0, steer: '', s: 0, t: 0, n: 0 });

const px = (t: number) => t * 16;
const FLOOR = 240;

/** start a jump held for `ticks` (it needs the button up for a tick first) */
function jump(w: World, m: Mem, ticks: number, steer: Move): Out {
  if (w.input.jump) return { move: steer, jump: false };
  m.hold = ticks - 1;
  m.steer = steer;
  return { move: steer, jump: true };
}
const toward = (w: World, x: number, slack = 2): Move => {
  const c = w.player.cx;
  return c < x - slack ? 'R' : c > x + slack ? 'L' : '';
};
const doorCx = (d: Door) => d.x + 8;
import { swimPolicy, kicker } from './moves';
import { WEST_ENDING_POLICIES } from './west';
const go = (move: Move): Out => ({ move, jump: false });

type Policy = (w: World, m: Mem, d: Door) => Out;

export const ENDING_POLICIES: Record<string, Policy> = {
  dabbacode(w) {
    const codes = w.flags.codes as { x: number; code: string }[];
    const mine = codes.find((o) => o.code === w.flags.code)!;
    return go(toward(w, mine.x + 8, 1));
  },

  lightwell(w, m, d) {
    const p = w.player;
    const D = Math.round(d.x / 16);
    if (!m.k) m.k = kicker({ xL: px(D - 9), xR: px(D - 6), roofY: px(2), exit: 'R' });
    const tw = w.flags.twist;
    if (tw === 'street') return p.onGround && p.x < px(D - 8.4) ? go('R') : m.k(w);
    if (tw === 'roof') return go('R');
    // down the well: hug the right wall, then the left past the spikes, then the right again
    if (p.onGround) return go(toward(w, doorCx(d)));
    const feet = p.y + p.h;
    return go(feet < 125 ? 'R' : feet < 176 ? 'L' : 'R');
  },

  local(w, m, d) {
    const p = w.player;
    // never stop: hop the basket and the pillar, run in at the door
    if (p.onGround && w.solidAt(p.x + p.w + 1, p.y + 2, 14, p.h - 4)) return jump(w, m, 12, 'R');
    return go(p.cx < d.x + 8 ? 'R' : '');
  },

  footsteps(w, m, d) {
    const p = w.player;
    const prints = (w.flags.prints ?? []) as { x: number; t: number }[];
    const LIFE = 288;
    const x1 = d.x - px(1);
    if (w.flags.twist === 'wait') return go('R');
    const live = prints.filter((f) => w.tick - f.t < LIFE - 30);
    const on = live.find((f) => Math.abs(f.x - p.cx) < 8);
    // in the air: steer for the target, letting go early (he keeps drifting)
    if (!p.onGround) return go(m.tx !== undefined && p.cx < m.tx - 9 ? 'R' : '');
    if (p.cx > x1 - 2) return go(toward(w, doorCx(d)));
    const next = live.filter((f) => f.x > p.cx + 20).sort((a, b) => a.x - b.x)[0];
    // standing on a print (or on the shore): settle, then hop for the next one, or for the far shore
    if (on && Math.abs(on.x - p.cx) > 2) return go(on.x > p.cx ? 'R' : 'L');
    if (!on && p.cx < d.x - px(13) + 2) {
      // the shore: walk out on to the first print when it's there
      const first = live[0];
      return go(first && first.x < d.x - px(13) + 14 ? toward(w, first.x) : '');
    }
    const target = next ? next.x : p.cx > x1 - 60 ? x1 + 12 : undefined;
    if (target === undefined) return go('');
    m.tx = target;
    return jump(w, m, 9, 'R');
  },

  pushoff(w, m, d) {
    const p = w.player;
    const k = w.flags.kayak as { state: string; solid: { x: number; y: number; w: number } };
    const aboard = w.standing(k.solid as never);
    if (k.state === 'beached') return go('R');
    if (k.state === 'afloat' && !aboard) {
      if (p.onGround && !m.j) {
        m.j = 1;
        return jump(w, m, 10, 'R');
      }
      return go(toward(w, k.solid.x + 17, 3));
    }
    if (aboard && k.state === 'afloat') return go('');
    return go(toward(w, doorCx(d)));
  },

  safetystop(w, m, d) {
    const p = w.player;
    // up the rock and in
    if (!m.sw) {
      if (!p.swimming) {
        const wall = p.onGround && !!w.solidAt(p.x + p.w + 1, p.y + 2, 4, p.h - 4);
        return wall ? jump(w, m, 14, 'R') : go('R');
      }
      const [lx, ky] = w.flags.knot as [number, number];
      m.sw = swimPolicy([
        { x: lx - 6, y: ky, tx: 4, ty: 4, wait: (w2) => w2.flags.twist === 'ok' },
        { x: d.x - 62, y: 200, tx: 4, yFirst: false },
        { x: d.x - 62, y: 120, tx: 4, ty: 30 },
      ]);
    }
    if (p.swimming) return m.sw(w);
    // out of the water after the stop: on to the deck and in
    if (w.flags.twist === 'ok' && (p.onGround || p.vy < 0 || p.y < 176)) return go(toward(w, doorCx(d)));
    return m.sw(w);
  },

  knock(w, m, d) {
    const p = w.player;
    if (w.flags.twist === 'open') return go(toward(w, doorCx(d)));
    if (Math.abs(p.cx - doorCx(d)) > 3) return go(toward(w, doorCx(d), 1));
    return p.onGround ? jump(w, m, 8, '') : go('');
  },

  loading(w, m, d) {
    const p = w.player;
    const tw = w.flags.twist,
      tip = w.flags.barTip as number;
    const x0 = d.x - px(7);
    if (p.x > d.x - 2) return go(toward(w, doorCx(d)));
    if (!p.onGround) return go('R');
    if (p.x + p.w < x0 - 2 && (tw === 'idle' || p.x + p.w < x0 - px(2.5))) return go('R');
    if (tw === 'idle') return go('');
    if (tw === 'stalled') return p.x + p.w >= tip - 14 ? jump(w, m, 10, 'R') : go('R');
    if (tw === 'lost') return go('L');
    return go(p.x + p.w < tip - 12 ? 'R' : '');
  },

  reflection(w, m, d) {
    const p = w.player;
    const [g0, g1] = w.flags.gap as [number, number];
    const mid = (g0 + g1) / 2;
    const edge = d.x - px(4);
    if (!p.onGround) {
      m.air = (m.air ?? 0) + 1;
      return { move: toward(w, mid, 2), jump: m.air < 22 };
    }
    m.air = 0;
    if (p.x + p.w < edge - 1) return go('R');
    return jump(w, m, 1, 'R');
  },

  glider(w, m, d) {
    const p = w.player;
    const edge = d.x - px(12);
    if (w.flags.twist === 'landed') return go(toward(w, doorCx(d)));
    if (!p.onGround) {
      m.air = (m.air ?? 0) + 1;
      return { move: 'R', jump: m.air < 24 };
    }
    m.air = 0;
    if (p.x + p.w < edge - 3) return go('R');
    const ph = w.tick % 312;
    return ph >= 168 && ph <= 182 ? jump(w, m, 1, 'R') : go('');
  },

  trapdoor(w, m, d) {
    const p = w.player;
    const c = d.x + 8;
    if (Math.abs(p.cx - c) > 2 || Math.abs(p.vx) > 4) return go(toward(w, c, 1));
    return p.onGround ? jump(w, m, 8, '') : go('');
  },

  token(w, m, d) {
    const p = w.player;
    const mx = d.x - px(4);
    if (w.flags.twist === 'open') {
      if (p.x + p.w < mx + 18 && p.onGround && p.x + p.w >= mx - 10) return jump(w, m, 10, 'R');
      return go(p.x + p.w < mx - 10 ? 'R' : toward(w, doorCx(d)));
    }
    if (p.stun > 0) {
      m.s = 0;
      return go('');
    }
    const gap = mx - (p.x + p.w);
    if (m.s === 1) return go('R');
    if (gap > 12) return go('R');
    if (Math.abs(p.vx) > 2) return go('');
    if (gap <= 0) return go('L');
    if (w.flags.tokenN === 7 && w.flags.tokenT <= 12) {
      m.s = 1;
      return go('R');
    }
    return go('');
  },

  bull(w, m, d) {
    const p = w.player;
    const tw = w.flags.twist,
      bx = w.flags.bullX as number,
      bw = w.flags.bullW as number;
    if (tw === 'gone' || (tw === 'back' && bx + bw < p.x - 2)) return go(toward(w, doorCx(d)));
    if (!p.onGround) return go('');
    if (tw === 'charge' && p.x - (bx + bw) < 26 && p.x - (bx + bw) > -4) return jump(w, m, 24, '');
    if (tw === 'back' && bx - (p.x + p.w) < 30 && bx - (p.x + p.w) > -4) return jump(w, m, 24, '');
    if (tw === 'pen' || tw === 'snort' || tw === 'charge') return go(p.x < d.x - px(5) ? 'R' : '');
    if (tw === 'dazed') return go(bx - (p.x + p.w) < 48 ? 'L' : '');
    return go('');
  },

  catch(w, _m, d) {
    if (w.flags.twist === 'open') return go(toward(w, doorCx(d)));
    if (w.flags.twist === 'wait') return go('R');
    return go(toward(w, w.flags.ballX as number, 2));
  },

  rangoli(w, m, d) {
    const p = w.player;
    const x0 = d.x - 60;
    if (!p.onGround) return { move: 'R', jump: m.hold > 0 };
    if (p.cx < x0 - 3) return go('R');
    return jump(w, m, 20, 'R');
  },

  tips(w, _m, d) {
    const tw = w.flags.twist;
    if (tw === 'creak' || tw === 'falling') return go('L');
    return go(toward(w, doorCx(d)));
  },

  shuffle(w, m, d) {
    const p = w.player;
    const tw = w.flags.twist;
    if (tw === 'idle') return go('R');
    if (tw !== 'pick' || p.stun > 0) return go('');
    const real = (w.flags.realX as number) + 8;
    const dir = toward(w, real, 1);
    if (p.onGround && dir) {
      for (const fx of w.flags.fakeXs as number[]) {
        const ahead = dir === 'R' ? fx + 3 - (p.x + p.w) : p.x - (fx + 13);
        const between = dir === 'R' ? fx < real : fx > real;
        if (between && ahead < 30 && ahead > 3) return jump(w, m, 18, dir);
      }
    }
    return go(dir);
  },

  mirror(w, m, d) {
    const p = w.player;
    if (p.onGround) for (const sx of w.flags.spikes as number[]) if (p.x + p.w >= sx - 8 && p.x < sx) return jump(w, m, 14, 'R');
    return go(toward(w, doorCx(d)));
  },

  lamp(w, _m, d) {
    const p = w.player;
    const sx = d.x - px(3);
    if (p.x + p.w < sx - 6) return go('R');
    if (w.flags.twist === 'lit' && w.flags.litFor < 0.12) return go('R');
    if (p.x + p.w >= sx - 2 && p.x + p.w < sx + 8 && w.flags.twist === 'dark') return go('L');
    return go(p.x + p.w > sx ? 'R' : '');
  },

  bells(w, m, d) {
    const p = w.player;
    if (w.flags.twist === 'open') return go(toward(w, doorCx(d)));
    if (p.x <= d.x - px(7)) return go('R');
    if (Math.abs(p.vx) > 2 || !p.onGround) return go('');
    return (w.tick + 1) % 96 === 0 ? jump(w, m, 8, '') : go('');
  },

  mime(w, m, d) {
    const p = w.player;
    const cl = w.flags.line as number;
    if (!p.onGround) return { move: 'R', jump: m.hold > 0 };
    if (p.cx > cl + 4) return go(toward(w, doorCx(d)));
    if (p.cx < cl - 36) return go('R');
    return jump(w, m, 26, 'R');
  },

  fakewin(w, _m, d) {
    const tw = w.flags.twist;
    if (tw === 'party') return go('');
    if (tw === 'run' || tw === 'landed') return go('R');
    return go(toward(w, doorCx(d)));
  },

  revolve(w, _m, d) {
    const p = w.player;
    if (w.flags.twist === 'gap') return go('R');
    return go(p.x + p.w < d.x - 1 ? 'R' : '');
  },

  pull(w, m, d) {
    const p = w.player;
    const gx = d.x + 1;
    if (w.flags.twist === 'open') return go('R');
    if (p.x + p.w < gx - 1) return go('R');
    m.n++;
    return go(m.n % 6 < 3 ? 'L' : '');
  },

  wrap(w, m, d) {
    const p = w.player;
    const wallX = d.x - px(2);
    if (w.flags.twist === 'through') return go(toward(w, doorCx(d)));
    if (p.x + p.w >= wallX - 1) m.s = 1;
    return go(m.s ? 'L' : 'R');
  },

  invisible(w, m, d) {
    const p = w.player;
    if (p.onGround) for (const mx of w.flags.mats as number[]) if (p.x + p.w >= mx - 6 && p.cx < mx + 2) return jump(w, m, 12, 'R');
    if (!p.onGround) return { move: 'R', jump: m.hold > 0 };
    return go(toward(w, doorCx(d)));
  },

  cctv(w, m, d) {
    const p = w.player;
    const [camX] = w.flags.cam as [number, number];
    const bush = (w.flags.cover as number[])[0];
    const g = w.flags.beamX as number,
      left = w.flags.beamLeft as boolean;
    const D = camX - p.cx;
    if (m.s === 0) {
      // wait outside the sweep until the beam is heading away from us, well ahead
      if (p.x < d.x - px(13.2)) return go('R');
      if (!left && camX - g < D - 50) m.s = 1;
      return go('');
    }
    if (m.s === 1) {
      // into the bush
      if (p.cx < bush + 14) return go('R');
      m.s = 2;
      return go('');
    }
    if (m.s === 2) {
      // let it sweep past behind us, then run for it
      if (left && camX - g > 1.11 * D + 40) m.s = 3;
      return go('');
    }
    return go(toward(w, doorCx(d)));
  },

  key(w, m, d) {
    const p = w.player;
    const cx = w.flags.crateX as number;
    if (w.flags.twist === 'open') return go(toward(w, doorCx(d)));
    const onSack = p.onGround && p.y + p.h === FLOOR - 16;
    if (!p.onGround) return { move: m.s === 1 && m.hold > 6 ? 'R' : '', jump: m.hold > 0 };
    if (onSack) {
      if (Math.abs(p.cx - (cx + 10)) > 2) return go(toward(w, cx + 10, 1));
      m.s = 2;
      return jump(w, m, 26, '');
    }
    if (p.x + p.w < cx - 3) return go('R');
    if (Math.abs(p.vx) > 2) return go('');
    m.s = 1;
    return jump(w, m, 16, 'R');
  },

  swing(w, m, d) {
    const p = w.player;
    const a = w.flags.swingA as number,
      v = w.flags.swingV as number;
    const [sx] = w.flags.seat as [number, number];
    const bank = d.x - px(12);
    if (p.x > d.x - 4) return go(toward(w, doorCx(d)));
    if (w.flags.twist === 'riding') {
      if (a < 0.86) return go('');
      m.s = 2;
      return jump(w, m, 10, 'R');
    }
    if (!p.onGround) return { move: m.s === 2 ? 'R' : toward(w, sx + 16, 3), jump: m.hold > 0 };
    if (p.x + p.w < bank - 1) return go('R');
    if (a < -0.93 && v < 0) {
      m.s = 1;
      return jump(w, m, 16, 'R');
    }
    return go('');
  },

  mirchi(w, _m, d) {
    return go(toward(w, doorCx(d) + 4));
  },

  speed(w, _m, d) {
    const p = w.player;
    const [z0, z1] = w.flags.zone as [number, number];
    if (w.flags.twist === 'timing' && p.x + p.w > z0 + 20 && p.x + p.w < z1 && (w.flags.zoneT as number) < 1.9) return go('');
    void z1;
    return go(toward(w, doorCx(d)));
  },

  monkey(w, m, d) {
    const p = w.player;
    const [a, b] = w.flags.pit as [number, number];
    const tw = w.flags.twist;
    const target = tw === 'done' ? doorCx(d) : tw === 'door' ? doorCx(d) : (w.flags.monkeyX as number);
    const dir = toward(w, target, 2);
    if (!p.onGround) return { move: m.steer, jump: m.hold > 0 };
    if (dir === 'R' && p.x + p.w >= a - 5 && p.x < a) return jump(w, m, 10, 'R');
    if (dir === 'L' && p.x <= b + 5 && p.x + p.w > b) return jump(w, m, 10, 'L');
    if (tw === 'hop') return go('');
    return go(dir);
  },

  dejavu(w, m, d) {
    const p = w.player;
    const [a] = w.flags.pit as [number, number];
    if (!p.onGround) return { move: 'R', jump: m.hold > 0 };
    if (p.x + p.w >= a - 6 && p.x < a) return jump(w, m, 10, 'R');
    return go(toward(w, doorCx(d)));
  },

  whirlwind(w, _m, d) {
    const p = w.player;
    const [c0, c1] = w.flags.column as [number, number];
    const mid = (c0 + c1) / 2;
    if (p.x + p.w > c0) return go(toward(w, mid, 2));
    if (p.x + p.w < c0 - 4) return go('R');
    // go in when the tin sheets will be out at the sides as we rise past them
    const c = Math.cos((((w.tick + 70) * DT) / 1.3) * Math.PI * 2);
    void d;
    return go(Math.abs(c) > 0.85 ? 'R' : '');
  },

  otp(w, m, d) {
    const p = w.player;
    if (w.flags.twist === 'open') return go(toward(w, doorCx(d)));
    const [bx0] = w.flags.blocks as [number, number];
    if (p.x < bx0 - px(1.6)) return go('R');
    const want = (w.flags.otp as number[])[w.flags.otpI as number];
    const c = bx0 + want * 16 + 8;
    if (!p.onGround) return { move: '', jump: m.hold > 0 };
    if (Math.abs(p.cx - c) > 1 || Math.abs(p.vx) > 3) return go(toward(w, c, 0.5));
    return jump(w, m, 8, '');
  },

  biryani(w, m, d) {
    const p = w.player;
    const [hx] = w.flags.handi as [number, number];
    if (!p.onGround) return { move: 'R', jump: m.hold > 0 };
    if (p.x + p.w >= hx - 16 && p.x < hx) return jump(w, m, 12, 'R');
    return go(toward(w, doorCx(d) + 4));
  },

  gravity(w, m, d) {
    const p = w.player;
    const [g0] = w.flags.roofGap as [number, number];
    if (w.flags.twist !== 'flipped') return go('R');
    if (!p.onGround) return { move: m.s ? 'R' : '', jump: m.hold > 0 };
    if (p.x + p.w >= g0 - 5 && p.x < g0) {
      m.s = 1;
      return jump(w, m, 12, 'R');
    }
    return go(toward(w, doorCx(d)));
  },

  tiny(w, m, d) {
    const p = w.player;
    if (w.flags.twist === 'small') return go(p.onGround ? 'R' : '');
    const [bx] = w.flags.biscuit as [number, number];
    if (!p.onGround) return { move: '', jump: m.hold > 0 };
    if (Math.abs(p.cx - (bx + 4)) > 1 || Math.abs(p.vx) > 3) return go(toward(w, bx + 4, 0.5));
    return jump(w, m, 22, '');
  },

  cannon(w, m, d) {
    const tw = w.flags.twist;
    if (tw === 'empty') return go('R');
    if (tw === 'loaded') {
      const a = w.flags.cannonA as number;
      return a > 0.97 && a < 1.03 ? jump(w, m, 2, '') : go('');
    }
    return go(w.player.onGround ? toward(w, doorCx(d)) : '');
  },

  backdoor(w, m, d) {
    const p = w.player;
    const cx = w.flags.crate as number;
    if (p.x >= d.x - 1 && p.onGround) return go('L');
    if (!p.onGround) return { move: m.steer, jump: m.hold > 0 };
    if (p.y + p.h <= FLOOR - 64) return go('R');
    if (p.y + p.h === FLOOR - 16) {
      if (p.cx < cx + 8) return go('R');
      if (Math.abs(p.vx) > 2) return go('');
      return jump(w, m, 26, 'R');
    }
    if (p.x + p.w < cx - 8) return go('R');
    if (Math.abs(p.vx) > 2) return go('');
    return jump(w, m, 14, 'R');
  },

  slowmo(w, m, d) {
    const p = w.player;
    if (!p.onGround) return { move: 'R', jump: m.hold > 0 };
    if (p.x + p.w > d.x - 6) return go(toward(w, doorCx(d)));
    const near = (w.flags.goons as number[] | undefined)?.some((g) => g - (p.x + p.w) < 64 && g + 12 > p.x - 2);
    return near ? jump(w, m, 26, 'R') : go('R');
  },

  bollywood(w, m, d) {
    const p = w.player;
    if (w.flags.twist === 'open') return go(toward(w, doorCx(d)));
    const [s0, s1] = w.flags.spot as [number, number];
    if (p.cx < (s0 + s1) / 2 - 8) return go('R');
    const seq: ('L' | 'R' | 'J')[] = ['L', 'R', 'L', 'R', 'J'];
    const want = seq[w.flags.danceI as number];
    m.t++;
    if (!p.onGround) return go('');
    if (m.t % 6 >= 2) return go('');
    if (want === 'J') return jump(w, m, 2, '');
    return go(want);
  },

  kabaddi(w, _m, d) {
    const p = w.player;
    const [c0] = w.flags.court as [number, number];
    const hold = p.x + p.w >= c0 - 6;
    return { move: toward(w, doorCx(d)), jump: hold };
  },

  dahihandi(w, m, d) {
    const p = w.player;
    const tiers = w.flags.tiers as [number, number, number][];
    if (!p.onGround) {
      const k = m.target as number;
      const t = tiers[k];
      return { move: t ? toward(w, t[0] + t[2] / 2, 2) : '', jump: m.hold > 0 };
    }
    const on = tiers.findIndex((t) => Math.abs(p.y + p.h - t[1]) <= 1 && p.x + p.w > t[0] && p.x < t[0] + t[2]);
    if (on === 2) {
      m.target = 3;
      return Math.abs(p.cx - (d.x + 8)) > 3 ? go(toward(w, d.x + 8, 1)) : jump(w, m, 26, '');
    }
    const next = on + 1;
    const t = tiers[next];
    m.target = next;
    const tc = t[0] + t[2] / 2;
    if (on < 0) {
      if (p.x + p.w < t[0] - 4) return go('R');
      return jump(w, m, 10, 'R');
    }
    if (Math.abs(p.cx - tc) > 6) return go(toward(w, tc, 2));
    return jump(w, m, 16, '');
  },

  credits(w, m, d) {
    const p = w.player;
    const lines = (w.flags.lines ?? []) as [number, number, number][];
    if (!p.onGround) return { move: m.steer, jump: m.hold > 0 };
    const on = lines.find((l) => p.y + p.h === l[1] && p.x + p.w > l[0] && p.x < l[0] + l[2]);
    if (!on) {
      // on the ground: wait where the first lane rises
      return go(toward(w, d.x - 96, 3));
    }
    const above = lines.find((l) => l[1] < on[1] - 20 && l[1] > on[1] - 44 && l[0] > on[0] + 8);
    if (above) {
      if (p.x < above[0] - 3) return go('R');
      return jump(w, m, 16, 'R');
    }
    // the top lane: stand under the door and ride up into it
    if (on[0] > d.x - 48) return go(toward(w, d.x + 2, 2));
    return go('');
  },
};
Object.assign(ENDING_POLICIES, WEST_ENDING_POLICIES);
