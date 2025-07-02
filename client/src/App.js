import { useState, useEffect } from "react";

function App() {
  const [sounds, setSounds] = useState([]);
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

  // Fetch on initial render and whenever page/searchTerm changes
  useEffect(() => {
    fetchSounds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm]);

  return (
    <div>
      <h1>Hello React + Electron</h1>
      {/* Search & list sound effects */}
      <div style={{ marginTop: "2rem" }}>
        <h2>Sound Effects</h2>
        <input
          type="text"
          placeholder="Search sounds..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1); // reset to first page when searching
          }}
          style={{ padding: "8px", width: "300px" }}
        />

        {sounds.length > 0 ? (
          <>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "1rem",
              }}
            >
              {sounds.map((sound, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #ddd",
                    padding: "10px",
                    borderRadius: "5px",
                    width: "200px",
                  }}
                >
                  <p>{sound}</p>
                  <button
                    onClick={() => {
                      window.electronAPI.openFileLocation(sound);
                    }}
                  >
                    Open File Location
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div style={{ marginTop: "1rem" }}>
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                Prev
              </button>
              <span style={{ margin: "0 1rem" }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p style={{ marginTop: "1rem" }}>No sounds found.</p>
        )}
      </div>
    </div>
  );
}

export default App;
