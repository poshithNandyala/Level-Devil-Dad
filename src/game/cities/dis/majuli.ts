// DIS round 4: two acts for DIS-06 (Majuli's bank) from allocation v3.
//  F454 refuge-not-flight: a ferry's wake runs along the bank; the spur's lee (a hollow behind it) is the one refuge, and
//       running on past the lee brings the reverse wake back off the far spur: shelter, wait, then go.
//  F456 bell-names-the-moving-platform: fish traps on pulleys over the Garmur channel; the one whose bell rings is about
//       to be hoisted to the beam: leave a ringing trap for a silent one; a trap just let down is slack and tips.
import { Entity, type World } from '../../world';
import { Solid } from '../../body';
import { tara } from '../../levels/endkit';
import type { Act } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { DT } from '../../constants';
import { Danger, GROUND, px, river } from './entities';

/** a wake: a low wave running along the bank from x0 to x1 (px) at `speed` px/s once Dad passes `trig` */
export class Wake extends Entity {
  danger: Danger;
  started = -1;
  x: number;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly go: (w: World) => boolean,
    readonly speed: number,
    readonly cause = 'dis-dhal',
    /** the spur's lee (px): the wave breaks on the spur and does not reach in here */
    readonly lee: [number, number] = [0, 0],
  ) {
    super();
    this.layer = 4;
    this.x = x0;
    this.danger = new Danger({ x: x0, y: GROUND - 14, w: 26, h: 14 }, cause, false);
  }
  get running() {
    return this.started >= 0 && (this.speed > 0 ? this.x < this.x1 : this.x > this.x1);
  }
  update(w: World) {
    if (this.started < 0 && this.go(w)) this.started = w.tick;
    if (this.running) this.x += this.speed * DT;
    this.danger.box.x = this.x - 13;
    this.danger.on = this.running && !(this.x >= this.lee[0] - 10 && this.x <= this.lee[1] + 10);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (!this.running) return;
    ctx.fillStyle = 'rgba(200,220,225,0.85)';
    const lead = this.speed > 0 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(this.x - 16 * lead, GROUND);
    ctx.quadraticCurveTo(this.x, GROUND - 22 - Math.sin(w.tick * 0.4) * 2, this.x + 14 * lead, GROUND);
    ctx.fill();
  }
}

/** DIS-06 act: the ferry's wake (F454). */
export const majuliWake: Act = {
  id: 'dis06-wake',
  w: 34,
  advice: 'A ferry passes on the Brahmaputra and its wake runs along the bank behind you, faster than you can run. It breaks on the bamboo spur: hop over the spur into its lee, the two steps just behind it, and let the wake run past. Don’t run on past the lee: the wake comes back off the far spur. And don’t hop the wave on the undercut bank before the spur: a landing breaks it off.',
  cps: [1.5, 14],
  paint: (g, c) => {
    const x = c.x;
    // the spur: a stout bamboo post the wake breaks on; its lee is the two columns just behind it
    g.fill(x + 10, x + 10, 13, 14, '#');
    // the undercut bank before the spur: it holds a walker, not a landing
    g.pit(x + 6, x + 8);
  },
  build: (w, c) => {
    const x = c.x;
    const a = w.add(new Wake(px(x - 6), px(x + 30), (w2) => w2.player.cx >= px(x + 6), 230, 'dis-dhal', [px(x + 11), px(x + 13)]));
    w.hazards.push(a.danger.hazard);
    // the back-wash comes off the far spur if you run on past the lee while the first wake is still behind you
    const b = w.add(new Wake(px(x + 30), px(x + 1), (w2) => w2.player.cx >= px(x + 14.5) && a.running && a.x < w2.player.cx, -230));
    w.hazards.push(b.danger.hazard);
    (w.flags.wakes ??= []).push(a, b);
    // the bank before the spur is undercut: a slab over the water that holds a walker but breaks under a landing
    river(w, x + 6, x + 9, 'dis-bank');
    w.add(new LandBreak([px(x + 6)], px(3)));
    onPass(w, px(x + 2), (w2) => tara(w2, 'Dour, Dad, dour! | Run, Dad, run!', 2));
  },
};

