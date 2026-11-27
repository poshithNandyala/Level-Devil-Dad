// LKO-06 Kathak (the spin and the bells). Lucknow's Kathak is all grace, footwork and chakkar spins, with
// ghungroo on the ankles. On this stage the floor itself has bells in it: make one ring, and the dancer spins
// across the stage to the sound.
import type { LevelDef, StageMeta, World } from '../../world';
import type { Ending } from '../../levels/endkit';
import { lock, tara as taraNow } from '../../levels/endkit';
import { collectible, door, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Grid } from '../../levels/grid';
import type { Act } from '../../levels/acts';
import { Art, FLOOR, Zone, gent, px, stillness, TAU, type Ctx } from './kit';
import { tara } from './s02';

/** the dancer: poses at `home`; drawn to a sound, she spins along the floor to it, turns there, spins home */
export class Dancer {
  x: number;
  s: 'pose' | 'out' | 'turn' | 'back' = 'pose';
  target = 0;
  t = 0;
  z: Zone;
  spins = 0;
  constructor(
    w: World,
    readonly home: number,
    readonly speed = 210,
    cause = 'lko-chakkar',
    readonly floor = FLOOR,
  ) {
    this.x = home;
    this.z = w.add(new Zone(home - 9, floor - 28, 18, 28, cause));
    this.z.on = false;
    w.add(new Art((ctx, w2) => drawDancer(ctx, this, w2), 3));
    w.onTick((w2) => this.tick(w2));
  }
  call(w: World, x: number, cause?: string) {
    if (this.s !== 'pose' && this.s !== 'back') return;
    this.target = x;
    this.s = 'out';
    this.t = w.tick;
    if (cause) this.z.hazard.cause = cause;
    w.sfx('bells', x, FLOOR - 4);
    w.flags.chakkar = (w.flags.chakkar ?? 0) + 1;
  }
  tick(w: World) {
    const step = this.speed / 120;
    if (this.s === 'out') {
      const d = this.target - this.x;
      this.x += Math.sign(d) * Math.min(Math.abs(d), step);
      if (Math.abs(d) < 1) {
        this.s = 'turn';
        this.t = w.tick;
      }
    } else if (this.s === 'turn') {
      if (w.tick - this.t > 60) this.s = 'back';
    } else if (this.s === 'back') {
      const d = this.home - this.x;
      this.x += Math.sign(d) * Math.min(Math.abs(d), 1);
      if (Math.abs(d) < 1) this.s = 'pose';
    }
    this.z.on = this.s === 'out' || this.s === 'turn';
    this.z.x = this.x - 9;
  }
}
export function drawDancer(ctx: Ctx, d: Dancer, w: World) {
  const x = d.x,
    f = d.floor;
  const spin = d.s === 'out' || d.s === 'turn';
  const t = w.tick * 0.35;
  // the angarkha flares into a bell when she spins
  const flare = spin ? 11 : 5;
  ctx.fillStyle = '#C2485B';
  ctx.beginPath();
  ctx.moveTo(x - 3, f - 18);
  ctx.lineTo(x + 3, f - 18);
  ctx.lineTo(x + flare, f - 3);
  ctx.lineTo(x - flare, f - 3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#E8C547';
  ctx.fillRect(x - flare, f - 4, flare * 2, 1.5);
  if (spin) {
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1;
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.ellipse(x, f - 10, flare + 2, 3, 0, t + k * 2, t + k * 2 + 1.2);
      ctx.stroke();
    }
  }
  ctx.fillStyle = '#F2EEE4';
  ctx.fillRect(x - 2, f - 3, 4, 3);
  ctx.fillStyle = '#7A4E6E';
  ctx.fillRect(x - 3, f - 24, 6, 7);
  ctx.fillStyle = '#B07A52';
  ctx.beginPath();
  ctx.arc(x, f - 27, 3, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#1D1A1A';
  ctx.beginPath();
  ctx.arc(x + 1, f - 28, 3, Math.PI, TAU);
  ctx.fill();
  // arms: up in the pose, out in the spin
  ctx.strokeStyle = '#B07A52';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  if (spin) {
    ctx.moveTo(x - 9 * Math.cos(t), f - 22);
    ctx.lineTo(x + 9 * Math.cos(t), f - 22);
  } else {
    ctx.moveTo(x - 3, f - 22);
    ctx.lineTo(x - 6, f - 31);
    ctx.moveTo(x + 3, f - 22);
    ctx.lineTo(x + 7, f - 26);
  }
  ctx.stroke();
}

/** ghungroo strips set in the stage floor, columns [c0, c1]: step on one and it rings */
export function strips(w: World, spans: [number, number][], onRing: (w: World, x: number) => void, look: 'ring' | 'tap' = 'ring') {
  w.add(
    new Art((ctx, w2) => {
      for (const [c0, c1] of spans) {
        const x0 = px(c0),
          x1 = px(c1 + 1);
        ctx.fillStyle = look === 'tap' ? '#8D6E63' : '#7B1F1F';
        ctx.fillRect(x0, FLOOR - 1, x1 - x0, 5);
        ctx.fillStyle = '#E8C547';
        for (let x = x0 + 3; x < x1 - 1; x += 4) {
          ctx.beginPath();
          ctx.arc(x, FLOOR + 1.5, 1.4, 0, TAU);
          ctx.fill();
        }
        if (look === 'tap' && (w2.tick >> 4) % 2) {
          ctx.strokeStyle = 'rgba(232,197,71,0.7)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc((x0 + x1) / 2, FLOOR, 10, Math.PI * 1.1, Math.PI * 1.9);
          ctx.stroke();
        }
      }
    }, -1),
  );
  const prev = spans.map(() => false);
  w.onTick((w2) => {
    const p = w2.player;
    spans.forEach(([c0, c1], i) => {
      const onIt = p.onGround && p.y + p.h >= FLOOR - 1 && p.x + p.w > px(c0) + 2 && p.x < px(c1 + 1) - 2;
      if (onIt && !prev[i]) onRing(w2, px(c0) + (px(c1 + 1) - px(c0)) / 2);
      prev[i] = onIt;
    });
  });
}

/** the stage: polished boards with a carved border, a little dais at the back */
function boards(w: World, c0: number, c1: number) {
  w.add(
    new Art((ctx) => {
      const x0 = px(c0),
        x1 = px(c1 + 1);
      ctx.fillStyle = '#8D5A3B';
      ctx.fillRect(x0, FLOOR - 2, x1 - x0, 2);
      ctx.fillStyle = 'rgba(255,230,190,0.15)';
      for (let x = x0; x < x1; x += 16) ctx.fillRect(x, FLOOR - 2, 1, 2);
    }, -2),
  );
}

// ================================================================ the room
function kathakRoom(): LevelDef {
  return {
    id: 'LKO-06',
    city: 'LKO',
    index: 6,
    name: 'Kathak',
    nameEn: 'The spin and the bells',
    tagline: 'An evening of Lucknow Kathak: footwork, chakkar after chakkar, and ghungroo. This stage has ghungroo of its own, set in the floor.',
    hint: 'The red strips have bells in them: step on one and it rings, and the dancer spins across the floor to the sound, through anything in the way. Hop over the red strips on to the plain boards. Near her, she is tapping the board in front of her: that one rings too. Go over it, along the takht.',
    par: 18,
    map: Grid.ground(15).fill(19, 24, 13, 13, '=').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      boards(w, 0, 31);
      const d = new Dancer(w, px(27) + 8);
      w.flags.dancer = d;
      strips(w, [[7, 7], [12, 12], [17, 17], [22, 23]], (w2, x) => d.call(w2, x, 'lko-chakkar'));
      strips(w, [[20, 21]], (w2, x) => d.call(w2, x, 'lko-tatkar'), 'tap');
      w.add(
        new Art((ctx) => {
          // the takht: a low wooden platform with a white chandni sheet, for the musicians
          ctx.fillStyle = '#F5F1E8';
          ctx.fillRect(px(19), px(13), px(6), 4);
          ctx.fillStyle = '#6D4C33';
          ctx.fillRect(px(19), px(13) + 4, px(6), 3);
          for (const c of [19, 24]) ctx.fillRect(px(c) + 2, px(13) + 7, 3, FLOOR - px(13) - 7);
        }, 1),
      );
      sign(w, 2.2, 10.4, 3.6, 'MAHOTSAV', 'shop', null, 'kathak');
      rival(w, 3, 15, 1, tara(4));
      onPass(w, px(4), (w2) => w2.guide('Wah! | Wow!', (w3) => !w3.flags.chakkar));
      collectible(w, 'lko-ghungroo', 21.5, 10.6);
    },
  };
}

