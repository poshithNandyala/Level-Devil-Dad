import json
p='/local/home/saiposh/personal/ldd-inbox/docs/allocation.json'; cp='/local/home/saiposh/personal/ldd-inbox/docs/allocation-work/v2_changes.json'
J=json.load(open(p)); CH=json.load(open(cp)); V1=json.load(open('/local/home/saiposh/personal/ldd-inbox/docs/allocation-work/allocation.v1.json'))
def slot(c,i): return next(s for s in J[c]['slots'] if s['index']==i)
def redo(c,i,reason,**kw):
    s=slot(c,i); o=next(x for x in V1[c]['slots'] if x['index']==i)
    for k in ['concept','name','family','betrayals','chain','closest']: s.pop(k,None)
    s.update(kw)
    old=f"{o['concept']} {o['family']} [{', '.join(o['betrayals'])}]"
    new=f"{s['concept']} {s['family']} [{', '.join(s['betrayals'])}]"
    CH[:]=[r for r in CH if not (r[0]==c and r[1]==f'{i:02d}')]
    CH.append([c,f'{i:02d}',old,new,reason])
redo('BBI',8,'10/12',concept='BBI-F3',name='Pakhala',family='pakhala-pour-floats-grains',betrayals=['pour-floats'],
  chain='A2 the settled rice in the bowl is floor until the water is poured, then the grains float apart; stand on the badi (fried lump) before the jug tips; A3 the second pour comes from the other rim, the badi drifts, hop to the next one; tell: the jug at the rim, tilting, from the first frame',
  closest='floods (TVM-02), RPR-04 rice hills -- one visible pour floats the floor apart; no moving reveal (BBI.md street food: pakhala)')
redo('ITA',8,'10/12',concept='ITA-10',name='Siang raft',family='raft-poles-spread-under-weight',betrayals=['poles-spread'],
  chain='A2 stand across the poles, never along one: along one the lashing gives and the poles spread apart; A3 the last raft has one loose lashing, cross it in one hop; tell: lashings drawn on every raft, the loose one frayed',
  closest='PAT slot 05 pontoon sinks under load -- here the floor splits sideways, nothing sinks or tilts (ITA.md concept 10, the bible\'s own HWIK)')
J['BBI']['reserves']=[r for r in J['BBI']['reserves'] if r['concept']!='BBI-F2']+[r for r in V1['BBI']['reserves'] if r['concept']=='BBI-F2']
J['ITA']['reserves']=[r for r in V1['ITA']['reserves']]+[r for r in J['ITA']['reserves'] if r['concept']=='ITA-11']
json.dump(J,open(p,'w'),indent=1,ensure_ascii=False); json.dump(CH,open(cp,'w'),indent=1,ensure_ascii=False)
