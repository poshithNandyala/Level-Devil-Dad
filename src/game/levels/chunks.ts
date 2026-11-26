// Troll sections for long stages. Each one starts and ends on plain ground (row 15), is the same
// every attempt, and has a matching proven route in tests/chunks.ts. A long stage is its city's
// original one-screen room followed by two or three of these, dressed in that city's things and
// shouting in that city's language, then the door (which keeps the room's own exit twist).
import type { CityId } from '../constants';
import { DT } from '../constants';
import type { LevelDef, World } from '../world';
import { thingSize, type ThingKind } from '../../render/art/things';
import { Rider, Thing } from '../entities/traps';
import { Water } from '../entities/mumbai';
import { Door } from '../entities/basics';
import { exitTwist, Twist } from './twists';
import { ENDINGS, type EndingKind } from './endings';
import { checkpoint, cloud, door, geyser, group, panel, px, rider, roller, shot } from './kit';
import { Grid } from './grid';
import type { Act, ActCtx } from './acts';
import { crumble, dropFloor, noLanding, onPass, popAt, riseWall, shyLedge } from './trolls';

export type ChunkKind = 'rockfall' | 'reverser' | 'terraces' | 'mist' | 'droprun' | 'birds' | 'shygap' | 'rollers' | 'jets' | 'awning' | 'chaser';

/** How each city dresses the sections, and what its people shout (regional | English). */
export interface Skin {
  rock: ThingKind;
  rockLine: string;
  vehicle: ThingKind;
  reverse: string;
  sorry: string;
  roll: ThingKind;
  bird: ThingKind;
  jet: 'water' | 'fire';
  mist: string;
  lie: string;
  chaser: ThingKind;
  chaseLine: string;
  awning: { fill: string; trim: string; line: string };
}

