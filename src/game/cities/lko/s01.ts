// LKO-01 Aadaab Lucknow, the welcome tour, with a bite. In Chowk the cloth shops hang their bolts of chikan
// overhead on poles; here they hang over a dug-up lane and you cross on them. When a bolt is sold, the
// shopkeeper's long bamboo hook rises to it and slides it out sideways, into the shop.
import type { StageMeta, World } from '../../world';
import { tour } from '../../levels/tour';
import { Art, Block, FLOOR, Zone, gent, px, type Ctx } from './kit';

const BOLT = ['#F5F1E8', '#E9D8F0', '#D7EEE3', '#F6E3C8'];

/** a bolt of cloth hung overhead as a platform: when sold, the hook rises (`hookT`), touches, and slides it
 *  out sideways in a blink, from under whoever is on it */
export class Bolt {
  b: Block;
  s: 'hung' | 'hook' | 'gone' = 'hung';
  t = 0;
  hookY: number;
  constructor(
    w: World,
    readonly x: number,
    readonly y: number,
    readonly wd: number,
    readonly colour: string,
    readonly dir: 1 | -1,
    readonly hookUp = 60,
  ) {
    this.hookY = FLOOR + 30;
    this.b = w.add(new Block(x, y, wd, 8, (ctx, bb) => this.draw(ctx, bb), 2));
    w.add(
      new Art((ctx) => {
        // the hook: a long bamboo pole with an iron hook at its tip, rising from the shop below
        if (this.s !== 'hook') return;
        const hx = this.x + this.wd / 2;
        ctx.strokeStyle = '#C8A96B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(hx + this.dir * 30, FLOOR + 40);
        ctx.lineTo(hx, this.hookY);
        ctx.stroke();
        ctx.strokeStyle = '#4E4E4E';
        ctx.beginPath();
        ctx.arc(hx, this.hookY - 3, 3, Math.PI * 0.2, Math.PI * 1.3);
        ctx.stroke();
      }, 3),
    );
  }
  sell(w: World) {
    if (this.s !== 'hung') return;
    this.s = 'hook';
    this.t = w.tick;
    w.sfx('whoosh', this.x + this.wd / 2, FLOOR);
  }
  tick(w: World) {
    if (this.s !== 'hook') return;
    const age = w.tick - this.t;
    const k = Math.min(1, age / this.hookUp);
    this.hookY = FLOOR + 30 - k * (FLOOR + 30 - (this.y + 8));
    if (age >= this.hookUp + 30) {
      // touched: out it goes, sideways, from under your feet
      this.s = 'gone';
      this.t = w.tick;
      this.b.set(false);
      w.sfx('slide', this.x + this.wd / 2, this.y);
      w.flags.bolts = (w.flags.bolts ?? 0) + 1;
    }
  }
  draw(ctx: Ctx, bb: Block) {
    let x = bb.x;
    if (this.s === 'gone') {
      const age = Math.min(1, (bb as unknown as { _w?: number })._w ?? 1);
      x += this.dir * 200 * age;
      return;
    }
    // a rolled bolt of chikan on a pole: a long soft cylinder with a white-flower edge
    ctx.fillStyle = this.colour;
    ctx.fillRect(x, bb.y, this.wd, 8);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(x, bb.y + 6, this.wd, 2);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (let xx = x + 3; xx < x + this.wd - 2; xx += 6) ctx.fillRect(xx, bb.y + 2, 2, 2);
    ctx.fillStyle = '#6D4C33';
    ctx.fillRect(x - 3, bb.y + 2, 3, 4);
    ctx.fillRect(x + this.wd, bb.y + 2, 3, 4);
  }
}

