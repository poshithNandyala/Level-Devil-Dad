// CHN-10 Spencer Escalators: the old mall's escalators run by load. Family stair-direction-by-load [escalator-flip]:
// a stair with one rider runs up; a second rider on it and it reverses, fast, down into the comb plate at the foot.
// The finale calls back this city's own ideas and breaks the rule each one taught.
import type { LevelDef, StageMeta, World } from '../../world';
import { Entity, type Hazard } from '../../world';
import { Solid } from '../../body';
import { DT } from '../../constants';
import type { Act } from '../../levels/acts';
import { Decal, G, Shimmer, pool } from '../../levels/acts';
import { collectible, px, rival, sign, thingOn } from '../../levels/kit';
import { Grid } from '../../levels/grid';
import { onPass } from '../../levels/trolls';
import { person, tara as taraSays } from '../../levels/endkit';
import { lines as L } from './lines';
import { Murukku } from './murukku';

const meta = (family: string, betrayals: string[], ending: string): StageMeta => ({ family, betrayals, ending });
const tara = (n: number, point: 1 | -1 = 1) => ({ intro: L.intro[n % L.intro.length], point, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[n % L.beaten.length] });
export const SPENCER_META = meta('stair-direction-by-load', ['escalator-flip'], 'chn-wet-floor-sign');

const FOUNTAIN: [string, string] = ['rgba(120,200,230,0.8)', 'rgba(30,100,150,0.95)'];
/** the atrium below an escalator: the fountain basin */
function basin(w: World, tx0: number, tx1: number) {
  pool(w, tx0, tx1, G + 1 / 16, { colors: FOUNTAIN, cause: 'chn-fountain' });
}

export interface Shopper {
  /** seconds after the belt first starts, or 'top' for a kid who boards at the top on a cycle */
  at: number;
  /** boards at the top and rides down (default: boards at the foot and rides up) */
  fromTop?: boolean;
  /** a kid who, at the top, steps off and boards again after `again` seconds (rides down for fun) */
  again?: number;
  shirt: string;
  cap?: string;
  h?: number;
  /** riding progress 0..1 along the run (-1: not on the belt) */
  p: number;
  /** where she stands when off the belt: 'foot' | 'top' | 'gone' */
  off: 'foot' | 'top' | 'gone';
  /** tick she will board next (set by triggers) */
  boardAt: number;
  /** her trolley: rolls off the bottom step along the foot landing when the belt runs away down */
  trolley?: boolean;
}

export interface EscalatorSpec {
  /** foot column (the lowest step stands here, over the floor's last column) */
  fx: number;
  /** horizontal run (tiles) and rise (tiles) to the top landing */
  run: number;
  rise: number;
  /** direction for a rider count: 1 up, -1 down, 0 still */
  dirFor: (n: number) => -1 | 0 | 1;
  /** down runs at this speed (px/s along the run); up at 60 */
  downSpeed?: number;
  shoppers: Omit<Shopper, 'p' | 'off' | 'boardAt'>[];
  /** the belt runs with nobody on it (a down escalator) */
  idleRuns?: boolean;
  /** once it has reversed to run down, it runs down at least this long (seconds): the overload run-back */
  latch?: number;
  name: string;
}

const UP_SPEED = 60;

/**
 * An escalator: four steps on a belt along the diagonal from the foot to the top landing. A rider is carried;
 * the belt's direction is set by how many ride (Dad and the shoppers). A step carried under the comb plate at the
 * foot takes whoever stands on it with it.
 */
