import { Actor, Solid } from './body';
import { approach, DT, Phys, PHYS } from './constants';
import type { InputState, World } from './world';

/** In the sea: tap to stroke up, hold to float, let go to sink. */
export const SWIM = {
  maxRun: 72,
  accel: 520,
  decel: 300,
  /** a stroke's push up (px/s) */
  stroke: 150,
  /** sinking when nothing is pressed */
  sink: 240,
  maxSink: 80,
  /** water slows everything down (per second); holding the button steadies you faster */
  drag: 4.2,
  holdDrag: 10,
  /** a stroke with your head out of the water: a jump out on to a jetty */
  leap: 330,
  /** seconds of air */
  air: 5,
  refill: 6,
};

/** On a palm trunk: hold left or right to climb, jump to leap off the way you hold. */
export const CLIMB = {
  speed: 62,
  leapVy: 330,
};

/** Something Dad can climb (a palm trunk): a line from its base (s = 0) to its top (s = 1). */
export interface Climbable {
  active: boolean;
  /** px from base to top (sets how fast s changes) */
  len: number;
  /** centre x and feet y of a climber at fraction s */
  at(s: number): { x: number; y: number };
  /** the fraction where Dad's body touches it, or null */
  touch(x: number, y: number, w: number, h: number): number | null;
  /** px/s it slides you down when you don't climb (greased) */
  slide?: number;
  /** called every tick Dad hangs on it (bending palms) */
  onGrip?(w: World, s: number): void;
  onLeave?(w: World): void;
  /** climbing past the top puts Dad on its crown (a one-way platform up there) */
  crown?: Solid;
}

/** A swimmable stretch of sea (not deadly): its surface and bottom (px). */
export interface SeaZone {
  x0: number;
  x1: number;
  top: number;
  bottom: number;
}

/**
 * The player controller. Small allowances make demanding rooms feel fair:
 * coyote time (jump just after leaving a ledge), jump buffering (jump pressed
 * just before landing still counts), variable jump height, a little apex hang
 * and corner correction when the head clips a ceiling edge.
 */
export class Player extends Actor {
  vx = 0;
  vy = 0;
  facing: 1 | -1 = 1;
  inputDir = 0;
  onGround = false;
  groundSolid: Solid | null = null;
  coyoteT = 0;
  bufferT = 0;
  jumping = false;
  airTicks = 0;
  /** ticks since last landing / jump for animation */
  landTick = -999;
  jumpTick = -999;
  landSpeed = 0;
  runDist = 0;
  won = false;
  /** velocity inherited from a moving platform; kept while airborne (inertial frame) */
  carryVx = 0;
  /** ticks of lost control after being shoved */
  stun = 0;
  /** inside something (an auto ride): not drawn, can't be steered */
  hidden = false;
  /** external push this tick (wind, conveyor), px/s; reset by the world every tick */
  pushVx = 0;
  /** thrown by a launch pad: rises under normal gravity whatever the jump button does */
  launched = false;
  /** jump released early: cut the rise once the minimum jump time has passed */
  private cutPending = false;

  /** 1 = normal; -1 = gravity flipped (Dad walks on the ceiling) */
  gsign: 1 | -1 = 1;
  /** a mirchi rush: run speed times this */
  speedMul = 1;
  /** px of his height that is something he's standing on (stilts): he's drawn that much up, at his own size */
  lift = 0;
  /** a paraglider: the fastest he can fall (px/s), or null for normal */
  fallCap: number | null = null;
  /** on puppet strings: his own jumps do nothing (the strings jump him) */
  noJump = false;

  /** shrink or grow, keeping his feet where they are */
  resize(w: number, h: number) {
    this.x += Math.round((this.w - w) / 2);
    this.y += this.h - h;
    this.w = w;
    this.h = h;
  }

