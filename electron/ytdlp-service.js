const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs").promises;
const { EventEmitter } = require("events");
const os = require("os");

class YtDlpService extends EventEmitter {
  constructor(outputDir) {
    super();
    this.outputDir = outputDir;
    this.activeDownloads = new Map();
    this.ytdlpPath = this.getYtDlpPath();
    this.ffmpegPath = this.getFfmpegPath();
  }

  /**
   * Get the path to the bundled yt-dlp binary based on the current platform
   * @returns {string} Path to yt-dlp binary
   */
  getYtDlpPath() {
    const platform = os.platform();
    const binariesDir = path.join(__dirname, "binaries");

    let platformDir, filename;

    switch (platform) {
      case "win32":
        platformDir = "win32";
        filename = "yt-dlp.exe";
        break;
      case "darwin":
        platformDir = "darwin";
        filename = "yt-dlp";
        break;
      case "linux":
        platformDir = "linux";
        filename = "yt-dlp";
        break;
      default:
        // Fallback to system yt-dlp if platform not supported
        return "yt-dlp";
    }

    const binaryPath = path.join(binariesDir, platformDir, filename);

    // Check if bundled binary exists, otherwise fallback to system yt-dlp
    try {
      require("fs").accessSync(binaryPath, require("fs").constants.F_OK);
      return binaryPath;
    } catch (error) {
      console.warn(
        `Bundled yt-dlp not found at ${binaryPath}, falling back to system yt-dlp`
      );
      return "yt-dlp";
    }
  }

  /**
   * Get the path to the bundled FFmpeg binary based on the current platform
   * @returns {string} Path to FFmpeg binary
   */
  getFfmpegPath() {
    const platform = os.platform();
    const binariesDir = path.join(__dirname, "binaries");
    
    let platformDir, filename;
    
    switch (platform) {
      case "win32":
        platformDir = "win32";
        filename = "ffmpeg.exe";
        break;
      case "darwin":
        platformDir = "darwin";
        filename = "ffmpeg";
        break;
      case "linux":
        platformDir = "linux";
        filename = "ffmpeg";
        break;
      default:
        // Fallback to system ffmpeg if platform not supported
        return "ffmpeg";
    }
    
    const binaryPath = path.join(binariesDir, platformDir, filename);
    
    // Check if bundled binary exists, otherwise fallback to system ffmpeg
    try {
      require("fs").accessSync(binaryPath, require("fs").constants.F_OK);
      return binaryPath;
    } catch (error) {
      console.warn(
        `Bundled FFmpeg not found at ${binaryPath}, falling back to system ffmpeg`
      );
      return "ffmpeg";
    }
  }

