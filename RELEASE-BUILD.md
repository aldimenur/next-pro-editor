# Release Build Guide

This document explains how to build portable release versions of Next Pro Editor using the new `build-release.js` script.

## Overview

The release build script creates portable, standalone applications that can be distributed to users without requiring them to install Node.js, npm, or any other dependencies. Each build includes:

- ✅ React frontend (built and optimized)
- ✅ Electron backend
- ✅ Node.js server (embedded)
- ✅ yt-dlp & FFmpeg binaries (platform-specific)
- ✅ All assets and dependencies
- ✅ Default settings configuration

## Quick Start

### Build for Current Platform

```bash
npm run build-release
```

### Build for All Platforms

```bash
npm run build-release-all
```

### Build for Specific Platform

```bash
npm run build-release-win     # Windows only
npm run build-release-mac     # macOS only
npm run build-release-linux   # Linux only
```

## Advanced Usage

### Command Line Options

```bash
node scripts/build-release.js [options]
```

**Options:**

- `--all-platforms` - Build for all supported platforms (Windows, macOS, Linux)
- `--platform <name>` - Build for specific platform (win32, darwin, linux)
- `--no-archives` - Don't create ZIP archives of built apps
- `--skip-react-build` - Skip React client build (use existing build)
- `--help` - Show help message

**Examples:**

```bash
# Build for current platform with archives
node scripts/build-release.js

# Build for all platforms
node scripts/build-release.js --all-platforms

# Build for Windows only without creating ZIP archives
node scripts/build-release.js --platform win32 --no-archives

# Quick rebuild without rebuilding React client
node scripts/build-release.js --skip-react-build
```

## Supported Platforms

| Platform | Architectures | Output Format |
| -------- | ------------- | ------------- |
| Windows  | x64, ia32     | `.exe` + ZIP  |
| macOS    | x64, arm64    | `.app` + ZIP  |
| Linux    | x64, arm64    | Binary + ZIP  |

## Build Output

Built applications are saved to the `dist/` directory:

```
dist/
├── Next-Pro-Editor-win32-x64/
│   ├── Next-Pro-Editor.exe
│   ├── resources/
│   └── ...
├── Next-Pro-Editor-win32-x64.zip
├── Next-Pro-Editor-darwin-x64/
│   ├── Next-Pro-Editor.app/
│   └── ...
├── Next-Pro-Editor-darwin-x64.zip
└── ...
```

## Distribution

### For End Users

1. **Download**: Provide users with the appropriate ZIP file for their platform
2. **Extract**: Users extract the ZIP file to any location
3. **Run**: Users double-click the executable to start the application
4. **No Installation Required**: Everything is self-contained

### Platform-Specific Notes

#### Windows

- Executable: `Next-Pro-Editor.exe`
- No installation required
- Windows Defender may show a warning for unsigned executables

#### macOS

- Application: `Next-Pro-Editor.app`
- Users may need to right-click → "Open" for unsigned apps
- Consider code signing for production releases

#### Linux

- Executable: `Next-Pro-Editor`
- May need to set executable permissions: `chmod +x Next-Pro-Editor`
- AppImage format could be considered for better Linux distribution

## Build Process Details

The build script performs these steps:

1. **Download Binaries**: Ensures yt-dlp and FFmpeg binaries are available
2. **Build React Client**: Compiles and optimizes the React frontend
3. **Prepare Main Process**: Configures Electron main process for production
4. **Package Applications**: Uses electron-packager to create platform-specific builds
5. **Create Archives**: Generates ZIP files for distribution
6. **Cleanup**: Restores development configuration

## Troubleshooting

### Common Issues

**Build fails with "Command not found"**

- Ensure Node.js and npm are installed
- Run `npm install` to install dependencies

**React build fails**

- Check that the client dependencies are installed: `cd client && npm install`
- Ensure the React app builds successfully: `cd client && npm run build`

**Platform-specific build fails**

- Some platforms may require additional tools (e.g., zip on Linux)
- Cross-platform builds may not work on all host systems

**Large file sizes**

- The builds include all dependencies and binaries, so they can be large (100MB+)
- This is normal for Electron applications with embedded media tools

### Development vs Production

The build script automatically configures the application for production:

- Disables development tools
- Uses embedded Node.js server instead of development server
- Optimizes React build for production
- Includes only necessary files

## Customization

### Modifying Build Configuration

Edit `scripts/build-release.js` to customize:

- **Ignore patterns**: Add files/folders to exclude
- **Extra resources**: Include additional files in builds
- **App metadata**: Change app name, version, copyright info
- **Platform options**: Modify platform-specific settings

### Adding New Platforms

To support additional platforms:

1. Add platform configuration to `BUILD_CONFIGS`
2. Ensure binaries are available for the new platform
3. Test the build process on the target platform

## Security Considerations

- **Code Signing**: Consider signing executables for production releases
- **Virus Scanning**: Some antivirus software may flag unsigned executables
- **Distribution**: Use secure channels for distributing release files
- **Updates**: Implement an update mechanism for production applications

## Performance Tips

- Use `--skip-react-build` for faster iterations during testing
- Build on the target platform when possible for best compatibility
- Use `--no-archives` during development to save time
- Keep the `dist/` directory clean to avoid confusion

## CI/CD Integration

The build script can be integrated into continuous integration pipelines:

```yaml
# Example GitHub Actions workflow
- name: Build Release
  run: npm run build-release-all

- name: Upload Artifacts
  uses: actions/upload-artifact@v2
  with:
    name: release-builds
    path: dist/*.zip
```

For questions or issues with the build process, please check the main README.md or create an issue in the project repository.
