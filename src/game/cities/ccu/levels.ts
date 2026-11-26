// Kolkata: trams that still crawl, buses that never stop, College Street's books by the kilo, Howrah
// Bridge's porters, adda on the rok, the pandal's bamboo skeleton. 01 the welcome tour, 02-10 long stages
// (room + act + door ending), harder each time, 10 the finale. Slots: docs/allocation.json (CCU).
import { type LevelDef, type StageMeta, type World } from '../../world';
import { lines as L } from './lines';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { tour } from '../../levels/tour';
import { longStage } from '../../levels/chunks';
import { Grid } from '../../levels/grid';
import { pool } from '../../levels/acts';
import { Bus, Rail, feet } from './entities';
import { NALA } from './endings';
import { Customer, Muck, Stack, Stall } from './books';

const tara = (n: number, beaten = 0) => ({ intro: L.intro[n % L.intro.length], point: 1 as const, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[beaten % L.beaten.length] });
/** the allocation slot, plus the door ending's idea key (the uniqueness test reads `ending`) */
const meta = (family: string, betrayals: string[], ending: string): StageMeta => ({ family, betrayals, ending }) as StageMeta;

/** placeholder room for a stage still to build */
function todoRoom(n: number): LevelDef {
  return {
    id: `CCU-${String(n).padStart(2, '0')}`,
    city: 'CCU',
    index: n,
    name: `Stage ${n}`,
    nameEn: 'Stage',
    tagline: 'Stage.',
    hint: 'Walk.',
    par: 30,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      rival(w, 3, 15, 1, tara(n - 2));
      collectible(w, 'ccu-doi', 16, 12);
    },
  };
}

// ================================================================== CCU-02: Aaste! (the bus)
function aasteRoom(): LevelDef {
  return {
    id: 'CCU-02',
    city: 'CCU',
    index: 2,
    name: 'Aaste!',
    nameEn: 'Slowly!',
    tagline: 'A Kolkata private bus never really stops. The conductor slaps the side and shouts “aaste!”, it crawls for a moment, and you step off.',
    hint: 'The bus never stops, not even at the stop: step off at speed and you go flying. It only crawls when the conductor shouts “aaste!”, and then you walk off forwards, the way it’s going (backwards and you go over). The first “aaste” is for someone on the far side of the open drain: wait for the second one, over the pavement.',
    par: 10,
    map: Grid.ground(15).pit(17, 22).put(3, 13, '@').rows(),
    build(w: World) {
      w.add(new Bus({ x: px(3) - 2, go: (w2) => w2.tick > 90, slow: [[px(16), px(19.5)], [px(25), px(28.5)]], end: px(36), label: 'HOWRAH' }));
      pool(w, 17, 23, 16, { colors: NALA, cause: 'ccu-nala' });
      sign(w, 9, 10.4, 3.4, 'BUS STOP', 'green', null, 'Esplanade');
      rival(w, 10, 15, -1, tara(0));
      onPass(w, px(6), (w2) => w2.guide('Aaste, Dad, aaste! | Slowly, Dad, slowly!', (w3) => w3.player.cx < px(16)));
      collectible(w, 'ccu-jhalmuri', 20, 11.6);
    },
  };
}


// ================================================================== CCU-04: Boi Para (College Street)
/** a drain of muck between the stalls from column c0 to c1, with Dad's death told by how he got in */
export function boiDrain(w: World, c0: number, c1: number) {
  w.add(new Muck(px(c0), px(c1), (w2) => (w2.flags.yanked ? 'ccu-boi' : 'ccu-kada')));
}
function boiRoom(): LevelDef {
  return {
    id: 'CCU-04',
    city: 'CCU',
    index: 4,
    name: 'Boi Para',
    nameEn: 'Book Street',
    tagline: 'College Street: second-hand books by the bundle, stacked over the drain, and a seller who can find any title from the bottom of any pile.',
    hint: 'Watch the customers. When one points at a book, the seller pulls that book out: the stack drops by one, and so do you if you’re on it (and if you land on a pointed stack he pulls it at once). A stack of one goes from under you into the drain. Count the books under the finger: jump over a pointed one-book stack, but a pointed stack of two only drops to one and still holds you, so go on to it rather than wait where you are.',
    par: 12,
    map: Grid.ground(15).pit(6, 27).put(2, 14, '@').rows(),
    build(w: World) {
      w.add(new Stall(px(6), px(28), 'BOI PARA'));
      boiDrain(w, 6, 28);
      const s = [
        [7, 2, 2],
        [10, 1, 1],
        [12, 2, 1],
        [16, 2, 2],
        [20, 2, 1],
        [24, 2, 2],
      ].map(([c, wd, n]) => w.add(new Stack(px(c), px(wd), n)));
      const a = w.add(new Customer(px(10) + 8, '#7B8D6E'));
      const b = w.add(new Customer(px(17), '#A0522D'));
      w.flags.stacks = s;
      onPass(w, px(4), (w2) => a.ask(w2, s[1], 1, 4));
      // on the third stack: the next one is asked for, and a moment later, the one you're standing on
      w.when(
        (w2) => w2.player.onGround && w2.player.isRiding(s[2].solid),
        (w2) => {
          b.ask(w2, s[3], 2, 3);
          w2.after(0.9, () => a.ask(w2, s[2], 1, 1.0));
        },
      );
      sign(w, 1.2, 10.4, 3.6, 'COLLEGE ST', 'green', null, 'boi para');
      rival(w, 3, 15, 1, tara(2));
      onPass(w, px(3.5), (w2) => w2.guide('Ei je, shunun! | Excuse me, listen!', (w3) => w3.player.cx < px(7)));
      collectible(w, 'ccu-roll', 22, 11.8);
    },
  };
}

