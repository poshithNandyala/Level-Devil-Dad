# TVM · Thiruvananthapuram: the 10-stage pass (notes for MECHANICS / CITIES / WAVE1)

Branch `city/tvm`. The 8 shipped stages keep their ids; 09 and 10 are the encores (allocation v2 slots 9 and 10).
Full report: `ldd-inbox/reports/cities/tvm/EXTEND-2.md`.

## New ideas (for MECHANICS.md)

- **TVM-01, Connemara market (tour bite, B4 `tour-tvm-b4`):** a slab of fish ice bridges a drain; it twitches 16 px as you
  come and two beats later the porter yanks it 3 tiles on, out from under whoever stepped on after the twitch
  (`IceSlab`). Replaces the tour's old ending (the road that opened ahead).
- **TVM-09 Kovalam Flags (`flag-strip-shifts` / `strip-shift`):** the lifeguard's two flags mark the only dry sand when a
  wave runs in; he whistles and carries them somewhere new before every wave (`Surf`). Outside the flags is the drift;
  the strip he has just moved them off is the rip (darker, its own death). Acts `tvm09-vilakku` (back behind you, then far
  on past a rock pool), `tvm09-samudra` (planted, then brought back), `tvm09-pozhikkara` (far on over a pool, then back over
  it), `tvm09-ashoka` (he paces and plants them where they were). Door `tvm-backwash-ride`: open sand with no flags, too
  long to cross between waves; step in as a wave runs back out and the backwash carries you (`Backwash`).
- **TVM-10 Dhara (`pendulum-oil-slick` / `offset-swing`):** dhara pots swing from the beam on crooked arms, so the oil they
  drip at the middle of the swing lands beside the hook, not under it; feet on oil go (you slide, no jump) (`Dhara`,
  troughs `Droni`). The finale calls back TVM's own ideas in a new order, one per act: `tvm10-kizhi` (the tour's full
  tarp: its rain washes the oil off the trough's edge; then TVM-04's coconut for whoever slides to rest under a palm),
  `tvm10-thumba` (the tour's two-stage rocket on flat ground: stop at once, the booster comes down just ahead and the last
  stage where you'd wait), `tvm10-theeram` (TVM-09's flags with a pot's oil inside the strip: stand on its dry edge, jump
  the oil when he brings them back), `tvm10-kadappuram` (the flags under a coconut palm: stand clear of the crown),
  `tvm10-uzhichil` (the room's pots in the other order), `tvm10-thira` (the flags under the tour's full tarp: step up,
  back off, let it empty, then in), `tvm10-chanda` (the tour's fish ice, then oil and a sunk kindi). Door
  `tvm-oily-feet-coir-mat`: oily feet slip back off the polished doorstep into the gutter; walk across the coir mat over
  the first gutter (don't jump it) and it wipes them.

## Keys (all prefixed)

Endings `tvm-knock` (was `knock`), `tvm-backwash-ride`, `tvm-oily-feet-coir-mat`. Causes `tvm-drenched` (was `drenched`),
`tvm-drift`, `tvm-rip`, `tvm-droni`, `tvm-kindi`, `tvm-chaal`. Things `tvm-chaaya`, `tvm-net`, `tvm-parunthu`,
`tvm-snakeboat` (were unprefixed). Acts as listed above.

## Lines

Seventh death: "Ezhu chaaya! Chechi parayunnu: aadyam muthal. | Seven teas! Chechi says: start again." (the chaaya-kada
chechi counting glasses; replaces "Thala for a reason"). `intro` has 10 entries, one per stage (06-08's inline intros
moved into it, same text; 09 "Flag okke chumma, Dad! Neenthi po!", 10 "Enna onnum alla, Dad! Odi chaadu!").

## Numbers

| Stage | Route | Par | Fair q/avg/rel (LDD_N=80) | Worst stretch | Checkpoints |
| --- | --- | --- | --- | --- | --- |
| TVM-01 | 21.0 s | 30 | 100/100/98 | 100 | 3 |
| TVM-02 | 17.1 s | 23 | 100/100/76 | 100 | 1 |
| TVM-03 | 13.1 s | 18 | 100/99/78 | 99 | 1 |
| TVM-04 | 16.2 s | 18 | 100/100/84 | 100 | 1 |
| TVM-05 | 18.2 s | 22 | 100/100/84 | 100 | 1 |
| TVM-06 | 13.0 s | 14 | 100/99/75 | 99 | 1 |
| TVM-07 | 14.6 s | 20 | 100/100/80 | 100 | 2 |
| TVM-08 | 16.1 s | 20 | 100/100/76 | 100 | 1 |
| TVM-09 | 67.4 s | 80 | 100/100/98 | 100 | 4 |
| TVM-10 | 90.7 s | 110 | 100/100/76 | 100 | 9, lives 'act' |

Stage behaviour changed in 02-08: only TVM-03 (the counter's tea glasses slide at 85 px/s, was 100).
