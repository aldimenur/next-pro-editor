const fs = require("fs").promises;
const path = require("path");
const { app } = require("electron");

class SettingsManager {
  constructor() {
    this.settingsPath = path.join(app.getPath("userData"), "settings.json");
    this.defaultSettings = {
      assetDirectories: {
        soundEffects: path.join(__dirname, "../assets/sound-effects"),
        music: path.join(__dirname, "../assets/musics"),
        videos: path.join(__dirname, "../assets/videos"),
        icons: path.join(__dirname, "../assets/icons"),
        downloads: path.join(__dirname, "../assets/downloads"),
      },
      version: "1.0.0",
    };
    this.settings = { ...this.defaultSettings };
  }

  async loadSettings() {
    try {
      const data = await fs.readFile(this.settingsPath, "utf8");
      this.settings = { ...this.defaultSettings, ...JSON.parse(data) };
    } catch (error) {
      // If settings file doesn't exist or is corrupted, use defaults
      console.log("Using default settings:", error.message);
      await this.saveSettings();
    }
    return this.settings;
  }

  async saveSettings() {
    try {
      // Ensure the directory exists
      await fs.mkdir(path.dirname(this.settingsPath), { recursive: true });
      await fs.writeFile(
        this.settingsPath,
        JSON.stringify(this.settings, null, 2)
      );
    } catch (error) {
      console.error("Failed to save settings:", error);
      throw error;
    }
  }

  getSettings() {
    return this.settings;
  }

  async updateAssetDirectory(assetType, newPath) {
    if (!this.settings.assetDirectories) {
      this.settings.assetDirectories = {
        ...this.defaultSettings.assetDirectories,
      };
    }

    this.settings.assetDirectories[assetType] = newPath;
    await this.saveSettings();
    return this.settings;
  }

  async updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
    return this.settings;
  }

  getAssetDirectory(assetType) {
    return (
      this.settings.assetDirectories?.[assetType] ||
      this.defaultSettings.assetDirectories[assetType]
    );
  }

  async resetToDefaults() {
    this.settings = { ...this.defaultSettings };
    await this.saveSettings();
    return this.settings;
  }
}

module.exports = SettingsManager;
