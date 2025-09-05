# 🎬 yt-dlp + FFmpeg Integration Documentation

## 📋 Overview

Next Pro Editor now includes **bundled yt-dlp + FFmpeg integration** that works seamlessly without requiring users to install anything manually. The integration includes:

- ✅ **Bundled Binaries**: yt-dlp + FFmpeg executables for Windows, Linux, and macOS
- ✅ **Automatic Platform Detection**: Uses the correct binaries for the current OS
- ✅ **Seamless Integration**: Works out-of-the-box after building the app
- ✅ **No External Dependencies**: Users don't need to install anything
- ✅ **Complete Video Processing**: Full video/audio conversion capabilities

## 🏗️ Architecture

```
Next Pro Editor
├── Frontend (React)
│   ├── YtDlpDownloader Component
│   ├── Progress Tracking UI
│   ├── Video Info Preview
│   └── Download Options
├── Backend (Electron)
│   ├── YtDlpService Class
│   ├── Platform Detection
│   ├── Binary Path Resolution
│   └── IPC Communication
├── Bundled Binaries
│   ├── electron/binaries/win32/yt-dlp.exe (18MB) + ffmpeg.exe (172MB)
│   ├── electron/binaries/linux/yt-dlp (3MB) + ffmpeg (76MB)
│   └── electron/binaries/darwin/yt-dlp (34MB) + ffmpeg (76MB)
└── Auto Import System
    ├── Sound Effects
    ├── Music
    └── Videos
```

## 🚀 Features

### 🎯 **Multi-Platform Support**

- YouTube, TikTok, Instagram, Twitter, Vimeo, Facebook
- 1000+ supported sites via yt-dlp

### 📱 **Smart Downloads**

- Video preview with thumbnail and duration
- Quality selection (720p, 1080p, 4K, etc.)
- Audio-only extraction (MP3)
- Real-time progress tracking

### 🔄 **Auto-Import System**

- Downloaded files automatically imported to asset library
- Smart categorization (Music, SFX, Videos)
- Duplicate handling with auto-renaming

### 🛠️ **Developer Features**

- Platform-specific binary selection
- Fallback to system yt-dlp if bundled version fails
- Comprehensive error handling
- Progress event forwarding

## 📦 Installation & Setup

### For Developers

1. **Clone and Install**:

   ```bash
   git clone <repo-url>
   cd next-pro-editor
   npm install  # Automatically downloads yt-dlp binaries
   ```

2. **Development**:

   ```bash
   npm run dev  # Start development with bundled yt-dlp
   ```

3. **Building**:
   ```bash
   npm run build-app  # Build complete app with binaries
   ```

### For End Users

- **No installation required!** yt-dlp is bundled with the app
- Just run the distributed application
- All download features work immediately

## 🔧 Technical Details

### Binary Management

**Location**: `electron/binaries/[platform]/yt-dlp[.exe]`

**Platform Detection**:

```javascript
const platform = os.platform();
// win32 → yt-dlp.exe
// darwin → yt-dlp (macOS)
// linux → yt-dlp
```

**Fallback Strategy**:

1. Try bundled binary first
2. If not found, fallback to system yt-dlp
3. Show appropriate error messages

### Download Process

1. **URL Input** → **Video Info Fetch** → **Options Selection**
2. **Download Start** → **Progress Tracking** → **Completion**
3. **Auto Import** → **Asset Library Update** → **UI Refresh**

### File Organization

```
assets/
├── downloads/          # Temporary download location
├── sound-effects/      # Auto-imported audio files
├── musics/            # Auto-imported music files
└── videos/            # Auto-imported video files
```

## 🧪 Testing

### Manual Testing

1. **Start the app**: `npm run dev`
2. **Navigate to**: "Download Videos" section
3. **Test URL**: Paste any YouTube URL
4. **Verify**: Video info loads, download works, auto-import succeeds

### Binary Testing

```bash
# Test Windows binary
electron/binaries/win32/yt-dlp.exe --version

# Test Linux binary
electron/binaries/linux/yt-dlp --version

# Test macOS binary
electron/binaries/darwin/yt-dlp --version
```

## 📋 Build Scripts

### Available Commands

```bash
# Download/update yt-dlp binaries
npm run download-ytdlp

# Build React client only
npm run build

# Build complete application with binaries
npm run build-app

# Development with hot reload
npm run dev
```

### Build Process

1. **Download Binaries**: Latest yt-dlp for all platforms
2. **Build Frontend**: React app compilation
3. **Package App**: Electron with all resources
4. **Include Binaries**: Platform-specific executables
5. **Generate Distributables**: Ready-to-ship applications

## 🔒 Security & Permissions

### Binary Verification

- Binaries downloaded from official yt-dlp GitHub releases
- SHA verification can be added for enhanced security
- Executable permissions set automatically on Unix systems

### Sandboxing

- Electron app runs with appropriate permissions
- yt-dlp processes spawned with limited privileges
- Download directory access controlled

## 🐛 Troubleshooting

### Common Issues

**Binary Not Found**:

- Run `npm run download-ytdlp`
- Check file permissions
- Verify platform detection

**Download Fails**:

- Check internet connection
- Verify URL is supported
- Check disk space

**Import Issues**:

- Verify asset directories exist
- Check file permissions
- Ensure sufficient disk space

### Debug Mode

Enable verbose logging in YtDlpService:

```javascript
console.log("Using yt-dlp binary:", this.ytdlpPath);
console.log("Platform detected:", os.platform());
```

## 🚀 Distribution

### What's Included

When you build and distribute the app:

- ✅ **Complete Electron App**
- ✅ **React Frontend**
- ✅ **Node.js Backend**
- ✅ **yt-dlp Binaries** (all platforms)
- ✅ **FFmpeg Binaries** (all platforms)
- ✅ **Asset Management System**
- ✅ **All Dependencies**

### File Sizes

- **Windows**: ~220MB (includes 18MB yt-dlp.exe + 172MB ffmpeg.exe)
- **Linux**: ~110MB (includes 3MB yt-dlp + 76MB ffmpeg)
- **macOS**: ~140MB (includes 34MB yt-dlp + 76MB ffmpeg)

### User Experience

Users get a **zero-configuration experience**:

1. Download and install your app
2. Launch the application
3. Start downloading videos immediately
4. No external tools or setup required!

## 🎯 Future Enhancements

### Planned Features

- [ ] Batch download queue
- [ ] Download history
- [ ] Custom output formats
- [ ] Subtitle extraction
- [ ] Playlist support
- [ ] Download scheduling

### Technical Improvements

- [ ] Binary integrity verification
- [ ] Automatic yt-dlp updates
- [ ] Download resume capability
- [ ] Advanced error recovery
- [ ] Performance optimization

---

## 📞 Support

For issues related to yt-dlp integration:

1. **Check bundled binaries**: Ensure they're downloaded and executable
2. **Verify platform support**: Test on target operating system
3. **Review logs**: Check console output for error messages
4. **Fallback option**: System yt-dlp installation as backup

**Remember**: The goal is seamless user experience - no manual installation required! 🎉
