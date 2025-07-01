const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

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

  win.loadURL("http://localhost:3000");

  // win.loadFile(path.join(__dirname, "../client/build/index.html"));
}

// Tangani fungsi dari preload
ipcMain.handle("dialog:openFile", async () => {
  const result = await dialog.showOpenDialog({ properties: ["openFile"] });
  return result.filePaths;
});

app.whenReady().then(() => {
  // Jalankan backend Express
  server = spawn("node", [path.join(__dirname, "../server/index.js")], {
    shell: true,
    stdio: "inherit",
  });

  setTimeout(createWindow, 1000); // beri delay agar server siap

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });

  app.on("quit", () => {
    if (server) server.kill();
  });
});
