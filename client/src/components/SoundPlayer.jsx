import React, { useState, useCallback } from "react";
import WaveSurferPlayer from "@wavesurfer/react";

const SoundPlayer = ({ filePath }) => {
  const [wavesurfer, setWavesurfer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onReady = (ws) => {
    setWavesurfer(ws);
    setIsLoading(false);
  };

  const handlePlay = useCallback(() => {
    if (wavesurfer && !isPlaying) {
      const playPromise = wavesurfer.play();
      if (playPromise !== undefined && playPromise.catch) {
        playPromise.catch(() => {
          /* Suppress play interrupted by pause warning */
        });
      }
      setIsPlaying(true);
    } else if (!wavesurfer) {
      setIsLoading(true);
    }
  }, [wavesurfer, isPlaying]);

  const handlePause = useCallback(() => {
    if (wavesurfer && isPlaying) {
      wavesurfer.pause();
      setIsPlaying(false);
    }
    setIsLoading(false);
  }, [wavesurfer, isPlaying]);

  return (
    <div
      onMouseEnter={handlePlay}
      onMouseLeave={handlePause}
      className="relative"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
        </div>
      )}
      <WaveSurferPlayer 
        url={filePath} 
        height={100} 
        onReady={onReady} 
        onPlay={() => {
          setIsPlaying(true);
          setIsLoading(false);
        }}
        onPause={() => {
          setIsPlaying(false);
          setIsLoading(false);
        }}
      />
    </div>
  );
};

export default SoundPlayer;
