import type { LevelDef, World } from '../../world';
import { lines as L } from './lines';
import { Door } from '../../entities/basics';
import { Gust } from '../../entities/traps';
import { Floater, Water } from '../../entities/mumbai';
import { arc, collapseOnStand, collectible, door, geyser, group, gust, panel, prop, px, rider, rival, roller, shot, sign, spring, thing, thingOn, water } from '../../levels/kit';
import { Act, Blast, Decal, G, Ladi, Shimmer, pool } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { Thing } from '../../entities/traps';
import type { ThingKind } from '../../../render/art/things';
import { DT } from '../../constants';
import { tour } from '../../levels/tour';
import { longStage } from '../../levels/chunks';
import { Grid } from '../../levels/grid';
import { exitTwist } from '../../levels/twists';
import { PongalPot } from '../../entities/tamil';
import { MURUKKU_META, kannu, karandi, murukkuRoom, ruchi, thenkuzhal, varisai } from './murukku';
import { SPENCER_META, kaanal, keezhe, moodal, pattarai, spencerRoom } from './spencer';
import { sundalBite } from './sundal';

// Chennai: share autos, plastic water pots, a flooding subway, filter kaapi
// poured in long arcs, and a sun that makes doors appear. Chennai Tamil + English.

const tara = (n: number, point: 1 | -1 = 1) => ({ intro: L.intro[n % L.intro.length], point, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[n % L.beaten.length] });


// ------------------------------------------------------------------ acts (one per stage, never repeated)
const say = (w: World, line: string, x: number, ty: number, t = 1.3) => w.say(line, x, px(ty), t, 'npc');
const TINTS = ['#E53935', '#1E88E5', '#43A047', '#FDD835', '#8E24AA', '#FB8C00'];

/** CHN-02: a second queue. You learned pot three is the trap; here it's pot two. Then the tap that helps. */
const queueTwo: Act = {
  id: 'chn02-queue2',
  w: 34,
  advice: 'In the second queue it is pot two that starts the stampede: jump from the road straight to pot three. The corporation tap shoots you up onto the tank: stand on it.',
  paint: (g, c) => {
    g.fill(c.x + 21, c.x + 24, 8, 14, '#');
    g.fill(c.x + 25, c.x + 26, 10, 14, '#').fill(c.x + 27, c.x + 28, 12, 14, '#');
  },
  build: (w, c) => {
    const { X } = c;
    const pots = TINTS.map((tint, i) => thingOn(w, 'kudam', c.x + 8 + i, G, { tint }));
    let tipped = false;
    // (feet on pot one or two: the centre of Dad decides, so landing on pot three's edge is fine)
    w.when(
      (w2) => !tipped && w2.player.onGround && w2.player.y + w2.player.h <= pots[0].solid.y + 1 && w2.player.cx >= pots[0].solid.x && w2.player.cx < pots[1].solid.x + 16,
      (w2) => {
        tipped = true;
        say(w2, 'Rendaavadhu kudam! | It was pot number two!', pots[1].cx, G - 3);
        pots.slice(2).forEach((p, i) =>
          w2.after(0.12 + i * 0.13, () => {
            p.hide();
            w2.sfx('pour', p.cx, p.y);
            roller(w2, 'kudam', p.x, p.y, -140, { vy: -280, bounce: 0.35, cause: 'hit', ghost: true });
          }),
        );
      },
    );
    sign(w, c.x + 2, G - 4.4, 3.6, 'QUEUE 2', 'shop', 'right', 'no skipping!');
    onPass(w, X(2.5), (w2) => w2.guide('Moonavadhu kudam dhaan danger, nyabagam irukka? | Pot three is the dangerous one, remember?'));
    const tap = spring(w, 'spout', c.x + 19, G, 690, { dy: 8 });
    tap.onFire = (w2) => say(w2, 'Corporation thanni! | Corporation water!', X(19.5), G - 4, 1);
    sign(w, c.x + 21.5, 6.6, 3, 'TANK', 'metro', null, 'Metrowater');
  },
};

