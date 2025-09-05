import React, { useState, useEffect } from "react";
import { FaCog, FaFolder, FaSave } from "react-icons/fa";
import { LuFolderOpen, LuCheck, LuX, LuRotateCcw } from "react-icons/lu";

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [tempSettings, setTempSettings] = useState(null);

  const assetTypeLabels = {
    soundEffects: "Sound Effects Directory",
    music: "Music Directory",
    videos: "Video Effects Directory",
    downloads: "Downloads Directory",
    icons: "Icons Directory",
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const result = await window.electronAPI.getSettings();
      if (result.success) {
        setSettings(result.settings);
        setTempSettings({ ...result.settings });
      } else {
        showMessage("Failed to load settings: " + result.error, "error");
      }
    } catch (error) {
      showMessage("Error loading settings: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDirectorySelect = async (assetType) => {
    try {
      const title = `Select ${assetTypeLabels[assetType]}`;
      const result = await window.electronAPI.selectDirectory(title);

      if (result.success && result.path) {
        setTempSettings((prev) => ({
          ...prev,
          assetDirectories: {
            ...prev.assetDirectories,
            [assetType]: result.path,
          },
        }));
      }
    } catch (error) {
      showMessage("Error selecting directory: " + error.message, "error");
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const result = await window.electronAPI.updateSettings(tempSettings);

      if (result.success) {
        setSettings(result.settings);
        showMessage("Settings saved successfully!", "success");
      } else {
        showMessage("Failed to save settings: " + result.error, "error");
      }
    } catch (error) {
      showMessage("Error saving settings: " + error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = async () => {
    if (
      !window.confirm(
        "Are you sure you want to reset all settings to defaults?"
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      const result = await window.electronAPI.resetSettings();

      if (result.success) {
        setSettings(result.settings);
        setTempSettings({ ...result.settings });
        showMessage("Settings reset to defaults!", "success");
      } else {
        showMessage("Failed to reset settings: " + result.error, "error");
      }
    } catch (error) {
      showMessage("Error resetting settings: " + error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setTempSettings({ ...settings });
    showMessage("Changes discarded", "info");
  };

  const hasUnsavedChanges = () => {
    if (!settings || !tempSettings) return false;
    return JSON.stringify(settings) !== JSON.stringify(tempSettings);
  };

  const shortenPath = (path, maxLength = 50) => {
    if (!path) return "";
    if (path.length <= maxLength) return path;

    const start = path.substring(0, 15);
    const end = path.substring(path.length - 30);
    return `${start}...${end}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading settings...</span>
      </div>
    );
  }

  if (!settings || !tempSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Failed to load settings</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaCog className="text-2xl text-blue-500 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>

            {hasUnsavedChanges() && (
              <div className="flex space-x-2">
                <button
                  onClick={handleDiscardChanges}
                  className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200 flex items-center"
                >
                  <LuX className="mr-1" />
                  Discard
                </button>
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 flex items-center disabled:opacity-50"
                >
                  <FaSave className="mr-1" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg flex items-center ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : message.type === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {message.type === "success" && <LuCheck className="mr-2" />}
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Asset Directories
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Configure where your asset files are stored. You can choose
                external directories outside the application folder.
              </p>

              <div className="space-y-4">
                {Object.entries(assetTypeLabels).map(([assetType, label]) => (
                  <div
                    key={assetType}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {label}
                        </label>
                        <div className="flex items-center space-x-2">
                          <FaFolder className="text-gray-400 flex-shrink-0" />
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 flex-1 font-mono">
                            {shortenPath(
                              tempSettings.assetDirectories[assetType]
                            )}
                          </code>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDirectorySelect(assetType)}
                        className="ml-4 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition duration-200 flex items-center"
                      >
                        <LuFolderOpen className="mr-1" />
                        Browse
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Reset Settings
                  </h3>
                  <p className="text-sm text-gray-500">
                    Reset all settings to their default values
                  </p>
                </div>
                <button
                  onClick={handleResetSettings}
                  disabled={saving}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 flex items-center disabled:opacity-50"
                >
                  <LuRotateCcw className="mr-2" />
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
