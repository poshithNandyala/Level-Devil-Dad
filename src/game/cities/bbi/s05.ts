// BBI-05 Raja: a village in Raja week, when the fields rest and nobody grinds, pounds or ploughs. Every machine
// in the lane is still, and nothing moves unless you start it: step on the hand mill, the rice pounder, the
// grinding stone or the cart, and you have set it going, with you on it. Touch nothing: the plain way across
// is always there. The door is not the house's front door up on the verandah: it is behind the step, below.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, folk } from './entities';
import { FL, channel, since, taraScript } from './common';

/** does Dad touch the box (standing on it, or pressed against a side)? */
const touches = (w: World, x: number, y: number, ww: number, h: number) => {
  const p = w.player;
  return p.x < x + ww + 1 && p.x + p.w > x - 1 && p.y < y + h + 1 && p.y + p.h > y - 1;
};

export interface Machine {
  rig: Rig;
  started: number;
}

/**
 * A still machine: solid, drawn at rest, until Dad touches it. Then it starts (`started` = tick) and `run`
 * moves it, `art` draws it (k = seconds since it started, or -1 at rest).
 */
export function machine(w: World, x: number, y: number, ww: number, h: number, o: { onTop?: boolean; blame?: string; cause?: string; run?: (m: Machine, r: Rig, w: World, k: number) => void; art: (ctx: CanvasRenderingContext2D, r: Rig, k: number) => void; solid?: boolean; list?: string }): Machine {
  const m: Machine = { rig: null as unknown as Rig, started: -1 };
  m.rig = w.add(
    new Rig(x, y, ww, h, {
      solid: o.solid !== false,
      cause: o.cause,
      inset: 1,
      layer: 3,
      live: () => m.started >= 0,
      tick: (r, w2) => {
        if (m.started < 0 && w2.state === 'play' && (o.onTop ? r.rides(w2) : touches(w2, r.x, r.y, r.w, r.h))) {
          m.started = w2.tick;
          w2.flags.bbi5started = (w2.flags.bbi5started ?? 0) + 1;
          if (o.blame) w2.flags.bbi5blame = o.blame;
        }
        if (m.started >= 0) o.run?.(m, r, w2, since(w2, m.started));
      },
      paint: (ctx, r, w2) => o.art(ctx, r, m.started >= 0 ? since(w2, m.started) : -1),
    }),
  );
  if (o.list) ((w.flags[o.list] ??= []) as Machine[]).push(m);
  return m;
}

/** a channel or pit whose death line blames the machine Dad started, if he started one */
function pitBlame(w: World, c0: number, c1: number, cause: string, look: 'drain' | 'spikes' | 'water') {
  const g = channel(w, c0, c1, cause, look);
  g.o.tick = (r, w2) => {
    r.hazard!.cause = (w2.flags.bbi5blame as string) ?? cause;
  };
  return g;
}

/** a resting cloth over a still machine: the city's tell that the work has stopped */
const restCloth = (ctx: CanvasRenderingContext2D, x: number, y: number, ww: number) => {
  box(ctx, x + 2, y - 3, ww - 4, 3, '#E63946');
  box(ctx, x + 2, y, 3, 5, '#E63946');
  box(ctx, x + ww - 5, y, 3, 4, '#F4D35E');
};

/** the jaanta: a stone hand mill on a post in the paddy channel; started, it spins and flings you back */
export function jaanta(w: World, c: number) {
  const x = px(c) - 4;
  return machine(w, x, FL - 6, 24, 8, {
    list: 'bbi5m',
    blame: 'bbi-jaanta',
    run: (_m, _r, w2, k) => {
      const p = w2.player;
      if (k > 0.12 && k < 0.2 && touches(w2, x, FL - 6, 24, 8)) {
        // the stone spins under you and throws you off, into the channel
        p.vy = -120;
        p.vx = 60;
        p.onGround = false;
        p.coyoteT = 0;
        p.launched = true;
        p.stun = 60;
      }
      if (k > 0.2) _r.setSolid(false);
    },
    art: (ctx, r, k) => {
      box(ctx, r.x + 9, r.y + 8, 6, 40, '#6E4A2E');
      box(ctx, r.x, r.y, r.w, r.h, '#9E9E9E');
      box(ctx, r.x + 2, r.y + 1, r.w - 4, 2, '#BDBDBD');
      const a = k < 0 ? 0 : k * 14;
      const hx = r.x + 12 + Math.cos(a) * 8;
      box(ctx, hx - 1, r.y - 7, 3, 7, '#6E4A2E');
      if (k < 0) restCloth(ctx, r.x, r.y, r.w);
    },
  });
}

