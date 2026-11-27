// SVP-08 Do Monsoon: the island has two monsoons, and the second comes from the other side. The rain falls on the
// street in hard sheets; only the lee end of an awning is dry, and the lee end is the end the wind blows towards.
// First rain from the west: the right end of each awning. Then a lull, and in the lull the cloud bank and the slanting
// rain lines show on the opposite horizon and every awning tilts to the new side: the rain from the east, and the left
// end is dry. Whoever sheltered and stayed put is drenched. The act is a longer street, and the door has a gutter that
// runs like a river for as long as it rains.
import { Entity, type LevelDef, type World } from '../../world';
import { door, rival, collectible } from '../../levels/kit';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { FLOOR, text } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { lines as L } from './lines';
import { Fx, Hurt, awning as drawAwning, px, TAU, type Ctx } from './kit';

export type Wind = 1 | -1;
const LEE = 38;
/** the cycle: an opening lull, then rain from the west, a lull, rain from the east, a lull, and again */
const FIRST_LULL = 80;
const RAIN = 240;
const LULL = 270;
const KILL = 84;

export class Awning {
  tilt: number;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly y = FLOOR - 44,
  ) {
    this.tilt = 1;
  }
  /** the dry ground under the awning for wind `d` (the lee end) */
  lee(d: Wind): [number, number] {
    return d > 0 ? [this.x1 - LEE, this.x1] : [this.x0, this.x0 + LEE];
  }
}

