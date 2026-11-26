import { LINES } from '../cities';
import { Solid } from '../body';
import { DT, secs, TILE } from '../constants';
import { Entity, World } from '../world';
import { drawBandar, drawSignpost, drawTara, Mood } from '../../render/art/characters';
import { Ctx, circle, ellipse, fillRR, rr, text } from '../../render/art/common';
import { drawProp, PropKind } from '../../render/art/props';

/** A big copper biryani handi hanging on a rope. Falls when baited; lands as a step. */
export class HangingPot extends Entity {
  solid: Solid;
  state: 'hang' | 'shake' | 'fall' | 'landed' = 'hang';
  private shakeUntil = 0;
  private v = 0;
  ropeTop: number;

  constructor(tx: number, ty: number) {
    super();
    this.layer = 2;
    this.solid = new Solid(tx * TILE, ty * TILE, 32, 32);
    this.ropeTop = 0;
  }

  drop(w: World, shakeSeconds = 0.35) {
    if (this.state !== 'hang') return;
    this.state = 'shake';
    this.shakeUntil = w.tick + secs(shakeSeconds);
    w.sfx('creak', this.solid.x + 16, this.solid.y);
  }

  private blocked(w: World) {
    const s = this.solid;
    s.collidable = false;
    const hit = !!w.solidAt(s.x, s.y + 1, s.w, s.h);
    s.collidable = true;
    return hit;
  }

  update(w: World) {
    if (this.state === 'shake' && w.tick >= this.shakeUntil) {
      this.state = 'fall';
      this.v = 40;
      w.sfx('snap', this.solid.x + 16, this.solid.y);
    } else if (this.state === 'fall') {
      const s = this.solid;
      this.v = Math.min(this.v + 1600 * DT, 640);
      s.yr += this.v * DT;
      let steps = Math.round(s.yr);
      s.yr -= steps;
      while (steps-- > 0) {
        if (this.blocked(w)) {
          this.state = 'landed';
          s.yr = 0;
          w.sfx('thud', s.x + 16, s.y + 32);
          w.emit('fx', s.x + 16, s.y + 32, { kind: 'dust', w: 32 });
          w.emit('fx', s.x + 16, s.y + 2, { kind: 'rice' });
          w.emit('shake', s.x, s.y, { amount: 4 });
          break;
        }
        s.moveBy(w, 0, 1);
      }
    }
  }

  draw(ctx: Ctx, w: World) {
    const s = this.solid;
    let x = s.x,
      y = s.y + s.yr;
    if (this.state === 'shake') x += ((w.tick * 7) % 3) - 1;
    if (this.state !== 'landed' && this.state !== 'fall') {
      ctx.strokeStyle = '#6B4A2E';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x + 16, this.ropeTop);
      ctx.lineTo(x + 16, y + 4);
      ctx.stroke();
    } else if (this.state === 'fall') {
      ctx.strokeStyle = '#6B4A2E';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x + 16, this.ropeTop);
      ctx.lineTo(x + 16 + Math.sin(w.tick * 0.5) * 3, this.ropeTop + 26);
      ctx.stroke();
    }
    // pot body
    ellipse(ctx, x + 16, y + 20, 16, 12, '#B87333');
    ellipse(ctx, x + 16, y + 22, 15, 9, '#9C5A26');
    ctx.fillStyle = 'rgba(255,230,180,0.35)';
    ctx.beginPath();
    ctx.ellipse(x + 9, y + 16, 3, 6, -0.4, 0, Math.PI * 2);
    ctx.fill();
    // neck + cloth seal (dum)
    fillRR(ctx, x + 6, y + 4, 20, 6, 2, '#C98A45');
    ctx.fillStyle = '#F4EBD9';
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 6);
    ctx.quadraticCurveTo(x + 16, y - 2, x + 28, y + 6);
    ctx.lineTo(x + 26, y + 9);
    ctx.lineTo(x + 6, y + 9);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#C0392B';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 8);
    ctx.lineTo(x + 27, y + 8);
    ctx.stroke();
    // steam
    if (this.state !== 'landed') {
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 2; i++) {
        const ph = (w.tick / 60 + i * 0.5) % 1;
        ctx.globalAlpha = 1 - ph;
        ctx.beginPath();
        ctx.moveTo(x + 12 + i * 8, y - ph * 8);
        ctx.quadraticCurveTo(x + 14 + i * 8, y - 3 - ph * 8, x + 12 + i * 8, y - 6 - ph * 8);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }
}