/** built on demand: tour() and longStage() read this city's course, skin and endings, which the registry installs first */
export const levels = (): LevelDef[] => [
  {
    ...tour({
      id: 'CCU-01',
      city: 'CCU',
      name: 'Nomoshkar Kolkata',
      nameEn: 'Hello, Kolkata',
      tagline: 'The City of Joy: the Maidan, a tram stop, and the oldest trams in Asia, still crawling down the middle of the road.',
      lines: [
        'Nomoshkar, Dad! | Hello, Dad!',
        'Ki khobor, Dad? | What’s up, Dad?',
        'Howrah, Howrah, Howrah! | Howrah, Howrah, Howrah!',
        'Ei je, shunun! | Excuse me, listen!',
        'Ei jinishtar dam koto? | How much is this?',
        'Jatra shubho hok, Dad! | Have a good journey, Dad!',
      ],
      shouts: [[34, 'Bhalo theko! | Stay well!']],
      ride: 'ccu-thela',
      item: 'ccu-doi',
      signs: [
        [8, 'MAIDAN', 'morning walk'],
        [53, 'TRAM STOP', 'route 25'],
        [101, 'ESPLANADE', 'terminus'],
      ],
      props: [
        ['lamp', 4, {}],
        ['stall', 20, { label: 'CHA' }],
        ['crowd', 36, { n: 3 }],
        ['lamp', 57, {}],
        ['crowd', 78, { n: 2 }],
        ['lamp', 106, {}],
      ],
      things: [],
      hint: 'A walk round town: jump the kerb ditch, climb the Maidan steps, hop the tram-stop posts and the parked thela. Past the thela there’s a tram rail in the road. Jump on to it and your foot drops into the groove: the rail steers you along its line, no turning, no jumping, straight into the rail-works trench. Walk on to the rail instead (up on the thela, and walk off it), then jump the trench. At Esplanade, ride the little tram across.',
      paint: (g) => {
        g.pit(70, 71);
      },
      extra: (w) => {
        feet(w);
        w.add(new Rail(px(62), px(70), px(72)));
        onPass(w, px(56), (w2) => w2.guide('Tram! Ei je, shunun! | The tram line! Excuse me, listen!'));
      },
      cps: [16.5, 42, 57, 75, 97],
    }),
    meta: meta('rail-groove-sticks-foot', ['groove-catch'], 'ccu-esplanade-tram-shuttle'),
  },
  longStage({ base: aasteRoom(), par: 30, twist: 'ccu-stop', shape: 'short', meta: meta('exit-moving-vehicle-on-shout', ['exit-facing-forward'], 'ccu-bus-crawls-for-whoever-waits') }),
  longStage({ base: todoRoom(3), par: 30, shape: 'long' }),
  longStage({ base: boiRoom(), par: 26, twist: 'ccu-set', shape: 'short', meta: meta('stack-pulled-from-bottom', ['stack-drops-one-height'], 'ccu-customer-buys-the-whole-set') }),
  longStage({ base: todoRoom(5), par: 30, shape: 'long' }),
  longStage({ base: todoRoom(6), par: 30, shape: 'long' }),
  longStage({ base: todoRoom(7), par: 30, shape: 'long' }),
  longStage({ base: todoRoom(8), par: 30, shape: 'long' }),
  longStage({ base: todoRoom(9), par: 30, shape: 'long' }),
  longStage({ base: todoRoom(10), par: 30, shape: 'long' }),
];