/** the weather over the whole stage: it starts when Dad first comes near the street */
export class Weather extends Entity {
  t = -1;
  awnings: Awning[] = [];
  /** covered stretches that are dry for any wind: [x0, x1] px */
  porches: [number, number][] = [];
  wet = 0;
  /** where the rain is now, and which way it will blow next */
  raining = false;
  dir: Wind = 1;
  next: Wind = 1;
  left = 0;
  private now = 0;
  /** where the weather starts over from its first lull (each section of the street has its own), px */
  readonly resets: number[] = [];
  private fired = new Set<number>();
  constructor(readonly startX: number) {
    super();
    this.layer = 6;
  }
  add(a: Awning) {
    this.awnings.push(a);
    return a;
  }
  /** phase from the clock */
  private phaseAt(t: number): { rain: boolean; dir: Wind; next: Wind; left: number; age: number } {
    if (t < FIRST_LULL) return { rain: false, dir: 1, next: 1, left: FIRST_LULL - t, age: t };
    // a section has two rains, west and then east, and then the sky is clear until the next section starts it again
    if (t >= FIRST_LULL + RAIN + LULL + RAIN) return { rain: false, dir: -1, next: -1, left: 99999, age: t };
    const k = t - FIRST_LULL;
    const period = RAIN + LULL;
    const n = Math.floor(k / period);
    const r = k % period;
    const dir: Wind = n % 2 === 0 ? 1 : -1;
    if (r < RAIN) return { rain: true, dir, next: dir, left: RAIN - r, age: r };
    return { rain: false, dir, next: (-dir) as Wind, left: period - r, age: r - RAIN };
  }
  /** is this x (px) on dry ground right now? */
  dryAt(cx: number, d: Wind) {
    if (this.porches.some(([a, b]) => cx >= a && cx <= b)) return true;
    return this.awnings.some((a) => {
      const [z0, z1] = a.lee(d);
      return cx >= z0 + 3 && cx <= z1 - 3;
    });
  }
  /** seconds of clock until the rain next changes */
  update(w: World) {
    this.now = w.tick;
    if (this.t < 0) {
      if (w.player.cx >= this.startX) this.t = 0;
      else return;
    } else this.t++;
    for (const r of this.resets)
      if (w.player.cx >= r && !this.fired.has(r)) {
        this.fired.add(r);
        this.t = 0;
        this.wet = 0;
      }
    const ph = this.phaseAt(this.t);
    this.raining = ph.rain;
    this.dir = ph.dir;
    this.next = ph.next;
    this.left = ph.left;
    // the awnings swing to the new side during the lull
    for (const a of this.awnings) {
      const want = ph.rain ? ph.dir : ph.age > 40 ? ph.next : ph.dir;
      a.tilt += (want - a.tilt) * 0.06;
    }
    if (ph.rain && !ph.age) w.sfx('rumble', w.player.cx, FLOOR - 50);
    if (w.state !== 'play') return;
    const p = w.player;
    const exposed = ph.rain && !this.dryAt(p.cx, ph.dir) && p.y + p.h > FLOOR - 70;
    this.wet = exposed ? this.wet + 1 : Math.max(0, this.wet - 3);
    if (this.wet >= KILL) w.die('svp-baarish');
  }
  /** a running count for the board: ticks since the weather started */
  draw(ctx: Ctx, w: World) {
    // the awnings (tilted: the low end is the lee end)
    for (const [a, b] of this.porches) {
      ctx.fillStyle = '#4A3A2A';
      for (let x = a + 4; x <= b - 2; x += 40) ctx.fillRect(x, FLOOR - 52, 3, 52);
      ctx.fillStyle = '#7C8A92';
      ctx.fillRect(a - 4, FLOOR - 58, b - a + 8, 6);
      ctx.fillStyle = '#5A6770';
      ctx.fillRect(a - 4, FLOOR - 53, b - a + 8, 2);
      ctx.fillStyle = 'rgba(58,30,18,0.25)';
      ctx.fillRect(a, FLOOR - 36, b - a, 36);
    }
    for (const a of this.awnings) {
      const lean = -a.tilt * 14;
      drawAwning(ctx, a.x0, a.x1, a.y, '#1F7A8C', '#F4ECD6', lean);
      // shop front behind: a shutter and a plank counter
      ctx.fillStyle = 'rgba(58,30,18,0.35)';
      ctx.fillRect(a.x0 + 4, FLOOR - 34, a.x1 - a.x0 - 8, 34);
    }
    if (this.t < 0) return;
    const ph = this.phaseAt(this.t);
    const c = w.player.cx;
    // the lee patches on the ground: where the rain does not reach
    if (ph.rain) {
      for (const a of this.awnings) {
        const [z0, z1] = a.lee(ph.dir);
        ctx.fillStyle = 'rgba(30,60,70,0.16)';
        ctx.fillRect(z0, FLOOR - 36, z1 - z0, 36);
      }
      // the sheets of rain, slanting with the wind, not falling where an awning keeps them off
      ctx.strokeStyle = 'rgba(210,235,248,0.7)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (let x = c - 300; x < c + 300; x += 6) {
        const k = (Math.floor(x) * 7919) % 53;
        if (this.dryAt(x + 0, ph.dir) && k % 1 === 0) continue;
        const y = 20 + ((this.now * 3.4 + k * 11) % (FLOOR - 24));
        ctx.moveTo(x + (k % 4), y);
        ctx.lineTo(x + (k % 4) + ph.dir * 5, y + 9);
      }
      ctx.stroke();
      ctx.fillStyle = 'rgba(40,70,90,0.14)';
      ctx.fillRect(c - 300, 0, 600, FLOOR);
    } else {
      // the lull: the cloud bank and its slanting lines show on the horizon the next rain comes from
      const side = ph.next > 0 ? -1 : 1;
      const bx = c + side * 230;
      const a = ph.age > 40 || this.t < FIRST_LULL ? 1 : 0.4;
      const g = ctx.createLinearGradient(bx - 90, 0, bx + 90, 0);
      g.addColorStop(0, 'rgba(40,52,70,0)');
      g.addColorStop(0.5, `rgba(40,52,70,${0.62 * a})`);
      g.addColorStop(1, 'rgba(40,52,70,0)');
      ctx.fillStyle = g;
      ctx.fillRect(bx - 90, 24, 180, 130);
      ctx.strokeStyle = `rgba(200,225,240,${0.65 * a})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < 9; i++) {
        const sx = bx - 70 + i * 17;
        ctx.moveTo(sx, 90);
        ctx.lineTo(sx + ph.next * 12, 150);
      }
      ctx.stroke();
    }
  }
}

// ================================================================== the room
function street(w: World, aw: [number, number][], startX: number) {
  const wx = new Weather(startX);
  w.add(wx);
  for (const [a, b] of aw) wx.add(new Awning(px(a), px(b)));
  w.flags.weather = wx;
  return wx;
}

export function monsoonRoom(): LevelDef {
  return {
    id: 'SVP-08',
    city: 'SVP',
    index: 8,
    name: 'Do Monsoon',
    nameEn: 'Two monsoons',
    tagline: 'The islands have two monsoons a year, and the second comes from the other side. The shopkeepers know which way to hang the awnings.',
    hint: 'The rain comes in hard sheets, and out in the open it drenches you in a moment. Only the lee end of an awning is dry, the end the wind blows towards. The first rain is from the west, so the right end. Then there is a lull, and before the next rain the cloud bank and the slanting lines show on the other horizon and every awning tilts that way: the second rain is from the east, so the left end is dry. Cross to the next awning in the lull.',
    par: 24,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      street(w, [[6, 11], [16, 21], [26, 31]], px(5));
      rival(w, 3, 15, 1, { intro: L.intro[6], point: 1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
      collectible(w, 'svp-kela', 18.5, 10.4);
    },
  };
}

// ================================================================== the act: a longer street
export const gali: Act = {
  id: 'svp08-gali',
  w: 56,
  advice: 'A longer street with its awnings further apart. The same two rains, west and then east, with only the lulls to cross in: be at the dry end for the rain that is coming, not the rain that has been.',
  cps: [31],
  build: (w, c) => {
    const x = c.x;
    const wx = w.flags.weather as Weather;
    wx.porches.push([px(x + 28), px(x + 34)]);
    wx.resets.push(px(x + 4), px(x + 34.5));
    wx.porches.push([px(x), px(x + 4)]);
    w.add(new Fx(null, (ctx) => text(ctx, 'BAZAAR', px(x + 31), FLOOR - 62, 6.5, '#F4ECD6', 'rgba(0,0,0,0.5)'), 3));
    for (const [a, b] of [[x + 9, x + 14], [x + 19, x + 24], [x + 38, x + 43], [x + 47, x + 52]]) wx.add(new Awning(px(a), px(b)));
  },
};

// ================================================================== the door: the gutter that is a river
export const gutterRiver: Ending = {
  space: 16,
  advice: 'The last stretch of road before the door is a gutter, and a gutter runs like a river for as long as it rains. Shelter at the last awning, wait for the lull, and cross it dry.',
  paint: (g, D) => {
    g.pit(D - 8, D - 4).fill(D - 8, D - 4, 17, 17, '#');
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    const wx = w.flags.weather as Weather;
    wx.add(new Awning(px(D - 14), px(D - 9)));
    // the checkpoint before the door is on a covered stoop, dry for any wind
    wx.porches.push([px(D - 20), px(D - 13)]);
    wx.resets.push(px(D - 13));
    let flood = 0;
    const x0 = px(D - 8),
      x1 = px(D - 3);
    const river = new Hurt(x0, FLOOR + 6, x1 - x0, 40, 'svp-nala', null);
    river.on = false;
    w.add(river);
    w.flags.twist = 'gutter';
    w.flags.gutter = { get flood() { return flood; } };
    let lastRain = -999;
    w.onTick((w2) => {
      // it floods as soon as the rain starts and drains a moment after it stops
      if (wx.raining) lastRain = w2.tick;
      const target = w2.tick - lastRain < 30;
      flood = Math.max(0, Math.min(1, flood + (target ? 0.02 : -0.06)));
      river.on = flood > 0.35;
    });
    w.add(
      new Fx(null, (ctx, w2) => {
        const lvl = FLOOR + 30 - flood * 30;
        const g = ctx.createLinearGradient(0, lvl, 0, FLOOR + 32);
        g.addColorStop(0, 'rgba(120,150,120,0.92)');
        g.addColorStop(1, 'rgba(70,90,70,0.96)');
        ctx.fillStyle = g;
        if (flood > 0) ctx.fillRect(x0, lvl, x1 - x0, FLOOR + 32 - lvl);
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 0.8;
        if (flood > 0.2) for (let x = x0 + ((w2.tick * 1.6) % 14); x < x1 - 6; x += 14) {
          ctx.beginPath();
          ctx.moveTo(x, lvl + 1);
          ctx.lineTo(x + 6, lvl + 1);
          ctx.stroke();
        }
        text(ctx, 'NALA', (x0 + x1) / 2, FLOOR - 10, 6.5, 'rgba(58,30,18,0.7)', '');
        void TAU;
      }, 5),
    );
  },
};
