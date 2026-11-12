#!/usr/bin/env python3
"""V198 — THE REALM GROWN, AN ISLAND.  python3 tools/grow.py   (runs tools/stormgate.py first; tools/biomes.py runs this)

The realm doubles: new country goes in along lines that cross no town, building, plateau or landmark (SEAMS below,
in the V197 map's own tiles), and a sea margin goes all round so the land can end in a real coast. Every town keeps its
streets; the towns stand further apart. Then:
  · the new country is grown as tools/stretch.py grew it (meadow, woods, ridges, ponds, open valleys every 24 tiles);
    roads and rivers that cross a line run on through its band, and walls of wood or rock that cut the old map keep
    cutting it;
  · the coast is carved: bays bitten into the old edges, headlands pushed out into the sea, beaches where low land meets
    the water, a ring of shallows, and a few islets offshore. Nothing anybody uses is ever drowned;
  · every coordinate in the realm's data is moved (WORLD_DATA, STRETCH, FOREST_DATA, SIDEQUEST_DATA, DIALOGUE_DATA,
    data/pastimes.json, data/systems.json MAP), the Pilgrim's Pass re-laid along its longer way;
  · STRETCH gains the version-3 seams, [at (2D game tiles), width, 3, at (V197 tiles)], so SX/SY in the code and the
    save migration (state.js) move with it. Code literals written in V197 tiles go through RX/RY (kit.js).
Re-runnable: pastimes.json and systems.json are read from their V197 backups (*.v2.json), made on the first run.
"""
import json, base64, os, sys, math, subprocess
from collections import deque
import numpy as np
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); D=lambda *p: os.path.join(ROOT,*p)
subprocess.check_call([sys.executable,D('tools','stormgate.py')])
HEAD=D('data','built','head.js'); src=open(HEAD,encoding='utf-8').read()
def const(name):
    i=src.index('const '+name+'='); j=src.index('\n',i); s=src[i+len(name)+7:j]; return [i,j,json.loads(s[:-1] if s.endswith(';') else s),s.endswith(';')]
CON={n:const(n) for n in ('WORLD_DATA','STRETCH','FOREST_DATA','SIDEQUEST_DATA','DIALOGUE_DATA')}
WD,ST,FD,SQ,DD=(CON[n][2] for n in ('WORLD_DATA','STRETCH','FOREST_DATA','SIDEQUEST_DATA','DIALOGUE_DATA'))
for f in ('pastimes','systems'):
    if not os.path.exists(D('data',f+'.v2.json')): open(D('data',f+'.v2.json'),'w',encoding='utf-8').write(open(D('data',f+'.json'),encoding='utf-8').read())
PT=json.load(open(D('data','pastimes.v2.json'),encoding='utf-8')); SY_=json.load(open(D('data','systems.v2.json'),encoding='utf-8'))
W,H=WD['W'],WD['H']; N=W*H; raw=bytes(base64.b64decode(WD['raw'])); T0=np.frombuffer(raw[:N],np.uint8).reshape(H,W); M0=np.frombuffer(raw[N:],np.uint8).reshape(H,W)
assert W==370 and H==420, 'grow.py expects the V197 realm (370x420); run it from head.orig.js through stormgate.py'

# ── the seams: (at, width) in V197 tiles; at 0 is the sea margin (west / north), EAST and SOUTH are sea added beyond ──
SX3=[(0,60),(104,90),(175,90),(304,90)]; SY3=[(0,60),(55,100),(170,100),(278,100)]; EAST,SOUTH=60,50
mx=lambda x: x+sum(n for p,n in SX3 if x>=p); my=lambda y: y+sum(n for p,n in SY3 if y>=p)
W3=W+sum(n for p,n in SX3)+EAST; H3=H+sum(n for p,n in SY3)+SOUTH; N3=W3*H3
def lines(L,S,extra):
    src=[]; band=[]
    for x in range(L):
        for p,n in S:
            if p==x: src+=[None if p==0 else p-1]*n; band+=[p>0]*n
        src.append(x); band.append(False)
    src+=[None]*extra; band+=[False]*extra; return src,band
