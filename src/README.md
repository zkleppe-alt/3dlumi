# Luminar 3D — source

Build: `cd src && ln -s ../../models data/models; python3 tools/build.py luminar` → `src/dist/luminar.html`, which is the site's `index.html`.
(`data/models/` is the repo's top-level `models/` folder; the build copies it into `dist/models/`.)

- `data/built/head.js` — the realm's data, as shipped. `data/built/head.orig.js` — the pre-V196 backup the map tools start from.
- `tools/stormgate.py` (V196) and `tools/biomes.py` (V197; runs stormgate.py first) regenerate `head.js` from `head.orig.js`.
- Version notes: `CHANGES-V186.md`.
