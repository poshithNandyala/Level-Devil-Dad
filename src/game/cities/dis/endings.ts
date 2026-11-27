// Dispur's door endings, one per stage 02-10, each a new idea. Kinds start with 'dis-'.
import { World } from '../../world';
import { lock } from '../../levels/endkit';
import { px, recause, river, Decor, GROUND, levelPost } from './entities';
import { PathBars, Plucker } from './pluck';
import { roller, checkpoint } from '../../levels/kit';
import { Host, gam, machan } from './gamosa';
import { TeaBoy } from './bank';
import { Slab } from './entities';
import type { Ending } from '../../levels/endkit';

export type DisEndingKind = 'dis-hut-shut' | 'dis-muga-reel' | 'dis-laru-plate' | 'dis-gamosa-latch' | 'dis-tea-ladder' | 'dis-uruka-net' | 'dis-watch-tower' | 'dis-post-bank' | 'dis-royal-seat';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<DisEndingKind, true> {}
}

export const endings: Record<DisEndingKind, Ending> = {
  // ================================================================ DIS-02: the farmer shuts the hut
  /** The door is the farmer's hut on the far bank. While the river is moving he keeps it shut. Two bars cross: the first
   *  sinks once the second is up. Get across, then wait at the hut till the water is calm. */
  // fix round 1 (QA F1): the old door re-asked the room's crossing; no replacement passed the gate, so it is PLAIN:
  // the road ends at the farmer's hut and the hut's door is the way out.
  'dis-hut-shut': {
    space: 8,
    after: 5,
    advice: 'The road ends at the farmer’s hut on the bank: its door is the way out. Walk in.',
    build(w: World, d) {
      w.flags.twist = 'plain';
      w.add(
        new Decor((ctx) => {
          // the hut round the door
          const x = d.x + 8;
          ctx.fillStyle = '#8D6B2E';
          ctx.fillRect(x - 17, GROUND - 38, 34, 38);
          ctx.fillStyle = '#B08B3C';
          ctx.beginPath();
          ctx.moveTo(x - 22, GROUND - 38);
          ctx.lineTo(x, GROUND - 56);
          ctx.lineTo(x + 22, GROUND - 38);
          ctx.closePath();
          ctx.fill();
        }, -4),
      );
    },
  },
  // ================================================================ DIS-03: the muga reel
  /** The door is up on the verandah; a muga cocoon rides its reel up to it and is reeled in after a moment. */
  // fix round 1 (QA F1): the muga reel was kvt05-lift (ride up, off at the top); PLAIN now.
  'dis-muga-reel': {
    space: 8,
    after: 5,
    advice: 'The tea rows end at the garden bungalow: its door is the way out. Walk in.',
    build(w: World) {
      w.flags.twist = 'plain';
    },
  },
  // ================================================================ DIS-04: the laru plate
  /** The door is on a plate of laru, past the last crepe. The cook's boy rolls laru balls down the plate at you. */
  'dis-laru-plate': {
    space: 30,
    after: 5,
    advice: 'The door is on a plate of laru: walk on to the plate, and hop each laru ball the boy rolls down it at you.',
    build(w: World, d) {
      const D = Math.round(d.x / 16);
      // round 4 (ruling S1): the crepe pan is gone with the pitha room; the door keeps only its rolling laru
      let next = 0;
      w.add(
        new Decor(
          (ctx) => {
            // the plate under the door
            ctx.fillStyle = '#C9A253';
            ctx.fillRect(px(D - 4), GROUND - 1, px(9), 3);
            ctx.fillStyle = '#8D6B2E';
            ctx.fillRect(px(D - 4), GROUND + 2, px(9), 2);
          },
          -4,
          (w2) => {
            if (w2.player.cx > px(D - 8) && w2.player.cx < px(D - 1) && w2.tick >= next) {
              next = w2.tick + 360;
              roller(w2, 'dis-laru', px(D + 4), GROUND - 12, -50, { cause: 'dis-laru' });
            }
          },
        ),
      );
    },
  },
  // ================================================================ DIS-05: the gamosa latch
  /** The door's latch is a rope of gamosa: it opens only if you hand it one. Arrive with none and the last giver is up on his platform. */
  'dis-gamosa-latch': {
    space: 20,
    after: 5,
    advice: 'The door’s latch is a rope of gamosa, and it only opens if you hand it a gamosa. Keep at least one on you. If you have none, the last host is up on the platform before the door, holding one out.',
    paint: (g, D) => {
      g.fill(D - 10, D - 6, 13, 13, '=');
    },
    build(w: World, d) {
      const D = Math.round(d.x / 16);
      w.add(new Host(px(D - 8) + 8, px(13), 'give'));
      machan(w, D - 10, D - 6);
      const L = lock(w, d, 'Roba! Gamosa! | Stop! The gamosa!');
      w.flags.twist = 'latched';
      const open = d.onReach;
      d.onReach = (w2) => {
        if (gam(w2).n >= 1) {
          gam(w2).n--;
          L.unlock();
          w2.flags.twist = 'open';
          open?.(w2);
          w2.win('door');
        } else open?.(w2);
      };
      w.add(
        new Decor((ctx) => {
          // the latch rope: a gamosa hung over the door
          ctx.fillStyle = '#FDF0D5';
          ctx.fillRect(d.x + 1, d.y - 4, 14, 4);
          ctx.fillStyle = '#C1121F';
          ctx.fillRect(d.x + 1, d.y - 4, 14, 1.2);
          ctx.fillRect(d.x + 1, d.y - 1.4, 14, 1.2);
        }, 3),
      );
    },
  },
  // ================================================================ DIS-06: the ladder for the tea boy
  /** The door is up in a stilt house. Its ladder is pulled up until the tea boy walks up the path and the family lets it down for him. */
  'dis-tea-ladder': {
    space: 26,
    after: 5,
    advice: 'The door is up in a stilt house, and its ladder is pulled up. Wait at the foot of it: when the tea boy walks up the path, the family lets the ladder down for him, and for you. Climb it, and then on to the door.',
    paint: (g, D) => {
      g.put(D, 14, '.');
      g.fill(D - 1, D + 3, 11, 14, '#');
      g.put(D + 1, 10, 'E');
    },
    build(w: World, d) {
      const D = Math.round(d.x / 16) - 1;
      const boy = w.add(new TeaBoy(px(D - 17), px(D - 24), px(D - 5)));
      const rung = w.add(
        new Slab(px(D - 5), 208, px(3), 6, (ctx, s) => {
          // the ladder: hooked up against the stilts until it is let down
          ctx.fillStyle = '#8D6B2E';
          if (boy.down) {
            ctx.fillRect(s.solid.x, s.solid.y, s.solid.w, 5);
            ctx.fillRect(s.solid.x, s.solid.y, 2, 32);
            ctx.fillRect(s.solid.x + s.solid.w - 2, s.solid.y, 2, 32);
          } else {
            ctx.fillRect(px(D - 1) - 3, 176, 2, 62);
            ctx.fillRect(px(D - 1) - 8, 176, 2, 62);
            for (let y = 184; y < 236; y += 12) ctx.fillRect(px(D - 1) - 8, y, 7, 2);
          }
        }),
      );
      rung.solid.oneWay = true;
      w.onTick(() => {
        rung.solid.collidable = boy.down;
      });
      w.flags.ladder = { boy, rung };
      w.flags.twist = 'up';
      w.add(
        new Decor((ctx) => {
          // the stilt house over its posts
          const x0 = px(D - 1);
          ctx.fillStyle = '#6A4B1C';
          for (const dx of [2, 28, 52, 76]) ctx.fillRect(x0 + dx, 190, 4, 50);
          ctx.fillStyle = '#B08B3C';
          ctx.beginPath();
          ctx.moveTo(x0 - 6, 160);
          ctx.lineTo(x0 + 42, 140);
          ctx.lineTo(x0 + 90, 160);
          ctx.closePath();
          ctx.fill();
        }, -4),
      );
    },
  },
  // ================================================================ DIS-07: the host's door
  /** The last house. The singers stop in the yard while the host hands them gamosas; the gate to his door opens when he is done. */
  // fix round 1 (QA F1): the net in strokes was dis09-sluice in substance (wait on the midpoint while the danger runs);
  // PLAIN now: the singers' last house, its door the way out.
  'dis-uruka-net': {
    space: 8,
    after: 6,
    advice: 'The husori ends at the last house: its door is the way out. Walk in.',
    build(w: World) {
      w.flags.twist = 'plain';
    },
  },
  // ================================================================ DIS-08: the watch tower
  // fix round 1 (QA F1): the rhino from behind was dis08-bagori again; PLAIN now.
  'dis-watch-tower': {
    space: 8,
    after: 4,
    advice: 'The grass ends at the forest office: its door is the way out. Walk in.',
    build(w: World) {
      w.flags.twist = 'plain';
    },
  },
  // ================================================================ DIS-10: the level post across the water
  /** The level post stands on the far bank, and the way over the water is a plucker's own path: a bar comes up under each of her steps and stays up a few seconds. */
  'dis-post-bank': {
    space: 40,
    after: 5,
    advice: 'The level post is on the far bank, and the water is crossed only on the plucker’s path. This time the bars come up a few steps AHEAD of her, and each one sinks as she walks past it. She comes up behind you: go in front of her, a few steps ahead, never so far that the bar is not up yet, and never let her catch you.',
    paint: (g, D) => {
      g.pit(D - 33, D - 4);
    },
    build(w: World, d) {
      const D = Math.round(d.x / 16);
      river(w, D - 33, D - 3);
      // she starts behind you on the bank (DIS-03 taught "follow her"; here she sinks the path behind her)
      const p = w.add(new Plucker(px(D - 43), px(D - 33.6), [], px(D - 3), 64));
      (w.flags.pluckers ??= []).push(p);
      const starts = [D - 32, D - 28, D - 24, D - 20, D - 16, D - 12, D - 8];
      const pb = w.add(new PathBars(starts, 4, p, 0, 9));
      pb.setup(w);
      levelPost(w, { level: 2, e: -1 } as never, D - 1.8, 3);
      w.flags.twist = 'post';
      checkpoint(w, D - 38); // on the bank where you wait for the plucker, 5 tiles back from the water
      // fix round 1 (QA F4): this door's deaths name its own break of 03, not 03's advice
      recause(w, D - 45, D + 2, { 'dis-basket': 'dis-basket-ulta', 'dis-luit': 'dis-path-agot' });
    },
  },
  // ================================================================ DIS-09: the royal seat
  /** The door is the royal seat at the top of the roof. Two last stretches of oil, and a ball rolls in each. */
  // fix round 1 (QA F1): two more oiled stretches were the room past its labelled beat; PLAIN now.
  'dis-royal-seat': {
    space: 8,
    after: 5,
    advice: 'The roof ends at the royal seat: its door is the way out. Walk in.',
    build(w: World) {
      w.flags.twist = 'plain';
    },
  },
};
