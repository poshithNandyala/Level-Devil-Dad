import type { CityId } from './constants';

/*
 * The journey: every state and union-territory capital, south to north.
 * Playable cities have a CityId (themes, music, stages); the rest are on the
 * map as upcoming chapters with a greeting and a teaser.
 *
 * Language rules (from the research brief): everything is written in English
 * letters. South India mixes the local language with English, and uses Hindi
 * at most once or twice a city. Hyderabad mixes Telugu, Hindi (Dakhni) and
 * English. Elsewhere: local language + Hindi + English. No slurs, no swear
 * words, nothing about caste, religion, region or politics.
 */

export type RegionId = 'South' | 'West' | 'Central' | 'East' | 'Northeast' | 'North';

export interface CityLines {
  /** greeting on the city postcard */
  hello: string;
  /** what the city is known for, in a sentence */
  famous: string;
  lang: string;
  /** Tara's opening lines, one per long stage: 7 for the 8-stage cities, 9 (stages 02-10) for a module city
   * (tests/modules.test.ts checks it). Readers index with `n % intro.length`, so a short list repeats, never breaks. */
  intro: string[];
  /** after you die in her stage */
  taunt: string[];
  /** when you clear her stage (readers index with `% beaten.length`) */
  beaten: string[];
  /** quips when there is no rival on screen */
  death: string[];
  /** died very close to the exit */
  near: string[];
  win: string[];
  /** controls just flipped */
  flip: string;
  /** city complete */
  cleared: string;
  /** one word brag for the share card */
  brag: string;
  /** when Dad just stands there: she pokes him (regional | English) */
  idle: string[];
  /** the 7th death of a run: back to the very start (Thala for a reason) */
  seven: string;
  /** one life left */
  lastLife: string;
}

export interface Chapter {
  id: string;
  name: string;
  state: string;
  region: RegionId;
  /** playable city (themes, stages) */
  city?: CityId;
  bonus?: boolean;
  preview?: boolean;
  hello: string;
  famous: string;
  teasers?: string[];
}