// ================================================================ the act: where she isn't tapping
/** She dances tatkar along the stage, to and fro: the boards right in front of her feet ring with her. Hop
 *  over the ringing patch as it comes at you, never on to it; ring a red strip and she spins at you. */
export const tatkar: Act = {
  id: 'lko06-tatkar',
  w: 34,
  advice: 'Now she dances tatkar to and fro along the stage, and the boards just in front of her feet ring with her steps. Go where she isn’t tapping: wait for her patch to come towards you, hop clean over it, and keep off the red strips.',
  cps: [18],
  build: (w, c) => {
    const x = c.x;
    boards(w, x, x + 33);
    const d = new Dancer(w, c.X(31) + 8, 230, 'lko-tatkar');
    w.flags[c.f('dancer')] = d;
    const T = { x: c.X(20), v: -0.45, lo: c.X(5), hi: c.X(22) };
    w.flags[c.f('tap')] = T;
    strips(w, [[x + 24, x + 24], [x + 28, x + 28]], (w2, xx) => d.call(w2, xx, 'lko-chakkar'));
    const patch = w.add(
      new Zone(T.x - 12, FLOOR - 3, 24, 3, 'lko-tatkar', (ctx, z, w2) => {
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(z.x, FLOOR - 1, z.w, 4);
        ctx.strokeStyle = 'rgba(232,197,71,0.8)';
        ctx.lineWidth = 1;
        for (let k = 0; k < 3; k++) {
          const r = 6 + (((w2.tick >> 1) + k * 10) % 30);
          ctx.beginPath();
          ctx.arc(z.x + z.w / 2, FLOOR, r * 0.7, Math.PI * 1.1, Math.PI * 1.9);
          ctx.stroke();
        }
        // her little feet doing the tatkar at the back of the patch
        ctx.fillStyle = '#C2485B';
        ctx.fillRect(z.x + z.w / 2 - 3, FLOOR - 10, 6, 8);
        ctx.fillStyle = '#E8C547';
        ctx.fillRect(z.x + z.w / 2 - 4, FLOOR - 3, 8, 1.5);
      }, 1),
    );
    w.onTick(() => {
      T.x += T.v;
      if (T.x < T.lo || T.x > T.hi) T.v = -T.v;
      patch.x = T.x - 12;
    });
    sign(w, x + 0.4, 10.4, 3.4, 'TATKAR', 'shop', null, 'ta thei');
  },
};

