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
PT=json.load(open(D('data','pastimes.json'),encoding='utf-8'))   # (grow.py has just written it from the V197 backup)
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
hsh2=lambda x,y: (((x*73856093)^(y*19349663))&0xffffffff)%1000/1000
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
bld('hv_mill','The Mill','house',109,87,5,4,who=('Mill-hand Toby','peasant','Mind the stones — they’ll have your fingers. Hob says the wheel has turned since his grandfather’s day.','“I am the bread of life.” — John 6:35. Hob has it carved over the door.'))
decor('waterwheel',114,88); decor('crate',108,90)
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
folk(118,91,'peasant',['The wheel turns, the stones grind, the flour falls. There are worse ways to spend a life.'],name='Miller Hob')
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


# ════════════════════════════════════ IRONHOLD ════════════════════════════════════
# A mining town under the Iron Hills: the keep in its bailey on a rise, the chapel and the smiths' graves, a cobbled square
# about the anvil, the Great Forge and its slag, rails running east to the Deepcut — the town's first mine, whose colliers
# broke through into the galleries where the smiths bury their dead. The Elders grated it and blessed it; no one goes near.
# Since the dark came there has been knocking in it of a night (Brother Tubal, caged below, keeping count of his days).
X0,Y0,X1,Y1=76,222,143,282
ins=lambda o: X0<=o['x']<=X1 and Y0<=o['y']<=Y1
olds={(v['x'],v['y'],v['outfit']):v for v in WD['villagers'] if ins(v)}
WD['decor']=[d for d in WD['decor'] if not ins(d)]; WD['villagers']=[v for v in WD['villagers'] if not ins(v)]
for k in [k for k in WD['signs'] if ins(dict(zip('xy',map(int,k.split(',')))))]: WD['signs'].pop(k)
for y in range(Y0,Y1+1):
    for x in range(X0,X1+1):
        t=T(x,y); core=78<=x<=122 and 226<=y<=280
        if t in (3,20) and not (74<=x<=118 and 252<=y<=276): continue
        if (t in (1,7) and not core) or (t==33 and x>=123): put(x,y,t,False,0); continue   # the Iron Hills stand behind the town
        if t==2 and (y>=276 or x<=74): put(x,y,2,True,0); continue          # the road south to the forest
        put(x,y,0,True,0)
for y in range(250,278):                                                       # the old town's west wall, beside the road
    for x in (74,75):
        if T(x,y)!=2: put(x,y,0,True,0)
# the lanes: in from the west road, about the square, up to the keep, east along the rails to the Deepcut, down to the forest road
lane([(74,258),(80,259),(86,261),(94,261),(102,260),(108,259)])
lane([(93,262),(93,268),(93,276)])
lane([(92,245),(93,252),(94,258)])
lane([(80,252),(83,256),(86,260)])
lane([(108,259),(114,258),(120,257),(123,257)],t=12)                          # the old rails, sleepers and all
lane([(100,262),(106,265),(112,268),(117,267)]); lane([(86,262),(84,268),(80,274)])
for y in range(255,268):
    for x in range(85,104):
        if math.hypot((x-94)/9.0,(y-261)/5.6)<1 and T(x,y) in (0,2): put(x,y,6,True)
decor('anvilMonument',93,260); decor('brazier',87,262); decor('brazier',101,262); decor('weaponRack',99,257); decor('barrel',89,258); decor('crate',98,265); decor('lantern',95,266); decor('lantern',91,256)
# the keep, in its bailey on the rise
WD['hills'].append([92,236,13,2.4])
for x in range(85,100):
    for y in (231,245):
        if not (y==245 and 91<=x<=93): put(x,y,5,False)
for y in range(231,246):
    for x in (85,99): put(x,y,5,False)
bld('ih_keep','Ironhold Keep','keep',89,235,7,5); bld('ih_home2',"Soldier's Quarters",'house',87,240,4,3); decor('weaponRack',96,242); decor('banner2',90,240); decor('banner2',94,240)
# the chapel, and the smiths' graves about it
bld('ih_chapel','Ironhold Chapel','chapel',78,245,6,6); fence(76,242,86,253,gaps={(79,253),(80,253),(81,253)})
for gx,gy in ((77,244),(77,247),(77,250),(85,244),(85,247),(85,250)): decor('tombstone',gx,gy)
# the forge, its slag, and the rails to the Deepcut
bld('ih_forge','The Great Forge','shop',103,253,6,4); decor('slagheap',110,254); decor('slagheap',112,256); decor('logpile',102,255); decor('minecart',110,261,); 
WD['decor'][-1].update({'empty':True})
decor('minecart',118,259); WD['decor'][-1].update({'tip':True}); decor('minecart',115,261)
bld('ih_inn','The Anvil Rest Inn','inn',96,268,5,4); bld('ih_home1',"Smith's Home",'house',85,267,4,3)
IHH=[('ih_home3',"Collier Dov's Cottage",'cottage',115,263,4,3,('Dov\'s daughter','peasantF','Father won’t say the name of that mine indoors. Not even to curse it.')),
     ('ih_home4',"Zillah and Enoch's House",'house',109,266,4,3,('Their lodger','smith','Enoch goes down after the old ore carts when Zillah isn’t looking. Stubborn as pig-iron.')),
     ('ih_home5',"The Bellows-man's House",'house',81,261,4,3,('Bellows-man Joab','smith','Pump, pump, pump. Forty years. My arms are the strongest thing in Ironhold, and the dullest.')),
     ('ih_home6',"The Armourer's House",'house',100,247,5,3,('Armourer Ira','smith','Every rivet by hand. A machine would be quicker. A machine would not love it.')),
     ('ih_home7',"The Miners' Row",'house',104,272,5,3,('Miner Hosah','soldier','We work the new seams north of town now. Good iron. Nobody misses the Deepcut.')),
     ('ih_home8',"Widow Shua's House",'cottage',78,271,4,3,('Widow Shua','peasantF','My husband was a collier. He went down the Deepcut the day they broke through, and came up white as flour. He never went down a mine again.'))]
for id,nm,st,x,y,w,h,who in IHH: bld(id,nm,st,x,y,w,h,who=who)
for p in ((84,264),(97,250),(113,269),(108,275),(77,268)): decor('barrel',*p)
decor('logpile',120,265); decor('crate',119,254); decor('hsWell',89,265)
# the Deepcut itself: at the foot of the Iron Hills, grated, blessed, avoided
for y in range(252,262):
    for x in range(119,127): 
        if T(x,y) not in (12,): put(x,y,0,True,0)
