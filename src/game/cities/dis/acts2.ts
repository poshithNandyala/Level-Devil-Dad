// The length pass: more acts for Dispur's stages, each one built from DIS's own ideas (the sandbars and their post, the
// pitha pan, Majuli's bank, the stilt house ladder, the husori gates, Kaziranga's rhino and jeep, the tea boy's ghat,
// the gamosa hosts, the Rang Ghar roof), used in a stage that has not used it yet, one plain beat after the last.
import type { World } from '../../world';
import type { Act } from '../../levels/acts';
import { sign } from '../../levels/kit';
import { Carrier, Decor, GROUND, River, Slab, levelPost, px, sand } from './entities';
import { TeaBoy } from './bank';
import { husori } from './husori';
import { charge } from './gorh';
import { Host, gam, machan, pitDanger } from './gamosa';
import { roof } from './rangghar';
import { bank, pitha } from './levels';

// ------------------------------------------------------------------ shared pieces
/** a ghat (stone steps down to the river) dug into the path over columns c0..c1, and its drawing */
export function ghatPaint(g: { pit: (a: number, b: number, t?: number) => unknown; fill: (a: number, b: number, c: number, d: number, ch: string) => unknown }, c0: number, c1: number) {
  g.pit(c0, c1, 15);
  g.fill(c0, c1, 17, 17, '#');
}
export function ghatDraw(w: World, c0: number, c1: number) {
  w.add(
    new Decor((ctx) => {
      ctx.fillStyle = '#8D7B68';
      ctx.fillRect(px(c0), px(16), px(c1 - c0 + 1), 16);
      ctx.fillStyle = 'rgba(70,110,120,0.55)';
      ctx.fillRect(px(c0), px(16) + 8, px(c1 - c0 + 1), 8);
      ctx.fillStyle = '#6A5846';
      for (let i = 0; i < 3; i++) ctx.fillRect(px(c0) + i * 6, px(15) + i * 8, 6, 8);
    }, -3),
  );
}
/** a tea boy walking left over a ghat: starts when Dad passes `from`, stops at `stop` (tile columns) */
export function teaBoy(w: World, start: number, from: number, stop: number, ghat: [number, number], speed = 50) {
  const c = w.add(new Carrier(px(start), px(from), px(stop), speed, [px(ghat[0]), px(ghat[1] + 1)]));
  (w.flags.carriers ??= []).push(c);
  return c;
}

/**
 * A Mising stilt house (chang ghar) standing in the water: a solid house over columns h0..h0+4 (rows 11-14, painted by
 * the act), its ladder hooked up out of reach until the tea boy reaches the bank; then it is let down over the water
 * (a one-way rung at row 13 over columns r0..r0+2) for him and for Dad.
 */
export function chang(w: World, h0: number, r0: number, boyFrom: number, boyAt: number, speed = 40) {
  const boy = w.add(new TeaBoy(px(boyFrom), px(boyFrom) + 4, px(boyAt), 1600, speed));
  const rung = w.add(
    new Slab(px(r0), 208, px(3), 6, (ctx, s) => {
      ctx.fillStyle = '#8D6B2E';
      if (boy.down) {
        ctx.fillRect(s.solid.x, s.solid.y, s.solid.w, 5);
        ctx.fillRect(s.solid.x, s.solid.y, 2, 32);
        ctx.fillRect(s.solid.x + s.solid.w - 2, s.solid.y, 2, 32);
      } else {
        // hooked up against the house
        ctx.fillRect(px(h0) - 3, 150, 2, 54);
        ctx.fillRect(px(h0) - 8, 150, 2, 54);
        for (let y = 156; y < 204; y += 12) ctx.fillRect(px(h0) - 8, y, 7, 2);
      }
    }),
  );
  rung.solid.oneWay = true;
  w.onTick(() => {
    rung.solid.collidable = boy.down;
  });
  w.add(
    new Decor((ctx) => {
      const x0 = px(h0);
      ctx.fillStyle = '#B08B3C';
      ctx.beginPath();
      ctx.moveTo(x0 - 8, 176);
      ctx.lineTo(x0 + 40, 150);
      ctx.lineTo(x0 + 88, 176);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#6A4B1C';
      for (const dx of [4, 36, 70]) ctx.fillRect(x0 + dx, 200, 4, 40);
    }, -4),
  );
  (w.flags.changs ??= []).push({ boy, rung });
  return { boy, rung };
}