export const SKINS = {
  TVM: { rock: 'boulder', rockLine: 'Kallu veezhunnu! | Rocks coming down!', vehicle: 'jeep', reverse: 'Reverse gear! | Backing up!', sorry: 'Sorry, sorry! | Sorry!', roll: 'coconut', bird: 'crow', jet: 'water', mist: '236,244,240', lie: 'Ippo chaadu, Dad! | Jump now, Dad!', chaser: 'dog', chaseLine: 'Patti! Odu! | Dog! Run!', awning: { fill: '#3E7C59', trim: '#2C5A40', line: 'rgba(0,0,0,0.2)' } },
  KVT: { rock: 'crate', rockLine: 'Petti veezhunnu! | Crates falling!', vehicle: 'jeep', reverse: 'Pinnottu! | Backing up!', sorry: 'Kshamikkanam! | Sorry!', roll: 'coconut', bird: 'crow', jet: 'water', mist: '240,248,250', lie: 'Ippo chaadu, Dad! | Jump now, Dad!', chaser: 'crab', chaseLine: 'Njandu! Odu! | Crab! Run!', awning: { fill: '#2E8FA3', trim: '#1F6575', line: 'rgba(0,0,0,0.2)' } },
  CHN: { rock: 'kudam', rockLine: 'Kudam vizhudhu! | Pots falling!', vehicle: 'scooter', reverse: 'Reverse-u, thalli po! | Reversing, move aside!', sorry: 'Mannichidunga! | Sorry!', roll: 'kudam', bird: 'crow', jet: 'water', mist: '238,228,208', lie: 'Ippo jump pannu, Dad! | Jump now, Dad!', chaser: 'dog', chaseLine: 'Naai! Odu machi! | Dog! Run, buddy!', awning: { fill: '#C0392B', trim: '#8E2A20', line: 'rgba(0,0,0,0.2)' } },
  PDY: { rock: 'crate', rockLine: 'Attention, les caisses! | Watch out, crates!', vehicle: 'cyclist', reverse: 'Attention! Reverse! | Watch out! Coming back!', sorry: 'Pardon, pardon! | Sorry, sorry!', roll: 'kudam', bird: 'crow', jet: 'water', mist: '242,242,236', lie: 'Saute, Dad! Saute! | Jump, Dad! Jump!', chaser: 'dog', chaseLine: 'Naai! Allez, odu! | Dog! Go, run!', awning: { fill: '#E3B23C', trim: '#B5862A', line: 'rgba(0,0,0,0.18)' } },
  BLR: { rock: 'boulder', rockLine: 'Bande bidthide! | A rock is falling!', vehicle: 'scooter', reverse: 'Reverse, guru! Side kodi! | Reversing, boss! Make way!', sorry: 'Kshamisi, guru! | Sorry, boss!', roll: 'tumbler', bird: 'crow', jet: 'water', mist: '230,236,242', lie: 'Eega jump maadi! | Jump now!', chaser: 'dog', chaseLine: 'Naayi! Odi, maga! | Dog! Run, kid!', awning: { fill: '#7E57C2', trim: '#5B3F8F', line: 'rgba(0,0,0,0.2)' } },
  AMR: { rock: 'chilli', rockLine: 'Mirchi bastalu padutunnayi! | Chilli sacks falling!', vehicle: 'cart', reverse: 'Venakki vasthunna! | Coming back in reverse!', sorry: 'Sorry andi! | Sorry!', roll: 'mirchi', bird: 'crow', jet: 'fire', mist: '250,240,226', lie: 'Ippude dookandi! | Jump now!', chaser: 'dog', chaseLine: 'Kukka! Parigettandi! | Dog! Run!', awning: { fill: '#D84315', trim: '#9E2F0E', line: 'rgba(0,0,0,0.2)' } },
  HYD: { rock: 'boulder', rockLine: 'Pathar gir rahe, miya! | Rocks falling, buddy!', vehicle: 'scooter', reverse: 'Peeche aa raha, miya! | Backing up, buddy!', sorry: 'Maaf karo, miya! | Sorry, buddy!', roll: 'chaicup', bird: 'crow', jet: 'fire', mist: '236,228,214', lie: 'Abhi kood, miya! | Jump now, buddy!', chaser: 'dog', chaseLine: 'Kutta! Bhago, miya! | Dog! Run, buddy!', awning: { fill: '#00897B', trim: '#00695C', line: 'rgba(0,0,0,0.2)' } },
  PNJ: { rock: 'coconut', rockLine: 'Narl poddta! | Coconut falling!', vehicle: 'scooter', reverse: 'Fattim ietam! | Coming back!', sorry: 'Maaf kor, baba! | Sorry, man!', roll: 'coconut', bird: 'crow', jet: 'water', mist: '246,232,214', lie: 'Atam uddi mar! | Jump now!', chaser: 'dog', chaseLine: 'Sunno! Dhanv! | Dog! Run!', awning: { fill: '#29B6F6', trim: '#0277BD', line: 'rgba(0,0,0,0.2)' } },
  DMN: { rock: 'crate', rockLine: 'Petiyo pade chhe! | Crates falling!', vehicle: 'scooter', reverse: 'Pachhu aave chhe! | Coming back!', sorry: 'Maaf karo! | Sorry!', roll: 'coconut', bird: 'crow', jet: 'water', mist: '236,244,248', lie: 'Have kudo! | Jump now!', chaser: 'dog', chaseLine: 'Kutro! Bhaago! | Dog! Run!', awning: { fill: '#00897B', trim: '#00695C', line: 'rgba(0,0,0,0.2)' } },
  JAI: { rock: 'crate', rockLine: 'Patthar padya! | Stones falling!', vehicle: 'scooter', reverse: 'Peechhe aa rayo! | It’s coming back!', sorry: 'Maaf karjo sa! | Sorry!', roll: 'coconut', bird: 'crow', jet: 'water', mist: '248,232,224', lie: 'Abhi kudo! | Jump now!', chaser: 'dog', chaseLine: 'Kutto! Bhaago! | Dog! Run!', awning: { fill: '#E91E63', trim: '#AD1457', line: 'rgba(0,0,0,0.2)' } },
  RPR: { rock: 'crate', rockLine: 'Bora girat he! | Sacks falling!', vehicle: 'scooter', reverse: 'Paachhu aavat he! | It’s coming back!', sorry: 'Maaf karbe, sangwari! | Sorry, friend!', roll: 'coconut', bird: 'crow', jet: 'water', mist: '236,244,228', lie: 'Abhi kood! | Jump now!', chaser: 'dog', chaseLine: 'Kutta! Bhaago! | Dog! Run!', awning: { fill: '#D84315', trim: '#BF360C', line: 'rgba(0,0,0,0.2)' } },
  BPL: { rock: 'crate', rockLine: 'Patthar gir riye hain! | Stones falling!', vehicle: 'scooter', reverse: 'Peeche aa riya hai! | It’s coming back!', sorry: 'Maaf karna, khan! | Sorry, friend!', roll: 'coconut', bird: 'crow', jet: 'water', mist: '232,240,244', lie: 'Abhi koodo! | Jump now!', chaser: 'dog', chaseLine: 'Kutta! Bhaago! | Dog! Run!', awning: { fill: '#00897B', trim: '#00695C', line: 'rgba(0,0,0,0.2)' } },
  GNR: { rock: 'crate', rockLine: 'Petiyo pade chhe! | Crates falling!', vehicle: 'scooter', reverse: 'Pachhu aave chhe! | Coming back!', sorry: 'Maaf karjo! | Sorry!', roll: 'coconut', bird: 'crow', jet: 'water', mist: '244,240,228', lie: 'Have kudo! | Jump now!', chaser: 'dog', chaseLine: 'Kutro! Bhaago! | Dog! Run!', awning: { fill: '#E53935', trim: '#B71C1C', line: 'rgba(0,0,0,0.2)' } },
  BOM: { rock: 'crate', rockLine: 'Khoka padla! | A box fell!', vehicle: 'cart', reverse: 'Maage yeto, bhau! | Coming back, bro!', sorry: 'Sorry bhau! | Sorry, bro!', roll: 'vada', bird: 'crow', jet: 'water', mist: '222,224,228', lie: 'Aata udi maar! | Jump now!', chaser: 'dog', chaseLine: 'Kutra! Pal, bhau! | Dog! Run, bro!', awning: { fill: '#1E88E5', trim: '#1565C0', line: 'rgba(0,0,0,0.2)' } },
} as Record<CityId, Skin>;