/** the bite of the tour: Chowk's cloth bolts over the dug-up lane, and the bolt that unrolls across it */
function chowkBolts(w: World) {
  const bolts = [
    new Bolt(w, px(39), px(13), px(3), BOLT[0], -1),
    new Bolt(w, px(43), px(12), px(3), BOLT[1], 1),
    new Bolt(w, px(47), px(13), px(3), BOLT[2], -1),
  ];
  w.flags.boltList = bolts;
  w.onTick((w2) => {
    const p = w2.player;
    bolts.forEach((bo) => {
      bo.tick(w2);
      // a bolt is sold the moment you land on it
      if (bo.s === 'hung' && p.onGround && p.isRiding(bo.b.solid)) bo.sell(w2);
    });
  });
  // the lane below: dug up for the new drain, deep
  w.add(
    new Art((ctx) => {
      ctx.fillStyle = '#4B3A2C';
      ctx.fillRect(px(38), FLOOR, px(13), 48);
      ctx.fillStyle = '#6D5A48';
      for (let x = px(38) + 4; x < px(51); x += 14) ctx.fillRect(x, FLOOR + 20, 8, 3);
    }, -4),
  );
  w.add(new Zone(px(38) + 1, FLOOR + 16, px(13) - 2, 30, 'lko-than'));
  // the shopkeepers in their shop fronts, under the bolts
  w.add(
    new Art((ctx) => {
      for (const [c, cl] of [
        [38, '#5A8F7B'],
        [49, '#7A4E6E'],
      ] as [number, string][])
        gent(ctx, px(c) + 8, FLOOR + 2, 24, cl, { face: c < 45 ? 1 : -1, topi: '#F5F0E6' });
    }, -3),
  );

  // the curtain: a long bolt over the lane further on, sold as you come down off the bolts. It unrolls
  // straight down across the road, a heavy wooden roller on its end.
  const C = { s: 'up' as 'up' | 'down' | 'roll' | 'rest' | 'back', t: 0, y: px(6) };
  w.flags.curtain = C;
  const cx = px(57);
  const roller = w.add(new Zone(cx - 2, C.y, 20, 8, 'lko-parda'));
  roller.on = false;
  w.add(
    new Art((ctx) => {
      ctx.fillStyle = '#6D4C33';
      ctx.fillRect(cx - 6, px(6) - 6, 28, 4);
      ctx.fillStyle = '#F2E6EF';
      ctx.fillRect(cx, px(6), 16, C.y - px(6));
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      for (let y = px(6) + 4; y < C.y - 2; y += 8) ctx.fillRect(cx + 6, y, 3, 3);
      ctx.fillStyle = '#8D5A3B';
      ctx.fillRect(cx - 2, C.y, 20, 8);
    }, 3),
  );
  w.onTick((w2) => {
    const age = w2.tick - C.t;
    const set = (s: typeof C.s) => {
      C.s = s;
      C.t = w2.tick;
    };
    if (C.s === 'up' && w2.player.onGround && w2.player.cx > px(51) && w2.player.cx < px(55)) set('down');
    else if (C.s === 'down') {
      C.y = Math.min(FLOOR - 8, C.y + 1.2);
      roller.on = true;
      if (C.y >= FLOOR - 8) {
        set('rest');
        w2.sfx('thud', cx + 8, FLOOR);
      }
    } else if (C.s === 'rest') {
      roller.on = false;
      if (age > 150) set('back');
    } else if (C.s === 'back') {
      C.y = Math.max(px(6), C.y - 1.5);
      if (C.y <= px(6)) set('roll');
    }
    roller.y = C.y;
  });
  // while it hangs to the floor it's a cloth wall across the road: you wait for it to roll up again
  const wall = w.add(new Block(cx, px(6), 16, FLOOR - px(6), () => {}, 0));
  wall.set(false);
  w.onTick(() => wall.set(C.s === 'rest'));
}

export const s01 = () =>
  ({
    ...tour({
      id: 'LKO-01',
      city: 'LKO',
      name: 'Aadaab Lucknow',
      nameEn: 'Greetings, Lucknow',
      tagline: 'The city of tehzeeb: Nawabi gates, Chowk’s chikan, Hazratganj in the evening and the Gomti. Mind the cloth shops.',
      lines: [
        'Aadaab! | Respectful greetings!',
        'Tashreef laaiye, Dad! | Please do come, Dad!',
        'Har darwaza ek jaisa hai. | Every doorway is alike.',
        'Munh mein ghul jaayega! | It’ll melt in your mouth!',
        'Wah janab, kya baat hai! | Wow sir, well done!',
        'Shukriya, aage chaliye. | Thank you, go ahead.',
      ],
      shouts: [
        [30, 'Ek chai aur, janab? | One more chai, sir?'],
        [84, 'Nahin nahin, pehle aap! | No no, after you!'],
      ],
      ride: 'cart',
      item: 'lko-malai',
      signs: [
        [8, 'RUMI DARWAZA', 'gate'],
        [35, 'CHOWK', 'chikan'],
        [68, 'HAZRATGANJ', 'ganj'],
        [102, 'GOMTI', 'river'],
      ],
      props: [
        ['lamp', 4, {}],
        ['teastall', 30, {}],
        ['lamp', 62, {}],
        ['crowd', 74, { n: 3 }],
        ['pigeons', 90, {}],
        ['lamp', 106, {}],
      ],
      things: [],
      par: 24,
      hint: 'A walk round town: jump the ditch, climb the steps, hop the posts and the cart. In Chowk you cross the dug-up lane on the cloth bolts hung overhead: a bolt is sold the moment you land on it, and the shopkeeper’s hook comes up and slides it out sideways. Hop on to the next one before the hook has its grip, don’t stand about. After the bolts, a long bolt unrolls down across the road: run under it straight away, before its roller reaches the ground.',
      paint: (g) => {
        g.pit(38, 50, 15);
      },
      extra: (w) => chowkBolts(w),
      cps: [15.5, 33, 60.5, 78, 92],
    }),
    meta: { family: 'sold-bolt-hooked-out-sideways', betrayals: ['B3', 'bolt-unrolls-curtain'], ending: 'lko-gomti-ghat' } as StageMeta,
  });
