import type { CityLines } from '../../cities';

/**
 * Everything Kohima says ("Local | English", Nagamese + English). Every line is one the city bible
 * (docs/cities/KOH.md section 4) lists; lines the bible marks U (unverified) are used in their fallback form
 * (English frame + the V words only), so nothing here needs a native check to ship.
 * Marks: (V) verified in two sources, (U->fallback) the bible's fallback for an unverified line.
 */
export const lines: CityLines = {
  hello: 'Bhal ase, Dad? Welcome Kohima! | Are you fine, Dad? Welcome to Kohima!', // V
  famous: 'Kewhi-ra on the ridges: steep lanes and stacked tin roofs, the log drum hauled by its crew, a wooden cart with no brake, the smell of axone, Dzükou’s cold meadow and the Hornbill ground at Kisama.',
  lang: 'Nagamese + English',
  // stages 02..10, in order (taraScript(n) reads intro[n - 2])
  intro: [
    'Kotha jabi, Dad? Moi loghat jabo. | Where are you going, Dad? I’ll go with you.', // V
    'Toi jabi, moi dekhi. | You go, I’ll watch.', // U -> kept short, V words (toi, jabi, moi)
    'Etu rasta bhal ase. | This road is fine.', // V
    'Dad, toi bhat khabi? | Dad, will you eat?', // V
    'Thik thak, Dad? Hill is steep. | Fine, Dad? The hill is steep.', // V
    'Nai, nai, jabi, jabi! | No, no, go, go!', // V
    'Galho khabi? Garom ase. | Will you eat galho? It’s hot.', // V galho, khabi
    'Moi loghat ahi, bhal ase. | Come with me, it’s fine.', // U -> fallback
    'Last stage, Dad! | Last stage, Dad!', // U -> fallback
  ],
  taunt: ['Etu rasta bhal ase! | This road is fine!', 'Nai, nai, jabi, jabi! | No, no, go, go!', 'Toi jabi, moi dekhi. | You go, I’ll watch.'], // V, V, U(V words)
  beaten: ['Ki! Toi jiti se? | What! You won?', 'Hoi, hoi. Toi bhal. | Yes, yes. You’re good.'], // V, V
  death: ['Nai nai, bhal nai! | No no, not good!', 'Bhal ase? Ahi bi, Dad. | Fine? Come again, Dad.', 'Dad, ahi bi. | Dad, come again.'], // V, V, U->fallback
  near: ['Ektu, Dad! | Just a bit, Dad!', 'Bhal, bhal, Dad! | Good, good, Dad!'], // U(V word ektu), V
  win: ['Bhal ase, Dad! Toi jiti se! | Good, Dad! You won!', 'Thik thak! Aage jabi. | Great! Go ahead.'], // V, V
  flip: 'Nai, etu rasta nai! | No, not this road!', // V
  cleared: 'Kohima cleared. Bhal ase, Dad! | Kohima cleared. Good, Dad!', // V
  brag: 'Bhal, bhal! | Good, good!', // V
  idle: ['Dad, bohi bi. Bhat khabi. | Dad, sit down. Eat.', 'Dad, rasta ase, jabi! | Dad, the road is there, go!'], // V, V
  seven: 'Seven done, one to go! | Seven done, one to go!', // U -> fallback
  lastLife: 'Ek chance ase, Dad. | One chance left, Dad.', // V
};

/** honest locals (npc voice) */
export const NPC = {
  kewhi: 'Moi naam Kewhi. Toi? | My name is Kewhi. And you?', // V pattern
  rasta: 'Etu rasta bhal nai, jabi. | This road isn’t good, go.', // V
  cold: 'Morning cold ase, Dad. | It’s cold in the morning, Dad.', // V pattern
  bhat: 'Hoi, hoi, bhat ase. | Yes, yes, there’s rice.', // V
  paisa: 'Poisa kiman, bhai? | How much money, brother?', // V
  loghat: 'Moi loghat ahi bo. | I’ll come with you.', // V
  thik: 'Thik thak, Dad? Bhal. | Fine, Dad? Good.', // V
};
