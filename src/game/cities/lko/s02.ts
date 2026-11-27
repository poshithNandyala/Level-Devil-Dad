// LKO-02 Pehle Aap (after you). In Lucknow nobody goes through a doorway first: "pehle aap", after you.
// Here the old haveli's threshold stone is loose, and whoever goes first gets the hole.
import type { LevelDef, StageMeta, World } from '../../world';
import { collectible, door, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Grid } from '../../levels/grid';
import type { Act } from '../../levels/acts';
import { lines as L } from './lines';
import { tara as taraNow } from '../../levels/endkit';
import { Art, Block, FLOOR, Zone, bowIcon, gent, on, px, stillness, type Ctx } from './kit';

export const tara = (n: number, beaten = 0) => ({ intro: L.intro[n % L.intro.length], point: 1 as const, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[beaten % L.beaten.length] });
const SHERWANI = ['#5A8F7B', '#7A4E6E', '#C9A27E', '#3E5C76'];

/** an arched haveli doorway in lime plaster: the wall is solid above `open` px (the arch's top) */
export function archway(w: World, c: number, wTiles: number, topRow: number, openRows = 3, tint = '#EFE6D6') {
  const x0 = px(c),
    x1 = px(c + wTiles);
  const yTop = px(topRow),
    yOpen = FLOOR - px(openRows);
  w.add(new Block(x0, yTop, x1 - x0, yOpen - yTop, () => {}, 0));
  w.add(
    new Art((ctx) => {
      ctx.fillStyle = tint;
      ctx.fillRect(x0 - 6, yTop, x1 - x0 + 12, FLOOR - yTop);
      ctx.fillStyle = 'rgba(120,90,60,0.25)';
      ctx.fillRect(x0 - 6, yTop, x1 - x0 + 12, 3);
      for (let y = yTop + 8; y < FLOOR; y += 10) ctx.fillRect(x0 - 6, y, 3, 1);
      // the opening, a cusped Awadhi arch
      ctx.fillStyle = '#4A3A30';
      ctx.beginPath();
      ctx.moveTo(x0, FLOOR);
      ctx.lineTo(x0, yOpen + 8);
      ctx.quadraticCurveTo(x0 + 2, yOpen, (x0 + x1) / 2, yOpen - 6);
      ctx.quadraticCurveTo(x1 - 2, yOpen, x1, yOpen + 8);
      ctx.lineTo(x1, FLOOR);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#5A8F7B';
      ctx.lineWidth = 2;
      ctx.stroke();
      // the fish emblem of Awadh over the arch (two fish, drawn plain)
      ctx.fillStyle = '#5A8F7B';
      const mx = (x0 + x1) / 2,
        my = yOpen - 14;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(mx + s * 5, my, 4, 1.8, s * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }, -2),
  );
}

/** a loose threshold stone over a dark cellar: it drops the moment anyone stands on it */
export function looseStone(w: World, c: number, wTiles: number, cause = 'lko-pehle') {
  const x = px(c),
    ww = px(wTiles);
  const st = { down: false, shown: false };
  const stone = w.add(
    new Block(x, FLOOR, ww, 16, (ctx, b) => {
      if (!b.on) return;
      ctx.fillStyle = '#CDBFA8';
      ctx.fillRect(b.x, b.y, ww, 16);
      ctx.fillStyle = 'rgba(90,70,50,0.35)';
      ctx.fillRect(b.x + ww / 2, b.y, 1, 16);
      ctx.fillRect(b.x, b.y, ww, 1);
    }),
  );
  w.add(
    new Art((ctx) => {
      ctx.fillStyle = '#1E1612';
      ctx.fillRect(x, FLOOR, ww, 48);
      ctx.fillStyle = 'rgba(205,191,168,0.25)';
      for (let k = 0; k < 3; k++) ctx.fillRect(x + 2, FLOOR + 10 + k * 11, ww - 4, 1);
    }, -5),
  );
  const pit = w.add(new Zone(x + 1, FLOOR + 14, ww - 2, 40, cause));
  const drop = (w2: World) => {
    if (st.down) return;
    st.down = true;
    stone.set(false);
    w2.sfx('collapse', x + ww / 2, FLOOR);
    w2.emit('fx', x + ww / 2, FLOOR, { kind: 'crumble', w: ww });
  };
  w.onTick((w2) => {
    if (!st.down && on(w2, stone.solid)) drop(w2);
  });
  return { stone, drop, st, x, ww, pit };
}

type Who = { x: number; face: 1 | -1; bow: number; cloth: string; hop: number; y: number; hide?: boolean };
function drawWho(ctx: Ctx, g: Who) {
  if (g.hide) return;
  gent(ctx, g.x, g.y, 26, g.cloth, { face: g.face, bow: g.bow, topi: '#F5F0E6' });
}

// ================================================================ the room
function pehleRoom(): LevelDef {
  return {
    id: 'LKO-02',
    city: 'LKO',
    index: 2,
    name: 'Pehle Aap',
    nameEn: 'After you',
    tagline: 'In Lucknow nobody goes through a door first. Two gentlemen at an old haveli, and a threshold stone that has been loose for a hundred years.',
    hint: 'The first one through the doorway gets the loose stone. Walk into the two gentlemen and they push you through first. Stand still a moment (a bow) and one of them goes first: watch where the stone drops, then walk on when the other one offers, and hop the hole.',
    par: 14,
    map: Grid.ground(15).pit(15, 16).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      archway(w, 12, 2, 6);
      const hole = looseStone(w, 15, 2);
      pehleDoorway(w, 12, hole, 'room');
      sign(w, 5.2, 10.4, 3.6, 'HAVELI', 'shop', null, 'chowk');
      rival(w, 3, 15, 1, tara(0));
      onPass(w, px(6), (w2) => w2.guide('Zehmat na kijiye. | Please don’t trouble yourself.', (w3) => w3.flags.pehle?.s === 'block'));
      collectible(w, 'lko-malai', 20.5, 10.6);
    },
  };
}

