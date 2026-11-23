import type { DoorDef, RoomDef } from '../types';
import { MUMBAI } from './mumbai';
import { BENGALURU } from './bengaluru';
import { DELHI } from './delhi';

/** the doors in journey order */
export const DOORS: DoorDef[] = [MUMBAI, BENGALURU, DELHI];

export const ROOM_BY_ID: Record<string, RoomDef> = Object.fromEntries(DOORS.flatMap((d) => d.rooms.map((r) => [r.id, r])));

export function doorOf(id: string): DoorDef | undefined {
  return DOORS.find((d) => d.rooms.some((r) => r.id === id));
}
