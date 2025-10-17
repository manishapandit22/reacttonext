import React from 'react';
import { PiGameControllerDuotone } from "react-icons/pi";

interface GameHeaderSectionProps {
  apiError: string;
  isEdit?: boolean;
}

const GameHeaderSection: React.FC<GameHeaderSectionProps> = ({ apiError, isEdit }) => {
  return (
    <div className="relative w-full flex flex-col items-center justify-center mb-8 animate-fade-in">
      <div className="w-full max-w-2xl mx-auto px-6 py-6 rounded-xl shadow-glass bg-white/10 dark:bg-jacarta-800/70 backdrop-blur-sm border border-white/10 dark:border-jacarta-700/40">
        <h2 className="flex items-center gap-3 text-xl md:text-2xl lg:text-4xl font-semibold tracking-tight text-accent mb-1">
          <span className="animate-bounce-slow">
            <PiGameControllerDuotone className="text-2xl lg:text-4xl text-accent-light opacity-80" />
          </span>
          {isEdit ? 'Edit Game' : 'Create New Game'}
        </h2>
        <p className="text-[15px] text-jacarta-600 dark:text-jacarta-100 font-medium mb-2 opacity-80">
          {isEdit ? 'Update your adventure with style. Modify the details below to enhance your world!' : 'Craft your adventure with style. Fill in the details below to bring your world to life!'}
        </p>
        {apiError && (
          <div
            id="alert-2"
            className="flex items-center p-3 mb-2 text-[#9b1c1c] rounded-lg bg-[#fdf2f2] dark:bg-[#1f2937] dark:text-[#f98080] border border-red-200 animate-fade-in"
            role="alert"
          >
            <svg
              className="flex-shrink-0 w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <span className="sr-only">Info</span>
            <div className="ms-3 text-sm font-medium">{apiError}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameHeaderSection;
