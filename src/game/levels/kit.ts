import { TILE } from '../constants';
import type { World } from '../world';
import { TileGroup } from '../entities/group';
import { Door, SpikeGroup } from '../entities/basics';
import { Auto, AutoLines, AutoMode } from '../entities/auto';
import { HangingPot, Prop, Rival, RivalScript, Sign, SignStyle } from '../entities/props';
import { PedButton, PhaseDef, Signal, Vehicle } from '../entities/traffic';
import { Floater, Platform, Train, TrainDoor, Water } from '../entities/mumbai';
import type { PropKind } from '../../render/art/props';
import type { ThingKind } from '../../render/art/things';
import { Arc, Blinker, Cloud, Collectible, Gust, Roller, Schedule, Shot, Spring, Thing, ThingOpts, Panel, Geyser, Rider, Cascade } from '../entities/traps';
import type { VehicleKind } from '../../render/art/vehicles';

// Small helpers so levels read like stage directions.
export const px = (t: number) => t * TILE;

export function door(w: World): Door {
  return w.add(Door.fromMap(w));
}

export function group(w: World, letter: string): TileGroup {
  return w.add(new TileGroup(w, letter));
}

export function spikes(w: World, letter: string): SpikeGroup {
  return w.add(new SpikeGroup(w, letter));
}

/** Collapse a group the moment the player stands on it. */
export function collapseOnStand(w: World, g: TileGroup, delay = 0) {
  w.when(
    () => w.standing(g.solid),
    () => g.fall(w, { delay }),
  );
}

export function sign(w: World, tx: number, ty: number, wTiles: number, label: string, style: SignStyle = 'green', arrow: Sign['arrow'] = null, sub = '', post = true) {
  return w.add(new Sign(px(tx), px(ty), px(wTiles), label, style, arrow, sub, post));
}

/** Props stand on the ground row `tyGround` (top edge of that tile row), centred in column tx. */
export function prop(w: World, kind: PropKind, tx: number, tyGround: number, opts: Record<string, any> = {}, layer = -7) {
  return w.add(new Prop(kind, px(tx) + 8, px(tyGround), opts, layer));
}

export function rival(w: World, tx: number, tyGround: number, facing: 1 | -1, script: RivalScript) {
  return w.add(new Rival(w, px(tx) + 8, px(tyGround), facing, script));
}

export function auto(w: World, tx: number, tyGround: number, mode: AutoMode, opts: { minTx?: number; maxTx?: number; facing?: 1 | -1; lines?: AutoLines; gain?: number } = {}) {
  return w.add(
    new Auto(px(tx), px(tyGround), mode, {
      minX: opts.minTx !== undefined ? px(opts.minTx) : undefined,
      maxX: opts.maxTx !== undefined ? px(opts.maxTx) : undefined,
      facing: opts.facing,
      lines: opts.lines,
      gain: opts.gain,
    }),
  );
}

export function pot(w: World, tx: number, ty: number) {
  return w.add(new HangingPot(tx, ty));
}

export function signal(w: World, tx: number, tyGround: number, phases: PhaseDef[]) {
  return w.add(new Signal(px(tx) + 8, px(tyGround), phases));
}

export function vehicle(w: World, kind: VehicleKind, x: number, tyGround: number, opts: ConstructorParameters<typeof Vehicle>[3] = {}) {
  return w.add(new Vehicle(kind, x, px(tyGround), opts));
}

export function pedButton(w: World, tx: number, ty: number, tyGround: number, onPress?: (w: World) => void) {
  return w.add(new PedButton(px(tx) + 4, px(ty) + 2, px(tyGround), onPress));
}

export function platform(w: World, tx: number, ty: number, wTiles: number, opts: { label?: string; hTiles?: number } = {}) {
  return w.add(new Platform(tx, ty, wTiles, opts));
}

export function train(w: World, tx: number, tyTop: number, wTiles: number, doors: TrainDoor[], label = '') {
  return w.add(new Train(tx, tyTop, wTiles, doors, label));
}

export function water(w: World, levelTy: number, opts: { rate: number; startAt?: number; minTy: number; colors?: [string, string]; cause?: string; behind?: boolean }) {
  return w.add(new Water(levelTy, opts));
}

