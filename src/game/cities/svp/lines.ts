import type { CityLines } from '../../cities';

/**
 * Everything Sri Vijaya Puram says ("Local | English"). The islands' link language is a plain Hindi mixed with
 * Bengali, Tamil, Telugu and Malayalam. Lines are the bible's VERIFIED ones (docs/cities/SVP.md section 4) wherever
 * one fits; the rest are plain standard Hindi, listed in docs/cities/SVP-BUILD notes for a native check.
 */
export const lines: CityLines = {
  hello: 'Namaste! | Hello!',
  famous: 'The island capital: ships that are late, deer on Ross Island, red padauk from the saw mill and rain from two directions.',
  lang: 'Andaman Hindi (with Bengali, Tamil, Telugu, Malayalam) + English',
  // one per stage 02-10
  intro: [
    'Pehle aage tak chalo, Dad! | Walk to the far end first, Dad!',
    'Paani se door raho, Dad! | Keep away from the water, Dad!',
    'Khana pakdo, Dad! Hiran dost hain! | Take the food, Dad! Deer are friends!',
    'Bench se door raho, Dad! | Keep away from the bench, Dad!',
    'Abhi chadho, tote nahin hain! | Climb now, no parrots yet!',
    'Ship late hai, Dad. Aaram se! | Ship’s late, Dad. Relax!',
    'Awning ke neeche raho, Dad! | Stay under the awning, Dad!',
    'Deewar par chalo, Dad! | Walk on the walls, Dad!',
    'Khana lekar mill se jao, Dad! | Take the food through the mill, Dad!',
  ],
  taunt: ['Arre, dekha nahin? | Oh, didn’t you see?', 'Ek aur baar, Dad? | One more time, Dad?', 'Jungle ek, Dad zero! | Jungle one, Dad zero!', 'Kinara aa gaya tha! | You’d reached the shore!'],
  beaten: ['Bahut badhiya, Dad! | Very good, Dad!', 'Shabaash! | Well done!'],
  death: ['Kichad mein gaye! | Into the mud!', 'Magarmachh! Bhaago! | Crocodile! Run!', 'Baarish ne dhoka diya! | The rain tricked you!', 'Arre, dekha nahin? | Oh, didn’t you see?', 'Ek aur baar, Dad? | One more time, Dad?'],
  near: ['Bas thoda sa! | Just a little!', 'Kinara aa gaya tha! | You’d reached the shore!'],
  win: ['Shabaash! | Well done!', 'Bahut sahi, Dad! | Very nice, Dad!', 'Agla ship pakdo! | Catch the next ship!'],
  flip: 'Ulta ho gaya sab! | Everything flipped!',
  cleared: 'Sri Vijaya Puram cleared. Shabaash! | Sri Vijaya Puram cleared. Well done!',
  brag: 'Shabaash! | Well done!',
  idle: ['Ship ka intezaar, Dad? | Waiting for the ship, Dad?', 'Kya dekh rahe ho? | What are you looking at?', 'Ship ka intezaar, Dad? | Waiting for the ship, Dad?'],
  seven: 'Saat baar! Ship nikal gaya! | Seven times! The ship has left!',
  lastLife: 'Aakhri chance, dhyan se! | Last chance, carefully!',
};

/** the rest of what the stages say: the bible's VERIFIED lines for locals and the guide */
export const X = {
  deer: 'Hiran ko khana mat do! | Don’t feed the deer!',
  queue: 'Line mein raho! | Stay in the line!',
  tour: 'Pehle Ross, phir North Bay. | First Ross, then North Bay.',
  near: 'Bas thoda sa! | Just a little!',
  shabash: 'Shabaash! | Well done!',
  ship: 'Ship ka intezaar, Dad? | Waiting for the ship, Dad?',
  welcome: 'Namaste, Dad! Island mein swagat! | Hello, Dad! Welcome to the island!',
  mud: 'Kichad mein gaye! | Into the mud!',
  croc: 'Magarmachh! Bhaago! | Crocodile! Run!',
  rain: 'Baarish ne dhoka diya! | The rain tricked you!',
  last: 'Aakhri chance, dhyan se! | Last chance, carefully!',
  nextShip: 'Agla ship pakdo! | Catch the next ship!',
  nice: 'Bahut sahi, Dad! | Very nice, Dad!',
  oops: 'Arre, dekha nahin? | Oh, didn’t you see?',
};
