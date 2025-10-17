"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiMinimize2, FiX } from "react-icons/fi";

// Import the actual canvas page content
import ProtectedPage from "@/app/canvas/page";

const CanvasViewer = ({ isOpen, onToggle, isFullscreen, onToggleFullscreen, isEmbedded = false }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    if (onToggle) onToggle();
  };

  const handleToggleFullscreen = () => {
    if (onToggleFullscreen) onToggleFullscreen();
  };

  const handleClose = () => {
    if (onToggle) onToggle();
  };

  // Resize functionality for embedded mode
  const handleMouseDown = (e) => {
    if (!isEmbedded) return;
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(e.currentTarget.parentElement.offsetWidth);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = useCallback((e) => {
    if (!isResizing || !isEmbedded) return;
    
    const deltaX = startX - e.clientX;
    const newWidth = startWidth + deltaX;
    
    // Minimum and maximum width constraints
    const minWidth = 300;
    const maxWidth = window.innerWidth * 0.8;
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      const canvasContainer = document.querySelector('.canvas-container');
      if (canvasContainer) {
        canvasContainer.style.width = `${newWidth}px`;
      }
    }
  }, [isResizing, isEmbedded, startX, startWidth]);

  const handleMouseUp = useCallback(() => {
    if (!isEmbedded) return;
    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [isEmbedded]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // If in fullscreen mode, render the standalone version
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[999] bg-black">
        <div className="h-full w-full">
          <ProtectedPage />
        </div>
        <button
          onClick={handleToggleFullscreen}
          className="absolute top-4 right-4 p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          title="Exit Fullscreen"
        >
          <FiMinimize2 className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // If embedded mode, render the ChatGPT-style panel
  if (isEmbedded) {
    return (
      <div className="h-full flex flex-col bg-slate-900 dark:bg-jacarta-900 border-l border-purple-900/30">
        {/* Header */}
        <div className="bg-gray-900 text-white p-3 border-b border-purple-900/30 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-semibold text-sm ml-2">3D Game View</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleFullscreen}
              className="p-1.5 rounded-lg bg-black/30 text-white hover:bg-black/50 transition-all duration-200"
              title="Enter Fullscreen"
            >
              <FiMaximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg bg-black/30 text-white hover:bg-black/50 transition-all duration-200"
              title="Close"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="w-1 bg-purple-900/30 hover:bg-purple-500/50 cursor-col-resize transition-colors duration-200"
          onMouseDown={handleMouseDown}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full w-full">
            <ProtectedPage />
          </div>
        </div>
      </div>
    );
  }

  // Legacy sidebar mode (for backward compatibility)
  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 40,
      },
    },
    closed: {
      x: 400,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 40,
      },
    },
  };

  const contentVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1,
        duration: 0.4,
        ease: "easeOut",
      },
    },
    closed: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <>
      {/* Toggle Button for Mobile/Tablet */}
      <AnimatePresence>
        {!isOpen && (
          <div className="lg:hidden fixed top-5 right-4 z-[1001]">
            <button
              onClick={onToggle}
              className="group w-10 h-10 rounded-full text-white flex justify-center items-center font-medium transition-all duration-300 hover:scale-105 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:opacity-50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 opacity-95 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out rounded-full"></div>
              <div className="relative z-10 flex items-center justify-center">
                <FiChevronLeft className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-12" />
              </div>
            </button>
          </div>
        )}
      </AnimatePresence>

      {/* Main 3D Viewer Sidebar */}
      <motion.aside
        className={`z-[1000] fixed right-0 h-full w-[800px] ${!isOpen && "hidden"} lg:block`}
        variants={sidebarVariants}
        initial="open"
        animate={isOpen ? "open" : "closed"}
      >
        <div className="h-full bg-slate-900 dark:bg-jacarta-900 flex flex-col border-l border-purple-900/30 shadow-xl relative">
          {/* Header */}
          <div className="bg-gray-900 text-white p-4 border-b border-purple-900/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-semibold text-sm ml-2">3D Game View</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleToggleFullscreen}
                className="p-2 rounded-lg bg-black/30 text-white hover:bg-black/50 transition-all duration-200"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <FiMinimize2 className="w-4 h-4" />
                ) : (
                  <FiMaximize2 className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={handleToggle}
                className="p-2 rounded-lg bg-black/30 text-white hover:bg-black/50 transition-all duration-200"
                title={isCollapsed ? "Expand" : "Collapse"}
              >
                {isCollapsed ? (
                  <FiChevronLeft className="w-4 h-4" />
                ) : (
                  <FiChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            <motion.div
              className="h-full w-full"
              variants={contentVariants}
              initial="closed"
              animate="open"
            >
              <ProtectedPage />
            </motion.div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default CanvasViewer; 