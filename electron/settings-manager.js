const fs = require("fs").promises;
const path = require("path");
const { app } = require("electron");

class SettingsManager {
  constructor() {
    this.settingsPath = path.join(app.getPath("userData"), "settings.txt");
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
      // Parse the text format - each line contains key=value pairs
      const parsedSettings = this.parseSettingsText(data);
      this.settings = { ...this.defaultSettings, ...parsedSettings };
    } catch (error) {
      // If settings file doesn't exist, try to load from default settings.txt in app resources
      console.log(
        "User settings not found, trying to load from app resources:",
        error.message
      );
      try {
        const defaultSettingsPath = path.join(__dirname, "..", "settings.txt");
        const defaultData = await fs.readFile(defaultSettingsPath, "utf8");
        const parsedDefaultSettings = this.parseSettingsText(defaultData);
        this.settings = { ...this.defaultSettings, ...parsedDefaultSettings };
        // Save user settings for future use
        await this.saveSettings();
      } catch (defaultError) {
        // If even default settings file doesn't exist, use hardcoded defaults
        console.log(
          "Default settings file not found, using hardcoded defaults:",
          defaultError.message
        );
        await this.saveSettings();
      }
    }
    return this.settings;
  }

  async saveSettings() {
    try {
      // Ensure the directory exists
      await fs.mkdir(path.dirname(this.settingsPath), { recursive: true });
      const settingsText = this.formatSettingsAsText(this.settings);
      await fs.writeFile(this.settingsPath, settingsText);
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

  // Helper method to parse settings from text format
  parseSettingsText(text) {
    const settings = {};
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === '' || trimmed.startsWith('#')) continue; // Skip empty lines and comments
      
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        // Section header - for future use
        continue;
      }
      
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex === -1) continue;
      
      const key = trimmed.substring(0, equalIndex).trim();
      const value = trimmed.substring(equalIndex + 1).trim();
      
      // Handle nested properties like assetDirectories.soundEffects
      if (key.includes('.')) {
        const parts = key.split('.');
        let current = settings;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
      } else {
        settings[key] = value;
      }
    }
    
    return settings;
  }

  // Helper method to format settings as text
  formatSettingsAsText(settings) {
    let text = '# Next Pro Editor Settings\n';
    text += '# This file contains application settings\n';
    text += '# Format: key=value\n\n';
    
    // Add version
    text += `version=${settings.version}\n\n`;
    
    // Add asset directories section
    text += '[Asset Directories]\n';
    if (settings.assetDirectories) {
      for (const [key, value] of Object.entries(settings.assetDirectories)) {
        text += `assetDirectories.${key}=${value}\n`;
      }
    }
    
    text += '\n';
    
    // Add any other settings that might exist
    for (const [key, value] of Object.entries(settings)) {
      if (key !== 'version' && key !== 'assetDirectories') {
        if (typeof value === 'object') {
          text += `[${key}]\n`;
          for (const [subKey, subValue] of Object.entries(value)) {
            text += `${key}.${subKey}=${subValue}\n`;
          }
          text += '\n';
        } else {
          text += `${key}=${value}\n`;
        }
      }
    }
    
    return text;
  }
}

module.exports = SettingsManager;
