// Sri Vijaya Puram's ten stages: 01 the welcome tour, 02-10 a room, its acts and a door ending each, harder each time,
// 10 the finale. Each stage's own file is s01.ts .. s10.ts; this file only puts them in order (docs/CITY-MODULE.md:
// `levels` stays a function, because tour() and longStage() read the city's course, skin and endings when they run).
import type { LevelDef } from '../../world';
import { tour } from '../../levels/tour';
import { longStage } from '../../levels/chunks';
import { X } from './lines';
import { extra, paint } from './s01';
import { aariRoom, chirai } from './s02';
import { magarRoom, nala } from './s03';
import { hiranRoom, ghat } from './s04';
import { tasveerRoom, dekho } from './s05';
import { rassi } from './rassi';
import { choona } from './choona';
import { lehar } from './lehar';
import { bazaar } from './kadhai';
import { hauz } from './hauz';
import { toteRoom, sanjh } from './s06';
import { jettyRoom, ghatSte, doosra, teesra } from './s07';
import { monsoonRoom, gali } from './s08';
import { jadRoom, pul } from './s09';
import { dweepRoom, nadi, jadFin, samanFin, rassiFin, ghatFin } from './s10';

export const levels = (): LevelDef[] => [
  {
    ...tour({
      id: 'SVP-01',
      city: 'SVP',
      name: 'Namaste SVP',
      nameEn: 'Hello, Sri Vijaya Puram',
      tagline: 'The island capital, once Port Blair, with its harbour, its steep lanes and its sudden rain. Welcome.',
      lines: [X.welcome, X.tour, X.ship, X.deer, X.queue, X.nextShip],
      shouts: [
        [27, X.queue],
        [86, X.ship],
      ],
      ride: 'cart',
      item: 'svp-machhli',
      signs: [
        [6, 'SRI VIJAYA PURAM', 'harbour'],
        [45, 'ABERDEEN BAZAAR', 'the lane'],
        [100, 'JETTY 1', 'ships'],
      ],
      props: [
        ['lamp', 4, {}],
        ['stall', 16, { label: 'FISH' }],
        ['lamp', 62, {}],
        ['crowd', 88, { n: 3 }],
        ['lamp', 106, {}],
      ],
      things: [],
      paint,
      extra,
      cps: [32.2, 69, 91],
      par: 32,
      hint: 'A walk round town: hop the bollards and the steps. The lane after the awning is steep, and when the cloud comes over it a sheet of water runs down it and pushes you back into the drain. Shelter under the awning. The cloud has two lobes with a lull between them: wait until the sun is out before you go.',
    }),
    shape: 'tour',
    meta: { family: 'lane-sheet-flow-push', betrayals: ['sheet-flow'], ending: 'svp-lane-sun' },
  },
  longStage({ base: aariRoom(), acts: [chirai], twist: 'svp-timber-stack', par: 29, shape: 'short', meta: { family: 'cut-floor-saw-carriage', betrayals: ['cut-floor'], ending: 'svp-timber-stack' } }),
  longStage({ base: magarRoom(), acts: [nala], twist: 'svp-board-bridge', par: 33, shape: 'short', meta: { family: 'warning-board-arrow-turns', betrayals: ['honest-moving-sign'], ending: 'svp-board-bridge' } }),
  longStage({ base: hiranRoom(), acts: [ghat], twist: 'svp-jetty-guard', par: 29, shape: 'short', meta: { family: 'food-holder-followed-by-deer', betrayals: ['carry-attracts'], ending: 'svp-jetty-guard' } }),
  longStage({ base: tasveerRoom(), acts: [dekho, rassi, choona], twist: 'svp-note-door', par: 28, shape: 'wtf', meta: { family: 'picture-aligns-ledge-from-spot', betrayals: ['viewpoint-align'], ending: 'svp-note-door' } }),
  longStage({ base: toteRoom(), acts: [sanjh, lehar], twist: 'svp-bough-door', par: 49, shape: 'long', meta: { family: 'bird-weight-bends-tree', betrayals: ['crowd-weight-bends'], ending: 'svp-bough-door' } }),
  longStage({ base: jettyRoom(), acts: [ghatSte, doosra, teesra], twist: 'svp-ticket-window', par: 80, shape: 'marathon', lives: 'act', cps: [23.4], meta: { family: 'luggage-stacks-as-floor', betrayals: ['crowd-belongings-floor'], ending: 'svp-ticket-window' } }),
  longStage({ base: monsoonRoom(), acts: [gali, bazaar], twist: 'svp-gutter-river', par: 56, shape: 'wtf', meta: { family: 'rain-direction-reverses-awnings', betrayals: ['second-season'], ending: 'svp-gutter-river' } }),
  longStage({ base: jadRoom(), acts: [pul, hauz], twist: 'svp-frame-door', par: 34, shape: 'long', meta: { family: 'brick-crumbles-roots-hold', betrayals: ['visual-rule-brick-root'], ending: 'svp-frame-door' } }),
  longStage({ base: dweepRoom(), acts: [nadi, jadFin, samanFin, rassiFin, ghatFin], twist: 'svp-dweep-gate', par: 95, shape: 'marathon', lives: 'act', meta: { family: 'finale-food-through-sawmill', betrayals: ['food-through-sawmill'], ending: 'svp-dweep-gate' } }),
];
