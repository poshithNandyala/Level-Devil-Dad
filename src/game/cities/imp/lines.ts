import type { CityLines } from '../../cities';

// Every line is "Meitei (or Meitei + Hindi/English) | English", max 8 words a side. Marked V in docs/cities/IMP.md
// (checked in the Wikivoyage Meitei phrasebook) unless noted U (unverified; the bible's fallback is used).
export const lines: CityLines = {
  hello: 'Khurumjari, Dad! Welcome to Imphal. | Greetings, Dad! Welcome to Imphal.',
  famous: 'A lake that floats, the oldest polo ground and a market run by mothers.',
  lang: 'Meitei with Hindi and English mixed in freely',
  // one per stage 02-10 (9)
  intro: [
    'Kamdoubiri, Dad? Phare? | How are you, Dad? Fine?',
    'Houjik chatle, Dad. Chalo! | Let’s go now, Dad. Come on!',
    'Khurumjari! Ngasi weather phare. | Greetings! Today’s weather is fine.',
    'Ngasi phare, Dad. | Today is fine, Dad.',
    'Hayeng ahum, ngasi ama. | Tomorrow three, today one.',
    'Yaare, yaare! Choomna chatle! | OK, OK! Go straight!',
    'Chaak, cha, Dad! | Rice, tea, Dad!',
    'Natte, natte! Ngaikho! Hoi, chat! | No, no! Stop! Yes, go!',
    'Taret ama. Last one. | Seven. The last one.',
  ],
  taunt: ['Yaare, yaare! Choomna chatle! | OK, OK! Go straight!', 'Ngasi phare, Dad. | Today is fine, Dad.', 'Houjik natte, Dad. | Not now, Dad.'],
  beaten: ['Ei soikhre, Dad. You won. | I’m sorry, Dad. You won.', 'Natte! Nang phare! | No! You are fine!'],
  death: ['Yengngo! Too late, Dad. | Look out! Too late, Dad.', 'Natte, natte, again, Dad. | No, no, again, Dad.', 'Ei soikhre, Dad. Try again. | I’m sorry, Dad. Try again.'],
  near: ['Yengngo! Door is there! | Look! The door is there!', 'Houjik, Dad! | Now, Dad!'],
  win: ['Thagatchari, Dad! | Thank you, Dad!', 'Yaam noongngaire, Dad! | I’m very happy, Dad!'],
  flip: 'Natte, oida leiyu! | No, turn left!',
  cleared: 'Noongngairase! Imphal cleared. | Cheers! Imphal cleared.',
  brag: 'Phare, phare, I told you. | Fine, fine, I told you.',
  idle: ['Dad, houjik chatle? | Dad, shall we go now?', 'Ngasi, hayeng, konna... slow. | Today, tomorrow, later... slow.'],
  seven: 'Taret! One more, Dad. | Seven! One more, Dad.',
  lastLife: 'Yengngo, Dad. Last one! | Look out, Dad. The last one!',
};

/** NPC flavour lines (V) used by the stages */
export const NPC = {
  market: 'Khurumjari, Dad! Ima keithel? | Greetings, Dad! The mothers’ market?',
  rice: 'Chak-hao, Dad. Yaam haowe! | Black rice, Dad. Delicious!',
  water: 'Ishing ama, Dad? | A glass of water, Dad?',
  expensive: 'Yaam taangmallee! Hongngei? | Too expensive! Cheap?',
  bye: 'Kainarasi, Dad! | Goodbye, Dad!',
  excuse: 'Ngaakpigani. Excuse me, Dad. | Excuse me. Excuse me, Dad.',
  seeYou: 'Chatle, Dad. See you again! | Bye, Dad. See you again!',
  dontGet: 'Ei khangdare, Dad. | I don’t understand, Dad.',
  thanks: 'Phare, thagatchari! | Fine, thank you!',
  /** numerals 1-3 (V) */
  one: 'Ama | One',
  two: 'Ani | Two',
  three: 'Ahum | Three',
};