/** givers and takers along the path: [kind, column, row] */
function hosts(w: World, list: ['give' | 'take', number, number?][]) {
  for (const [k, c, r] of list) w.add(new Host(px(c) + 8, px(r ?? 15), k));
}
/** the stall at the start of a gamosa act takes back every gamosa you are wearing */
function stall(w: World, x: number) {
  w.when(
    (w2) => w2.player.cx >= px(x + 1.2),
    (w2) => {
      gam(w2).n = 0;
    },
  );
}

// ================================================================== DIS-01: a second tea boy (in the tour's extra)

// ================================================================== DIS-05 (Gamosa): three more acts
/** DIS-05 act: the gamosa hosts meet the sandbars. A taker stands on the first bar and a giver on the third. */
export const gamChar: Act = {
  id: 'dis05-char',
  w: 42,
  advice: 'Two givers on the bank, then the river and its post: a host in a red sash is on the first bar, so you land with one gamosa fewer, and another giver waits on the third. After each siren wait for the dashed bar ahead to come up, then go to it at once.',
  cps: [1.5],
  paint: (g, c) => {
    g.pit(c.x + 8, c.x + 37);
  },
  build: (w, c) => {
    const x = c.x + 6;
    stall(w, c.x);
    hosts(w, [['give', c.x + 3], ['give', c.x + 5], ['take', x + 4], ['give', x + 21]]);
    w.add(new River(px(x + 2), px(x + 32)));
    const f = sand(
      w,
      [
        [[x + 3, x + 8], [x + 3, x + 8], null],
        [null, [x + 11, x + 17], [x + 11, x + 13]],
        [null, null, [x + 19, x + 24]],
        [[x + 26, x + 31], [x + 26, x + 31], [x + 26, x + 31]],
      ],
      [px(x + 3) - 4, px(x + 11) - 4],
    );
    levelPost(w, f, c.x + 0.6, 3);
  },
};

/** DIS-05 act: the husori group's yards are full of hosts. Two givers stand right after the last gate, and a pit after them. */
export const gamHusori: Act = {
  id: 'dis05-husori',
  w: 66,
  advice: 'The singers again, with a host in every yard. Walk with them through each gate, inside their ring. After the second gate two givers stand side by side before a pit: let the first one welcome you and hop over the second, or the third gamosa hides the pit.',
  cps: [1.5, 18.5, 32.5, 40.5],
  paint: (g, c) => {
    g.pit(c.x + 56, c.x + 57);
  },
  build: (w, c) => {
    const x = c.x;
    stall(w, x);
    husori(w, x + 4, x, [{ x: x + 22, ritual: 0, stay: 220 }, { x: x + 44, ritual: 0, stay: 220 }], 32);
    hosts(w, [['give', x + 27], ['give', x + 49], ['give', x + 52]]);
    pitDanger(w, x + 56, x + 57);
  },
};

/** DIS-05 act: a tea boy on the riverfront, with two givers right after his ghat. */
export const gamGhat: Act = {
  id: 'dis05-ghat',
  w: 34,
  advice: 'The tea boy is coming along the riverfront with his tray: down into the ghat, let him walk over you, and climb out only once he is a few steps past. Then two more givers and a pit: you can carry two and still see.',
  cps: [1.5],
  paint: (g, c) => {
    ghatPaint(g, c.x + 10, c.x + 14);
    g.pit(c.x + 26, c.x + 27);
  },
  build: (w, c) => {
    const x = c.x;
    stall(w, x);
    ghatDraw(w, x + 10, x + 14);
    teaBoy(w, x + 31, x + 2, x + 5, [x + 10, x + 14]);
    hosts(w, [['give', x + 18], ['give', x + 21]]);
    pitDanger(w, x + 26, x + 27);
  },
};