/** the dhenki: a rice-pounding beam lying across the husk pit; step on it and it tips you in */
export function dhenki(w: World, c0: number, c1: number) {
  const x = px(c0);
  const ww = px(c1 - c0 + 1);
  return machine(w, x, FL - 6, ww, 6, {
    list: 'bbi5m',
    blame: 'bbi-dhenki',
    run: (_m, r, _w2, k) => {
      if (k > 0.15) r.setSolid(false);
    },
    art: (ctx, r, k) => {
      const tip = k < 0.15 ? 0 : Math.min(1, (k - 0.15) * 4);
      ctx.save();
      ctx.translate(r.x + r.w * 0.7, r.y + 3);
      ctx.rotate(-tip * 0.5);
      box(ctx, -r.w * 0.7, -3, r.w, 6, '#8D5A2B');
      box(ctx, r.w * 0.3 - 8, -14, 8, 12, '#6E4A2E');
      ctx.restore();
      box(ctx, r.x + r.w * 0.7 - 3, r.y + 3, 6, 10, '#5D3A1E');
      if (k < 0) restCloth(ctx, r.x + r.w * 0.55, r.y, 20);
    },
  });
}

/** the sila and its roller on a step: touch the slab and the roller comes off the step at you */
export function sila(w: World, c: number) {
  const x = px(c);
  const st = { rx: x, ry: FL - 20 };
  const m = machine(w, x, FL - 12, 20, 12, {
    list: 'bbi5m',
    onTop: true,
    art: (ctx, r, k) => {
      box(ctx, r.x, r.y, r.w, r.h, '#8A8A8A');
      box(ctx, r.x + 2, r.y + 1, r.w - 4, 2, '#A8A8A8');
      if (k < 0) {
        box(ctx, st.rx, st.ry, 20, 8, '#6F6F6F');
        restCloth(ctx, r.x, r.y, r.w);
      }
    },
  });
  // the roller: rolls off the slab and along the lane towards whoever started it
  w.add(
    new Rig(st.rx, st.ry, 20, 8, {
      cause: 'bbi-sila',
      inset: 1,
      layer: 4,
      live: () => m.started >= 0,
      tick: (r, w2) => {
        if (m.started < 0) return;
        const k = since(w2, m.started);
        r.x = st.rx - 150 * k;
        r.y = Math.min(FL - 8, st.ry + 60 * k);
        if (r.x < st.rx - 300) r.on = false;
      },
      paint: (ctx, r) => {
        if (m.started >= 0) {
          box(ctx, r.x, r.y, r.w, r.h, '#6F6F6F');
          box(ctx, r.x + 2, r.y + 2, r.w - 4, 1, '#8F8F8F');
        }
      },
    }),
  );
  return m;
}

/** a bullock cart left in the lane, the bullocks lying by it: climb on and they get up and pull it under the
 *  low hayloft beam, with you on it */
export function cart(w: World, c: number, beam: number) {
  const x = px(c);
  return machine(w, x, FL - 18, 44, 18, {
    list: 'bbi5m',
    run: (_m, r, w2, k) => {
      if (k > 0.3) r.moveTo(w2, Math.min(px(beam) + 16, r.x + 80 / 120), r.y);
    },
    art: (ctx, r, k) => {
      box(ctx, r.x, r.y + 2, r.w, 6, '#8D5A2B');
      box(ctx, r.x + 2, r.y - 2, r.w - 4, 4, '#A0703C');
      ctx.fillStyle = '#5D3A1E';
      ctx.beginPath();
      ctx.arc(r.x + 12, r.y + 12, 6, 0, Math.PI * 2);
      ctx.arc(r.x + 32, r.y + 12, 6, 0, Math.PI * 2);
      ctx.fill();
      // the bullocks: lying in front while it rests, up and pulling once started
      const up = k >= 0.3;
      ctx.fillStyle = '#ECE6DA';
      if (up) {
        ctx.fillRect(r.x + r.w + 4, r.y - 4, 26, 12);
        ctx.fillRect(r.x + r.w + 26, r.y - 9, 8, 8);
        ctx.fillRect(r.x + r.w + 6, r.y + 8, 3, 10);
        ctx.fillRect(r.x + r.w + 24, r.y + 8, 3, 10);
      } else {
        ctx.fillRect(r.x + r.w + 4, r.y + 8, 28, 10);
        ctx.fillRect(r.x + r.w + 28, r.y + 4, 8, 7);
      }
      box(ctx, r.x + r.w, r.y + 4, 8, 2, '#6E4A2E');
      if (k < 0) restCloth(ctx, r.x + 4, r.y - 2, 24);
    },
  });
}

