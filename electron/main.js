const { app, BrowserWindow } = require("electron");
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
    },
  });

  win.loadURL("http://localhost:3000");
}

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
