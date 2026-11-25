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

## V209 — the painted look is the default
- engine/style.js: `painted` unless classic is chosen (☰ → System → 🎨 Art style). Smoke run in painted: clean.

## V210 — clean-up: smoother mountainside, no stray rocks on stairs, Hellgate way-finding
- world.js: mountainside skin runs in slopes (ledge banding 0.75→0.22, vertex jitter halved); crags only deep in the rock and fewer; cliff-foot boulders never on roads, beside stairs, or in Hellgate; rock faces do not lean over a stair or path.
- villages.py Hellgate: wall stairs moved to 9 tiles either side of the middle tower; a sign by each explains the straight way up (wall stair → middle tower → bridges tower to tower to the citadel) and which way the next gate lies.
- To do: feet sinking into the ground (asked for later); town clean-up passes in story order; lawn green in painted mode.

## V211 — feet on the ground
- body3.js: the fitted body is lifted ~0.05 (pelvis anchor +0.106 in rig units) — the fit aimed the feet at the ball-of-foot bone, which is inside the boot, so the soles stood 0.05 under every floor. Measured lowest sole vertex standing: -0.047 → 0.000.
- world.js ground(): on a stair tile you stand on the step itself (same step count as city.js stairBoxes), not on a ramp through the treads.
- core.js: the knight follows the ground 3× faster (48 up / 24 down, was 16/10), so climbing he no longer trails under it.
- Not measured: soles mid-stride while walking (the headless test could not drive the walk cycle).

## V212 — gentler weather
- engine/weather.js: fog from every weather starts much further out (e.g. sand near 3→14, far 32→70; snow 8/52→22/95) and tints the world and sky less (0.75→0.5, 0.6→0.35); the sun dims about 40% less; about half as many snowflakes, sand grains and ash flakes, smaller and fainter; rain thinner and lighter; lightning half as bright.

## V213 — movement pass 1: bow and climbing
- combat.js: with a bow he no longer lunges like a swordsman — he turns to the nearest mark within 9 and stands; the shot is a real arrow (arrowMesh: shaft, head, three feathers, pale streak) flying a shallow arc, nose rising then dropping, spinning.
- knight.js climb pose: hand over hand, opposite knee driving, body rising on each pull, looking up.
- Not verified in motion: the headless harness could not be slowed (a virtual clock via performance.now/rAF did not slow the engine) — stills only. Mount/dismount (riding.js transit, V184) unchanged so far.
- Lyre design agreed (not built): four-note chords on buttons, played in any order; bumpers/keys shift the key up or down; free play; songs learned through challenges or composed; no powers; Sir Josh gives it in Ironhold — it was your father’s.

## V214 — the Lyre, first playable (brief stages 1–2)
- New engine/lyre.js (built first so its key listener precedes the game’s; nothing else rewritten): plucked-string voice on AUDIO2D’s graph (audio-clock scheduled, hush() stops everything), four chord slots of four notes (I IV V vi → Ⓨ Ⓧ Ⓑ Ⓐ / keys 1–4), played in any order; LB/RB or Q/E move the whole harmony a semitone (−6..+6); RT/Space strums again; eight open strings (Z X C V B N M , / ✚); 🎵 button or L takes it out, Start/L/Esc/✕ puts it away. Standing still while it is out (ENGINE.hold … lyre); swing/guard cannot fire.
- pad.js: one line hands the buttons to LYRE.pad while it is out. knight.js: pose mode lyre. build.py: lyre.js first.
- Tested headless: chords name correctly in C and after transposing, keys do not reach the game, no walking while out, walking again after, no errors. NOT verified: the sound itself by ear (no audio in the test browser), the playing pose and lyre model on screen, a real controller.
- Not yet built: songwriter grid and songbook (restfulKnight.lyre.v1), bards, lyre looks and moods, the gift scene (Sir Joshua, Ironhold — it was your father’s). For now the lyre is simply in your pack.

## V215 — a real lyre voice, Zak’s two clips, the flag of Luminar
- lyre.js: the voice is now a Karplus–Strong plucked string (built once per pitch) through a small wooden body (two resonances, top rolled off); chords voiced open (root, fifth, octave, third above) in the lyre’s range and rolled like a harp; a re-plucked string stops its old ring; at most 28 voices; a repeat strum goes back up the strings. While out it plays Zak’s clip where the animation library has loaded, the hand-set pose where it has not.
- engine/anim_extra.js (new, before rig.js): Mixamo “Guitar Playing” → clip lyre (whole, loops, 7.5 s) and “Shooting Arrow” → clip shoot (2.05–4.5 s: raise, draw, loose), baked onto the UAL rig by scratch bake.py (three r128 FBXLoader; each bone’s turn from Mixamo’s T-pose applied to the game rig, which is also T-posed) and added to ANIM_UAL.clips at load. The lyre clip is a wide rock-guitar stance turned side-on.
- combat.js: a bow shot lasts 0.95 s and the arrow leaves at 0.78 of it, with the clip’s loose. knight.js: lyre overlay; shoot overlay weight 0.95.
- engine/arms.js (new): the flag of Luminar after Zak’s shield patch — crown and cross, wheel, thorns, three drops, ΧΡΙCΤΟC ΒΑCΙΛΕΥC on an arc (first-century hand: capitals, lunate sigma) — one canvas per town in its colours; on banner2/sf_banner, ty_flag/regatta, the Stormgate keep banners and each town’s donjon flag (TWALL[k].key). The King named is Christ.
- Seen: flag sheet for all towns; a Shadowmere banner in the world; bow pose; lyre clip plays. Not heard: the new voice (no audio in the test browser).

## V216 — the songwriter and the songbook (lyre brief stage 3)
- New engine/lyrebook.js (second in the build, after lyre.js): 16-step grid — four chord rows (one chord a step) and eight string rows; title, key, tempo 60–160, four moods (cozy folk 84, adventure 112, sacred 66, playful folk 126 with swing), play/stop, loop, save, clear (confirm). Songbook: play, edit, favourite, copy, export to a .lyre.json file (and the clipboard), import (file ≤200 KB, every field checked and clamped, markup stripped, never executed), delete (confirm).
- Playback queues steps 0.25 s ahead on AudioContext.currentTime through LYRE.chordAt/noteAt; stop() hushes at once; a stalled page resumes from now.
- Storage: localStorage restfulKnight.lyre.v1 = {v:1, songs, bards} — the game’s save is not touched. LYREBOOK.teach/bard/forget are ready for the bards.
- lyre.js: 📖 Songs on the prompt, View on the pad; API chordAt/noteAt/slotName/keyName/ctx. pad.js: #lyreBook counts as a panel (stick moves, Ⓐ presses, Ⓑ → Esc → back).
- Tested headless: compose, title cleaned, save, copy, favourite, Esc closes the book and leaves the lyre out, game keys do not leak, hostile stored data is cleaned or dropped after reload. The headless audio clock runs ~16× real time, so playback timing and the moving playhead were NOT observed — check by ear.
- Next: an inn bard (teach a song / ask to hear one, remembers it), then Sir Joshua’s gift scene in Ironhold; lyre looks; melody polish.

