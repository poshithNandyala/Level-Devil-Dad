// Proven routes through the troll sections (src/game/levels/chunks.ts) and the door at the end.
import type { World } from '../src/game/world';
import type { LevelDef } from '../src/game/world';
import { CHUNK_W, ChunkKind } from '../src/game/levels/chunks';
import { Cloud, Geyser, Thing } from '../src/game/entities/traps';
import { Door } from '../src/game/entities/basics';
import { DT } from '../src/game/constants';
import { Step, X, and, done, ground } from './runner';
import { ACT_ROUTES } from './acts';
import { ENDING_POLICIES, freshMem, type Mem } from './endings';
import { ENDINGS, type EndingKind } from '../src/game/levels/endings';

const px = (t: number) => t * 16;
type P = { kind: string; x0: number; id: number; letters: string; spikes: string };

const groupOf = (w: World, letter: string) => w.entities.find((e: any) => e.letter === letter) as any;

/** the mist bank of a section is gone now and stays gone for `need` seconds */
const mistClear = (x0: number, need: number) => (w: World) => {
  const c = w.entities.find((e) => e instanceof Cloud && (e as Cloud).zone.x === px(x0 + 1.5)) as Cloud | undefined;
  if (!c || !c.schedule) return true;
  const s = c.schedule;
  for (let k = 0; k <= need; k += 1 / 30) if ((((w.tick * DT + k + (s.phase ?? 0)) % s.period) + s.period) % s.period < s.on) return false;
  return true;
};

/** every jet of a section will be quiet while Dad runs past it from here */
const jetsClear = (x0: number) => (w: World) => {
  const p = w.player;
  const gs = w.entities.filter((e) => e instanceof Geyser && (e as Geyser).x > px(x0) && (e as Geyser).x < px(x0 + CHUNK_W.jets)) as Geyser[];
  return gs.every((g) => {
    const dt = Math.max(0, (g.x - 6 - (p.x + 10)) / 140);
    return g.quietFor(w.tick * DT + dt - 0.06, 0.4);
  });
};

export function solveChunk(p: P): Step[] {
  if (!(p.kind in CHUNK_W)) {
    const r = ACT_ROUTES[p.kind];
    if (!r) throw new Error('no route for act ' + p.kind);
    return r(p.x0, p);
  }
  const x = p.x0;
  const W = CHUNK_W[p.kind as ChunkKind];
  const end: Step = { hold: 'R', until: X(x + W), max: 600 };
  const f = (k: string) => `${k}${p.id}`;
  switch (p.kind) {
    case 'rockfall':
      return [
        { hold: 'R', until: X(x + 6.2), max: 600 },
        { hold: 'R', jump: 14, ticks: 14, note: 'over the first one as soon as it lands' },
        { hold: 'R', until: ground, max: 200 },
        { hold: 'R', until: (w) => !!w.flags[f('rB')], max: 200 },
        { hold: '', until: (w) => w.flags[f('rB')]?.state === 'landed', max: 300, note: 'the next one falls just ahead: let it' },
        { hold: 'R', until: and(ground, X(x + 10.8)), max: 200 },
        { hold: 'R', jump: 14, ticks: 14, note: 'over the second one' },
        { hold: 'R', until: ground, max: 200 },
        end,
      ];
    case 'reverser':
      return [
        { hold: 'R', until: (w) => w.flags[f('rev')] === 1, max: 900, dodge: 1, note: 'hop it coming down' },
        { hold: '', until: (w) => { const v = w.flags[f('veh')]; return !!v && v.x > w.player.x + 12 && w.player.onGround; }, max: 600, dodge: 1, note: 'it backs up: stop and hop it' },
        end,
      ];
    case 'terraces':
      return [
        { hold: 'R', until: X(x + 1.4), max: 400 },
        { hold: 'R', jump: 14, ticks: 14, note: 'up a step' },
        { hold: 'R', until: and(ground, X(x + 5.4)), max: 300 },
        { hold: 'R', jump: 14, ticks: 14, note: 'the step that crumbles' },
        { hold: 'R', until: ground, max: 200 },
        { hold: 'R', until: X(x + 9.6), max: 100 },
        { hold: 'R', jump: 14, ticks: 14, note: 'straight on' },
        { hold: 'R', until: ground, max: 200 },
        { hold: 'R', until: X(x + 16.9), max: 300 },
        { hold: 'R', jump: 12, ticks: 12, note: 'leap past the step down: it drops if you land on it' },
        { hold: 'R', until: ground, max: 300 },
        end,
      ];
    case 'mist':
      return [
        { hold: 'R', until: X(x + 0.6), max: 400 },
        { hold: '', until: mistClear(x, 1.1), max: 900, note: 'wait for the mist to lift' },
        { hold: 'R', until: X(x + 2.6), max: 300 },
        { hold: 'R', jump: 12, ticks: 12, note: 'a hidden pit' },
        { hold: 'R', until: and(ground, X(x + 6.6)), max: 300 },
        { hold: 'R', jump: 12, ticks: 12, note: 'and another' },
        { hold: 'R', until: ground, max: 200 },
        end,
      ];
    case 'droprun':
      return [
        { hold: 'R', until: X(x + 2.8), max: 400 },
        { hold: 'R', jump: 12, ticks: 12, note: 'the road drops away' },
        { hold: 'R', until: and(ground, X(x + 8.2)), max: 300 },
        { hold: 'R', jump: 12, ticks: 12, note: 'spikes jump out' },
        { hold: 'R', until: and(ground, X(x + 14.2)), max: 300 },
        { hold: 'R', jump: 12, ticks: 12, note: 'a wall pops up' },
        { hold: 'R', until: ground, max: 200 },
        end,
      ];
    case 'birds':
    case 'rollers':
      return [{ hold: 'R', until: X(x + W), max: 900, dodge: 1, note: p.kind === 'birds' ? 'hop the birds' : 'hop what rolls at you' }];
    case 'shygap': {
      const L = p.letters[0];
      return [
        { hold: 'R', until: X(x + 2.4), max: 400 },
        { hold: '', jump: 12, ticks: 12, note: 'a fake hop: the ledge flinches' },
        { hold: '', until: ground, max: 200 },
        { hold: '', until: (w) => { const g = groupOf(w, L); return g.state === 'rest' && g.solid.x === px(x + 6); }, max: 400, note: 'wait for it to creep back' },
        { hold: '', ticks: 6 },
        { hold: 'R', jump: 12, ticks: 12, note: 'now jump on it' },
        { hold: 'R', until: ground, max: 200 },
        { hold: 'R', until: X(x + 8.6), max: 200 },
        { hold: 'R', jump: 12, ticks: 12, note: 'and off it' },
        { hold: 'R', until: ground, max: 200 },
        end,
      ];
    }
    case 'jets':
      return [
        { hold: 'R', until: X(x + 2.5), max: 400 },
        { hold: '', until: jetsClear(x), max: 900, note: 'wait for the spray to pass' },
        end,
      ];
    case 'awning':
      return [{ hold: 'R', until: X(x + W), max: 400, note: 'do not jump under the awning, whatever she says' }];
    case 'chaser':
      return [
        { hold: 'R', until: X(x + 9.4), max: 400 },
        { hold: 'R', jump: 12, ticks: 12, note: 'keep running: a dog is after you' },
        { hold: 'R', until: and(ground, X(x + 17.4)), max: 300 },
        { hold: 'R', jump: 12, ticks: 12, note: 'over the gap' },
        { hold: 'R', until: ground, max: 200 },
        end,
      ];
  }
  throw new Error('no route for ' + p.kind);
}