export class Escalator extends Entity {
  steps: Solid[] = [];
  readonly N = 4;
  /** belt progress of step 0 (the others follow at +0.25 each) */
  belt = 0;
  dir: -1 | 0 | 1 = 0;
  started = -1;
  shoppers: Shopper[];
  comb: Hazard;
  readonly x0: number;
  readonly y0: number;
  readonly runPx: number;
  readonly risePx: number;
  /** ticks of running so far, for the triggers */
  private t0 = -1;
  private buzz = 0;
  private armedFor = -2;
  private latchUntil = -1;
  /** each step's progress last tick (to see it go round) */
  private q: number[] = [];
  dadOn = false;
  constructor(readonly spec: EscalatorSpec) {
    super();
    this.layer = 2;
    this.x0 = px(spec.fx);
    this.y0 = px(G);
    this.runPx = px(spec.run);
    this.risePx = px(spec.rise);
    for (let i = 0; i < this.N; i++) {
      const s = new Solid(0, 0, 32, 8);
      s.oneWay = true;
      this.steps.push(s);
    }
    this.shoppers = spec.shoppers.map((s) => ({ ...s, p: -1, off: s.fromTop ? 'top' : 'foot', boardAt: s.fromTop ? Math.round(s.at * 120) : -1 }));
    this.q = this.steps.map((_, i) => i / this.N);
    this.placeSteps();
    const self = this;
    this.comb = {
      active: false,
      cause: 'chn-comb',
      hits: (x, y, w, h) => self.comb.active && x < self.x0 + 34 && x + w > self.x0 - 4 && y < self.y0 + 8 && y + h > self.y0 - 16,
    };
  }
  get solids() {
    return this.steps;
  }
  get hazard() {
    return this.comb;
  }
  /** step i's progress along the run */
  stepP(i: number) {
    return this.belt + i / this.N;
  }
  private at(p: number) {
    return { x: Math.round(this.x0 + p * this.runPx), y: Math.round(this.y0 - p * this.risePx) };
  }
  private placeSteps() {
    for (let i = 0; i < this.N; i++) {
      const q = ((this.stepP(i) % 1) + 1) % 1;
      const { x, y } = this.at(q);
      this.steps[i].place(x, y);
    }
  }
  /** riders: Dad on a step, plus every shopper on the belt */
  riders(w: World) {
    this.dadOn = this.steps.some((s) => w.standing(s));
    return (this.dadOn ? 1 : 0) + this.shoppers.filter((s) => s.p >= 0).length;
  }
  update(w: World) {
    const n = this.riders(w);
    let want = n === 0 && !this.spec.idleRuns ? 0 : this.spec.dirFor(n);
    // the overload run-back: once it has reversed it runs down to the foot for a while whatever the load
    if (want === -1 && this.dir !== -1 && this.spec.latch) this.latchUntil = w.tick + Math.round(this.spec.latch * 120);
    if (w.tick < this.latchUntil) want = -1;
    if (want !== this.dir) {
      if (want !== 0 && this.dir !== 0) w.sfx('beep', this.x0 + this.runPx / 2, this.y0 - 30);
      if (want === 0 && this.dir !== 0) {
        this.buzz = 40;
        // the belt settles with a step flush at the foot
        if (n === 0) {
          this.belt = 0;
          this.q = this.steps.map((_, i) => i / this.N);
          this.placeSteps();
        }
      }
      this.dir = want;
    }
    if (this.dir !== 0 && this.started < 0) {
      this.started = w.tick;
      this.t0 = w.tick;
    }
    // stopped with nobody aboard: the next start triggers the shoppers again
    if (this.dir === 0 && n === 0 && this.started >= 0 && this.shoppers.every((s) => s.p < 0 && !s.fromTop)) this.started = -1;
    if (this.buzz > 0) this.buzz--;
    // the shoppers' triggers: so many seconds after the belt starts (once per start); a kid from the top on her own clock
    if (this.started >= 0 && this.started !== this.armedFor) {
      this.armedFor = this.started;
      for (const s of this.shoppers) if (!s.fromTop && s.p < 0 && s.off === 'foot') s.boardAt = this.started + Math.round(s.at * 120);
    }
    for (const s of this.shoppers) {
      if (s.p >= 0 || s.off === 'gone') continue;
      if (s.boardAt >= 0 && w.tick >= s.boardAt) {
        s.p = s.off === 'top' ? 0.97 : 0.06;
        s.boardAt = -1;
        w.sfx('step', this.x0, this.y0);
      }
    }
    // move the belt (a hop off a step keeps the belt's real speed, not a rounded tick's)
    for (const s of this.steps) s.velX = this.dir === 0 ? 0 : this.dir * (this.dir > 0 ? UP_SPEED : this.spec.downSpeed ?? 150);
    if (this.dir !== 0) {
      const speed = this.dir > 0 ? UP_SPEED : this.spec.downSpeed ?? 150;
      const dp = (this.dir * speed * DT) / this.runPx;
      this.belt += dp;
      if (this.belt >= 1) this.belt -= 1;
      if (this.belt < 0) this.belt += 1;
      for (let i = 0; i < this.N; i++) {
        const prev = this.q[i];
        const q = ((this.stepP(i) % 1) + 1) % 1;
        this.q[i] = q;
        const s = this.steps[i];
        const { x, y } = this.at(q);
        if (this.dir < 0 && q > prev + 0.5) {
          // under the comb plate at the foot: whoever stands on it goes with it
          if (w.standing(s)) {
            this.comb.active = true;
            w.die('chn-comb');
            this.comb.active = false;
          }
          s.place(x, y);
        } else if (this.dir > 0 && q < prev - 0.5) {
          // off the top: the step goes round to the foot (a rider is left standing on the landing)
          s.place(x, y);
        } else s.moveBy(w, x - s.x, y - s.y);
      }
      for (const s of this.shoppers) {
        if (s.p < 0) continue;
        s.p += dp;
        if (s.p >= 1) {
          if (s.fromTop && this.dadOn) {
            // the kid waits on the top step for her ride down while Dad is still coming up
            s.p = 0.999;
          } else {
            // off at the top: a playing kid boards again; anyone else walks away
            s.p = -1;
            s.off = 'top';
            if (s.again !== undefined) s.boardAt = w.tick + Math.round(s.again * 120);
            else s.off = 'gone';
          }
        } else if (s.p <= 0) {
          s.p = -1;
          s.off = 'foot';
          if (s.trolley) w.flags.trolleyAt = w.tick;
          // a kid who rides down for fun runs back up the side stairs and boards at the top again
          if (s.fromTop) {
            s.off = 'top';
            s.boardAt = w.tick + Math.round(1.5 * 120);
          }
        }
      }
    }
    w.flags[`esc:${this.spec.name}`] = { dir: this.dir, n, belt: this.belt, shoppers: this.shoppers.map((s) => s.p) };
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const top = this.at(1);
    // the balustrades (behind the steps), the comb plates
    ctx.strokeStyle = '#90A4AE';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x0 - 6, this.y0 - 22);
    ctx.lineTo(top.x + 2, top.y - 22);
    ctx.moveTo(this.x0 - 6, this.y0 - 20);
    ctx.lineTo(this.x0 - 6, this.y0 + 6);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(176,190,197,0.5)';
    ctx.beginPath();
    ctx.moveTo(this.x0 - 4, this.y0 + 4);
    ctx.lineTo(top.x + 4, top.y + 4);
    ctx.stroke();
    // the steps
    for (let i = 0; i < this.N; i++) {
      const s = this.steps[i];
      ctx.fillStyle = '#B0BEC5';
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.fillStyle = '#607D8B';
      ctx.fillRect(s.x, s.y + 2, s.w, 2);
      ctx.fillStyle = '#FFD54F';
      ctx.fillRect(s.x, s.y, 2, s.h);
      ctx.fillRect(s.x + s.w - 2, s.y, 2, s.h);
    }
    // comb plates
    ctx.fillStyle = '#FFC107';
    ctx.fillRect(this.x0 - 6, this.y0 + 4, 10, 3);
    ctx.fillRect(top.x - 2, top.y + 4, 10, 3);
    // direction arrows on the balustrade
    const mid = this.at(0.5);
    ctx.fillStyle = this.dir > 0 ? '#43A047' : this.dir < 0 ? '#E53935' : '#9E9E9E';
    ctx.beginPath();
    const ay = mid.y - 30;
    if (this.dir >= 0) {
      ctx.moveTo(mid.x + 12, ay - 5);
      ctx.lineTo(mid.x + 7, ay + 2);
      ctx.lineTo(mid.x + 17, ay + 2);
    } else {
      ctx.moveTo(mid.x + 12, ay + 3);
      ctx.lineTo(mid.x + 7, ay - 4);
      ctx.lineTo(mid.x + 17, ay - 4);
    }
    ctx.fill();
    if (this.buzz > 0 && w.tick % 6 < 3) {
      ctx.fillStyle = '#E53935';
      ctx.fillRect(mid.x + 4, ay - 16, 16, 6);
    }
    // the shoppers
    for (const s of this.shoppers) {
      if (s.off === 'gone' && s.p < 0) continue;
      let x: number, y: number;
      if (s.p >= 0) {
        const a = this.at(s.p);
        x = a.x + 12;
        y = a.y;
      } else if (s.off === 'foot') {
        x = this.x0 - 14;
        y = px(G);
      } else {
        x = top.x + 26;
        y = top.y + 6;
      }
      person(ctx, x, y, s.h ?? 16, s.shirt, '#C68B59', { cap: s.cap });
      if (s.trolley && s.p < 0 && s.off === 'foot') {
        ctx.fillStyle = '#78909C';
        ctx.fillRect(x - 24, y - 12, 14, 10);
        ctx.fillStyle = '#263238';
        ctx.fillRect(x - 23, y - 2, 3, 3);
        ctx.fillRect(x - 14, y - 2, 3, 3);
      }
    }
  }
}