for y in range(250,264):
    for x in (127,128): put(x,y,33,False,0)
sign(121,254,'THE DEEPCUT\nSealed by order of the Elders.\nGod rest them that lie within.')
WD['cata']['1']={'x':124,'y':257,'face':-math.pi/2,'grate':True,'name':'The Deepcut','where':'the Deepcut, the old sealed mine at the foot of the Iron Hills',
    'door':['The doors are barred from within. Heat comes off the iron of them, like a forge banked for the night.','Someone in Ironhold may know another way down.'],
    'doorHeard':['The doors are barred from within. Heat comes off the iron of them, like a forge banked for the night.','The knocking comes from the Deepcut. If the old galleries run under the chapel, that is the way down.'],
    'goal':'Ironhold’s chapel is barred from within. Ask around the town — someone has heard something.',
    'goalHeard':'To the Deepcut, the old sealed mine at the foot of the Iron Hills — the knocking comes from there.',
    'journal':'Ironhold’s chapel is barred. Long ago the town’s colliers, digging the Deepcut, broke through into the galleries where the smiths are buried, and the Elders sealed the mine. Since the dark came there has been knocking in it at night — three knocks, then quiet. The grate is bent outward, from the inside. The way down is there.'}
for (x,y,o),v in olds.items():
    nx,ny={'smith':(96,263),'soldier':(92,247) if (x,y)==min(k[:2] for k in olds if k[2]=='soldier') else (79,259),'smithF':(104,259)}.get(o,(94,264)); folk(nx,ny,o,v['lines'],v.get('name'),old=(x,y))
folk(113,261,'smith',['The Deepcut was the first seam Ironhold ever worked. My grandfather’s crew drove a gallery east after a good vein — and broke clean through into a hall full of the dead.','The old smiths’ galleries, shelf on shelf of them, running in under the chapel. The Elders had the Deepcut grated and blessed, and no collier has set foot in it since.','These fifteen years there’s been knocking in it of a night. Three, then quiet, then three. Somebody is keeping time down there.'],
     name='Old Dov the Collier',clue=1,after=['The knocking’s stopped. It was Brother Tubal all along — fifteen years in a cage, knocking so he’d not lose count of the days.','God forgive us. We thought he was a ghost, and we let him knock.'])
folk(89,264,'smithF',['Don’t you go near the Deepcut. The grate’s bent — outward, mind. From the inside.','My husband says it’s the old smiths at their anvils down there. I say the dead don’t keep time.'],
     name='Keziah',clue=1,after=['We had Brother Tubal to supper. He still taps three times on the table before he eats. Nobody minds.'])
folk(107,262,'child',['I dared Asa to touch the grate on the Deepcut. He said it was warm!','And there’s a light in there, way back. Nobody lights it. Nobody goes in.'],
     name='Micah',clue=1,after=['Brother Tubal showed me how he counted in the cage. Three knocks for a morning. I can do it too.'])
folk(76,257,'soldier',['Ironhold. Mind the carts, and keep out of the Deepcut.'],name='Gate-warden Ezer')
sign(77,256,'IRONHOLD\nThe Iron Hub — forge of the realm')
HI=['Stay clear of the Deepcut, knight. Whatever’s knocking in there, let it knock.','The chapel’s been barred since the dark came. Old Dov the collier knows more than he says — ask him about the Deepcut.']
if isinstance(SQ['hints'],list): SQ['hints'][1]['out']=HI
else: SQ['hints']['1']['out']=HI
WD['villageRects'].append([X0,Y0,X1,Y1]); WD['townR']['Ironhold']=34
# the dark's dome over the sealed town, and the ring that bars the way in, drawn round the whole of it (east of the road)
cx,cy,rx,ry=109,251,34,31; WD['barriers'][1]=[cx,cy,rx,ry]
ins_e=lambda x,y: ((x+0.5-cx)/rx)**2+((y+0.5-cy)/ry)**2<=1
WD['barrierSets']['1']=[c for y in range(cy-ry-1,cy+ry+2) for x in range(cx-rx-1,cx+rx+2) if ins_e(x,y) and not all(ins_e(x+a,y+b) for a,b in ((1,0),(-1,0),(0,1),(0,-1))) for c in (x,y)]
for z in WD['zones']:
    if z['x0']==67 and z['y0']==274: z.update({'x0':58,'y0':262,'x1':70,'y1':283})
    elif z['x0']==97 and z['y0']==270: z.update({'x0':144,'y0':255,'x1':160,'y1':280})


# ════════════════════════════════════ SALTMERE ════════════════════════════════════
# A harbour town, after Oceanside: the harbour basin behind its breakwaters, the quay and its fish market, a long sand beach
# with a surf break and a long pier out over the water, the Strand — a boardwalk of beach houses facing the sea — and the
# chapel on its bluff behind. West of the harbour, the Gull Head: a headland of rock with a grotto in it that only a boat can
# reach. Saltmere's fisherfolk rowed their dead in at slack water to the landing inside, and the brothers carried them down
# the sea-stair to the caves under the town (the catacomb's own story). No one has rowed in since the dark came.
X0,Y0,X1,Y1=24,666,160,745
ins2=lambda o: X0<=o['x']<=X1 and Y0<=o['y']<=Y1
olds={(v['x'],v['y'],v['outfit']):v for v in WD['villagers'] if ins2(v)}
keepD=[d for d in WD['decor'] if ins2(d) and d['kind']=='regatta']
WD['decor']=[d for d in WD['decor'] if not ins2(d)]+keepD
WD['villagers']=[v for v in WD['villagers'] if not ins2(v)]
regT=(T(88,716),raw[N+716*W+88])
for k in [k for k in WD['signs'] if ins2(dict(zip('xy',map(int,k.split(','))))) and k!='88,716']: WD['signs'].pop(k)
SEA=lambda x,y: put(x,y,3,False,0)
for y in range(Y0,Y1+1):
    for x in range(X0,X1+1):
        t=T(x,y)
        if y<=699 and x>=44: 
            if (x in (72,73) and y<=690 and t==2): put(x,y,2,True,0); continue
            if t in (1,7) and (y<=680 and (x<58 or x>150)): continue
            put(x,y,0,True,0)
        elif y>=700 and x>=44: SEA(x,y)
        elif x<44 and y>=684: SEA(x,y)
