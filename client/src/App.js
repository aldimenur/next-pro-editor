import { useState } from "react";

function App() {
  const [filePath, setFilePath] = useState("");

  const handleOpen = async () => {
    const result = await window.electronAPI.openFileDialog();
    setFilePath(result[0] || "No file selected");
  };

  return (
    <div>
      <h1>Hello React + Electron</h1>
      <button onClick={handleOpen}>Open File</button>
      <p>Selected file: {filePath}</p>
    </div>
  );
}

export default App;
