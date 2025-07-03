import { useState, useEffect } from "react";
import SoundPlayer from "./components/SoundPlayer";
import VideoPlayer from "./components/VideoPlayer";

function App() {
  // Updated state to include media types and active section
  const [activeSection, setActiveSection] = useState("sfx");
  const [sounds, setSounds] = useState([]);
  const [videos, setVideos] = useState([]);
  const [music, setMusic] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchSounds = async () => {
    const data = await window.electronAPI.getSoundEffects({
      page,
      limit,
      search: searchTerm,
    });
    setSounds(data.files || []);
    setTotalPages(data.totalPages || 1);
  };

  const fetchVideos = async () => {
    const data = await window.electronAPI.getVideoEffects({
      page,
      limit,
      search: searchTerm,
    });
    setVideos(data.files || []);
    setTotalPages(data.totalPages || 1);
  };

  const fetchMusic = async () => {
    const data = await window.electronAPI.getMusic({
      page,
      limit,
      search: searchTerm,
    });
    setMusic(data.files || []);
    setTotalPages(data.totalPages || 1);
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
  }, [page, searchTerm, activeSection]);

  // Navigation sections
  const sections = [
    { id: "sfx", label: "Sound Effects" },
    { id: "vfx", label: "Video Effects" },
    { id: "music", label: "Music" },
  ];

  return (
    <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen font-sans">
      {/* Left Navigation */}
      <div className="w-64 bg-white shadow-lg p-6 border-r">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Media Library</h1>
        <nav>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                setPage(1);
                setSearchTerm(""); // Reset search when changing section
              }}
              className={`w-full text-left p-3 rounded-lg mb-2 transition duration-300 ${
                activeSection === section.id
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
            {sections.find((s) => s.id === activeSection)?.label ||
              "Media Library"}
          </h2>

          {/* Search Input */}
          <div className="mb-6">
            <input
              type="text"
              placeholder={`Search ${activeSection.toUpperCase()} files...`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // reset to first page when searching
              }}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>

          <>
            {/* Media Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {activeSection === "sfx" &&
                sounds.map((sound, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer"
                    draggable
                    onDragStart={(e) => {
                      e.preventDefault();
                      window.electronAPI.onDragStart(sound.filePath);
                    }}
                  >
                    <p className="font-medium text-gray-800 mb-2 truncate">
                      {sound.fileName}
                    </p>
                    <div className="border border-gray-200 rounded-lg p-2 mb-2">
                      <SoundPlayer filePath={sound.filePath} />
                    </div>
                    <button
                      onClick={() => {
                        window.electronAPI.openFileLocation(sound.filePath);
                      }}
                      className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      Open File Location
                    </button>
                  </div>
                ))}
              {activeSection === "vfx" &&
                videos.map((video, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer"
                  >
                    <p className="font-medium text-gray-800 mb-2 truncate">
                      {video.fileName}
                    </p>
                    <div className="border border-gray-200 rounded-lg p-2 mb-2">
                      <VideoPlayer filePath={video.filePath} />
                    </div>
                    <button
                      onClick={() => {
                        window.electronAPI.openFileLocation(video.filePath);
                      }}
                      className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      Open File Location
                    </button>
                  </div>
                ))}
              {activeSection === "music" &&
                music.map((music, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer"
                  >
                    <p className="font-medium text-gray-800 mb-2 truncate">
                      {music.fileName}
                    </p>
                    <div className="border border-gray-200 rounded-lg p-2 mb-2">
                      <SoundPlayer filePath={music.filePath} />
                    </div>
                    <button
                      onClick={() => {
                        window.electronAPI.openFileLocation(music.filePath);
                      }}
                      className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      Open File Location
                    </button>
                  </div>
                ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition duration-300"
              >
                Prev
              </button>
              <span className="text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition duration-300"
              >
                Next
              </button>
            </div>
          </>
        </div>
      </div>
    </div>
  );
}

export default App;