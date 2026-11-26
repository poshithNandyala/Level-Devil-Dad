// Bhopal's door endings.
import { Entity, type World } from '../../world';
import { px } from '../../levels/kit';
import { FLOOR, lock, Paint, tara, text } from '../../levels/endkit';
import { Chumbak, handArt, Katori, Lake, Ledge, Shelter, Surma, Tawa, Thread } from './entities';
import type { Ending } from '../../levels/endkit';

export type BplEndingKind = 'ghat' | 'haath' | 'gaanth' | 'khaali' | 'paan' | 'rakhdo' | 'kissa';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<BplEndingKind, true> {}
}

export const endings: Record<BplEndingKind, Ending> = {
  // ------------------------------------------------------------------ Bhopal
  /** All stage long the lake has drowned anyone who stopped. Raja Bhoj's door is under it: on the
   *  ghat, where the steps go down in to the water, it's only waist deep. Stop there, and sink. */
  ghat: {
    space: 12,
    after: 6,
    advice: 'The door is under the water, at the foot of the ghat’s steps where the lake is shallow. Skip out, and over the pale water let go of everything so you sink there; or skip right across and wade back in from the far bank.',
    paint: (g, D) => {
      g.pit(D - 8, D + 2);
      g.fill(D - 2, D + 2, 17, 17, '#');
      g.put(D, 14, '.');
      g.put(D, 16, 'E');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const lake = w.add(new Lake(px(D - 8), px(D + 3), FLOOR + 3));
      lake.shallows = [{ x0: px(D - 2), x1: px(D + 3) }];
      w.flags.ghat = { lake, x0: px(D - 2), x1: px(D + 3) };
      w.flags.twist = 'dry';
      w.add(
        new Paint((ctx) => {
          // the pale shallows, the steps going down, a marker post
          ctx.fillStyle = 'rgba(220,245,240,0.35)';
          ctx.fillRect(px(D - 2), FLOOR + 3, px(5), 29);
          ctx.fillStyle = '#C9B48A';
          for (let k = 0; k < 4; k++) ctx.fillRect(px(D + 3) - 2 - k * 5, FLOOR + 4 + k * 7, 5 + k * 5, 7);
          ctx.fillStyle = '#6D4C41';
          ctx.fillRect(px(D + 4) + 6, FLOOR - 26, 2, 26);
          ctx.fillStyle = '#FFF8E1';
          ctx.fillRect(px(D + 4) - 4, FLOOR - 36, 22, 11);
          text(ctx, 'GHAT', px(D + 4) + 7, FLOOR - 30, 5, '#00695C');
        }, -1),
      );
      w.add(
        new (class extends Entity {
          update(w2: World) {
            const p = w2.player;
            const wet = p.y + p.h > FLOOR + 10 && p.cx > px(D - 2) && p.cx < px(D + 3);
            w2.flags.twist = wet ? 'wading' : p.cx > px(D + 3) ? 'across' : 'dry';
          }
        })(),
      );
      w.when(
        (w2) => w2.player.x > px(D - 11),
        (w2) => tara(w2, 'Darwaza? Paani ke neeche hai, khan! | The door? It’s under the water, friend!', 2.8),
      );
    },
  },

  /** No hand stencil where you need one. So make one, the way they did: stand at the bare patch of
   *  rock, hold still, and blow the ochre round your own hand. */
  haath: {
    space: 14,
    advice: 'There’s a painted wall, then a boulder, and no red hands. Make your own: stand quite still at each bare patch of rock (by the bowl of ochre) till your hand is on the wall, then jump and touch it. The door is a painted one.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const sh = (w.flags.shelter as Shelter) ?? w.add(new Shelter());
      w.flags.shelter = sh;
      w.add(new Ledge(sh, px(D - 9), px(5), 16, px(10), false));
      w.add(new Ledge(sh, px(D - 4), px(5), 32, px(10), true));
      const spots = [
        { x: px(D - 12) + 8, t: 0, made: false },
        { x: px(D - 6) + 8, t: 0, made: false },
      ];
      w.flags.spots = spots;
      w.flags.twist = 'bare';
      w.add(
        new (class extends Entity {
          layer = -3;
          update(w2: World) {
            const p = w2.player;
            // a painted door: only a painted man can use it
            d.hidden = !sh.painted;
            for (const s of spots) {
              if (s.made) continue;
              if (p.onGround && Math.abs(p.cx - s.x) < 9 && Math.abs(p.vx) < 6) {
                if (++s.t >= 96) {
                  s.made = true;
                  sh.hand(s.x, FLOOR - 40);
                  w2.sfx('win', s.x, FLOOR - 40);
                  w2.emit('fx', s.x, FLOOR - 40, { kind: 'sparkle' });
                }
              } else s.t = 0;
            }
            w2.flags.twist = spots[1].made ? 'two' : spots[0].made ? 'one' : 'bare';
          }
          draw(ctx: CanvasRenderingContext2D) {
            for (const s of spots) {
              // a bowl of ochre on the floor, and a pale smoothed patch of rock above it
              ctx.fillStyle = '#5D4037';
              ctx.fillRect(s.x - 5, FLOOR - 4, 10, 4);
              ctx.fillStyle = '#B03A1E';
              ctx.fillRect(s.x - 4, FLOOR - 5, 8, 2);
              if (s.made) continue;
              ctx.fillStyle = 'rgba(245,225,195,0.5)';
              ctx.beginPath();
              ctx.arc(s.x, FLOOR - 40, 10, 0, Math.PI * 2);
              ctx.fill();
              if (s.t > 0) handArt(ctx, s.x, FLOOR - 40, s.t / 96);
            }
            if (!sh.painted) {
              // the painted door, seen from outside the picture
              ctx.strokeStyle = 'rgba(176,58,30,0.75)';
              ctx.lineWidth = 1.5;
              ctx.strokeRect(d.x + 2, d.y + 6, 12, 26);
              ctx.beginPath();
              ctx.arc(d.x + 11, d.y + 20, 1, 0, Math.PI * 2);
              ctx.stroke();
            }
          }
        })(),
      );
      w.when(
        (w2) => w2.player.x > px(D - 15),
        (w2) => tara(w2, 'Yahan koi haath nahin! Apna lagao, miyan! | No hand here! Make your own, sir!', 2.8),
      );
    },
  },

  /** All stage long, touching your own thread was the end of you. An embroiderer finishes with a knot:
   *  at the gold ring, turn round and step back on to it. */
  gaanth: {
    space: 12,
    advice: 'The door wants the work finished off with a knot. At the gold ring, and only there, touching your own thread ties it: walk through the ring, turn round, and step straight back on to the thread.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const th = w.add(new Thread(px(D - 10) + 8, 1e9, FLOOR));
      const kx = px(D - 6);
      th.knot = { x0: kx, x1: kx + 26, y0: FLOOR - 24, y1: FLOOR };
      w.flags.knotAt = th.knot;
      const L = lock(w, d, 'Gaanth lagao pehle! | Tie the knot first!');
      w.flags.twist = 'loose';
      w.add(
        new Paint((ctx, w2) => {
          // the ring on its post, glinting
          ctx.fillStyle = '#6D4C41';
          ctx.fillRect(kx + 12, FLOOR - 4, 2, 4);
          ctx.strokeStyle = th.tied ? '#FFF176' : '#FFC107';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(kx + 13, FLOOR - 12, 11, 9, 0, 0, Math.PI * 2);
          ctx.stroke();
          if (!th.tied) {
            ctx.fillStyle = `rgba(255,255,255,${0.5 + 0.5 * Math.sin(w2.tick * 0.1)})`;
            ctx.fillRect(kx + 20, FLOOR - 19, 2, 2);
          }
        }, 3),
      );
      w.when(
        () => th.tied,
        (w2) => {
          L.unlock();
          w2.flags.twist = 'tied';
        },
      );
    },
  },

  /** The door is at the bottom of the big bowl, under the water, and a tap keeps the bowl full however
   *  hard you splash. Turn the tap off (the wheel is up on the ledge), then bounce it dry. */
  khaali: {
    space: 16,
    advice: 'The door is in the bottom of the big bowl, and the tap over it fills it as fast as you splash it out. First five bounces on the small bowl to get up on the ledge and turn the wheel: tap off. Then bounce in the big bowl till it’s dry.',
    paint: (g, D) => {
      g.fill(D - 8, D - 7, 11, 14, '#');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const small = w.add(new Katori(px(D - 11) + 8, FLOOR));
      const big = w.add(new Katori(px(D) + 8, FLOOR, 24, 6));
      big.tap = true;
      const vx = px(D - 7) + 8,
        vy = px(11);
      let shut = false;
      d.hidden = true;
      const L = lock(w, d, '');
      w.flags.khaali = { small, big, vx };
      w.flags.twist = 'tap';
      w.add(
        new (class extends Entity {
          layer = 2;
          update(w2: World) {
            const p = w2.player;
            if (!shut && p.onGround && Math.abs(p.cx - vx) < 9 && Math.abs(p.y + p.h - vy) < 3) {
              shut = true;
              big.tap = false;
              big.refill = 0;
              w2.sfx('creak', vx, vy);
              tara(w2, 'Nal band! Ab khaali karo! | Tap’s off! Now empty it!', 2.4);
            }
            if (big.dry && !L.open) {
              L.unlock();
              d.hidden = false;
            }
            w2.flags.twist = L.open ? 'dry' : shut ? 'shut' : 'tap';
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            // the wheel on the ledge, and its pipe along to the tap over the big bowl
            ctx.strokeStyle = '#78909C';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(vx, vy - 8);
            ctx.lineTo(vx, FLOOR - 61);
            ctx.lineTo(px(D) + 8, FLOOR - 61);
            ctx.stroke();
            ctx.strokeStyle = shut ? '#90A4AE' : '#E53935';
            ctx.beginPath();
            ctx.arc(vx, vy - 8, 5, 0, Math.PI * 2);
            ctx.stroke();
            const a = shut ? 0.8 : w2.tick * 0.02;
            ctx.beginPath();
            ctx.moveTo(vx - Math.cos(a) * 5, vy - 8 - Math.sin(a) * 5);
            ctx.lineTo(vx + Math.cos(a) * 5, vy - 8 + Math.sin(a) * 5);
            ctx.stroke();
          }
        })(),
      );
      w.when(
        (w2) => w2.player.x > px(D - 5) && !shut,
        (w2) => tara(w2, 'Nal chalu hai! Kabhi khaali nahin hogi! | The tap’s on! It’ll never empty!', 2.6),
      );
    },
  },

  /** Surma is sitting by the door, and every time you get near it: "The door? It was over there."
   *  And then it is. He can't tell it with his mouth full: bring him a paan. */
  paan: {
    space: 16,
    advice: 'Every time you get near the door Surma says it was "over there", and so it is. He can’t talk with his mouth full: pick up a paan at the shop, take it to him, and while he chews, walk to wherever the door is now.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const spots = [px(D), px(D - 13)];
      const s = w.add(new Surma(px(D - 4) + 8, FLOOR, []));
      const shop = px(D - 9) + 8;
      let carrying = false,
        cool = 0,
        due = -1;
      w.flags.paan = { s, shop, spots };
      w.flags.twist = 'talking';
      w.add(
        new (class extends Entity {
          layer = 3;
          update(w2: World) {
            const p = w2.player;
            if (w2.state !== 'play') return;
            if (cool > 0) cool--;
            if (!carrying && s.chew === 0 && Math.abs(p.cx - shop) < 9 && p.onGround) {
              carrying = true;
              w2.sfx('win', shop, FLOOR - 20);
            }
            if (carrying && Math.abs(p.cx - s.x) < 16) {
              carrying = false;
              s.chew = 6 * 120;
              due = -1;
              s.say(w2, 'Mmmf... hao... | Mmmf... yes...', 1.6);
            }
            if (s.chew === 0 && cool === 0 && due < 0 && Math.abs(p.cx - (d.x + 8)) < 46) {
              s.say(w2, 'Darwaza? Woh toh udhar tha, khan! | The door? It was over there, friend!', 1.8);
              due = w2.tick + 44;
              cool = 150;
            }
            if (due >= 0 && w2.tick >= due) {
              due = -1;
              if (s.chew === 0) {
                d.x = d.x === spots[0] ? spots[1] : spots[0];
                w2.emit('fx', d.x + 8, d.y + 16, { kind: 'sparkle' });
                w2.sfx('thud', d.x, d.y);
                w2.flags.swaps = (w2.flags.swaps ?? 0) + 1;
              }
            }
            w2.flags.carrying = carrying;
            w2.flags.twist = s.chew > 0 ? 'chewing' : carrying ? 'paan' : 'talking';
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            // the paan counter: a brass tray of leaves
            ctx.fillStyle = '#6D4C41';
            ctx.fillRect(shop - 10, FLOOR - 14, 20, 14);
            ctx.fillStyle = '#FFC107';
            ctx.fillRect(shop - 11, FLOOR - 16, 22, 3);
            ctx.fillStyle = '#2E7D32';
            for (let k = -8; k < 8; k += 5) ctx.fillRect(shop + k, FLOOR - 19, 4, 3);
            if (carrying) {
              const p = w2.player;
              ctx.fillStyle = '#2E7D32';
              ctx.beginPath();
              ctx.moveTo(p.cx - 4, p.y - 4);
              ctx.lineTo(p.cx + 4, p.y - 4);
              ctx.lineTo(p.cx, p.y - 10);
              ctx.fill();
              ctx.fillStyle = '#C62828';
              ctx.fillRect(p.cx - 0.8, p.y - 8, 1.6, 1.6);
            }
          }
        })(),
      );
    },
  },

  /** A row of spiked magnets low over the way to the door: with iron on you there is no getting
   *  through. So don't have iron on you. Give the man his tawa back. */
  rakhdo: {
    space: 14,
    advice: 'The spiked magnets before the door hang low enough to grab you off the floor, as long as you’re carrying iron. Stand still at the chulha for a moment and put the tawa down. Then just walk under them.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const t = (w.flags.tawaEnt as Tawa) ?? w.add(new Tawa(px(D - 14), 1e9, FLOOR));
      w.flags.tawaEnt = t;
      t.stand = px(D - 11) + 8;
      for (const c of [-8, -6, -4, -2]) w.add(new Chumbak(px(D + c) + 8, px(9), { spiked: true, reach: 110 }));
      w.flags.stand = t.stand;
      w.flags.twist = 'carrying';
      w.when(
        () => t.down,
        (w2) => {
          w2.flags.twist = 'down';
          tara(w2, 'Tawa rakh diya! Ab chumbak kya karega? | Tawa’s down! What can a magnet do now?', 2.4);
        },
      );
      w.when(
        (w2) => w2.player.x > px(D - 13),
        (w2) => tara(w2, 'Itne chumbak! Lohe ke saath nahin nikloge! | All those magnets! You won’t get through with iron!', 2.6),
      );
    },
  },

  /** Surma tells how it ended, and it has to end the way he tells it: three feats, in his order,
   *  which is not the order they're standing in. */
  kissa: {
    space: 28,
    advice: 'Surma tells how the story ended, and you have to do it his way, in his order: hang from the magnet (jump up under it while it’s red), then three bounces in a row on the bowl, then three skips across the pond (run off the bank, don’t jump). Then the door opens: come back across.',
    paint: (g, D) => {
      g.pit(D - 24, D - 19);
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const lake = w.add(new Lake(px(D - 24), px(D - 18), FLOOR + 3));
      const bowl = w.add(new Katori(px(D - 15) + 8, FLOOR));
      w.add(new Tawa(px(D - 27), 1e9, FLOOR));
      const mag = w.add(new Chumbak(px(D - 10) + 8, px(7), { every: 3, on: 1.5, reach: 100 }));
      const s = w.add(new Surma(px(D - 4) + 8, FLOOR, []));
      const L = lock(w, d, 'Kissa poora suno! | Hear the story out!');
      const feats = ['hang', 'bounce', 'skip'] as const;
      const lines = [
        'Pehle Dad chumbak se latka! | First Dad hung from the magnet!',
        'Phir katori pe teen baar uchhla! | Then he bounced three times on the bowl!',
        'Phir talab pe teen tappe khaye! | Then he skipped three times on the pond!',
      ];
      let step = -1,
        hangs = 0,
        bounced = false,
        skipped = false;
      w.flags.kissa = { step, lake, bowl, mag };
      w.flags.twist = 'arriving';
      w.add(
        new (class extends Entity {
          layer = 2;
          update(w2: World) {
            if (w2.state !== 'play' || L.open) return;
            const p = w2.player;
            if (step < 0) {
              if (p.cx > px(D - 7)) {
                step = 0;
                hangs = mag.hangs;
                s.say(w2, lines[0], 2.6);
              }
            } else {
              let ev: (typeof feats)[number] | null = null;
              if (mag.hangs > hangs) {
                hangs = mag.hangs;
                ev = 'hang';
              }
              const b = bowl.streak >= 3;
              if (b && !bounced) ev = 'bounce';
              bounced = b;
              const k = lake.count >= 3;
              if (k && !skipped) ev = 'skip';
              skipped = k;
              if (ev) {
                if (ev === feats[step]) {
                  step++;
                  w2.sfx('win', p.cx, p.y);
                  if (step >= 3) {
                    L.unlock();
                    s.say(w2, 'Aur tab darwaza khula. Hao! | And then the door opened. Yes!', 2.6);
                  } else s.say(w2, lines[step], 2.6);
                } else if (step > 0) {
                  step = 0;
                  s.say(w2, 'Ama nahin! Aise nahin tha! Shuru se! | No, no! That’s not how it went! From the top!', 2.4);
                }
              }
            }
            (w2.flags.kissa as any).step = step;
            w2.flags.twist = L.open ? 'open' : step < 0 ? 'arriving' : feats[Math.min(2, step)];
          }
          draw(ctx: CanvasRenderingContext2D) {
            // the three feats over the door, ticked off as they're done
            const names = ['⤒', '♪', '≈'];
            for (let k = 0; k < 3; k++) {
              const x = d.x + 8 + (k - 1) * 12;
              ctx.fillStyle = k < step ? '#FFD740' : 'rgba(0,0,0,0.55)';
              ctx.fillRect(x - 5, d.y - 30, 10, 10);
              text(ctx, names[k], x, d.y - 25, 7, k < step ? '#212121' : '#FFFFFF', '');
            }
          }
        })(),
      );
    },
  },
};
