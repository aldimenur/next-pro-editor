const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFileLocation: (sfxName) =>
    ipcRenderer.invoke("openFileLocation", sfxName),
});
