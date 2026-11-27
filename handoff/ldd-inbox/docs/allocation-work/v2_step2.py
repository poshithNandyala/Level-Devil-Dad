import json
p='/local/home/saiposh/personal/ldd-inbox/docs/allocation.json'
J=json.load(open(p))
CH=[]  # change log rows: city, slot, old, new, reason
def slot(c,i): return next(s for s in J[c]['slots'] if s['index']==i)
def S(c,i,reason,**kw):
    s=slot(c,i); old=f"{s['concept']} {s['family']} [{', '.join(s['betrayals'])}]"
    s.update(kw); CH.append((c,f"{i:02d}",old,f"{s['concept']} {s['family']} [{', '.join(s['betrayals'])}]",reason))
def enc(c,i,reason,**kw):
    s=slot(c,i); old=f"{s['concept']} {s['family']} [{', '.join(s['betrayals'])}]"
    s.update(kw); CH.append((c,f"{i:02d} (encore)",old,f"{s['concept']} {s['family']} [{', '.join(s['betrayals'])}]",reason))
# --- fix 1/2: pattern-floor and maker-ahead retirements
enc('BPL',9,'1',concept='BPL-09',name='Bhimbetka Shelters',family='rock-shelter-refuge-wave',betrayals=['B13'],
    idea='a rockfall wave runs along the cliff; the rock-shelter overhangs are refuges, and running past the last shelter sends a second wave back the other way (B13)',
    source='WP Bhopal / Bhimbetka rock shelters (UNESCO, 45 km from Bhopal; source check needed; no paintings used as floor)')
enc('GNR',9,'1',concept='GNR-09',name='GIFT City Chutes',family='full-bin-chute-pulls-down',betrayals=['chute-when-full'],
    idea='bin lids are footholds; when a bin\'s fill gauge reaches full the vacuum chute pulls the lid and whatever stands on it down the pipe',
    source='WP GIFT City (automated waste collection; source check needed)')
enc('KVT',9,'2',concept='KVT-09',name='Kalpeni Storm Bank',family='storm-bank-rubble-slides',betrayals=['rubble-slide'],
    idea='the coral-rubble storm bank slides one tile toward the lagoon with every step; climb it on the diagonal, never straight up',
    source='WP Kalpeni (storm bank of coral debris; source check needed)')
S('AGT',3,'2',concept='AGT-F4',name='Kosh (latex cups)',family='latex-cup-tips-when-full',betrayals=['fill-tips'],
  chain='A2 stand on the emptiest cup (fill level visible on every cup); A3 your weight makes the drip run faster, so hop on, never rest',
  closest='`lamp`/B39 -- the fill level is an honest clock on each foothold; nobody walks ahead of you (AGT.md seed 5, rubber plantations)')
S('SML',7,'2 (kept, own-steps rule)',chain='A2 step, step back, step further: snow stepped twice holds, once is soft; A3 the porter\'s track ahead looks packed but was stepped once, pack it again; no sun beat (see conflict 12); hidden checkpoints',
  closest='DMN-07 painted path -- here only YOUR double step makes floor; nothing fades behind you and nobody builds ahead')
# --- fix 5: stand-still-held
S('LEH',1,'5',concept='LEH-F2',name='Julley, Leh! (water turn)',family='water-turn-switches-channel',betrayals=['water-turn','B4'],
  chain='A2 walk the dry field channel; A3 the wooden gate twitches, then turns two beats later and the water comes to your channel (B4), step up on to the bund',
  closest='TVM-02/BOM-04 floods, LEH slot 06 nala -- the level never rises; which channel carries water switches at a visible gate (LEH.md seed 13)')
S('DEL',3,'5',concept='DEL-04',name='Gali Sankri (shutters)',family='gali-stalls-out-in-shutter-order',betrayals=['shutter-stall-out'],
  chain='A2 pass each shop before its shutter is up (shutters rise in a visible order down the lane); A3 the last shop opens from inside, its stall comes out first',
  closest='kit rising walls -- the lane narrows by shop opening order, never because you stand')