// ================================================================== DIS-06 (Majuli): three more acts
/** DIS-06 act: a stilt house standing in the water, and its ladder is pulled up until the tea boy comes. */
export const majChang: Act = {
  id: 'dis06-chang',
  w: 34,
  advice: 'A chang ghar, a house on stilts, stands in the water and its ladder is hooked up. Wait on the bank: the tea boy comes along behind you, and when he reaches the water the family lets the ladder down. Hop on the ladder, up on to the house, and jump down the far side.',
  cps: [1.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 12, x + 24);
    g.fill(x + 16, x + 20, 11, 17, '#');
  },
  build: (w, c) => {
    const x = c.x;
    w.add(new River(px(x + 12), px(x + 16), GROUND + 10, 'dis-bank'));
    w.add(new River(px(x + 21), px(x + 25), GROUND + 10, 'dis-bank'));
    chang(w, x + 16, x + 12, x + 1, x + 11);
  },
};

/** DIS-06 act: the bank runs out on to a sandbar, and the bars move at the siren. */
export const majChar: Act = {
  id: 'dis06-char',
  w: 40,
  advice: 'Run the two slabs of bank before the river takes them, on to the sandbar beyond. Then stop: the siren goes, and the next bar comes up only after a moment. Go to it once it is up (your bar sinks a little later), then on to the far bar and the bank.',
  cps: [1.5],
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 33);
  },
  build: (w, c) => {
    const x = c.x;
    bank(w, [{ x: x + 4, w: 4, t: 230 }, { x: x + 8, w: 4, t: 320 }], x + 0.6, x - 4, x + 3, x + 12);
    w.add(new River(px(x + 12), px(x + 34)));
    const f = sand(
      w,
      [
        [[x + 13, x + 17], null],
        [null, [x + 20, x + 24]],
        [[x + 27, x + 33], [x + 27, x + 33]],
      ],
      [px(x + 13) - 4],
    );
    levelPost(w, f, x + 35.4, 2);
  },
};

/** DIS-06 act: a second chang ghar, and this one's ladder comes down on the far side of a slab bank. */
export const majChang2: Act = {
  id: 'dis06-chang2',
  w: 36,
  advice: 'Another stilt house, with two slabs of bank in front of it that the river is eating. Wait on the bank for the tea boy, and only when the ladder is down run the slabs to it without stopping.',
  cps: [1.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 3, x + 23);
    g.fill(x + 16, x + 20, 11, 17, '#');
  },
  build: (w, c) => {
    const x = c.x;
    bank(w, [{ x: x + 4, w: 4, t: 230 }, { x: x + 8, w: 3, t: 330 }], x + 3.6, x - 4, x + 3, x + 16);
    w.add(new River(px(x + 21), px(x + 24), GROUND + 10, 'dis-bank'));
    chang(w, x + 16, x + 12, x - 6, x + 2, 34);
  },
};

// ================================================================== DIS-07 (Husori): three more acts
/** DIS-07 act: the momentum beat: Majuli's bank on the way to the next village, gone a slab at a time behind you. */
export const husPaar: Act = {
  id: 'dis07-paar',
  w: 32,
  advice: 'Between villages the path runs along a bank the river is eating, from the water inland: don’t stop on it, run and hop slab to slab.',
  cps: [1.5],
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 24);
  },
  build: (w, c) => {
    const x = c.x;
    bank(w, [{ x: x + 5, w: 4, t: 230 }, { x: x + 10, w: 4, t: 320 }, { x: x + 15, w: 4, t: 410 }, { x: x + 20, w: 4, t: 500 }], x + 0.6, x - 4, x + 3, x + 25);
  },
};

/** DIS-07 act: the shelter beat: the tea boy on the ghat path; wait in the ghat. */
export const husGhat: Act = {
  id: 'dis07-ghat',
  w: 30,
  advice: 'The tea boy is bringing chah for the singers: get down into the ghat, let him walk over you and a few steps on, then climb out.',
  cps: [1.5],
  paint: (g, c) => {
    ghatPaint(g, c.x + 10, c.x + 14);
  },
  build: (w, c) => {
    ghatDraw(w, c.x + 10, c.x + 14);
    teaBoy(w, c.x + 28, c.x + 2, c.x + 5, [c.x + 10, c.x + 14], 44);
  },
};

