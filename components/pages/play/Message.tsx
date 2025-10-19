"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Component } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm"; // Supports GitHub-flavored markdown
import useAxiosWithAuth from "@/hooks/useAxiosWithAuth";
import { toast } from "react-toastify";
import { useUser } from "@/contexts/UserContext";
import { useTTS } from "./TTSContext";
import { 
  extractYouTubeVideoId, 
  isYouTubeUrl, 
  createYouTubeEmbedUrl, 
  isYouTubeShorts, 
  getYouTubeDimensions 
} from "@/utils/youtubeUtils";

// Custom error boundary specifically for ReactMarkdown
class MarkdownErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ReactMarkdown error:", error);
    console.error("ReactMarkdown error info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-300">
          <p className="font-medium mb-1">Error rendering message</p>
          <p className="text-sm opacity-80">
            There was an issue displaying this message content. The original message is shown below:
          </p>
          <div className="mt-2 p-2 bg-white/50 dark:bg-black/20 rounded border border-red-100 dark:border-red-800/50 text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-sm">
            {this.props.fallbackContent || "Message content unavailable"}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Custom Image component with error handling - uses regular img tag to avoid Next.js domain restrictions
function ImageWithFallback({ src, alt, ...props }) {
  const [error, setError] = useState(false);
  const handleError = useCallback(() => {
    setError(true);
  }, []);
  
  if (!src || error) {
    return (
      <div className={`${props.className || ''} flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg`}
        style={{ width: '100%', height: '200px' }}>
        <div className="text-center p-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {!src ? "Image URL is missing" : "Failed to load image"}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${props.className || ''}`}>
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: 'auto', 
          maxWidth: '100%',
          borderRadius: props.className?.includes('rounded') ? 'inherit' : undefined
        }}
        onError={handleError}
      />
    </div>
  );
}

