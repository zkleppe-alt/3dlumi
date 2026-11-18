# Kingdom's Last Knight — desktop (Windows)

The game in its own window with the GPU fully on (Electron). Built automatically by the repo's
**Desktop build** GitHub Action: run it from the Actions tab (or push a tag like `desktop-v1.0.0`), and the
installer (`LastKnight-Setup-….exe`) and a no-install portable `.exe` appear on the run (and on a Release for tags).

Local build on Windows: copy `index.html`, `three.min.js`, `models/`, `music/` and the icons from the repo root into
`desktop/game/`, then `npm install` and `npm run dist`. `npm start` runs it without packaging.

Keys: F11 or Alt+Enter — full screen · F5 — reload.