raw[88+716*W]=regT[0]; raw[N+716*W+88]=regT[1]
# the Gull Head: a headland of rock, its grotto, the landing and the channel in from the open sea under an arch
for y in range(682,720):
    for x in range(24,54):
        if ((x-38)/14.0)**2+((y-700)/17.0)**2<=1 or (40<=x<=51 and 688<=y<=713): put(x,y,33,False,0)
for y in range(704,722):
    for x in (37,38): SEA(x,y)
for y in range(700,706):
    for x in range(33,43): SEA(x,y)
for y in range(695,700):
    for x in range(34,42): put(x,y,19,True,0)
# the harbour: basin, breakwaters, quay and slips
for y in range(700,716):
    for x in range(52,77): SEA(x,y)
for y in range(696,718):
    for x in (77,78): put(x,y,33,False,0)
for x in range(60,79):
    for y in (716,717): put(x,y,33,False,0)
for y in range(693,700):
    for x in range(44,77): put(x,y,6,True,0)
for px in (56,63,70):
    for y in range(700,709):
        for x in (px,px+1): put(x,y,12,True,0)
WD['decor'].append({'x':60,'y':716,'kind':'lighthouse','w':2})
PT['boat']=[{'x':58,'y':703,'kind':'boat','w':2}]; WD['decor'].append({'x':58,'y':703,'kind':'boat','w':2})
for p in ((50,696),(74,695)): decor('netRack',*p)
for p in ((59,697),(66,697),(72,698),(47,694)): decor('fishBarrel',*p)
decor('crate',53,697); decor('crate',68,694)
# the beach, the surf, the pier
for y in range(693,701):
    for x in range(79,153): put(x,y,19,True,0)
for y in (701,702):
    for x in range(79,153): put(x,y,20,True,0)
surf=[]
for y in (703,704,705):
    for x in range(86,151):
        if x in (111,112,113,114): continue
        put(x,y,21,True,0); surf.append([x,y])
PT['surf']=surf
for y in range(690,729):
    for x in (112,113): put(x,y,12,True,0)
for y in range(724,729):
    for x in range(109,117): put(x,y,12,True,0)
decor('lantern',109,724); decor('lantern',116,724)
WD.setdefault('piers',[]); WD['piers']=[q for q in WD['piers'] if not (X0<=q[0]<=X1 and Y0<=q[1]<=Y1)]+[[112,700,113,723],[109,724,116,728]]
decor('lifeguard',98,697); decor('lifeguard',132,697)
for p in ((84,694),(143,694),(151,695),(118,694)): decor('palm',*p)
for p in ((91,698),(124,698),(139,697)): decor('umbrella',*p)
decor('sandcastle',104,699)
# the Strand: a boardwalk behind the beach, from the quay to the east road
for y in (691,692):
    for x in range(44,160):
        if T(x,y)!=12: put(x,y,12,True,0)
for x in range(150,161):
    for y in (690,693): put(x,y,2,True,0)
# the harbour village on the quay, and the beach houses along the Strand (every door to the sea)
bld('sm_market','Fish Market','shop',52,685,6,4)
bld('sm_harbour',"The Harbourmaster's House",'house',60,685,5,4,who=('Harbourmaster\'s wife','peasantF','He keeps the tide-book on the kitchen table. I keep the kettle on it.'))
bld('sm_chandler',"The Chandlery",'shop',67,686,4,3,who=('Chandler Silas','merchant','Rope, pitch, hooks and lamp-oil. Everything a boat needs but courage.'))
bld('sm_inn','The Salty Anchor','inn',104,686,6,4)
bld('sm_home1',"Fisher's Cottage",'cottage',80,687,4,3); bld('sm_home2',"Netmender's Hut",'house',86,687,4,3)
SMH=[('sm_home3',"The Surf Shack",'cottage',94,687,4,3,('Surfer Asa','sailor','The swell comes in off the deep water and stands up on the bar by the pier. Best wave in the realm. Ask anyone.')),
     ('sm_home4',"The Lifeguard's House",'house',118,687,4,3,('Lifeguard Mara','peasantF','I watch the water from the tower all day. Kids, crabbers, fools on boards. I have not lost one yet.')),
     ('sm_home5',"Old Peter's Cottage",'cottage',125,687,4,3,('Old Peter\'s grandson','child','Grandpa talks to Grandma Dorcas every night. She’s been gone fifteen years.')),
     ('sm_home6',"The Shell-seller's House",'house',132,687,4,3,('Shell-seller Joanna','peasantF','Every shell on this beach was a house once. Something lived in it. I think about that.')),
     ('sm_home7',"Rhoda and Jonah's House",'house',139,687,4,3,('Their aunt','peasantF','Jonah will climb anything. Rhoda worries enough for both of them.')),
     ('sm_home8',"The Boatwright's House",'house',146,687,5,3,('Boatwright Ebed','woodcutter','Oak for the keel, larch for the planks, and patience for the rest.')),
     ('sm_home9',"The Sailmaker's Cottage",'cottage',92,676,4,3,('Sailmaker Tabitha','peasantF','A good sail is a prayer you can see. Well. That’s what my mother said.')),
     ('sm_home10',"The Cooper's House",'house',132,673,4,3,('Cooper Hiram','smith','Herring barrels. Ten thousand of them, give or take. I stopped counting. The General never did.'))]
for id,nm,st,x,y,w,h,who in SMH: bld(id,nm,st,x,y,w,h,who=who)
# the chapel on its bluff, and the little square below it
WD['hills'].append([113,671,10,2.2])
bld('sm_chapel','Saltmere Chapel','chapel',110,670,6,6); fence(106,667,120,678,gaps={(112,678),(113,678),(114,678)})
for gx,gy in ((107,669),(107,672),(107,675),(119,669),(119,672),(119,675)): decor('tombstone',gx,gy)
decor('netRack',117,676)
for y in range(677,684):
    for x in range(116,133):
        if math.hypot((x-124)/7.5,(y-680)/3.4)<1: put(x,y,6,True,0)
decor('marketStall',121,679,2); decor('lantern',127,679); decor('palm',117,681); decor('palm',131,680); decor('fountain',124,680,2)
lane([(124,690),(124,683)]); lane([(117,680),(113,679)]); lane([(98,681),(110,681),(116,680)]); lane([(72,690),(72,684),(80,681),(98,681)])
for s_ in PT['reuben']['spots']:
    if ins2(s_): s_.update({'x':128,'y':682})
for q in PT['trade']['points'].values():
    if ins2(q): q.update({'x':120,'y':683,'dx':120,'dy':682})
