import { useState, useEffect } from "react";
import useAssets from "./hooks/useAssets";
import {
  deleteFile as deleteFileService,
  onDragStart as onDragStartService,
  openFileLocation as openFileLocationService,
} from "./services/assetService";
import SoundPlayer from "./components/SoundPlayer";
import VideoPlayer from "./components/VideoPlayer";
import AddAsset from "./components/AddAsset";
import LeftNavigation from "./components/LeftNavigation";
import { LuFolderSearch, LuTrash, LuX } from "react-icons/lu";
import ConfirmationDialog from "./components/ConfirmationDialog";

function App() {
  const [activeSection, setActiveSection] = useState("sfx");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [gridColumns, setGridColumns] = useState(3);
  const [limit, setLimit] = useState(6);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const {
    files: sounds,
    totalPages: soundsTotalPages,
    refetch: refetchSounds,
  } = useAssets("sfx", { page, limit, search: searchTerm });
  const {
    files: videos,
    totalPages: videosTotalPages,
    refetch: refetchVideos,
  } = useAssets("vfx", { page, limit, search: searchTerm });
  const {
    files: music,
    totalPages: musicTotalPages,
    refetch: refetchMusic,
  } = useAssets("music", { page, limit, search: searchTerm });

  useEffect(() => {
    document.title = "Next Pro Editor";
  }, []);

  const deleteFile = async (filePath, fileName) => {
    setConfirmDelete({ filePath, fileName });
  };

  const confirmFileDelete = async () => {
    if (!confirmDelete) return;

    try {
      await deleteFileService(confirmDelete.filePath);
      refetchSounds();
      refetchVideos();
      refetchMusic();
      setConfirmDelete(null);
    } catch (error) {
      setErrorMessage(`Error deleting file: ${error.message}`);
      console.error("Error deleting file:", error);
    }
  };

  const increaseGridColumns = () => {
    setGridColumns(Math.min(gridColumns + 1, 6));
    setLimit(Math.min(limit + 5, 20));
  };

  const decreaseGridColumns = () => {
    setGridColumns(Math.max(gridColumns - 1, 1));
    setLimit(Math.max(limit - 5, 5));
  };

  return (
    <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen font-sans">
      {confirmDelete && (
        <ConfirmationDialog
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={confirmFileDelete}
          fileName={confirmDelete.fileName}
        />
      )}

      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
          <span className="mr-2">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-white hover:text-red-100"
          >
            <LuX />
          </button>
        </div>
      )}

      <LeftNavigation
        isNavCollapsed={isNavCollapsed}
        setIsNavCollapsed={setIsNavCollapsed}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        increaseGridColumns={increaseGridColumns}
        decreaseGridColumns={decreaseGridColumns}
        gridColumns={gridColumns}
      />

      <div
        className={`
          flex-1
          p-2
          overflow-y-auto
          h-screen
          transition-all
          duration-300
          ease-in-out
          ${isNavCollapsed ? "ml-0" : "ml-0"}
        `}
      >
        <div className="mx-auto bg-white shadow-lg rounded-xl p-6 flex flex-col h-full">
          {activeSection !== "upload" && (
            <div className="mb-3">
              <input
                type="text"
                placeholder={`Search ${activeSection.toUpperCase()} files...`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full p-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
            </div>
          )}

          <div className="flex-1 flex flex-col h-full overflow-y-auto">
            {activeSection === "upload" ? (
              <AddAsset
                onUploadSuccess={() => {
                  refetchSounds();
                  refetchVideos();
                  refetchMusic();
                }}
              />
            ) : (
              <div
                className={`grid gap-4 mb-6 relative w-full box-border flex-1`}
                style={{
                  gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
                }}
              >
                {activeSection === "sfx" &&
                  sounds.map((sound, index) => (
                    <div
                      key={index}
                      className="h-fit bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-md transition duration-300 ease-in-out transform cursor-pointer min-w-0"
                      draggable
                      onDragStart={(e) => {
                        e.preventDefault();
                        onDragStartService(sound.filePath);
                      }}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium text-gray-800 truncate text-sm">
                          {sound.fileName}
                        </p>
                        <div className="absolute right-2 bottom-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                openFileLocationService(sound.filePath);
                              }}
                              className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center"
                            >
                              <LuFolderSearch className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                deleteFile(sound.filePath, sound.fileName)
                              }
                              className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center justify-center"
                            >
                              <LuTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-2 mb-2 bg-white hover:border-red-500 onk transition duration-300 ease-in-out">
                        <SoundPlayer filePath={sound.filePath} />
                      </div>
                    </div>
                  ))}
                {activeSection === "vfx" &&
                  videos.map((video, index) => (
                    <div
                      key={index}
                      className="h-fit bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-md transition duration-300 ease-in-out transform cursor-pointer min-w-0"
                      draggable
                      onDragStart={(e) => {
                        e.preventDefault();
                        onDragStartService(video.filePath);
                      }}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium text-gray-800 truncate text-sm">
                          {video.fileName}
                        </p>
                        <div className="absolute right-2 bottom-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                openFileLocationService(video.filePath);
                              }}
                              className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center"
                            >
                              <LuFolderSearch className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                deleteFile(video.filePath, video.fileName)
                              }
                              className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center justify-center"
                            >
                              <LuTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-2 mb-2 bg-white hover:border-red-500 onk transition duration-300 ease-in-out">
                        <VideoPlayer filePath={video.filePath} />
                      </div>
                    </div>
                  ))}
                {activeSection === "music" &&
                  music.map((music, index) => (
                    <div
                      key={index}
                      className="h-fit bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-md transition duration-300 ease-in-out transform cursor-pointer min-w-0"
                      draggable
                      onDragStart={(e) => {
                        e.preventDefault();
                        onDragStartService(music.filePath);
                      }}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium text-gray-800 truncate text-sm">
                          {music.fileName}
                        </p>
                        <div className="absolute right-2 bottom-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                openFileLocationService(music.filePath);
                              }}
                              className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center"
                            >
                              <LuFolderSearch className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                deleteFile(music.filePath, music.fileName)
                              }
                              className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center justify-center"
                            >
                              <LuTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-2 mb-2 bg-white hover:border-red-500 onk transition duration-300 ease-in-out">
                        <SoundPlayer filePath={music.filePath} />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
          {activeSection !== "upload" && (
            <div className="flex justify-center items-center space-x-4 mt-3">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition duration-300"
              >
                Prev
              </button>
              <span className="text-gray-600 text-sm">
                Page {page} of{" "}
                {activeSection === "sfx"
                  ? soundsTotalPages
                  : activeSection === "vfx"
                  ? videosTotalPages
                  : musicTotalPages}
              </span>
              <button
                onClick={() =>
                  setPage((p) =>
                    Math.min(
                      p + 1,
                      activeSection === "sfx"
                        ? soundsTotalPages
                        : activeSection === "vfx"
                        ? videosTotalPages
                        : musicTotalPages
                    )
                  )
                }
                disabled={
                  page ===
                  (activeSection === "sfx"
                    ? soundsTotalPages
                    : activeSection === "vfx"
                    ? videosTotalPages
                    : musicTotalPages)
                }
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition duration-300"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