/** a step of escalator `name` is right under the mount's edge, ready to be stepped on to */
export const stepUnder = (w: World, name: string) => {
  const e = escalatorOf(w, name);
  return !!e && e.steps.some((s) => s.x <= e.x0 + 18 && s.x + s.w >= e.x0 + 26 && s.y >= e.y0 - 14);
};
export const escalatorOf = (w: World, name: string) => w.entities.find((e) => e instanceof Escalator && e.spec.name === name) as Escalator | undefined;

/** the usual mall stair: it runs when someone is on it; one rider up, two or more down, fast */
const usual = (n: number): -1 | 0 | 1 => (n === 0 ? 0 : n === 1 ? 1 : -1);

/** the floor step down from a landing at row `ty` back to the ground: a hop down */
function landing(g: Grid, c0: number, c1: number, ty: number) {
  g.fill(c0, c1, ty, 17, '#');
}

// ================================================================== the room
/** Spencer Plaza: the first escalator, and a shopper who steps on behind you. */
export function spencerRoom(): LevelDef {
  return {
    id: 'CHN-10',
    city: 'CHN',
    index: 10,
    name: 'Spencer Escalators',
    nameEn: 'The mall escalators',
    tagline: 'Chennai’s old mall. Its escalators run by load: one rider goes up, two go down, fast.',
    hint: 'An escalator with one rider runs up; the moment a second steps on it reverses and runs down, fast, into the comb plate at the foot. The shopper at the foot steps on a moment after it starts. So step on from the kerb, hop straight back off on to the kerb, let her ride up alone, and then ride it yourself.',
    par: 95,
    map: Grid.ground(G).fill(5, 7, 14, 14, '#').pit(9, 17).fill(18, 23, 11, 17, '#').put(1, 14, '@').put(29, 14, 'E').rows(),
    build(w: World) {
      basin(w, 9, 18);
      const e = w.add(
        new Escalator({
          name: 'room',
          fx: 8,
          run: 10,
          rise: 4,
          latch: 1.5,
          dirFor: usual,
          shoppers: [{ at: 0.6, shirt: '#8E24AA', h: 16 }],
        }),
      );
        sign(w, 0.3, 10.4, 3.4, 'SPENCER', 'metro', null, 'plaza');
      sign(w, 25, 10.6, 3.4, 'EXIT', 'green', 'right', 'ground floor');
      rival(w, 4, G, 1, tara(9));
      onPass(w, px(2), (w2) => w2.guide('Escalator-la oru aal dhaan. | One person on the escalator.'));
      w.when(
        () => e.shoppers[0].p >= 0 && e.dadOn,
        (w2) => taraSays(w2, 'Rendu peru, mela pogum! | Two people, it goes up!', 1.4),
      );
      collectible(w, 'tumbler', 13, 8.6);
    },
  };
}

