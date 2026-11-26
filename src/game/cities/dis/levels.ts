// Dispur (Guwahati, Assam): the gateway to the Northeast on the widest river you will ever see. Ten stages: the
// riverfront tour with a tea boy, the moving sandbars, the tea garden, the til pitha pan, the gamosa welcome,
// Majuli's retreating bank, the husori carollers, the rhino, the Rang Ghar pavilion and the Luit itself.
import { type LevelDef, type World } from '../../world';
import { lines as L } from './lines';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import type { Act } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { tour } from '../../levels/tour';
import { longStage } from '../../levels/chunks';
import { Grid } from '../../levels/grid';
import { lock, tara as taraSays } from '../../levels/endkit';
import type { Door } from '../../entities/basics';
import { Carrier, Decor, River, SandField, levelPost, river, sand, type Span } from './entities';

const tara = (n: number) => ({ intro: L.intro[n % L.intro.length], point: 1 as const, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
void px; void sign; void rival; void door; void collectible; void onPass; void taraSays; void longStage; void Decor; void tara; void L;

/** the placeholder rooms of the stages that are not built yet */
function todoRoom(n: number): LevelDef {
  return {
    id: `DIS-${String(n).padStart(2, '0')}`,
    city: 'DIS',
    index: n,
    name: `Stage ${n}`,
    nameEn: 'unbuilt',
    tagline: 'not built yet',
    hint: 'not built yet.',
    par: 30,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      rival(w, 3, 15, 1, tara(n - 2));
    },
  };
}

// ================================================================== DIS-01: Nomoskar Guwahati (the tour)
const ghat = { x0: 74, x1: 79 };
const tourLevel = () =>
  tour({
    id: 'DIS-01',
    city: 'DIS',
    name: 'Nomoskar Guwahati',
    nameEn: 'Hello, Guwahati',
    tagline: 'A walk on the Luit riverfront with the tea boy. Mind the tray.',
    lines: [
      'Adorani, Dad! Kenekua aase? | Welcome, Dad! How are you?',
      'Bohudin dekha nai! | Long time no see!',
      'Khuwar amez lowa! | Enjoy your meal!',
      'Lahe lahe kowa. | Speak slowly.',
      'Dhonyobad! | Thank you!',
      'Xubho zatra, Dad! | Good journey, Dad!',
    ],
    shouts: [
      [46, 'Iyar dam kiman? | How much is this?'],
      [66, 'Khyoma koribo. | Excuse me.'],
    ],
    ride: 'cart',
    item: 'dis-chah',
    signs: [
      [8, 'LUIT RIVERFRONT', 'the Brahmaputra'],
      [34, 'UMANANDA', '10 min by ferry'],
      [64, 'LAL CHAH', 'black tea, hot'],
      [100, 'FANCY BAZAR', 'this way'],
    ],
    props: [
      ['lamp', 4, {}],
      ['lamp', 30, {}],
      ['crowd', 44, { n: 2 }],
      ['lamp', 62, {}],
      ['lamp', 104, {}],
    ],
    things: [],
    par: 34,
    hint: 'A boy walks the promenade with a tray of hot lal chah, and the tray swings on his arm. Touch him, or hop clean over him (the tray tips and the tea spreads over where you land), and you are scalded. There is a ghat, a step down to the river, in the middle of the promenade: climb down into it and let him walk over your head. Climb out only once he is a few steps past.',
    cps: [27.5, 50.5, 58.5],
    paint: (g) => {
      g.pit(ghat.x0, ghat.x1, 15);
      g.fill(ghat.x0, ghat.x1, 17, 17, '#');
    },
    extra: (w) => {
      w.add(new Carrier(px(92), px(60), px(62)));
      w.add(
        new Decor((ctx) => {
          // the ghat: stone steps down to the water
          ctx.fillStyle = '#8D7B68';
          ctx.fillRect(px(ghat.x0), px(16), px(ghat.x1 - ghat.x0 + 1), 16);
          ctx.fillStyle = 'rgba(70,110,120,0.55)';
          ctx.fillRect(px(ghat.x0), px(16) + 8, px(ghat.x1 - ghat.x0 + 1), 8);
          ctx.fillStyle = '#6A5846';
          for (let i = 0; i < 3; i++) ctx.fillRect(px(ghat.x0) + i * 6, px(15) + i * 8, 6, 8);
        }, -3),
      );
      sign(w, 71.2, 10.6, 3.4, 'GHAT', 'green', null, 'river side');
      onPass(w, px(58), (w2) => w2.guide('Lahe lahe, Dad? | Slowly slowly, Dad?', (w3) => w3.info.deaths > 0));
    },
  });

// ================================================================== DIS-02: Char (the sandbars)
const S2 = {
  // B sinks, C comes up, then C narrows when D comes up
  room: [
    [[10, 14], null, null],
    [null, [16, 20], [16, 18]],
    [null, null, [21, 25]],
  ] as Span[][],
};

function charRoom(): LevelDef {
  return {
    id: 'DIS-02',
    city: 'DIS',
    index: 2,
    name: 'Char',
    nameEn: 'The sandbar',
    tagline: 'The Luit keeps moving its islands. The post on the bank knows where they are today.',
    hint: 'The sandbars are not where they were: every time the siren goes, the water level on the post goes up a mark, and the bars move. Stand on a bar when you hear it and wait: the next bar comes up first (a white dashed outline shows where), and only later does yours go. A bar that stays but narrows keeps its left end: don’t be on its right when it does.',
    par: 22,
    map: Grid.ground(15).pit(8, 27).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      river(w, 8, 28);
      const f = sand(w, S2.room, [px(10) - 4, px(16) - 4]);
      levelPost(w, f, 3.2, 3);
      sign(w, 4.6, 10.4, 3.4, 'CHAR', 'shop', null, 'the island moves');
      rival(w, 5, 15, 1, tara(0));
      onPass(w, px(6), (w2) => w2.guide('Lahe lahe, Dad? | Slowly slowly, Dad?', (w3) => w3.info.deaths > 0 && w3.player.cx < px(10)));
      collectible(w, 'dis-japi', 20.4, 11);
    },
  };
}

