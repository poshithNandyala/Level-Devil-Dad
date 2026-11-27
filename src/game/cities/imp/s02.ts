// IMP-02 Ngaa Gaanba (Net Cast): a fisher on the lake throws his round net at YOU, and he throws at where you
// WILL be, not where you are: he reads your walk. Keep walking and the net lands on you; stand still and the next
// one lands on you too. When he winds up, change what you are doing: a walker stops, a stander moves. The act's
// fisher reads your jumps the same way: he winds up as you take off and the net lands where a full leap lands, so
// pull back in the air and land short.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, folk } from './entities';
import { FL, lake, since, taraScript } from './common';
import { lines as L, NPC } from './lines';

/** the throw: wind-up (he reads you), flight, the net closing on the ground, gathering it back in */
export const NET = { windup: 0.6, flight: 0.5, closing: 0.45, gather: 1.2, r: px(1.25) };

export interface FisherState {
  t0: number;
  /** 'idle' before Dad arrives; then the cycle */
  phase: 'idle' | 'windup' | 'flight' | 'closing' | 'gather';
  /** tick the current phase began */
  p0: number;
  /** where the net will land / has landed (px, centre) */
  target: number;
  /** where he reads from: 'walk' (position + speed) or 'leap' (he winds up when you take off and aims at a full leap) */
  reads: 'walk' | 'leap';
  throws: number;
}

