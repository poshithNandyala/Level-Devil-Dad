// Endings: the last surprise at each stage's door. Every stage has its own and no two share one:
// these 39, plus the nine old twists in twists.ts (each of those is used by exactly one stage too).
// An ending can carve its own ground (paint), ask for more road before the door (space), and keeps
// w.flags.twist up to date with what it's doing, which the test policies read.
import { Entity, type Hazard, type World } from '../world';
import { FLOOR, tt, npc, tara, hits, LAGOON, RIVER, Paint, Mover, text, lock, person, doorPic } from './endkit';
import { Door } from '../entities/basics';
import { Gust, Thing } from '../entities/traps';
import { DT, secs, TILE } from '../constants';
import { px, shot } from './kit';
import { pool } from './acts';
import type { Grid } from './grid';
import { FONT, rr } from '../../render/art/common';
import { drawDoor } from '../../render/art/tiles';
import { THEMES } from '../../render/theme';

export type { Ending } from './endkit';
import type { Ending } from './endkit';
import { NEW_ENDINGS, type NewEndingKind } from './endings2';
import { WEST_ENDINGS, type WestEndingKind } from './endings3';

export type EndingKind =
   | 'loading' | 'reflection' | 'glider' | 'trapdoor'
  | 'token' | 'bull' | 'catch' | 'rangoli' | 'tips'
  | 'shuffle' | 'mirror' | 'lamp' | 'bells' | 'mime' | 'fakewin'
  | 'revolve' | 'pull' | 'wrap' | 'invisible' | 'cctv'
  | 'key' | 'swing' | 'mirchi' | 'speed' | 'monkey' | 'dejavu' | 'whirlwind'
  | 'otp' | 'biryani' | 'gravity' | 'tiny' | 'cannon' | 'backdoor' | 'slowmo'
  | 'bollywood' | 'kabaddi' | 'dahihandi' | 'credits'
  | NewEndingKind
  | WestEndingKind
  // each city module's own endings (declared in its endings.ts, see docs/CITY-MODULE.md)
  | keyof ModuleEndingKinds;

/** filled in by city modules: `declare module` this to add an ending kind */
export interface ModuleEndingKinds {}

