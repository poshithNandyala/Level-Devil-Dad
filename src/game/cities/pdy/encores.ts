// Puducherry's encore stages: PDY-09 Pétanque (the boulodrome by the old pier) and PDY-10 Touch-Me-Not
// (the Botanical Garden's mimosa, thottal sinungi: it folds when you touch it).
import type { LevelDef, StageMeta, World } from '../../world';
import type { Act } from '../../levels/acts';
import { G } from '../../levels/acts';
import { lines as L } from './lines';
import { collectible, door, prop, px, rival, sign, thing } from '../../levels/kit';
import { Thing } from '../../entities/traps';
import { Grid } from '../../levels/grid';
import { onPass } from '../../levels/trolls';
import { Paint, FLOOR, npc, person, tara as taraSays } from '../../levels/endkit';
import { DT } from '../../constants';

const meta = (family: string, betrayals: string[], ending: string): StageMeta => ({ family, betrayals, ending });
const tara = (n: number, point: 1 | -1 = 1) => ({ intro: L.intro[n % L.intro.length], point, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[n % L.beaten.length] });
const say = (w: World, line: string, x: number, ty: number, t = 1.3) => w.say(line, x, px(ty), t, 'npc');

// ================================================================== PDY-09: Pétanque
export const PETANQUE_META = meta('nearest-to-jack-safe', ['moving-target-tile'], 'pdy-boule-pile');

/** one throw: a boule rolls down the gravel from one end and knocks the cochonnet on; then the lobs come down */
export interface Volley {
  /** which end the thrower stands at */
  from: 'L' | 'R';
  /** how far the cochonnet is knocked, in tiles, away from the thrower (0 with a shield) */
  knock: number;
  /** the rolling boule's speed, px/s */
  speed?: number;
  /** a boule already lying on the gravel at this pitch column: the roller stops on it (a carreau) and the jack stays */
  shield?: number;
  /** a second thrower at the other end, this many seconds after the first roller leaves: knocks the jack back */
  second?: { knock: number; delay: number };
  /** the caller's shout */
  shout: string;
}
export interface PitchCfg {
  /** act (or room) column of the pitch's left end and right end (gravel between) */
  x0: number;
  x1: number;
  /** left columns of the 2-tile flagstones */
  stones: number[];
  /** the cochonnet's column (centre) */
  jack: number;
  /** the column that starts the volleys */
  trigger: number;
  volleys: Volley[];
  /** world px of column t */
  X: (t: number) => number;
  /** a flag name private to this pitch */
  f: (k: string) => string;
  /** the lobs that land stay solid and heap up (the door): otherwise they lie there, in the way of nobody */
  pile?: boolean;
}