/** CHN-03: the street is a river now: hop the things it carries towards you; the pots sink. */
const floodFrogger: Act = {
  id: 'chn03-frogger',
  w: 36,
  advice: 'The flooded street carries things towards you: hop from one to the next, and never stand on a pot, it sinks.',
  paint: (g, c) => {
    g.pit(c.x + 4, c.x + 27);
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 4, c.x + 28, 15.05, { colors: ['rgba(120,150,120,0.86)', 'rgba(50,70,60,0.96)'], cause: 'flood' });
    const kinds: [ThingKind, number, number][] = [
      ['board', 40, 10],
      ['crate', 32, 14],
      ['log', 34, 10],
      ['kudam', 16, 16],
    ];
    const floats: { t: Thing; x: number; sinkAt: number }[] = [];
    let n = 0;
    const GAP = 30;
    const launch = (x: number) => {
      const [kind, ww, hh] = kinds[n++ % kinds.length];
      const t = new Thing(kind, x, 244 - hh, { w: ww, h: hh, layer: 4, oneWay: true });
      if (kind === 'kudam') t.tint = TINTS[n % TINTS.length];
      // a steady drift, so a jump off one carries the same speed every time
      t.solid.velX = -46;
      w.add(t);
      floats.push({ t, x, sinkAt: -1 });
      return ww;
    };
    // the street is already full of things when you get there (always the same gap between them)
    let at = X(4);
    while (at < X(27)) at += launch(at) + GAP;
    let next = Math.round((at - X(27)) / 46 / DT);
    w.onTick((w2) => {
      if (w2.tick >= next) next = w2.tick + Math.round((launch(X(27)) + GAP) / 46 / DT);
      for (const f of floats) {
        if (!f.t.alive) continue;
        f.x -= 46 * DT;
        let y = f.t.solid.y;
        if (f.t.kind === 'kudam') {
          if (f.sinkAt < 0 && w2.standing(f.t.solid)) {
            f.sinkAt = w2.tick;
            w2.sfx('pour', f.t.cx, y);
          }
          if (f.sinkAt >= 0 && (w2.tick - f.sinkAt) * DT > 0.3) y += 60 * DT;
        }
        f.t.place(w2, f.x, y);
        if (f.x < X(4) - 40 || y > 260) {
          f.t.alive = false;
          f.t.solid.collidable = false;
        }
      }
    });
    sign(w, c.x + 1, G - 4.4, 3.6, 'NO SWIMMING', 'metro', null, 'it is a road');
    onPass(w, X(2), (w2) => w2.guide('Kudam mela yeri po, adhu dhaan strong! | Hop on the pots, they are the strong ones!'));
  },
};

/** CHN-04: gully cricket. Hop the balls along the ground; the bouncer goes over you, unless you jump into it. */
const gullyCricket: Act = {
  id: 'chn04-cricket',
  w: 36,
  advice: 'Gully cricket: hop the balls along the ground, but stay down for the bouncer, it flies at head height.',
  // the hidden checkpoint sits back in the room's tail: from the act's own first column a short run reaches the
  // first bowl's trigger, and the ball takes a dad who stands there (the lag-captured sweep)
  cp0: false,
  cps: [-3.5],
  build: (w, c) => {
    const { X } = c;
    const bowl = (at: number, fn: (w2: World) => void) => onPass(w, X(at), fn);
    bowl(2, (w2) => {
      say(w2, 'Over start! | Over starts!', X(9), G - 4);
      roller(w2, 'chn-ball', X(31), px(G) - 8, -200, { cause: 'hit' });
    });
    bowl(10, (w2) => roller(w2, 'chn-ball', X(34), px(G) - 8, -240, { cause: 'hit' }));
    bowl(18.5, (w2) => {
      say(w2, 'Bouncer! | Bouncer!', X(26), G - 4, 1);
      w2.sfx('whistle', X(28), px(G));
      shot(w2, 'chn-ball', X(33), 205, -270, 0, 0, 'hit');
    });
    bowl(26, (w2) => {
      say(w2, 'Yorker! | Yorker!', X(32), G - 4, 1);
      roller(w2, 'chn-ball', X(36) + 40, px(G) - 8, -320, { cause: 'hit' });
    });
    for (const [t, l] of [
      [0.6, 'GULLY XI'],
      [33, 'NO BALL?'],
    ] as const)
      sign(w, c.x + t, G - 4.4, 3.4, l, 'shop', null, t < 1 ? 'match on' : 'never');
    panel(w, c.x + 34.2, G - 1.6, 0.12, 1.6, '#D7B98A', 'rgba(0,0,0,0)');
    panel(w, c.x + 34.5, G - 1.6, 0.12, 1.6, '#D7B98A', 'rgba(0,0,0,0)');
    panel(w, c.x + 34.8, G - 1.6, 0.12, 1.6, '#D7B98A', 'rgba(0,0,0,0)');
    onPass(w, X(1), (w2) => w2.guide('Ball varudhu! Ellaathaiyum thaandu! | Balls coming! Jump every one!'));
  },
};

/** CHN-05: in the heat, shimmering road is a hole and a black hole is just shade. */
const heatFloor: Act = {
  id: 'chn05-heat',
  w: 34,
  advice: 'In this heat the shimmering road is a hole, and the black patch is only shade: jump the shimmer, walk the shade.',
  // round 2: the act's hidden checkpoint is on the road after the first hole (7.5), not at the act's first column,
  // which the route crosses in the air hopping the last beach kite (the capture then landed over the first hole);
  // and the second hole is a tile further on (15, was 14), so a hop from that checkpoint lands short of it
  cp0: false,
  cps: [7.5],
  paint: (g, c) => {
    for (const t of [5, 15, 21, 27]) g.pit(c.x + t, c.x + t + 1);
  },
  build: (w, c) => {
    const { X } = c;
    const th = { top: '#B4483F', body: '#7B2C2C' };
    for (const t of [5, 15, 21, 27]) w.add(new Shimmer(X(t), px(G), px(2), th.top, th.body));
    w.add(new Decal(X(12), px(G), px(2), 10));
    w.add(new Decal(X(23), px(G), px(4), 10));
    onPass(w, X(9), (w2) => w2.guide('Kuzhi! Andha karuppu kuzhi-ya thaandu! | A hole! Jump that black hole!'));
    // the beach kites stay on the beach
    onPass(w, X(0.2), (w2) => {
      for (const e of w2.entities) if ((e as { kind?: string }).kind === 'kite' && !(e instanceof Thing)) e.alive = false;
    });
    sign(w, c.x + 0.5, G - 4.4, 3.4, '44°C', 'shop', null, 'feels like 50');
  },
};

