#!/usr/bin/env python3
"""V197 — THE BIOMES OF LUMINAR.  python3 tools/biomes.py   (runs tools/stormgate.py first, then works on data/built/head.js)

The realm is divided into broad countries with soft, wandering borders, each grown out from the towns and a few wild
anchors:  0 meadow · 1 forest · 2 desert · 3 ash · 4 alpine · 5 marsh · 6 coast · 7 highland · 8 scorched · 9 farmland
The map is stored at half resolution in WORLD_DATA.bio (base64, (W/2+1)×(H/2+1) bytes); the engine (world.js) colours
the ground, picks the trees, the weather and the place-names from it, and WORLD_DATA.bioAnchors add their own hills.
The tiles are dressed to suit: the desert and the ash lose most of their woods, the forest and the highlands gain trees
and crags (never near a road, a building, a sign or anybody's post, and never so as to cut off ground that could be
reached before), the meadows and farmland gain drifts of flowers.
"""
import json, base64, os, subprocess, sys, re
from collections import deque
import numpy as np
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); HEAD=os.path.join(ROOT,'data','built','head.js')
subprocess.check_call([sys.executable,os.path.join(ROOT,'tools','grow.py')])   # V198: grow.py runs stormgate.py first
src=open(HEAD,encoding='utf-8').read()
def const(name):
    i=src.index('const '+name+'='); j=src.index('\n',i); s=src[i+len(name)+7:j]; return i,j,json.loads(s[:-1] if s.endswith(';') else s),s.endswith(';')
i,j,WD,semi=const('WORLD_DATA'); W,H=WD['W'],WD['H']; N=W*H; raw=bytearray(base64.b64decode(WD['raw']))
MEADOW,FOREST,DESERT,ASH,ALPINE,MARSH,COAST,HIGHLAND,SCORCHED,FARM=range(10)
# kind, x, y, radius, strength — the towns first, then the wild anchors (the old sand and ash patches, the ranges, the deep woods)
ANCH=[(FARM,33,22,54,1.0),(FARM,26,226,36,1.0),(HIGHLAND,31,103,50,1.0),(COAST,33,330,46,1.0),(FOREST,131,237,52,1.0),(DESERT,132,109,56,1.05),
      (ALPINE,233,108,54,1.0),(ASH,238,230,50,1.0),(COAST,252,333,44,0.9),(MARSH,337,227,46,1.0),(SCORCHED,345,19,44,1.0),
      (DESERT,132,150,34,0.9),(DESERT,96,70,30,0.8),(ASH,238,196,30,0.85),(ALPINE,135,394,38,1.0),(ALPINE,335,120,58,1.0),(ALPINE,290,70,40,0.9),
      (FOREST,80,180,40,0.9),(FOREST,185,290,36,0.85),(FOREST,90,265,30,0.8),(HIGHLAND,75,60,36,0.8),(MARSH,300,275,30,0.8),(MEADOW,185,170,40,0.75),(MEADOW,80,300,34,0.7),(MEADOW,190,40,40,0.7)]
# V198: the anchors are given in the V197 realm's tiles; on the grown island they move with the land and reach further
G=const('STRETCH')[2].get('grow')
if G:
    gx=lambda x: x+sum(n for p,n in G['x'] if x>=p); gy=lambda y: y+sum(n for p,n in G['y'] if y>=p)
    ANCH=[(k,gx(x),gy(y),R*1.75,s) for k,x,y,R,s in ANCH]
    # and the new country between them gets countries of its own
    ANCH+=[(FOREST,165,150,46,0.85),(MEADOW,175,370,50,0.8),(HIGHLAND,170,560,44,0.8),(FOREST,360,620,50,0.85),(MEADOW,360,360,56,0.75),(DESERT,350,150,44,0.85),
           (MARSH,560,580,44,0.8),(HIGHLAND,560,360,46,0.85),(ALPINE,560,120,56,0.95),(FOREST,120,750,40,0.8),(COAST,600,700,44,0.8),(FARM,250,700,40,0.8),(SCORCHED,700,140,34,0.8)]
