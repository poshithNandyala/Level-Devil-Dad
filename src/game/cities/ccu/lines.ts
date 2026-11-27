import type { CityLines } from '../../cities';

// Every line is from the CCU bible's verified list (docs/cities/CCU.md, section 4, marked VERIFIED), or that
// line with "Dad" added. Bengali as Kolkatans type it, then the English.
export const lines: CityLines = {
  hello: 'Nomoshkar! | Hello!',
  famous: 'The City of Joy on the Hooghly: trams that still crawl, Howrah Bridge, College Street’s books, adda over tea, and mishti doi in a clay bhanr.',
  lang: 'Bengali + Kolkata Hindi + English',
  // one per stage 02-10
  intro: [
    'Ki khobor, Dad? | What’s up, Dad?',
    'Aaste, Dad, aaste! | Slowly, Dad, slowly!',
    'Ei je, shunun! | Excuse me, listen!',
    'Ei jinishtar dam koto? | How much is this?',
    'Maf korben, Dad! | Pardon me, Dad!',
    'Howrah, Howrah, Howrah! | Howrah, Howrah, Howrah!',
    'Ashi, Dad? | May I leave, Dad?',
    'Bhalo theko, Dad! | Stay well, Dad!',
    'Jatra shubho hok, Dad! | Have a good journey, Dad!',
  ],
  taunt: ['Ki holo, Dad? | What happened, Dad?', 'Abar? | Again?', 'Bujhte parle na? | You didn’t get it?'],
  beaten: ['Darun, Dad! | Brilliant, Dad!', 'Khub bhalo! | Very good!'],
  death: ['Bãchao! | Help!', 'Thamun! | Stop!', 'Ki holo? | What happened?'],
  near: ['Khub bhalo! | Very good!', 'Darun! | Brilliant!'],
  win: ['Darun! | Brilliant!', 'Khub bhalo! | Very good!', 'Bhalo theko! | Stay well!'],
  flip: 'Ki holo? | What happened?',
  cleared: 'Kolkata cleared. Darun! | Kolkata cleared. Brilliant!',
  brag: 'Darun! | Brilliant!',
  idle: ['Ki khobor? | What’s up?', 'Ei je, shunun! | Excuse me, listen!'],
  seven: 'Saat baar! Thala for a reason. | Seven times! Back to the start.',
  lastLife: 'Thamun, Dad! | Stop, Dad!',
};
