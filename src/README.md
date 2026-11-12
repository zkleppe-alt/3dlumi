# Luminar 3D — source

Build: `cd src && ln -s ../../models data/models; python3 tools/build.py luminar` → `src/dist/luminar.html`, which is the site's `index.html`.
(`data/models/` is the repo's top-level `models/` folder; the build copies it into `dist/models/`.)

- `data/built/head.js` — the realm's data, as shipped. `data/built/head.orig.js` — the V195 map the tools start from.
- Map pipeline: `python3 tools/biomes.py` → runs `tools/villages.py` (V199) → runs `tools/grow.py` (V198 island) → runs `tools/stormgate.py` (V196), then lays the biomes (V197).
  It rewrites head.js, data/pastimes.json and data/systems.json (reading the V197 backups data/*.v2.json).
- Version notes: `CHANGES-V186.md`.