/** DIS-07 act: the naamghar lane: three gates, the last with the host's gamosas. */
export const husLane: Act = {
  id: 'dis07-lane',
  w: 78,
  advice: 'One more lane of houses: three gates, and at the last the host hands out gamosas first, so wait in the ring till it opens.',
  cps: [1.5, 18.5, 24.5, 42.5, 48.5, 66.5],
  build: (w, c) => {
    const x = c.x;
    husori(w, x + 4, x, [{ x: x + 22, ritual: 0, stay: 200 }, { x: x + 46, ritual: 0, stay: 200 }, { x: x + 70, ritual: 170, stay: 330 }], 32);
  },
};

// ================================================================== DIS-08 (Gorh): two more acts
/** DIS-08 act: the jeep moves. The rhino charges at the first dust and stops halfway; then a second jeep revs near you. */
export const gorhJeep: Act = {
  id: 'dis08-jeep',
  w: 40,
  advice: 'This rhino stops halfway: it charges at a jeep in the middle of the field and rests there, so the strip only reaches halfway. Then a jeep close to you starts up, and it charges on, straight at it. Stand well back on the bank till it has come, rested and gone, then walk the whole strip.',
  cps: [1.5],
  paint: (g, c) => {
    g.pit(c.x + 5, c.x + 33);
  },
  build: (w, c) => {
    const x = c.x;
    const a = charge(w, { trig: px(x + 1), c0: x + 19, c1: x + 33, start: x + 36, plume: x + 19, delay: 160, rest: 90 });
    const b = charge(w, { trig: Infinity, c0: x + 5, c1: x + 18, start: x + 19, plume: x + 5, delay: 170, rest: 90 });
    w.onTick(() => {
      if (a.phase === 'gone' && b.phase === 'wait') {
        b.phase = 'noise';
        b.t = 0;
      }
    });
  },
};

/** DIS-08 act, the room's labelled twist (v3 08 row: the rhino charges the NEARER noise, not the louder): two jeeps rev at
 *  once, a big loud one far off on the right and a small one near you on the left. The rhino charges the near one. */
export const gorhDuiJeep: Act = {
  id: 'dis08-duijeep',
  w: 26,
  advice: 'Two jeeps start up at once: a big one, loud and smoking, far off to the right, and a small one right by you on the left. The rhino does not go for the louder: it charges the nearer, along a strip that ends at your bank. Stand back from the end of that strip, let it come and rest, then walk its strip.',
  cps: [1.5],
  paint: (g, c) => {
    g.pit(c.x + 6, c.x + 19);
  },
  build: (w, c) => {
    const x = c.x;
    charge(w, { trig: px(x + 5), c0: x + 6, c1: x + 20, start: x + 21, plume: x + 6, delay: 150, rest: 90 });
    w.add(
      new Decor((ctx, w2) => {
        // the loud jeep far off: a big plume and a rattle, that the rhino ignores
        const jx = px(x + 30);
        ctx.fillStyle = '#4E5B3A';
        ctx.fillRect(jx, GROUND - 18, 30, 12);
        ctx.fillStyle = 'rgba(120,110,100,0.5)';
        for (let k = 0; k < 4; k++) ctx.fillRect(jx - 6 - k * 6, GROUND - 26 - k * 8 - ((w2.tick >> 3) % 3), 10 + k * 4, 8);
      }, -2),
    );
  },
};

/** DIS-08 act: the jeep moves, from behind. The first charge comes from behind you on to a strip ahead; the haystack again. */
export const gorhBagori: Act = {
  id: 'dis08-bagori',
  w: 44,
  advice: 'The jeep is at the far end and the rhino starts behind you on the bank: up on the haystack platform. It stops halfway across, and then a jeep near the far end revs: it charges on. Off the hay only when it has gone the whole way.',
  cps: [1.5, 18, 31], // on the flattened strips, once both charges have gone by
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 3, x + 6, 13, 13, '=');
    g.pit(x + 11, x + 38);
  },
  build: (w, c) => {
    const x = c.x;
    // fix round 2 (QA B3): the halfway rest is back to 40 ticks; bagori's second play is about its own read (it comes
    // from behind: up on the hay, not on ahead into the grass), not jeep's "it only stopped halfway"
    const a = charge(w, { trig: px(x + 2), c0: x + 11, c1: x + 24, start: x - 4, plume: x + 24, delay: 170, rest: 40 });
    const b = charge(w, { trig: Infinity, c0: x + 25, c1: x + 38, start: x + 24, plume: x + 39, delay: 70, rest: 90 });
    w.onTick(() => {
      if (a.phase === 'gone' && b.phase === 'wait') {
        b.phase = 'noise';
        b.t = 0;
      }
    });
    w.add(
      new Decor((ctx) => {
        const x0 = px(x + 3);
        ctx.fillStyle = '#8D6B2E';
        ctx.fillRect(x0 + 2, px(13) + 3, 3, 29);
        ctx.fillRect(x0 + 58, px(13) + 3, 3, 29);
        ctx.fillStyle = '#D9B95A';
        ctx.fillRect(x0 + 6, px(13) + 6, 52, 26);
        ctx.fillStyle = '#B8A04A';
        ctx.fillRect(x0 - 2, px(13), 68, 4);
      }, -1),
    );
  },
};