srcx,bandx=lines(W,SX3,EAST); srcy,bandy=lines(H,SY3,SOUTH); assert len(srcx)==W3 and len(srcy)==H3
print('realm',W,'x',H,'->',W3,'x',H3)

WATER={3,20,21,29}; ROADS={2,6,19,27,12}; NATURAL={0,1,4,7,14,15,16,22,25,28,33,39}
FORD=np.zeros((H,W),bool)
for k in WD['fords']: x,y=map(int,k.split(',')); FORD[y,x]=True
T2=np.full((H3,W3),3,np.uint8); M2=np.zeros((H3,W3),np.uint8); F2=np.zeros((H3,W3),bool)
SXa=np.array([-1 if s is None else s for s in srcx]); SYa=np.array([-1 if s is None else s for s in srcy])
ix=np.where(SXa>=0)[0]; iy=np.where(SYa>=0)[0]
T2[np.ix_(iy,ix)]=T0[np.ix_(SYa[iy],SXa[ix])]; M2[np.ix_(iy,ix)]=M0[np.ix_(SYa[iy],SXa[ix])]; F2[np.ix_(iy,ix)]=FORD[np.ix_(SYa[iy],SXa[ix])]
BX=np.array(bandx); BY=np.array(bandy); INB=BX[None,:]|BY[:,None]; INB&=(SXa>=0)[None,:]&(SYa>=0)[:,None]

# ── grow the new country (after tools/stretch.py, V116) ──
def h2(x,y,s=0):
    n=(x*374761393+y*668265263+s*2147483647)&0xffffffff; n=((n^(n>>13))*1274126177)&0xffffffff; return ((n^(n>>16))&0xffff)/65535.0
def vnoise(x,y,s):
    xi,yi=math.floor(x),math.floor(y); fx,fy=x-xi,y-yi; u,v=fx*fx*(3-2*fx),fy*fy*(3-2*fy)
    a,b,c,d=h2(xi,yi,s),h2(xi+1,yi,s),h2(xi,yi+1,s),h2(xi+1,yi+1,s); return (a*(1-u)+b*u)*(1-v)+(c*(1-u)+d*u)*v
def fbm(x,y,s,k=1.0): return 0.55*vnoise(x/(11*k),y/(11*k),s)+0.3*vnoise(x/(5*k),y/(5*k),s+1)+0.15*vnoise(x/(2.5*k),y/(2.5*k),s+2)
cls=lambda t: 1 if t in ROADS else 2 if t in WATER else 0
def across(x,y,ax):
    c=cls(T0[y,x]); same=lambda t: cls(t)==c or t in (40,8,10,11)
    if ax=='x': return 0<x+1<W and x-1>=0 and same(T0[y,x-1]) and same(T0[y,x+1])
    return 0<y+1<H and y-1>=0 and same(T0[y-1,x]) and same(T0[y+1,x])
mass=np.zeros((H,W),np.int32); WK0=(M0>>4)==1
for y0 in range(H):
    for x0 in range(W):
        if mass[y0,x0] or WK0[y0,x0]: continue
        st=[(x0,y0)]; comp=[(x0,y0)]; mass[y0,x0]=-1
        while st:
            x,y=st.pop()
            for a,b in ((1,0),(-1,0),(0,1),(0,-1)):
                u,v=x+a,y+b
                if 0<=u<W and 0<=v<H and not mass[v,u] and not WK0[v,u]: mass[v,u]=-1; st.append((u,v)); comp.append((u,v))
        for x,y in comp: mass[y,x]=len(comp)
BOTH=BX[None,:]&BY[:,None]&INB
for Y,X in zip(*np.nonzero(INB)):
    x,y=srcx[X],srcy[Y]
    if cls(T0[y,x]) and BOTH[Y,X]: T2[Y,X]=0; M2[Y,X]=(1<<4)|(M0[y,x]&15); F2[Y,X]=False; continue
    if cls(T0[y,x]) and ((bandx[X] and not across(x,y,'x')) or (bandy[Y] and not across(x,y,'y'))): T2[Y,X]=0; M2[Y,X]=(1<<4)|(M0[y,x]&15); F2[Y,X]=False
