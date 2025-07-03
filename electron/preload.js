const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFileLocation: (filePath) =>
    ipcRenderer.invoke("openFileLocation", filePath),
  getSoundEffects: (params) => ipcRenderer.invoke("getSoundEffects", params),
  onDragStart: (filePath) => ipcRenderer.send("onDragStart", filePath),
});
