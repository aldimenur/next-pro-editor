const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFileLocation: (filePath) =>
    ipcRenderer.invoke("openFileLocation", filePath),
  getSoundEffects: (params) => ipcRenderer.invoke("getSoundEffects", params),
  getVideoEffects: (params) => ipcRenderer.invoke("getVideoEffects", params),
  getMusic: (params) => ipcRenderer.invoke("getMusic", params),
  onDragStart: (filePath) => ipcRenderer.send("onDragStart", filePath),
});
