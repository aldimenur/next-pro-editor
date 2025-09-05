# Settings Configuration

## Settings File Format

The Next Pro Editor now uses a `.txt` format for settings instead of JSON, making it more user-friendly and readable.

### Location

- **User Settings**: Stored in the user data directory as `settings.txt`
- **Default Settings**: Included in the app package as `settings.txt`

### Format

The settings file uses a simple `key=value` format with support for:

- Comments (lines starting with `#`)
- Section headers (enclosed in `[brackets]`)
- Nested properties using dot notation (e.g., `assetDirectories.soundEffects`)

### Example Settings File

```
# Next Pro Editor Settings
# This file contains application settings
# Format: key=value

version=1.0.0

[Asset Directories]
assetDirectories.soundEffects=assets/sound-effects
assetDirectories.music=assets/musics
assetDirectories.videos=assets/videos
assetDirectories.icons=assets/icons
assetDirectories.downloads=assets/downloads
```

### How It Works

1. **First Run**: The app loads default settings from the packaged `settings.txt` file
2. **User Customization**: When users modify settings through the UI, they're saved to the user data directory
3. **Subsequent Runs**: The app loads user settings, falling back to defaults if needed
4. **Persistence**: Settings persist even after building the app into an executable

### Benefits

- **Human Readable**: Easy to read and edit manually if needed
- **Portable**: Settings are included in the built executable
- **Flexible**: Supports comments and organized sections
- **Backward Compatible**: Maintains all existing functionality
