import type { World } from '../world';
import type { Door } from '../entities/basics';
import { Thing } from '../entities/traps';
import { px } from './kit';
import { ENDINGS, type EndingKind } from './endings';

// The last-second surprise at the door, Level Devil's favourite. One per stage, never the same twice in a row.
//  spikes: steel spikes pop out of the floor just before the door. Jump in.
//  crush:  a rolling shutter slams over the door as you reach it. Wait for it to go back up.
//  swap:   the door hops over your head and lands behind you.
//  shy:    the door backs away while you look at it; turn your back and it creeps up to you.
//  sink:   the door ducks into the ground; it only peeks out again once you walk away.
//  rise:   the door floats up out of reach; it drops back down the moment you jump.
//  wall:   a wall shoots up in front of it while you run at it; stand still and it sinks again.
//  fake:   it's a cardboard cutout. It falls flat, and the real door drops from the sky behind you.
//  none:   nothing at all. Which, by stage seven, is the scariest thing of all.

export type OldTwist = 'spikes' | 'crush' | 'swap' | 'shy' | 'sink' | 'rise' | 'wall' | 'fake' | 'none';
/** the old nine plus the endings in endings.ts: each one is used by exactly one stage */
export type Twist = OldTwist | EndingKind;

export function exitTwist(w: World, d: Door, kind: Twist, o: { to?: number; from?: 1 | -1; at?: number } = {}) {
  // a long stage can swap its room's old twist for a better one
  if (w.flags.twistOverride && w.flags.twistOverride !== kind) {
    kind = w.flags.twistOverride;
    o = {};
  }
  w.flags.twistKind = kind;
  const ending = ENDINGS[kind as EndingKind];
  if (ending) return ending.build(w, d);
  const from = o.from ?? 1;
  const floorY = d.y + 32;
  const near = (tiles: number) => Math.abs(w.player.cx - (d.x + 8)) < px(tiles) && w.player.y + w.player.h > d.y;
  if (kind === 'none') {
    let said = false;
    w.onTick((w2) => {
      if (said || !near(3)) return;
      said = true;
      w2.flags.twist = 'none';
      w2.say('...? | ...nothing? Really?', d.x + 8, d.y - 10, 1.4, 'npc');
    });
    return;
  }
  if (kind === 'shy') {
    // looking at it pushes it away; your back draws it in. Cornered, it leaps over you.
    w.flags.twist = 'armed';
    const minX = px(1);
    const maxX = w.W - px(2);
    w.onTick((w2) => {
      if (w2.state !== 'play') return;
      const p = w2.player;
      const dist = d.x + 8 - p.cx;
      if (Math.abs(dist) > px(7)) return;
      const looking = Math.sign(dist) === p.facing;
      if (looking) {
        if ((dist > 0 && d.x >= maxX) || (dist < 0 && d.x <= minX)) {
          // nowhere left to back away to: over your head it goes
          w2.flags.twist = 'leapt';
          w2.say('Bye bye!', d.x + 8, d.y - 6, 1.0, 'npc');
          const to = Math.max(minX, Math.min(maxX, p.cx - Math.sign(dist) * px(5)));
          d.moveTo(w2, (d.x + to) / 2, d.y - 48, 0.25, 'out', () => d.moveTo(w2, to, floorY - 32, 0.25, 'in'));
          return;
        }
        if (!(d as any).tw) d.x = Math.max(minX, Math.min(maxX, d.x + Math.sign(dist) * 95 * (1 / 120)));
        w2.flags.twist = 'shy';
      } else if (!(d as any).tw) {
        d.x -= Math.sign(dist) * 70 * (1 / 120);
        w2.flags.twist = 'coming';
      }
    });
    return;
  }
  if (kind === 'sink') {
    // it ducks when you come at it, and only peeks out again once you walk away
    let state: 'up' | 'down' | 'moving' = 'up';
    const y0 = d.y;
    w.flags.twist = 'armed';
    w.onTick((w2) => {
      if (w2.state !== 'play' || state === 'moving') return;
      const dist = Math.abs(w2.player.cx - (d.x + 8));
      if (state === 'up' && dist < px(2.6) && w2.player.y + w2.player.h > d.y) {
        state = 'moving';
        w2.sfx('slide', d.x + 8, floorY);
        d.moveTo(w2, d.x, y0 + 34, 0.2, 'in', () => {
          state = 'down';
          w2.flags.twist = 'sunk';
        });
      } else if (state === 'down' && dist > px(5)) {
        state = 'moving';
        d.moveTo(w2, d.x, y0, 0.3, 'out', () => {
          state = 'up';
          w2.flags.twist = 'up';
          // (it won't duck a second time: it has had its fun)
          state = 'moving';
        });
      }
    });
    return;
  }
  if (kind === 'rise') {
    // it floats up out of reach; it comes down the moment you jump (you'll jump right into it)
    let state: 'low' | 'high' | 'moving' = 'low';
    const y0 = d.y;
    w.flags.twist = 'armed';
    w.onTick((w2) => {
      if (w2.state !== 'play' || state === 'moving') return;
      const p = w2.player;
      const dist = Math.abs(p.cx - (d.x + 8));
      if (state === 'low' && dist < px(3) && p.y + p.h > d.y) {
        state = 'moving';
        w2.sfx('boing', d.x + 8, floorY);
        d.moveTo(w2, d.x, y0 - px(4), 0.25, 'out', () => {
          state = 'high';
          w2.flags.twist = 'high';
        });
      } else if (state === 'high' && p.jumpTick >= w2.tick - 1 && dist < px(4)) {
        state = 'moving';
        d.moveTo(w2, d.x, y0, 0.22, 'in', () => {
          w2.flags.twist = 'down';
        });
      }
    });
    return;
  }
  if (kind === 'wall') {
    // run at it and a wall shoots up; stand still a moment and it sinks back
    const wall = w.add(new Thing('setwall', d.x - px(2), floorY, { layer: -1 }));
    wall.visible = false;
    let up = false,
      used = false,
      still = 0;
    w.flags.twist = 'armed';
    w.onTick((w2) => {
      if (w2.state !== 'play') return;
      const p = w2.player;
      const ahead = wall.x - (p.x + p.w);
      if (!up && !used && ahead < px(2.5) && ahead > -4 && p.vx > 20) {
        used = true;
        up = true;
        still = 0;
        w2.flags.twist = 'walled';
        w2.sfx('thud', wall.x + 8, floorY);
        w2.emit('shake', wall.x + 8, floorY, { amount: 2 });
        wall.visible = true;
        wall.moveTo(w2, wall.x, floorY - 64, 0.1, 'out');
      } else if (up) {
        still = Math.abs(p.vx) < 5 && !w2.input.left && !w2.input.right ? still + 1 : 0;
        if (still > 110 && wall.state === 'rest') {
          up = false;
          w2.flags.twist = 'clear';
          wall.moveTo(w2, wall.x, floorY, 0.35, 'in', () => (wall.visible = false));
        }
      }
    });
    return;
  }
  if (kind === 'fake') {
    // a cardboard cutout: it falls flat, and the real door drops from the sky behind you
    let done = false;
    w.onTick((w2) => {
      if (done || !near(1.6)) return;
      done = true;
      w2.flags.twist = 'cutout';
      d.hidden = true;
      const flat = w2.add(new Thing('plank', d.x - 6, floorY - 5, { solid: false, layer: -2, w: 30, h: 5 }));
      void flat;
      w2.sfx('poof', d.x + 8, floorY - 10);
      w2.say('Cardboard! | It was cardboard!', d.x + 8, d.y - 6, 1.4, 'npc');
      const to = Math.max(px(1), d.x - from * px(6));
      w2.after(0.45, () => {
        d.x = to;
        d.y = floorY - 32 - px(9);
        d.hidden = false;
        d.moveTo(w2, to, floorY - 32, 0.3, 'in', (w3) => {
          w3.sfx('thud', to + 8, floorY);
          w3.emit('shake', to + 8, floorY, { amount: 3 });
          w3.flags.twist = 'real';
        });
      });
    });
    return;
  }
  if (kind === 'spikes') {
    const sx = d.x - from * px(o.at ?? 2);
    const sp = w.add(new Thing('spikerow', sx, floorY + 1, { solid: false, deadly: 'spikes', layer: -4 }));
    let up = false;
    w.onTick((w2) => {
      if (up) return;
      const p = w2.player;
      const near = from === 1 ? p.x + p.w >= sx - 6 : p.x <= sx + 22;
      if (!near) return;
      up = true;
      w2.sfx('spikes', sx + 8, floorY);
      sp.moveTo(w2, sx, floorY - 10, 0.06, 'out');
    });
    return;
  }
  if (kind === 'crush') {
    const sh = w.add(new Thing('shutter', d.x - 8, d.y - 36, { layer: 2 }));
    let fired = false;
    w.flags.twist = 'armed';
    w.onTick((w2) => {
      if (fired) return;
      const p = w2.player;
      if (Math.abs(p.cx - (d.x + 8)) > 30 || p.y + p.h < d.y) return;
      fired = true;
      w2.flags.twist = 'shut';
      w2.sfx('thud', d.x + 8, d.y);
      sh.moveTo(w2, sh.x, d.y, 0.1, 'in', () => {
        w2.emit('shake', d.x + 8, floorY, { amount: 2 });
        w2.after(0.9, () =>
          sh.moveTo(w2, sh.x, d.y - 36, 0.3, 'out', () => {
            w2.flags.twist = 'open';
          }),
        );
      });
    });
    return;
  }
  // swap: the door leaps over you and lands behind (never more than a short hop back: long stages
  // keep their room's twist, and a door flying a whole screen back would just be mean)
  let to = px(o.to ?? 20);
  if (Math.abs(to - d.x) > px(12)) to = d.x - from * px(8);
  let done = false;
  w.onTick((w2) => {
    if (done) return;
    const p = w2.player;
    if (Math.abs(p.cx - (d.x + 8)) > 34 || p.y + p.h < d.y) return;
    done = true;
    w2.flags.twist = 'swapped';
    w2.say('Bye bye!', d.x + 8, d.y - 6, 1.0, 'npc');
    d.moveTo(w2, (d.x + to) / 2, d.y - 56, 0.28, 'out', () => d.moveTo(w2, to, floorY - 32, 0.28, 'in'));
  });
}
