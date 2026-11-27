import type { CityLines } from '../../cities';

/** everything Thiruvananthapuram says ("Local | English"): LINES.TVM once installed */
export const lines: CityLines = {
  hello: 'Namaskaram! | Hello!',
  famous: 'Red buses, coconut palms and chaaya in the rain.',
  lang: 'Malayalam + English',
  // one per stage: intro[n] is read by stage n + 1 (02 reads [1] ... 10 reads [9]); [0] is the city's own
  intro: [
    'Enthaa, Dad? Shortcut ivide undu! | What\'s up, Dad? There\'s a shortcut right here!',
    'Bus-il keri po, easy alle? | Hop on the bus and go, easy, right?',
    'Chaaya kudichittu po, Dad! | Have some tea before you go, Dad!',
    'Thenga? Onnum pedikkanda! | Coconuts? Nothing to be scared of!',
    'Mazha varunnu! Odu, odu! | Rain\'s coming! Run, run!',
    'Kochi vala kando? Keri po! | Seen the Kochi nets? Climb on!',
    'Munnar thottam! Mukalil kayari vaa! | Munnar tea gardens! Climb up to the top!',
    'Vallam kali! Vegam keri iriku! | Boat race! Quick, hop on and sit!',
    'Flag okke chumma, Dad! Neenthi po! | Flags are just for show, Dad! Swim along!',
    'Enna onnum alla, Dad! Odi chaadu! | Oil is nothing, Dad! Run and jump!',
  ],
  taunt: ['Ayyo! Kandille? | Oops! Didn\'t you see that?', 'Scene contra aayi! | That went totally wrong!', 'Ivide straight ennu vishwasicho? | You believed it was straight here?', 'Rain one, Dad zero!', 'Pinne? Veendum? | And then? Again?'],
  beaten: ['Kollam, Dad! Ee round ninakku. | Not bad, Dad! This round is yours.', 'Sheri, Dad smart thanne. | Okay, Dad really is smart.'],
  death: ['Ayyo, road poyi! | Oops, the road is gone!', 'Puddle depth nokkiyilla, alle? | Didn\'t check how deep the puddle was, huh?', 'Monsoon one, Dad zero.', 'Thenga thalayil veenu! | A coconut fell on your head!', 'Moye moye, Dad.', 'Ithokke enthu, Dad? | What even is this, Dad?', 'Expectation: hero. Reality: zero.'],
  near: ['Ichiri koodi! | Just a little more!', 'Ayyo, just missed!'],
  win: ['Poli! Exit pidichu! | Awesome! Got the exit!', 'Kidu, Dad! | Brilliant, Dad!', 'Sheri, next stop! | Okay, next stop!'],
  flip: 'Ayyo! Left right maari! | Oops! Left and right swapped!',
  cleared: 'Thiruvananthapuram cleared. Poli! | Thiruvananthapuram cleared. Awesome!',
  brag: 'Poli! | Awesome!',
  idle: ['Enthaa, pedicho? | What, scared?', 'Dhairyam undo, Dad? | Got the guts, Dad?', 'Ivide nilkkano plan? | Planning to just stand here?', 'Urakkam vanno? | Feeling sleepy?'],
  // the chaaya-kada chechi has poured you seven glasses of tea: back to the start
  seven: 'Ezhu chaaya! Chechi parayunnu: aadyam muthal. | Seven teas! Chechi says: start again.',
  lastLife: 'Last life aanu, sookshichu! | Last life, careful!',
};
