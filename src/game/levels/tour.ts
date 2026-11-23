// Stage 1 of every city: a walk through the capital with Tara as the guide. She welcomes you,
// then tells you real things about the place as you pass them (queued, so nothing is cut off).
// The course itself is gentle (shallow ditches you can climb out of), but since the hardness pass
// every city's tour hides betrayals of its own (`paint` and `extra`): no stage is a free walk.
import type { CityId } from '../constants';
import type { LevelDef, World } from '../world';
import type { ThingKind } from '../../render/art/things';
import type { PropKind } from '../../render/art/props';
import { checkpoint, collectible, door, prop, px, rival, sign, thing, thingOn } from './kit';
import { Grid } from './grid';
import { onPass } from './trolls';
import { LINES } from '../cities';
import { Entity } from '../world';
import { TILE } from '../constants';

/** The pieces a tour is walked over. None of them can hurt you: the ditches are shallow. */
export type TourSeg =
  | { k: 'wall'; x: number; w?: number }
  | { k: 'ditch'; x: number; w: number; wet?: boolean }
  | { k: 'steps'; x: number; n: number; run: number; top: number }
  | { k: 'parked'; x: number }
  | { k: 'posts'; x: number; n: number }
  | { k: 'stones'; x: number; n: number; wet?: boolean }
  | { k: 'ferry'; x: number; w: number; kind: ThingKind; wet?: boolean; label?: string };

/** Every city walks its own course (tile columns); the door, the deck and the item are where they always were. */
export const TOUR = { cols: 120, door: 112, deck: [94, 99] as [number, number], item: [96.5, 8.4] as [number, number] };
export const COURSES: Record<CityId, TourSeg[]> = {
  // a temple tank to walk down into, and a canoe across the canal
  TVM: [{ k: 'wall', x: 12 }, { k: 'ditch', x: 24, w: 2 }, { k: 'steps', x: 36, n: 2, run: 3, top: 4 }, { k: 'parked', x: 56 }, { k: 'ferry', x: 68, w: 10, kind: 'odam', wet: true }],
  // coral heads across the lagoon, and the jetty steps
  KVT: [{ k: 'stones', x: 13, n: 4, wet: true }, { k: 'wall', x: 36 }, { k: 'parked', x: 48 }, { k: 'steps', x: 60, n: 2, run: 2, top: 6 }, { k: 'ditch', x: 82, w: 2, wet: true }],
  // the auto stand, then up and down a gopuram's tiers, and the beach lamp posts
  CHN: [{ k: 'parked', x: 14 }, { k: 'ditch', x: 26, w: 2 }, { k: 'steps', x: 36, n: 4, run: 2, top: 4 }, { k: 'posts', x: 64, n: 3 }, { k: 'wall', x: 80, w: 2 }],
  // French bollards in a row, a canal, and the café terrace
  // (no wall after the terrace: the street from there to the canal is where the policeman's cap blows down)
  PDY: [{ k: 'posts', x: 12, n: 5 }, { k: 'ditch', x: 32, w: 2, wet: true }, { k: 'parked', x: 44 }, { k: 'steps', x: 52, n: 1, run: 2, top: 10 }, { k: 'ditch', x: 86, w: 2 }],
  // over the dug-up road on the metro shuttle
  // (the dug-up road after the metro is the city's own: a smart bridge over it, see blr.ts)
  BLR: [{ k: 'wall', x: 12 }, { k: 'steps', x: 22, n: 2, run: 2, top: 3 }, { k: 'parked', x: 40 }, { k: 'ferry', x: 52, w: 12, kind: 'traincar', label: 'NAMMA METRO' }, { k: 'posts', x: 82, n: 2 }],
  // the barrage piers across the Krishna
  AMR: [{ k: 'ditch', x: 12, w: 2 }, { k: 'parked', x: 24 }, { k: 'stones', x: 36, n: 5, wet: true }, { k: 'wall', x: 66, w: 2 }, { k: 'steps', x: 74, n: 3, run: 2, top: 2 }],
  // up the Charminar's steps, and the boat on Hussain Sagar
  HYD: [{ k: 'parked', x: 12 }, { k: 'wall', x: 24 }, { k: 'steps', x: 32, n: 5, run: 1, top: 4 }, { k: 'ditch', x: 54, w: 2 }, { k: 'ferry', x: 66, w: 11, kind: 'odam', wet: true }, { k: 'posts', x: 84, n: 2 }],
  // the laterite steps, a canoe hop, and the car ferry across the Mandovi to Betim
  PNJ: [{ k: 'stones', x: 12, n: 3, wet: true }, { k: 'wall', x: 30 }, { k: 'ferry', x: 40, w: 18, kind: 'ferry', wet: true, label: 'BETIM' }, { k: 'parked', x: 66 }, { k: 'steps', x: 76, n: 3, run: 2, top: 2 }],
  // the jetty bollards, the ferry from Nani to Moti Daman, and the fort steps
  DMN: [{ k: 'posts', x: 12, n: 3 }, { k: 'ditch', x: 26, w: 2, wet: true }, { k: 'ferry', x: 38, w: 18, kind: 'ferry', wet: true, label: 'MOTI DAMAN' }, { k: 'wall', x: 64, w: 2 }, { k: 'steps', x: 74, n: 3, run: 2, top: 3 }],
  // the sector circle's kerbs, the riverfront steps, a BRTS shuttle over the Sabarmati
  GNR: [{ k: 'posts', x: 12, n: 4 }, { k: 'steps', x: 28, n: 2, run: 2, top: 3 }, { k: 'parked', x: 44 }, { k: 'ferry', x: 54, w: 16, kind: 'traincar', wet: true, label: 'BRTS' }, { k: 'ditch', x: 78, w: 2 }],
  // the pink city's bollards, Hawa Mahal's steps, the metro over the dug-up road
  RPR: [{ k: 'posts', x: 12, n: 3 }, { k: 'ditch', x: 26, w: 2 }, { k: 'steps', x: 40, n: 3, run: 2, top: 3 }, { k: 'ferry', x: 56, w: 14, kind: 'traincar', label: 'RAIPUR JN' }, { k: 'parked', x: 82 }],
  BPL: [{ k: 'steps', x: 12, n: 3, run: 2, top: 3 }, { k: 'posts', x: 28, n: 3 }, { k: 'ditch', x: 44, w: 2 }, { k: 'ferry', x: 54, w: 14, kind: 'traincar', label: 'BHOPAL JN' }, { k: 'parked', x: 80 }],
  JAI: [{ k: 'posts', x: 12, n: 3 }, { k: 'steps', x: 26, n: 3, run: 2, top: 3 }, { k: 'parked', x: 46 }, { k: 'ferry', x: 56, w: 14, kind: 'traincar', label: 'PINK LINE' }, { k: 'ditch', x: 80, w: 2 }],
  // a ride on the local over the nala
  BOM: [{ k: 'posts', x: 12, n: 3 }, { k: 'ditch', x: 24, w: 2 }, { k: 'parked', x: 34 }, { k: 'ferry', x: 46, w: 16, kind: 'traincar', wet: true, label: 'CHURCHGATE' }, { k: 'wall', x: 70 }, { k: 'steps', x: 78, n: 2, run: 2, top: 2 }],
  // the Rock Garden's steps and a ride up the plateau road from Ranchi station
  RNC: [{ k: 'ditch', x: 12, w: 2 }, { k: 'steps', x: 24, n: 3, run: 2, top: 3 }, { k: 'posts', x: 44, n: 3 }, { k: 'parked', x: 62 }, { k: 'ferry', x: 76, w: 14, kind: 'traincar', label: 'RANCHI JN' }],
};