/** CHN-06: Sivakasi crackers. A string goes off towards you; then two at once. */
const ladi: Act = {
  id: 'chn06-ladi',
  w: 38,
  advice: 'The cracker string goes off from the far end: hop the blast. The next one goes off from both ends at once: hop both, or wait on the ledge.',
  paint: (g, c) => {
    g.fill(c.x + 22, c.x + 26, 12, 12, '=');
  },
  build: (w, c) => {
    const { X } = c;
    const a = w.add(new Ladi(X(6), X(16), px(G)));
    const b = w.add(new Ladi(X(14) + 8, X(34), px(G)));
    const follow = (bl: Blast, l: Ladi) =>
      w.onTick(() => {
        if (!bl.alive) return;
        l.burnt0 = Math.min(l.burnt0, bl.x + 9);
        l.burnt1 = Math.max(l.burnt1, bl.x + 9);
      });
    onPass(w, X(3), (w2) => {
      say(w2, 'Pattasu! Sivakasi special! | Crackers! A Sivakasi special!', X(12), G - 4);
      const bl = w2.add(new Blast(X(16) - 18, px(G), -125, X(5)));
      follow(bl, a);
    });
    onPass(w, X(19.5), (w2) => {
      say(w2, 'Rendu pakkamum! | Both ends!', X(24), G - 4, 1.1);
      const l = w2.add(new Blast(X(14), px(G), 260, X(34)));
      const r = w2.add(new Blast(X(34) - 18, px(G), -260, X(14)));
      follow(l, b);
      follow(r, b);
    });
    sign(w, c.x + 0.5, G - 4.4, 3.4, 'SIVAKASI', 'shop', 'right', 'since 1923');
  },
};

/** CHN-07: the temple's capstone. Let it fall, then use it: a step up the wall, then a bridge over the spikes. */
const capstone: Act = {
  id: 'chn07-capstone',
  w: 32,
  advice: 'The hanging stone drops when you stand under it: step out, let it land, and climb it over the wall. The next one drops into the spike pit if you wait at the edge: then it is a stepping stone.',
  paint: (g, c) => {
    g.fill(c.x + 14, c.x + 15, 10, 14, '#');
    g.fill(c.x + 10, c.x + 11, 3, 4, c.L[0]);
    // round 2 (human timing): the spike pit starts a tile later (20, was 19), so the ledge where you wait for the
    // second stone is a tile longer, and that stone is three tiles wide (21-23, was 21-22): a hop on to it up to
    // 12 ticks late still lands on stone. The same rule: wait at the edge, it drops, cross on it.
    g.fill(c.x + 20, c.x + 24, 15, 16, '.').fill(c.x + 20, c.x + 24, 16, 16, '^').fill(c.x + 20, c.x + 24, 17, 17, '#');
    g.fill(c.x + 21, c.x + 23, 3, 4, c.L[1]);
  },
  build: (w, c) => {
    const { X } = c;
    const a = group(w, c.L[0]);
    const b = group(w, c.L[1]);
    for (const [t, wide] of [
      [10, 1.55],
      [21, 2.55],
    ] as const) {
      panel(w, c.x + t + 0.35, 0, 0.12, 3, '#8D6E63', 'rgba(0,0,0,0)');
      panel(w, c.x + t + wide, 0, 0.12, 3, '#8D6E63', 'rgba(0,0,0,0)');
    }
    w.when(
      (w2) => w2.player.onGround && w2.player.cx >= X(9.6) && w2.player.cx <= X(12.4),
      (w2) => {
        say(w2, 'Kal vizhudhu! | The stone is falling!', X(11), 2);
        a.fall(w2, { delay: 0.45, land: true, g: 2200 });
      },
    );
    w.when(
      (w2) => w2.player.onGround && w2.player.cx >= X(16.5) && w2.player.cx < X(20.2),
      (w2) => b.fall(w2, { delay: 0.45, land: true, g: 2200 }),
    );
    onPass(w, X(3), (w2) => w2.guide('Periya kovil kal! Keezha nillu, nizhal! | The big temple stone! Stand under it, there is shade!'));
  },
};