export function floater(w: World, wat: Water, tx: number, tyTop: number, wTiles: number, kind: Floater['kind'] = 'crate') {
  return w.add(new Floater(wat, tx, tyTop, wTiles, kind));
}

// ------------------------------------------------------------ trap kit
/** A sprite solid at tile (tx, ty) top-left; `dy` px nudges it down (eg. to sit on the ground). */
export function thing(w: World, kind: ThingKind, tx: number, ty: number, o: ThingOpts & { dx?: number; dy?: number } = {}) {
  return w.add(new Thing(kind, px(tx) + (o.dx ?? 0), px(ty) + (o.dy ?? 0), o));
}

/** A thing standing on ground row `tyGround` (its bottom edge sits on that row's top). */
export function thingOn(w: World, kind: ThingKind, tx: number, tyGround: number, o: ThingOpts & { dx?: number } = {}) {
  const t = new Thing(kind, px(tx) + (o.dx ?? 0), 0, o);
  t.solid.y = px(tyGround) - t.solid.h;
  return w.add(t);
}

export function roller(w: World, kind: ThingKind, x: number, y: number, vx: number, o: { vy?: number; bounce?: number; cause?: string; breakOnWall?: boolean; ghost?: boolean } = {}) {
  return w.add(new Roller(kind, x, y, vx, o));
}

export function shot(w: World, kind: ThingKind, x: number, y: number, vx: number, vy = 0, g = 0, cause = 'hit') {
  return w.add(new Shot(kind, x, y, vx, vy, g, cause));
}

export function gust(w: World, tx: number, ty: number, tw: number, th: number, force: number, schedule: Schedule | null = null) {
  return w.add(new Gust(tx, ty, tw, th, force, schedule));
}

/** A launch pad sitting on ground row `tyGround`. */
export function spring(w: World, kind: ThingKind, tx: number, tyGround: number, launch: number, o: { kickVx?: number; delay?: number; once?: boolean; dx?: number; dy?: number } = {}) {
  const s = new Spring(kind, px(tx) + (o.dx ?? 0), 0, launch, o);
  s.solid.y = px(tyGround) - s.solid.h + (o.dy ?? 0);
  return w.add(s);
}

export function blinker(w: World, kind: ThingKind, tx: number, ty: number, schedule: Schedule | null, o: { w?: number; h?: number } = {}) {
  return w.add(new Blinker(kind, px(tx), px(ty), schedule, o));
}

export function arc(w: World, ax: number, ay: number, bx: number, by: number, height: number, schedule: Schedule, color?: string, cause?: string) {
  return w.add(new Arc(ax, ay, bx, by, height, schedule, color, cause));
}

export function cloud(w: World, tx: number, ty: number, tw: number, th: number, schedule: Schedule | null = null, color?: string) {
  return w.add(new Cloud(tx, ty, tw, th, schedule, color));
}

export function panel(w: World, tx: number, ty: number, tw: number, th: number, color: string, line: string, tile = 8) {
  return w.add(new Panel(px(tx), px(ty), px(tw), px(th), color, line, tile));
}

/** A blowhole at (x, yBase): `pulses` are [start, seconds] inside each period. */
export function geyser(w: World, x: number, yBase: number, height: number, period: number, pulses: [number, number][], cause = 'splash') {
  return w.add(new Geyser(x, yBase, height, period, pulses, 0.35, cause));
}

/** A waterfall stream at x from yTop down to yBottom: `pulses` are [start, seconds] inside each period. */
export function cascade(w: World, x: number, yTop: number, yBottom: number, period: number, pulses: [number, number][], o: { width?: number; warn?: number; cause?: string } = {}) {
  return w.add(new Cascade(x, yTop, yBottom, o.width ?? 14, period, pulses, o.warn ?? 0.4, o.cause ?? 'splash'));
}

export function rider(w: World, kind: ThingKind, x: number, tyGround: number, vx: number, inset = 5, cause = 'hit') {
  return w.add(new Rider(kind, x, px(tyGround), vx, inset, cause));
}

export function collectible(w: World, kind: ThingKind, tx: number, ty: number) {
  return w.add(new Collectible(kind, tx, ty));
}

/** A hidden checkpoint: after a death past here, Dad comes back here (never shown, never announced). */
export function checkpoint(w: World, tx: number) {
  w.checkpoints.push(px(tx));
  w.checkpoints.sort((a, b) => a - b);
}
