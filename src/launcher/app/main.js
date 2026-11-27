// Kingdom's Last Knight — the launcher (V282).
// A small home window: the news and links, the patch notes, Play, and "Update available" when the site has a newer version.
// The game's files are downloaded into this computer's app folder (only the files that changed), and the game runs from there
// on a private app://game address, offline, so its saves stay in this computer's storage across every update. Nothing updates
// until the player clicks Update; the saves are backed up first.
const { app, BrowserWindow, protocol, net, shell, ipcMain, dialog } = require('electron');
const path = require('path'), fs = require('fs'), fsp = fs.promises, crypto = require('crypto');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=4096');
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, corsEnabled: true } }]);

const FEED = (process.env.KLK_FEED || 'https://zkleppe-alt.github.io/3dlumi/').replace(/\/?$/, '/');
const UD = () => app.getPath('userData');
const P = { settings: () => path.join(UD(), 'settings.json'), backups: () => path.join(UD(), 'backups'), cache: () => path.join(UD(), 'feed-cache.json') };
const DEF = { gfx: 'auto', fullscreen: false, checkOnLaunch: true, gameDir: null };
let settings = DEF, launcher = null, game = null, busy = false;

const readJSON = async (f, d) => { try { return JSON.parse(await fsp.readFile(f, 'utf8')); } catch (e) { return d; } };
const writeJSON = async (f, o) => { await fsp.mkdir(path.dirname(f), { recursive: true }); const t = f + '.tmp'; await fsp.writeFile(t, JSON.stringify(o, null, 1)); await fsp.rename(t, f); };
const gameDir = () => settings.gameDir || path.join(UD(), 'game');
const installedFile = () => path.join(gameDir(), 'installed.json');
const send = (ch, data) => { if (launcher && !launcher.isDestroyed()) launcher.webContents.send(ch, data); };

// ── the feed: what the site has (cached, so the notes and news still show offline) ──
async function fetchJSON(u) { const r = await net.fetch(u + (u.includes('?') ? '&' : '?') + 't=' + Date.now(), { cache: 'no-store' }); if (!r.ok) throw new Error(r.status + ' ' + u); return r.json(); }
async function feed() {
  try { const [version, notes, news] = await Promise.all([fetchJSON(FEED + 'launcher/version.json'), fetchJSON(FEED + 'launcher/notes.json').catch(() => []), fetchJSON(FEED + 'launcher/news.json').catch(() => null)]);
    const f = { version, notes, news, online: true }; await writeJSON(P.cache(), f); return f; }
  catch (e) { const c = await readJSON(P.cache(), null); return c ? Object.assign(c, { online: false }) : { online: false, version: null, notes: [], news: null }; }
}
async function state() {
  const inst = await readJSON(installedFile(), null), f = await feed();
  const latest = f.version, have = inst && inst.version;
  return { installed: have || null, installedBuild: inst ? inst.build : 0, installedDate: inst ? inst.date : null, latest: latest ? latest.version : null, latestTitle: latest ? latest.title : '',
    update: !!(latest && (!inst || latest.build > (inst.build || 0))), downloadMB: latest ? Math.round(needBytes(latest, inst) / 1e6) : 0,
    online: f.online, notes: f.notes || [], news: f.news, settings, gameDir: gameDir(), version: app.getVersion(), platform: process.platform };
}
function needBytes(latest, inst) { const have = new Map(((inst && inst.files) || []).map(x => [x.path, x.sha256])); return latest.files.filter(x => have.get(x.path) !== x.sha256).reduce((a, x) => a + x.size, 0); }

