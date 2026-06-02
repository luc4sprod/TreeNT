const { contextBridge, ipcRenderer } = require('electron')

// Expose a safe, typed API to the renderer (index.html)
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize:    ()  => ipcRenderer.invoke('window:minimize'),
  maximize:    ()  => ipcRenderer.invoke('window:maximize'),
  close:       ()  => ipcRenderer.invoke('window:close'),
  isMaximized: ()  => ipcRenderer.invoke('window:isMax'),

  // Native save dialog for export
  saveFile: (content, filename) =>
    ipcRenderer.invoke('export:save', { content, filename }),

  // Open links in default browser
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),

  // Detect we are running inside Electron
  isElectron: true,
})
