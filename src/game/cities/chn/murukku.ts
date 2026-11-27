// CHN-09 Murukku Press: a snack kitchen's kadai of hot oil, the brass press (achu) on its rail laying spiral strands
// into it, and the cook's slotted ladle (karandi) lifting them out. Family extruded-spiral-strand [extrude-set]:
// a fresh (pale) strand is soft and folds under you; once it fries golden it holds. Everything here is deterministic.
import type { LevelDef, StageMeta, World } from '../../world';
import { Entity, type Hazard } from '../../world';
import { Solid } from '../../body';
import { DT, secs } from '../../constants';
import type { Act } from '../../levels/acts';
import { G, pool } from '../../levels/acts';
import { collectible, px, rival, sign } from '../../levels/kit';
import { Grid } from '../../levels/grid';
import { onPass } from '../../levels/trolls';
import { tara as taraSays } from '../../levels/endkit';
import { lines as L } from './lines';

const meta = (family: string, betrayals: string[], ending: string): StageMeta => ({ family, betrayals, ending });
const tara = (n: number, point: 1 | -1 = 1) => ({ intro: L.intro[n % L.intro.length], point, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[n % L.beaten.length] });
export const MURUKKU_META = meta('extruded-spiral-strand', ['extrude-set'], 'chn-fresh-curtain');

/** the oil's surface, in px (a hair under the floor top, like CHN-03's flood) */
export const OIL = px(G) + 1;
const OIL_COLORS: [string, string] = ['rgba(228,170,70,0.88)', 'rgba(140,80,20,0.97)'];
/** how a strand looks: pale (fresh, soft), white (thenkuzhal: fried, still white), golden (fried), dark (fried longest) */
export type Fry = 'pale' | 'white' | 'golden' | 'dark';