// ── installing an update: only the files whose sha256 changed, each checked, then swapped in ──
async function sha(f) { return new Promise((res, rej) => { const h = crypto.createHash('sha256'); fs.createReadStream(f).on('data', d => h.update(d)).on('end', () => res(h.digest('hex'))).on('error', rej); }); }
async function download(file, dest) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try { const r = await net.fetch(FEED + file.path.split('/').map(encodeURIComponent).join('/') + '?v=' + file.sha256.slice(0, 12), { cache: 'no-store' }); if (!r.ok) throw new Error('HTTP ' + r.status);
      const buf = Buffer.from(await r.arrayBuffer()); const h = crypto.createHash('sha256').update(buf).digest('hex'); if (h !== file.sha256) throw new Error('checksum');
      await fsp.mkdir(path.dirname(dest), { recursive: true }); await fsp.writeFile(dest, buf); return buf.length; }
    catch (e) { if (attempt === 2) throw new Error(file.path + ': ' + e.message); await new Promise(r => setTimeout(r, 800 * (attempt + 1))); }
  }
}
async function install() {
  if (busy) return { ok: false, error: 'Already updating.' }; if (game) return { ok: false, error: 'Close the game first.' }; busy = true;
  try {
    const f = await feed(); if (!f.online || !f.version) throw new Error("Can't reach the update server — check your internet connection.");
    const latest = f.version, inst = await readJSON(installedFile(), null), dir = gameDir(), stage = path.join(dir, '.staging');
    if (inst) { send('progress', { phase: 'backup' }); await backup('Before ' + latest.version); }
    const have = new Map(((inst && inst.files) || []).map(x => [x.path, x.sha256])); const todo = latest.files.filter(x => have.get(x.path) !== x.sha256);
    // a file already on disk with the right contents needn't come down again (a reinstall over an interrupted one)
    const need = []; for (const x of todo) { const p = path.join(dir, x.path); if (fs.existsSync(p) && (await fs.promises.stat(p)).size === x.size && await sha(p) === x.sha256) continue; need.push(x); }
    const total = need.reduce((a, x) => a + x.size, 0); let done = 0, i = 0;
    await fsp.rm(stage, { recursive: true, force: true }); await fsp.mkdir(stage, { recursive: true });
    send('progress', { phase: 'download', done, total, files: need.length });
    const worker = async () => { while (i < need.length) { const x = need[i++]; done += await download(x, path.join(stage, x.path)); send('progress', { phase: 'download', done, total, files: need.length, file: x.path }); } };
    await Promise.all([worker(), worker(), worker(), worker()]);
    send('progress', { phase: 'install' });
    for (const x of need) { const to = path.join(dir, x.path); await fsp.mkdir(path.dirname(to), { recursive: true }); await fsp.rm(to, { force: true }); await fsp.rename(path.join(stage, x.path), to); }
    // files the new version no longer has
    const keep = new Set(latest.files.map(x => x.path)); for (const x of ((inst && inst.files) || [])) if (!keep.has(x.path)) await fsp.rm(path.join(dir, x.path), { force: true });
    await fsp.rm(stage, { recursive: true, force: true });
    await writeJSON(installedFile(), { version: latest.version, build: latest.build, date: latest.date, title: latest.title, files: latest.files });
    return { ok: true, version: latest.version };
  } catch (e) { return { ok: false, error: e.message }; } finally { busy = false; send('progress', { phase: 'idle' }); }
}