/** one line of advice per section, appended to the room's hint */
const ADVICE: Record<ChunkKind, string> = {
  rockfall: 'Things fall from above: hop the first one as soon as it lands, then let the next one drop.',
  reverser: 'A vehicle comes at you, then backs up for another go: stop and hop it.',
  terraces: 'Steps up: the middle one crumbles, so keep going. Leap the step down: it drops if you land on it.',
  mist: 'Wait for the mist to clear: two pits hide in it.',
  droprun: 'The road drops away, spikes pop up, a wall rises: hop each just before.',
  birds: 'Birds skim the road at head height: hop them.',
  shygap: 'The ledge flinches when you jump at it: fake a hop, let it come back, then jump.',
  rollers: 'Things roll at you: hop each one.',
  jets: 'Wait for the spray to pass, then run.',
  awning: "Don't jump under the awning, whatever Tara says.",
  chaser: 'A dog chases you: keep running, hop the spike and the gap.',
};

/** width (columns) of each section */
export const CHUNK_W: Record<ChunkKind, number> = {
  rockfall: 20,
  reverser: 30,
  terraces: 28,
  mist: 16,
  droprun: 22,
  birds: 20,
  shygap: 18,
  rollers: 26,
  jets: 18,
  awning: 16,
  chaser: 30,
};

export interface Part {
  kind: ChunkKind | string;
  x0: number;
  /** letters this section may use for moving tiles (lower) and pop-up spikes (upper) */
  letters: string;
  spikes: string;
  /** unique per stage: names its flags */
  id: number;
}

const G = 15; // ground row of every section

