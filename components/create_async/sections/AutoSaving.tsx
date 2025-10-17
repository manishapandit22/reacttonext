import { useGameContext } from '@/contexts/GameContext'
import React from 'react'

const AutoSaving = () => {
  const { saving } = useGameContext();
  if (!saving) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-5 px-7 py-4 rounded-3xl shadow-3xl bg-white/80 dark:bg-jacarta-900/90 border border-jacarta-200 dark:border-jacarta-700/60 backdrop-blur-2xl animate-fade-in-up">
      <div className="relative flex items-center justify-center w-10 h-10">
        <span className="absolute inline-flex h-full w-full rounded-full bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 opacity-30 animate-pulse"></span>
        <svg className="relative z-10 animate-spin-modern" width="32" height="32" viewBox="0 0 44 44" fill="none">
          <defs>
            <linearGradient id="modern-spinner" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="0.5" stopColor="#A21CAF" />
              <stop offset="1" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          <circle
            cx="22"
            cy="22"
            r="18"
            stroke="url(#modern-spinner)"
            strokeWidth="4"
            strokeDasharray="90"
            strokeDashoffset="60"
            strokeLinecap="round"
            opacity="0.7"
          />
          <circle
            cx="22"
            cy="22"
            r="18"
            stroke="url(#modern-spinner)"
            strokeWidth="4"
            strokeDasharray="30"
            strokeDashoffset="0"
            strokeLinecap="round"
            opacity="1"
          />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-jacarta-900 dark:text-white font-bold text-lg tracking-wide animate-gradient-text-modern bg-gradient-to-r from-blue-700 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Auto-saving
        </span>
        <span className="text-jacarta-500 dark:text-jacarta-200 text-xs mt-0.5 tracking-wide">
          Your changes are being saved
        </span>
      </div>
      <style jsx>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes spin-modern {
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-spin-modern {
          animation: spin-modern 0.9s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes gradient-text-modern {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-text-modern {
          background-size: 200% 200%;
          animation: gradient-text-modern 2.2s ease-in-out infinite;
        }
        .shadow-3xl {
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18), 0 1.5px 4px 0 rgba(0,0,0,0.08);
        }
        .backdrop-blur-2xl {
          backdrop-filter: blur(18px);
        }
      `}</style>
    </div>
  );
};

export default AutoSaving