// ── the saves: the game's storage on app://game, read and written by a hidden page on that address ──
async function withGamePage(fn) {
  const w = new BrowserWindow({ show: false, webPreferences: { contextIsolation: true, sandbox: true } });
  try { await w.loadURL('app://game/__saves.html'); return await w.webContents.executeJavaScript(fn); } finally { w.destroy(); }
}
const DUMP = `(()=>{ const o={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); o[k]=localStorage.getItem(k); } return o; })()`;
async function backup(label) {
  const data = await withGamePage(DUMP); if (!Object.keys(data).length) return null;
  const when = new Date(), id = when.toISOString().replace(/[:.]/g, '-'); const inst = await readJSON(installedFile(), null);
  const doc = { kind: 'klk-saves', id, label: label || 'Backup', date: when.toISOString(), version: inst ? inst.version : null, data };
  await writeJSON(path.join(P.backups(), id + '.json'), doc);
  // keep the latest 30
  const all = (await fsp.readdir(P.backups()).catch(() => [])).filter(n => n.endsWith('.json')).sort(); for (const n of all.slice(0, Math.max(0, all.length - 30))) await fsp.rm(path.join(P.backups(), n), { force: true });
  return id;
}
async function backups() {
  const names = (await fsp.readdir(P.backups()).catch(() => [])).filter(n => n.endsWith('.json')).sort().reverse(); const out = [];
  for (const n of names) { const d = await readJSON(path.join(P.backups(), n), null); if (!d) continue; out.push({ id: d.id, label: d.label, date: d.date, version: d.version, slots: Object.keys(d.data).filter(k => /^klk3d_slot_/.test(k)).length }); }
  return out;
}
async function restoreDoc(doc) {
  if (!doc || doc.kind !== 'klk-saves' || typeof doc.data !== 'object') throw new Error("That file isn't a Last Knight save backup.");
  if (game) throw new Error('Close the game first.');
  for (const [k, v] of Object.entries(doc.data)) if (typeof k !== 'string' || typeof v !== 'string' || k.length > 200 || v.length > 20e6) throw new Error('The backup is damaged.');
  await backup('Before restoring');
  await withGamePage(`(()=>{ const d=${JSON.stringify(doc.data)}; Object.keys(localStorage).filter(k=>/^(klk|restfulKnight)/.test(k)).forEach(k=>localStorage.removeItem(k)); for(const k in d) localStorage.setItem(k,d[k]); return true; })()`);
}

// ── playing ──
async function play() {
  const inst = await readJSON(installedFile(), null); if (!inst) return { ok: false, error: 'Install the game first.' }; if (game) { game.focus(); return { ok: true }; }
  await withGamePage(`(()=>{ try{ localStorage.setItem('klk3d_gfx',${JSON.stringify(settings.gfx || 'auto')}); }catch(e){} return 1; })()`);
  game = new BrowserWindow({ width: 1600, height: 900, minWidth: 960, minHeight: 540, backgroundColor: '#0e1424', autoHideMenuBar: true, fullscreen: !!settings.fullscreen,
    title: "Kingdom's Last Knight", icon: path.join(__dirname, 'icon.png'), webPreferences: { backgroundThrottling: false, contextIsolation: true, sandbox: true } });
  game.setMenuBarVisibility(false); game.loadURL('app://game/index.html');
  game.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  game.webContents.on('before-input-event', (e, input) => { if (input.type !== 'keyDown') return;
    if (input.key === 'F11' || (input.key === 'Enter' && input.alt)) { game.setFullScreen(!game.isFullScreen()); e.preventDefault(); }
    if (input.key === 'F5') { game.webContents.reload(); e.preventDefault(); } });
  game.on('closed', () => { game = null; if (launcher && !launcher.isDestroyed()) { launcher.show(); send('state-changed'); } });
  if (launcher) launcher.hide();
  return { ok: true };
}

function createLauncher() {
  launcher = new BrowserWindow({ width: 1040, height: 680, minWidth: 820, minHeight: 560, backgroundColor: '#0d1220', autoHideMenuBar: true, title: "Kingdom's Last Knight — Launcher",
    icon: path.join(__dirname, 'icon.png'), webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: true } });
  launcher.setMenuBarVisibility(false); launcher.loadFile(path.join(__dirname, 'ui', 'index.html'));
  launcher.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  launcher.on('closed', () => { launcher = null; if (!game) app.quit(); });
}

