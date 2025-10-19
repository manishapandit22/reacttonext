import React, { useState, useRef, useEffect } from "react";

const GameNavigator = () => {
  const [step, setStep] = useState(-1);
  const [videoSrc, setVideoSrc] = useState(null);
  const [choiceHistory, setChoiceHistory] = useState([]);
  const [videoFinished, setVideoFinished] = useState(false);
  const [isAutoplaySequence, setIsAutoplaySequence] = useState(false);
  const [nextAutoplayVideo, setNextAutoplayVideo] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const [showStartButton, setShowStartButton] = useState(true);
  const [isPlayerHovered, setIsPlayerHovered] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState("/homeVideo/1_Roninmb.png");
  const [currentThumbnail, setCurrentThumbnail] = useState(
    "/homeVideo/1_Roninmb.png"
  );
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef(null);

  const choices = [
    {
      question: "You hear a noise. What do you do?",
      options: [
        { text: "Investigate", nextStep: 1, videoId: "2A", thumbnail: "2Amb" },
        { text: "Ignore", nextStep: 2, videoId: "2B", thumbnail: "2Bmb" },
      ],
    },
    {
      question: "You notice mysterious footsteps leading into the forest...",
      options: [
        {
          text: "Follow the footsteps",
          nextStep: 3,
          videoId: "2B2",
          thumbnail: "2B2mb",
        },
        {
          text: "Carry on your route",
          nextStep: 2,
          videoId: "2B",
          thumbnail: "2Bmb",
        },
      ],
    },
    {
      question: "A strange creature appears before you! Is it a...",
      options: [
        {
          text: "Friend!",
          nextStep: 5,
          videoId: "3",
          autoplayNext: "4b",
          thumbnail: "3mb",
        },
        {
          text: "Foe!",
          nextStep: 5,
          videoId: "3",
          autoplayNext: "4a",
          thumbnail: "3mb",
        },
      ],
    },
    {
      question: "A strange creature appears before you! Is it a...",
      options: [
        {
          text: "Friend!",
          nextStep: 5,
          videoId: "3",
          autoplayNext: "4b",
          thumbnail: "3mb",
        },
        {
          text: "Foe!",
          nextStep: 5,
          videoId: "3",
          autoplayNext: "4a",
          thumbnail: "3mb",
        },
      ],
    },
    {
      question: "A strange creature appears before you! Is it a...",
      options: [
        { text: "Friend!", nextStep: 5, videoId: "4b", thumbnail: "4bmb" },
        { text: "Foe!", nextStep: 5, videoId: "4a", thumbnail: "4amb" },
      ],
    },
    {
      question: "Your adventure concludes...",
      options: [
        {
          text: "Start a new adventure",
          nextStep: 0,
          videoId: "1_Ronin",
          thumbnail: "1_Roninmb",
        },
      ],
    },
  ];

  const handleVideoEnded = () => {
    if (currentVideo === "1_Ronin" && step === -1) {
      setStep(0);
      setVideoFinished(true);
    } else if (isAutoplaySequence && nextAutoplayVideo) {
      playVideo(nextAutoplayVideo);
      setIsAutoplaySequence(false);
      setNextAutoplayVideo(null);
    } else {
      setVideoFinished(true);
    }
  };

  const replayVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch((err) => {
        console.error("Video replay error:", err);
      });
      setVideoFinished(false);
      setIsPaused(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.play().catch((err) => {
          console.error("Video play error:", err);
        });
      } else {
        videoRef.current.pause();
      }
      setIsPaused(!isPaused);
    }
  };

  const playVideo = (videoId, nextVideo = null) => {
    setVideoSrc(`/homeVideo/${videoId}.mp4`);
    setCurrentVideo(videoId);
    setCurrentThumbnail(`/homeVideo/${videoId}mb.png`);

    if (nextVideo) {
      setIsAutoplaySequence(true);
      setNextAutoplayVideo(nextVideo);
    }

    setVideoFinished(false);
    setIsPaused(false);
  };

  const preloadVideos = () => {
    if (!choices[step]) return;

    choices[step].options.forEach((option) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = `/homeVideo/${option.videoId}.mp4`;
      link.as = "video";
      document.head.appendChild(link);

      if (option.autoplayNext) {
        const autoplayLink = document.createElement("link");
        autoplayLink.rel = "preload";
        autoplayLink.href = `/homeVideo/${option.autoplayNext}.mp4`;
        autoplayLink.as = "video";
        document.head.appendChild(autoplayLink);
      }

      if (option.thumbnail) {
        const thumbnailLink = document.createElement("link");
        thumbnailLink.rel = "preload";
        thumbnailLink.href = `/homeVideo/${option.thumbnail}.png`;
        thumbnailLink.as = "image";
        document.head.appendChild(thumbnailLink);
      }
    });
  };

  const startAdventure = () => {
    setShowStartButton(false);
    setShowIntro(false);
    setCurrentThumbnail("/homeVideo/1_Roninmb.png");
    playVideo("1_Ronin");

    const link1 = document.createElement("link");
    link1.rel = "preload";
    link1.href = `/homeVideo/${choices[0].options[0].videoId}.mp4`;
    link1.as = "video";
    document.head.appendChild(link1);

    const link2 = document.createElement("link");
    link2.rel = "preload";
    link2.href = `/homeVideo/${choices[0].options[1].videoId}.mp4`;
    link2.as = "video";
    document.head.appendChild(link2);

    const thumb1 = document.createElement("link");
    thumb1.rel = "preload";
    thumb1.href = `/homeVideo/${choices[0].options[0].thumbnail}.png`;
    thumb1.as = "image";
    document.head.appendChild(thumb1);

    const thumb2 = document.createElement("link");
    thumb2.rel = "preload";
    thumb2.href = `/homeVideo/${choices[0].options[1].thumbnail}.png`;
    thumb2.as = "image";
    document.head.appendChild(thumb2);
  };

  const handlePlayerMouseEnter = () => {
    setIsPlayerHovered(true);
  };

  const handlePlayerMouseLeave = () => {
    setIsPlayerHovered(false);
  };

  useEffect(() => {
    if (step >= 0) {
      preloadVideos();
    }
  }, [step]);

  useEffect(() => {
    if (videoRef.current && videoSrc) {
      videoRef.current.src = videoSrc;
      videoRef.current.muted = isMuted;

      const playPromise = videoRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {})
          .catch((err) => {
            console.error("Video playback error:", err);
            setVideoFinished(true);
          });
      }
    }
  }, [videoSrc]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleChoiceClick = (option) => {
    if (option.autoplayNext) {
      setIsAutoplaySequence(true);
      setNextAutoplayVideo(option.autoplayNext);
      playVideo(option.videoId);
    } else {
      playVideo(option.videoId);
    }

    setChoiceHistory([
      ...choiceHistory,
      {
        question: choices[step].question,
        answer: option.text,
      },
    ]);

    setStep(option.nextStep);
  };

  function handleShow(e) {
    e.preventDefault();
    e.stopPropagation();
    setShowControls((prev) => !prev);
  }

  const buttonStyles = `
    @keyframes rainbow-border {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    .glow-button {
      position: relative;
      z-index: 1;
      transition: all 0.3s ease;
      background-position: 0% 0%;
      background-size: 200% 100%;
      overflow: hidden;
    }
    
    .glow-button::before {
      content: "";
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      z-index: -2;
      background: linear-gradient(
        90deg, 
        #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000
      );
      background-size: 200% 200%;
      border-radius: 12px;
      opacity: 0;
      filter: blur(4px);
      transition: opacity 1s ease;
    }
    
    .glow-button::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 100%;
      bottom: 0;
      background: linear-gradient(135deg, #8b5cf6, #7c3aed, #6d28d9);
      border-radius: 8px 0 0 8px;
      z-index: -1;
      transition: right 1s cubic-bezier(0.25, 0.1, 0.25, 1);
    }
    
    .glow-button:hover {
      color: white;
    }
    
    .glow-button:hover::before {
      opacity: 1;
      animation: rainbow-border 4s linear infinite;
    }
    
    .glow-button:hover::after {
      right: 0;
      border-radius: 8px;
    }
    
    @keyframes rgb-pulse {
      0% { box-shadow: 0 0 10px 2px rgba(255, 0, 0, 0.7); }
      16.666% { box-shadow: 0 0 10px 2px rgba(255, 165, 0, 0.7); }
      33.333% { box-shadow: 0 0 10px 2px rgba(255, 255, 0, 0.7); }
      50% { box-shadow: 0 0 10px 2px rgba(0, 255, 0, 0.7); }
      66.666% { box-shadow: 0 0 10px 2px rgba(0, 0, 255, 0.7); }
      83.333% { box-shadow: 0 0 10px 2px rgba(75, 0, 130, 0.7); }
      100% { box-shadow: 0 0 10px 2px rgba(255, 0, 0, 0.7); }
    }
    
    .glow-button:hover {
      animation: rgb-pulse 4s infinite;
    }
    
    .video-control-button {
      backdrop-filter: blur(4px);
      background-color: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.2s ease;
    }
    
    .video-control-button:hover {
      background-color: rgba(0, 0, 0, 0.7);
      transform: scale(1.05);
    }
    
    .video-controls {
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .video-controls.visible {
      opacity: 1;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    .pulse-animation {
      animation: pulse 2s infinite;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .fade-in {
      animation: fadeIn 0.5s ease-in-out;
    }

    .choice-thumbnail {
      transition: all 0.3s ease;
    }
    
    .choice-button:hover .choice-thumbnail {
      transform: scale(1.05);
      filter: brightness(1.1);
    }

    .video-end-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.3s ease;
    }
    
    .game-container {
      display: flex;
      flex-direction: column;
      min-height: 100%;
      margin: 0 auto;
      position: relative;
      overflow: hidden;
      background-color: transparent;
      border-radius: 1rem;
    }
    
    .game-background {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(58, 21, 82, 0.5), rgba(22, 25, 68, 0.6));
      z-index: -1;
    }
    
    .game-card {
      backdrop-filter: blur(8px);
      background-color: rgba(20, 15, 35, 0.7);
      border: 1px solid rgba(138, 91, 225, 0.2);
      border-radius: 1rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(128, 90, 213, 0.2);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      overflow: hidden;
    }
    
    .game-card:hover {
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(138, 91, 225, 0.3);
    }
    
    .game-title {
      font-family: 'Cinzel', serif;
      background: linear-gradient(90deg, #e6c8ff, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 0.05em;
      font-weight: 700;
    }
    
    .video-player-container {
      position: relative;
      border-radius: 0.75rem;
      overflow: hidden;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
      transition: transform 0.3s ease;
    }
    
    .question-container {
      background: rgba(30, 20, 50, 0.85);
      border-left: 4px solid #8b5cf6;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    .question-text {
      font-size: 1.25rem;
      font-weight: 600;
      color: #e9e4f9;
      letter-spacing: 0.025em;
    }
    
    .choice-container {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    
    @media (min-width: 768px) {
      .choice-container {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    .choice-card {
      position: relative;
      background: rgba(40, 30, 60, 0.7);
      border-radius: 0.75rem;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    .choice-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4), 0 0 10px rgba(138, 91, 225, 0.3);
    }
    
    .loading-indicator {
      position: relative;
      padding: 1rem;
      text-align: center;
      color: #a893e2;
      font-style: italic;
    }
    
    .loading-indicator::after {
      content: '...';
      position: absolute;
      animation: ellipsis 1.5s infinite;
    }
    
    @keyframes ellipsis {
      0% { content: '.'; }
      33% { content: '..'; }
      66% { content: '...'; }
      100% { content: '.'; }
    }
    
    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: rgba(30, 20, 50, 0.5);
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #8b5cf6;
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #7c3aed;
    }
  `;

  return (
    <div className="game-container lg:w-3/5 w-full">
      <style>{buttonStyles}</style>

      <div className=""></div>

      <main className="flex-grow flex flex-col md:p-2 lg:p-4 gap-4 relative z-10">
        <div className="game-card  md:p-2 lg:p-4 flex flex-col">
          {/* <h2 className="game-title text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center">Interactive Adventure</h2> */}

          <div
            className="video-player-container mb-4 md:mb-6"
            onMouseEnter={handlePlayerMouseEnter}
            onMouseLeave={handlePlayerMouseLeave}
          >
            {showStartButton ? (
              <div className="relative aspect-video w-full fade-in">
                <img
                  src={thumbnailSrc}
                  alt="Adventure thumbnail"
                  className="absolute opacity-60 inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 p-4">
                  <div className="text-center max-w-md">
                    <h3 className="text-xl md:text-2xl font-semibold text-white mb-2 tracking-wide">
                      Embark on a Mystical Journey
                    </h3>
                    <p className="text-gray-200 mb-4 hidden md:block">
                      Your choices will shape the path ahead. Are you ready to
                      discover what awaits?
                    </p>
                    <button
                      onClick={startAdventure}
                      className="glow-button pulse-animation py-3 px-6 bg-accent/80 rounded-lg text-sm md:text-md lg:text-lg font-semibold backdrop-blur-sm"
                    >
                      <span className="relative z-10 text-white/80 text-sm md:text-md lg:text-lg">
                        Begin Your Adventure
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative aspect-video w-full">
                <video
                  ref={videoRef}
                  muted={isMuted}
                  onPointerEnter={handleShow}
                  onPointerLeave={() => setShowControls(false)}
                  playsInline
                  controls={showControls}
                  onEnded={handleVideoEnded}
                  className="w-full h-full object-cover"
                >
                  <source src={videoSrc} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {videoFinished && (
                  <div className="video-end-overlay fade-in">
                    <img
                      src={currentThumbnail}
                      alt="Video end thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div
                  className={`absolute top-4 right-4 flex space-x-2 video-controls ${
                    isPlayerHovered ? "visible" : ""
                  }`}
                >
                  <button
                    onClick={togglePlayPause}
                    className="video-control-button p-2 rounded-full"
                    title={isPaused ? "Play video" : "Pause video"}
                  >
                    {isPaused ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={replayVideo}
                    className="video-control-button p-2 rounded-full"
                    title="Replay video"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={toggleMute}
                    className="video-control-button p-2 rounded-full"
                    title={isMuted ? "Unmute video" : "Mute video"}
                  >
                    {isMuted ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {step >= 0 && !showStartButton && (
            <div className="question-container fade-in">
              <h3 className="question-text mb-4">{choices[step].question}</h3>
              {videoFinished ? (
                <div className="choice-container">
                  {choices[step].options.map((option, idx) => (
                    <div
                      key={idx}
                      className="choice-card choice-button overflow-hidden"
                    >
                      <div className="relative h-32 md:h-40 overflow-hidden">
                        <img
                          src={`/homeVideo/${option.thumbnail}.png`}
                          alt={`Preview for ${option.text}`}
                          className="w-full h-full object-cover choice-thumbnail"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      </div>
                      <button
                        onClick={() => handleChoiceClick(option)}
                        className="glow-button w-full p-3 bg-blue-base/80 text-left backdrop-blur-sm"
                      >
                        <span className="relative z-10 block p-2 text-white font-medium">
                          {option.text}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="loading-indicator">
                  <p>Watching the story unfold</p>
                </div>
              )}
            </div>
          )}

          {choiceHistory.length > 0 && !showStartButton && (
            <div className="mt-4 pt-4 border-t border-purple-900/30">
              <details className="text-purple-300/70">
                <summary className="cursor-pointer text-sm font-medium mb-2 hover:text-purple-300 transition-colors">
                  Your Journey So Far
                </summary>
                <div className="pl-4 space-y-2 text-sm text-purple-300/60">
                  {choiceHistory.map((item, idx) => {
                    const randomHue = Math.floor(Math.random() * 360);
                    const textColor = `hsl(${randomHue}, 70%, 75%)`;
                    const questionColor = `hsl(${randomHue}, 85%, 85%)`;

                    return (
                      <div
                        key={idx}
                        className="flex flex-col mb-2 p-2 bg-purple-900/10 rounded-md"
                      >
                        <span
                          // style={{ color: questionColor }}
                          className="font-medium"
                        >
                          {item.question}
                        </span>
                        <span style={{ color: questionColor }} className="pl-2 font-bold">
                          → {item.answer}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </details>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GameNavigator;
