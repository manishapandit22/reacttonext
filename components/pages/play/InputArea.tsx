"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FiSend, FiCreditCard, FiZap } from "react-icons/fi";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import useAxiosWithAuth from "@/hooks/useAxiosWithAuth";
import { toast } from "react-toastify";
import { useUser } from "@/contexts/UserContext";
import { useTTS } from "./TTSContext";

export default function InputArea({ onSendMessage, audioModelEnabled }) {
  const { axiosInstance, loading, error } = useAxiosWithAuth();
  const { getProfile, profile } = useUser();
  const { setTTSCompleteCallback } = useTTS(); 
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);

  const hasGamePoints = profile?.game_points > 0;

  const handleProcessedText = (text) => {
    if (text) {
      onSendMessage(text);
      setIsVoiceProcessing(false);
    }
  };

  const { isRecording, startRecording, stopAndProcess, stopAndDiscard } =
    useVoiceRecording(handleProcessedText, setIsVoiceProcessing);

  const latestValuesRef = useRef({
    audioModelEnabled,
    isRecording,
    isVoiceProcessing,
    startRecording
  });

  useEffect(() => {
    latestValuesRef.current = {
      audioModelEnabled,
      isRecording,
      isVoiceProcessing,
      startRecording
    };
    return()=>latestValuesRef.current = {}
  });

  const handleTTSComplete = useCallback(async () => {
    const { audioModelEnabled, isRecording, isVoiceProcessing, startRecording } = latestValuesRef.current;
    
    if (audioModelEnabled && !isRecording && !isVoiceProcessing) {
      try {
        console.log("Auto-starting voice recording..."); 
        await startRecording();
      } catch (error) {
        console.error("Error auto-starting voice recording:", error);
      }
    }
  }, []); 

  useEffect(() => {
    setTTSCompleteCallback(handleTTSComplete);
    
    return () => {
      setTTSCompleteCallback(null);
    };
  }, [setTTSCompleteCallback, handleTTSComplete]); 

  const handleVoiceInput = async () => {
    if (!hasGamePoints) {
      toast.error("You need game points to use voice input!", { autoClose: 2000 });
      return;
    }

    if (isRecording) {
      try {
        const response = await axiosInstance.post(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/points/deduct",
          {
            action: "stt",
          }
        );

        if (!response.data) {
          toast.error("Failed to process voice input", { autoClose: 2000 });
          setIsVoiceProcessing(false);
          stopAndDiscard();
          return;
        }
      } catch (error) {
        console.error("Error deducting points:", error);
        toast.error(
          error.response?.data?.message || "Failed to process voice input",
          { autoClose: 2000 }
        );
        setIsVoiceProcessing(false);
        stopAndDiscard();
        return;
      }
      getProfile(); 

      await stopAndProcess();
    } else {
      await startRecording();
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "90px"; 
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() === "") return;
    if (!hasGamePoints) {
      toast.error("You need game points to send messages!", { autoClose: 2000 });
      return;
    }

    onSendMessage(message);
    setMessage("");
  };

  // Move conditional logic after all hooks
  if (profile === undefined || profile === null) {
    return null; 
  }

  if (!hasGamePoints) {
    return (
      <div className="relative w-full bg-transparent px-5 pb-4 md:pb-6 mx-auto md:max-w-4xl">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-red-400/30 bg-gradient-to-br from-red-500/10 via-orange-500/10 to-yellow-500/10 backdrop-blur-sm mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 animate-pulse"></div>
          <div className="relative p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <FiZap className="text-yellow-400 w-8 h-8 animate-bounce" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2 animate-pulse">
              Oops! You're out of Game Points! ⚡
            </h3>
            
            <p className="text-gray-300 mb-4 leading-relaxed">
              <span className="inline-block animate-bounce delay-100">🎮</span>
              <span className="mx-2">You need game points to continue chatting and unlock amazing AI features!</span>
              <span className="inline-block animate-bounce delay-200">✨</span>
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 text-sm">
              <div className="bg-white/10 rounded-lg p-3 border border-white/20 backdrop-blur-sm">
                <div className="text-blue-400 mb-1">💬</div>
                <div className="text-white font-medium">AI Chat</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 border border-white/20 backdrop-blur-sm">
                <div className="text-green-400 mb-1">🎤</div>
                <div className="text-white font-medium">Voice Input</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 border border-white/20 backdrop-blur-sm">
                <div className="text-purple-400 mb-1">🔊</div>
                <div className="text-white font-medium">Text-to-Speech</div>
              </div>
            </div>
            
            <button
              onClick={() => { window.location.href = "/wallet"; }}
              className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <FiCreditCard className="w-5 h-5 group-hover:animate-pulse" />
              <span>Buy Game Points Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
            
            <div className="absolute top-8 right-8 w-1 h-1 bg-blue-400 rounded-full animate-ping delay-500"></div>
          </div>
        </div>
        
        <div className="relative rounded-3xl overflow-hidden shadow-md border border-gray-500/30 bg-gray-900/50 backdrop-blur-sm opacity-60">
          <div className="absolute inset-0 bg-gray-800/20 backdrop-blur-sm"></div>
          <textarea
            className="relative dark:text-gray-500 w-full border-none px-5 py-3 placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-0 cursor-not-allowed min-h-[24px] max-h-[calc(75vh)] overflow-hidden resize-none text-base bg-transparent"
            placeholder="Buy game points to start chatting..."
            disabled
            rows={2}
            style={{ height: "90px" }}
          />
          
          <div className="absolute bottom-3 right-2 flex items-center gap-2">
            <button
              className="flex items-center justify-center rounded-full w-11 h-10 bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-600/30"
              disabled
              title="Voice input disabled - Buy game points"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="23" height="24" fill="none"/>
                <path d="M11 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14Z" fill="currentColor"/>
                <path d="M16 11C17 13.76 14.76 16 12 16C9.24 16 7 13.76 7 11H5C5 14.53 7.61 17.43 11 17.93V21H13V17.93C16.39 17.43 19 14.53 19 11H17Z" fill="currentColor"/>
              </svg>
            </button>
            
            <button
              className="flex items-center justify-center rounded-full w-10 h-10 bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-600/30"
              disabled
              title="Send disabled - Buy game points"
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-transparent px-5 pb-4 md:pb-6 md:px-20 mx-auto md:max-w-4xl">
      <div className="relative rounded-3xl overflow-hidden shadow-md border border-gray-200/10 dark:border-purple-900/20 bg-white/5 backdrop-blur-sm">
        <textarea
          ref={textareaRef}
          className="dark:text-white w-full border-none px-5 py-3 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 min-h-[24px] max-h-[calc(75vh)] overflow-hidden resize-none text-base bg-transparent"
          placeholder="Send your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          spellCheck={false}
          style={{ height: "90px" }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault(); 
              handleSend();
            }
          }}
        />
        
        <div className="absolute bottom-3 right-2 flex items-center gap-2">
          <button
            onClick={handleVoiceInput}
            className={`flex items-center justify-center rounded-full w-11 h-10 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 shadow-md ${
              isRecording 
                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white border border-red-400' 
                : 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 text-gray-300 hover:text-white border border-purple-500/30 hover:border-purple-500/50'
            }`}
            title={isRecording ? "Stop Recording" : "Start Voice Recording"}
          >
            {isVoiceProcessing ? (
              <svg
                className="animate-spin h-6 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="-1 0 24 24"
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
            ) : isRecording ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="6" width="12" height="12" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="23" height="24" fill="none"/>
                <path d="M11 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14Z" fill="currentColor"/>
                <path d="M16 11C17 13.76 14.76 16 12 16C9.24 16 7 13.76 7 11H5C5 14.53 7.61 17.43 11 17.93V21H13V17.93C16.39 17.43 19 14.53 19 11H17Z" fill="currentColor"/>
              </svg>
            )}
          </button>
          
          <button
            className={`flex items-center justify-center rounded-full w-10 h-10 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 shadow-md ${
              message.trim() === ""
                ? "bg-gradient-to-br from-gray-600/80 to-gray-700/80 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-br from-purple-600 to-purple-700 text-white hover:from-purple-500 hover:to-purple-600 border border-purple-500/50"
            }`}
            onClick={handleSend}
            disabled={message.trim() === ""}
            title="Send Message"
          >
            <FiSend size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}