# --- fix 7: HWIK repairs
S('AGT',8,'7',chain='A2 march in the ducks\' footprints at duck pace (the column walks round the soft patches of the bund); A3 the last duck steps off at the sluice and its prints end, jump the sluice; tell: footprints on the bund, visible from the start',
  closest='PNJ-08 -- the column\'s own prints are the safe floor; one unknown (soft bund), one move after one death (FRESH: fish farming is in AGT.md; ducks on bunds need a source)')
S('SHL',5,'7',shape='HWIK (long 60-90 s)',family='one-stream-schedule-mark',betrayals=['hidden-schedule'],
  chain='A2 cross the one stream when its bank mark is dry (a white line on the rock shows the dry level); A3 the stream refills two beats after the mark is uncovered, cross on the mark, not after; tell: the mark is drawn from the first frame',
  closest='RNC-07/`khoh` -- one stream, one visible mark; no choice among seven (SHL-10 Seven Sisters)')
S('SVP',8,'7',chain='A2 shelter under the other awnings; A3 first-pass road is a river; tell: before the second monsoon the cloud bank and slanting rain lines show on the opposite horizon, and every awning tilts to the new side',
  closest='--- rain direction as rule; the visual tell is the rain slant and awning tilt, not the replay')
S('DIS',8,'7',chain='A2 follow the flattened strip; A3 second strip other way; tell: engine noise backdrop AND a dust plume rising where the noise is (visual twin)',
  closest='GNR-05 lions -- animal charges at something else; readable muted')
S('DEL',8,'7',chain='A2 read the rhythm, not the loudness: each vehicle\'s indicator blinks in its horn rhythm (visual twin); A3 two vehicles share a code; no guide line (guide never describes an unmet trap); NO fog (GTK owns)',
  closest='BLR-04/TVM-07 -- hazards telegraphed by horn + blink code')
S('SXR',8,'7',chain='A2 count the chant; A3 next row mid-step; tell: the chant AND the talim (the weaver\'s written colour code) hung over each row, readable without sound or Kashmiri',
  closest='PNJ-06/CHP slot 08 -- the rule is the talim the weaver reads')
S('CHH',5,'7',shape='HWIK (long 60-90 s)',family='tara-strides-wrong-unit',betrayals=['unit-trap'],
  chain='A2 Tara says "ten of Tau\'s steps" and you pace your own; A3 Tau\'s stick steps are shorter, pace the foot marks; tell: Tau\'s foot marks in the dust; the guide stays true',
  closest='BPL-06 -- the lie is Tara\'s (only Tara lies); the unit is the trap')
# --- fix 8: finales
S('SML',10,'9',chain='callbacks only: lift door behind (01), roof sheet drip (02), snowball (03), porter niches (04), flock (09); twist: the Gaddi flock (09) comes down the stair-lane the porter fills (04), use his niches',
  closest='(own callbacks) -- twist = SML slot 04 + slot 09')
S('CHP',10,'9',chain='callbacks only: veil, notes, logs, phulkari, churn, barefoot; twist = CHP slot 09 veil (floor hidden when still) + slot 02 barefoot (running hurts): walk, never stop, never run',
  closest='(own callbacks) -- two own ideas combined, no horse/groom door')
S('ITA',10,'9 / 12 (sun)',family='finale-bricks-on-one-lane-bridge',betrayals=['brick-bridge-oncoming'],
  chain='callbacks only: one-lane bridge, bricks, sluice, fruit baskets; twist = ITA slot 02 one-lane bridge + slot 09 pull-brick slump: the oncoming porter carries bricks and the pile slumps into the passing bay',
  closest='(own callbacks) -- no sun line')
S('SHL',10,'9',family='finale-cadence-bridge-day-stalls',betrayals=['stalls-on-swaying-span'],
  chain='callbacks only: knup, root, drip, market, Dawki bridge; twist = SHL slot 03 cadence sway + slot 09 day-cycle stalls: the rest stalls rearrange at each checkpoint on a span that sways to your step',
  closest='(own callbacks) -- RNC-07 no fall rule')