/** a fisher in his boat behind the mats between columns c0 and c1; he throws while Dad is between them */
export function fisher(w: World, key: string, c0: number, c1: number, boatC: number, reads: FisherState['reads'], cause: string, stillCause: string) {
  const st: FisherState = { t0: -1, phase: 'idle', p0: 0, target: 0, reads, throws: 0 };
  w.flags[key] = st;
  // the leap reader is quicker: he winds up as you take off and the net comes down as a full leap lands (0.65 s)
  const D = reads === 'leap' ? { windup: 0.25, flight: 0.4 } : { windup: NET.windup, flight: NET.flight };
  const dur = (p: FisherState['phase']) => (p === 'windup' ? D.windup : p === 'flight' ? D.flight : p === 'closing' ? NET.closing : NET.gather);
  const set = (w2: World, p: FisherState['phase']) => {
    st.phase = p;
    st.p0 = w2.tick;
  };
  /** he reads Dad: where will he be when the net comes down? */
  const aim = (w2: World) => {
    const p = w2.player;
    const lead = st.reads === 'leap' ? px(5.6) * Math.sign(p.vx || 1) : p.vx * (D.windup + D.flight);
    st.target = p.x + p.w / 2 + lead;
  };
  const net = w.add(
    new Rig(0, FL - 40, NET.r * 2, 40, {
      layer: 4,
      cause,
      inset: 2,
      live: () => st.phase === 'closing',
      tick: (r, w2) => {
        const p = w2.player;
        if (st.phase === 'idle') return;
        const t = since(w2, st.p0);
        if (st.phase === 'gather' && t >= dur('gather')) {
          if (p.x < px(c1) && (st.reads === 'walk' || !p.onGround)) {
            aim(w2);
            set(w2, 'windup');
            w2.sfx('swish', px(boatC), FL - 60);
          }
        } else if (st.phase === 'windup' && t >= dur('windup')) {
          // he committed when he raised the bundle: the net goes where he read you then
          set(w2, 'flight');
          st.throws++;
        } else if (st.phase === 'flight' && t >= dur('flight')) {
          set(w2, 'closing');
          w2.sfx('splash', st.target, FL);
        } else if (st.phase === 'closing' && t >= dur('closing')) set(w2, 'gather');
        r.x = st.target - NET.r;
        // the net is a thing of the ground: whoever is under it when it comes down is caught, standing or in the air
        r.hazard!.cause = st.reads === 'walk' && Math.abs(p.vx) < 1 && p.onGround ? stillCause : cause;
      },
      paint: (ctx, r, w2) => {
        if (st.phase === 'idle' || st.phase === 'gather') return;
        const t = since(w2, st.p0);
        const cx = st.target;
        if (st.phase === 'windup') {
          // a faint ring on the water where he is looking, growing as he winds up
          ctx.strokeStyle = `rgba(240,240,220,${0.25 + 0.5 * (t / NET.windup)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(cx, FL - 1, NET.r * (0.4 + 0.6 * (t / NET.windup)), 3, 0, 0, Math.PI * 2);
          ctx.stroke();
          return;
        }
        if (st.phase === 'flight') {
          // the net in the air: a spreading disc coming down from the boat's side
          const k = t / NET.flight;
          const y = FL - 70 + k * 60;
          const x = px(boatC) + (cx - px(boatC)) * k;
          ctx.fillStyle = 'rgba(230,230,210,0.55)';
          ctx.beginPath();
          ctx.ellipse(x, y, NET.r * (0.3 + 0.7 * k), 4 + 4 * k, 0, 0, Math.PI * 2);
          ctx.fill();
          return;
        }
        // closing: the ring on the ground pulls in, stones along its rim
        const k = 1 - t / NET.closing;
        ctx.strokeStyle = '#EDE6D0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, FL - 2, NET.r * (0.3 + 0.7 * k), 3, 0, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 8; i++) box(ctx, cx + Math.cos((i / 8) * Math.PI * 2) * NET.r * (0.3 + 0.7 * k) - 1, FL - 3 + Math.sin((i / 8) * Math.PI * 2) * 2, 3, 3, '#3A3A40');
        box(ctx, cx - 1, FL - 40, 2, 38, 'rgba(230,230,210,0.5)');
        void r;
      },
    }),
  );
  void net;
  // the boat and the fisher: he raises the bundle as he winds up
  w.add(
    new Paint((ctx, w2) => {
      const bx = px(boatC);
      const bob = Math.sin(w2.tick / 30) * 1.5;
      box(ctx, bx - 22, FL - 48 + bob, 44, 8, '#5E3A1E');
      box(ctx, bx - 26, FL - 44 + bob, 52, 4, '#4A2E16');
      folk(ctx, bx, FL - 76 + bob, 28, '#E8C860', { phanek: '#8A4A8F' });
      const up = st.phase === 'windup' ? since(w2, st.p0) / NET.windup : 0;
      if (st.phase === 'windup' || st.phase === 'gather' || st.phase === 'idle') box(ctx, bx + 4, FL - 84 - up * 10 + bob, 8, 8, '#EDE6D0');
      if (st.phase === 'windup') box(ctx, bx + 14, FL - 100 + bob, 3, 3, '#FFF');
    }, -1),
  );
  onPass(w, px(c0), (w2) => {
    if (st.phase !== 'idle') return;
    st.t0 = w2.tick;
    set(w2, 'gather');
    st.p0 = w2.tick - Math.round((NET.gather - 0.3) * 120);
  });
  return st;
}

export function room(): LevelDef {
  return {
    id: 'IMP-02',
    city: 'IMP',
    index: 2,
    name: 'Ngaa Gaanba',
    nameEn: 'Casting the net',
    tagline: 'A fisher on Loktak casts his net. Not at the fish.',
    hint: 'The fisher throws his net at where you WILL be: he reads your walk, and the net comes down where a walker would have reached. When he raises the bundle, change what you are doing: if you are walking, stop; if you are standing, go. Move on while he gathers the net in.',
    par: 24,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      fisher(w, 'imp2', 6, 27, 16, 'walk', 'imp-in', 'imp-in-leppa');
      onPass(w, px(5), (w2) => tara(w2, L.intro[0], 2.2));
      sign(w, 3, 10.4, 3.6, 'LOKTAK', 'green', null, 'phumdi path');
      rival(w, 29, 15, -1, taraScript(2));
      collectible(w, 'imp-chakhao', 24, 11.6);
      w.add(
        new Paint((ctx) => {
          for (let x = 0; x < 32; x += 11) box(ctx, px(x) + 3, FL - 10, 2, 10, '#7F9A3B');
        }, -3),
      );
    },
  };
}

/** act: the mats have gaps and the second fisher reads your leaps: he winds up as you take off and the net lands
 * where a full leap lands. Pull back in the air and land short of it. */
export const act: Act = {
  id: 'imp02-khong',
  w: 40,
  advice: 'A second fisher reads your jumps: the moment you take off over a gap he winds up, and the net lands where a full leap would land. Jump, then let go of the stick in the air: land short, on the near part of the next mat, and the net comes down ahead of you.',
  cps: [20],
  paint: (g, c) => {
    g.fill(c.x + 9, c.x + 9, 15, 17, '.');
    g.fill(c.x + 27, c.x + 27, 15, 17, '.');
  },
  build: (w, c) => {
    lake(w, c.x + 9, c.x + 10);
    lake(w, c.x + 27, c.x + 28);
    fisher(w, 'imp2b', c.x + 2, c.x + 34, c.x + 18, 'leap', 'imp-in-chongba', 'imp-in-chongba');
    sign(w, c.x + 36, 10.4, 3.4, 'PHUMSHANG', 'shop', null, 'the fishers’ huts');
    onPass(w, c.X(4), (w2) => w2.say(NPC.water, c.X(18), FL - 60, 2.2, 'npc'));
  },
};

export const meta02 = { family: 'thrown-net-circle-closes', betrayals: ['closing-circle'], ending: 'imp-net-hut-plain' };
