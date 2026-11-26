// Raipur's door endings.
import { Entity, type World } from '../../world';
import { Solid } from '../../body';
import { px } from '../../levels/kit';
import { FLOOR, lock, Paint, tara } from '../../levels/endkit';
import { Chapda, clockFace, Gedi, Ghadi, Heap, Kaante, Kosa, Mud, Sack, Top } from './entities';
import type { Ending } from '../../levels/endkit';

export type RprEndingKind = 'utar' | 'ghanta' | 'khisko' | 'lattu' | 'reel' | 'gud' | 'rath';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<RprEndingKind, true> {}
}

export const endings: Record<RprEndingKind, Ending> = {
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