/** paint a section's tiles into the stage map */
function paint(g: Grid, p: Part) {
  const x = p.x0;
  const [a, b] = p.letters;
  switch (p.kind) {
    case 'terraces':
      g.fill(x + 4, x + 7, 13, 14, '#');
      g.fill(x + 8, x + 11, 11, 17, a);
      g.fill(x + 12, x + 17, 9, 14, '#');
      g.fill(x + 18, x + 21, 11, 17, b);
      break;
    case 'mist':
      g.fill(x + 4, x + 5, G, G, '.').fill(x + 4, x + 5, G + 1, G + 1, '^');
      g.fill(x + 8, x + 9, G, G, '.').fill(x + 8, x + 9, G + 1, G + 1, '^');
      break;
    case 'droprun':
      g.fill(x + 4, x + 5, G, 17, a);
      g.put(x + 10, G - 1, p.spikes[0]);
      g.fill(x + 16, x + 16, G, G + 1, b);
      break;
    case 'shygap':
      g.pit(x + 4, x + 5, G);
      g.pit(x + 6, x + 9, G).fill(x + 6, x + 9, G, G, a);
      g.pit(x + 10, x + 11, G);
      break;
    case 'awning':
      g.fill(x + 4, x + 11, 11, 11, a);
      g.fill(x + 4, x + 11, 12, 12, 'v');
      break;
    case 'chaser':
      g.put(x + 11, G - 1, '^');
      g.pit(x + 19, x + 20, G);
      break;
    default:
      break;
  }
}

/** build a section's moving parts */
function build(w: World, p: Part, s: Skin) {
  const x = p.x0;
  const X = (t: number) => px(x + t);
  const [a, b] = p.letters;
  const f = (k: string) => `${k}${p.id}`;
  switch (p.kind) {
    case 'rockfall': {
      // one lands in front of you; the next waits for you to run on
      const drop = (tx: number, at: number, delay: number, key: string) =>
        onPass(w, at, (w2) => {
          w2.sfx('crack', X(tx) + 16, 8);
          w2.say(s.rockLine, X(tx) + 16, px(4), 1.6, 'npc');
          for (const [dx, dy] of [[-9, 0], [34, 3], [-17, 7]]) w2.add(new Thing('pebble', X(tx) + dx, dy, { solid: false, layer: 3 })).fall(w2, { v0: 40 + dy * 8, g: 1400 });
          w2.after(delay, () => {
            const r = w2.add(new Thing(s.rock, X(tx), 0, { layer: 3 }));
            w2.flags[f(key)] = r;
            r.setDeadly('crushed');
            r.fall(w2, { v0: 160, g: 2600, then: () => r.setDeadly(false) });
          });
        });
      drop(8, X(8) - 56, 0, 'rA');
      drop(13, X(10) - 2, 0.18, 'rB');
      break;
    }
    case 'reverser': {
      // it comes down the road, you hop it... and it backs up for another go
      let v: Rider | null = null;
      let phase = 0,
        since = 0;
      w.onTick((w2) => {
        const pl = w2.player;
        if (phase === 0 && pl.x >= X(2)) {
          phase = 1;
          v = rider(w2, s.vehicle, pl.x + 330, G, -150, 4);
          w2.flags[f('veh')] = v;
          w2.sfx('honk', pl.x + 220, px(G - 1));
        } else if (phase === 1 && v && v.x + v.w < pl.x - 20) {
          phase = 2;
          since = w2.tick;
        } else if (phase === 2 && v && (w2.tick - since) * DT >= 0.3) {
          phase = 3;
          v.vx = 260;
          w2.flags[f('rev')] = 1;
          for (let i = 0; i < 3; i++) w2.after(i * 0.18, () => w2.sfx('beep', v!.cx, px(G - 1)));
          w2.say(s.reverse, v.cx, px(G - 3), 1.1, 'npc');
        } else if (phase === 3 && v && v.x + v.w >= X(29)) {
          phase = 4;
          v.vx = 0;
          v.hazard.active = false;
          w2.flags[f('rev')] = 0;
          w2.sfx('thud', v.x + v.w, px(G - 1));
          w2.say(s.sorry, v.cx, px(G - 2.6), 1.0, 'npc');
        }
      });
      // a low kerb it parks against
      panel(w, x + 29, G - 1, 1, 1, 'rgba(90,80,70,0.85)', 'rgba(0,0,0,0.25)');
      break;
    }
    case 'terraces':
      crumble(w, a, 0.42);
      noLanding(w, b);
      break;
    case 'mist':
      cloud(w, x + 1.5, 11.5, 10, 6.5, { period: 3.4, on: 2.2, phase: (p.id * 1.3) % 3.4 }, s.mist);
      break;
    case 'droprun':
      dropFloor(w, a);
      popAt(w, p.spikes[0], X(8.6));
      riseWall(w, b, X(12.5), 2);
      break;
    case 'birds': {
      const bird = (at: number, ahead: number) =>
        onPass(w, X(at), (w2) => {
          shot(w2, s.bird, w2.player.x + ahead, px(G) - 11, -150, 0, 0, 'hit');
          w2.sfx(s.bird === 'bat' ? 'blink' : 'caw', w2.player.x + ahead - 40, px(G) - 14);
        });
      bird(2, 230);
      bird(10, 250);
      break;
    }
    case 'shygap':
      shyLedge(w, a, { dx: 3, from: X(1), back: 0.9 });
      break;
    case 'rollers': {
      // three come rolling at you; none is sent once you're nearly through (no surprises in the next bit)
      onPass(w, X(2), (w2) => {
        for (let i = 0; i < 3; i++)
          w2.after(i * 0.75 + 0.01, () => {
            if (w2.player.x > X(18)) return;
            const sz = thingSize(s.roll)[1];
            roller(w2, s.roll, Math.min(w2.W - 20, w2.player.x + 300), px(G) - sz, -150, { cause: 'hit' });
            w2.sfx('slide', w2.player.x + 200, px(G) - 8);
          });
      });
      break;
    }
    case 'jets':
      [5, 9, 13].forEach((t, i) => {
        const gz = geyser(w, X(t) + 8, px(G), 84, 2.6, [[i * 0.3, 0.7]], s.jet === 'fire' ? 'burnt' : 'splash');
        if (s.jet === 'fire') gz.fire = true;
      });
      break;
    case 'awning': {
      const aw = group(w, a);
      aw.paint = { ...s.awning, kerb: undefined };
      onPass(w, X(3), (w2) => w2.guide(s.lie));
      break;
    }
    case 'chaser': {
      onPass(w, X(2), (w2) => {
        const d = w2.add(new Thing(s.chaser, w2.player.x - 110, px(G) - thingSize(s.chaser)[1], { solid: false, deadly: 'hit', layer: 3 }));
        d.look = 'awake';
        w2.flags[f('dog')] = d;
        w2.say(s.chaseLine, w2.player.x, px(G - 3), 1.6, 'npc');
        w2.sfx('caw', w2.player.x - 100, px(G) - 8);
        let dx = d.x;
        w2.onTick((w3) => {
          if (dx >= X(26)) return;
          dx += 122 * DT;
          d.place(w3, dx, d.y);
        });
      });
      break;
    }
  }
}

