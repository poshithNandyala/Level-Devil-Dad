import type { LevelDef, World } from '../../world';
import { Door } from '../../entities/basics';
import { lines as L } from './lines';
import { auto, collapseOnStand, door, geyser, group, panel, pot, prop, px, rival, roller, sign, spring, collectible, thing } from '../../levels/kit';
import { Thing as ThingC } from '../../entities/traps';
import { Entity, type Hazard } from '../../world';
import { Act, G, deco } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { tour } from '../../levels/tour';
import { longStage } from '../../levels/chunks';
import { Grid } from '../../levels/grid';
import { DT } from '../../constants';
import type { Thing } from '../../entities/traps';
import { exitTwist } from '../../levels/twists';

// Hyderabad: an auto-rickshaw carrying the exit responds to your movement.
// Telugu + Dakhni (Hyderabadi Hindi) + English, all mixed up, like the city.

const TAUNTS = L.taunt;


// ------------------------------------------------------------------ acts (one per stage, never repeated)
const say = (w: World, line: string, x: number, ty: number, t = 1.3) => w.say(line, x, px(ty), t, 'npc');

/** A dark copy of Dad that walks your exact path 1.6 s behind you (touch it and you're caught). */
class Shadow extends Entity {
  x = -99;
  y = -99;
  hazard: Hazard;
  constructor() {
    super();
    this.layer = 2;
    const self = this;
    this.hazard = { active: true, cause: 'caught', hits: (x, y, w, h) => self.alive && x < self.x + 8 && x + w > self.x + 2 && y < self.y + 13 && y + h > self.y + 2 };
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (this.x < -50) return;
    ctx.save();
    ctx.globalAlpha = 0.55 + Math.sin(w.tick * 0.2) * 0.1;
    ctx.fillStyle = '#1B1030';
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, 10, 14, 3);
    ctx.fill();
    ctx.fillStyle = '#FF5252';
    ctx.fillRect(this.x + 2, this.y + 4, 2, 2);
    ctx.fillRect(this.x + 6, this.y + 4, 2, 2);
    ctx.restore();
  }
}

/** HYD-02: your shadow follows your exact path 1.6 s behind: never wait longer than that. */
const shadow: Act = {
  id: 'hyd02-shadow',
  w: 32,
  advice: 'Your own shadow follows your exact path, a moment and a half behind: never stop for longer than that. Cross the steam the moment it dies down.',
  paint: (g, c) => {
    g.pit(c.x + 20, c.x + 21);
  },
  build: (w, c) => {
    const { X } = c;
    const sh = w.add(new Shadow());
    const rec: [number, number][] = [];
    let on = false;
    onPass(w, X(2), (w2) => {
      on = true;
      say(w2, 'Arre, peeche dekho! | Hey, look behind you!', X(4), G - 4, 1.2);
    });
    w.onTick((w2) => {
      if (!on) return;
      const p = w2.player;
      rec.push([p.x, p.y]);
      const i = rec.length - 1 - 192;
      if (i >= 0 && rec[i][0] < X(29.5)) [sh.x, sh.y] = rec[i];
      else if (i >= 0) {
        sh.alive = false;
        sh.hazard.active = false;
      }
    });
    geyser(w, X(12) + 8, px(G), 84, 2.2, [[0, 0.9]], 'burnt');
    sign(w, c.x + 0.5, G - 4.4, 3.4, 'OLD CITY', 'green', 'right', 'no shortcuts');
    onPass(w, X(1), (w2) => w2.guide('Aaram se, miya, koi jaldi nahi! | Take it easy, buddy, no rush!'));
  },
};

