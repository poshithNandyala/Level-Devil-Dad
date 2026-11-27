// Sri Vijaya Puram's four round-5 doors (05, 06, 07, 09). Each asks a decision that nothing else in the city asks:
//   05 the sleeping turtle: do not hop near it (restraint: every other stretch of SVP wants a hop)
//   06 the low bough: hop low over the creek, a full jump bangs your head on it and drops you short
//   07 the harbour bell: hop up under it to ring it, and the ticket window opens
//   09 the old wall: the door is up on it, so the jump has to be held to its full height
import type { Ending } from '../../levels/endkit';
import { FLOOR, lock, text } from '../../levels/endkit';
import { Fx, Hurt, px, TAU } from './kit';

// ================================================================== 05: the sleeping turtle
export const noteDoor: Ending = {
  space: 16,
  advice: 'The road to the door crosses the beach where a big turtle sleeps. A hop near it wakes it, and it snaps. The step before the beach is a hop, and after it the sand is flat: walk the sand, do not hop there.',
  paint: (g, D) => {
    g.fill(D - 11, D - 11, 14, 14, '#');
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    const tx = px(D - 4) + 8;
    let woke = false;
    w.flags.twist = 'turtle';
    w.flags.turtle = { x: tx, get woke() { return woke; } };
    w.onTick((w2) => {
      const p = w2.player;
      if (!woke && w2.state === 'play' && !p.onGround && Math.abs(p.cx - tx) < 56) {
        woke = true;
        w2.die('svp-kachua');
      }
    });
    w.add(
      new Fx(null, (ctx, w2) => {
        // the turtle: a domed shell, a head and four flippers, with its eyes shut until it is woken
        ctx.fillStyle = '#5B6B3A';
        ctx.beginPath();
        ctx.ellipse(tx, FLOOR - 7, 17, 9, 0, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#3F4D26';
        for (let k = -1; k <= 1; k++) ctx.fillRect(tx + k * 9 - 2, FLOOR - 13, 4, 4);
        ctx.fillStyle = '#6B7B45';
        ctx.fillRect(tx + 15, FLOOR - 9, 9, 5);
        ctx.fillRect(tx - 14, FLOOR - 3, 7, 3);
        ctx.fillRect(tx + 6, FLOOR - 3, 7, 3);
        ctx.fillStyle = woke ? '#E8D84A' : '#243018';
        ctx.fillRect(tx + 21, FLOOR - 8, 2, woke ? 2 : 1);
        if (!woke) text(ctx, 'z z', tx + 20, FLOOR - 20 - ((w2.tick >> 4) % 3), 6, '#F4ECD6', '');
      }, 3),
    );
  },
};

// ================================================================== 06: the low bough
export const boughDoor: Ending = {
  space: 14,
  advice: 'A creek two tiles wide lies in front of the door, and a low bough hangs over it with a wasps’ nest on it. Hop the creek low: a full jump puts your head in the nest.',
  paint: (g, D) => {
    g.pit(D - 8, D - 7);
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    const top = FLOOR - 80;
    // the bough, and a wasps' nest hanging from it at the height of a full jump's head
    w.add(
      new Fx(null, (ctx) => {
        ctx.fillStyle = '#6B4A34';
        ctx.fillRect(px(D - 11), top - 6, px(7), 6);
        ctx.fillStyle = '#4FC060';
        for (let x = px(D - 11) + 4; x < px(D - 4) - 3; x += 11) {
          ctx.beginPath();
          ctx.ellipse(x, top - 8, 4.6, 2.4, 0.3, 0, TAU);
          ctx.fill();
        }
        ctx.fillStyle = '#C8A06A';
        ctx.beginPath();
        ctx.ellipse(px(D - 7), top + 4, 14, 9, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#7A5A30';
        for (let k = -1; k <= 1; k++) ctx.fillRect(px(D - 7) + k * 8 - 1, top + 2, 2, 8);
      }, 4),
    );
    w.add(new Hurt(px(D - 7) - 14, top - 4, 28, 20, 'svp-bhaunra', null));
    w.add(new Hurt(px(D - 8), FLOOR + 12, px(2), 40, 'svp-kichad', null));
    w.add(
      new Fx(null, (ctx) => {
        const g = ctx.createLinearGradient(0, FLOOR + 8, 0, FLOOR + 40);
        g.addColorStop(0, 'rgba(120,110,70,0.9)');
        g.addColorStop(1, 'rgba(60,50,30,0.95)');
        ctx.fillStyle = g;
        ctx.fillRect(px(D - 8), FLOOR + 8, px(2), 32);
      }, 5),
    );
    w.flags.twist = 'bough';
  },
};

// ================================================================== 07: the harbour bell
export const ticketWindow: Ending = {
  space: 13,
  advice: 'The ticket window is shut and the clerk has dozed off. A brass bell hangs over the road in front of it, just high enough to walk under: hop up under it to ring it, and he wakes and opens the window.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    const lk = lock(w, d, 'Ghanti bajao! | Ring the bell!');
    const bx = px(D - 6) + 8;
    const top = FLOOR - 58;
    const bottom = FLOOR - 48;
    let rung = -999;
    w.flags.twist = 'shut';
    w.flags.window = { lk, bx };
    w.onTick((w2) => {
      const p = w2.player;
      if (w2.state === 'play' && !lk.open && Math.abs(p.cx - bx) < 12 && p.y < bottom && p.y + p.h > top) {
        rung = w2.tick;
        w2.sfx('chime', bx, bottom);
        lk.unlock();
        w2.flags.twist = 'open';
      }
    });
    w.add(
      new Fx(null, (ctx, w2) => {
        // the bracket and the bell, swinging for a moment after it is rung
        const sw = w2.tick - rung < 40 ? Math.sin((w2.tick - rung) * 0.7) * 3 : 0;
        ctx.fillStyle = '#4A3A2A';
        ctx.fillRect(bx - 1, top - 14, 2, 14);
        ctx.fillRect(bx - 12, top - 15, 24, 2);
        ctx.fillStyle = '#C9A227';
        ctx.beginPath();
        ctx.moveTo(bx - 7 + sw, bottom);
        ctx.quadraticCurveTo(bx - 6 + sw, top + 1, bx + sw, top);
        ctx.quadraticCurveTo(bx + 6 + sw, top + 1, bx + 7 + sw, bottom);
        ctx.fill();
        // the window: a counter with a grille
        const x = d.x - 10;
        ctx.fillStyle = '#C9B48A';
        ctx.fillRect(x - 8, FLOOR - 40, 34, 40);
        ctx.fillStyle = '#7C8A92';
        ctx.fillRect(x - 10, FLOOR - 44, 38, 5);
        ctx.fillStyle = lk.open ? '#7BE07B' : '#C0392B';
        ctx.fillRect(x, FLOOR - 28, 18, 12);
        text(ctx, lk.open ? 'OPEN' : 'SHUT', x + 9, FLOOR - 22, 6, '#FFFFFF', '');
      }, -3),
    );
  },
};

// ================================================================== 09: the old wall
export const frameDoor: Ending = {
  space: 17,
  advice: 'The door stands up on the old wall of the ballroom, three tiles above the road, with a ditch before it. A tap of the jump is too low: the wall stops you and you drop in the ditch. Hold the jump all the way up.',
  paint: (g, D) => {
    g.fill(D - 3, D + 3, 12, 14, '#');
    g.put(D, 14, '.');
    g.put(D, 11, 'E');
    g.pit(D - 5, D - 4);
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.add(new Hurt(px(D - 5), FLOOR + 12, px(2), 40, 'svp-eent5', null));
    w.add(
      new Fx(null, (ctx) => {
        ctx.fillStyle = '#2B1E16';
        ctx.fillRect(px(D - 5), FLOOR + 8, px(2), 32);
      }, 5),
    );
    w.flags.twist = 'frame';
    w.flags.wall = { x0: px(D - 3), pit: px(D - 5) };
  },
};
