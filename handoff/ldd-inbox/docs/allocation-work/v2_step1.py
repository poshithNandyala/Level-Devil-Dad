import json
p='/local/home/saiposh/personal/ldd-inbox/docs/allocation.json'
J=json.load(open(p))
def slot(c,i): return next(s for s in J[c]['slots'] if s['index']==i)
def setslot(c,i,**kw):
    s=slot(c,i); s.update(kw); return s
# PAT
setslot('PAT',1, chain="A2 kerb when horn sounds; A3 wait behind the tempo; the surge carries you at most under one screen back",
        closest="BOM-03 shove-out -- crowd moves along the street and you sidestep; carry capped under one screen (v2, review 10)")
setslot('PAT',3, concept="PAT-F2", name="Ashok Rajpath (coaching hoardings)", family="hoarding-swap-at-class-bell",
        betrayals=["B8","banner-swap-width"],
        chain="A2 at the class bell stand on the hoarding whose rolled-up replacement above it is wider; A3 the new batch banner is narrower than the old (B8), step off to the next before it is pulled taut",
        closest="B8 shrinking supports (FREE) / PDY-03 signs act -- floor width is the banner printed above, swapped on a bell that never moves Dad (not TVM-02)")
setslot('PAT',6, family="setu-joint-missing-plate", betrayals=["missing-plate"],
        chain="A2 count the expansion plates, the joint with no plate drops you; A3 the missing plate is the one after the truck (the bob is flavour only)",
        closest="CHN-08 lifting bridge -- a counted gap, not a tilt by weight (v2, review 6)")
setslot('PAT',7, betrayals=["lean-balance","parked-gap-closes"],
        chain="A2 stand road side; A3 the gap between two parked tempos closes when a third backs in, cross before its reverse light; hidden checkpoints",
        closest="TVM-02 bus bells -- no conductor signal; tilt follows where riders stand, parked tempos close the gap (v2, review 4)")
setslot('PAT',8, concept="PAT-11", name="Nalanda", family="count-bricks-routes-cells", betrayals=["count-routing"],
        chain="A2 count the bricks over each cell door, N bricks puts you out N cells along; A3 zero bricks is the door; tell: brick count drawn over every door, one rule, one death",
        closest="`invisible`/`fakewin` -- counting rule, no pick-the-door (was PAT R1; v2 replaces Sattu, review 3/7)")
setslot('PAT',10, family="finale-setu-plate-count", betrayals=["plate-count-under-cart"],
        chain="callbacks only: setu joints (plate count), pontoon cart, Golghar stairs, tempo; twist: the plate count from slot 06 is read while riding the pontoon cart",
        closest="(own callbacks) -- twist combines PAT slot 06 plate count + slot 05 pontoon (v2, review 9)")
J['PAT']['reserves']=[r for r in J['PAT']['reserves'] if r['concept']!='PAT-11']
J['PAT']['reserves'].insert(0,{"concept":"PAT-F3","name":"Agam Kuan (the well)","family":"well-returns-what-falls","betrayals":["returns-later"],
  "chain":"A2 what drops into the well comes back up later as a step; A3 the bucket you dropped comes up under the ledge you jump from (FRESH, Agam Kuan lore unverified)",
  "closest":"RNC-02 dhuska come up -- delayed return of what you dropped"})
# LKO
setslot('LKO',1, concept="LKO-F1", name="Aadaab Lucknow (Chowk cloth bolts)", family="sold-bolt-hooked-out-sideways",
        betrayals=["B3","bolt-unrolls-curtain"],
        chain="A2 the shopkeeper's bamboo hook rises to the bolt before it is pulled, hop off when the hook touches; A3 the pulled bolt unrolls down across the lane, pass under it before its end reaches the floor",
        closest="CCU slot 04 stack-pulled-from-bottom -- here the bolt slides out sideways on a visible hook (B3), no customer choice, no height drop; never needs standing still")
setslot('LKO',3, chain="A2 cross on white; FIX second wash takes jali; A3 cross on solid stitch (v2: no stitcher-ahead act)")
setslot('LKO',4, chain="A2 shady side first; FIX tray lid lets sun in; A3 follow the shadow line: the rule is the DIRECTION the light comes from, not melt over time",
        closest="DMN-03 melting ice -- driven by light direction not time (LKO is the only sun-direction owner)")
# CCU
setslot('CCU',3, concept="CCU-F2", name="Jhalmuri (the shaken tin)", family="shake-tin-sorts-big-pieces-up",
        betrayals=["shake-sorts-up","B35"],
        chain="A2 stand on the peanuts: each shake of the tin lifts big pieces and sinks the puffed rice; A3 a green chilli (big, spiky) rises where you landed after the second shake, step to the next peanut (B35); Dad never eats",
        closest="GNR-08 platforms that rise when you jump -- here the vendor's shake (tin tilts first) sorts by size; no feeding, no pause")
setslot('CCU',5, concept="CCU-05", name="Kumartuli", family="painted-figure-carried-out",
        betrayals=["paint-done-departs","dry-cracks-from-height"],
        chain="A2 stand on figures the paint line has not passed the waist of; when the paint reaches the crown the figure is carried out of the lane; A3 a dry pale layer cracks if you land on it from a height, hop down short",
        closest="B6 scaffold with a deadline / `lamp` -- the visible paint line on the figure itself is the timer; no straw-is-air, nobody builds ahead (generic figures, no deities)")
json.dump(J,open(p,'w'),indent=1,ensure_ascii=False)