S('BBI',10,'1 / 12',family='finale-pads-onto-plinth',betrayals=['pads-to-plinth'],
  chain='callbacks only: pads, parasols, ikat, plinth hub, troupe; twist = BBI slot 02 keeper pads + slot 09 hub: the keeper\'s pads carry you on to the sliding plinth, step to the hub',
  closest='(own callbacks) -- no soot reveal (BBI slot 08 recast)')
# --- fix 10 / 12: lower-blast pairs
S('KOH',7,'10/12',chain='A2 lean into each bend early, there is no brake; A3 slick hairpin spins you, lean out of it; hidden checkpoints',
  closest='JAI-05/TVM-02, SXR slot 09 -- lean-steer only, no brake (SXR owns brake-only)')
S('BBI',8,'10/12',concept='BBI-F2',name='Pattachitra panels',family='painted-panel-previews-next',betrayals=['preview-panel'],
  chain='A2 read the panel before each room: it shows the room as it was a beat ago; A3 the last panel is painted one beat behind, step where the trap was; tell: every panel framed at the room door',
  closest='AGT slot 06 -- a painted preview that lags, no moving reveal (FRESH: Pattachitra is in BBI.md crafts)')
S('ITA',8,'10/12',concept='ITA-F1',name='Tipi orchids',family='orchid-ledge-opens-by-dew',betrayals=['orchid-dew'],
  chain='A2 land only on ledges with dew drops (dry orchid ledges fold shut); A3 a ledge sheds its dew as you land if you land from height, short hops; tell: dew drawn on every open ledge',
  closest='KOH slot 04 bloom wave -- the ledge opens by dew, nothing is revealed by a moving light (FRESH: Tipi orchid centre)')
S('CHP',4,'10/12',concept='CHP-07',name='Sarson',family='crop-band-hides-furrows',betrayals=['crop-cover'],
  chain='A2 watch the stalks bend where a furrow is; A3 a band of taller stalks hides a second furrow behind the first, hop long; no scarecrow lie',
  closest='TVM-07/kit mist -- cover is a crop band at fixed height (SVP slot 04 owns carry-attracts)')
S('SXR',5,'10/12',concept='SXR-F1',name='Nadru (lotus stems)',shape='HWIK (long 60-90 s)',family='cut-stem-sinks-leaf',betrayals=['cut-stem-sinks'],
  chain='A2 hop leaf to leaf ahead of the harvester\'s boat; A3 a cut leaf floats one beat then sinks, never wait on it; tell: the harvester and his cut stems are on screen from the start',
  closest='IMP slot 09 -- harvest sinks leaves; no decoy twin (FRESH: nadru harvest on the Dal)')
S('GTK',8,'10/12',concept='GTK-F2',name='Ropeway',family='cabins-cross-at-midpoint',betrayals=['cabin-cross'],
  chain='A2 ride the cabin; it is a shuttle that turns back at the middle station; A3 hop to the other cabin only as they pass at mid; tell: two cabins and the middle station visible from the start',
  closest='BOM trains -- cabins swap at mid; no decoy twin (FRESH: Gangtok ropeway)')
enc('RPR',10,'10/12',concept='RPR-10',name='Raut Nacha',family='raut-sticks-clash-high-low',betrayals=['stick-clash'],
    idea='cowherd dancers clash sticks high on one beat and low on the next; the crossed pair is a bar you stand on only on the high beat',
    source='WP Raut Nacha (source check needed)')
enc('HYD',9,'10/12',concept='HYD-09',name='Irani Chai',family='dunked-biscuit-softens-on-count',betrayals=['dunk-soft'],
    idea='Osmania biscuits dunked in the chai are footholds that go soft three beats after they go in; the waiter dunks in a visible order',
    source='WP Hyderabadi cuisine (Irani chai, Osmania biscuit; source check needed)')
