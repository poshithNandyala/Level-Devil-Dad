// Daman: two forts across a river mouth, boats you pedal, ice that melts under you, a boatyard that
// passes you hand to hand, a rope ferry, the fishmonger's scales and a Warli painter's brush.
import { Entity, type LevelDef, type World } from '../../world';
import { lines as L } from './lines';
import { collectible, door, prop, px, rival, sign } from '../../levels/kit';
import { DT } from '../../constants';
import type { Act } from '../../levels/acts';
import { pool } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { tour } from '../../levels/tour';
import { longStage } from '../../levels/chunks';
import { Grid } from '../../levels/grid';
import { Brush, IceBlock, Mooring, PedalBoat, PlankChain, RopeFerry, Scale } from './entities';

const TAUNTS = L.taunt;
const G = 15;
const RIVERMOUTH: [string, string] = ['rgba(92,150,170,0.88)', 'rgba(36,82,104,0.96)'];
const ICEWATER: [string, string] = ['rgba(150,210,235,0.9)', 'rgba(60,120,160,0.97)'];

// ================================================================== DMN-02: Nani to Moti (the pedal boat)
const boat = (w: World, tx: number, col?: string) => w.add(new PedalBoat(px(tx), px(G) - 4, { col }));

function boatRoom(): LevelDef {
  return {
    id: 'DMN-02',
    city: 'DMN',
    index: 2,
    name: 'Nani To Moti',
    nameEn: 'Fort to fort',
    tagline: 'The ferry’s on strike. There’s a pedal boat.',
    hint: 'Stand on the pedal boat and hold a direction: your legs drive the boat (you can’t walk on it while it moves). Hop the mooring line: you keep the boat’s speed and land on it again.',
    par: 7,
    map: Grid.ground(15).pit(5, 26).put(2, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      pool(w, 5, 27, 15.45, { colors: RIVERMOUTH, cause: 'splash' });
      w.flags.boats = [boat(w, 5)];
      w.add(new Mooring(px(15), px(G) - 26, px(15.5)));
      sign(w, 1, 10.4, 4.4, 'NANI DAMAN', 'wood', null, 'jetty');
      sign(w, 27.5, 10.4, 4.4, 'MOTI DAMAN', 'wood', null, 'fort');
      rival(w, 3, 15, 1, { intro: L.intro[1], point: 1, introAt: 0.5, taunts: TAUNTS, beaten: L.beaten[0] });
      onPass(w, px(4), (w2) => w2.guide('Hodi par ubha raho ne pagla maaro! | Stand on the boat and pedal!'));
      collectible(w, 'bombil', 15.2, 8.6);
    },
  };
}

/** DMN-02 act: the channel. Lines at chest height (hop them) and one high up (don't jump into it),
 *  and the sea's swell pushing the boat back now and then. */
const channel: Act = {
  id: 'dmn02-channel',
  w: 40,
  advice: 'The long channel: hop the low mooring lines but never jump under the high one, and keep pedalling through the swells that push you back.',
  paint: (g, c) => void g.pit(c.x + 3, c.x + 36),
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 3, c.x + 37, 15.45, { colors: RIVERMOUTH, cause: 'splash' });
    const b = boat(w, c.x + 3, '#00897B');
    w.flags.channelBoat = b;
    w.flags.lines = [X(11), X(19), X(30)];
    w.add(new Mooring(X(11), px(G) - 26, px(15.5)));
    // a high line: jump into it and you're tangled
    w.add(new Mooring(X(19), px(G) - 48, px(15.5)));
    w.add(new Mooring(X(30), px(G) - 26, px(15.5)));
    // the swell: every few seconds a wave rolls in from the sea and shoves the boat back
    let last = -1;
    w.onTick((w2) => {
      const k = Math.floor((w2.tick * DT) / 3.1);
      if (k !== last) {
        last = k;
        if (b.solid.x > X(4) && b.solid.x < X(34)) {
          b.shove = -55;
          w2.sfx('splash', b.solid.x, b.solid.y);
          w2.emit('fx', b.solid.x + 40, b.solid.y, { kind: 'splash' });
        }
      }
    });
    sign(w, c.x + 0.2, 10.4, 4.6, 'DAMAN GANGA', 'wood', null, 'channel');
    onPass(w, X(1), (w2) => w2.guide('Neechi doro par kudo, unchi par nahi! | Jump the low lines, not the high one!'));
  },
};