// ================================================================== DIS-09 (Rang Ghar): two more acts
/** DIS-09 act: Rongali Bihu in the Rang Ghar ground: the husori group and three gates before the roof. */
export const rangBihu: Act = {
  id: 'dis09-bihu',
  w: 80,
  advice: 'Bihu in the Rang Ghar ground: the singers go through three gates on the way to the pavilion. Walk with them, inside their ring. At the middle gate they wait while the gamosas are handed out.',
  cps: [1.5, 18.5, 26.5, 42.5, 50.5, 68.5],
  build: (w, c) => {
    const x = c.x;
    husori(w, x + 4, x, [{ x: x + 22, ritual: 0, stay: 200 }, { x: x + 46, ritual: 170, stay: 330 }, { x: x + 72, ritual: 0, stay: 200 }], 32);
    sign(w, x + 0.6, 10.4, 3.4, 'RONGALI', 'shop', null, 'bihu');
  },
};

/** DIS-09 act: the widest oil: four tiles between rib and pad, so only a running leap clears it. */
export const rangWide: Act = {
  id: 'dis09-chaal3',
  w: 31,
  advice: 'The steepest stretch of the roof. Same as before: stop on each pad, back to its start, a run along it and one long leap; a jump from a standstill at the rib lands on the oil.',
  cps: [6.5],
  paint: (g, c) => {
    for (let i = 0; i < 3; i++) g.put(c.x + 8 + i * 7, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    roof(
      w,
      [
        { slick: x + 3, slickW: 2, push: 100, chute: -1, every: 0 },
        { slick: x + 9, slickW: 3, push: 200, chute: x + 10, every: 230 },
        { slick: x + 16, slickW: 3, push: 200, chute: x + 17, every: 230 },
        { slick: x + 23, slickW: 3, push: 200, chute: x + 24, every: 230 },
      ],
      x + 2,
    );
  },
};

// ================================================================== DIS-10 (Luit): three more acts
/** DIS-10 act: the sandbars with their post on the far bank once more, three marks. */
export const luitChar: Act = {
  id: 'dis10-char',
  w: 40,
  advice: 'Another channel, and its post is on the far bank again: wait on each bar for the siren and the dashed bar ahead, then go.',
  cps: [1.5],
  paint: (g, c) => {
    g.pit(c.x + 2, c.x + 31);
  },
  build: (w, c) => {
    const x = c.x;
    w.add(new River(px(x + 2), px(x + 32)));
    const f = sand(
      w,
      [
        [[x + 3, x + 8], [x + 3, x + 8], null],
        [null, [x + 11, x + 17], [x + 11, x + 13]],
        [null, null, [x + 19, x + 24]],
        [[x + 26, x + 31], [x + 26, x + 31], [x + 26, x + 31]],
      ],
      [px(x + 3) - 4, px(x + 11) - 4],
    );
    levelPost(w, f, x + 34.4, 3);
  },
};

/** DIS-10 act: the stilt house in the water, and the tea boy. */
export const luitChang: Act = {
  id: 'dis10-chang',
  w: 34,
  advice: 'Majuli’s stilt house in the water: wait on the bank till the tea boy comes and the ladder is let down, then up and over.',
  cps: [1.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 12, x + 24);
    g.fill(x + 16, x + 20, 11, 17, '#');
  },
  build: (w, c) => {
    const x = c.x;
    w.add(new River(px(x + 12), px(x + 16), GROUND + 10, 'dis-bank'));
    w.add(new River(px(x + 21), px(x + 25), GROUND + 10, 'dis-bank'));
    chang(w, x + 16, x + 12, x + 1, x + 11);
  },
};