# the roads and rivers that run on through a band wander across it (each its own way), and a lake's shore does not run on
def runlen(x,y,ax):                                  # how wide the water is, measured along the seam (a river is narrow)
    n=1; dx,dy=(0,1) if ax=='x' else (1,0)
    for sg in (1,-1):
        k=1
        while 0<=x+sg*k*dx<W and 0<=y+sg*k*dy<H and cls(T0[y+sg*k*dy,x+sg*k*dx])==2: n+=1; k+=1
    return n
moved=0
for ax in ('x','y'):
    for p_,n_ in (SX3 if ax=='x' else SY3):
        if not p_: continue
        b0=(mx(p_) if ax=='x' else my(p_))-n_; L=H if ax=='x' else W
        q=p_-1; runs=[]; cur=None
        for c in range(L):                            # the source line, along the seam: runs of road or water that go on
            x,y=(q,c) if ax=='x' else (c,q); k=cls(T0[y,x]); go=k and across(x,y,ax) and not (k==2 and runlen(x,y,ax)>6)
            if go and cur and cur[2]==k and c==cur[1]+1: cur[1]=c
            elif go: cur=[c,c,k]; runs.append(cur)
            else: cur=None
        for r0,r1,k in runs:
            amp=(6+h2(r0,p_,3)*9)*(1 if h2(r1,p_,5)<0.5 else -1); waves=1+int(h2(r0,r1,7)*2)
            prev=0
            for i in range(n_):
                t=(i+0.5)/n_; o=int(round(amp*math.sin(math.pi*t)*(1 if waves==1 else math.sin(math.pi*t*waves+0.4)/max(0.3,abs(math.sin(math.pi*t*waves+0.4))**0.0))))
                for c in range(r0,r1+1):
                    a2=b0+i                           # the band's own line (column for an x seam, row for a y seam)
                    C=mx(c) if ax=='y' else my(c)     # where this source tile sits across the band
                    X,Y=(a2,C) if ax=='x' else (C,a2)
                    src_t,src_m=T2[Y,X],M2[Y,X]
                    if BOTH[Y,X]: continue
                    T2[Y,X]=0; M2[Y,X]=(1<<4)|(src_m&15)
                    for oo in sorted({o,prev}):
                        X2,Y2=(X,Y+oo) if ax=='x' else (X+oo,Y)
                        if 0<=X2<W3 and 0<=Y2<H3 and INB[Y2,X2] and not BOTH[Y2,X2]: T2[Y2,X2]=src_t; M2[Y2,X2]=src_m; moved+=1
                prev=o
            # lakes along the line: their water does not run on (a river does)
        for c in range(L):
            x,y=(q,c) if ax=='x' else (c,q)
            if cls(T0[y,x])==2 and runlen(x,y,ax)>6:
                for i in range(n_):
                    a2=b0+i; C=my(c) if ax=='x' else mx(c); X,Y=(a2,C) if ax=='x' else (C,a2)
                    if T2[Y,X] in WATER: T2[Y,X]=0; M2[Y,X]=(1<<4)|(M2[Y,X]&15)
print('roads and rivers wound across the bands:',moved,'tiles')
INF=999; dR=np.full((H3,W3),INF,np.int32); dE=np.full((H3,W3),INF,np.int32)
def bfs(Dm,seed):
    q=deque(zip(*np.nonzero(seed)))
    for y,x in q: Dm[y,x]=0
    while q:
        y,x=q.popleft(); d=Dm[y,x]+1
        for a,b in ((1,0),(-1,0),(0,1),(0,-1)):
            u,v=x+a,y+b
            if 0<=u<W3 and 0<=v<H3 and Dm[v,u]>d: Dm[v,u]=d; q.append((v,u))
bfs(dE,~INB); bfs(dR,INB&(np.isin(T2,list(ROADS|WATER))|~np.isin(T2,list(NATURAL))))
VAL=[]
for p,n in SX3:
    if p: X0=mx(p)-n; VAL+=[('x',X0,X0+n,Yc) for Yc in range(10,H3-10,24)]
