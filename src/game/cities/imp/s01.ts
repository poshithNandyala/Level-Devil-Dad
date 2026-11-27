// IMP-01 Khurumjari, Imphal: the welcome tour with two bites at Kangla. The near (east) gate of the fort only
// opens OUTWARD: walk up to its arch and the leaf swings out into you and then stays barred; the fort is entered
// from the west, so the way is up the steps and along the rampart. The rampart ends over the moat, and the "far
// bank" right below it is a mat of water hyacinth drawn like a bank: it is not ground. The real bank is further.
import type { LevelDef, World } from '../../world';
import { tour } from '../../levels/tour';
import type { Grid } from '../../levels/grid';
import { Paint, tara } from '../../levels/endkit';
import { onPass } from '../../levels/trolls';
import { px } from '../../levels/kit';
import { Rig, box, folk, perTick } from './entities';
import { lines as L, NPC } from './lines';
import { lake } from './common';

const FL = 240;
/** the gate: the arch is cols 60-61 at ground level; the leaf is hinged inside (col 62) and swings out to col 59 */
export const GATE = { trigger: 58.6, arch: [60, 61] as [number, number], hinge: 62, rampart: [55, 64] as [number, number], moat: [65, 68] as [number, number], mat: [65, 66] as [number, number], bank: 69 };

function gate(w: World) {
  const st: { phase: 'shut' | 'swing' | 'barred'; t0: number } = { phase: 'shut', t0: 0 };
  w.flags.imp1 = st;
  // the leaf: a wooden door the height of the arch; while shut it hangs inside the arch (not solid: the arch looks open)
  const leaf = w.add(
    new Rig(px(GATE.hinge) - 4, FL - 16, 6, 16, {
      layer: 3,
      solid: true,
      cause: 'imp-thong',
      inset: 1,
      live: () => st.phase === 'swing',
      tick: (r, w2) => {
        if (st.phase !== 'swing') return;
        const t = (w2.tick - st.t0) / 120;
        // swings out over 0.3 s: its free end sweeps from col 62 to col 59 (deadly), then it is barred across the arch
        const k = Math.min(1, t / 0.3);
        r.x = px(GATE.hinge) - 4 - k * px(3);
        r.w = 6 + k * px(3) - 2;
        if (t >= 0.3) {
          st.phase = 'barred';
          r.x = px(GATE.arch[0]);
          r.w = px(2);
          r.solid!.x = r.x;
          r.solid!.w = r.w;
          r.setSolid(true);
          w2.sfx('thud', r.x, FL - 10);
        }
      },
      paint: (ctx, r) => {
        if (st.phase === 'shut') {
          // the leaf seen edge-on inside the arch, and the dark inside of the fort behind it
          box(ctx, px(GATE.arch[0]), FL - 16, px(2), 16, '#2A2420');
          box(ctx, px(GATE.hinge) - 4, FL - 16, 4, 16, '#6E4B2A');
          return;
        }
        box(ctx, r.x, r.y, r.w, r.h, '#8A5A2B');
        box(ctx, r.x, r.y, r.w, 3, '#5E3A1E');
        for (let i = 0; i < r.w; i += 8) box(ctx, r.x + i + 2, r.y + 7, 3, 3, '#C9A56B');
      },
    }),
  );
  // while shut and swinging the leaf is not solid (the arch looks open); barred, it is a wall across the arch
  leaf.setSolid(false);
  onPass(w, px(GATE.trigger), (w2) => {
    if (w2.player.y < FL - 20) return; // on the rampart: nothing
    st.phase = 'swing';
    st.t0 = w2.tick;
    w2.sfx('creak', px(GATE.arch[0]), FL - 20);
  });
  // the wall and arch art, the rampart's parapet, the guard inside shaking his head
  w.add(
    new Paint((ctx, w2) => {
      box(ctx, px(GATE.arch[0]) - 2, FL - 20, px(2) + 4, 4, '#5E5236'); // lintel
      box(ctx, px(GATE.rampart[0]), px(12) - 6, px(GATE.rampart[1] - GATE.rampart[0] + 1), 6, '#5E5236'); // parapet (behind the walk)
      for (let x = px(GATE.rampart[0]); x < px(GATE.rampart[1] + 1); x += 12) box(ctx, x, px(12) - 10, 6, 4, '#5E5236');
      if (st.phase === 'barred') folk(ctx, px(GATE.hinge) + 12, FL - 26 + ((w2.tick >> 4) % 2), 26, '#F2E6C4');
      void w2;
    }, -2),
  );
  // the moat: water, and the hyacinth mat that only looks like the far bank
  lake(w, GATE.moat[0], GATE.moat[1] + 1, 'imp-khong');
  w.add(
    new Paint((ctx, w2) => {
      const x0 = px(GATE.mat[0]) + 2,
        wd = px(GATE.mat[1] - GATE.mat[0] + 1) - 4;
      const bob = Math.sin(w2.tick / 40) * 1.2;
      box(ctx, x0, FL + bob, wd, 6, '#4F7A2A');
      box(ctx, x0, FL - 2 + bob, wd, 3, '#8FBF4A');
      for (let i = 4; i < wd; i += 9) box(ctx, x0 + i, FL - 6 + bob + (i % 3), 3, 4, '#B48AD6');
    }, 3),
  );
}

