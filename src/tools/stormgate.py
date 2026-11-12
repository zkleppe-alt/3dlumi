#!/usr/bin/env python3
"""V196 — STORMGATE, THE FORTRESS CAPITAL.  python3 tools/stormgate.py   (rewrites data/built/head.js from head.orig.js)

The capital redrawn on the world map, Whiterun-fashion: a walled city climbing a hill in three tiers —
  the LOWER TOWN  (elev 1, y 332..347): the harbour gate, the market square and its fountain, the Market Hall, the inn,
                  two rows of townhouses; a west gate and an east gate on the roads;
  the MIDDLE TERRACE (elev 2, y 299..331): the cathedral on its square, the richer houses, gardens on the flanks; a broad
                  stair down to the market and two side stairs;
  the UPPER BAILEY (elev 3, x 237..263, y 299..315): an inner wall and gate-stair, the barracks, and Stormgate Keep
                  crowning it all, King Karl's hall (the throne level, as before).
The harbour (rows 348+ between x 230..266) is untouched. The west road moves out round the wall (x 214..215); the north
road ends at the tilting yard, which moves 25 rows north (y 286..292). Tiles: 5 wall/footprint, 6 cobble, 8 gate,
9 door, 10 stair, 14 balustrade, 16 sign, 18 lawn, 1 tree, 4 flowers, 2 path. Second half of raw: elev | walk<<4.
"""
import json, base64, os, shutil, copy, random
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); HEAD=os.path.join(ROOT,'data','built','head.js'); ORIG=os.path.join(ROOT,'data','built','head.orig.js')
if not os.path.exists(ORIG): shutil.copy(HEAD,ORIG)
src=open(ORIG,encoding='utf-8').read(); i=src.index('const WORLD_DATA='); j=src.index('\n',i); line=src[i+len('const WORLD_DATA='):j]; semi=line.endswith(';'); WD=json.loads(line[:-1] if semi else line)
W,H=WD['W'],WD['H']; N=W*H; raw=bytearray(base64.b64decode(WD['raw']))
def T(x,y): return raw[y*W+x]
def put(x,y,t,e=None,walk=None):
    raw[y*W+x]=t; m=raw[N+y*W+x]; ee=(m&15) if e is None else e; ww=(m>>4) if walk is None else (1 if walk else 0); raw[N+y*W+x]=ee|(ww<<4)
XL,XR,YT,YB=218,282,298,348; BX0,BX1,BY1=236,264,316; TY=331   # outer wall; bailey walls; the terrace edge row
rnd=random.Random(196)
# ── 1. the tilting yard moves north: rows 311..317 → 286..292 (x 230..266), its decor and sign with it ──
blk={(x,y):(raw[y*W+x],raw[N+y*W+x]) for y in range(311,318) for x in range(230,267)}
# ── 2. clear the old city and its roads' old ways ──
for y in range(284,348):
    for x in range(212,289):
        if T(x,y) in (3,20,33): continue                     # leave water and crags where they are
        inside=XL<=x<=XR and YT<=y<=347
        if inside or (y<YT and 226<=x<=266) or x in (226,227): put(x,y,0,0,True)
for (x,y),(t,m) in blk.items(): raw[(y-25)*W+x]=t; raw[N+(y-25)*W+x]=m
for x in range(230,267):                                       # no gate into a wall now: the yard's south fence is whole but for one way in
    if T(x,292)==19 and not 246<=x<=249: put(x,292,14,0,False)
# ── 3. the roads: the north road turns west above the yard, runs down outside the west wall to the quay; stubs to the gates ──
for x in range(214,250):
    for y in (284,285): put(x,y,2,0,True)
for y in range(284,351):
    for x in (214,215): put(x,y,2,0,True)
for x in range(216,230):
    for y in (349,350):
        if T(x,y) not in (6,): put(x,y,2,0,True)
for x in (216,217):
    for y in (333,334): put(x,y,2,0,True)
for x in (228,229):
    for y in range(286,291): put(x,y,2,0,True)
for x in (230,231):
    for y in (289,290): put(x,y,2,0,True)
