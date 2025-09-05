const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const { shell } = require("electron");
const { promises: fs } = require("fs");
const YtDlpService = require("./ytdlp-service");
const SettingsManager = require("./settings-manager");

// Initialize settings manager
let settingsManager;
let serverProcess;

// Default directories (will be overridden by settings)
const SOUND_DIR = path.join(__dirname, "../assets/sound-effects");
const MUSIC_DIR = path.join(__dirname, "../assets/musics");
const VIDEO_DIR = path.join(__dirname, "../assets/videos");
const ICON_DIR = path.join(__dirname, "../assets/icons");
const DOWNLOAD_DIR = path.join(__dirname, "../assets/downloads");

// Initialize yt-dlp service
let ytdlpService;

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
      enableRemoteModule: false,
      sandbox: false,
    },
    autoHideMenuBar: true,
    title: "Next Pro Editor - Aldimenur",
    icon: path.join(__dirname, "..", "icon.ico"),
  });

  // Check if we're in development or production
  const isDev = process.env.NODE_ENV === "development" || process.defaultApp;

  if (isDev) {
    // Development mode - connect to dev server
    win.loadURL("http://localhost:4000");
    // Optionally open DevTools in development
    // win.webContents.openDevTools();
  } else {
    // Production mode - start embedded server and serve built React app
    serverProcess = spawn(
      "node",
      [path.join(__dirname, "../server/index.js")],
      {
        cwd: __dirname,
        stdio: "pipe",
      }
    );

    // Wait for server to start before loading
    setTimeout(() => {
      win.loadURL("http://localhost:4000");
    }, 2000);

    win.once("ready-to-show", () => {
      win.show();
    });

    win.on("closed", () => {
      if (serverProcess) {
        serverProcess.kill();
      }
    });
  }
}

async function copyAsset(filePath, assetType) {
  if (!filePath || !assetType) {
    throw new Error("filePath and assetType are required");
  }

  let destinationDir;
  switch (assetType) {
    case "sfx":
      destinationDir = settingsManager.getAssetDirectory("soundEffects");
      break;
    case "vfx":
      destinationDir = settingsManager.getAssetDirectory("videos");
      break;
    case "music":
      destinationDir = settingsManager.getAssetDirectory("music");
      break;
    default:
      throw new Error(`Unsupported asset type: ${assetType}`);
  }

  // Ensure the destination directory exists
  await fs.mkdir(destinationDir, { recursive: true });

  const originalName = path.basename(filePath);
  let destPath = path.join(destinationDir, originalName);
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);

  let counter = 1;
  while (true) {
    try {
      await fs.access(destPath);
      destPath = path.join(destinationDir, `${baseName}_${counter}${ext}`);
      counter += 1;
    } catch (_) {
      break;
    }
  }

  await fs.copyFile(filePath, destPath);
  return destPath;
}

async function getFilesRecursively(dir, fileTypes, acc = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const res = path.join(dir, e.name);
    if (e.isDirectory()) {
      await getFilesRecursively(res, fileTypes, acc);
    } else if (fileTypes.some((t) => e.name.toLowerCase().endsWith(t))) {
      acc.push(res);
    }
  }
  return acc;
}

ipcMain.handle("openFileLocation", async (_event, filePath) => {
  shell.showItemInFolder(filePath);
});

ipcMain.handle("getSoundEffects", async (_event, params = {}) => {
  try {
    const { page = 1, limit = 20, search = "" } = params;
    const soundFileTypes = [".mp3", ".wav", ".m4a"];
    const soundDir = settingsManager.getAssetDirectory("soundEffects");
    let soundFiles = await getFilesRecursively(soundDir, soundFileTypes);

    // Filter by search query (case-insensitive)
    if (search) {
      const q = search.toLowerCase();
      soundFiles = soundFiles.filter((filePath) =>
        path.basename(filePath).toLowerCase().includes(q)
      );
    }

    const total = soundFiles.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    const startIdx = (currentPage - 1) * limit;
    const files = soundFiles
      .slice(startIdx, startIdx + limit)
      .map((filePath) => ({
        filePath,
        fileName: path.basename(filePath),
      }));

    return { files, total, totalPages, page: currentPage, limit };
  } catch (err) {
    console.error("Error getting sound effects:", err);
    return {
      files: [],
      total: 0,
      totalPages: 1,
      page: 1,
      limit: 0,
      error: err.message,
    };
  }
});