  // ---------------------------------------------------------------- the sea, palms and walls
  /** swimming right now (the last update was in the sea) */
  swimming = false;
  /** seconds of air left (refills with your head out of the water) */
  air = SWIM.air;
  /** the tick of the last stroke (for the drawing) */
  strokeTick = -999;
  /** a leap out of the water: ordinary air for a few ticks */
  private leapT = 0;
  /** the palm Dad hangs on, and how far up it (0..1) */
  grip: Climbable | null = null;
  gripS = 0;
  /** just climbing (for the drawing) */
  climbing = false;
  private gripCool = 0;
  private gripLast: Climbable | null = null;
  /** after a wall kick: no steering back into that wall for a moment */
  private kickLock = 0;
  private kickFrom = 0;
  /** which wall Dad is sliding down (-1 left, 1 right, 0 none), and when he last touched one */
  wallSide = 0;
  private wallTick = -999;
  private wallLast = 0;
  /** carrying something (a dabba): drawn in his hands */
  carry: string | null = null;
  /** the long-lost twin: same buttons, other clothes */
  twin = false;
  /** a twin that does everything the other way round (left is right) */
  mirror = false;
  /** which physics this body uses (the rooms swap in ROOM_PHYS) */
  phys: Phys = PHYS;
  /** in the air because of a jump (not a walk off a ledge): the apex hang only applies to jumps */
  private arc = false;

  constructor(x: number, y: number) {
    super(x, y, PHYS.width, PHYS.height);
  }

  /** let go of a palm */
  release(w: World, cool = 14) {
    const g = this.grip;
    if (!g) return;
    this.grip = null;
    this.climbing = false;
    this.gripCool = cool;
    this.gripLast = g;
    g.onLeave?.(w);
  }