export const tourLevel = (): LevelDef =>
  tour({
    id: 'IMP-01',
    city: 'IMP',
    name: 'Khurumjari, Imphal!',
    nameEn: 'Greetings, Imphal!',
    tagline: 'Kangla, the old fort. Its gates have a rule.',
    lines: [
      L.hello,
      'Kangla: the kings’ fort, with a moat. | Kangla: the kings’ fort, with a moat.',
      'Sagol kangjei: polo was born here. | Sagol kangjei: polo was born here.',
      'Ima Keithel: five thousand mothers sell. | Ima Keithel: five thousand mothers sell.',
      'Loktak floats. The deer dances on it. | Loktak floats. The deer dances on it.',
      NPC.seeYou,
    ],
    shouts: [
      [20, NPC.rice],
      [90, NPC.market],
    ],
    ride: 'scooter',
    item: 'imp-chakhao',
    signs: [
      [8, 'KANGLA', 'the old fort'],
      [30, 'POLO GROUND', 'the oldest'],
      [100, 'IMA KEITHEL', 'mothers’ market'],
    ],
    props: [
      ['lamp', 4, {}],
      ['stall', 18, { label: 'CHAK-HAO' }],
      ['lamp', 36, {}],
      ['lamp', 76, {}],
      ['stall', 92, { label: 'KEITHEL' }],
      ['lamp', 108, {}],
    ],
    things: [],
    hint: 'A walk round Imphal: hop the ditch, climb the steps, hop the posts. At Kangla the east gate only opens outward: its leaf swings into whoever walks up to the arch, and then it is barred. Take the steps up to the rampart and walk over the wall. At the rampart’s end do not step down on to the green bank below: that is water hyacinth floating on the moat. Jump long from the edge to the real bank.',
    cps: [15.5, 36.5, 50.5, 74, 86.5, 101],
    paint: (g: Grid) => {
      // the rampart walk (one-way, three tiles up: the road passes under it; a held jump gets you up), the wall over the arch
      g.fill(GATE.rampart[0], GATE.rampart[1], 12, 12, '=');
      g.fill(GATE.arch[0], GATE.arch[1], 13, 13, '#');
      // the moat
      g.fill(GATE.moat[0], GATE.moat[1], 15, 17, '.');
    },
    extra: (w: World) => {
      gate(w);
      onPass(w, px(47), (w2) => tara(w2, L.taunt[0], 2.4));
    },
  });

export const meta01 = { family: 'inward-only-gate', betrayals: ['one-way-gate'], ending: 'imp-tour-west-gate' };