/** two gentlemen at a doorway at column c (2 wide) with its loose stone: the room's rule */
export function pehleDoorway(w: World, c: number, hole: ReturnType<typeof looseStone>, key: string) {
  const still = stillness(w);
  bowIcon(w, still);
  const dx = px(c);
  const A: Who = { x: dx - 26, face: 1, bow: 0, cloth: SHERWANI[0], hop: 0, y: FLOOR };
  const B: Who = { x: dx - 44, face: 1, bow: 0, cloth: SHERWANI[1], hop: 0, y: FLOOR };
  const body = w.add(new Block(dx, FLOOR - 28, 32, 28, () => {}, 0));
  body.set(false);
  const S = { s: 'idle', t: 0, push: 0, offerAt: 0 };
  w.flags.pehle = S;
  (w.flags.pehles ??= []).push({ S, dx, hole, key });
  w.add(new Art((ctx) => [B, A].forEach((g) => drawWho(ctx, g)), 3));
  const set = (s: string, w2: World) => {
    S.s = s;
    S.t = w2.tick;
  };
  w.onTick((w2) => {
    const p = w2.player;
    const age = w2.tick - S.t;
    if (S.s === 'idle') {
      if (p.cx > dx - px(5)) set('step', w2);
    } else if (S.s === 'step') {
      // both step into the doorway together, and bow
      A.x = Math.min(dx + 20, A.x + 1.6);
      B.x = Math.min(dx + 10, B.x + 1.6);
      if (age > 16) {
        A.face = B.face = -1;
        body.set(true);
        set('block', w2);
        w2.say('Pehle aap, janab! | After you, sir!', dx + 16, FLOOR - 34, 2.2, 'npc');
      }
    } else if (S.s === 'block') {
      A.bow = B.bow = Math.min(1, age / 20);
      const touching = p.x + p.w >= dx - 1 && p.cx < dx;
      S.push = w2.input.right && touching ? S.push + 1 : 0;
      if (S.push > 30) {
        // you leaned in: so you go first. They make way and see you through, politely and firmly
        body.set(false);
        A.x = dx + 30;
        B.x = dx - 6;
        A.bow = B.bow = 0.3;
        p.vx = 230;
        p.stun = 46;
        w2.flags.twistRoom = 'pushed';
        w2.say('Nahin nahin, pehle aap! | No no, after you!', dx + 16, FLOOR - 34, 2, 'npc');
        set('gone', w2);
      } else if (still() > 36 && p.cx > dx - px(6)) {
        set('first', w2);
        w2.say('Pehle aap? Accha, pehle aap. | After you? Fine, after you.', dx + 16, FLOOR - 34, 2.4, 'npc');
      }
    } else if (S.s === 'first') {
      // A goes first: on to the stone, it drops, he skips over the hole like a man who knew
      A.face = 1;
      A.bow = Math.max(0, A.bow - 0.05);
      const sx = hole.x - 6,
        ex = hole.x + hole.ww + 10;
      if (A.x < sx) A.x += 1.1;
      else if (!hole.st.down) hole.drop(w2);
      else if (A.x < ex) {
        A.x += 1.6;
        const k = (A.x - sx) / (ex - sx);
        A.y = FLOOR - Math.sin(Math.PI * Math.min(1, k)) * 22;
      } else {
        A.y = FLOOR;
        set('offer', w2);
        B.face = -1;
        S.offerAt = w2.tick;
        w2.say('Pehle aap, janab! | After you, sir!', dx + 10, FLOOR - 34, 2.2, 'npc');
      }
    } else if (S.s === 'offer') {
      if (A.x < ex2(hole) + 40) A.x += 0.9;
      B.bow = Math.min(1, age / 16);
      const touching = p.x + p.w >= dx - 3 && p.cx < dx;
      if (w2.input.right && (touching || p.cx > dx - px(3))) {
        // you took his offer: he steps back into the alcove
        body.set(false);
        B.x = dx + 6;
        B.hide = false;
        B.bow = 0.6;
        set('open', w2);
      } else if (still() > 60 && age > 60) {
        // bowing again? Then he insists, and sees you through himself
        body.set(false);
        B.x = dx - 4;
        p.vx = 240;
        p.stun = 50;
        w2.flags.twistRoom = 'insisted';
        hole.pit.hazard.cause = 'lko-dhakka';
        w2.say('Nahin nahin, pehle aap! | No no, after you!', dx + 10, FLOOR - 34, 2, 'npc');
        set('gone', w2);
      }
    } else if (S.s === 'open' || S.s === 'gone') {
      if (A.x < ex2(hole) + 120) A.x += 0.9;
    }
  });
  const ex2 = (h: typeof hole) => h.x + h.ww;
  return S;
}