for p,n in SY3:
    if p: Y0=my(p)-n; VAL+=[('y',Y0,Y0+n,Xc) for Xc in range(10,W3-10,24)]
def valley(X,Y):
    best=99
    for kind,a,b,c in VAL:
        if kind=='x' and a<=X<b: u=(X-a)/max(1,b-a); cy=c+math.sin(u*3.1+c)*5+math.sin(u*7.3+c*0.3)*2; best=min(best,abs(Y-cy))
        elif kind=='y' and a<=Y<b: u=(Y-a)/max(1,b-a); cx=c+math.sin(u*3.1+c)*5+math.sin(u*7.3+c*0.3)*2; best=min(best,abs(X-cx))
    return best
grown=0
for Y,X in zip(*np.nonzero(INB)):
    t=int(T2[Y,X])
    if t not in NATURAL: continue
    e=int(M2[Y,X]&15); de=int(dE[Y,X]); dr=int(dR[Y,X])
    if de<=2: continue
    if (M2[Y,X]>>4)!=1 and mass[srcy[Y],srcx[X]]>=60 and de<=5: T2[Y,X]=33 if fbm(X,Y,7)>0.62 else 1; M2[Y,X]=e; grown+=1; continue
    ridge=fbm(X,Y,7,1.6); wood=fbm(X,Y,19,1.6); pond=fbm(X,Y,31,1.6); fl=h2(X,Y,5)
    ramp=min(1.0,(de-2)/6.0)*min(1.0,max(0,dr-2)/4.0); cold=t==22; vd=valley(X,Y)
    if vd<2.2: ramp=0.0
    elif vd<5: ramp*=(vd-2.2)/2.8
    if ramp>0.3 and ridge*ramp>0.6: nt,w=33,0
    elif ramp>0.2 and (ridge*ramp>0.5 or wood>0.66): nt,w=1,0
    elif dr>4 and de>6 and pond>0.72 and not cold: nt,w=(3,0) if pond>0.77 else (20,1)
    else:
        nt,w=(22 if cold else 25 if t==25 else 28 if t==28 else 0),1
        if nt==0 and fl>0.93: nt=4
    T2[Y,X]=nt; M2[Y,X]=(w<<4)|e; grown+=1
print('new country grown:',grown,'tiles')

# ── the data moved ──
def P(o,kx='x',ky='y'):
    if isinstance(o,dict) and kx in o and ky in o: o[kx]=mx(o[kx]); o[ky]=my(o[ky])
    return o
def K(k): a,b=k.split(','); return f"{mx(int(a))},{my(int(b))}"
for b in WD['buildings']: P(b); P(b['door'])
for d in WD['decor']: P(d)
WD['signs']={K(k):v for k,v in WD['signs'].items()}
for v in WD['villagers']: P(v)
WD['barriers']=[None if e is None else [mx(e[0]),my(e[1]),round(e[2]*1.0),round(e[3]*1.0)] for e in WD['barriers']]
for k,L in WD['barrierSets'].items(): WD['barrierSets'][k]=[c for i in range(0,len(L),2) for c in (mx(L[i]),my(L[i+1]))]
for z in WD['zones']: z['x0'],z['y0'],z['x1'],z['y1']=mx(z['x0']),my(z['y0']),mx(z['x1']),my(z['y1'])
WD['towns']=[[n,mx(x),my(y)] for n,x,y in WD['towns']]; P(WD['start'])
R=WD['rivers']
for k in ('stones','bellFord','bridges'): R[k]=[K(q) for q in R.get(k,[])]
if R.get('island'): R['island']=[mx(R['island'][0]),my(R['island'][1])]
WD.pop('bio',None); WD.pop('bioW',None); WD.pop('bioAnchors',None)
# the Pilgrim's Pass: its control points moved, and where a band opened between two of them, the way winds on across it
tk=ST['trek']; P0=[list(q) for q in tk['pts']]; pts=[[mx(x),my(y),h] for x,y,h in tk['pts']]; out=[pts[0]]
for a,b in zip(pts,pts[1:]):
    gap=math.hypot(b[0]-a[0],b[1]-a[1]); n=int(gap//16)
    for i in range(1,n+1):
        t=i/(n+1); out.append([round(a[0]+(b[0]-a[0])*t+math.sin(i*1.9+a[1]*0.1)*7),round(a[1]+(b[1]-a[1])*t),round(a[2]+(b[2]-a[2])*t,1)])
    out.append(b)
tk['pts']=out; xs=[p[0] for p in out]; ys=[p[1] for p in out]; bx=tk['box']
tk['box']=[min(xs)-(min(p[0] for p in P0)-bx[0]),min(ys)-(min(p[1] for p in P0)-bx[1]),max(xs)+(bx[2]-max(p[0] for p in P0)),max(ys)+(bx[3]-max(p[1] for p in P0))]
tk['places']={k:[mx(v[0]),my(v[1])] for k,v in tk['places'].items()}
def trek_samples(Pp):
    o=[]; cr=lambda p0,p1,p2,p3,t: 0.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t)
    for i in range(len(Pp)-1):
        a,b,c,d=Pp[max(0,i-1)],Pp[i],Pp[i+1],Pp[min(len(Pp)-1,i+2)]; L=math.hypot(c[0]-b[0],c[1]-b[1]); n=max(2,int(L*2))
        for k in range(n):
            t=k/n; o.append([round(cr(a[0],b[0],c[0],d[0],t),2),round(cr(a[1],b[1],c[1],d[1],t),2),round(b[2]+(c[2]-b[2])*(t*t*(3-2*t)*0.5+t*0.5),2)])
    o.append(list(Pp[-1])); return o