  update(w: World, inp: InputState) {
    const P = this.phys;
    const stunned = this.stun > 0;
    if (stunned) this.stun--;
    let dir = stunned ? 0 : (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
    if (this.kickLock > 0) {
      this.kickLock--;
      if (dir === this.kickFrom) dir = 0;
    }
    this.inputDir = dir;
    if (dir !== 0) this.facing = dir as 1 | -1;
    if (this.leapT > 0) this.leapT--;
    if (this.gripCool > 0) this.gripCool--;
    if (this.grip) return this.climbStep(w, inp, dir, stunned);
    const sea = this.leapT > 0 || this.gsign < 0 ? null : w.seaAt(this);
    if (sea) return this.swimStep(w, inp, dir, stunned, sea);
    if (this.swimming) this.swimming = false;
    this.air = Math.min(SWIM.air, this.air + SWIM.refill * DT);

    const sg = this.gsign;
    const g = sg > 0 ? w.groundUnder(this) : w.groundAbove(this);
    const grounded = g.on && sg * this.vy >= 0;
    if (grounded) {
      // a fall that ended exactly on the ground last tick never "hit" it: count the landing now
      if (!this.onGround && this.airTicks > 3 && sg * this.vy > 60 && this.landTick < w.tick - 1) {
        this.landTick = w.tick;
        this.landSpeed = sg * this.vy;
        w.emit('land', this.cx, this.y + this.h, { speed: sg * this.vy });
      }
      this.onGround = true;
      this.arc = false;
      this.groundSolid = g.solid;
      this.coyoteT = P.coyote;
      this.airTicks = 0;
      this.carryVx = 0;
    } else {
      if (this.onGround && this.groundSolid) {
        // walked off a moving platform: keep its motion
        this.carryVx = this.groundSolid.velX ?? this.groundSolid.lastDx / DT;
      }
      this.onGround = false;
      this.coyoteT -= DT;
      this.airTicks++;
    }

    if (inp.jumpPressed && !stunned) this.bufferT = P.jumpBuffer;
    else this.bufferT -= DT;

    // ------------------------------------------------------------ horizontal
    const sticky = this.onGround && !!g.sticky;
    const run = P.maxRun * this.speedMul;
    const target = dir * (sticky ? P.stickyRun : run);
    let a: number;
    const wet = this.onGround && g.slippery;
    if (sticky && Math.abs(this.vx) > P.stickyRun) this.vx = Math.sign(this.vx) * P.stickyRun;
    if (this.onGround) {
      if (dir === 0) a = wet ? P.wetDecel : P.decelGround;
      else if (this.vx !== 0 && Math.sign(this.vx) !== dir) a = wet ? P.wetAccel : P.turnGround;
      else a = wet ? P.wetAccel : P.accelGround;
    } else {
      if (dir === 0) a = P.decelAir;
      else if (this.vx !== 0 && Math.sign(this.vx) !== dir) a = P.turnAir;
      else a = P.accelAir;
    }
    if (stunned) {
      // flying: keep the shove
    } else if (dir !== 0 && Math.abs(this.vx) > run && Math.sign(this.vx) === dir) {
      this.vx = approach(this.vx, target, P.overSpeedReduce * DT);
    } else {
      this.vx = approach(this.vx, target, a * DT);
    }

    // ------------------------------------------------------------------ jump
    if (this.bufferT > 0 && this.coyoteT > 0 && !this.noJump) {
      this.bufferT = 0;
      this.coyoteT = 0;
      this.vy = -P.jumpVel * sg;
      const gs = sg > 0 ? this.groundSolid : null;
      if (gs) {
        this.carryVx = gs.velX ?? gs.lastDx / DT;
        const pvy = gs.lastDy / DT;
        if (pvy < 0) this.vy += pvy;
      }
      this.jumping = true;
      this.arc = true;
      this.cutPending = false;
      this.onGround = false;
      this.groundSolid = null;
      this.jumpTick = w.tick;
      w.emit('jump', this.cx, this.y + this.h);
    } else if (this.bufferT > 0 && !this.onGround && sg > 0 && w.tick - this.wallTick <= 7 && this.wallLast !== 0) {
      // a chawl wall: kick off it, away from it
      const side = this.wallLast;
      this.bufferT = 0;
      this.vy = -P.jumpVel * 0.97;
      this.vx = -side * 172;
      this.carryVx = 0;
      this.kickLock = 11;
      this.kickFrom = side;
      this.facing = -side as 1 | -1;
      // a kick is always a full kick: letting go early doesn't cut it short
      // a kick is never cut short by letting go of jump: every kick carries you across the gali the
      // same way, so where you touch the wall doesn't hang on how long you held the button
      this.jumping = false;
      this.cutPending = false;
      this.wallTick = -999;
      this.wallSide = 0;
      this.jumpTick = w.tick;
      w.emit('jump', this.cx, this.y + this.h);
      w.emit('kick', side > 0 ? this.x + this.w : this.x, this.cy, { side });
    }
    if (this.jumping && !inp.jump && sg * this.vy < 0 && !P.fixedJump) this.cutPending = true;
    if (this.cutPending && this.jumping && sg * this.vy < 0 && (w.tick - this.jumpTick) * DT >= P.minJump) {
      this.vy *= P.jumpCut;
      this.jumping = false;
      this.cutPending = false;
    }
    if (!this.jumping) this.cutPending = false;
    if (sg * this.vy >= 0) this.jumping = false;

    // --------------------------------------------------------------- gravity
    if (!this.onGround) {
      // a pending cut keeps the jump's own gravity until the minimum jump time is over
      let grav = sg * this.vy < 0 && (P.fixedJump || inp.jump || this.cutPending) && !this.launched ? P.gravityUp : P.gravityDown;
      if (sg * this.vy >= 0) this.launched = false;
      if (Math.abs(this.vy) < P.apexHangVy && (P.fixedJump ? this.arc : inp.jump)) grav *= P.apexHangMul;
      const maxFall = this.fallCap ?? P.maxFall;
      this.vy = sg > 0 ? Math.min(this.vy + grav * DT, maxFall) : Math.max(this.vy - grav * DT, -maxFall);
    } else if (sg * this.vy > 0) {
      this.vy = 0;
    }

    // ------------------------------------------------------------------ move
    const x0 = this.x;
    const dx = (this.vx + this.carryVx + this.pushVx) * DT;
    this.pushVx = 0;
    const blocked = this.moveX(w, dx, () => {
      // airborne and the feet only just missed a ledge: step up onto it instead of sliding down the wall
      if (sg > 0 && !this.onGround && this.vy > -P.jumpVel * 0.5 && this.ledgeStep(w, Math.sign(dx), P.ledgeAssist)) return;
      // on the ground: walk up a curb or a low lid without jumping
      if (this.onGround && this.ledgeStep(w, Math.sign(dx), 5)) return;
      this.vx = 0;
      this.carryVx = 0;
    });
    void blocked;
    if (this.onGround) this.runDist += Math.abs(this.x - x0);
    const fallSpeed = sg * this.vy;
    this.moveY(w, this.vy * DT, (hit) => {
      if (sg * this.vy > 0) {
        // landing: fold inherited motion into our own, relative to what we land on
        const vs = hit === true ? 0 : hit.velX ?? hit.lastDx / DT;
        if (this.carryVx !== 0 || vs !== 0) {
          this.vx += this.carryVx - vs;
          this.carryVx = 0;
        }
        if (fallSpeed > 60) {
          this.landTick = w.tick;
          this.landSpeed = fallSpeed;
          w.emit('land', this.cx, this.y + this.h, { speed: fallSpeed });
        }
        this.vy = 0;
      } else if (sg * this.vy < 0) {
        if (sg < 0 || !this.cornerCorrect(w)) {
          this.vy = 0;
          this.jumping = false;
          w.emit('bonk', this.cx, this.y);
        }
      }
    });
    this.afterMove(w, dir);
  }

  /** chawl walls (slide down them, kick off them) and palms (grab them in the air) */
  private afterMove(w: World, dir: number) {
    this.wallSide = 0;
    if (this.onGround && this.gripCool <= 0) this.gripLast = null;
    if (this.onGround || this.gsign < 0 || w.state !== 'play') return;
    // a wall right beside Dad, and one he may kick off
    for (const side of [1, -1]) {
      const x = side > 0 ? this.x + this.w : this.x - 1;
      if (!w.solidAt(side > 0 ? this.x + 1 : this.x - 1, this.y + 2, this.w, this.h - 4)) continue;
      if (!w.kickAt(x, this.y + 2, this.h - 4)) continue;
      this.wallTick = w.tick;
      this.wallLast = side;
      // pressing into it on the way down: slide
      if (dir === side && this.vy > 0) {
        this.wallSide = side;
        if (this.vy > 64) this.vy = 64;
      }
    }
    // a palm: grab it on the way past (holding either way)
    if (dir !== 0 && !this.grip) {
      for (const c of w.climbables) {
        // the palm he just leapt off stays let go until he's been on the ground (or another palm)
        if (!c.active || c === this.gripLast) continue;
        const s = c.touch(this.x, this.y, this.w, this.h);
        if (s === null) continue;
        this.grip = c;
        this.gripS = s;
        this.vx = 0;
        this.vy = 0;
        this.carryVx = 0;
        this.jumping = false;
        this.launched = false;
        w.emit('grab', this.cx, this.cy);
        this.snapToGrip(w);
        break;
      }
    }
  }

  /** put Dad on his palm at gripS */
  private snapToGrip(w: World) {
    const g = this.grip!;
    const at = g.at(this.gripS);
    const nx = Math.round(at.x - this.w / 2),
      ny = Math.round(at.y - this.h);
    this.xr = 0;
    this.yr = 0;
    const blockX = this.moveXExact(w, nx - this.x);
    const blockY = this.moveYExact(w, ny - this.y);
    if (blockX || blockY) {
      // the palm went somewhere Dad can't: he lets go
      this.release(w);
    }
  }

  private climbStep(w: World, inp: InputState, dir: number, stunned: boolean) {
    const g = this.grip!;
    this.onGround = false;
    this.groundSolid = null;
    this.airTicks = 0;
    this.coyoteT = 0;
    this.carryVx = 0;
    this.vx = 0;
    this.vy = 0;
    this.climbing = false;
    if (!g.active) {
      this.release(w);
      return;
    }
    if (inp.jumpPressed && !stunned) {
      // leap off, the way he's holding (or facing)
      const d = dir !== 0 ? dir : this.facing;
      this.release(w);
      this.vx = d * PHYS.maxRun;
      this.vy = -CLIMB.leapVy;
      this.jumping = true;
      this.cutPending = false;
      this.facing = d as 1 | -1;
      this.jumpTick = w.tick;
      w.emit('jump', this.cx, this.y + this.h);
      return;
    }
    let ds = 0;
    if (dir !== 0) {
      ds = (CLIMB.speed / g.len) * DT;
      this.climbing = true;
    } else if (g.slide) ds = -(g.slide / g.len) * DT;
    let s = this.gripS + ds;
    if (s >= 1) {
      s = 1;
      if (g.crown && dir !== 0) {
        // over the top, on to the crown
        const at = g.at(1);
        this.gripS = 1;
        this.release(w, 20);
        const top = g.crown.y;
        this.x = Math.round(at.x - this.w / 2);
        this.y = top - this.h;
        this.xr = 0;
        this.yr = 0;
        this.vy = 0;
        return;
      }
    }
    if (s <= 0) {
      s = 0;
      if (g.slide) {
        // slid all the way down
        this.gripS = 0;
        this.snapToGrip(w);
        this.release(w, 30);
        return;
      }
    }
    this.gripS = s;
    g.onGrip?.(w, s);
    if (this.grip) this.snapToGrip(w);
  }

  private swimStep(w: World, inp: InputState, dir: number, stunned: boolean, sea: SeaZone) {
    const S = SWIM;
    const gr = w.groundUnder(this);
    const grounded = gr.on && this.vy >= 0;
    if (grounded) {
      this.onGround = true;
      this.groundSolid = gr.solid;
      this.airTicks = 0;
    } else {
      this.onGround = false;
      this.groundSolid = null;
      this.airTicks++;
    }
    this.coyoteT = 0;
    this.bufferT = 0;
    this.carryVx = 0;
    this.launched = false;
    this.jumping = false;
    if (!this.swimming) {
      // splash in: the water takes the fall's speed
      this.swimming = true;
      if (this.vy > 110) this.vy = 110;
      this.vx *= 0.6;
      w.emit('splash', this.cx, sea.top);
    }
    // sideways: slow and floaty
    this.vx = approach(this.vx, dir * S.maxRun, (dir !== 0 ? S.accel : S.decel) * DT);
    // up and down: a tap strokes, holding floats, letting go sinks
    if (inp.jumpPressed && !stunned) {
      this.jumpTick = w.tick;
      this.strokeTick = w.tick;
      if (this.y <= sea.top + 3) {
        // head out of the water: a leap out (on to a jetty, a boat)
        this.vy = -S.leap;
        this.leapT = 16;
        this.jumping = true;
        this.cutPending = false;
        this.swimming = false;
        w.emit('jump', this.cx, this.y + this.h);
      } else if (this.vy > 25) {
        // sinking: the first press just catches the water (and holding keeps you there)
        this.vy = 0;
      } else {
        this.vy = Math.min(this.vy, -S.stroke);
        w.emit('stroke', this.cx, this.cy);
      }
    }
    if (this.leapT === 0) {
      const hold = inp.jump && !stunned;
      this.vy += (hold ? 0 : S.sink) * DT;
      this.vy -= this.vy * (hold && w.tick - this.strokeTick > 12 ? S.holdDrag : S.drag) * DT;
      if (this.vy > S.maxSink) this.vy = S.maxSink;
    }
    // air: only with the head out of the water
    if (this.y > sea.top + 1) {
      this.air -= DT;
      if (this.air <= 0) {
        this.air = 0;
        w.die('drowned', this);
        return;
      }
    } else this.air = Math.min(S.air, this.air + S.refill * DT);
    const x0 = this.x;
    this.moveX(w, (this.vx + this.pushVx) * DT, () => {
      if (this.ledgeStep(w, Math.sign(this.vx), 6)) return;
      this.vx = 0;
    });
    this.pushVx = 0;
    if (this.onGround) this.runDist += Math.abs(this.x - x0) * 0.6;
    this.moveY(w, this.vy * DT, (hit) => {
      if (this.vy > 0) {
        void hit;
        this.vy = 0;
      } else {
        this.vy = 0;
        w.emit('bonk', this.cx, this.y);
      }
    });
  }

  /** Lift the player up to PHYS.ledgeAssist px so a near-miss lands on the ledge. */
  private ledgeStep(w: World, dir: number, max: number): boolean {
    if (!dir) return false;
    for (let k = 1; k <= max; k++) {
      if (w.solidAt(this.x, this.y - k, this.w, this.h)) return false; // ceiling in the way
      if (!w.solidAt(this.x + dir, this.y - k, this.w, this.h)) {
        this.y -= k;
        this.x += dir;
        if (this.vy > 0) this.vy = 0;
        return true;
      }
    }
    return false;
  }

  /** Nudge sideways when the head barely clips a ceiling corner. */
  private cornerCorrect(w: World): boolean {
    const order = this.vx >= 0 ? [1, -1] : [-1, 1];
    for (let i = 1; i <= this.phys.cornerCorrect; i++) {
      for (const s of order) {
        if (!w.solidAt(this.x + s * i, this.y - 1, this.w, this.h) && !w.solidAt(this.x + s * i, this.y, this.w, this.h)) {
          this.x += s * i;
          return true;
        }
      }
    }
    return false;
  }
}