// ================================================================== DMN-03: the ice factory
const ice = (w: World, tx: number, wTiles: number, o: { salted?: boolean; ty?: number } = {}) =>
  w.add(new IceBlock(px(tx) + px(wTiles) / 2, px(o.ty ?? G) - 6, px(wTiles), { salted: o.salted }));

function iceRoom(): LevelDef {
  return {
    id: 'DMN-03',
    city: 'DMN',
    index: 3,
    name: 'Barf Kharkhanu',
    nameEn: 'The ice factory',
    tagline: 'The fish need ice. The ice needs you to hurry.',
    hint: 'The ice blocks are slippery and melt away while you stand on them (from both ends). Don’t linger: hop from block to block across the freezing water.',
    par: 6,
    map: Grid.ground(15).pit(5, 26).put(2, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      pool(w, 5, 27, 15.45, { colors: ICEWATER, cause: 'frozen' });
      w.flags.ice = [ice(w, 6, 2.5), ice(w, 11, 2), ice(w, 16, 2.5), ice(w, 21, 2)];
      sign(w, 1, 10.4, 4.6, 'ICE FACTORY', 'wood', null, 'Nani Daman');
      prop(w, 'lamp', 29, 15);
      rival(w, 3, 15, 1, { intro: L.intro[2], point: 1, introAt: 0.5, taunts: TAUNTS, beaten: L.beaten[1] });
      onPass(w, px(4), (w2) => w2.guide('Baraf pigle chhe, ubha na raho! | The ice melts, don’t stand still!'));
      collectible(w, 'bombil', 16, 9.6);
    },
  };
}

/** DMN-03 act: the dispatch yard. Salted blocks (sparkling) melt twice as fast, and the steam pipe
 *  over the middle melts whatever block is under it when it puffs. */
const dispatch: Act = {
  id: 'dmn03-dispatch',
  w: 36,
  advice: 'Salted blocks (they sparkle) melt more than twice as fast: be quick on those. The steam pipe melts the block under it whenever it puffs: cross that one just after a puff.',
  paint: (g, c) => void g.pit(c.x + 3, c.x + 32),
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 3, c.x + 33, 15.45, { colors: ICEWATER, cause: 'frozen' });
    const blocks = [ice(w, c.x + 4, 2), ice(w, c.x + 8, 2, { salted: true }), ice(w, c.x + 12, 2.5), ice(w, c.x + 17, 2), ice(w, c.x + 21, 2, { salted: true }), ice(w, c.x + 25, 2.5), ice(w, c.x + 29, 2, { salted: true })];
    w.flags.dispatch = blocks;
    // the steam pipe over block 3 (x+17): puffs every 2.8 s, melting the block under it at once
    const vx = X(18);
    const P = 2.8;
    w.flags.steam = { x: vx, P };
    let lastK = -1;
    w.onTick((w2) => {
      const k = Math.floor((w2.tick * DT) / P);
      if (k !== lastK) {
        lastK = k;
        w2.sfx('pour', vx, px(10));
        w2.emit('fx', vx, px(12), { kind: 'steam' });
        const b = blocks[3];
        if (!b.gone) b.melt(w2, 999);
        // a fresh block slides out under the pipe a moment later
        w2.after(0.9, () => {
          if (!b.gone) return;
          b.gone = false;
          b.w = b.w0;
          b.solid.collidable = true;
          b.melt(w2, 0);
        });
      }
    });
    w.add(
      new (class extends Entity {
        layer = 3;
        draw(ctx: CanvasRenderingContext2D, w2: World) {
          const t = (w2.tick * DT) % P;
          ctx.fillStyle = '#78909C';
          ctx.fillRect(vx - 3, 0, 6, px(10.5));
          ctx.fillRect(vx - 6, px(10.5), 12, 5);
          if (t < 0.5) {
            ctx.fillStyle = `rgba(255,255,255,${0.8 * (1 - t / 0.5)})`;
            ctx.beginPath();
            ctx.ellipse(vx, px(12.5), 14, 18 * (0.5 + t), 0, 0, Math.PI * 2);
            ctx.fill();
          } else if (t > P - 0.6) {
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillRect(vx - 1, px(11), 2, 3 + Math.sin(t * 40) * 2);
          }
        }
      })(),
    );
    sign(w, c.x + 0.2, 10.4, 4.4, 'DISPATCH', 'warn', null, 'mind the steam');
    onPass(w, X(1), (w2) => w2.guide('Meethu vaalu baraf jaldi pigle! | The salted ice melts fast!'));
  },
};