/** DIS-10 act: the gamosa hosts, and a pit: hop the third giver. */
export const luitGamosa: Act = {
  id: 'dis10-gamosa',
  w: 30,
  advice: 'Guests at the last houses: four givers in a row and then a pit. Take two, then clear the third and the fourth in one long running jump: a little hop over the third lands you in the fourth one’s arms, and the cloth hides the pit.',
  cps: [1.0], // before the stall's reset at 1.2: no checkpoint just past a trigger
  paint: (g, c) => {
    g.pit(c.x + 22, c.x + 23);
  },
  build: (w, c) => {
    const x = c.x;
    stall(w, x);
    hosts(w, [['give', x + 6], ['give', x + 10], ['give', x + 14], ['give', x + 16]]);
    pitDanger(w, x + 22, x + 23);
    void machan;
  },
};

/** DIS-10 act: Kaziranga's moving jeep, once more. */
export const luitGorh: Act = { ...gorhJeep, id: 'dis10-gorh', advice: 'The tall grass and the rhino: it stops halfway at the first jeep, then charges on at the second, near you. Stand back on the bank till it has gone, then walk the strip.' };

// ------------------------------------------------------------------ second-round additions
/** a sandbar channel with three marks and its post at the near bank (used by DIS-06) */
export const majChar3: Act = {
  id: 'dis06-chapori3',
  w: 40,
  advice: 'A wide channel of moving sandbars, three marks on its post. At each siren wait for the dashed bar ahead to come up, then go at once: the bar you are on narrows or sinks a little later.',
  cps: [1.5],
  paint: (g, c) => {
    g.pit(c.x + 2, c.x + 31);
  },
  build: (w, c) => {
    const x = c.x;
    w.add(new River(px(x + 2), px(x + 32)));
    const f = sand(
      w,
      [
        [[x + 3, x + 8], [x + 3, x + 8], null],
        [null, [x + 11, x + 17], [x + 11, x + 13]],
        [null, null, [x + 19, x + 24]],
        [[x + 26, x + 31], [x + 26, x + 31], [x + 26, x + 31]],
      ],
      [px(x + 3) - 4, px(x + 11) - 4],
    );
    levelPost(w, f, x + 0.6, 3);
  },
};

/** the tea boy on Majuli's ferry ghat (used by DIS-06) */
export const majGhat: Act = {
  id: 'dis06-ghat',
  w: 30,
  advice: 'At the ferry ghat the tea boy is coming up the bank with his tray: down into the ghat, let him walk over you and a few steps on, then climb out.',
  cps: [1.5],
  paint: (g, c) => {
    ghatPaint(g, c.x + 10, c.x + 14);
  },
  build: (w, c) => {
    ghatDraw(w, c.x + 10, c.x + 14);
    teaBoy(w, c.x + 28, c.x + 2, c.x + 5, [c.x + 10, c.x + 14], 44);
  },
};

/** a Bhogali pitha pan over Majuli's channel (used by DIS-06) */
export const majPitha: Act = {
  id: 'dis06-pitha',
  w: 30,
  advice: 'Bhogali on Majuli: the pitha pan is set over the channel. Only ever on a shiny crepe, and leave before it dulls.',
  cps: [1.5],
  paint: (g, c) => {
    g.pit(c.x + 2, c.x + 22);
  },
  build: (w, c) => {
    const x = c.x;
    pitha(w, x + 2, x + 22, [{ x: x + 4, w: 5, o: 0 }, { x: x + 10, w: 5, o: 400 }, { x: x + 16, w: 5, o: 200 }], x + 1, { period: 600, liquid: 300 });
  },
};

/** one more moving-jeep field (used by DIS-08) */
export const gorhKohora: Act = { ...gorhJeep, id: 'dis08-kohora', advice: 'Kohora, the last field: the rhino stops halfway at the first jeep, then charges on at a second one near you. Stand back on the bank till it has gone, then walk the strip.' };

/** the tea boy, one last time (used by DIS-10) */
export const luitGhat: Act = { ...majGhat, id: 'dis10-ghat', advice: 'The tea boy on the ghat: down, let him walk over you and on, then out.' };
