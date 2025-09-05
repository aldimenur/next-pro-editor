import React, { useState, useEffect, useCallback } from "react";
import { LuDownload, LuX, LuInfo } from "react-icons/lu";

const YtDlpDownloader = ({ onDownloadComplete }) => {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [message, setMessage] = useState(null);
  const [ytdlpAvailable, setYtdlpAvailable] = useState(null); // null = checking, false = not available, true = available
  const [downloadOptions, setDownloadOptions] = useState({
    audioOnly: false,
    quality: "best",
    assetType: "music",
  });

  const checkYtdlpAvailability = async () => {
    try {
      const result = await window.electronAPI.ytdlpCheckAvailability();
      setYtdlpAvailable(result.available);
      if (!result.available) {
        setMessage({
          type: "error",
          text: "yt-dlp is not installed. Please install yt-dlp to use this feature.",
        });
      }
    } catch (error) {
      setYtdlpAvailable(false);
      setMessage({
        type: "error",
        text: "Failed to check yt-dlp availability",
      });
    }
  };

  const setupProgressListener = useCallback(() => {
    window.electronAPI.onYtdlpProgress((progressData) => {
      setDownloadProgress(progressData.progress);
      if (progressData.progress >= 100) {
        setDownloading(false);
        setMessage({
          type: "success",
          text: "Download completed successfully!",
        });
        if (onDownloadComplete) {
          onDownloadComplete();
        }
      }
    });
  }, [onDownloadComplete]);

  // Check yt-dlp availability on mount
  useEffect(() => {
    checkYtdlpAvailability();
    setupProgressListener();

    return () => {
      window.electronAPI.removeYtdlpProgressListener();
    };
  }, [setupProgressListener]);

  const getVideoInfo = async () => {
    if (!url.trim()) {
      setMessage({ type: "error", text: "Please enter a valid URL" });
      return;
    }

    setLoading(true);
    setMessage(null);
    setVideoInfo(null);

    try {
      const result = await window.electronAPI.ytdlpGetVideoInfo(url.trim());
      if (result.success) {
        setVideoInfo(result.info);
        setMessage({
          type: "success",
          text: "Video information loaded successfully",
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to get video information",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to get video information" });
    } finally {
      setLoading(false);
    }
  };

  const startDownload = async () => {
    if (!videoInfo) {
      await getVideoInfo();
      if (!videoInfo) return;
    }

    setDownloading(true);
    setDownloadProgress(0);
    setMessage({ type: "info", text: "Starting download..." });

    try {
      const options = {
        ...downloadOptions,
        outputTemplate: `%(title)s.%(ext)s`,
      };

      const result = await window.electronAPI.ytdlpDownload(
        url.trim(),
        options
      );

      if (result.success) {
        setMessage({
          type: "success",
          text: result.imported
            ? `Downloaded and imported to ${result.assetType} successfully!`
            : "Downloaded successfully!",
        });

        // Reset form
        setUrl("");
        setVideoInfo(null);

        if (onDownloadComplete) {
          onDownloadComplete();
        }
      } else {
        setMessage({ type: "error", text: result.error || "Download failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Download failed" });
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  const cancelDownload = async () => {
    // This would need the download ID - for now just reset state
    setDownloading(false);
    setDownloadProgress(0);
    setMessage({ type: "info", text: "Download cancelled" });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "Unknown";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="flex flex-col h-full w-full p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center mb-4">
        <div className="w-6 h-6 bg-gray-300 rounded mr-2"></div>
        <div className="h-6 bg-gray-300 rounded w-64"></div>
      </div>

      {/* URL Input skeleton */}
      <div className="mb-4">
        <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-gray-300 rounded-md"></div>
          <div className="w-10 h-10 bg-gray-300 rounded-md"></div>
        </div>
      </div>

      {/* Download Options skeleton */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="h-5 bg-gray-300 rounded w-32 mb-3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-8 bg-gray-300 rounded"></div>
          <div className="h-8 bg-gray-300 rounded"></div>
          <div className="h-8 bg-gray-300 rounded"></div>
        </div>
      </div>

      {/* Action buttons skeleton */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 h-10 bg-gray-300 rounded-md"></div>
        <div className="w-20 h-10 bg-gray-300 rounded-md"></div>
      </div>

      {/* Footer skeleton */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-3/4"></div>
      </div>
    </div>
  );

  // Show loading skeleton while checking availability
  if (ytdlpAvailable === null) {
    return <LoadingSkeleton />;
  }

  // Show error state if yt-dlp is not available
  if (ytdlpAvailable === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-6">
        <div className="text-center">
          <LuX className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2 text-gray-800">
            yt-dlp Not Available
          </h2>
          <p className="text-gray-600 mb-4">
            The bundled yt-dlp binary is not working properly.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg text-left">
            <h3 className="font-semibold mb-2">Troubleshooting:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Try restarting the application</li>
              <li>Check if you have sufficient permissions</li>
              <li>If the problem persists, install yt-dlp manually:</li>
              <li className="ml-4">
                Visit{" "}
                <a
                  href="https://github.com/yt-dlp/yt-dlp"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  yt-dlp GitHub
                </a>
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
        <LuDownload className="mr-2" />
        YouTube & Video Downloader
      </h2>

      {/* URL Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video URL
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading || downloading}
          />
          <button
            onClick={getVideoInfo}
            disabled={loading || downloading || !url.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <LuInfo className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Download Options */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-3">Download Options</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={downloadOptions.audioOnly}
                onChange={(e) =>
                  setDownloadOptions((prev) => ({
                    ...prev,
                    audioOnly: e.target.checked,
                    assetType: e.target.checked ? "music" : "vfx",
                  }))
                }
                className="rounded"
              />
              <span className="text-sm">Audio Only (MP3)</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quality
            </label>
            <select
              value={downloadOptions.quality}
              onChange={(e) =>
                setDownloadOptions((prev) => ({
                  ...prev,
                  quality: e.target.value,
                }))
              }
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="best">Best Quality</option>
              <option value="worst">Smallest Size</option>
              <option value="720">720p</option>
              <option value="480">480p</option>
              <option value="360">360p</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Import As
            </label>
            <select
              value={downloadOptions.assetType}
              onChange={(e) =>
                setDownloadOptions((prev) => ({
                  ...prev,
                  assetType: e.target.value,
                }))
              }
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="music">Music</option>
              <option value="sfx">Sound Effect</option>
              <option value="vfx">Video</option>
            </select>
          </div>
        </div>
      </div>

      {/* Video Info */}
      {loading && (
        <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg animate-pulse">
          <div className="flex items-start space-x-4">
            <div className="w-24 h-18 bg-gray-300 rounded"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-300 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded mb-1 w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      )}
      {videoInfo && !loading && (
        <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-start space-x-4">
            {videoInfo.thumbnail && (
              <img
                src={videoInfo.thumbnail}
                alt="Video thumbnail"
                className="w-24 h-18 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{videoInfo.title}</h3>
              <p className="text-gray-600 text-sm mb-1">
                by {videoInfo.uploader}
              </p>
              <p className="text-gray-500 text-sm">
                Duration: {formatDuration(videoInfo.duration)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Download Progress */}
      {downloading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">
              Downloading...
            </span>
            <span className="text-sm text-blue-600">
              {downloadProgress.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress}%` }}
            ></div>
          </div>
          <button
            onClick={cancelDownload}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Cancel Download
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={startDownload}
          disabled={!url.trim() || downloading}
          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {downloading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Downloading...
            </>
          ) : (
            <>
              <LuDownload className="mr-2 h-4 w-4" />
              Download {downloadOptions.audioOnly ? "Audio" : "Video"}
            </>
          )}
        </button>

        {videoInfo && (
          <button
            onClick={() => {
              setVideoInfo(null);
              setUrl("");
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : message.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Supported Sites Info */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500">
            Supported sites include YouTube, Vimeo, Twitter, TikTok, Instagram,
            and many more.
          </p>
          <div className="flex items-center text-xs text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            Bundled yt-dlp
          </div>
        </div>
        <p className="text-xs text-gray-400">
          Downloaded content will be automatically imported to your selected
          asset category.
        </p>
      </div>
    </div>
  );
};

export default YtDlpDownloader;
