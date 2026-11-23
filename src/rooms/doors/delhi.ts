// Door 3, Delhi: Dad is late for the metro. The station has rules, and it watches
// your buttons.
import { secs, TILE } from '../../game/constants';
import type { World } from '../../game/world';
import { cardReader, fareGate, walkway } from '../delhi';
import { RideExit } from '../exits';
import { rows } from '../grid';
import { hidden, onJump, onPass } from '../kit';
import type { DoorDef, RoomDef } from '../types';

const base = { city: 'JAI' as const, room: true as const, door: 'del' as const, hint: '' };

/** controls swap when Dad's centre crosses x (and stay swapped until `back` is crossed) */
function ulta(w: World, at: number, back?: number) {
  onPass(w, at, (w2) => {
    w2.flipControls(9999);
    w2.sfx('ulta');
  });
  if (back !== undefined)
    onPass(w, back, (w2) => {
      w2.flipUntil = w2.tick;
      w2.emit('flip', w2.player.cx, w2.player.y, { seconds: 0 });
      w2.sfx('ulta');
    });
}

/** 1. No jumping: the gap is one tile, you can just walk it. Jump, and the yellow line comes up as spikes. */
const nojump: RoomDef = {
  ...base,
  id: 'DEL-1',
  n: 1,
  index: 1,
  name: 'No Jumping',
  map: rows(
    '....@.........AAAAAA......E.....',
    '#############.##################',
    '#############.##################',
    '#############.##################',
    '#############.##################',
  ),
  build(w: World) {
    const s = hidden(w, 'A');
    onJump(w, (w2) => s.pop(w2));
    RideExit.at(w, 'metro');
  },
  // a gap: jump it
  natural: [['R', 123], ['R', 400, 1]],
  // jump from further back, to clear whatever that was
  fix: [['R', 90], ['R', 400, 1]],
  solution: [['R', 420]],
};

/** 2. The walkway: press right on it and it throws itself into reverse. Stand still and it takes you. */
const escalator: RoomDef = {
  ...base,
  id: 'DEL-2',
  n: 2,
  index: 2,
  name: 'Walkway',
  map: rows(
    '....@.....................E.....',
    '#######..%%%%%%%%%%%%%%#########',
    '#######......................###',
    '#######......................###',
    '#######......................###',
  ),
  build(w: World) {
    walkway(w, 9, 14, 14);
    RideExit.at(w, 'metro');
  },
  natural: [['R', 25], ['R', 600, 1]],
  solution: [['R', 35], ['R', 60, 1], ['', 370], ['R', 160]],
};

/** 3. Ulta: past the gate, left is right. Past the second gate, it's back the way it was. */
const ultaRoom: RoomDef = {
  ...base,
  id: 'DEL-3',
  n: 3,
  index: 3,
  name: 'Ulta Pulta',
  map: rows(
    '.......@..................E.....',
    '......######..##################',
    '......######..##################',
    '......######..##################',
    '......######..##################',
  ),
  build(w: World) {
    fareGate(w, 9, 14);
    fareGate(w, 17, 14);
    ulta(w, 9 * TILE + 8, 17 * TILE + 8);
    RideExit.at(w, 'metro');
  },
  natural: [['R', 600]],
  // after the first gate, press left to go right, and jump the gap
  fix: [['R', 42], ['L', 30], ['L', 400, 1]],
  solution: [['R', 42], ['L', 30], ['L', 66, 1], ['L', 60], ['R', 200]],
};

/**
 * 4. Card reader: the gate won't open, and loitering in front of it is not allowed.
 * After room 1, jumping feels wrong. Jump anyway: that's how you tap the card.
 */
const reader: RoomDef = {
  ...base,
  id: 'DEL-4',
  n: 4,
  index: 4,
  name: 'Tap Your Card',
  map: rows(
    '.................%..............',
    '................................',
    '....@.........AAAA........E.....',
    '################################',
    '################################',
    '################################',
    '################################',
  ),
  build(w: World) {
    const g = fareGate(w, 18, 14, true);
    cardReader(w, 17, 11, (w2) => g.open(w2));
    const s = hidden(w, 'A');
    // no loitering in front of the gate
    let idle = 0;
    w.onTick((w2) => {
      const p = w2.player;
      const inZone = p.cx >= 14 * TILE && p.cx < 18 * TILE;
      idle = inZone && p.onGround && Math.abs(p.vx) < 1 ? idle + 1 : 0;
      if (idle >= secs(0.9)) s.pop(w2);
    });
    RideExit.at(w, 'metro');
  },
  natural: [['R', 700]],
  solution: [['R', 230], ['', 10], ['', 60, 1], ['R', 300]],
};

/** 5. Rajiv Chowk: the walkway, the ulta gate and the card reader, in one rush. */
const rajiv: RoomDef = {
  ...base,
  id: 'DEL-5',
  n: 5,
  index: 5,
  name: 'Rajiv Chowk',
  map: rows(
    '.......................%........',
    '................................',
    '....@.....................E.....',
    '#####..%%%%%%%%%################',
    '#####...........################',
    '#####...........################',
    '#####...........################',
  ),
  build(w: World) {
    walkway(w, 7, 14, 9);
    fareGate(w, 17, 14);
    ulta(w, 17 * TILE + 8);
    const g = fareGate(w, 24, 14, true);
    cardReader(w, 23, 11, (w2) => g.open(w2));
    RideExit.at(w, 'metro');
  },
  // jump on the walkway and keep walking
  natural: [['R', 13], ['R', 600, 1]],
  // stand on the walkway (room 2), then on through the gates
  fix: [['R', 13], ['R', 56, 1], ['', 210], ['R', 400]],
  solution: [['R', 13], ['R', 56, 1], ['', 210], ['R', 40], ['L', 130], ['', 4], ['', 50, 1], ['L', 200]],
};

export const DELHI: DoorDef = {
  id: 'del',
  city: 'Delhi',
  cityId: 'JAI',
  pin: 'DEL',
  ride: 'metro',
  rooms: [nojump, escalator, ultaRoom, reader, rajiv],
};