// ================================================================== DMN-04: the boatyard's human chain
/** a chain of carpenters: resting spots for the plank (top-left px), lowest first */
const spotsFrom = (pts: [number, number][]) => pts.map(([tx, top]) => ({ x: px(tx), y: top }));

function chainRoom(): LevelDef {
  return {
    id: 'DMN-04',
    city: 'DMN',
    index: 4,
    name: 'Haath Ma Haath',
    nameEn: 'Hand to hand',
    tagline: 'A dhow is built by forty pairs of hands. Today, also yours. Well, your feet.',
    hint: 'The carpenters pass a plank from hand to hand up the scaffold. Stand on it at the bottom and it carries you up; hop off on to the deck at the top.',
    par: 9,
    map: Grid.ground(15).pit(6, 21).fill(22, 27, 7, 14, '#').fill(28, 29, 10, 14, '#').fill(30, 31, 13, 14, '#').put(2, 14, '@').put(25, 6, 'E').rows(),
    build(w: World) {
      door(w);
      pool(w, 6, 22, 15.45, { colors: RIVERMOUTH, cause: 'splash' });
      const c = w.add(new PlankChain(spotsFrom([[6, 208], [10, 176], [14, 144], [18, 112]]), { rest: 1.0, pass: 0.7, back: 0.8 }));
      w.flags.chain = c;
      sign(w, 1, 10.4, 4.4, 'BOATYARD', 'wood', null, 'dhows');
      rival(w, 3, 15, 1, { intro: L.intro[3], point: 1, introAt: 0.5, taunts: TAUNTS, beaten: L.beaten[0] });
      onPass(w, px(4), (w2) => w2.guide('Patiya par chadho, kaarigaro upar laijashe! | Get on the plank, the carpenters will take you up!'));
      collectible(w, 'bombil', 14.6, 4.6);
    },
  };
}

/** DMN-04 act: a longer chain round the hull, and one carpenter dozing on every other round: on those
 *  rounds the plank slips from his hands into the water. Ride a round he's awake for. */
const chainAct: Act = {
  id: 'dmn04-dozer',
  w: 38,
  advice: 'A longer chain, and the fourth carpenter dozes off every other round (z z): that round he drops the plank in the water. Wait at the bottom for a round he’s awake, then ride it all the way up.',
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 3, x + 30);
    g.fill(x + 31, x + 37, 4, 14, '#');
  },
  build: (w, c) => {
    pool(w, c.x + 3, c.x + 31, 15.45, { colors: RIVERMOUTH, cause: 'splash' });
    const ch = w.add(
      new PlankChain(
        spotsFrom([
          [c.x + 3, 208],
          [c.x + 7, 184],
          [c.x + 11, 160],
          [c.x + 15, 136],
          [c.x + 19, 112],
          [c.x + 23, 88],
          [c.x + 27, 64],
        ]),
        { rest: 0.9, pass: 0.6, back: 0.9, dozer: 3 },
      ),
    );
    w.flags.dozerChain = ch;
    sign(w, c.x + 0.2, 10.4, 4.4, 'SLIPWAY', 'wood', null, 'mind the gap');
    onPass(w, c.X(1), (w2) => w2.guide('Chotho kaarigar oonghe chhe! Dhyan rakho! | The fourth one is dozing! Watch out!'));
  },
};