/** the far end of a piece, in tiles */
export const segEnd = (s: TourSeg) =>
  s.k === 'wall' ? s.x + (s.w ?? 1) : s.k === 'ditch' || s.k === 'ferry' ? s.x + s.w : s.k === 'steps' ? s.x + 2 * s.n * s.run + s.top : s.k === 'posts' ? s.x + 3 * s.n : s.k === 'stones' ? s.x + 4 * s.n + 2 : s.x + 2;

/** shallow water drawn in a ditch: it only looks like a swim */
class Shallow extends Entity {
  constructor(
    readonly x0: number,
    readonly x1: number,
  ) {
    super();
    this.layer = 5;
  }
  draw(ctx: CanvasRenderingContext2D, w: { tick: number }) {
    const y = 15 * TILE + 6;
    const g = ctx.createLinearGradient(0, y, 0, y + 26);
    g.addColorStop(0, 'rgba(110,190,210,0.7)');
    g.addColorStop(1, 'rgba(40,110,130,0.85)');
    ctx.fillStyle = g;
    ctx.fillRect(this.x0, y, this.x1 - this.x0, 26);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 0.8;
    for (let x = this.x0 + ((w.tick * 0.3) % 12); x < this.x1 - 4; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, y + 0.5);
      ctx.lineTo(x + 5, y + 0.5);
      ctx.stroke();
    }
  }
}

export interface TourSpec {
  id: string;
  city: CityId;
  name: string;
  nameEn: string;
  tagline: string;
  /** Tara's lines: [welcome, fact, fact, fact, fact, see-you-at-the-real-stages] */
  lines: string[];
  /** a vendor or local who shouts something as you pass (regional | English) */
  shouts: [number, string][];
  /** the parked thing to hop over */
  ride: ThingKind;
  /** the course (default: the city's own, in COURSES) */
  course?: TourSeg[];
  /** item kind for the third star */
  item: ThingKind;
  /** landmark signs: [tile x, label, sub] */
  signs: [number, string, string][];
  /** props along the way: [kind, tile x, opts] (they stand on the ground row unless ty is given) */
  props: [PropKind, number, Record<string, any>?, number?][];
  /** things standing about as scenery (no collision): [kind, tile x] */
  things?: [ThingKind, number][];
  par?: number;
  /** this city's own betrayals: map letters to add (after the course) and what to build */
  paint?: (g: Grid) => void;
  extra?: (w: World) => void;
  /** the hint, if the betrayals need one (the course hint is used otherwise) */
  hint?: string;
}

