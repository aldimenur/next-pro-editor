# 📁 External Directory Configuration

## Overview

Next Pro Editor now supports configurable asset directories, allowing you to store your assets (sound effects, music, videos) in external directories outside the application folder.

## Features

- ✅ **External Directory Support**: Choose any directory on your system for asset storage
- ✅ **Per-Asset Type Configuration**: Different directories for sound effects, music, videos, etc.
- ✅ **Persistent Settings**: Your directory preferences are saved and remembered
- ✅ **Easy Directory Selection**: Built-in directory picker for easy setup
- ✅ **Settings Reset**: Option to reset to default directories

## How to Use

### 1. Access Settings

- Open the application
- Click on the **Settings** option in the left navigation menu (gear icon)

### 2. Configure Asset Directories

- In the Settings panel, you'll see the "Asset Directories" section
- Each asset type (Sound Effects, Music, Video Effects, Downloads, Icons) has its own directory setting
- Click the **Browse** button next to any asset type to select a new directory
- The current directory path is shown in a code block for easy reference

### 3. Save Changes

- After selecting new directories, click **Save Changes** to apply your settings
- You can also click **Discard** to cancel any unsaved changes

### 4. Reset to Defaults

- Use the **Reset to Defaults** button to restore all directories to their original locations
- This action requires confirmation to prevent accidental resets

## Directory Structure

The application supports the following asset types and their default directories:

- **Sound Effects**: `assets/sound-effects/`
- **Music**: `assets/musics/`
- **Video Effects**: `assets/videos/`
- **Downloads**: `assets/downloads/` (for yt-dlp downloads)
- **Icons**: `assets/icons/`

## Benefits

### For Content Creators

- **Centralized Asset Library**: Store all your assets in one external location
- **Cross-Project Sharing**: Use the same asset library across multiple projects
- **Backup & Sync**: Easily backup or sync your asset directories

### For Teams

- **Shared Network Drives**: Point to shared network locations for team collaboration
- **Version Control**: Keep assets in version-controlled directories
- **Standardized Workflows**: Maintain consistent directory structures across team members

## Technical Details

### Settings Storage

- Settings are stored in your user data directory
- File location: `%APPDATA%/next-pro-editor/settings.json` (Windows)
- Settings persist between application restarts

### Directory Requirements

- Directories are created automatically if they don't exist
- The application needs read/write permissions for selected directories
- Invalid or inaccessible directories will fall back to defaults

### Asset Loading

- The application scans configured directories recursively
- Supported file types remain the same (MP3, WAV, MP4, MOV, etc.)
- Search and pagination work across external directories

## Troubleshooting

### Directory Not Accessible

If a configured directory becomes inaccessible:

1. The application will show an error message
2. It will fall back to default directories
3. Check directory permissions and path validity
4. Reconfigure the directory in Settings

### Performance with Large Directories

- The application scans directories on demand
- Very large directories (10,000+ files) may take longer to load
- Consider organizing assets into subdirectories for better performance

### Network Drives

- Network drives are supported but may have slower performance
- Ensure stable network connection for network-based directories
- Local directories are recommended for best performance

## Migration

### Moving Existing Assets

To move your existing assets to external directories:

1. Copy your current asset files to the new external directory
2. Configure the new directory in Settings
3. Restart the application to refresh the asset list

### Backup Recommendations

- Regularly backup your external asset directories
- Export your settings.json file for easy restoration
- Consider using cloud storage for automatic synchronization
