// The launcher page's only door to the app: a fixed set of calls, no Node.
const { contextBridge, ipcRenderer } = require('electron');
const call = (ch, ...a) => ipcRenderer.invoke(ch, ...a);
contextBridge.exposeInMainWorld('KLK', {
  state: () => call('state'), install: () => call('install'), play: () => call('play'),
  backups: () => call('backups'), backup: label => call('backup', label), restore: id => call('restore', id), deleteBackup: id => call('deleteBackup', id),
  exportBackup: id => call('export', id), importBackup: () => call('import'),
  settings: s => call('settings', s), chooseFolder: () => call('chooseFolder'), openFolder: () => call('openFolder'), openLink: u => call('openLink', u),
  onProgress: fn => ipcRenderer.on('progress', (e, d) => fn(d)), onState: fn => ipcRenderer.on('state-changed', () => fn())
});
