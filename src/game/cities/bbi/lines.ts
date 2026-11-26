import type { CityLines } from '../../cities';

// Everything Bhubaneswar says, "Local | English". Only lines the city bible (ldd-inbox docs/cities/BBI.md,
// section 4) marks VERIFIED against Omniglot's Odia phrases, or plain English.
export const lines: CityLines = {
  hello: 'Namaskara! | Hello!',
  famous: 'The temple city with wide new roads: dahibara on every corner, hockey turf, appliqué parasols and stone wheels.',
  lang: 'Odia + English, a little Hindi',
  // one per stage 02-10 (9): Tara's welcome at each stage
  intro: [
    'Kemiti achanti, Dad? | How are you, Dad?',
    'Chala bajar jiba! | Let’s go to the market!',
    'Ethare garam hue! | It’s hot here!',
    'Dukhi huantu nahin! | Don’t be sad!',
    'Chala ame mishiki khaiba! | Let’s eat together!',
    'Mote bhulibe nahin! | Don’t forget me!',
    'Sabu subha hau! | All the best!',
    'Eita kete tanka? | How much is this?',
    'Subha jatra, Dad! | Good journey, Dad!',
  ],
  taunt: ['Mu jani nahi! | I don’t know!', 'Pheri? Au thare? | Again? One more time?', 'Hockey one, Dad zero!', 'Dad bujhi paru nahi! | Dad doesn’t get it!'],
  beaten: ['Khusi ruha, Dad! | Stay happy, Dad!', 'Bahut bhala! | Very good!'],
  death: ['Niaan! | Fire!', 'Rakhya kara! | Help!', 'Pheri? Au thare? | Again? One more time?', 'Paati karantu nahin! | Don’t shout!'],
  near: ['Bahut bhala! | Very good!', 'Sabu subha hau! | All the best!'],
  win: ['Bahut bhala! | Very good!', 'Sabu subha hau! | All the best!', 'Dhanyabad! | Thank you!'],
  flip: 'Mu jani nahi! | I don’t know!',
  cleared: 'Bhubaneswar cleared. Bahut bhala! | Bhubaneswar cleared. Very good!',
  brag: 'Bhala! | Good!',
  idle: ['Dukhi huantu nahin! | Don’t be sad!', 'Tikie aaste kuhantu. | Speak a bit slower.', 'Rageantu nahin! | Don’t be angry!'],
  seven: 'Dukhi huantu nahin! Au thare! | Don’t be sad! One more time!',
  lastLife: 'Daya kari authare! | Please, once again!',
};