// ================================================================ the act: the gali behind the haveli
/** A man coming up behind you offers you the way first. Here the loose stone hasn't dropped yet. */
export const gali: Act = {
  id: 'lko02-gali',
  w: 30,
  advice: 'In the gali a gentleman comes up behind you and offers you the way: "pehle aap". Here the stone ahead hasn’t gone yet, so whoever goes first falls. Stand still and let him go first, then hop the hole he leaves.',
  cps: [18.5],
  paint: (g, c) => {
    g.pit(c.x + 12, c.x + 13);
  },
  build: (w, c) => {
    const x = c.x;
    archway(w, x + 9, 2, 7, 3, '#E7D9C3');
    const hole = looseStone(w, x + 12, 2);
    const still = stillness(w);
    const M: Who = { x: c.X(1), face: 1, bow: 0, cloth: SHERWANI[3], hop: 0, y: FLOOR, hide: true };
    const S = { s: 'wait', t: 0 };
    w.flags[c.f('man')] = S;
    w.add(new Art((ctx) => drawWho(ctx, M), 4));
    w.onTick((w2) => {
      const p = w2.player;
      const age = w2.tick - S.t;
      const set = (s: string) => {
        S.s = s;
        S.t = w2.tick;
      };
      if (S.s === 'wait') {
        if (p.cx > c.X(3)) {
          M.hide = false;
          M.x = c.X(1);
          set('offer');
          w2.say('Pehle aap, janab! | After you, sir!', M.x, FLOOR - 34, 2.2, 'npc');
        }
      } else if (S.s === 'offer') {
        if (M.x < p.cx - 22) M.x += 1.0;
        M.bow = Math.min(1, age / 16);
        if (still() > 36 && age > 20) {
          set('go');
          w2.say('Shukriya, aage chaliye. | Thank you, go ahead.', M.x, FLOOR - 34, 2.2, 'npc');
        }
      } else if (S.s === 'go') {
        M.bow = Math.max(0, M.bow - 0.05);
        const sx = hole.x - 6,
          ex = hole.x + hole.ww + 10;
        if (M.x < sx) M.x += 1.3;
        else if (!hole.st.down) hole.drop(w2);
        else if (M.x < ex) {
          M.x += 1.6;
          M.y = FLOOR - Math.sin((Math.PI * (M.x - sx)) / (ex - sx)) * 22;
        } else {
          M.y = FLOOR;
          set('done');
        }
      } else if (S.s === 'done') {
        if (M.x < c.X(29)) M.x += 0.8;
      }
    });
    sign(w, x + 4.2, 10.4, 3.4, 'GALI', 'shop', null, 'chowk');
  },
};

