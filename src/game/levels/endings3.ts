// Door endings for the western chapters (Goa onwards). Same rules as endings.ts: one per stage, never
// shared, and each keeps w.flags.twist up to date for the test policies.
import { Entity, type World } from '../world';
import { Player } from '../player';
import { Solid } from '../body';
import { DT } from '../constants';
import { px } from './kit';
import { pool } from './acts';
import { type Ending, FLOOR, Paint, lock, npc, tara, text } from './endkit';
import { aunty, poderArt } from './westkit';
import { Balloon, Bangle, Board, Bowl, Elephant, Ghodi, Pots, Shards, brazierArt } from '../entities/rajasthan';
import { Chumbak, Katori, Lake, Ledge, Shelter, Surma, Tawa, Thread, handArt } from '../entities/bhopal';
import { Chapda, Gedi, Ghadi, Heap, Kaante, Kosa, Mud, Sack, Top, clockFace } from '../entities/raipur';

export type WestEndingKind = 'sutradhar' | 'toran' | 'shant' | 'naap' | 'dulha' | 'palat' | 'salaami' | 'ghat' | 'haath' | 'gaanth' | 'khaali' | 'paan' | 'rakhdo' | 'kissa' | 'utar' | 'ghanta' | 'khisko' | 'lattu' | 'reel' | 'gud' | 'rath';

/** time within a repeating cycle */
export const cyc = (w: World, period: number, phase = 0) => ((((w.tick * DT - phase) % period) + period) % period);

