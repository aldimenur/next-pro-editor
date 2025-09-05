const packager = require("electron-packager");
const path = require("path");
const fs = require("fs").promises;
const { spawn } = require("child_process");
const { downloadYtDlpBinaries } = require("./download-binaries");

/**
 * Build configuration for different platforms
 */
const BUILD_CONFIGS = {
  win32: {
    platform: "win32",
    arch: ["x64", "ia32"],
    icon: path.join(__dirname, "..", "icon.ico"),
    executableName: "Next-Pro-Editor.exe",
  },
  darwin: {
    platform: "darwin",
    arch: ["x64", "arm64"],
    icon: path.join(__dirname, "..", "icon.png"),
    executableName: "Next-Pro-Editor",
  },
  linux: {
    platform: "linux",
    arch: ["x64", "arm64"],
    icon: path.join(__dirname, "..", "icon.png"),
    executableName: "Next-Pro-Editor",
  },
};

/**
 * Files and directories to ignore during packaging
 */
const IGNORE_PATTERNS = [
  // Source files
  /^\/client\/src/,
  /^\/client\/public/,
  /^\/client\/node_modules/,
  /^\/client\/package\.json/,
  /^\/client\/package-lock\.json/,
  /^\/client\/README\.md/,
  /^\/client\/postcss\.config\.js/,
  /^\/client\/tailwind\.config\.js/,

  // Development files
  /^\/scripts/,
  /^\/\.git/,
  /^\/\.gitignore/,
  /^\/README\.md/,
  /^\/SETTINGS\.md/,
  /^\/YTDLP-INTEGRATION\.md/,
  /^\/EXTERNAL-DIRECTORIES\.md/,
  /^\/install\.sh/,
  /^\/start\.(bat|sh)/,

  // Build artifacts
  /^\/dist/,
  /^\/node_modules\/(?!electron)/,

  // Asset directories (will be handled separately)
  /^\/assets/,

  // Temporary files
  /^\/\.DS_Store/,
  /^\/Thumbs\.db/,
  /^\/.env/,
];