/** HYD-03: three whistles of the pressure cooker: the first two lift you up, the third is the dangerous one. */
const cooker: Act = {
  id: 'hyd03-cooker',
  w: 30,
  advice: 'The pressure cooker vents lift you up a ledge each: the first whistle, the second whistle... and the third shoots you into the ceiling. Jump over it.',
  paint: (g, c) => {
    g.fill(c.x + 6, c.x + 10, 11, 14, '#').fill(c.x + 12, c.x + 17, 7, 14, '#');
    g.fill(c.x + 14, c.x + 18, 2, 2, 'v').fill(c.x + 13, c.x + 19, 1, 1, '#');
  },
  build: (w, c) => {
    const { X } = c;
    [
      [4, G, 'Ek whistle! | One whistle!'],
      [9, 11, 'Do whistle! | Two whistles!'],
      [16, 7, 'Teen whistle! Biryani ready! | Three whistles! Biryani’s ready!'],
    ].forEach(([t, ty, line]) => {
      const v = spring(w, 'spout', c.x + (t as number), ty as number, 500, { dy: 8 });
      v.onFire = (w2) => {
        w2.sfx('whistle', X(t as number), px(ty as number));
        say(w2, line as string, X((t as number) + 0.5), (ty as number) - 3, 1);
      };
    });
    sign(w, c.x + 0.5, G - 4.4, 3.4, 'DUM KITCHEN', 'shop', null, 'pressure, miya');
    onPass(w, X(1), (w2) => w2.guide('Teesra whistle sabse safe! | The third whistle is the safest!'));
  },
};

/** HYD-04: Statue! When she shouts it, freeze: moving (or being in the air) gets you caught. */
const statue: Act = {
  id: 'hyd04-statue',
  w: 32,
  advice: 'Statue! When the kids shout it, freeze: if you are moving or in the air, you are out. Plan each jump so you land before the shout.',
  paint: (g, c) => {
    g.pit(c.x + 12, c.x + 13).pit(c.x + 26, c.x + 27);
    g.fill(c.x + 20, c.x + 20, 14, 14, '#');
  },
  build: (w, c) => {
    const { X } = c;
    let t0 = -1;
    onPass(w, X(2), (w2) => (t0 = w2.tick));
    const PERIOD = 3.4;
    w.onTick((w2) => {
      if (t0 < 0) return;
      const p = w2.player;
      if (p.cx > X(29)) {
        w2.flags[c.f('phase')] = 'go';
        return;
      }
      const t = ((w2.tick - t0) * DT) % PERIOD;
      const ph = t < 1.8 ? 'go' : t < 2.2 ? 'ready' : 'statue';
      if (ph !== w2.flags[c.f('phase')]) {
        if (ph === 'ready') say(w2, 'Ready...', p.cx, p.y / 16 - 1.5, 0.4);
        if (ph === 'statue') say(w2, 'STATUE!', p.cx, p.y / 16 - 1.5, 1.1);
      }
      w2.flags[c.f('phase')] = ph;
      w2.flags[c.f('left')] = ph === 'go' ? 1.8 - t : 0;
      if (ph === 'statue' && (Math.abs(p.vx) > 8 || !p.onGround)) {
        say(w2, 'Out! Hila diya! | Out! You moved!', p.cx, p.y / 16 - 2, 1);
        w2.die('caught');
      }
    });
    sign(w, c.x + 0.5, G - 4.4, 3.4, 'STATUE!', 'shop', null, 'galli game');
    onPass(w, X(1), (w2) => w2.guide('Statue khelte, miya! Dekhte hain! | Let’s play Statue, buddy!'));
  },
};

/** HYD-05: Sankranti kites over the gully: hop from kite to kite; one gets cut the moment you land on it. */
const kites: Act = {
  id: 'hyd05-kites',
  w: 32,
  advice: 'Hop across the gully on the kites. One of them gets cut in a kite fight the moment you land on it: jump straight off.',
  paint: (g, c) => {
    g.pit(c.x + 4, c.x + 24);
  },
  build: (w, c) => {
    const { X } = c;
    const base = [226, 214, 222, 210, 220];
    base.forEach((y0, i) => {
      const k = w.add(new ThingC('kite', X(5 + i * 4), y0, { w: 32, h: 8, layer: 3, oneWay: true }));
      k.tint = ['#E53935', '#1E88E5', '#FDD835', '#8E24AA', '#43A047'][i];
      let cut = -1;
      w.onTick((w2) => {
        if (i === 3 && cut < 0 && w2.standing(k.solid)) {
          cut = w2.tick;
          say(w2, 'Kaate! | Cut!', k.cx, k.y / 16 - 2, 0.9);
          w2.sfx('snap', k.cx, k.y);
        }
        if (cut >= 0 && (w2.tick - cut) * DT > 0.45) {
          k.solid.velX = 120;
          k.place(w2, k.solid.x + 120 * DT + 0.5, k.solid.y - 160 * DT - 0.5);
          return;
        }
        k.place(w2, k.solid.x, y0 + Math.sin(w2.tick * DT * 2.4 + i) * 3);
      });
    });
    sign(w, c.x + 0.5, G - 4.4, 3.4, 'SANKRANTI', 'shop', null, 'kite fight');
    onPass(w, X(2), (w2) => w2.guide('Patang pe chadh jao, miya! | Climb on the kites, buddy!'));
  },
};

