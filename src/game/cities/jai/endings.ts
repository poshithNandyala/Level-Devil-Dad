// Jaipur's door endings.
import { Entity, type World } from '../../world';
import { Player } from '../../player';
import { Solid } from '../../body';
import { DT } from '../../constants';
import { px } from '../../levels/kit';
import { FLOOR, lock, npc, Paint, tara } from '../../levels/endkit';
import { Balloon, Bangle, Board, Bowl, brazierArt, Elephant, Ghodi, Pots, Shards } from './entities';
import type { Ending } from '../../levels/endkit';

export type JaiEndingKind = 'sutradhar' | 'toran' | 'shant' | 'naap' | 'dulha' | 'palat' | 'salaami';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<JaiEndingKind, true> {}
}

export const endings: Record<JaiEndingKind, Ending> = {
  /** The show's last act: the puppeteer hands Dad the control bar. Now his buttons work the puppet up on
   *  the little stage (Dad stands still), and the door only opens once she reaches hers. */
  sutradhar: {
    space: 18,
    advice: 'At the end the puppeteer hands you the strings: stand on his spot and your buttons work the puppet on the little stage instead of you. Walk her over the gap and the step to her tiny door, and yours opens. Drop her and the show’s over.',
    paint: (g, D) => {
      g.fill(D - 12, D - 2, 12, 12, '#');
      g.fill(D - 8, D - 7, 12, 12, '.');
      g.fill(D - 5, D - 5, 11, 11, '#');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const L = lock(w, d, 'Pehla show poora karo! | Finish the show first!');
      const spot = px(D - 15) + 8;
      const stageTop = px(12);
      const puppet = new Player(px(D - 12) + 3, stageTop - 14);
      let held = false,
        done = false,
        bowAt = -1;
      w.flags.puppet = puppet;
      w.flags.twist = 'walk';
      w.add(
        new (class extends Entity {
          layer = 4;
          update(w2: World) {
            const p = w2.player;
            if (w2.state !== 'play') return;
            if (!held && !done && p.onGround && Math.abs(p.cx - spot) < 6) {
              held = true;
              w2.flags.twist = 'puppet';
              npc(w2, 'Lo, dor tharo haath mein! | Here, the strings are yours!', spot, FLOOR - 40, 1.6);
            }
            if (!held) return;
            p.stun = 2;
            p.vx = 0;
            puppet.update(w2, w2.input);
            if (puppet.y > FLOOR + 30) return w2.die('puppet');
            if (puppet.cx >= px(D - 3) + 4 && puppet.onGround) {
              held = false;
              done = true;
              bowAt = w2.tick;
              L.open = true;
              w2.flags.twist = 'done';
              w2.sfx('clap', puppet.cx, puppet.y);
              npc(w2, 'Wah! Wah! | Bravo! Bravo!', px(D - 7), stageTop - 30, 1.6);
            }
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            const t = w2.tick * DT;
            // the little stage's curtains, her tiny door
            ctx.fillStyle = '#B71C1C';
            ctx.fillRect(px(D - 12) - 4, stageTop - 44, 4, 44);
            ctx.fillRect(px(D - 1), stageTop - 44, 4, 44);
            ctx.fillStyle = '#880E4F';
            ctx.fillRect(px(D - 12) - 6, stageTop - 50, px(11) + 12, 7);
            ctx.fillStyle = '#5D4037';
            ctx.fillRect(px(D - 3) + 4, stageTop - 16, 9, 16);
            ctx.fillStyle = '#FFC107';
            ctx.fillRect(px(D - 3) + 10, stageTop - 8, 1.5, 1.5);
            // the puppet: wooden face, big eyes, a red flared skirt, on her strings
            const x = puppet.cx,
              f = puppet.y + puppet.h;
            const bow = bowAt >= 0 && w2.tick - bowAt < 90 ? Math.sin(((w2.tick - bowAt) / 90) * Math.PI) * 0.6 : 0;
            ctx.save();
            ctx.translate(x, f);
            ctx.fillStyle = '#C62828';
            ctx.beginPath();
            ctx.moveTo(-2, -9);
            ctx.lineTo(2, -9);
            ctx.lineTo(6 + Math.sin(t * 6) * 0.8, 0);
            ctx.lineTo(-6 + Math.sin(t * 6) * 0.8, 0);
            ctx.fill();
            ctx.fillStyle = '#FFC107';
            ctx.fillRect(-6, -1.5, 12, 1.2);
            ctx.rotate(bow);
            ctx.fillStyle = '#F57F17';
            ctx.fillRect(-2, -13, 4, 4);
            ctx.fillStyle = '#FFE0B2';
            ctx.beginPath();
            ctx.ellipse(0, -16, 3, 3.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#212121';
            ctx.fillRect(-1.8, -17, 1.2, 1.2);
            ctx.fillRect(0.6, -17, 1.2, 1.2);
            ctx.fillStyle = '#AD1457';
            ctx.beginPath();
            ctx.arc(0, -18, 3.4, Math.PI, 0);
            ctx.fill();
            ctx.restore();
            // her strings up to the bar, and the long string back to Dad's hands
            if (held || bowAt >= 0) {
              const by = stageTop - 62;
              ctx.strokeStyle = 'rgba(255,255,240,0.75)';
              ctx.lineWidth = 0.6;
              ctx.beginPath();
              ctx.moveTo(x - 8, by);
              ctx.lineTo(x + 8, by);
              ctx.moveTo(x - 6, by);
              ctx.lineTo(x - 3, f - 8);
              ctx.moveTo(x, by);
              ctx.lineTo(x, f - 19);
              ctx.moveTo(x + 6, by);
              ctx.lineTo(x + 3, f - 8);
              if (held) {
                ctx.moveTo(x - 8, by);
                ctx.lineTo(w2.player.cx + 3, w2.player.y + 2);
              }
              ctx.stroke();
            }
            // the puppeteer's spot
            if (!held && !done) {
              ctx.fillStyle = 'rgba(255,235,59,0.55)';
              ctx.fillRect(spot - 7, FLOOR - 2, 14, 2);
            }
          }
        })(),
      );
      w.when(
        (w2) => w2.player.cx > px(D - 18),
        (w2) => tara(w2, 'Seedha darwaje jaavo, Dad! | Go straight to the door, Dad!', 2.4),
      );
    },
  },

  /** A Rajasthani door is entered only after the toran over it has been struck. You've no stick: swing
   *  the tower of pots on your head until the top one rings it, and not one bit further. */
  toran: {
    space: 14,
    advice: 'The door opens only once you’ve struck the toran hanging over it, and all you have is the tower of pots. Take a good run at it and stop dead on the mark: the pots swing forward and the top one strikes the toran. Stop at the wrong moment and they swing the other way.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const pots = w.entities.find((e) => e instanceof Pots) as Pots | undefined;
      const L = lock(w, d, 'Pehla toran maaro! | Strike the toran first!');
      const mark = px(D) - 12;
      // where the toran hangs: the top pot reaches it leaning about a third of the way to falling
      const tx = mark + Math.sin(0.26) * 36,
        ty = FLOOR - 14 - Math.cos(0.26) * 36;
      w.flags.toran = { x: tx, y: ty, mark };
      w.flags.twist = 'shut';
      let struck = -1;
      w.add(
        new (class extends Entity {
          layer = 3;
          update(w2: World) {
            if (struck >= 0 || !pots || !pots.held) return;
            const tp = pots.top(w2);
            if (Math.hypot(tp.x - tx, tp.y - ty) < 7) {
              struck = w2.tick;
              L.open = true;
              w2.flags.twist = 'open';
              w2.sfx('bell', tx, ty);
              npc(w2, 'Toran maaryo! Padharo! | Toran struck! Come in!', tx, ty - 16, 1.6);
            }
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            // the toran: a beam over the door hung with mango leaves and little brass bells
            const swing = struck >= 0 ? Math.sin((w2.tick - struck) * 0.3) * Math.max(0, 1 - (w2.tick - struck) / 120) * 0.4 : 0;
            ctx.fillStyle = '#8D6E63';
            ctx.fillRect(tx - 14, ty - 10, px(2) + 4, 3);
            ctx.save();
            ctx.translate(tx, ty - 8);
            ctx.rotate(swing);
            for (let k = -3; k <= 3; k++) {
              ctx.fillStyle = k % 2 ? '#43A047' : '#FFB300';
              ctx.beginPath();
              ctx.moveTo(k * 4, 0);
              ctx.lineTo(k * 4 - 2, 6);
              ctx.lineTo(k * 4, 9);
              ctx.lineTo(k * 4 + 2, 6);
              ctx.fill();
            }
            ctx.restore();
            // the mark to stand on
            if (struck < 0) {
              ctx.fillStyle = 'rgba(233,30,99,0.6)';
              ctx.fillRect(mark - 6, FLOOR - 2, 12, 2);
            }
          }
        })(),
      );
      w.when(
        (w2) => w2.player.cx > px(D - 12),
        (w2) => tara(w2, 'Dheere dheere jaavo, Dad! | Go slowly, slowly, Dad!', 2.4),
      );
    },
  },

  /** The last bowl has the door in its very bottom, a little bronze hatch that only opens under someone
   *  standing still. All that swinging: now kill it, and wait. */
  shant: {
    space: 16,
    after: 11,
    advice: 'The door is under the little bronze hatch in the very bottom of the last bowl, and it only opens under someone standing still. Drop in, then push against the way you’re sliding until you stop at the bottom, and wait.',
    paint: (g, D) => {
      g.fill(D - 12, D - 11, 13, 14, '#').fill(D - 10, D - 6, 11, 14, '#');
      g.fill(D + 6, D + 9, 11, 14, '#');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const half = 88,
        depth = 64;
      const R = (half * half + depth * depth) / (2 * depth);
      const max = Math.asin(half / R);
      w.add(new Board(px(D) + 8 - half, FLOOR - depth, half - 32));
      const b = w.add(new Bowl(px(D) + 8, FLOOR, R, max, max, { hatch: true }));
      w.flags.lastBowl = b;
      d.hidden = true;
      const L = lock(w, d, '');
      let still = 0;
      w.flags.twist = 'swinging';
      w.add(
        new (class extends Entity {
          update(w2: World) {
            const calm = b.in && Math.abs(b.phi) < 0.06 && Math.abs(b.speed) < 18;
            still = calm ? still + 1 : 0;
            w2.flags.still = still;
            b.calm = Math.min(1, still / 96);
            if (still >= 96 && !L.open) {
              L.unlock();
              d.hidden = false;
            }
          }
        })(),
      );
      w.when(
        () => b.in,
        (w2) => tara(w2, 'Hilo mat! Shaant! | Don’t move! Be still!', 2.4),
      );
    },
  },

  /** The last doorway is a little round one, too small for the bangle, and the lane up to it is all
   *  glass. So do what a manihar does to make a bangle fit: warm it over the coals till it shrinks.
   *  Leave it there too long and it's a puddle. */
  naap: {
    space: 16,
    advice: 'The glass goes right through the last little doorway, and the bangle is too big for it. Do what the bangle makers do: stop it over the coals till it shrinks enough to fit (it glows as it softens), then roll on through. Too long on the coals and it melts.',
    paint: (g, D) => {
      g.fill(D - 3, D - 3, 0, 12, '#');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const b = w.add(new Bangle(px(D - 13) + 8, FLOOR, 20, '#6A1B9A'));
      b.heat = [{ x0: px(D - 10), x1: px(D - 8) }];
      w.flags.lastBangle = b;
      w.flags.coals = b.heat[0];
      w.add(new Paint((ctx, w2) => brazierArt(ctx, px(D - 10), px(D - 8), FLOOR, w2.tick / 120), -2));
      w.add(new Shards(px(D - 7), px(D) - 2, FLOOR));
      // the little doorway: a lintel low over it
      w.add(
        new (class extends Entity {
          solid = new Solid(px(D - 3), FLOOR - 48, 16, 22);
          layer = 2;
          draw(ctx: CanvasRenderingContext2D) {
            ctx.fillStyle = '#C2185B';
            ctx.fillRect(px(D - 3), FLOOR - 48, 16, 22);
            ctx.fillStyle = '#FFD54F';
            ctx.fillRect(px(D - 3), FLOOR - 28, 16, 2);
            ctx.fillStyle = '#F8BBD0';
            ctx.beginPath();
            ctx.arc(px(D - 3) + 8, FLOOR - 26, 8, Math.PI, 0);
            ctx.fill();
          }
        })(),
      );
      w.flags.twist = 'big';
      let told = -999;
      w.add(
        new (class extends Entity {
          update(w2: World) {
            if (b.gone > 0) w2.flags.twist = 'big';
            else if (b.x > px(D - 2)) w2.flags.twist = 'through';
            else w2.flags.twist = b.r <= 15 ? 'fits' : 'big';
            // bumped the doorway with it still too big
            if (b.riding && b.r > 15 && b.x > px(D - 5) - 6 && w2.tick - told > 300) {
              told = w2.tick;
              tara(w2, 'Naap chhoto karo! Angithi pe! | Too big! Shrink it on the coals!', 2.4);
            }
          }
        })(),
      );
    },
  },

  /** All stage long you've wanted that horse off. Now it's a wedding, the door is for the groom, and a
   *  groom arrives on a horse: the costume rail across the lane takes it off anyone who goes under. */
  dulha: {
    space: 18,
    after: 5,
    advice: 'It’s a wedding, and the door only opens for a groom on his horse. The costume rail across the lane lifts the horse off anyone who rides under it: jump the rail (hold the jump) and arrive still wearing it. Lost it? It’s back on its stand.',
    paint: (g, D) => {
      g.fill(D + 3, D + 3, 9, 14, '#');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const g = w.add(new Ghodi(px(D - 15) + 8, 1e9, FLOOR));
      const rail = { x: px(D - 7), y: FLOOR - 36, w: 14, h: 36 };
      g.snags = [rail];
      w.flags.dulha = { g, rail };
      const L = lock(w, d, 'Bina ghodi ke dulha? | A groom without a horse?');
      w.add(
        new (class extends Entity {
          layer = 2;
          update(w2: World) {
            L.open = g.on;
            w2.flags.twist = g.on ? (w2.player.x > rail.x + rail.w ? 'groom' : 'riding') : 'onfoot';
          }
          draw(ctx: CanvasRenderingContext2D) {
            // the costume rail: two posts, a bar, hooks, a couple of spare horses' skirts hanging
            ctx.fillStyle = '#6D4C41';
            ctx.fillRect(rail.x - 2, rail.y - 4, 3, rail.h + 4);
            ctx.fillRect(rail.x + rail.w - 1, rail.y - 4, 3, rail.h + 4);
            ctx.fillStyle = '#FFD54F';
            ctx.fillRect(rail.x - 3, rail.y - 5, rail.w + 6, 2.5);
            ctx.fillStyle = '#C62828';
            ctx.fillRect(rail.x + 2, rail.y - 2, 4, 9);
            ctx.fillStyle = '#1565C0';
            ctx.fillRect(rail.x + 8, rail.y - 2, 4, 7);
            // marigolds over the door
            for (let k = 0; k < 7; k++) {
              ctx.fillStyle = k % 2 ? '#FB8C00' : '#FDD835';
              ctx.beginPath();
              ctx.arc(d.x - 6 + k * 4.6, d.y + 2 + Math.sin((k / 6) * Math.PI) * 4, 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        })(),
      );
      w.when(
        (w2) => w2.player.x > px(D - 17),
        (w2) => tara(w2, 'Baraat aa gayi! Dulha kathe? | The wedding party’s here! Where’s the groom?', 2.6),
      );
    },
  },

  /** The door is on top of a narrow tower, right where the wind that brought you won't let you stop.
   *  So don't: fly past it, drop in to the wind that blows back, and let that one set you down. */
  palat: {
    space: 16,
    after: 12,
    advice: 'The door is on top of a narrow tower, and the high wind carries you straight past it. Fly over it on purpose, then sink in to the middle wind, the one that blows back left, and let it carry you on to the tower top. Out you get when the basket settles there.',
    paint: (g, D) => {
      g.fill(D - 1, D + 1, 9, 14, '#');
      g.put(D, 14, '#');
      g.put(D, 8, 'E');
      g.fill(D + 11, D + 11, 0, 14, '#');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const bands = [
        { below: 112, vx: 110 },
        { below: 176, vx: -70 },
        { below: 999, vx: 50 },
      ];
      const b = w.add(new Balloon(px(D - 13) + 8, FLOOR, bands, { x0: px(D - 1), x1: px(D + 2) }, '#6A1B9A'));
      w.flags.lastBalloon = b;
      w.flags.towerTop = px(9);
      w.flags.twist = 'ground';
      w.add(
        new (class extends Entity {
          update(w2: World) {
            if (b.done) w2.flags.twist = 'landed';
            else if (!b.riding) w2.flags.twist = 'ground';
            else w2.flags.twist = b.bx > px(D + 2) ? 'past' : 'flying';
          }
        })(),
      );
      let said = false;
      w.add(
        new (class extends Entity {
          update(w2: World) {
            if (!said && b.riding && b.bx > px(D + 3)) {
              said = true;
              tara(w2, 'Nikal gya! Beech ri hawa pakdo! | Gone past! Catch the middle wind!', 2.6);
            }
          }
        })(),
      );
    },
  },

  /** Ganesh Pol is far too high: higher than her back and your best jump together. But all stage long
   *  she's been tossing you over her back whenever you dawdled at her trunk. Now aim her. */
  salaami: {
    space: 16,
    after: 5,
    advice: 'The gate is too high even from her back. Use the toss: ride her right up to the wall, jump off behind her tail, step up close, and stand still at her trunk once she’s turned to face you. She’ll throw you over her back, up on to the gate.',
    paint: (g, D) => {
      g.fill(D - 1, D + 3, 7, 14, '#');
      g.put(D, 6, 'E');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const e = w.add(new Elephant(px(D - 12), FLOOR));
      w.flags.lastHaathi = e;
      w.flags.gateX = px(D - 1);
      w.flags.twist = 'far';
      w.add(
        new (class extends Entity {
          layer = -2;
          update(w2: World) {
            const p = w2.player;
            if (p.onGround && p.y + p.h <= px(7) + 1 && p.x + p.w > px(D - 1)) w2.flags.twist = 'up';
            else w2.flags.twist = e.x + Elephant.W >= px(D - 1) - 10 ? 'parked' : 'far';
          }
          draw(ctx: CanvasRenderingContext2D) {
            // Ganesh Pol: a painted gateway framing the door (pillars, a frieze, a cusped arch)
            const gx = px(D - 1),
              gy = px(7);
            ctx.fillStyle = '#F6E2B3';
            ctx.fillRect(gx, gy - 44, 80, 9);
            ctx.fillRect(gx, gy - 44, 6, 44);
            ctx.fillRect(gx + 74, gy - 44, 6, 44);
            ctx.fillStyle = '#C62828';
            ctx.fillRect(gx, gy - 46, 80, 3);
            ctx.fillStyle = '#2E7D32';
            for (let k = 0; k < 9; k++) ctx.fillRect(gx + 4 + k * 8.4, gy - 41, 4, 3);
            ctx.strokeStyle = '#F06292';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(d.x + 8, gy - 20, 15, Math.PI, 0);
            ctx.stroke();
          }
        })(),
      );
      w.when(
        (w2) => w2.player.x > px(D - 6),
        (w2) => tara(w2, 'Ganesh Pol! Ghano ooncho hai! | Ganesh Pol! It’s very high!', 2.4),
      );
    },
  },
};
