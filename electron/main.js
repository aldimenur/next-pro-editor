const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const { shell } = require("electron");
const { promises: fs } = require("fs");
const SOUND_DIR = path.join(__dirname, "../assets/sound-effects");
const MUSIC_DIR = path.join(__dirname, "../assets/musics");
const VIDEO_DIR = path.join(__dirname, "../assets/videos");
const ICON_DIR = path.join(__dirname, "../assets/icons");

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
    },
    autoHideMenuBar: true,
    title: "Next Pro Editor - Aldimenur",
    icon: "icon.ico",
  });

  // Development
  win.loadURL("http://localhost:3000");

  // Production
  // serverProcess = spawn("node", [path.join(__dirname, "../server/index.js")], {
  //   cwd: __dirname,
  //   stdio: "pipe",
  // });
  // setTimeout(() => {
  //   win.loadURL("http://localhost:3001");
  // }, 1000);
  // win.once("ready-to-show", () => {
  //   win.show();
  // });
  // win.on("closed", () => {
  //   serverProcess.kill();
  // });
}

// Helper function to recursively get files from a directory
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
    let soundFiles = await getFilesRecursively(SOUND_DIR, soundFileTypes);

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
    let videoFiles = await getFilesRecursively(VIDEO_DIR, [".mp4", ".mov"]);

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
    let musicFiles = await getFilesRecursively(MUSIC_DIR, musicFileTypes);

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

ipcMain.on("deleteFile", (event, filePath) => {
  try {
    fs.unlinkSync(filePath);
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
      ICON_DIR,
      "Hopstarter-Sleek-Xp-Basic-Document-Blank.32.png"
    ),
  });
});

app.whenReady().then(() => {
  createWindow();
});