app.whenReady().then(async () => {
  settings = Object.assign({}, DEF, await readJSON(P.settings(), {}));
  protocol.handle('app', async req => {
    const u = new URL(req.url); let rel = decodeURIComponent(u.pathname).replace(/^\/+/, '') || 'index.html';
    if (rel === '__saves.html') return new Response('<!doctype html><title>saves</title>', { headers: { 'content-type': 'text/html' } });
    const file = path.normalize(path.join(gameDir(), rel)); if (!file.startsWith(path.normalize(gameDir()))) return new Response('no', { status: 403 });
    return net.fetch(pathToFileURL(file).toString());
  });
  ipcMain.handle('state', () => state());
  ipcMain.handle('install', () => install());
  ipcMain.handle('play', () => play());
  ipcMain.handle('backups', () => backups());
  ipcMain.handle('backup', async (e, label) => { const id = await backup(label || 'Backup'); return id ? { ok: true, id } : { ok: false, error: 'There are no saves to back up yet.' }; });
  ipcMain.handle('restore', async (e, id) => { try { await restoreDoc(await readJSON(path.join(P.backups(), String(id).replace(/[^\w-]/g, '') + '.json'), null)); return { ok: true }; } catch (err) { return { ok: false, error: err.message }; } });
  ipcMain.handle('deleteBackup', async (e, id) => { await fsp.rm(path.join(P.backups(), String(id).replace(/[^\w-]/g, '') + '.json'), { force: true }); return { ok: true }; });
  ipcMain.handle('export', async (e, id) => { const src = path.join(P.backups(), String(id).replace(/[^\w-]/g, '') + '.json'); const r = await dialog.showSaveDialog(launcher, { title: 'Export saves', defaultPath: 'LastKnight-saves-' + id.slice(0, 10) + '.json', filters: [{ name: 'Save backup', extensions: ['json'] }] });
    if (r.canceled || !r.filePath) return { ok: false }; await fsp.copyFile(src, r.filePath); return { ok: true, path: r.filePath }; });
  ipcMain.handle('import', async () => { const r = await dialog.showOpenDialog(launcher, { title: 'Import saves', properties: ['openFile'], filters: [{ name: 'Save backup', extensions: ['json'] }] });
    if (r.canceled || !r.filePaths[0]) return { ok: false }; try { const st = await fsp.stat(r.filePaths[0]); if (st.size > 50e6) throw new Error('That file is too big to be a save backup.'); await restoreDoc(JSON.parse(await fsp.readFile(r.filePaths[0], 'utf8'))); return { ok: true }; } catch (err) { return { ok: false, error: err.message }; } });
  ipcMain.handle('settings', async (e, s) => { const ok = { gfx: ['auto', 'low', 'medium', 'high', 'ultra'], fullscreen: [true, false], checkOnLaunch: [true, false] };
    for (const k in s) if (ok[k] && ok[k].includes(s[k])) settings[k] = s[k]; await writeJSON(P.settings(), settings); return settings; });
  ipcMain.handle('chooseFolder', async () => { if (game || busy) return { ok: false, error: 'Close the game first.' }; const r = await dialog.showOpenDialog(launcher, { title: 'Where to keep the game files', properties: ['openDirectory', 'createDirectory'] });
    if (r.canceled || !r.filePaths[0]) return { ok: false }; const to = path.join(r.filePaths[0], 'LastKnight'), from = gameDir(); if (path.normalize(to) === path.normalize(from)) return { ok: true };
    await fsp.mkdir(to, { recursive: true }); if (fs.existsSync(from)) await fsp.cp(from, to, { recursive: true }); settings.gameDir = to; await writeJSON(P.settings(), settings); if (fs.existsSync(from) && !from.startsWith(to)) await fsp.rm(from, { recursive: true, force: true }); return { ok: true, dir: to }; });
  ipcMain.handle('openFolder', () => shell.openPath(gameDir()));
  ipcMain.handle('openLink', (e, url) => { if (/^https:\/\//.test(url)) shell.openExternal(url); });
  createLauncher();
});
app.on('window-all-closed', () => app.quit());
