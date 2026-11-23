import type { DoorId } from '../types';
import type { RideExit } from '../exits';
import type { Ctx } from './dad';
import type { Scene } from './scene';
import { drawTrain, MUMBAI_SCENE } from './mumbai';
import { BENGALURU_SCENE, drawAuto } from './bengaluru';
import { DELHI_SCENE, drawMetro } from './delhi';
import { AutoRide } from '../auto';
import type { World } from '../../game/world';

const SCENES: Partial<Record<DoorId, Scene>> = { mum: MUMBAI_SCENE, blr: BENGALURU_SCENE, del: DELHI_SCENE };

export function sceneFor(door: DoorId): Scene {
  return SCENES[door] ?? MUMBAI_SCENE;
}

/** rides that stand behind the ground line (a train at the platform) */
export function drawRide(ctx: Ctx, e: RideExit, t: number) {
  if (e.kind === 'train') drawTrain(ctx, e, t);
  else if (e.kind === 'metro') drawMetro(ctx, e, t);
}

/** rides on the road, in front of the ground (an auto) */
export function drawRidesFront(ctx: Ctx, w: World, t: number) {
  for (const e of w.entities) if (e instanceof AutoRide) drawAuto(ctx, e, t);
}