tk['samples']=trek_samples(out)
def lay_trek():
    x0,y0,x1,y1=tk['box']; on=set()
    for x,z,h in tk['samples']:
        for dx in (-0.6,0.6):
            for dz in (-0.6,0.6): on.add((int(math.floor(x+dx)),int(math.floor(z+dz))))
    for y in range(y0+2,y1-1):
        for x in range(x0,min(x1,W3)):
            if T2[y,x]==2 and (x,y) not in on: T2[y,x]=0; M2[y,x]=(1<<4)|(M2[y,x]&15)
    for x,y in on:
        if 0<=x<W3 and 0<=y<H3:
            t=int(T2[y,x]); e=int(M2[y,x]&15)
            if t in WATER: T2[y,x]=12; M2[y,x]=(1<<4)|e
            elif t in NATURAL or t in (2,19): T2[y,x]=2; M2[y,x]=(1<<4)|e
lay_trek()
# the code's own seams, for SX/SY and the saves: [at in the 2D game's tiles, width, 3, at in V197 tiles]
def to2d(p,L):
    a=0
    while True:
        v=a+sum(n for s0,n,*_ in L if a>=s0)
        if v>=p: return a
        a+=1
ST['x']=[s for s in ST['x'] if (s[2] if len(s)>2 else 1)<3]+[[to2d(p,ST['x']),n,3,p] for p,n in SX3]
ST['y']=[s for s in ST['y'] if (s[2] if len(s)>2 else 1)<3]+[[to2d(p,ST['y']),n,3,p] for p,n in SY3]
ST['grow']={'W':W3,'H':H3,'x':SX3,'y':SY3}
FD['mouths']={k:P(v) for k,v in FD['mouths'].items()}; P(FD['caveReturn'])
for t in SQ['quests'].values():
    for q in (t if isinstance(t,list) else t.values()):
        if isinstance(q,dict) and isinstance(q.get('at'),list): q['at']=[mx(q['at'][0]),my(q['at'][1])]+q['at'][2:]
def dkey(k):
    if k.startswith('v:'): _,xy,o=k.split(':',2); return 'v:'+K(xy)+':'+o
    return k
