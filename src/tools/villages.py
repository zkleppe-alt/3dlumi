#!/usr/bin/env python3
"""V199 — THE VILLAGES, RE-PLANNED (Hearthvale first).  python3 tools/villages.py   (runs tools/grow.py first; biomes.py runs this)

Each village is laid out open and natural, the way a real one grows: no fence round it, lanes that wander from the
road to a green, houses set along them each with its own garden, a stream, fields, an orchard, a hill. The chapel's door
is barred; its catacombs are reached by a way in somewhere else in the village (WORLD_DATA.cata[t]: where the catacomb
code builds its entrance, and the words the chapel door and the quest goal use), and a few villagers (villagers[].clue)
have heard the sounds that come from it.
Coordinates are the grown island's tiles (V198). Every building keeps its id and interior; the people who move keep
their story (DIALOGUE_DATA.npcs is keyed by where they stand, so their keys move with them).
"""
import json, base64, os, sys, subprocess, math, copy
import numpy as np
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); D=lambda *p: os.path.join(ROOT,*p)
subprocess.check_call([sys.executable,D('tools','grow.py')])
HEAD=D('data','built','head.js'); src=open(HEAD,encoding='utf-8').read()
def const(name):
    i=src.index('const '+name+'='); j=src.index('\n',i); s=src[i+len(name)+7:j]; return [i,j,json.loads(s[:-1] if s.endswith(';') else s),s.endswith(';')]
CON={n:const(n) for n in ('WORLD_DATA','DIALOGUE_DATA','SIDEQUEST_DATA')}
WD,DD,SQ=CON['WORLD_DATA'][2],CON['DIALOGUE_DATA'][2],CON['SIDEQUEST_DATA'][2]
PT=json.load(open(D('data','pastimes.json'),encoding='utf-8'))
W,H=WD['W'],WD['H']; N=W*H; raw=bytearray(base64.b64decode(WD['raw']))
T=lambda x,y: raw[y*W+x]
def put(x,y,t,walk,e=None):
    k=y*W+x; raw[k]=t; raw[N+k]=((raw[N+k]&15) if e is None else e)|((1 if walk else 0)<<4)
INT=WD['interiors']; WD.setdefault('cata',{}); WD.setdefault('hills',[]); WD.setdefault('villageRects',[]); WD.setdefault('townR',{})