// ================================================================ act 2: takrar, the stand-off
/** One gentleman in a narrow doorway, and he bows back. Now it is a contest of manners: whoever stops
 *  bowing first goes first, on to the loose stone. Bow once and move, as you learned, and he insists:
 *  you first. Hold your bow until he gives up and goes first himself. */
export const takrar: Act = {
  id: 'lko02-takrar',
  w: 24,
  advice: 'One gentleman in a narrow doorway, and he bows back: whoever stops bowing first goes first, on to the loose stone. Bow once and move, as you learned, and he insists you go first. Stand still and keep bowing until he gives up and goes through himself, then hop the hole he leaves.',
  cps: [1, 16],
  paint: (g, c) => {
    g.pit(c.x + 13, c.x + 14);
  },
  build: (w, c) => {
    const x = c.x;
    const still = stillness(w);
    bowIcon(w, still);
    archway(w, x + 10, 2, 7, 3, '#E7D9C3');
    const hole = looseStone(w, x + 13, 2, 'lko-takrar');
    const dx = c.X(10);
    const G: Who = { x: dx + 16, face: -1, bow: 0, cloth: SHERWANI[2], hop: 0, y: FLOOR };
    const S = { s: 'wait', t: 0, push: 0, lied: false };
    w.flags[c.f('g')] = S;
    const body = w.add(new Block(dx, FLOOR - 28, 32, 28, () => {}, 0));
    w.add(new Art((ctx) => drawWho(ctx, G), 3));
    const set = (s: string, w2: World) => {
      S.s = s;
      S.t = w2.tick;
    };
    w.onTick((w2) => {
      const p = w2.player;
      const age = w2.tick - S.t;
      if (S.s === 'wait') {
        if (p.cx > dx - px(4)) set('bow', w2);
      } else if (S.s === 'bow') {
        G.bow = Math.min(1, age / 16);
        const touching = p.x + p.w >= dx - 1 && p.cx < dx;
        S.push = w2.input.right && touching ? S.push + 1 : 0;
        if (still() > 30) set('standoff', w2);
        else if (S.push > 30) {
          hole.pit.hazard.cause = 'lko-pehle';
          shove(w2, p, body, G, dx);
          set('gone', w2);
        }
      } else if (S.s === 'standoff') {
        G.bow = 1;
        if (!S.lied && age > 70) {
          S.lied = true;
          taraNow(w2, 'Shukriya, aage chaliye. | Thank you, go ahead.', 2.2);
        }
        // you stopped bowing first: so you go first
        if (still() === 0) {
          shove(w2, p, body, G, dx);
          set('gone', w2);
        } else if (age > 560) {
          // he gives up: 'Accha, pehle aap', and goes through himself
          body.set(false);
          w2.say('Pehle aap? Accha, pehle aap. | After you? Fine, after you.', dx + 16, FLOOR - 34, 2.4, 'npc');
          set('first', w2);
        }
      } else if (S.s === 'first') {
        G.face = 1;
        G.bow = Math.max(0, G.bow - 0.05);
        const sx = hole.x - 6,
          ex = hole.x + hole.ww + 10;
        if (G.x < sx) G.x += 1.1;
        else if (!hole.st.down) hole.drop(w2);
        else if (G.x < ex) {
          G.x += 1.6;
          G.y = FLOOR - Math.sin((Math.PI * (G.x - sx)) / (ex - sx)) * 22;
        } else {
          G.y = FLOOR;
          set('done', w2);
        }
      } else if (S.s === 'done') {
        if (G.x < c.X(23)) G.x += 0.8;
      }
    });
    sign(w, x + 4.2, 10.4, 3.4, 'TAKRAR', 'shop', null, 'pehle aap');
  },
};
/** a polite, firm shove through the doorway */
function shove(w: World, p: World['player'], body: Block, G: Who, dx: number) {
  body.set(false);
  G.x = dx - 4;
  G.bow = 0.3;
  p.vx = 240;
  p.stun = 50;
  w.say('Nahin nahin, pehle aap! | No no, after you!', dx + 16, FLOOR - 34, 2, 'npc');
}