// ================================================================ the door: sam, the last stamp
/** The door is shut until the dance ends. She comes across in three chakkars along the floor, and on her
 *  last stamp (sam) the door opens. Keep up on the musicians' takht till she has stamped. */
export const sam: Ending = {
  space: 14,
  advice: 'The door stays shut till the dance ends: she comes spinning along the floor, three chakkars and a stamp, and the door opens on the stamp. Wait up on the musicians’ takht, off the floor, till she has stamped, then go.',
  paint: (g, D) => {
    g.fill(D - 9, D - 6, 13, 13, '=');
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    const L = lock(w, d, 'Intezaar kis baat ka? | Waiting for what?');
    const dn = new Dancer(w, px(D - 13) + 8, 150, 'lko-chakkar');
    w.flags.sam = { dn, n: 0 };
    w.flags.twist = 'dance';
    let go = -1,
      n = 0,
      stamped = false;
    w.onTick((w2) => {
      if (go < 0 && w2.player.cx > px(D - 9)) go = w2.tick + 20;
      if (go < 0 || stamped || w2.tick < go) return;
      if (dn.s === 'pose' && n < 3) {
        n++;
        dn.call(w2, px(D - 13 + n * 4) + 8);
      } else if (dn.s === 'turn' && n === 3 && !stamped) {
        stamped = true;
        w2.sfx('thud', dn.x, FLOOR);
        w2.emit('shake', dn.x, FLOOR, { amount: 2 });
        w2.flags.twist = 'sam';
        L.unlock();
      }
      // she doesn't spin home in between: each chakkar starts where the last one ended
      if (dn.s === 'back') {
        (dn as { s: string }).s = 'pose';
      }
    });
    w.add(
      new Art((ctx) => {
        ctx.fillStyle = '#F5F1E8';
        ctx.fillRect(px(D - 9), px(13), px(4), 4);
        ctx.fillStyle = '#6D4C33';
        ctx.fillRect(px(D - 9), px(13) + 4, px(4), 3);
        for (const c of [D - 9, D - 6]) ctx.fillRect(px(c) + 2, px(13) + 7, 3, FLOOR - px(13) - 7);
      }, 1),
    );
    w.when(
      (w2) => w2.player.cx > px(D - 12),
      (w2) => taraNow(w2, 'Shukriya, aage chaliye. | Thank you, go ahead.', 2.2),
    );
  },
};

