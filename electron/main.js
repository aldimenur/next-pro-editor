const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const { shell } = require("electron");
const fs = require("fs");
const SOUND_DIR = path.join(__dirname, "../assets/sound-effects");

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

ipcMain.handle("openFileLocation", async (_event, sfxName) => {
  if (typeof sfxName === "string" && sfxName.length > 0) {
    shell.showItemInFolder(
      path.join(__dirname, "../assets/sound-effects", sfxName)
    );
  }
  // Return the resolved path so the renderer can optionally use it.
  return path.join(__dirname, "../assets/sound-effects", sfxName || "");
});

// Return list of sound-effect files with optional pagination & search.
// params: { page: number, limit: number, search: string }
ipcMain.handle("getSoundEffects", async (_event, params = {}) => {
  try {
    const { page = 1, limit = 20, search = "" } = params;
    let soundFiles = fs
      .readdirSync(SOUND_DIR)
      .filter((file) => file.endsWith(".mp3") || file.endsWith(".wav"));

    // Filter by search query (case-insensitive)
    if (search) {
      const q = search.toLowerCase();
      soundFiles = soundFiles.filter((file) => file.toLowerCase().includes(q));
    }

    const total = soundFiles.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    const startIdx = (currentPage - 1) * limit;
    const files = soundFiles.slice(startIdx, startIdx + limit);

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

app.whenReady().then(() => {
  // Use the current Node executable and avoid invoking through the shell so paths with spaces work on Windows
  const nodePath = process.execPath; // Absolute path to the Node binary
  server = spawn(nodePath, [path.join(__dirname, "../server/index.js")], {
    stdio: "inherit",
    windowsHide: true, // Hide the extra console window on Windows
  });

  setTimeout(createWindow, 1000); // beri delay agar server siap

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });

  app.on("quit", () => {
    if (server) server.kill();
  });
});
