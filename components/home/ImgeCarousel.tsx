import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    "/img/video_thumb.jpg",
    "/img/video_thumb1.jpg", 
    "/img/video_thumb2.jpg",
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="hidden lg:block relative w-full mx-auto lg:mx-0 mt-0 lg:w-1/2 h-[500px] overflow-hidden  bg-black rounded-2xl animate-glow">
      <style jsx>{`
        @keyframes glow {
          0% {
            box-shadow: 0 0 20px rgba(112, 57, 255, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(112, 57, 255, 0.5);
          }
          100% {
            box-shadow: 0 0 20px rgba(112, 57, 255, 0.3);
          }
        }
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
      `}</style>

      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img 
            src={images[currentIndex]} 
            alt={`Slide ${currentIndex + 1}`}
            className="w-full h-full object-cover opacity-70 rounded-2xl"
          />
        </motion.div>
      </AnimatePresence>

      <button 
        onClick={prevSlide}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/30 hover:bg-black/50 p-2 rounded-full z-10"
      >
        <ChevronLeft className="text-white" size={32} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/30 hover:bg-black/50 p-2 rounded-full z-10"
      >
        <ChevronRight className="text-white" size={32} />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex 
                ? 'bg-white' 
                : 'bg-gray-500 hover:bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;