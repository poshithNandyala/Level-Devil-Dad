// Kavaratti: plain ground in front of an act, so the checkpoint at its first column is a calm place to come back to.
import type { Act, ActCtx } from '../../levels/acts';

/** tiles of plain ground put in front of each act, so its checkpoint (at the act's first column) is never within a
 *  tap-jump or a short run of water: every act's first water edge ends up at least 4.5 tiles past it */
export const KVT_LEAD: Record<string, number> = {
  'kvt09-pavizham': 1,
  'kvt09-kodumudi': 2,
  'kvt09-varambu': 3,
  'kvt09-murivu': 2,
  'kvt10-midden': 2,
  'kvt10-palaka': 2,
  'kvt10-kallu': 2,
  'kvt10-thengu': 7,
  'kvt10-kamaanam': 2,
  'kvt10-nizhal': 2,
  'kvt10-veliyettam': 2,
  'kvt10-paaru': 3,
  'kvt10-kannadi': 1,
  'kvt10-thoni': 1,
  'kvt10-irakkam': 5,
};
/** the act with `n` tiles of plain ground before it (its own columns, flags and checkpoints move along) */
export function lead(a: Act): Act {
  const n = KVT_LEAD[a.id] ?? 0;
  if (!n) return a;
  const sh = (c: ActCtx): ActCtx => ({ ...c, x: c.x + n, X: (t: number) => c.X(t + n) });
  return {
    ...a,
    w: a.w + n,
    paint: a.paint && ((g, c) => a.paint!(g, sh(c))),
    build: a.build && ((w, c) => a.build!(w, sh(c))),
    ...(a.cps ? { cps: a.cps.map((t) => t + n) } : {}),
  };
}


/** the act with its checkpoint moved `k` tiles back, on to the flat ground before it (no checkpoint at its first
 *  column): for acts whose water starts a tile or two in */
export function back(a: Act, k: number): Act {
  return { ...a, cp0: false, cps: [-k, ...(a.cps ?? [])] };
}
