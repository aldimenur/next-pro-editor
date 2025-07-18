import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import SoundPlayer from "./components/SoundPlayer";
import VideoPlayer from "./components/VideoPlayer";
import LeftNavigation from "./components/LeftNavigation";
import { LuFolderSearch, LuTrash, LuX, LuCheck } from "react-icons/lu";

function ConfirmationModal({ isOpen, onClose, onConfirm, fileName }) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
    >
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-bold text-gray-900 mb-4">
            Confirm File Deletion
          </Dialog.Title>
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete the file:{" "}
            <span className="font-semibold">{fileName}</span>?
            <br />
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-300 flex items-center"
            >
              <LuX className="mr-2" /> Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 flex items-center"
            >
              <LuCheck className="mr-2" /> Delete
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

function App() {
  const [activeSection, setActiveSection] = useState("sfx");
  const [sounds, setSounds] = useState([]);
  const [videos, setVideos] = useState([]);
  const [music, setMusic] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [soundsTotalPages, setSoundsTotalPages] = useState(1);
  const [videosTotalPages, setVideosTotalPages] = useState(1);
  const [musicTotalPages, setMusicTotalPages] = useState(1);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [gridColumns, setGridColumns] = useState(3);
  const [limit, setLimit] = useState(6);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    document.title = "Next Pro Editor";
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsNavCollapsed(true);
      } else {
        setIsNavCollapsed(false);
      }
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Initial check
    handleResize();

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const fetchSounds = async () => {
    try {
      const data = await window.electronAPI.getSoundEffects({
        page,
        limit,
        search: searchTerm,
      });
      setSounds(data.files || []);
      setSoundsTotalPages(data.totalPages || 1);
    } catch (error) {
      setErrorMessage(`Failed to fetch sound effects: ${error.message}`);
    }
  };

  const fetchVideos = async () => {
    try {
      const data = await window.electronAPI.getVideoEffects({
        page,
        limit,
        search: searchTerm,
      });
      setVideos(data.files || []);
      setVideosTotalPages(data.totalPages || 1);
    } catch (error) {
      setErrorMessage(`Failed to fetch video effects: ${error.message}`);
    }
  };

  const fetchMusic = async () => {
    try {
      const data = await window.electronAPI.getMusic({
        page,
        limit,
        search: searchTerm,
      });
      setMusic(data.files || []);
      setMusicTotalPages(data.totalPages || 1);
    } catch (error) {
      setErrorMessage(`Failed to fetch music: ${error.message}`);
    }
  };

  const deleteFile = async (filePath, fileName) => {
    setConfirmDelete({ filePath, fileName });
  };

  const confirmFileDelete = async () => {
    if (!confirmDelete) return;

    try {
      await window.electronAPI.deleteFile(confirmDelete.filePath);
      setSounds(
        sounds.filter((sound) => sound.filePath !== confirmDelete.filePath)
      );
      setVideos(
        videos.filter((video) => video.filePath !== confirmDelete.filePath)
      );
      setMusic(
        music.filter((music) => music.filePath !== confirmDelete.filePath)
      );
      setConfirmDelete(null);
    } catch (error) {
      setErrorMessage(`Error deleting file: ${error.message}`);
      console.error("Error deleting file:", error);
    }
  };
  // Fetch on initial render and whenever page/searchTerm/activeSection changes
  useEffect(() => {
    fetchSounds();
    if (activeSection === "vfx") {
      fetchVideos();
    }
    if (activeSection === "music") {
      fetchMusic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, activeSection, gridColumns]);

  // Grid column control handlers
  const increaseGridColumns = () => {
    setGridColumns(Math.min(gridColumns + 1, 6)); // Max 6 columns
    setLimit(Math.min(limit + 5, 20));
  };

  const decreaseGridColumns = () => {
    setGridColumns(Math.max(gridColumns - 1, 1)); // Min 1 column
    setLimit(Math.max(limit - 5, 5));
  };

  return (
    <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen font-sans">
      {/* Confirmation Modal */}
      {confirmDelete && (
        <ConfirmationModal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={confirmFileDelete}
          fileName={confirmDelete.fileName}
        />
      )}

      {/* Error Toast */}
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

      {/* Left Navigation */}
      <LeftNavigation
        isNavCollapsed={isNavCollapsed}
        setIsNavCollapsed={setIsNavCollapsed}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        increaseGridColumns={increaseGridColumns}
        decreaseGridColumns={decreaseGridColumns}
        gridColumns={gridColumns}
      />

      {/* Main Content Area */}
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
          {/* Search Input */}
          <div className="mb-3">
            <input
              type="text"
              placeholder={`Search ${activeSection.toUpperCase()} files...`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // reset to first page when searching
              }}
              className="w-full p-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>

          <div className="flex-1 flex flex-col h-full overflow-y-auto">
            {/* Media Grid */}
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
                      window.electronAPI.onDragStart(sound.filePath);
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
                              window.electronAPI.openFileLocation(
                                sound.filePath
                              );
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
                      window.electronAPI.onDragStart(video.filePath);
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
                              window.electronAPI.openFileLocation(
                                video.filePath
                              );
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
                      window.electronAPI.onDragStart(music.filePath);
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
                              window.electronAPI.openFileLocation(
                                music.filePath
                              );
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
          </div>
          {/* Pagination Controls */}
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
        </div>
      </div>
    </div>
  );
}

export default App;