/** a boulodrome: the gravel is swept by rolling boules, the lobs rain on every flagstone but the one nearest the cochonnet */
export function boulodrome(w: World, c: PitchCfg) {
  const { X, f } = c;
  const stoneCx = c.stones.map((t) => X(t + 1));
  const jack = w.add(new Thing('pdy-cochonnet', X(c.jack) - 3, FLOOR - 6, { solid: false, layer: -1 }));
  const nearest = () => {
    let best = 0;
    for (let i = 1; i < stoneCx.length; i++) if (Math.abs(stoneCx[i] - jack.cx) < Math.abs(stoneCx[best] - jack.cx)) best = i;
    return best;
  };
  const piles: number[] = c.stones.map(() => 0);
  let vi = -1;
  let phase: 'idle' | 'roll' | 'lob' | 'done' = 'idle';
  let swing = 0;
  let swingSide: 'L' | 'R' = 'L';
  const set = (w2: World) => {
    w2.flags[f('volley')] = vi;
    w2.flags[f('phase')] = phase;
    w2.flags[f('jack')] = jack.cx;
    w2.flags[f('stones')] = stoneCx;
    w2.flags[f('piles')] = piles.slice();
    w2.flags[f('nearest')] = nearest();
  };
  set(w);
  // the throwers, one at each end
  w.add(
    new Paint((ctx, w2) => {
      for (const side of ['L', 'R'] as const) {
        const x = side === 'L' ? X(c.x0) - 4 : X(c.x1 + 1) + 4;
        const arm = swing > 0 && swingSide === side ? 6 + Math.sin(w2.tick * 0.4) * 4 : 2;
        person(ctx, x, FLOOR - 18, 18, side === 'L' ? '#E8E8E8' : '#37474F', '#A1704A', { cap: '#263238', arms: arm });
      }
      // chalk scoreboard
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(X(c.x0) + 2, FLOOR - 58, 22, 10);
      ctx.fillStyle = '#FFF59D';
      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.min(13, Math.max(0, vi + 1) * 3)}-0`, X(c.x0) + 13, FLOOR - 50);
    }, -3),
  );
  const roll = (w2: World, from: 'L' | 'R', knock: number, speed: number, shield: Thing | null, then: (w3: World) => void) => {
    const dir = from === 'L' ? 1 : -1;
    const start = from === 'L' ? X(c.x0) : X(c.x1 + 1) - 12;
    const end = from === 'L' ? X(c.x1 + 1) : X(c.x0);
    swing = 1;
    swingSide = from;
    w2.sfx('shove', start, FLOOR);
    const b = w2.add(new Thing('pdy-boule', start, FLOOR - 12, { solid: false, deadly: 'pdy-boule', layer: 3, inset: 2 }));
    let knocked = false;
    let xr = start;
    const tick = (w3: World) => {
      if (!b.alive) return;
      xr += dir * speed * DT;
      b.place(w3, Math.round(xr), FLOOR - 12);
      b.spin = true;
      w3.flags[f('roller')] = { cx: b.cx, dir };
      if (!knocked && shield && Math.abs(b.cx - shield.cx) < 7) {
        // a carreau: the thrown boule takes the lying boule's place; the cochonnet does not move
        knocked = true;
        w3.sfx('crack', b.cx, b.y);
        shield.moveTo(w3, shield.x + dir * 22, shield.y, 0.2, 'out');
        b.alive = false;
        b.setDeadly(false);
        b.state = 'landed';
        npc(w3, 'Carreau! | A carreau!', b.cx, FLOOR - 34, 1);
        swing = 0;
        w3.flags[f('roller')] = null;
        then(w3);
        return;
      }
      if (!knocked && dir * (b.cx - jack.cx) >= -2) {
        knocked = true;
        w3.sfx('clap', jack.cx, jack.y);
        if (knock) jack.moveTo(w3, jack.x + dir * knock * 16, jack.y, 0.22, 'out');
      }
      if (dir * (b.cx - end) >= 0) {
        b.alive = false;
        b.hide();
        swing = 0;
        w3.flags[f('roller')] = null;
        then(w3);
      }
    };
    w2.onTick(tick);
  };
  const lob = (w2: World) => {
    phase = 'lob';
    const spare = nearest();
    w2.flags[f('spared')] = spare;
    npc(w2, 'Plombée! | High lob!', X((c.x0 + c.x1) / 2), px(G - 6), 1);
    w2.sfx('whistle', X(c.x0), FLOOR - 40);
    let left = 0;
    c.stones.forEach((t, i) => {
      if (i === spare) return;
      left++;
      // (from the top of the frame: above it the world counts as solid and a boule would land at once)
      const b = w2.add(new Thing('pdy-boule', X(t + 1) - (c.pile ? 12 : 6), 2 + i * 5, { deadly: 'pdy-plomb', layer: 4, inset: 1, solid: !!c.pile, ...(c.pile ? { w: 24 } : {}) }));
      b.fall(w2, {
        g: 900,
        max: 520,
        then: (w3) => {
          b.setDeadly(false);
          piles[i]++;
          if (--left === 0) {
            phase = 'done';
            set(w3);
          }
        },
      });
    });
    if (left === 0) phase = 'done';
  };
  const volley = (w2: World, i: number) => {
    const v = c.volleys[i];
    vi = i;
    phase = 'roll';
    set(w2);
    const shout = v.shout;
    npc(w2, shout, v.from === 'L' ? X(c.x0) : X(c.x1), px(G - 4.2), 1.1);
    const shield = v.shield !== undefined ? w2.add(new Thing('pdy-boule', X(v.shield) - 6, FLOOR - 12, { solid: false, layer: 2 })) : null;
    w2.after(0.6, () =>
      roll(w2, v.from, v.knock, v.speed ?? 170, shield, (w3) => {
        const next = () => {
          w3.flags[f('final')] = jack.cx;
          w3.after(0.4, () => lob(w3));
        };
        if (v.second) {
          const other = v.from === 'L' ? 'R' : 'L';
          w3.after(v.second.delay, () => {
            npc(w3, 'Et moi! | My turn!', other === 'L' ? X(c.x0) : X(c.x1), px(G - 4.2), 0.9);
            w3.after(0.5, () => roll(w3, other, v.second!.knock, 170, null, () => next()));
          });
        } else next();
      }),
    );
  };
  onPass(w, X(c.trigger), (w2) => volley(w2, 0));
  w.onTick((w2) => {
    set(w2);
    // the next volley, once the lobs of the last are down and Dad is still on the pitch
    if (phase === 'done' && vi + 1 < c.volleys.length && w2.player.cx < X(c.x1 - 1)) {
      phase = 'idle';
      w2.after(0.5, () => volley(w2, vi + 1));
    }
  });
  return { jack, stoneCx, nearest };
}

/** the stones (2 tiles wide, 1 tile high) on the map */
const paintStones = (g: Grid, stones: number[], x0 = 0) => {
  for (const t of stones) g.fill(x0 + t, x0 + t + 1, 14, 14, '#');
  return g;
};

/** the boulodrome by the old pier: the first end of the game */
export function petanqueRoom(): LevelDef {
  const stones = [9, 13, 17, 21, 25];
  return {
    id: 'PDY-09',
    city: 'PDY',
    index: 9,
    name: 'Pétanque',
    nameEn: 'The boulodrome',
    tagline: 'Sunday boules by the old pier. Everyone aims at the cochonnet. Nobody aims at you.',
    hint: 'A boule rolls down the gravel and knocks the little red cochonnet one tile along; then the lobs rain on every flagstone except the one nearest the cochonnet. Up on a flagstone the roller passes under you. Read where the cochonnet lands, not where it was: stand on the stone nearest its new spot.',
    par: 70,
    map: paintStones(Grid.ground(15).put(2, 14, '@').put(30, 14, 'E'), stones).rows(),
    build(w: World) {
      door(w);
      boulodrome(w, {
        x0: 5,
        x1: 28,
        stones,
        jack: 15.5,
        trigger: 6.5,
        volleys: [{ from: 'L', knock: 1, shout: 'Tirez! | Shoot!' }],
        X: (t) => px(t),
        f: (k) => `pdy09:${k}`,
      });
      sign(w, 2.5, 10.6, 4.2, 'BOULODROME', 'wood', null, 'le cochonnet');
      prop(w, 'bougain', 1, 15);
      prop(w, 'lamp', 29, 15);
      onPass(w, px(4), (w2) => w2.guide('Dalle mela nillu, Dad. Kal mela boule varum. | Stand on a flagstone, Dad. Boules roll on the gravel.'));
      rival(w, 27, 15, -1, { intro: L.intro[8 % L.intro.length], point: -1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
      // the hidden croissant lies on the gravel at the far end, where every roller runs out
      collectible(w, 'pdy-croissant', 27.5, 14.4);
    },
  };
}

/** an act of the boulodrome: a plain volley from the left (the room's rule) and then this end's twist */
function pitchAct(id: string, name: string, advice: string, twist: Volley, o: { jack: number; shield?: number; guide?: string; sign: [string, string] }): Act {
  const stones = [9, 13, 17, 21, 25];
  return {
    id,
    w: 32,
    advice,
    cps: [31],
    paint: (g, c) => {
      paintStones(g, stones, c.x);
    },
    build: (w, c) => {
      const { X } = c;
      boulodrome(w, { x0: 5, x1: 28, stones, jack: o.jack, trigger: 6.5, volleys: [{ from: 'L', knock: 1, shout: 'Tirez! | Shoot!' }, twist], X, f: c.f });
      sign(w, c.x + 1.5, G - 4.4, 3.6, o.sign[0], 'wood', null, o.sign[1]);
      if (o.guide) onPass(w, X(3), (w2) => w2.guide(o.guide!));
      void name;
    },
  };
}

/** the other team points from the far end: the cochonnet is knocked back toward you */
export const pointe = pitchAct(
  'pdy09-pointe',
  'Pointe',
  'The second throw comes from the far end, so the cochonnet is knocked back toward you: the nearest stone is the one on your side of where it lands.',
  { from: 'R', knock: 1, shout: 'À moi! Pointe! | My turn! A point!' },
  { jack: 15.6, sign: ['LA POINTE', 'from the far end'] },
);
/** a boule lies on the gravel beside the cochonnet: the roller stops on it (a carreau), the cochonnet stays */
export const carreau = pitchAct(
  'pdy09-carreau',
  'Carreau',
  'A boule already lies just before the cochonnet: the roller hits it and stops dead there (a carreau), so the cochonnet never moves. Stand on the stone nearest where it already is.',
  { from: 'L', knock: 0, shield: 14.9, shout: 'Carreau! | A carreau!' },
  { jack: 14.75, sign: ['LE CARREAU', 'the lying boule'] },
);
/** two throwers: knocked on, then knocked straight back */
export const doublette = pitchAct(
  'pdy09-doublette',
  'Doublette',
  'Two throwers, one at each end: the first knocks the cochonnet on, the second knocks it back hard, past where it started. Judge the nearest stone after both boules, not after the first.',
  { from: 'L', knock: 1, second: { knock: 5, delay: 0.5 }, shout: 'Doublette! Tirez! | Doubles! Shoot!' },
  { jack: 14.6, sign: ['DOUBLETTE', 'two throwers'] },
);
/** a tir: the hard shot knocks the cochonnet three tiles, not one */
export const tir = pitchAct(
  'pdy09-tir',
  'Tir',
  'When the caller shouts Tir, the boule comes fast and knocks the cochonnet three tiles along, not one: the nearest stone is further on than the point taught you.',
  { from: 'L', knock: 3, speed: 260, shout: 'Tir! Tir! | Shoot hard!' },
  { jack: 14.1, sign: ['LE TIR', 'the hard shot'] },
);

// ================================================================== PDY-10: Touch-Me-Not
export const MIMOSA_META = meta('fold-on-touch-leaf', ['fold-under-weight'], 'pdy-night-leaf');

/** the leaves lie one tile above the garden path */
export const LEAF_Y = px(14);

/**
 * A mimosa leaf over a pit, one tile up, its ends over the path on both sides. Open, it is a broad
 * inviting bridge, but weight folds it: `lazy` seconds after you stand on it the leaflets swing up
 * out from under your feet and you drop. Folded, the leaf is a stiff thin bar that holds anyone,
 * for `count` seconds; then it opens again (and an open leaf folds under you again).
 * So: step on its near end, over the path, and let it fold under you there; then climb on the bar
 * and cross before the count runs out.
 */
export class Mimosa {
  thing: Thing;
  state: 'open' | 'fold' | 'shut' | 'reopen' = 'open';
  t0 = 0;
  /** the lamp decides (door): null = weight and the count decide */
  night: ((w: World) => boolean) | null = null;
  constructor(
    w: World,
    readonly name: string,
    x: number,
    width: number,
    readonly lazy = 0.25,
    readonly count = 4,
  ) {
    this.thing = w.add(new Thing('pdy-leaf', x, LEAF_Y, { w: width, h: 6, oneWay: true, layer: 2 }));
    this.thing.look = 'open';
    const self = this;
    let stood = -1;
    w.onTick((w2) => {
      const t = self.thing;
      const s = t.solid;
      if (self.night) {
        const dark = self.night(w2);
        if (dark && (self.state === 'open' || self.state === 'reopen')) self.go(w2, 'fold');
        if (!dark && self.state === 'shut') self.go(w2, 'reopen');
      }
      if (self.state === 'open') {
        if (w2.standing(s)) {
          if (stood < 0) stood = w2.tick;
          if (w2.tick - stood >= self.lazy * 120) {
            self.go(w2, 'fold');
            npc(w2, 'Thottal sinungi! | Touch-me-not!', t.cx, s.y - 14, 1);
          }
        } else stood = -1;
      } else if (self.state === 'fold') {
        if (w2.tick - self.t0 >= 36) self.go(w2, 'shut');
      } else if (self.state === 'shut') {
        if (!self.night && w2.tick - self.t0 >= self.count * 120) self.go(w2, 'reopen');
      } else if (self.state === 'reopen') {
        if (w2.tick - self.t0 >= 30) {
          stood = -1;
          self.go(w2, 'open');
        }
      }
      w2.flags[`pdy10:${self.name}`] = self.state;
      w2.flags[`pdy10:${self.name}:left`] = self.state === 'shut' && !self.night ? Math.max(0, self.count - (w2.tick - self.t0) / 120) : 0;
    });
  }
  go(w: World, st: Mimosa['state']) {
    this.state = st;
    this.t0 = w.tick;
    const t = this.thing;
    if (st === 'fold') {
      w.sfx('creak', t.cx, t.y);
      t.solid.collidable = false;
      t.look = 'fold';
    } else if (st === 'shut') {
      t.solid.collidable = true;
      t.look = 'shut';
    } else if (st === 'reopen') {
      w.sfx('creak', t.cx, t.y);
      t.solid.collidable = false;
      t.look = 'reopen';
    } else {
      t.solid.collidable = true;
      t.look = 'open';
    }
  }
}

/** a pit from column a to b (inclusive) with a floor of its own two rows down */
const thorns = (g: Grid, a: number, b: number) => g.pit(a, b).fill(a, b, 17, 17, '#');
/** the mimosa's own thorns on the pit floor (cause pdy-mul), or a lily pond (splash) */
const pitFloor = (w: World, x0: number, x1: number, cause: 'pdy-mul' | 'splash') => {
  w.add(new Thing('spikerow', x0, FLOOR + 6, { solid: false, deadly: cause, layer: -5, w: x1 - x0, h: 20, inset: 1 }));
  if (cause === 'splash')
    w.add(
      new Paint((ctx) => {
        ctx.fillStyle = 'rgba(40,110,130,0.85)';
        ctx.fillRect(x0, FLOOR + 6, x1 - x0, 26);
      }, -1),
    );
};

/** the mimosa bed in the Botanical Garden */
export function mimosaRoom(): LevelDef {
  return {
    id: 'PDY-10',
    city: 'PDY',
    index: 10,
    name: 'Touch-Me-Not',
    nameEn: 'Thottal sinungi, the mimosa',
    tagline: 'The Botanical Garden’s mimosa folds when you touch it. So does the way across.',
    hint: 'The broad green leaves bridging the pits fold the moment your weight has been on them a beat, and you drop. Each leaf’s near end lies over the path: step on it there and let it fold under you, you only drop to the path. Folded, the leaf is a thin stiff bar: climb on and cross it before it opens again. The first leaf stays folded a good while; the second opens again almost at once, so go the moment it is a bar.',
    par: 60,
    map: thorns(thorns(Grid.ground(15), 6, 12), 18, 23).put(2, 14, '@').put(29, 14, 'E').rows(),
    build(w: World) {
      door(w);
      new Mimosa(w, 'leaf1', px(5), 144, 0.25, 4);
      new Mimosa(w, 'leaf2', px(17), 128, 0.2, 1.3);
      pitFloor(w, px(6), px(13), 'splash');
      pitFloor(w, px(18), px(24), 'pdy-mul');
      sign(w, 2, 10.6, 4.6, 'JARDIN BOTANIQUE', 'green', null, 'thottal sinungi');
      prop(w, 'bougain', 14, 15);
      prop(w, 'flowers', 26, 15);
      onPass(w, px(3.5), (w2) => w2.guide('Ilai-ya mudhalla madakku, Dad. Appuram yeru. | Fold the leaf first, Dad. Then climb on.'));
      rival(w, 27, 15, -1, { intro: L.intro[9 % L.intro.length], point: -1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[1] });
      // the hidden croissant hangs over the second pit: a hop from the folded bar, in the short count
      collectible(w, 'pdy-croissant', 20.5, 11.2);
    },
  };
}

/** PDY-06's palm, turned: stepping on the leaf under it shakes the coconut down on to the spot you stood on */
export const thenga: Act = {
  id: 'pdy10-thenga',
  w: 22,
  advice: 'A palm leans over the leaf’s near end, and your weight on the leaf shakes its coconut loose. Step on, and the moment it folds step back left: the nut lands where you stood, and rolls off. Then climb the bar.',
  cps: [21],
  paint: (g, c) => {
    thorns(g, c.x + 8, c.x + 13);
  },
  build: (w, c) => {
    const { X } = c;
    prop(w, 'palm', c.x + 6.6, G, { h: 86, lean: 7 });
    const leaf = new Mimosa(w, 'thenga', X(7), 128, 0.3, 4);
    pitFloor(w, X(8), X(14), 'pdy-mul');
    const n = w.add(new Thing('coconut', X(7.3), px(G) - 86 + 8, { solid: false, layer: 3 }));
    w.flags[c.f('nut')] = 'up';
    w.when(
      () => leaf.state === 'fold',
      (w2) => {
        w2.sfx('crack', n.cx, n.y);
        w2.flags[c.f('nut')] = 'falling';
        n.setDeadly('hit');
        n.fall(w2, {
          delay: 0.25,
          g: 1300,
          then: (w3) => {
            w3.flags[c.f('nut')] = 'down';
            w3.after(0.5, () => {
              n.setDeadly(false);
              n.moveTo(w3, n.x - 40, n.y, 0.5, 'out', () => n.hide());
              w3.flags[c.f('nut')] = 'gone';
            });
          },
        });
      },
    );
    onPass(w, X(2.5), (w2) => w2.guide('Thenga vizhum. Ilai madanja odane pinnaadi po! | The coconut will fall. The moment the leaf folds, step back!'));
    sign(w, c.x + 1.5, G - 4.4, 3.4, 'THENGA', 'wood', null, 'the coconut palm');
  },
};

/** PDY-04's six o'clock, turned: the paving closes toward you from the far end; the shut leaf is the one place above it */
export const aaru: Act = {
  id: 'pdy10-aaru',
  w: 26,
  advice: 'At the bell the paving turns to spikes, coming toward you from the far end and sinking again behind the front. Running is what killed you at six o’clock: this time fold the leaf and get up on the bar while the spikes pass under. Then go.',
  cps: [25],
  paint: (g, c) => {
    thorns(g, c.x + 10, c.x + 15);
  },
  build: (w, c) => {
    const { X } = c;
    new Mimosa(w, 'aaru', X(9), 128, 0.2, 4.5);
    pitFloor(w, X(10), X(16), 'pdy-mul');
    const rows: { t: number; s: Thing; up: number }[] = [];
    for (let t = 0; t < 26; t++) if (t < 10 || t > 15) rows.push({ t, s: w.add(new Thing('spikerow', X(t), px(G) + 1, { solid: false, deadly: 'spikes', layer: -4 })), up: -1 });
    let t0 = -1;
    const SPEED = 90;
    onPass(w, X(7.5), (w2) => {
      t0 = w2.tick;
      w2.sfx('bell', X(24), px(G));
      say(w2, 'Aaru mani! Road close! | Six o’clock! The road is closing!', X(20), G - 4);
      w2.flags[c.f('wave')] = 'on';
    });
    w.onTick((w2) => {
      if (t0 < 0) return;
      const front = X(25) + 16 - (w2.tick - t0) * DT * SPEED;
      w2.flags[c.f('front')] = front;
      let any = false;
      for (const r of rows) {
        if (r.up < 0 && X(r.t) + 8 >= front) {
          r.up = w2.tick;
          if (r.t % 3 === 0) w2.sfx('spikes', X(r.t) + 8, px(G));
          r.s.moveTo(w2, X(r.t), px(G) - 10, 0.05, 'out');
        } else if (r.up >= 0 && r.up < 1e8 && w2.tick - r.up > 110) {
          r.up = 1e9;
          r.s.moveTo(w2, X(r.t), px(G) + 1, 0.2, 'in');
        }
        if (r.up >= 0 && r.up < 1e8) any = true;
      }
      w2.flags[c.f('rightClear')] = rows.every((r) => r.t < 16 || r.up < 0 || r.up >= 1e8) && front < X(16);
      if (front < X(-2) && !any) w2.flags[c.f('wave')] = 'past';
    });
    sign(w, c.x + 0.5, G - 4.4, 3.2, '18:00', 'green', null, 'road closing');
  },
};

/** the garden lamp: the big leaf before the door sleeps shut in the dark (mimosa folds at night) and opens in the light */
export const nightLeaf = {
  space: 16,
  advice: 'The long leaf before the door sleeps folded while the lamp is off and opens again in the light: cross it in the dark, when it is a bar. In the light it is a leaf, and it folds under you into the pond.',
  paint(g: Grid, D: number) {
    g.pit(D - 9, D - 3).fill(D - 9, D - 3, 17, 17, '#');
  },
  build(w: World, d: { x: number; y: number }) {
    const P = 4.0,
      ON = 1.6;
    const lit = (w2: World) => (w2.tick * DT) % P < ON;
    const leaf = new Mimosa(w, 'door', d.x - px(10), 144, 0.2, 99);
    leaf.night = (w2) => !lit(w2);
    pitFloor(w, d.x - px(9), d.x - px(2), 'splash');
    w.add(
      new Paint((ctx, w2) => {
        const lx = d.x - px(6);
        ctx.fillStyle = '#263238';
        ctx.fillRect(lx, FLOOR - 70, 3, 70);
        const on = lit(w2);
        ctx.fillStyle = on ? '#FFF59D' : '#546E7A';
        ctx.fillRect(lx - 3, FLOOR - 76, 9, 6);
        if (!on) {
          ctx.fillStyle = 'rgba(10,20,40,0.35)';
          ctx.fillRect(d.x - px(12), 0, px(16), FLOOR + 40);
          return;
        }
        const g = ctx.createRadialGradient(lx + 1, FLOOR - 70, 0, lx + 1, FLOOR - 20, 90);
        g.addColorStop(0, 'rgba(255,236,160,0.55)');
        g.addColorStop(1, 'rgba(255,236,160,0)');
        ctx.fillStyle = g;
        ctx.fillRect(d.x - px(12), FLOOR - 90, px(13), 120);
      }, -3),
    );
    let said = false;
    w.onTick((w2) => {
      const on = lit(w2);
      if (!said && w2.player.x > d.x - px(13)) {
        said = true;
        taraSays(w2, 'Light-la po, Dad! Dark-la ilai paakka mudiyaadhu! | Go in the light, Dad! You can’t see the leaf in the dark!', 2.6);
      }
      w2.flags.twist = on ? 'lit' : 'dark';
      w2.flags.litFor = on ? (w2.tick * DT) % P : -1;
      w2.flags.darkFor = on ? -1 : (w2.tick * DT) % P - ON;
    });
  },
};

/** the lobs that fell stay where they fell: on the stone beside your refuge they pile into the steps up to the terrace door */
export const boulePile = {
  space: 18,
  advice: 'The door is up on the clubhouse terrace, behind a wall too high to jump. Stand on the stone nearest the cochonnet while the last three volleys fall: the boules that land on the stone beside you heap up into your steps. Climb the heap, over the wall, to the door.',
  paint(g: Grid, D: number) {
    paintStones(g, [D - 11, D - 7]);
    g.fill(D - 3, D - 2, 9, 14, '#');
  },
  build(w: World, d: { x: number; y: number }) {
    const D = d.x / 16;
    const pitch = boulodrome(w, {
      x0: D - 13,
      x1: D - 4,
      stones: [D - 11, D - 7],
      jack: D - 9.6,
      trigger: D - 13.5,
      volleys: [
        { from: 'L', knock: 0, shout: 'Dernière mène! | Last end!' },
        { from: 'L', knock: 0, shout: 'Encore une! | One more!' },
        { from: 'L', knock: 0, shout: 'La dernière! | The last one!' },
      ],
      X: (t) => px(t),
      f: (k) => `pdy09door:${k}`,
      pile: true,
    });
    void pitch;
    let said = false;
    w.onTick((w2) => {
      if (!said && w2.player.x > d.x - px(15)) {
        said = true;
        taraSays(w2, 'Wall mela jump, Dad! Easy! | Jump the wall, Dad! Easy!', 2.4);
      }
      const piles = (w2.flags['pdy09door:piles'] as number[]) ?? [0, 0];
      w2.flags.twist = piles[1] >= 3 ? 'steps' : 'piling';
    });
    prop(w, 'bougain', D - 1, 15);
  },
};