export interface RivalScript {
  intro?: string;
  introAt?: number;
  introNearX?: number;
  taunts?: string[];
  beaten?: string;
  /** where she points while saying the intro */
  point?: 1 | -1;
}

/** What Tara says when she saw exactly how you went down. */
export const CAUSE_LINES: Record<string, string[]> = {
  fell: ['Mind the gap, Dad!', 'Gravity: 1. Dad: 0.'],
  spikes: ['Ouch. Pointy, no?', 'Those were not decorations!'],
  crushed: ['Flat Dad! Hahaha!', 'Squished like a dosa!'],
  coconut: ['Coconut 1, Dad 0!', 'Look up sometimes, Dad!'],
  splash: ['Swim much, Dad?', 'Glug glug glug!'],
  flood: ['Too much water, Dad!', 'Should have brought a boat!'],
  burnt: ['Too hot to handle!', 'Careful, it\u2019s fresh!'],
  'fake exit': ['That door? Really?', 'Not every door is a door!'],
  hit: ['Didn\u2019t see that coming?', 'Bonk!'],
  caught: ['Gotcha! Out!', 'You moved, I saw it!'],
  shocked: ['25,000 volts of nope!', 'Shocking, Dad. Literally.'],
  gored: ['Olé! Oh. Not olé.', 'The bull won the toss!'],
  spotted: ['Smile, you’re on CCTV!', 'Caught in 4K, Dad!'],
  coma: ['Biryani coma! Zzz...', 'One plate became five, no?'],
  goons: ['The goons won this take!', 'Hero dies in the first act?'],
  tackled: ['Kabaddi means KEEP CHANTING!', 'Out! Breathe less, chant more!'],
  drowned: ['Bubbles over your head means AIR, Dad!', 'Fish breathe water. Dads don’t.'],
  far: ['Next stop: Aguada! Let go sooner!', 'The boat doesn’t stop, Dad!'],
  washed: ['The tide always wins.', 'Built on sand, Dad.'],
  frozen: ['Dad-sicle!', 'Keep moving, it’s minus eighteen!'],
  thorns: ['Babool thorns! Thrown right into them!', 'Look up before the stomp, Dad!'],
  garba: ['Dandiya to the head, Dad!', 'You walked into the garba! Wait for a gap!'],
  crash: ['The market crashed, and so did you!', 'Never stand still on a falling chart, Dad.'],
  puppet: ['You dropped the puppet! Show’s over!', 'Gently with the strings, Dad!'],
  kaanch: ['Kaanch! Broken bangles underfoot!', 'Not on foot, Dad: roll over the glass in a bangle!'],
  talwar: ['Talwar! The swords were down!', 'Can’t stop the horse? Then turn it round and come back when they lift.'],
  phataka: ['Phataka! A Diwali rocket, right through the balloon!', 'Watch the fuse fizz: wait for it to go up, then pass.'],
  doob: ['Doob gaye! Straight to the bottom of the lake.', 'Stand still on water and you sink: hit it at a run and you skip.'],
  bison: ['Gored by a painting! The bison only minds painted men.', 'Step out of the picture before the bison gets to you.'],
  uljhan: ['Uljhan! Tangled in your own thread.', 'Where you’ve walked, you can’t walk again: find another way back.'],
  sher: ['Sher! Surma said a tiger, and there was a tiger.', 'When Surma says tiger, jump.'],
  chipak: ['Chipak gaye! Stuck fast to a magnet with its guard off.', 'With iron on you, don’t go under the spiked magnets: small hops only, or put the tawa down.'],
  daldal: ['Daldal! Knee deep in paddy mud, and staying there.', 'The mud is for stilts: stay up on the gedi (and land slowly, or you’re off them).'],
  kaanta: ['Ghadi ka kaanta! Swept up by a clock hand.', 'The clock only moves when you do: stand still to think, jump on the spot to wind it on.'],
  bhanwra: ['Bhanwra! A cloud of hornets, and you weren’t wrapped up.', 'Stand quite still a moment before they reach you: the cocoon keeps them out.'],
  baaj: ['Baaj! The hawk does like a nice fat cocoon.', 'Under the hawk, keep moving: only wrap up when it’s well away.'],
  chapda: ['Chapda! The red ants bite, and they don’t let go.', 'Wait for the whole bridge, then run it without stopping. And don’t keep them waiting.'],
  matka: ['Matka phoot gyo! The pots came down!', 'Smooth, Dad: no sudden stops with pots on your head!'],
  splat: ['Slide down, don’t drop down!', 'Seven floors, zero brakes!'],
  'holi-fell': ['Wrong colour, Dad!', 'Bura na mano, Holi hai!'],
  bends: ['Safety stop, Dad! Safety stop!', 'Up too fast!'],
};

