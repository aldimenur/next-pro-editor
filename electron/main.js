const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const { shell } = require("electron");
const fs = require("fs");
const SOUND_DIR = path.join(__dirname, "../assets/sound-effects");
const MUSIC_DIR = path.join(__dirname, "../assets/musics");
const VIDEO_DIR = path.join(__dirname, "../assets/videos");
const ICON_DIR = path.join(__dirname, "../assets/icons");

let win;
let server;

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
    },
  });

  // Development
  win.loadURL("http://localhost:3000");

  // Production
  // Start the Express server
  // serverProcess = spawn("node", [path.join(__dirname, "../server/index.js")], {
  //   cwd: __dirname,
  //   stdio: "pipe",
  // });

  // Wait a moment for server to start, then load the app
  // setTimeout(() => {
  //   win.loadURL("http://localhost:3001");
  // }, 1000);

  // // Show window when ready
  // win.once("ready-to-show", () => {
  //   win.show();
  // });
}

ipcMain.handle("openFileLocation", async (_event, filePath) => {
  shell.showItemInFolder(filePath);
});

ipcMain.handle("getSoundEffects", async (_event, params = {}) => {
  try {
    const { page = 1, limit = 20, search = "" } = params;
    let soundFiles = fs
      .readdirSync(SOUND_DIR)
      .filter(
        (file) =>
          file.endsWith(".mp3") ||
          file.endsWith(".wav") ||
          file.endsWith(".m4a")
      );

    // Filter by search query (case-insensitive)
    if (search) {
      const q = search.toLowerCase();
      soundFiles = soundFiles.filter((file) => file.toLowerCase().includes(q));
    }

    const total = soundFiles.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    const startIdx = (currentPage - 1) * limit;
    const files = soundFiles.slice(startIdx, startIdx + limit).map((file) => ({
      filePath: path.join(SOUND_DIR, file),
      fileName: file,
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
    let videoFiles = fs
      .readdirSync(VIDEO_DIR)
      .filter((file) => file.endsWith(".mp4") || file.endsWith(".mov"));

    if (search) {
      const q = search.toLowerCase();
      videoFiles = videoFiles.filter((file) => file.toLowerCase().includes(q));
    }

    const total = videoFiles.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    const startIdx = (currentPage - 1) * limit;
    const files = videoFiles.slice(startIdx, startIdx + limit).map((file) => ({
      filePath: path.join(VIDEO_DIR, file),
      fileName: file,
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
    let musicFiles = fs
      .readdirSync(MUSIC_DIR)
      .filter((file) => file.endsWith(".mp3") || file.endsWith(".wav"));

    if (search) {
      const q = search.toLowerCase();
      musicFiles = musicFiles.filter((file) => file.toLowerCase().includes(q));
    }

    const total = musicFiles.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    const startIdx = (currentPage - 1) * limit;
    const files = musicFiles.slice(startIdx, startIdx + limit).map((file) => ({
      filePath: path.join(MUSIC_DIR, file),
      fileName: file,
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

ipcMain.on("onDragStart", (event, filePath) => {
  event.sender.startDrag({
    file: filePath,
    icon: path.join(
      ICON_DIR,
      "Hopstarter-Sleek-Xp-Basic-Document-Blank.32.png"
    ),
  });
});

app.whenReady().then(() => {
  const nodePath = process.execPath;
  server = spawn(nodePath, [path.join(__dirname, "../server/index.js")], {
    stdio: "inherit",
    windowsHide: true,
  });

  setTimeout(createWindow, 1000);

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });

  app.on("quit", () => {
    if (server) server.kill();
  });
});
