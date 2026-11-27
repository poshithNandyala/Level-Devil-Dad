// Gangtok's ten stages: 01 the welcome tour, 02-10 long stages (room + act + door ending), harder each time,
// 10 the finale (Gangtok's own ideas only). One file per stage (s01.ts ... s10.ts).
import type { LevelDef } from '../../world';
import { longStage } from '../../levels/chunks';
import type { Act } from '../../levels/acts';
import { tara } from '../../levels/endkit';
import { onPass } from '../../levels/trolls';
import { px } from './entities';

/** Tara at the start of an act, urging the play its trap waits for (she lies; the guide never does) */
const INTRO: Record<string, string> = {
  'gtk07-chhajja': 'Ke cha haal khabar? Jump big!',
  'gtk07-bijuli': 'Hajur! It has struck, Dad, go now!',
  'gtk07-paani': 'Hajur! Under the tea stall, Dad, quick!',
  'gtk07-ghanti': 'Hajur! Follow the rope, Dad!',
  'gtk03-kalam': 'Hajur! Wait till he’s done, Dad!',
  'gtk02-ulta': 'Hajur! Stay on, it comes back down!',
  'gtk03-ulto': 'Hajur! Check each bag for stitches, slowly!',
  'gtk03-jaldi': 'Hajur! Have a good look at each bag!',
  'gtk04-upar': 'Hajur! First door out, Dad!',
  'gtk04-beech': 'Hajur! All the way up to G!',
  'gtk05-aarakshit': 'Hajur! Up on the bench, Dad!',
  'gtk05-do': 'Hajur! One bin is enough, Dad!',
  'gtk05-jhadu': 'Hajur! Walk on, Dad, it’s clean!',
  'gtk08-saamne': 'Hajur! Round the station, Dad, like last time!',
  'gtk06-ulta': 'Hajur! The road goes on, Dad!',
  'gtk06-adda': 'Hajur! Straight up the stairs!',
  'gtk06-upar2': 'Hajur! One taxi’s in, go!',
  'gtk06-chhatein': 'Hajur! Just walk, roofs are flat!',
  'gtk07-chiya': 'Hajur! No tea, just run!',
  'gtk07-jaldi': 'Hajur! Stop and look, Dad!',
  'gtk09-dophoto': 'Hajur! Off at the photo!',
  'gtk09-barf': 'Hajur! Ice is slippery, stay off!',
  'gtk10-peechha': 'Hajur! Run, the cloud is coming!',
  'gtk10-jhola': 'Hajur! Any bag will do!',
  'gtk10-antim': 'Hajur! Out the first door!',
  'gtk10-tar': 'Hajur! Jump across now!',
  'gtk10-chauri': 'Hajur! Off when it stops!',
  'gtk10-stool': 'Hajur! Straight on to the steamer!',
  'gtk10-jhadu': 'Hajur! Up on the benches, Dad!',
};
const withIntros = (acts: Act[]): Act[] =>
  acts.map((a) => {
    const line = INTRO[a.id];
    if (!line) return a;
    const en = line.replace(/^Hajur!/, 'Yes!').replace(/^Ke cha haal khabar\?/, 'What’s the news?');
    return { ...a, build: (w, c) => { a.build?.(w, c); onPass(w, px(c.x + 0.6), (w2) => tara(w2, `${line} | ${en}`, 2.2)); } };
  });
import { tourLevel, meta01 } from './s01';
import { room as room02, act2 as act02b, meta02 } from './s02';
import { room as room03, act as act03, act2 as act03b, act4 as act03d, act5 as act03e, meta03 } from './s03';
import { room as room04, act as act04, act2 as act04b, act3 as act04c, meta04 } from './s04';
import { room as room05, act1 as act05a, act2 as act05b, act3 as act05c, act5 as act05e, act6 as act05f, act7 as act05g, meta05 } from './s05';
import { room as room06, act as act06, act2 as act06b, act3 as act06c, act4 as act06d, act6 as act06f, act9 as act06i, meta06 } from './s06';
import { room as room07, act1 as act07a, act2 as act07b, act3 as act07c, act7 as act07g, act10 as act07j, act12 as act07l, act13 as act07m, act14 as act07n, act15 as act07o, act16 as act07p, meta07 } from './s07';
import { room as room08, act as act08, act6 as act08f, meta08 } from './s08';
import { room as room09, act as act09, act2 as act09b, act3 as act09c, act4 as act09d, meta09 } from './s09';
import { room as room10, act1 as act10a, act2 as act10b, act3 as act10c, act4 as act10d, act5 as act10e, act7 as act10g, act8 as act10h, act9 as act10i, act10 as act10j, act11 as act10k, act12 as act10l, meta10 } from './s10';

export const levels = (): LevelDef[] => [
  { ...tourLevel(), meta: meta01 },
  longStage({ base: room02(), acts: withIntros([{ ...act02b, cps: [20] }]), cps: [16.5], twist: 'gtk-steam-vent', par: 47, shape: 'long', meta: meta02 }),
  longStage({ base: room03(), acts: withIntros([act03, act03b, act03e, act03d]), twist: 'gtk-jhola-entry', par: 35, shape: 'long', meta: meta03 }),
  longStage({ base: room04(), acts: withIntros([act04, act04b, act04c]), twist: 'gtk-lift-counts-down', par: 34, shape: 'long', meta: meta04 }),
  longStage({ base: room05(), acts: withIntros([act05a, { ...act05b, cps: [1.5, 19.5] }, { ...act05e, cps: [16.5] }, act05c, act05f, act05g]), twist: 'gtk-taxi-meter', par: 74, shape: 'wtf', meta: meta05 }),
  longStage({ base: room06(), acts: withIntros([act06, act06b, { ...act06c, cps: [22, 33] }, act06d, act06f, act06i]), twist: 'gtk-tank-overflow', par: 53, shape: 'long', meta: meta06 }),
  longStage({ base: room07(), acts: withIntros([act07a, act07b, act07c, act07m, act07g, act07n, act07p, act07o, { ...act07j, cps: [30] }, act07l]), twist: 'gtk-rope-climbs-to-door', par: 99, shape: 'marathon', lives: 'act', meta: meta07 }),
  longStage({ base: room08(), acts: withIntros([act08f, act08]), twist: 'gtk-cabin-both-doors', par: 71, shape: 'wtf', meta: meta08 }),
  longStage({ base: room09(), cps: [26.5], acts: withIntros([act09, { ...act09c, cps: [23.5] }, { ...act09d, cps: [19.5] }, act09b]), twist: 'gtk-gate-yak-snowbank', par: 94, shape: 'long', meta: meta09 }),
  longStage({ base: room10(), acts: withIntros([act10a, act10b, act10c, act10d, act10e, act10g, act10j, { ...act10h, cps: [31] }, { ...act10i, cps: [21.5] }, { ...act10k, cps: [26] }, act10l]), twist: 'gtk-viewpoint-second-floor', par: 123, shape: 'marathon', lives: 'act', meta: meta10 }),
];
