// Door 1, Mumbai: Dad is late for the local. The platform itself is the trap.
import type { World } from '../../game/world';
import { RideExit } from '../exits';
import { rows } from '../grid';
import { collapseWave, dropNear, dropOnLanding, dropWhenIdle, sinkOnStand, slab, wearsOut } from '../kit';
import { prop } from '../props';
import type { DoorDef, RoomDef } from '../types';

const base = { city: 'BOM' as const, room: true as const, door: 'mum' as const, hint: '' };

/** 1. Mind the gap: the platform opens in front of him; the far side breaks if he lands on it; the gap closes again. */
const gap: RoomDef = {
  ...base,
  id: 'MUM-1',
  n: 1,
  index: 1,
  name: 'Mind the Gap',
  map: rows(
    '....@....................E......',
    '###########aaabbb###############',
    '###########aaabbb###############',
    '###########aaabbb###############',
    '###########aaabbb###############',
  ),
  build(w: World) {
    const a = slab(w, 'a');
    const b = slab(w, 'b');
    dropNear(w, a, { lead: 30, back: 0.62 });
    dropOnLanding(w, b);
    RideExit.at(w, 'train');
  },
  natural: [['R', 600]],
  fix: [['R', 93], ['R', 300, 1]],
  solution: [['R', 80], ['', 110], ['R', 400]],
};

/** 2. Rush hour: the platform falls in behind him, and the train's floor is a step up. */
const rush: RoomDef = {
  ...base,
  id: 'MUM-2',
  n: 2,
  index: 2,
  name: 'Rush Hour',
  map: rows(
    '.........................E......',
    '........................########',
    '....@...................########',
    '######cccdddeeefffggghhh########',
    '######cccdddeeefffggghhh########',
    '######cccdddeeefffggghhh########',
    '######cccdddeeefffggghhh########',
  ),
  build(w: World) {
    const gs = 'cdefgh'.split('').map((c) => slab(w, c));
    collapseWave(w, gs, { start: 6 * 16, speed: 120, from: 56 });
    RideExit.at(w, 'train');
  },
  natural: [['R', 600]],
  fix: [['R', 272], ['R', 200, 1]],
  fixWins: true,
  solution: [['R', 272], ['R', 200, 1]],
};


/**
 * 3. The weighing machine: the gap closes again (like room 1), but now the floor wears
 * out under him while he waits, and landing past the gap still breaks it. The only floor
 * that lasts is the old weighing machine he started on.
 */
const scale: RoomDef = {
  ...base,
  id: 'MUM-3',
  n: 3,
  index: 3,
  name: 'Weighing Machine',
  map: rows(
    '....@...........................',
    '....%...........................',
    '....%....................E......',
    '#####mmmnnnpppqqq###############',
    '#####mmmnnnpppqqq###############',
    '#####mmmnnnpppqqq###############',
    '#####mmmnnnpppqqq###############',
  ),
  build(w: World) {
    prop(w, 'scale', 4, 12, 1, 2);
    for (const c of 'mn') wearsOut(w, slab(w, c), 1.0, 0.3);
    dropNear(w, slab(w, 'p'), { lead: 30, back: 1.1 });
    dropOnLanding(w, slab(w, 'q'));
    RideExit.at(w, 'train');
  },
  natural: [['R', 700]],
  // jump the gap the moment it opens
  fix: [['R', 84], ['R', 300, 1]],
  // open the gap, hurry back up onto the machine, wait, then go
  solution: [['R', 84], ['L', 44], ['L', 50, 1], ['', 70], ['R', 420, 1]],
};

/** 4. The footbridge: everything so far said "don't stand still". Here standing still is the way down. */
const bridge: RoomDef = {
  ...base,
  id: 'MUM-4',
  n: 4,
  index: 4,
  name: 'Footbridge',
  map: rows(
    '....@...........................',
    '############lll.................',
    '................................',
    '................................',
    '.........................E......',
    '############...cccccc###########',
    '############...cccccc###########',
    '############...cccccc###########',
    '############...cccccc###########',
  ),
  build(w: World) {
    prop(w, 'bridge', 0, 10, 12, 1);
    sinkOnStand(w, slab(w, 'l'), { after: 0.32, tiles: 4, seconds: 1.2 });
    dropOnLanding(w, slab(w, 'c'));
    RideExit.at(w, 'train');
  },
  natural: [['R', 700]],
  // jump down to the platform instead
  fix: [['R', 150], ['R', 300, 1]],
  // walk onto the end of the bridge, stand still, ride it down, step off
  solution: [['R', 140], ['', 190], ['R', 300]],
};

/** 5. Last local: run from the collapse, stop on the one safe stone, wait for the gap, don't dawdle, jump in. */
const last: RoomDef = {
  ...base,
  id: 'MUM-5',
  n: 5,
  index: 5,
  name: 'Last Local',
  map: rows(
    '.........................E......',
    '........................########',
    '....@...................########',
    '######cccdddeee##aaannnn########',
    '######cccdddeee##aaannnn########',
    '######cccdddeee##aaannnn########',
    '######cccdddeee##aaannnn########',
  ),
  build(w: World) {
    collapseWave(w, 'cde'.split('').map((c) => slab(w, c)), { start: 6 * 16, speed: 120, from: 56 });
    dropNear(w, slab(w, 'a'), { lead: 30, back: 0.45 });
    dropWhenIdle(w, slab(w, 'n'), { shake: 0.16, after: 0.36 });
    RideExit.at(w, 'train');
  },
  natural: [['R', 700]],
  // stop on the island and wait for the gap (room 1's lesson), then stroll up to the train
  fix: [['R', 187], ['', 90], ['R', 300]],
  solution: [['R', 187], ['', 90], ['R', 88], ['R', 200, 1]],
};

export const MUMBAI: DoorDef = {
  id: 'mum',
  city: 'Mumbai',
  cityId: 'BOM',
  pin: 'BOM',
  ride: 'train',
  rooms: [gap, rush, scale, bridge, last],
};