DD['npcs']={dkey(k):v for k,v in DD['npcs'].items()}
DD['signs']={K(k) if ',' in k and k.replace(',','').isdigit() else k:v for k,v in DD['signs'].items()}
PT['fishSpots']={K(k):v for k,v in PT['fishSpots'].items() if v!='sea'}; PT['plots']=[[mx(a),my(b)] for a,b in PT['plots']]; PT['sellSpot']=K(PT['sellSpot'])
PT['surf']=[[mx(a),my(b)] for a,b in PT['surf']]; P(PT['regatta'])
for b in PT['boat']: P(b)
for s in PT['secrets']: P(s)
for s in PT['reuben']['spots']: P(s)
P(PT['trade']['home']); P(PT['trade']['board'])
for q in PT['trade']['points'].values(): P(q); P(q,'dx','dy')
for t in PT['trade']['towns']: t['spot']=[mx(t['spot'][0]),my(t['spot'][1])]
j=PT['rogues']['jail']; j['x'],j['y'],j['pierX'],j['pierY0'],j['pierY1']=mx(j['x']),my(j['y']),mx(j['pierX']),my(j['pierY0']),my(j['pierY1'])
for p in PT['finale']['portals']: P(p,'tx','ty')
for s in PT['deep']['spots']: P(s)
h=PT['bounty']['hs']; h['x0'],h['x1'],h['y0'],h['y1']=mx(h['x0']),mx(h['x1']),my(h['y0']),my(h['y1'])
for d in PT['doodles']['at']: P(d)
SY_['MAP']['towns']=[list(t) for t in WD['towns']]; SY_['MAP']['W'],SY_['MAP']['H']=W3,H3

# ── the coast ── (first, what can be reached before it is cut)
PRE=('reach0',)
# ── the coast ──
rng=np.random.default_rng(198)
def noise(w,h,cell):
    gw,gh=w//cell+3,h//cell+3; g=rng.random((gh,gw)); ys,xs=np.mgrid[0:h,0:w]; fx,fy=xs/cell,ys/cell; i,j=fx.astype(int),fy.astype(int); u,v=fx-i,fy-j; u=u*u*(3-2*u); v=v*v*(3-2*v)
    return (g[j,i]*(1-u)+g[j,i+1]*u)*(1-v)+(g[j+1,i]*(1-u)+g[j+1,i+1]*u)*v
CX0,CX1,CY0=mx(0),mx(W-1),my(0)
# the old realm was walled all round by two rows of trees: with a coast beyond it now, that wall comes down
for X in (CX0,CX0+1,CX0+2,CX1-2,CX1-1,CX1):
    m=np.isin(T2[:,X],[1,7,33]); T2[m,X]=0; M2[m,X]=(1<<4)|(M2[m,X]&15)
for Y in (CY0,CY0+1,CY0+2):
    m=np.isin(T2[Y,:],[1,7,33]); T2[Y,m]=0; M2[Y,m]=(1<<4)|(M2[Y,m]&15)
keep=np.zeros((H3,W3),bool)
def mark(x,y,r=4):
    x,y=int(x),int(y); keep[max(0,y-r):y+r+1,max(0,x-r):x+r+1]=True
for b in WD['buildings']: keep[max(0,b['y']-5):b['y']+b['h']+6,max(0,b['x']-5):b['x']+b['w']+6]=True
for d in WD['decor']+WD['villagers']: mark(d['x'],d['y'],5)
for k in list(WD['signs'])+list(PT['fishSpots'])[::7]: mark(*map(int,k.split(',')),r=3)
for e in WD['barriers']:
    if e: keep[max(0,e[1]-e[3]-4):e[1]+e[3]+5,max(0,e[0]-e[2]-4):e[0]+e[2]+5]=True
for x_,z_,h_ in tk['samples'][::3]: keep[max(0,int(z_)-6):int(z_)+7,max(0,int(x_)-6):int(x_)+7]=True
for s in PT['secrets']+PT['reuben']['spots']+PT['deep']['spots']+PT['doodles']['at']: mark(s['x'],s['y'],5)
for t in SQ['quests'].values():
    for q in (t if isinstance(t,list) else t.values()):
        if isinstance(q,dict) and isinstance(q.get('at'),list): mark(q['at'][0],q['at'][1],5)