/** the door at the end, whatever its twist: a little policy that reacts like a careful player */
export function exitPolicy() {
  let mem: { jumpT: number; jm: 'L' | 'R' | ''; j: number; faced: number; w: World | null; e: Mem } = { jumpT: 0, jm: '', j: 0, faced: 0, w: null, e: freshMem() };
  return (w: World): { move: 'L' | 'R' | ''; jump: boolean } => {
    // (a new run of the stage starts with a fresh mind)
    if (mem.w !== w) mem = { jumpT: 0, jm: '', j: 0, faced: 0, w, e: freshMem() };
    const k = (w.flags.twistKind ?? 'none') as string;
    const tw = w.flags.twist as string | undefined;
    const p = w.player;
    const d = w.entities.find((e) => e instanceof Door && !(e as Door).fake) as Door;
    const ending = ENDING_POLICIES[k];
    if (ending) {
      const holding = mem.e.hold > 0;
      if (holding) mem.e.hold--;
      const o = ending(w, mem.e, d);
      return holding ? { move: o.move, jump: true } : o;
    }
    const dist = d ? d.x + 8 - p.cx : 999;
    const toward: 'L' | 'R' = dist < 0 ? 'L' : 'R';
    if (mem.jumpT > 0) {
      mem.jumpT--;
      return { move: mem.jm, jump: true };
    }
    const jump = (move: 'L' | 'R' | '') => {
      mem.jumpT = 11;
      mem.jm = move;
      return { move, jump: true };
    };
    switch (k) {
      case 'spikes': {
        const sp = w.entities.find((e) => e instanceof Thing && (e as Thing).kind === 'spikerow' && Math.abs((e as Thing).x - (d?.x ?? 0)) < px(4)) as Thing | undefined;
        if (sp && !mem.j && p.onGround && p.x >= sp.x - px(1.6)) {
          mem.j = 1;
          return jump('R');
        }
        return { move: 'R', jump: false };
      }
      case 'crush':
        return { move: tw === 'shut' ? '' : 'R', jump: false };
      case 'swap':
        return { move: toward, jump: false };
      case 'shy':
        // close enough: turn your back on it (a one-tick tap away) and wait for it to come
        if (Math.abs(dist) < px(5)) {
          const facingIt = Math.sign(dist) === p.facing;
          return { move: facingIt ? (dist > 0 ? 'L' : 'R') : '', jump: false };
        }
        return { move: toward, jump: false };
      case 'sink':
        return { move: tw === 'sunk' ? (dist > 0 ? 'L' : 'R') : toward, jump: false };
      case 'rise':
        if (tw === 'high' && !mem.j && p.onGround) {
          mem.j = 1;
          return jump('');
        }
        return { move: tw === 'high' ? '' : toward, jump: false };
      case 'wall':
        return { move: tw === 'walled' ? '' : toward, jump: false };
      default:
        return { move: toward, jump: false };
    }
  };
}

/** the door at the end of a long stage, whatever twist the room brought with it */
export function exitRun(doorX: number, kind?: string): Step[] {
  const e = kind ? ENDINGS[kind as EndingKind] : undefined;
  if (e)
    return [
      { hold: 'R', until: X(doorX - (e.space ?? 9) + 0.5), max: 900 },
      { policy: exitPolicy(), until: done, max: 3600, note: `the door: ${kind}` },
    ];
  return [
    { hold: 'R', until: X(doorX - 8), max: 900 },
    { policy: exitPolicy(), until: done, max: 1800, dodge: 1, note: 'the door, and whatever it does' },
  ];
}

/** a long stage's whole route: the room's own steps (up to its right edge), then each section, then the door */
export function longRun(def: LevelDef, room: Step[]): Step[] {
  const parts = def.parts ?? [];
  return [...room, ...parts.flatMap((p) => solveChunk(p)), ...exitRun(def.doorX!, def.ending)];
}
