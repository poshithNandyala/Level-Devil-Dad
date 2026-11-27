import type { CityLines } from '../../cities';

/**
 * Everything Patna says ("Local | English"). Every Bhojpuri/Hindi line is one the city bible
 * (docs/cities/PAT.md section 4) marks VERIFIED, so Tara's lines are a small set used in the place they fit.
 */
export const lines: CityLines = {
  hello: 'Prannam, Patna! | Hello, Patna!',
  famous: 'Pataliputra on the Ganga: the round Golghar granary, the Gandhi Setu, litti in the embers, Madhubani walls and the Sonepur fair.',
  lang: 'Magahi + Bhojpuri + Hindi + English',
  // stages 02..10, in order (tara(n) reads intro[n - 2])
  intro: [
    'Litti garam ba, maze se khaa! | Litti’s hot, enjoy it!',
    'Eeh ketna ha? | How much is this?',
    'Chalo, aage! | Let’s go on!',
    'Safar badhiya rahe, Dad! | Have a good journey, Dad!',
    'Ruko! | Stop!',
    'Do litti, ek chokha! | Two litti, one chokha!',
    'Madad kara! | Help!',
    'Tani dubaara kaha. | Say that again.',
    'Aain naa, Dad! Ka haal ba? | Welcome, Dad! How’s it going?',
  ],
  taunt: ['Setu one, Dad zero!', 'Naikhe samajh mein aavat? | Not making sense?', 'Humke naikhe maaloom, Dad! | I don’t know, Dad!', 'Tani dubaara kaha. | Say that again.'],
  beaten: ['Sab badhiya ba, Dad jeet gaye. | All good, Dad won.', 'Badhiya! | Great!'],
  death: ['Naikhe samajh mein aavat? | Not making sense?', 'Humke naikhe maaloom, Dad! | I don’t know, Dad!', 'Setu one, Dad zero!'],
  near: ['Chalo, aage! | Let’s go on!', 'Badhiya! | Great!'],
  win: ['Badhiya! | Great!', 'Chalo, aage! | Let’s go on!'],
  flip: 'Ulta-pulta ho gaya! | It’s all topsy-turvy!',
  cleared: 'Patna cleared. Sab badhiya ba! | Patna cleared. All good!',
  brag: 'Badhiya! | Great!',
  idle: ['Neend aa rahi hai? | Feeling sleepy?', 'Aain naa, Dad! Ka haal ba? | Welcome, Dad! How’s it going?', 'Ruko! | Stop!'],
  seven: 'Saat baar! Wapas shuru! | Seven times! Back to the start.',
  lastLife: 'Madad kara! | Help!',
};
