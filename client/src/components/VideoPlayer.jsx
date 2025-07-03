import React, { useState, useRef } from "react";

const VideoPlayer = ({ filePath }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  return (
    <div
      className="w-full h-full"
      onMouseEnter={() => {
        setIsPlaying(true);
        videoRef.current.play();
      }}
      onMouseLeave={() => {
        setIsPlaying(false);
        videoRef.current.pause();
      }}
    >
      <video
        src={filePath}
        controls={isPlaying}
        ref={videoRef}
        className="w-full h-full"
      />
    </div>
  );
};

export default VideoPlayer;