/**
 * Run a command and return a promise
 */
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(" ")}`);

    const process = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      ...options,
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `Command failed with code ${code}: ${command} ${args.join(" ")}`
          )
        );
      }
    });

    process.on("error", (error) => {
      reject(error);
    });
  });
}

/**
 * Build the React client application
 */
async function buildReactClient() {
  console.log("🔨 Building React client...");

  const clientDir = path.join(__dirname, "..", "client");

  try {
    await runCommand("npm", ["run", "build"], { cwd: clientDir });
    console.log("✅ React client built successfully");
  } catch (error) {
    throw new Error(`Failed to build React client: ${error.message}`);
  }
}

/**
 * Prepare the main.js file for production
 */
async function prepareMainJsForProduction() {
  console.log("⚙️  Preparing main.js for production...");

  const mainJsPath = path.join(__dirname, "..", "electron", "main.js");
  const backupPath = path.join(__dirname, "..", "electron", "main.js.backup");

  try {
    // Read the current main.js
    const mainJsContent = await fs.readFile(mainJsPath, "utf8");

    // Create backup
    await fs.writeFile(backupPath, mainJsContent);

    // Replace development configuration with production configuration
    const productionContent = mainJsContent
      .replace(
        /\/\/ Development;[\s\S]*?win\.loadURL\("http:\/\/localhost:4000"\);/,
        `// Production mode
  serverProcess = spawn("node", [path.join(__dirname, "../server/index.js")], {
    cwd: __dirname,
    stdio: "pipe",
  });
  
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
  });`
      )
      .replace(/\/\/ Production[\s\S]*?\/\/ \}\);/, "");

    await fs.writeFile(mainJsPath, productionContent);
    console.log("✅ main.js prepared for production");

    return backupPath;
  } catch (error) {
    throw new Error(`Failed to prepare main.js: ${error.message}`);
  }
}

/**
 * Restore the original main.js file
 */
async function restoreMainJs(backupPath) {
  console.log("🔄 Restoring original main.js...");

  const mainJsPath = path.join(__dirname, "..", "electron", "main.js");

  try {
    const backupContent = await fs.readFile(backupPath, "utf8");
    await fs.writeFile(mainJsPath, backupContent);
    await fs.unlink(backupPath); // Remove backup file
    console.log("✅ Original main.js restored");
  } catch (error) {
    console.warn(`⚠️  Failed to restore main.js: ${error.message}`);
  }
}

/**
 * Package the application for a specific platform and architecture
 */
async function packageApp(platform, arch, config) {
  console.log(`📦 Packaging for ${platform}-${arch}...`);

  const outputName = `Next-Pro-Editor-${platform}-${arch}`;
  const outputPath = path.join(__dirname, "..", "dist", outputName);

  const options = {
    dir: path.join(__dirname, ".."),
    out: path.join(__dirname, "..", "dist"),
    name: "Next-Pro-Editor",
    platform: platform,
    arch: arch,
    electronVersion: "37.1.0",
    overwrite: true,
    ignore: IGNORE_PATTERNS,
    icon: config.icon,
    executableName: config.executableName,

    // Extra resources to include
    extraResource: [
      path.join(__dirname, "..", "electron", "binaries"),
      path.join(__dirname, "..", "settings.txt"),
      path.join(__dirname, "..", "client", "build"),
    ],

    // App metadata
    appBundleId: "com.aldimenur.next-pro-editor",
    appCategoryType: "public.app-category.video",
    appCopyright: "Copyright © 2024 Aldimenur",
    appVersion: require("../package.json").version,
    buildVersion: require("../package.json").version,

    // Windows specific options
    ...(platform === "win32" && {
      win32metadata: {
        CompanyName: "Aldimenur",
        FileDescription: "Next Pro Editor - Professional Video Editor",
        ProductName: "Next Pro Editor",
        InternalName: "Next-Pro-Editor",
        OriginalFilename: "Next-Pro-Editor.exe",
      },
    }),

    // macOS specific options
    ...(platform === "darwin" && {
      osxSign: false, // Disable signing for now
      protocols: [
        {
          name: "next-pro-editor",
          schemes: ["next-pro-editor"],
        },
      ],
    }),
  };

  try {
    const appPaths = await packager(options);
    console.log(`✅ ${platform}-${arch} packaged successfully!`);
    console.log(`📍 Location: ${appPaths[0]}`);
    return appPaths[0];
  } catch (error) {
    console.error(`❌ Failed to package ${platform}-${arch}:`, error.message);
    throw error;
  }
}

/**
 * Create a compressed archive of the built application
 */
async function createArchive(appPath, platform) {
  console.log(`📦 Creating archive for ${path.basename(appPath)}...`);

  const archiveName = `${path.basename(appPath)}.zip`;
  const archivePath = path.join(path.dirname(appPath), archiveName);

  try {
    if (platform === "win32") {
      // Use PowerShell on Windows
      await runCommand("powershell", [
        "-Command",
        `Compress-Archive -Path '${appPath}' -DestinationPath '${archivePath}' -Force`,
      ]);
    } else {
      // Use zip on Unix-like systems
      await runCommand("zip", ["-r", archivePath, path.basename(appPath)], {
        cwd: path.dirname(appPath),
      });
    }

    console.log(`✅ Archive created: ${archiveName}`);
    return archivePath;
  } catch (error) {
    console.warn(`⚠️  Failed to create archive: ${error.message}`);
    return null;
  }
}

/**
 * Main build function
 */
async function buildRelease(options = {}) {
  const {
    platforms = [process.platform],
    createArchives = true,
    skipReactBuild = false,
  } = options;

  console.log("🎬 Next Pro Editor - Release Build Script");
  console.log("==========================================");
  console.log("");

  let backupPath = null;

  try {
    // Step 1: Download binaries
    console.log("📥 Ensuring yt-dlp & FFmpeg binaries are available...");
    await downloadYtDlpBinaries();
    console.log("");

    // Step 2: Build React client
    if (!skipReactBuild) {
      await buildReactClient();
      console.log("");
    }

    // Step 3: Prepare main.js for production
    backupPath = await prepareMainJsForProduction();
    console.log("");

    // Step 4: Package for each platform
    const builtApps = [];

    for (const platform of platforms) {
      if (!BUILD_CONFIGS[platform]) {
        console.warn(`⚠️  Unknown platform: ${platform}, skipping...`);
        continue;
      }

      const config = BUILD_CONFIGS[platform];

      for (const arch of config.arch) {
        try {
          const appPath = await packageApp(platform, arch, config);
          builtApps.push({ platform, arch, path: appPath });

          // Create archive if requested
          if (createArchives) {
            await createArchive(appPath, platform);
          }
        } catch (error) {
          console.error(`Failed to build ${platform}-${arch}:`, error.message);
          // Continue with other builds
        }
      }

      console.log("");
    }

    // Step 5: Display results
    console.log("🎉 Release build completed!");
    console.log("");
    console.log("📦 Built applications:");
    builtApps.forEach(({ platform, arch, path }) => {
      console.log(`  ✓ ${platform}-${arch}: ${path}`);
    });

    console.log("");
    console.log("🚀 Your portable apps include:");
    console.log("  ✓ React frontend (built and optimized)");
    console.log("  ✓ Electron backend");
    console.log("  ✓ Node.js server (embedded)");
    console.log("  ✓ yt-dlp & FFmpeg binaries (platform-specific)");
    console.log("  ✓ All assets and dependencies");
    console.log("  ✓ Default settings configuration");
    console.log("");
    console.log("📋 Distribution notes:");
    console.log("  • Apps are completely portable - no installation required");
    console.log("  • Users can run the executable directly");
    console.log("  • All dependencies are bundled");
    console.log("  • Settings will be created on first run");
  } catch (error) {
    console.error("❌ Build failed:", error.message);
    process.exit(1);
  } finally {
    // Always restore the original main.js
    if (backupPath) {
      await restoreMainJs(backupPath);
    }
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  if (args.includes("--all-platforms")) {
    options.platforms = Object.keys(BUILD_CONFIGS);
  } else if (args.includes("--platform")) {
    const platformIndex = args.indexOf("--platform");
    if (platformIndex !== -1 && args[platformIndex + 1]) {
      options.platforms = [args[platformIndex + 1]];
    }
  }

  if (args.includes("--no-archives")) {
    options.createArchives = false;
  }

  if (args.includes("--skip-react-build")) {
    options.skipReactBuild = true;
  }

  if (args.includes("--help")) {
    console.log(`
Next Pro Editor - Release Build Script

Usage: node scripts/build-release.js [options]

Options:
  --all-platforms     Build for all supported platforms (Windows, macOS, Linux)
  --platform <name>   Build for specific platform (win32, darwin, linux)
  --no-archives       Don't create ZIP archives of built apps
  --skip-react-build  Skip React client build (use existing build)
  --help              Show this help message

Examples:
  node scripts/build-release.js                    # Build for current platform
  node scripts/build-release.js --all-platforms    # Build for all platforms
  node scripts/build-release.js --platform win32   # Build for Windows only
  node scripts/build-release.js --no-archives      # Build without creating archives
`);
    process.exit(0);
  }

  buildRelease(options).catch(console.error);
}

module.exports = { buildRelease, BUILD_CONFIGS };