export const WEST_ENDINGS: Record<WestEndingKind, Ending> = {
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
  // ------------------------------------------------------------------ Bhopal
  /** All stage long the lake has drowned anyone who stopped. Raja Bhoj's door is under it: on the
   *  ghat, where the steps go down in to the water, it's only waist deep. Stop there, and sink. */
  ghat: {
    space: 12,
    after: 6,
    advice: 'The door is under the water, at the foot of the ghat’s steps where the lake is shallow. Skip out, and over the pale water let go of everything so you sink there; or skip right across and wade back in from the far bank.',
    paint: (g, D) => {
      g.pit(D - 8, D + 2);
      g.fill(D - 2, D + 2, 17, 17, '#');
      g.put(D, 14, '.');
      g.put(D, 16, 'E');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const lake = w.add(new Lake(px(D - 8), px(D + 3), FLOOR + 3));
      lake.shallows = [{ x0: px(D - 2), x1: px(D + 3) }];
      w.flags.ghat = { lake, x0: px(D - 2), x1: px(D + 3) };
      w.flags.twist = 'dry';
      w.add(
        new Paint((ctx) => {
          // the pale shallows, the steps going down, a marker post
          ctx.fillStyle = 'rgba(220,245,240,0.35)';
          ctx.fillRect(px(D - 2), FLOOR + 3, px(5), 29);
          ctx.fillStyle = '#C9B48A';
          for (let k = 0; k < 4; k++) ctx.fillRect(px(D + 3) - 2 - k * 5, FLOOR + 4 + k * 7, 5 + k * 5, 7);
          ctx.fillStyle = '#6D4C41';
          ctx.fillRect(px(D + 4) + 6, FLOOR - 26, 2, 26);
          ctx.fillStyle = '#FFF8E1';
          ctx.fillRect(px(D + 4) - 4, FLOOR - 36, 22, 11);
          text(ctx, 'GHAT', px(D + 4) + 7, FLOOR - 30, 5, '#00695C');
        }, -1),
      );
      w.add(
        new (class extends Entity {
          update(w2: World) {
            const p = w2.player;
            const wet = p.y + p.h > FLOOR + 10 && p.cx > px(D - 2) && p.cx < px(D + 3);
            w2.flags.twist = wet ? 'wading' : p.cx > px(D + 3) ? 'across' : 'dry';
          }
        })(),
      );
      w.when(
        (w2) => w2.player.x > px(D - 11),
        (w2) => tara(w2, 'Darwaza? Paani ke neeche hai, khan! | The door? It’s under the water, friend!', 2.8),
      );
    },
  },

  /** No hand stencil where you need one. So make one, the way they did: stand at the bare patch of
   *  rock, hold still, and blow the ochre round your own hand. */
  haath: {
    space: 14,
    advice: 'There’s a painted wall, then a boulder, and no red hands. Make your own: stand quite still at each bare patch of rock (by the bowl of ochre) till your hand is on the wall, then jump and touch it. The door is a painted one.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const sh = (w.flags.shelter as Shelter) ?? w.add(new Shelter());
      w.flags.shelter = sh;
      w.add(new Ledge(sh, px(D - 9), px(5), 16, px(10), false));
      w.add(new Ledge(sh, px(D - 4), px(5), 32, px(10), true));
      const spots = [
        { x: px(D - 12) + 8, t: 0, made: false },
        { x: px(D - 6) + 8, t: 0, made: false },
      ];
      w.flags.spots = spots;
      w.flags.twist = 'bare';
      w.add(
        new (class extends Entity {
          layer = -3;
          update(w2: World) {
            const p = w2.player;
            // a painted door: only a painted man can use it
            d.hidden = !sh.painted;
            for (const s of spots) {
              if (s.made) continue;
              if (p.onGround && Math.abs(p.cx - s.x) < 9 && Math.abs(p.vx) < 6) {
                if (++s.t >= 96) {
                  s.made = true;
                  sh.hand(s.x, FLOOR - 40);
                  w2.sfx('win', s.x, FLOOR - 40);
                  w2.emit('fx', s.x, FLOOR - 40, { kind: 'sparkle' });
                }
              } else s.t = 0;
            }
            w2.flags.twist = spots[1].made ? 'two' : spots[0].made ? 'one' : 'bare';
          }
          draw(ctx: CanvasRenderingContext2D) {
            for (const s of spots) {
              // a bowl of ochre on the floor, and a pale smoothed patch of rock above it
              ctx.fillStyle = '#5D4037';
              ctx.fillRect(s.x - 5, FLOOR - 4, 10, 4);
              ctx.fillStyle = '#B03A1E';
              ctx.fillRect(s.x - 4, FLOOR - 5, 8, 2);
              if (s.made) continue;
              ctx.fillStyle = 'rgba(245,225,195,0.5)';
              ctx.beginPath();
              ctx.arc(s.x, FLOOR - 40, 10, 0, Math.PI * 2);
              ctx.fill();
              if (s.t > 0) handArt(ctx, s.x, FLOOR - 40, s.t / 96);
            }
            if (!sh.painted) {
              // the painted door, seen from outside the picture
              ctx.strokeStyle = 'rgba(176,58,30,0.75)';
              ctx.lineWidth = 1.5;
              ctx.strokeRect(d.x + 2, d.y + 6, 12, 26);
              ctx.beginPath();
              ctx.arc(d.x + 11, d.y + 20, 1, 0, Math.PI * 2);
              ctx.stroke();
            }
          }
        })(),
      );
      w.when(
        (w2) => w2.player.x > px(D - 15),
        (w2) => tara(w2, 'Yahan koi haath nahin! Apna lagao, miyan! | No hand here! Make your own, sir!', 2.8),
      );
    },
  },

  /** All stage long, touching your own thread was the end of you. An embroiderer finishes with a knot:
   *  at the gold ring, turn round and step back on to it. */
  gaanth: {
    space: 12,
    advice: 'The door wants the work finished off with a knot. At the gold ring, and only there, touching your own thread ties it: walk through the ring, turn round, and step straight back on to the thread.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const th = w.add(new Thread(px(D - 10) + 8, 1e9, FLOOR));
      const kx = px(D - 6);
      th.knot = { x0: kx, x1: kx + 26, y0: FLOOR - 24, y1: FLOOR };
      w.flags.knotAt = th.knot;
      const L = lock(w, d, 'Gaanth lagao pehle! | Tie the knot first!');
      w.flags.twist = 'loose';
      w.add(
        new Paint((ctx, w2) => {
          // the ring on its post, glinting
          ctx.fillStyle = '#6D4C41';
          ctx.fillRect(kx + 12, FLOOR - 4, 2, 4);
          ctx.strokeStyle = th.tied ? '#FFF176' : '#FFC107';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(kx + 13, FLOOR - 12, 11, 9, 0, 0, Math.PI * 2);
          ctx.stroke();
          if (!th.tied) {
            ctx.fillStyle = `rgba(255,255,255,${0.5 + 0.5 * Math.sin(w2.tick * 0.1)})`;
            ctx.fillRect(kx + 20, FLOOR - 19, 2, 2);
          }
        }, 3),
      );
      w.when(
        () => th.tied,
        (w2) => {
          L.unlock();
          w2.flags.twist = 'tied';
        },
      );
    },
  },
  /** The door is at the bottom of the big bowl, under the water, and a tap keeps the bowl full however
   *  hard you splash. Turn the tap off (the wheel is up on the ledge), then bounce it dry. */
  khaali: {
    space: 16,
    advice: 'The door is in the bottom of the big bowl, and the tap over it fills it as fast as you splash it out. First five bounces on the small bowl to get up on the ledge and turn the wheel: tap off. Then bounce in the big bowl till it’s dry.',
    paint: (g, D) => {
      g.fill(D - 8, D - 7, 11, 14, '#');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const small = w.add(new Katori(px(D - 11) + 8, FLOOR));
      const big = w.add(new Katori(px(D) + 8, FLOOR, 24, 6));
      big.tap = true;
      const vx = px(D - 7) + 8,
        vy = px(11);
      let shut = false;
      d.hidden = true;
      const L = lock(w, d, '');
      w.flags.khaali = { small, big, vx };
      w.flags.twist = 'tap';
      w.add(
        new (class extends Entity {
          layer = 2;
          update(w2: World) {
            const p = w2.player;
            if (!shut && p.onGround && Math.abs(p.cx - vx) < 9 && Math.abs(p.y + p.h - vy) < 3) {
              shut = true;
              big.tap = false;
              big.refill = 0;
              w2.sfx('creak', vx, vy);
              tara(w2, 'Nal band! Ab khaali karo! | Tap’s off! Now empty it!', 2.4);
            }
            if (big.dry && !L.open) {
              L.unlock();
              d.hidden = false;
            }
            w2.flags.twist = L.open ? 'dry' : shut ? 'shut' : 'tap';
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            // the wheel on the ledge, and its pipe along to the tap over the big bowl
            ctx.strokeStyle = '#78909C';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(vx, vy - 8);
            ctx.lineTo(vx, FLOOR - 61);
            ctx.lineTo(px(D) + 8, FLOOR - 61);
            ctx.stroke();
            ctx.strokeStyle = shut ? '#90A4AE' : '#E53935';
            ctx.beginPath();
            ctx.arc(vx, vy - 8, 5, 0, Math.PI * 2);
            ctx.stroke();
            const a = shut ? 0.8 : w2.tick * 0.02;
            ctx.beginPath();
            ctx.moveTo(vx - Math.cos(a) * 5, vy - 8 - Math.sin(a) * 5);
            ctx.lineTo(vx + Math.cos(a) * 5, vy - 8 + Math.sin(a) * 5);
            ctx.stroke();
          }
        })(),
      );
      w.when(
        (w2) => w2.player.x > px(D - 5) && !shut,
        (w2) => tara(w2, 'Nal chalu hai! Kabhi khaali nahin hogi! | The tap’s on! It’ll never empty!', 2.6),
      );
    },
  },

  /** Surma is sitting by the door, and every time you get near it: "The door? It was over there."
   *  And then it is. He can't tell it with his mouth full: bring him a paan. */
  paan: {
    space: 16,
    advice: 'Every time you get near the door Surma says it was "over there", and so it is. He can’t talk with his mouth full: pick up a paan at the shop, take it to him, and while he chews, walk to wherever the door is now.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const spots = [px(D), px(D - 13)];
      const s = w.add(new Surma(px(D - 4) + 8, FLOOR, []));
      const shop = px(D - 9) + 8;
      let carrying = false,
        cool = 0,
        due = -1;
      w.flags.paan = { s, shop, spots };
      w.flags.twist = 'talking';
      w.add(
        new (class extends Entity {
          layer = 3;
          update(w2: World) {
            const p = w2.player;
            if (w2.state !== 'play') return;
            if (cool > 0) cool--;
            if (!carrying && s.chew === 0 && Math.abs(p.cx - shop) < 9 && p.onGround) {
              carrying = true;
              w2.sfx('win', shop, FLOOR - 20);
            }
            if (carrying && Math.abs(p.cx - s.x) < 16) {
              carrying = false;
              s.chew = 6 * 120;
              due = -1;
              s.say(w2, 'Mmmf... hao... | Mmmf... yes...', 1.6);
            }
            if (s.chew === 0 && cool === 0 && due < 0 && Math.abs(p.cx - (d.x + 8)) < 46) {
              s.say(w2, 'Darwaza? Woh toh udhar tha, khan! | The door? It was over there, friend!', 1.8);
              due = w2.tick + 44;
              cool = 150;
            }
            if (due >= 0 && w2.tick >= due) {
              due = -1;
              if (s.chew === 0) {
                d.x = d.x === spots[0] ? spots[1] : spots[0];
                w2.emit('fx', d.x + 8, d.y + 16, { kind: 'sparkle' });
                w2.sfx('thud', d.x, d.y);
                w2.flags.swaps = (w2.flags.swaps ?? 0) + 1;
              }
            }
            w2.flags.carrying = carrying;
            w2.flags.twist = s.chew > 0 ? 'chewing' : carrying ? 'paan' : 'talking';
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            // the paan counter: a brass tray of leaves
            ctx.fillStyle = '#6D4C41';
            ctx.fillRect(shop - 10, FLOOR - 14, 20, 14);
            ctx.fillStyle = '#FFC107';
            ctx.fillRect(shop - 11, FLOOR - 16, 22, 3);
            ctx.fillStyle = '#2E7D32';
            for (let k = -8; k < 8; k += 5) ctx.fillRect(shop + k, FLOOR - 19, 4, 3);
            if (carrying) {
              const p = w2.player;
              ctx.fillStyle = '#2E7D32';
              ctx.beginPath();
              ctx.moveTo(p.cx - 4, p.y - 4);
              ctx.lineTo(p.cx + 4, p.y - 4);
              ctx.lineTo(p.cx, p.y - 10);
              ctx.fill();
              ctx.fillStyle = '#C62828';
              ctx.fillRect(p.cx - 0.8, p.y - 8, 1.6, 1.6);
            }
          }
        })(),
      );
    },
  },

  /** A row of spiked magnets low over the way to the door: with iron on you there is no getting
   *  through. So don't have iron on you. Give the man his tawa back. */
  rakhdo: {
    space: 14,
    advice: 'The spiked magnets before the door hang low enough to grab you off the floor, as long as you’re carrying iron. Stand still at the chulha for a moment and put the tawa down. Then just walk under them.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const t = (w.flags.tawaEnt as Tawa) ?? w.add(new Tawa(px(D - 14), 1e9, FLOOR));
      w.flags.tawaEnt = t;
      t.stand = px(D - 11) + 8;
      for (const c of [-8, -6, -4, -2]) w.add(new Chumbak(px(D + c) + 8, px(9), { spiked: true, reach: 110 }));
      w.flags.stand = t.stand;
      w.flags.twist = 'carrying';
      w.when(
        () => t.down,
        (w2) => {
          w2.flags.twist = 'down';
          tara(w2, 'Tawa rakh diya! Ab chumbak kya karega? | Tawa’s down! What can a magnet do now?', 2.4);
        },
      );
      w.when(
        (w2) => w2.player.x > px(D - 13),
        (w2) => tara(w2, 'Itne chumbak! Lohe ke saath nahin nikloge! | All those magnets! You won’t get through with iron!', 2.6),
      );
    },
  },

  /** Surma tells how it ended, and it has to end the way he tells it: three feats, in his order,
   *  which is not the order they're standing in. */
  kissa: {
    space: 28,
    advice: 'Surma tells how the story ended, and you have to do it his way, in his order: hang from the magnet (jump up under it while it’s red), then three bounces in a row on the bowl, then three skips across the pond (run off the bank, don’t jump). Then the door opens: come back across.',
    paint: (g, D) => {
      g.pit(D - 24, D - 19);
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const lake = w.add(new Lake(px(D - 24), px(D - 18), FLOOR + 3));
      const bowl = w.add(new Katori(px(D - 15) + 8, FLOOR));
      w.add(new Tawa(px(D - 27), 1e9, FLOOR));
      const mag = w.add(new Chumbak(px(D - 10) + 8, px(7), { every: 3, on: 1.5, reach: 100 }));
      const s = w.add(new Surma(px(D - 4) + 8, FLOOR, []));
      const L = lock(w, d, 'Kissa poora suno! | Hear the story out!');
      const feats = ['hang', 'bounce', 'skip'] as const;
      const lines = [
        'Pehle Dad chumbak se latka! | First Dad hung from the magnet!',
        'Phir katori pe teen baar uchhla! | Then he bounced three times on the bowl!',
        'Phir talab pe teen tappe khaye! | Then he skipped three times on the pond!',
      ];
      let step = -1,
        hangs = 0,
        bounced = false,
        skipped = false;
      w.flags.kissa = { step, lake, bowl, mag };
      w.flags.twist = 'arriving';
      w.add(
        new (class extends Entity {
          layer = 2;
          update(w2: World) {
            if (w2.state !== 'play' || L.open) return;
            const p = w2.player;
            if (step < 0) {
              if (p.cx > px(D - 7)) {
                step = 0;
                hangs = mag.hangs;
                s.say(w2, lines[0], 2.6);
              }
            } else {
              let ev: (typeof feats)[number] | null = null;
              if (mag.hangs > hangs) {
                hangs = mag.hangs;
                ev = 'hang';
              }
              const b = bowl.streak >= 3;
              if (b && !bounced) ev = 'bounce';
              bounced = b;
              const k = lake.count >= 3;
              if (k && !skipped) ev = 'skip';
              skipped = k;
              if (ev) {
                if (ev === feats[step]) {
                  step++;
                  w2.sfx('win', p.cx, p.y);
                  if (step >= 3) {
                    L.unlock();
                    s.say(w2, 'Aur tab darwaza khula. Hao! | And then the door opened. Yes!', 2.6);
                  } else s.say(w2, lines[step], 2.6);
                } else if (step > 0) {
                  step = 0;
                  s.say(w2, 'Ama nahin! Aise nahin tha! Shuru se! | No, no! That’s not how it went! From the top!', 2.4);
                }
              }
            }
            (w2.flags.kissa as any).step = step;
            w2.flags.twist = L.open ? 'open' : step < 0 ? 'arriving' : feats[Math.min(2, step)];
          }
          draw(ctx: CanvasRenderingContext2D) {
            // the three feats over the door, ticked off as they're done
            const names = ['⤒', '♪', '≈'];
            for (let k = 0; k < 3; k++) {
              const x = d.x + 8 + (k - 1) * 12;
              ctx.fillStyle = k < step ? '#FFD740' : 'rgba(0,0,0,0.55)';
              ctx.fillRect(x - 5, d.y - 30, 10, 10);
              text(ctx, names[k], x, d.y - 25, 7, k < step ? '#212121' : '#FFFFFF', '');
            }
          }
        })(),
      );
    },
  },
  // ------------------------------------------------------------------ Raipur
  /** The door is in a little mud hut and a man on stilts is far too tall for it. There's only one way
   *  anyone has come off the gedi all day: land badly. Do it on the dry ground. */
  utar: {
    space: 12,
    advice: 'On the stilts you’re too tall for the hut’s doorway, and the only way off them is the wrong way: come down from a jump still moving. Jump from the mud so that you land, running, on the dry ground in front of the hut. Not in the mud.',
    paint: (g, D) => {
      g.fill(D - 2, D - 2, 0, 12, '#');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const g = w.add(new Gedi(px(D - 10) + 8, 1e9, FLOOR));
      w.add(new Mud(px(D - 9), px(D - 5), FLOOR));
      w.flags.utar = { g, dry: px(D - 5), wall: px(D - 2), mudX: px(D - 9) };
      w.flags.twist = 'up';
      w.add(
        new Paint((ctx) => {
          // the hut: mud wall, thatch, a little dark doorway
          ctx.fillStyle = '#C8A27A';
          ctx.fillRect(px(D - 2), FLOOR - 62, px(5), 30);
          ctx.fillStyle = '#B58A5A';
          ctx.beginPath();
          ctx.moveTo(px(D - 2) - 8, FLOOR - 60);
          ctx.lineTo(px(D) + 8, FLOOR - 92);
          ctx.lineTo(px(D + 3) + 8, FLOOR - 60);
          ctx.fill();
          ctx.fillStyle = '#F5F5F5';
          for (let k = 0; k < 6; k++) ctx.fillRect(px(D - 2) + 4 + k * 12, FLOOR - 40, 5, 2);
        }, -2),
      );
      w.add(
        new (class extends Entity {
          update(w2: World) {
            w2.flags.twist = g.on ? 'up' : g.topples > 0 ? 'off' : 'foot';
          }
        })(),
      );
      w.when(
        (w2) => g.on && w2.player.x > px(D - 5),
        (w2) => tara(w2, 'Gedi ma nai ghusas! Utar ja! | You won’t fit on stilts! Get off them!', 2.6),
      );
    },
  },

  /** The door only opens when the tower strikes twelve. And this clock only moves when you do. */
  ghanta: {
    space: 12,
    advice: 'The door opens when the tower clock strikes twelve, and stays open only a little past it. The clock only moves when you do, so stand by the door and wind it round with small steps and jumps on the spot; when it reads twelve, walk in.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const g = (w.flags.ghadi as Ghadi) ?? w.add(new Ghadi(px(D - 12)));
      const RATE = 0.36;
      const hour = () => (((g.t / RATE) % 12) + 12) % 12;
      const L = lock(w, d, 'Barah baje khulhi! | It opens at twelve!');
      w.flags.ghanta = { hour, spot: d.x - 12 };
      w.flags.twist = 'shut';
      let was = false;
      w.add(
        new (class extends Entity {
          layer = -2;
          update(w2: World) {
            const h = hour();
            const open = h < 0.6;
            L.open = open;
            if (open && !was) w2.sfx('win', d.x, d.y - 60);
            was = open;
            w2.flags.twist = open ? 'twelve' : 'shut';
            w2.flags.hour = h;
          }
          draw(ctx: CanvasRenderingContext2D) {
            // the Nagar Ghadi over the door
            const cx = d.x + 8;
            ctx.fillStyle = '#ECEFF1';
            ctx.fillRect(cx - 14, FLOOR - 120, 28, 120);
            ctx.fillStyle = '#D84315';
            ctx.beginPath();
            ctx.moveTo(cx - 17, FLOOR - 120);
            ctx.lineTo(cx, FLOOR - 140);
            ctx.lineTo(cx + 17, FLOOR - 120);
            ctx.fill();
            // one hand, showing the hour
            const h = hour();
            ctx.fillStyle = h < 0.6 ? '#FFF59D' : '#FFFDE7';
            ctx.beginPath();
            ctx.arc(cx, FLOOR - 98, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#3E2723';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = '#D84315';
            ctx.fillRect(cx - 1, FLOOR - 109, 2, 3);
            ctx.fillStyle = '#3E2723';
            for (let k = 1; k < 12; k++) {
              const a = (k / 12) * Math.PI * 2;
              ctx.fillRect(cx + Math.sin(a) * 9.5 - 0.6, FLOOR - 98 - Math.cos(a) * 9.5 - 0.6, 1.2, 1.2);
            }
            const a = (h / 12) * Math.PI * 2;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, FLOOR - 98);
            ctx.lineTo(cx + Math.sin(a) * 8.5, FLOOR - 98 - Math.cos(a) * 8.5);
            ctx.stroke();
          }
        })(),
      );
      void clockFace;
    },
  },

  /** The door is up on the godown's loading ledge, and the one sack hangs nowhere near it. But this
   *  one is on a trolley: push the crate under it and the sack comes along. */
  khisko: {
    space: 16,
    after: 6,
    advice: 'The sack hangs a long way short of the ledge, but it’s on a trolley: push the crate along the floor and the sack rolls along above it. Push it right up to the wall, climb on the crate, pull the cord, and walk up the rice.',
    paint: (g, D) => {
      g.fill(D - 2, D + 3, 9, 14, '#');
      g.put(D + 1, 8, 'E');
    },
    build(w, d) {
      // the door is one column in from where the ending was laid out (see paint)
      const D = Math.round(d.x / 16) - 1;
      const h = w.add(new Heap(px(D - 16), 28, FLOOR));
      const s = w.add(new Sack(px(D - 12) + 8, px(3), 9800, h, FLOOR - px(3) - 46, 2800));
      const crate = new Solid(px(D - 12), FLOOR - 16, 16, 16);
      w.flags.khisko = { s, crate, wall: px(D - 2), heap: h };
      w.flags.twist = 'far';
      w.add(
        new (class extends Entity {
          solid = crate;
          layer = 1;
          private refill = 0;
          update(w2: World) {
            const p = w2.player;
            if (w2.state !== 'play') return;
            // pushed along (either way) by someone leaning on it
            const feet = p.y + p.h;
            if (p.onGround && Math.abs(feet - (crate.y + 16)) < 3 && !s.open) {
              if (w2.input.right && Math.abs(p.x + p.w - crate.x) <= 1 && !w2.solidAt(crate.x + 16, crate.y, 1, 14)) crate.moveBy(w2, 0.9, 0);
              else if (w2.input.left && Math.abs(p.x - (crate.x + 16)) <= 1 && crate.x > px(D - 14)) crate.moveBy(w2, -0.9, 0);
            }
            s.x = crate.x + 8;
            if (s.open && s.left <= 0 && ++this.refill > 120) {
              this.refill = 0;
              s.left = s.vol;
            }
            w2.flags.twist = s.open ? 'pouring' : crate.x + 16 >= px(D - 2) - 1 ? 'placed' : 'far';
          }
          draw(ctx: CanvasRenderingContext2D) {
            // the rail overhead, the trolley, its chain down to the crate
            ctx.fillStyle = '#455A64';
            ctx.fillRect(px(D - 14), px(3) - 20, px(12), 3);
            ctx.fillRect(s.x - 6, px(3) - 18, 12, 4);
            ctx.fillStyle = '#8D6E63';
            ctx.fillRect(crate.x, crate.y, 16, 16);
            ctx.fillStyle = '#6D4C41';
            ctx.fillRect(crate.x, crate.y, 16, 2);
            ctx.fillRect(crate.x, crate.y + 14, 16, 2);
            ctx.fillRect(crate.x + 7, crate.y, 2, 16);
            ctx.fillStyle = '#263238';
            ctx.fillRect(crate.x + 2, crate.y + 15, 3, 2);
            ctx.fillRect(crate.x + 11, crate.y + 15, 3, 2);
          }
        })(),
      );
      w.when(
        (w2) => w2.player.x > px(D - 6) && !s.open,
        (w2) => tara(w2, 'Bora doori ma he! Peti la dhakel! | The sack’s too far off! Push the crate!', 2.6),
      );
    },
  },

  /** All stage long you've been whipping tops up to speed. The door is painted on the crown of the
   *  biggest one, and it's only a door when it isn't a blur: get on, and then leave it alone. */
  lattu: {
    space: 12,
    advice: 'The door is on the crown of the big top, and it’s only a door once the top has slowed right down. Jump on to it once, then stand still on it: every landing whips it back up. Wait for it to slow (it wanders, go with it) and you’re through, before it falls over.',
    build(w, d) {
      const top = w.add(new Top(d.x + 8, FLOOR, { w: 44, h: 30, decay: 0.2, relaunch: 2.5 }));
      const L = lock(w, d, '');
      w.flags.lattu = top;
      w.flags.twist = 'blur';
      w.add(
        new (class extends Entity {
          update(w2: World) {
            d.x = top.x - 8;
            d.y = top.solid.y - 32;
            d.hidden = top.down > 0;
            L.open = top.down === 0 && top.s < 0.42;
            w2.flags.twist = top.down > 0 ? 'fallen' : L.open ? 'slow' : 'blur';
            w2.flags.spin = top.s;
          }
        })(),
      );
      w.when(
        (w2) => w2.player.x > d.x - px(8),
        (w2) => tara(w2, 'Bhaunra dheere hohi tab darwaza! | When the top slows, there’s your door!', 2.6),
      );
    },
  },

  /** A stretch of thorn nobody can walk, and a woman at the door reeling silk. She reels in cocoons.
   *  Be one, and stay one, the whole way across. */
  reel: {
    space: 16,
    advice: 'Nobody walks over that thorn. But the silk reeler by the door winds in any cocoon on her mat: stand still on the mat till you’re wrapped, and then don’t touch a thing while she draws you across. One button and you’re out of the cocoon, in the thorns.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const k = (w.flags.kosaEnt as Kosa) ?? w.add(new Kosa());
      w.flags.kosaEnt = k;
      const mat = px(D - 13) + 8;
      w.add(new Kaante(px(D - 11), px(D - 2), FLOOR));
      w.flags.reel = { mat, end: px(D - 2) };
      w.flags.twist = 'walking';
      let pulling = false;
      w.add(
        new (class extends Entity {
          layer = 2;
          update(w2: World) {
            const p = w2.player;
            if (w2.state !== 'play') return;
            if (k.wrapped && !pulling && Math.abs(p.cx - mat) < 12) pulling = true;
            if (!k.wrapped) pulling = false;
            if (pulling && p.x < px(D - 2) + 2) p.x += 0.5;
            w2.flags.twist = pulling ? 'reeled' : p.x > px(D - 2) ? 'across' : 'walking';
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            // the mat
            ctx.fillStyle = '#C62828';
            ctx.fillRect(mat - 12, FLOOR - 2, 24, 2);
            ctx.fillStyle = '#FDD835';
            ctx.fillRect(mat - 12, FLOOR - 2, 3, 2);
            ctx.fillRect(mat + 9, FLOOR - 2, 3, 2);
            // the reeler and her wheel, just before the door
            const rx = d.x - 12;
            ctx.fillStyle = '#AD1457';
            ctx.fillRect(rx - 4, FLOOR - 16, 8, 16);
            ctx.fillStyle = '#C68642';
            ctx.fillRect(rx - 3, FLOOR - 22, 6, 6);
            ctx.fillStyle = '#212121';
            ctx.fillRect(rx - 3.5, FLOOR - 24, 7, 3);
            ctx.strokeStyle = '#6D4C41';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(rx - 12, FLOOR - 9, 7, 0, Math.PI * 2);
            ctx.stroke();
            const a = pulling ? w2.tick * 0.2 : 0;
            ctx.beginPath();
            ctx.moveTo(rx - 12 - Math.cos(a) * 7, FLOOR - 9 - Math.sin(a) * 7);
            ctx.lineTo(rx - 12 + Math.cos(a) * 7, FLOOR - 9 + Math.sin(a) * 7);
            ctx.stroke();
            if (pulling) {
              ctx.strokeStyle = '#E8C878';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(rx - 12, FLOOR - 9);
              ctx.lineTo(w2.player.cx, w2.player.cy);
              ctx.stroke();
            }
          }
        })(),
      );
      w.when(
        (w2) => w2.player.x > px(D - 16),
        (w2) => tara(w2, 'Chatai ma kosa ban, o khinch lehi! | Be a cocoon on the mat, she’ll reel you in!', 2.8),
      );
    },
  },

  /** These ants don't come for a man. They come for jaggery. It's up on the shelf you walked under. */
  gud: {
    space: 16,
    advice: 'These ants take no notice of you: they want jaggery. There’s a lump of gud up on the shelf back there. Jump up for it, carry it to the edge, and then it’s the usual: wait for the whole bridge, and run.',
    paint: (g, D) => {
      g.pit(D - 9, D - 3);
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const ants = w.add(new Chapda(px(D - 9), px(D - 2), FLOOR));
      let has = false;
      ants.lure = () => has;
      const shelf = new Solid(px(D - 14), FLOOR - 48, 32, 4);
      shelf.oneWay = true;
      const gx = px(D - 13),
        gy = FLOOR - 56;
      w.flags.gud = { ants, gx, edge: px(D - 9) };
      w.flags.twist = 'nogud';
      w.add(
        new (class extends Entity {
          solid = shelf;
          layer = 3;
          update(w2: World) {
            const p = w2.player;
            if (!has && Math.abs(p.cx - gx) < 10 && Math.abs(p.cy - gy) < 14) {
              has = true;
              w2.sfx('win', gx, gy);
            }
            w2.flags.twist = has ? 'gud' : 'nogud';
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            ctx.fillStyle = '#6D4C41';
            ctx.fillRect(shelf.x, shelf.y, 32, 4);
            ctx.fillRect(shelf.x + 2, shelf.y + 4, 2, 6);
            ctx.fillRect(shelf.x + 28, shelf.y + 4, 2, 6);
            const lump = (x: number, y: number) => {
              ctx.fillStyle = '#B5651D';
              ctx.beginPath();
              ctx.arc(x, y, 5, Math.PI, 0);
              ctx.fill();
              ctx.fillStyle = '#D98A3A';
              ctx.fillRect(x - 3, y - 4, 3, 1.5);
            };
            if (!has) lump(gx, shelf.y);
            else lump(w2.player.cx, w2.player.y - 2);
          }
        })(),
      );
      w.when(
        (w2) => !has && w2.player.x > px(D - 11),
        (w2) => tara(w2, 'Chanti man la gud chahi! Upar he! | The ants want jaggery! It’s up there!', 2.8),
      );
    },
  },

  /** The door is on the Dussehra chariot, and the whole town is on the ropes: every step you run
   *  towards it, they haul it a step away. They go by the sound of feet. Don't give them any. */
  rath: {
    space: 30,
    after: 6,
    advice: 'The pullers haul the chariot away as fast as you run at it: they go by the sound of your feet on the ground. In the air you make none. Come at it in jumps, one after another, and it stands still for you (it even rolls back a little).',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const home = px(D - 16);
      const rath = new Solid(home, FLOOR - 44, 52, 44);
      rath.collidable = false;
      w.flags.rath = rath;
      w.flags.twist = 'running';
      let rolls = 0;
      w.add(
        new (class extends Entity {
          layer = 1;
          update(w2: World) {
            const p = w2.player;
            if (w2.state !== 'play') return;
            const behind = p.cx < rath.x + 26;
            const feet = p.onGround && Math.abs(p.vx) > 20 && behind && rath.x - p.cx < 260 && p.x > px(D - 30);
            if (feet) {
              rath.x += 170 / 120;
              rolls++;
            } else if (rath.x > home && behind) rath.x = Math.max(home, rath.x - 40 / 120);
            // out through the palace gate and round again
            if (rath.x > px(D + 3)) {
              rath.x = home;
              w2.flags.laps = (w2.flags.laps ?? 0) + 1;
            }
            d.x = rath.x + 30;
            d.y = FLOOR - 32;
            w2.flags.twist = feet ? 'running' : 'quiet';
            void rolls;
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            const x = rath.x,
              y = rath.y;
            // ropes to the pullers ahead
            ctx.strokeStyle = '#A1887F';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(x + 52, FLOOR - 14);
            ctx.lineTo(x + 96, FLOOR - 10);
            ctx.stroke();
            for (let k = 0; k < 4; k++) {
              const px2 = x + 66 + k * 9;
              ctx.fillStyle = ['#FDD835', '#F5F5F5', '#EF6C00', '#F5F5F5'][k];
              ctx.fillRect(px2 - 2, FLOOR - 14, 4, 9);
              ctx.fillStyle = '#C68642';
              ctx.fillRect(px2 - 1.5, FLOOR - 18, 3, 4);
              ctx.fillStyle = '#3E2723';
              ctx.fillRect(px2 - 2, FLOOR - 5, 1.5, 5);
              ctx.fillRect(px2 + 0.5, FLOOR - 5, 1.5, 5);
            }
            // the chariot: two tiers of rough timber, cloth, flowers, four great wheels
            ctx.fillStyle = '#8D5A3B';
            ctx.fillRect(x, y + 12, 52, 22);
            ctx.fillStyle = '#A0693F';
            ctx.fillRect(x + 6, y - 6, 40, 18);
            ctx.fillStyle = '#D84315';
            ctx.fillRect(x + 4, y - 10, 44, 5);
            ctx.fillStyle = '#FDD835';
            for (let k = 0; k < 9; k++) ctx.fillRect(x + 6 + k * 4.6, y - 5, 2.5, 3);
            ctx.fillStyle = '#F5F5F5';
            ctx.beginPath();
            ctx.moveTo(x + 26, y - 26);
            ctx.lineTo(x + 20, y - 10);
            ctx.lineTo(x + 32, y - 10);
            ctx.fill();
            const a = (x / 9) % (Math.PI * 2);
            for (const wx of [x + 9, x + 43]) {
              ctx.fillStyle = '#5D3A22';
              ctx.beginPath();
              ctx.arc(wx, FLOOR - 9, 9, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#C8A27A';
              ctx.lineWidth = 1.2;
              for (let k = 0; k < 3; k++) {
                ctx.beginPath();
                ctx.moveTo(wx - Math.cos(a + k) * 8, FLOOR - 9 - Math.sin(a + k) * 8);
                ctx.lineTo(wx + Math.cos(a + k) * 8, FLOOR - 9 + Math.sin(a + k) * 8);
                ctx.stroke();
              }
            }
            void w2;
          }
        })(),
      );
      w.when(
        (w2) => w2.player.x > px(D - 28),
        (w2) => tara(w2, 'Rath aagu bhaagat he! Pair ke awaaz jhan kar! | The chariot runs ahead! Don’t let them hear your feet!', 3),
      );
    },
  },
};
