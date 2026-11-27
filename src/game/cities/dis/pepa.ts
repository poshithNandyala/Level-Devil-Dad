// DIS round 5, allocation v3 F457 join-the-approaching-not-the-leaving, DIS-07's sound beat (bible §3: the pepa, the
// buffalo-horn pipe of Bihu, and the husori groups). A group leaving the yard will not stop for you, and its gate shuts
// behind it. Another group is coming down the lane behind you: you hear its pepa getting louder. Wait for it, back from
// the gate, and step into its ring as it arrives; the gate opens for it. Wait right under the gate and the stakes come
// down as the group arrives (the hosts drop the gate's guard stakes for the singers).
import { Entity, type World } from '../../world';
import { tara } from '../../levels/endkit';
import type { Act } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { GROUND, px } from './entities';
import { Husori, husori } from './husori';

/** the coming group's pepa: louder (more notes, faster) the nearer it is; and the stakes that drop at its arrival */
class PepaCue extends Entity {
  constructor(
    readonly coming: Husori,
    readonly gx: number,
  ) {
    super();
    this.layer = 6;
  }
  update(w: World) {
    const c = this.coming;
    if (!c.walking || c.gone) return;
    const d = Math.abs(w.player.cx - c.x);
    const every = Math.max(12, Math.min(90, Math.round(d / 4)));
    if (w.tick % every === 0) w.sfx('whistle', c.x, GROUND - 40);
    // the guard stakes in front of the gate come down as the singers arrive
    if (c.at === 0 && c.t < 24 && w.state === 'play' && w.player.cx > this.gx - 18 && w.player.cx < this.gx - 5) w.die('dis-stakes');
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const c = this.coming;
    if (!c.walking || c.gone) return;
    const d = Math.abs(w.player.cx - c.x);
    const n = d < 80 ? 5 : d < 160 ? 3 : d < 260 ? 2 : 1;
    ctx.fillStyle = '#2E2A26';
    for (let k = 0; k < n; k++) {
      const x = c.x - 6 + k * 7;
      const y = GROUND - 44 - ((w.tick + k * 13) % 30) * 0.5;
      ctx.fillRect(x, y, 2, 6);
      ctx.fillRect(x, y, 4, 2);
    }
    if (c.at === 0 && c.t < 24) {
      ctx.fillStyle = '#7A5A22';
      for (let k = 0; k < 3; k++) ctx.fillRect(this.gx - 18 + k * 4, GROUND - 30 + c.t, 3, 30 - c.t);
    }
  }
}

/** DIS-07 act: the pepa coming down the lane (F457, the marathon's sound beat). */
export const husPepa: Act = {
  id: 'dis07-pepa',
  w: 24,
  advice: 'A husori group is just leaving this yard through its gate, and it won’t stop for you: the gate shuts behind it. Listen: another group is coming down the lane behind you, its pepa getting louder. Wait for it back from the gate, step into its ring as it reaches you, and go through the gate with it. Don’t wait right under the gate: the hosts drop the guard stakes as the singers arrive.',
  cps: [1.5],
  build: (w, c) => {
    const x = c.x;
    // the leaving group: already past the gate, walking away fast; nothing opens for it any more
    w.add(new Husori(px(x + 11), [{ x: x + 60, ritual: 0, stay: 1 }], px(x + 1), 60));
    // the coming group, behind you, and the yard's gate that opens for it
    const { h } = husori(w, x - 6, x + 1, [{ x: x + 9, ritual: 30, stay: 190 }], 34);
    w.add(new PepaCue(h, px(x + 9)));
    (w.flags.pepa ??= []).push(h);
    onPass(w, px(x + 2), (w2) => tara(w2, 'Dour, Dad! Xihot jai ase! | Run, Dad! They are going!', 2.4));
  },
};