# the lonely island, a little further out to sea, its secret with it
for y in range(706,720):
    for x in range(79,145):
        if T(x,y) not in (21,12) and not (x==88 and y==716): SEA(x,y)
IX,IY=122,742
for y in range(IY-8,IY+9):
    for x in range(IX-9,IX+10):
        d=math.hypot((x-IX)/1.2,y-IY)
        if d<=4.5: put(x,y,1 if d<1.8 and (x+y)%2 else 0,not (d<1.8 and (x+y)%2),0)
        elif d<=6.5: put(x,y,19,True,0)
        elif d<=8.5: put(x,y,20,True,0)
for s_ in PT['secrets']:
    if s_['id']=='isle': s_['x'],s_['y']=IX,IY
# the people
for (x,y,o),v in olds.items():
    nx,ny={('fisher'):(66,694),('fisherF'):(55,690),('sailor'):(108,697),('child'):(100,696),('peasant'):(126,684)}.get(o,(90,690))
    while any(v2['x']==nx and v2['y']==ny for v2 in WD['villagers']): nx+=2
    folk(nx,ny,o,v['lines'],v.get('name'),old=(x,y))
folk(70,693,'fisher',['When a Saltmere man died, we rowed him out to the Gull Head at slack water and in under the arch to the landing. The brothers met us there and carried him down the sea-stair.','There’s no path round the Head. Never was. You go by boat, or you don’t go.','Nobody has rowed in since the dark came. Nobody will.'],
     name='Old Ezra',clue=2,after=['They rowed old Mattan in under the Gull Head last week, the way it was done. The brothers met us on the landing. First time in fifteen years.'])
folk(60,690,'fisherF',['At the turn of the tide there’s a bell from under the Gull Head. Small, like a ship’s bell. Clear as you like across the harbour.','There is no bell in there, knight. There never was.'],
     name='Fishwife Leah',clue=2,after=['The bell under the Gull Head still rings at the turn of the tide. But it’s the brothers ringing it now, and it sounds glad.'])
folk(93,696,'child',['Jonah rowed his uncle’s skiff in under the Gull Head after crabs! He says there’s a landing in there with steps going down into the rock.','Rhoda boxed his ears. I’d have gone with him.'],
     name='Tobit',clue=2,after=['Jonah says you came down the steps with a lamp and brought him home. Is it true you rang the tide out?'])
folk(64,690,'sailor',['Your boat, knight? If you’ve left her somewhere you can’t walk to, say the word and the harbour lads will row her round to the quay.'],name='Harbourmaster Bart')
WD['villagers'][-1]['role']='harbour'
folk(120,697,'sailor',['Paddle out past the shallows by the pier and wait for the set. The third wave’s always the best.'],name='Surfer Zeb')
folk(112,726,'fisher',['Fish bite best off the end of the pier at the turn of the tide. I’ve been out here forty years, give or take a storm.'],name='Pier-fisher Jude')
sign(78,690,'SALTMERE\nThe salt-kissed port'); sign(100,693,'SURF SPOT\nThe swells stand up on the bar by the pier. Face the surf and paddle out.')
sign(125,693,'THE SHORE\nFace the surf, press to paddle out.'); sign(46,693,'THE GULL HEAD\nNo path round it. The fishermen keep their distance.')
sign(110,690,'THE PIER\nMind the gaps in the boards.')
WD['cata']['2']={'x':37,'y':696,'face':0,'name':'The sea-stair under the Gull Head','arch':[37.5,712,3.2],
    'where':'the Grotto under the Gull Head — only a boat can reach it',
    'door':['The doors are barred from within. Salt water seeps out from under them, though the chapel stands high and dry.','Someone on the quay may know another way down.'],
    'doorHeard':['The doors are barred from within. Salt water seeps out from under them, though the chapel stands high and dry.','The bell rings from the Grotto under the Gull Head. The old way down is there — by boat.'],
    'goal':'Saltmere’s chapel is barred from within. Ask on the quay — someone has heard something.',
    'goalHeard':'Sail into the Grotto under the Gull Head — your boat is moored in the harbour.',
    'journal':'Saltmere’s chapel is barred. The fisherfolk used to row their dead in under the Gull Head, the headland west of the harbour, to a landing where the brothers carried them down the sea-stair into the caves under the town. Since the dark came a small bell rings in there at the turn of the tide. There is no path round the Head — I will need the boat.'}
HS=['Nobody rows near the Gull Head since the dark came. Ask old Ezra on the quay — he rowed the dead in there himself, once.','The chapel’s been barred fifteen years. If there’s another way down, it’s by water.']
if isinstance(SQ['hints'],list): SQ['hints'][2]['out']=HS
else: SQ['hints']['2']['out']=HS
WD['villageRects'].append([44,666,160,700]); WD['townR']['Saltmere']=40
cx,cy,rx,ry=92,700,67,33; WD['barriers'][2]=[cx,cy,rx,ry]
ins_e=lambda x,y: ((x+0.5-cx)/rx)**2+((y+0.5-cy)/ry)**2<=1
WD['barrierSets']['2']=[c for y in range(cy-ry-1,cy+ry+2) for x in range(cx-rx-1,cx+rx+2) if ins_e(x,y) and not all(ins_e(x+a,y+b) for a,b in ((1,0),(-1,0),(0,1),(0,-1))) for c in (x,y)]
# the sea's fishing spots along the new shore
for k in [k for k,v in PT['fishSpots'].items() if v=='sea' and ins2(dict(zip('xy',map(int,k.split(',')))))]: PT['fishSpots'].pop(k)
for y in range(Y0,Y1+1):
    for x in range(X0,X1+1):
        if T(x,y) in (3,20) and any((raw[N+(y+b)*W+x+a]>>4) and T(x+a,y+b) not in (3,20,21) for a,b in ((1,0),(-1,0),(0,1),(0,-1))): PT['fishSpots'].setdefault(f"{x},{y}",'sea')

