/** Tara's line for each new death cause ('imp-...'): [what happened, how to beat it]. Law 9: the line names what
 * killed you and never repeats the advice that killed. */
export const causeLines: Record<string, string[]> = {
  // 01 Kangla
  'imp-thong': ['The east gate opened OUT, into you, and then it was barred.', 'That gate is an exit. Jump up to the rampart and walk over the wall.'],
  'imp-khong': ['The green bank under the rampart was water hyacinth: the moat took you.', 'The real bank is further on. Jump long from the rampart’s edge.'],
  // 02 the net
  'imp-in': ['The net came down exactly where your walk was taking you.', 'He reads your walk when he raises the bundle. Stop then, and go on when it has landed.'],
  'imp-in-leppa': ['You stood still and the net came down on the still man.', 'He reads a stander too. When he raises the bundle, do the other thing: move.'],
  'imp-in-chongba': ['The net landed where your leap would land, and you were in it.', 'He winds up as you take off. Let go of the stick in the air and land short.'],
  // 03 Samban Lei
  'imp-shear': ['The upper blade: you were on the tier above the gardener.', 'His own tier is the one his shears never cut. Be level with him.'],
  'imp-shear-makha': ['The lower blade: you waited on the tier below him.', 'Below him is cut too. Step up on to his tier, or keep two tiers between you.'],
  // 04 Thambal
  'imp-dew': ['The dew rolled across the leaf into you: you landed on the empty half.', 'Land on the half the dew is on, inside the beads; it rolls off away from you.'],
  'imp-dew-rim': ['You landed at the rim beyond the dew, and it rolled over you on its way off.', 'Inside the beads, between them and the centre, is the place.'],
  'imp-dew-ani': ['That leaf had dew at both rims: one side always rolls into you.', 'A leaf with dew at both rims is not landed on. Jump it from the leaf before.'],
  // 05 the dock
  'imp-ishing': ['Loktak. The water is deep where the mats are not.', 'Watch the mats: where the mat is, you stand; where it is not, you swim once only.'],
  'imp-lurch': ['A mat clicked in and the whole mat lurched: you were at the far end.', 'Read the wakes: stand at the seam that closes next, not at the end away from it.'],
  // 06 the deer
  'imp-phum': ['Bare mat: it tore under you.', 'Only the patches with reeds are thick enough. Hop reed patch to reed patch.'],
  'imp-chong': ['The deer leapt that; you cannot. Straight on is the lie.', 'Take the reed hummock above the line and come down beyond the gap.'],
  // 07 the monsoon mat
  'imp-branch': ['The branch over the water took your head: you were on the back half of the mat.', 'A drifting mat dips at its front. Ride the front half and the branch passes over you.'],
  'imp-tilt': ['The mat grounded on the shoal and its back end went under, with you on it.', 'When it grounds the back dips: be at the front, and hop the last gap.'],
  // 08 the market
  'imp-shutter': ['You stepped on a cheaper stall after a dearer one: the mother shut her shutter on you.', 'Cheapest first: step on the stalls in rising price. Jump over any that breaks the order.'],
  'imp-nala': ['The drain between the stalls.', 'Stall to stall: never the aisle.'],
  // 09 the pony
  'imp-kangjei': ['The ball rolled up from behind and took you standing.', 'A standing pony is a target. Rest only right after a ball has gone by.'],
  'imp-kangjei-wa': ['The pony ran out of breath and stood, and the ball came.', 'Gallop firm ground, cross soft ground with the bar high, and rest after each ball passes.'],
  // 10 dusk
  'imp-phum-lei': ['Dusk: the reeds stood on drifted debris and tore under you.', 'Tonight the bare mat holds and the reeds do not. Walk the bare mat and jump the reeds.'],
  'imp-dew-lei': ['A dry leaf: no dew to roll, and it tipped you off its rim.', 'With the dew gone, the centre of the leaf is the place to land.'],
  'imp-lurch-lei': ['The dusk mat rode up over the seam, and you were standing on it.', 'At dusk the seam throws and the far end carries: stand at the far end for the click.'],
};
