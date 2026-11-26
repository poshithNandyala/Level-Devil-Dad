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
  HYD: {
    hello: 'Baagunnara! Kya haal, miya? | How are you? How\'s it going, buddy?',
    famous: 'Irani chai, Osmania biscuits and autos with a mind of their own.',
    lang: 'Telugu + Hindi (Dakhni) + English',
    intro: ['Kya miya, shortcut chahiye? | What, buddy, want a shortcut?', 'Endi bhai, gitla slow ga? Ee side ra! | Why so slow, bro? Come this way!', 'Udhar-ich jao, rasta ekdum saaf! | Go right there, the road is totally clear!', 'Hau, trust me, nakko tension! | Yes, trust me, no tension!', 'Biryani free hai, aao! | Free biryani, come!'],
    taunt: ['Baigan! Phir se gaya! | Rubbish! Gone again!', 'Nakko re, nakko! | No, man, no!', 'Em chestunnav bhai? | What are you doing, bro?', 'Kaiku jump kiya? | Why did you jump?', 'Zyada nakko kar, miya! | Don\'t overdo it, buddy!'],
    beaten: ['Kirrak, miya! | Awesome, buddy!', 'Masth adinav, bhai! | You played great, bro!'],
    death: ['Sab baigan mein mil gaya! | It all went down the drain!', 'Biscuit chai mein doob gaya! | The biscuit sank in the chai!', 'Pailam, bhai! | Careful, bro!', 'Moye moye, miya.', 'Itna late toh biryani bhi nahi hoti! | Even biryani isn’t this late!'],
    near: ['Thoda-ich reh gaya! | Just a tiny bit short!', 'Konchem lo miss, bhai! | Missed by a little, bro!'],
    win: ['Kirrak! | Awesome!', 'Hau! Nikal gaya! | Yes! Made it out!', 'Masth, bhai! | Great, bro!'],
    flip: 'Arre! Left right ulta ho gaya! | Hey! Left and right got flipped!',
    cleared: 'Hyderabad cleared. Kirrak! | Hyderabad cleared. Awesome!',
    brag: 'Kirrak, miya! | Awesome, buddy!',
    idle: ['Kya miya, darr gaye kya? | What, buddy, got scared?', 'Himmat nai kya, bhai? | No guts, bro?', 'Khade-ich rehte kya? Chalo! | Just going to stand there? Move!', 'Emi bhayam ra? Padu! | What’s to fear? Go!'],
    seven: 'Edu saarlu, miya! Thala for a reason. | Seven deaths, buddy! Back to the start.',
    lastLife: 'Aakhri chance, miya! Hau? | Last chance, buddy! Got it?',
  },
  PNJ: {
    hello: "Kitem khobor? | What's new?",
    famous: 'Ferries on the Mandovi, lanes painted every colour, and nobody in a hurry.',
    lang: 'Konkani + English',
    intro: ['Arre baba, shortcut hanga asa! | Oh man, the shortcut is right here!', 'Susegad, Dad! Kiteak dhanvta? | Relax, Dad! Why are you running?', 'Ferry ravta, ye! | The ferry is waiting, come!', 'Hem sopem asa, vishvas kor! | This is easy, trust me!', 'Poi ghe, mag voch! | Grab some bread, then go!'],
    taunt: ['Arre deva! Porot? | Oh god! Again?', 'Kitem korta re tum? | What are you doing?', 'Poddlo re! | He fell!', 'Susegad, Dad, susegad! | Relax, Dad, relax!', 'Ai ai ai! | Oh no no!'],
    beaten: ['Bhov bore, Dad! | Very good, Dad!', 'Tum zikhlo! Viva! | You won! Hooray!'],
    death: ['Mandovint poddlo! | Fell in the Mandovi!', 'Ai, tuji ferry chuklee! | Oh, you missed your ferry!', 'Moye moye, baba.', 'Poi bi ghetlo na! | Didn’t even get the bread!', 'Hem kitem? Porot! | What was that? Again!'],
    near: ['Thoddem urlem! | Just a little left!', 'Arre, itlem lagim! | Oh, so close!'],
    win: ['Bhov bore! | Very good!', 'Viva! | Hooray!', 'Sobit! | Beautiful!'],
    flip: 'Arre! Davo-uzvo bodollo! | Hey! Left and right swapped!',
    cleared: 'Goa cleared. Viva! | Goa cleared. Hooray!',
    brag: 'Bhov bore! | Very good!',
    idle: ['Kitem, bhilo? | What, scared?', 'Susegad zalo kai? Chol! | Gone all relaxed? Move!', 'Nidd ailee? | Sleepy?', 'Rav naka, dhanv! | Don’t stop, run!'],
    seven: 'Sat pavtt! Thala for a reason. | Seven times! Back to the start.',
    lastLife: 'Nimano chance, baba! | Last chance, man!',
  },
  BOM: {
    hello: 'Namaskar! Kay mhanta? | Hello! What\'s up?',
    famous: 'Local trains, vada pav and a city that never waits.',
    lang: 'Marathi + Hindi + English',
    intro: ['Kay re Dad, shortcut idhar-ich hai! | Hey Dad, the shortcut is right here!', 'Lavkar, train nikal jayegi! | Quick, the train is leaving!', 'Bhau, door khula hai. Chadh ja! | Bro, the door is open. Get on!', 'Paani? Bas thoda sa! | Water? Just a little!', 'Last train, bhau. Jaldi! | Last train, bro. Hurry!'],
    taunt: ['Kay re, phir se? | What, again?', 'Ek number fail, bhau! | First-class fail, bro!', 'Gardi nahi, trap hai re! | That\'s not a crowd, it\'s a trap!', 'Mind the gap, boss!', 'Arre baap re! | Oh my god!'],
    beaten: ['Zala! Tu jinkla! | Done! You won!', 'Mast, bhau! | Great, bro!'],
    death: ['Bhau, khadda! | Bro, a pothole!', 'Mumbai kept moving. You didn’t.', 'Chal, phir se! | Come on, again!', 'Moye moye, bhau.', 'Ek dum bakwaas jump, bhidu! | Total rubbish jump, buddy!'],
    near: ['Thoda sa, bhau! | Just a bit, bro!', 'Arre, so close!'],
    win: ['Mast! Exit mil gaya! | Great! Found the exit!', 'Ek number! | First class!'],
    flip: 'Arre! Ulta-pulta zala! | Hey! Everything\'s upside down!',
    cleared: 'Mumbai cleared. Ek number! | Mumbai cleared. First class!',
    brag: 'Ek number! | First class!',
    idle: ['Kay re, ghabarlas ka? | What, got scared?', 'Himmat aahe ka, Dad? | Got the guts, Dad?', 'Ubha kaa rahilas? Chal! | Why just stand there? Come on!', 'Local nighun geli, bhau! | The local train left, bro!'],
    seven: 'Saat baar! Thala for a reason. | Seven deaths! Back to the start.',
    lastLife: 'Last chance, bhidu! | Last chance, buddy!',
  },
  DMN: {
    hello: 'Kem cho? | How are you?',
    famous: 'Two old forts across a river mouth, fishing boats, and the sea on every side.',
    lang: 'Gujarati + English',
    intro: ['Kem cho, Dad! Ahiya thi shortcut chhe! | Hi Dad! The shortcut is from here!', 'Hodi chalavo, saav saral! | Steer the boat, it’s very easy!', 'Baraf majboot chhe, chinta na karo! | The ice is solid, don’t worry!', 'Haath ma haath, upar pahonchi jasho! | Hand to hand, you’ll reach the top!', 'Doradu kheencho, bas! | Just pull the rope!'],
    taunt: ['Arre bapre! Pachhu? | Oh my! Again?', 'Shu karo chho, Dad? | What are you doing, Dad?', 'Padi gaya ne! | You fell, didn’t you!', 'Dhire dhire, Dad! | Slowly, Dad!', 'Aa shu thayu? | What just happened?'],
    beaten: ['Saras, Dad! | Excellent, Dad!', 'Shabash! Tame jitya! | Well done! You won!'],
    death: ['Dariya ma gaya! | Into the sea!', 'Machhli pan hasse chhe! | Even the fish are laughing!', 'Moye moye, Dad.', 'Arre, killo to ahiya chhe! | Hey, the fort is right here!', 'Bas, pachhu chalo! | Enough, go again!'],
    near: ['Thodu j baaki! | Just a little left!', 'Arre, bahu najik! | Oh, so close!'],
    win: ['Saras! | Excellent!', 'Majama! | All good!', 'Shabash! | Well done!'],
    flip: 'Arre! Daabu-jamnu ulti gayu! | Hey! Left and right flipped!',
    cleared: 'Daman cleared. Shabash! | Daman cleared. Well done!',
    brag: 'Shabash! | Well done!',
    idle: ['Shu thayu, beek laage chhe? | What, scared?', 'Ubha kem chho? Chalo! | Why are you standing? Let’s go!', 'Ungh aave chhe? | Feeling sleepy?', 'Hodi jati rahi, Dad! | The boat left, Dad!'],
    seven: 'Saat vaar! Thala for a reason. | Seven times! Back to the start.',
    lastLife: 'Chhello chance, Dad! | Last chance, Dad!',
  },
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
  { id: 'HYD', name: 'Hyderabad', state: 'Telangana', region: 'South', city: 'HYD', hello: LINES.HYD.hello, famous: LINES.HYD.famous },
  { id: 'PNJ', name: 'Panaji', state: 'Goa', region: 'West', city: 'PNJ', hello: LINES.PNJ.hello, famous: LINES.PNJ.famous },
  { id: 'BOM', name: 'Mumbai', state: 'Maharashtra', region: 'West', city: 'BOM', hello: LINES.BOM.hello, famous: LINES.BOM.famous },
  { id: 'DMN', name: 'Daman', state: 'Dadra & Nagar Haveli and Daman & Diu', region: 'West', bonus: true, city: 'DMN', hello: LINES.DMN.hello, famous: LINES.DMN.famous },
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
