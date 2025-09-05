export const getSettings = () => {
  return window.electronAPI.getSettings();
};

export const updateSettings = (settings) => {
  return window.electronAPI.updateSettings(settings);
};

export const updateAssetDirectory = (assetType, path) => {
  return window.electronAPI.updateAssetDirectory(assetType, path);
};

export const selectDirectory = (title) => {
  return window.electronAPI.selectDirectory(title);
};

export const resetSettings = () => {
  return window.electronAPI.resetSettings();
};
