// Door 2, Bengaluru: Dad needs an auto. The auto has other ideas.
import { TILE } from '../../game/constants';
import type { World } from '../../game/world';
import { auto, AutoRide, AUTO_W } from '../auto';
import { rows } from '../grid';
import { drop, restore, slab } from '../kit';
import { prop } from '../props';
import type { DoorDef, RoomDef } from '../types';

const base = { city: 'BLR' as const, room: true as const, door: 'blr' as const, hint: '' };
const ROAD = 14 * TILE;

/** 1. Auto! It pulls away the moment he's close, and it was parked on a pothole. Wait, and it backs up to collect him. */
const auto1: RoomDef = {
  ...base,
  id: 'BLR-1',
  n: 1,
  index: 1,
  name: 'Auto!',
  map: rows(
    '....@...........................',
    '################ppp#############',
    '################ppp#############',
    '################ppp#############',
    '################ppp#############',
  ),
  build(w: World) {
    const hole = slab(w, 'p');
    const a = auto(w, 16);
    let done = false;
    w.when(
      (w2) => !done && w2.player.x + w2.player.w >= a.x - 64,
      (w2) => {
        done = true;
        a.drive(w2, 392, 0.65, 'in', (w3) => {
          w3.after(0.45, () => {
            a.drive(w3, 16 * TILE, 0.9, 'inOut');
            w3.after(0.5, () => restore(w3, hole));
          });
        });
        w2.after(0.12, () => drop(w2, hole));
      },
    );
  },
  natural: [['R', 700]],
  // jump the pothole and go after it
  fix: [['R', 172], ['R', 400, 1]],
  // stop at the edge; it reverses back over the hole for him
  solution: [['R', 172], ['', 200], ['R', 80]],
};

/**
 * 2. No meter: walk up to it and it rolls away, and once it's out of road it reverses
 * into him; stand and wait and it reverses into him. Walk away, and it follows.
 */
const auto2: RoomDef = {
  ...base,
  id: 'BLR-2',
  n: 2,
  index: 2,
  name: 'No Meter',
  map: rows(
    '............@...................',
    '################################',
    '################################',
    '################################',
    '################################',
  ),
  build(w: World) {
    const a = auto(w, 22);
    let mood: 'idle' | 'shy' | 'ram' | 'follow' = 'idle';
    let still = 0;
    a.brain = (w2, au) => {
      const p = w2.player;
      const gap = au.x - (p.x + p.w);
      if (mood !== 'follow' && mood !== 'ram' && p.vx < -40) {
        mood = 'follow';
        au.gentle = true;
      }
      if (mood === 'idle' && p.vx > 40 && gap < 140) mood = 'shy';
      if (mood === 'shy') {
        still = p.onGround && Math.abs(p.vx) < 1 ? still + 1 : 0;
        if (gap < 100) au.steer(p.x + p.w + 100, 160);
        if ((au.x >= au.maxX - 0.5 && gap < 70) || still > 72) {
          mood = 'ram';
          au.drive(w2, p.x - 24, 0.5, 'in');
        }
      } else if (mood === 'follow') {
        const target = p.cx - 20;
        const d = Math.abs(target - au.x);
        au.steer(target, Math.min(320, 40 + 6 * d));
      }
    };
  },
  natural: [['R', 700]],
  // room 1 said: stop and wait for it
  fix: [['R', 70], ['', 400]],
  solution: [['L', 70], ['', 200]],
};

/**
 * 3. Hail: this one never stops, it just goes up and down the road, and it will run
 * him over. From the footpath, a hop (a wave of the hand) and it pulls up at the kerb.
 */
const hail: RoomDef = {
  ...base,
  id: 'BLR-3',
  n: 3,
  index: 3,
  name: 'Hail It',
  map: rows(
    '....@...........................',
    '########........................',
    '################################',
    '################################',
    '################################',
    '################################',
  ),
  build(w: World) {
    const kerb = 8 * TILE;
    const a = auto(w, 18);
    a.minX = kerb + 2;
    a.facing = -1;
    let dir = -1;
    let hailed = false;
    let stopped = false;
    w.when(
      (w2) => w2.player.jumpTick === w2.tick && w2.player.x + w2.player.w <= kerb + 2,
      () => (hailed = true),
    );
    a.brain = (w2, au) => {
      if (stopped) return;
      if (hailed && dir < 0 && au.x <= kerb + 40) {
        // brakes hard and pulls up at the kerb
        au.steer(kerb + 2, Math.max(30, (au.x - kerb) * 5));
        if (au.x <= kerb + 2.5) {
          stopped = true;
          w2.sfx('honk');
        }
        return;
      }
      au.steer(dir < 0 ? au.minX : au.maxX, 150);
      if ((dir < 0 && au.x <= au.minX + 0.5) || (dir > 0 && au.x >= au.maxX - 0.5)) {
        dir = -dir;
        au.facing = dir as 1 | -1;
      }
    };
  },
  natural: [['R', 700]],
  solution: [['', 12], ['', 40, 1], ['', 130], ['R', 120]],
};

