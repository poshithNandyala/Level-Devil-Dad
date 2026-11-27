/** Tara's line for each new death cause ('imp-...'): [what happened, how to beat it]. Law 9: the line names what
 * killed you and never repeats the advice that killed. */
export const causeLines: Record<string, string[]> = {
  // 01 Kangla
  'imp-thong': ['The east gate opened OUT, into you, and then it was barred.', 'That gate is an exit. Take the steps to the rampart and walk over the wall.'],
  'imp-khong': ['The green bank under the rampart was water hyacinth: the moat took you.', 'The real bank is further on. Jump long from the rampart’s edge.'],
  // 02 the net
  'imp-in': ['The net came down exactly where your walk was taking you.', 'He reads your walk when he raises the bundle. Stop then, and go on when it has landed.'],
  'imp-in-leppa': ['You stood still and the net came down on the still man.', 'He reads a stander too. When he raises the bundle, do the other thing: move.'],
  'imp-in-chongba': ['The net landed where your leap would land, and you were in it.', 'He winds up as you take off. Let go of the stick in the air and land short.'],
  // water everywhere
  'imp-ishing': ['Loktak. The water is deep where the mats are not.', 'Watch the mats: where the mat is, you stand; where it is not, you swim once only.'],
};
