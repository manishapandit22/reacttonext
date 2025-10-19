import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import PublishModal from "../modals/PublishModal";
import { useRouter } from "next/navigation";
import { FaDiscord, FaFacebook, FaTwitter, FaWhatsapp } from "react-icons/fa";
import { toast } from "react-toastify";

export const GameCreationSuccess = ({
  isVisible,
  setIsSuccessVisible,
  previewImage,
  game_id,
  axiosInstance,
  fetchGames,
  setSelectedGame,
  setIsModalOpen,
  redirectToGamesDashboard,
  onGamePublished,
}) => {
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [gameData, setGameData] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const lastClickRef = useRef(0);
  const isInitialRender = useRef(true);
  const [publishToggle, setPublishToggle] = useState(true);

  const router = useRouter();
  useEffect(() => {
    if (isVisible && game_id) {
      const fetchGameData = async () => {
        try {
          const response = await axiosInstance.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/${game_id}`
          );
          if (response.data) {
            setGameData(response.data?.success.data);
            if (
              response.data?.success.data.preview_image_type.startsWith(
                "video/mp4"
              )
            ) {
              setIsVideo((prev) => (prev = true));
            }
          }
        } catch (err) {
          console.error("Error fetching game data:", err);
        }
      };

      fetchGameData();
    }
  }, [isVisible, game_id, axiosInstance]);

  useEffect(() => {
    if (previewImage) {
      if (
        previewImage?.type?.startsWith("video/") ||
        (typeof previewImage === "string" &&
          previewImage.match(/\.(mp4|webm|ogg)$/i)) ||
        (previewUrl && previewUrl.match(/\.(mp4|webm|ogg)$/i))
      ) {
        setIsVideo(true);
      }
    }
  }, [previewImage]);

  useEffect(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (previewImage) {
      if (typeof previewImage === "string") {
        setPreviewUrl(previewImage);
      } else if (previewImage instanceof Blob || previewImage instanceof File) {
        try {
          const url = URL.createObjectURL(previewImage);
          setPreviewUrl(url);
        } catch (err) {
          console.error("Error creating object URL:", err);
        }
      } else if (
        previewImage &&
        typeof previewImage === "object" &&
        previewImage.url
      ) {
        setPreviewUrl(previewImage.url);
      }
    }

    return () => {
      if (previewUrl && !previewUrl.startsWith("http")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewImage]);

  const getSocialDescription = () => {
    if (!gameData?.game_opener) return '';
    return gameData.game_opener.substring(0, 160) + '...';
  };


  const getShareUrls = () => {
    const url = encodeURIComponent(`${window.location.origin}/games/${game_id}`);
    const title = encodeURIComponent(gameData?.game_name || '');
    const description = encodeURIComponent(getSocialDescription());

    const discordUrl = `https://discord.com/channels/@me?text=${title}%20${url}`;

    return {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}%20-%20${description}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${title}%20${url}`,
      discord: discordUrl
    };
  };

  const handleShare = (platform) => {
    const urls = getShareUrls();
    const dimensions = {
      twitter: 'width=600,height=600',
      facebook: 'width=670,height=520',
      linkedin: 'width=600,height=600',
      whatsapp: 'width=550,height=600',
      discord: 'width=600,height=600'
    };
    if (typeof window !== 'undefined') {
      window.open(urls[platform], '_blank', dimensions[platform]);
    }
  };

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "50";
    canvas.style.opacity = "1";
    canvas.style.transition = "opacity 0.3s ease";
    canvas.style.display = "none";

    canvasRef.current = canvas;
    document.body.appendChild(canvas);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      if (canvasRef.current && document.body.contains(canvasRef.current)) {
        document.body.removeChild(canvasRef.current);
        canvasRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (isVisible) {
      canvasRef.current.style.display = "block";
      setTimeout(() => {
        if (canvasRef.current) {
          canvasRef.current.style.opacity = "1";
        }
      }, 10);

      const ctx = canvasRef.current.getContext("2d", { alpha: true });
      const colors = ["#FFD700", "#FF4500", "#00FF7F", "#1E90FF"];

      particlesRef.current = [];
      for (let i = 0; i < 100; i++) {
        particlesRef.current.push({
          x: Math.random() * canvasRef.current.width,
          y: Math.random() * canvasRef.current.height,
          radius: Math.random() * 5 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          velocityX: (Math.random() - 0.5) * 8,
          velocityY: (Math.random() - 0.5) * 8,
          life: 100,
          opacity: 1,
        });
      }

      let lastFrameTime = 0;
      const frameInterval = 1000 / 60;

      const render = (timestamp) => {
        if (!canvasRef.current || !isVisible) return;

        if (timestamp - lastFrameTime < frameInterval) {
          animationRef.current = requestAnimationFrame(render);
          return;
        }

        lastFrameTime = timestamp;

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        let activeParticles = false;

        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.velocityX;
          p.y += p.velocityY;
          p.life -= 1;
          p.opacity = p.life / 100;
          p.radius *= 0.99;

          ctx.globalAlpha = p.opacity;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();

          if (p.life <= 0 || p.radius < 0.1) {
            particlesRef.current.splice(i, 1);
          } else {
            activeParticles = true;
          }
        }

        if (activeParticles) {
          animationRef.current = requestAnimationFrame(render);
        } else if (canvasRef.current) {
          canvasRef.current.style.opacity = "0";
          setTimeout(() => {
            if (canvasRef.current) {
              canvasRef.current.style.display = "none";
            }
          }, 300);
        }
      };

      animationRef.current = requestAnimationFrame(render);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      if (canvasRef.current) {
        canvasRef.current.style.opacity = "0";
        setTimeout(() => {
          if (canvasRef.current) {
            canvasRef.current.style.display = "none";
          }
        }, 300);
      }
    }

    if (isInitialRender.current) {
      isInitialRender.current = false;
      if (!isVisible && canvasRef.current) {
        canvasRef.current.style.display = "none";
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isVisible]);

  const handlePublishGame = async (paid, price) => {
    try {
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/${game_id}/publish`,
        { paid, price }
      );
      if (response.data && response.data.success) {
        setIsPublishModalOpen(false);
        fetchGames();
        if (typeof setSelectedGame === "function") {
          setSelectedGame(null);
        }
        
        if (gameData) {
          if (onGamePublished) {
            onGamePublished(response.data.success.data);
          } else {
            router.push("/profile");
          }
        } else {
          redirectToGamesDashboard();
        }
      }
    } catch (err) {
      console.error("Error publishing game:", err);
    }
  };

  const handleContinue = () => {
    if (publishToggle) {
      setIsPublishModalOpen(true);
    } else {
      handleRedirect();
    }
  };

  const handleRedirect = () => {
    if (isPublishModalOpen) {
      return;
    }
    setIsSuccessVisible(false);
    if (typeof setIsModalOpen === "function") {
      setIsModalOpen(false);
    }
    if (typeof setSelectedGame === "function") {
      setSelectedGame(null);
    }
    fetchGames();
    router.push("/profile");
  };

  const handleBackdropClick = (e) => {
    const now = Date.now();
    if (now - lastClickRef.current < 300) return;
    lastClickRef.current = now;

    if (e.target === e.currentTarget && !isPublishModalOpen) {
      handleRedirect();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
            style={{ backdropFilter: "blur(4px)" }}
            onClick={handleBackdropClick}
          >
            <motion.div
              className="bg-jacarta-700 rounded-xl p-8 text-center max-w-md mx-4 shadow-2xl border border-accent"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {previewUrl ? (
                isVideo ? (
                  <motion.video
                    src={previewUrl}
                    autoPlay
                    loop
                    muted
                    className="w-32 h-32 mx-auto mb-4 object-cover rounded-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 10,
                      delay: 0.2,
                    }}
                  />
                ) : (
                  <motion.img
                    src={previewUrl}
                    alt="Game Preview"
                    className="w-32 h-32 mx-auto mb-4 object-cover rounded-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 10,
                      delay: 0.2,
                    }}
                  />
                )
              ) : (
                <motion.img
                  src="/trophy.png"
                  alt="Success Trophy"
                  className="w-32 h-32 mx-auto mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 10,
                    delay: 0.2,
                  }}
                />
              )}
              <motion.h2
                className="text-3xl font-bold text-accent mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Game Created Successfully!
              </motion.h2>
              <motion.p
                className="text-jacarta-200 mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Your epic adventure is ready to conquer the gaming world!
              </motion.p>

              {/* Publish Toggle Section */}
              <motion.div
                className="mb-6 p-6 bg-gradient-to-br from-jacarta-600 to-jacarta-700 rounded-xl border border-jacarta-500/30 shadow-inner"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex flex-col space-y-4">
                  {/* Header */}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Choose Your Game's Visibility
                    </h3>
                    <p className="text-sm text-jacarta-300">
                      {publishToggle
                        ? "Your game will be available to everyone and can generate revenue"
                        : "Your game will remain in your private collection only"
                      }
                    </p>
                  </div>

                  {/* Enhanced Toggle Slider */}
                  <div className="relative">
                    {/* Background Track */}
                    <div className="relative bg-jacarta-800 rounded-full p-1 shadow-inner border border-jacarta-500/20">
                      <div className="flex relative z-10">
                        {/* Private Option */}
                        <button
                          onClick={() => setPublishToggle(false)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full text-sm font-medium transition-all duration-300 relative z-20 ${!publishToggle
                              ? 'text-white'
                              : 'text-jacarta-400 hover:text-jacarta-200'
                            }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                          Keep Private
                        </button>

                        {/* Publish Option */}
                        <button
                          onClick={() => setPublishToggle(true)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full text-sm font-medium transition-all duration-300 relative z-20 ${publishToggle
                              ? 'text-white'
                              : 'text-jacarta-400 hover:text-jacarta-200'
                            }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8m-8 0V4a1 1 0 011-1h6a1 1 0 011 1v0"
                            />
                          </svg>
                          Publish Game
                        </button>
                      </div>

                      {/* Animated Slider Background */}
                      <motion.div
                        className={`absolute top-1 bottom-1 w-1/2 rounded-full shadow-lg ${publishToggle
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                            : 'bg-gradient-to-r from-purple-500 to-purple-600'
                          }`}
                        initial={false}
                        animate={{
                          x: publishToggle ? '100%' : '0%',
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                        style={{
                          left: 0,
                          right: 0,
                        }}
                      />

                      {/* Glowing Effect */}
                      <motion.div
                        className={`absolute top-1 bottom-1 w-1/2 rounded-full blur-sm opacity-60 ${publishToggle
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                            : 'bg-gradient-to-r from-purple-400 to-purple-500'
                          }`}
                        initial={false}
                        animate={{
                          x: publishToggle ? '100%' : '0%',
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                        style={{
                          left: 0,
                          right: 0,
                        }}
                      />
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center justify-center space-x-2">
                    <motion.div
                      className={`w-2 h-2 rounded-full ${publishToggle ? 'bg-green-400' : 'bg-purple-400'
                        }`}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <span className={`text-sm font-medium ${publishToggle ? 'text-green' : 'text-purple-400'
                      }`}>
                      {publishToggle ? 'Ready to Publish' : 'Keeping Private'}
                    </span>
                  </div>

                  {/* Additional Info Cards */}
                  <div className="grid grid-cols-1 gap-3 mt-4">
                    {publishToggle ? (
                      <motion.div
                        className="bg-green/10 border border-green/20 rounded-lg p-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-green-400 mt-0.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                              />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-green mb-1">
                              {/* Monetization Ready */}
                              Ready to be published
                            </h4>
                            <p className="text-xs text-green/80">
                              {/* Set pricing and earn from your creation */}
                              Free for all
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-purple-400 mt-0.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-purple-400 mb-1">
                              Personal Collection
                            </h4>
                            <p className="text-xs text-purple-400/80">
                              Only you can access and play this game
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Share Section - only show if publishing */}
              {publishToggle && (
                <motion.div
                  className="dropdown rounded-xl mb-6 mx-auto max-w-20 border border-jacarta-100 bg-white hover:bg-jacarta-100 dark:border-jacarta-600 dark:bg-jacarta-700 dark:hover:bg-jacarta-600"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <button
                    className="dropdown-toggle inline-flex h-10 w-10 items-center justify-center text-sm"
                    role="button"
                    id="shareDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="fill-jacarta-500 dark:fill-jacarta-200" viewBox="0 0 16 16">
                      <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
                    </svg>
                  </button>
                  <div className="dropdown-menu dropdown-menu-end z-10 hidden min-w-[200px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800" aria-labelledby="shareDropdown">
                    <button onClick={() => handleShare('twitter')} className="flex w-full items-center gap-2 rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                      <FaTwitter size={16} className="text-[#1DA1F2]" />
                      Share on Twitter
                    </button>
                    <button onClick={() => handleShare('facebook')} className="flex w-full items-center gap-2 rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                      <FaFacebook size={16} className="text-[#4267B2]" />
                      Share on Facebook
                    </button>
                    <button onClick={() => handleShare('whatsapp')} className="flex w-full items-center gap-2 rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                      <FaWhatsapp size={16} className="text-[#25D366]" />
                      Share on WhatsApp
                    </button>
                    <button onClick={() => handleShare('discord')} className="flex w-full items-center gap-2 rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                      <FaDiscord size={16} className="text-[#5865F2]" />
                      Share on Discord
                    </button>
                    <hr className="my-2 mx-4 h-px border-0 bg-jacarta-100 dark:bg-jacarta-600" />
                    <button onClick={() => {
                      const gameUrl = `${window.location.origin}/games/${game_id}`;
                      navigator.clipboard.writeText(gameUrl);
                      toast.success("URL copied to clipboard!");

                    }} className="flex w-full items-center gap-2 rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-gray-500" viewBox="0 0 16 16">
                        <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z" />
                        <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z" />
                      </svg>
                      Copy URL
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Action Button */}
              <motion.button
                className={`w-full ring-2 ring-purple-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${publishToggle
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                whileHover={{
                  scale: 1.05,
                  boxShadow: publishToggle
                    ? "0 0 15px rgba(0, 255, 127, 0.7)"
                    : "0 0 15px rgba(138, 43, 226, 0.7)",
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ y: 50, opacity: 0 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  transition: { delay: 0.7, type: "spring" },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleContinue();
                }}
              >
                {publishToggle ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Publish Game
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Continue
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {gameData && (
        <>
          <PublishModal
            game={gameData}
            onPublish={handlePublishGame}
            onPublishSuccess={(gameData) => {
              if (onGamePublished && gameData) {
                onGamePublished(gameData);
              }
            }}
            isOpen={isPublishModalOpen}
            onClose={() => {
              setIsPublishModalOpen(false);
            }}
          />
        </>
      )}
    </>
  );
};