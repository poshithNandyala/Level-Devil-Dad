// Endings: the last surprise at each stage's door. Every stage has its own and no two share one:
// these 39, plus the nine old twists in twists.ts (each of those is used by exactly one stage too).
// An ending can carve its own ground (paint), ask for more road before the door (space), and keeps
// w.flags.twist up to date with what it's doing, which the test policies read.
import { Entity, type Hazard, type World } from '../world';
import { FLOOR, tt, tara, Paint, doorPic } from './endkit';
import { Gust, Thing } from '../entities/traps';
import { px, shot } from './kit';
import type { Grid } from './grid';
import { FONT } from '../../render/art/common';
import { drawDoor } from '../../render/art/tiles';
import { THEMES } from '../../render/theme';

export type { Ending } from './endkit';
import type { Ending } from './endkit';
import { NEW_ENDINGS, type NewEndingKind } from './endings2';
import { WEST_ENDINGS, type WestEndingKind } from './endings3';

export type EndingKind =
  | 'lamp'
  | NewEndingKind
  | WestEndingKind
  // each city module's own endings (declared in its endings.ts, see docs/CITY-MODULE.md)
  | keyof ModuleEndingKinds;

/** filled in by city modules: `declare module` this to add an ending kind */
export interface ModuleEndingKinds {}

const OLD_ENDINGS: Record<Exclude<EndingKind, NewEndingKind | WestEndingKind | keyof ModuleEndingKinds>, Ending> = {












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


























};

/** every door ending; city modules' endings are added by src/game/cities/install.ts */
export const ENDINGS = { ...OLD_ENDINGS, ...NEW_ENDINGS, ...WEST_ENDINGS } as Record<EndingKind, Ending>;

export const isEnding = (k: string | undefined): k is EndingKind => !!k && k in ENDINGS;