/** HYD-06: Golconda's echo: a second after you land, a stone falls where you landed. Never wait where you landed. */
const echo: Act = {
  id: 'hyd06-echo',
  w: 32,
  advice: 'Golconda echoes: a moment after you land, a stone drops right where you landed. Step away before you wait, and wait for the gate a few steps from your landing.',
  paint: (g, c) => {
    for (const t of [6, 12, 18]) g.pit(c.x + t, c.x + t + 1);
    g.fill(c.x + 25, c.x + 25, 9, 14, c.L[0]);
  },
  build: (w, c) => {
    const { X } = c;
    let lastLand = -1;
    w.onTick((w2) => {
      const p = w2.player;
      if (p.cx < X(1) || p.cx > X(27) || p.landTick === lastLand || w2.tick - p.landTick > 2) return;
      lastLand = p.landTick;
      const x = p.cx - 6;
      w2.after(0.9, () => {
        const st = w2.add(new ThingC('cannonball', x, -12, { layer: 3 }));
        st.setDeadly('crushed');
        st.fall(w2, { g: 2400, v0: 200, then: () => st.setDeadly(false) });
        w2.sfx('crack', x, px(2));
      });
    });
    const gt = group(w, c.L[0]);
    gt.paint = { fill: '#5D4037', trim: '#3E2723', line: 'rgba(0,0,0,0.3)' };
    let open = false;
    w.onTick((w2) => {
      const want = (w2.tick * DT) % 2.4 < 1.0;
      if (want === open || gt.state === 'tween') return;
      open = want;
      gt.slide(w2, 0, want ? -4 : 4, 0.16, want ? 'out' : 'in', (w3) => {
        const p = w3.player;
        if (!open && p.x + p.w > gt.solid.x && p.x < gt.solid.x + 16 && p.y + p.h > gt.solid.y) w3.die('crushed');
      });
    });
    sign(w, c.x + 0.5, G - 4.4, 3.4, 'GOLCONDA', 'wood', null, 'mind the echo');
    onPass(w, X(1), (w2) => w2.guide('Yahan se taali bajao, miya! | Clap from here, buddy!'));
  },
};

/** HYD-07: bangle boxes fly from the balcony in a rhythm: wait for your gap. Then the next balcony aims at whoever stands still. */
const bangleBoxes: Act = {
  id: 'hyd07-boxes',
  w: 32,
  advice: 'Bangle boxes drop from the first balcony in a steady rhythm: walk through between two. Under the next balconies, never stand still: they drop on anyone who waits.',
  build: (w, c) => {
    const { X } = c;
    const drop = (x: number) => {
      const b = w.add(new ThingC('crate', x, 40, { layer: 3, w: 16, h: 12 }));
      b.tint = '#C2185B';
      b.setDeadly('crushed');
      b.fall(w, {
        g: 2600,
        then: (w2) => {
          b.setDeadly(false);
          w2.after(0.3, () => {
            b.hide();
            b.solid.collidable = false;
          });
        },
      });
    };
    let next = 0;
    w.onTick((w2) => {
      w2.flags[c.f('due')] = next;
      if (w2.tick < next) return;
      next = w2.tick + Math.round(1.1 / DT);
      if (w2.player.cx < X(12)) drop(X(10));
    });
    let still = 0;
    w.onTick((w2) => {
      const p = w2.player;
      const under = p.cx > X(15) && p.cx < X(28);
      still = under && p.onGround && Math.abs(p.vx) < 20 ? still + 1 : 0;
      if (still === 36) {
        say(w2, 'Lo, chudiyan! | Here, bangles!', p.cx, 6, 0.8);
        drop(p.cx - 8);
      }
    });
    for (const t of [9, 16, 22]) panel(w, c.x + t, 2, 3, 0.4, '#8D6E63', 'rgba(0,0,0,0.2)');
    sign(w, c.x + 0.5, G - 4.4, 3.4, 'LAAD BAZAAR', 'shop', null, 'bangles, wholesale');
    onPass(w, X(1), (w2) => w2.guide('Ruk jao, miya, aaram se dekho! | Stop, buddy, have a look around!'));
  },
};