ipcMain.handle("getVideoEffects", async (_event, params = {}) => {
  try {
    const { page = 1, limit = 20, search = "" } = params;
    const videoDir = settingsManager.getAssetDirectory("videos");
    let videoFiles = await getFilesRecursively(videoDir, [".mp4", ".mov"]);

    if (search) {
      const q = search.toLowerCase();
      videoFiles = videoFiles.filter((filePath) =>
        path.basename(filePath).toLowerCase().includes(q)
      );
    }

    const total = videoFiles.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    const startIdx = (currentPage - 1) * limit;
    const files = videoFiles
      .slice(startIdx, startIdx + limit)
      .map((filePath) => ({
        filePath,
        fileName: path.basename(filePath),
      }));

    return { files, total, totalPages, page: currentPage, limit };
  } catch (err) {
    console.error("Error getting video effects:", err);
    return {
      files: [],
      total: 0,
      totalPages: 1,
      page: 1,
      limit: 0,
      error: err.message,
    };
  }
});

ipcMain.handle("getMusic", async (_event, params = {}) => {
  try {
    const { page = 1, limit = 20, search = "" } = params;
    const musicFileTypes = [".mp3", ".wav"];
    const musicDir = settingsManager.getAssetDirectory("music");
    let musicFiles = await getFilesRecursively(musicDir, musicFileTypes);

    if (search) {
      const q = search.toLowerCase();
      musicFiles = musicFiles.filter((filePath) =>
        path.basename(filePath).toLowerCase().includes(q)
      );
    }

    const total = musicFiles.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    const startIdx = (currentPage - 1) * limit;
    const files = musicFiles
      .slice(startIdx, startIdx + limit)
      .map((filePath) => ({
        filePath,
        fileName: path.basename(filePath),
      }));

    return { files, total, totalPages, page: currentPage, limit };
  } catch (err) {
    console.error("Error getting music:", err);
    return {
      files: [],
      total: 0,
      totalPages: 1,
      page: 1,
      limit: 0,
      error: err.message,
    };
  }
});

ipcMain.on("deleteFile", async (event, filePath) => {
  try {
    await fs.unlink(filePath);
    event.sender.send("fileDeleted", filePath);
  } catch (err) {
    console.error("Error deleting file:", err);
    event.sender.send("fileDeleteError", err.message);
  }
});

ipcMain.on("onDragStart", (event, filePath) => {
  event.sender.startDrag({
    file: filePath,
    icon: path.join(
      settingsManager.getAssetDirectory("icons"),
      "Hopstarter-Sleek-Xp-Basic-Document-Blank.32.png"
    ),
  });
});

ipcMain.handle("addAsset", async (_event, params = {}) => {
  console.log("addAsset called with", params);
  try {
    const { filePath, assetType } = params;
    const destPath = await copyAsset(filePath, assetType);
    return { success: true, destPath };
  } catch (error) {
    console.error("Error adding asset:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("importAssets", async (_event, params = {}) => {
  const { assetType } = params;
  if (!assetType) {
    return { success: false, error: "assetType is required" };
  }

  let filters;
  switch (assetType) {
    case "sfx":
      filters = [{ name: "Audio", extensions: ["mp3", "wav", "m4a"] }];
      break;
    case "music":
      filters = [{ name: "Audio", extensions: ["mp3", "wav"] }];
      break;
    case "vfx":
      filters = [{ name: "Video", extensions: ["mp4", "mov"] }];
      break;
    default:
      filters = [{ name: "All Files", extensions: ["*"] }];
  }

  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    properties: ["openFile", "multiSelections"],
    filters,
  });

  if (canceled || !filePaths.length) {
    return { success: false, canceled: true };
  }

  const results = [];

  for (const filePath of filePaths) {
    try {
      const dest = await copyAsset(filePath, assetType);
      results.push({ success: true, destPath: dest });
    } catch (err) {
      results.push({ success: false, error: err.message });
    }
  }

  return { success: true, imported: results };
});