/** Tara, the rival who sets traps. A/B variants: a mascot monkey, or a plain sign. */
export class Rival extends Entity {
  x: number;
  y: number;
  facing: 1 | -1;
  script: RivalScript;
  mood: Mood = 'smug';
  private moodUntil = 0;
  private after: Mood = 'smug';
  private introDone = false;
  private beatenDone = false;
  private laughedAtDeath = false;
  /** how long Dad has stood still, when she'll poke him next, and which line is next */
  private idleT = 0;
  private poked = false;
  t = 0;

  constructor(w: World, x: number, y: number, facing: 1 | -1, script: RivalScript) {
    super();
    this.layer = -1;
    this.x = x;
    this.y = y;
    this.facing = facing;
    this.script = script;
    this.greet(w);
  }

  /** right after a death (a fresh attempt, or a respawn at a hidden checkpoint): laugh and tease */
  greet(w: World) {
    if (!(w.info.justDied && w.info.deaths > 0 && this.script.taunts?.length)) return;
    // no intro again after a death; and she teases after every other death, not every single one
    this.introDone = true;
    this.laughedAtDeath = false;
    this.idleT = 0;
    this.setMood(w, 'laugh', 0.9, 'smug');
    if (w.info.deaths % 2 === 0) return;
    // she names how you went down, or teases in the local mix, turn and turn about
    const cause = w.info.lastCause ?? '';
    const byCause = CAUSE_LINES[cause];
    const n = (w.info.deaths - 1) / 2;
    const line = byCause && n % 2 === 0 ? byCause[Math.floor(n / 2) % byCause.length] : this.script.taunts[n % this.script.taunts.length];
    this.say(w, line, 1.6);
  }

  private setMood(w: World, m: Mood, seconds: number, after: Mood) {
    this.mood = m;
    this.moodUntil = w.tick + secs(seconds);
    this.after = after;
  }

  say(w: World, line: string, seconds = 2.2) {
    w.say(line, this.x, this.y - 28, seconds, w.info.rival === 'none' ? 'sign' : 'rival');
  }

  update(w: World) {
    this.t += DT;
    if (this.moodUntil && w.tick >= this.moodUntil) {
      this.mood = this.after;
      this.moodUntil = 0;
    }
    const near = this.script.introNearX !== undefined && Math.abs(w.player.cx - this.x) < this.script.introNearX;
    // on a fresh start the stage title card is up for ~2.4 s: she waits for it to go
    const hush = w.info.justDied ? 0 : 2.4;
    if (!this.introDone && this.script.intro && w.seconds >= hush && (w.seconds >= (this.script.introAt ?? 0.5) || near)) {
      this.introDone = true;
      this.say(w, this.script.intro, 2.6);
      this.setMood(w, 'point', 2.2, 'smug');
    }
    if (!this.beatenDone && (w.rivalBeaten || w.state === 'won')) {
      this.beatenDone = true;
      this.setMood(w, 'shocked', 1.1, 'annoyed');
      if (this.script.beaten) this.say(w, this.script.beaten, 2.6);
      w.sfx(w.info.rival === 'bandar' ? 'monkey' : 'gasp', this.x, this.y - 20);
    }
    // the talk queue (tours, chatty stages): one line after another, each once the last was read
    while (w.talkQueue.length && w.talkIf.get(w.talkQueue[0])?.(w) === false) w.talkQueue.shift();
    if (w.state === 'play' && w.talkQueue.length && !w.talking && w.seconds >= hush) {
      this.say(w, w.talkQueue.shift()!, 3);
      this.setMood(w, 'point', 1.6, 'smug');
    }
    // standing around? she pokes you, in the local mix
    const inp = w.input;
    const still = w.state === 'play' && !inp.left && !inp.right && !inp.jump;
    // (only once per go, and only after a good long wait: lots of stages are about waiting)
    if (still) this.idleT += DT;
    else this.idleT = 0;
    if (still && this.idleT >= 9 && !this.poked && !w.talking && !w.talkQueue.length) {
      this.poked = true;
      const lines = LINES[w.city]?.idle ?? [];
      if (lines.length) {
        this.say(w, lines[(w.info.attempt + w.level.index) % lines.length], 2.6);
        this.setMood(w, 'point', 1.4, 'smug');
      }
    }
    if (w.state === 'dead' && !this.laughedAtDeath) {
      this.laughedAtDeath = true;
      this.setMood(w, 'laugh', 2, 'smug');
      w.sfx(w.info.rival === 'bandar' ? 'monkey' : w.info.rival === 'none' ? 'none' : 'laugh', this.x, this.y - 20);
    }
  }

