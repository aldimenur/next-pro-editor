const https = require("https");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");

// yt-dlp and FFmpeg release URLs
const YTDLP_RELEASES = {
  win32: {
    url: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe",
    filename: "yt-dlp.exe",
  },
  linux: {
    url: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp",
    filename: "yt-dlp",
  },
  darwin: {
    url: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos",
    filename: "yt-dlp",
  },
};

const FFMPEG_RELEASES = {
  win32: {
    url: "https://www.gyan.dev/ffmpeg/builds/packages/ffmpeg-7.1.1-essentials_build.zip",
    filename: "ffmpeg-7.1.1-essentials_build.zip",
    extractedBinary: "ffmpeg.exe",
    isArchive: true,
  },
  linux: {
    url: "https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz",
    filename: "ffmpeg-release-amd64-static.tar.xz",
    extractedBinary: "ffmpeg",
    isArchive: true,
  },
  darwin: {
    url: "https://evermeet.cx/ffmpeg/ffmpeg-6.1.zip",
    filename: "ffmpeg-6.1.zip",
    extractedBinary: "ffmpeg",
    isArchive: true,
  },
};

const BINARIES_DIR = path.join(__dirname, "..", "electron", "binaries");

function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Downloading ${url}...`);

    const file = fs.createWriteStream(destination);

    https
      .get(url, (response) => {
        // Handle redirects
        if (response.statusCode === 302 || response.statusCode === 301) {
          return downloadFile(response.headers.location, destination)
            .then(resolve)
            .catch(reject);
        }

        if (response.statusCode !== 200) {
          reject(
            new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`)
          );
          return;
        }

        const totalSize = parseInt(response.headers["content-length"] || "0");
        let downloadedSize = 0;

        response.on("data", (chunk) => {
          downloadedSize += chunk.length;
          if (totalSize > 0) {
            const progress = ((downloadedSize / totalSize) * 100).toFixed(1);
            process.stdout.write(
              `\r   Progress: ${progress}% (${Math.round(
                downloadedSize / 1024 / 1024
              )} MB)`
            );
          }
        });

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          console.log(
            `\n✅ Downloaded successfully: ${path.basename(destination)}`
          );
          resolve();
        });

        file.on("error", (err) => {
          fs.unlink(destination, () => {}); // Delete partial file
          reject(err);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

function extractArchive(archivePath, extractDir, expectedBinary) {
  const archiveExt = path.extname(archivePath).toLowerCase();
  const platform = os.platform();
  
  console.log(`📦 Extracting ${path.basename(archivePath)}...`);
  
  try {
    // Create extraction directory
    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true });
    }
    
    if (archiveExt === '.zip') {
      // Handle ZIP files
      if (platform === 'win32') {
        // Use PowerShell on Windows
        execSync(`powershell -command "Expand-Archive -Path '${archivePath}' -DestinationPath '${extractDir}' -Force"`, { stdio: 'pipe' });
      } else {
        // Use unzip on Unix systems
        execSync(`unzip -o "${archivePath}" -d "${extractDir}"`, { stdio: 'pipe' });
      }
    } else if (archivePath.includes('.tar.xz')) {
      // Handle tar.xz files using 7z
      if (platform === "win32") {
        // Use 7z on Windows - extract twice (first .xz, then .tar)
        execSync(`7z x "${archivePath}" -o"${extractDir}" -y`, {
          stdio: "pipe",
        });
        const tarFile = path.join(
          extractDir,
          path.basename(archivePath, ".xz")
        );
        execSync(`7z x "${tarFile}" -o"${extractDir}" -y`, { stdio: "pipe" });
        // Clean up intermediate tar file
        if (fs.existsSync(tarFile)) {
          fs.unlinkSync(tarFile);
        }
      } else {
        // Use 7z on Unix systems - extract directly
        execSync(`7z x "${archivePath}" -o"${extractDir}" -y`, {
          stdio: "pipe",
        });
        // Find and extract the tar file
        const files = fs.readdirSync(extractDir);
        const tarFile = files.find((f) => f.endsWith(".tar"));
        if (tarFile) {
          const tarPath = path.join(extractDir, tarFile);
          execSync(`7z x "${tarPath}" -o"${extractDir}" -y`, { stdio: "pipe" });
          fs.unlinkSync(tarPath);
        }
      }
    }
    
    // Find the binary in the extracted files
    const findBinary = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          const result = findBinary(itemPath);
          if (result) return result;
        } else if (item === expectedBinary || 
                  (expectedBinary === 'ffmpeg.exe' && item === 'ffmpeg.exe') ||
                  (expectedBinary === 'ffmpeg' && (item === 'ffmpeg' || item.startsWith('ffmpeg'))) ||
                  item.startsWith('yt-dlp')) {
          return itemPath;
        }
      }
      return null;
    };
    
    const binaryPath = findBinary(extractDir);
    if (binaryPath) {
      const finalPath = path.join(path.dirname(extractDir), expectedBinary);
      
      // Move binary to the correct location
      fs.copyFileSync(binaryPath, finalPath);
      
      // Make executable on Unix systems
      if (platform !== 'win32') {
        fs.chmodSync(finalPath, 0o755);
      }
      
      // Clean up extracted files
      fs.rmSync(extractDir, { recursive: true, force: true });
      
      console.log(`✅ Extracted and installed: ${expectedBinary}`);
      return finalPath;
    } else {
      throw new Error(`Binary ${expectedBinary} not found in archive`);
    }
  } catch (error) {
    console.error(`❌ Extraction failed: ${error.message}`);
    // Clean up on failure
    if (fs.existsSync(extractDir)) {
      fs.rmSync(extractDir, { recursive: true, force: true });
    }
    throw error;
  }
}

