// Sri Vijaya Puram's doors for 05, 06, 07 and 09 are plain doors. Round 5 tried four ideas for them (a sleeping turtle, a
// wasps' nest, a harbour bell, a high wall) and the registry matched each one (PDY-06, BLR-05, a lock with no wrong answer,
// TVM-08), and no unbuilt candidate of SVP-IDEAS-2 or free archetype passed the gate for these stages. An honest plain door:
// the road ends at the door and the door is the way out. (The ending ids stay so the allocation does not move.)
import type { Ending } from '../../levels/endkit';

const plain = (advice: string): Ending => ({ space: 9, advice, build() {} });

export const noteDoor = plain('The door is at the end of the beach road: just a door. Walk in.');
export const boughDoor = plain('The door is at the end of the creek bank: just a door. Walk in.');
export const ticketWindow = plain('The ticket window is open at the end of the pier: just a window. Walk up to it.');
export const frameDoor = plain('The door stands in the old doorframe at the end of the roots: just a door. Walk in.');
