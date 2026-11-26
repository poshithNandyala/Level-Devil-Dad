// Sri Vijaya Puram's ten stages: 01 the welcome tour, 02-10 long stages (room + act + door ending), harder each time,
// 10 the finale. Each slot below is a TODO placeholder (an empty room with a door): replace it with the stage
// from the allocation (docs/allocation.json), and set its meta. Keep `levels` a function (docs/CITY-MODULE.md).
import { type LevelDef, type World } from '../../world';
import { lines as L } from './lines';
import { door, rival } from '../../levels/kit';
import { tour } from '../../levels/tour';
import { longStage } from '../../levels/chunks';
import { Grid } from '../../levels/grid';
import { aariRoom, chirai } from './s02';
import { magarRoom, nala } from './s03';
import { hiranRoom, ghat } from './s04';
import { tasveerRoom, dekho } from './s05';
import { toteRoom, sanjh } from './s06';

const tara = (n: number) => ({ intro: L.intro[n % L.intro.length], point: 1 as const, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });

/** TODO placeholder room for stage `n`: replace with the real room (its own idea, sign, Tara, hidden item) */
function todoRoom(n: number): LevelDef {
  return {
    id: `SVP-${String(n).padStart(2, '0')}`,
    city: 'SVP',
    index: n,
    name: `TODO stage ${n}`,
    nameEn: 'TODO',
    tagline: 'TODO',
    hint: 'TODO: what kills you and how to beat it.',
    par: 30,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      rival(w, 3, 15, 1, tara(n - 2));
      // TODO: the mechanic's entities, a sign, the guide's lines, one collectible(w, 'svp-item', tx, ty)
    },
  };
}

export const levels = (): LevelDef[] => [
  tour({
    id: 'SVP-01',
    city: 'SVP',
    name: 'TODO welcome',
    nameEn: 'TODO',
    tagline: 'TODO',
    lines: ['TODO | TODO', 'TODO | TODO', 'TODO | TODO', 'TODO | TODO', 'TODO | TODO', 'TODO | TODO'],
    shouts: [],
    ride: 'cart',
    item: 'svp-machhli',
    signs: [],
    props: [],
    things: [],
  }),
  longStage({ base: aariRoom(), acts: [chirai], twist: 'svp-timber-stack', par: 40, shape: 'short', meta: { family: 'cut-floor-saw-carriage', betrayals: ['cut-floor'], ending: 'svp-timber-stack' } }), // SVP-02
  longStage({ base: magarRoom(), acts: [nala], twist: 'svp-board-bridge', par: 44, shape: 'short', meta: { family: 'warning-board-arrow-turns', betrayals: ['honest-moving-sign'], ending: 'svp-board-bridge' } }), // SVP-03
  longStage({ base: hiranRoom(), acts: [ghat], twist: 'svp-jetty-guard', par: 50, shape: 'short', meta: { family: 'food-holder-followed-by-deer', betrayals: ['carry-attracts'], ending: 'svp-jetty-guard' } }), // SVP-04
  longStage({ base: tasveerRoom(), acts: [dekho], twist: 'svp-note-door', par: 58, shape: 'wtf', meta: { family: 'picture-aligns-ledge-from-spot', betrayals: ['viewpoint-align'], ending: 'svp-note-door' } }), // SVP-05
  longStage({ base: toteRoom(), acts: [sanjh], twist: 'svp-bough-door', par: 62, shape: 'long', meta: { family: 'bird-weight-bends-tree', betrayals: ['crowd-weight-bends'], ending: 'svp-bough-door' } }), // SVP-06
  longStage({ base: todoRoom(7), par: 30, shape: 'long' }), // SVP-07 TODO: acts, twist (a svp-... ending), par
  longStage({ base: todoRoom(8), par: 30, shape: 'long' }), // SVP-08 TODO: acts, twist (a svp-... ending), par
  longStage({ base: todoRoom(9), par: 30, shape: 'long' }), // SVP-09 TODO: acts, twist (a svp-... ending), par
  longStage({ base: todoRoom(10), par: 30, shape: 'long' }), // SVP-10 TODO: acts, twist (a svp-... ending), par
];