// ================================================================== the acts
/** the family: three board together behind you; the rule you learned (two = down) goes stale: four stop it */
export const moodal: Act = {
  id: 'chn10-moodal',
  w: 30,
  advice: 'A family of three waits at this escalator and they all step on behind you. With four aboard the overload buzzer sounds, and the stair crawls on up anyway: stay on. Step off when they board and the three of them send it down fast, and their trolley comes off the belt and along the floor at you.',
  paint: (g, c) => {
    g.fill(c.x + 5, c.x + 7, 14, 14, '#');
    g.pit(c.x + 9, c.x + 17);
    landing(g, c.x + 18, c.x + 23, 11);
  },
  build: (w, c) => {
    const x = c.x;
    basin(w, x + 9, x + 18);
    const e = w.add(
      new Escalator({
        name: 'moodal',
        fx: x + 8,
        run: 10,
        rise: 4,
        latch: 1.5,
        dirFor: (n) => (n === 0 ? 0 : n === 1 || n >= 4 ? 1 : -1),
        shoppers: [
          { at: 0.5, shirt: '#1E88E5', h: 16, trolley: true },
          { at: 0.5, shirt: '#E53935', h: 15 },
          { at: 0.5, shirt: '#FDD835', h: 10 },
        ],
      }),
    );
    // the trolley: when the belt runs away down with the family on it, it comes off the bottom step and rolls
    // along the foot landing
    let rolled = false;
    w.onTick((w2) => {
      if (rolled || !w2.flags.trolleyAt) return;
      rolled = true;
      const t = thingOn(w2, 'crate', x + 7.4, G - 1, { w: 14, h: 10, deadly: 'chn-trolley', solid: false, layer: 5 });
      let tx = t.x;
      w2.onTick((w3) => {
        if (!t.alive) return;
        tx -= 150 * DT;
        t.place(w3, tx, t.y);
        if (tx < px(x + 1)) {
          t.alive = false;
          t.hide();
        }
      });
      w2.sfx('slide', t.x, t.y);
    });
    sign(w, x + 2, 10.4, 3.4, 'MAX 2', 'warn', null, 'per step');
    onPass(w, px(x + 2), (w2) => w2.guide('Kudumbam kaathirukku. | A family is waiting.'));
    w.when(
      () => e.riders(w) >= 2 && e.dadOn,
      (w2) => taraSays(w2, 'Rendu peru! Iranga, Dad! | Two people! Get off, Dad!', 1.4),
    );
  },
};