// Initialize yt-dlp service and ensure download directory exists
async function initializeYtDlpService() {
  try {
    const downloadDir = settingsManager.getAssetDirectory("downloads");
    await fs.mkdir(downloadDir, { recursive: true });
    ytdlpService = new YtDlpService(downloadDir);

    // Set up progress event forwarding to renderer
    ytdlpService.on("progress", (progressData) => {
      if (win && !win.isDestroyed()) {
        win.webContents.send("ytdlp-progress", progressData);
      }
    });

    console.log("yt-dlp service initialized");
  } catch (error) {
    console.error("Failed to initialize yt-dlp service:", error);
  }
}

// yt-dlp IPC handlers
ipcMain.handle("ytdlp-check-availability", async () => {
  if (!ytdlpService) {
    return { available: false, error: "Service not initialized" };
  }

  try {
    const available = await ytdlpService.checkAvailability();
    return { available };
  } catch (error) {
    return { available: false, error: error.message };
  }
});

ipcMain.handle("ytdlp-get-video-info", async (_event, url) => {
  if (!ytdlpService) {
    return { success: false, error: "Service not initialized" };
  }

  try {
    const info = await ytdlpService.getVideoInfo(url);
    return { success: true, info };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("ytdlp-download", async (_event, url, options = {}) => {
  if (!ytdlpService) {
    return { success: false, error: "Service not initialized" };
  }

  try {
    const result = await ytdlpService.download(url, options);

    // Automatically import the downloaded file to appropriate asset category
    if (result.success && options.autoImport !== false) {
      let assetType = "vfx"; // default to video

      if (options.audioOnly || result.fileName.endsWith(".mp3")) {
        assetType = options.assetType || "music";
      }

      try {
        const importedPath = await copyAsset(result.filePath, assetType);
        // Clean up the original download
        await fs.unlink(result.filePath);

        return {
          ...result,
          imported: true,
          importedPath,
          assetType,
        };
      } catch (importError) {
        console.warn("Failed to auto-import downloaded file:", importError);
        return result; // Return original result if import fails
      }
    }

    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("ytdlp-cancel-download", async (_event, downloadId) => {
  if (!ytdlpService) {
    return { success: false, error: "Service not initialized" };
  }

  const cancelled = ytdlpService.cancelDownload(downloadId);
  return { success: cancelled };
});

ipcMain.handle("ytdlp-get-active-downloads", async () => {
  if (!ytdlpService) {
    return { downloads: [] };
  }

  const downloads = ytdlpService.getActiveDownloads();
  return { downloads };
});

// Settings IPC handlers
ipcMain.handle("getSettings", async () => {
  try {
    const settings = settingsManager.getSettings();
    return { success: true, settings };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("updateSettings", async (_event, newSettings) => {
  try {
    const settings = await settingsManager.updateSettings(newSettings);
    return { success: true, settings };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("updateAssetDirectory", async (_event, assetType, newPath) => {
  try {
    const settings = await settingsManager.updateAssetDirectory(
      assetType,
      newPath
    );
    return { success: true, settings };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(
  "selectDirectory",
  async (_event, title = "Select Directory") => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        properties: ["openDirectory"],
        title: title,
      });

      if (canceled || !filePaths.length) {
        return { success: false, canceled: true };
      }

      return { success: true, path: filePaths[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
);

ipcMain.handle("resetSettings", async () => {
  try {
    const settings = await settingsManager.resetToDefaults();
    return { success: true, settings };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

app.whenReady().then(async () => {
  // Initialize settings manager first
  settingsManager = new SettingsManager();
  await settingsManager.loadSettings();

  // Ensure all asset directories exist
  const settings = settingsManager.getSettings();
  for (const [key, dir] of Object.entries(settings.assetDirectories)) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      console.warn(`Failed to create directory ${dir}:`, error.message);
    }
  }

  await initializeYtDlpService();
  createWindow();
});