// ================================================================ act 2: the mehfil, her chakkars end to end
/** The full performance: she spins the length of the stage and back without stopping, and the floor is
 *  hers. The musicians' takhts are the only place out of her way. Ring a strip and she turns back at once,
 *  towards the sound. */
const MEHFIL = [6, 16, 26, 36, 46];
export const mehfil: Act = {
  id: 'lko06-mehfil',
  w: 58,
  advice: 'The full performance: she spins the length of the stage and back, end to end, and the floor is hers. Wait up on a takht till she has spun past beneath you, going away, then cross to the next takht, over the red strip. Ring a strip and she turns straight back towards you.',
  cps: [1, 6.6, 16.6, 26.6, 36.6, 46.6],
  paint: (g, c) => {
    for (const t of MEHFIL) g.fill(c.x + t, c.x + t + 5, 13, 13, '=');
  },
  build: (w, c) => {
    const x = c.x;
    boards(w, x, x + 57);
    const D = { x: c.X(54), v: -1.5, go: false, lo: c.X(4) + 8, hi: c.X(54) };
    w.flags[c.f('d')] = D;
    const z = w.add(new Zone(D.x - 9, FLOOR - 28, 18, 28, 'lko-mehfil'));
    const look = { x: D.x, s: 'out', floor: FLOOR } as unknown as Dancer;
    w.add(new Art((ctx, w2) => drawDancer(ctx, look, w2), 3));
    strips(
      w,
      MEHFIL.slice(0, -1).map((t) => [x + t + 7, x + t + 7] as [number, number]),
      (w2, sx) => {
        D.v = (sx > D.x ? 1 : -1) * Math.abs(D.v);
        w2.sfx('bells', sx, FLOOR - 4);
        // she is coming to the bells you rang: that death has its own line (till she turns at an end)
        z.hazard.cause = 'lko-ghungroo';
      },
    );
    w.onTick((w2) => {
      if (!D.go && w2.player.cx > c.X(1)) D.go = true;
      if (D.go) {
        D.x += D.v;
        if (D.x < D.lo) (D.v = Math.abs(D.v)), (z.hazard.cause = 'lko-mehfil');
        if (D.x > D.hi) (D.v = -Math.abs(D.v)), (z.hazard.cause = 'lko-mehfil');
      }
      z.x = D.x - 9;
      (look as unknown as { x: number }).x = D.x;
    });
    w.add(
      new Art((ctx) => {
        for (const t of MEHFIL) {
          ctx.fillStyle = '#F5F1E8';
          ctx.fillRect(c.X(t), px(13), px(6), 4);
          ctx.fillStyle = '#6D4C33';
          ctx.fillRect(c.X(t), px(13) + 4, px(6), 3);
          ctx.fillRect(c.X(t) + 2, px(13) + 7, 3, FLOOR - px(13) - 7);
          ctx.fillRect(c.X(t) + 91, px(13) + 7, 3, FLOOR - px(13) - 7);
        }
      }, 1),
    );
    sign(w, x + 0.4, 10.4, 3.4, 'MEHFIL', 'shop', null, 'kathak');
  },
};

// ================================================================ act: tihai, the phrase played three times
/** The tabla plays a tihai: one phrase three times over, landing on sam. The grey strips have their bells
 *  tied up in cloth and stay silent through the first two phrases; on the sam that ends the third, every bell
 *  on the stage rings, tied or not, and she spins to it. Count the phrases; on the third, be on plain board. */
const TIHAI = { first: 200, phrase: 80, cycle: 420, boards: [9, 18], bw: 4 };
/** `reps` phrases land on sam; with `bow`, the plain boards are chikan covers over bells: stand still on one
 *  and that's a bow, it rings */
