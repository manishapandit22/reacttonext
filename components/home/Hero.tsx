"use client";
import Link from "next/link";
import { HiSparkles } from "react-icons/hi2";
import { FaGamepad, FaArrowRight } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import HeroInfo from "./HeroInfo";
import Carousel from "./ImgeCarousel";
import GameNavigator from "./GameNavigator";
import Button from "../ui/Button";

export default function Hero() {

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if(window.innerWidth <= 728){
        setIsMobile(true);
      }
      else setIsMobile(false);
    };

    if (!document.querySelector('#hero-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'hero-animation-styles';
      style.innerHTML = `
        .stats-item {
          position: relative;
        }
        
        .stats-item:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0;
          top: 25%;
          height: 50%;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(112, 57, 255, 0.3), transparent);
        }
        
        .title-underline {
          position: relative;
          display: inline-block;
        }
        
        .title-underline::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0.1em;
          height: 0.15em;
          background-color: rgba(112, 57, 255, 0.7);
          z-index: -1;
          border-radius: 2px;
        }
        
        .game-choice-button {
          transition: all 0.2s ease-out;
        }
        
        .game-choice-button:hover {
          transform: translateX(4px);
        }
        
        .hero-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at 80% 20%,
            rgba(112, 57, 255, 0.12) 0%,
            rgba(25, 25, 50, 0) 50%
          );
        }
        
        .game-preview {
          position: relative;
        }
        
        .game-preview::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(130deg, rgba(112, 57, 255, 0.5), transparent 40%, transparent 60%, rgba(112, 57, 255, 0.2) 100%);
          border-radius: 12px;
          z-index: -1;
          opacity: 0.3;
        }
        
        .open-world-games {
          white-space: nowrap;
        }
        
        /* Responsive typography */
        @media (max-width: 640px) {
          .hero-title {
            font-size: 2.25rem !important;
            line-height: 1.2 !important;
          }
          
          .stats-value {
            font-size: 1.25rem !important;
          }
          
          .stats-item p.text-xs {
            font-size: 0.65rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .hero-title {
            font-size: 2rem !important;
          }
          
          .hero-subtitle {
            font-size: 0.9rem !important;
          }
        }
        
        @media (max-width: 374px) {
          .hero-title {
            font-size: 1.75rem !important;
          }
          
          .stats-value {
            font-size: 1rem !important;
          }
          
          .stats-item p.text-xs {
            font-size: 0.6rem !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    handleResize();
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className="hero relative py-10 sm:py-10 md:pt-16 lg:pt-24 mt-8 md:mt-0 overflow-hidden bg-[#0b0b19]">
      {/* Premium background with depth and subtle gradient effects */}
      <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-jacarta-800 to-[#0b0b19] opacity-80 -z-10"></div>
      <div className="hero-bg -z-10"></div>
      
      {/* Ambient lighting effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[5%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] opacity-30"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] opacity-20"></div>
      </div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-10 md:gap-16 pt-6 sm:pt-10 md:pt-16">
          {/* Left column: Enhanced text content */}
          <div className="mx-auto lg:mx-0 max-w-xl flex flex-col text-center lg:text-left lg:w-2/5">
            {/* Premium hero title with refined spacing */}
            <div className="mb-4 sm:mb-6 lg:mb-8 relative">
              <h1 className="hero-title font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white font-bold leading-tight tracking-tight">
                <span className="text-white block text-nowrap">Turn Your Writing Into</span>
                <span className="text-white block mt-1 sm:mt-2">
                  <span className="title-underline text-accent font-extrabold open-world-games">Open-World Games</span>
                </span>
              </h1> 
              
              {/* Subtle accent line */}
              <div className="hidden lg:block absolute left-[-5%] top-[10%] bottom-[10%] w-1 bg-gradient-to-b from-accent via-accent/50 to-transparent"></div>
            </div>

            <div className="grid mb-8 sm:mb-10 lg:mb-12 grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 lg:p-6 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/10 shadow-xl hover:border-accent/20 transition-all duration-300">
              <div className="stats-item text-center px-1 sm:px-2">
                <p className="stats-value text-lg sm:text-xl md:text-2xl lg:text-3xl font-display text-accent font-bold xl:text-nowrap">40-60%</p>
                <p className="text-xs sm:text-sm text-white/70">Royalities to Creators</p>
              </div>
              <div className="stats-item text-center px-1 sm:px-2">
                <p className="stats-value text-lg sm:text-xl md:text-2xl lg:text-3xl font-display text-accent font-bold">FREE</p>
                <p className="text-xs sm:text-sm text-white/70">To Create</p>
              </div>
              <div className="stats-item text-center px-1 sm:px-2">
                <span className="flex flex-row gap-1 justify-center items-center">
                <p className="stats-value text-lg sm:text-xl md:text-2xl lg:text-3xl text-accent font uppercase">#</p>
                <p className="stats-value text-lg sm:text-xl md:text-2xl lg:text-3xl font-display text-accent font uppercase font-extrabold">1</p>
                </span>
                <p className="text-xs sm:text-sm text-white/70">AI-Game Engine</p>
              </div>
              <div className="stats-item text-center px-1 sm:px-2">
                <p className="stats-value text-lg sm:text-xl md:text-2xl lg:text-3xl font-display text-accent font-bold">1000s</p>
                <p className="text-xs sm:text-sm text-white/70">Of Playthroughs</p>
              </div>
            </div>

            <div className="md:hidden mb-4">
              <GameNavigator />
            </div>

            <span className="hero-subtitle block mb-3 sm:mb-4 text-sm sm:text-md md:text-lg lg:text-xl font-semibold text-accent">
              Celebrate your creative worlds with Generative Adventures always anchored in your style and lore.
            </span>
            
            {/* Premium description with improved wording */}
            <div className="mb-5 sm:mb-6 lg:mb-8 text-sm sm:text-base text-white/80 leading-relaxed max-w-xl mx-auto lg:mx-0">
              <span className="block mb-3 sm:mb-4 font-medium">
                Self-Publish your first game on OpenBook.
              </span>
              <span className="block mb-3 sm:mb-4 text-white/70 opacity-90">
                OpenBook is a path-finding & game engine for your stories. It lets readers explore stories with 
                freedom but within the frame, boundaries, and guidance of your stories.
              </span>
              <span className="block font-medium text-accent/90">
                <span className="block mt-2 text-white/80">
                  Stake your claim and expand your audience.
                </span>
              </span>
            </div>
             
            {/* Modified buttons positioned on opposite sides */}
            <div className="flex flex-col md:flex-row justify-between w-full gap-3 sm:gap-4 md:max-w-72 items-center lg:justify-between mb-6 sm:mb-8 lg:mb-10">
              <Link href="/games" className="min-w-full">
                <Button className="flex min-w-full min-h-[42px] sm:min-h-[48px] md:h-auto items-center gap-2 text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-3.5 bg-accent transition-all text-center shadow-md ease-linear hover:shadow-lg hover:bg-accent-dark shadow-accent/20 duration-300 hover:translate-y-[-2px]">
                  <HiSparkles className="text-lg sm:text-xl" />
                  Play Games
                </Button>
              </Link>
              <Link href="/create" className="min-w-full hidden sm:block">
                <Button className="flex min-w-full min-h-[42px] sm:min-h-[48px] md:h-auto items-center gap-2 text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-3.5 animate-gradient--no-text-fill animate-gradient overflow-hidden !bg-clip-border transition-all text-center shadow-md ease-linear hover:shadow-lg hover:bg-accent-dark shadow-accent/20 duration-300 hover:translate-y-[-2px]">
                  Create a Game
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Right column: Game navigator */}
          {!isMobile && <GameNavigator />}
        </div>
      </div>
    </section>
  );
}