/** DIS-02 act: three marks, a hut that never moves. The big bar narrows at the second mark; the hut stays. */
const chapori: Act = {
  id: 'dis02-chapori',
  w: 40,
  advice: 'A hut on a bar in the middle of the river: the farmer’s bar never moves, whatever the post says. The big bar before it narrows when you land on it (its left end stays), so don’t wait there: go on to the hut. Stop on the hut. The last bar comes up only when you have landed on the hut.',
  cps: [18.5],
  paint: (g, c) => {
    g.pit(c.x + 2, c.x + 35);
  },
  build: (w, c) => {
    const x = c.x;
    w.add(new River(px(x + 2), px(x + 36)));
    const f = sand(
      w,
      [
        [[x + 3, x + 8], null, null],
        [[x + 11, x + 17], [x + 11, x + 13], null],
        [[x + 20, x + 26], [x + 20, x + 26], [x + 20, x + 26]],
        [null, null, [x + 29, x + 34]],
      ],
      [px(x + 11) - 4, px(x + 20) - 4],
      [2],
    );
    levelPost(w, f, x + 0.6, 3);
    sign(w, x + 14.5, 10.4, 3.4, 'MISING HUT', 'shop', null, 'never moves');
  },
};

// the hut door: the farmer shuts it while the river is moving
const hutDoor = (w: World, d: Door, field: SandField) => {
  const L = lock(w, d, 'Roba! Chah khaba. | Wait! Have some tea.');
  const f = field;
  w.onTick((w2) => {
    if (f.e < 0 && f.level >= 1) L.unlock();
  });
  return L;
};
void hutDoor;

export const levels = (): LevelDef[] => [
  { ...tourLevel(), shape: 'tour', meta: { family: 'carrier-spills-on-contact', betrayals: ['carrier-spill'], ending: 'dis-tea-tray' } },
  longStage({ base: charRoom(), acts: [chapori], twist: 'dis-hut-shut', par: 46, shape: 'short', meta: { family: 'sandbars-relocate-by-level-post', betrayals: ['level-post-relocate'], ending: 'dis-hut-shut' } }),
  longStage({ base: todoRoom(3), par: 30, shape: 'long' }), // DIS-03 TODO: acts, twist (a dis-... ending), par
  longStage({ base: todoRoom(4), par: 30, shape: 'long' }), // DIS-04 TODO: acts, twist (a dis-... ending), par
  longStage({ base: todoRoom(5), par: 30, shape: 'long' }), // DIS-05 TODO: acts, twist (a dis-... ending), par
  longStage({ base: todoRoom(6), par: 30, shape: 'long' }), // DIS-06 TODO: acts, twist (a dis-... ending), par
  longStage({ base: todoRoom(7), par: 30, shape: 'long' }), // DIS-07 TODO: acts, twist (a dis-... ending), par
  longStage({ base: todoRoom(8), par: 30, shape: 'long' }), // DIS-08 TODO: acts, twist (a dis-... ending), par
  longStage({ base: todoRoom(9), par: 30, shape: 'long' }), // DIS-09 TODO: acts, twist (a dis-... ending), par
  longStage({ base: todoRoom(10), par: 30, shape: 'long' }), // DIS-10 TODO: acts, twist (a dis-... ending), par
];