export const makeTihai = (id: string, reps: number, bow: boolean, cause: string, advice: string, word: string): Act => ({
  id,
  w: 30,
  advice,
  cp0: false,
  cps: bow ? [-2, 28] : [-2, 9.2, 18.2],
  build: (w, c) => {
    const x = c.x;
    boards(w, x, x + 29);
    const d = new Dancer(w, c.X(12) + 8, 420, cause);
    const still = stillness(w);
    let chase = -1;
    const T = { t0: -1 };
    w.flags[c.f('t')] = T;
    const spans: [number, number][] = [];
    let from = 4;
    for (const b of TIHAI.boards) {
      spans.push([x + from, x + b - 1]);
      from = b + TIHAI.bw;
    }
    spans.push([x + from, x + 26]);
    // which phrase is playing now (1-3), 0 in the rest after sam; and is this the tick of sam
    const at = (w2: World) => {
      if (T.t0 < 0) return { n: 0, sam: false, k: -1 };
      const e = w2.tick - T.t0;
      const k = e < TIHAI.first ? e - TIHAI.first + TIHAI.cycle : (e - TIHAI.first) % TIHAI.cycle;
      const intoTihai = k - (TIHAI.cycle - reps * TIHAI.phrase);
      const n = intoTihai >= 0 ? 1 + Math.floor(intoTihai / TIHAI.phrase) : 0;
      return { n, sam: e >= TIHAI.first && k === 0, k };
    };
    w.flags[c.f('at')] = at;
    w.add(
      new Art((ctx, w2) => {
        for (const [c0, c1] of spans) {
          const x0 = px(c0),
            x1 = px(c1 + 1);
          ctx.fillStyle = '#9E9890';
          ctx.fillRect(x0, FLOOR - 1, x1 - x0, 5);
          ctx.fillStyle = '#C9C2B6';
          for (let xx = x0 + 3; xx < x1 - 1; xx += 6) ctx.fillRect(xx, FLOOR - 1, 3, 3);
        }
        // the tabla player at the back, and his three lamps: one lights for each phrase
        const a = at(w2);
        const tx = c.X(14) + 8;
        gent(ctx, tx, px(9), 20, '#F2EEE4', { face: 1, arms: a.n ? 0.6 + 0.3 * Math.sin(w2.tick * 0.6) : 0.3, skin: '#9C6B48' });
        for (let k = 0; k < 3; k++) {
          ctx.fillStyle = a.n > k ? '#FFD54F' : '#5A5047';
          ctx.beginPath();
          ctx.arc(tx - 12 + k * 12, px(9) - 34, 3, 0, TAU);
          ctx.fill();
        }
        ctx.fillStyle = '#6D4C33';
        ctx.fillRect(tx - 16, px(9), 32, 4);
      }, -1),
    );
    w.onTick((w2) => {
      const p = w2.player;
      if (T.t0 < 0 && p.cx > c.X(2)) T.t0 = w2.tick;
      // sam is her fastest chakkar, and it comes to you: she follows you for a moment, not just the sound
      if (w2.tick < chase && d.s === 'out') d.target = p.cx;
      // the covered boards: a pause there is a bow, and the bells under the cover ring
      const onBoard = p.onGround && TIHAI.boards.some((b) => p.cx > c.X(b) && p.cx < c.X(b + TIHAI.bw));
      if (bow && onBoard && still() > 40) {
        d.call(w2, p.cx, 'lko-tehzeeb');
        chase = w2.tick + 45;
      }
      const a = at(w2);
      if (!a.sam) return;
      w2.sfx('bells', p.cx, FLOOR - 4);
      w2.emit('shake', c.X(14), FLOOR, { amount: 1.5 });
      const onStrip = p.onGround && p.y + p.h >= FLOOR - 1 && spans.some(([c0, c1]) => p.x + p.w > px(c0) + 2 && p.x < px(c1 + 1) - 2);
      if (onStrip) {
        d.call(w2, p.cx, cause);
        chase = w2.tick + 45;
      }
    });
    if (bow)
      w.add(
        new Art((ctx) => {
          for (const b of TIHAI.boards) {
            ctx.fillStyle = '#F5F1E8';
            ctx.fillRect(c.X(b), FLOOR - 2, px(TIHAI.bw), 3);
            ctx.fillStyle = '#E8C547';
            for (let xx = c.X(b) + 2; xx < c.X(b + TIHAI.bw); xx += 6) ctx.fillRect(xx, FLOOR + 1, 2, 1.5);
          }
        }, 0),
      );
    sign(w, x + 0.4, 10.4, 3.2, word, 'shop', null, 'dha');
  },
});
export const tihai = makeTihai(
  'lko06-tihai',
  3,
  false,
  'lko-tihai',
  'The tabla plays a tihai: one phrase three times over, and the third lands on sam. The grey strips have their bells tied up and stay silent for the first two; on sam every bell on the stage rings, tied or not, and she spins to it. Count the three lamps on the tabla: when the third lights, be on plain board.',
  'TIHAI',
);

