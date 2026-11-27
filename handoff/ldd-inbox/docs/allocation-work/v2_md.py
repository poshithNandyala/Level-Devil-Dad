import json,re
D='/local/home/saiposh/personal/ldd-inbox/docs/'
J=json.load(open(D+'allocation.json')); V1=json.load(open(D+'allocation-work/allocation.v1.json')); md=open(D+'allocation-work/ALLOCATION.v1.md').read().split('\n')
F={}  # family -> F number from v1
for l in md:
    for m in re.finditer(r'F(\d{3}) ([a-z0-9-]+)',l): F.setdefault(m.group(2),int(m.group(1)))
nxt=[max(F.values())+1]; NEW=[]
def fn(fam,c,where):
    if fam not in F: F[fam]=nxt[0]; nxt[0]+=1; NEW.append((F[fam],fam,c,where))
    return f"F{F[fam]:03d} {fam}"
def row(c,s,label,concept):
    return f"| {label} | {concept} | {fn(s['family'],c,label)} | {', '.join(s['betrayals'])} | {s.get('shape','reserve')} | {s['chain']} | {s['closest'].replace(' -- ',': ')} |"
out=[]; city=None
for l in md:
    m=re.match(r'\*\*([A-Z]{3})(\*\*| · )',l)
    if m: city=m.group(1)
    r=re.match(r'\| (\d\d|R[12]) \| ',l)
    if city and r and J[city]['status']=='new':
        lab=r.group(1)
        if lab.startswith('R'):
            res=J[city]['reserves']; k=int(lab[1])-1
            if res[k]==V1[city]['reserves'][k] and len(res)==2: out.append(l); continue
            s=res[k]; out.append(row(city,dict(s,shape='reserve'),lab,f"{s['concept']} {s['name']}"))
            if lab=='R2':
                for k2,s2 in enumerate(res[2:],3): out.append(row(city,dict(s2,shape='reserve'),f'R{k2}',f"{s2['concept']} {s2['name']}"))
        else:
            s=next(x for x in J[city]['slots'] if x['index']==int(lab))
            o=next(x for x in V1[city]['slots'] if x['index']==int(lab))
            if o==s:
                out.append(l)  # unchanged row
            else: out.append(row(city,s,lab,s['concept']))
        continue
    e=re.match(r'- (09|10) ([A-Z]{3})-\d\d ',l)
    if e and city==e.group(2):
        s=next(x for x in J[city]['slots'] if x['index']==int(e.group(1)))
        if s['family'] not in l:
            l=f"- {e.group(1)} {s['concept']} {s['name']} · {fn(s['family'],city,e.group(1))} / {', '.join(s['betrayals'])}: {s['idea']}. [{s['source']}] (v2)"
    out.append(l)
open(D+'allocation-work/ALLOCATION.v2.body.md','w').write('\n'.join(out))
json.dump(NEW,open(D+'allocation-work/v2_newfams.json','w'),indent=1)
print(len(NEW),'new families', nxt[0]-1)