  /**
   * Get video/audio info without downloading
   * @param {string} url - YouTube URL or other supported URL
   * @returns {Promise<Object>} Video information
   */
  async getVideoInfo(url) {
    return new Promise((resolve, reject) => {
      const args = ["--dump-json", "--no-download", "--no-warnings", url];

      const ytdlp = spawn(this.ytdlpPath, args, {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      ytdlp.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      ytdlp.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      ytdlp.on("close", (code) => {
        if (code === 0) {
          try {
            const info = JSON.parse(stdout);
            resolve({
              title: info.title,
              duration: info.duration,
              uploader: info.uploader,
              thumbnail: info.thumbnail,
              formats:
                info.formats?.map((f) => ({
                  format_id: f.format_id,
                  ext: f.ext,
                  quality: f.quality,
                  filesize: f.filesize,
                  acodec: f.acodec,
                  vcodec: f.vcodec,
                })) || [],
            });
          } catch (error) {
            reject(new Error(`Failed to parse video info: ${error.message}`));
          }
        } else {
          reject(new Error(`yt-dlp failed: ${stderr || "Unknown error"}`));
        }
      });

      ytdlp.on("error", (error) => {
        reject(new Error(`Failed to spawn yt-dlp: ${error.message}`));
      });
    });
  }

  /**
   * Download video or audio
   * @param {string} url - YouTube URL or other supported URL
   * @param {Object} options - Download options
   * @returns {Promise<Object>} Download result
   */
  async download(url, options = {}) {
    const {
      format = "best",
      audioOnly = false,
      quality = "best",
      outputTemplate = "%(title)s.%(ext)s",
    } = options;

    const downloadId = Date.now().toString();
    const outputPath = path.join(this.outputDir, outputTemplate);

    return new Promise((resolve, reject) => {
      const args = [
        "--no-warnings",
        "--progress",
        "--newline",
        "--ffmpeg-location",
        this.ffmpegPath,
        "-o",
        outputPath,
      ];

      if (audioOnly) {
        args.push("--extract-audio");
        args.push("--audio-format", "mp3");
        args.push("--audio-quality", quality === "best" ? "0" : quality);
      } else {
        if (format !== "best") {
          args.push("-f", format);
        }
      }

      args.push(url);

      const ytdlp = spawn(this.ytdlpPath, args, {
        stdio: ["pipe", "pipe", "pipe"],
      });

      this.activeDownloads.set(downloadId, ytdlp);

      let stderr = "";
      let lastProgress = null;

      ytdlp.stdout.on("data", (data) => {
        const output = data.toString();

        // Parse progress information
        const progressMatch = output.match(/\[download\]\s+(\d+\.?\d*)%/);
        if (progressMatch) {
          const progress = parseFloat(progressMatch[1]);
          if (progress !== lastProgress) {
            lastProgress = progress;
            this.emit("progress", {
              downloadId,
              progress,
              url,
            });
          }
        }

        // Check for completion
        if (
          output.includes("[download] 100%") ||
          output.includes("has already been downloaded")
        ) {
          this.emit("progress", {
            downloadId,
            progress: 100,
            url,
          });
        }
      });

      ytdlp.stderr.on("data", (data) => {
        stderr += data.toString();

        // Also check stderr for progress (some versions output there)
        const progressMatch = stderr.match(/(\d+\.?\d*)%/);
        if (progressMatch) {
          const progress = parseFloat(progressMatch[1]);
          if (progress !== lastProgress) {
            lastProgress = progress;
            this.emit("progress", {
              downloadId,
              progress,
              url,
            });
          }
        }
      });

      ytdlp.on("close", async (code) => {
        this.activeDownloads.delete(downloadId);

        if (code === 0) {
          try {
            // Find the downloaded file
            const files = await fs.readdir(this.outputDir);
            const downloadedFile = files.find(
              (file) =>
                file.includes(outputTemplate.split(".")[0]) ||
                file.endsWith(".mp3") ||
                file.endsWith(".mp4") ||
                file.endsWith(".webm")
            );

            if (downloadedFile) {
              const filePath = path.join(this.outputDir, downloadedFile);
              const stats = await fs.stat(filePath);

              resolve({
                success: true,
                downloadId,
                filePath,
                fileName: downloadedFile,
                fileSize: stats.size,
                url,
              });
            } else {
              reject(new Error("Downloaded file not found"));
            }
          } catch (error) {
            reject(new Error(`Post-download error: ${error.message}`));
          }
        } else {
          reject(new Error(`Download failed: ${stderr || "Unknown error"}`));
        }
      });

      ytdlp.on("error", (error) => {
        this.activeDownloads.delete(downloadId);
        reject(new Error(`Failed to spawn yt-dlp: ${error.message}`));
      });
    });
  }

  /**
   * Cancel an active download
   * @param {string} downloadId - Download ID to cancel
   */
  cancelDownload(downloadId) {
    const process = this.activeDownloads.get(downloadId);
    if (process) {
      process.kill("SIGTERM");
      this.activeDownloads.delete(downloadId);
      return true;
    }
    return false;
  }

  /**
   * Get list of active downloads
   * @returns {Array<string>} Array of active download IDs
   */
  getActiveDownloads() {
    return Array.from(this.activeDownloads.keys());
  }

  /**
   * Check if yt-dlp is available
   * @returns {Promise<boolean>} Whether yt-dlp is available
   */
  async checkAvailability() {
    return new Promise((resolve) => {
      const ytdlp = spawn(this.ytdlpPath, ["--version"], {
        stdio: ["pipe", "pipe", "pipe"],
      });

      ytdlp.on("close", (code) => {
        resolve(code === 0);
      });

      ytdlp.on("error", () => {
        resolve(false);
      });
    });
  }
}

module.exports = YtDlpService;
