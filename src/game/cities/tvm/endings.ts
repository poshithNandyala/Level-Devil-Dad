// Thiruvananthapuram's door endings.
import { lock, npc } from '../../levels/endkit';
import type { Ending } from '../../levels/endkit';

export type TvmEndingKind = 'knock';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<TvmEndingKind, true> {}
}

export const endings: Record<TvmEndingKind, Ending> = {
  // ================================================================ Thiruvananthapuram
  /** The door is locked. Knock: jump into it, three times, and Ammachi opens up. */
  knock: {
    advice: 'The last door is locked: knock. Jump into it three times.',
    build(w, d) {
      const L = lock(w, d, 'Aara? Aarum illa! | Who is it? Nobody home!');
      let n = 0,
        last = -999;
      w.flags.twist = 'shut';
      w.flags.knocks = 0;
      w.onTick((w2) => {
        if (L.open || n >= 3) return;
        const p = w2.player;
        if (w2.tick - p.jumpTick !== 1 || w2.tick - last < 16) return;
        if (!(p.x + p.w > d.x + 1 && p.x < d.x + 15 && p.y + p.h > d.y + 10)) return;
        last = w2.tick;
        n++;
        w2.flags.knocks = n;
        w2.sfx('thud', d.x + 8, d.y + 16);
        w2.emit('shake', d.x + 8, d.y, { amount: 1 });
        npc(w2, ['Thak! | Knock!', 'Thak thak! | Knock knock!', 'Aara? Oh, Dad! Vaa, vaa! | Who is it? Oh, Dad! Come in!'][n - 1], d.x + 8, d.y - 6, 1.3);
        if (n >= 3) w2.after(0.45, () => L.unlock());
      });
    },
  },
};
