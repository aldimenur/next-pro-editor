const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getSoundEffects: (params) => ipcRenderer.invoke("getSoundEffects", params),
  getVideoEffects: (params) => ipcRenderer.invoke("getVideoEffects", params),
  getMusic: (params) => ipcRenderer.invoke("getMusic", params),
  onDragStart: (filePath) => ipcRenderer.send("onDragStart", filePath),
  deleteFile: (filePath) => ipcRenderer.send("deleteFile", filePath),
  openFileLocation: (filePath) =>
    ipcRenderer.invoke("openFileLocation", filePath),
  addAsset: (params) => ipcRenderer.invoke("addAsset", params),
  importAssets: (params) => ipcRenderer.invoke("importAssets", params),

  // yt-dlp functions
  ytdlpCheckAvailability: () => ipcRenderer.invoke("ytdlp-check-availability"),
  ytdlpGetVideoInfo: (url) => ipcRenderer.invoke("ytdlp-get-video-info", url),
  ytdlpDownload: (url, options) =>
    ipcRenderer.invoke("ytdlp-download", url, options),
  ytdlpCancelDownload: (downloadId) =>
    ipcRenderer.invoke("ytdlp-cancel-download", downloadId),
  ytdlpGetActiveDownloads: () =>
    ipcRenderer.invoke("ytdlp-get-active-downloads"),

  // Event listeners for yt-dlp progress
  onYtdlpProgress: (callback) => {
    ipcRenderer.on("ytdlp-progress", (_event, data) => callback(data));
  },
  removeYtdlpProgressListener: () => {
    ipcRenderer.removeAllListeners("ytdlp-progress");
  },

  // Settings functions
  getSettings: () => ipcRenderer.invoke("getSettings"),
  updateSettings: (settings) => ipcRenderer.invoke("updateSettings", settings),
  updateAssetDirectory: (assetType, path) =>
    ipcRenderer.invoke("updateAssetDirectory", assetType, path),
  selectDirectory: (title) => ipcRenderer.invoke("selectDirectory", title),
  resetSettings: () => ipcRenderer.invoke("resetSettings"),
});