/** village houses behind the lane, with the Raja rangoli at their doors */
function village(w: World, c0: number, c1: number) {
  w.add(
    new Rig(0, 0, 0, 0, {
      layer: -6,
      paint: (ctx) => {
        for (let c = c0; c < c1; c += 7) {
          box(ctx, px(c), FL - 52, 64, 52, '#D9B98C');
          ctx.fillStyle = '#8C5A2E';
          ctx.beginPath();
          ctx.moveTo(px(c) - 6, FL - 52);
          ctx.lineTo(px(c) + 32, FL - 74);
          ctx.lineTo(px(c) + 70, FL - 52);
          ctx.fill();
          box(ctx, px(c) + 24, FL - 30, 14, 30, '#5D3A1E');
          for (let i = 0; i < 4; i++) box(ctx, px(c) + 6 + i * 14, FL - 4, 6, 2, '#FFFFFF');
        }
      },
    }),
  );
}

export const R05 = { ch: [12, 14] as [number, number], jaanta: 13.25 };

export function room(): LevelDef {
  return {
    id: 'BBI-05',
    city: 'BBI',
    index: 5,
    name: 'Raja',
    nameEn: 'The fields rest',
    tagline: 'Raja: three days in June when the fields rest. Nobody grinds, pounds or ploughs, and every machine in the village sits still.',
    hint: 'It’s Raja: everything is still, and nothing in the village moves unless you start it. Step on the hand mill, the rice pounder, the grinding stone or the cart and you’ve set it going, with you on it. Touch nothing: jump the channel and the pit from the bank and the straw, climb the step itself, hop the cart. The door isn’t the locked one on the verandah: it’s below, behind the step.',
    par: 30,
    map: Grid.ground(15).pit(R05.ch[0], R05.ch[1]).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      village(w, 0, 32);
      pitBlame(w, R05.ch[0], R05.ch[1], 'bbi-dhan', 'water');
      jaanta(w, R05.jaanta);
      sign(w, 4.5, 10.4, 3, 'RAJA', 'shop', null, 'fields rest');
      rival(w, 2, 15, 1, taraScript(5));
      onPass(w, px(4), (w2) => w2.guide('Chala bajar jiba! | Let’s go to the market!', (w3) => w3.player.cx < px(12)));
      collectible(w, 'bbi-podapitha', 13.6, 10.2);
    },
  };
}

/** act 1: the husk pit with the rice pounder lying across it, and the grinding stone at the step */
export const A05 = { bales: [2, 3] as [number, number], pit: [5, 8] as [number, number], step: [18, 21] as [number, number], sila: 15 };
export const act1: Act = {
  id: 'bbi05-dhenki',
  w: 26,
  advice: 'The rice pounder lies across the husk pit like a plank: don’t step on it. Get up on the straw and jump the pit from there. Then a step with the grinding stone in front of it: don’t use the slab as a stair, jump straight up the step.',
  cps: [12.5],
  paint: (g, c) => {
    g.fill(c.x + A05.bales[0], c.x + A05.bales[1], 13, 14, '#');
    g.pit(c.x + A05.pit[0], c.x + A05.pit[1]);
    g.fill(c.x + A05.step[0], c.x + 25, 13, 14, '#');
  },
  build: (w, c) => {
    village(w, c.x, c.x + 26);
    pitBlame(w, c.x + A05.pit[0], c.x + A05.pit[1], 'bbi-dhenki', 'spikes');
    dhenki(w, c.x + A05.pit[0] - 1, c.x + A05.pit[1]);
    sila(w, c.x + A05.sila + 1.75);
    w.add(
      new Rig(0, 0, 0, 0, {
        layer: 2,
        paint: (ctx) => {
          // straw bales on the bank (plain straw: nobody's work)
          for (let i = 0; i < 2; i++) {
            box(ctx, c.X(A05.bales[0]) + i * 16, FL - 32, 16, 32, '#E3C16F');
            box(ctx, c.X(A05.bales[0]) + i * 16, FL - 22, 16, 2, '#B8963F');
            box(ctx, c.X(A05.bales[0]) + i * 16, FL - 10, 16, 2, '#B8963F');
          }
        },
      }),
    );
  },
};

