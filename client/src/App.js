import { useState } from "react";

function App() {
  const [filePath, setFilePath] = useState("");
  const [sounds, setSounds] = useState([]);
  const handleOpen = async () => {
    const result = await window.electronAPI.openFileLocation(filePath);
    setFilePath(result || "No file selected");
  };

  const handleGetSounds = async () => {
    const result = await fetch("http://localhost:3001/sounds");
    const data = await result.json();
    setSounds(data || "No sounds found");
  };

  return (
    <div>
      <h1>Hello React + Electron</h1>
      <button onClick={handleOpen}>Open File</button>
      <p>Selected file: {filePath}</p>
      <button onClick={handleGetSounds}>Get Sounds</button>
      {sounds.length > 0 && (
        <div>
          <h2>Sound Effects</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
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
        </div>
      )}
    </div>
  );
}

export default App;