def lane(pts,w=2,t=2):
    """a lane of path tiles along a polyline, w wide; over water it is a plank bridge"""
    for (ax,ay),(bx,by) in zip(pts,pts[1:]):
        n=max(abs(bx-ax),abs(by-ay))*2+1
        for i in range(n+1):
            x=ax+(bx-ax)*i/n; y=ay+(by-ay)*i/n
            for dx in range(w):
                for dy in range(w):
                    X,Y=int(round(x))+dx-(w//2),int(round(y))+dy-(w//2)
                    if T(X,Y) in (3,20,12): put(X,Y,12,True)
                    elif T(X,Y) not in (5,9,16): put(X,Y,t,True)
def stream(pts,w=2):
    for (ax,ay),(bx,by) in zip(pts,pts[1:]):
        n=max(abs(bx-ax),abs(by-ay))*3+1
        for i in range(n+1):
            x=ax+(bx-ax)*i/n+math.sin(i*0.7+ax)*0.4; y=ay+(by-ay)*i/n
            for dx in range(w):
                for dy in range(w):
                    X,Y=int(round(x))+dx,int(round(y))+dy
                    if T(X,Y)==2: put(X,Y,12,True)
                    elif T(X,Y) not in (12,5,9): put(X,Y,3,False)
def bld(id,name,style,x,y,w,h,interior=None,template='home1',who=None):
    """a building on the map (its door at the middle of its south side), with an interior of its own"""
    for yy in range(y,y+h):
        for xx in range(x,x+w): put(xx,yy,5,False)
    dx=x+w//2; put(dx,y+h-1,9,True)
    if T(dx,y+h) not in (2,12): put(dx,y+h,2,True)                       # a step of path before the door
    b=next((b for b in WD['buildings'] if b['id']==id),None)
    if b is None: b={'id':id}; WD['buildings'].append(b)
    b.update({'name':name,'style':style,'x':x,'y':y,'w':w,'h':h,'door':{'x':dx,'y':y+h-1},'interior':interior or b.get('interior') or id})
    iid=b['interior']
    if iid not in INT:
        I=copy.deepcopy(INT[template]); I['name']=name
        for n in I.get('npcs',[]):
            if who: n['name'],n['voutfit'],n['lines']=who[0],who[1],list(who[2:])
        INT[iid]=I
    return b
def decor(kind,x,y,w=1):
    for yy in range(y,y+w):
        for xx in range(x,x+w): put(xx,yy,5,False)
    WD['decor'].append({'x':x,'y':y,'kind':kind,'w':w})
def tree(x,y): put(x,y,1,False)
def fence(x0,y0,x1,y1,gaps=()):
    for x in range(x0,x1+1):
        for y in (y0,y1):
            if (x,y) not in gaps: put(x,y,14,False)
    for y in range(y0,y1+1):
        for x in (x0,x1):
            if (x,y) not in gaps: put(x,y,14,False)
def sign(x,y,text): put(x,y,16,False); WD['signs'][f"{x},{y}"]=text
def folk(x,y,outfit,lines,name=None,clue=None,old=None,after=None):
    v={'x':x,'y':y,'outfit':outfit,'lines':lines}
    if after: v['after']=after
    if name: v['name']=name
    if clue is not None: v['clue']=clue
    if old:                                                               # the same person, moved: their story's key moves with them
        k0=f"v:{old[0]},{old[1]}:{outfit}"; k1=f"v:{x},{y}:{outfit}"
        if k0 in DD['npcs']: DD['npcs'][k1]=DD['npcs'].pop(k0)
    WD['villagers'].append(v)
    if T(x,y) not in (0,2,4,6,18,12,19): put(x,y,18,True)

# ════════════════════════════════════ HEARTHVALE ════════════════════════════════════
X0,Y0,X1,Y1=58,42,136,113
OLD=('tobias','chapel','shop','inn','home1','home2')
inside=lambda o: X0<=o['x']<=X1 and Y0<=o['y']<=Y1
olds={(v['x'],v['y'],v['outfit']):v for v in WD['villagers'] if inside(v)}
WD['decor']=[d for d in WD['decor'] if not inside(d)]; WD['villagers']=[v for v in WD['villagers'] if not inside(v)]
for k in [k for k in WD['signs'] if inside(dict(zip('xy',map(int,k.split(',')))))]: WD['signs'].pop(k)
# the ground: open meadow, the old fence and its square gone; the trade road (y 93-95) and the Ironhold road (x 71-73) stay
for y in range(Y0,Y1+1):
    for x in range(X0,X1+1):
        t=T(x,y); road=(93<=y<=95 and t==2) or (71<=x<=73 and y>=93 and t==2)
        if road or t in (3,20) and not (76<=x<=110 and 72<=y<=92): continue
        core=66<=x<=130 and 48<=y<=108
        if t in (1,7) and not core: continue                               # the woods round about stay (their bare rock does not)
        put(x,y,0,True)
# the millstream: down from the pond in the north-east, under the road, into the river in the south
stream([(129,63),(126,67),(122,72),(118,78),(115,85),(115,92),(116,99),(117,106),(117,110)])
# the lanes: from the trade road up to the green, on to the chapel; west to the sheep hill; east over the stream
lane([(88,93),(89,90),(91,87)])                                            # the road to the green
lane([(102,93),(102,92)])                                                  # the inn's step
lane([(95,78),(97,72),(97,66),(97,59)])                                    # up to the chapel
lane([(97,64),(102,63),(105,63)])                                          # the old north gate (the Scholar's Way)
lane([(86,80),(80,79),(74,77),(70,72),(69,68),(68,62),(67,56)])            # west, and up the sheep hill
lane([(99,84),(105,85),(111,85),(118,85),(124,83),(128,80)])               # east, over the stream
lane([(118,85),(120,88),(121,93)])                                         # down to the road by the mill
lane([(80,80),(78,84)]); lane([(74,77),(74,83)])                           # garden paths
lane([(74,101),(77,102)])   # the farmer's gate
lane([(84,76),(84,79)]); lane([(105,77),(104,84)])   # Mira's and Bram's paths
# the green: turf about the fountain, a cobbled ring before the inn and the store
for y in range(78,91):
    for x in range(85,101):
        d=math.hypot((x-92.5)/7.6,(y-84)/6.2)
        if d<1 and T(x,y) not in (2,12): put(x,y,18,True)
for y in range(86,92):
    for x in range(97,107):
        if T(x,y) in (0,18): put(x,y,6,True)
decor('fountain',92,82,2); decor('greatTree',87,80); decor('marketStall',95,86,2); decor('lantern',90,86); decor('lantern',96,81); decor('planter',89,83); decor('planter',96,84)
# the chapel, on its rise at the head of the village, in a walled churchyard; the doors are barred
bld('chapel','Hearthvale Chapel','chapel',94,51,7,7)
fence(89,47,106,61,gaps={(96,61),(97,61),(98,61)})
for gx,gy in ((90,50),(90,53),(90,56),(92,59),(103,50),(104,53),(104,56),(102,59),(93,48),(101,48)): decor('tombstone',gx,gy)
decor('lantern',95,62); decor('lantern',99,62); decor('greatTree',104,59)
# the houses, each on its lane with a little garden
bld('shop','General Store','shop',80,84,5,4); decor('barrel',85,86); decor('crate',79,87)
bld('inn','Hearth & Home Inn','inn',100,87,6,5); decor('haycart',106,90,2); decor('barrel',99,90); decor('lantern',99,92)
bld('tobias',"Tobias's Cottage",'cottage',75,70,5,4); decor('planter',80,74); decor('hsWoodpile',74,71)
bld('home1',"Mira's Home",'house',82,73,4,3); decor('planter',86,75)
bld('home2',"Old Bram's Home",'house',103,74,4,3); decor('barrel',107,76)
H=[('hv_home1',"Amos the Shepherd's Cottage",'cottage',70,62,4,3,('Old Ada','peasantF','Amos is up the hill with the flock. He comes home later every night, and quieter.')),
   ('hv_home2',"The Weaver's House",'house',75,81,4,3,('Weaver Joan','peasantF','Wool from our own sheep — the softest in the realm. Feel that.','Mind the loom, knight. My grandmother built it.')),
   ('hv_home3',"Widow Ruth's Cottage",'cottage',105,80,4,3,('Ruth\'s cat','child','(A grey cat looks at you from the windowsill, and does not get up.)')),
   ('hv_home4',"The Miller's House",'house',122,86,5,4,('Miller Hob\'s wife','peasantF','Hob is down at the mill. He talks to the wheel more than to me.')),
   ('hv_home5',"The Beekeeper's Cottage",'cottage',123,75,4,3,('Beekeeper Nell','peasantF','Honey in the jars, honey on the floor, honey in my hair. Have some.')),
   ('hv_home6',"The Carpenter's House",'house',87,97,4,3,('Carpenter Saul','woodcutter','Every bench in the chapel is mine. When they open the doors again, you will see.')),
   ('hv_home7',"The Farmer's Cottage",'cottage',76,99,4,3,('Farmer Eli','farmer','Rain on Tuesday, sun on Wednesday. The barley does not care which, so long as it gets both.')),
   ('hv_home8',"Martha's Bakehouse",'house',106,97,5,3,('Martha\'s boy','child','Mum says the oven is older than the chapel. I think it is older than God. — No, wait. Nothing is.'))]
for id,nm,st,x,y,w,h,who in H: bld(id,nm,st,x,y,w,h,who=who)
for p in ((74,66),(86,98),(80,96),(128,78),(104,99),(111,99)): decor('planter',*p)
decor('hsSkep',126,73); decor('hsSkep',128,75); decor('hsCoop',74,63); decor('logpile',91,99); decor('hsWell',83,90)
# the fields and the windmill to the south-west, behind the farmer's cottage
for y in range(100,111):
    for x in range(59,69):
        if (x+y)%5!=0: put(x,y,19,True)
fence(58,99,69,111,gaps={(64,99),(65,99),(69,104),(69,105)}); decor('mt_windmill',78,106,2); decor('scarecrow',63,104); decor('haystack',60,108); decor('scarecrow',66,108)
# the orchard to the north-east, in rows
for y in range(66,72,3):
    for x in range(108,121,3): tree(x,y)
# the sheep hill to the north-west: its pasture walled round, the old shepherds' tomb at the top
fence(58,44,78,60,gaps={(67,60),(68,60)})
for p in ((61,55),(64,57),(72,52),(75,56),(74,48)): decor('mt_sheep',*p)
WD['hills'].append([67,50,14,4.2])                                         # the hill itself (world.js raises it)
for y in range(46,53):
    for x in range(63,71): put(x,y,0,True)                                 # clear ground about the tomb
WD['cata']['0']={'x':66,'y':49,'face':0,'where':'the old shepherds’ tomb up on the sheep hill',
    'door':['The doors are barred from within. A cold shadow seeps out from under them.','Perhaps someone in the village knows another way in.'],
    'doorHeard':['The doors are barred from within. A cold shadow seeps out from under them.','The sounds come from the shepherds’ tomb up on the sheep hill. If there is another way down, it is there.'],
    'goal':'Hearthvale’s chapel is barred from within. Ask around the village — someone has heard something.',
    'goalHeard':'Up to the old shepherds’ tomb on the sheep hill — the sounds come from there.',
    'wayIn':'up on the sheep hill above the village the old shepherds’ tomb stands open, its stair going down into the catacombs.',
    'journal':'Hearthvale’s chapel is barred from within. The villagers have heard sounds at night from the old shepherds’ tomb up on the sheep hill — the shepherds were carried up there to be buried. There may be a way down from it.'}
# the people: the three who were here, moved with their stories, and those who live here now
mv={('peasant'):(91,79),('peasantF'):(97,88),('child'):(88,86)}
for (x,y,o),v in olds.items():
    nx,ny=mv.get(o,(90,85)); folk(nx,ny,o,v['lines'],v.get('name'),old=(x,y))
folk(66,57,'farmer',['Up here with the flock since I could walk.'],name='Amos the Shepherd',clue=0,after=['The flock grazes up by the tomb again, bold as you like. Whatever was down there, it’s quiet now.','You went down, didn’t you. God keep you, knight.'])
WD['villagers'][-1]['lines']=['The flock won’t graze up by the old tomb after dusk. They stand in a ring facing the stone door, every one of them, and bleat — like there’s a lamb inside crying back.','I’ve kept sheep on this hill fifty years. That door has never once been open. Last week I found it ajar.']
folk(104,85,'peasantF',['My Jonas used to say the shepherds’ tomb on the hill and the chapel were one house — one above the ground, and one below it.','When a shepherd died they carried him up the hill to the tomb, and the brothers took him down a stair, and he was laid under the chapel. Under the hill, under the village, all the way.','Lately, of a night, I hear chanting from up there. Low. Not like the brothers sang it.'],name='Widow Ruth',clue=0,after=['The chanting has stopped. I sleep the whole night through now — first time since Jonas.'])
folk(84,91,'child',['Me and Tam heard singing coming out of the sheep hill! Real low singing, under the grass.','Tam says it’s ghosts. I think it’s people. Ghosts don’t need stairs.'],name='Pip',clue=0,after=['Did you go INTO the hill?! Was it ghosts? Was it people? Tam owes me a honeycake.'])
folk(118,90,'peasant',['The wheel turns, the stones grind, the flour falls. There are worse ways to spend a life.'],name='Miller Hob')
folk(127,95,'woodcutter',['Good oak in the wood east of here. I take one tree and plant two. My father did the same.'],name='Woodcutter Abel')
folk(80,103,'farmer',['Barley this side, oats that side, and the scarecrow keeps both. Mostly.'],name='Farmer Eli')
folk(113,92,'peasantF',['The stream runs clean again this year. You can see the stones on the bottom.'],name='Dinah')
folk(96,64,'monk',['I sweep the chapel steps every morning, though no one can go in. It is a small thing to keep faith with.'],name='Brother Cuthbert')
# signs
sign(86,92,'HEARTHVALE\nPop. small, faith large')
sign(70,68,'THE SHEEP HILL\nMind the gate. Mind the ram.')
sign(94,63,'HEARTHVALE CHAPEL\n(The doors are barred.)')
sign(102,64,'THE SCHOLAR’S WAY\n— north, through the pines')
# the place the village takes up, and the demons kept out of it
WD['villageRects'].append([X0,Y0,X1,Y1]); WD['townR']['Hearthvale']=34
for z in WD['zones']:
    if z['x0']<X1 and z['x1']>X0 and z['y0']<Y1+2 and z['y1']>Y1: z['y0']=Y1+2
WD['start']={'x':92,'y':85}
# Hearthvale's catacomb hints, as the villagers give them (SIDEQUEST_DATA.hints): the sounds, not the answer
HV=['Have you heard it? Something under Hearthvale, of a night. Ask Amos the shepherd — he hears more than the rest of us.','The chapel’s been barred from the inside for fifteen years. Nobody’s found another way in. Mind you, nobody’s looked.']
if isinstance(SQ['hints'],list): SQ['hints'][0]['out']=HV
else: SQ['hints']['0']['out']=HV

WD['raw']=base64.b64encode(bytes(raw)).decode()
new=src
for n in sorted(CON,key=lambda n:-CON[n][0]):
    i,j,o,semi=CON[n]; new=new[:i]+'const '+n+'='+json.dumps(o,separators=(',',':'),ensure_ascii=False)+(';' if semi else '')+new[j:]
open(HEAD,'w',encoding='utf-8').write(new)
print('villages: Hearthvale —',sum(1 for b in WD['buildings'] if inside(b)),'buildings,',sum(1 for v in WD['villagers'] if inside(v)),'villagers,',sum(1 for d in WD['decor'] if inside(d)),'decor')
