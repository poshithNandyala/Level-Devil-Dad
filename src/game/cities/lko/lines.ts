import type { CityLines } from '../../cities';

// Every spoken line is from the city bible's VERIFIED list (docs/cities/LKO.md section 4, kept in ldd-inbox):
// standard Lakhnavi Hindustani courtesy, "Local | English", at most 8 words a side.
export const lines: CityLines = {
  hello: 'Aadaab! | Respectful greetings!',
  famous: 'The city of tehzeeb, where even an argument starts with "aap": Nawabi gates, chikan, kebabs that melt, and "pehle aap" at every door.',
  lang: 'Lakhnavi Hindustani (Urdu-rich Hindi) + a little Awadhi + English',
  // one per stage 02-10 (Tara; she lies, so most of these urge the move the trap waits for)
  intro: [
    'Pehle aap, janab! | After you, sir!',
    'Tashreef laaiye, Dad! | Please do come, Dad!',
    'Intezaar kis baat ka? | Waiting for what?',
    'Munh mein ghul jaayega! | It’ll melt in your mouth!',
    'Shukriya, aage chaliye. | Thank you, go ahead.',
    'Tashreef rakh li, janab? | Taken a seat, sir?',
    'Har darwaza ek jaisa hai. | Every doorway is alike.',
    'Pehle aap? Accha, pehle aap. | After you? Fine, after you.',
    'Pehle aap, phir aap, phir aap! | After you, after you, after you!',
  ],
  taunt: ['Pehle aap, phir aap, phir aap! | After you, after you, after you!', 'Intezaar kis baat ka? | Waiting for what?', 'Tashreef rakh li, janab? | Taken a seat, sir?'],
  beaten: ['Wah janab, kya baat hai! | Wow sir, well done!', 'Kamaal kar diya! | You did wonders!'],
  death: ['Nahin nahin, pehle aap! | No no, after you!', 'Zehmat na kijiye. | Please don’t trouble yourself.', 'Pehle aap, phir aap, phir aap! | After you, after you, after you!'],
  near: ['Bas zara sa! | Just a little!', 'Itne kareeb, janab! | So close, sir!'],
  win: ['Wah! | Wow!', 'Kamaal kar diya! | You did wonders!', 'Shukriya, aage chaliye. | Thank you, go ahead.'],
  flip: 'Daayan-baayan ulat gaye! | Right and left flipped!',
  cleared: 'Lucknow cleared. Aadaab! | Lucknow cleared. Greetings!',
  brag: 'Wah janab, kya baat hai! | Wow sir, well done!',
  idle: ['Tashreef rakh li, janab? | Taken a seat, sir?', 'Intezaar kis baat ka? | Waiting for what?', 'Pehle aap? Accha, pehle aap. | After you? Fine, after you.'],
  seven: 'Saat baar! Thala for a reason. | Seven times! Back to the start.',
  lastLife: 'Aakhri mauka, janab! | Last chance, sir!',
};