## V217 — the inn bards, and the lyre as your grandfather’s gift
- The lyre is given by your grandfather Tobias in Hearthvale when his lessons end (cities/luminar.js gift(): it was your father’s; 1 Samuel 16 in his own words; sets S.lyreGift and S.lyre). LYRE has() = S.lyre or the tutorial done, so a knight already on the road has it; the 🎵 button and L are hidden before that. (Supersedes the earlier plan of Sir Joshua in Ironhold.)
- Bards: every inn’s existing bard (rooms.js bard prop; roomlife.js “The bard” spot) now opens LYREBOOK.bardMenu: sing a hymn (as before) · ask to hear one of the songs he has been taught · teach a song from your book · ask him to forget one · enough for now. He knows only what he was taught at that inn (db.bards[level id], in restfulKnight.lyre.v1). perform(): plays on the lyre’s strings, the bard swaying in time; then on through his repertoire with a 5 s rest while you stay; stops at once on leaving the room, on stop, or on forget.
- Fixed in test: bard ids contain colons (in:inn:0) and were dropped on reload by the id check.
- Tested headless: gift scene sets the flags and Tobias then talks normally; bard menu without a lyre is hymn only; teach → hear → performing; stop offered while playing; repertoire survives reload. Not observed: the performance in time or the sway (audio clock runs fast headless).

## V218 — exploration, first slice: two hidden places in the Forest of Disillusionment
- engine/forest.js patches the hand-drawn map at load (D.hand.nooks) and adds tiles 119 mossy log · 120 gap · 121 rock stack · 122 scripture stone · 123 resting stone · 124 keepsake chest.
  · The Mossy Span (branch east of the upper trail at row 24): a 3-wide ravine with a moss-green fallen log across it, to a sunlit glade.
  · The Stepping Rocks (branch east of the lower glade at row 129): a gorge with two rock stacks, three one-tile gaps; a gap can only be crossed in the air (ok2: airH>0.04; only the centre probe counts), and a missed jump puts you back where you last stood, unhurt.
  · Each glade: a standing stone with a verse (Psalm 23:2–3; Psalm 119:105), a mossy stone to rest on (full strength; points to the lyre), a chest (gold and a keepsake), flowers and a shaft of light. State in S.forestNooks; journal entries. Pale worn stones mark each way in off the trail; pale worn rims mark the jumps.
- Every drop in the forest (ravines too) is now a real drop: no floor laid over it (gridLevel noFloor), dark far below, rock faces under each lip.
- Tested headless: the span walks end to end and is blocked off the log; the gaps block on foot; the stone, chest and flags work. NOT tested: the jumps in motion (jump air time 0.58 s; at the slowest walking pace that clears about 1.2 tiles against a 1-tile gap — tight; say if it needs widening), the rest spot, the Stepping Rocks by eye.
- Agreed direction: this style of exploration (log and beam balancing, gaps to jump, painted marks; rewards: quiet places, chests and keepsakes, scripture stones), Ghibli × Breath of the Wild art; ledge shimmy and vine climbing were not chosen for the first slice.

## V219 — the stepping rocks can be made
- A full run-up jump only just cleared a one-tile gap (driven test: launched at 55.72, came down at 56.6, inside the gap, and was sent back). Now if you come down in a gap facing a standing tile within 0.75, you catch its rim and pull up onto it (hold 0.35 s); only a jump the wrong way or from too far sends you back. Driven test: first gap crossed onto the rocks, second jump launched (the headless frame rate ran the clock out there).

## V220 — the forest grows an undergrowth (painted look)
- forest.js: grass blades (ART.BLADE with the overworld wind, ART.grassMat — now exported by style.js) over every clearing, 7 a tile at the trees’ feet, 5 near them, 2 on the open trail; ferns (a hand-built 7-frond mesh) at the trail edges; moss cushions; small white flowers in the open; up to 40 soft additive light shafts where the trail opens. The floor no longer checkers: gridLevel soft drifts its colour in broad patches. Classic look unchanged.
- Seen: three shots (upper trail with a demon, the pond glade); reads much lusher. Not measured: frame rate on a phone (~13k extra instances in one draw for the grass).

## V221 — mount and dismount polish
- riding.js transit: mount lasts 1.5 s (was 1.15): the steed comes up (0–0.5), he crouches and leans toward it (0.4–0.64), springs with the jump clip on his arms and a puff of dust where he left the ground (0.64–1.22), lands in the saddle with a second puff, and the saddle gives a little under him (1.22–1.5). Dismount lasts 0.2 s longer: he lands with the landing clip, a puff of dust, bent knees, then straightens. puff(): nine soft motes that spread and fade in 0.65 s.
- Filmed: in the air over the steed, seated, and down beside it; the crouch and the dust are too quick for the test camera to catch.

## V222 — hidden islets across the realm
- tools/villages.py WILDWAYS: six small islands made into true islets (every shallow within 4 turned to deep water), each given one crossing at its shortest straight run of water: a mossy log (a treetops stone bridge with log:1, drawn by wildways.js; treetops skips its stone drawing) or stepping stones (tile 25, the bank’s level) with one-tile gaps. Each holds a standing stone (its own verse), a mossy seat and an old chest (gold and a keepsake). Generator prints that each is cut off on foot: the Reed Isle (log), the Heron Stones (1 stone), the Willow Islet (1 stone), the Drowned Garden (log), the Lonely Skerry (log), the Far Islet (2 stones). Verses: Isaiah 43:2, Matthew 11:28, Lamentations 3:22–23, Psalm 121:1–2, Isaiah 40:31, Psalm 62:1–2.
- New engine/wildways.js (after treetops.js; attached in luminar after TREETOPS): logs, stones with pale rims, the gap rule (a gap tile only in the air; mid-jump you keep the stones’ height; short and facing dry footing → catch the rim and pull up; else back to the last dry footing with a splash), nooks with spots, flowers and a light shaft. State S.wildNooks; journal entries.
- Tested headless: the Reed log walks bank to isle (heights 0.54→0.23→0.65), stepping off its side is blocked, the Heron gap cannot be waded, stone and chest work. Not driven: the jumps themselves out in the world. Harness note: screenshots must prime the chunks (L.prime) or the FAR mesh shows land as blue water.

## V223 — the brothers’ crossing in every catacomb
- engine/catacomb.js carveNook(): when a catacomb is attached, its first level gets a side chamber cut into solid rock (a 17×7 block, margin included, all rock; breached from plain floor): one floor tile, a three-tile timber beam (“+”) over the drop, a pillar, a gap (“^”), a pillar, a gap, and a 5×5 cell. The rows either side over the drop are chasm. All ten catacombs got one (D._nook).
- build(): “+” and “^” are drawn as drop with no floor; the beam is a timber plank; the pillars stand on stone columns; pale lips by each gap. ok(): “^” only in the air. Landing in a gap facing floor → catch the lip; otherwise back to the beam’s head, unhurt. The cell: a verse cut in the wall with a candle (NOOKV by town — Psalm 23:4, Psalm 27:1, Deuteronomy 33:27, Isaiah 40:29, Psalm 4:8, John 1:5, 2 Corinthians 12:9, 1 Corinthians 15:55, Ecclesiastes 3:11, Revelation 21:5), a stone bench (rest), a chest (gold, a brother’s prayer beads). State GAME.S.cata[t].nook.
- Existing puzzles untouched (rock only). Tested headless in Hearthvale’s: room to beam to first pillar clear, off the beam blocked, the gap blocked on foot, verse, chest; seen in two shots. Not driven: the jumps.