export const LINES = {
  GNR: {
    hello: 'Kem cho! | How are you!',
    famous: 'Thirty neat sectors, kites on every roof at Uttarayan, and old Amdavad’s pols next door.',
    lang: 'Gujarati + English',
    intro: ['Kem cho, Dad! Vaans lai ne kudo! | Hi Dad! Grab a bamboo and vault!', 'Vav ma prakash par chalo! | Walk on the light in the stepwell!', 'Dinosaur to putlo chhe, Dad! | The dinosaur is just a statue, Dad!', 'Sinh ne peeth na batavo! | Never turn your back on a lion!', 'Mor nu pichhu lo, udo! | Take a peacock feather, fly!', 'Garba ramo, Dad! | Dance the garba, Dad!', 'Share bazaar ma chalo! | Into the stock market!'],
    taunt: ['Kaapyo chhe! | Cut!', 'Arre re re! Pachhu? | Oh no no! Again?', 'Lapet! Lapet! | Wrap it up! Wrap it up!', 'Aa shu karyu, Dad? | What did you do, Dad?', 'Dhire, Dad, dhire! | Slowly, Dad, slowly!'],
    beaten: ['Jordar, Dad! | Brilliant, Dad!', 'Kai po che! Tame jitya! | I cut it! You won!'],
    death: ['Patang kapai gayo! | The kite got cut!', 'Arre, sector bhuli gaya? | Oh, forgot which sector?', 'Moye moye, Dad.', 'Dhokla jevu dheelu! | Floppy as a dhokla!', 'Pachhu shaharu karo! | Start again!'],
    near: ['Bas thodu j! | Just a bit!', 'Arre, ekdum najik! | Oh, really close!'],
    win: ['Jordar! | Brilliant!', 'Kai po che! | Cut it!', 'Majja aavi! | That was fun!'],
    flip: 'Arre! Daabu-jamnu badlai gayu! | Hey! Left and right swapped!',
    cleared: 'Gandhinagar cleared. Kai po che! | Gandhinagar cleared. I cut it!',
    brag: 'Kai po che! | I cut it!',
    idle: ['Shu vichaaro chho, Dad? | What are you thinking, Dad?', 'Chalo, ubha kem? | Come on, why stand?', 'Undhiyu khavanu mann chhe? | Fancy some undhiyu?', 'Patang to udi gayo! | The kite flew off!'],
    seven: 'Saat vaar! Thala for a reason. | Seven times! Back to the start.',
    lastLife: 'Chhello chance, Dad! Dhyan thi! | Last chance, Dad! Carefully!',
  },
  JAI: {
    hello: 'Khamma ghani! | Warm greetings!',
    famous: 'Pink walls, a palace of 953 windows, giant stone instruments, and puppets on strings.',
    lang: 'Rajasthani + English',
    intro: ['Ram Ram sa, Dad! Kathputli banogo? | Ram Ram, Dad! Want to be a puppet?', 'Matka sir pe, dhyaan su! | Pots on your head, carefully!', 'Katora mein jhoolo, Dad! | Swing in the bowl, Dad!', 'Choodi mein baitho, gudko! | Hop in the bangle and roll!', 'Ghodi nachaavo, ruko mat! | Dance the horse, don’t stop!', 'Hawa ro rukh dekho, Dad! | Watch which way the wind blows, Dad!', 'Amer chalo, Dad, haathi wala! | To Amer, Dad, where the elephants are!'],
    taunt: ['Arre baapji! Phir su? | Oh my! Again?', 'Kai karyo, Dad? | What did you do, Dad?', 'Dhyaan su, hukum! | Carefully, sir!', 'Ghano bhaari pad gyo! | That went badly!', 'Haso mat, phir karo! | Don’t laugh, go again!'],
    beaten: ['Wah sa, Dad! | Bravo, Dad!', 'Ghano chokho! | Very good!'],
    death: ['Arre, gir gya! | Oh, you fell!', 'Kathputli ri dor toot gayi! | The puppet’s string snapped!', 'Matka phoot gyo! | The pot broke!', 'Thak gya ka, Dad? | Tired, Dad?', 'Phir su, hukum! | Again, sir!'],
    near: ['Bas thodo sa! | Just a little!', 'Arre, najdeek tha! | Oh, that was close!'],
    win: ['Wah sa! | Bravo!', 'Ghano chokho! | Very good!', 'Padharo! | Welcome!'],
    flip: 'Arre! Daavo-jeevno badal gyo! | Hey! Left and right swapped!',
    cleared: 'Jaipur cleared. Khamma ghani! | Jaipur cleared. Warm greetings!',
    brag: 'Wah sa! | Bravo!',
    idle: ['Kai soch rya ho, Dad? | What are you thinking, Dad?', 'Chaalo, ubha kyun? | Come on, why stand there?', 'Ghevar khaavoge? | Fancy some ghevar?', 'Hawa Mahal ri hawa! | Hawa Mahal’s breeze!'],
    seven: 'Saat baar! Thala for a reason. | Seven times! Back to the start.',
    lastLife: 'Aakhri moko, Dad! Dhyaan su! | Last chance, Dad! Carefully!',
  },
  BPL: {
    hello: 'Hao, bade bhai! | Yes, big brother!',
    famous: 'A city of lakes, poha-jalebi mornings, old bazaars, and tall tales told over paan.',
    lang: 'Bhopali Hindi + English',
    intro: ['Ko khan, Dad! Tappa khaoge? | Hey there, Dad! Fancy skipping like a stone?', 'Deewar ki tasveer mein ghus jao, miyan! | Step in to the picture on the wall, sir!', 'Dhaaga mat kaatna, khan! | Don’t cross your own thread, friend!', 'Katori bajao, uchhlo! | Ring the bowl and bounce!', 'Surma miyan ki baat mat maanna! | Don’t believe a word Surma says!', 'Tawa sambhalo, chumbak hai upar! | Mind the pan, there’s a magnet up there!', 'Tal toh Bhopal Tal, baaki sab talaiya! | A lake means Bhopal’s lake, the rest are ponds!'],
    taunt: ['Ama yaar! Phir se? | Oh man! Again?', 'Kya kar riye ho, khan? | What are you doing, friend?', 'Apan toh hans hans ke pagal! | I’m dying laughing here!', 'Bhot bura hua, miyan! | That went badly, sir!', 'Itminan se, Dad! | Take it easy, Dad!'],
    beaten: ['Wah khan! | Bravo, friend!', 'Maza aa gaya, miyan! | That was fun, sir!'],
    death: ['Ama, gir gaye! | Oh, you fell!', 'Doob gaye talab mein! | Sunk in the lake!', 'Poha thanda ho raha hai! | The poha’s getting cold!', 'Thak gaye kya, khan? | Tired, friend?', 'Phir se, bade bhai! | Again, big brother!'],
    near: ['Bas zara sa! | Just a little!', 'Ama, bilkul paas tha! | Oh, that was so close!'],
    win: ['Wah khan! | Bravo, friend!', 'Kya baat hai! | Well done!', 'Hao! | Yes!'],
    flip: 'Ama! Daaye-baaye badal gaye! | Hey! Left and right swapped!',
    cleared: 'Bhopal cleared. Hao, bade bhai! | Bhopal cleared. Yes, big brother!',
    brag: 'Wah khan! | Bravo!',
    idle: ['Kya soch riye ho, Dad? | What are you thinking, Dad?', 'Chalo khan, khade kyun ho? | Come on, why stand there?', 'Poha-jalebi khaoge? | Fancy some poha-jalebi?', 'Paan lagwa doon? | Shall I get you a paan?'],
    seven: 'Saat baar! Thala for a reason. | Seven times! Back to the start.',
    lastLife: 'Aakhri mauka, Dad! Itminan se! | Last chance, Dad! Easy now!',
  },
  RPR: {
    hello: 'Jai Johar! | Greetings!',
    famous: 'The rice bowl of India: paddy to the horizon, gedi stilts at Hareli, and a clock tower that sings folk songs.',
    lang: 'Chhattisgarhi + English',
    intro: ['Jai Johar, Dad! Gedi chadhbe ka? | Greetings, Dad! Fancy a go on stilts?', 'Ghadi tabhe chalhi, jab tai chalbe! | The clock only runs when you do!', 'Bora khol, dhan ke pahaad bana! | Open the sack, make a hill of rice!', 'Bhaunra ghumat he, jaldi kood! | The top is spinning, jump quick!', 'Chup khade raha, kosa ban ja! | Stand still and be a cocoon!', 'Chapda chanti pul banahi! | The red ants will build you a bridge!', 'Dussehra ke rath aagu he, sangwari! | The Dussehra chariot is up ahead, friend!'],
    taunt: ['Are ga! Phir le? | Oh dear! Again?', 'Ka karat has, Dad? | What are you doing, Dad?', 'Dheere dheere, sangwari! | Slowly, friend!', 'Bad garu pad ge! | That went badly!', 'Hans jhan, phir kar! | Don’t laugh, go again!'],
    beaten: ['Bad sughar, Dad! | Very nice, Dad!', 'Bane karey ga! | Well done!'],
    death: ['Are, gir ge! | Oh, you fell!', 'Chikhla ma dhans ge! | Stuck in the mud!', 'Chila thanda hovat he! | The chila is getting cold!', 'Thak ge ka, Dad? | Tired, Dad?', 'Phir le, sangwari! | Again, friend!'],
    near: ['Bas thorkun! | Just a little!', 'Are, tir ma rihis! | Oh, that was close!'],
    win: ['Bad sughar! | Very nice!', 'Bane karey! | Well done!', 'Jai Johar! | Greetings!'],
    flip: 'Are! Daahina-daeri badal ge! | Hey! Left and right swapped!',
    cleared: 'Raipur cleared. Jai Johar! | Raipur cleared. Greetings!',
    brag: 'Bad sughar! | Very nice!',
    idle: ['Ka sochat has, Dad? | What are you thinking, Dad?', 'Chal na ga, khade kabar has? | Come on, why stand there?', 'Chila khabe ka? | Fancy a chila?', 'Ghadi Chowk ma gana bajat he! | The clock tower is playing a song!'],
    seven: 'Saat baar! Thala for a reason. | Seven times! Back to the start.',
    lastLife: 'Aakhri mauka, Dad! Dheere dheere! | Last chance, Dad! Slowly!',
  },
} as Record<CityId, CityLines>;