/**
 * 4. Hold still: walk and it comes at you; jump and it comes at you. Freeze in its
 * path and it brakes, an inch away.
 */
const still: RoomDef = {
  ...base,
  id: 'BLR-4',
  n: 4,
  index: 4,
  name: 'Hold Still',
  map: rows(
    '......@.........................',
    '################################',
    '################################',
    '################################',
    '################################',
  ),
  build(w: World) {
    const a = auto(w, 24);
    a.facing = -1;
    let go = false;
    let calm = 0;
    let braking = false;
    let stop = 0;
    a.brain = (w2, au) => {
      const p = w2.player;
      const inp = w2.input;
      if (!go && (inp.left || inp.right || inp.jumpPressed)) go = true;
      if (!go) return;
      calm = p.onGround && Math.abs(p.vx) < 1 && !inp.left && !inp.right && !inp.jump ? calm + 1 : 0;
      const gap = au.x - (p.x + p.w);
      if (!braking && calm >= 18 && gap < 44 && gap > 0) {
        braking = true;
        stop = p.x + p.w + 2;
      }
      if (braking) {
        au.steer(stop, Math.max(20, (au.x - stop) * 6));
        return;
      }
      au.steer(au.minX, 150);
    };
  },
  natural: [['R', 700]],
  // room 3 said: hop and it stops
  fix: [['R', 20], ['', 60], ['', 40, 1], ['', 40, 1], ['', 40, 1], ['', 40, 1], ['', 200]],
  solution: [['R', 20], ['', 210], ['R', 60]],
};

/**
 * 5. Silk Board: parked cars, a pothole under the auto, and the auto's moods from
 * this whole city at once. It flees; waiting gets you rammed; walking away brings
 * it back, but the cars stop it if you go too far.
 */
const silk: RoomDef = {
  ...base,
  id: 'BLR-5',
  n: 5,
  index: 5,
  name: 'Silk Board',
  map: rows(
    '....@...........................',
    '.........%%%....%%%.............',
    '.........%%%....%%%.............',
    '########################ppp#####',
    '########################ppp#####',
    '########################ppp#####',
    '########################ppp#####',
  ),
  build(w: World) {
    carProp(w, 9, 12);
    carProp(w, 16, 12);
    const hole = slab(w, 'p');
    const a = auto(w, 24);
    a.minX = 19 * TILE + 2;
    let mood: 'parked' | 'fled' | 'ram' | 'follow' = 'parked';
    let near = 0;
    let holeBack = false;
    w.when(
      (w2) => mood === 'parked' && w2.player.onGround && w2.player.x + w2.player.w >= a.x - 64,
      (w2) => {
        mood = 'fled';
        a.drive(w2, a.maxX, 0.45, 'in');
        w2.after(0.1, () => drop(w2, hole));
      },
    );
    a.brain = (w2, au) => {
      const p = w2.player;
      if (mood === 'fled') {
        if (p.vx < -40) {
          mood = 'follow';
          au.gentle = true;
        } else {
          near = p.onGround && Math.abs(p.vx) < 1 && au.x - (p.x + p.w) < 140 ? near + 1 : 0;
          if (near > 96) {
            mood = 'ram';
            au.drive(w2, p.x - 30, 0.5, 'in');
          }
        }
      } else if (mood === 'follow') {
        const target = p.cx - 20;
        const d = Math.abs(target - au.x);
        au.steer(target, Math.min(240, 40 + 6 * d));
        if (!holeBack && au.x < hole.ox + hole.solid.w) {
          holeBack = true;
          restore(w2, hole, 0.2);
        }
      }
    };
  },
  natural: [['R', 33], ['R', 117, 1], ['R', 400, 1]],
  // wait at the pothole, as in room 1
  fix: [['R', 33], ['R', 117, 1], ['R', 105, 1], ['', 300]],
  // then walk away from it (room 2), a few steps
  solution: [['R', 33], ['R', 117, 1], ['R', 105, 1], ['', 60], ['L', 20], ['', 200]],
};

function carProp(w: World, tx: number, ty: number) {
  prop(w, 'car', tx, ty, 3, 2);
}

export const BENGALURU: DoorDef = {
  id: 'blr',
  city: 'Bengaluru',
  cityId: 'BLR',
  pin: 'BLR',
  ride: 'auto',
  rooms: [auto1, auto2, hail, still, silk],
};

export { AutoRide, AUTO_W };