// ================================================================== DMN-05: Panikotha, the rope ferry
function ferryRoom(): LevelDef {
  return {
    id: 'DMN-05',
    city: 'DMN',
    index: 5,
    name: 'Panikotha',
    nameEn: 'The fort in the sea',
    tagline: 'No boatman, no engine. Just a rope and your thumbs.',
    hint: 'Step on to the raft: your hands go on the rope. Every tap of jump hauls it along; ease off and the current drags it back. Keep tapping till it docks.',
    par: 7,
    map: Grid.ground(15).pit(5, 26).put(2, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      pool(w, 5, 27, 15.45, { colors: RIVERMOUTH, cause: 'splash' });
      w.flags.rafts = [w.add(new RopeFerry(px(5), px(27), px(G) - 4, {}))];
      sign(w, 1, 10.4, 4.4, 'PANIKOTHA', 'wood', null, 'fortim do mar');
      rival(w, 3, 15, 1, { intro: L.intro[4], point: 1, introAt: 0.5, taunts: TAUNTS, beaten: L.beaten[1] });
      onPass(w, px(4), (w2) => w2.guide('Kudo nahi, kheencho! Fari fari daabo! | Don’t jump, pull! Tap again and again!'));
      collectible(w, 'bombil', 16, 8.4);
    },
  };
}

/** DMN-05 act: three channels between sandbars, each current stronger than the last. On the last one
 *  the tide comes in: be across before its count runs out. */
const tideAct: Act = {
  id: 'dmn05-tide',
  w: 46,
  advice: 'Three channels, each current stronger. On the last, the tide is coming in: haul without stopping, or it sweeps the raft away when the count runs out.',
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 14).pit(c.x + 17, c.x + 28).pit(c.x + 31, c.x + 43);
  },
  build: (w, c) => {
    const r = (a: number, b: number, o: ConstructorParameters<typeof RopeFerry>[3]) => {
      pool(w, c.x + a, c.x + b + 1, 15.45, { colors: RIVERMOUTH, cause: 'splash' });
      return w.add(new RopeFerry(c.X(a), c.X(b + 1), px(G) - 4, o));
    };
    w.flags.tideRafts = [r(3, 14, { drag: 75 }), r(17, 28, { drag: 95, pull: 30 }), r(31, 43, { drag: 110, pull: 32, tide: 7 })];
    sign(w, c.x + 0.2, 10.4, 4.6, 'BHARTI', 'warn', null, 'tide rising');
    onPass(w, c.X(1), (w2) => w2.guide('Pani nu jor vadhe chhe, jaldi kheencho! | The current is getting stronger, pull fast!'));
  },
};


// ================================================================== DMN-06: the fish market's scales
function scaleRoom(): LevelDef {
  return {
    id: 'DMN-06',
    city: 'DMN',
    index: 6,
    name: 'Machhi Bazaar',
    nameEn: 'The fish market',
    tagline: 'Everything is sold by weight. Including Dad.',
    hint: 'Stand on the right-hand pan of the big balance: every crate the porter loads on the other pan lifts you a little. At the top, step off on to the loft before the lot is sold and you drop.',
    par: 9,
    map: Grid.ground(15).fill(18, 31, 10, 14, '#').put(2, 14, '@').put(26, 9, 'E').rows(),
    build(w: World) {
      door(w);
      w.flags.scale = w.add(new Scale(px(14), 196, { mine: 'B', every: 1.4, max: 4, hold: 1.4 }));
      sign(w, 1, 10.4, 4.4, 'MACHHI BAZAAR', 'shop', null, 'fish market');
      rival(w, 4, 15, 1, { intro: 'Pallu par ubha raho, Dad! | Stand on the pan, Dad!', point: 1, introAt: 0.5, taunts: TAUNTS, beaten: L.beaten[0] });
      onPass(w, px(6), (w2) => w2.guide('Ek ek petti, tame upar! | Crate by crate, up you go!'));
      collectible(w, 'bombil', 15, 5.4);
    },
  };
}

/** DMN-06 act: two balances up to the auction loft. The second porter loads faster, and his lot is
 *  sold sooner, so there's less time at the top. */
const auctionLoft: Act = {
  id: 'dmn06-loft',
  w: 34,
  advice: 'Two balances, one above the other: ride the first up to the middle loft, cross to the second, and ride it up too. The second porter is quicker, so step off as soon as you’re level.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 13, x + 21, 10, 14, '#');
    g.fill(x + 29, x + 33, 6, 14, '#');
  },
  build: (w, c) => {
    w.flags.scales = [w.add(new Scale(c.X(9), 196, { mine: 'B', every: 1.2, max: 4, hold: 1.2, phase: 0.5 })), w.add(new Scale(c.X(24), 132, { mine: 'B', every: 0.9, max: 4, hold: 1.0, phase: 1.1 }))];
    sign(w, c.x + 0.2, 10.4, 4.6, 'NILAAM', 'shop', null, 'auction loft');
    onPass(w, c.X(1), (w2) => w2.guide('Biju taraju vadhu jaldi chhe! | The second scale is faster!'));
  },
};