/** A murukku floating on the oil. Soft while pale: standing on it folds it under. `eye` leaves the spiral's middle open. */
export class Murukku extends Entity {
  solid: Solid;
  fry: Fry;
  /** tick it stops bubbling (white) or turns golden (pale); -1 = never */
  friesAt = -1;
  /** tick it started to fold under Dad */
  sinkAt = -1;
  visible = true;
  private now = 0;
  readonly h = 8;
  constructor(
    public name: string,
    x: number,
    w: number,
    fry: Fry,
    o: { eye?: [number, number]; hidden?: boolean } = {},
  ) {
    super();
    this.layer = 4;
    this.fry = fry;
    this.solid = new Solid(x, OIL + 3 - this.h, w, this.h);
    this.solid.oneWay = true;
    if (o.eye) this.solid.parts = [{ x: 0, y: 0, w: o.eye[0], h: this.h }, { x: o.eye[1], y: 0, w: w - o.eye[1], h: this.h }];
    if (o.hidden) this.hide();
  }
  get x() {
    return this.solid.x;
  }
  get cx() {
    return this.solid.x + this.solid.w / 2;
  }
  /** fried through: holds a dad */
  get holds() {
    return this.fry === 'golden' || this.fry === 'dark' || (this.fry === 'white' && this.friesAt >= 0 && this.now >= this.friesAt);
  }
  /** still frying: the oil bubbles round it */
  get bubbling() {
    return this.visible && this.friesAt >= 0 && this.now < this.friesAt;
  }
  hide() {
    this.visible = false;
    this.solid.collidable = false;
  }
  /** lay it (pale, or white) at x: it fries `fryIn` seconds later */
  lay(w: World, x: number, fry: 'pale' | 'white', fryIn: number) {
    this.solid.place(Math.round(x), OIL + 3 - this.h);
    this.solid.yr = 0;
    this.fry = fry;
    this.friesAt = w.tick + secs(fryIn);
    this.sinkAt = -1;
    this.visible = true;
    this.solid.collidable = true;
    w.sfx('pour', this.cx, OIL);
    w.emit('fx', this.cx, OIL, { kind: 'poof', w: this.solid.w, h: 8 });
  }
  update(w: World) {
    this.now = w.tick;
    if (!this.visible) return;
    if (this.fry === 'pale' && this.friesAt >= 0 && w.tick >= this.friesAt) {
      this.fry = 'golden';
      w.sfx('snap', this.cx, OIL - 4);
      w.emit('fx', this.cx, OIL - 6, { kind: 'sparkle' });
    }
    if (this.fry === 'white' && w.tick === this.friesAt) w.sfx('snap', this.cx, OIL - 4);
    // soft: fold under whoever stands on it
    if (!this.holds && this.sinkAt < 0 && w.standing(this.solid)) {
      this.sinkAt = w.tick;
      w.sfx('creak', this.cx, OIL);
    }
    if (this.sinkAt >= 0) {
      this.solid.yr += 70 * DT;
      const dy = Math.floor(this.solid.yr);
      if (dy > 0) {
        this.solid.yr -= dy;
        this.solid.moveBy(w, 0, dy);
      }
      if (this.solid.y > OIL + 30) this.hide();
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (!this.visible) return;
    const s = this.solid;
    const fold = this.sinkAt >= 0 ? Math.min(6, (w.tick - this.sinkAt) * 0.4) : 0;
    const col = this.fry === 'pale' ? ['#F1DEB0', '#D8C08C'] : this.fry === 'white' ? ['#F7F2E6', '#D9D0BE'] : this.fry === 'dark' ? ['#8A4A14', '#5C2E08'] : ['#D9922E', '#A8651A'];
    const parts = s.parts ?? [{ x: 0, y: 0, w: s.w, h: s.h }];
    for (const p of parts) {
      const x = s.x + p.x,
        y = s.y + p.y + fold;
      ctx.fillStyle = col[1];
      ctx.fillRect(x, y + 2, p.w, p.h - 2);
      ctx.fillStyle = col[0];
      ctx.fillRect(x, y, p.w, p.h - 3);
      // the strand's ridges: a spiral seen from the side
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      for (let i = 2; i < p.w - 2; i += 5) ctx.fillRect(x + i, y + 1, 2, p.h - 4);
    }
    if (s.parts) {
      // the eye: a dark hole between the turns
      const a = s.parts[0],
        b = s.parts[1];
      ctx.fillStyle = 'rgba(60,30,8,0.55)';
      ctx.fillRect(s.x + a.w, s.y + 3, b.x - a.w, 3);
    }
    if (this.bubbling) {
      ctx.fillStyle = 'rgba(255,245,210,0.85)';
      for (let i = 0; i < 6; i++) {
        const bx = s.x - 4 + ((i * 17 + w.tick * (1 + (i % 3))) % (s.w + 8));
        const by = OIL - 1 - ((w.tick * 0.6 + i * 5) % 7);
        ctx.fillRect(bx, by, 2, 2);
      }
    }
  }
}

/** The brass press on its rail: it slides to a spot, comes down, lays a strand, lifts, and goes back. Its head kills. */
export class Press extends Entity {
  hazard: Hazard;
  state: 'park' | 'go' | 'down' | 'lay' | 'up' | 'back' = 'park';
  x: number;
  y: number;
  readonly w = 22;
  readonly h = 14;
  private t0 = 0;
  private from = 0;
  private to = 0;
  private jobX = 0;
  private job: { target: Murukku | null; fry: 'pale' | 'white'; fryIn: number } | null = null;
  readonly railY: number;
  readonly lowY: number;
  /**
   * `lowAbove`: how far over the floor the head's bottom hangs when it is down (px). 62: a tap hop under it is clear,
   * a long jump is not. 48: any hop under it hits it. A dad standing under it is always clear.
   */
  constructor(
    readonly parkX: number,
    lowAbove = 62,
    railTy = 8,
  ) {
    super();
    this.layer = 6;
    this.railY = px(railTy);
    this.x = parkX;
    this.y = this.railY + 4;
    this.lowY = px(G) - lowAbove - this.h;
    const self = this;
    this.hazard = {
      active: false,
      cause: 'chn-achu',
      hits: (x, y, w, h) => self.alive && self.state !== 'park' && x < self.x + self.w - 2 && x + w > self.x + 2 && y < self.y + self.h && y + h > self.y + 2,
    };
  }
  get cx() {
    return this.x + this.w / 2;
  }
  get busy() {
    return this.state !== 'park';
  }
  /** lay `m` with its left edge at x; the nozzle hangs over `m`'s point `at` px from its left (default: its right end) */
  lay(w: World, m: Murukku | null, x: number, fry: 'pale' | 'white' = 'pale', fryIn = 1.2, at = m ? m.solid.w - 6 : 8) {
    if (this.busy) return;
    this.job = { target: m, fry, fryIn };
    this.from = this.x;
    this.to = x + at - this.w / 2;
    this.jobX = x;
    this.state = 'go';
    this.t0 = w.tick;
    this.hazard.active = true;
    w.sfx('slide', this.cx, this.y);
  }
  update(w: World) {
    const t = (w.tick - this.t0) * DT;
    switch (this.state) {
      case 'go': {
        const k = Math.min(1, t / 0.3);
        this.x = Math.round(this.from + (this.to - this.from) * k);
        if (k >= 1) {
          this.state = 'down';
          this.t0 = w.tick;
        }
        break;
      }
      case 'down': {
        const k = Math.min(1, t / 0.15);
        this.y = Math.round(this.railY + 4 + (this.lowY - this.railY - 4) * k);
        if (k >= 1) {
          this.state = 'lay';
          this.t0 = w.tick;
          w.sfx('creak', this.cx, this.y);
        }
        break;
      }
      case 'lay': {
        if (t >= 0.2 && this.job?.target && !this.job.target.visible) this.job.target.lay(w, this.jobX, this.job.fry, this.job.fryIn);
        if (t >= 0.6) {
          this.state = 'up';
          this.t0 = w.tick;
        }
        break;
      }
      case 'up': {
        const k = Math.min(1, t / 0.2);
        this.y = Math.round(this.lowY + (this.railY + 4 - this.lowY) * k);
        if (k >= 1) {
          this.state = 'back';
          this.t0 = w.tick;
          this.from = this.x;
          this.to = this.parkX;
        }
        break;
      }
      case 'back': {
        const k = Math.min(1, t / 0.4);
        this.x = Math.round(this.from + (this.to - this.from) * k);
        if (k >= 1) {
          this.state = 'park';
          this.hazard.active = false;
          this.job = null;
        }
        break;
      }
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    // the rail
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(this.parkX - 30, this.railY, 420, 3);
    // the hanger, the brass cylinder, the plate with its star holes
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(this.cx - 1.5, this.railY, 3, this.y - this.railY);
    ctx.fillStyle = '#C8962E';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.fillStyle = '#E8C060';
    ctx.fillRect(this.x + 2, this.y + 2, this.w - 4, 4);
    ctx.fillStyle = '#7A5210';
    ctx.fillRect(this.x + 4, this.y + this.h - 3, this.w - 8, 3);
    if (this.state === 'lay') {
      // the strand coming out, down to the oil
      ctx.strokeStyle = '#F1DEB0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const top = this.y + this.h;
      const t = (w.tick - this.t0) * DT;
      const bottom = Math.min(OIL, top + (OIL - top) * (t / 0.2));
      ctx.moveTo(this.cx, top);
      for (let yy = top; yy < bottom; yy += 4) ctx.lineTo(this.cx + Math.sin(yy * 0.6 + w.tick * 0.5) * 2.5, yy);
      ctx.stroke();
    }
  }
}

/** The cook's slotted ladle: it hovers over a spiral, scoops it out (whoever stands on it too), and swings back dripping. */
export class Ladle extends Entity {
  hazard: Hazard;
  drip: Hazard;
  hazards: Hazard[];
  state: 'away' | 'hover' | 'scoop' | 'swing' | 'drip' = 'away';
  x = 0;
  y = 0;
  readonly w = 36;
  readonly h = 8;
  private t0 = 0;
  target: Murukku | null = null;
  private dripOver: Murukku | null = null;
  private hoverFor = 0.5;
  private then: ((w: World) => void) | null = null;
  constructor(readonly homeX: number) {
    super();
    this.layer = 7;
    const self = this;
    this.hazard = {
      active: false,
      cause: 'chn-karandi',
      hits: (x, y, w, h) => {
        if (!self.alive || self.state !== 'scoop') return false;
        const m = self.target?.solid;
        const x0 = m ? m.x : self.x,
          x1 = m ? m.x + m.w : self.x + self.w;
        return x < x1 && x + w > x0 && y < OIL + 4 && y + h > self.y;
      },
    };
    this.drip = {
      active: false,
      cause: 'chn-sottu',
      hits: (x, y, w, h) => {
        if (!self.alive || self.state !== 'drip' || !self.dripOver) return false;
        const m = self.dripOver.solid;
        return x < m.x + m.w && x + w > m.x && y < OIL && y + h > OIL - 40;
      },
    };
    this.hazards = [this.hazard, this.drip];
    this.x = homeX;
    this.y = px(G) - 70;
  }
  get busy() {
    return this.state !== 'away';
  }
  /** take `m` out of the oil: hover `hover` s first; then swing back dripping over `dripOver` (if any) */
  take(w: World, m: Murukku, hover = 0.5, dripOver: Murukku | null = null, then?: (w: World) => void) {
    if (this.busy) return;
    this.target = m;
    this.dripOver = dripOver;
    this.hoverFor = hover;
    this.then = then ?? null;
    this.state = 'hover';
    this.t0 = w.tick;
    this.x = Math.round(m.cx - this.w / 2);
    this.y = OIL - 34;
    w.sfx('whistle', this.x, this.y);
  }
  update(w: World) {
    const t = (w.tick - this.t0) * DT;
    switch (this.state) {
      case 'hover':
        this.y = OIL - 34 + Math.round(Math.sin(w.tick * 0.3) * 1.5);
        if (t >= this.hoverFor) {
          this.state = 'scoop';
          this.t0 = w.tick;
          this.y = OIL - 10;
          this.hazard.active = true;
          w.sfx('splash', this.x + this.w / 2, OIL);
        }
        break;
      case 'scoop':
        if (t >= 0.08 && this.target?.visible) {
          this.target.hide();
          w.emit('fx', this.x + this.w / 2, OIL, { kind: 'poof', w: this.w, h: 10 });
        }
        if (t >= 0.12) {
          this.hazard.active = false;
          this.state = 'swing';
          this.t0 = w.tick;
          this.from = this.x;
        }
        break;
      case 'swing': {
        // up and over, towards the one before (dripping) or home
        const k = Math.min(1, t / 0.4);
        const toX = this.dripOver ? this.dripOver.cx - this.w / 2 : this.homeX;
        this.x = Math.round(this.from + (toX - this.from) * k);
        this.y = Math.round(OIL - 10 + (OIL - 44 - (OIL - 10)) * k);
        if (k >= 1) {
          if (this.dripOver) {
            this.state = 'drip';
            this.drip.active = true;
            this.t0 = w.tick;
            w.sfx('pour', this.x + this.w / 2, OIL);
          } else this.done(w);
        }
        break;
      }
      case 'drip':
        if (t >= 0.6) {
          this.drip.active = false;
          this.done(w);
        }
        break;
    }
  }
  private from = 0;
  private done(w: World) {
    this.state = 'away';
    this.x = this.homeX;
    this.y = px(G) - 70;
    const f = this.then;
    this.then = null;
    this.target = null;
    this.dripOver = null;
    f?.(w);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (this.state === 'away') return;
    // the handle up and to the home side, the slotted bowl
    ctx.strokeStyle = '#6D4C41';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.x + this.w / 2, this.y + 2);
    ctx.lineTo(this.x + this.w / 2 - 44, this.y - 30);
    ctx.stroke();
    ctx.fillStyle = '#9E9E9E';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.fillStyle = '#616161';
    for (let i = 3; i < this.w - 3; i += 5) ctx.fillRect(this.x + i, this.y + 2, 2, this.h - 4);
    if (this.state === 'swing' || this.state === 'drip') {
      // the spiral it carries, and hot drops falling off it
      ctx.fillStyle = '#D9922E';
      ctx.fillRect(this.x + 3, this.y - 6, this.w - 6, 6);
      if (this.state === 'drip') {
        ctx.fillStyle = 'rgba(255,200,90,0.95)';
        for (let i = 0; i < 5; i++) {
          const dx = this.x + 4 + ((i * 7 + w.tick) % (this.w - 6));
          const dy = this.y + this.h + ((w.tick * 2 + i * 9) % 36);
          ctx.fillRect(dx, dy, 2, 3);
        }
      }
    }
  }
}

/** the cook's hand coming down to snap a piece off */
class Hand extends Entity {
  hazard: Hazard;
  at = -1;
  constructor(
    readonly x0: number,
    readonly w: number,
  ) {
    super();
    this.layer = 7;
    const self = this;
    this.hazard = { active: false, cause: 'chn-kai', hits: (x, y, w, h) => self.hazard.active && x < self.x0 + self.w && x + w > self.x0 && y < OIL && y + h > OIL - 40 };
  }
  snap(w: World, then: (w: World) => void) {
    this.at = w.tick;
    this.hazard.active = true;
    w.sfx('snap', this.x0 + this.w / 2, OIL - 10);
    w.after(0.1, () => {
      this.hazard.active = false;
      then(w);
    });
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (this.at < 0 || w.tick - this.at > 16) return;
    const x = this.x0 + this.w / 2;
    ctx.fillStyle = '#A0653B';
    ctx.fillRect(x - 6, OIL - 36, 12, 24);
    ctx.fillRect(x - 10, OIL - 70, 8, 40);
    ctx.fillStyle = '#F5F5F5';
    ctx.fillRect(x - 12, OIL - 72, 12, 8);
  }
}

/** the murukku of the current world, by name (tests and the guide) */
export const murukkuOf = (w: World, name: string) => w.entities.find((e) => e instanceof Murukku && e.name === name) as Murukku | undefined;
export const pressOf = (w: World, i = 0) => w.entities.filter((e) => e instanceof Press)[i] as Press | undefined;
export const ladleOf = (w: World, i = 0) => w.entities.filter((e) => e instanceof Ladle)[i] as Ladle | undefined;
/** a stage's presses and ladles in the order they were added: the i-th act's are at index i */
export const ladleAt = (w: World, i: number) => ladleOf(w, i);

/** the oil between two columns (the pit is painted by the act) */
function kadai(w: World, tx0: number, tx1: number) {
  pool(w, tx0, tx1, G + 1 / 16, { colors: OIL_COLORS, cause: 'chn-ennai' });
}

const M = (w: World, name: string, tx: number, wTiles: number, fry: Fry, o: { eye?: [number, number]; hidden?: boolean } = {}) => w.add(new Murukku(name, px(tx), px(wTiles), fry, o));

// ================================================================== the room
/** The kitchen: a golden spiral, then the press lays a pale one right where your next hop lands. */
export function murukkuRoom(): LevelDef {
  return {
    id: 'CHN-09',
    city: 'CHN',
    index: 9,
    name: 'Murukku Press',
    nameEn: 'The murukku press',
    tagline: 'A snack kitchen: the press lays spirals into the hot oil, pale and soft, and they fry golden and hard.',
    hint: 'The press lays a pale spiral into the oil: pale dough is soft and folds under you, and once it fries golden it holds. But the golden one you wait on is the oldest, and the ladle comes for it: go the moment the pale one turns. Keep out from under the press head while it is down: a jump under it hits it.',
    par: 43,
    map: Grid.ground(G).pit(5, 26).put(1, 14, '@').put(29, 14, 'E').rows(),
    build(w: World) {
      kadai(w, 5, 27);
      const press = w.add(new Press(px(2.2)));
      const ladle = w.add(new Ladle(px(1.5)));
      const m1 = M(w, 'r1', 7, 5, 'golden');
      const m2 = M(w, 'r2', 14, 5, 'pale', { hidden: true });
      M(w, 'r3', 22, 5, 'golden');
      // as you come up to the oil the press goes out and lays the second spiral, exactly where your next hop lands;
      // the golden one you'd wait on is the oldest in the kadai: the ladle takes it out at 2.9 s
      onPass(w, px(3.0), (w2) => {
        press.lay(w2, m2, px(14), 'pale', 1.2, 70);
        w2.say('Murukku pizhiyaren! | Pressing a murukku!', px(5), px(10), 1.4, 'npc');
        w2.after(2.6, () => ladle.take(w2, m1, 0.4));
      });
      sign(w, 0.3, 10.4, 3.4, 'MURUKKU', 'shop', null, 'kadai hot');
      rival(w, 4, G, 1, tara(8));
      onPass(w, px(2), (w2) => w2.guide('Pon niram-la dhaan nillu. | Stand only on the golden ones.'));
      // Tara, as the pale one lands: go on, it floats
      w.when(
        () => m2.visible && m2.fry === 'pale',
        (w2) => taraSays(w2, 'Mithakkudhu paaru! Odu, Dad! | Look, it floats! Run, Dad!', 1.6),
      );
      collectible(w, 'tumbler', 20, 9.6);
    },
  };
}

// ================================================================== the acts
/** A2: the darkest spiral is the one the ladle takes; it swings back dripping over the one before it. */
export const karandi: Act = {
  id: 'chn09-karandi',
  w: 30,
  advice: 'The cook lifts the darkest spiral out first: the moment you land near it his ladle hovers over it, scoops, and swings back dripping hot oil over the spiral before it. Step back to the bank when the ladle hovers; once he has laid a fresh one in the gap and it turns golden, go.',
  paint: (g, c) => {
    g.pit(c.x + 4, c.x + 24);
  },
  build: (w, c) => {
    const x = c.x;
    kadai(w, x + 4, x + 25);
    const press = w.add(new Press(px(x + 1.6)));
    const ladle = w.add(new Ladle(px(x + 1)));
    w.hazards.push(ladle.drip);
    const a = M(w, 'k1', x + 6, 5, 'golden');
    const b = M(w, 'k2', x + 13, 5, 'dark');
    M(w, 'k3', x + 20, 5, 'golden');
    w.when(
      (w2) => w2.standing(a.solid),
      (w2) => {
        w2.say('Adhu over-aa fry aagiduchu! | That one is over-fried!', px(x + 12), px(9.5), 1.3, 'npc');
        ladle.take(w2, b, 0.9, a, (w3) => press.lay(w3, b, px(x + 13), 'pale', 1.2));
      },
    );
    onPass(w, px(x + 2), (w2) => w2.guide('Karandi-ya paaru. | Watch the ladle.'));
    w.when(
      () => ladle.state === 'hover',
      (w2) => taraSays(w2, 'Nillu, Dad! Nee safe! | Stay, Dad! You are safe!', 1.4),
    );
  },
};

/** A3: a big spiral has an eye in the middle, and its far turn is still coming out of the press. */
export const kannu: Act = {
  id: 'chn09-kannu',
  w: 30,
  advice: 'A big spiral: its middle is the eye, a hole wider than a stride, and the press comes down over its far turn as you land on it. Land on the near turn, wait for the press to lift away, then hop the eye to the far turn.',
  paint: (g, c) => {
    g.pit(c.x + 4, c.x + 24);
  },
  build: (w, c) => {
    const x = c.x;
    kadai(w, x + 4, x + 25);
    // any hop under this press head hits it
    const press = w.add(new Press(px(x + 1.6), 48));
    // near turn 5 tiles, eye 1.5 tiles, far turn 5 tiles
    const big = M(w, 'e1', x + 6, 11.5, 'golden', { eye: [80, 104] });
    M(w, 'e2', x + 19.5, 5.5, 'golden');
    // land on the near turn and the press comes down over the far turn, right where a hop over the eye peaks,
    // and stays down for a good second
    w.when(
      (w2) => w2.standing(big.solid),
      (w2) => {
        press.lay(w2, null, px(x + 13.5) - 8, 'pale', 0.3, 8);
        w2.say('Innum oru suttru! | One more turn!', px(x + 13), px(9.5), 1.3, 'npc');
        taraSays(w2, 'Nadu-la thaandu, Dad! | Jump the middle, Dad!', 1.4);
      },
    );
    onPass(w, px(x + 2), (w2) => w2.guide('Periya murukku: nadu-la kannu. | Big murukku: an eye in the middle.'));
  },
};

/** A4: thenkuzhal fries white, so colour says nothing: the bubbles do; and the one you wait on is the oldest. */
export const thenkuzhal: Act = {
  id: 'chn09-thenkuzhal',
  w: 30,
  advice: 'Thenkuzhal fries white, so its colour never changes: watch the oil instead, it bubbles round a strand that is still frying. Step on when the bubbles stop, and do not wait too long: the spiral you are standing on is the oldest one here, and the ladle comes for it.',
  paint: (g, c) => {
    g.pit(c.x + 4, c.x + 24);
  },
  build: (w, c) => {
    const x = c.x;
    kadai(w, x + 4, x + 25);
    const press = w.add(new Press(px(x + 1.6)));
    const ladle = w.add(new Ladle(px(x + 1)));
    const a = M(w, 't1', x + 6, 5, 'dark');
    const b = M(w, 't2', x + 13, 5, 'white', { hidden: true });
    M(w, 't3', x + 20, 5, 'golden');
    // land on the first spiral: the press lays a white one (it bubbles 1.5 s and never changes colour); the ladle
    // comes for the one you stand on at 3 s
    w.when(
      (w2) => w2.standing(a.solid),
      (w2) => {
        press.lay(w2, b, px(x + 13), 'white', 1.5);
        w2.say('Thenkuzhal! Vellai-aa dhaan irukkum! | Thenkuzhal! It stays white!', px(x + 11), px(9.5), 1.5, 'npc');
        w2.after(3.2, () => ladle.take(w2, a, 0.5));
      },
    );
    w.when(
      () => b.visible,
      (w2) => taraSays(w2, 'Pon niram varum, wait pannu! | It will go golden, wait!', 1.6),
    );
    onPass(w, px(x + 2), (w2) => w2.guide('Ennai kodhikkudha paaru. | See if the oil is bubbling.'));
  },
};

/** A5: a whole row laid at once is all the same age, so the ladle starts at your end: wait for golden, then run it. */
export const varisai: Act = {
  id: 'chn09-varisai',
  w: 30,
  advice: 'A row of four spirals laid together: all pale, all turning golden together. Then the cook starts lifting them from YOUR end, one after another. Wait for the row to turn, then run the whole row without stopping.',
  paint: (g, c) => {
    g.pit(c.x + 4, c.x + 20);
  },
  build: (w, c) => {
    const x = c.x;
    kadai(w, x + 4, x + 21);
    const ladle = w.add(new Ladle(px(x + 1)));
    const row = [0, 1, 2, 3].map((i) => M(w, `v${i}`, x + 6 + i * 2, 2, 'pale', { hidden: true }));
    M(w, 'v4', x + 16, 5, 'golden');
    // the whole row drops in as you come near (the big four-nozzle press), turns golden together, and from 2.4 s on
    // the ladle takes it from the near end
    onPass(w, px(x + 3.0), (w2) => {
      row.forEach((m, i) => m.lay(w2, px(x + 6 + i * 2), 'pale', 1.2 + i * 0.01));
      w2.say('Naalu varisai! | A row of four!', px(x + 10), px(9.5), 1.3, 'npc');
      let i = 0;
      const next = (w3: World) => {
        if (i >= row.length) return;
        const m = row[i++];
        ladle.take(w3, m, 0.3, null, (w4) => w4.after(0.05, () => next(w4)));
      };
      w2.after(2.6, () => next(w2));
    });
    w.when(
      () => row[0].fry === 'golden',
      (w2) => taraSays(w2, 'Medhuvaa po, Dad! | Go slow, Dad!', 1.4),
    );
    onPass(w, px(x + 2), (w2) => w2.guide('Varisai-la nikkaadhe. | Do not stop on the row.'));
  },
};

/** A6: the cook tastes a finished spiral: he snaps its near end off, then lifts the rest. */
export const ruchi: Act = {
  id: 'chn09-ruchi',
  w: 30,
  advice: 'The cook tastes a finished spiral: as you land on its near end his hand comes down and snaps that end off, and a moment later his ladle lifts the rest. Do not stop on it: land and keep going to the next one.',
  paint: (g, c) => {
    g.pit(c.x + 4, c.x + 21);
  },
  build: (w, c) => {
    const x = c.x;
    kadai(w, x + 4, x + 22);
    const ladle = w.add(new Ladle(px(x + 1)));
    // one long spiral: near end 5 tiles (snapped off), the rest 4 tiles
    const end = M(w, 'u1', x + 6, 5, 'golden');
    const rest = M(w, 'u2', x + 11, 4, 'golden');
    M(w, 'u3', x + 17, 5, 'golden');
    const hand = w.add(new Hand(px(x + 6), px(5)));
    w.when(
      (w2) => w2.standing(end.solid) || w2.standing(rest.solid),
      (w2) => {
        w2.say('Ruchi paakkaren! | Let me taste!', px(x + 8), px(9.5), 1.2, 'npc');
        w2.after(0.5, () =>
          hand.snap(w2, (w3) => {
            end.hide();
            w3.emit('fx', end.cx, OIL, { kind: 'poof', w: 40, h: 8 });
            w3.after(0.2, () => ladle.take(w3, rest, 0.4));
          }),
        );
      },
    );
    onPass(w, px(x + 2), (w2) => w2.guide('Munnaadi nunni odanjidum. | The near end gets snapped off.'));
  },
};