const OLD_ENDINGS: Record<Exclude<EndingKind, NewEndingKind | WestEndingKind | keyof ModuleEndingKinds>, Ending> = {

  // ================================================================ Kavaratti
  /** Island internet: the bridge to the door is a progress bar. It loads slower than you walk,
   *  sticks at 99%, and then the connection drops. */
  loading: {
    space: 12,
    advice: 'The bridge is still loading: walk behind the bar, never past its end, and jump the last bit at 99% before the connection drops.',
    paint: (g, D) => void g.pit(D - 7, D - 1),
    build(w, d) {
      const x0 = d.x - px(7),
        full = px(7),
        stop = full - 22;
      pool(w, x0 / TILE, d.x / TILE, 15.35, { colors: LAGOON });
      const bar = w.add(new Thing('plank', x0, FLOOR, { w: 1, h: 6, layer: 1 }));
      bar.visible = false;
      bar.solid.collidable = false;
      let L = 0,
        state: 'idle' | 'loading' | 'stalled' | 'lost' = 'idle',
        t0 = 0,
        rest = 0;
      w.add(
        new Paint((ctx, w2) => {
          // the empty frame across the gap, the loaded part, and the percentage
          ctx.strokeStyle = 'rgba(255,255,255,0.45)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 2]);
          ctx.strokeRect(x0 + 0.5, FLOOR + 0.5, full - 1, 5);
          ctx.setLineDash([]);
          if (L >= 1) {
            const g = ctx.createLinearGradient(x0, 0, x0 + L, 0);
            g.addColorStop(0, '#2E7D32');
            g.addColorStop(1, state === 'lost' ? '#E53935' : '#76FF03');
            ctx.fillStyle = g;
            ctx.fillRect(x0, FLOOR, L, 6);
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            for (let i = (w2.tick * 0.6) % 10; i < L; i += 10) ctx.fillRect(x0 + i, FLOOR + 1, 3, 1);
          }
          if (state !== 'idle') {
            const pct = state === 'stalled' ? 99 : Math.min(99, Math.floor((L / stop) * 99));
            const tag = state === 'lost' ? 'NO SIGNAL' : `${pct}%`;
            text(ctx, tag, x0 + Math.max(L, 12), FLOOR - 9, 7, state === 'lost' ? '#FF8A80' : '#E8F5E9');
            // a signal icon that never fills
            const sx = x0 + full / 2,
              sy = FLOOR - 40;
            for (let i = 0; i < 4; i++) {
              ctx.fillStyle = i < (state === 'lost' ? 0 : 1 + ((w2.tick >> 5) % 2)) ? '#FFFFFF' : 'rgba(255,255,255,0.25)';
              ctx.fillRect(sx - 8 + i * 4, sy - i * 3, 3, 3 + i * 3);
            }
            text(ctx, state === 'lost' ? '✕' : '2G', sx + 12, sy - 4, 6, '#FFFFFF');
          }
        }, 1),
      );
      w.flags.twist = 'idle';
      w.flags.barTip = x0;
      w.onTick((w2) => {
        const p = w2.player;
        if (state === 'idle') {
          if (rest > 0) rest--;
          else if (p.onGround && p.x + p.w > x0 - px(2.5) && p.x < x0) {
            state = 'loading';
            t0 = w2.tick;
            tara(w2, 'Island net, Dad. The bridge is still loading! | Island internet. The bridge is still loading!', 2.6);
          }
        } else if (state === 'loading') {
          L = Math.min(stop, L + 40 * DT);
          if (L >= stop) {
            state = 'stalled';
            t0 = w2.tick;
            npc(w2, '99%... 99%... 99%...', x0 + L, FLOOR - 22, 1.4);
          }
        } else if (state === 'stalled') {
          if (w2.tick - t0 > secs(1.5)) {
            state = 'lost';
            w2.sfx('crack', x0 + L, FLOOR);
            npc(w2, 'Connection lost! | Connection lost!', x0 + L, FLOOR - 22, 1.2);
          }
        } else {
          L = Math.max(0, L - 150 * DT);
          if (L <= 0) {
            state = 'idle';
            rest = 80;
          }
        }
        bar.solid.w = Math.max(1, Math.round(L));
        bar.solid.collidable = L >= 1;
        w2.flags.twist = state;
        w2.flags.barTip = x0 + L;
      });
    },
  },

  /** There's no door on the jetty. There's one in the water: its reflection. Dive into it. */
  reflection: {
    advice: 'No door on the jetty? Look in the water: jump right into the door’s reflection. Anywhere else, you drown.',
    paint: (g, D) => void g.pit(D - 4, D + 4),
    build(w, d) {
      d.hidden = true;
      // the water must stay in sight: Tara's subtitles go to the top of the screen here
      w.flags.subTop = 1;
      const gx0 = d.x - 6,
        gx1 = d.x + 22;
      pool(w, (d.x - px(4)) / TILE, gx0 / TILE, 15.3, { colors: LAGOON });
      pool(w, gx1 / TILE, d.x / TILE + 6, 15.3, { colors: LAGOON });
      w.flags.twist = 'look';
      w.flags.gap = [gx0, gx1];
      w.add(
        new Paint((ctx, w2) => {
          const lv = 15.3 * TILE,
            t = tt(w2);
          // the water over the gap: the same lagoon, just harmless
          const g = ctx.createLinearGradient(0, lv, 0, lv + 40);
          g.addColorStop(0, LAGOON[0]);
          g.addColorStop(1, LAGOON[1]);
          ctx.fillStyle = g;
          ctx.fillRect(gx0, lv, gx1 - gx0, 60);
          // the door upside down in the water, wobbling, glowing
          ctx.save();
          ctx.beginPath();
          ctx.rect(gx0 - 10, lv, gx1 - gx0 + 20, 48);
          ctx.clip();
          ctx.globalAlpha = 0.55 + Math.sin(t * 3) * 0.12;
          ctx.translate(d.x + 8 + Math.sin(t * 2.2) * 0.8, lv + 2);
          ctx.scale(1 + Math.sin(t * 4) * 0.04, -1);
          doorPic(ctx, w2, -8, -34, 1);
          ctx.restore();
          ctx.strokeStyle = 'rgba(255,255,255,0.5)';
          ctx.lineWidth = 0.8;
          for (let i = 0; i < 3; i++) {
            const yy = lv + 6 + i * 9;
            ctx.beginPath();
            ctx.moveTo(d.x - 2 + Math.sin(t * 3 + i) * 2, yy);
            ctx.lineTo(d.x + 18 + Math.sin(t * 3 + i) * 2, yy);
            ctx.stroke();
          }
        }, 6),
      );
      let told = false;
      w.onTick((w2) => {
        if (told || w2.player.x < d.x - px(9)) return;
        told = true;
        tara(w2, 'Door evide? Vellathil nokku, Dad! | Where’s the door? Look in the water, Dad!', 3);
      });
      w.when(
        (w2) => w2.player.y + w2.player.h > FLOOR + 5 && w2.player.x >= gx0 && w2.player.x + w2.player.w <= gx1,
        (w2) => {
          w2.sfx('splash', d.x + 8, FLOOR);
          w2.emit('fx', d.x + 8, FLOOR + 4, { kind: 'splash' });
          w2.flags.twist = 'dived';
          w2.win('door');
        },
      );
    },
  },

  /** The door is across the bay from the cliff. Grab the paraglider and float over; mind the gulls. */
  glider: {
    space: 16,
    advice: 'Grab the paraglider at the cliff edge, then jump off: it floats you over the bay. Go just after a gull has flown past.',
    paint: (g, D) => void g.pit(D - 12, D - 1),
    build(w, d) {
      pool(w, d.x / TILE - 12, d.x / TILE, 15.45, { colors: LAGOON });
      const gx = d.x - px(14.4),
        gy = FLOOR - 30;
      let worn = false,
        landed = false;
      // the wing on its post, then over Dad's head
      w.add(
        new Paint((ctx, w2) => {
          const p = w2.player;
          const draw = (x: number, y: number, open: number) => {
            ctx.fillStyle = '#FF7043';
            ctx.beginPath();
            ctx.ellipse(x, y, 8 + open * 7, 3.2, 0, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = '#FFCA28';
            ctx.fillRect(x - 2, y - 3.2, 4, 3.2);
            ctx.strokeStyle = 'rgba(40,30,30,0.7)';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(x - 8 - open * 7, y);
            ctx.lineTo(x, y + 14);
            ctx.lineTo(x + 8 + open * 7, y);
            ctx.stroke();
          };
          if (!worn) {
            ctx.fillStyle = '#6D4C41';
            ctx.fillRect(gx + 7, gy, 2, 30);
            draw(gx + 8, gy + 2, 0);
            text(ctx, 'PARAGLIDE ₹99', gx + 8, gy - 8, 5, '#FFF3E0');
          } else if (!landed && !p.dead) draw(p.cx, p.y - 13, 1);
        }, 4),
      );
      // gulls skim over the bay, one every 2.6 s
      w.onTick((w2) => {
        const p = w2.player;
        if (!worn && hits(p, gx + 2, gy - 4, 12, 30)) {
          worn = true;
          p.fallCap = 34;
          w2.sfx('collect', gx + 8, gy);
          tara(w2, 'Varkala style! Chaadu, Dad, float! | Paraglider! Jump off and float!', 2.4);
        }
        if (worn && !landed && p.onGround && p.x > d.x - px(1)) {
          landed = true;
          p.fallCap = null;
        }
        if (p.x > d.x - px(17) && w2.tick % 312 === 0) shot(w2, 'crow', d.x + px(1), 168, -150, 0, 0, 'hit');
        w2.flags.twist = landed ? 'landed' : worn ? 'worn' : 'none';
      });
    },
  },

  /** The exit is a hatch in the pier floor. Walking over it does nothing: land on it. */
  trapdoor: {
    advice: 'The exit is the hatch in the floor: walking over it does nothing, so jump and land on it.',
    build(w, d) {
      d.hidden = true;
      const x = d.x - 8;
      w.add(
        new Paint((ctx, w2) => {
          ctx.fillStyle = '#4E342E';
          ctx.fillRect(x, FLOOR - 2, 32, 3);
          ctx.strokeStyle = '#FFD54F';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, FLOOR - 1.5, 31, 2.5);
          ctx.fillStyle = '#FFD54F';
          ctx.fillRect(x + 14, FLOOR - 2, 4, 1);
          const bob = Math.sin(w2.tick * 0.12) * 1.5;
          text(ctx, 'EXIT', x + 16, FLOOR - 18 + bob, 6, '#FFD54F');
          text(ctx, '↓', x + 16, FLOOR - 10 + bob, 8, '#FFD54F');
        }, -1),
      );
      let told = -999;
      w.flags.twist = 'off';
      w.onTick((w2) => {
        const p = w2.player;
        const over = p.cx > x + 3 && p.cx < x + 29 && p.onGround;
        w2.flags.twist = over ? 'over' : 'off';
        if (!over) return;
        if (w2.tick - p.landTick <= 2) {
          w2.sfx('slide', x + 16, FLOOR);
          return w2.win('door');
        }
        if (w2.tick - told > 200) {
          told = w2.tick;
          npc(w2, 'Chaadi keru! | Jump on it!', x + 16, FLOOR - 28, 1.2);
        }
      });
    },
  },

  // ================================================================ Chennai
  /** Token system: press the machine's button when NOW SERVING shows 7. Thala for a reason. */
  token: {
    space: 10,
    advice: 'The door works on tokens: walk into the token machine’s button exactly when the board shows 7. Any other number and they send you to the back.',
    build(w, d) {
      const L = lock(w, d, 'Token irukka? | Got a token?');
      const mx = d.x - px(4);
      const m = w.add(new Thing('crate', mx, FLOOR - 16, { w: 14, h: 16, layer: 1 }));
      m.visible = false;
      const NUM = 41;
      const now = (w2: World) => 1 + (Math.floor(w2.tick / NUM) % 9);
      let prev = false,
        cool = 0,
        got = 0;
      w.add(
        new Paint((ctx, w2) => {
          // the machine
          ctx.fillStyle = '#B0BEC5';
          rr(ctx, mx, FLOOR - 16, 14, 16, 2);
          ctx.fill();
          ctx.fillStyle = '#37474F';
          ctx.fillRect(mx + 3, FLOOR - 13, 8, 3);
          ctx.fillStyle = cool > 0 ? '#FFEB3B' : '#E53935';
          ctx.beginPath();
          ctx.arc(mx + 1.5, FLOOR - 6, 2, 0, Math.PI * 2);
          ctx.arc(mx + 12.5, FLOOR - 6, 2, 0, Math.PI * 2);
          ctx.fill();
          // NOW SERVING over the door
          const n = now(w2);
          ctx.fillStyle = '#111';
          rr(ctx, d.x - 14, d.y - 26, 44, 20, 3);
          ctx.fill();
          text(ctx, 'NOW SERVING', d.x + 8, d.y - 21, 4, '#B0BEC5', '');
          text(ctx, L.open ? '7 ✓' : String(n), d.x + 8, d.y - 12, 9, n === 7 || L.open ? '#FFD54F' : '#FF5252', '');
          if (got && !L.open) text(ctx, `you: ${got}`, mx + 7, FLOOR - 24, 5, '#FFFFFF');
        }, 2),
      );
      w.flags.twist = 'wait';
      w.onTick((w2) => {
        w2.flags.tokenN = now(w2);
        w2.flags.tokenT = w2.tick % NUM;
        if (L.open) return;
        if (cool > 0) cool--;
        const p = w2.player;
        const touch = p.y + p.h > FLOOR - 16 && ((p.x + p.w >= mx - 1 && p.x + p.w <= mx + 1 && p.inputDir > 0) || (p.x >= mx + 13 && p.x <= mx + 15 && p.inputDir < 0));
        if (touch && !prev && cool === 0) {
          const n = now(w2);
          got = n;
          w2.sfx('beep', mx + 7, FLOOR - 16);
          if (n === 7) {
            npc(w2, 'Token 7! Thala for a reason! | Token 7! Thala for a reason!', d.x + 8, d.y - 34, 1.6);
            w2.emit('fx', mx + 7, FLOOR - 20, { kind: 'confetti' });
            L.unlock();
          } else {
            npc(w2, `Token ${n}? Line-la nillunga! | Token ${n}? Back of the queue!`, mx + 7, FLOOR - 26, 1.2);
            cool = 40;
            p.vx = p.cx < mx + 7 ? -190 : 190;
            p.stun = 14;
            w2.sfx('shove', p.cx, p.y);
          }
        }
        prev = touch;
      });
    },
  },

  /** Jallikattu: a brick wall stands before the door, too high to jump. The bull is behind you.
   *  Let it charge, leap it at the last moment, and it smashes the wall for you. */
  bull: {
    space: 14,
    advice: 'The wall is too high to climb, but the bull isn’t picky: let it charge at you, jump straight up as it arrives, and it smashes the wall. Then mind it on the way back.',
    build(w, d) {
      const wallX = d.x - px(2),
        penX = d.x - px(14);
      const wall = w.add(new Thing('pillar', wallX, FLOOR - 64, { w: 16, h: 64, layer: 1 }));
      wall.visible = false;
      let up = true;
      w.add(
        new Paint((ctx) => {
          if (!up) return;
          for (let r = 0; r < 8; r++)
            for (let c = 0; c < 2; c++) {
              ctx.fillStyle = (r + c) % 2 ? '#B5533C' : '#A0452F';
              ctx.fillRect(wallX + c * 8 - (r % 2) * 4 + (r % 2 && c === 0 ? 4 : 0), FLOOR - 64 + r * 8, r % 2 && c === 0 ? 4 : 8, 7);
            }
          ctx.fillStyle = 'rgba(255,255,255,0.12)';
          ctx.fillRect(wallX, FLOOR - 64, 16, 2);
        }, 1),
        );
      // the pen gate behind you
      w.add(
        new Paint((ctx, w2) => {
          ctx.fillStyle = '#5D4037';
          ctx.fillRect(penX + 20, FLOOR - 30, 3, 30);
          const open = state !== 'pen' ? 1 : 0;
          ctx.save();
          ctx.translate(penX + 21, FLOOR - 26);
          ctx.rotate(-open * 1.3);
          for (let i = 0; i < 3; i++) ctx.fillRect(0, i * 8, 18, 2.5);
          ctx.restore();
          void w2;
        }, -2),
      );
      let state: 'pen' | 'snort' | 'charge' | 'dazed' | 'back' | 'gone' = 'pen',
        t0 = 0;
      const bull = w.add(
        new Mover(penX - 8, FLOOR - 20, 28, 20, 'gored', (ctx, m, w2) => {
          if (state === 'gone') return;
          const f = m.vx < 0 ? -1 : 1;
          ctx.save();
          ctx.translate(m.x + 14, m.y);
          ctx.scale(f, 1);
          const bob = state === 'charge' || state === 'back' ? Math.sin(w2.tick * 0.9) * 1 : 0;
          ctx.fillStyle = '#5D4037';
          rr(ctx, -12, 5 + bob, 22, 11, 4);
          ctx.fill();
          ctx.fillStyle = '#3E2723';
          ctx.fillRect(-11, 14, 3, 6);
          ctx.fillRect(5, 14, 3, 6);
          ctx.fillStyle = '#4E342E';
          rr(ctx, 7, 3 + bob, 9, 9, 3);
          ctx.fill();
          ctx.strokeStyle = '#EFEBE9';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(10, 4 + bob);
          ctx.quadraticCurveTo(13, -2 + bob, 17, -1 + bob);
          ctx.stroke();
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(13, 6 + bob, 1.5, 1.5);
          // a garland, it's festival time
          ctx.fillStyle = '#FFB300';
          for (let i = 0; i < 4; i++) ctx.fillRect(6 + i * 1.6, 11 + bob + (i % 2), 1.4, 1.4);
          if (state === 'dazed') {
            ctx.fillStyle = '#FFEB3B';
            for (let i = 0; i < 3; i++) {
              const a = w2.tick * 0.15 + (i * Math.PI * 2) / 3;
              ctx.fillRect(10 + Math.cos(a) * 6, -4 + Math.sin(a) * 2, 2, 2);
            }
          }
          ctx.restore();
        }),
      );
      bull.on = false;
      w.flags.twist = 'pen';
      w.onTick((w2) => {
        const p = w2.player;
        if (state === 'pen' && p.x > d.x - px(9)) {
          state = 'snort';
          t0 = w2.tick;
          w2.sfx('snort', penX, FLOOR - 20);
          tara(w2, 'Jallikattu! Maadu varudhu, Dad! | Jallikattu! The bull is coming, Dad!', 2.2);
        } else if (state === 'snort' && w2.tick - t0 > secs(0.7)) {
          state = 'charge';
          bull.on = true;
          bull.vx = 230;
        } else if (state === 'charge') {
          bull.x += bull.vx * DT;
          if (up && bull.x + bull.w >= wallX) {
            bull.x = wallX - bull.w;
            up = false;
            wall.hide();
            state = 'dazed';
            t0 = w2.tick;
            bull.vx = 0;
            w2.sfx('crack', wallX + 8, FLOOR - 32);
            w2.emit('shake', wallX + 8, FLOOR - 30, { amount: 5 });
            w2.emit('fx', wallX + 8, FLOOR - 32, { kind: 'crumble', w: 16 });
            npc(w2, 'Dhamaal! | Smash!', wallX + 8, FLOOR - 70, 1.1);
          }
        } else if (state === 'dazed' && w2.tick - t0 > secs(1.8)) {
          state = 'back';
          bull.vx = -230;
          w2.sfx('snort', bull.x, FLOOR - 20);
        } else if (state === 'back') {
          bull.x += bull.vx * DT;
          if (bull.x < penX - px(3)) {
            state = 'gone';
            bull.on = false;
          }
        }
        w2.flags.twist = state;
        w2.flags.bullX = bull.x;
        w2.flags.bullW = bull.w;
      });
    },
  },

  /** Gully cricket: the batsman skies it. Catch it (be under it when it comes down) and he's out. */
  catch: {
    space: 12,
    advice: 'The batsman won’t leave the doorway till he’s out: run under the ball (watch its shadow) and catch it. Drop it and he hits another.',
    build(w, d) {
      const L = lock(w, d, 'Batting-la irukken! | I’m still batting!');
      const bx = d.x + 20;
      const spots = [d.x - px(9) + 8, d.x - px(3.5) + 8, d.x - px(11) + 8];
      let state: 'wait' | 'flying' | 'dropped' | 'out' = 'wait',
        n = 0,
        t0 = 0,
        bxNow = 0,
        byNow = 0;
      const T = 1.75;
      const pos = (k: number) => {
        const sx = bx - 2,
          sy = FLOOR - 16,
          ex = spots[n % 3],
          ey = FLOOR - 4;
        return { x: sx + (ex - sx) * k, y: sy + (ey - sy) * k - 190 * 4 * k * (1 - k) };
      };
      w.add(
        new Paint((ctx, w2) => {
          // the batsman by the door, with the stumps
          if (state !== 'out') {
            person(ctx, bx + 4, FLOOR - 16, 16, '#F5F5F5', '#8D5524', { cap: '#1565C0' });
            ctx.strokeStyle = '#D7B377';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(bx - 1, FLOOR - 8);
            ctx.lineTo(bx - 7, FLOOR - 16 - (state === 'flying' && tt(w2) - t0 < 0.15 ? 6 : 0));
            ctx.stroke();
          }
          ctx.fillStyle = '#EFEBE9';
          for (let i = 0; i < 3; i++) ctx.fillRect(bx + 14 + i * 2.5, FLOOR - 12, 1.4, 12);
          if (state === 'flying') {
            const k = Math.min(1, (tt(w2) - t0) / T);
            const sp = spots[n % 3];
            ctx.fillStyle = `rgba(0,0,0,${0.12 + k * 0.3})`;
            ctx.beginPath();
            ctx.ellipse(sp, FLOOR - 0.5, 3 + k * 5, 1.4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#C62828';
            ctx.beginPath();
            ctx.arc(bxNow, byNow, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.arc(bxNow, byNow, 2, 0.3, 2.6);
            ctx.stroke();
          }
        }, 3),
      );
      w.flags.twist = 'wait';
      const hit = (w2: World) => {
        state = 'flying';
        t0 = tt(w2);
        w2.sfx('crack', bx, FLOOR - 12);
        npc(w2, n === 0 ? 'SIXER! | SIX!' : 'Innoru! | Another one!', bx, FLOOR - 30, 1);
      };
      w.onTick((w2) => {
        const p = w2.player;
        if (state === 'wait' && p.x > d.x - px(8)) {
          hit(w2);
          tara(w2, 'Pudi, Dad! Catch pudi! | Catch it, Dad!', 2);
        } else if (state === 'flying') {
          const k = (tt(w2) - t0) / T;
          const b = pos(Math.min(1, k));
          bxNow = b.x;
          byNow = b.y;
          if (k > 0.5 && b.x > p.x - 3 && b.x < p.x + p.w + 3 && b.y > p.y - 4 && b.y < p.y + p.h) {
            state = 'out';
            w2.sfx('clap', p.cx, p.y);
            npc(w2, 'HOWZAT! Out! | HOWZAT! He’s out!', p.cx, p.y - 12, 1.6);
            L.unlock();
          } else if (k >= 1) {
            state = 'dropped';
            t0 = tt(w2);
            w2.sfx('thud', b.x, FLOOR);
            npc(w2, 'Catch vittutiye! | Dropped it!', b.x, FLOOR - 20, 1);
          }
        } else if (state === 'dropped' && tt(w2) - t0 > 1.0) {
          n++;
          hit(w2);
        }
        w2.flags.twist = state === 'out' ? 'open' : state;
        w2.flags.ballX = spots[n % 3];
      });
    },
  },

  /** A fresh kolam in front of the door. Step on it and Paati sends you back: jump straight into the door. */
  rangoli: {
    advice: 'Never step on the kolam in front of the door: Paati sends you back. Jump from before it straight into the door.',
    build(w, d) {
      const x0 = d.x - 60,
        x1 = d.x - 2;
      w.add(
        new Paint((ctx, w2) => {
          const cols = ['#E91E63', '#FFC107', '#00BCD4', '#8BC34A', '#FFFFFF'];
          const cx = (x0 + x1) / 2;
          for (let i = 0; i < 5; i++) {
            ctx.fillStyle = cols[(i + Math.floor(w2.tick / 40)) % 5];
            ctx.beginPath();
            ctx.ellipse(cx, FLOOR - 0.6, (x1 - x0) / 2 - i * 5, 2.2 - i * 0.2, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = '#FFFFFF';
          for (let i = 0; i < 9; i++) ctx.fillRect(x0 + 4 + i * 6, FLOOR - 1.2, 1.2, 1.2);
        }, -1),
      );
      w.flags.twist = 'kolam';
      w.onTick((w2) => {
        const p = w2.player;
        if (!(p.onGround && p.cx > x0 + 2 && p.cx < x1) || w2.state !== 'play') return;
        npc(w2, 'Kolam mela kaal vekkaadhe! | Don’t step on my kolam!', d.x - 30, d.y - 12, 1.4);
        w2.sfx('whistle', p.cx, p.y);
        w2.warp(d.x - px(9), FLOOR - p.h, 'blink');
      });
    },
  },

  /** The door creaks... and topples flat towards you. Stop short, let it fall, walk in. */
  tips: {
    advice: 'When the door creaks, stop and back off: it falls flat towards you. Then walk in over it.',
    build(w, d) {
      let state: 'up' | 'creak' | 'falling' | 'down' = 'up',
        t0 = 0;
      w.add(
        new Paint((ctx, w2) => {
          if (state === 'up') return;
          // the empty doorway, then the panel coming down towards you
          ctx.fillStyle = 'rgba(20,14,10,0.85)';
          ctx.fillRect(d.x + 1, d.y + 1, 14, 31);
          let a = 0;
          if (state === 'creak') a = Math.sin((w2.tick - t0) * 0.9) * 0.04;
          else if (state === 'falling') a = Math.min(1, (w2.tick - t0) / 30) ** 2 * (Math.PI / 2);
          else a = Math.PI / 2;
          ctx.save();
          ctx.translate(d.x, FLOOR);
          ctx.rotate(-a);
          ctx.fillStyle = '#8D6E63';
          ctx.fillRect(0, -32, 16, 32);
          ctx.strokeStyle = '#4E342E';
          ctx.lineWidth = 1;
          ctx.strokeRect(0.5, -31.5, 15, 31);
          ctx.fillStyle = '#FFD54F';
          ctx.fillRect(12, -17, 2, 2);
          ctx.restore();
        }, 2),
      );
      w.flags.twist = 'up';
      w.onTick((w2) => {
        const p = w2.player;
        const gap = d.x - (p.x + p.w);
        if (state === 'up' && gap < px(3.5) && gap > -6 && p.y + p.h > d.y) {
          state = 'creak';
          t0 = w2.tick;
          d.hidden = true;
          w2.sfx('creak', d.x + 8, d.y);
          npc(w2, 'Kreeeech... | Creeeak...', d.x + 8, d.y - 8, 0.9);
        } else if (state === 'creak' && w2.tick - t0 > secs(0.38)) {
          state = 'falling';
          t0 = w2.tick;
        } else if (state === 'falling' && w2.tick - t0 >= 30) {
          state = 'down';
          w2.sfx('thud', d.x - 16, FLOOR);
          w2.emit('shake', d.x - 16, FLOOR, { amount: 4 });
          w2.emit('fx', d.x - 16, FLOOR, { kind: 'dust', w: 32 });
          if (p.x + p.w > d.x - 33 && p.x < d.x + 1 && p.y + p.h > FLOOR - 10) w2.die('crushed');
          else {
            d.hidden = false;
            npc(w2, 'Bommai kadhavu! | A toy door!', d.x + 8, d.y - 8, 1);
          }
        }
        w2.flags.twist = state;
      });
    },
  },

  // ================================================================ Puducherry
  /** Three blue doors of the French quarter. The real one glows, then they shuffle like a shell game.
   *  Pick wrong and you're bounced out, and they shuffle again. Jump over the wrong ones. */
  shuffle: {
    space: 12,
    advice: 'Watch the glowing door while the three shuffle, then go to it. Jump over the others: walk into a wrong one and it bounces you out.',
    build(w, d) {
      const xs = [d.x - px(6), d.x - px(3), d.x];
      const doors = [d, w.add(new Door(0, 14)), w.add(new Door(0, 14))];
      const slot = [2, 0, 1];
      doors.forEach((o, i) => (o.x = xs[slot[i]]));
      let state: 'idle' | 'show' | 'shuffle' | 'pick' = 'idle',
        t0 = 0,
        round = 0;
      const ROUNDS: [number, number][][] = [
        [[1, 2], [0, 1], [0, 2], [1, 2], [0, 1], [0, 2]],
        [[0, 2], [1, 2], [0, 1], [1, 2], [0, 2], [0, 1], [1, 2]],
        [[0, 1], [1, 2], [0, 2], [0, 1], [1, 2], [0, 2], [0, 1], [1, 2]],
      ];
      const SW = 38;
      // the real one glows gold while you watch
      w.add(
        new Paint((ctx, w2) => {
          if (state !== 'show') return;
          const k = 0.5 + Math.sin(w2.tick * 0.3) * 0.5;
          ctx.fillStyle = `rgba(255,215,64,${0.25 + k * 0.35})`;
          ctx.beginPath();
          ctx.ellipse(d.x + 8, d.y + 16, 16, 22, 0, 0, Math.PI * 2);
          ctx.fill();
          text(ctx, '★', d.x + 8, d.y - 10, 9, '#FFD740');
        }, -3),
      );
      const bounce = (w2: World) => {
        if (state !== 'pick') return;
        const p = w2.player;
        p.vx = -230;
        p.stun = 18;
        w2.sfx('shove', p.cx, p.y);
        npc(w2, 'Non non non! Mauvaise porte! | No no no! Wrong door!', p.cx, p.y - 14, 1.3);
        state = 'show';
        t0 = w2.tick;
        round++;
      };
      doors.forEach((o) => (o.onReach = o === d ? (w2) => (state === 'pick' ? w2.win('door') : undefined) : bounce));
      w.flags.twist = 'idle';
      w.onTick((w2) => {
        const p = w2.player;
        if (state === 'idle' && p.x > d.x - px(11)) {
          state = 'show';
          t0 = w2.tick;
          tara(w2, 'Bonjour! Watch the golden door, Dad... | Watch the golden door, Dad...', 2.2);
        } else if (state === 'show' && w2.tick - t0 > secs(1.1)) {
          state = 'shuffle';
          t0 = w2.tick;
        } else if (state === 'shuffle') {
          const seq = ROUNDS[round % ROUNDS.length];
          const k = w2.tick - t0;
          const i = Math.floor(k / SW);
          if (i >= seq.length) {
            state = 'pick';
            doors.forEach((o, j) => {
              o.x = xs[slot[j]];
              o.y = d.y;
            });
          } else {
            const [a, b] = seq[i];
            const f = (k % SW) / SW;
            if (k % SW === 0) w2.sfx('slide', xs[1] + 8, d.y);
            doors.forEach((o, j) => {
              const s = slot[j];
              if (s === a || s === b) {
                const to = s === a ? b : a;
                const e = f * f * (3 - 2 * f);
                o.x = xs[s] + (xs[to] - xs[s]) * e;
                o.y = 208 - Math.sin(Math.PI * f) * (s === a ? 26 : 9);
                if (k % SW === SW - 1) slot[j] = to;
              } else {
                o.x = xs[s];
                o.y = 208;
              }
            });
          }
        }
        w2.flags.twist = state;
        w2.flags.realX = d.x;
        w2.flags.fakeXs = doors.slice(1).map((o) => o.x);
      });
    },
  },

  /** Miroir: near the door the whole picture turns into its mirror image. Your buttons don't. */
  mirror: {
    space: 11,
    advice: 'Near the door the screen turns into its mirror image, but right is still right: trust your thumbs, not your eyes, and jump both spike rows.',
    build(w, d) {
      for (const k of [7, 3]) w.add(new Thing('spikerow', d.x - px(k), FLOOR - 10, { solid: false, deadly: 'spikes', layer: -1, w: 32 }));
      w.flags.twist = 'mirror';
      w.flags.spikes = [d.x - px(7), d.x - px(3)];
      let said = false;
      w.onTick((w2) => {
        const on = w2.player.x > d.x - px(10) && w2.state === 'play';
        if (on && !said) {
          said = true;
          w2.sfx('blink', w2.player.cx, w2.player.y);
          tara(w2, 'Miroir! Right is still right, Dad! | Mirror! Right is still right, Dad!', 2.4);
        }
        w2.flags.view = on ? 'mirror' : 0;
      });
    },
  },

  /** At six the street lamp comes on, and the door only exists in its light. In the dark the paving
   *  in front of it bristles with spikes. */
  lamp: {
    advice: 'The door is only there while the lamp is lit, and in the dark spikes come up in front of it: wait outside the light, then dash in the moment it comes on.',
    build(w, d) {
      const P = 2.5,
        ON = 0.95;
      const lit = (w2: World) => tt(w2) % P < ON;
      const sx = d.x - px(3);
      const sp = w.add(new Thing('spikerow', sx, FLOOR + 1, { solid: false, deadly: 'spikes', layer: -4, w: 48 }));
      w.add(
        new Paint((ctx, w2) => {
          ctx.fillStyle = '#263238';
          ctx.fillRect(d.x + 20, d.y - 40, 3, 72);
          ctx.fillRect(d.x + 8, d.y - 40, 15, 3);
          const on = lit(w2);
          const flick = on && tt(w2) % P > ON - 0.28 && w2.tick % 8 < 4;
          ctx.fillStyle = on && !flick ? '#FFF59D' : '#546E7A';
          ctx.fillRect(d.x + 6, d.y - 37, 7, 4);
          if (!on || flick) return;
          const g = ctx.createRadialGradient(d.x + 9, d.y - 30, 0, d.x + 6, d.y + 12, 58);
          g.addColorStop(0, 'rgba(255,236,160,0.7)');
          g.addColorStop(1, 'rgba(255,236,160,0)');
          ctx.fillStyle = g;
          ctx.fillRect(d.x - 52, d.y - 40, 110, 76);
        }, -3),
      );
      let was = true,
        said = false;
      w.onTick((w2) => {
        const on = lit(w2);
        d.hidden = !on;
        if (on !== was) {
          sp.moveTo(w2, sx, on ? FLOOR + 1 : FLOOR - 10, 0.06, 'out');
          if (!on) w2.sfx('spikes', sx + 24, FLOOR);
          was = on;
        }
        if (!said && w2.player.x > d.x - px(8)) {
          said = true;
          tara(w2, 'Six o’clock! The door only lives in the lamplight! | The door only lives in the lamplight!', 2.6);
        }
        w2.flags.twist = on ? 'lit' : 'dark';
        w2.flags.litFor = on ? tt(w2) % P : -1;
      });
    },
  },

  /** The church bells: jump exactly on three chimes in a row and the church door opens. */
  bells: {
    space: 10,
    advice: 'The church door opens for those who keep time: jump exactly on the bell, three chimes in a row. Off the beat and you start again.',
    build(w, d) {
      const L = lock(w, d, 'Attendez la cloche! | Wait for the bell!');
      const BEAT = 96,
        WIN = 14;
      let streak = 0,
        lastBeat = -1,
        jumpedOn = -1;
      const bx = d.x + 8,
        by = d.y - 30;
      w.add(
        new Paint((ctx, w2) => {
          const ph = (w2.tick % BEAT) / BEAT;
          const swing = Math.sin(ph * Math.PI * 2) * 0.35;
          ctx.fillStyle = '#ECEFF1';
          ctx.fillRect(bx - 12, by - 14, 24, 3);
          ctx.save();
          ctx.translate(bx, by - 11);
          ctx.rotate(swing);
          ctx.fillStyle = '#C9A227';
          ctx.beginPath();
          ctx.moveTo(-6, 10);
          ctx.quadraticCurveTo(-6, 0, 0, 0);
          ctx.quadraticCurveTo(6, 0, 6, 10);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          // the ring that closes on the bell at each chime
          if (!L.open) {
            const k = 1 - ph;
            ctx.strokeStyle = `rgba(255,255,255,${0.25 + (1 - k) * 0.6})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(bx, by - 4, 6 + k * 22, 0, Math.PI * 2);
            ctx.stroke();
            for (let i = 0; i < 3; i++) {
              ctx.fillStyle = i < streak ? '#FFD740' : 'rgba(255,255,255,0.3)';
              ctx.beginPath();
              ctx.arc(bx - 8 + i * 8, by + 8, 2.2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }, -1),
      );
      let said = false;
      w.flags.twist = 'locked';
      w.onTick((w2) => {
        const p = w2.player;
        const inYard = p.x > d.x - px(8);
        if (inYard && !said) {
          said = true;
          tara(w2, 'Jump on the DONG, Dad. Three in a row! | Jump on each chime. Three in a row!', 3);
        }
        const beat = Math.round(w2.tick / BEAT);
        if (w2.tick % BEAT === 0) w2.sfx('dong', bx, by);
        if (L.open) return;
        // a fresh jump: on the beat or not?
        if (w2.tick - p.jumpTick === 1 && inYard) {
          const off = Math.abs(p.jumpTick - beat * BEAT);
          if (off <= WIN && beat !== jumpedOn) {
            jumpedOn = beat;
            streak++;
            w2.sfx('clap', p.cx, p.y);
            if (streak >= 3) {
              npc(w2, 'Magnifique! | Magnificent!', bx, by - 20, 1.4);
              L.unlock();
            }
          } else {
            if (streak > 0) npc(w2, 'Hors rythme! | Off the beat!', bx, by - 20, 1);
            streak = 0;
          }
        }
        // a chime went by without a jump on it
        if (streak > 0 && w2.tick % BEAT === WIN + 1 && jumpedOn !== Math.floor(w2.tick / BEAT)) {
          streak = 0;
          npc(w2, 'Hors rythme! | Off the beat!', bx, by - 20, 1);
        }
        void lastBeat;
        w2.flags.twist = L.open ? 'open' : 'locked';
        w2.flags.streak = streak;
      });
    },
  },

  /** A street mime stands in front of the door and copies you, mirror-wise. Whatever you do, he does.
   *  Except that he's stuck in his invisible box, so he can't jump high. */
  mime: {
    space: 10,
    advice: 'The mime mirrors you and pushes you back if you touch him, but his invisible box stops his jumps: jump high and long, and go over him.',
    build(w, d) {
      const cl = d.x - px(5);
      let mx = d.x - 12,
        my = 0,
        vy = 0,
        told = -999;
      const mime = w.add(
        new Mover(mx - 6, FLOOR - 16, 12, 16, 'none', (ctx, m, w2) => {
          const x = m.x + 6,
            y = m.y;
          // the box he's stuck in
          ctx.strokeStyle = 'rgba(255,255,255,0.18)';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(x - 9, FLOOR - 40, 18, 40);
          person(ctx, x, y, 16, '#212121', '#FAFAFA', { face: '#FAFAFA', arms: Math.abs(Math.sin(w2.tick * 0.12)) * 5 + 2 });
          ctx.fillStyle = '#FFFFFF';
          for (let i = 0; i < 3; i++) ctx.fillRect(x - 4, y + 6 + i * 2, 8, 1);
          ctx.fillStyle = '#D32F2F';
          ctx.fillRect(x - 1, y + 4, 2, 1);
        }),
      );
      mime.hazard.active = false;
      w.flags.twist = 'mime';
      w.onTick((w2) => {
        const p = w2.player;
        mx = Math.max(cl, Math.min(d.x - 12, 2 * cl - p.cx));
        if (w2.tick - p.jumpTick === 1 && Math.abs(p.cx - mx) < 96 && my === 0) vy = -260;
        vy += 1500 * DT;
        my = Math.min(0, Math.max(-22, my + vy * DT));
        if (my === -22 && vy < 0) vy = 0;
        if (my === 0 && vy > 0) vy = 0;
        mime.x = mx - 6;
        mime.y = FLOOR - 16 + my;
        if (hits(p, mime.x + 1, mime.y + 1, 10, 15) && w2.state === 'play') {
          p.vx = p.cx < mx ? -220 : 220;
          if (p.vy < 0) p.vy = 0;
          p.stun = 16;
          if (w2.tick - told > 90) {
            told = w2.tick;
            w2.sfx('shove', p.cx, p.y);
            npc(w2, 'Non non non! | No no no!', mx, FLOOR - 40, 1);
          }
        }
        w2.flags.mimeX = mx;
        w2.flags.line = cl;
      });
      let said = false;
      w.onTick((w2) => {
        if (said || w2.player.x < d.x - px(10)) return;
        said = true;
        tara(w2, 'A mime! He copies you, Dad... but look at his box. | He copies you... but look at his box.', 2.8);
      });
    },
  },

  /** Fireworks, ESCAPED!... and then the sky falls exactly where the party is. */
  fakewin: {
    space: 11,
    advice: 'The first door is a fake finish: when ESCAPED! goes up, get away from that door at once, something falls on it. The real door comes after.',
    build(w, d) {
      const realX = d.x;
      const fx = d.x - px(5);
      d.x = fx;
      let t0 = -1;
      w.flags.twist = 'fake';
      w.flags.fakeX = fx;
      const shell = w.add(new Thing('boulder', fx - 8, -60, { w: 32, h: 24, layer: 3 }));
      shell.visible = false;
      shell.solid.collidable = false;
      d.onReach = (w2) => {
        if (t0 >= 0) return;
        t0 = w2.tick;
        w2.flags.twist = 'party';
        const p = w2.player;
        p.vx = 0;
        p.stun = secs(0.55);
        w2.sfx('win', d.x, d.y);
        w2.emit('fx', d.x + 8, d.y, { kind: 'confetti' });
        w2.flags.banner = { text: 'ESCAPED!', sub: '★ ★ ★', t0: w2.tick, dur: 0.75, style: 'win' };
        d.hidden = true;
        w2.after(0.55, () => {
          w2.flags.twist = 'run';
          w2.flags.banner = { text: 'JUST KIDDING!', sub: '', t0: w2.tick, dur: 0.9, style: 'troll' };
          w2.sfx('laugh', fx, d.y);
          shell.visible = true;
          shell.solid.collidable = true;
          shell.setDeadly('crushed');
          shell.fall(w2, { g: 3000, then: (w3) => (shell.setDeadly(false), (w3.flags.twist = 'landed')) });
        });
        w2.after(1.25, () => {
          d.x = realX;
          d.hidden = false;
          d.onReach = null;
          w2.flags.twist = 'real';
          tara(w2, 'Ha! Ippo dhaan nijama! | NOW it’s real!', 2);
        });
      };
      // the shadow of what's coming
      w.add(
        new Paint((ctx, w2) => {
          if (w2.flags.twist !== 'run') return;
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.beginPath();
          ctx.ellipse(fx + 8, FLOOR - 0.5, 18, 2.4, 0, 0, Math.PI * 2);
          ctx.fill();
        }, -1),
      );
    },
  },

  // ================================================================ Bengaluru
  /** A tech-park revolving door: it only lets you in when the gap comes round. */
  revolve: {
    advice: 'The revolving door lets you in only through its gap: stand at the glass, wait for the gap, and step in at once.',
    build(w, d) {
      const R = 0.82,
        GAP = 0.22;
      const open = (w2: World) => tt(w2) % R < GAP;
      w.add(
        new Paint((ctx, w2) => {
          const a = ((tt(w2) % R) / R) * Math.PI;
          ctx.fillStyle = 'rgba(160,200,230,0.35)';
          ctx.fillRect(d.x - 4, d.y - 2, 24, 3);
          for (let i = 0; i < 2; i++) {
            const k = Math.cos(a + i * (Math.PI / 2));
            ctx.fillStyle = `rgba(190,225,255,${0.4 + Math.abs(k) * 0.3})`;
            ctx.fillRect(d.x + 8 + k * 11 - 1, d.y, 2.4, 32);
          }
        }, 2),
      );
      w.flags.twist = 'closed';
      d.onReach = (w2) => (open(w2) ? w2.win('door') : undefined);
      w.onTick((w2) => {
        const o = open(w2);
        const p = w2.player;
        if (!o && p.x + p.w > d.x + 2 && p.x < d.x + 14 && p.y + p.h > d.y + 6) {
          p.x = d.x + 2 - p.w - 1;
          if (p.vx > 0) p.vx = 0;
        }
        w2.flags.twist = o ? 'gap' : 'closed';
        w2.flags.gapIn = o ? 0 : R - (tt(w2) % R);
      });
    },
  },

  /** The glass door says PULL. Walking into it is pushing. Stand at it and pull: walk away. */
  pull: {
    advice: 'The glass door says PULL, and walking into it is pushing: stand against it and pull, press away from it, then walk in before it swings shut.',
    build(w, d) {
      const gx = d.x + 1;
      const pane = w.add(new Thing('slab', gx, d.y, { w: 6, h: 32, layer: 2 }));
      pane.visible = false;
      let open = 0,
        told = -999,
        t0 = 0;
      w.add(
        new Paint((ctx, w2) => {
          const k = open > 0 ? Math.min(1, (w2.tick - t0) / 10) : 0;
          ctx.save();
          ctx.translate(gx, d.y);
          ctx.transform(1 - k * 0.75, 0, 0, 1, -k * 10, 0);
          ctx.fillStyle = 'rgba(180,220,245,0.45)';
          ctx.fillRect(0, 0, 14, 32);
          ctx.strokeStyle = '#90A4AE';
          ctx.lineWidth = 1;
          ctx.strokeRect(0.5, 0.5, 13, 31);
          ctx.fillStyle = '#ECEFF1';
          ctx.fillRect(2, 15, 3, 1.5);
          ctx.restore();
          // the sticker
          ctx.fillStyle = '#C62828';
          rr(ctx, d.x - 6, d.y - 19, 28, 13, 2);
          ctx.fill();
          text(ctx, 'PULL', d.x + 8, d.y - 14.5, 7, '#FFFFFF', '');
          text(ctx, 'ELEYIRI', d.x + 8, d.y - 9, 3.5, '#FFCDD2', '');
        }, 2),
      );
      w.flags.twist = 'shut';
      w.onTick((w2) => {
        const p = w2.player;
        const at = p.x + p.w >= gx - 1 && p.x + p.w <= gx + 1 && p.y + p.h > d.y + 6;
        if (open > 0) {
          open--;
          if (open === 0) {
            pane.show();
            if (hits(p, gx, d.y, 6, 32)) p.x = gx - p.w - 1;
            w2.sfx('slide', gx, d.y);
          }
        } else if (at && p.inputDir < 0 && p.onGround) {
          open = secs(1.8);
          t0 = w2.tick;
          pane.hide();
          p.vx = -70;
          w2.sfx('creak', gx, d.y);
          npc(w2, 'Sari! | Right!', d.x + 8, d.y - 28, 0.9);
        } else if (at && p.inputDir > 0 && w2.tick - told > 160) {
          told = w2.tick;
          w2.sfx('thud', gx, d.y + 16);
          npc(w2, 'Guru, adu PULL! Push maadbedi! | Boss, it says PULL! Don’t push!', d.x + 8, d.y - 28, 1.4);
        }
        w2.flags.twist = open > 0 ? 'open' : 'shut';
      });
    },
  },

  /** A garden-maze wall right in front of the door, up to the sky. The way forward is back:
   *  walk out the way you came and you come out on the far side of the wall. */
  wrap: {
    space: 13,
    advice: 'The hedge wall can’t be climbed. Walk back the way you came, past the arrow sign, and you come out on the far side of it.',
    paint: (g, D) => void g.fill(D - 2, D - 2, 0, 14, '#'),
    build(w, d) {
      const edge = d.x - px(12.5);
      const wallX = d.x - px(2);
      w.add(
        new Paint((ctx, w2) => {
          // hedge leaves over the wall
          for (let y = 0; y < FLOOR; y += 6) {
            ctx.fillStyle = (y / 6) % 2 ? '#2E7D32' : '#388E3C';
            ctx.fillRect(wallX - 2, y, 20, 6);
          }
          ctx.fillStyle = '#1B5E20';
          for (let y = 3; y < FLOOR; y += 12) ctx.fillRect(wallX + ((y * 7) % 12), y, 3, 3);
          // the arrow sign where the trick is
          ctx.fillStyle = '#6D4C41';
          ctx.fillRect(edge + 7, FLOOR - 22, 2, 22);
          ctx.fillStyle = '#FFF8E1';
          rr(ctx, edge - 6, FLOOR - 30, 28, 10, 2);
          ctx.fill();
          const bob = Math.sin(w2.tick * 0.1) * 1;
          text(ctx, '← ↻ →', edge + 8 + bob, FLOOR - 25, 6, '#4527A0', '');
        }, 1),
      );
      w.flags.twist = 'wall';
      let prev = 0,
        said = false;
      w.onTick((w2) => {
        const p = w2.player;
        if (!said && p.x + p.w >= wallX - 2) {
          said = true;
          tara(w2, 'Garden maze, guru! Sometimes forward is backward. | Garden maze! Sometimes forward is backward.', 2.8);
        }
        if (prev >= edge && p.x < edge && p.vx < 0 && w2.state === 'play') {
          w2.warp(wallX + 20, p.y, 'blink');
          w2.flags.twist = 'through';
        }
        prev = p.x;
      });
    },
  },

  /** After the power cut the door is invisible. Three doormats: the friendly ones are bait. */
  invisible: {
    space: 11,
    advice: 'The door is invisible. Don’t trust the friendly doormats, flower pots drop on them: jump those and stop at the rude one.',
    build(w, d) {
      d.draw = () => undefined;
      const mats: [number, string, boolean][] = [
        [d.x - px(8) - 6, 'WELCOME', false],
        [d.x - px(4) - 6, 'SWAGATHA', false],
        [d.x - 6, 'GO AWAY', true],
      ];
      w.flags.mats = mats.filter((m) => !m[2]).map((m) => m[0]);
      for (const [mx, label, real] of mats) {
        w.add(
          new Paint((ctx) => {
            ctx.fillStyle = real ? '#455A64' : '#8D6E63';
            rr(ctx, mx, FLOOR - 3, 28, 3, 1);
            ctx.fill();
            text(ctx, label, mx + 14, FLOOR - 7, 4.5, real ? '#CFD8DC' : '#FFE0B2');
            if (!real) {
              // the balcony above, with a pot on it
              ctx.fillStyle = '#5D4037';
              ctx.fillRect(mx - 4, FLOOR - 66, 36, 3);
            }
          }, -1),
        );
        if (real) continue;
        const pot = w.add(new Thing('flowers', mx - 2, FLOOR - 82, { solid: false, layer: 3 }));
        let used = false;
        w.onTick((w2) => {
          const p = w2.player;
          if (used || !(p.onGround && p.cx > mx && p.cx < mx + 28)) return;
          used = true;
          pot.setDeadly('hit');
          pot.fall(w2, { g: 3400, land: false });
          npc(w2, 'Swagatha! Hahaha! | Welcome! Hahaha!', mx + 14, FLOOR - 90, 1);
        });
      }
      let said = false;
      w.onTick((w2) => {
        if (said || w2.player.x < d.x - px(10)) return;
        said = true;
        tara(w2, 'Power’s back... but the door isn’t? Read the mats, Dad. | Read the mats, Dad.', 2.8);
      });
      w.flags.twist = 'invisible';
    },
  },

  /** A tech-park camera sweeps the lawn. If its beam finds you, you're done: wait behind a planter
   *  while it sweeps past, then follow behind it. */
  cctv: {
    space: 13,
    advice: 'Never let the camera’s red beam touch you: hide inside a bush while it sweeps towards you, and run on once it has gone past behind you.',
    build(w, d) {
      const cam = { x: d.x + 26, y: FLOOR - 120 };
      const near = d.x - px(1),
        far = d.x - px(12.5);
      const P = 3.4;
      const bushes = [d.x - px(9), d.x - px(5)].map((x) => ({ x, y: FLOOR - 36, w: 28, h: 36 }));
      const spot = (w2: World) => {
        const k = (tt(w2) % P) / P;
        const tri = k < 0.5 ? k * 2 : 2 - k * 2;
        return near + (far - near) * tri;
      };
      const movingLeft = (w2: World) => (tt(w2) % P) / P < 0.5;
      const ang = (x: number, y: number) => Math.atan2(y - cam.y, x - cam.x);
      const blocked = (x: number, y: number) =>
        bushes.some((r) => {
          // does the ray from the camera to (x, y) pass through the bush?
          for (let i = 1; i <= 32; i++) {
            const k = i / 32;
            const sx = cam.x + (x - cam.x) * k,
              sy = cam.y + (y - cam.y) * k;
            if (sx > r.x && sx < r.x + r.w && sy > r.y && sy < r.y + r.h) return true;
          }
          return false;
        });
      const seen = (w2: World) => {
        const g = spot(w2);
        const a0 = ang(g + 16, FLOOR),
          a1 = ang(g - 16, FLOOR);
        const p = w2.player;
        for (const [x, y] of [
          [p.cx, p.y + 2],
          [p.cx, p.y + p.h - 2],
        ]) {
          const a = ang(x, y);
          if (a >= Math.min(a0, a1) && a <= Math.max(a0, a1) && !blocked(x, y)) return true;
        }
        return false;
      };
      w.add(
        new Paint((ctx, w2) => {
          // the camera on its tall pole, and its beam
          ctx.fillStyle = '#546E7A';
          ctx.fillRect(cam.x - 1, cam.y, 3, FLOOR - cam.y);
          ctx.fillStyle = '#ECEFF1';
          rr(ctx, cam.x - 8, cam.y - 4, 11, 7, 1.5);
          ctx.fill();
          ctx.fillStyle = w2.tick % 40 < 20 ? '#F44336' : '#7f1d1d';
          ctx.fillRect(cam.x - 7, cam.y - 3, 2, 2);
          const g = spot(w2);
          const beam = ctx.createLinearGradient(cam.x, cam.y, g, FLOOR);
          beam.addColorStop(0, 'rgba(255,60,60,0.55)');
          beam.addColorStop(1, 'rgba(255,60,60,0.3)');
          ctx.fillStyle = beam;
          ctx.beginPath();
          ctx.moveTo(cam.x - 7, cam.y);
          ctx.lineTo(g - 16, FLOOR);
          ctx.lineTo(g + 16, FLOOR);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,120,120,0.85)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,90,90,0.75)';
          ctx.beginPath();
          ctx.ellipse(g, FLOOR - 0.5, 16, 2.2, 0, 0, Math.PI * 2);
          ctx.fill();
          text(ctx, 'REC ●', cam.x - 2, cam.y - 10, 4.5, '#FF8A80');
        }, -1),
      );
      // the bushes, drawn over Dad so he really is hidden in them
      w.add(
        new Paint((ctx, w2) => {
          for (const [i, r] of bushes.entries()) {
            const sway = Math.sin(w2.tick * 0.05 + i) * 1;
            ctx.fillStyle = '#2E7D32';
            ctx.beginPath();
            ctx.ellipse(r.x + r.w / 2 + sway, r.y + r.h * 0.55, r.w / 2 + 2, r.h * 0.55, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#43A047';
            ctx.beginPath();
            ctx.ellipse(r.x + r.w / 2 - 4 + sway, r.y + r.h * 0.35, r.w / 3, r.h * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#795548';
            ctx.fillRect(r.x + 4, FLOOR - 4, r.w - 8, 4);
          }
        }, 4),
      );
      let said = false;
      w.flags.twist = 'sweep';
      w.flags.cam = [cam.x, cam.y];
      w.flags.cover = bushes.map((r) => r.x);
      w.onTick((w2) => {
        const p = w2.player;
        w2.flags.beamX = spot(w2);
        w2.flags.beamLeft = movingLeft(w2);
        if (!said && p.x > d.x - px(13)) {
          said = true;
          tara(w2, 'CCTV, Dad! Hide in the bushes when the red beam comes! | Hide in the bushes from the red beam!', 2.8);
        }
        if (w2.state === 'play' && p.x > d.x - px(13) && seen(w2)) {
          w2.sfx('siren', cam.x, cam.y);
          npc(w2, 'Caught on camera! Security! | Caught on camera!', cam.x - 10, cam.y - 18, 1.4);
          w2.die('spotted');
        }
      });
    },
  },

  // ================================================================ Amaravati
  /** Locked. The key hangs high over the road behind you: get up on the sack to reach it. */
  key: {
    space: 10,
    advice: 'The door is locked and the key hangs high behind you: hop on the chilli sack and jump straight up for it.',
    build(w, d) {
      const L = lock(w, d, 'Taalam veshanu! | It’s locked!');
      const cx = d.x - px(8);
      w.add(new Thing('crate', cx, FLOOR - 16, { layer: 1, tint: '#C62828', w: 32 }));
      const kx = cx + 4,
        ky = FLOOR - 92;
      let got = false;
      w.add(
        new Paint((ctx, w2) => {
          ctx.strokeStyle = 'rgba(60,40,30,0.7)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(kx + 6, 0);
          ctx.lineTo(kx + 6, ky + (got ? -40 : 0));
          ctx.stroke();
          if (got) return;
          const bob = Math.sin(w2.tick * 0.07) * 1.5;
          ctx.strokeStyle = '#FFC107';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(kx + 6, ky + 4 + bob, 3.2, 0, Math.PI * 2);
          ctx.moveTo(kx + 6, ky + 7 + bob);
          ctx.lineTo(kx + 6, ky + 14 + bob);
          ctx.lineTo(kx + 9, ky + 14 + bob);
          ctx.moveTo(kx + 6, ky + 11 + bob);
          ctx.lineTo(kx + 9, ky + 11 + bob);
          ctx.stroke();
        }, 3),
      );
      w.flags.twist = 'locked';
      w.flags.crateX = cx;
      let said = false;
      w.onTick((w2) => {
        const p = w2.player;
        if (!said && p.x + p.w > d.x - 4) {
          said = true;
          tara(w2, 'Key paina undi, Dad! Behind you! | The key is up there, behind you!', 2.4);
        }
        if (got || !hits(p, kx, ky, 12, 16)) return;
        got = true;
        w2.sfx('collect', kx, ky);
        npc(w2, 'Taalam chevi! | Got the key!', kx + 6, ky - 6, 1);
        L.unlock();
      });
    },
  },

  /** The bridge is gone: swing across on a jhoola. Jump off at the far end, because on the way back the rope snaps. */
  swing: {
    space: 15,
    advice: 'Ride the jhoola over the river: board it at its near end, and jump off the moment it reaches the far bank. Stay for the swing back and the rope snaps.',
    paint: (g, D) => void g.pit(D - 12, D - 1),
    build(w, d) {
      pool(w, d.x / TILE - 12, d.x / TILE, 15.4, { colors: RIVER });
      const pvx = d.x - px(6.5),
        pvy = 82,
        Lr = 150,
        A = 0.55,
        T = 2.8;
      const ang = (w2: World) => A * Math.sin((tt(w2) * Math.PI * 2) / T);
      const seat = w.add(new Thing('plank', pvx - 16, pvy + Lr - 3, { w: 32, h: 5, oneWay: true, layer: 1 }));
      seat.visible = false;
      let rode = -1,
        snapped = false;
      w.add(
        new Paint((ctx, w2) => {
          // the branch, the ropes and the seat
          ctx.fillStyle = '#5D4037';
          ctx.fillRect(pvx - 40, pvy - 5, 80, 6);
          ctx.fillStyle = '#2E7D32';
          ctx.beginPath();
          ctx.ellipse(pvx, pvy - 14, 60, 16, 0, 0, Math.PI * 2);
          ctx.fill();
          if (snapped) return;
          const s = seat.solid;
          ctx.strokeStyle = '#D7CCC8';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pvx - 6, pvy);
          ctx.lineTo(s.x + 2, s.y);
          ctx.moveTo(pvx + 6, pvy);
          ctx.lineTo(s.x + 30, s.y);
          ctx.stroke();
          ctx.fillStyle = '#A1887F';
          ctx.fillRect(s.x, s.y, 32, 4);
          ctx.fillStyle = '#E91E63';
          for (let i = 0; i < 5; i++) ctx.fillRect(s.x + 3 + i * 6, s.y + 1, 2, 2);
          void w2;
        }, 1),
      );
      w.flags.twist = 'swing';
      w.onTick((w2) => {
        if (!snapped) {
          const a = ang(w2);
          const cx = pvx + Lr * Math.sin(a),
            cy = pvy + Lr * Math.cos(a);
          seat.solid.velX = ((Lr * Math.cos(a) * A * Math.PI * 2) / T) * Math.cos((tt(w2) * Math.PI * 2) / T);
          seat.place(w2, cx - 16, cy - 3);
        }
        const on = w2.standing(seat.solid);
        if (on && rode < 0) {
          rode = w2.tick;
          w2.sfx('creak', pvx, pvy);
        }
        if (!snapped && rode >= 0 && w2.tick - rode > secs(1.75)) {
          snapped = true;
          seat.fall(w2, { land: false, g: 2000 });
          w2.sfx('snap', pvx, pvy);
          npc(w2, 'Taadu tegindi! | The rope snapped!', pvx, pvy + 20, 1.2);
        }
        if (rode >= 0 && !on && w2.player.onGround) rode = -2;
        w2.flags.seat = [seat.solid.x, seat.solid.y];
        w2.flags.swingA = snapped ? 0 : ang(w2) / A;
        w2.flags.swingV = Math.cos((tt(w2) * Math.PI * 2) / T);
        w2.flags.twist = snapped ? 'snapped' : on ? 'riding' : 'swing';
      });
    },
  },

  /** Guntur mirchi bajji: one bite and Dad runs like fire. The bridge falls a moment after you step on it:
   *  only a mirchi run gets across. */
  mirchi: {
    space: 17,
    advice: 'The old bridge falls a moment after you step on it: eat the mirchi bajji on the cart first, and run over while you’re on fire.',
    paint: (g, D) => void g.pit(D - 12, D - 1),
    build(w, d) {
      const b0 = d.x - px(12);
      const planks = Array.from({ length: 12 }, (_, i) => w.add(new Thing('plank', b0 + i * 16, FLOOR, { w: 16, h: 6, layer: 1 })));
      const cartX = d.x - px(15);
      let eaten = -1,
        falling = false;
      w.add(
        new Paint((ctx, w2) => {
          ctx.fillStyle = '#795548';
          ctx.fillRect(cartX - 6, FLOOR - 14, 28, 6);
          ctx.fillStyle = '#3E2723';
          ctx.beginPath();
          ctx.arc(cartX - 2, FLOOR - 4, 4, 0, Math.PI * 2);
          ctx.arc(cartX + 18, FLOOR - 4, 4, 0, Math.PI * 2);
          ctx.fill();
          text(ctx, 'MIRCHI BAJJI', cartX + 8, FLOOR - 24, 4.5, '#FFE082');
          if (eaten < 0) {
            ctx.fillStyle = '#E65100';
            rr(ctx, cartX + 4, FLOOR - 18, 9, 4, 2);
            ctx.fill();
            ctx.fillStyle = '#2E7D32';
            ctx.fillRect(cartX + 12, FLOOR - 18, 2, 2);
          }
          // Dad on fire
          const p = w2.player;
          if (eaten >= 0 && w2.player.speedMul > 1 && !p.dead) {
            for (let i = 0; i < 4; i++) {
              const ph = (w2.tick * 0.2 + i * 1.7) % 4;
              ctx.fillStyle = i % 2 ? 'rgba(255,87,34,0.8)' : 'rgba(255,193,7,0.8)';
              ctx.beginPath();
              ctx.arc(p.cx - p.facing * (4 + ph * 2), p.y + 4 + i * 2.5, 2.4 - ph * 0.4, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }, 3),
      );
      w.flags.twist = 'cold';
      w.onTick((w2) => {
        const p = w2.player;
        if (eaten < 0 && hits(p, cartX + 2, FLOOR - 22, 14, 22)) {
          eaten = w2.tick;
          p.speedMul = 2.3;
          w2.sfx('sneeze', p.cx, p.y);
          npc(w2, 'KAARAM! | SPICY!', p.cx, p.y - 14, 1);
          tara(w2, 'Now run, Dad! Before the fire goes out! | Run, before the fire goes out!', 2);
        }
        if (eaten >= 0 && p.speedMul > 1 && w2.tick - eaten > secs(2.2)) {
          p.speedMul = 1;
          w2.flags.twist = 'cooled';
        }
        if (!falling && planks.some((k) => w2.standing(k.solid))) {
          falling = true;
          planks.forEach((k, i) => k.fall(w2, { delay: 0.55 + i * 0.015, land: false }));
          w2.sfx('creak', b0 + 96, FLOOR);
          if (p.speedMul === 1) npc(w2, 'Cheap contractor! | Cheap contractor!', b0 + 60, FLOOR - 24, 1.2);
        }
        if (eaten >= 0 && w2.flags.twist !== 'cooled') w2.flags.twist = 'fire';
      });
    },
  },

  /** Section speed check: the cop times you between the two white lines. Faster than 20 on average
   *  and it's a challan and back you go. Stop and dawdle in between: it's the average that counts. */
  speed: {
    space: 12,
    advice: 'SPEED LIMIT 20 is checked over the whole stretch between the white lines: cross it too fast and it’s a fine and back you go. Stop for a moment in the middle.',
    build(w, d) {
      const z0 = d.x - px(8),
        z1 = d.x - px(2);
      const copX = d.x - px(1);
      const KMH = 0.33;
      let t0 = -1,
        shown = '-- km/h',
        bad = false,
        said = false;
      w.add(
        new Paint((ctx, w2) => {
          // the sign and the two white lines
          ctx.fillStyle = '#9E9E9E';
          ctx.fillRect(z0 - 12, FLOOR - 34, 2, 34);
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(z0 - 11, FLOOR - 38, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#D32F2F';
          ctx.lineWidth = 2;
          ctx.stroke();
          text(ctx, '20', z0 - 11, FLOOR - 38, 7, '#212121', '');
          text(ctx, 'SECTION CHECK', z0 - 11, FLOOR - 52, 4, '#FFFFFF');
          ctx.fillStyle = 'rgba(255,255,255,0.85)';
          ctx.fillRect(z0, FLOOR - 1, 2, 1.5);
          ctx.fillRect(z1, FLOOR - 1, 2, 1.5);
          ctx.fillStyle = 'rgba(255,255,255,0.25)';
          for (let x = z0 + 6; x < z1; x += 8) ctx.fillRect(x, FLOOR - 1, 4, 1);
          // the cop and his read-out
          person(ctx, copX + 8, FLOOR - 18, 18, '#D7CCC8', '#8D5524', { cap: '#5D4037' });
          ctx.fillStyle = '#111';
          rr(ctx, copX - 16, FLOOR - 40, 32, 12, 2);
          ctx.fill();
          const live = t0 >= 0 ? `${(tt(w2) - t0).toFixed(1)} s` : shown;
          text(ctx, live, copX, FLOOR - 34, 5.5, bad && t0 < 0 ? '#FF5252' : '#69F0AE', '');
        }, 1),
      );
      w.flags.twist = 'clear';
      w.flags.zone = [z0, z1];
      let prev = 0;
      w.onTick((w2) => {
        const p = w2.player;
        const front = p.x + p.w;
        if (!said && front > z0 - px(2)) {
          said = true;
          tara(w2, 'Section speed check, Dad! Under 20 between the lines! | Average under 20 between the lines!', 2.8);
        }
        if (t0 < 0 && prev < z0 && front >= z0) {
          t0 = tt(w2);
          w2.sfx('beep', z0, FLOOR - 20);
        }
        if (t0 >= 0 && front < z0 - 2) t0 = -1;
        if (t0 >= 0 && prev < z1 && front >= z1) {
          const kmh = Math.round(((z1 - z0) / Math.max(0.01, tt(w2) - t0)) * KMH);
          shown = `${kmh} km/h`;
          t0 = -1;
          bad = kmh > 20;
          if (bad && w2.state === 'play') {
            w2.sfx('whistle', copX, FLOOR - 20);
            npc(w2, `${kmh} km/h! Challan! Venakki vellandi! | ${kmh} km/h! Fine! Go back!`, copX, FLOOR - 50, 1.6);
            w2.warp(z0 - px(3), FLOOR - p.h, 'blink');
            p.stun = 30;
          } else {
            npc(w2, `${kmh} km/h. Nemmadiga, manchi! | ${kmh} km/h. Nice and slow!`, copX, FLOOR - 50, 1.4);
            w2.flags.twist = 'passed';
          }
        }
        prev = p.x + p.w;
        if (w2.flags.twist !== 'passed') w2.flags.twist = t0 >= 0 ? 'timing' : 'clear';
        w2.flags.zoneT = t0 >= 0 ? tt(w2) - t0 : -1;
      });
    },
  },

  /** A langur snatches Dad's specs and runs. Everything goes blurry, the door with it: chase him down. */
  monkey: {
    space: 14,
    advice: 'The monkey grabs your specs and the world goes blurry: chase him back and forth over the drain until he gives up, then the door is back.',
    paint: (g, D) => void g.pit(D - 9, D - 8),
    build(w, d) {
      const perch = [d.x - px(13), d.x - px(5), d.x - px(11.5), d.x - px(4)];
      let state: 'door' | 'hop' | 'sit' | 'done' = 'door',
        n = 0,
        t0 = 0,
        from = { x: d.x + 4, y: d.y - 10 },
        to = { x: d.x + 4, y: d.y - 10 },
        mx = d.x + 4,
        my = d.y - 10;
      w.add(
        new Paint((ctx, w2) => {
          if (state === 'done' && n > 3) return;
          const x = mx,
            y = my;
          ctx.fillStyle = '#9E9E9E';
          rr(ctx, x - 5, y + 3, 10, 9, 3);
          ctx.fill();
          ctx.fillStyle = '#212121';
          ctx.beginPath();
          ctx.arc(x, y + 2, 3.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#9E9E9E';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(x + 4, y + 10);
          ctx.quadraticCurveTo(x + 12, y + 8 + Math.sin(w2.tick * 0.2) * 3, x + 10, y - 2);
          ctx.stroke();
          if (state !== 'door' && state !== 'done') {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 0.8;
            ctx.strokeRect(x - 5, y + 0.5, 3.5, 2.5);
            ctx.strokeRect(x + 1.5, y + 0.5, 3.5, 2.5);
          }
        }, 4),
      );
      const hop = (w2: World, tx: number) => {
        state = 'hop';
        t0 = w2.tick;
        from = { x: mx, y: my };
        to = { x: tx, y: FLOOR - 12 };
        w2.sfx('monkey', mx, my);
      };
      w.flags.twist = 'door';
      w.onTick((w2) => {
        const p = w2.player;
        if (state === 'door' && p.x > d.x - px(6) && p.onGround) {
          w2.flags.blur = 1;
          d.hidden = true;
          npc(w2, 'Kothi! Naa kalladdalu! | Monkey! My specs!', p.cx, p.y - 14, 1.4);
          tara(w2, 'Specs lekunda door kanapadadu! Chase him! | Can’t see the door without specs! Chase him!', 2.6);
          hop(w2, perch[0]);
        } else if (state === 'hop') {
          const k = Math.min(1, (w2.tick - t0) / secs(0.75));
          mx = from.x + (to.x - from.x) * k;
          my = from.y + (to.y - from.y) * k - Math.sin(Math.PI * k) * 46;
          if (k >= 1) state = 'sit';
        } else if (state === 'sit' && Math.abs(p.cx - mx) < px(2.2) && Math.abs(p.y - my) < 24) {
          n++;
          if (n >= perch.length) {
            state = 'done';
            w2.flags.blur = 0;
            d.hidden = false;
            w2.sfx('collect', p.cx, p.y);
            npc(w2, 'Alasipoyindi! Teesko! | It’s tired! Take them!', mx, my - 10, 1.4);
            n = 99;
          } else hop(w2, perch[n]);
        }
        w2.flags.twist = state;
        w2.flags.monkeyX = mx;
        w2.flags.pit = [d.x - px(9), d.x - px(7)];
      });
    },
  },

  /** Borra caves echo time: the first time you touch the door, you're back where you were 2.5 s ago. */
  dejavu: {
    advice: 'The first time you touch the door, time echoes you back a few seconds: do it all again, the pit included. The second time is real.',
    paint: (g, D) => void g.pit(D - 6, D - 5),
    build(w, d) {
      const rec: [number, number, number][] = [];
      let once = false;
      w.flags.twist = 'first';
      w.flags.pit = [d.x - px(6), d.x - px(4)];
      // (only on the last stretch: the echo never throws you back into the cave before it)
      w.onTick((w2) => {
        const p = w2.player;
        if (p.x < d.x - px(8.5) || !p.onGround) return;
        rec.push([p.x, p.y, p.facing]);
        if (rec.length > 420) rec.shift();
      });
      d.onReach = (w2) => {
        if (once) return w2.win('door');
        once = true;
        const back = rec[Math.max(0, rec.length - secs(2.5))] ?? [d.x - px(8), FLOOR - w2.player.h, 1];
        w2.sfx('rewind', d.x, d.y);
        w2.flags.rewind = w2.tick;
        w2.warp(back[0], back[1], 'blink');
        w2.player.facing = back[2] as 1 | -1;
        npc(w2, 'Déjà vu? | Déjà vu?', w2.player.cx, w2.player.y - 14, 1.2);
        w2.flags.twist = 'again';
      };
    },
  },

  /** The cyclone has the door: it spins round in a dust devil. Step into the whirlwind and ride it up,
   *  between the flying tin sheets. */
  whirlwind: {
    space: 10,
    advice: 'The door spins high up in the dust devil: walk into the whirlwind and ride it up. Slip past the tin sheets while they’re out at the sides.',
    build(w, d) {
      const c0 = d.x - px(5),
        cw = px(4),
        cx = c0 + cw / 2,
        top = 76;
      const DP = 1.3;
      const sheets = [0, Math.PI].map((ph) => {
        const m = w.add(
          new Mover(cx, 150, 14, 6, 'hit', (ctx, mv, w2) => {
            ctx.save();
            ctx.translate(mv.x + 7, mv.y + 3);
            ctx.rotate(w2.tick * 0.3 + ph);
            ctx.fillStyle = '#90A4AE';
            ctx.fillRect(-7, -2, 14, 4);
            ctx.fillStyle = '#B0BEC5';
            ctx.fillRect(-7, -2, 14, 1);
            ctx.restore();
          }),
        );
        return { m, ph };
      });
      const doorAt = (w2: World) => {
        const a = (tt(w2) / 2.4) * Math.PI * 2;
        return { x: cx - 8 + Math.cos(a) * 18, y: 66 + Math.sin(a) * 6 };
      };
      d.follow = () => doorAt(w);
      w.add(
        new Paint((ctx, w2) => {
          for (let i = 0; i < 14; i++) {
            const y = FLOOR - i * 13;
            if (y < top - 10) break;
            const r = 10 + i * 1.6;
            const a = w2.tick * 0.2 + i;
            ctx.strokeStyle = `rgba(215,190,150,${0.35 - i * 0.012})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(cx + Math.sin(a * 0.3) * 3, y, r, 3, 0, a % (Math.PI * 2), (a % (Math.PI * 2)) + 4);
            ctx.stroke();
          }
        }, -3),
      );
      w.flags.twist = 'spin';
      w.flags.column = [c0, c0 + cw];
      w.onTick((w2) => {
        const t = tt(w2);
        for (const s of sheets) {
          const a = (t / DP) * Math.PI * 2 + s.ph;
          s.m.x = cx - 7 + Math.cos(a) * 26;
          s.m.y = 148 + Math.sin(a) * 5;
          s.m.vx = 0;
        }
        w2.flags.sheetCos = Math.cos((t / DP) * Math.PI * 2);
        const p = w2.player;
        const inside = p.x + p.w > c0 && p.x < c0 + cw && p.y > top - 4;
        if (inside && w2.state === 'play') {
          if (p.onGround) {
            p.onGround = false;
            p.vy = -120;
          }
          p.vy = Math.max(p.vy - 30, -165);
          p.launched = true;
          w2.flags.twist = 'up';
        }
      });
    },
  },

  // ================================================================ Hyderabad
  /** Smart door, Hi-Tech City style: it wants an OTP. Tara reads it out; type it by bonking the number blocks. */
  otp: {
    space: 14,
    advice: 'The smart door wants the OTP Tara reads out: hop up and bonk the number blocks in that order. A wrong digit sends a new OTP.',
    build(w, d) {
      const L = lock(w, d, 'OTP enter cheyyi! | Enter the OTP!');
      const bx0 = d.x - px(12),
        by = FLOOR - 49,
        BH = 14;
      const OTPS = [
        [4, 7, 2],
        [9, 1, 6],
        [3, 8, 5],
        [6, 0, 7],
      ];
      let which = 0,
        typed: number[] = [],
        wrong = 0,
        lockedUntil = -1,
        prevVy = 0,
        flash = -1,
        flashN = -1;
      for (let i = 0; i < 10; i++) {
        const b = w.add(new Thing('crate', bx0 + i * 16, by, { w: 16, h: BH, layer: 1 }));
        b.visible = false;
      }
      const otpLine = (k: number) => {
        const o = OTPS[k % OTPS.length].join('-');
        return `OTP vachindi, Dad: ${o}! | Your OTP is ${o}!`;
      };
      w.add(
        new Paint((ctx, w2) => {
          for (let i = 0; i < 10; i++) {
            const x = bx0 + i * 16;
            const hot = flashN === i && w2.tick - flash < 12;
            ctx.fillStyle = hot ? '#FFD54F' : '#37474F';
            rr(ctx, x + 0.5, by + (hot ? -2 : 0), 15, BH, 2);
            ctx.fill();
            ctx.strokeStyle = '#90A4AE';
            ctx.lineWidth = 0.8;
            ctx.stroke();
            text(ctx, String(i), x + 8, by + BH / 2 + (hot ? -2 : 0), 8, hot ? '#212121' : '#E0F7FA', '');
          }
          // the door's screen
          ctx.fillStyle = '#0D1B2A';
          rr(ctx, d.x - 10, d.y - 24, 36, 16, 3);
          ctx.fill();
          const s = L.open ? '✓ OK' : w2.tick < lockedUntil ? 'WAIT' : [0, 1, 2].map((i) => (typed[i] !== undefined ? typed[i] : '_')).join(' ');
          text(ctx, s, d.x + 8, d.y - 16, 7, L.open ? '#69F0AE' : '#80DEEA', '');
        }, 1),
      );
      let said = false;
      w.flags.twist = 'locked';
      w.onTick((w2) => {
        const p = w2.player;
        if (!said && p.x > bx0 - px(1.5)) {
          said = true;
          tara(w2, otpLine(which), 4);
        }
        w2.flags.otp = OTPS[which % OTPS.length];
        w2.flags.otpI = typed.length;
        w2.flags.blocks = [bx0, by];
        const bonked = prevVy < -30 && p.vy === 0 && !p.onGround && p.y <= by + BH + 1 && p.y >= by + BH - 3;
        prevVy = p.vy;
        if (L.open || !bonked || w2.tick < lockedUntil) return;
        const i = Math.floor((p.cx - bx0) / 16);
        if (i < 0 || i > 9) return;
        flash = w2.tick;
        flashN = i;
        w2.sfx('beep', bx0 + i * 16 + 8, by);
        const want = OTPS[which % OTPS.length];
        typed.push(i);
        if (typed[typed.length - 1] !== want[typed.length - 1]) {
          typed = [];
          wrong++;
          which++;
          if (wrong >= 3) {
            wrong = 0;
            lockedUntil = w2.tick + secs(2.5);
            npc(w2, 'Too many attempts! Try again later! | Too many attempts!', d.x + 8, d.y - 34, 1.6);
            w2.after(2.5, () => tara(w2, otpLine(which), 4));
          } else {
            npc(w2, 'Invalid OTP! | Invalid OTP!', d.x + 8, d.y - 34, 1.1);
            tara(w2, `Kotha OTP: ${OTPS[which % OTPS.length].join('-')}! | New OTP: ${OTPS[which % OTPS.length].join('-')}!`, 4);
          }
        } else if (typed.length === 3) {
          npc(w2, 'Verified! | Verified!', d.x + 8, d.y - 34, 1.2);
          L.unlock();
        }
      });
    },
  },

  /** Hyderabadi dum biryani right before the door. Its aroma pulls you in from both sides;
   *  one bite and it's biryani coma. Jump it, and keep running. */
  biryani: {
    space: 10,
    advice: 'The biryani’s smell drags you towards the handi from both sides, and one bite is biryani coma: jump over it and keep holding forward.',
    build(w, d) {
      const hx = d.x - px(3.5),
        hw = 28;
      const handi = w.add(new Thing('crate', hx, FLOOR - 18, { solid: false, deadly: 'coma', w: hw, h: 18, layer: 1, inset: 2 }));
      handi.visible = false;
      w.add(new Gust(hx / TILE - 6.5, 12, 6.5, 3, 85));
      w.add(new Gust((hx + hw) / TILE, 12, 2.6, 3, -85));
      w.add(
        new Paint((ctx, w2) => {
          ctx.fillStyle = '#5D4037';
          ctx.fillRect(hx - 2, FLOOR - 6, hw + 4, 6);
          ctx.fillStyle = '#B87333';
          ctx.beginPath();
          ctx.ellipse(hx + hw / 2, FLOOR - 11, hw / 2, 7, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#F5F5F5';
          ctx.fillRect(hx + 3, FLOOR - 19, hw - 6, 3);
          // aroma, curling in from both sides
          ctx.strokeStyle = 'rgba(255,240,200,0.6)';
          ctx.lineWidth = 1;
          for (let i = 0; i < 6; i++) {
            const k = ((w2.tick * 0.8 + i * 30) % 90) / 90;
            const side = i % 2 ? 1 : -1;
            const x = hx + hw / 2 + side * (80 * (1 - k) + 6);
            const y = FLOOR - 24 + Math.sin(k * 9 + i) * 4;
            ctx.globalAlpha = Math.sin(k * Math.PI);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(x - side * 4, y - 4, x - side * 8, y);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
          text(ctx, 'DUM BIRYANI', hx + hw / 2, FLOOR - 30, 4.5, '#FFE0B2');
        }, 1),
      );
      let said = false;
      w.flags.twist = 'smell';
      w.flags.handi = [hx, hx + hw];
      w.onTick((w2) => {
        if (said || w2.player.x < hx - px(6)) return;
        said = true;
        npc(w2, 'Ek plate, miya? Bas ek! | Just one plate, buddy?', hx + hw / 2, FLOOR - 44, 1.8);
      });
    },
  },

  /** A pad on the road flips gravity: the door hangs from the ceiling. Mind the gap up there. */
  gravity: {
    space: 10,
    advice: 'Step on the purple pad and you fall up: the door hangs from the ceiling. Up there, jump the gap in the roof (your jumps go down now).',
    paint: (g, D) => {
      g.fill(D - 7, D + 3, 3, 3, '#');
      g.fill(D - 3, D - 2, 3, 3, '.');
    },
    build(w, d) {
      d.y = 64;
      const draw = d.draw.bind(d);
      d.draw = (ctx, w2) => {
        ctx.save();
        ctx.translate(0, 2 * d.y + 32);
        ctx.scale(1, -1);
        draw(ctx, w2);
        ctx.restore();
      };
      const padX = d.x - px(6);
      w.add(
        new Paint((ctx, w2) => {
          ctx.fillStyle = w2.tick % 40 < 20 ? '#7C4DFF' : '#B388FF';
          rr(ctx, padX, FLOOR - 3, 16, 3, 1);
          ctx.fill();
          text(ctx, '⇅', padX + 8, FLOOR - 10, 9, '#B388FF');
        }, -1),
      );
      let flipped = false;
      w.flags.twist = 'floor';
      w.flags.roofGap = [d.x - px(3), d.x - px(1)];
      w.onTick((w2) => {
        const p = w2.player;
        if (!flipped && p.onGround && p.cx > padX && p.cx < padX + 16) {
          flipped = true;
          p.gsign = -1;
          p.onGround = false;
          p.vy = -60;
          w2.sfx('blink', p.cx, p.y);
          npc(w2, 'Ulta pulta, miya! | Upside down, buddy!', p.cx, p.y - 14, 1.2);
        }
        w2.flags.twist = flipped ? 'flipped' : 'floor';
      });
    },
  },

  /** The door is a mouse hole under the shop wall. Eat the Osmania biscuit on the shelf and Dad shrinks to fit. */
  tiny: {
    space: 10,
    advice: 'You won’t fit under the wall: jump for the Osmania biscuit floating by the shelf, shrink, and walk into the tiny door.',
    paint: (g, D) => {
      g.fill(D - 1, D + 4, 0, 13, '#');
      g.fill(D - 1, D + 4, 14, 14, '.');
      g.put(D, 14, 'E');
    },
    build(w, d) {
      const slab = w.add(new Thing('slab', d.x - px(1), FLOOR - 16, { w: px(6), h: 6, layer: 1 }));
      slab.visible = false;
      const bx = d.x - px(5),
        by = FLOOR - 66;
      let small = false;
      d.exit.zone = () => (small ? { x: d.x + 10, y: FLOOR - 9, w: 6, h: 9 } : null);
      d.draw = (ctx, w2) => {
        ctx.fillStyle = '#4E342E';
        ctx.fillRect(d.x - px(1), FLOOR - 16, px(6), 6);
        ctx.fillStyle = '#1B0F0A';
        ctx.fillRect(d.x - px(1), FLOOR - 10, px(6), 10);
        ctx.save();
        ctx.translate(d.x + 10, FLOOR - 9);
        ctx.scale(0.36, 0.28);
        doorPic(ctx, w2, 0, 0, 1);
        ctx.restore();
      };
      w.add(
        new Paint((ctx, w2) => {
          ctx.fillStyle = '#6D4C41';
          ctx.fillRect(bx - 10, by + 16, 30, 3);
          if (small) return;
          const bob = Math.sin(w2.tick * 0.09) * 2;
          ctx.fillStyle = '#E0B66B';
          ctx.beginPath();
          ctx.arc(bx + 4, by + 6 + bob, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#B8860B';
          for (let i = 0; i < 4; i++) ctx.fillRect(bx + 2 + (i % 2) * 3, by + 4 + (i >> 1) * 3 + bob, 1, 1);
          text(ctx, 'OSMANIA', bx + 4, by - 3 + bob, 4, '#FFF8E1');
        }, 3),
      );
      let said = false;
      w.flags.twist = 'big';
      w.flags.biscuit = [bx, by];
      w.onTick((w2) => {
        const p = w2.player;
        if (!said && p.x + p.w >= d.x - px(1) - 2) {
          said = true;
          tara(w2, 'Too big for that door, Dad! Have a biscuit. | Too big! Have a biscuit.', 2.6);
        }
        if (!small && hits(p, bx - 1, by, 10, 12)) {
          small = true;
          p.resize(6, 8);
          w2.sfx('poof', p.cx, p.y);
          w2.emit('fx', p.cx, p.cy, { kind: 'poof', w: 10, h: 14 });
          npc(w2, 'Chhota Dad! | Tiny Dad!', p.cx, p.y - 12, 1);
        }
        w2.flags.twist = small ? 'small' : 'big';
      });
    },
  },

  /** Golconda: the moat is too wide, but the fort cannon isn't. Get in, and fire when the barrel's at 45°. */
  cannon: {
    space: 13,
    advice: 'Climb into the cannon by the moat; its barrel swings up and down: press jump when it’s halfway up and it fires you over.',
    paint: (g, D) => void g.pit(D - 9, D - 1),
    build(w, d) {
      pool(w, d.x / TILE - 9, d.x / TILE, 15.4, { colors: RIVER });
      const cx = d.x - px(11),
        cy = FLOOR - 10;
      const V = 560,
        lo = 0.26,
        hi = 1.31,
        TP = 2.2;
      const angle = (w2: World) => lo + ((hi - lo) * (1 - Math.cos((tt(w2) / TP) * Math.PI * 2))) / 2;
      let loaded = false,
        fired = false;
      w.add(
        new Paint((ctx, w2) => {
          const a = angle(w2);
          ctx.save();
          ctx.translate(cx + 8, cy);
          ctx.rotate(-a);
          ctx.fillStyle = '#37474F';
          rr(ctx, -4, -5, 26, 10, 3);
          ctx.fill();
          ctx.fillStyle = '#263238';
          ctx.fillRect(18, -6, 4, 12);
          ctx.restore();
          ctx.fillStyle = '#5D4037';
          ctx.beginPath();
          ctx.arc(cx + 8, cy + 4, 6, 0, Math.PI * 2);
          ctx.fill();
          if (loaded && !fired) {
            text(ctx, 'JUMP = FIRE', cx + 8, cy - 30, 5, '#FFE082');
            ctx.strokeStyle = 'rgba(255,224,130,0.5)';
            ctx.setLineDash([2, 3]);
            ctx.beginPath();
            ctx.moveTo(cx + 8, cy);
            ctx.lineTo(cx + 8 + Math.cos(a) * 40, cy - Math.sin(a) * 40);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }, 2),
      );
      w.flags.twist = 'empty';
      w.onTick((w2) => {
        const p = w2.player;
        const a = angle(w2);
        w2.flags.cannonA = a;
        if (!loaded && !fired && hits(p, cx, cy - 10, 16, 20)) {
          loaded = true;
          w2.sfx('thud', cx + 8, cy);
          npc(w2, 'Golconda express! | Golconda express!', cx + 8, cy - 40, 1.2);
        }
        if (loaded && !fired) {
          p.hidden = true;
          p.x = cx + 3;
          p.y = cy - p.h + 4;
          p.vx = 0;
          p.vy = 0;
          p.stun = 2;
          if (w2.input.jumpPressed) {
            fired = true;
            p.hidden = false;
            p.x = Math.round(cx + 8 + Math.cos(a) * 20 - p.w / 2);
            p.y = Math.round(cy - Math.sin(a) * 20 - p.h / 2);
            p.vx = V * Math.cos(a);
            p.vy = -V * Math.sin(a);
            p.launched = true;
            p.onGround = false;
            p.stun = 90;
            w2.sfx('boom', cx + 8, cy);
            w2.emit('shake', cx + 8, cy, { amount: 5 });
            w2.emit('fx', cx + 8 + Math.cos(a) * 24, cy - Math.sin(a) * 24, { kind: 'poof', w: 12, h: 12 });
          }
        }
        if (fired && p.onGround && p.stun > 0 && w2.flags.twist === 'fired') {
          p.stun = 0;
          p.vx *= 0.3;
          w2.flags.twist = 'landed';
        }
        if (!(fired && w2.flags.twist === 'landed')) w2.flags.twist = fired ? 'fired' : loaded ? 'loaded' : 'empty';
      });
    },
  },

  /** Salar Jung's double statue: from this side it's a stone back. The door is on its front: go round
   *  over the top and come at it from the other side. */
  backdoor: {
    space: 10,
    advice: 'This door faces the other way: from the front you only see the statue’s back. Climb over it from the crate, drop down behind, and walk into the door facing it.',
    paint: (g, D) => void g.fill(D - 1, D - 1, 11, 14, '#'),
    build(w, d) {
      w.add(new Thing('crate', d.x - px(2), FLOOR - 16, { layer: 1, tint: '#8D6E63' }));
      const draw = d.draw.bind(d);
      d.draw = (ctx, w2) => {
        ctx.save();
        ctx.translate(2 * d.x + 16, 0);
        ctx.scale(-1, 1);
        draw(ctx, w2);
        ctx.restore();
      };
      w.add(
        new Paint((ctx) => {
          // the cloaked back of the statue over the pillar
          const x = d.x - px(1);
          ctx.fillStyle = '#6D6A75';
          rr(ctx, x - 1, FLOOR - 64, 18, 64, 4);
          ctx.fill();
          ctx.fillStyle = '#57545E';
          for (let i = 0; i < 5; i++) ctx.fillRect(x + 2 + i * 3, FLOOR - 48, 1.2, 46);
          ctx.fillStyle = '#7A7782';
          ctx.beginPath();
          ctx.arc(x + 8, FLOOR - 66, 6, 0, Math.PI * 2);
          ctx.fill();
        }, 1),
      );
      let told = -999;
      d.onReach = (w2) => {
        const p = w2.player;
        if (p.facing < 0) return w2.win('door');
        if (w2.tick - told < 150) return;
        told = w2.tick;
        npc(w2, 'Ulta side, miya! Face the door! | Wrong side, buddy! Face it!', d.x + 8, d.y - 10, 1.2);
      };
      let said = false;
      w.flags.twist = 'back';
      w.flags.crate = d.x - px(2);
      w.onTick((w2) => {
        if (said || w2.player.x + w2.player.w < d.x - px(1) - 2) return;
        said = true;
        tara(w2, 'That’s the statue’s back, Dad. The door faces the other way! | The door faces the other way!', 2.6);
      });
    },
  },

  /** Tollywood climax: the goons pour out of the door. On the ground they're a blur; in the air,
   *  it's slow motion. Keep jumping. */
  slowmo: {
    space: 12,
    advice: 'The goons run out of the door far too fast to dodge on foot, but while you’re in the air everything goes slow motion: keep jumping and land between them.',
    build(w, d) {
      const goons: Mover[] = [];
      let next = 0;
      const slow = (w2: World) => !w2.player.onGround && w2.state === 'play' && w2.player.x > d.x - px(12);
      w.onTick((w2) => {
        const p = w2.player;
        const sm = slow(w2);
        w2.flags.slowmo = sm ? 1 : 0;
        const k = sm ? 0.22 : 1;
        const inArea = p.x > d.x - px(12) && p.x < d.x - 20;
        if (inArea && w2.tick >= next) {
          next = w2.tick + secs(0.8);
          const g = w2.add(
            new Mover(d.x + 18, FLOOR - 14, 12, 14, 'goons', (ctx, m, w3) => {
              const run = Math.sin(w3.tick * 0.5) * 2;
              person(ctx, m.x + 6, m.y + Math.abs(run) * 0.3, 14, '#212121', '#8D5524', { arms: 4 });
              ctx.fillStyle = '#B71C1C';
              ctx.fillRect(m.x + 3, m.y + 2, 6, 1.2);
            }),
          );
          g.vx = -300;
          goons.push(g);
        }
        for (const g of goons) {
          if (!g.alive) continue;
          g.x += g.vx * k * DT;
          if (g.x < d.x - px(14)) g.alive = false;
        }
        w2.flags.goons = goons.filter((g) => g.alive).map((g) => g.x);
      });
      let said = false;
      w.onTick((w2) => {
        if (said || w2.player.x < d.x - px(12)) return;
        said = true;
        tara(w2, 'Climax fight, Dad! Jump and the world goes slow-mo! | Jump: the world goes slow motion!', 2.6);
      });
      w.flags.twist = 'fight';
    },
  },

  // ================================================================ Mumbai
  /** The studio door: "Dance first, then entry!" Do the step in the spotlight. */
  bollywood: {
    space: 10,
    advice: 'In the spotlight the director wants the step shown over the door: left, right, left, right, jump. One wrong move and it’s cut, from the top.',
    build(w, d) {
      const L = lock(w, d, 'Pehle dance! | Dance first!');
      const MOVES: ('L' | 'R' | 'J')[] = ['L', 'R', 'L', 'R', 'J'];
      const glyph = { L: '←', R: '→', J: '⤒' };
      const s0 = d.x - px(6),
        s1 = d.x - px(1);
      let i = 0,
        prev = { l: false, r: false },
        said = false;
      w.add(
        new Paint((ctx, w2) => {
          const g = ctx.createRadialGradient((s0 + s1) / 2, FLOOR, 4, (s0 + s1) / 2, FLOOR - 10, 52);
          g.addColorStop(0, 'rgba(255,245,200,0.55)');
          g.addColorStop(1, 'rgba(255,245,200,0)');
          ctx.fillStyle = g;
          ctx.fillRect(s0 - 20, FLOOR - 70, s1 - s0 + 40, 70);
          if (L.open) return;
          MOVES.forEach((m, k) => {
            const x = d.x + 8 + (k - 2) * 12;
            ctx.fillStyle = k < i ? '#FFD740' : 'rgba(0,0,0,0.55)';
            rr(ctx, x - 5, d.y - 24, 10, 10, 2);
            ctx.fill();
            text(ctx, glyph[m], x, d.y - 19, 7, k < i ? '#212121' : '#FFFFFF', '');
          });
          text(ctx, 'DANCE!', d.x + 8, d.y - 32, 6, '#FF80AB');
          void w2;
        }, -1),
      );
      w.flags.twist = 'locked';
      w.onTick((w2) => {
        const p = w2.player;
        const inSpot = p.cx > s0 && p.cx < s1;
        const inp = w2.input;
        const ev: 'L' | 'R' | 'J' | null = inp.jumpPressed ? 'J' : inp.left && !prev.l ? 'L' : inp.right && !prev.r ? 'R' : null;
        prev = { l: inp.left, r: inp.right };
        w2.flags.danceI = i;
        w2.flags.spot = [s0, s1];
        if (L.open) return;
        if (inSpot && !said) {
          said = true;
          npc(w2, 'Lights! Camera! Dance, hero! | Lights, camera, dance!', d.x + 8, d.y - 44, 1.8);
        }
        if (!inSpot || !ev) return;
        if (ev === MOVES[i]) {
          i++;
          w2.sfx('clap', p.cx, p.y);
          if (i >= MOVES.length) {
            npc(w2, 'Superhit! Entry! | Superhit! Come in!', d.x + 8, d.y - 44, 1.6);
            w2.emit('fx', d.x + 8, d.y - 10, { kind: 'confetti' });
            L.unlock();
          }
        } else if (i > 0) {
          i = 0;
          w2.sfx('thud', p.cx, p.y);
          npc(w2, 'Cut! Phir se! | Cut! From the top!', d.x + 8, d.y - 44, 1.2);
        }
      });
    },
  },

  /** Kabaddi! In the court you must keep chanting: hold the jump button the whole way.
   *  Let go, or run out of breath, and they tackle you. */
  kabaddi: {
    space: 12,
    advice: 'Kabaddi! Inside the court you must keep chanting: hold the jump button all the way to the door. Let go, or dawdle till your breath runs out, and you’re tackled.',
    build(w, d) {
      const c0 = d.x - px(9),
        c1 = d.x - 2;
      const BREATH = 2.6;
      let inT = -1;
      w.add(
        new Paint((ctx, w2) => {
          ctx.fillStyle = 'rgba(255,255,255,0.75)';
          ctx.fillRect(c0, FLOOR - 1, 2, 1);
          ctx.fillRect(c0, FLOOR - 1, c1 - c0, 0.8);
          ctx.fillRect(c0 + (c1 - c0) / 2, FLOOR - 1, 1, 1);
          text(ctx, 'KABADDI COURT', c0 - 14, FLOOR - 46, 5, '#FFAB40', 'rgba(0,0,0,0.6)', 'left');
          text(ctx, 'HOLD ⤒ ALL THE WAY', c0 - 14, FLOOR - 38, 5, '#FFFFFF', 'rgba(0,0,0,0.6)', 'left');
          const n = inT >= 0 ? 0 : 3;
          for (let k = 0; k < 3; k++) {
            const x = c0 + px(4) + k * 18,
              lunge = n === 0 && w2.flags.twist === 'tackle' ? 6 : 0;
            person(ctx, x - lunge, FLOOR - 16, 16, '#1565C0', '#8D5524', { arms: 3 });
          }
          const p = w2.player;
          if (inT >= 0 && !p.dead) {
            const left = Math.max(0, 1 - (tt(w2) - inT) / BREATH);
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(p.cx - 9, p.y - 9, 18, 3);
            ctx.fillStyle = left > 0.3 ? '#4FC3F7' : '#FF5252';
            ctx.fillRect(p.cx - 9, p.y - 9, 18 * left, 3);
            if (w2.tick % 24 < 16) text(ctx, 'kabaddi-kabaddi', p.cx, p.y - 16, 4.5, '#FFFFFF');
          }
        }, 3),
      );
      let said = false;
      w.flags.twist = 'out';
      w.flags.court = [c0, c1];
      w.onTick((w2) => {
        const p = w2.player;
        const inside = p.x + p.w > c0 && p.x < c1;
        if (!said && p.x > c0 - px(3.5)) {
          said = true;
          tara(w2, 'Kabaddi! Hold JUMP and keep chanting all the way! | Hold jump the whole way across!', 3);
        }
        if (!inside) {
          inT = -1;
          w2.flags.twist = 'out';
          return;
        }
        if (inT < 0) inT = tt(w2);
        if (w2.tick % 30 === 0) w2.sfx('chant', p.cx, p.y);
        const breath = tt(w2) - inT < BREATH;
        if ((!w2.input.jump || !breath) && w2.state === 'play') {
          w2.flags.twist = 'tackle';
          npc(w2, breath ? 'Out! No chant, no raid! | Out! You stopped chanting!' : 'Out of breath! Out! | Out of breath!', p.cx, p.y - 18, 1.4);
          w2.die('tackled');
          return;
        }
        w2.flags.twist = 'raid';
      });
    },
  },

  /** Dahi handi: the door is the pot hanging high over the street. Climb the human pyramid before it
   *  wobbles apart, and break the pot. */
  dahihandi: {
    space: 10,
    advice: 'Climb the Govinda pyramid, tier by tier, and jump into the pot hanging over the street. Don’t stop on the way: once you’re on it, it holds for only a few seconds.',
    build(w, d) {
      const cx = d.x - px(2);
      const tiers = [
        { y: FLOOR - 24, w: 42, amp: 0, n: 3 },
        { y: FLOOR - 56, w: 30, amp: 4, n: 2 },
        { y: FLOOR - 88, w: 16, amp: 9, n: 1 },
      ].map((t) => {
        const s = w.add(new Thing('plank', cx - t.w / 2, t.y, { w: t.w, h: 4, oneWay: true, layer: 1 }));
        s.visible = false;
        return { ...t, s };
      });
      d.x = cx - 8;
      d.y = FLOOR - 180;
      const draw = d.draw.bind(d);
      d.draw = (ctx, w2) => {
        ctx.strokeStyle = '#D7CCC8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(d.x - 60, d.y - 20);
        ctx.lineTo(d.x + 8, d.y + 2);
        ctx.lineTo(d.x + 76, d.y - 20);
        ctx.stroke();
        ctx.fillStyle = '#E65100';
        ctx.beginPath();
        ctx.ellipse(d.x + 8, d.y + 18, 13, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFF3E0';
        ctx.fillRect(d.x - 3, d.y + 4, 22, 3);
        ctx.fillStyle = '#FFD54F';
        for (let i = 0; i < 6; i++) ctx.fillRect(d.x - 4 + i * 4, d.y + 26 + (i % 2) * 2, 2, 2);
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.translate(d.x + 3, d.y + 9);
        ctx.scale(0.35, 0.35);
        draw(ctx, w2);
        ctx.restore();
      };
      d.exit.zone = () => ({ x: d.x - 4, y: d.y + 6, w: 24, h: 22 });
      let t0 = -1,
        fallen = -1;
      w.add(
        new Paint((ctx, w2) => {
          if (fallen >= 0 && w2.tick - fallen < secs(1.6)) return;
          for (const t of tiers) {
            const x0 = t.s.solid.x;
            for (let k = 0; k < t.n; k++) person(ctx, x0 + 7 + k * 14, t.s.solid.y, 24, ['#FB8C00', '#43A047', '#E53935'][k % 3], '#8D5524', { arms: 6 });
          }
        }, 1),
      );
      w.flags.twist = 'stand';
      w.onTick((w2) => {
        const p = w2.player;
        const up = fallen < 0 || w2.tick - fallen > secs(1.6);
        tiers.forEach((t, i) => {
          const ox = Math.sin(tt(w2) * 2.6 + i) * t.amp;
          t.s.solid.collidable = up;
          t.s.place(w2, cx - t.w / 2 + ox, t.y);
        });
        const on = tiers.some((t) => w2.standing(t.s.solid));
        if (on && t0 < 0) {
          t0 = w2.tick;
          npc(w2, 'Govinda ala re ala! | Here come the Govindas!', cx, FLOOR - 120, 1.6);
        }
        if (t0 >= 0 && w2.tick - t0 > secs(2.4) && fallen < 0) {
          fallen = w2.tick;
          t0 = -1;
          w2.sfx('collapse', cx, FLOOR - 40);
          w2.emit('shake', cx, FLOOR - 20, { amount: 4 });
          npc(w2, 'Gire! Gire! | They fell!', cx, FLOOR - 60, 1.2);
          if (on || hits(p, cx - 24, FLOOR - 100, 48, 100)) w2.die('crushed');
        }
        if (fallen >= 0 && w2.tick - fallen > secs(1.6)) fallen = -2;
        w2.flags.twist = on ? 'climb' : 'stand';
        w2.flags.tiers = tiers.map((t) => [t.s.solid.x, t.s.solid.y, t.w]);
      });
    },
  },

  /** The finale: THE END rolls... and the credits are the stairs to the last door. */
  credits: {
    space: 10,
    advice: 'THE END? Not yet: the last door is up in the sky, and the credits are your stairs. Ride a line up and hop right to the next as they rise.',
    paint: (g, D) => {
      g.put(D, 14, '.');
      g.put(D, 4, 'E');
      for (const c of [D - 4, D - 3, D - 2, D - 1, D, D + 1]) g.put(c, 14, '^');
    },
    build(w, d) {
      const LINES = [
        'THE END',
        'Directed by TARA',
        'Dad .......... DAD',
        'Stunts: also Dad',
        'Mummy: Producer',
        'Chai: Juhu tapri',
        'No dads were harmed*',
        '*seven times',
        'Thala for a reason',
        'Thank you for playing!',
      ];
      const X = [d.x - px(6.5), d.x - px(4), d.x - px(1.5)];
      const RISE = 40,
        EVERY = 0.85,
        TOP = 70;
      const lines: { t: Thing; n: number; born: number }[] = [];
      let n = 0,
        next = -1,
        started = false;
      w.add(
        new Paint((ctx, w2) => {
          for (const l of lines) {
            if (!l.t.alive) continue;
            const s = l.t.solid;
            const a = Math.min(1, (s.y - TOP) / 30);
            ctx.globalAlpha = Math.max(0, a);
            ctx.fillStyle = 'rgba(10,8,20,0.55)';
            rr(ctx, s.x, s.y - 1, s.w, 8, 2);
            ctx.fill();
            text(ctx, LINES[l.n % LINES.length], s.x + s.w / 2, s.y + 3, 5.5, l.n % LINES.length === 0 ? '#FFD740' : '#FFFFFF', '');
            ctx.globalAlpha = 1;
          }
          void w2;
        }, 1),
      );
      w.flags.twist = 'idle';
      w.onTick((w2) => {
        const p = w2.player;
        if (!started && p.x > d.x - px(9)) {
          started = true;
          next = w2.tick + secs(0.6);
          w2.flags.banner = { text: 'THE END', sub: 'thanks for playing!', t0: w2.tick, dur: 2.2, style: 'end' };
          w2.after(2.0, () => tara(w2, 'THE END? One more door, Dad! Climb the credits! | One more door! Climb the credits!', 3));
        }
        if (started && w2.tick >= next) {
          next = w2.tick + secs(EVERY);
          const k = n % 3;
          const lane = [0, 2, 1][k];
          const width = 46;
          const t = w2.add(new Thing('plank', X[lane] + 8 - width / 2, FLOOR, { w: width, h: 4, oneWay: true, layer: 1 }));
          t.visible = false;
          lines.push({ t, n, born: w2.tick });
          n++;
        }
        for (const l of lines) {
          if (!l.t.alive) continue;
          const y = FLOOR - ((w2.tick - l.born) * DT) * RISE;
          if (y < TOP) {
            l.t.alive = false;
            l.t.solid.collidable = false;
            continue;
          }
          l.t.solid.velX = 0;
          l.t.place(w2, l.t.solid.x, y);
        }
        w2.flags.lines = lines.filter((l) => l.t.alive).map((l) => [l.t.solid.x, l.t.solid.y, l.t.solid.w]);
        w2.flags.twist = started ? 'roll' : 'idle';
      });
    },
  },
};

/** every door ending; city modules' endings are added by src/game/cities/install.ts */
export const ENDINGS = { ...OLD_ENDINGS, ...NEW_ENDINGS, ...WEST_ENDINGS } as Record<EndingKind, Ending>;

export const isEnding = (k: string | undefined): k is EndingKind => !!k && k in ENDINGS;