/** HYD-08: "Action!": reach the mark before "Cut!", or it's a retake from the top. A set wall falls behind you. */
const retake: Act = {
  id: 'hyd08-retake',
  w: 32,
  advice: 'Action! Reach the mark before the director shouts Cut, or it is a retake from the start of the scene. Don’t slow down: the set wall falls behind you.',
  paint: (g, c) => {
    g.pit(c.x + 14, c.x + 15);
    g.fill(c.x + 20, c.x + 21, 8, 9, c.L[0]);
  },
  build: (w, c) => {
    const { X } = c;
    const wall = group(w, c.L[0]);
    wall.paint = { fill: '#F2C14E', trim: '#8D6E63', line: 'rgba(0,0,0,0.15)' };
    onPass(w, X(20.2), (w2) => wall.fall(w2, { delay: 0.04, land: true, g: 2600 }));
    let t0 = -1;
    w.onTick((w2) => {
      const p = w2.player;
      if (t0 < 0 && p.cx >= X(10) && p.cx < X(11)) {
        t0 = w2.tick;
        say(w2, 'Action! | Action!', X(12), 6, 0.8);
        w2.sfx('clap', X(10), px(G));
      }
      if (t0 >= 0 && p.cx >= X(26)) {
        t0 = -2;
        say(w2, 'Cut! Perfect shot! | Cut! Perfect shot!', X(26), 6, 1);
      }
      if (t0 >= 0 && (w2.tick - t0) * DT > 2.4) {
        t0 = -1;
        say(w2, 'Cut! Retake! | Cut! Retake!', X(9), 6, 1.2);
        w2.warp(X(8), px(G) - 14);
      }
    });
    deco(w, 'clock', X(26), G, { layer: -3 });
    sign(w, c.x + 0.5, G - 4.4, 3.4, 'SET 4', 'shop', null, 'take 27');
    onPass(w, X(1), (w2) => w2.guide('Slow motion shot hai, aaram se! | It’s a slow motion shot, take it easy!'));
  },
};