/** letters already used by a map */
function usedLetters(rows: string[]) {
  const s = new Set<string>();
  for (const r of rows) for (const c of r) if (/[a-zA-Z]/.test(c)) s.add(c);
  return s;
}

export interface LongSpec {
  /** the city's original one-screen stage: its room becomes the first part of the long stage */
  base: LevelDef;
  /** shared sections after the room, in order (old style: prefer `acts`) */
  parts?: ChunkKind[];
  /** this stage's own sections after the room, in order: each one is used once in the whole game */
  acts?: Act[];
  /** tiles that tie the room's end into the first section (the room's exit 'E' is removed for you) */
  join?: (g: Grid) => void;
  /** columns the join needs after the room (sections start after them) */
  joinW?: number;
  /** where the room's water (if any) ends, tile x (default: at the end of the room) */
  waterTo?: number;
  /** add a last-second surprise at the door (rooms that didn't have one) */
  twist?: Twist;
  /** this stage's own dressing (eg. bats in a cave, boulders in a canyon) */
  skin?: Partial<Skin>;
  /** extra hidden checkpoints (tile x); each section's start gets one anyway */
  cps?: number[];
  par?: number;
  /** where the 7th death sends Dad (LevelDef.lives); default: the stage start */
  lives?: 'stage' | 'act';
  /** the stage's place in the city's shape (LevelDef.shape) */
  shape?: LevelDef['shape'];
  /** the stage's allocation slot (LevelDef.meta) */
  meta?: LevelDef['meta'];
}

/** which of a long stage's `hintParts` Dad is in at world x `x` (px): the last part that starts at or before it */
export function hintPartAt(def: LevelDef, x: number): number {
  const at = def.hintAt ?? [];
  let i = 0;
  while (i + 1 < at.length && x >= px(at[i + 1])) i++;
  return i;
}

