const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const { shell } = require("electron");
const fs = require("fs");

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

ipcMain.handle("openFileLocation", async (sfxName) => {
  shell.showItemInFolder(
    path.join(__dirname, "../assets/sound-effects", sfxName)
  );
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