// ================================================================ act 3: aadaab, the greeting you return
/** Along the lane the gentlemen on their chabutras greet you as you come up: "Aadaab". A greeting must be
 *  returned: stop for a short bow, then go on. Walk past without one and he steps out, offended, and
 *  shoves you on into the nala; bow on and on, as in the stand-off, and he insists: you first, into it. */
const AADAAB = [6, 16];
export const aadaab: Act = {
  id: 'lko02-aadaab',
  cp0: false,
  cps: [-2],
  w: 24,
  advice: 'Along the lane the gentlemen on their chabutras greet you as you come up: “Aadaab”. Return it with a short bow: stop a moment, then go on and hop the nala. Walk past without bowing and he shoves you in; bow on and on, as at the stand-off, and he insists you go first, into it.',
  paint: (g, c) => {
    for (const n of AADAAB) g.pit(c.x + n + 2, c.x + n + 3);
  },
  build: (w, c) => {
    const still = stillness(w);
    bowIcon(w, still);
    AADAAB.forEach((n, i) => {
      const S = { s: 'wait', t: 0, push: 0 };
      w.flags[c.f('g' + i)] = S;
      const G: Who = { x: c.X(n) + 8, face: -1, bow: 0, cloth: SHERWANI[(i + 1) % SHERWANI.length], hop: 0, y: FLOOR - 10 };
      w.add(
        new Art((ctx) => {
          // his chabutra, the raised stone seat by his door
          ctx.fillStyle = '#C8B48E';
          ctx.fillRect(c.X(n) - 6, FLOOR - 10, 28, 10);
          drawWho(ctx, G);
        }, 3),
      );
      const pit = w.add(new Zone(c.X(n + 2) + 1, FLOOR + 16, px(2) - 2, 30, 'lko-aadaab'));
      const shove = (w2: World, cause: string) => {
        const p = w2.player;
        pit.hazard.cause = cause;
        S.s = 'done';
        S.push = 45;
        p.stun = 50;
        G.bow = 0.3;
      };
      w.onTick((w2) => {
        const p = w2.player;
        const age = w2.tick - S.t;
        // a firm, polite shove: he walks you on, over the edge
        if (S.push > 0) (S.push--, (p.vx = 200));
        if (S.s === 'wait' && p.cx > c.X(n - 4)) {
          S.s = 'bowed';
          S.t = w2.tick;
          w2.say('Aadaab! | Respectful greetings!', c.X(n) + 8, FLOOR - 44, 1.6, 'npc');
        } else if (S.s === 'bowed') {
          G.bow = Math.min(1, age / 16);
          if (still() > 30) S.s = 'ok';
          else if (p.cx > c.X(n) - 4) shove(w2, 'lko-aadaab');
        } else if (S.s === 'ok') {
          G.bow = Math.max(0, G.bow - 0.04);
          if (still() > 240) shove(w2, 'lko-aadaab-zyada');
          else if (p.cx > c.X(n + 1)) S.s = 'done';
        }
      });
    });
    sign(w, c.x + 0.4, 10.4, 3.4, 'AADAAB', 'shop', null, 'chabutra');
  },
};

export const s02 = { room: pehleRoom, acts: [gali, takrar, aadaab] };
export const meta02 = { family: 'politeness-bow-sets-order', betrayals: ['bow-order'], ending: 'lko-kiwad' } as StageMeta;