/** slabs over water that hold a walker but break off under a landing (the river has undercut them) */
export class LandBreak extends Entity {
  solids: Solid[] = [];
  constructor(xs: number[], w: number) {
    super();
    this.layer = 1;
    for (const x of xs) this.solids.push(new Solid(x, GROUND, w, 12));
  }
  update(w: World) {
    const p = w.player;
    if (w.tick - p.landTick > 3) return;
    for (const s of this.solids) if (s.collidable && w.standing(s)) s.collidable = false;
  }
  draw(ctx: CanvasRenderingContext2D) {
    for (const s of this.solids) {
      if (!s.collidable) continue;
      ctx.fillStyle = '#B79F7A';
      ctx.fillRect(s.x, GROUND, s.w, 12);
      ctx.fillStyle = '#6FA04A';
      ctx.fillRect(s.x, GROUND, s.w, 3);
      ctx.strokeStyle = '#4A3C2E';
      ctx.beginPath();
      ctx.moveTo(s.x + s.w * 0.4, GROUND + 3);
      ctx.lineTo(s.x + s.w * 0.5, GROUND + 11);
      ctx.stroke();
    }
  }
}

/** a fish trap on a pulley (F456): rings for `ring` ticks, is hoisted to the beam for `up` ticks, let down slack for `slack`
 *  ticks (it tips under a landing), then rests; `phase` offsets its cycle; starts on Dad passing `trig` */
export class Trap extends Entity {
  solid: Solid;
  started = -1;
  y0 = GROUND;
  constructor(
    readonly x: number,
    readonly trig: number,
    readonly phase: number,
    readonly cycle = 480,
    readonly ring = 110,
    readonly up = 100,
    readonly slack = 80,
  ) {
    super();
    this.layer = 2;
    this.solid = new Solid(x, GROUND, px(2), 10);
  }
  t(w: World) {
    return this.started < 0 ? -1 : (w.tick - this.started + this.phase) % this.cycle;
  }
  state(w: World): 'rest' | 'ring' | 'up' | 'slack' {
    const t = this.t(w);
    if (t < 0) return 'rest';
    if (t < this.ring) return 'ring';
    if (t < this.ring + this.up) return 'up';
    if (t < this.ring + this.up + this.slack) return 'slack';
    return 'rest';
  }
  update(w: World) {
    if (this.started < 0 && w.player.cx >= this.trig) this.started = w.tick;
    const st = this.state(w);
    const on = w.standing(this.solid);
    if (st === 'up') {
      // hoisted: up out of reach to the beam, with anyone on it
      if (on && w.state === 'play') w.die('dis-dirru');
      this.solid.collidable = false;
    } else this.solid.collidable = true;
    if (st === 'slack' && w.tick - w.player.landTick <= 3 && w.player.onGround && w.player.isRiding(this.solid) && w.state === 'play') w.die('dis-tip');
    if (st === 'ring' && this.t(w) % 20 === 0) w.sfx('bell', this.x + 16, GROUND - 40);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const st = this.state(w);
    const y = st === 'up' ? GROUND - 70 : GROUND;
    // the rope to the beam, the bell, the bamboo trap (a polo basket on a platform)
    ctx.strokeStyle = '#6B5A3A';
    ctx.beginPath();
    ctx.moveTo(this.x + 16, 40);
    ctx.lineTo(this.x + 16, y);
    ctx.stroke();
    ctx.fillStyle = st === 'ring' ? '#F2C14E' : '#9C8A55';
    ctx.beginPath();
    ctx.arc(this.x + 16 + (st === 'ring' ? Math.sin(w.tick * 0.8) * 3 : 0), 52, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = st === 'slack' ? '#8A7A50' : '#A8874A';
    ctx.fillRect(this.x, y + (st === 'slack' ? 2 : 0), 32, 8);
    ctx.strokeStyle = '#6A4B1C';
    for (let k = 4; k < 32; k += 6) ctx.strokeRect(this.x + k, y - 8, 3, 8);
  }
}

/** DIS-06 act: the fish traps on pulleys (F456), the long stage's sound beat. */
export const majuliTraps: Act = {
  id: 'dis06-traps',
  w: 23,
  advice: 'Fish traps hang on pulleys over the Garmur channel, platforms you can stand on. When a trap’s bell rings, it is about to be hoisted up to the beam: get off a ringing trap, on to a silent one. A trap that has just come down is still slack on its rope, and a landing tips it: wait for it to settle.',
  cps: [1.5],
  paint: (g, c) => {
    g.pit(c.x + 6, c.x + 18);
  },
  build: (w, c) => {
    const x = c.x;
    river(w, x + 6, x + 19, 'dis-luit');
    // each trap is slack (just let down) while the one before it rings, and settles a moment later
    const traps = [7, 11, 15].map((k, i) => w.add(new Trap(px(x + k), px(x + 4), [330, 60, 270][i])));
    (w.flags.traps ??= []).push(...traps);
    onPass(w, px(x + 2), (w2) => tara(w2, 'Ghonta bazise? Bhal! | The bell is ringing? Good!', 2.4));
  },
};