## V224 — draw and aim for bows; the lyre for older saves
- engine/combat.js: a bow is now hold-to-draw, release-to-loose (Swing / J / left click / pad X). While drawing, the knight turns to the nearest foe within 9 tiles, a faint aim line grows on the ground, and you walk at 30% speed. The minimum draw is 0.32s; a full draw takes 0.85s. Draw strength (taken at the moment you let go) sets the arrow's speed, range and damage (×0.7 → ×1.3).
- engine/knight.js: K._bow overlay holds the 'shoot' clip at full draw (u up to 0.7) while drawing, then plays the release (0.72 → 1).
- engine/lyre.js, engine/lyrebook.js: the lyre is owned unless a brand-new knight is still in Tobias's first lessons. Saves from before the tutorial record existed now show 🎵.
- Note: Space is Jump; strike/draw is J (rebindable in ☰ System → Keyboard Controls).

## V225 — the tall woods
- engine/world.js: overworld forests are walkable. Giants stand on a loose, jittered lattice (about one per 2×2 of forest, scale 1.7–2.7). New tall shapes: oakT (umbrella crown on a long bole with reaching boughs), pineT (lowest tier clears your head) and birchT. The floor between them has ferns and the odd bush. A lone tree or short row (hedges, village oaks) keeps one per tile, grown a little. Only trunks block (lv.trunkAt, r about 0.1×scale).
- The wood's gentle rise is also walkable. Relief forest within 4 tiles of open ground and under 2.9 high (FWB) gets ground() from the relief skin (reliefV0, bilinear), and a slope rule applies on forest floor (up ≤ 1.0 per unit; step down anywhere). Deep wooded ranges stay hills. About 91% of forest tiles are now walkable.
- lv.WK and lv.walkTile use FWK (forest included), so riders and demons can enter too. Drawing still uses WK. camBlock lets the camera sit under the canopy (forest tile top+0.3).
- Canopy fade (canopyFade, the tree material's shader): anything of a tree between the camera and the knight dissolves in a dither. A narrow tube at his shoulders widens toward the lens, and leaves within about 2.5 of the camera fade too, the way BotW handles it. Shadows are untouched.
- engine/forest.js: gridLevel o.tall. The Forest of Disillusionment (tall 2.1) has oaks most of all (70%), 2.1× taller with crowns grown 1.45–1.85× wide over the trail (randomly turned), and firs tall and narrow. The same canopy fade applies, with the camera pitch lowered to 0.44.
- Not touched: portal worlds (opt.land), the mountainside firs, Eldan's Glade and other tree-walled levels.

## V226 — lag and freezes, the bow in hand, clear forest trails
- engine/world.js — memory: each overworld chunk's dressing (buildings, decor, signs, ships) is now let go once you're well away (more than VIEWX+26 tiles; up to 4 per frame) and built again when you come near (dressChunk / undressChunk; lv.prime does the same).
  - Before, every chunk ever visited kept its buildings: about 5.8MB of geometry a chunk, roughly 190MB for the 33 round the start, growing without limit as you travelled. That's the browser freezing and crashing.
  - Measured on a 10-stop tour across 307 chunks: about 30 stay dressed and the heap holds at about 540–640MB (before: rising with every new area).
  - Dressing animations run from ch.anims, and only while the chunk is shown, so a rebuilt chunk never doubles them. Chapel lit/dark, ship bobbing and decor all moved there. Door hinges are cleared with the chunk, and chimney smoke sources are deduplicated.
- Measured, not changed: the tall woods (V225) draw fewer triangles than before (1.6–1.75M vs 1.9–1.95M at the same forest spots). The remaining startup heap is mostly the 147 villagers (about 98MB, each a full rig) plus the terrain of every chunk seen.
- engine/knight.js — the bow:
  - Drawing a bow counts as busy arms (K._bow), so the bow comes off the back.
  - It's held in the LEFT fist, as the archer's clip holds it (drawNow: AL.hand, rotation π/2,0,0, found by testing the 24 orientations).
  - The shield is hidden while the bow is in hand and comes back when it's stowed.
  - stow() and fishing also release from the left hand.
- engine/forest.js — the Forest of Disillusionment uses the tall shapes (oakT/pineT): slim trunks on their own tiles, crowns high over the trail. The widened old oaks' root flares had spilled into the paths.

## V227 — a real bow draw; smoother running
- engine/knight.js — the bow:
  - The archer's clip now drives both arms (K._rArm on ov 'shoot'). Before, only the left arm followed it and the right stayed in the sword pose, which read as pointing a pistol.
  - Measured through the clip: the right hand reaches the cheek about 20% in and full draw runs from about 55–75%, so the draw holds at 62% and the loose plays 76% → 100%.
  - A real string: two lengths from the tips to a nock that follows the right hand (clamped to 0.78 of the bow's size). On release it snaps home with a damped shiver (0.6 s).
  - An arrow is nocked on the string while drawing.
  - bowAim(): the bow stands upright in the left fist in world space, its belly along the line from the drawing hand to the bow hand, canted 0.18. The clip doesn't set the wrist, so no fixed angle in the hand worked.
  - K._bowU is a test hook that holds the clip at one moment.
- engine/world.js — smoother running:
  - cullFar(): every 20 updates, anything set straight into the overworld scene (not into a chunk) that is further than the drawn land (VIEWX+30) goes onto layer 5, which neither the camera nor the sun's shadow renders. It comes back when near. .visible is left alone, so the story's showing and hiding still works. Things laid out from the origin, unculled objects (sky, far country) and the knight are skipped.
  - At the start town, meshes the renderer considers outside the chunks dropped from about 7,000 (227 groups, median 421 tiles away; 45 demons; all 147 villagers) to about 880.
  - Re-dressing a chunk (its houses) is limited to one per build step, so riding into a town no longer builds two towns' worth in one frame.

## V228 — folk built only when near
- engine/people.js: addPerson(…,{lazy:true}) makes the figure an empty stand-in (folkHolder) that keeps position, facing and .visible. folkWake() builds the real figure (about 90–100 pieces on a full rig) and carries over anything the game hung on the stand-in, like a quest's ❗. folkSleep() swaps the stand-in back, keeps those extras and disposes the figure's geometry and skeleton.
- engine/world.js: every 8 updates, lazy folk within 48 tiles are woken (2 a pass) and those beyond 72 put to sleep. lv.prime wakes those within 40 of where you arrive.
- Lazy: the overworld villagers (world.js), the side-quest givers (sidequests.js) and Old Shepherd Abner (landmarks.js). Still built at once (rarely far, or used as models elsewhere): the tournament's Herald and Marshal, Asa the Ferryman, Reuben, the crypt guard.
- Measured at the start: folk meshes about 5,400 → about 1,960; startup heap about 570MB → about 475MB. Tested: a giver far away sleeps with his ❗ kept, wakes on return with it, and can be talked to either way.

## V229 — installable: a web app for Chromebooks/phones, a Windows app
- pwa/ (copied to the site root by build.py and the ship):
  - manifest.webmanifest: fullscreen, landscape, the shield-and-cross icon (self-made) at 192/512, plus maskable and apple-touch versions.
  - sw.js, the offline worker: the page is fetched network-first and kept for offline. three.js, models, music and icons go stale-while-revalidate into one cache ('lk-assets') that outlives updates, so a new version never re-downloads the 80MB of models. Google Fonts are kept too.
- engine/shell.html: manifest, theme-color and icons; registers sw.js only when served over http(s) and not on localhost (?sw=1 forces it for tests).
- Tested: after one online visit, a reload with the network cut loads the game (title, three.js, all 24 cast models).
- desktop/ is the Windows app (Electron 33):
  - The game is served from inside the app on a private app:// address (protocol.handle), so models and music load as on the web, and saves live in the app's own storage.
  - GPU blocklist ignored, GPU rasterization, no background throttling, 4GB JS heap. F11 or Alt+Enter for full screen, F5 to reload; no menu bar.
  - package.json uses electron-builder for an NSIS installer and a portable .exe.
  - Tested here on Linux under a virtual display: app://game/index.html loads the title screen with all models.
- .github/workflows/desktop.yml ("Desktop build"): on windows-latest, gathers index.html, three.min.js, models, music and icons into src/desktop/game and builds both .exe files as a run artifact. A desktop-v* tag also makes a Release with the tag's version.

## V230 — the living woods
- **Forest floor** (world.js `floorDress`): between the giants of the tall woods, ferns (≈50% of floor tiles, swaying in the wind), moss cushions, toadstool clusters, the odd fallen mossy log (never beside a trunk), and under the thickest canopy faint shafts of sunlight that fade out as the sun goes down. All instanced per chunk, deterministic, rolled back on margin tiles like the rest.
- **Wildlife** (new engine/woodlife.js): deer and stags (rigged ANIM3 models), rabbits, red foxes and little flocks of birds spawn 10–22 tiles off in the woods and are let go beyond 35. They graze and wander between the trunks and bolt when you come close (sooner on horseback); birds fly up through the canopy and away. Fewer by night.
- **Small finds**: 24 fixed sites deep in the woods, ≥40 tiles apart — scripture stones (verses of trees and rest, XP), keepsake chests (a keepsake, gold, XP, journal) and ruined shrines (kneel: full heal). Built only within 45 tiles. State `S.woodFinds`.
- **The Hermit's Glade**: the walled-off meadow by the southern sea (~371,754) — ruined hermitage with ivy, fallen beam, gable cross, the hermit's lettered wall (Psalm 23), bench (rest: heal), and his chest (150 gold, once); overgrown garden; a still pool with lily pads under a little waterfall (drink: heal); an ancient oak; a calm herd of deer and stags; butterflies. Walls, pool, rocks and oak block the walk. First visit: toast, XP, journal. State `S.glade`.
- lv.tileAt / lv.fdens exposed for modules.

## V231 — the bow, cleaner
- engine/combat.js: the line on the ground is gone; two ways to aim, both with a crosshair (one DOM reticle, #bowRet):
  - **Lock-on (default)**: drawing settles a reticle on the foe you face (or your lock-on target — F / RB / R3; flick to switch). Its ring closes as the draw fills and turns gold at full draw; grey when the mark is beyond this draw's reach. Off-screen marks wait at the screen's edge. No foe: it floats ahead.
  - **Over the shoulder**: hold Guard (right mouse / LT / LB / Shift; the touch button reads "Aim" with a bow) — the camera eases over his right shoulder, zooms ~18%, a centre crosshair; mouse / look stick aims; a foe under the crosshair turns it red and the arrow keeps to him. No shield or parry while a bow is in hand. Walk at 55% while aiming, 30% while drawing.
  - Reach: tap shot ~12 tiles, full draw ~25 (was 9). Arrows fly 18–30 tiles/s, curve after their mark (≤0.14 rad a frame, given up past ~63°), and step twice a frame so a fast arrow can't skip through a foe. Lock-on reaches 25 with a bow (12 otherwise).
- engine/core.js: COMBAT.aimCam(cam,dt) after the follow camera.
- Tested headless: lock-on shot hits a foe at 18 tiles; shoulder-aimed shot hits at ~15; crosshair red over a foe; no page errors. Not tested: real mouse/stick feel, phones.

## V232 — the shield on his back; two-handed weapons guard with the weapon
- engine/knight.js: with a bow, a greatsword (heavy: greatsword, Gideon's sword) or the warhammer, the shield rides high on his back (shBack on the torso, face out, point down, over the cape), as on Zak's back-view sheet: a weapon put away goes behind it, hilt over the right shoulder, the point out below on the left. The shield is 20% wider everywhere (sh.scale.x). One-handed swords, the staff, the Holy Blade and fists keep it on the forearm. shieldHome() moves it as the weapon changes; the hero's shield-facing and the guard's shield moves are skipped while it's on his back. The bow no longer hides the shield.
- Two-handed guard: Guard with a heavy weapon or the hammer holds it up across the body in both hands (K._hbP pose, eased with the guard) instead of raising the shield. It still blocks and parries as before (combat unchanged: only a bow disables the guard).
- Seen in stills: back (bow and greatsword over the shield), the guard with greatsword and hammer, the shield back on the arm with a one-handed sword. Not seen in motion.
- Heavy swing: Zak's Mixamo "Heavy Weapon Swing" (2.2–3.5 s: raised and brought down over the head) baked onto the rig (engine/anim_extra.js clip 'heavy'; scratch fbx/bake.mjs, three r128 FBXLoader in node, each bone's world turn from Mixamo's T-pose applied after lining the rig's bones up with Mixamo's). Greatswords, Gideon's sword and the warhammer play it whole (both arms and the body; the hand-keyed cut is skipped), its strike at 0.42 with the hit (combat lands heavy blows at 0.43). K._swU: test hook to hold a blow at one moment.

## V233 — the arms of Luminar on the shield; the smith paints it
- New engine/heraldry.js (HERALD, built before knight.js): Zak's shield artwork (the tree and its roots, the wheel, the crown of thorns, the three drops, the crown and cross; navy and gold) as a heater shield cut to the artwork's own outline (96-point trace), a little curved, gilt edge and back, two leather straps. The artwork is kept as colour masks (scratch herald/gen.py: R the charge, G the border, R+G the white of the cross, B 255 the drops, B 128 the black edge, A inside) so any tinctures can be painted at run time (one cached CanvasTexture per colour set).
- engine/knight.js: every knight's old kite (and the sculpt's kite) is put away for it (sh children hidden, b3hid); liveries and gear looks no longer change the shield. The hero's colours follow GAME.S.shieldCol each frame (HERALD.paint, a no-op unless they change). The back-slung shield turns upright (in-plane turn 0). The shield is the artwork's width (0.56; sh.scale back to 1).
- The smith at Ironhold's Great Forge (ih_forge, cities/luminar.js) now opens "your shield": a live preview, ten tinctures (Azure, Sky, Gules, Vert, Purpure, Sable, Argent, Or, Silver, Copper) for the field, the arms, the border and the drops, "Luminar's own colours", and Paint it for 30 gold (S.shieldCol); "See his wares" goes on to the shop.
- engine/body3.js: toonify skips meshes marked userData.keepMat (the painted face keeps its texture).
- Seen: Luminar's colours and a red/argent/silver set on his back; the shield on the arm; the smith's sheet (green field, 30 gold taken).

## V234 — the great helm and the armoury, sharpened
- engine/knight.js, the hero's helm (Zak's sheet): the sculpt's rounder helm (head parts helm/visor/gold) is put away for a faceted great helm built in code — a skin with a keel down the face, the eye-slit across it and the breath-slit down the keel cut dark (the T), a gold brow band arched over the slit and sweeping toward the ears, a gold crest band in two halves riding the keel from the brow over the crown to a gilt plume-socket, a gilt rivet at each ear. It takes the livery's/gear's helm colour (M.helm). Placed after the procedural/sculpted split so the sculpted hero gets it.
- The weapons (setWeapon): swords and the Holy Blade are forged blades — hexagonal section with bevelled edges tapering to a point, a fuller on each face, a langet over the ricasso, quillons swept toward the blade with diamond finials, leather-bound grips, wheel pommels; the rusty sword pitted and notched; the Holy Blade's glow takes the blade's own shape. The warhammer: an eight-sided banded head with a flared face, back and top spikes, iron langets and a bound grip. Aiden's staff is a shepherd's crook (hook, bound grip, brass bands, iron ferrule). Bows: staves taper from grip to horn-capped tips, a wrapped grip and arrow rest. The crossbow gets a butt, a bolt groove and a stirrup; the throwing axe a bearded head. Same lengths and holds as before.
- Seen: helm front and side; all thirteen weapons laid out (scratch wshow.py).

## V235 — heavy weapons in both hands; the cape under the shield; shots you can follow
- data/systems.json: Gideon's Sword of the Spirit is a heavy weapon (EQUIP type 'heavy'), as it is drawn — it now fights like the Greatsword (heavy swing timing, the overhead clip). Checked the rest: Greatsword and War Hammer heavy; Rusty/Short/Iron sword, Holy Avenger and Shepherd's Staff light; Tide Gauntlets heavy fists; Throwing Axes and Crossbow heavy ranged.
- engine/knight.js: a two-handed weapon in hand is held in both hands — a ready stance (K._rdP, eased in with K._rk) whenever it's out and not swinging, guarding or charging; the guard pose as V232; it still goes across the back when put away. 
- The cape and the back-slung shield: the shield sits a little further out (z −0.32) and, while it's on the back, the cape is pinned under it (capeP turn held to ≤0.08, its bend ×0.4, its kick ±0.02) — it no longer flies out through the shield; below the shield it still moves.
- engine/combat.js: each ranged weapon throws its own shot — arrows (bows), a short heavy bolt (crossbow, +15% power), a throwing axe tumbling end over end (slower, +25% power), a sling stone — all drawn larger (scale ≥0.8) with a pale streak behind; an arrow, bolt or axe that hits stays in the foe a moment (~0.7 s).
- Test hooks: K._capeX / K._capeB hold the cape's swing and bend.
- Seen: the ready stance front and side; the cape flaring under the shield from above and behind; all four shots land (foe hp falls), an axe caught mid-flight.

## V236 — two hands on the hilt, the bow at the ready, shafts that stay where they strike
- knight.js `twoHand(w)`: two-bone IK solves the left arm onto the grip (`K._2hO` 0.12 below the right fist, elbow pole `K._2hPole`), the left fist turned as the right. Runs last in the frame (after clips, stance, foot IK) whenever a heavy/hammer weapon is out in the right hand (not spin/charge/draw/dash/sit/ride/climb/fish); blended by `K._2h`.
- knight.js bow carry: a drawn bow at rest (not shooting) is held upright at the ready in the left hand — pose `K._bwP` [-0.25,0.1,0.18,-1.2,1.2,0], blended by `K._bwR`. It used to hang off the fist tip-down.
- setWeapon while drawn now re-homes the weapon (`drawNow`), so a bow switched in goes to the left hand, not the right.
- Cape pin fix: the V235 kick clamp ran before the kick was set; it now runs after.
- combat.js: projectiles lodge. A hit sticks in the foe ~5 s (300 ticks), at a random height on the side it struck, and follows him; if he falls it drops beside him. A miss comes down and sticks in the ground ~7 s (arrows/bolts nose-down, the axe head-down, stones lie). A wall hit sticks in the wall. Shrinks away over the last 20 ticks; capped at 40 lodged at once.

## V237 — free aim in three dimensions, shafts in the trees, first person
- combat.js: projectiles fly in 3D (`s.y`, `s.vy`, drop `PG`=0.003 tiles/frame²). Over-the-shoulder aim (holding Aim, or drawing with no foe locked) looses straight down the crosshair — `aimPoint()` marches the camera ray to the first solid, ground or foe — up or down, compensated for the drop at that distance; no homing. A tap-fire at a locked foe still homes, now in height too. Spent shafts fall harder and land.
- `projSolid(x,z,y)`: tall-wood trunks (`lv.trunkAt`, radius + 0.1, up to 2.1×scale), then the level's `camBlock` (walls, houses, rocks, tile trees), else `!walk` below 2.6. A shaft lodges in a wall or trunk where it struck, nose at its flight angle, with a short quiver (8 s). Ground hits keep the flight's angle. Foe hits lodge at the height they struck. Test hook `COMBAT._aimPoint`.
- aimCam: the shoulder look follows the camera's pitch (`aimPitch`), so you can aim high or low. ENGINE gains `pitch` and `yaw` setters.
- First person (☰ System → View → Camera), saved in `klk3d_fp`, switches live. core.js: the eye at the head pivot (`K._head`, hidden in first person with the plume), the look's rise from pitch (`fpElev`), FOV +30%, he faces where you look; steps back to third person when riding, seated, in a cutscene or a minigame. knight.js first-person carry poses: one-handed `K._fpR`/`K._fpL` (blade up on the right, shield on the left), two-handed `K._fpH` (left hand by the V236 IK), bow `K._bwPF`. aimCam only zooms in first person.
- shell.html: the start-up error box ignores errors that aren't the game's: browser-injected scripts (Brave's wallet `window.ethereum…`), extensions, and empty cross-origin "Script error." A friend's Brave on iPhone showed one.

## V238 — first person in the saddle, a wider look, shots that follow the aim, a clean two-handed ready
- combat.js `loose()`: the free-aim check is read before the draw is cleared (it used to be read after, so a plain draw-and-release always flew flat). Free aim = shoulder aim, or any draw with no foe locked, or first person; those shots go down the crosshair (`aimPoint`), up or down.
- core.js first person: now also while riding or driving (the steed's neck and the reins before you; he doesn't turn to face your look in the saddle). The eye sits further back (`_fpZ` -0.2) and FOV +45%, so more of hands and weapon show.
- knight.js first-person carry poses raised into view: one-handed `_fpR` [-1.55,0.35,-0.2,-0.6,1.3] and `_fpL` [-1.5,-0.5,0.3,-1.0,0]; two-handed `_fpH` [-1.85,0.75,-0.2,-0.35,0.8] (both fists up on the hilt); bow `_bwPF` [-1.5,0.45,0.15,-0.5,1.2,0].
- knight.js `solveArm()`: shared two-bone arm IK. The third-person two-handed ready, `readyTwo()`, places the right fist before the belly (`_2hT` [-0.04,0.05,0.32], torso frame) and turns the blade up and forward (`_2hD`); the left fist follows it with `twoHand()`. It replaces the hand-keyed `_rdP` angles when not guarding.

## V239 — the bow and crossbow seen in first person, the shield held up like a shield
- core.js first person: the eye is set back along the LOOK (not along the head), so a bow-draw that turns his head and shoulders aside no longer swings the camera behind his pauldron.
- knight.js `fpArcher(w,xb)`: in first person, drawing a bow (or aiming / guarding with a bow or crossbow) places both arms by IK in his own frame, from his eye (`K._eyeK`). The left fist goes out before you with the bow upright, canted 0.35 (`_fpBL` [0.1,-0.12,0.62], `_fpCant`). The right fist is drawn to the cheek (`_fpBR` [-0.08,-0.16,0.04]). The crossbow is held level with the stock forward (`_fpBL` [0,-0.1,0.5], `_fpBR` [-0.03,-0.16,0.2]). The weapon is turned via its own world frame (`wpnG`): +y forward, +z up. `K._wid` holds the weapon id.
- knight.js `holdShield(w)`: with a one-handed weapon out (not guarding, swinging or busy), the left forearm comes across his front by IK and the shield mount (`shM`) is turned to face forward. Third person: hand `_shT` [0.03,0.08,0.3], turned outward `_shY` 0.5, top tipped back `_shTl` 0.12 (like Link with the Hylian Shield). First person: `_shTF` [0.18,0.28,0.32], `_shYF` 0.25, big in the lower left (like Skyrim). The mount returns to (0,π/2,0) when released.

## V240 — the armour, piece by piece (engine/armor.js)
- Zak's armour sheet is rebuilt as separate low-poly meshes on the knight's own joints, worn by default. The slots: helm, plume, cowl, tabard (navy over plate, gold side seams and scalloped hem, the Jerusalem cross, gilt strap bosses), belt (gilt buckle, slung second belt, two pouches), skirt (dagged centre/side/back panels with gold edges, on the skirt hinges `K._skF`/`K._skB`), pauldrons (faceted dome, two lames, gold rims, a boss), arms (rerebrace, couter, banded vambrace with a point), gauntlets (flared cuff, back plate, finger lames on the glove), legs (cuisse, pointed poleyn, keeled greave with leather behind), sabatons (lames, ankle band, strap, sole).
- Each piece is sized when it's built from the bounds of the part it covers on the same joint, so it fits his proportions and moves with every clip. The character, rig, animations and movement are untouched.
- API: `ARMOR.set(K,slot,on)`, `ARMOR.wear(K,slot,id)`, `ARMOR.worn(K)`, `ARMOR.covered(K,slot)`. Add a new piece with `ARMOR.PIECES[slot][id]={name,build(ctx)}`. Wearing a piece hides what it covers (`userData.armorHid`); taking it off shows that again.
- What each slot hides: the sculpt's parts by joint and material, the body's plate shells by region (body3 now tags `userData.b3reg`, and `b3trim` on gold edges), the V234 helm. The old rerebrace steel stays beneath the pauldrons; only its gold edge goes.
- Materials are the knight's own (`K.M`, which now carries `goldD`, `mail` and `scarf`), cel-shaded through `BODY3.toonify` (now exported), so liveries recolour them.
- Wardrobe: ☰ System → 🛡 Armour lists every piece, on or off, saved in `GAME.S.armorOff`. A watcher re-applies it on load.

## V241 — the skill trees' armour sets (engine/armor_sets.js)
- Three new sets register into `ARMOR.PIECES` next to the Templar one. They change shape only; liveries still paint them.
  - **Striker:** a sallet with a fin and swept tail; short swept crest; scarf with streaming tails; crossed harness with a gilt medallion; belt with a dagger; short split skirts; spiked spaulders; slim vambraces with spiked couters; knuckle spikes; spiked poleyns; pointed sabatons.
  - **Guardian:** a flat-topped great helm with a gold cross on its face and breaths cut in a cross; heraldic fan crest; steel gorget; steel breastplate with plackart and raised cross; plaqued war belt; plate tassets over a short skirt; huge three-lame pauldrons with haute-pieces; heavy banded vambraces; bell-cuff gauntlets; laminated cuisses and closed greaves; broad four-lame sabatons.
  - **Psalmist:** a deep hood (face in shadow, two soft lights for eyes) under a gold circlet with a cross; hood-tail; hood-collar cape; robe with a gold-edged stole; cord belt with tassels, a sash and a satchel; long robe skirt split before; cloth mantles with cross-pins; wide sleeves with gilt cuffs; leather gloves with a cross; bound leg-wraps; soft boots with turned cuffs and gilt toes.
- Earned piece by piece: tree tier → slot is gauntlets 0, sabatons 1, belt 2, arms 3, legs 4, skirt 5, pauldrons 6, cowl 7, tabard 8, helm and plume 9 (the ultimate). Earned pieces are kept in `GAME.S.armorEarned`, so a respec doesn't take them back. A toast announces each new piece.
- Wardrobe (☰ System → Armour): tapping a slot cycles through the pieces earned for it, then off. Saved in `GAME.S.armorPick` and `armorOff`. `ARMOR.options`, `pick`, `earned` and `apply` handle it.

## V242 — plain clothes beneath: a hooded traveller, not the old harness
- Each slot has a `base` piece (set "Plain") in armor_sets.js. A slot with its armour off now wears it, instead of showing the old sculpted plate:
  - **Hood:** plain cloth, face in shadow, two dim lights for eyes. It shares the Psalmist hood's shape (`hood(ctx,{mat,eyes,circlet})`).
  - **Upper body:** the hood's collar; a tunic in the livery's colour with a laced throat; the tunic's skirt split at the sides; soft tunic shoulders; linen sleeves.
  - **Belt, hands and legs:** a plain belt with a pouch; leather wrist wraps; breeches; plain calf boots.
- Wardrobe: each slot cycles through the earned sets, then Plain (which replaces "off"). Old saves' `armorOff` slots now wear Plain. `ARMOR.pick` returns 'base' for them.
- The skirt slot also hides the sculpt's mail skirt (it hung outside the slimmer skirts and darkened them).

## V243 — the beasts in the harness: fox, bear, dove
- **Striker (fox):**
  - Helm: two slanted eye-slits; a sharper snout keel; two tall pointed ear-fins with gold leading edges (replacing the single crest fin).
  - Crest: a bushy fox-brush with a white tip.
  - Spaulders: three swept blades over each shoulder.
  - Gauntlets: cuffs drawn to a point up the forearm (the knuckle spikes moved to the Guardian as claws).
  - Skirt: cut into sharper points.
- **Guardian (bear):**
  - Bearskin: a broad shaggy roll over the pauldrons' tops (`K._furR`), with a fur cape down the back outside the cloak and a ragged hem; the bear's head worn at the nape; two gorget lames under it.
  - Gauntlets: three curved claws over the knuckles and a spike on the back of the hand.
- **Psalmist (dove):**
  - Hood: smooth-shaded (`hood({smooth})`), the brow drawn to a soft beak-point.
  - Tail-feathers: five feathers down the back with a gold quill.
  - Wing-mantle: three rows of laid feathers over a smooth mantle, the lowest row gilt.
  - Robe: its hem scalloped like a wing's edge.

## V244 — the bearskin over the shoulders (after Zak's Valhalla references)
- The Guardian cowl's fur now drapes over the pauldrons. Each shoulder gets a shaggy pelt built on the arm's own joint (sized `_furS` 1.5× the shoulder's envelope), so it rides over whatever pauldrons are worn and moves with the arm.
- A thick fur collar joins the two pelts at the neck. The bear's head (snout, nose, ears, eyes) now sits on the left shoulder.
- The fur cloak down the back is longer (about 0.76 down) and wider, with a ragged tufted hem, outside the cloth cloak.

## V245 — one inventory with the knight in it; armour of the ten towns; soft cloth; a clean bearskin
- Gear tab (menu.js), after Zak's Valhalla inventory reference: the knight himself in the middle, turning (drag to turn). Strength tiles on the left (weapon, shield, helm, breastplate, legs: the stat gear), Look tiles on the right (the 11 armour slots). Tap a tile to list what can go there. Stat totals sit under the knight. The separate Armour tab and the System wardrobe are gone. On a narrow screen the knight is on top and the tiles below in two columns.
- `ARMOR.preview`: the game's renderer draws the knight alone (world hidden, fog thinned, his helm shown even in first person) from a turntable camera into a 260×340 target, copied to the tab's canvas at about 22 fps.
- Armour of the ten towns (engine/armor_town.js), one set per town, released to Ironhold's Great Forge when that town's chapel is cleansed (`S.chapels > town`):

| Set | Town | Built on, and added touches |
|---|---|---|
| Hearthward | Hearthvale | wool and leather, a wheat-sheaf |
| Ironforged | Ironhold | dark iron and bronze, rivets, crossed hammers |
| Tidecaller | Saltmere | sea-green steel, scallop-shell pauldrons, scales |
| Thornwarden | Thornwood | leaf mantles, thorned vambraces |
| Sandstrider | Dusthaven | dune-coloured robes, the face wrapped |
| Crystalborn | Crystalpeak | pale steel with glowing crystal shards |
| Emberforged | Ashfield | blackened plate, ember trim, horns |
| Tempest | Stormgate | bright steel, a winged helm, the bolt |
| Shade | Shadowmere | dark robes, tatters, a violet light in the hood |
| Archangel | Hellgate | white and gold, a halo, folded wings |

  - Each set reuses the existing patterns, recoloured with its own materials (`K.M` overridden per set) and given its motifs.
  - Prices run 40–150 a piece (helm and tabard dearest), about 900 for a full set, scaled up a little for the farther towns.
  - The smith's sheet has "⛨ Armour of the ten towns", which opens the Gear tab in shop mode: tap a piece to try it on (worn until the menu closes), and buy to keep it (`S.armorOwned`).
- Soft cloth (`ARMOR.tick`, called each frame after the knight animates): skirts, robes and the fur cloak (`userData.soft`, plus everything on the skirt hinges) are pushed vertex by vertex out of a capsule on each thigh and shin. The shoulder pelts are pushed out of a sphere round the head. Untouched vertices return to their rest shape.
- The bearskin, cleaned: smooth shaded pelts (no flat facets) with soft rounded locks at the hems instead of spiky cones, a smooth bear's head on the left shoulder, and a smooth fur cloak with long locks at its hem.

## V246 — pelts of many beasts, no cloth cape, the shield made sturdier
- `furCowl(ctx,o)` (armor_sets.js) is the bearskin's pattern made general: a collar, a pelt over each shoulder (on the arm joint, over any pauldrons), the beast's head on the left shoulder (`head()`: bear, wolf, fox, lion, stag with antlers, ram with curled horns, raven with beak), and a hide cloak of any length. Options: a mane, feathered locks, spots, a tail.
- Eight pelts sold in every village shop under "🐾 Furs & pelts" (services.js). That opens the Gear screen in pelt mode to try them on and buy; owned pelts are kept in `S.armorOwned[id+'.cowl']` (`ARMOR.buyPelt`):

| Pelt | Price |
|---|---|
| Wolf | 90 |
| Snow-bear | 140 |
| Fox stole with tail | 80 |
| Lion's mane | 150 |
| Stag hide | 110 |
| Ram fleece | 85 |
| Raven mantle | 120 |
| Brown bearskin | 120 |

- The Guardian bearskin now uses the same builder.
- The hero's built-in cloth cape is gone for good (`capeP` hidden every frame in `ARMOR.tick`). It clipped through the fur cloaks and the saddle.
- Shield: its meshes are never frustum-culled, and its painted face is double-sided. In tests (each armour set, swapping weapons, guard, menu, first person, riding) its visibility flags never dropped, so the reported disappearance is not yet pinned down.

## V247 — test: clothes an artist made, skinned to the knight's own skeleton (engine/outfit3.js)
- Quaternius's "Modular Character Outfits – Fantasy" (Standard, CC0; Zak's download). The male Ranger parts (body, arms, legs, buckled boots, hood, pauldron) and Peasant parts (body, arms, legs, feet) are in models/look3/outfits/, colour texture only, cut to 1024 px JPG (2.6 MB). Licence: models/look3/LICENSE-modular-character-outfits-fantasy.txt.
- They are built for the Universal Base Characters' 65-bone skeleton, which BODY3 already puts under the hero. Each part is rebound to the hero's own bones (`F.B[name]`) with its own inverse bind matrices, so it moves with every clip and the rig-driven motion, bending like a real garment.
- While a test outfit is worn, the code harness, plate shells and sculpt pieces are hidden, but the weapon, sheath, back slot and shield stay. The body is cut to what the clothes leave bare (head and hands, painted skin; `F.idx0` now keeps the full index in body3.hero), and the eyes and brows are shown.
- ☰ System → "🧪 Test look" cycles off → Ranger → Peasant (saved in `klk3d_outfit3`, applied live). It needs the model files, so it works in the hosted game, not the artifact preview.
- Free edition: only Ranger and Peasant (no knight). The full kit (12 outfits) is the paid Source edition.

## V248 — the Templar harness skinned to the skeleton; the Ranger let out to the hero's build (outfit3.js, still a test)
- `OUTFIT3.skinArmor(K)`: the worn code-built pieces become skinned garments on the BODY3 skeleton. Covered: tabard, cowl, belt, skirt, pauldrons, arms, legs, sabatons; the helm, crest and gauntlets stay rigid on their pivots.
  - For each vertex, the up-to-6 nearest body points (posed and skinned now) are found, limited to the regions that piece may follow (`ALLOW`); a leg piece or a skirt's side only takes from its own leg.
  - Their bone weights are blended by nearness, keeping the top 4.
  - The vertex's bind-pose position is found by undoing that blended skin matrix, so it stands exactly where the rigid piece stood and bends with the body from then on.
  - Skirts are carried mostly by the pelvis (85% at the centre; at the sides 62% at the waist, easing toward the thigh at the hem).
  - A vertex with no near point falls back to wider regions, then to the pelvis: an unweighted vertex collapses to the origin, which first showed as black spikes.
  - It re-fits when the wardrobe changes a piece (the slot signature). It takes about 3 s, so it's a test only.
- `fitTo(F,geo)`: the Quaternius outfits (made for a lean body) are let out to the hero's broad Superhero body. In the shared bind space, each garment point inside or within 1.2 cm of the body is pushed out along the body's normal (spatial-hash nearest), the push is smoothed over the garment's edges in 4 passes that never let a point fall back inside, and the result is cached.
- ☰ System → Test look now cycles: off → your armour skinned → Ranger → Peasant.

## V249 — armoured boots, not shin guards (Templar legs)
- The greave is now closed: steel all round (it was a front shell with leather behind), from the knee pivot down past the ankle. Its axis bends from the knee to the ankle's centre so the foot of it sits over the sabaton, where it flares onto the instep.
- Gold on the greave: a keel before, a hinge-seam behind, bands at its top and foot, rivets at the ankle. It bulges behind for the calf (`K._gvB` 0.02), so the Superhero body's calf no longer pokes through.
- The sabaton's leather ankle strap is now a steel collar under the greave's flare.
- The cuisse wraps further round the thigh (±2.4 rad, was ±1.55), with only a narrow leather strip behind.
- The body under the armour (BODY3 "mail", the backs of the knees and other gaps) is painted a mid steel-grey 0x4c535e instead of near-black, so gaps read as mail rather than holes.

## V250 — athletic, body-fitted Templar legs
- New `bodyRings()` in armor.js samples the skinned hero's own thigh/calf vertices (pivot-local), bins them into height × angle rings, and the plate is built around that shape instead of a straight tube.
- Cuisse: wraps the real thigh (+ a front keel), leather strip behind.
- Greave: follows the calf — swell behind (`K._calf`, default 0.028), shin line in front, drawn in to a slim ankle, then flares onto the instep; axis bends toward the foot.
- Steel ankle cuff with two gold bands; ankle rivets moved onto it.
- `K._legFit=false` falls back to the V249 closed boots.

## V251 — the left arm and shield no longer vanish
- Zak's report (laptop, Chrome, short sword, Peasant test look): all of a sudden the left arm — sleeve, hand — and the shield on it were gone, drawn or not, and stayed gone. Everything that vanished hangs from the left-arm pivots, so the likely cause is a broken number (NaN) in the arm's turn, which the arm's springs and pose blends then carried from frame to frame for good. Not reproduced headless.
- knight.js, end of `K.animate`: every limb pivot (AL, AR, L, R) is checked each frame — a non-finite turn or position is set back to rest, an unnormalised turn renormalised, a zero/NaN scale reset; the arm springs and the pose blends (`_sr`, `_2h`, `_fpw`, `_fpA`, `_bwR`, `_rk`, `_g`, `shTurn`, `armOut`) are cleared if broken. Tested: NaN injected into the left arm recovers in a frame.
- The first time it fires for the hero it writes `[KLK] limb reset after a bad number:` with the limb and what he was doing to the browser console (F12), to find the root cause.

## V252 — plain clothes from the artist's kit; the Ranger's hood, up or down
- With a slot's armour off (☰ → Gear → Look → "Plain"), the hero now wears Quaternius's Peasant clothes instead of the code-built plain pieces: **tabard → shirt and belt** (Male_Peasant_Body), **arms → sleeves and bracers** (Male_Peasant_Arms), **legs → trousers** (Male_Peasant_Legs), **sabatons → boots** (Male_Peasant_Feet). Cowl, belt, skirt, pauldrons and gauntlets wear nothing when plain (bare hands). The superhero build is kept: each garment is skinned to his own bones and let out to his body (`fitTo`).
- **The helm slot's plain piece is the Ranger's hood**, dyed from green to the Peasant's brown (`dyed()`, greens only, a canvas copy of the texture).
  - All plain: **hood up, face in shadow**. A cool dark (0x121118) is laid over the face, deepest under the brow, with two faint eye-lights (`K._glint`, on the Head bone).
  - Any armour worn: **hood down** by default, folded back onto the shoulders (`hoodDown()`: crown folded about the back of the neck, `OUTFIT3.HD` y0 1.58, z0 -0.06, 2.8 rad, carried by the upper spine, pushed out over the back but not the head). Up again at will: the face is then only shaded.
  - ☰ → Gear → Look → Great Helm (when Plain) → "Hood up / Hood down" toggles it, remembered separately for the plain look (`S.hoodPlain`, default up) and with armour (`S.hoodArm`, default down).
- The body is cut away under whatever plain garments are worn (chest/belly, upper arm/forearm, pelvis/thigh/calf, foot/boot) and painted skin at the face (hood) and hands (bare). The hood hides in first person; the Gear preview shows it.
- engine/outfit3.js (`baseReady`, `bsync` every 250 ms, `garment`, `hoodDown`, `pushOut`, `dyed`, `paintBase`, `glints`, `hoodToggle`); armor_sets.js `reg0` builds an empty marker group when the garments are ready (`userData.garmentSlot`) and the old code-built clothes otherwise (artifact, classic look); plain piece names updated. Peasant is no longer in System → Test look (off / your armour skinned / Ranger).

## V253 — every armour set fitted to the body
- The code-built pieces were sized from the old sculpted knight and stood far off the BODY3 body (the helm twice the head's width, pauldrons 2.5× the arm).
- armor.js `fitGroups()` runs after every piece is built, for every set (Templar, the three skill-tree sets, the ten town sets, pelts):
  - It measures the body under the piece: the skinned points of that joint's regions, in the piece's joint frame, within the piece's height.
  - The piece is drawn in round the limb's axis to the body's width plus a margin (`FIT`: helm 0.022, pauldrons 0.016 over 1.2× the arm, tabard 0.02, belt 0.024, arms 0.014, gauntlets 0.012, legs 0.012, sabatons 0.014).
  - Helm and pauldrons shrink whole (about the head's middle, the pauldron's top); the rest only in girth. Never enlarged, never below half.
  - The crest follows the helm (`K._helmFit`); changing the helm re-seats it.
  - `K._armFit=false` turns fitting off; each group records `userData.fitS`.
- Typical factors: Templar helm 0.68, tabard 0.79, belt 0.67, pauldrons 0.64, sabatons 0.76; V250 legs already fitted (1.0).

## V254 — each piece seated on the body, not just shrunk
Zak: "sized down, but doesn't sit on the body like real armor". armor.js now fits each piece by its kind, for every set:
- **Tubes: the ring fit** (`conform`, `CONF`) for the tabard/breastplate (gap 0.012), belt (0.045, over the tabard), and rerebraces/vambraces (0.012).
  - Round the piece's joint, ring by ring, it measures the body's outer surface (`bodyRings`) and the piece's inner face (30th-percentile radius per bin).
  - Every point moves along its ray so the inner face lies the gap over the body.
  - Keels, ridges, gilt bands, rivets and hems keep their relief. Past the body's ends the piece keeps its own shape, set in by its nearest ring.
  - Pieces are drawn in freely, but let out by at most 0.012.
  - The legs were already built this way (V250).
- **Domes and ends: size, centre, settle** (`SETTLE`) for the helm, pauldrons, gauntlets and sabatons.
  - Sized whole as in V253; the helm and gauntlets are centred on the head or hand.
  - Over each patch of body they cover, the underside's height above the body's top is measured, and the piece moves up or down until the closest is the gap: helm 0.016, pauldrons 0.012, gauntlets/sabatons 0.006.
  - The crest follows the helm's size and its move.
- The torso's body regions now include 'thigh' (on this body the hips are labelled thigh). Without it the belt was fitted to the crotch.
- Skirts and the cowl keep the V253 girth scale.
- Test hooks: `K._conform=false`, `K._settle=false`, `K._fitGap={slot:gap}`, `K._armFit=false` (none); `userData.fitS` says what was done.

## V255 — fitting fixes from Zak's play-test photos
- **Helm low, head out the back and top.** Domes and ends (helm, pauldrons, gauntlets, sabatons) are now sized to *enclose* the part: the larger of the width and depth ratios, not their average. They're then settled by their **roof**: over each patch of body they cover, the piece's highest point must clear the body's top by the gap. Before, any low point counted. Helm now 0.76, raised to clear the crown.
- **Feet through the boots.** Sabatons enclose the foot (0.86), are centred on the foot (not the calf) and settle against the foot alone.
- **Pauldrons low and forward.** Centred front-to-back over the top of the upper arm (`SETTLE.pauldrons.z`) and settled by their roof over the shoulder.
- **Grey "undershirt" over the shoulders and biceps.** That was BODY3's upper-arm plate shell, left showing once the pauldrons were fitted. The Templar rerebrace now runs up under the pauldron (-0.235 → -0.012, with a second gold band), and the arms slot hides the whole upper-arm shell.
- **Vambraces off the arm.** Arm gap 0.012 → 0.007.
- **The blue bib on the chest.** That was the Templar cowl, never fitted. The cowl is now ring-fitted to the torso (gap 0.03, over the tabard). Cowl groups on the arms (pelts' shoulder pieces) are left to the girth scale.
- Ring-fit groups that can't be fitted now fall back to the girth scale one by one, not all or nothing.
