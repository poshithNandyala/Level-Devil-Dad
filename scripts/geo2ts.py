# Builds src/map/india-data.ts from /home/claude/geo/*.json. Those were made from udit-001/india-maps-data
# (dl/india.geojson, 760 districts) with mapshaper:
#   P='+proj=lcc +lat_1=12.47 +lat_2=35.17 +lat_0=24 +lon_0=80 +datum=WGS84 +units=m'
#   mapshaper dl/india.geojson -clean -dissolve st_nm -proj "$P" -simplify interval=2500 keep-shapes -o states.json format=geojson
#   mapshaper dl/india.geojson -clean -dissolve -proj "$P" -simplify interval=2500 keep-shapes -o outline.json format=geojson
#   mapshaper cities_pts.geojson -proj "$P" -o cities_proj.json format=geojson
# Usage: python3 scripts/geo2ts.py src/map/india-data.ts
import json, sys
st = json.load(open('/home/claude/geo/states.json'))
ol = json.load(open('/home/claude/geo/outline.json'))
cp = json.load(open('/home/claude/geo/cities_proj.json'))
xs=[];ys=[]
def walk(c, f):
    if isinstance(c[0], (int,float)): f(c)
    else:
        for x in c: walk(x, f)
OLG = ol.get('geometries') or [f['geometry'] for f in ol['features']]
for g_ in OLG: walk(g_['coordinates'], lambda p: (xs.append(p[0]), ys.append(p[1])))
minx,maxx,miny,maxy=min(xs),max(xs),min(ys),max(ys)
W=1000.0; s=W/(maxx-minx); H=(maxy-miny)*s
pad=20
def tr(p): return ((p[0]-minx)*s+pad, (maxy-p[1])*s+pad)
def ring_d(ring):
    pts=[tr(p) for p in ring]
    # drop consecutive duplicates after rounding
    out=[]; last=None
    for x,y in pts:
        q=(round(x,1), round(y,1))
        if q!=last: out.append(q); last=q
    if len(out)<3: return ''
    d=f"M{out[0][0]:g} {out[0][1]:g}"
    px,py=out[0]
    for x,y in out[1:]:
        dx=round(x-px,1); dy=round(y-py,1)
        d+=f"l{dx:g} {dy:g}"
        px,py=px+dx,py+dy
    return d+"z"
def grow(ring, k):
    # tiny islands (Lakshadweep) are drawn a few times bigger, or they vanish at this scale
    cx=sum(p[0] for p in ring)/len(ring); cy=sum(p[1] for p in ring)/len(ring)
    return [[cx+(p[0]-cx)*k, cy+(p[1]-cy)*k] for p in ring]
def geom_d(g, k=1):
    polys = g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
    return ''.join(ring_d(grow(r, k) if k != 1 else r) for poly in polys for r in poly)
states=[]
for ft in st['features']:
    nm=ft['properties']['st_nm']
    states.append({'name':nm,'d':geom_d(ft['geometry'], 3.0 if nm=='Lakshadweep' else 1)})
outline=''.join(geom_d(g_) for g_ in OLG)
# the outline gets the grown Lakshadweep too
lk=[ft for ft in st['features'] if ft['properties']['st_nm']=='Lakshadweep']
outline+=''.join(geom_d(ft['geometry'], 3.0) for ft in lk)
cities={ft['properties']['id']: [round(v,1) for v in tr(ft['geometry']['coordinates'])] for ft in cp['features']}
vb=[0,0,round(W+2*pad),round(H+2*pad)]
ts = "// Generated from udit-001/india-maps-data (district boundaries dissolved to states with mapshaper,\n// simplified at a 2.5 km interval), Lambert conformal conic projection. Do not edit by hand: see scripts/geo2ts.py.\n"
ts += f"export const MAP_VIEWBOX = {json.dumps(vb)} as const;\n"
ts += f"export const MAP_OUTLINE = {json.dumps(outline)};\n"
ts += "export const MAP_STATES: { name: string; d: string }[] = " + json.dumps(states, ensure_ascii=False) + ";\n"
ts += "export const MAP_CITY_XY: Record<string, [number, number]> = " + json.dumps(cities) + ";\n"
open(sys.argv[1],'w').write(ts)
print('viewBox', vb, 'states', len(states), 'bytes', len(ts))
svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{" ".join(map(str,vb))}" width="{vb[2]}" height="{vb[3]}"><rect width="100%" height="100%" fill="#bfe3f2"/>'
for s_ in states: svg+=f'<path d="{s_["d"]}" fill="#f6e7c8" stroke="#a07a4a" stroke-width="1.2"/>'
svg+=f'<path d="{outline}" fill="none" stroke="#5a3d22" stroke-width="2.5"/>'
for k,(x,y) in cities.items(): svg+=f'<circle cx="{x}" cy="{y}" r="5" fill="#d33"/><text x="{x+7}" y="{y+4}" font-size="14" font-family="sans-serif">{k}</text>'
svg+='</svg>'
open('/home/claude/geo/preview.svg','w').write(svg)
