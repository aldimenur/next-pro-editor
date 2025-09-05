export const checkYtdlpAvailability = () => {
  return window.electronAPI.ytdlpCheckAvailability();
};

export const getVideoInfo = (url) => {
  return window.electronAPI.ytdlpGetVideoInfo(url);
};

export const downloadVideo = (url, options) => {
  return window.electronAPI.ytdlpDownload(url, options);
};

export const cancelDownload = (downloadId) => {
  return window.electronAPI.ytdlpCancelDownload(downloadId);
};

export const getActiveDownloads = () => {
  return window.electronAPI.ytdlpGetActiveDownloads();
};

export const onDownloadProgress = (callback) => {
  return window.electronAPI.onYtdlpProgress(callback);
};

export const removeDownloadProgressListener = () => {
  return window.electronAPI.removeYtdlpProgressListener();
};