# ════════════════════════════════════ THORNWOOD ════════════════════════════════════
# The village up in the trees. Five giant trees stand about the road through the wood, a deck of planks round each, the
# houses built on the decks — the chapel too, on the greatest of them, the Chapel Oak — and rope bridges between them that
# sway as you cross; ladders go up from the forest floor (WORLD_DATA.treetops; engine/treetops.js). On the ground: the road,
# the fire-ring where the hunters sit of an evening, the Hollow Log Inn, and the lumber yard with its saw-pit and stacks.
# West, out in the deep wood over the brook, the Old Stones: a ring older than the village round a sunken stone well with a
# stair going down — where the woodsmen carried their dead, down into the root-crypts. Of late, sounds come up from it.
X0,Y0,X1,Y1=236,466,310,528
ins3=lambda o: X0<=o['x']<=X1 and Y0<=o['y']<=Y1
olds={(v['x'],v['y'],v['outfit']):v for v in WD['villagers'] if ins3(v)}
WD['decor']=[d for d in WD['decor'] if not ins3(d)]; WD['villagers']=[v for v in WD['villagers'] if not ins3(v)]
POOL={k:v for k,v in WD['signs'].items() if v.startswith('FOREST POOL')}
for k in [k for k in WD['signs'] if ins3(dict(zip('xy',map(int,k.split(',')))))]: WD['signs'].pop(k)
for y in range(Y0,Y1+1):
    for x in range(X0,X1+1):
        t=T(x,y)
        if t in (3,20,21): continue
        sq=262<=x<=302 and 484<=y<=512                                     # the old fenced square: gone
        core=258<=x<=305 and 474<=y<=522
        if sq and t not in (1,7): put(x,y,0,True,0); continue
        if core and t in (1,7,33) and (hsh2(x,y)<0.8 or sq): put(x,y,0,True,0); continue   # thinned: a few saplings stay among the giants
        if core and t in (5,9,14,15,16,32,6): put(x,y,0,True,0)
        if t==2 and 262<=x<=302 and 474<=y<=522: put(x,y,0,True,0)
for y in range(486,523):                                                    # the commons and the lumber yard: open ground, no saplings
    for x in range(268,307):
        if T(x,y) in (1,7,33) and (y>=505 and x>=285 or 269<=x<=292 and y<=511): put(x,y,0,True,0)
# the giants' decks, and the ground under them clear (you walk under them)
DECKS=[dict(x0=262,y0=476,x1=276,y1=489,h=5.0,tree=[266.0,482.0,2.0],name='The Chapel Oak'),
       dict(x0=289,y0=478,x1=299,y1=487,h=5.0,tree=[296.5,482.5,1.6],name='The Lodge Tree'),
       dict(x0=292,y0=493,x1=302,y1=502,h=5.0,tree=[299.0,496.0,1.5],name='The Forester’s Tree'),
       dict(x0=257,y0=494,x1=268,y1=503,h=5.0,tree=[261.0,497.0,1.5],name='The Trapper’s Tree'),
       dict(x0=264,y0=508,x1=275,y1=518,h=5.0,tree=[268.0,512.0,1.6],name='The Burner’s Tree')]
for d in DECKS:
    for y in range(d['y0']-1,d['y1']+2):
        for x in range(d['x0']-1,d['x1']+2):
            if T(x,y) not in (3,20): put(x,y,0,True,0)
BRIDGES=[dict(da=0,db=1,a=[276.6,486.5],b=[289.4,486.5],w=1.3),
         dict(da=1,db=2,a=[294.5,487.6],b=[295.5,493.4],w=1.3),
         dict(da=0,db=3,a=[265.5,489.6],b=[263.5,494.4],w=1.3),
         dict(da=3,db=4,a=[265.5,503.6],b=[268.5,508.4],w=1.3)]
LADDERS=[dict(deck=0,x=276,y=488,dx=1,dy=0),dict(deck=2,x=300,y=502,dx=0,dy=1),dict(deck=4,x=275,y=510,dx=1,dy=0)]
WD.setdefault('flats',[]).append([256,472,306,524])
WD['treetops']={'decks':DECKS,'bridges':BRIDGES,'ladders':LADDERS,'rect':[X0,Y0,X1,Y1]}
def bldUp(id,name,style,x,y,w,h,deck,template='home1',who=None):
    """a house on a deck up a tree: no footprint on the ground (you walk under it); world.js leaves its drawing to the treetops"""
    b=next((b for b in WD['buildings'] if b['id']==id),None)
    if b is None: b={'id':id}; WD['buildings'].append(b)
    dx=x+w//2; b.update({'name':name,'style':style,'x':x,'y':y,'w':w,'h':h,'door':{'x':dx,'y':y+h-1},'interior':b.get('interior') or id,'deck':deck})
    if b['interior'] not in INT:
        I=copy.deepcopy(INT[template]); I['name']=name
        for n in I.get('npcs',[]):
            if who: n['name'],n['voutfit'],n['lines']=who[0],who[1],list(who[2:])
        INT[b['interior']]=I
    return b
bldUp('tw_chapel','Thornwood Chapel','chapel',270,477,6,6,0)
bldUp('tw_home1',"Hunter's Lodge",'cottage',289,478,5,4,1)
bldUp('tw_home2',"Forester's Hut",'house',293,498,4,3,2)
bldUp('tw_home3',"The Trapper's Treehouse",'cottage',263,499,5,3,3,who=('Trapper Ruth','hunterF','Mind your head on the snares. Rabbit, mostly — and once a fox who stole the lot.','Benji sleeps up in the crook of the tree when it’s warm. Says he can see the Old Stones from there.'))
bldUp('tw_home4',"The Charcoal-Burner's Treehouse",'house',269,514,5,3,4,who=('Burner Amos','peasant','Smoke in my beard, soot in my bread. The best charcoal in the realm comes off my mound.','I sleep up here to be clear of the smoke. And of whatever walks the wood at night.'))
# the road through the wood, the trail out to the Old Stones, the way into the lumber yard, paths to the ladders' feet
lane([(283,466),(283,480),(282,492),(281,504),(281,512),(281,528)],w=3)
lane([(279,492),(270,491),(260,491),(253,492),(249,495),(250,497)])
lane([(282,507),(288,515)]); lane([(277,489),(280,490)]); lane([(300,504),(296,505),(292,507)]); lane([(277,511),(279,507)])
# the ground village: the fire-ring by the road, the Hollow Log Inn, the well
bld('tw_inn','Hollow Log Inn','inn',285,502,6,4)
decor('campfire',275,498); decor('stump',273,497); decor('stump',277,496); decor('stump',274,500); decor('stump',277,500)
decor('hsWell',287,494); decor('lantern',279,488); decor('lantern',285,489); decor('lantern',279,505); decor('tent',289,496,2)
decor('netRack',272,494); decor('mushroom',270,505); decor('mushroom',286,499); decor('logpile',284,507); decor('barrel',291,503)
# the lumber yard, south-east: the trade's shop, the saw-pit, timber stacked to season, the log cart
fence(288,512,305,521,gaps={(296,512),(297,512),(298,512),(288,515),(288,516),(288,517)})
bld('tw_shop',"Woodcutter's Trade",'shop',295,508,5,4)
decor('sawpit',291,514,2); decor('timber',300,514,2); decor('timber',302,518); decor('logpile',293,518); decor('logpile',296,519); decor('logpile',290,519)
decor('chopblock',298,516); decor('stump',303,514); decor('haycart',289,509,2); decor('crate',294,512); decor('crate',301,511); decor('lantern',299,512)
# the Old Stones, in the deep wood across the brook: a clearing ringed by the old trees
CX,CY=243,497
for y in range(CY-9,CY+10):
    for x in range(CX-10,CX+11):
        d=math.hypot((x+0.5-CX-0.5)/1.1,y+0.5-CY-0.5)
        if T(x,y) in (3,20): continue
        if d<7.6: put(x,y,0,True,0)
        elif d<9.2 and T(x,y) not in (1,7): put(x,y,1 if hsh2(x,y)<0.55 else 0,hsh2(x,y)>=0.55,0)
