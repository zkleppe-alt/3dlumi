#!/usr/bin/env python3
"""Assemble the playable page:  python3 tools/build.py luminar "Luminar 3D"  →  dist/luminar.html (+ dist/models/*.js)

V186 NOTE — the working tree was rebuilt from the published V185 page after the workspace was lost. The realm's data
(world, dialogue, forest, portals, chapels …) now lives ALREADY STRETCHED AND PACKED in data/built/head.js, exactly as
it shipped; the two tables still edited by hand are data/systems.json (→ SYS) and data/pastimes.json (→ PASTIME_DATA),
both in their shipped (stretched) form. The sculpted models are data/models/*.js as shipped (pets, bosses, demons,
cast …): to re-bake one, run its tools/sculpt_*.py and wrap the JSON the way the file's first bytes show.
engine/shell.html carries the page's meta tags, the three.js tag (local file, CDN fallback) and the model <script>s,
so dist/luminar.html IS the site's index.html. The older pipeline (tools/stretch.py over the unstretched data/*.json,
kept in the project docs) is what produced head.js and can be revived from those docs if the realm is re-stretched.
"""
import json, os, sys, shutil
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
ENGINE = ["kit.js", "keys.js", "paint.js", "body.js", "knight.js", "anim_base.js", "rig.js", "people.js", "heroes.js", "cast.js", "state.js", "core.js", "pets.js", "mounts.js", "steeds.js", "animals3.js", "menu.js", "services.js",
          "city.js", "decor.js", "props3d.js", "chest3d.js", "rooms.js", "roomlife.js", "roomstyle.js", "life.js", "world.js", "daynight.js", "style.js", "bosses3d.js", "bossfight.js", "combat.js", "title.js", "dungeon_gen.js", "skin.js", "demons.js", "bossart.js", "petart.js", "petfight.js", "chapel_themes.js", "chapel.js", "sidequests.js", "catacomb.js", "wilds.js", "treetops.js", "guardians.js", "forest.js", "pastimes.js", "sailing.js", "reuben.js", "abaddon.js", "hunt.js", "trade.js", "bounties.js", "mistral.js", "tabor.js", "sunfall.js", "portals.js", "dialogue.js", "library.js", "looks.js", "deep.js", "minimap.js", "goal.js", "riding.js", "rogues.js", "sanctuary.js", "throne.js", "race.js", "lists.js", "pettourney.js", "journal.js", "greek.js", "north.js", "roads.js", "trek.js", "landmarks.js", "weather.js", "roadlife.js", "sneak.js", "pad.js", "hud.js", "vendor_post.js", "post.js", "audio2d.js", "sound.js", "look3.js", "body3.js", "village3.js"]
name = sys.argv[1] if len(sys.argv) > 1 else "luminar"
read = lambda *p: open(os.path.join(ROOT, *p), encoding="utf-8").read()
cj = lambda f: json.dumps(json.load(open(os.path.join(ROOT, "data", f), encoding="utf-8")), separators=(",", ":"))
head = read("data", "built", "head.js").replace("{{SYS}}", "const SYS=" + cj("systems.json") + ";").replace("{{PASTIME}}", "const PASTIME_DATA=" + cj("pastimes.json") + ";")
scripts = "\n".join(["(function(){", head] + ["// ── engine/%s ──\n%s" % (m, read("engine", m)) for m in ENGINE if os.path.exists(os.path.join(ROOT, "engine", m))]
                    + ["// ── cities/%s.js ──\n%s" % (name, read("cities", name + ".js")), "})();"])
page = read("engine", "shell.html").replace("{{SCRIPTS}}", scripts)
MD = os.path.join(ROOT, "dist", "models"); os.makedirs(MD, exist_ok=True)
for f in sorted(os.listdir(os.path.join(ROOT, "data", "models"))):
    src = os.path.join(ROOT, "data", "models", f)
    if os.path.isdir(src): shutil.copytree(src, os.path.join(MD, f), dirs_exist_ok=True)   # look3/: the rigged test models (glTF), fetched at run time
    else: shutil.copy(src, os.path.join(MD, f))
out = os.path.join(ROOT, "dist", name + ".html"); open(out, "w", encoding="utf-8").write(page)
print(out, f"{len(page)//1024} KB")