for x in (248,249): put(x,286,19,0,True)                   # and a way in from the road on the north side
for x in range(283,290):
    for y in (333,334):
        if T(x,y) not in (3,20): put(x,y,2,0,True)
# ── 4. the ground of the three tiers ──
def tier(x,y): return 3 if (BX0<x<BX1 and YT<y<BY1) else (2 if y<=TY else 1)
for y in range(YT+1,348):
    for x in range(XL+1,XR): put(x,y,6,tier(x,y),True)
# the outer wall, at the height of the ground behind it
for x in range(XL,XR+1):
    put(x,YT,5,3 if BX0<=x<=BX1 else 2,False)
    if not 230<=x<=266: put(x,YB,5,1,False)
for y in range(YT,YB+1):
    for x in (XL,XR): put(x,y,5,2 if y<=TY else 1,False)
# the bailey's inner wall and its gate-stair
for y in range(YT,BY1+1):
    for x in (BX0,BX1): put(x,y,5,3,False)
for x in range(BX0,BX1+1): put(x,BY1,5,3,False)
for x in range(248,252): put(x,BY1,10,3,True); put(x,BY1+1,10,2,True)
# the terrace edge: a balustrade, the broad stair to the market, two side stairs
for x in range(XL+1,XR): put(x,TY,14,2,False)
for xs in (range(247,253),range(224,226),range(275,277)):
    for x in xs: put(x,TY,10,2,True); put(x,TY+1,10,1,True)
# the land gates, west and east, on the lower town's north street
for y in (333,334): put(XL,y,8,1,True); put(XR,y,8,1,True)
# ── 5. buildings ──
B=[]; INT=WD['interiors']; home=INT['sg_home1']
PEOPLE=[("Chandler","merchant","Candles for the cathedral, candles for the Keep. The capital burns a thousand a night."),
 ("Seamstress","peasantF","The banners on the wall? Every stitch mine. Royal blue is a hard dye to hold."),
 ("Old Sailor","sailor","Forty years at sea, and I end my days a hundred steps from the harbour gate. Suits me."),
 ("Scribe","monk","I copy the King's letters. He writes plainly, and he always asks after the villages."),
 ("Baker","peasant","Up before the bells, every day. The garrison eats two hundred loaves."),
 ("Guildmaster","merchantD","A city is its walls, its wells and its guilds, knight. In that order."),
 ("Fishwife","peasantF","Mind the step. And mind the cat, she thinks she owns the street."),
 ("Mason","smith","I cut stone for the bailey wall as a boy. It will stand long after me."),
 ("Pilgrim","pilgrim","I walked from Dusthaven to pray in the cathedral. The city let me a room for nothing."),
 ("Retired Guard","soldier","Thirty years on the wall. I still wake at the change of the watch."),
 ("Weaver","peasantF","Wool from Hearthvale, the best there is. Tell them the capital says thank you."),
 ("Cooper","woodcutter","Barrels for the fleet. A ship is only as good as its water casks."),
 ("Young Mother","peasantF","Hush — he's only just asleep. The tourney horns set him off every time."),
 ("Clerk","merchant","Harbour dues, market dues, gate dues. Somebody has to count it all."),
 ("Grandfather","farmer","I farmed outside the walls before the dark came. One day I'll go back out."),
 ("Lamplighter","peasant","Every lantern from the sea gate to the Keep, dusk and dawn. Good for the legs."),
 ("Herbalist","peasantF","Rosemary from the terrace gardens. Take some — it keeps the road-weariness off."),
 ("Fletcher","hunter","Arrows for the wall. Pray they stay in their barrels."),
 ("Innkeeper's Cousin","guest","The Gilded Gate is full again. That's how you know the roads are safe."),
 ("Tutor","monk","I teach the guild children their letters. They would rather watch the jousting."),
 ("Shipwright","sailor","There's a new hull on the slip. First one laid down since the barrier fell."),
 ("Glazier","smith","The cathedral glass is my grandfather's work. I only mend what he made."),
 ("Carter","farmer","Up the hill, down the hill. This city is all stairs, and my mule knows every one."),
 ("Widow","peasantF","My husband kept the east gate. The Captain still sends bread at midwinter."),
 ("Apprentice","child","Master says I may forge a nail tomorrow. A whole nail!"),
 ("Spice Merchant","merchantD","Pepper, saffron, cinnamon — the harbour smells like the whole world."),
 ("Bell-ringer","monk","Seven bells in the cathedral tower. I know each by name."),
 ("Stablehand","peasant","The King's own horses, and they bite no less than any other."),
 ("Fisher","fisher","Nets to mend before the tide. Sit, if you like — the fire's warm.")]
