import { useState, useRef } from "react";

const PreviewMedia = ({
  musicUrl,
  mediaUrl,
  mediaType,
  alt,
  width = 230,
  height = 230,
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      onDragStart={(e) => e.preventDefault()}
      draggable="false"
    >
      {mediaType.startsWith("video/") ? (
        <>
          <video
            ref={videoRef}
            src={mediaUrl}
            muted={isMuted}
            autoPlay
            loop
            playsInline
            className="w-full h-full object-cover rounded-lg shadow-lg"
            draggable="false"
            onDragStart={(e) => e.preventDefault()}
            onMouseDown={(e) => e.preventDefault()}
            style={{ objectFit: "cover", minHeight: "100%" }}
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleMute();
            }}
            className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white text-sm px-3 py-2 rounded-full transition-transform transform hover:scale-105"
          >
            {isMuted ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-volume-off-icon lucide-volume-off"
              >
                <path d="M16 9a5 5 0 0 1 .95 2.293" />
                <path d="M19.364 5.636a9 9 0 0 1 1.889 9.96" />
                <path d="m2 2 20 20" />
                <path d="m7 7-.587.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298V11" />
                <path d="M9.828 4.172A.686.686 0 0 1 11 4.657v.686" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-volume2-icon lucide-volume-2"
              >
                <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
                <path d="M16 9a5 5 0 0 1 0 6" />
                <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
              </svg>
            )}
          </button>
          {musicUrl && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleMusic();
              }}
              className="absolute top-2 right-[3.2rem] bg-gray-800 bg-opacity-70 text-white text-sm px-3 py-2 rounded-full transition-transform transform hover:scale-105"
            >
              {isMusicPlaying ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-headphones-icon lucide-headphones"
                >
                  <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-headphone-off-icon lucide-headphone-off"
                >
                  <path d="M21 14h-1.343" />
                  <path d="M9.128 3.47A9 9 0 0 1 21 12v3.343" />
                  <path d="m2 2 20 20" />
                  <path d="M20.414 20.414A2 2 0 0 1 19 21h-1a2 2 0 0 1-2-2v-3" />
                  <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 2.636-6.364" />
                </svg>
              )}
            </button>
          )}
        </>
      ) : (
        <img
          src={mediaUrl}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-full object-cover rounded-lg shadow-lg"
          loading="lazy"
          draggable="false"
          onDragStart={(e) => e.preventDefault()}
          onMouseDown={(e) => e.preventDefault()}
          style={{ objectFit: "cover", minHeight: "100%" }}
        />
      )}
      {musicUrl && !mediaType.startsWith("video/") && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMusic();
          }}
          className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white text-sm px-3 py-2 rounded-full transition-transform transform hover:scale-105"
        >
          {isMusicPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-volume2-icon lucide-volume-2"
            >
              <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
              <path d="M16 9a5 5 0 0 1 0 6" />
              <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-volume-off-icon lucide-volume-off"
            >
              <path d="M16 9a5 5 0 0 1 .95 2.293" />
              <path d="M19.364 5.636a9 9 0 0 1 1.889 9.96" />
              <path d="m2 2 20 20" />
              <path d="m7 7-.587.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298V11" />
              <path d="M9.828 4.172A.686.686 0 0 1 11 4.657v.686" />
            </svg>
          )}
        </button>
      )}
      {musicUrl && <audio ref={audioRef} src={musicUrl} />}
    </div>
  );
};

export default PreviewMedia;