export const levels = (): LevelDef[] => [
  tour({
    id: 'HYD-01',
    city: 'HYD',
    name: "Khush Aamdeed",
    nameEn: "Welcome to Hyderabad",
    tagline: "Irani chai, Osmania biscuits, biryani and the Charminar.",
    lines: [
      "Hyderabad mein khush aamdeed, miya! | Welcome to Hyderabad, buddy!",
      "Idi Telangana rajadhani! | This is the capital of Telangana!",
      "Charminar 1591 se khada hai! | The Charminar has stood here since 1591.",
      "Irani chai aur Osmania biscuit! | Irani chai with an Osmania biscuit: a daily ritual.",
      "Golconda mein taali bajao, upar sunai deti! | Clap at Golconda's gate and they hear it at the top!",
      "Ab asli khel shuru, miya! | Now the real game starts, buddy!",
    ],
    shouts: [
      [21, "Chai garam! Irani chai! | Hot tea! Irani chai!"],
      [88, "Bangles le lo, bangles! | Bangles! Buy bangles!"],
    ],
    ride: "scooter",
    item: "chaicup",
    signs: [[8, "HITEC CITY", "metro"], [55, "CHARMINAR", "1591"], [102, "GOLCONDA", "fort"]],
    props: [
      ["lamp", 4, {}],
      ["irani", 20, {}],
      ["clock", 34, {}],
      ["lamp", 62, {}],
      ["stall", 88, { label: 'BANGLES' }],
      ["lamp", 106, {}],
    ],
    things: [],
  }),
  longStage({
    base: {
    id: 'HYD-02',
    city: 'HYD',
    index: 2,
    name: 'Auto Wala',
    nameEn: 'The auto driver',
    tagline: 'Bas paanch minute, saab',
    hint: 'The auto copies your moves, just faster. Which way brings it to you?',
    par: 1.8,
    map: [
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '............@.......1...........',
      '#################aaaaaaaa#######',
      '#################aaaaaaaa#######',
      '#################aaaaaaaa#######',
    ],
    build(w: World) {
      const a = group(w, 'a');
      // only once you are fully on the stretch, so the drop is unmistakable
      w.when(
        () => w.standing(a.solid) && w.player.x >= px(17) + 1,
        () => a.fall(w),
      );
      const m = w.marker('1');
      const au = auto(w, m.tx, 15, 'copy', {
        minTx: 0,
        maxTx: 29.5,
        facing: 1,
        lines: { flee: 'Nakko, raanu! | Nope, not coming!', stuck: 'Road aipoindi, bhai! | The road is over, bro!', board: 'Baitho, miya! | Hop in, buddy!', come: 'Vastunna, vastunna! | Coming, coming!' },
      });
      au.exitTag = true;
      au.rideTo = px(28);
      au.rideLine = 'Utro, miya! Aage paidal! | Hop out, buddy! On foot from here!';
      sign(w, 1, 9.6, 4, 'AUTO STAND', 'shop', 'left');
      prop(w, 'chai', 6, 15);
      prop(w, 'lamp', 10, 15);
      prop(w, 'bulbs', 1, 6, { x2: px(13), y2: px(7) });
      prop(w, 'pigeons', 27, 15, { n: 2 });
      collectible(w, 'chaicup', 6, 11.4);
    },
  },
    par: 17,
    acts: [shadow],
    twist: 'otp',
  }),
  longStage({
    base: {
    id: 'HYD-03',
    city: 'HYD',
    index: 3,
    name: 'Biryani Bait',
    tagline: 'Free biryani. What could go wrong?',
    hint: "Tara's shortcut ends badly. The pot is dangerous... but what if it fell where you need a step?",
    par: 4.6,
    map: [
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '...............###..............',
      '..................bbb...........',
      '.............###................',
      '..............................E.',
      '.........###..............######',
      '..........................######',
      '.....###..................######',
      '..@.......................######',
      '###################...##########',
      '###################...##########',
      '###################...##########',
    ],
    build(w: World) {
      exitTwist(w, door(w), 'crush');
      const b = group(w, 'b');
      w.when(
        () => w.standing(b.solid),
        () => b.fall(w, { delay: 0.05 }),
      );
      const handi = pot(w, 24, 4);
      w.enter(24, 12, 2, 3, () => handi.drop(w, 0.35));
      w.when(
        () => handi.state === 'landed' && w.standing(handi.solid),
        () => (w.rivalBeaten = true),
      );
      sign(w, 21, 1.2, 4, 'FREE BIRYANI', 'shop', 'down', 'dum ka!', false);
      rival(w, 17, 7, -1, {
        intro: 'Psst! Shortcut paina nunchi, miya! | Psst! Shortcut from up top, buddy!',
        point: 1,
        introAt: 0.6,
        taunts: TAUNTS,
        beaten: 'Biryani tho escape aa?! Kirrak! | Escaped with the biryani?! Awesome!',
      });
      prop(w, 'lamp', 1, 15);
      prop(w, 'flowers', 14, 15);
      prop(w, 'pigeons', 22, 15, { n: 2 });
      collectible(w, 'chaicup', 16, 5.6);
    },
  },
    par: 17,
    twist: 'biryani',
    acts: [cooker],
    skin: { rock: 'crate', rockLine: 'Khoke gir rahe, miya! | Boxes falling, buddy!' },
  }),
  longStage({
    base: {
    id: 'HYD-04',
    city: 'HYD',
    index: 4,
    name: 'Sharmila Auto',
    tagline: 'Some autos are shy',
    hint: "This auto is shy. It only moves when you're not looking at it.",
    par: 2.7,
    map: [
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '^^^^.....@..............1.......',
      '#############aaaaaaa############',
      '#############aaaaaaa############',
      '#############aaaaaaa############',
    ],
    build(w: World) {
      const a = group(w, 'a');
      w.when(
        () => w.standing(a.solid) && w.player.x >= px(13) + 1,
        () => a.fall(w),
      );
      const m = w.marker('1');
      const au = auto(w, m.tx, 15, 'shy', {
        minTx: 4,
        maxTx: 29.5,
        facing: -1,
        lines: { come: 'Vastunna... | Coming...', shy: 'Choodaku, miya! | Don\'t look, buddy!', board: 'Chalo, bhai! | Let\'s go, bro!' },
      });
      au.exitTag = true;
      au.rideTo = px(28);
      au.rideLine = 'Utro, miya! Aage paidal! | Hop out, buddy! On foot from here!';
      prop(w, 'lamp', 7, 15);
      prop(w, 'chai', 28, 15);
      prop(w, 'bulbs', px(15) / 16, 6, { x2: px(31), y2: px(5) });
      collectible(w, 'chaicup', 11, 11.4);
    },
  },
    par: 15,
    acts: [statue],
    twist: 'gravity',
  }),
  longStage({
    base: {
    id: 'HYD-05',
    city: 'HYD',
    index: 5,
    name: 'Charminar Chase',
    tagline: "Tara's 'pakka' exit",
    hint: "The auto runs away, but its road ends somewhere. Tara's door lies. Her balcony doesn't.",
    par: 3.4,
    map: [
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '...........###############......',
      '................................',
      '.........##.....................',
      '................................',
      '......###....#..................',
      '.....@.......#..1...............',
      '####################aaaaaaa#####',
      '####################aaaaaaa#####',
      '####################aaaaaaa#####',
    ],
    build(w: World) {
      const a = group(w, 'a');
      w.when(
        () => w.standing(a.solid),
        () => a.fall(w),
      );
      const fake = w.add(new Door(19, 8));
      fake.fake = true;
      const m = w.marker('1');
      const au = auto(w, m.tx, 15, 'copy', {
        minTx: 14,
        maxTx: 29.5,
        facing: 1,
        lines: { flee: 'Raanu, bhai! | Not coming, bro!', stuck: 'Aage road nakko! | No road ahead!', board: 'Baitho! Mumbai? | Hop in! Mumbai?' },
      });
      au.exitTag = true;
      au.rideTo = px(28);
      au.rideLine = 'Utro, miya! Aage paidal! | Hop out, buddy! On foot from here!';
      au.accel = 4000;
      w.when(
        () => w.state === 'play' && w.player.onGround && w.player.x > px(26.5),
        () => (w.rivalBeaten = true),
      );
      rival(w, 22, 9, -1, {
        intro: 'Ee saari pakka exit, miya! | This time it\'s a real exit, buddy!',
        point: -1,
        introAt: 0.5,
        taunts: TAUNTS,
        beaten: 'Hmph! Golconda chalo, miya! | Hmph! Off to Golconda, buddy!',
      });
      prop(w, 'barricade', 13, 15, { label: 'ROAD CLOSED', tall: true, wide: 9 }, 3);
      prop(w, 'chai', 1, 15);
      prop(w, 'lamp', 10, 15);
      prop(w, 'bulbs', 11, 9, { x2: px(26), y2: px(9) });
      prop(w, 'pigeons', 28, 15, { n: 2 });
      collectible(w, 'chaicup', 23, 6.8);
    },
  },
    par: 15,
    acts: [kites],
    twist: 'tiny',
  }),
  longStage({
    base: {
    id: 'HYD-06',
    city: 'HYD',
    index: 6,
    name: 'Golconda Taali',
    nameEn: 'The Golconda clap',
    tagline: 'Clap at the gate and they hear it at the top',
    hint: 'Jump on the clap stone under the dome: the echo opens the top gate a moment later, for a few seconds only. The clap wakes the cannons too, so hop the cannonballs on the way up.',
    par: 8.5,
    scene: { kind: 'rock', place: 'Golconda Fort', with: ['fort'] },
    map: (() => {
      const g = Grid.ground(15);
      g.fill(10, 13, 13, 17, '#').fill(14, 17, 11, 17, '#').fill(18, 21, 9, 17, '#').fill(22, 25, 7, 17, '#').fill(26, 31, 5, 17, '#');
      return g.put(1, 14, '@').put(30, 4, 'E').rows();
    })(),
    build(w: World) {
      door(w);
      const gate = thing(w, 'gate', 27, 2);
      const stone = thing(w, 'pad', 3, 15, { dy: -8, solid: false, tint: '#E9C46A' });
      sign(w, 1.6, 10.6, 4.4, 'TAALI', 'shop', null, 'clap here');
      let gateState: 'shut' | 'open' | 'closing' = 'shut';
      w.flags.gate = gateState;
      const set = (st: typeof gateState) => {
        gateState = st;
        w.flags.gate = st;
      };
      let firstClap = true;
      // pending cannonball times (the test solver peeks at these; players see the cannons)
      const due: number[] = [];
      w.flags.balls = due;
      const ball = (delay: number) => {
        const at = w.tick * DT + delay;
        due.push(at);
        w.after(delay, () => {
          due.splice(due.indexOf(at), 1);
          if (w.state === 'play') roller(w, 'cannonball', px(26) - 14, px(5) - 12, -150, { bounce: 0.35, cause: 'hit', breakOnWall: true });
        });
      };
      // a cannonball every few seconds anyway
      const salvo = () => {
        if (w.state !== 'play') return;
        ball(3.0);
        w.after(3.0, salvo);
      };
      ball(1.6);
      w.after(1.6, salvo);
      w.when(
        (w2) => gateState === 'shut' && w2.player.jumpTick === w2.tick && Math.abs(w2.player.cx - stone.cx) <= 14 && w2.player.y + w2.player.h >= px(15) - 8,
        (w2) => {
          w2.sfx('clap', stone.cx, px(15));
          w2.emit('fx', stone.cx, px(15) - 6, { kind: 'sparkle' });
          stone.anim = 1;
          w2.after(0.2, () => (stone.anim = 0));
          set('open');
          // ...the echo arrives at the top
          w2.after(1.2, () => {
            w2.sfx('clap', gate.cx, px(3));
            w2.emit('fx', gate.cx, px(2), { kind: 'sparkle' });
            gate.moveTo(w2, gate.solid.x, px(2) - 46, 0.25, 'out');
            if (firstClap) w2.say('Darwaza khul gaya! Jaldi, miya! | The gate’s open! Quick, buddy!', px(26), px(1.6), 1.8, 'npc');
            firstClap = false;
          });
          // the clap wakes the cannon
          ball(0.55);
          w2.after(1.2 + 0.25 + 4.4, () => {
            set('closing');
            gate.shake(w2, 0.35, (w3) =>
              gate.moveTo(w3, gate.solid.x, px(2), 0.09, 'in', () => {
                w3.sfx('thud', gate.cx, px(5));
                w3.emit('shake', gate.cx, px(5), { amount: 3 });
                set('shut');
              }),
            );
          });
        },
        false,
      );
      rival(w, 29, 5, -1, { intro: 'Taali bajao, Dad! Upar tak awaaz jaati! | Clap, Dad! The sound carries all the way up!', point: -1, introAt: 0.5, taunts: TAUNTS, beaten: L.beaten[1] });
      collectible(w, 'chaicup', 23.5, 4.4);
    },
  },
    // over the top of the fort and down the far side
    join: (g) => g.fill(32, 33, 5, 17, '#').fill(34, 35, 7, 17, '#').fill(36, 37, 9, 17, '#').fill(38, 39, 11, 17, '#').fill(40, 41, 13, 17, '#'),
    joinW: 10,
    par: 20,
    acts: [echo],
    twist: 'cannon',
  }),
  longStage({
    base: {
    id: 'HYD-07',
    city: 'HYD',
    index: 7,
    name: 'Laad Bazaar',
    tagline: 'Glass bangles, by the thousand, by the Charminar',
    hint: 'The floor is covered in bangles, so you slide: jump before the edge. Each string of bangles snaps a moment after you land, and the last one breaks at once: jump from the middle string straight to the far side. The shops shut at the end.',
    par: 6.5,
    scene: { kind: 'market', place: 'Laad Bazaar', with: ['bangles'] },
    map: Grid.ground(15).fill(6, 13, 15, 15, '~').pit(14, 21, 15).put(2, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      exitTwist(w, door(w), 'crush');
      const strings: [number, number, number][] = [
        [14.8, 13.5, 0.35],
        [18.0, 13, 0.35],
        [20.2, 13.5, 0.02],
      ];
      let told = false;
      for (const [tx, ty, hold] of strings) {
        const b: Thing = thing(w, 'garland', tx, ty, { oneWay: true, w: 30, h: 6 });
        b.look = 'bangles';
        w.when(
          (w2) => w2.standing(b.solid),
          (w2) => {
            b.look = 'banglesag';
            b.shake(w2, hold, (w3) => {
              w3.sfx('snap', b.cx, b.solid.y);
              b.fall(w3, { land: false, g: 1500 });
              if (!told) {
                told = true;
                w3.say('Choodiyan toot gayi! | The bangles broke!', b.cx, px(9), 1.6, 'npc');
              }
            });
          },
        );
      }
      // a bangle seller rolls a few your way
      const roll = () => {
        if (w.state !== 'play') return;
        if (w.player.x > px(21)) roller(w, 'bangle', px(28), px(15) - 8, -110, { bounce: 0.55, vy: -120, cause: 'hit' });
        w.after(1.25, roll);
      };
      w.after(0.8, roll);
      rival(w, 27, 15, -1, { intro: 'Laad Bazaar ki choodiyan! Hallu hallu, Dad! | Laad Bazaar bangles! Slowly, Dad!', point: -1, introAt: 0.5, taunts: TAUNTS, beaten: L.beaten[0] });
      collectible(w, 'chaicup', 17.2, 10.2);
    },
  },
    par: 14,
    twist: 'backdoor',
    acts: [bangleBoxes],
  }),
  longStage({
    base: {
    id: 'HYD-08',
    city: 'HYD',
    index: 8,
    name: 'Ramoji Retake',
    tagline: 'Everything at the film city is a set. Everything.',
    hint: 'That floor is painted plywood: take the catwalk above it. The fire jets follow the director: go on “Cut!”, and mind the last jet, it always stops late. And the door? Also a prop.',
    par: 6,
    scene: { kind: 'filmset', place: 'Ramoji Film City' },
    map: Grid.ground(15).fill(6, 12, 15, 15, 'a').pit(6, 12, 16).fill(6, 12, 13, 13, '=').put(2, 14, '@').put(29, 14, 'E').rows(),
    build(w: World) {
      exitTwist(w, door(w), 'swap', { to: 23 });
      const set = group(w, 'a');
      set.paint = { fill: '#C9A27A', trim: '#E6C9A3', line: 'rgba(90,60,30,0.25)' };
      collapseOnStand(w, set, 0);
      w.when(
        (w2) => w2.standing(set.solid),
        (w2) => w2.say('Arre, yeh floor nakli hai! | Hey, this floor’s a fake!', px(9), px(10), 1.6, 'npc'),
      );
      // stunt fire on the director's call: Action! ... Cut!
      const P = 3.6;
      const jets = [15, 18, 21].map((tx, i) => {
        const g = geyser(w, px(tx) + 8, px(15), 76, P, [[0, i === 2 ? 2.15 : 1.6]], 'burnt');
        g.fire = true;
        return g;
      });
      void jets;
      w.onTick((w2) => {
        const m = (w2.tick * DT) % P,
          was = ((w2.tick - 1) * DT) % P;
        if (was < P - 0.4 && m >= P - 0.4) w2.say('Action!', px(18), px(8.5), 0.6, 'npc');
        if (was < 1.6 && m >= 1.6) w2.say('Cut!', px(18), px(8.5), 0.7, 'npc');
      });
      prop(w, 'bench', 4, 15);
      rival(w, 27, 15, -1, { intro: 'Ramoji Film City! Sab nakli hai, miya! | Ramoji Film City! It’s all fake, buddy!', point: -1, introAt: 0.5, taunts: TAUNTS, beaten: 'Hmph! Mumbai mein milte hain, miya! | Hmph! See you in Mumbai, buddy!' });
      collectible(w, 'chaicup', 9, 10.6);
    },
  },
    par: 18,
    twist: 'slowmo',
    acts: [retake],
  }),
];
