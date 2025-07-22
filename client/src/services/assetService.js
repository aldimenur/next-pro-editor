export const getSoundEffects = (params) => {
  return window.electronAPI.getSoundEffects(params);
};

export const getVideoEffects = (params) => {
  return window.electronAPI.getVideoEffects(params);
};

export const getMusic = (params) => {
  return window.electronAPI.getMusic(params);
};

export const deleteFile = (filePath) => {
  return window.electronAPI.deleteFile(filePath);
};

export const importAssets = (options) => {
  return window.electronAPI.importAssets(options);
};

export const onDragStart = (filePath) => {
  return window.electronAPI.onDragStart(filePath);
};

export const openFileLocation = (filePath) => {
  return window.electronAPI.openFileLocation(filePath);
};