async function downloadAndExtractBinary(config, platformDir, binaryName) {
  const destination = path.join(platformDir, config.filename);
  const finalBinary = path.join(platformDir, config.extractedBinary || binaryName);
  
  // Skip if final binary already exists and is not empty
  if (fs.existsSync(finalBinary)) {
    const stats = fs.statSync(finalBinary);
    if (stats.size > 0) {
      console.log(
        `⏭️  Skipping ${binaryName} - already exists (${Math.round(
          stats.size / 1024 / 1024
        )} MB)`
      );
      return;
    }
  }
  
  try {
    await downloadFile(config.url, destination);
    
    if (config.isArchive) {
      const extractDir = path.join(platformDir, 'temp_extract');
      await extractArchive(destination, extractDir, config.extractedBinary);
      
      // Clean up downloaded archive
      fs.unlinkSync(destination);
    } else {
      // Make executable on Unix-like systems
      if (os.platform() !== 'win32') {
        fs.chmodSync(destination, 0o755);
        console.log(`🔧 Made executable: ${config.filename}`);
      }
    }
    
    console.log('');
  } catch (error) {
    console.error(`❌ Failed to download ${binaryName}:`, error.message);
    console.log('');
  }
}

async function downloadYtDlpBinaries() {
  console.log("🎬 Next Pro Editor - yt-dlp & FFmpeg Binary Downloader");
  console.log("======================================================");
  console.log("");

  // Ensure binaries directory exists
  if (!fs.existsSync(BINARIES_DIR)) {
    fs.mkdirSync(BINARIES_DIR, { recursive: true });
  }

  // Download yt-dlp binaries
  console.log("📥 Downloading yt-dlp binaries...");
  for (const [platform, config] of Object.entries(YTDLP_RELEASES)) {
    const platformDir = path.join(BINARIES_DIR, platform);

    // Create platform directory if it doesn't exist
    if (!fs.existsSync(platformDir)) {
      fs.mkdirSync(platformDir, { recursive: true });
    }

    await downloadAndExtractBinary(config, platformDir, `yt-dlp (${platform})`);
  }

  console.log("📥 Downloading FFmpeg binaries...");
  // Download FFmpeg binaries
  for (const [platform, config] of Object.entries(FFMPEG_RELEASES)) {
    const platformDir = path.join(BINARIES_DIR, platform);

    // Create platform directory if it doesn't exist
    if (!fs.existsSync(platformDir)) {
      fs.mkdirSync(platformDir, { recursive: true });
    }

    await downloadAndExtractBinary(config, platformDir, `FFmpeg (${platform})`);
  }

  console.log("🎉 yt-dlp & FFmpeg binary download completed!");
  console.log("");
  console.log("📋 What's included:");
  console.log("  ✅ yt-dlp - Video/audio downloader");
  console.log("  ✅ FFmpeg - Video/audio processing");
  console.log("  ✅ Cross-platform binaries (Windows, Linux, macOS)");
  console.log("");
  console.log("📋 Next steps:");
  console.log("  1. The binaries are now bundled with your app");
  console.log("  2. Run your app - no external installation needed!");
  console.log("  3. When you build/package the app, binaries will be included");
  console.log("");
}

// Run if called directly
if (require.main === module) {
  downloadYtDlpBinaries().catch(console.error);
}

module.exports = { downloadYtDlpBinaries };
