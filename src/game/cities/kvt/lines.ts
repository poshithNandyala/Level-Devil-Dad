import type { CityLines } from '../../cities';

/** everything Kavaratti says ("Local | English"): LINES.KVT once installed */
export const lines: CityLines = {
  hello: 'Hello from the billam! | Hello from the lagoon!',
  famous: 'A tiny coral island, a calm lagoon and boats on a timetable.',
  lang: 'Jeseri words + Malayalam + English',
  // one per stage, 02 to 10 (intro[0] is KVT-02's)
  intro: [
    'Odam ippo pokum! Jump cheyyu! | The boat is leaving now! Jump!',
    'Supari light nokku, Dad. | Watch the light, Dad.',
    'Agatti-yil flight landing aanu, odu! | A flight is landing at Agatti, run!',
    'Minicoy-il choora meen parakkum! | In Minicoy, the tuna fly!',
    'Vellathil chaadu, Dad! Neenthan ariyamallo? | Jump in, Dad! You can swim, right?',
    'Thengil kayari po, Dad! Islander-maar ellam cheyyum! | Climb the palm, Dad! Every islander does it!',
    'Billam aazham illa, Dad! Pathukke nadannu po! | The lagoon’s shallow, Dad! Just walk across slowly!',
    'Padi pole kayari po, Dad! | Climb it like stairs, Dad!',
    'Kuzhi kandaal chaadu, Dad! | Jump the hole, Dad!',
  ],
  taunt: ['Bellam vannu, bye Dad! | The water came in, bye Dad!', 'Phar kandille? | Didn\'t you see the reef?', 'Kaattu timing miss aayi! | You missed the wind\'s timing!', 'Sand moved. You didn’t.'],
  beaten: ['Sheri, island brain undu! | Okay, you\'ve got an island brain!'],
  death: ['Billam one, Dad zero. | Lagoon one, Dad zero.', 'Missed the odam! Swim to Kochi? | Missed the boat! Swim to Kochi?', 'Dad became beach luggage.', 'Moye moye. Even the fish laughed.', 'Lagoon review: one star, Dad sank.'],
  near: ['Odam almost! | Almost made the boat!', 'So close to the jetty!'],
  win: ['Billam cleared! | Lagoon cleared!', 'Odam caught, nice timing! | Caught the boat, nice timing!'],
  flip: 'Kaattu! Left right maari! | Wind! Left and right swapped!',
  cleared: 'Lakshadweep cleared. Island brain! | Lakshadweep cleared. Island brain!',
  brag: 'Billam cleared! | Lagoon cleared!',
  idle: ['Odam pokum, Dad! Vegam! | The boat’s leaving, Dad! Quick!', 'Pediyaano, Dad? | Scared, Dad?', 'Billam kandu nilkkuvaano? | Just standing there staring at the lagoon?', 'Meenukal polum neenthunnu! | Even the fish are moving!'],
  // the jetty's departures board strikes out the seventh boat
  seven: 'Ezhaamathe odam vettikkalanju! Thirichu jetty-lekku. | Seventh boat struck off! Back to the jetty.',
  lastLife: 'Last odam, Dad! | Last boat, Dad!',
};