/** a down escalator: alone you ride down into the comb; with the kid who rides it for fun aboard, it runs up */
export const keezhe: Act = {
  id: 'chn10-keezhe',
  w: 30,
  advice: 'This escalator runs down, and a kid rides it down for fun, over and over. Alone on it you go down into the comb plate. Step on while the kid is riding: two aboard and it runs up, and she rides up with you.',
  paint: (g, c) => {
    g.fill(c.x + 5, c.x + 7, 14, 14, '#');
    g.pit(c.x + 9, c.x + 17);
    landing(g, c.x + 18, c.x + 23, 11);
  },
  build: (w, c) => {
    const x = c.x;
    basin(w, x + 9, x + 18);
    const e = w.add(
      new Escalator({
        name: 'keezhe',
        fx: x + 8,
        run: 10,
        rise: 4,
        idleRuns: true,
        downSpeed: 60,
        dirFor: (n) => (n >= 2 ? 1 : -1),
        shoppers: [{ at: 1.8, fromTop: true, again: 0.3, shirt: '#43A047', h: 10 }],
      }),
    );
    sign(w, x + 2, 10.4, 3.4, 'DOWN', 'metro', 'down', 'to the food court');
    onPass(w, px(x + 2), (w2) => w2.guide('Idhu keezha pogum escalator. | This one runs down.'));
    w.when(
      (w2) => w2.player.x > px(x + 5),
      (w2) => taraSays(w2, 'Kaali-aa irukkum podhu yeru! | Get on while it is empty!', 1.6),
    );
  },
};