CODE_SPOTS=[(62,82,11),(88,65,11),(205,261,13),(198,129,12),(322,262,12),(24,81,5),(150,79,5),(164,235,5),(248,193,5),(216,300,5),(70,44,8),(235,74,8),(145,321,8)]   # the plateaus, shrines and watchtowers the code places (V197 tiles; wilds.js, landmarks.js)
for x_,y_,r_ in CODE_SPOTS: mark(mx(x_),my(y_),r_)
rd=np.isin(T2,[2,12,6,8,9,10,11,27]);
for dy in range(-3,4):
    for dx in range(-3,4): keep|=np.roll(np.roll(rd,dy,0),dx,1)
def reach(Tg,Mg):
    s=WD['start']; seen=np.zeros((H3,W3),bool); q=deque([(s['x'],s['y'])]); seen[s['y'],s['x']]=True; ST_={10,11,8}
    while q:
        x,y=q.popleft(); t=Tg[y,x]; e=Mg[y,x]&15
        for a,b in ((1,0),(-1,0),(0,1),(0,-1)):
            u,v=x+a,y+b
            if not(0<=u<W3 and 0<=v<H3) or seen[v,u] or not (Mg[v,u]>>4): continue
            if (Mg[v,u]&15)!=e and not(Tg[v,u] in ST_ and t in ST_): continue
            seen[v,u]=True; q.append((u,v))
    return seen
REACH0=reach(T2,M2)
from scipy import ndimage
ys,xs=np.mgrid[0:H3,0:W3]
lab,_=ndimage.label(np.isin(T2,[3,20])); bl=set(lab[0,:])|set(lab[-1,:])|set(lab[:,0])|set(lab[:,-1]); bl.discard(0)
ocean=np.isin(lab,list(bl))                                               # the open sea (not the lakes and rivers)
llab,nl=ndimage.label(~ocean); sizes=ndimage.sum(np.ones_like(llab),llab,range(1,nl+1)); main=1+int(np.argmax(sizes)); MAIN=llab==main
dL=ndimage.distance_transform_edt(~ocean)                                 # how far inland
dS,(iy_,ix_)=ndimage.distance_transform_edt(ocean,return_indices=True)    # how far out to sea, and the nearest land
dO=ndimage.distance_transform_edt(~(~ocean&~MAIN))                         # how far from any isle
off=(noise(W3,H3,150)*0.55+noise(W3,H3,48)*0.3+noise(W3,H3,13)*0.15-0.5)*2*95
keepS=np.zeros_like(keep)                                                  # (the sailing waters stay open)
for q in PT['surf']+[[PT['regatta']['x'],PT['regatta']['y']]]+[[b['x'],b['y']] for b in PT['boat']]: keepS[max(0,q[1]-12):q[1]+13,max(0,q[0]-12):q[0]+13]=True
nat=np.isin(T2,list(NATURAL|{19}))
drown=MAIN&nat&~keep&(off<0)&(dL<=-off)
grow_=ocean&(off>0)&(dS<=off)&MAIN[iy_,ix_]&(dO>10)&~keepS&(xs>6)&(xs<W3-7)&(ys>6)&(ys<H3-7)
T0c,M0c,F0c=T2.copy(),M2.copy(),F2.copy()
T2[drown]=3; M2[drown]=0; F2[drown]=False
for it in range(14):                                                      # a bay that cut off anything used is filled back in about it
    LK=REACH0&~reach(T2,M2)&keep
    if not LK.any(): break
    near=np.zeros_like(LK); r=10+it*8
    for y,x in zip(*np.nonzero(LK)): near[max(0,y-r):y+r+1,max(0,x-r):x+r+1]=True
    back=near&drown; T2[back]=T0c[back]; M2[back]=M0c[back]; F2[back]=F0c[back]; drown&=~back
for Y,X in zip(*np.nonzero(grow_)):
    sy_,sx_=iy_[Y,X],ix_[Y,X]; t=int(T0c[sy_,sx_]); e=int(M0c[sy_,sx_]&15)
    if t in WATER: T2[Y,X]=3; M2[Y,X]=0                                   # a river's mouth runs on out to the sea
    else:                                                                 # new land of its own: turf, a few trees and stones (the biomes dress it after)
        r_=h2(X,Y,11); T2[Y,X]=1 if r_<0.08 else 33 if r_>0.985 else 22 if t==22 else 0; M2[Y,X]=((0 if T2[Y,X] in (1,33) else 1)<<4)|e