for p in ((236,494),(238,503),(249,491),(240,489),(247,504)): decor('mushroom',*p)
WD['cata']['3']={'x':CX,'y':CY,'face':math.pi/2,'name':'The Old Stones','where':'the Old Stones, the ring in the deep wood west of the village',
    'door':['The doors are barred from within. Roots have grown over the threshold — and they are moving, very slowly.','Perhaps someone down in the village knows another way in.'],
    'doorHeard':['The doors are barred from within. Roots have grown over the threshold — and they are moving, very slowly.','The sounds come from the Old Stones in the wood to the west. The woodsmen’s way down to their dead is there.'],
    'goal':'Thornwood’s chapel up in the Chapel Oak is barred. Ask about the village — someone has heard something.',
    'goalHeard':'Out to the Old Stones in the deep wood west of the village — the sounds come from there.',
    'wayIn':'out in the deep wood west of the village the Old Stones stand in their ring round a sunken stone well, and a stair goes down it into the root-crypts.',
    'journal':'Thornwood’s chapel, up in the Chapel Oak, is barred. The woodsmen used to carry their dead out to the Old Stones — a ring in the deep wood, older than the village — and down the stair in the stone well at its middle, into the crypts that run under the village to the oak’s roots. Since the dark came, there are sounds from the ring at night.'}
# the people: those who were here (moved, with their stories), those who live here now — some on the ground, some up the trees
mv={(277,498,'hunter'):(276,501,None),(286,497,'woodcutter'):(299,500,2),(283,500,'hunterF'):(292,485,1),(279,495,'woodcutter'):(301,517,None)}
for (x,y,o),v in olds.items():
    nx,ny,dk=mv.get((x,y,o),(278,502,None)); folk(nx,ny,o,v['lines'],v.get('name'),old=(x,y))
    if dk is not None: WD['villagers'][-1]['deck']=dk
folk(271,492,'hunter',['I followed a hart out past the brook last week, right to the Old Stones. It stopped dead at the edge of the ring and would not go in — stood there trembling, and then it ran.','The deer won’t cross the ring. Never would. But they used to graze up to it.','And there’s singing in the ground there, of a night. Low. Like it comes up the well.'],
     name='Old Esau',clue=3,after=['The deer graze in the ring again. I saw a doe drink from the brook by the Stones this morning, easy as you like.','You went down the well, didn’t you. God keep you, knight.'])
folk(293,516,'peasantF',['When we fell timber out west by the Old Stones, every stroke of the axe comes back up out of the ground — a beat late.','Like something down there is knocking back.','The lads won’t cut west of the brook now. I don’t blame them.'],name='Sawyer Hannah',clue=3,after=['We’re cutting west of the brook again. The axe-strokes only come back off the trees now, the way they should.'])
folk(259,502,'child',['From up here you can see over the trees to the Old Stones! At night there’s a light down in the middle of the ring — low and blue, like a candle in a well.','Ma says it’s marsh-fire. There isn’t any marsh.'],name='Benji',clue=3,after=['The blue light’s gone from the Stones. Ma says I can go and see them in the daytime now — if I take Esau.'])
WD['villagers'][-1]['deck']=3
folk(274,486,'monk',['I sweep the deck before the chapel every morning, though no one can go in. Roots have grown over the door, knight — up here, fifty feet from the ground.'],name='Brother Hollis')
WD['villagers'][-1]['deck']=0
folk(266,517,'peasant',['Up here we sleep above the smoke and the wolves both. My grandfather built this deck, and his father the one below it.'],name='Burner’s boy Caleb')
WD['villagers'][-1]['deck']=4
folk(290,519,'woodcutter',['Fell one, plant two. That’s the Thornwood law, and the wood’s still here, isn’t it.'],name='Woodcutter Gideon')
folk(278,486,'hunterF',['The ladder’s sound, knight — up you go. The chapel’s at the top of the Chapel Oak, and the bridges take you to the rest of us.','Mind the bridges. They sway. That’s how you know they’re good rope.'],name='Ladder-keeper Mags')
sign(285,473,'THORNWOOD\nWhere the old trees keep watch'); sign(258,489,'THE OLD STONES\n— west, over the brook. The woodsmen keep away.')
sign(279,487,'THE CHAPEL OAK\nThe chapel is up the ladder. (Its doors are barred.)'); sign(287,511,'THE LUMBER YARD\nFell one, plant two.')
for k,v in POOL.items():
    x,y=map(int,k.split(','))
    if T(x,y) not in (3,20): put(x,y,16,False)
    WD['signs'][k]=v
HT=['Strange things in the deep wood lately. Ask old Esau — he hunts out past the Old Stones.','The chapel up in the Chapel Oak’s been barred fifteen years. Nobody’s found another way in.']
if isinstance(SQ['hints'],list): SQ['hints'][3]['out']=HT
else: SQ['hints']['3']['out']=HT
WD['villageRects'].append([X0,Y0,X1,Y1]); WD['townR']['Thornwood']=38
cx,cy,rx,ry=272,497,38,27; WD['barriers'][3]=[cx,cy,rx,ry]
ins_e=lambda x,y: ((x+0.5-cx)/rx)**2+((y+0.5-cy)/ry)**2<=1
WD['barrierSets']['3']=[c for y in range(cy-ry-1,cy+ry+2) for x in range(cx-rx-1,cx+rx+2) if ins_e(x,y) and not all(ins_e(x+a,y+b) for a,b in ((1,0),(-1,0),(0,1),(0,-1))) for c in (x,y)]
for z in WD['zones']:
    if z['x0']<X1 and z['x1']>X0 and z['y1']>cy-ry-2 and z['y0']<cy+ry+2:
        if z['y0']<cy-ry-2: z['y1']=cy-ry-3
        elif z['y1']>cy+ry+2: z['y0']=cy+ry+3

