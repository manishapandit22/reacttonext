import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MusicPlayer from "./MusicPlayer";
import {
  FiX,
  FiBookOpen,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiMusic,
} from "react-icons/fi";

export default function SettingsModal({
  isOpen,
  setIsOpen,
  stories = [],
  selectedStory = null,
  handleStoryChange = () => {},
  handleStartNewStory = () => {},
  handleUpdateStoryName = () => {},
  handleDeleteStory = () => {},
  selectedVoice = "",
  setSelectedVoice = () => {},
  audioModelEnabled = false,
  setAudioModelEnabled = () => {},
  groupedVoices = {},
  selectedMusic = null,
  musicList = [],
  setSelectedMusic = () => {},
}) {

  const modalVariants = {
    hidden: { 
      scale: 0.95, 
      opacity: 0,
      y: 20
    },
    visible: { 
      scale: 1, 
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.3
      }
    },
    exit: { 
      scale: 0.95, 
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.2
      }
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    },
  };

  if (!isOpen) return null;

  // Safety check to ensure stories is an array
  const safeStories = Array.isArray(stories) ? stories : [];
  
  // Safety check to ensure selectedStory is defined
  const safeSelectedStory = selectedStory && typeof selectedStory === 'object' ? selectedStory : null;

  // Safety check to ensure all required functions are available
  if (!handleStoryChange || !handleStartNewStory || !handleUpdateStoryName || !handleDeleteStory) {
    console.warn('SettingsModal: One or more required handler functions are missing');
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={overlayVariants}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
        onClick={() => setIsOpen(false)}
      >
        <motion.div
          variants={modalVariants}
          className="bg-slate-900 dark:bg-jacarta-900 rounded-2xl border border-purple-900/30 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-purple-900/30 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                Game Settings
              </h2>
              <motion.button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all duration-200 border border-purple-900/30 hover:border-purple-500/50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiX size={20} />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Stories Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="bg-black/30 p-6 rounded-xl border border-purple-900/30"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3 text-white">
                  <FiBookOpen className="text-purple-400 text-xl" />
                  <h3 className="text-lg font-semibold">Your Stories</h3>
                </div>
                <motion.button
                  onClick={handleStartNewStory}
                  className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-purple-900/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiPlus className="text-sm" />
                  <span>New Story</span>
                </motion.button>
              </div>
              
              <div className="space-y-3">
                <select
                  value={safeSelectedStory?.story_id || ""}
                  onChange={(e) => {
                    const selected = safeStories.find(
                      (story) => story.story_id === e.target.value
                    );
                    handleStoryChange(selected);
                  }}
                  className="w-full py-3 px-4 rounded-lg bg-black/40 text-white border border-purple-900/30 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select a story</option>
                  {safeStories?.map((story, index) => (
                    <option key={index} value={story.story_id}>
                      {story.name || `Story ${index + 1}`}
                    </option>
                  ))}
                </select>
                
                {safeSelectedStory && (
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => handleUpdateStoryName(safeSelectedStory.story_id)}
                      className="flex-1 py-2.5 rounded-lg bg-black/40 text-white hover:bg-black/60 transition-all duration-200 border border-purple-900/30 hover:border-purple-500/50 flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiEdit size={16} />
                      <span>Rename</span>
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteStory(safeSelectedStory.story_id)}
                      className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiTrash2 size={16} />
                      <span>Delete</span>
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Audio Narration Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="bg-black/30 p-6 rounded-xl border border-purple-900/30"
            >
              <div className="mb-4">
                <div className="flex items-center justify-between w-full mb-4">
                  <span className="text-lg font-semibold text-white flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-purple-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Audio Narration
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={audioModelEnabled}
                      onChange={(e) => setAudioModelEnabled(e.target.checked)}
                    />
                    <div className="w-12 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-purple-700"></div>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-white text-sm flex items-center gap-2">
                  <span className="text-purple-400">•</span> Select Voice
                </p>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full py-3 px-4 rounded-lg bg-black/40 text-white border border-purple-900/30 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  // disabled={!audioModelEnabled}
                >
                  {Object.entries(groupedVoices || {}).map(([category, voiceList]) => (
                    <optgroup key={category} label={category}>
                      {voiceList.map((voice) => (
                        <option key={voice.id} value={voice.id}>
                          {voice.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </motion.div>

            {/* Background Music Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="bg-black/30 p-6 rounded-xl border border-purple-900/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <FiMusic className="text-purple-400 text-xl" />
                <span className="text-lg font-semibold text-white">
                  Background Music
                </span>
              </div>
              <div className="bg-black/40 rounded-lg p-4">
                {musicList && Array.isArray(musicList) && setSelectedMusic ? (
                  <MusicPlayer
                    songUrl={selectedMusic?.url}
                    selectedMusic={selectedMusic}
                    musicList={musicList}
                    setSelectedMusic={setSelectedMusic}
                    title={selectedMusic?.name || "No Music Selected"}
                  />
                ) : (
                  <div className="text-gray-400 text-center py-4">
                    Music player not available
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-sm border-t border-purple-900/30 p-4 rounded-b-2xl">
            <div className="flex justify-end">
              <motion.button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Close
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}