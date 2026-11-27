import type { CityLines } from '../../cities';

/**
 * Everything Shillong says ("Local | English"). Shillong speech mixes Khasi words into English frames, and
 * every Khasi word here is one the city bible (docs/cities/SHL.md section 4) lists as verified (V); the one U
 * line of the bible (15, "Ayyo") is replaced by its own fallback. The seventh-death line is new, built only
 * from V words (em, wan).
 */
export const lines: CityLines = {
  hello: 'Kumno, Bah! Welcome to Shillong. | How are you, sir? Welcome to Shillong.',
  famous: 'Pine hills at 1,500 m where the rain is a daily guest: living root bridges, Mawsmai caves, the Dawki span, Ïewduh market and the knup.',
  lang: 'Khasi + English (+ a little Hindi)',
  // stages 02..10, in order (taraScript(n) reads intro[n - 2])
  intro: [
    'Kumno phi long, Dad? | How are you, Dad?',
    'Hooid, hooid, this way is safe! | Yes, yes, this way is safe!',
    'Peit, rain! Put on the knup. | Look, rain! Put on the knup.',
    'Em, em, don’t wait, just go! | No, no, don’t wait, just go!',
    'Tang one jump, Bah. Tang one. | Only one jump, sir. Only one.',
    'Kumno! Ready for the hills? | Hello! Ready for the hills?',
    'Sngewbha, Dad, mind the rain. | Excuse me, Dad, mind the rain.',
    'Hooid Bah, the market is open. | Yes sir, the market is open.',
    'Mo Dad, one last stage. | Okay Dad, one last stage.',
  ],
  taunt: ['Hooid, hooid, this way is safe! | Yes, yes, this way is safe!', 'Ka don ha jan! Very near! | It’s near! Very near!', 'Nga biang here. You come! | I’m fine here. You come!', 'Tang one jump, Bah. Tang one. | Only one jump, sir. Only one.'],
  beaten: ['Em! Kumno did you do that? | No! How did you do that?', 'Map ïa nga, Dad. You won. | Sorry, Dad. You won.'],
  death: ['Wet again. Nga la thait. | Wet again. I’m tired.', 'Em, em! Try again, Bah. | No, no! Try again, sir.', 'Sngewsih, Dad. Wan again. | Sad, Dad. Come again.', 'Nga sngewsih, Dad. Try again. | I’m sad, Dad. Try again.'],
  near: ['Ka don ha jan, Dad. Peit! | It’s near, Dad. Look!', 'Tang a little more, Bah. | Only a little more, sir.'],
  win: ['Khublei shibun, Dad! You did it. | Thank you so much, Dad! You did it.', 'Kmen! Kmen! Door is open. | Happy! Happy! The door is open.'],
  flip: 'Em, not that way, Dad! | No, not that way, Dad!',
  cleared: 'Hooid! Shillong cleared, Bah. | Yes! Shillong cleared, sir.',
  brag: 'Nga biang, nga biang, I know. | I’m fine, I’m fine, I know.',
  idle: ['Wan, Dad. Don’t just stand. | Come, Dad. Don’t just stand.', 'Peit the sky, Bah. Rain coming. | Look at the sky, sir. Rain coming.', 'Nga la thait, Dad. Hurry. | I’m tired, Dad. Hurry.'],
  seven: 'Em, em! Seven falls. Wan again. | No, no! Seven falls. Come again.',
  lastLife: 'Ym fall now, Dad. | Don’t fall now, Dad.',
};

/** the locals' honest lines (npc voice), all V in the bible */
export const npc = {
  fare: 'Ka bai kali kan long katno? | How much is the taxi fare?',
  road: 'Bud ïa kane ka surok, Bah. | Follow this road, sir.',
  near: 'Hooid, ka don ha jan. | Yes, it is near.',
  hour: 'Tang shi kynta, Dad. | Only one hour, Dad.',
  sit: 'Nga la thait. Wan, sit down. | I’m tired. Come, sit down.',
  thanks: 'Khublei shibun, Kong! | Thank you very much, ma’am!',
  knup: 'Peit, rain! Put on the knup. | Look, rain! Put on the knup.',
  welcome: 'Ym lei lei, Bah. | You’re welcome, sir.',
  food: 'Ja, jadoh, and tea! | Rice, jadoh and tea!',
  how: 'Kumno phi long, Bah? | How are you, sir?',
};
