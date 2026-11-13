# V186 — the menu, finished · the Skills constellation · the working tree rebuilt

(README.md in the project docs runs to V185; this note continues it.)

## The menu
- `engine/shell.html` (CSS under "V186: THE MENU, FINISHED") and `engine/menu.js`: the ☰ menu is now a full-screen veil
  (blurred game behind) holding one card — the knight's banner (level medallion, name, XP bar, health / gold / points
  chips), a row of icon tabs with a gold underline (a dot on Skills when points are waiting), and the page, which fades
  in on a tab change. Rows, buttons and section heads restyled; tap outside the card to close. Same tabs, same actions.
- **Skills is a constellation** (`skills()`, `constellation()`, `detail()` in menu.js): the three knight branches fan
  out from a crest on wide screens and climb in three columns on phones (SVG, two layouts, chosen by pane width).
  Nodes: dim = locked, pulsing ring = can learn, lit = learned (the line lights with it), diamond = ultimate.
  Hover or tap a node to read it in the panel beneath; the gold button learns it and steps to the next.
- **The companion's tree is a second leaf of the same page** ("⚔ Knight | 🦁 Lion" pills). The Pet tab keeps the
  companion's card, evolution, gear and a button that opens its skills. Respec sits in the Skills footer.

## The working tree (read this before building)
The cloud workspace was lost mid-session. `klk3d/` was rebuilt from the published V185 page (it rebuilds that page
byte for byte): engine/*.js and cities/luminar.js split back out at the build's own markers; the realm's data kept
already stretched and packed in `data/built/head.js`; `data/systems.json` and `data/pastimes.json` are the two tables
still edited by hand (in shipped, stretched form); sculpted models are `data/models/*.js` as shipped.
`tools/build.py` is now the short assembler for that layout, and `engine/shell.html` carries the meta tags, the local
three.js tag (CDN fallback) and the model scripts — so `dist/luminar.html` is the site's `index.html` as is.
The older pipeline (tools/stretch.py over unstretched data, the sculpt scripts) is still in the project docs; the
unstretched `systems.json` / `pastimes.json` docs there are now behind the shipped ones (V185 trees, V183 hall).
Test harness (scratch, rewritten): mk.py (test page, `window.__T`), smoke.py (every level, counts page errors), mn.py (menu shots).

# V187 — the Thunder Lord: shelter, then fight
`engine/guardians.js` G7 rewritten (phase 1, turning King Karl's blows, is unchanged). Ruth's five people no longer
wander with a bolt picking one out every few seconds while he swings at you, and your sword is no longer useless
without a bolt's charge. Now: they huddle in a ring at the far end of the hall. Every ~8 s (the first after ~5 s) he
stills his hammer (`cfg.quiet`) and calls the storm down on them — 3.5 s of warning (meter bar, closing ring that
turns green when you're inside, pillar of light). In the ring with your shield up: a scratch of damage, the bolt turns
on him (stunned ~3 s, wide open) and your blade is charged for 9 s / 6 blows (pierces his guard). In the ring without
the shield: you take the bolt, they live, a short stagger and a smaller charge. Not there: one of them is lost.
Your sword works on him at all times. Stormward Plate still needs all five alive.
Also: `combat.js` — a flock that stands still doesn't walk on the spot; `chapel.js` — `lv.guardian` (tests);
`window.SKIP_KING` starts the sanctum at the Thunder Lord (tests).

# V188 — LOOK3: a test of artist-made, rigged models (off unless the page is opened with `?look3`)
`engine/look3.js` + `data/models/look3/` (copied to `dist/models/look3/` by build.py): three.js r128's GLTFLoader, the
Quaternius animated Horse_White / Wolf / Stag (skinned, Walk / Gallop / Idle / Eating … clips) and the KayKit Adventurers
Knight (CC0, 76 clips). With `?look3` they stand in a paddock in front of where you are when the world loads, shaded with a
two-band toon ramp and a warm rim light. Nothing else is touched. Sources: KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0
(LICENSE.txt: CC0); the Quaternius files came from a third-party GitHub mirror (benjaminpjones/catch-the-animal) — confirm the
licence at quaternius.com before building on them.

# V189 — LOOK3: the body type
`?look3` now shows Quaternius's Universal Animation Library mannequin (free standard edition, CC0, from the mirror
J-Ponzo/gltf-universal-animation-library) in place of the chibi KayKit knight: ordinary human proportions on a humanoid
rig, 46 clips (Sword_Idle, Sword_Attack, Roll, Jump, Crouch, Walk / Jog / Sprint, Swim, Sit …). Quaternius's free
"Modular Character Outfits – Fantasy" (quaternius.com, not on GitHub) are made for this same rig — the candidate hero body.

# V190 — the realm's animals on real skeletons (ANIM3)
`engine/animals3.js` (in the build before menu.js): `ANIM3.dress(g, kind, opt)` swaps a decoration's old box/sphere model
for a rigged, hand-animated glTF from `models/look3/` once it has loaded (GLTFLoader + SkeletonUtils, r128), cel-shaded,
at true size beside the knight (WH table, world units). It picks its own clip from how fast the thing moves (idle/graze,
walk, run). Hooked in: decor.js horse (corral horses, tinted to their coat; the white one uses Horse_White), mule
(donkey), mt_sheep, hsCoop (three hens and two chicks); roadlife.js the merchants' donkeys, the shepherds' sheep, wild
deer (bucks → stag); forest.js the Forest of Disillusionment's deer. Off in the classic look, with ?noanim3, and where
the files can't be fetched (the artifact) — the old models stay. Farm animals (Sheep, Chicken, Chick, Pig) from the
mirror chongdashu/threejs-forest-census; big animals as V188. Rabbits and the lion/pets are unchanged.

# V191 — every rigged model CC0, sources written down
The sheep/chickens of V190 were Quaternius's blocky "Cube World" animals taken from a project with no licence file; they
are replaced by his farm animals (chicken.glb, sheep.glb, pig.glb — CC0, LICENSE-farm-animals.txt, poly.pizza originals).
Chicks are small hens. `models/look3/LICENSES.md` lists every file there, its maker and where its CC0 was confirmed.
animals3.js strips Blender's 'Armature|…|' prefixes off clip names.

# V192 — the knight moves on the new animations
The hero keeps his own sculpted armour (the helm, plume, cowl, cape, surcoat and plate of knight.js / hero_knight.js —
already the concept sheet) and his cloth springs; what changed is the motion under it. rig.js already retargeted a
skeleton's clips onto his pivots (the Mixamo/Xbot clips of anim_base.js). `data/models/anim_ual.js` (ANIM_UAL) is the
same data shape — 22 bones under the same names, the same clip names — baked from Quaternius' Universal Animation
Library 1+2 (CC0) by `tools/anim/bake_ual.html` (run in a browser beside the pack's files; it writes window.__out):
idle←Sword_Idle, idleCalm←Idle_Loop, walk←Walk_Loop, run/runCalm←Jog_Fwd_Loop, sneak←Crouch_Fwd_Loop,
block←Idle_Shield_Loop, blockHit←Hit_Chest, atk1/2←Sword_Regular_A/B (+_Rec), atk3←Sword_Regular_C, atk4←Sword_Attack,
death←Death01, land←Jump_Land, jump/fall←Jump_Loop, roll←Roll, plant←Farm_PlantSeed, agree←Yes, headShake←Idle_No_Loop,
plus sprint, sneakIdle, talk, knockback (not used yet). Not in the library, so they fall back to the hand-keyed motion:
walkInj, draw/drawBack, sheath/sheathHip, shoot, turnL/R.
rig.js picks ANIM_UAL when it loaded (RIG.ual, rig.ual); `?oldanim` or localStorage klk3d_anim=old keeps the old clips;
the menu's "Knight's movement" switch still turns clips off altogether. With the new clips knight.js: lays them on whole
(no hand-keyed rest blended under: rx=0), turns the breastplate by the middle spine bone ('Spine1' — the library's top
spine bone bows 30° on its own), and lets the clip swing the sword arm too while the blade is sheathed. The townsfolk's
rigs (cast.js) get the same walk/idle/nod. The artifact can't load model files, so it plays the old clips.
Mockups kept in the scratchpad only: the villagers/Elijah lineup and knight3.html (the sculpt seated straight on the
Quaternius bones) — the route for moving NPCs onto those bodies next.

# V193 — the knight and the townsfolk on real bodies, in the lineup's look
`engine/body3.js` (BODY3). The knight and every townsperson are still knight-rigs moved by the same code as ever (clips,
blows, guard, riding, sitting, fishing, climbing); each frame BODY3 sets a Quaternius Universal Base Character's skeleton
(CC0, models/look3/body/) from the rig's pivots — each bone takes its pivot's turn from the rest pose (offsets recorded at
bind time with the rig square and the arms and legs hanging straight). Everything is cel-shaded (MeshToonMaterial, a 3-step
ramp, a warm rim; metal a 4-step ramp) in plain colours, as in the lineup mockup.
THE TOWNSFOLK (`BODY3.folk`, dressed automatically within 40 m, two at a time): the body keeps its own build and the RIG is
moved to fit it (hips, knees, shoulders, elbows, wrists, head pivots set on the body's joints; K.hipY to its hips). Their
clothes are read off the old figure: each cast shell's skin weights say which joints it covers, so each region (chest,
belly, pelvis, thigh, calf, foot, upper/fore arm) takes the colour of the garment covering most of it (an outer one wins a
near tie); a shirt comes down over the waist where the trousers reach the belly. Clothes are shells of the new body's own
triangles (smoothed hard — open edges pinned — and pushed out), one per colour. The rigid pieces (hats, crowns, belts,
aprons, gowns' cloth skirts, what they carry) stay on their pivots, toon-twinned; hats are set on the new head. Hair from
the pack (long or simple parted; buzzed or buns under a hat), beard where the figure had one. NAMED overrides: Old Man
Elijah — white hair, big white beard, a stoop, white flowers on the orange shirt (his old flower pieces hidden).
THE HERO (`BODY3.hero`): the body fitted to his rig (his sculpt's torso, pauldrons, helm and gauntlets are sized to it);
plate shells on thighs, greaves, upper arms, forearms and feet, each edged in gold; knee and elbow cops; the sculpt's helm,
plume, pauldrons, gauntlets, surcoat, cowl, belt, cape and shield stay, toon-twinned (cloth keeps its moving-cloth vertex
shader), metal in the lineup's steel/gold (gear colours that are gold stay gold). knight.js tags each sculpt mesh with
userData.seg/part and splits the greave's sabaton into its own mesh.
Off: classic look, ?nobody3, window.NO_BODY3 (window.NO_FOLK3 for folk only), or where models can't load (the artifact).
Not on the new bodies yet: figures not built by cast.js (some fishers, sailors, roadside folk), the bosses, the pets.
Also: petfight.js — companions never attack King Karl in Stormgate (each bite raised the parries needed, so the king phase
could seem endless and the Thunder Lord's shelter phase never came), nor hidden/held foes.
V193 also: the folk keep the base body's own build (the rig moved to fit it — `build(K,g,{natural:true})`); arms drawn in
toward the bone (slim: men 0.8/0.86, women 0.9/0.93) so they read less superhero; a 'boot' region (the lowest fifth of the
shin) so boots end mid-shin under the trousers; the older-built folk (heroes.js heroPerson: g:/v: looks) record their
colours in g.userData.b3spec and are swapped for a bare rig dressed on the new body as you come near (`BODY3.swapIn`:
f.g is replaced in place; the old figure is kept as K.userData.oldG; nothing changes where the bodies can't load), with
code-made hats, hoods and kettle helms.

# V194 — the towns' houses from the Medieval Village MegaKit
`engine/village3.js` (VILLAGE3). world.js buildHouse(): after a building is merged and added (par.add(M0)), VILLAGE3.swap()
loads the kit pieces once and puts a kit-built house in its place (M0 hidden) — every house, cottage, shop and inn of the
open world's towns except the special ones (home_house, home_barn, sg_keep, sg_cathedral, ih_forge, sm_market). The house
is assembled in the kit's metres (2 m wall panels: a door panel mid-front with its door, window panels with glass and
open shutters, plain and window panels round the sides and back; corner posts; a round-tile roof of the nearest kit size,
ridge along the longer side, its gable ends; a chimney; inns two storeys with timber-grid panels; shops a few crates) and
scaled to the game's footprint (b.w−0.4 × b.h−0.3) and eave (house 1.8, cottage 1.5, shop 1.9, inn 2.5), so collisions,
doors and roof-walking don't change. Cel-shaded: each kit texture taken to grey (normalised) and tinted by the town
(TOWN palettes: Ironhold dark stone/slate, Saltmere white/blue, Thornwood timber/moss, Dusthaven sand/terracotta,
Crystalpeak frost/snow, Stormgate stone/royal blue, Ashfield ash/oxblood, Shadowmere dusk/moss, Hearthvale and Homestead
warm plaster/straw-brown; stone towns get rubble-stone panels). Off: classic look, ?novillage3, window.NO_VILLAGE3, or
where models can't load. The capital (city.js) and the chapels are not changed yet.
V194 also: bosses and demons cel-shaded (bossart.js: MeshToonMaterial with the companions' soft bands unless o.phong or the
classic look; demons.js the same; BOSSART.toonMap exported). Named folk (body3.js NAMED): Madison long golden hair and a
gold bodice; King Karl's man-bun; the named keep their own hair under a tiara or circlet; 'white' no longer counts as a
face colour (Sir Aldric's white helm was being hidden); gold trim no longer takes a region from the plate it edges (the
Royal Guard's greaves). Chapels, gothic (chapel_themes.js): the vault over a plaza and the sanctum is pointed (a
two-centred profile, y = rise·(1−|u|)^0.58), its ribs tubes along that profile, clustered three-shaft columns with
capitals under each rib, the lunettes the same pointed shape; along the halls, tall lancet windows of the theme's stained
glass in a moulded trim frame with a sill (where no banner or wall-growth stands).

# V195 — gothic chapel exteriors; Cody's horse and Cody on the new models
village3.js: VILLAGE3.swap now puts the kit building INSIDE the merged one (mergeStatic returns the house's own group; its
old children are hidden), so whatever shows or hides it — a chapel's bound and cleansed forms, which world.js toggles — does
the same to the new one. Chapels (style 'chapel', both forms) get `gothic(o)`: a tall nave (3.0) between lower aisles
(1.8) with lean-to roofs; between the bays, buttresses with pinnacles and flying arches to the nave; a lancet of stained
glass in each aisle bay and one in the clerestory above it; a seven-sided apse at the east end with its own conical roof and
three lancets; the west front (+z, the door): a square tower with corner shafts and pinnacles, belfry lancets, an octagonal
slate spire and a gold cross, a pointed portal with moulded arches, a rose window. Stone from the kit's rubble texture
(taken to grey, tinted), slate roofs (P.slate; Stormgate's royal blue). Bound: dark stone 0x4e4a5a, dark slate, dim red
glass; cleansed: pale stone, coloured glass, gold. The interiors are as V194.
animals3.js: ANIM3.dress opt.rider — the rider is taken off the old horse, set in the new one's saddle and posed astride
each frame (K.animate 'ride', K.ride from the horse's speed). rogues.js cody(): his grey stallion dressed by ANIM3 with
Cody aboard, and Cody himself on the new body (BODY3.folk).
The animals: checked — ANIM3 has its 26 animals live round the Homestead in the test build; the grey figures on the roads
are the bounty demons, not sheep.


## V196 — Stormgate, the fortress capital

The capital is redrawn on the world map as a walled hill city in three tiers (generator: `tools/stormgate.py`, which
rewrites `WORLD_DATA` in `data/built/head.js` from the untouched backup `data/built/head.orig.js`, so it can be re-run).

- **Footprint**: outer curtain wall x 218–282, y 298–348 (was x 230–266, y 318–349). Harbour, quay and sea gate unchanged.
- **Lower town** (elev 1, y 332–347): sea-gate avenue, market square and fountain, Market Hall, Gilded Gate Inn, two rows
  of townhouses and cottages; a west gate and an east gate (x 218 / 282, y 333–334).
- **Middle terrace** (elev 2, y 299–331): cathedral (8×10) on its square with a green, ten guild houses, eight manor
  houses in walled gardens on the flanks; balustrade along y 331 with a broad stair (x 247–252) and two side stairs.
- **Upper bailey** (elev 3, x 237–263, y 299–315): inner wall with a gate stair (x 248–251), barracks, and Stormgate Keep
  (11×7) at the top. The keep still opens on the throne level.
- 35 buildings (was 6); each new house `sg_home2…30` has its own interior and its own resident. 18 townsfolk outdoors.
- **Roads**: the north road now turns west at y 284–285 and runs down outside the west wall (x 214–215) to the quay.
- **Tilting yard** moved 25 rows north (y 286–292) with all its `ty_*` decor; entries on the west and north sides. The
  lists level's exit follows it (`cities/luminar.js`).
- `engine/world.js`: Stormgate's raised-terrace region `SGB` starts 10 rows further north. Barrier dome enlarged.

## V197 — The biomes of Luminar

The realm is divided into broad countries with soft, wandering borders (generator: `tools/biomes.py`, which runs
`tools/stormgate.py` first and then works on `data/built/head.js`; re-runnable, seeded).

- `WORLD_DATA.bio` — a half-resolution biome map (base64, `bioW` wide): 0 meadow, 1 forest, 2 desert, 3 ash, 4 alpine,
  5 marsh, 6 coast, 7 highland, 8 scorched, 9 farmland. Grown from the towns plus wild anchors (`ANCH` in the tool),
  with noise-warped borders. `WORLD_DATA.bioAnchors` — the wild anchors, which also shape the rolling hills.
- `engine/world.js`: `bio(x,y)` / `lv.bio`; `desert()` and `ashland()` now read the biome map (the old rectangles remain
  only for the classic look); ground colour per biome, blurred across borders, whitening with height in the Frostfells,
  greying in the Iron Hills, paling on dune crests; trees by biome (cactus, palm by water, charred, snow pine, mere,
  birch/oak/pine mixes); snow on crags in alpine country; the far view and the place-name banner follow the biome
  (The Greenwood, The Dust Sea, The Ashlands, The Frostfells, The Fens, The Sea Meadows, The Iron Hills, The Burning
  Marches, The Vale).
- Tiles dressed to suit: 1,728 tree tiles cleared in desert/ash, 2,074 trees and 179 crags added in forest, highland,
  alpine and marsh, 922 flower tiles in meadow/farmland/coast. Nothing is placed within reach of a road, building,
  sign, villager or any coordinate named in the data, and a flood-fill check confirms no ground reachable before is
  cut off (792 new trees were removed again to guarantee it).
- The menu map and minimap (`data/systems.json` → `SYS.MAP.map`) are redrawn in biome colours, with the new Stormgate.
- Next stages (not in this version): grow the map and reshape the coastline; resize and re-plan the villages; catacomb
  entrances placed as town features with villager hints.

## V198 — The realm grown: one big island

The realm roughly doubles, from 370×420 to 760×830 tiles, and ends in a real coast all round (`tools/grow.py`, run by
`tools/biomes.py`; it runs `tools/stormgate.py` first, so `python3 tools/biomes.py` rebuilds the whole map from
`data/built/head.orig.js`; `data/pastimes.v2.json` and `data/systems.v2.json` are the V197 backups it reads).

- **New country** goes in along nine lines that cross no town, building, plateau or landmark: sea margins
  (60 west/north/east, 50 south) and three bands each way between the town columns (90 wide) and rows (100 high).
  Towns keep their streets; they stand further apart. The bands are grown as in V116 (meadow, woods, ridges, ponds,
  open valleys); roads and rivers that cross a line wander across its band; lakes do not run on; where two bands cross
  it is all new land.
- **The coast**: the old two-tile tree wall round the realm is gone; bays bitten into the land and headlands pushed out
  by large-scale noise measured from the open sea; beaches on low ground by the sea, a ring of shallows, islets
  offshore. Nothing near a building, sign, villager, road, quest spot, secret, plateau, shrine, tower or the pass is
  drowned, and any bay that would cut off something used is filled back in. Sea fishing spots are found anew along
  the whole coast.
- **Every coordinate moved**: WORLD_DATA, STRETCH (trek re-laid along its longer way, new control points where bands
  opened), FOREST_DATA, SIDEQUEST_DATA, DIALOGUE_DATA keys, pastimes.json, systems.json MAP.
- **Code**: STRETCH gains version-3 seams `[at (2D tiles), width, 3, at (V197 tiles)]`, so `SX/SY` move with them;
  new `RX/RY/RP` (kit.js) map V197 tiles for places written in V197's own tiles — wilds.js plateaus and shrines,
  landmarks.js towers, the Homestead gate, the tourney's exit. Saves migrate once on load (state.js `restretch`, now
  also moving the trade carts).
- **Fixed**: the Marshal of the Lists and Herald of the Melee were placed with the shift applied twice (off the map);
  they now stand at the tilting yard's west gate.
- Biomes regrown on the island (anchors moved and reaching 1.75× further, 13 new anchors for the new country);
  town hills reach 1.5× further; the far terrain is drawn at every 3rd tile; snow only on rocks and heights in cold
  country (bare rock elsewhere).
- Checked: every V197-reachable door, sign, villager, quest spot, secret, trade post, plateau, shrine and tower is
  still reachable (one pond fishing spot on the south coast was lost to the sea); an old save lands the player,
  crops, boat, wagon, trade carts and Homestead pieces in the right places.

## V198.1 — hotfix

- V198 moved the side quests' spots (SIDEQUEST_DATA `at`) as if they were map positions; they are places inside the catacomb levels. Restored (tools/grow.py no longer touches them).

## V199 — Hearthvale re-planned (the villages, 1 of 10)

`tools/villages.py` (run by biomes.py; it runs grow.py first) lays the villages out open and natural. Hearthvale first:
- **No fence** round it. From the trade road a lane climbs to a **village green** (fountain, great oak, market stall),
  and on up to the **chapel** in its fenced churchyard (tombstones, lanterns) at the head of the vale. Lanes wander west
  to the **sheep hill** and east over a **millstream** (from the pond in the north-east, under two plank bridges, into the
  river in the south) past the old watermill. Fields and a windmill to the south-west, an orchard in rows to the
  north-east, beehives, a coop, a well.
- 14 buildings (was 6): Tobias, Mira, Old Bram, the store and the inn keep their ids and interiors; eight new homes
  (`hv_home1…8`: Amos the shepherd, the weaver, Widow Ruth, the miller, the beekeeper, the carpenter, the farmer,
  Martha's bakehouse), each with its own resident. 11 villagers outdoors; the three who were here moved with their
  stories (DIALOGUE_DATA keys re-keyed).
- **The sheep hill**: a walled pasture with sheep, raised by `WORLD_DATA.hills` ([x,y,radius,height], world.js), and at
  its top the old **shepherds' tomb** — the catacombs' way in (`WORLD_DATA.cata[0]`; catacomb.js builds the entrance
  there instead of in the churchyard).
- **The barred chapel and the clues**: the chapel door no longer tells you the way in. Villagers hint (SIDEQUEST hints,
  Hearthvale 'out' stage) to ask Amos; three clue-givers (`villagers[].clue`) — Amos the Shepherd, Widow Ruth, Pip —
  tell of the flock facing the tomb door, chanting at night, singing under the hill. Hearing one sets `S.cataHeard[0]`,
  writes the journal, and turns the goal (goal.js) from "ask around the village" to "up to the shepherds' tomb", with the
  compass pointing there; the door then says so too. After the way is found they say other things.
- The demon zones that reached into the village start south of it; a cleansed village is guarded to its own radius
  (`WORLD_DATA.townR`). Biomes leave a planned village (`villageRects`) as it was laid out.

## V200 — Ironhold re-planned; Hearthvale's mill; woolly sheep (the villages, 2 of 10)

- **Sheep** (animals3.js): Quaternius's cube sheep replaced by one built in code — a fleece of soft clumps, dark face,
  drooping ears, woolly cap, slim legs, a tail — cel-shaded, with keyframed clips (Idle, Eating, Walk, Run) so ANIM3
  drives it like the others. Every sheep in the realm uses it.
- **Hearthvale's mill**: a building of its own (`hv_mill`, kit style, Mill-hand Toby inside) on the millstream with a
  turning **waterwheel** in a stone race (new decor `waterwheel`). The old box mill (landmarks.js) is retired; "🌾 The
  mill" now names Hearthvale's.
- **Fixed**: landmarks.js placed its seven roadside places (the drovers' camp, the oasis, the drowned chapel, the
  shepherd's hut, the waystone shrine, the spring) in V197's tiles; they now go through RX/RY.
- **Ironhold**, open and natural: the keep in a walled bailey on a rise (raised by `hills`), the chapel among the smiths'
  graves, a cobbled square round the anvil monument with braziers and a well, the Great Forge with slag heaps
  (new decor `slagheap`), ore carts (`minecart`) on old rails running east to the **Deepcut**, miners' and smiths' houses,
  the inn on the road south to the Forest of Disillusionment. 12 buildings (6 new: Collier Dov, Zillah and Enoch, the
  bellows-man, the armourer, the miners' row, Widow Shua); the old town's raised walled square is gone.
- **The Deepcut** (`WORLD_DATA.cata[1]`, `grate:true`): Ironhold's first mine, whose colliers broke through into the
  galleries where the smiths are buried; the Elders grated and blessed it. The adit now wears that grate — bent outward,
  from inside — torn boards, a cross, and a cold light far in. The knocking heard from it since the dark came is Brother
  Tubal, caged below (the catacomb's own story), keeping count of his days; the clue-givers (Old Dov the Collier,
  Keziah, Micah) say so afterwards. Ironhold's general hints point to Dov.
- Ironhold's dark dome and its blocking ring are redrawn round the whole town (east of the west road); the demon zones
  that sat inside it moved out. The keep contest marshals now stand either side of their keep's door (Ironhold and
  Hellgate), wherever it is. A planned way in faces its own way (catacomb.js), so its Descend prompt is at its mouth.

## V201 — Saltmere, the harbour town (the villages, 3 of 10)

After Oceanside harbour, as a beachfront town:
- **The harbour**: a basin behind two breakwaters (the lighthouse on the south one), three plank slips, the quay with the
  Fish Market, the Harbourmaster's House and a Chandlery. Your boat now moors in the basin between the slips.
- **The beach**: a long sand beach with a **surf break** (tile 21, `PT.surf` regenerated) either side of a long **pier**
  on pilings with rails out to a pier-head (`WORLD_DATA.piers`, dressed in luminar.js), lifeguard towers (new decor
  `lifeguard`), umbrellas, palms, a sandcastle. **The Strand** — a boardwalk from the quay to the east road — with the
  inn and the beach houses along it, every door to the sea. Behind: the chapel on its bluff (barred), a little square
  with a fountain. 15 buildings (was 5); 10 new homes (the Surf Shack, the Lifeguard's, Old Peter's, Rhoda and Jonah's,
  the Boatwright's, …). Saltmere is now walkable end to end.
- **The Gull Head and the Grotto** (`WORLD_DATA.cata[2]`): the headland west of the harbour; a channel from the open
  sea under a rock arch (catacomb.js, `arch`) into a grotto pool with a landing and the sea-stair. **Only a boat can reach
  it**: sail in, Dock at the landing (the boat stays moored in the grotto), Descend; come back up, Board, sail out.
  The fisherfolk rowed their dead in this way to the brothers (Old Ezra); a small bell rings in there at the turn of the
  tide (Fishwife Leah); Jonah rowed in after crabs and found the steps (Tobit) — Rhoda's side quest.
- **Harbourmaster Bart** (`villagers[].role:'harbour'`, sailing.js `world.boatHome`): if your boat is moored anywhere
  else — in the grotto when you came up through the chapel, say — the harbour lads row her round to the quay.
- The secret "lonely island" (a rectangle left over by the growing, ten tiles off the beach) is now a small island
  further out with its secret; sea fishing spots found again along the new shore; Saltmere's dome and ring redrawn
  round the whole town and the Gull Head.
- **Memory** (core.js): every level ever visited used to stay built for the whole session (≈5 MB and 200 geometries
  each); a run through all 172 levels exhausted the test browser. House and shop interiors are now kept only for the
  dozen most recently visited and rebuilt from the data on return (geometry held flat at ≈22k instead of climbing).
  The JS heap still creeps a little per level (references held outside the rooms) — to chase later. The smoke test now
  starts a fresh page every 90 levels.

## V202 — Thornwood, up in the trees
- **tools/villages.py** Thornwood section: rect 236..310 × 466..528. Five giant trees with plank decks (WD.treetops.decks: the Chapel Oak, the Lodge Tree, the Forester's Tree, the Trapper's Tree, the Burner's Tree), four rope bridges, three ladders. The chapel (barred), the Hunter's Lodge, the Forester's Hut and two new treehouses (tw_home3, tw_home4) stand on the decks (`b.deck`). On the ground: the road, the fire-ring, the Hollow Log Inn, the lumber yard (Woodcutter's Trade, saw-pit, timber stacks, chopping block). `WD.flats` keeps the floor level under the decks.
- **The Old Stones** (`WD.cata['3']`, 243,497): a ring of standing stones round a sunken stone well with a stair going down — Thornwood's way into the root-crypts (CFG[3].entrance `'circle'`). Clues: Old Esau, Sawyer Hannah, Benji (up in the Trapper's Tree).
- **engine/treetops.js** (new): the overlay. Up a tree, `world.ground` is the deck or the sagging bridge and `canMove` keeps you on the boards; below, the decks are overhead (they fade as you walk under them), trunks and stilts are solid. Ladders climb like the wilds' ladders. Bridges sway, more under your feet. Treehouse doors only answer from the deck; folk below/above are out of earshot. `GAME.S.atUp` restores you up a tree from a save; `doorStep` carries `up` back out of a treehouse.
- **world.js**: buildings with `deck` have no ground footprint, don't turn, aren't drawn by buildHouse; their door spots hide unless up; `lv.chapelLit`; `WD.flats`. **core.js**: auto doors honour `hide`. **decor.js**: sawpit, timber, chopblock.

## V203 — Dusthaven, the oasis caravan town
- **tools/villages.py** Dusthaven section: rect 246..318 × 236..300, a sand ground with a ragged natural edge (cacti round it). A spring pool ringed with date palms; the chapel (barred) on a low ridge with adobe houses stepping up to it (dh_home3..6 new); the market square with the **dry well** in its middle (`WD.cata['4']` 288,268) and the Caravan Bazaar on its east side; the bazaar street under striped awnings; homes south of it (dh_home7, dh_home8 new); the caravan yard by the south road with camels, a mule, wagons and tents. `WD.flats` keeps the town floor level. Clues: Miriam the Water-Carrier, Hosea the Caravan-Master, Little Nadab.
- **engine/decor.js**: `awning` (striped cloth on four poles over a stall of jars, rugs or spices) and `camel` (standing or kneeling, saddle-cloth).
- **engine/village3.js**: Dusthaven keeps its own flat-roofed adobe houses, bazaar and inn instead of the timber kit houses.

## V204 — Crystalpeak, the town on the mountain
- **tools/villages.py** Crystalpeak section: the mountain (box 418..540 × 176..302, `WD.cpBox` so the land climbs 3.4× as steep there; `WD.flats` so its ledges carry no swell): a warped peak north-west of the town in E bands of 2.55 each up to 15 (38 units), easing down to the sea and to the lake (the lake's dive spot stays reachable). The town on four terraces cut into its shoulder: the gate, the hot spring (tile 24) and the Warm Hearth inn; the lower and middle towns with houses cut into the rock (`b.cave`); the Mountain Cathedral (barred, bigger) and the Abbot's Quarters on the top terrace. `climb()` lays paths that step at most one ledge a tile, each step a pair of stairs: the stair-road through the town, the side stairs, and the Pilgrims' Trail switchbacking (one tile wide) to the summit cross (decor `summitCross`, Psalm 121 sign), with cairns and prayer flags. Three rock ladders between terraces (`WD.treetops.climbs`). East, a waterfall drops off a spur of rock into a pool — **the way down is the cave behind it** (`WD.cata['5']`, CFG[5].entrance `'falls'`). Clues: Pilgrim Silas, Hannah of the Warm Hearth, Little Jesse.
- **engine/catacomb.js**: the `'falls'` entrance (falling-water sheet with a scrolling texture, the stream at its lip, icicles, mist, the pool and its stepping-stones, the dark cave mouth, a cold blue light).
- **engine/treetops.js**: ground ladders (`climbs`, rock to rock, no "up" state), and cave houses: boulders heaped over the footprint to the cliff top, a dressed-stone front with an arched door, lit windows, a timber hood, a lantern, snow on the rock.
- **engine/world.js**: `WD.cpBox` overrides Crystalpeak's steep box; cave houses aren't drawn by buildHouse nor turned. **decor.js**: summitCross, cairn.

## V204.1 — Crystalpeak moved up the mountain (Machu Picchu)
- The town now stands on a level saddle **ten ledges up** (25.5 units), its plaza, the cathedral on a raised platform against the rock, and the cave houses in the rock wall behind; below it on every side narrow terraces step down the mountain (a ledge every two tiles), and a one-tile stair-road switchbacks up them from the foot of the south road. `WD.towns` Crystalpeak moved to the plaza (463,258).
- **Higher still**, on a ledge under the summit (13 ledges, 33 units): the hot spring and the Warm Hearth inn. Its overflow falls off the rock wall at the town's west end — the waterfall, with the cave behind it (`WD.cata['5']` 454,248). One more stair to the summit cross (15 ledges, 38 units).
- Trees cleared from the high ledges and the town; a rock ladder from the plaza to the ledge behind it.
- Test harness (scratchpad sm/tws/cps): forces every built chunk visible when the shot's camera differs from the game's, so wide shots no longer show the sea through culled ground.

## V204.2 — Crystalpeak's rough edges
- The farm terraces follow the hill (warped, wavering contours instead of rings) and are green turf (tile 18, which Crystalpeak's height-snow now leaves alone); the plaza too. Snow stays on the rock and the peak.
- Andean stone houses (`b.inca`, drawn in treetops.js): walls of fitted grey blocks in courses, trapezoid door under a lintel, trapezoid niches (lit at the front), stone gables, a steep thatch roof with bands and ridge — the Pilgrim's Supply, the Abbot's Quarters, the Terrace-Farmer's House and the Warm Hearth inn.

## V205 — Ashfield, rebuilding after the fire
- **tools/villages.py** Ashfield section: rect 446..512 × 462..524. The burnt quarter (north-west of a ragged line): ruined houses (decor `ruin`: blackened walls to jagged heights, a lone chimney, fallen beams, embers), charred trees, broken pillars, ember pits, the scorched chapel (barred) and its churchyard at its edge; and by the old cooper's ruin the **ash-buried cellar door** (`WD.cata['6']` 459,492, the existing clear-the-ash mechanic). The new town to the south-east: a cobbled square with a new well and stalls, fresh-timber houses (af_home3 Carpenter, af_home4 Bellfounder, af_home5 Glazier new), a house going up (`frame`, `scaffold`), lumber, the saw-pit. South of the road the ash fields ploughed and sown, green coming up in the furrows. Clues: Widow Hagar (the horn under the ash), Builder Jabez (snow won't lie there), Little Abijah (a warm door handle).
- **engine/world.js**: `WD.turf` — hand-painted turf runs [y,x0,x1,colour,hard] on the biome ground colours: soft (blurred) for the burnt quarter's ash, hard for the furrows.
- **engine/decor.js**: ruin, frame, scaffold.

## V206 — Ashfield's ruins in detail; Shadowmere, the marsh town on stilts
- **decor.js `ruin`** rebuilt: rubble-stone walls in courses broken off at ragged heights, sooted toward the top; a door and windows with charred lintels; the chimney standing over its hearth; the roof fallen in (rafters leaning from the wall-head, a ridge beam, scorched boards); rubble at the wall feet, an ash floor; embers that flicker.
- **tools/villages.py** Shadowmere section: rect 640..724 × 462..516. A mere of black water in the middle of the town, reeds at its edges; boardwalks (planks) north–south to the south road and two runs east–west; houses on stilts over the water (`b.stilts`: a plank deck on posts under each) with their doors on the boardwalks (sh_home3 Eel-Fisher, sh_home4 Reed-Cutter, sh_home5 Lamplighter new); on the dry rise to the north the barred chapel and **the Knights' Hall** (sh_hall, keep, Old Sir Bevan inside). Lanterns, mist, dead trees, punts tied up. East, a jetty out into the open water — and on an islet past it **the knights' tomb** (`WD.cata['8']`, the existing barrow: its door opens to a bell). Clues: Watchman Gideon (the bell on the isle), Widow Esther (a light walking round the tomb), Little Joel. `WD.towns` Shadowmere moved to (669,483).
- **The ferry** (`WD.ferries`, engine/treetops.js): Asa the Ferryman stands on his punt at the jetty; talk to him and he poles you across (the punt glides along its path, he works the pole, you ride in the bow; the ground under you is the punt's deck and you can't step off mid-way), and waits at the islet's landing to bring you back. Coming out of the tomb, or loading a save on the isle, finds him on that side. `GAME.S.ferried` remembers you've been across (his first words differ).

## V207 — Hellgate: the old kingdom's great city
- Hellgate is rebuilt as the ruined capital of the old kingdom, built against the mountain over the northern sea (tools/villages.py HELLGATE; centre 658,50). Six great circles plus the citadel; each circle is a level street two ledges above the last, behind a wall whose top is a walkable wall-walk (battlements on the outer edge). The land inside WD.hgBox climbs as steeply as Crystalpeak (world.js `HGB` joins `inCP`), and the walls aren't snow-whitened.
- The road climbs to the Great Gate (south). The next gates alternate east and west, so the way up goes round the whole city, and the citadel is entered from the west. Stairs climb onto every wall-walk at four places round each circle.
- The prow runs down the middle: a tower on each wall, with a stone bridge from the wall above down to the tower over the street (treetops.js stone bridges). You walk under it in the street and over it along the walls; the towers have stairs down to their wall-walk on both sides.
- Homes and shops are cut into the foot of each wall: 73 ruined fronts plus three lived-in cave houses (The Last Hostel, The Old Armoury, The Gatewarden's House). A clear lane is kept round the middle of every street so rubble never cuts a circle in two; the generator checks that the keep door and the ossuary can be reached (`hgBFS`).
- The citadel holds Abaddon's Throne (FINALE door) and the Desecrated Cathedral (barred), beside the white tree's dead stump.
- Catacomb way in: the pilgrims' ossuary just inside the Great Gate (`WD.cata['9']`, needs the crook). Clues: Pilgrim Ephraim, Pilgrim Huldah, Little Micah. Catacomb CFG[9] text updated.
- The old monk's cave mouth moves to (606,72), west of the walls (`WD.monkCave`, luminar hollow check). The trek's last samples end before the gate; the town marker is at (658,100).
- Tested: a 566-step walk from the road to the keep door passes canMove at every step; all 5 stone bridges walk from wall to tower, with the street passable underneath; the clues set heard; the ossuary hooks open to Descend; the cathedral is barred. Not tested: a full catacomb run from the ossuary.

## V208 — mountain cities as mountains; the painted art style, second pass (a test, off by default)
- Crystalpeak: only the saddle town, its three green terraces, the stair-road, the spring ledge and the summit are walkable ground; every other ledge of the cone is now mountainside (unwalked ground with a level → the engine's one-skin massif of rock, scree, alpine turf and snow). tools/villages.py `_core/_keep`. Route from the foot to the summit, plaza, spring and falls checked by BFS.
- Crystalpeak's drops (world.js groundMesh, inCP and not Hellgate): natural rock faces — leaning out to a scree foot, cracked and bulging, streaked, the ledge's turf hanging over the lip — instead of banded rows. The shader's stone courses now only show on truly vertical faces (kit.js `up<0.1`).
- Hellgate: the mountain behind the city rises in ridges to a snow-capped summit (AH rises with depth into the rock, world.js `inHG`); its walls are plain masonry again; near land is drawn 34 tiles further out round Hellgate on the higher graphics tiers so the whole city is seen from its gate (`VIEWX`). Far-country colours for both mountains updated.
- Art style "painted" v2 (engine/style.js; ☰ → System → 🎨 Art style, or ?art=painted): cel bands, a world-space watercolour wash and brush strokes on every lit surface (`vArtW`), blue-violet shade and warm light, heaped sun-lit clouds on the sky dome (the older cloud cards hidden), grass blades that take the ground's own green, grow on lawns and flowers too, and pale wind-waves running over them. LOOK2's own trees are kept. Classic stays the default until the look is approved.
- Screenshot harness note: with a detached camera the FAR-country mesh shows through near chunks (it is cut away round the player only) — hide it (art.py does).
