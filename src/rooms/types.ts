import type { CityId } from '../game/constants';
import type { LevelDef } from '../game/world';

export type DoorId = 'mum' | 'blr' | 'del';

/** a stretch of input: hold a direction for `ticks` (120 a second), pressing jump on its first tick if `jump` */
export type Seg = [move: '' | 'L' | 'R', ticks: number, jump?: 1];

export interface RoomDef extends LevelDef {
  room: true;
  door: DoorId;
  /** 1..5 within the door */
  n: number;
  /** how a calm player who knows the trick clears it (the tests, and the hint ghost) */
  solution: Seg[];
  /** what a first-timer does (hold right, jump what looks jumpable): it must die */
  natural: Seg[];
  /** the obvious correction after the first death (dies in at least half the rooms) */
  fix?: Seg[];
  /** true when the obvious fix is meant to work (the room has one trick, not two) */
  fixWins?: boolean;
}

export interface DoorDef {
  id: DoorId;
  /** the city, as shown on the map */
  city: string;
  /** the engine's city for music and the like (the new game draws its own art) */
  cityId: CityId;
  /** where it sits on the journey map (a MAP_CITY_XY key) */
  pin: string;
  /** what Dad is late for: the exit of every room in this door */
  ride: 'train' | 'auto' | 'metro';
  rooms: RoomDef[];
}
