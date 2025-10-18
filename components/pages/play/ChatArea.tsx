import { useState, useEffect, useRef } from "react";
import Message from "./Message";
import useUserCookie from "@/hooks/useUserCookie";
import D20Dice from "./Dice";
import { randomNumber } from "@/utils/randomNumber";
import Image from "next/image";
import SettingsButton from "./SettingsButton";
import { useTTS } from "./TTSContext";

export default function ChatArea({
  OnClick,
  IsOpen,
  messages,
  isNewStory,
  setMessages,
  highlightDice,
  setSidebarOpen,
  onSuggestionClick,
  suggestions,
  dicePlay,
  currentFace,
  setCurrentFace,
  diceRolling,
  setDiceRolling,
  getAnswer,
  selectedVoice,
  audioModelEnabled,
  setInputText,
  onSendMessage,
  setHighlightDice,
  character,
  isHistoryLoad = false,
  initialMessageCount,
  setInitialMessageCount,
  resetHistoryLoadFlag,
  onScrolledToTop,
  isBrandNewStory = false,
  settingsModalOpen,
  setSettingsModalOpen,
}) {
  const [hasInitialAutoPlay, setHasInitialAutoPlay] = useState(false);
  const { ttsStatus, error: ttsError, clearError } = useTTS();

  useEffect(() => {
    if (highlightDice) {
      const timeout = setTimeout(() => {
        setHighlightDice(false);
      }, 6500);
      return () => clearTimeout(timeout);
    }
  }, [highlightDice, setHighlightDice]);

  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const user = useUserCookie();
  const [sidebarOpen, setSidebarOpenLocal] = useState(true);
  
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [showDiceResult, setShowDiceResult] = useState(false);
  const [hasHandledNewStory, setHasHandledNewStory] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [lastMessagesLength, setLastMessagesLength] = useState(0); 
  const scrollTimeoutRef = useRef(null);
  const loadingCheckIntervalRef = useRef(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const character_avatar = "/img/logo.png";
  const user_avatar =
    user?.profile_photo ??
    "https://storage.googleapis.com/kraken_char/undefined_char.png";
    const player_avatar = character.image?.url ?? 
    "https://storage.googleapis.com/kraken_char/undefined_char.png";

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 0;
      chatContainerRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      });

      chatContainerRef.current.offsetHeight;

      if (chatContainerRef.current.scrollTop !== 0) {
        chatContainerRef.current.scrollTop = 0;
      }
    }
  };

  const checkContentLoaded = () => {
    if (!chatContainerRef.current) return false;
    
    const images = chatContainerRef.current.querySelectorAll('img');
    const iframes = chatContainerRef.current.querySelectorAll('iframe');
    
    const imagesLoaded = Array.from(images).every(img => 
      img.complete && img.naturalHeight !== 0
    );
    
    const iframesLoaded = Array.from(iframes).every(iframe => 
      iframe.contentDocument || iframe.src
    );
    
    return imagesLoaded && iframesLoaded;
  };

  const scrollToBottomWhenReady = () => {
    if (hasScrolledToBottom) return;

    const attemptScroll = () => {
      if (checkContentLoaded()) {
        setContentLoaded(true);
        setTimeout(() => {
          scrollToBottom();
          setHasScrolledToBottom(true);
        }, 100); 
        
        if (loadingCheckIntervalRef.current) {
          clearInterval(loadingCheckIntervalRef.current);
          loadingCheckIntervalRef.current = null;
        }
      }
    };

    attemptScroll();

    if (!contentLoaded && !loadingCheckIntervalRef.current) {
      loadingCheckIntervalRef.current = setInterval(attemptScroll, 200);
      
      setTimeout(() => {
        if (!hasScrolledToBottom) {
          scrollToBottom();
          setHasScrolledToBottom(true);
          if (loadingCheckIntervalRef.current) {
            clearInterval(loadingCheckIntervalRef.current);
            loadingCheckIntervalRef.current = null;
          }
        }
      }, 3000);
    }
  };

  const rollDice = () => {
    setDiceRolling(true);
    setShowDiceResult(true);
    let face;

    do {
      face = randomNumber(1, 20);
    } while (face === currentFace);

    onSuggestionClick?.(`I rolled ${face.toString()}`);

    setTimeout(() => {
      setCurrentFace(face);
    }, 1000);

    setTimeout(() => {
      setDiceRolling(false);
    }, 2000);

    setTimeout(() => {
      setShowDiceResult(false);
    }, 5000);
  };

  const handleSetInputText = (text) => {
    if (setInputText) {
      setInputText(text);
    }
    if (onSendMessage) {
      onSendMessage(text);
    }
  };

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpenLocal(newState);
    if (setSidebarOpen) {
      setSidebarOpen(newState);
    }
  };

  useEffect(() => {
    const currentMessageLength = messages?.length || 0;
    
    if (isNewStory || (currentMessageLength !== lastMessagesLength && currentMessageLength > 0)) {
      setHasInitialAutoPlay(false);
      setHasScrolledToBottom(false);
      setContentLoaded(false);
      setInitialMessageCount(0);
      
      setLastMessagesLength(currentMessageLength);
    }
  }, [isNewStory, messages?.length, lastMessagesLength, initialMessageCount, setInitialMessageCount]);

  useEffect(() => {
    if (isNewStory && !hasHandledNewStory) {
      if (typeof window !== 'undefined') {
        window.__opener_tts_played = false;
      }
      setHasHandledNewStory(true);
      scrollToTop();

      const scrollWithAnimation = () => {
        requestAnimationFrame(() => {
          scrollToTop();
          requestAnimationFrame(() => {
            scrollToTop();
          });
        });
      };

      scrollWithAnimation();

      const timeouts = [10, 50, 100, 200, 500].map(delay =>
        setTimeout(scrollToTop, delay)
      );

      return () => {
        timeouts.forEach(timeout => clearTimeout(timeout));
      };
    } else if (!isNewStory) {
      setHasHandledNewStory(false);
    }
  }, [isNewStory, hasHandledNewStory]);

  useEffect(() => {
    if (isHistoryLoad && messages?.length > 0) {
      setInitialMessageCount(messages.length);
      setIsLoadingHistory(true);
    } else {
      setIsLoadingHistory(false);
    }
  }, [isHistoryLoad, messages, initialMessageCount, setInitialMessageCount]);

  useEffect(() => {
    if (isLoadingHistory && !hasScrolledToBottom) {
      scrollToBottomWhenReady(); 
      if (resetHistoryLoadFlag) resetHistoryLoadFlag();
    }
  }, [isLoadingHistory, hasScrolledToBottom, messages, resetHistoryLoadFlag]);

  useEffect(() => {
    if (isBrandNewStory && messages?.length > 0) {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        if (onScrolledToTop) onScrolledToTop();
      }
    }
  }, [isBrandNewStory, messages, onScrolledToTop]);

  useEffect(() => {
    if (isHistoryLoad && !isBrandNewStory && messages?.length > 0) {
      scrollToBottomWhenReady();
      if (resetHistoryLoadFlag) resetHistoryLoadFlag();
    }
  }, [isHistoryLoad, isBrandNewStory, messages, resetHistoryLoadFlag]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (loadingCheckIntervalRef.current) {
        clearInterval(loadingCheckIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let timeoutId;
    if (getAnswer) {
      timeoutId = setTimeout(() => {
        setDiceRolling(false);
        setShowDiceResult(false);
      }, 10000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [getAnswer]);

  const getFirstNonUserMessageIndex = () => {
    if (!messages || !isNewStory) return -1;
    return messages.findIndex(msg => !msg.sent_by_user);
  };

  return (
    <div
      ref={chatContainerRef}
      className="pt-24 flex-1 overflow-y-auto bg-white dark:bg-transparent p-4 w-full mx-auto md:max-w-4xl relative"
    >
      {/* TTS Status Indicator removed per user preference */}
      {messages?.map((message, index) => {
        const firstNonUserIndex = getFirstNonUserMessageIndex();
        const isFirstNonUserMessage = isNewStory && index === firstNonUserIndex;
        // const isFirstInResponse = !message.sent_by_user && 
        // (index === 0 || messages[index - 1]?.sent_by_user);
        
        return (
          <Message
            key={`${message.id || index}-${message.content?.slice(0, 50)}`} 
            player={player_avatar}
            message={message}
            character_avatar={character_avatar}
            user_avatar={user_avatar}
            scrollToBottom={scrollToBottom}
            diceRolling={index === messages.length - 2 ? diceRolling : false}
            selectedVoice={selectedVoice}
            audioModelEnabled={audioModelEnabled}
            isLast={index === messages.length - 1}
            isNewStory={isFirstNonUserMessage} 
            // isFirstInResponse={isFirstInResponse}
            messageIndex={!message.sent_by_user ? index : undefined} 
          />
        );
      })}
      {showDiceResult && (
        <div className="flex items-center justify-center mt-6 mb-6 relative">
          <div className="absolute inset-0 bg-amber-400/10 rounded-full blur-xl pointer-events-none"></div>
          <D20Dice currentFace={currentFace} diceRolling={diceRolling} />
        </div>
      )}

      {suggestions && (
        <div className="flex gap-2 flex-wrap w-full items-stretch mt-4">
          <div className="flex items-center justify-center" style={{ opacity: 1, transform: "none" }}>
            <button
              onClick={toggleSidebar}
              className="group px-3 py-2  text-white flex justify-center font-medium transition-all duration-300 hover:scale-105 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:opacity-50 text-left rounded-lg text-xs flex-1 gap-1.5 sm:flex-col w-full h-full  items-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 opacity-95 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>

              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-1 left-1 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-pulse"></div>
                <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-pulse delay-150"></div>
                <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-pink-300 rounded-full animate-pulse delay-300"></div>
                <div className="absolute bottom-1 right-1 w-0.5 h-0.5 bg-green-300 rounded-full animate-pulse delay-500"></div>
              </div>

              <div className="absolute inset-0 rounded-lg border border-white/30 group-hover:border-white/60 transition-colors duration-300"></div>

              <div className="relative z-10 flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-white transition-transform duration-300 group-hover:rotate-12"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H6v-2h6v2zm3-4H6v-2h9v2zm0-4H6V7h9v2z" />
                </svg>
                <span className="font-medium">Menu</span>
              </div>

              <div className="absolute inset-0 rounded-lg opacity-0 group-active:opacity-100 transition-opacity duration-150">
                <div className="absolute inset-0 bg-white/20 rounded-lg animate-ping"></div>
              </div>
            </button>
          </div>
          <div
            className="flex block"
            style={{ opacity: 1, transform: "none" }}
          >
            <button
              onClick={() => handleSetInputText("next")}
              className="px-3 py-1.5 h-full text-white inline-flex font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:opacity-50 text-left rounded-lg text-xs flex-1 gap-1.5 sm:flex-col w-full h-auto justify-start items-center bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 hover:from-purple-400 hover:via-purple-500 hover:to-purple-600 shadow-md hover:shadow-lg hover:shadow-purple-500/20 border border-purple-500/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Next</span>
            </button>
          </div>

          <div
            className="flex block"
            style={{ opacity: 1, transform: "none" }}
          >
            <button
              onClick={() => handleSetInputText("Provide more information")}
              className="px-3 py-1.5 h-full text-white inline-flex font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:opacity-50 text-left rounded-lg text-xs flex-1 gap-1.5 sm:flex-col w-full h-auto justify-start items-center bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:from-blue-400 hover:via-blue-500 hover:to-blue-600 shadow-md hover:shadow-lg hover:shadow-blue-500/20 border border-blue-500/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">More info</span>
            </button>
          </div>

          <div
            className="flex block"
            style={{ opacity: 1, transform: "none" }}
          >
            <button
              onClick={() => handleSetInputText("talk")}
              className="px-3 py-1.5 h-full text-white inline-flex font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:opacity-50 text-left rounded-lg text-xs flex-1 gap-1.5 sm:flex-col w-full h-auto justify-start items-center bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 hover:from-teal-400 hover:via-teal-500 hover:to-teal-600 shadow-md hover:shadow-lg hover:shadow-teal-500/20 border border-teal-500/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Talk</span>
            </button>
          </div>

          <div
            key={"gen-image"}
            className="flex items-center"
            style={{ opacity: 1, transform: "none" }}
          >
            <button
              onClick={() => handleSetInputText("Show me a picture of the scene. 🖼️")}
              className="px-3 py-1.5 h-full text-white inline-flex font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:opacity-50 text-left rounded-lg text-xs flex-1 gap-1.5 sm:flex-col w-full h-auto justify-start items-center bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 hover:from-pink-400 hover:via-pink-500 hover:to-pink-600 shadow-md hover:shadow-lg hover:shadow-pink-500/20 border border-pink-500/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Scene</span>
            </button>
          </div>

          <div className="flex items-center justify-center">
            <button
              type="button"
              name="roll"
              id="roll"
              className={`px-3 py-1.5 h-full text-white inline-flex font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:opacity-50 text-left rounded-lg text-xs flex-1 gap-1.5 sm:flex-col w-full h-auto justify-start items-center bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:via-amber-500 hover:to-amber-600 shadow-md hover:shadow-lg hover:shadow-amber-500/20 border border-amber-500/30 relative overflow-hidden group ${highlightDice ? 'animate-pulse' : ''
                }`}
              onClick={rollDice}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-400 to-amber-300 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>

              {highlightDice && (
                <>
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-lg blur-sm animate-pulse opacity-75 z-0"></div>

                  <div className="absolute inset-0 rounded-lg border-2 border-yellow-400 animate-pulse opacity-80 z-10"></div>

                  <div className="absolute inset-0 opacity-100 z-10">
                    <div className="absolute top-1 left-1 w-1 h-1 bg-yellow-300 rounded-full animate-ping"></div>
                    <div className="absolute top-1 right-1 w-1 h-1 bg-orange-300 rounded-full animate-ping animation-delay-150"></div>
                    <div className="absolute bottom-1 left-1 w-1 h-1 bg-red-300 rounded-full animate-ping animation-delay-300"></div>
                    <div className="absolute bottom-1 right-1 w-1 h-1 bg-yellow-300 rounded-full animate-ping animation-delay-500"></div>
                  </div>

                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-400/30 to-orange-400/30 animate-ping z-10"></div>
                </>
              )}

              <div className="relative z-30 flex items-center gap-1.5">
                <Image src={"/20dice.png"} alt="" height={25} width={25} />
                <span className="font-medium">Dice</span>
              </div>
            </button>
          </div>
      
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex block"
              style={{ opacity: 1, transform: "none" }}
            >
              <button
                onClick={() =>
                  onSuggestionClick?.(
                    suggestion.title + " " + suggestion.subtitle
                  )
                }
                className="flex px-3 py-1.5 h-full text-white inline-flex font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:opacity-50 text-left rounded-lg text-xs flex-1 gap-1 sm:flex-col w-full h-auto justify-center items-start bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-400 hover:via-indigo-500 hover:to-indigo-600 shadow-md hover:shadow-lg hover:shadow-indigo-500/20 border border-indigo-500/30"
              >
                <span className="font-medium flex items-center justify-center bg-white/20 w-5 h-5 rounded-full leading-none">{index + 1}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <div ref={chatEndRef} />
          </div>
        );
}