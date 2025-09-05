const packager = require("electron-packager");
const path = require("path");
const { downloadYtDlpBinaries } = require("./download-binaries");

async function buildApp() {
  console.log("🎬 Next Pro Editor - Build Script");
  console.log("==================================");
  console.log("");

  // First, ensure yt-dlp and FFmpeg binaries are downloaded
  console.log("📥 Ensuring yt-dlp & FFmpeg binaries are available...");
  await downloadYtDlpBinaries();
  console.log("");

  // Build the React app first
  console.log("🔨 Building React client...");
  const { spawn } = require("child_process");

  await new Promise((resolve, reject) => {
    const buildProcess = spawn("npm", ["run", "build"], {
      cwd: path.join(__dirname, "..", "client"),
      stdio: "inherit",
      shell: true,
    });

    buildProcess.on("close", (code) => {
      if (code === 0) {
        console.log("✅ React client built successfully");
        resolve();
      } else {
        reject(new Error(`React build failed with code ${code}`));
      }
    });
  });

  console.log("");

  // Package the Electron app
  console.log("📦 Packaging Electron app...");

  const options = {
    dir: path.join(__dirname, ".."),
    out: path.join(__dirname, "..", "dist"),
    name: "Next-Pro-Editor",
    platform: process.platform,
    arch: process.arch,
    electronVersion: "37.1.0",
    overwrite: true,
    ignore: [
      /^\/client\/src/,
      /^\/client\/public/,
      /^\/client\/node_modules/,
      /^\/scripts/,
      /^\/\.git/,
      /^\/\.gitignore/,
      /^\/README\.md/,
      /^\/install-ytdlp\.(sh|bat)/,
    ],
    extraResource: [
      path.join(__dirname, "..", "electron", "binaries"),
      path.join(__dirname, "..", "settings.txt"),
    ],
  };

  try {
    const appPaths = await packager(options);
    console.log("✅ Electron app packaged successfully!");
    console.log("📍 App location:", appPaths[0]);
    console.log("");
    console.log("🎉 Build completed! Your app includes:");
    console.log("  ✓ React frontend");
    console.log("  ✓ Electron backend");
    console.log("  ✓ Node.js server");
    console.log(
      "  ✓ yt-dlp & FFmpeg binaries (no external installation needed)"
    );
    console.log("  ✓ All assets and dependencies");
    console.log("  ✓ Default settings.txt file for persistent configuration");
    console.log("");
    console.log(
      "🚀 You can now distribute the app without requiring users to install anything!"
    );
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  buildApp().catch(console.error);
}

module.exports = { buildApp };