/** A long stage: the original room + troll sections + the door (with the room's own exit twist). */
export function longStage(o: LongSpec): LevelDef {
  const base = o.base;
  const coreCols = base.map[0].length;
  let x = coreCols + (o.joinW ?? 0);
  const used = usedLetters(base.map);
  const lower = 'abcdefghijklmnopqrstuvwxyz'.split('').filter((c) => !used.has(c));
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter((c) => !used.has(c));
  const parts: Part[] = (o.parts ?? []).map((kind, i) => {
    const p: Part = { kind, x0: x, letters: lower.splice(0, 2).join(''), spikes: upper.splice(0, 1).join(''), id: i };
    x += CHUNK_W[kind];
    return p;
  });
  const acts = (o.acts ?? []).map((a, i) => {
    const id = parts.length + i;
    const x0 = x;
    const c: ActCtx = {
      x: x0,
      L: lower.splice(0, 5).join(''),
      U: upper.splice(0, 4).join(''),
      id,
      X: (t: number) => px(x0 + t),
      f: (k: string) => `${a.id}:${k}`,
    };
    x += a.w;
    return { a, c };
  });
  const end = o.twist ? ENDINGS[o.twist as EndingKind] : undefined;
  const doorX = x + (end?.space ?? 9);
  const cols = doorX + 1 + (end?.after ?? 4);
  const g = Grid.from(base.map.map((r) => r.replace('E', '.')), cols);
  o.join?.(g);
  for (const p of parts) paint(g, p);
  for (const { a, c } of acts) a.paint?.(g, c);
  g.put(doorX, G - 1, 'E');
  end?.paint?.(g, doorX);
  const city = base.city;
  const doorCp = doorX - (end?.space ?? 9) - 0.5;
  const hintParts = [base.hint, ...(o.parts ?? []).map((k) => ADVICE[k]), ...acts.map(({ a }) => a.advice), ...(end ? [end.advice] : [])];
  const hintAt = [0, ...parts.map((p) => p.x0), ...acts.map(({ c }) => c.x), ...(end ? [doorCp] : [])];
  return {
    ...base,
    hint: hintParts.join(' '),
    hintParts,
    hintAt,
    actStarts: acts.filter(({ a }) => a.cp0 !== false).map(({ c }) => c.x + 0.5),
    ...(o.lives ? { lives: o.lives } : {}),
    ...(o.shape ? { shape: o.shape } : {}),
    ...(o.meta ? { meta: o.meta } : {}),
    map: g.rows(),
    par: o.par ?? base.par,
    parts: [
      ...parts.map((p) => ({ kind: p.kind, x0: p.x0, id: p.id, letters: p.letters, spikes: p.spikes })),
      ...acts.map(({ a, c }) => ({ kind: a.id, x0: c.x, id: c.id, letters: c.L, spikes: c.U })),
    ],
    doorX,
    coreCols,
    ending: o.twist,
    build(w: World) {
      if (o.twist) w.flags.twistOverride = o.twist;
      base.build?.(w);
      // the room's lagoon or flood stays in the room: the new road is dry land
      for (const e of w.entities) if (e instanceof Water && e.x1 === Infinity) e.x1 = px(o.waterTo ?? coreCols);
      const skin = { ...SKINS[city], ...(o.skin ?? {}) };
      for (const p of parts) build(w, p, skin);
      for (const { a, c } of acts) a.build?.(w, c);
      // rooms that ended in an auto ride (or a train) have no door of their own: give them one
      let d = w.entities.find((e) => e instanceof Door && !(e as Door).fake) as Door | undefined;
      if (!d) d = door(w);
      // the room's own twist was swapped for this one as it was set up; rooms without one get it now
      if (o.twist && !w.flags.twistKind) exitTwist(w, d, o.twist);
      for (const p of parts) checkpoint(w, p.x0 + 0.5);
      for (const { a, c } of acts) {
        if (a.cp0 !== false) checkpoint(w, c.x + 0.5);
        for (const t of a.cps ?? []) checkpoint(w, c.x + t);
      }
      for (const tx of o.cps ?? []) checkpoint(w, tx);
      // and one just before the door's surprise: dying to it never sends you back through the whole act
      checkpoint(w, doorCp);
    },
  };
}
