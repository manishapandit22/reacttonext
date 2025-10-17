"use client"

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, X, Play, Link2, Twitter, Facebook, Instagram } from "lucide-react";

interface Game {
  title: string;
  description: string;
  thumbnailUrl: string;
  gameUrl: string;
}

interface GameCreatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  game?: Game;
}

const GameCreatedModal: React.FC<GameCreatedModalProps> = ({ isOpen, onClose, game }) => {
  const defaultGame: Game = {
    title: "Cosmic Adventure",
    description: "Explore the vast universe in this epic space adventure game.",
    thumbnailUrl: "https://i.pinimg.com/736x/da/91/de/da91dea7887b453d6ed9d3b65cf87b5d.jpg",
    gameUrl: "https://example.com/game/cosmic-adventure",
  };

  const gameData: Game = game || defaultGame;
  
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  
  const copyToClipboard = (): void => {
    navigator.clipboard.writeText(gameData.gameUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };
  
  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.9,
      y: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { 
        duration: 0.2 
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />
          
          <motion.div
            className="relative w-full max-w-lg mx-4 overflow-hidden rounded-2xl bg-white shadow-2xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="relative">
              <img 
                src={gameData.thumbnailUrl} 
                alt={gameData.title} 
                className="w-full h-48 object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-2xl font-bold text-white">{gameData.title}</h3>
              </div>
              
              <button 
                onClick={onClose}
                className="absolute top-3 right-3 p-1 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-600">{gameData.description}</p>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                  <Link2 size={18} className="text-gray-500" />
                  <p className="text-sm text-gray-600 truncate flex-1">{gameData.gameUrl}</p>
                  <button 
                    onClick={copyToClipboard}
                    className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                  >
                    {linkCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-lg text-white font-medium bg-[#363a5d] hover:bg-[#42467d] transition-colors shadow-lg"
                >
                  <Play size={20} />
                  <span>Play Now</span>
                </motion.button>
                
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                    <Share2 size={16} />
                    <span>Share your game</span>
                  </p>
                  
                  <div className="flex gap-3 justify-center">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors"
                    >
                      <Twitter size={20} />
                    </motion.button>
                    
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-full bg-[#4267B2]/10 text-[#4267B2] hover:bg-[#4267B2]/20 transition-colors"
                    >
                      <Facebook size={20} />
                    </motion.button>
                    
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-full bg-gradient-to-br from-[#833AB4]/10 via-[#FD1D1D]/10 to-[#FCAF45]/10 text-[#E1306C] hover:bg-gradient-to-br hover:from-[#833AB4]/20 hover:via-[#FD1D1D]/20 hover:to-[#FCAF45]/20 transition-colors"
                    >
                      <Instagram size={20} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Success badge */}
            <div className="absolute top-3 left-3">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-lg flex items-center gap-1"
              >
                Game Created
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GameCreatedModal;