/** the mall floor: the shimmer is polish and holds, the dark patch is the open well (CHN-05 the other way round) */
export const kaanal: Act = {
  id: 'chn10-kaanal',
  w: 26,
  advice: 'Indoors it is the other way round from the beach road: the shimmer is floor polish and it holds; the dark patch is an open well down to the fountain. Walk the shimmer, jump the dark.',
  paint: (g, c) => {
    for (const t of [6, 13, 19]) g.pit(c.x + t, c.x + t + 1);
  },
  build: (w, c) => {
    const x = c.x;
    for (const t of [6, 13, 19]) basin(w, x + t, x + t + 2);
    for (const t of [3, 10, 16, 22]) w.add(new Shimmer(px(x + t), px(G), px(2), '#CFD8DC', '#90A4AE'));
    // the wells: dark, and really open (the basin shows through)
    for (const t of [6, 13, 19]) w.add(new Decal(px(x + t), px(G) - 1, px(2), 3));
    sign(w, x + 0.5, 10.4, 3.4, 'FLOOR 2', 'metro', null, 'polished today');
    onPass(w, px(x + 2), (w2) => w2.guide('Floor polish pannirukkaanga. | They have polished the floor.'));
    onPass(w, px(x + 4.5), (w2) => taraSays(w2, 'Veyil kaanal! Thaandu! | Heat shimmer! Jump it!', 1.4));
  },
};

/** the food court display: the golden murukku are painted plaster and crumble; the pale one is real (CHN-09 reversed) */
export const pattarai: Act = {
  id: 'chn10-pattarai',
  w: 30,
  advice: 'The food court display over the fountain: the pale spirals are real and hold; the golden one in the middle is painted plaster: it takes your weight for a second, then crumbles. Walk straight across it, never stop on it.',
  paint: (g, c) => {
    g.pit(c.x + 4, c.x + 24);
  },
  build: (w, c) => {
    const x = c.x;
    basin(w, x + 4, x + 25);
    const pale = w.add(new Murukku('d1', px(x + 6), px(5), 'pale'));
    pale.friesAt = -1;
    const plaster = w.add(new Murukku('d2', px(x + 13), px(5), 'golden'));
    const pale2 = w.add(new Murukku('d3', px(x + 20), px(5), 'pale'));
    // the pale ones are real murukku, cold: they hold; the golden one is plaster: it crumbles under weight
    Object.defineProperty(pale, 'holds', { get: () => true });
    Object.defineProperty(pale2, 'holds', { get: () => true });
    let crumbleAt = -1;
    Object.defineProperty(plaster, 'holds', { get: () => crumbleAt < 0 || w.tick < crumbleAt });
    w.onTick((w2) => {
      if (crumbleAt < 0 && w2.standing(plaster.solid)) {
        crumbleAt = w2.tick + 100;
        w2.sfx('creak', plaster.cx, plaster.solid.y);
      }
    });
    sign(w, x + 0.5, 10.4, 3.6, 'FOOD COURT', 'shop', null, 'display only');
    onPass(w, px(x + 2), (w2) => w2.guide('Idhu display murukku. | These are display murukku.'));
    onPass(w, px(x + 3.5), (w2) => taraSays(w2, 'Pon niram dhaan strong! | Golden is the strong one!', 1.4));
  },
};
