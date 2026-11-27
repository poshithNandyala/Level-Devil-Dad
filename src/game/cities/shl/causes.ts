/**
 * Tara's line for each death cause ('shl-...'): [what happened, how to beat it]. Law 9: one id and one line per
 * place; the how-to half never tells the player to do the thing that just killed them; SHL-10's places have their
 * own ids, never a callback's home-stage line.
 */
export const causeLines: Record<string, string[]> = {
  // 01 the tour, and the room of 04 (rain under the cloud)
  'shl-slap': ['The rain came down on you.', 'Rain falls only under the cloud shape, on a beat: run under it right after it has emptied. With a knup on, rain is nothing.'],
  'shl-lyoh': ['The cloud drifted over you while you stood waiting.', 'In Shillong the rain comes to whoever waits. Don’t stand near the cloud: pass under it right after it has emptied.'],
  // 02 Pine Peak
  'shl-edge': ['You stepped on the thin end of the cloud bank.', 'The two ends of a bank are thin whatever the light does. Step only where a beam lights the thick middle.'],
  'shl-dum': ['The cloud had no light on it there, and it did not hold.', 'The cloud is a floor only where a sunbeam lights its thick middle. Wait on a lit beam until the next one is lit, then jump.'],
  'shl-pit': ['You went down into the gap with no cloud under you.', 'Wait on the bank until a cloud bank’s thick middle is under the first beam, then hop on.'],
  // 03 Sway
  'shl-sway': ['The deck swung you off into the Umngot.', 'The swing is your own running. Walk the deck in short bursts: a few steps, a stop, a few steps.'],
  'shl-wake': ['The boat’s wake added a swing, and the deck threw you.', 'When a boat is coming under the span, stand on the tower, not on the deck. Cross after its wake.'],
  'shl-slip': ['You slid on the wet planks, and the slide swung the deck until it threw you.', 'On wet planks a stop is not a stop at once: you slide on. Stop earlier, stand longer, then the next burst.'],
  'shl-dawki': ['You slid off the end of the wet span into the Umngot.', 'On the wet span the slide carries you a step on: make your last stop a whole stride before the tower, not at its edge.'],
  // 04 Knup
  'shl-dieng': ['The branch caught your knup.', 'The knup stands high and wide over your head. Jump at the hook before the branch to hang it up, and take it again after.'],
  'shl-drip': ['The awning’s drips hit your bare head.', 'Those drips are a spike row to a bare head. Jump at the hook before the awning to put the knup on.'],
  'shl-khynnah': ['The small knup is not a knup for heavy rain: it soaked you through.', 'The small one fits the low arch and keeps off drips, nothing more. Swap back to a big knup at the hook before the rain.'],
  'shl-lintel': ['The school lane’s low lintel caught your big knup.', 'Only the small knup fits that lane: swap at the hook before it, and swap back after.'],
  // 05 Seven Sisters
  'shl-um': ['You walked into the fall while it was pouring.', 'Full and thinning both kill. Wait for the water to sit on the white mark on the rock, then cross.'],
  'shl-wah': ['You went in while it was dry, and the fall came back on you.', 'The dry moment is the lure: the water returns with no warning. Cross when it sits on the mark, not after.'],
  'shl-pung': ['The basin flooded with you in it.', 'The basin floods whenever either sister is full or thinning. Cross it only when both sit on their marks, and go at once.'],
  'shl-basin-far': ['The far sister came back on you as you reached her.', 'She comes back first. Step into the basin the moment both sit on their marks, and go through her without a stop.'],
  // 06 Root Guide
  'shl-gorge': ['Into the gorge: no root reached the far side there.', 'Only the long guide’s root, grown from up on the rock, lands on the far rock: the short one lands in the spray and the middle one gives up half way. Climb the rock and jump at the long guide.'],
  'shl-spray': ['The spray at the low landing took you.', 'The short root lands in the spray. Climb the rock and take the long guide: its root lands dry on the far rock.'],
  'shl-jri': ['The guide you walked into grew a root straight across the path, into you.', 'A standing guide in the path grows a root across it the moment you touch it. Hop over that one.'],
  'shl-jri-hang': ['You hopped into the hanging guide, and its root grew straight down on to you.', 'A hanging guide grows its root downwards. Walk under it; it hangs at jump height, so a walker never touches it.'],
  'shl-double': ['Into the gorge: the near root stops half way, and no far root had met it.', 'This gorge takes two roots. Grow the near guide’s first, walk to its tip, jump at the far guide from there, and wait for its root before you step on.'],
  'shl-double-high': ['Taken out of order, the near root grew at head height, into your path.', 'The far guide first makes the near root grow high. Grow the near root first, walk to its tip, then jump at the far guide.'],
  // 07 Mawsmai
  'shl-maw': ['The stalactite came down to its stump with you under it.', 'Every drip is a step down. Count them: pass while there is room, or wait for it to meet the floor and break.'],
  'shl-shut': ['You walked into a stalactite that had met its stump.', 'A shut one is a wall for a moment, then it breaks and starts again from the top: wait for the break.'],
  'shl-krem-maw': ['One of the gallery’s seven came down with you under it.', 'The seven drip together, so they shut together. Wait at the mouth for the row’s break, then run the whole gallery in one go: a stop under any of them is too long.'],
  'shl-krem-shut': ['You ran into the gallery while its row was shut.', 'The seven shut together and break together. Wait at the mouth until the row breaks, then run it in one go.'],
  'shl-stump': ['The frozen stalactite’s stump grew up and shut the pair on you.', 'A bump freezes only the top; the stump keeps rising. Bump, then go through at once.'],
  // 08 Wettest Desert
  'shl-soaked': ['Sohra’s rain soaked you through: the cloud follows whoever is under its reach.', 'The tank fills only while the rain falls into its gutter. Where there is a spot out of the cloud’s reach, stand there; where there is none, stand under the tank’s roof. Let the gauge fill.'],
  'shl-leak': ['You stood under the hole in the roof.', 'The roof keeps you dry and feeds the tank, except under its hole: stand under the whole part, well in from the edge.'],
  'shl-runoff': ['The roof’s edge shed its sheet on to you.', 'While rain is on the roof, its lower edge pours: stand well in under the roof, between the hole and the edge.'],
  'shl-spout': ['The spout poured across the path as the tank filled.', 'When the gauge fills the spout runs for a moment: let it finish before you walk through the gate.'],
  // 09 Eight-Day Market
  'shl-nala': ['Into the market drain.', 'The counters stand over the drain: hop on at the row’s start and off at its end.'],
  'shl-closed': ['That stall is closed today: a cloth over a frame, no boards.', 'Every stall’s plate is the day it is closed. The board at the arch is the day: jump the stall whose plate is today.'],
  'shl-kot-two': ['The board was blank, but the arch was still a day: it is day two, and that stall is shut.', 'A blank board changes nothing: every arch you pass is a day. Count the arches since the last board, and jump the plate that matches your count.'],
  'shl-kot-three': ['Two blank arches, two days: it is day three, and that stall is shut.', 'Count every arch, blank or not. Two arches past the last board is day three: jump plate three.'],
  'shl-shift': ['The day turned at the arch in the middle of the row, and that stall closed.', 'Each arch is a new day, even one standing in a row. Beyond it, read the plates with the next day in mind.'],
  'shl-sluice': ['Into the drain: the holiday was over at the arch, and the sluice is open again.', 'The bed is dry only on the holiday. Past the next arch the water is back: hop on to the counters again.'],
  'shl-two-gates': ['Two arches side by side are two days: that stall is shut.', 'A double arch turns the day twice. Count both, and jump the plate two days on.'],
  // 10 Down Seven Hundred: every place its own line
  'shl-truedrop': ['This time the drop told the truth: the rain came down just past it.', 'A lone drop by the pine here means rain a moment later, just ahead of it. Stop at the drop, go when the rain ends.'],
  'shl-drop-cloud': ['You stopped at the drop and kept standing there: the cloud that formed came to you.', 'Stop at the drop, and go the moment the rain ends. The cloud that is left drifts to whoever stays.'],
  'shl-drizzle-hook': ['You took the knup at the first hook, and the low arch caught it.', 'This rain is a drizzle, and a bare head is fine in it. Leave the knup on the first hook and walk under the arch; the second hook is the one to take.'],
  'shl-awning-bare': ['The awning’s drips hit your bare head.', 'The drizzle was nothing, but the awning’s drips are a spike row: take the knup at the second hook, the one past the low arch.'],
  'shl-liar': ['Her mark lies: it was painted too high, and the sheet under it was still full.', 'Read the sheet, not the paint: cross her only when the sheet is a narrow thread, with time in hand.'],
  'shl-liar-dry': ['You waited for her dry moment, and she came back on you.', 'Her dry moment is the lure every sister keeps, and her mark is paint. Cross her only when the sheet is a narrow thread.'],
  'shl-far-head': ['The hanging guide’s root grew along the path at your height, straight through you.', 'The guide on your own bank is the wrong one here. Walk under it and jump at the pole from the far bank: that root grows at your feet.'],
  'shl-far-gorge': ['Into the gorge: no root had grown from the far side.', 'Jump at the tip of the pole that leans across from the far bank, then wait: its root grows from over there and lands at your feet.'],
  'shl-khlem': ['That counter had nobody behind it: a cloth over a frame, whatever its plate said.', 'On the span the plates mean nothing. The keepers move one stall along at every arch: stand at the arch until they have settled, then jump the counter with no one behind it.'],
  'shl-lurch': ['The keepers’ walk lurched the deck while you were moving on it, and it threw you.', 'The bell at the arch means the keepers are moving. Stand still until they are behind their counters again, then read the row.'],
};
