import type { CityLines } from '../../cities';

/**
 * Everything Itanagar says ("Local | English"). Arunachali Hindi is the link language of the city, so every
 * line is one the city bible (docs/cities/ITA.md section 4) marks V (standard Hindi, verified). No Nyishi line
 * is shipped: the bible marks them all U.
 */
export const lines: CityLines = {
  hello: 'Namaste! Aao Itanagar, Dad. | Hello! Come to Itanagar, Dad.',
  famous: 'The dawn-lit hills: Ita Fort’s brick walls, cane bridges over the Siang, mithun in the meadows, rice and fish in one paddy, and the first sunrise in India.',
  lang: 'Arunachali Hindi + English',
  // stages 02..10, in order (taraScript(n) reads intro[n - 2])
  intro: [
    'Pul pakka hai, bhai. | The bridge is solid, brother.', // 02 the cane bridge
    'Mithun ko mat chhedo. | Don’t tease the mithun.', // 03 the meadow
    'Rukna mat, kood jao! | Don’t stop, jump!', // 04 the orange terraces
    'Seedha jao, koi dikkat nahi. | Go straight, no problem.', // 05 the fig canopy
    'Yahan paani zyada hai. | There is a lot of water here.', // 06 the paddies
    'Namaste, bhai. Pahaad chadho. | Hello, brother. Climb the hill.', // 07 Sela
    'Kuch nahi hoga, chalo. | Nothing will happen, go.', // 08 the raft
    'Ye raasta chhota hai. | This way is shorter.', // 09 the brick wall
    'Aakhri raasta, Dad. | The last road, Dad.', // 10 the dawn
  ],
  taunt: ['Maine pehle bola tha. | I told you before.', 'Mujhe sab pata hai. | I know everything.', 'Thoda dheere, bhai. | A bit slower, brother.'],
  beaten: ['Arre! Kaise kiya tumne? | Oh! How did you do that?', 'Theek hai, tum jeete. | Fine, you win.'],
  death: ['Gir gaye, Dad! Phir se. | You fell, Dad! Again.', 'Pahaad ne pakad liya. | The hill caught you.', 'Aaj ka din bura hai. | Today is a bad day.'],
  near: ['Bas thoda aur, Dad. | Just a little more, Dad.', 'Darwaza paas hai! | The door is near!'],
  win: ['Shabaash, Dad! Pahunch gaye. | Well done, Dad! You made it.', 'Ho gaya! Chalo aage. | Done! Let’s go on.'],
  flip: 'Ulta! Wapas jao. | Reverse! Go back.',
  cleared: 'Pahaad paar! Itanagar cleared. | Hill crossed! Itanagar cleared.',
  brag: 'Mujhe sab pata hai. | I know everything.',
  idle: ['Dada, sote ho kya? | Brother, are you asleep?', 'Suraj nikal raha hai. | The sun is coming up.', 'Chalo na, der ho rahi hai. | Come on, it’s getting late.'],
  seven: 'Saat ho gaye, ek aur. | Seven done, one more.',
  lastLife: 'Ek hi baar bachi hai. | Only one chance is left.',
};

/** honest locals (npc voice), bible lines 35-44 */
export const NPC = {
  ekEk: 'Pul par ek ek jao. | Cross the bridge one by one.',
  pikaPila: 'Pika pila khaoge? | Will you eat pika pila?',
  dhoop: 'Aaj dhoop acchi hai. | The sun is nice today.',
  mithun: 'Mithun ko mat chhedo. | Don’t tease the mithun.',
  barish: 'Barish aayegi, jaldi karo. | It will rain, hurry.',
  band: 'Dada, raasta band hai. | Brother, the road is shut.',
  machhli: 'Dhaan mein machhli hai. | There are fish in the paddy.',
  momo: 'Thukpa nahi, momo khao. | Not thukpa, eat momos.',
  sab: 'Itanagar mein sab mil jaata hai. | You find everything in Itanagar.',
  dhanyavaad: 'Dhanyavaad, dada! | Thank you, brother!',
};
