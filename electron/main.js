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

// Helper function to recursively get files from a directory
function getFilesRecursively(dir, fileTypes) {
  let results = [];
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively search in subdirectories
      results = results.concat(getFilesRecursively(filePath, fileTypes));
    } else {
      // Check if file matches the allowed types
      if (fileTypes.some((type) => file.toLowerCase().endsWith(type))) {
        results.push(filePath);
      }
    }
  });

  return results;
}

ipcMain.handle("getSoundEffects", async (_event, params = {}) => {
  try {
    const { page = 1, limit = 20, search = "" } = params;
    const soundFileTypes = [".mp3", ".wav", ".m4a"];
    let soundFiles = getFilesRecursively(SOUND_DIR, soundFileTypes);

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
    const videoFileTypes = [".mp4", ".mov"];
    let videoFiles = getFilesRecursively(VIDEO_DIR, videoFileTypes);

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
    let musicFiles = getFilesRecursively(MUSIC_DIR, musicFileTypes);

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