rng=np.random.default_rng(197)
def noise(w,h,cell):
    gw,gh=w//cell+3,h//cell+3; g=rng.random((gh,gw)); ys,xs=np.mgrid[0:h,0:w]; fx,fy=xs/cell,ys/cell; ix,iy=fx.astype(int),fy.astype(int); u,v=fx-ix,fy-iy; u=u*u*(3-2*u); v=v*v*(3-2*v)
    return (g[iy,ix]*(1-u)+g[iy,ix+1]*u)*(1-v)+(g[iy+1,ix]*(1-u)+g[iy+1,ix+1]*u)*v
def fbm(w,h,cell): return noise(w,h,cell)*0.6+noise(w,h,max(2,cell//2))*0.28+noise(w,h,max(2,cell//4))*0.12
ys,xs=np.mgrid[0:H,0:W].astype(float); wx=xs+(fbm(W,H,52)-0.5)*70; wy=ys+(fbm(W,H,52)-0.5)*70       # the borders wander
score=np.full((10,H,W),-1.0); score[MEADOW]=0.24
for k,ax,ay,R,s in ANCH: score[k]=np.maximum(score[k],s*np.exp(-((wx-ax)**2+(wy-ay)**2)/(R*R)))
BIO=score.argmax(0).astype(np.uint8)
BW,BH=W//2+1,H//2+1; half=np.zeros((BH,BW),np.uint8); half[:(H+1)//2,:(W+1)//2]=BIO[::2,::2]; half[:,-1]=half[:,-2]; half[-1,:]=half[-2,:]
bio=lambda x,y: int(half[y>>1,x>>1])
# ── dressing the tiles ──
T=lambda x,y: raw[y*W+x]; E=lambda x,y: raw[N+y*W+x]&15; WK=lambda x,y: raw[N+y*W+x]>>4
def put(x,y,t,walk): raw[y*W+x]=t; raw[N+y*W+x]=(raw[N+y*W+x]&15)|((1 if walk else 0)<<4)
STAIRS={10,11,8}
def reach():
    s=WD['start']; seen=np.zeros((H,W),bool); q=deque([(s['x'],s['y'])]); seen[s['y'],s['x']]=True
    while q:
        x,y=q.popleft(); t=raw[y*W+x]; e=raw[N+y*W+x]&15
        for a,b in ((1,0),(-1,0),(0,1),(0,-1)):
            u,v=x+a,y+b
            if not(0<=u<W and 0<=v<H) or seen[v,u] or not raw[N+v*W+u]>>4: continue
            if (raw[N+v*W+u]&15)!=e and not(raw[v*W+u] in STAIRS and t in STAIRS): continue
            seen[v,u]=True; q.append((u,v))
    return seen
before=reach()
# everything anybody has a use for keeps a clear margin: every coordinate named anywhere in the data, the towns, the pass
keep=np.zeros((H,W),bool)
def mark(x,y,r=3):
    x,y=int(x),int(y)
    if 0<=x<W and 0<=y<H: keep[max(0,y-r):y+r+1,max(0,x-r):x+r+1]=True
def walk(o):
    if isinstance(o,dict):
        if isinstance(o.get('x'),(int,float)) and isinstance(o.get('y'),(int,float)): mark(o['x'],o['y'],4)
        for k,v in o.items():
            if isinstance(k,str) and re.fullmatch(r'\d+,\d+',k): mark(*map(int,k.split(',')))
            walk(v)
    elif isinstance(o,list):
        if 2<=len(o)<=5 and all(isinstance(q,(int,float)) for q in o[:2]): mark(o[0],o[1],4)
        for v in o: walk(v)
    elif isinstance(o,str) and re.fullmatch(r'\d+,\d+',o): mark(*map(int,o.split(',')))
walk(json.load(open(os.path.join(ROOT,'data','pastimes.json'),encoding='utf-8')))   # V198: the pastimes' places too (doodles, Reuben, the trade posts …)
for name in ('STRETCH','CHAPELS','FOREST_DATA','DIALOGUE_DATA'):
    try: walk(const(name)[2])
    except ValueError: pass
walk({k:v for k,v in WD.items() if k not in ('raw','interiors','siRooms','thall','themes')})
for n,x,y in WD['towns']: mark(x,y,24)
CODE_SPOTS=[(62,82,11),(88,65,11),(205,261,13),(198,129,12),(322,262,12),(24,81,5),(150,79,5),(164,235,5),(248,193,5),(216,300,5),(70,44,8),(235,74,8),(145,321,8)]   # the plateaus, shrines and watchtowers the code places (V197 tiles; wilds.js, landmarks.js)
for x_,y_,r_ in CODE_SPOTS: mark(gx(x_) if G else x_,gy(y_) if G else y_,r_)
for b in WD['barriers']:
    if b: keep[max(0,b[1]-b[3]-2):b[1]+b[3]+3,max(0,b[0]-b[2]-2):b[0]+b[2]+3]=True
tk=const('STRETCH')[2].get('trek')
if tk: bx=tk['box']; keep[max(0,bx[1]-12):bx[3]+13,max(0,bx[0]-12):bx[2]+13]=True
tiles=np.frombuffer(bytes(raw[:N]),np.uint8).reshape(H,W); wild=np.isin(tiles,(0,1,4,7,15,33,22))
ok=wild.copy()                                                  # only where all the ground within two tiles is wild ground of one height
elev=(np.frombuffer(bytes(raw[N:]),np.uint8)&15).reshape(H,W)
for dy in range(-2,3):
    for dx in range(-2,3):
        sh=np.roll(np.roll(wild,dy,0),dx,1); se=np.roll(np.roll(elev,dy,0),dx,1); ok&=sh&(se==elev)
ok&=~keep; ok[:3,:]=ok[-3:,:]=False; ok[:,:3]=ok[:,-3:]=False
clump=fbm(W,H,9); fine=rng.random((H,W)); added=[]; stats={}
def count(k): stats[k]=stats.get(k,0)+1
for y in range(H):
    for x in range(W):
        t=T(x,y); b=bio(x,y); f=fine[y,x]; c=clump[y,x]
        if b in (DESERT,ASH,SCORCHED) and not keep[y,x]:
            if t==1 and f>(0.16 if b==DESERT else 0.4): put(x,y,0,True); count('cleared')      # the woods thin to a few cacti, a few charred trunks
            elif t==7 and b==DESERT: put(x,y,0,True); count('cleared')
            elif t==4: put(x,y,0,True)
            elif t==0 and ok[y,x] and f<0.012: put(x,y,33,False); added.append((x,y)); count('rocks')
        elif b==FOREST and t in (0,4) and ok[y,x] and c>0.47 and f<0.62: put(x,y,1,False); added.append((x,y)); count('trees')
        elif b==HIGHLAND and t in (0,4) and ok[y,x]:
            if c>0.6 and f<0.3: put(x,y,33,False); added.append((x,y)); count('rocks')
            elif c<0.36 and f<0.3: put(x,y,1,False); added.append((x,y)); count('trees')
        elif b==ALPINE and t in (0,4) and ok[y,x] and c>0.58 and f<0.25: put(x,y,1,False); added.append((x,y)); count('trees')
        elif b==MARSH and t in (0,4) and ok[y,x] and c>0.55 and f<0.22: put(x,y,1,False); added.append((x,y)); count('trees')
        elif b in (MEADOW,FARM,COAST) and t==0 and not keep[y,x] and c>0.66 and f<0.5: put(x,y,4,True); count('flowers')
# nothing that could be reached before is cut off now: open the new growth round any ground that was lost, until none is
addset=set(added)
for it in range(40):
    now=reach(); lost=before&~now; lost[[y for x,y in addset],[x for x,y in addset]]=False
    if not lost.any(): break
    ly,lx=np.nonzero(lost); n=0
    for x,y in zip(lx.tolist(),ly.tolist()):
        for a,b in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(-1,1),(1,-1),(-1,-1)):
            if (x+a,y+b) in addset: addset.discard((x+a,y+b)); put(x+a,y+b,0,True); n+=1
    stats['reopened']=stats.get('reopened',0)+n
    if not n: break
now=reach(); lost=before&~now
for x,y in addset: lost[y,x]=False
WD['bio']=base64.b64encode(half.tobytes()).decode(); WD['bioW']=BW
WD['bioAnchors']=[[k,int(x),int(y),int(R)] for k,x,y,R,s in ANCH[11:]]
WD['raw']=base64.b64encode(bytes(raw)).decode()
out=src[:i]+'const WORLD_DATA='+json.dumps(WD,separators=(',',':'),ensure_ascii=False)+(';' if semi else '')+src[j:]
open(HEAD,'w',encoding='utf-8').write(out)
# the menu's map and the minimap, redrawn from the dressed grid in each country's colours (data/systems.json → SYS.MAP.map)
def map_png():
    import io
    from PIL import Image
    BC=[(102,170,92),(74,138,70),(210,185,132),(119,114,94),(214,226,232),(92,122,92),(134,188,110),(126,152,96),(76,60,58),(130,180,88)]
    COL={2:(189,154,102),3:(47,111,156),5:(120,116,108),6:(179,173,162),12:(138,106,66),19:(224,207,156),20:(95,176,200),21:(63,142,192),22:(238,242,246),25:(106,100,96),26:(255,106,26),27:(168,132,90),28:(58,64,56),29:(30,42,42),32:(154,122,88),33:(132,118,100)}
    im=np.zeros((H,W,3),np.uint8)
    for y in range(H):
        for x in range(W):
            t=T(x,y); g=BC[bio(x,y)]; c=g if t in (0,4,14,15,16,18) else tuple(int(v*0.66) for v in g) if t in (1,7) else COL.get(t,(140,140,140)); e=E(x,y)
            im[y,x]=tuple(min(255,int(v*(1+e*0.05))) for v in c)
    for b in WD['buildings']: im[b['y']:b['y']+b['h'],b['x']:b['x']+b['w']]=(150,70,50)
    buf=io.BytesIO(); Image.fromarray(im).save(buf,'PNG',optimize=True); return 'data:image/png;base64,'+base64.b64encode(buf.getvalue()).decode()
SP=os.path.join(ROOT,'data','systems.json'); SJ=json.load(open(SP,encoding='utf-8'))
if 'MAP' in SJ and 'map' in SJ['MAP']: SJ['MAP']['map']=map_png(); json.dump(SJ,open(SP,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
names='meadow forest desert ash alpine marsh coast highland scorched farmland'.split()
print('biomes:',{names[k]:int((BIO==k).sum()) for k in range(10)}); print('dressing:',stats,'| ground cut off:',int(lost.sum()))
if '--png' in sys.argv:
    from PIL import Image
    COL=[(102,170,92),(60,120,62),(214,188,128),(119,114,94),(226,234,240),(84,110,92),(150,196,120),(138,140,112),(74,58,58),(140,184,92)]
    im=np.zeros((H,W,3),np.uint8)
    for y in range(H):
        for x in range(W):
            t=T(x,y); c=COL[bio(x,y)]
            im[y,x]=(52,120,190) if t in (3,21) else (110,180,205) if t==20 else (190,160,110) if t in (2,12) else (170,165,160) if t in (5,6,9) else tuple(int(q*0.62) for q in c) if t in (1,7) else (120,110,100) if t==33 else c
    Image.fromarray(im).resize((W*3,H*3),Image.NEAREST).save(sys.argv[sys.argv.index('--png')+1])