enc('RNC',9,'10/12',concept='RNC-09',name='Lac (Namkum)',family='lac-sheet-softens-near-fire',betrayals=['lac-soft'],
    idea='lac sticks laid as a bridge bend under you near the brazier and hold hard away from it; the brazier is carried along the bridge',
    source='WP Ranchi (lac research institute at Namkum; source check needed)')
# --- conflict 12: one sun-direction owner
S('CHH',7,'12',family='buffalo-platforms-sink-on-herder-call',betrayals=['animal-platform-call'],
  chain='A2 cross while the herder boy on the bank is silent; A3 at his two-finger whistle the calf sinks first; hidden checkpoints',
  closest='KVT-08 dolphins -- platforms dip on a visible herder call, not a sun cue')
# --- fix 9: slot 09 tough; HWIK at 05 is long
for c,v in J.items():
    if c=='rules' or v['status']!='new': continue
    for s in v['slots']:
        if s['index']==9 and s['shape']=='marathon':
            s['shape']='tough'; s['chain']=s['chain'].replace('; hidden checkpoints','')+'; tough: 60-90 s, 4-5 beats, 3-4 checkpoints, knowable'
            CH.append((c,'09','shape marathon','shape tough (60-90 s, 4-5 beats, 3-4 checkpoints)','8/9'))
        if s['index']==5 and s['shape']=='HWIK':
            s['shape']='HWIK (long 60-90 s)'
            CH.append((c,'05','shape HWIK','shape HWIK (long 60-90 s)','8/9'))
# reserves that must keep >=2
J['BBI']['reserves']=[r for r in J['BBI']['reserves'] if r['concept']!='BBI-F2']+[{"concept":"BBI-04","name":"Talapatra","family":"stylus-cut-lines-soot","betrayals":["soot-after"],"chain":"A2 follow behind the stylus (reserve only; DDN slot 05 owns reveal-by-weather)","closest":"`invisible` -- reveal after you pass"}]
J['ITA']['reserves']=[r for r in J['ITA']['reserves'] if r['concept']!='ITA-F1']+[{"concept":"ITA-11","name":"Convoy gate","family":"convoy-gate-direction-alternates","betrayals":["direction-gate"],"chain":"A2 go with your direction's convoy; A3 the gate turns mid-convoy","closest":"BLR signals -- direction, not stop/go"}]
J['SXR']['reserves']=[r for r in J['SXR']['reserves'] if r['concept']!='SXR-F1']+[{"concept":"SXR-F2","name":"Hanji houseboat ladder","family":"houseboat-plank-lifts-on-wake","betrayals":["plank-wake"],"chain":"A2 cross the plank between wakes (FRESH)","closest":"KVT-02 jetty planks -- lifted, not broken"}]
J['GTK']['reserves']=[r for r in J['GTK']['reserves'] if r['concept']!='GTK-F2']+[{"concept":"GTK-F3","name":"Prayer-wheel-free MG Marg benches","family":"bench-row-reserved-by-sign","betrayals":["bench-reserved"],"chain":"A2 stand only on benches without the reserved card (FRESH, weak)","closest":"PDY-03 signs -- an honest sign"}]
J['CHP']['reserves']=[r for r in J['CHP']['reserves'] if r['concept']!='CHP-07']+[{"concept":"CHP-F1","name":"Sukhna boat club rails","family":"lake-rail-gap-by-boat-count","betrayals":["rail-count"],"chain":"A2 count the boats out (FRESH)","closest":"KVT boats -- counted, never ridden"}]
J['AGT']['reserves']=J['AGT']['reserves']
J['LEH']['reserves']=J['LEH']['reserves']
json.dump(J,open(p,'w'),indent=1,ensure_ascii=False)
json.dump(CH,open('/local/home/saiposh/personal/ldd-inbox/docs/allocation-work/v2_changes.json','w'),indent=1,ensure_ascii=False)
print(len(CH))