/** CHN-08: the train that chased you is now your ride over the broken bridge; get off before the tunnel. */
const trainRoof: Act = {
  id: 'chn08-trainroof',
  w: 42,
  advice: 'The old bridge is broken: ride the train roof across it, and jump onto the tunnel before the train goes in.',
  paint: (g, c) => {
    g.fill(c.x + 2, c.x + 3, 14, 14, '#').fill(c.x + 4, c.x + 9, 13, 14, '#');
    g.pit(c.x + 12, c.x + 29);
    g.fill(c.x + 30, c.x + 37, 11, 12, '#');
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 12, c.x + 30, 15.4, { colors: ['rgba(40,140,170,0.85)', 'rgba(14,70,110,0.96)'] });
    panel(w, c.x + 10, G - 0.15, 20, 0.15, '#5D4037', 'rgba(0,0,0,0)');
    const cars = [10, 13, 16].map((t) => {
      const k = new Thing('traincar', X(t), px(G) - 26, { w: 48, h: 26, layer: -4 });
      return w.add(k);
    });
    let go = false;
    let off = 0;
    w.onTick((w2) => {
      if (!go && cars.some((k) => w2.standing(k.solid))) {
        go = true;
        w2.sfx('train', X(14), px(G));
        say(w2, 'Rameswaram Express kelambiduchu! | The Rameswaram Express is off!', X(14), G - 4);
      }
      if (!go) return;
      off += 72 * DT;
      for (const k of cars) k.solid.velX = 72;
      cars.forEach((k, i) => {
        if (!k.alive) return;
        k.place(w2, X([10, 13, 16][i]) + off, k.solid.y);
        if (k.solid.x > X(37)) {
          k.alive = false;
          k.solid.collidable = false;
        }
      });
    });
    sign(w, c.x + 4, 9.6, 4, 'PAMBAN', 'metro', null, 'platform 1');
    onPass(w, X(2), (w2) => w2.guide('Train-la ukkaaru, safe-aa poyiduvom! | Sit on the train, we will get there safe!'));
  },
};

