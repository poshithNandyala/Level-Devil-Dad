// Ranchi's door endings: the flip that throws you up on to the counter, the target sheet over the door, the
// lightning arrester and its earth pit, the swapped masks, the row of brass elephants, the hollow halfway
// down the falls, and the door you cast yourself.
import { Entity, type World } from '../world';
import { FLOOR, Paint, lock, npc, tara } from './endkit';
import { px } from './kit';
import type { Ending } from './endkit';
import { CastMould, ChhauDancer, Cook, Crucible, ElephantRow, MaskStand, Pool, Range, Rugra, Steps, Storm, Stream, Tadit, addKadhai, dadMask, falls, type Bowman } from '../entities/jharkhand';

export type EastEndingKind = 'ulta' | 'nishana' | 'tadit' | 'chehra' | 'kataar' | 'khoh' | 'dwar';

export const EAST_ENDINGS: Record<EastEndingKind, Ending> = {
  // ================================================================ RNC-02: the flip
  /** The door is up on the stall's counter, a step too high to jump. The last cook stands on your
   *  side of his kadhai, so his flips throw the other way: towards the counter. Let him flip you. */
  ulta: {
    space: 18,
    advice: 'The door is up on the counter, a step too high to jump. This cook stands on your side of the kadhai, so his flips throw the other way: stand on his dhuska before he flips it and let it throw you, up and over on to the counter.',
    paint: (g, D) => {
      g.put(D, 14, '.');
      g.fill(D - 2, D + 3, 11, 14, '#');
      g.pit(D - 8, D - 4);
      g.put(D, 10, 'E');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const { ds } = addKadhai(w, px(D - 8), px(D - 3), [px(D - 6) + 8]);
      const cook = w.add(
        new Cook(
          px(D - 10) + 8,
          1,
          ds,
          [
            { at: 0, a: 'drop', i: 0 },
            { at: 320, a: 'flip', i: 0 },
            { at: 560, a: 'scoop', i: 0 },
          ],
          6.8,
          0,
          { vx: 200, vy: 520, stun: 70 },
        ),
      );
      cook.bank0 = px(D - 8);
      cook.bank1 = px(D - 3);
      w.flags.ulta = { cook, d: ds[0], edge: px(D - 8) };
      w.flags.twist = 'counter';
      w.add(
        new (class extends Entity {
          update(w2: World) {
            const p = w2.player;
            if (p.onGround && p.y + p.h <= px(11) && p.cx > px(D - 2)) w2.flags.twist = 'up';
          }
        })(),
      );
      w.when(
        (w2) => w2.player.cx > px(D - 13),
        (w2) => tara(w2, 'Upar kaise jaoge, Dad? | How will you get up there, Dad?', 2.6),
      );
      void FLOOR;
    },
  },
  // ================================================================ RNC-03: the target sheet
  /** The door is behind the target sheet, and the archers are shooting at it, at Dad's height. When the
   *  last arrow of the end tears it down the coach whistles and walks up to pin a new one: race him. */
  nishana: {
    space: 20,
    advice: 'The door is behind the target sheet and they’re shooting at it, at your height: wait behind the archers. When the last arrow of the end tears the sheet down, the coach whistles and walks up to pin a new one. Race him to the door.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      let holes = 0,
        down = false,
        told = -999;
      const N = 6;
      const men: Bowman[] = [
        { x: px(D - 11) + 8, feet: FLOOR, lane: FLOOR - 9, shots: [0.6, 1.8, 3.0] },
        { x: px(D - 9) + 8, feet: FLOOR, lane: FLOOR - 21, shots: [1.2, 2.4, 3.6] },
      ];
      const r = w.add(
        new Range(
          w,
          men,
          d.x + 4,
          4.2,
          0,
          (w2) => {
            holes = 0;
            down = false;
            w2.flags.twist = 'sheet';
          },
          2.2,
        ),
      );
      for (const q of r.quivers)
        for (const a of q)
          a.onHit = (w2) => {
            holes++;
            if (holes >= N && !down) {
              down = true;
              w2.flags.twist = 'open';
              w2.sfx('crack', d.x + 8, d.y + 10);
            }
          };
      w.flags.twist = 'sheet';
      w.flags.nishana = { r, wait: px(D - 13) + 8 };
      d.onReach = (w2) => {
        if (down) return w2.win('door');
        if (w2.tick - told < 110) return;
        told = w2.tick;
        w2.sfx('thud', d.x + 8, d.y + 16);
        npc(w2, 'Pehle nishana phatega! | The target has to tear first!', d.x + 8, d.y - 6, 1.4);
      };
      // straw bales behind the door, and the sheet over it
      w.add(
        new Paint((ctx) => {
          ctx.fillStyle = '#D9B65A';
          ctx.fillRect(d.x - 6, d.y - 14, 34, 46);
          ctx.fillStyle = 'rgba(110,70,20,0.5)';
          for (let y = d.y - 10; y < d.y + 32; y += 12) ctx.fillRect(d.x - 6, y, 34, 1.4);
        }, -3),
      );
      w.add(
        new Paint((ctx) => {
          const x = d.x - 1,
            y = d.y + 1;
          if (down) {
            ctx.fillStyle = '#F5F0E1';
            ctx.beginPath();
            ctx.moveTo(x - 2, FLOOR);
            ctx.lineTo(x + 6, FLOOR - 5);
            ctx.lineTo(x + 14, FLOOR - 2);
            ctx.lineTo(x + 20, FLOOR);
            ctx.fill();
            return;
          }
          ctx.fillStyle = '#F5F0E1';
          ctx.fillRect(x, y, 18, 30);
          const rings = ['#212121', '#1E88E5', '#E53935', '#FDD835'];
          rings.forEach((c, i) => {
            ctx.fillStyle = c;
            ctx.beginPath();
            ctx.arc(x + 9, y + 15, 8 - i * 2, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.fillStyle = '#5D4037';
          for (let k = 0; k < holes; k++) ctx.fillRect(x + 3 + ((k * 7) % 12), y + 4 + ((k * 11) % 22), 2.5, 2.5);
          if (holes >= 3) {
            ctx.strokeStyle = '#8D6E63';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + 2, y + 8);
            ctx.lineTo(x + 9, y + 14);
            ctx.lineTo(x + 16, y + 9);
            ctx.stroke();
          }
        }, 2),
      );
      w.when(
        (w2) => w2.player.cx > px(D - 15),
        (w2) => tara(w2, 'Abhi bhaago, Dad! Kuch nahi hoga! | Run now, Dad! Nothing will happen!', 2.6),
      );
    },
  },
  // ================================================================ RNC-04: the lightning arrester
  /** The door is up on a rock. Right by the road stands a lightning arrester: the tallest thing about,
   *  so every strike takes it, and its wire carries the strike off underground to the earth pit. The
   *  rugra come up there, not by the pole. */
  tadit: {
    space: 20,
    advice: 'The arrester takes every strike, but the rugra don’t come up by the pole: its wire carries the lightning off underground to the earth pit by the rock. Wait on the bump beside the pit (pass the pole between strikes) and ride it up.',
    paint: (g, D) => {
      g.put(D, 14, '.');
      g.fill(D - 6, D + 2, 10, 14, '#');
      g.put(D, 9, 'E');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const pole = w.add(new Tadit(px(D - 14) + 8, FLOOR - 150, px(D - 9) + 8));
      const st = w.add(new Storm([pole.x], 2.4, 90, 0));
      st.rods.push(pole);
      const decoy = w.add(new Rugra(px(D - 17) + 8, 60));
      const be = w.add(new Rugra(px(D - 8) + 4, 84));
      st.spots.push(decoy, be);
      st.onStrike = (w2, a) => {
        if (a.rod === pole) pole.pulse = 1;
      };
      w.flags.tadit = { st, pole, be };
      w.flags.twist = 'pole';
      w.add(
        new (class extends Entity {
          update(w2: World) {
            const p = w2.player;
            if (p.onGround && p.y + p.h <= px(10) && p.cx > px(D - 6)) w2.flags.twist = 'up';
          }
        })(),
      );
      w.when(
        (w2) => w2.player.cx > px(D - 19),
        (w2) => tara(w2, 'Khambe ke paas ruko, wahin niklega! | Wait by the pole, it comes up right there!', 2.8),
      );
      w.when(
        (w2) => pole.pulse > 0 && w2.player.cx > px(D - 18),
        (w2) => w2.guide('Bijli taar se zameen mein jaati hai. | The lightning goes down the wire, into the ground.'),
      );
    },
  },
  // ================================================================ RNC-05: swap faces
  /** A tiger stands guard in front of the door, and there's no hunter's mask anywhere. Put on the
   *  peacock and drop on to his head: you swap masks, and the new peacock flies from the new tiger. */
  chehra: {
    space: 18,
    advice: 'A tiger guards the door, and there’s no hunter’s mask here. Climb up to the balcony, put on the peacock mask, and drop on to his head: you swap masks. Now he’s the peacock and you’re the tiger, and off he flies.',
    paint: (g, D) => {
      g.fill(D - 11, D - 3, 14, 14, '#');
      g.fill(D - 10, D - 3, 13, 13, '#');
      g.fill(D - 9, D - 3, 12, 12, '#');
      g.fill(D - 8, D - 3, 11, 11, '#');
      g.fill(D - 7, D - 3, 10, 10, '#');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      dadMask(w);
      w.add(new MaskStand(px(D - 5) + 8, 'mayur', FLOOR - 80));
      const tiger = w.add(new ChhauDancer('baagh', px(D - 2) + 4, px(D - 2) + 8));
      w.flags.chehra = { tiger, edge: px(D - 2), stand: px(D - 5) + 8 };
      w.flags.twist = 'tiger';
      w.add(
        new (class extends Entity {
          update(w2: World) {
            if (tiger.swapped && w2.flags.twist === 'tiger') w2.flags.twist = 'open';
          }
        })(),
      );
      w.when(
        (w2) => w2.player.cx > px(D - 15),
        (w2) => tara(w2, 'Mayur pehen ke uske saamne naacho! | Put on the peacock and dance in front of him!', 2.8),
      );
      w.when(
        (w2) => w2.player.cx > px(D - 9) && w2.player.y + w2.player.h <= FLOOR - 60,
        (w2) => w2.guide('Mukhauta badlo, toh naach badle. | Change the mask, and the dance changes.', (w3) => !tiger.swapped),
      );
    },
  },
  // ================================================================ RNC-06: the row of brass elephants
  /** The door is latched, and the shop's brass elephants stand in a row up to it. Every so often the shop
   *  boy knocks the first one over for the customers, and down they go, one after the other, to the last,
   *  which would knock the latch... except one elephant has been sold. Stand in the gap. */
  kataar: {
    space: 18,
    advice: 'The door is latched, and the brass elephants stand in a row up to it. Every few seconds the shop boy knocks the first one over and down they go, one into the next, but one has been sold and they stop at the gap. Stand in the gap: the one before it knocks you into the next, and the last one knocks the latch open.',
    paint: () => {},
    build(w, d) {
      const D = Math.round(d.x / 16);
      const L = lock(w, d, 'Kundi lagi hai! | It’s latched!');
      const x0 = px(D - 10) + 4;
      const xs: (number | null)[] = [];
      for (let i = 0; i < 9; i++) xs.push(i === 5 ? null : x0 + i * 20);
      const row = w.add(new ElephantRow(xs, FLOOR, 5));
      row.onDone = (w2) => {
        L.unlock();
        w2.flags.twist = 'open';
        w2.sfx('clap', d.x + 8, FLOOR - 20);
        npc(w2, 'Khul gaya! | It’s open!', d.x - 10, FLOOR - 40, 1.6);
      };
      w.flags.kataar = { row, gap: x0 + 5 * 20 };
      w.flags.twist = 'row';
      w.add(
        new Paint((ctx) => {
          // the latch
          ctx.fillStyle = L.open ? '#8D6E63' : '#B0BEC5';
          ctx.fillRect(d.x - 3, FLOOR - 22, 6, 3);
        }, 3),
      );
      w.when(
        (w2) => w2.player.cx > px(D - 16),
        (w2) => tara(w2, 'Darwaza dhakelo, Dad, khul jayega! | Push the door, Dad, it’ll open!', 2.8),
      );
      w.when(
        (w2) => w2.player.cx > px(D - 12) && row.fall.some((f) => f >= 1),
        (w2) => w2.guide('Ek haathi bik gaya. Uski jagah koi khada ho! | One elephant got sold. Someone stand in its place!', () => !row.done),
      );
    },
  },
  // ================================================================ RNC-07: the hollow
  /** The door is in a hollow under the lip of the last fall, halfway down: too high to jump up to, and
   *  the only way in is out of the water. Climb the steps, walk off the top into the stream, and step in
   *  as you sink past. Miss it, and it's all the steps again. */
  khoh: {
    space: 20,
    after: 8,
    advice: 'The door is in a hollow halfway down the last fall, too high to jump to. Climb the steps, walk off the top straight into the water and hold left as you sink: under the lip you come out into the hollow. Miss it and it’s all those steps again.',
    paint: (g, D) => {
      g.put(D, 14, '.');
      // the cliff (a way through underneath), the lip the river pours off, and the hollow's floor
      g.fill(D - 1, D - 1, 4, 12, '#');
      g.fill(D, D + 2, 4, 5, '#');
      g.fill(D, D + 1, 10, 12, '#');
      g.put(D, 9, 'E');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      w.add(new Steps(px(D - 1) - 11 * 24, FLOOR, 11, 24));
      const s = w.add(new Stream(px(D + 3) + 8, px(4), FLOOR, 24, 30));
      falls(w).streams.push(s);
      w.add(new Pool(s.x0, s.x1 + 10));
      w.flags.khoh = { stepX: px(D - 1) - 11 * 24, lip: px(D + 3), floor: px(10), D };
      w.flags.twist = 'steps';
      w.add(
        new (class extends Entity {
          update(w2: World) {
            const p = w2.player;
            const t = w2.flags.twist;
            if (p.onGround && p.y + p.h === px(10) && p.cx > px(D) && p.cx < px(D + 2)) w2.flags.twist = 'khoh';
            else if (t !== 'khoh' && p.onGround && p.y + p.h === px(4) && p.cx > px(D - 3)) w2.flags.twist = 'top';
            else if (t === 'top' && !p.onGround && p.cx > px(D + 2)) w2.flags.twist = 'water';
            else if (t === 'water' && p.onGround && p.y + p.h === FLOOR) w2.flags.twist = 'steps';
          }
        })(),
      );
      // the hollow: dark rock round the door, and the water's light on it
      w.add(
        new Paint((ctx, w2) => {
          ctx.fillStyle = 'rgba(20,24,28,0.55)';
          ctx.fillRect(px(D), px(6), px(2) + 16, px(4));
          ctx.fillStyle = 'rgba(190,225,240,' + (0.12 + 0.06 * Math.sin(w2.tick / 9)) + ')';
          ctx.fillRect(px(D + 1), px(6), 32, px(4));
        }, -3),
      );
      w.when(
        (w2) => w2.player.cx > px(D - 20),
        (w2) => tara(w2, 'Bas sau seedhi aur, Dad! | Only a hundred more steps, Dad!', 2.8),
      );
      w.when(
        (w2) => w2.flags.twist === 'top',
        (w2) => w2.guide('Darwaza khoh mein hai. Paani se jao! | The door’s in the hollow. Go by water!', () => w2.flags.twist !== 'khoh'),
      );
    },
  },
  // ================================================================ RNC-08: cast your own door
  /** The last door hasn't been made yet: there's a clay mould where it should be, and a crucible of brass
   *  on a tripod over it. Tip it, and you've cast yourself a door... which is molten for a while. */
  dwar: {
    space: 16,
    advice: 'There’s no door yet: just a door-shaped clay mould and a crucible of brass over it. Jump up into the handle to pour it, and wait: it glows while it’s hot, and walking into it then is walking into molten brass. When it turns gold, it’s a door.',
    paint: () => {},
    build(w, d) {
      const D = Math.round(d.x / 16);
      const L = lock(w, d, 'Abhi toh mitti hai! | It’s still just clay!');
      const m = w.add(new CastMould(d.x, FLOOR, 16, 32, true));
      const k = w.add(new Crucible(m, FLOOR - 64));
      w.flags.dwar = { m, k };
      w.flags.twist = 'clay';
      w.add(
        new (class extends Entity {
          update(w2: World) {
            if (m.state === 'brass' && !L.open) {
              L.unlock();
              w2.flags.twist = 'open';
              w2.sfx('clap', d.x + 8, FLOOR - 20);
            } else if (m.state !== 'shell' && m.state !== 'brass') w2.flags.twist = 'hot';
          }
        })(),
      );
      w.when(
        () => m.state === 'filling',
        (w2) => tara(w2, 'Ban gaya darwaza! Jao, Dad! | The door’s made! Go, Dad!', 2.4),
      );
      w.when(
        () => m.state === 'filling',
        (w2) => w2.guide('Garam pital! Thanda hone do. | Hot brass! Let it cool.', () => m.state !== 'brass'),
      );
      w.when(
        (w2) => w2.player.cx > px(D - 14),
        (w2) => tara(w2, 'Darwaza kahan gaya, Dad? | Where’s the door gone, Dad?', 2.6),
      );
    },
  },
};
