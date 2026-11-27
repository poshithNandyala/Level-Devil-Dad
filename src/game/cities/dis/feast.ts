// DIS round 4: two acts for DIS-05 from allocation v3.
//  F449 pickup-row-is-floor: the Uruka night feast laid on banana leaves across the drain: the leaves with the pithas are
//       the FLOOR; jumping for a pitha tips its leaf. Walk on the feast. (The meji fire itself is never a trap.)
//  F450 scaffold-deadline-collapse: the Bihu machan stage is planked ahead of you, a plank every 1.25 s; at the drum roll
//       every plank drops: keep up with the planking, and be off the far end before the roll ends.
import { Entity, type World } from '../../world';
import { Solid } from '../../body';
import { tara } from '../../levels/endkit';
import type { Act } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { Danger, Decor, GROUND, px, river } from './entities';
import { Host, gam } from './gamosa';

/** banana leaves over the drain: they hold a walker, and tip under a landing */
export class Leaves extends Entity {
  solids: Solid[] = [];
  constructor(xs: number[], w: number) {
    super();
    this.layer = 1;
    for (const x of xs) this.solids.push(new Solid(x, GROUND, w, 6));
  }
  update(w: World) {
    const p = w.player;
    if (w.tick - p.landTick > 3) return;
    for (const s of this.solids) if (s.collidable && p.onGround && p.isRiding(s)) s.collidable = false;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    for (const s of this.solids) {
      if (!s.collidable) continue;
      ctx.fillStyle = '#3F8A3A';
      ctx.fillRect(s.x, GROUND, s.w, 5);
      ctx.fillStyle = '#6DBE5A';
      ctx.fillRect(s.x, GROUND, s.w, 1.5);
      // pithas laid on the leaf, and one more on a stand above it, at jump height
      for (let k = 6; k < s.w - 4; k += 12) {
        ctx.fillStyle = '#E9D7A8';
        ctx.fillRect(s.x + k, GROUND - 4, 8, 4);
      }
      ctx.fillStyle = '#E9D7A8';
      ctx.beginPath();
      ctx.arc(s.x + s.w / 2, GROUND - 30 + Math.sin(w.tick * 0.08) * 1.5, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** DIS-05 act: the Uruka feast across the drain (F449). */
export const gamFeast: Act = {
  id: 'dis05-feast',
  w: 20,
  advice: 'Uruka night: the feast is laid out on banana leaves right across the drain, pithas on every leaf. The leaves are the floor: walk across on them. Jump for a pitha and the leaf tips under your landing. Then hop the ditch beyond.',
  cps: [1.5],
  paint: (g, c) => {
    g.pit(c.x + 6, c.x + 9);
    g.pit(c.x + 11, c.x + 12);
  },
  build: (w, c) => {
    const x = c.x;
    river(w, x + 6, x + 10, 'dis-kol-paat');
    w.add(new Leaves([px(x + 6), px(x + 8)], px(2)));
    const ditch = new Danger({ x: px(x + 11), y: GROUND + 4, w: px(2), h: 80 }, 'dis-pit');
    w.add(ditch);
    // fix round 2 (QA B1): the ditch's line names how you got into it: walked off the end of the leaves, jumped the
    // whole feast (dis-pit), or backed off into it from the far side
    let onLeaves = false;
    let far = 0; // the furthest he has stood: past the ditch means he came back into it
    w.onTick((w2) => {
      const p = w2.player;
      if (!p.onGround) return;
      far = Math.max(far, p.cx);
      if (p.cx > px(x + 6.6) && p.cx < px(x + 9)) onLeaves = true;
      ditch.hazard.cause = far > px(x + 13.5) ? 'dis-feast-back' : onLeaves ? 'dis-feast-gat' : 'dis-pit';
    });
    onPass(w, px(x + 2), (w2) => tara(w2, 'Pitha lua, Dad! | Take a pitha, Dad!', 2.4));
  },
};

/** the machan stage being planked over the field drain: plank i is laid at i × `every` ticks after Dad passes `trig`;
 *  after the last one the drum rolls for `roll` ticks, then every plank drops */
export class Machan extends Entity {
  solids: Solid[] = [];
  started = -1;
  constructor(
    readonly c0: number,
    readonly n: number,
    readonly pw: number,
    readonly trig: number,
    readonly every = 150,
    readonly roll = 120,
  ) {
    super();
    this.layer = 1;
    for (let i = 0; i < n; i++) {
      const s = new Solid(px(c0 + i * pw), GROUND, px(pw), 8);
      s.collidable = false;
      this.solids.push(s);
    }
  }
  t(w: World) {
    return this.started < 0 ? -1 : w.tick - this.started;
  }
  /** ticks till the drop (Infinity before the roll) */
  rolling(w: World) {
    const t = this.t(w);
    return t >= this.n * this.every;
  }
  dropped(w: World) {
    return this.t(w) >= this.n * this.every + this.roll;
  }
  update(w: World) {
    if (this.started < 0 && w.player.cx >= this.trig) this.started = w.tick;
    const t = this.t(w);
    if (t < 0) return;
    this.solids.forEach((s, i) => (s.collidable = t >= i * this.every && !this.dropped(w)));
    if (this.rolling(w) && !this.dropped(w) && t % 12 === 0) w.sfx('drum', px(this.c0), GROUND - 30);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const t = this.t(w);
    this.solids.forEach((s, i) => {
      if (!s.collidable) return;
      ctx.fillStyle = '#B08A3E';
      ctx.fillRect(s.x, GROUND, s.w, 6);
      ctx.fillStyle = '#7A5A22';
      for (let k = 4; k < s.w; k += 10) ctx.fillRect(s.x + k, GROUND, 1, 6);
      void i;
    });
    // the carpenter laying the next plank, and the drummer whose roll is the cue
    const next = Math.min(this.n - 1, Math.max(0, Math.floor(Math.max(0, t) / this.every) + 1));
    ctx.fillStyle = '#5B4A2E';
    ctx.fillRect(px(this.c0 + next * this.pw) + 4, GROUND - 22, 8, 22);
    if (this.rolling(w) && !this.dropped(w)) {
      ctx.fillStyle = '#C1121F';
      ctx.fillRect(px(this.c0 + this.n * this.pw) + 10, GROUND - 40, 14, 10 + ((w.tick >> 2) % 2) * 2);
    }
  }
}

/** DIS-05 act: the Bihu machan (F450). */
export const gamMachan: Act = {
  id: 'dis05-machan',
  w: 22,
  advice: 'The Bihu machan stage at Latasil is being planked over the field drain, a plank laid in front of you every second or so. When the drum rolls, every plank comes down: keep up with the carpenter, step on to each plank as it is laid, and be off the far end before the roll ends. Run on ahead and the far end is not built yet.',
  cps: [1.5],
  paint: (g, c) => {
    g.pit(c.x + 6, c.x + 17);
  },
  build: (w, c) => {
    const x = c.x;
    river(w, x + 6, x + 18, 'dis-luit');
    const m = w.add(new Machan(x + 6, 4, 3, px(x + 5)));
    // the planks drop into the drain, which is the machan's own cause
    w.add(
      new (class extends Entity {
        update(w2: World) {
          if (m.dropped(w2) && w2.state === 'play' && w2.player.cx > px(x + 6) && w2.player.cx < px(x + 18) && w2.player.y + w2.player.h >= GROUND) w2.die('dis-machan');
        }
      })(),
    );
    (w.flags.machan ??= []).push(m);
    onPass(w, px(x + 2), (w2) => tara(w2, 'Bihu machan, Dad! Lahe lahe. | The Bihu stage, Dad! Take it slow.', 2.4));
  },
};

/** DIS-05 act (v3 F452 remembered-gap-is-bridged): three hosts at a wedding yard in Jorhat hang gamosas on you, and with
 *  three you cannot see your feet. The nala you saw before the cloth came has since had a bamboo laid over it: its shadow
 *  shows past the gap's drawn end. Walk it. A jump meets the low machan beam over it; backing off finds the ditch behind. */
export const gamSanko: Act = {
  id: 'dis05-sanko',
  w: 24,
  advice: 'A wedding yard in Jorhat: three hosts hang gamosas on you one after another, and with three you can’t see your feet. You saw the nala ahead before the cloth came, but someone has laid a bamboo over it since: look at its shadow, past the nala’s end. Walk across. Jump it and you hit the low beam of the wedding machan; back off to find a host and you are in the ditch behind you.',
  paint: (g, c) => {
    g.pit(c.x + 5, c.x + 6);
    g.pit(c.x + 12, c.x + 16);
  },
  build: (w, c) => {
    const x = c.x;
    onPass(w, px(x + 0.5), (w2) => (gam(w2).n = 0));
    // fix round 2 (QA B1): the ditch names how you got into it: walked on into it, or backed off into it for a host
    const ditch = new Danger({ x: px(x + 5), y: GROUND + 4, w: px(2), h: 80 }, 'dis-sanko-gat');
    w.add(ditch);
    let far = 0; // the furthest he has stood: past the ditch means he came back into it
    w.onTick((w2) => {
      if (w2.player.onGround) far = Math.max(far, w2.player.cx);
      ditch.hazard.cause = far > px(x + 7.5) ? 'dis-sanko-pit' : 'dis-sanko-gat';
    });
    for (const k of [8, 9, 10]) w.add(new Host(px(x + k) + 8, GROUND, 'give'));
    river(w, x + 12, x + 17, 'dis-nala');
    // the bamboo laid over the nala, and its shadow on the far bank
    const bamboo = new Solid(px(x + 12), GROUND, px(5), 6);
    bamboo.collidable = false;
    w.solids.push(bamboo);
    // laid over the nala while the cloth was coming down: it is there once you are wearing three
    w.onTick((w2) => {
      if (gam(w2).n >= 3) bamboo.collidable = true;
    });
    w.add(new Danger({ x: px(x + 11), y: GROUND - 40, w: px(7), h: 14 }, 'dis-beam'));
    w.add(
      new Decor((ctx) => {
        ctx.fillStyle = bamboo.collidable ? 'rgba(0,0,0,0.28)' : 'rgba(0,0,0,0)';
        ctx.fillRect(px(x + 17), GROUND + 1, 24, 3);
        ctx.fillStyle = '#7A5A22';
        ctx.fillRect(px(x + 11), GROUND - 40, px(7), 6);
        ctx.fillRect(px(x + 11), GROUND - 40, 3, 40);
        ctx.fillRect(px(x + 18) - 3, GROUND - 40, 3, 40);
      }, -2),
    );
    for (const k of [19, 21]) w.add(new Host(px(x + k) + 8, GROUND, 'take'));
    onPass(w, px(x + 2), (w2) => tara(w2, 'Jump, Dad! Nala! | Jump, Dad! The drain!', 2.2));
  },
};