const HINT: Record<TourSeg['k'], string> = {
  wall: 'hop the low walls',
  ditch: 'jump the ditches (fall in and you just climb out)',
  steps: 'climb the steps',
  parked: 'hop what’s parked in the road',
  posts: 'hop the posts one by one',
  stones: 'hop from stone to stone',
  ferry: 'step on the shuttle when it stops, and off at the far side',
};

export function tour(t: TourSpec): LevelDef {
  const T = TOUR;
  const course = t.course ?? COURSES[t.city];
  const g = Grid.ground(15, T.cols);
  for (const s of course) {
    if (s.k === 'wall') g.fill(s.x, s.x + (s.w ?? 1) - 1, 14, 14, '#');
    else if (s.k === 'ditch' || s.k === 'ferry') g.fill(s.x, s.x + s.w - 1, 15, 16, '.');
    else if (s.k === 'posts') for (let i = 0; i < s.n; i++) g.fill(s.x + 3 * i, s.x + 3 * i, 14, 14, '#');
    else if (s.k === 'stones') {
      g.fill(s.x, s.x + 4 * s.n + 1, 15, 16, '.');
      for (let i = 0; i < s.n; i++) g.fill(s.x + 2 + 4 * i, s.x + 3 + 4 * i, 15, 16, '#');
    } else if (s.k === 'steps') {
      for (let i = 0; i < s.n; i++) g.fill(s.x + i * s.run, s.x + (i + 1) * s.run - 1, 14 - i, 14, '#');
      g.fill(s.x + s.n * s.run, s.x + s.n * s.run + s.top - 1, 15 - s.n, 14, '#');
      const d0 = s.x + s.n * s.run + s.top;
      for (let i = 0; i < s.n; i++) g.fill(d0 + i * s.run, d0 + (i + 1) * s.run - 1, 15 - (s.n - i), 14, '#');
    }
  }
  g.fill(T.deck[0], T.deck[1], 13, 14, '#');
  t.paint?.(g);
  g.put(3, 14, '@').put(T.door, 14, 'E');
  const kinds = [...new Set(course.map((s) => s.k))];
  const hint = 'A walk around town: ' + kinds.map((k) => HINT[k]).join(', ') + '. Tara will tell you about the city.';
  return {
    id: t.id,
    city: t.city,
    index: 1,
    name: t.name,
    nameEn: t.nameEn,
    tagline: t.tagline,
    hint: t.hint ?? hint.charAt(0).toUpperCase() + hint.slice(1),
    par: t.par ?? 30,
    map: g.rows(),
    build(w: World) {
      door(w);
      const L = LINES[t.city];
      // the guide: welcome on arrival, then a line at each landmark, one after another
      rival(w, 6, 15, 1, { intro: t.lines[0], point: 1, introAt: 0.4, taunts: L.taunt, beaten: L.beaten[0] });
      const at = [11, 30, 52, 78, 100];
      t.lines.slice(1).forEach((line, i) => onPass(w, px(at[i] ?? 100), (w2) => w2.guide(line)));
      for (const [tx, line] of t.shouts) onPass(w, px(tx) - 40, (w2) => w2.say(line, px(tx) + 8, px(10.6), 2.4, 'npc'));
      for (const s of course) {
        if (s.k === 'parked') thingOn(w, t.ride, s.x, 15);
        if ((s.k === 'ditch' || s.k === 'stones' || s.k === 'ferry') && s.wet) w.add(new Shallow(px(s.x), px(segEnd(s) - (s.k === 'stones' ? 0 : 0))));
        if (s.k === 'ferry') {
          // a shuttle across: it waits at each end
          const sw = 3;
          const f = thing(w, s.kind, s.x, 15, { w: px(sw), h: 10, oneWay: false, layer: 1, label: s.label ?? '' });
          (f as unknown as { ferry: number }).ferry = 1;
          f.patrol(w, px(s.w - sw), (s.w - sw) * 0.22, 0.7);
        }
      }
      for (const [tx, label, sub] of t.signs) sign(w, tx, 10.6, Math.max(3.4, label.length * 0.42 + 1), label, 'green', null, sub);
      for (const [kind, tx, o, ty] of t.props) prop(w, kind, tx, ty ?? 15, o ?? {}, -8);
      for (const [kind, tx] of t.things ?? []) thingOn(w, kind, tx, 15, { solid: false, layer: -7 });
      // hidden checkpoints after each piece (a tour should never send you all the way back)
      for (const sg of course) checkpoint(w, segEnd(sg) + 1.5);
      collectible(w, t.item, T.item[0], T.item[1]);
      w.flags.tour = 1;
      t.extra?.(w);
    },
  };
}

/** Seconds of reading Tara's lines take, roughly (for picking a fair par). */
export const tourRead = (lines: string[]) => lines.reduce((s, l) => s + Math.min(6.5, 1.3 + l.length * 0.045), 0);

export { px };
