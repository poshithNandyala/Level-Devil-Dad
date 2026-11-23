import { DT, Rect, TILE } from '../game/constants';
import { Entity, ExitLike, World } from '../game/world';

export type RideKind = 'train' | 'auto' | 'metro';

/**
 * Every room ends in a ride Dad is late for: a local train's open door, an auto's
 * open side, a metro door. It is an entity (it can move, leave, come back); the
 * room renderer draws it.
 */
export class RideExit extends Entity {
  kind: RideKind;
  /** left edge of the way in (px) and the floor Dad stands on inside it */
  x: number;
  floor: number;
  /** the door is open (only an open door lets him in) */
  open = true;
  /** Dad got in on this tick */
  boardTick = -1;
  /** how far the ride has pulled away after he boarded (for the drawing) */
  away = 0;
  /** tiles of body to draw to the right of the way in */
  body: number;
  exit: ExitLike;

  constructor(kind: RideKind, tx: number, floorY: number, body = 4) {
    super();
    this.kind = kind;
    this.layer = -3;
    this.x = tx * TILE;
    this.floor = floorY;
    this.body = body;
    const self = this;
    this.exit = {
      zone(): Rect | null {
        return self.open ? { x: self.x + 3, y: self.floor - 26, w: 10, h: 26 } : null;
      },
      reach(w: World) {
        self.boardTick = w.tick;
        w.player.hidden = true;
        w.win('ride');
      },
    };
  }

  static at(w: World, kind: RideKind, body = 4) {
    const c = w.exitCell;
    if (!c) throw new Error(`${w.level.id}: no exit 'E'`);
    return w.add(new RideExit(kind, c.tx, (c.ty + 1) * TILE, body));
  }

  update(w: World) {
    if (this.boardTick >= 0 && w.tick > this.boardTick + 18) this.away += DT * 90 * Math.min(4, (w.tick - this.boardTick - 18) / 30);
  }
}
