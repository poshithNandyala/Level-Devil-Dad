// Kavaratti's door endings.
import { doorPic, FLOOR, hits, LAGOON, npc, Paint, tara, text, tt } from '../../levels/endkit';
import { DT, secs, TILE } from '../../constants';
import { px, shot } from '../../levels/kit';
import { pool } from '../../levels/acts';
import { Thing } from '../../entities/traps';
import { Sea } from '../../entities/abilities';
import { Kayak } from '../../levels/endings2';
import type { Ending } from '../../levels/endkit';

export type KvtEndingKind = 'reflection' | 'glider' | 'trapdoor' | 'footsteps' | 'pushoff' | 'safetystop';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<KvtEndingKind, true> {}
}

export const endings: Record<KvtEndingKind, Ending> = {
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
  /** Low tide: the reef flat in front of the door is full of urchins hiding in the weed. Old Koya knows
   *  the way: step only in his footprints, before the water fills them. */
  footsteps: {
    space: 16,
    advice: 'The reef flat is full of hidden urchins. Follow the old fisherman and hop only into his footprints, before the tide fills them in.',
    build(w, d) {
      const x0 = d.x - px(13),
        x1 = d.x - px(1);
      const prints: { x: number; t: number }[] = [];
      const LIFE = secs(2.4);
      let fx = x0 - 20,
        started = false,
        lastPrint = x0 - 20,
        foot = 0;
      w.flags.twist = 'wait';
      w.flags.prints = prints;
      w.add(
        new Paint((ctx, w2) => {
          // the reef flat: wet weed and rock
          ctx.fillStyle = '#5D6B3A';
          ctx.fillRect(x0, FLOOR - 3, x1 - x0, 4);
          for (let x = x0 + 3; x < x1; x += 7) {
            ctx.fillStyle = (x / 7) % 2 < 1 ? '#7A8B45' : '#4E5C30';
            ctx.fillRect(x, FLOOR - 4 - ((x * 13) % 3), 3, 2);
          }
          ctx.fillStyle = 'rgba(120,200,220,0.35)';
          ctx.fillRect(x0, FLOOR - 2, x1 - x0, 2);
          // footprints, filling with water as they fade
          for (const f of prints) {
            const age = (w2.tick - f.t) / LIFE;
            if (age >= 1) continue;
            ctx.fillStyle = `rgba(40,30,20,${0.85 * (1 - age)})`;
            ctx.beginPath();
            ctx.ellipse(f.x, FLOOR - 1.5, 5, 1.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(150,220,240,${0.6 * age})`;
            ctx.beginPath();
            ctx.ellipse(f.x, FLOOR - 1.5, 5 * age, 1.2 * age, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          // the fisherman, net over his shoulder
          if (fx > x0 - 30 && fx < x1 + 60) {
            ctx.fillStyle = '#ECEFF1';
            ctx.fillRect(fx - 4, FLOOR - 22, 8, 9);
            ctx.fillStyle = '#1565C0';
            ctx.fillRect(fx - 4, FLOOR - 13, 8, 6);
            ctx.fillStyle = '#8D5524';
            const step = Math.sin(foot * 0.25) * 2;
            ctx.fillRect(fx - 3 + step, FLOOR - 7, 2, 7);
            ctx.fillRect(fx + 1 - step, FLOOR - 7, 2, 7);
            ctx.beginPath();
            ctx.arc(fx, FLOOR - 25, 3.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(fx - 3.5, FLOOR - 29.5, 7, 2);
            ctx.strokeStyle = 'rgba(200,180,140,0.9)';
            ctx.lineWidth = 0.6;
            for (let i = 0; i < 4; i++) {
              ctx.beginPath();
              ctx.moveTo(fx - 4, FLOOR - 21 + i * 2);
              ctx.lineTo(fx - 10, FLOOR - 12 + i * 2);
              ctx.stroke();
            }
          }
        }, -1),
      );
      w.onTick((w2) => {
        const p = w2.player;
        if (!started && p.cx > x0 - px(1.5)) {
          started = true;
          fx = x0 + 6;
          lastPrint = fx - 48;
          w2.flags.twist = 'walk';
          npc(w2, 'Ente kaal-padu mathram chavittu! | Step only in my footprints!', fx, FLOOR - 40, 1.8);
        }
        if (started && fx < x1 + 50) {
          fx += 34 * DT;
          foot++;
          if (fx - lastPrint >= 48 && fx < x1) {
            lastPrint = fx;
            prints.push({ x: fx, t: w2.tick });
          }
        }
        // the flat itself: anywhere but a fresh footprint is an urchin
        if (p.onGround && p.cx > x0 + 2 && p.cx < x1 - 2) {
          const safe = prints.some((f) => w2.tick - f.t < LIFE && Math.abs(f.x - p.cx) < 12);
          if (!safe) w2.die('spikes');
        }
      });
      w.when(
        (w2) => w2.player.cx > x0 - px(3),
        (w2) => tara(w2, 'Eluppam! Nadannu po! | Easy! Just walk across!', 2.2),
      );
    },
  },

  /** The door is on a sandbar across the water. There's a kayak on the beach. Don't jump: push. */
  pushoff: {
    space: 14,
    advice: 'Too far to jump to the sandbar: walk into the kayak to push it down the beach, hop in as it floats off, and step out at the door.',
    paint: (g, D) => void g.pit(D - 7, D - 2),
    build(w, d) {
      const D = Math.round(d.x / 16);
      pool(w, D - 7, D - 1, 15.3, { colors: LAGOON });
      const k = w.add(new Kayak(px(D - 11), FLOOR, px(D - 7), px(D - 1)));
      w.flags.kayak = k;
      w.flags.twist = 'idle';
      w.when(
        (w2) => w2.player.cx > d.x - px(13),
        (w2) => tara(w2, 'Chaadu, Dad! Ithrayum alle ullu! | Jump, Dad! It’s not that far!', 2.4),
      );
      w.when(
        (w2) => k.state === 'afloat',
        (w2) => npc(w2, 'Thallu, thallu! Kayariko! | Push, push! Hop in!', k.solid.x + 17, k.solid.y - 20, 1.4),
      );
    },
  },

  // ================================================================ Kavaratti
  /** India's scuba school: no shooting straight up. Hang by the knot on the line with the instructor
   *  for three seconds (the safety stop) before you surface at the dive boat. */
  safetystop: {
    space: 16,
    advice: 'Divers never shoot straight up: hang by the knot on the line, next to the instructor, for three seconds. Then surface at the boat and climb aboard.',
    paint: (g, D) => {
      g.fill(D - 14, D - 13, 13, 17, '#');
      g.fill(D - 12, D - 11, 11, 17, '#');
      g.fill(D - 10, D + 2, 0, 16, '.');
      g.fill(D + 3, D + 4, 11, 17, '#');
      g.put(D, 9, 'E');
    },
    build(w, d) {
      const top = px(11.5);
      w.add(new Sea(w, d.x - px(10), d.x + px(3), top));
      // the dive boat, the door on its deck
      const boat = w.add(new Thing('odam', d.x - px(2.5), d.y + 32, { w: px(5), h: 22, layer: -3 }));
      boat.tint = '#E3F2FD';
      const lineX = d.x - px(4) + 8,
        knotY = 230;
      w.flags.twist = 'dive';
      w.flags.knot = [lineX, knotY];
      let held = 0,
        ok = false,
        pulled = -999;
      w.add(
        new Paint((ctx, w2) => {
          const t = w2.tick * DT;
          // the line, the knot and its flag
          ctx.strokeStyle = '#ECEFF1';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(lineX, d.y + 34);
          ctx.quadraticCurveTo(lineX + Math.sin(t) * 2, (d.y + 34 + 262) / 2, lineX, 262);
          ctx.stroke();
          ctx.fillStyle = '#FFCA28';
          ctx.beginPath();
          ctx.arc(lineX, knotY, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#E53935';
          ctx.fillRect(lineX + 1, knotY - 7, 6, 4);
          text(ctx, '5m', lineX + 4, knotY - 11, 4.5, '#FFFFFF');
          // the weight at the bottom
          ctx.fillStyle = '#455A64';
          ctx.fillRect(lineX - 3, 260, 6, 5);
          // the instructor, hanging at the knot: mask, black suit, yellow fins
          const ix = lineX + 13,
            iy = knotY + Math.sin(t * 1.6) * 1.5;
          ctx.save();
          ctx.translate(ix, iy);
          ctx.rotate(-0.25);
          ctx.fillStyle = '#263238';
          ctx.fillRect(-3, -6, 6, 13);
          ctx.fillStyle = '#FFD54F';
          ctx.beginPath();
          ctx.moveTo(-3, 7);
          ctx.lineTo(-7, 13 + Math.sin(t * 5) * 1.5);
          ctx.lineTo(-1, 9);
          ctx.moveTo(3, 7);
          ctx.lineTo(6, 13 - Math.sin(t * 5) * 1.5);
          ctx.lineTo(1, 9);
          ctx.fill();
          ctx.fillStyle = '#C68B59';
          ctx.beginPath();
          ctx.arc(0, -9, 3.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(120,200,255,0.85)';
          ctx.fillRect(-3.6, -11, 5.4, 2.6);
          ctx.restore();
          // counting on his fingers while you hang there
          if (!ok && held > 0) {
            const n = Math.min(3, 1 + Math.floor(held / 120));
            ctx.fillStyle = 'rgba(10,30,50,0.6)';
            ctx.beginPath();
            ctx.arc(ix + 9, iy - 14, 6, 0, Math.PI * 2);
            ctx.fill();
            text(ctx, String(n), ix + 9, iy - 14, 7, '#FFFFFF', '');
          }
          if (ok) text(ctx, 'OK', ix + 9, iy - 14, 6, '#69F0AE');
        }, 4),
      );
      w.onTick((w2) => {
        if (ok) return;
        const p = w2.player;
        const at = p.swimming && Math.abs(p.cx - lineX) < 28 && Math.abs(p.cy - knotY) < 16;
        held = at ? held + 1 : 0;
        w2.flags.stopT = held * DT;
        if (held === 1) w2.flags.twist = 'stop';
        else if (!at && w2.flags.twist === 'stop') w2.flags.twist = 'dive';
        if (held >= secs(3)) {
          ok = true;
          w2.flags.twist = 'ok';
          w2.sfx('win', lineX, knotY);
          npc(w2, 'Sheri! Ini mukalilekku! | OK! Now up you go!', lineX + 13, knotY - 22, 1.6);
          return;
        }
        // surfacing (or climbing aboard) near the boat without the stop: he pulls you back down
        if (p.cx > d.x - px(6.5) && p.y <= top + 4 && w2.tick - pulled > 40) {
          pulled = w2.tick;
          w2.warp(lineX - 44, knotY + 6, 'blink');
          npc(w2, 'Safety stop! Thazhekku vaa! | Safety stop! Come back down!', lineX + 13, knotY - 22, 1.6);
        }
      });
      w.when(
        (w2) => w2.player.cx > d.x - px(15),
        (w2) => tara(w2, 'Boat avide! Straight mukalilekku po! | There’s the boat! Straight up!', 2.4),
      );
      void FLOOR;
    },
  },
};