/** South to north. Bonus chapters are optional side trips; previews are early peeks. */
export const CHAPTERS: Chapter[] = [
  { id: 'TVM', name: 'Thiruvananthapuram', state: 'Kerala', region: 'South', hello: '', famous: '' },
  { id: 'KVT', name: 'Kavaratti', state: 'Lakshadweep', region: 'South', bonus: true, hello: '', famous: '' },
  { id: 'CHN', name: 'Chennai', state: 'Tamil Nadu', region: 'South', hello: '', famous: '' },
  { id: 'PDY', name: 'Puducherry', state: 'Puducherry', region: 'South', hello: '', famous: '' },
  { id: 'BLR', name: 'Bengaluru', state: 'Karnataka', region: 'South', hello: '', famous: '' },
  { id: 'AMR', name: 'Amaravati', state: 'Andhra Pradesh', region: 'South', hello: '', famous: '' },
  { id: 'HYD', name: 'Hyderabad', state: 'Telangana', region: 'South', hello: '', famous: '' },
  { id: 'PNJ', name: 'Panaji', state: 'Goa', region: 'West', hello: '', famous: '' },
  { id: 'BOM', name: 'Mumbai', state: 'Maharashtra', region: 'West', hello: '', famous: '' },
  { id: 'DMN', name: 'Daman', state: 'Dadra & Nagar Haveli and Daman & Diu', region: 'West', bonus: true, hello: '', famous: '' },
  { id: 'GNR', name: 'Gandhinagar', state: 'Gujarat', region: 'West', city: 'GNR', hello: LINES.GNR.hello, famous: LINES.GNR.famous },
  { id: 'JAI', name: 'Jaipur', state: 'Rajasthan', region: 'West', city: 'JAI', hello: LINES.JAI.hello, famous: LINES.JAI.famous },
  { id: 'BPL', name: 'Bhopal', state: 'Madhya Pradesh', region: 'Central', city: 'BPL', hello: LINES.BPL.hello, famous: LINES.BPL.famous },
  { id: 'RPR', name: 'Raipur', state: 'Chhattisgarh', region: 'Central', city: 'RPR', hello: LINES.RPR.hello, famous: LINES.RPR.famous },
  { id: 'RNC', name: 'Ranchi', state: 'Jharkhand', region: 'Central', hello: "Johar! | Greetings!", famous: 'Waterfalls all around and hot dhuska at breakfast.', teasers: ['Dhuska Trampoline', 'Hundru Mist'] },
  { id: 'PAT', name: 'Patna', state: 'Bihar', region: 'Central', hello: "Ka haal ba? | How's it going?", famous: 'The Ganga, litti chokha and the old Golghar dome.', teasers: ['Golghar Spiral', 'Gandhi Setu Peel'] },
  { id: 'LKO', name: 'Lucknow', state: 'Uttar Pradesh', region: 'Central', hello: "Aadaab! | Respectful greetings!", famous: 'Kebabs, chikan embroidery and pehle-aap politeness.', teasers: ['Pehle Aap Trap', 'Door Number 489'] },
  { id: 'BBI', name: 'Bhubaneswar', state: 'Odisha', region: 'East', hello: "Kemiti achha? | How are you?", famous: 'Wide new roads, an old town and dahibara stalls.', teasers: ['Pipli Parachute', 'Kalbaishakhi Gust'] },
  { id: 'CCU', name: 'Kolkata', state: 'West Bengal', region: 'East', hello: "Ki khobor? | What's up?", famous: 'Yellow taxis, trams, College Street books and adda.', teasers: ['Boi Para Avalanche', 'Aaste! Aaste!'] },
  { id: 'SVP', name: 'Sri Vijaya Puram', state: 'Andaman & Nicobar Islands', region: 'East', bonus: true, hello: "Namaste! | Hello!", famous: 'Island capital of ferries, coral reefs and sea breeze.', teasers: ['Chatham Log Roll', 'Coconut Crab Snip'] },
  { id: 'GTK', name: 'Gangtok', state: 'Sikkim', region: 'East', hello: "Kasto cha? | How are you?", famous: 'Steep stairs, a spotless MG Marg and clouds at eye level.', teasers: ['One Floor Or Six?', 'MG Marg Polish'] },
  { id: 'DIS', name: 'Dispur', state: 'Assam', region: 'Northeast', hello: "Kenekua aase? | How are you?", famous: 'The Brahmaputra, river ferries and lal chah.', teasers: ['GS Road Flyover', 'Brahmaputra Eddy'] },
  { id: 'SHL', name: 'Shillong', state: 'Meghalaya', region: 'Northeast', hello: "Kumno! | Hello!", famous: 'Pine hills, rain and shared taxis that fit everyone.', teasers: ['Living Root Leap', 'Sideways Sohra Rain'] },
  { id: 'ITA', name: 'Itanagar', state: 'Arunachal Pradesh', region: 'Northeast', hello: "Namaste! | Hello!", famous: 'Hill roads in the land of India’s first sunrise.', teasers: ['Cane Bridge Catapult', 'Hornbill Glide'] },
  { id: 'KOH', name: 'Kohima', state: 'Nagaland', region: 'Northeast', hello: "Kemon ase? | How are you?", famous: 'A hill capital of smoked dishes and fiery chillies.', teasers: ['Log Drum Off-Beat', 'Wooden Cart Downhill'] },
  { id: 'IMP', name: 'Imphal', state: 'Manipur', region: 'Northeast', hello: "Khurumjari! | Greetings!", famous: 'A market run by mothers and a lake with floating islands.', teasers: ['Donut Island Drift', 'Ima Market Bounce'] },
  { id: 'AIZ', name: 'Aizawl', state: 'Mizoram', region: 'Northeast', hello: "Chibai! | Hello!", famous: 'A ridge city where nobody honks and stairs are streets.', teasers: ['Do Not Honk Here', 'Ten Floors Below'] },
  { id: 'AGT', name: 'Agartala', state: 'Tripura', region: 'Northeast', hello: "Nomoshkar! | Hello!", famous: 'A white palace mirrored in a lake.', teasers: ['Mirror Lake Lie', 'Bamboo Mat Roll-Up'] },
  { id: 'DEL', name: 'New Delhi', state: 'Delhi', region: 'North', hello: "Kya scene hai? | What's the scene?", famous: 'Metro rush, chole bhature and very confident directions.', teasers: ['Rajiv Chowk Transfer', 'Mind The Gap, Bhai'] },
  { id: 'CHP', name: 'Chandigarh', state: 'Punjab', region: 'North', hello: "Ki haal, paaji? | How's it going, brother?", famous: 'Sector numbers, roundabouts and makki di roti.', teasers: ['Where Is Sector 13?', 'Rock Garden Duck'] },
  { id: 'CHH', name: 'Chandigarh', state: 'Haryana', region: 'North', hello: "Ke haal se? | How's it going?", famous: 'Same city, Haryanvi swagger: doodh, dahi and straight talk.', teasers: ['Charpai Trampoline', 'Tau Knows Best'] },
  { id: 'DDN', name: 'Dehradun', state: 'Uttarakhand', region: 'North', hello: "Kya haal chaal? | How's life?", famous: 'A clock tower, valley rain and the hills next door.', teasers: ['Six Clocks, Zero Time', 'Blue Vikram Clutch'] },
  { id: 'SML', name: 'Shimla', state: 'Himachal Pradesh', region: 'North', hello: "Kiya haal? | How's it going?", famous: 'A toy train, cheeky monkeys and a busy Mall Road.', teasers: ['Give Back My Specs!', 'Tunnel 102 Teleport'] },
  { id: 'JMU', name: 'Jammu', state: 'Jammu & Kashmir', region: 'North', hello: "Ki haal ae? | How's it going?", famous: 'Kalari kulcha and the plains meeting the hills.', teasers: ['Kalari Cheese Bungee', 'Matador Stop-And-Go'] },
  { id: 'SXR', name: 'Srinagar', state: 'Jammu & Kashmir', region: 'North', hello: "Kyah chhu? | What's up?", famous: 'Shikaras on the lake and kahwa from a samovar.', teasers: ['Heart-Shaped Paddle', 'Chinar Leaf Carpet'] },
  { id: 'LEH', name: 'Leh', state: 'Ladakh', region: 'North', hello: "Julley! | Hello!", famous: 'Thin air, butter tea and a Julley from everyone.', teasers: ['Julley At 11,000 Feet', 'Magnetic Hill Illusion'] },
];

export const CHAPTER_BY_ID = new Map(CHAPTERS.map((c) => [c.id, c]));

export function chapterOf(city: CityId): Chapter {
  return CHAPTERS.find((c) => c.city === city)!;
}

/** Deterministic pick so lines vary but repeat fairly. */
export function pick<T>(arr: T[], n: number): T {
  return arr[((n % arr.length) + arr.length) % arr.length];
}