def bld(id,name,style,x,y,w,h,interior=None):
    e=tier(x,y)
    for yy in range(y,y+h):
        for xx in range(x,x+w): put(xx,yy,5,e,False)
    dx=x+w//2; put(dx,y+h-1,9,e,True)
    for xx in range(x-1,x+w+1):                                  # the street before the door stays clear
        if T(xx,y+h) in (18,1,4): put(xx,y+h,6,tier(xx,y+h),True)
    if interior is None: interior=id
    if interior not in INT:
        INT[interior]=copy.deepcopy(home); INT[interior]['name']=name; who=PEOPLE[len(B)%len(PEOPLE)]
        for n in INT[interior].get('npcs',[]): n['name'],n['voutfit'],n['lines']=who[0],who[1],[who[2]]
    B.append({'id':id,'name':name,'style':style,'x':x,'y':y,'w':w,'h':h,'door':{'x':dx,'y':y+h-1},'interior':interior})
# gardens first (buildings and streets are cut into them)
def garden(x0,y0,x1,y1,trees=0.14,flowers=0.12):
    for y in range(y0,y1+1):
        for x in range(x0,x1+1):
            r=rnd.random(); e=tier(x,y)
            if r<trees: put(x,y,1,e,False)
            elif r<trees+flowers: put(x,y,4,e,True)
            else: put(x,y,18,e,True)
garden(220,300,234,315); garden(266,300,280,315)                  # the terrace's flanks, either side of the bailey
garden(238,319,244,329,0.10,0.2); garden(262,319,263,329,0.2,0.2) # the cathedral square's green, and a strip by the cathedral
garden(220,340,230,341,0.0,0.5); garden(267,340,280,341,0.0,0.5)  # flower borders along the lower town's middle street
# upper bailey
bld('sg_keep','Stormgate Keep','keep',244,300,11,7)
bld('sg_guard','Guard Barracks','keep',238,309,4,4)
# middle terrace
bld('sg_cathedral','Stormgate Cathedral','chapel',254,319,8,10)
k=2
def house(x,y,w=4,h=3,name='Townhouse',style='house'):
    global k; bld('sg_home%d'%k,name,style,x,y,w,h); k+=1
for (x,y) in ((222,302),(229,302),(268,302),(275,302),(222,309),(229,309),(268,309),(275,309)): house(x,y,5,4,'Manor House')
for (x,y) in ((221,320),(227,320),(233,320),(264,320),(270,320),(276,320),(221,326),(227,326),(270,326),(276,326)): house(x,y,4,3,'Guild House')
# lower town
bld('sg_shop','Capital Market Hall','shop',232,336,6,4); bld('sg_inn','The Gilded Gate Inn','inn',258,336,5,4)
for (x,y) in ((221,336),(226,336),(265,336),(270,336),(276,336)): house(x,y)
bld('sg_home1','Townhouse','house',259,343,4,3)
for (x,y) in ((221,343),(226,343),(238,343),(265,343),(270,343),(276,343)): house(x,y,4,3,'Cottage','cottage')
old=[b for b in WD['buildings'] if not b['id'].startswith('sg_')]; WD['buildings']=old+B
# ── 6. signs ──
S=WD['signs']
for kk in ('242,333','253,333','231,313'): S.pop(kk,None)
S['245,333']="— THE CATHEDRAL SQUARE —\nUp the stair: the cathedral, and beyond it the Keep"
S['254,333']="THE TILTING YARD\nOut the west gate and north along the wall"
S['231,288']="THE TILTING YARD\nStormgate's lists — jousts, duels and the Grand Melee"
S['246,318']="— STORMGATE KEEP —\nThe King's hall. Stand tall before the throne."
for kk in ('233,342','235,342','244,346','251,346','245,333','254,333','246,318'):
    x,y=map(int,kk.split(',')); put(x,y,16,tier(x,y),False)