export const levels = (): LevelDef[] => [
  tour({
    id: 'CHN-01',
    city: 'CHN',
    name: "Vanakkam Chennai",
    nameEn: "Welcome to Chennai",
    tagline: "Filter kaapi, share autos and a very, very long beach.",
    lines: [
      "Vanakkam! Chennai-ku varaverkirom! | Hello! Welcome to Chennai!",
      "Idhu Tamil Nadu-oda thalainagaram! | This is the capital of Tamil Nadu!",
      "Marina beach romba neelam! | Marina is one of the longest city beaches in the world!",
      "Fort St. George, 1644-la kattinaanga! | Fort St. George went up in 1644: the first English fort in India!",
      "Madras-oda pudhu peyar Chennai! | Madras became Chennai in 1996.",
      "Seri machi, ippo dhaan real game! | Okay buddy, now the real game starts!",
    ],
    shouts: [[21, "Kaapi! Degree kaapi! | Coffee! Strong filter coffee!"]],
    ride: "shareauto",
    item: "kaapi",
    signs: [[8, "CENTRAL", "station"], [55, "MARINA", "beach"], [102, "FORT ST. GEORGE", "1644"]],
    props: [
      ["lamp", 4, {}],
      ["stall", 20, { label: 'KAAPI' }],
      ["kudamrow", 34, {}],
      ["palm", 62, { h: 82, lean: 5 }],
      ["lamp", 106, {}],
    ],
    things: [["lighthouse", 60]],
    hint: 'On the promenade a sundal cart steams over the path each time the vendor lifts the lid, on a steady beat. The beat lies once: as you come up he lifts it again right after shutting it. Watch his hand, not the lid: it goes to the handle before every lift; cross when the lid is shut and his hand is down. Near the end, a Pongal pot boils over across the road. When it starts to bubble, back off a step or two: the spill runs further than where you stood, and the foam shoots up over the pot. When it stops steaming, walk on.',
    // hidden checkpoints: the sweep wants each one clear of anything a short run or a hop from it reaches (a hop
    // captured mid-jump carries 6+ tiles), so the one after the posts sits between the last two posts (the vendor
    // lifts the lid at 73, steam from 76) and the one after the wall is taken in the wall hop at 79 (the pot's
    // trigger is 86.8)
    cps: [17.5, 29.5, 57.5, 68.5, 79],
    extra: (w) => {
      sundalBite(w, 76);
      // trigger 86.8 and reach 2.6 (was 85.5 / 3.5): the spill still runs a tile past where you stood
      PongalPot.place(w, { tx: 88, groundTy: 15, triggerTx: 86.8, reach: 2.6 });
      prop(w, 'palm', 91, 15, { h: 70, lean: -4 }, -8);
    },
  }),
  longStage({
    base: {
    id: 'CHN-02',
    city: 'CHN',
    index: 2,
    name: 'Kudam Queue',
    nameEn: 'Water-pot queue',
    tagline: 'Everyone saved their place. Including the pots.',
    hint: 'Pot number three starts the stampede: hop from the second pot straight to the fourth. The water lorry sprays in a rhythm, and the road is wet.',
    par: 5,
    map: Grid.ground().fill(16, 19, 15, 15, '~').put(2, 14, '@').put(29, 14, 'E').rows(),
    build(w: World) {
      exitTwist(w, door(w), 'spikes');
      const tints = ['#E53935', '#1E88E5', '#43A047', '#FDD835', '#8E24AA', '#FB8C00'];
      // round 2 (human timing): the first two pots are the big ones (24 px, at 9 and 10.5), so the hop from the second
      // over the third has a 48 px run-up instead of 32: a jump up to 12 ticks late still leaves before pot three.
      // Pot three is still pot three (12), and the queue still ends in the wet (pots four to six at 13-15).
      const at = [9, 10.5, 12, 13, 14, 15];
      const pots = tints.map((tint, i) => thingOn(w, 'kudam', at[i], 15, i < 2 ? { tint, w: 24 } : { tint }));
      let tipped = false;
      w.when(
        (w2) => !tipped && w2.standing(pots[2].solid),
        () => {
          tipped = true;
          // stand on number three and the rest of the queue comes tumbling back at you
          w.say('Kudam uruludhu! | The pots are rolling!', pots[2].cx, pots[2].y - 10, 1.2, 'npc');
          pots.slice(3).forEach((p, i) =>
            w.after(0.15 + i * 0.15, () => {
              p.hide();
              w.sfx('pour', p.cx, p.y);
              roller(w, 'kudam', p.x, p.y, -130, { vy: -300, bounce: 0.35, cause: 'hit', ghost: true });
            }),
          );
        },
      );
      const lorry = thingOn(w, 'chn-lorry', 21, 15, { h: 40 });
      // round 2 (human timing): the spray pauses 1.3 s between bursts (was 0.8): the run from the pots to the lorry
      // takes 0.85 s, and a start up to 12 ticks late still makes it. The burst itself is unchanged.
      const spray = { period: 2.2, on: 0.9, phase: 0.4 };
      arc(w, px(21), 222, px(16), 236, 12, spray, 'rgba(120,190,230,0.95)', 'splash');
      lorry.look = 'leak';
      sign(w, 4, 10.6, 3.4, 'QUEUE HERE', 'shop', 'right', 'one pot per house');
      rival(w, 27, 15, -1, tara(0, -1));
      collectible(w, 'tumbler', 11.5, 10.5);
    },
  },
    par: 17,
    twist: 'chn-token',
    acts: [queueTwo],
  }),
  longStage({
    base: {
    id: 'CHN-03',
    city: 'CHN',
    index: 3,
    name: 'Subway Splash',
    tagline: 'One raindrop, and the subway is a swimming pool.',
    hint: 'The subway floods the moment you reach the bottom. Be on the blue drum when it does: it floats you up to the exit.',
    par: 4.5,
    map: Grid.ground()
      .fill(0, 7, 10, 14, '#')
      .fill(8, 8, 11, 14, '#')
      .fill(9, 9, 12, 14, '#')
      .fill(10, 10, 13, 14, '#')
      .fill(11, 11, 14, 14, '#')
      .fill(20, 20, 14, 14, '#')
      .fill(21, 21, 13, 14, '#')
      .fill(22, 22, 12, 14, '#')
      .fill(23, 31, 10, 14, '#')
      .fill(17, 21, 4, 4, '#')
      .put(3, 9, '@')
      .put(19, 3, 'E')
      .rows(),
    build(w: World) {
      door(w);
      // the subway's tiled walls, with a strip of light where the road is open above
      panel(w, 8, 10, 15, 5, '#6E8A94', 'rgba(255,255,255,0.18)');
      panel(w, 8, 10, 15, 0.5, '#4A5F68', 'rgba(0,0,0,0)', 64);
      const flood = w.add(new Water(17.5, { rate: 0, minTy: 5.44, colors: ['rgba(120,150,120,0.85)', 'rgba(50,70,60,0.95)'], cause: 'flood' }));
      const drum = w.add(new Floater(flood, 14, 14.125, 3, 'drum'));
      w.when(
        (w2) => (w2.player.onGround && w2.player.y > 200) || w2.standing(drum.solid),
        () => {
          flood.rate = 150;
          w.say('Subway niranjiduchu! | The subway is flooding!', px(15), px(11), 1.4, 'npc');
          w.sfx('splash', px(15), px(15));
        },
      );
      sign(w, 4.5, 6.6, 3.6, 'SUBWAY', 'metro', 'down', 'to the other side');
      prop(w, 'umbrellas', 27, 10, { n: 2 });
      rival(w, 26, 10, -1, tara(2, -1));
      collectible(w, 'tumbler', 15.5, 7);
    },
  },
    // the flood fills the subway: the only dry way on is the walkway from the balcony, then down the steps
    join: (g) => g.fill(22, 33, 4, 4, '=').fill(34, 35, 4, 17, '#').fill(36, 37, 7, 17, '#').fill(38, 39, 10, 17, '#').fill(40, 41, 13, 17, '#'),
    joinW: 12,
    waterTo: 34,
    par: 15,
    twist: 'chn-bull',
    acts: [floodFrogger],
  }),
  longStage({
    base: {
    id: 'CHN-04',
    city: 'CHN',
    index: 4,
    name: 'Degree Kaapi',
    nameEn: 'Proper filter coffee',
    tagline: 'Never walk between an uncle and his morning kaapi.',
    hint: 'Do not rest in the pillar’s shade: the pigeons live there. At the kaapi stall one stream is high and one is low: walk under the high one, jump over the low one.',
    par: 5,
    map: Grid.ground().pit(11, 20).fill(13, 17, 13, 13, '#').put(3, 14, '@').put(29, 14, 'E').rows(),
    build(w: World) {
      exitTwist(w, door(w), 'crush');
      thing(w, 'pillar', 14, 1, { solid: false, layer: -4, dx: 8, h: 192 });
      const birds = w.add(new Gust(13, 9, 7, 4, 330));
      let stood = 0;
      let flown = false;
      w.onTick((w2) => {
        if (flown) return;
        const p = w2.player;
        // the pigeons only mind you if you stop to rest in their shade
        const onLedge = p.onGround && p.y < 200 && p.x >= px(13) - 4 && p.x <= px(18) && Math.abs(p.vx) < 40;
        stood = onLedge ? stood + 1 : 0;
        if (stood >= 30) {
          flown = true;
          birds.on = true;
          w2.say('Pura parakkudhu! | The pigeons are flying!', p.cx, p.y - 18, 1.1, 'npc');
          w2.sfx('wind', p.cx, p.y);
          w2.after(0.5, () => (birds.on = false));
        }
      });
      prop(w, 'teastall', 25, 15, { label: 'KAAPI' });
      // round 2 (human timing): the two streams still take turns, 0.9 s each, but the cycle is 2.2 s (was 1.8), so
      // the low one rests 1.3 s: a walk under the high one that starts up to 12 ticks late still gets across
      arc(w, px(22), 228, px(27), 228, 5, { period: 2.2, on: 0.9, phase: 0 }, '#6D4C41', 'burnt');
      arc(w, px(22), 196, px(27), 196, 5, { period: 2.2, on: 0.9, phase: 1.1 }, '#6D4C41', 'burnt');
      rival(w, 6, 15, 1, tara(3, 1));
      collectible(w, 'tumbler', 15, 10);
    },
  },
    par: 17,
    twist: 'chn-catch',
    acts: [gullyCricket],
  }),
  longStage({
    base: {
    id: 'CHN-05',
    city: 'CHN',
    index: 5,
    name: 'Agni Mirage',
    nameEn: 'Peak-summer mirage',
    tagline: 'Is that the exit, or is the sun melting your eyes?',
    hint: 'The far door is a mirage. The real one appears in the shade of the tree you passed. Kites fly low along the beach: hop them, both ways.',
    par: 7,
    map: Grid.ground().put(4, 14, '@').put(9, 14, 'E').rows(),
    build(w: World) {
      const d = door(w);
      d.hidden = true;
      const dx = w.exitCell!.tx;
      prop(w, 'tree', 9, 15);
      prop(w, 'tree', dx, 15);
      // the first EXIT is a mirage; so is the one at the far end, just past the real (hidden) door
      const mirage = thingOn(w, 'chn-mirage', 28, 15, { solid: false, layer: -2 });
      const mirage2 = thingOn(w, 'chn-mirage', dx + 3, 15, { solid: false, layer: -2 });
      let seen = false;
      w.when(
        (w2) => w2.player.x >= px(26.5),
        () => {
          mirage.hide();
          w.say('Adhu veyil kaanal neer, pa! | That\'s a heat mirage, man!', px(28), px(11), 1.8, 'npc');
          w.sfx('poof', px(28), px(14));
        },
      );
      w.when(
        (w2) => !seen && w2.player.x >= px(dx + 1.5),
        () => {
          seen = true;
          mirage2.hide();
          w.say('Innoru kaanal neer! | Another mirage!', px(dx + 3), px(11), 1.8, 'npc');
          w.sfx('poof', px(dx + 3), px(14));
          w.after(0.4, () => {
            d.hidden = false;
            w.emit('fx', d.x + 8, d.y + 16, { kind: 'sparkle' });
          });
        },
      );
      // Marina kites: one every 1.6 s, low along the beach. When the mirage breaks the sea breeze turns,
      // and they come from the other side.
      const fly = () => {
        if (w.state !== 'play') return;
        // only along the open beach: in the room, and on the last stretch to the door
        const px0 = w.player.x;
        // (dx - 5, not dx - 8: the door's hidden checkpoint at dx - 9.5 must be calm for a short run from it; and
        // never at a dad who has not left the spawn yet: round 2, the first kite used to arrive 2.8 s in on anyone
        // still standing there)
        if ((px0 < px(30) && px0 > px(5.5)) || px0 > px(dx - 5)) {
          if (seen) shot(w, 'kite', px0 - 300, 222, 210, 0, 0, 'hit');
          else shot(w, 'kite', Math.min(px0 + 330, w.W + 16), 222, -210, 0, 0, 'hit');
        }
        w.after(1.6, fly);
      };
      w.after(1.2, fly);
      sign(w, 22, 10.6, 3, 'EXIT', 'green', 'right', 'semma close');
      prop(w, 'umbrellas', 16, 15, { n: 2 });
      rival(w, 13, 15, 1, tara(4, 1));
      collectible(w, 'tumbler', 20, 10.5);
      void Door;
    },
  },
    par: 15,
    acts: [heatFloor],
  }),
  // ------------------------------------------------------------------ around Tamil Nadu
  longStage({
    base: {
    id: 'CHN-06',
    city: 'CHN',
    index: 6,
    name: 'Madurai Malli',
    nameEn: 'Madurai jasmine',
    tagline: 'The jasmine market in Madurai: flowers by the arm’s length, and a crowd that pushes.',
    hint: 'The jasmine strings over the drain snap a moment after you land: hop along quickly. The crowd surges every few seconds and shoves you back, so jump the next gap between surges. That pile of petals is hiding a hole.',
    par: 6.5,
    scene: { kind: 'market', place: 'Madurai', with: ['garlands'] },
    map: Grid.ground().pit(8, 16).pit(21, 22).fill(25, 26, 15, 15, 'a').pit(25, 26, 16).put(2, 14, '@').put(29, 14, 'E').rows(),
    build(w: World) {
      door(w);
      [
        [8.5, 208],
        [11.5, 192],
        [14.5, 208],
      ].forEach(([tx, y]) => {
        const g = thing(w, 'garland', tx, 0, { oneWay: true, dy: y });
        let landed = -1;
        w.onTick((w2) => {
          if (g.state !== 'rest') return;
          if (landed < 0 && w2.standing(g.solid)) {
            landed = w2.tick;
            g.look = 'sag';
            w2.sfx('creak', g.cx, y);
          }
          if (landed >= 0 && (w2.tick - landed) * DT > 0.45) g.fall(w2, { g: 1400 });
        });
      });
      w.when(
        (w2) => w2.player.x >= px(3),
        () => w.say('Malli! Malli! Mozham pathu rooba! | Jasmine! Ten rupees a length!', px(6), px(11), 2.0, 'npc'),
      );
      // the crowd surges back every 2.4 s
      const crowd = gust(w, 18, 10, 6, 5, -210, { period: 2.4, on: 1.0, phase: 0.2 });
      let said = false;
      w.onTick((w2) => {
        if (!said && crowd.on && w2.player.x > px(18)) {
          said = true;
          w2.say('Thallaadheenga! | Stop pushing!', w2.player.cx, w2.player.y - 16, 1.0, 'npc');
        }
      });
      const petals = group(w, 'a');
      collapseOnStand(w, petals, 0.04);
      thing(w, 'flowers', 25, 14.4, { solid: false, layer: 2 });
      rival(w, 28, 15, -1, { intro: 'Malli vaanga, Dad! Madurai special! | Buy some jasmine, Dad! Madurai special!', point: -1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
      collectible(w, 'tumbler', 11.5, 9.4);
    },
  },
    par: 15,
    acts: [ladi],
    twist: 'chn-rangoli',
  }),
  longStage({
    base: {
    id: 'CHN-07',
    city: 'CHN',
    index: 7,
    name: 'Thanjavur Bommai',
    nameEn: 'Thanjavur dolls',
    tagline: 'Thanjavur’s head-shaking dolls never stop nodding. One of them says no.',
    hint: 'Land on a doll and it bounces you high: steer in the air (let go of right to drop short). The middle doll sways the most. The last one shakes its head and steps aside as you come down, so keep holding right.',
    par: 5,
    scene: { kind: 'market', place: 'Thanjavur' },
    map: Grid.ground().pit(6, 25).put(2, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      // round 2 (human timing): the dolls are 32 px wide (were 20), the middle one sways 12 px (was 20, still the
      // most) and the last one steps 10 px aside (was 14): the same decisions, with landings a late press still makes
      const sway = [6, 8, 12, 6, 0];
      [8, 12, 16, 20, 24].forEach((tx, i) => {
        const d = thing(w, 'doll', tx, 0, { dy: 212, w: 32, h: 28 });
        d.look = 'nod';
        d.spin = true;
        const x0 = px(tx) - 8;
        let squash = -1;
        let dodged = false;
        w.onTick((w2) => {
          const t = w2.tick * DT;
          let x = x0 + Math.sin(t * 2.1 + i * 1.3) * sway[i];
          // the last doll shakes its head as you fly at it, and steps aside
          if (i === 4) {
            const p = w2.player;
            // round 2: it steps aside as you come down FROM THE FOURTH DOLL (x > 22, was 19: that fired a flight
            // early and it had stepped back by the time you arrived) and stays aside long enough to land on
            if (!dodged && !p.onGround && p.x > px(22) && p.vy > 0) {
              dodged = true;
              w2.say('Illa! | No!', x0 + 10, 180, 0.9, 'npc');
              w2.after(1.6, () => (dodged = false));
            }
            x = x0 + (dodged ? 10 : 0);
          }
          d.place(w2, x, 212);
          if (squash < 0 && w2.standing(d.solid)) squash = w2.tick;
          // the bounce comes two ticks after the landing (was 0.06 s = 7 ticks, in which a dad at full speed ran
          // off the far side of the doll before it threw him): land anywhere on a doll and it bounces you
          if (squash >= 0 && w2.tick - squash >= 2) {
            squash = -1;
            const p = w2.player;
            if (w2.standing(d.solid)) {
              p.vy = -470;
              p.launched = true;
              p.onGround = false;
              w2.sfx('boing', d.cx, 212);
            }
          }
        });
      });
      rival(w, 27, 15, -1, { intro: 'Thalaiyatti bommai! Illa-nu solla theriyum! | Head-shaking dolls! They know how to say no!', point: -1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[1] });
      collectible(w, 'tumbler', 14, 7.6);
    },
  },
    par: 17,
    acts: [capstone],
    twist: 'chn-tips',
  }),
  longStage({
    base: {
    id: 'CHN-08',
    city: 'CHN',
    index: 8,
    name: 'Pamban Paalam',
    nameEn: 'Pamban bridge',
    tagline: 'The old sea bridge to Rameswaram. The train is behind you and the middle of the bridge lifts for ships.',
    hint: 'Waves spray up through the deck in rhythm: walk between them. The train comes up behind you, so don’t dawdle. The middle span lifts when you step on it: ride it up and down, then carry on. Spikes before the door.',
    par: 11,
    scene: { kind: 'water', place: 'Rameswaram', with: ['bridge'], sky: ['#6FB7D8', '#BFE4EE', '#F4EBD2'] },
    map: (() => {
      const g = new Grid().fill(0, 12, 12, 12, '#').fill(19, 31, 12, 12, '#');
      for (const c of [3, 9, 22, 28]) g.fill(c, c, 13, 17, '#');
      return g.put(1, 11, '@').put(30, 11, 'E').rows();
    })(),
    build(w: World) {
      exitTwist(w, door(w), 'spikes');
      water(w, 15.2, { rate: 0, minTy: 15.2, colors: ['rgba(40,150,190,0.85)', 'rgba(10,70,110,0.95)'], cause: 'splash' });
      geyser(w, px(6) + 8, px(15.2), 128, 2.2, [[0.4, 0.7]]);
      geyser(w, px(24) + 8, px(15.2), 128, 2.0, [[0, 0.6]]);
      geyser(w, px(26) + 8, px(15.2), 128, 2.0, [[1.0, 0.6]]);
      // the lifting span
      const span = thing(w, 'slab', 13, 0, { dy: 192, w: 96, h: 12 });
      let lifting = false;
      w.when(
        (w2) => !lifting && w2.standing(span.solid),
        () => {
          lifting = true;
          w.say('Kappal varudhu! | A ship is coming!', span.cx, 160, 1.4, 'npc');
          w.sfx('bell', span.cx, 190);
          span.moveTo(w, span.x, 136, 1.3, 'inOut', () => w.after(1.2, () => span.moveTo(w, span.x, 192, 1.0, 'inOut', () => (lifting = false))));
        },
      );
      // the train, coming up behind you
      let train: ReturnType<typeof rider> | null = null;
      w.onTick((w2) => {
        if (!train && w2.player.x >= px(4)) {
          // round 2 (human timing): the train starts four tiles further back (was -5), half a second more to let
          // the first wave pass before it is on you; it still comes, and still waits for no one
          train = rider(w2, 'chn-loco', -px(9), 12, 120, 5);
          w2.say('Poo! Poo! | Toot! Toot!', px(2), px(9), 1.2, 'npc');
          w2.sfx('honk', 0, px(11));
        }
        if (train && train.vx > 0 && train.x + train.w >= px(12.6)) train.vx = 0;
      });
      rival(w, 21, 12, 1, { intro: 'Pamban paalam! Train varum, odu! | Pamban bridge! A train is coming, run!', point: 1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[1] });
      collectible(w, 'tumbler', 15.5, 6.4);
    },
  },
    par: 19,
    twist: 'sink',
    acts: [trainRoof],
  }),
  // ------------------------------------------------------------------ encores (slots 9 and 10 of the allocation)
  // par = the bot's clear time x 1.35 (tests/par.test.ts): 31.6 s and 26.7 s at f0cde1e
  longStage({ base: murukkuRoom(), acts: [karandi, kannu, thenkuzhal, varisai, ruchi], twist: 'chn-fresh-curtain', par: 43, shape: 'long', meta: MURUKKU_META }),
  longStage({ base: spencerRoom(), acts: [moodal, kaanal, keezhe, pattarai], lives: 'act', twist: 'chn-wet-floor-sign', par: 36, shape: 'long', meta: SPENCER_META }),
];