southish=np.zeros_like(keep)
# islets offshore
for i in range(10):
    for _ in range(600):
        X=int(rng.integers(10,W3-10)); Y=int(rng.integers(10,H3-10))
        r=int(rng.integers(3,7))
        if (T2[max(0,Y-r-10):Y+r+11,max(0,X-r-10):X+r+11]==3).all() and not keepS[max(0,Y-r-6):Y+r+7,max(0,X-r-6):X+r+7].any(): break
    else: continue
    for y in range(Y-r,Y+r+1):
        for x in range(X-r,X+r+1):
            d=math.hypot(x-X,(y-Y)*1.15)/(r*(0.8+0.4*h2(x,y,9)))
            if d<1: T2[y,x]=1 if d<0.45 and h2(x,y,3)<0.45 else 33 if d<0.5 and h2(x,y,4)<0.15 else 19 if d>0.78 else 0; M2[y,x]=((0 if T2[y,x] in (1,33) else 1)<<4)
# beaches and shallows
lab2,_=ndimage.label(np.isin(T2,[3,20])); bl2=set(lab2[0,:])|set(lab2[-1,:])|set(lab2[:,0])|set(lab2[:,-1]); bl2.discard(0)
SEA=(T2==3)&np.isin(lab2,list(bl2))                                   # beaches only on the open sea, not on the lakes
nb=np.zeros_like(SEA)
for a,b in ((1,0),(-1,0),(0,1),(0,-1)): nb|=np.roll(np.roll(SEA,a,0),b,1)
beach=nb&np.isin(T2,[0,4,15])&((M2&15)==0)&~keep&~southish
T2[beach]=19; M2[beach]=(1<<4)
SAND=T2==19; nb2=np.zeros_like(SAND)
for a,b in ((1,0),(-1,0),(0,1),(0,-1)): nb2|=np.roll(np.roll(SAND,a,0),b,1)
shal=SEA&nb2&~southish; T2[shal]=20; M2[shal]=(1<<4)
# nothing reachable before the coast was cut is cut off now (start from the start)
ok=reach(T2,M2); lost=REACH0&~ok&((M2>>4)==1)
LK=lost&keep; ly,lx=np.nonzero(LK); print('  of which near something used:',int(LK.sum()), sorted(set((int(x)//20*20,int(y)//20*20) for x,y in zip(lx,ly)))[:20])
print('coast: drowned',int(drown.sum()),'| new headland',int(grow_.sum()),'| beach',int(beach.sum()),'| shallows',int(shal.sum()),'| kept ground now unreachable',int(lost.sum()))
OC=ocean&np.isin(T2,[3,20,21]); WKm=(M2>>4)==1; adj=np.zeros_like(OC)
for a_,b_ in ((1,0),(-1,0),(0,1),(0,-1)): adj|=np.roll(np.roll(WKm,a_,0),b_,1)
for y,x in zip(*np.nonzero(OC&adj&~np.isin(T2,[20,21]))): PT['fishSpots'].setdefault(f"{x},{y}",'sea')   # (a river's own spots stay the river's)
print('fishing: sea spots along the coast',sum(1 for v in PT['fishSpots'].values() if v=='sea'))
WD['W'],WD['H']=W3,H3
WD['raw']=base64.b64encode(T2.tobytes()+M2.tobytes()).decode()
WD['fords']=[f"{x},{y}" for y,x in zip(*np.nonzero(F2&(T2==20)))]
new=src
for n in sorted(CON,key=lambda n:-CON[n][0]):
    i,j,o,semi=CON[n]; new=new[:i]+'const '+n+'='+json.dumps(o,separators=(',',':'),ensure_ascii=False)+(';' if semi else '')+new[j:]
open(HEAD,'w',encoding='utf-8').write(new)
json.dump(PT,open(D('data','pastimes.json'),'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
json.dump(SY_,open(D('data','systems.json'),'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('trek:',len(tk['pts']),'points, box',tk['box'],'| towns',WD['towns'])