export default function Message({
  message,
  player,
  character_avatar,
  user_avatar,
  scrollToBottom,
  diceRolling,
  selectedVoice,
  audioModelEnabled,
  isLast,
  isNewStory,
  messageIndex,
}) {
  const { axiosInstance, loading, error } = useAxiosWithAuth();
  const { getProfile } = useUser();
  const { 
    addToQueue, 
    isPlaying, 
    currentAudio, 
    stopCurrent, 
    isProcessing, 
    currentRequestId,
    isRequestPlaying,
    toggleRequest,
    isRequestCached,
    isRequestPending,
  } = useTTS();
  
  const [isProcessingTTS, setIsProcessingTTS] = useState(false);
  const [waitingForPlayback, setWaitingForPlayback] = useState(false);
  const [hasDeductedPoints, setHasDeductedPoints] = useState(false);

  const hasAutoPlayed = useRef(false);
  const autoPlayTimeout = useRef(null);
  const messageId = useRef(`msg_${messageIndex}_${(message.id || '')}_${(message.content || '').slice(0, 64)}`);
  const pointsDeducted = useRef(false);
  const isAutoPlayInitialized = useRef(false);
  const audioCreationPromise = useRef(null);
  const loadingSoundRef = useRef(null);

useEffect(() => {
  if (typeof window !== 'undefined') {
    loadingSoundRef.current = new Audio('/sound/loading.wav');
    loadingSoundRef.current.loop = true;
    loadingSoundRef.current.volume = 0.3;
    // loadingSoundRef.current.muted = false;
    loadingSoundRef.current.preload = 'auto';
  }
  
  return () => {
    if (loadingSoundRef.current) {
      loadingSoundRef.current.pause();
      loadingSoundRef.current.src = '';
      loadingSoundRef.current = null;
    }
  };
}, []);

useEffect(() => {
  const playLoadingSound = async () => {
    const isThinking = message.content === "Thinking..." && !message.sent_by_user;
    const isTTSPlaying = isPlaying; 
    
    if (loadingSoundRef.current && isThinking && audioModelEnabled && !isRequestPlaying(messageId.current) && !isTTSPlaying) {
      try {
        await loadingSoundRef.current.play();
      } catch (error) {
        console.log('Loading sound play failed:', error);
      }
    } else if (loadingSoundRef.current && (!isThinking || isTTSPlaying)) {
      // loadingSoundRef.current.muted = true;
      loadingSoundRef.current.pause();
      loadingSoundRef.current.currentTime = 0;
    }
  };

  playLoadingSound();
}, [message.content, message.sent_by_user, isPlaying, audioModelEnabled]); 
//i will remove the audiomodel enabled if it gives error and remove the isRequestPlaying(messageId.current) if it gives error or isTTsPlaying

  // const createAudioElement = async (text, voice, shouldDeductPoints = true) => {
  //   if (shouldDeductPoints && !pointsDeducted.current && !hasDeductedPoints) {
  //     try {
  //       const pointsResponse = await axiosInstance.post(
  //         process.env.NEXT_PUBLIC_BACKEND_URL + "/points/deduct",
  //         { action: "tts" }
  //       );

  //       if (!pointsResponse.data) {
  //         throw new Error("Failed to process text to speech");
  //       }

  //       pointsDeducted.current = true;
  //       setHasDeductedPoints(true);
  //       getProfile();
  //     } catch (error) {
  //       console.error("Error deducting points:", error);
  //       throw error;
  //     }
  //   }

  //   const cleanText = message.content
  //     .replace(/#{1,6}\s+/g, "")
  //     .replace(/\{\{[^}]+\}\}/g, "")
  //     .replace(/<[^>]*>/g, "")
  //     .replace(/\*/g, "")
  //     .replace(/("[^"]+")([^:]*?)("[^"]+")/g, "$1\n$2:\n$3")
  //     .replace(/"([^"]+)"/g, '*"$1"*');

  //   const response = await fetch("/api/text-to-speech", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ text: cleanText, voice: voice }),
  //   });

  //   if (!response.ok) {
  //     throw new Error("Failed to convert text to speech");
  //   }

  //   const audioBlob = await response.blob();
  //   const url = URL.createObjectURL(audioBlob);
  //   const audioElement = new Audio(url);
    
  //   return new Promise((resolve, reject) => {
  //     audioElement.addEventListener('canplaythrough', () => resolve(audioElement), { once: true });
  //     audioElement.addEventListener('error', reject, { once: true });
  //     audioElement.load();
  //   });
  // };
  const createAudioElement = async (text, voice, shouldDeductPoints = true) => {
    if (shouldDeductPoints && !pointsDeducted.current && !hasDeductedPoints) {
      try {
        const pointsResponse = await axiosInstance.post(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/points/deduct",
          { action: "tts" }
        );
        if (!pointsResponse.data) {
          throw new Error("Failed to process text to speech");
        }
        pointsDeducted.current = true;
        setHasDeductedPoints(true);
        getProfile();
      } catch (error) {
        console.error("Error deducting points:", error);
        throw error;
      }
    }

    const cleanText = text
      .replace(/#{1,6}\s+/g, "")
      .replace(/\{\{[^}]+\}\}/g, "")
      .replace(/<[^>]*>/g, "")
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .trim();

    // Validate text length
    if (!cleanText || cleanText.trim().length === 0) {
      throw new Error("No text content to convert to speech");
    }

    if (cleanText.length > 5000) {
      console.warn("Text is very long, this may take a while to process");
    }

    // Non-streaming: fetch full audio and create a simple Audio element
    const createBufferedAudio = async () => {
      if (typeof window === 'undefined') {
        throw new Error('Audio not supported on server');
      }

      try {
        const response = await fetch("/api/text-to-speech", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "audio/mpeg"
          },
          body: JSON.stringify({
            text: cleanText,
            voice_id: voice || "EXAVITQu4vr4xnSDxMaL",
            model_id: "eleven_turbo_v2_5"
          }),
        });

        if (!response.ok) {
          let errorMessage = "Failed to convert text to speech";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            // If response is not JSON, use status text
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        // Check if response is actually audio
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('audio')) {
          throw new Error("Invalid response format from TTS service");
        }

        const blob = await response.blob();
        
        // Validate blob size
        if (blob.size === 0) {
          throw new Error("Empty audio file received");
        }

        if (blob.size > 10 * 1024 * 1024) { // 10MB limit
          throw new Error("Audio file too large");
        }

        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        
        // Set audio properties for better compatibility
        audio.preload = 'auto';
        audio.crossOrigin = 'anonymous';
        
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Audio loading timeout'));
          }, 30000); // 30 second timeout

          const cleanup = () => {
            clearTimeout(timeout);
            audio.removeEventListener('canplaythrough', onCanPlay);
            audio.removeEventListener('error', onError);
            audio.removeEventListener('loadeddata', onLoadedData);
          };

          const onCanPlay = () => {
            cleanup();
            resolve(audio);
          };

          const onLoadedData = () => {
            // Audio data is loaded, but wait for canplaythrough for better compatibility
            console.log('Audio data loaded');
          };

          const onError = (error) => {
            cleanup();
            reject(new Error(`Audio loading failed: ${error.message || 'Unknown error'}`));
          };

          audio.addEventListener('canplaythrough', onCanPlay, { once: true });
          audio.addEventListener('error', onError, { once: true });
          audio.addEventListener('loadeddata', onLoadedData, { once: true });
          
          // Start loading
          audio.load();
        });
      } catch (error) {
        console.error('TTS API Error:', error);
        throw error;
      }
    };

    return createBufferedAudio();
  };

  const handleTextToSpeech = async (shouldDeductPoints = true, isAuto = false) => {
    try {
      const messageIdValue = messageId.current;
      
      // Clear any previous errors (no-op since global indicator removed)
      
      if (isRequestCached(messageIdValue)) {
        const ttsRequest = {
          id: messageIdValue,
          processAudio: async () => {
            throw new Error("This should not be called for cached audio");
          },
          messageIndex: messageIndex || 0,
          meta: { auto: !!isAuto }
        };
        toggleRequest(ttsRequest);
        return;
      }

      if (audioCreationPromise.current) {
        const ttsRequest = {
          id: messageIdValue,
          processAudio: () => audioCreationPromise.current,
          messageIndex: messageIndex || 0,
          meta: { auto: !!isAuto }
        };
        toggleRequest(ttsRequest);
        return;
      }

      setIsProcessingTTS(true);

      audioCreationPromise.current = createAudioElement(message.content, selectedVoice, shouldDeductPoints);

      const processAudio = async () => {
        try {
          const audioElement = await audioCreationPromise.current;
          return audioElement;
        } catch (error) {
          audioCreationPromise.current = null;
          console.error("Audio creation failed:", error);
          throw error;
        }
      };

      const ttsRequest = {
        id: messageIdValue,
        processAudio,
        messageIndex: messageIndex || 0,
        meta: { auto: !!isAuto }
      };

      toggleRequest(ttsRequest);
      // Keep loader until playback actually begins
      setWaitingForPlayback(true);
      setIsProcessingTTS(false);
    } catch (error) {
      console.error("Error converting text to speech:", error);
      const errorMessage = error.message || error.response?.data?.message || "Failed to process text to speech";
      toast.error(errorMessage);
      setIsProcessingTTS(false);
      audioCreationPromise.current = null;
    }
  };

  useEffect(() => {
    pointsDeducted.current = false;
    setHasDeductedPoints(false);
    // Do NOT reset hasAutoPlayed or isAutoPlayInitialized here to avoid double auto-plays on re-render
    audioCreationPromise.current = null;
    
    // Stable ID derived from content and index to ensure caching and avoid replays
    messageId.current = `msg_${messageIndex}_${(message.id || '')}_${(message.content || '').slice(0, 64)}`;
  }, [messageIndex, message.id, message.content]);

  useEffect(() => {
    return () => {
      if (autoPlayTimeout.current) {
        clearTimeout(autoPlayTimeout.current);
        autoPlayTimeout.current = null;
      }
      audioCreationPromise.current = null;
    };
  }, []);

  useEffect(() => {
    if (autoPlayTimeout.current) {
      clearTimeout(autoPlayTimeout.current);
      autoPlayTimeout.current = null;
    }

    const shouldAutoPlay = (
      audioModelEnabled &&
      !message.sent_by_user &&
      message.type !== "image" &&
      message.content !== "Thinking..." &&
      !message?.is_chunk &&
      !isProcessingTTS &&
      !hasAutoPlayed.current &&
      !isAutoPlayInitialized.current
    );

    const shouldAutoPlayBasedOnStory = (
      (isNewStory && messageIndex === 0) || 
      (isLast && !isNewStory && !hasAutoPlayed.current) 
    );

    if (shouldAutoPlay && shouldAutoPlayBasedOnStory) {
      // If audio is already cached for this message, skip automatic playback to avoid repeats
      if (isRequestCached(messageId.current)) {
        return;
      }

      if (typeof window !== 'undefined' && isNewStory && messageIndex === 0) {
        if (window.__opener_tts_played) {
          return () => {};
        }
      }

      isAutoPlayInitialized.current = true;
      
      autoPlayTimeout.current = setTimeout(() => {
        if (
          audioModelEnabled &&
          !hasAutoPlayed.current &&
          !message.sent_by_user &&
          message.content !== "Thinking..." &&
          !message?.is_chunk
        ) {
          hasAutoPlayed.current = true;
          if (typeof window !== 'undefined' && isNewStory && messageIndex === 0) {
            window.__opener_tts_played = true;
          }
          handleTextToSpeech(true, true);
        }
      }, 400);
    }

    return () => {
      if (autoPlayTimeout.current) {
        clearTimeout(autoPlayTimeout.current);
        autoPlayTimeout.current = null;
      }
    };
  }, [
    isLast, 
    isNewStory, 
    messageIndex, 
    audioModelEnabled, 
    message.content, 
    message.sent_by_user,
    message.is_chunk,
    message.type,
    isProcessingTTS
  ]);

  useEffect(() => {
    if (!isLast && !isNewStory) {
      hasAutoPlayed.current = false;
      isAutoPlayInitialized.current = false;
    }
  }, [isLast, isNewStory]);

  const components = {
    // @ts-expect-error
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        // @ts-expect-error
        <pre
          {...props}
          className={`${className} text-sm w-[80dvw] md:max-w-[500px] overflow-x-scroll bg-gray-100 p-3 rounded-lg mt-2 dark:bg-gray-800`}
        >
          <code className={match[1]}>{children}</code>
        </pre>
      ) : (
        <code
          className={`${className} text-sm bg-gray-100 dark:bg-gray-800 py-0.5 px-1 rounded-md`}
          {...props}
        >
          {children}
        </code>
      );
    },
    ol: ({ node, children, ...props }) => {
      return (
        <ol className="list-decimal list-outside ml-4 text-accent" {...props}>
          {children}
        </ol>
      );
    },
    li: ({ node, children, ...props }) => {
      return (
        <li className="py-1 text-accent" {...props}>
          {children}
        </li>
      );
    },
    ul: ({ node, children, ...props }) => {
      return (
        <ul className="list-disc list-outside ml-4 text-accent" {...props}>
          {children}
        </ul>
      );
    },
    strong: ({ node, children, ...props }) => {
      const text = String(children).trim();
      const isSectionTitle = text.includes(":") || /^[A-Z][a-zA-Z\s]+:/.test(text);
      return (
        <span
          className={`font-semibold ${isSectionTitle
              ? "block text-md text-amber-500 dark:text-amber-500 mb-2 mt-4"
              : "text-amber-600 dark:text-amber-400"
            }`}
          {...props}
        >
          {children}
        </span>
      );
    },
    em: ({ node, children, ...props }) => {
      return (
        <span className="italic text-amber-500 dark:text-amber-400" {...props}>
          {children}
        </span>
      );
    },
    i: ({ node, children, ...props }) => {
      return (
        <span className="italic text-amber-500 dark:text-amber-400" {...props}>
          {children}
        </span>
      );
    },
    p: ({ node, children, ...props }) => {
      const isInsideListItem = (node) => {
        if (!node) return false;
        if (node.type === "element" && node.tagName === "li") return true;
        return node.parent ? isInsideListItem(node.parent) : false;
      };

      return (
        <p className={`${isInsideListItem(node) ? "" : "mb-4"} `} {...props}>
          {children}
        </p>
      );
    },

    h1: ({ node, children, ...props }) => {
      return (
        <h1 className="text-3xl font-semibold mt-6 mb-2 text-amber-700" {...props}>
          {children}
        </h1>
      );
    },
    h2: ({ node, children, ...props }) => {
      return (
        <h2 className="text-2xl font-semibold mt-6 mb-2 text-amber-600" {...props}>
          {children}
        </h2>
      );
    },
    h3: ({ node, children, ...props }) => {
      return (
        <h3 className="text-xl font-semibold mt-6 mb-2 text-amber-500" {...props}>
          {children}
        </h3>
      );
    },
    h4: ({ node, children, ...props }) => {
      return (
        <h4 className="text-lg font-semibold mt-6 mb-2 text-amber-500" {...props}>
          {children}
        </h4>
      );
    },
    h5: ({ node, children, ...props }) => {
      return (
        <h5 className="text-base font-semibold mt-6 mb-2 text-amber-500" {...props}>
          {children}
        </h5>
      );
    },
    h6: ({ node, children, ...props }) => {
      return (
        <h6 className="text-sm font-semibold mt-6 mb-2 text-amber-500" {...props}>
          {children}
        </h6>
      );
    },
    blockquote: ({ node, children, ...props }) => {
      return (
        <blockquote className="border-l-4 border-amber-500/30 pl-4 my-4 italic text-amber-600 dark:text-amber-400" {...props}>
          {children}
        </blockquote>
      );
    },
  };

  if (message.sent_by_user && diceRolling) {
    return;
  }

  const formatMessageContent = (content) => {
    try {
      if (!content) return content;

      if (typeof content !== 'string') {
        return String(content);
      }

      let formatted = content
        .replace(/`([^`]+)`/g, '\\`$1\\`')
        .replace(/\*\*([^*\n]+)\*\*/g, '**$1**')
        .replace(/"([^"]+)(?:\.{3}|\.\.\.)?"([^.!?]*?)([.!?]+|\.\.\.|…)?/g, '> *"$1$2"*$3\n\n')
        .replace(/\.{3}|…/g, '...')
        .replace(/\n\n+/g, "\n\n")
        .replace(/\n/g, "  \n")
        .replace(/^(#{1,6})([^\s])/gm, "$1 $2")
        .replace(/^(\s*[-*+]|\s*\d+\.)\s/gm, "\n$&")
        .replace(/>\s*([^\n]+)\n(?!>)/g, "> $1\n\n");

      if (!message.sent_by_user && !content.includes("*") && !content.includes("#")) {
        formatted = formatted.replace(/"([^"]+)"/g, '*"$1"*');
      }

      return formatted;
    } catch (error) {
      console.error("Error formatting message content:", error);
      return String(content || "");
    }
  };

  const isThisMessagePlaying = isRequestPlaying(messageId.current);
  const isThisMessageCached = isRequestCached(messageId.current);
  const isThisMessagePending = isRequestPending(messageId.current);

  // Stop showing loader when playback begins or request clears
  useEffect(() => {
    if (isThisMessagePlaying) {
      setWaitingForPlayback(false);
    }
    if (!isThisMessagePending && !isThisMessagePlaying) {
      // if nothing pending/playing, don't keep stale loader
      setWaitingForPlayback(false);
    }
  }, [isThisMessagePlaying, isThisMessagePending]);

  return (
    <div
      className={`flex mb-6 ${message.sent_by_user ? "justify-end" : "justify-start"
        }`}
    >
      {/* Avatar */}
      {!message.sent_by_user && (
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full  overflow-hidden flex items-center justify-center">
          <ImageWithFallback
            src={character_avatar}
            alt="Character Avatar"
            width={32}
            height={32}
            className="object-cover"
          />
        </div>
      )}
      {/* Message Content */}
      <div className={`${message.sent_by_user ? "max-w-xl" : "max-w-[85%] md:max-w-2xl"}`}>
        {message.type !== "image" && (
          <div>
            <div
              className={` px-4 py-3 rounded-2xl ${message.sent_by_user
                  ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-md shadow-purple-500/10"
                  : "bg-white/5 backdrop-blur-sm text-jacarta-700 dark:text-white border border-gray-200/10 dark:border-purple-900/20 shadow-sm"
                }`}
            >
              {message.content === "Thinking..." && !message.sent_by_user ? (
                <div className="flex items-center justify-start gap-2 h-full py-2">
                  <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-[bounce_0.8s_infinite_0ms]"></div>
                  <div className="w-2.5 h-2.5 bg-purple-600 rounded-full animate-[bounce_0.8s_infinite_200ms]"></div>
                  <div className="w-2.5 h-2.5 bg-purple-700 rounded-full animate-[bounce_0.8s_infinite_400ms]"></div>
                  <div className="w-2.5 h-2.5 bg-purple-800 rounded-full animate-[bounce_0.8s_infinite_600ms]"></div>
                </div>
              ) : (
                <MarkdownErrorBoundary fallbackContent={message.content}>
                  <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    remarkPlugins={[remarkGfm]}
                    components={components}
                    breaks={true}
                    skipHtml={true}
                    remarkRehypeOptions={{
                      allowDangerousHtml: false,
                      allowDangerousCharacters: false
                    }}
                  >
                    {formatMessageContent(message.content)}
                  </ReactMarkdown>
                </MarkdownErrorBoundary>
              )}
            </div>
            {!message.sent_by_user && (
              <div className="flex flex-row gap-2 mt-2">
                <button
                  onClick={() => handleTextToSpeech(!hasDeductedPoints && !isThisMessageCached)}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-full text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 py-2 px-2 h-8 w-8 shadow-md ${isProcessingTTS
                      ? 'bg-gray-500 text-white border border-gray-400/50'
                      : (isThisMessagePlaying || waitingForPlayback)
                      ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white border border-purple-500/50'
                      : 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 text-gray-300 hover:text-white border border-purple-500/30 hover:border-purple-500/50 backdrop-blur-sm'
                    }`}
                  title={isThisMessagePlaying ? "Pause" : "Play"}
                  disabled={isProcessingTTS}
                >
                  {isProcessingTTS || waitingForPlayback ? (
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ): isThisMessagePlaying ? ( 
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 4H6V20H10V4Z"
                        fill="currentColor"
                      />
                      <path
                        d="M18 4H14V20H18V4Z"
                        fill="currentColor"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 5.14V19.14L19 12.14L8 5.14Z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
        <div></div>
        {message.type === "image" && (
          <div className="rounded-xl overflow-hidden shadow-md border border-gray-200/10 dark:border-purple-900/20">
            {isYouTubeUrl((message.content || '').replace(/^\[\s*|\s*\]$/g, '')) ? (
              (() => {
                try {
                  const raw = (message.content || '').replace(/^\[\s*|\s*\]$/g, '');
                  const videoId = extractYouTubeVideoId(raw);
                  const isShorts = isYouTubeShorts(raw);
                  const dimensions = getYouTubeDimensions(raw);
                  
                  if (!videoId) {
                    return (
                      <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                        <p className="font-medium mb-1">Invalid YouTube URL</p>
                        <p className="text-sm opacity-75">Could not extract video ID from the provided link.</p>
                      </div>
                    );
                  }
 
                  if (!/^[a-zA-Z0-9_-]{10,12}$/.test(videoId)) {
                    return (
                      <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                        <p className="font-medium mb-1">Invalid YouTube Video ID</p>
                      </div>
                    );
                  }
 
                  const embedUrl = createYouTubeEmbedUrl(videoId);
 
                  return (
                    <iframe
                      width={dimensions.width}
                      height={dimensions.height}
                      src={embedUrl}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      className={isShorts ? "" : "w-full"}
                      loading="lazy"
                      onError={(e) => {
                        console.error('YouTube iframe failed to load:', e);
                      }}
                    />
                  );
                } catch (error) {
                  console.error('Error rendering YouTube video:', error);
                  return (
                    <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                      <p className="font-medium mb-1">Error Loading YouTube Video</p>
                    </div>
                  );
                }
              })()
            ) : (
              <ImageWithFallback
                src={message.content}
                alt="message image"
                width={500}
                height={500}
                className="object-cover w-full"
              />
            )}
          </div>
        )}
      </div>
      {/* Avatar for Player */}
      {message.sent_by_user && (
        <div className="ml-3 flex-shrink-0">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-purple-500/30 shadow-sm">
            <ImageWithFallback
              src={player}
              alt="User Avatar"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}