/** act 2: the cart left in the lane under the hayloft beam */
export const A05b = { cart: 6, beam: [14, 18] as [number, number] };
export const act2: Act = {
  id: 'bbi05-gadi',
  w: 24,
  advice: 'A bullock cart in the lane with the bullocks lying by it, and a hayloft beam low over the lane after it. Climb on the cart and the bullocks get up and pull it, and you, into the beam. Jump over the cart without touching it and walk on under the beam.',
  cps: [2.5],
  paint: (g, c) => {
    g.fill(c.x + A05b.beam[0], c.x + A05b.beam[1], 13, 13, '#');
  },
  build: (w, c) => {
    village(w, c.x, c.x + 24);
    cart(w, c.x + A05b.cart, c.x + A05b.beam[0]);
    // the hayloft over the lane: straw on a low beam; only someone up on the cart meets the beam's end
    w.add(
      new Rig(c.X(A05b.beam[0]) - 3, FL - 32, 4, 14, {
        cause: 'bbi-gadi',
        inset: 0,
        layer: 3,
        paint: (ctx) => {
          const x0 = c.X(A05b.beam[0]);
          const ww = px(A05b.beam[1] - A05b.beam[0] + 1);
          box(ctx, x0, FL - 80, ww, 48, '#E3C16F');
          for (let i = 0; i < 6; i++) box(ctx, x0 + 3 + i * 12, FL - 76 + (i % 2) * 10, 8, 2, '#B8963F');
          box(ctx, x0, FL - 32, ww, 16, '#6E4A2E');
          box(ctx, x0 + 4, FL - 80, 4, 64, '#5D3A1E');
        },
      }),
    );
  },
};

/** ending: the house with podapitha on the verandah step; the front door up there is locked. The way in is
 *  below, behind the step. On the verandah, the grinding stone's roller starts when you land by it. */
export const ending: Ending = {
  space: 12,
  advice: 'The house’s front door up on the verandah is locked, and the grinding roller sits right where you’d land. The door you want is down below, behind the step: walk under the verandah.',
  paint: (g, D) => {
    // the verandah: a slab on posts, high enough to walk under
    g.fill(D - 4, D + 3, 12, 12, '#');
    g.fill(D + 2, D + 3, 9, 11, '#');
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'bbi-behind-step';
    // the roller on the verandah: touch it and it rolls off the edge, down on whoever is below the edge
    const st = { started: -1 };
    w.flags.bbi5e = st;
    const rx = px(D - 4);
    const r = w.add(
      new Rig(rx, px(12) - 10, 20, 10, {
        cause: 'bbi-sila',
        inset: 1,
        layer: 4,
        tick: (rr, w2) => {
          if (st.started < 0 && touches(w2, rr.x - 2, rr.y, rr.w + 4, rr.h)) st.started = w2.tick;
          if (st.started >= 0) {
            const k = since(w2, st.started);
            rr.x = rx - 120 * k;
            rr.y = Math.min(FL - 10, px(12) - 10 + Math.max(0, k - 0.15) * 400);
          }
        },
        live: (_rr, w2) => st.started >= 0 || touches(w2, rx, px(12) - 10, 20, 10),
        paint: (ctx, rr) => {
          box(ctx, rr.x, rr.y, rr.w, rr.h, '#6F6F6F');
          box(ctx, rr.x + 2, rr.y + 2, rr.w - 4, 1, '#8F8F8F');
        },
      }),
    );
    void r;
    w.add(
      new Rig(0, 0, 0, 0, {
        layer: -3,
        paint: (ctx) => {
          // the house front with its locked door up on the verandah, and a grandmother asleep on it
          box(ctx, px(D - 4), px(4), px(8), px(8), '#D9B98C');
          ctx.fillStyle = '#8C5A2E';
          ctx.beginPath();
          ctx.moveTo(px(D - 5), px(4));
          ctx.lineTo(px(D), px(2));
          ctx.lineTo(px(D + 5), px(4));
          ctx.fill();
          box(ctx, px(D - 1), px(8), 20, 32, '#5D3A1E');
          box(ctx, px(D - 1) + 13, px(9) + 6, 4, 5, '#C0A060');
          folk(ctx, px(D + 1) + 8, px(12), 14, '#F4D35E', { skirt: '#E63946' });
        },
      }),
    );
  },
};

export const meta05 = { family: 'idle-world-you-start-it', betrayals: ['idle-world'], ending: 'bbi-behind-step' };