put(231,288,16,0,False)
for x in (233,234,235): put(x,343,6,1,True)
# ── 7. street furniture ──
D=[d for d in WD['decor'] if not (XL<=d['x']<=XR and YT<=d['y']<=347)]
for d in D:
    if d['kind'].startswith('ty_'): d['y']-=25
def decor(kind,x,y,w=1):
    for yy in range(y,y+w):
        for xx in range(x,x+w): put(xx,yy,5,tier(xx,yy),False)
    D.append({'x':x,'y':y,'kind':kind,'w':w})
decor('fountain',248,339,2)
for (x,y) in ((244,334),(255,334),(243,346),(255,346),(246,322),(253,317),(246,328),(240,335),(257,341),(231,341),(268,341),(222,333),(278,333),(246,309),(253,309),(225,317),(275,317)): decor('lantern',x,y)
for (x,y) in ((246,318) ,): pass
for (x,y) in ((247,308),(252,308),(245,330),(254,330),(243,337),(256,337)): decor('banner2',x,y)
WD['decor']=D
# ── 8. the people of the capital ──
V=[v for v in WD['villagers'] if not (XL<=v['x']<=XR and YT<=v['y']<=350)]
def folk(x,y,outfit,*lines): V.append({'x':x,'y':y,'outfit':outfit,'lines':list(lines)})
folk(247,345,'soldier','Welcome to the capital, knight.','King Karl keeps his gates open to all who come in peace.')
folk(251,335,'soldier','Move along, citizen. Keep the avenue clear.')
folk(241,338,'merchantD','Finest goods in all the realm, here in the capital!')
folk(252,341,'peasant','So many people... the capital never sleeps.')
folk(245,341,'peasantF','Fresh bread at the Market Hall — if the soldiers have left any.')
folk(236,341,'merchant','Silk from Dusthaven, salt from Saltmere — it all comes up through the harbour gate.')
folk(263,341,'fisher','The fleet came in at dawn. Best catch in a month.')
folk(224,334,'soldier','West gate. The tilting yard is out and north along the wall.')
folk(277,334,'soldier','East gate. The road runs on to the river.')
folk(249,324,'pilgrim','The cathedral was barred a long time. I come every day to look at its doors.')
folk(242,325,'guest','They say the King walks the bailey wall at night and looks at the sea.')
folk(232,324,'peasantF','The guild houses were empty for years. Listen — hammers again.')
folk(268,324,'monk','Peace to you, knight. The square is quiet this morning.')
folk(250,318,'soldier','The Keep is above. Stand tall before the throne.')
folk(249,310,'soldier','The King holds court within. Go up, knight.')
folk(242,313,'soldier','Barracks. We drill at first light.')
folk(226,307,'guest','The gardens are the loveliest place in the city. Mind the roses.')
folk(272,307,'child','I can see the whole harbour from the wall! Almost.')
for v in V:
    if XL<v['x']<XR and YT<v['y']<348 and T(v['x'],v['y']) in (1,4,5,14): put(v['x'],v['y'],18 if T(v['x'],v['y'])!=5 else 6,tier(v['x'],v['y']),True)
WD['villagers']=V
# ── 9. the dome over the sealed town covers the whole city ──
for n,bq in enumerate(WD['barriers']):
    if bq and bq[0]==248 and bq[1]==333: WD['barriers'][n]=[250,323,41,36]
WD['raw']=base64.b64encode(bytes(raw)).decode()
out=src[:i]+'const WORLD_DATA='+json.dumps(WD,separators=(',',':'),ensure_ascii=False)+(';' if semi else '')+src[j:]
open(HEAD,'w',encoding='utf-8').write(out)
print('stormgate: %d buildings in the city, %d decor, %d folk; world %dx%d'%(len(B),len([d for d in D if XL<=d['x']<=XR and YT<=d['y']<=347]),len([v for v in V if XL<=v['x']<=XR and YT<=v['y']<=350]),W,H))
