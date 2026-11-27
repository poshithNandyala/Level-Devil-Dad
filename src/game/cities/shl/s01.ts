// SHL-01 Kumno, Shillong!: the welcome tour with one bite. At the view point a cloud hangs over the path and
// Tara stands under it with her knup, calling you over. A first drop falls from a pine well short of the cloud:
// it is a lie, nothing follows it there. The real rain falls only under the cloud shape, on a beat, and the cloud
// drifts towards anyone who stands near it waiting: pass under it right after it has emptied.
import type { LevelDef, World } from '../../world';
import { tour } from '../../levels/tour';
import { Paint, tara } from '../../levels/endkit';
import { onPass } from '../../levels/trolls';
import { px } from '../../levels/kit';
import { Rig, box, perTick } from './entities';
import { cloudArt, rainArt, knupArt, FL } from './common';
import { lines as L, npc } from './lines';

/** the view point: the fake drop falls at `drop` when Dad passes `trigger`; the cloud's left edge starts at `cloud` */
export const VIEW = { trigger: 58, drop: 62, cloud: 66, cloudW: 10, drift: 20, driftTo: 62, period: 3.0, dumpAt: 0.9, dumpFor: 0.7, near: 8 };

function viewPoint(w: World) {
  const st: { t0: number; x: number; still: number; moved: number; drop: number } = { t0: -1, x: px(VIEW.cloud), still: 0, moved: 0, drop: -1 };
  w.flags.shl1 = st;
  const t = (w2: World) => (st.t0 < 0 ? -9 : (w2.tick - st.t0) / 120);
  const inDump = (w2: World) => {
    const s = t(w2);
    if (s < 0) return false;
    const k = ((s - VIEW.dumpAt) % VIEW.period + VIEW.period) % VIEW.period;
    return s >= VIEW.dumpAt && k < VIEW.dumpFor;
  };
  const dark = (w2: World) => {
    const s = t(w2);
    if (s < 0) return 0;
    const k = ((s - VIEW.dumpAt) % VIEW.period + VIEW.period) % VIEW.period;
    return k < VIEW.dumpFor ? 1 : k > VIEW.period - 0.5 ? (k - (VIEW.period - 0.5)) / 0.5 : s < VIEW.dumpAt && s > VIEW.dumpAt - 0.5 ? (s - (VIEW.dumpAt - 0.5)) / 0.5 : 0;
  };
  // the cloud: a hazard the width of its shadow while it empties; drifts towards a standing Dad
  const cloud = w.add(
    new Rig(px(VIEW.cloud), 0, px(VIEW.cloudW), FL, {
      layer: 4,
      cause: 'shl-slap',
      inset: 3,
      live: (_r, w2) => inDump(w2),
      tick: (r, w2) => {
        if (st.t0 < 0) return;
        const p = w2.player;
        const standing = p.onGround && Math.abs(p.vx) < 5;
        st.still = standing ? st.still + 1 : 0;
        const nearBy = p.cx < r.x && p.cx > r.x - px(VIEW.near);
        if (nearBy && st.still > 60 && r.x > px(VIEW.driftTo) && t(w2) > VIEW.dumpAt + VIEW.dumpFor) {
          r.x -= perTick(VIEW.drift);
          st.moved += perTick(VIEW.drift);
        }
        st.x = r.x;
        if (st.moved > 8 && r.hazard) r.hazard.cause = 'shl-lyoh';
      },
      paint: (ctx, r, w2) => {
        const d = dark(w2);
        cloudArt(ctx, r.x - 10, r.x + r.w + 10, 28, 34, 0.35 + 0.55 * d);
        if (inDump(w2)) rainArt(ctx, r.x + 3, r.x + r.w - 3, 56, w2.tick / 120, 1);
        else if (d > 0.4) {
          // a few first drops as it darkens
          ctx.fillStyle = 'rgba(200,220,235,0.6)';
          for (let i = 0; i < 4; i++) box(ctx, r.x + 20 + i * 36, 60 + ((w2.tick * 3 + i * 40) % 120), 1, 6, 'rgba(200,220,235,0.6)');
        }
      },
    }),
  );
  cloud.on = false;
  // the fake first drop: one drop from a pine branch at `drop`, a splash, and nothing more
  w.add(
    new Paint((ctx, w2) => {
      const x = px(VIEW.drop) + 8;
      // the pine over the path
      box(ctx, x - 2, FL - 70, 4, 70, '#4A3A2A');
      ctx.fillStyle = '#2F5D45';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x, FL - 96 + i * 12);
        ctx.lineTo(x + 18 + i * 5, FL - 72 + i * 12);
        ctx.lineTo(x - 18 - i * 5, FL - 72 + i * 12);
        ctx.closePath();
        ctx.fill();
      }
      if (st.drop >= 0) {
        const s = (w2.tick - st.drop) / 120;
        if (s < 0.55) box(ctx, x + 6, FL - 70 + s * 300, 2, 6, '#BFE0F0');
        else if (s < 1.0) {
          ctx.fillStyle = `rgba(190,224,240,${1 - (s - 0.55) * 2})`;
          ctx.beginPath();
          ctx.ellipse(x + 7, FL - 1, 6 + (s - 0.55) * 20, 1.5, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }, -5),
  );
  // Tara at the view point, under the cloud, with her knup
  w.add(
    new Paint((ctx, w2) => {
      const x = px(VIEW.cloud + 6);
      box(ctx, x - 3, FL - 16, 6, 16, '#D7262E');
      ctx.fillStyle = '#C68B59';
      ctx.beginPath();
      ctx.arc(x, FL - 20, 3.5, 0, Math.PI * 2);
      ctx.fill();
      knupArt(ctx, x, FL - 44, 22, 26);
      void w2;
    }, -3),
  );
  onPass(w, px(VIEW.trigger), (w2) => {
    st.t0 = w2.tick;
    st.drop = w2.tick;
    cloud.on = true;
    w2.sfx('splash', px(VIEW.drop), FL - 10);
    tara(w2, L.taunt[2], 2.6);
  });
}

export const tourLevel = (): LevelDef =>
  tour({
    id: 'SHL-01',
    city: 'SHL',
    name: 'Kumno, Shillong!',
    nameEn: 'Hello, Shillong!',
    tagline: 'Pine hills, shared taxis, and a cloud at the view point.',
    lines: [L.hello, npc.how, npc.sit, npc.food, L.idle[1], L.near[1]],
    shouts: [
      [18, npc.fare],
      [46, npc.road],
    ],
    ride: 'cart',
    item: 'shl-pumaloi',
    signs: [
      [8, 'POLICE BAZAAR', 'shared taxis'],
      [34, 'WARD’S LAKE', 'the garden'],
      [100, 'SHILLONG PEAK', 'view point'],
    ],
    props: [
      ['lamp', 4, {}],
      ['stall', 28, { label: 'JADOH' }],
      ['lamp', 50, {}],
      ['crowd', 80, { n: 2 }],
      ['lamp', 106, {}],
    ],
    things: [],
    hint: 'A walk round Shillong: hop the drain, climb the steps, hop the taxi-stand posts and the parked taxi. At the view point a cloud hangs over the path. The first drop that falls, well before the cloud, is nothing: rain falls only under the cloud, on a beat. Do not stand near it waiting, it drifts over to you: run under it right after it has emptied.',
    cps: [20, 36, 50, 57, 101],
    extra: (w: World) => {
      viewPoint(w);
    },
  });

export const meta01 = { family: 'fake-first-raindrop', betrayals: ['fake-first-drop'], ending: 'shl-tour-view-point' };