// ================================================================ act: guru, the student mirrors her
/** The guru's rule: the student mirrors her. At every stamp of her foot Dad's left and right swap, and at
 *  the next stamp they swap back. Every stamp is a change of state: press the other way, at once. Go back
 *  over a red strip and it rings; stand still on her floor and that's a bow, and she spins to you. */
const GURU = { first: 70, every: 150, strips: [4, 9, 14, 19], from: 3, to: 23 };
export const makeGuru = (id: string, flip: boolean, advice: string, word: string): Act => ({
  id,
  w: 28,
  cp0: false,
  cps: [-2.5, 25.5],
  advice,
  build: (w, c) => {
    const x = c.x;
    boards(w, x, x + 27);
    const d = new Dancer(w, c.X(12) + 8, 420, 'lko-ghungroo');
    const G = { t0: -1, n: 0, last: -99 };
    let chase = -1;
    w.flags[c.f('g')] = G;
    strips(
      w,
      GURU.strips.map((s) => [x + s, x + s] as [number, number]),
      (w2, sx) => {
        d.call(w2, sx, 'lko-ghungroo');
        chase = w2.tick + 90;
      },
    );
    const still = stillness(w);
    w.onTick((w2) => {
      const p = w2.player;
      const inside = p.cx > c.X(GURU.from) && p.cx < c.X(GURU.to);
      if (G.t0 < 0 && inside) G.t0 = w2.tick;
      if (G.t0 >= 0 && G.n < 99) {
        const e = w2.tick - G.t0 - GURU.first;
        if (e >= 0 && e % GURU.every === 0) {
          G.n++;
          G.last = w2.tick;
          w2.sfx('thud', c.X(26), FLOOR);
          w2.emit('shake', c.X(26), FLOOR, { amount: 1.5 });
          if (flip && G.n % 2) w2.flipControls(999);
          else w2.flipUntil = -1;
        }
      }
      // past her floor the stamps stop, and the controls come back to you
      if (p.cx >= c.X(GURU.to) && G.n < 99) {
        G.n = 99;
        w2.flipUntil = -1;
      }
      if (inside && still() > 50) {
        d.call(w2, p.cx, 'lko-chakkar');
        chase = w2.tick + 90;
      }
      // she spins to the sound and follows you for a moment
      if (w2.tick < chase && d.s === 'out') d.target = p.cx;
    });
    w.add(
      new Art((ctx, w2) => {
        // the guru at the end of her floor: her foot comes down on each stamp, a ring of sound goes out
        const k = w2.tick - G.last;
        gent(ctx, c.X(26) + 8, FLOOR, 25, '#F2EEE4', { face: -1, arms: k < 20 ? 1 : 0.5, skin: '#9C6B48', dupatta: '#C2485B' });
        if (k < 40) {
          ctx.strokeStyle = `rgba(232,197,71,${1 - k / 40})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(c.X(26) + 8, FLOOR, 6 + k * 2, Math.PI, TAU);
          ctx.stroke();
        }
        // which way round you are now: a little mirrored hand over her head
        if (w2.flipped) {
          ctx.fillStyle = '#E8C547';
          ctx.fillText('⇄', c.X(26) + 4, FLOOR - 40);
        }
      }, 3),
    );
    sign(w, x + 0.4, 10.4, 3.2, word, 'shop', null, flip ? 'ulta' : 'seedha');
  },
});
export const guru = makeGuru(
  'lko06-guru',
  true,
  'The guru’s rule: the student mirrors her. At every stamp of her foot your left and right swap, and at the next stamp they swap back. Each stamp is a change: press the other way at once. Go back over a red strip and it rings; stop still on her floor and that is a bow, and she spins to you.',
  'GURU',
);

export const s06 = { room: kathakRoom, acts: [tatkar, tihai, guru, mehfil] };
export const meta06 = { family: 'sound-draws-dancer-spin', betrayals: ['sound-draws'], ending: 'lko-sam' } as StageMeta;
