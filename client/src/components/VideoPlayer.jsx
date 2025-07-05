import React, { useState, useRef } from "react";

const VideoPlayer = ({ filePath }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const handleEnter = () => {
    setIsPlaying(true)
    const v = videoRef.current;
    if (v.readyState === 0) v.load();  // kick off data read now
    v.play().catch(()=>{});
  };

  return (
    <div
      className="w-full h-full"
      onMouseEnter={handleEnter}
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
