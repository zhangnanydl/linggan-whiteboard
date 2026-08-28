const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('whiteboardDesktop', {
  listDownloadedImages: () => ipcRenderer.invoke('downloads:list'),
  openDownloadsFolder: () => ipcRenderer.invoke('downloads:open-folder'),
  openDownloadedImage: (name) => ipcRenderer.invoke('downloads:open-file', name),
  revealDownloadedImage: (name) => ipcRenderer.invoke('downloads:reveal-file', name),
  getDownloadedImagePreview: (name, width) => ipcRenderer.invoke('downloads:preview', name, width),
  savePng: (name, data) => ipcRenderer.invoke('downloads:save-png', { name, data })
});