  draw(ctx: Ctx, w: World) {
    // Tara and the bandar live in the corner portrait now (the level is the devil);
    // only the plain signpost variant still stands in the world
    if (w.info.rival === 'none') drawSignpost(ctx, this.x, this.y, this.facing);
  }
}

export type SignStyle = 'green' | 'station' | 'shop' | 'warn' | 'wood' | 'metro' | 'azulejo';

/** World signage. Some of it lies. */
export class Sign extends Entity {
  constructor(
    public x: number,
    public y: number,
    public w: number,
    public label: string,
    public style: SignStyle = 'green',
    public arrow: 'left' | 'right' | 'up' | 'down' | null = null,
    public sub = '',
    public post = true,
  ) {
    super();
    this.layer = -6;
  }

  draw(ctx: Ctx) {
    const h = this.sub ? 13 : 9;
    const x = this.x,
      y = this.y;
    if (this.post) {
      ctx.fillStyle = '#4A4F55';
      ctx.fillRect(x + this.w / 2 - 0.8, y + h, 1.6, 40);
    }
    const bg =
      this.style === 'green'
        ? '#0E6B3A'
        : this.style === 'station'
          ? '#F7D046'
          : this.style === 'warn'
            ? '#C0392B'
            : this.style === 'wood'
              ? '#B88A57'
              : this.style === 'metro'
                ? '#6E44B8'
                : this.style === 'azulejo'
                  ? '#1D5FB4'
                  : '#F28C28';
    const fg = this.style === 'station' ? '#111' : this.style === 'wood' ? '#3A2414' : '#FFFFFF';
    fillRR(ctx, x, y, this.w, h, 1.6, bg, this.style === 'station' ? '#111' : 'rgba(0,0,0,0.35)', 0.8);
    if (this.style === 'azulejo') {
      // painted tiles: a white frame and tile joints
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 0.7;
      ctx.strokeRect(x + 1, y + 1, this.w - 2, h - 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      for (let k = x + 6; k < x + this.w - 2; k += 6) {
        ctx.moveTo(k, y + 1);
        ctx.lineTo(k, y + h - 1);
      }
      ctx.stroke();
    }
    let lx = x + this.w / 2;
    if (this.arrow === 'right') {
      text(ctx, '→', x + this.w - 5, y + 4.6, 7, fg, { weight: 800 });
      lx -= 3;
    } else if (this.arrow === 'left') {
      text(ctx, '←', x + 5, y + 4.6, 7, fg, { weight: 800 });
      lx += 3;
    } else if (this.arrow === 'up') {
      text(ctx, '↑', x + this.w - 5, y + 4.6, 7, fg, { weight: 800 });
      lx -= 3;
    }
    text(ctx, this.label, lx, y + 4.8, 5.6, fg, { weight: 800, maxW: this.w - (this.arrow ? 12 : 4) });
    if (this.sub) text(ctx, this.sub, x + this.w / 2, y + 10, 3.8, fg, { weight: 600, maxW: this.w - 4 });
  }
}

export class Prop extends Entity {
  constructor(
    public kind: PropKind,
    public x: number,
    public y: number,
    public opts: Record<string, any> = {},
    layer = -7,
  ) {
    super();
    this.layer = layer;
  }
  draw(ctx: Ctx, w: World) {
    drawProp(ctx, this.kind, this.x, this.y, w, this.opts);
  }
}

export { circle, rr };