// ================================================================== DMN-07: Warli Rang (Silvassa)
function warliRoom(): LevelDef {
  return {
    id: 'DMN-07',
    city: 'DMN',
    index: 7,
    name: 'Warli Rang',
    nameEn: 'The painted path',
    tagline: 'In Silvassa the paintings walk. And so can you, on them.',
    hint: 'The Warli painter’s brush paints a path across the gorge as it goes, and the paint fades behind it. Walk right behind the brush, never ahead of it, and don’t dawdle.',
    par: 7,
    map: Grid.ground(15).pit(5, 26).put(2, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const path: [number, number, boolean?][] = [
        [px(4) + 8, 240],
        [px(8), 236],
        [px(12), 240],
        [px(16), 236],
        [px(20), 240],
        [px(24), 236],
        [px(27) + 4, 240],
      ];
      w.flags.brushes = [w.add(new Brush(path, { speed: 90, life: 2.6, startX: px(3), again: 2 }))];
      sign(w, 1, 10.4, 4.4, 'SILVASSA', 'wood', null, 'Warli art');
      rival(w, 2, 15, 1, { intro: 'Chitra par chalo, Dad! | Walk on the painting, Dad!', point: 1, introAt: 0.5, taunts: TAUNTS, beaten: L.beaten[1] });
      onPass(w, px(3), (w2) => w2.guide('Peenchhi ni pachhal pachhal chalo! | Walk right behind the brush!'));
      collectible(w, 'bombil', 16, 10.4);
    },
  };
}

/** DMN-07 act: a faster brush, paint that fades sooner, hills and two places where the painter lifts
 *  the brush off the wall (jump those). */
const warliAct: Act = {
  id: 'dmn07-hills',
  w: 36,
  advice: 'A faster brush and shorter-lived paint, up and down hills, and twice the painter lifts the brush: jump those gaps, still close behind it.',
  paint: (g, c) => void g.pit(c.x + 3, c.x + 32),
  build: (w, c) => {
    const X = c.X;
    const path: [number, number, boolean?][] = [
      [X(2) + 8, 240],
      [X(6), 224],
      [X(9), 208],
      [X(10.5), 208, true],
      [X(12), 208],
      [X(15), 196],
      [X(18), 208],
      [X(20), 216, true],
      [X(21.5), 216],
      [X(26), 224],
      [X(30), 236],
      [X(33) + 4, 240],
    ];
    w.flags.hillBrush = w.add(new Brush(path, { speed: 115, life: 1.9, startX: X(1.6), again: 2 }));
    sign(w, c.x + 0.2, 10.4, 4.2, 'TARPA', 'wood', null, 'dance trail');
    onPass(w, X(1), (w2) => w2.guide('Have peenchhi jaldi chale chhe! | Now the brush is faster!'));
  },
};


// ================================================================== DMN-08: Diu, everything at once
function diuRoom(): LevelDef {
  return {
    id: 'DMN-08',
    city: 'DMN',
    index: 8,
    name: 'Diu Durg',
    nameEn: 'The fort at Diu',
    tagline: 'Daman’s little sister across the sea. Same tricks, more of them.',
    hint: 'Diu’s sea moat: ice blocks first, quickly, before they melt.',
    par: 7,
    map: Grid.ground(15).pit(5, 26).put(2, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      pool(w, 5, 27, 15.45, { colors: ICEWATER, cause: 'frozen' });
      w.flags.diuIce = [ice(w, 6, 2), ice(w, 10, 2, { salted: true }), ice(w, 14, 2.5), ice(w, 19, 2, { salted: true }), ice(w, 23, 2)];
      sign(w, 1, 10.4, 4, 'DIU', 'wood', null, 'fortaleza');
      rival(w, 3, 15, 1, { intro: 'Diu ma badhuj bheju! | All of it together in Diu!', point: 1, introAt: 0.5, taunts: TAUNTS, beaten: L.beaten[0] });
      collectible(w, 'bombil', 14.6, 10.6);
    },
  };
}

