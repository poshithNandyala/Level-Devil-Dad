import { TILE } from '../game/constants';
import { Entity, World } from '../game/world';

export type PropKind = 'scale' | 'bridge' | 'car' | 'walkway' | 'gate' | 'reader';

/** a thing in the room that the renderer draws (its solid tiles, if any, are '%' in the map) */
export class RoomProp extends Entity {
  kind: PropKind;
  x: number;
  y: number;
  w: number;
  h: number;
  /** state the drawing needs: a walkway's tread offset, a gate's flaps (0 shut .. 1 open), a reader's last tap */
  k = 0;
  on = false;
  tick = -999;
  constructor(kind: PropKind, tx: number, ty: number, tw: number, th: number, layer = -1) {
    super();
    this.kind = kind;
    this.layer = layer;
    this.x = tx * TILE;
    this.y = ty * TILE;
    this.w = tw * TILE;
    this.h = th * TILE;
  }
}

export function prop(w: World, kind: PropKind, tx: number, ty: number, tw: number, th: number) {
  return w.add(new RoomProp(kind, tx, ty, tw, th));
}