# ════════════════════════════════════ DUSTHAVEN ════════════════════════════════════
# The caravan town at the edge of the sand: a spring-fed pool in a ring of date palms, flat-roofed adobe houses stepping up a
# low ridge to the chapel at its top, the market square by the Caravan Bazaar with the old town well in the middle of it —
# dry since the night the chapel was barred — the bazaar street under its awnings, and the caravan yard by the south road
# where the camels kneel. The well goes down into the cisterns the town's fathers cut; of late, something answers from it.
X0,Y0,X1,Y1=246,236,318,300
ins4=lambda o: X0<=o['x']<=X1 and Y0<=o['y']<=Y1
olds={(v['x'],v['y'],v['outfit']):v for v in WD['villagers'] if ins4(v)}
WD['decor']=[d for d in WD['decor'] if not ins4(d)]; WD['villagers']=[v for v in WD['villagers'] if not ins4(v)]
for k in [k for k in WD['signs'] if ins4(dict(zip('xy',map(int,k.split(',')))))]: WD['signs'].pop(k)
for k in [k for k,v in PT['fishSpots'].items() if v=='oasis' and ins4(dict(zip('xy',map(int,k.split(',')))))]: PT['fishSpots'].pop(k)
for y in range(Y0,Y1+1):
    for x in range(X0,X1+1):
        t=T(x,y); core=math.hypot((x-285)/29.0,(y-268)/29.5)+0.16*math.sin(x*0.37+y*0.11)+0.1*math.sin(y*0.53-x*0.21)+0.06*(hsh2(x,y)-0.5)<1.0
        if t in (3,20) and not (262<=x<=300 and 254<=y<=284): continue      # the rivers either side stay
        if not core and t in (1,7,33): continue
        if core or t in (5,9,14,16,6,2,19): put(x,y,19 if core else 0,True,0)
# the oasis: a spring pool in a ring of green and date palms
OX,OY=276,264
for y in range(OY-10,OY+11):
    for x in range(OX-14,OX+15):
        d=math.hypot((x+0.5-OX)/6.5,(y+0.5-OY)/4.5)
        if d<0.62: put(x,y,3,False,0)
        elif d<1.0: put(x,y,20,True,0); PT['fishSpots'][f"{x},{y}"]='oasis'
        elif d<1.25: put(x,y,19,True,0)
        elif d<1.95: put(x,y,4 if hsh2(x,y)<0.25 else 0,True,0)
for i in range(14):
    a=i/14*math.pi*2+0.2; r=1.45+0.25*hsh2(i,7); x=int(OX+math.cos(a)*6.5*r); y=int(OY+math.sin(a)*4.5*r)
    if T(x,y) in (0,4): decor('palmDesert',x,y)
# the roads: in from the north past the pool, the bazaar street east-west, south to the caravan yard and the road out
lane([(266,236),(266,252),(267,262),(270,272),(273,277)])
lane([(260,277),(306,277)],w=3)
lane([(283,278),(283,300)],w=3)
lane([(288,249),(288,256),(288,262)]); lane([(300,268),(296,272),(293,276)]); lane([(270,256),(276,252),(281,250)])
# the market square, the dry well in its middle, the Caravan Bazaar on its east side
for y in range(262,275):
    for x in range(282,296):
        if T(x,y) in (19,0,2): put(x,y,6,True,0)
bld('dh_bazaar','Caravan Bazaar','shop',296,263,5,4); decor('awning',296,268,2); decor('waterjug',295,262); decor('crate',301,262)
for p in ((283,263),(294,273),(283,273)): decor('lantern',*p)
decor('waterjug',285,266); decor('waterjug',291,271); decor('barrel',293,264)
# the chapel up on the ridge, the adobe houses stepping up to it
WD['hills'].append([288,246,12,2.6])
bld('dh_chapel','Dusthaven Chapel','chapel',285,242,6,6)
for p in ((283,246),(292,246),(283,243),(292,243)): decor('palmDesert',*p)
H4=[('dh_home3',"The Water-Seller's House",'house',275,248,4,3,('Old Zillah','nomadF','Water was a copper a jar when I was a girl. Now it comes free from the spring — praise God — and I sell the jars.')),
    ('dh_home4',"The Potter's House",'house',296,246,4,3,('Potter Ezer','nomad','Every jar in the bazaar came off my wheel. The cracked ones I keep. They hold flowers well enough.')),
    ('dh_home5',"The Weaver's House",'cottage',301,252,5,3,('Weaver Tamar','nomadF','Camel-hair for the tent-cloth, goat-hair for the ropes. Feel how the weave keeps the sand out.')),
    ('dh_home6',"The Spice-Merchant's House",'house',269,248,4,3,('Spice-merchant Asa','merchantD','Cumin, coriander, saffron from over the dunes. Sniff that — no, not too close.')),
    ('dh_home7',"The Camel-Driver's House",'cottage',297,282,4,3,('Driver Joab\'s wife','nomadF','He’s out in the yard with the beasts. He talks to that grey camel more than to me.')),
    ('dh_home8',"The Date-Grower's House",'house',264,282,4,3,('Date-grower Uzzi','nomad','Twelve palms by the pool, and every one older than me. The sweetest dates in the realm. Have one.'))]
for id,nm,st,x,y,w,h,who in H4: bld(id,nm,st,x,y,w,h,who=who)
bld('dh_inn','The Oasis Rest','inn',257,262,5,4); decor('tent',255,268,2); decor('waterjug',262,266)
bld('dh_home1','Adobe Dwelling','cottage',272,281,5,4); bld('dh_home2',"Nomad's Tent-Home",'house',288,282,4,3)
# the bazaar street: stalls under awnings on both hands
for x in (262,268,276,288,298,304):
    decor('awning',x,274,2)
for x in (266,278,292,302):
    if T(x,280) in (19,0,2): decor('awning',x,280,2)