/** DMN-08 act: the rope ferry with the tide, the pedal boat past the lines, and the fishmonger's
 *  balance up the bastion, one after another. */
const diuAct: Act = {
  id: 'dmn08-diu',
  w: 60,
  advice: 'Then everything Daman taught you, in a row: haul the rope ferry before the tide count runs out, pedal the boat and hop the lines, and ride the balance up the bastion.',
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 3, x + 14).pit(x + 17, x + 34);
    g.fill(x + 46, x + 59, 10, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    pool(w, x + 3, x + 15, 15.45, { colors: RIVERMOUTH, cause: 'splash' });
    pool(w, x + 17, x + 35, 15.45, { colors: RIVERMOUTH, cause: 'splash' });
    w.flags.diuRaft = w.add(new RopeFerry(c.X(3), c.X(15), px(G) - 4, { drag: 90, pull: 30, tide: 7 }));
    w.flags.diuBoat = w.add(new PedalBoat(c.X(17), px(G) - 4, { col: '#C62828' }));
    w.flags.diuLines = [c.X(24), c.X(30)];
    w.add(new Mooring(c.X(24), px(G) - 26, px(15.5)));
    w.add(new Mooring(c.X(30), px(G) - 26, px(15.5)));
    w.flags.diuScale = w.add(new Scale(c.X(42), 196, { mine: 'B', every: 1.1, max: 4, hold: 1.2, phase: 0.3 }));
    sign(w, x + 0.2, 10.4, 4.4, 'FORTIM', 'wood', null, 'sea bastion');
    onPass(w, c.X(1), (w2) => w2.guide('Doradu, hodi, ane taraju! | The rope, the boat, and the scale!'));
  },
};

export const levels = (): LevelDef[] => [
  tour({
    id: 'DMN-01',
    city: 'DMN',
    name: 'Daman Darshan',
    nameEn: 'Seeing Daman',
    tagline: 'Two forts, one river mouth, and fish drying on every rack.',
    lines: [
      'Kem cho, Dad! Damanma aavo! | Hi Dad! Welcome to Daman!',
      'Daman Ganga be killa ne alag kare chhe! | The Daman Ganga river splits the two forts!',
      'Moti Daman no killo Portuguese ae bandhyo! | The Portuguese built the Moti Daman fort!',
      'Ahiya na machhimar roj dariye jay chhe! | The fishermen here head out to sea every day!',
      'Diu pan aapno j bhaag chhe! | Diu is part of us too!',
      'Chalo Dad, have saacho khel! | Come on Dad, now the real game!',
    ],
    shouts: [
      [21, 'Bombil! Taaja bombil! | Bombay duck! Fresh!'],
      [84, 'Hodi jay chhe! Jaldi! | The boat’s leaving! Quick!'],
    ],
    ride: 'cart',
    item: 'bombil',
    signs: [
      [8, 'NANI DAMAN', 'jetty'],
      [55, 'DAMAN GANGA', 'river'],
      [102, 'MOTI DAMAN', 'fort'],
    ],
    props: [
      ['lamp', 4, {}],
      ['stall', 20, { label: 'BOMBIL' }],
      ['crowd', 33, { n: 3 }],
      ['lamp', 62, {}],
      ['crowd', 90, { n: 3 }],
      ['lamp', 106, {}],
    ],
    things: [],
  }),
  longStage({
    base: boatRoom(),
    par: 26,
    acts: [channel],
    twist: 'customs',
  }),
  longStage({
    base: iceRoom(),
    par: 24,
    acts: [dispatch],
    twist: 'coldstore',
  }),
  longStage({
    base: chainRoom(),
    par: 42,
    acts: [chainAct],
    twist: 'flag',
  }),
  longStage({
    base: ferryRoom(),
    par: 30,
    acts: [tideAct],
    twist: 'drawbridge',
  }),
  longStage({
    base: scaleRoom(),
    par: 40,
    acts: [auctionLoft],
    twist: 'slidedoor',
  }),
  longStage({
    base: warliRoom(),
    par: 22,
    acts: [warliAct],
    twist: 'paintwall',
  }),
  longStage({
    base: diuRoom(),
    par: 50,
    acts: [diuAct],
    twist: 'tipjetty',
  }),
];
