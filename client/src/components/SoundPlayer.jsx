import React, { useState, useCallback } from "react";
import WaveSurferPlayer from "@wavesurfer/react";

const SoundPlayer = ({ filePath }) => {
  const [wavesurfer, setWavesurfer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const onReady = (ws) => {
    setWavesurfer(ws);
  };

  const handlePlay = useCallback(() => {
    if (wavesurfer && !isPlaying) {
      wavesurfer.play();
      setIsPlaying(true);
    }
  }, [wavesurfer, isPlaying]);

  const handlePause = useCallback(() => {
    if (wavesurfer && isPlaying) {
      wavesurfer.pause();
      setIsPlaying(false);
    }
  }, [wavesurfer, isPlaying]);

  return (
    <div
      onMouseEnter={handlePlay}
      onMouseLeave={handlePause}
    >
      <WaveSurferPlayer 
        url={filePath} 
        height={100} 
        onReady={onReady} 
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default SoundPlayer;
