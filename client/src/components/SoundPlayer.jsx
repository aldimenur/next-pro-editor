import React, { useState } from "react";
import WaveSurferPlayer from "@wavesurfer/react";

const SoundPlayer = ({ filePath }) => {
  const [wavesurfer, setWavesurfer] = useState(null);

  const onReady = (ws) => {
    setWavesurfer(ws);
  };

  return (
    <div
      onMouseEnter={() => wavesurfer && wavesurfer.play()}
      onMouseLeave={() => wavesurfer && wavesurfer.pause()}
    >
      <WaveSurferPlayer url={filePath} height={100} onReady={onReady} />
    </div>
  );
};

export default SoundPlayer;