decor('marketStall',270,274,2); decor('farmStand',300,280); decor('crate',281,280); decor('waterjug',286,280)
# the caravan yard by the south road: the corral, camels kneeling and standing, the wagons, tents
fence(300,286,315,297,gaps={(300,290),(300,291),(300,292)})
for p in ((303,289),(307,288),(311,291),(304,294),(309,295)): decor('camel',*p)
decor('mule',313,288); decor('haycart',290,292,2); decor('haycart',293,296,2); decor('tent',287,289,2); decor('tent',295,290,2); decor('waterjug',299,288); decor('crate',299,296)
lane([(284,291),(300,291)])
for i in range(22):
    a_=i/22*math.pi*2; r_=27+4*hsh2(i,3); x=int(285+math.cos(a_)*r_); y=int(268+math.sin(a_)*r_)
    if T(x,y) in (19,0): decor('cactus',x,y)
WD['cata']['4']={'x':288,'y':268,'face':0,'name':'The dry well','where':'the dry well in the middle of the market square',
    'door':['The doors are barred from within. Sand has drifted against them from the inside — fine and pale, the sand from deep down.','Someone in the market may know another way in.'],
    'doorHeard':['The doors are barred from within. Sand has drifted against them from the inside — fine and pale, the sand from deep down.','The sounds come up the dry well in the market square. The old cisterns are under it.'],
    'goal':'Dusthaven’s chapel is barred from within. Ask in the market — someone has heard something.',
    'goalHeard':'Down the dry well in the middle of the market square — the sounds come up from there.',
    'wayIn':'in the middle of the market square the old town well has run dry, and a rope ladder hangs down its shaft into the cisterns below.',
    'journal':'Dusthaven’s chapel is barred. The town well in the market square ran dry the night it was barred, and the cisterns the town’s fathers cut — where the caravan-folk bury their dead — are under it. Since then, things answer from the bottom of the well. There is a rope ladder down it.'}
mv={}
for i,((x,y,o),v) in enumerate(olds.items()):
    nx,ny=[(272,258),(299,270),(279,269),(290,279),(268,276)][i%5]; folk(nx,ny,o,v['lines'],v.get('name'),old=(x,y))
folk(286,270,'nomadF',['Drop a pebble down the old well and you don’t hear it land, knight. You hear it come back up — rolled, all the way, up the stones, and out at your feet.','I’ve done it three times. I won’t do it a fourth.'],name='Miriam the Water-Carrier',clue=4,after=['The well’s sweet again! I let my jar down this morning and it came up full and cold.'])
folk(305,290,'nomad',['Thirty years I’ve brought caravans in to Dusthaven. The well went dry the night the chapel was barred — the very night.','Now at noon, with the sun straight down the shaft, there’s a glint at the bottom, like a mirror turning. And under it, singing. Hymns, knight — but the words are wrong.'],name='Hosea the Caravan-Master',clue=4,after=['Noon in the market, and the glint’s still down the well — but the singing’s right again. The words are the old words.'])
folk(281,266,'child',['I let our bucket down the old well on Papa’s longest rope. Something at the bottom tugged it — twice! — and let go.','Papa says it was the rope catching. Ropes don’t tug.'],name='Little Nadab',clue=4,after=['Papa let me drop the bucket down the well and it came up with WATER. Did you do that?'])
folk(310,293,'nomad',['Kneel, Sheba. Kneel. — There. She kneels for nobody but me and the Lord’s own sunset.'],name='Driver Joab')
folk(267,259,'nomadF',['The spring has never failed, not in the worst summer. My grandmother said God set it here for the caravans, the way He set the rock for Moses.'],name='Abigail at the Pool')
folk(290,252,'monk',['I sweep the chapel steps each morning. The sand comes back each night — from under the door.'],name='Brother Shem')
sign(268,240,'DUSTHAVEN\nWater and shade for the caravans'); sign(286,298,'THE CARAVAN YARD\nCamels watered, wagons mended.')
sign(287,258,'THE MARKET SQUARE\n(The town well has been dry these fifteen years.)')
HD=['Have you heard what comes up the old well at night? Ask Hosea in the caravan yard — he’s heard it longest.','The chapel’s been barred from the inside fifteen years. The well went dry the same night.']
if isinstance(SQ['hints'],list): SQ['hints'][4]['out']=HD
else: SQ['hints']['4']['out']=HD
WD['villageRects'].append([X0,Y0,X1,Y1]); WD['townR']['Dusthaven']=36; WD.setdefault('flats',[]).append([256,255,316,298])
cx,cy,rx,ry=284,268,36,31; WD['barriers'][4]=[cx,cy,rx,ry]
ins_e=lambda x,y: ((x+0.5-cx)/rx)**2+((y+0.5-cy)/ry)**2<=1
WD['barrierSets']['4']=[c for y in range(cy-ry-1,cy+ry+2) for x in range(cx-rx-1,cx+rx+2) if ins_e(x,y) and not all(ins_e(x+a,y+b) for a,b in ((1,0),(-1,0),(0,1),(0,-1))) for c in (x,y)]
for z in WD['zones']:
    if z['x0']<cx+rx+2 and z['x1']>cx-rx-2 and z['y0']<cy+ry+2 and z['y1']>cy-ry-2 and z['x1']-z['x0']<20: z['x1']=cx-rx-3; z['x0']=z['x1']-10
for q in PT['trade']['points'].values():
    if ins4(q): q.update({'x':291,'y':276,'dx':291,'dy':275})

WD['raw']=base64.b64encode(bytes(raw)).decode()
new=src
for n in sorted(CON,key=lambda n:-CON[n][0]):
    i,j,o,semi=CON[n]; new=new[:i]+'const '+n+'='+json.dumps(o,separators=(',',':'),ensure_ascii=False)+(';' if semi else '')+new[j:]
open(HEAD,'w',encoding='utf-8').write(new)
json.dump(PT,open(D('data','pastimes.json'),'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
hv=lambda o: 58<=o['x']<=136 and 42<=o['y']<=113
print('villages: Hearthvale —',sum(1 for b in WD['buildings'] if hv(b)),'buildings,',sum(1 for v in WD['villagers'] if hv(v)),'villagers | Ironhold —',sum(1 for b in WD['buildings'] if 76<=b['x']<=143 and 222<=b['y']<=282),'buildings | Saltmere —',sum(1 for b in WD['buildings'] if ins2(b)),'buildings,',sum(1 for v in WD['villagers'] if ins2(v)),'villagers | Thornwood —',sum(1 for b in WD['buildings'] if ins3(b)),'buildings,',sum(1 for v in WD['villagers'] if ins3(v)),'villagers')
