// Ranchi's door endings: haggling at the haat, the falls you must start before you jump, a bamboo
// trap that lifts you to the door, the Pahan reading the pot, a cast threshold, a stone door the
// dancer breaks, and the Patratu hairpin that makes you walk past the door to reach it.
import type { World } from '../world';
import type { Door } from '../entities/basics';
import type { Grid } from './grid';
import { FLOOR, Paint, lock, npc, person } from './endkit';
import { px } from './kit';
import { TILE } from '../constants';
import type { Ending } from './endkit';
import { Cast, Crucible, Chute, Dancer, MaskPickup, MaskPole, Plunge, FallCurtain, Spout, StoneSlab, pot } from '../entities/jharkhand';

export type EastEndingKind = 'bhaav' | 'jharana' | 'khokha' | 'pahan' | 'dhalai' | 'mukhauta' | 'ghumav';

const G = 15;

export const EAST_ENDINGS: Record<EastEndingKind, Ending> = {
  // ================================================================ RNC-02: the price
  /** The shutter names a price, and another, and another. Walk away: he calls you back and opens. */
  bhaav: {
    space: 8,
    advice: 'The last stall is the door’s shutter and he quotes a price. Paying only makes the price bigger. Step two paces back from him and he calls you in.',
    build(w, d) {
      const L = lock(w, d, 'Paanch sau rupiya! | Five hundred rupees!');
      w.flags.twist = 'price';
      let asked = false;
      w.onTick((w2) => {
        if (L.open) return;
        const dist = d.x + 8 - w2.player.cx;
        if (!asked && dist < 46) {
          asked = true;
          npc(w2, 'Paanch sau! Phir das sau! | Five hundred! Now a thousand!', d.x + 8, d.y - 8, 1.7);
        } else if (asked && dist > 68) {
          w2.flags.twist = 'open';
          npc(w2, 'Arre ruk! Aa jao! | Wait! Come in!', d.x + 8, d.y - 8, 1.5);
          w2.sfx('win', d.x + 8, d.y);
          L.unlock();
        }
      });
      w.add(
        new Paint((ctx, w2) => {
          person(ctx, d.x - 5, d.y + 6, 24, '#6D4C41', '#8D5524', { cap: '#FFF8E1' });
          if (w2.flags.twist !== 'open') {
            ctx.fillStyle = '#FFF8E1';
            ctx.font = '800 4px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('₹ 500', d.x + 8, d.y - 12);
          }
        }, 2),
      );
    },
  },

  // ================================================================ RNC-03: the falls
  /** The door is in the dry basin under the falls. Start the water first, then jump in. */
  jharana: {
    space: 12,
    advice: 'The door is down in the basin where the falls land, and the basin is bare shards until the water is running. Walk into the sluice lever to start the falls, wait for the basin to fill, then jump in and walk to the door.',
    paint: (g, D) => {
      // the basin: six tiles across, two tiles down, with its own floor
      g.pit(D - 5, D + 1, G);
      g.fill(D - 5, D + 1, 17, 17, '#');
    },
    build(w, d) {
      d.y += 32; // the door stands down on the basin floor
      const x0 = px(Math.round(d.x / TILE) - 5),
        x1 = px(Math.round(d.x / TILE) + 2);
      const pool = w.add(new Plunge(x0, x1, px(17), 1, 0, 0, 0));
      const fall = w.add(new FallCurtain(x0 + 40, 0, px(17), 30, 0));
      w.flags.basin = pool;
      let on = false;
      w.onTick((w2) => {
        if (on) return;
        const lever = d.x - px(8);
        if (w2.player.cx < lever) return;
        on = true;
        pool.always = 1;
        fall.on = 1;
        w2.flags.twist = 'wet';
        w2.sfx('flood', d.x, px(12));
        npc(w2, 'Paani chalu! | The water’s on!', lever, px(12), 1.5);
      });
      w.add(
        new Paint((ctx) => {
          // the sluice: a lever on a stone post
          const lx = d.x - px(8);
          ctx.fillStyle = '#6D4C41';
          ctx.fillRect(lx - 2, px(G) - 22, 4, 22);
          ctx.strokeStyle = on ? '#FFB300' : '#B0BEC5';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(lx, px(G) - 22);
          ctx.lineTo(lx + (on ? 8 : -8), px(G) - 30);
          ctx.stroke();
          ctx.fillStyle = '#455A64';
          ctx.fillRect(lx - 6, px(G) - 4, 12, 4);
          if (!on) {
            ctx.fillStyle = '#FFF8E1';
            ctx.font = '800 4px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('PANI', lx, px(G) - 36);
          }
        }, -1),
      );
    },
  },

  // ================================================================ RNC-04: the trap lift
  /** The door is up on the ledge. The trap's mouth is on the ground and its narrow end is at the door. */
  khokha: {
    space: 12,
    advice: 'The door is up on the ledge and far too high to jump. The wide mouth by the wall is the trap’s mouth: walk in and it carries you up to the ledge beside the door.',
    paint: (g, D) => {
      g.fill(D - 3, D + 1, 11, 14, '#');
      g.put(D, 14, '.');
      g.put(D, 10, 'E');
    },
    build(w, d) {
      // the ledge carries the door: E is at row 10, so the door's feet are on row 11
      w.add(new Chute({ x: d.x - px(8), y: px(G) - 14, w: px(2), h: 14 }, { x: d.x - px(2), y: px(11) }));
      w.add(
        new Paint((ctx) => {
          // the ledge's stone face
          ctx.fillStyle = 'rgba(70,60,50,0.35)';
          ctx.fillRect(d.x - px(3), px(11), px(5), 4);
        }, -1),
      );
      npc(w, 'Aa ja, Dad! | Come in, Dad!', d.x + 8, d.y - 6, 1.2);
    },
  },

  // ================================================================ RNC-05: the Pahan reads the pot
  /** He reads the pot's level before he moves: only a nearly full pot brings the rains and opens the door. */
  pahan: {
    space: 10,
    advice: 'The Pahan reads your pot before he opens up: nearly full is good rain. The last gap is right before him, so jump it first and top the pot up at the trickle after it, then walk in.',
    paint: (g, D) => {
      g.pit(D - 3, D - 3, G);
    },
    build(w, d) {
      const L = lock(w, d, 'Gharra bhar ke lao! | Bring the pot full!');
      w.flags.twist = 'dry';
      w.add(new Spout(d.x - px(2), FLOOR, 1));
      let told = 0;
      w.onTick((w2) => {
        if (w2.flags.twist === 'open') return;
        if (pot(w2) >= 0.93) {
          w2.flags.twist = 'open';
          npc(w2, 'Barhiya baarish! Aa jao! | Good rain! Come in!', d.x - 6, d.y - 8, 1.6);
          L.unlock();
        } else if (w2.tick - told > 150 && Math.abs(w2.player.cx - (d.x - 4)) < 30) {
          told = w2.tick;
          npc(w2, 'Gharra khaali he! | The pot is low!', d.x - 6, d.y - 8, 1.3);
        }
      });
      w.add(
        new Paint((ctx) => {
          person(ctx, d.x - 16, d.y + 8, 24, '#FFF3E0', '#8D5524', { cap: '#E8A33D' });
        }, 2),
      );
    },
  },

  // ================================================================ RNC-06: the cast threshold
  /** The last tile before the door is missing, and the crucible can make it. Wait for it to dull. */
  dhalai: {
    space: 12,
    advice: 'The threshold before the door is a hole. Stand on the beam end to tip the crucible, then wait: the brass burns while it glows and carries you once it goes dull.',
    paint: (g, D) => {
      g.pit(D - 2, D - 1, G);
    },
    build(w, d) {
      const ch = w.add(new Cast(d.x - px(2), d.x, FLOOR));
      w.add(new Crucible({ x: d.x - px(5), y: FLOOR - 14, w: px(2), h: 14 }, ch, d.x - px(1)));
      w.flags.castState = 'empty';
      npc(w, 'Dhalai garam he! | The casting is hot!', d.x - px(3), FLOOR - 40, 1.2);
    },
  },

  // ================================================================ RNC-07: the stone door
  /** The door is a slab of stone. The dancer's blade is the only key, and the mask is the bait. */
  mukhauta: {
    space: 10,
    advice: 'The door is a stone slab, and the dancer’s blow is the only thing that cracks it. Take the spare mask from behind you, hang it on the pole by the door, and stand back out of his sweep. He breaks the mask and the slab together.',
    build(w, d) {
      const L = lock(w, d, 'Patthar ka darwaza! | A stone door!');
      const slab = w.add(new StoneSlab(d.x - 1, d.y + 2));
      w.flags.twist = 'stone';
      w.add(new MaskPickup(d.x - px(7) + 2, FLOOR - 12));
      w.add(new MaskPole(d.x - px(4), FLOOR));
      w.add(
        new Dancer(d.x - px(6) + 8, FLOOR, 1, px(8), (w2, from, to) => {
          if (d.x + 20 < from || d.x > to) return;
          slab.cracked = true;
          if (w2.flags.twist === 'open') return;
          w2.flags.twist = 'open';
          w2.sfx('collapse', d.x + 8, d.y);
          w2.emit('shake', d.x + 8, d.y, { amount: 3 });
          npc(w2, 'Patthar khul gaya! | The stone has opened!', d.x + 8, d.y - 10, 1.5);
          L.unlock();
        }, true, true),
      );
    },
  },

  // ================================================================ RNC-08: the hairpin
  /** The door is on the road above you. You walk under it, up the hairpin, and back along the top. */
  ghumav: {
    space: 12,
    after: 6,
    advice: 'The door is on the road above, and the road below goes right past under it. Walk on under the door to the trap mouth at the far end: there is no stair up, only the trap, and it puts you on the top road.',
    paint: (g, D) => {
      // the top road, running back over the one below
      g.fill(D - 14, D + 1, 9, 11, '#');
      // the door waits on the top road, back where you came in
      g.put(D - 6, 8, 'E');
      g.put(D, 14, '.');
    },
    build(w, d) {
      w.flags.twist = 'hairpin';
      // the trap at the far end: its wide mouth on the ground, its narrow end up on the road
      w.add(new Chute({ x: d.x + px(4), y: px(G) - 14, w: px(2), h: 14 }, { x: d.x - px(2), y: px(9) }));
      w.add(
        new Paint((ctx, w2) => {
          // the valley wall between the two roads
          ctx.fillStyle = 'rgba(60,48,38,0.35)';
          ctx.fillRect(d.x - px(20), px(11), px(24), 2);
          // the door's little lamp on the top road
          const glow = 0.45 + 0.25 * Math.sin(w2.tick * 0.08);
          ctx.fillStyle = `rgba(255,220,140,${glow})`;
          ctx.beginPath();
          ctx.arc(d.x + 8, d.y - 6, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#5D4037';
          ctx.fillRect(d.x + 6, d.y - 3, 4, 3);
        }, -1),
      );
    },
  },
};
