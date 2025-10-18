"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiSparkles } from "react-icons/hi2";
import { MdAttachMoney, MdEdit, MdPeople } from "react-icons/md";
import useUserCookie from "@/hooks/useUserCookie";
import  CreatorProfile  from "./CreatorProfile";
import Button from "../ui/Button";

// Custom animated benefit card component
const BenefitCard = ({ icon, title, description, delay = 0 ,isLink=false}) => {
  const cardRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.remove("opacity-0");
              entry.target.classList.add("opacity-100");
              entry.target.classList.add("translate-y-0");
            }, delay);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [delay]);

  const handleClick = ()=>{
    window.open("https://discord.com/channels/1308231363522199683/1336183521601130590", "_blank", "noopener noreferrer");
  }

  return (
    <div 
      ref={cardRef}
      className="bg-gradient-to-br from-jacarta-800 to-jacarta-900 p-6 rounded-xl border border-jacarta-600 shadow-xl opacity-0 translate-y-4 transform transition-all duration-700 ease-out hover:shadow-accent/20 hover:border-accent/50"
    >
    <div className="min-w-full flex items-center justify-center md:justify-normal md:items-start md:flex-none md:inline-flex">
      <div className="mb-4 rounded-xl bg-gradient-to-r from-accent to-purple-600 p-3">
        {isLink ? (
          <div onClick={handleClick} className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-jacarta-900">
            {icon}
          </div>
        ) : (
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-jacarta-900">
            {icon}
          </div>
        )}
      </div>
    </div>
      <h3 className="mb-3 text-center md:text-start font-display text-xl text-white">{title}</h3>
      <p className="text-jacarta-300 text-pretty md:text-start">{description}</p>
    </div>
  );
};

// Premium Immersive Story Transformation Experience
const StoryTransformation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const animationRef = useRef(null);
  
  // Animation frames for the story transformation
  const typingSequence = [
    "The ancient runes pulsed with an eerie blue light as Elara placed her palm against the stone door.",
    '"We shouldn\'t be here," whispered Koric, his hand resting nervously on his sword hilt.',
    "Elara turned to him with a determined look. &quot;The prophecy led us here. We have no choice.&quot;",
    "The door rumbled, ancient mechanisms awakening after centuries of silence..."
  ];
  
  // Game choices for the interactive experience
  const choices = [
    { id: 1, text: "Place your hand on the door and recite the ancient words", active: true },
    { id: 2, text: "Examine the runes more carefully before proceeding", active: false },
    { id: 3, text: "Ask Koric what he thinks about the prophecy", active: false },
  ];
  
  // Trigger transition animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTransition(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Auto-advance typing sequence
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovering) {
        setCurrentStep(prev => (prev < typingSequence.length - 1 ? prev + 1 : 0));
      }
    }, 3500);
    
    return () => clearInterval(interval);
  }, [isHovering]);

  return (
    <div 
      className="relative w-full h-full overflow-hidden rounded-xl border border-jacarta-600 shadow-xl"
      style={{
        background: "linear-gradient(135deg, #0c0c1d 0%, #151538 100%)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5), 0 0 50px rgba(112, 57, 255, 0.2) inset"
      }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-accent/5 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-purple-600/5 blur-3xl"></div>
      </div>
      
      {/* Left side / Top on mobile: Manuscript */}
      <div 
        className="md:absolute md:left-0 md:top-0 md:w-[47%] md:h-full bg-gradient-to-b from-jacarta-900 to-jacarta-800 backdrop-blur-sm md:border-r border-jacarta-700/30 p-5 w-full mb-4 md:mb-0 md:rounded-l-xl"
        style={{
          boxShadow: "0 0 30px rgba(0, 0, 0, 0.3) inset",
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="flex items-center justify-between border-b border-jacarta-700/70 pb-2 mb-3">
          <h3 className="text-white font-display text-lg">Your Manuscript</h3>
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-jacarta-700"></div>
            <div className="w-2 h-2 rounded-full bg-jacarta-700"></div>
            <div className="w-2 h-2 rounded-full bg-accent"></div>
          </div>
        </div>

        <div className="font-serif text-sm text-jacarta-200 space-y-4 h-[200px] md:h-auto overflow-y-auto pr-2 pt-2">
          <p className="text-accent font-semibold mb-6">Chapter 1: The Awakening</p>
          
          {typingSequence.map((line, index) => (
            <div key={index} className={`transition-all duration-500 ${index === currentStep ? 'opacity-100' : 'opacity-40'}`}>
              <p>
                {index === currentStep ? (
                  <span className="relative">
                    {line}
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-accent/0 via-accent/50 to-accent/0 animate-pulse"></span>
                  </span>
                ) : line}
              </p>
            </div>
          ))}
          
          <div className="text-jacarta-400 text-xs italic mt-4">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
              Writing in progress...
            </div>
          </div>
        </div>
      </div>

      {/* The transformation effect in the middle */}
      <div className={`hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-1000 ${showTransition ? 'opacity-100' : 'opacity-0'}`}>
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-xl bg-gradient-to-r from-accent/40 to-purple-600/40 animate-pulse-slow"></div>
          <div className="bg-gradient-to-r from-accent to-purple-600 rounded-full p-4 shadow-lg shadow-accent/30 relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white animate-magical-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </div>
          
          {/* Particles radiating out */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-1 h-1 rounded-full bg-accent animate-particle-out"
                style={{
                  top: '50%',
                  left: '50%',
                  animationDelay: `${i * 0.2}s`,
                  transform: `rotate(${i * 60}deg)`,
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile only: transition effect */}
      <div className="flex md:hidden justify-center -mt-2 mb-2">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-md bg-gradient-to-r from-accent/40 to-purple-600/40 animate-pulse-slow"></div>
          <div className="bg-gradient-to-r from-accent to-purple-600 rounded-full p-2 shadow-lg shadow-accent/30 relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Right side / Bottom on mobile: Interactive Game */}
      <div 
        className="md:absolute md:right-0 md:top-0 md:w-[47%] md:h-full bg-gradient-to-b from-jacarta-800 to-jacarta-900 p-5 w-full md:rounded-r-xl"
        style={{
          boxShadow: "0 0 30px rgba(0, 0, 0, 0.3) inset"
        }}
      >
        <div className="flex items-center justify-between border-b border-jacarta-700/70 pb-2 mb-3">
          <h3 className="text-white font-display text-lg">Interactive Experience</h3>
          <div className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">Live</div>
        </div>
        
        <div className="space-y-3 text-sm text-jacarta-200">
          <div 
            className="bg-jacarta-800/80 rounded-lg p-3 border border-jacarta-700/80 backdrop-blur-sm"
            style={{
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2), 0 0 10px rgba(112, 57, 255, 0.1) inset"
            }}
          >
            <p className="text-white">You stand before an ancient stone door covered in mysterious runes that pulse with blue light.</p>
            
            <div className="mt-3 flex flex-col space-y-2">
              {choices.map((choice) => (
                <button 
                  key={choice.id}
                  className={`text-left transition-all duration-300 px-3 py-2 rounded-md relative overflow-hidden group ${choice.active ? 'text-white' : 'text-accent hover:text-white'}`}
                  style={{
                    background: choice.active ? 'linear-gradient(90deg, rgba(112, 57, 255, 0.2) 0%, rgba(112, 57, 255, 0) 100%)' : 'transparent',
                  }}
                >
                  <span className="relative z-10">
                    → {choice.text}
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  {choice.active && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-jacarta-700/30">
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
              <span className="text-jacarta-300 text-xs font-medium">1,287 playing now</span>
            </div>
            <div className="flex items-center bg-jacarta-800/80 px-2 py-1 rounded-full border border-jacarta-700/50">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-jacarta-300 text-xs ml-1 font-bold">4.9</span>
            </div>
          </div>
          
          {/* Interactive elements at the bottom */}
          <div className="mt-3 flex justify-between items-center">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-jacarta-800 overflow-hidden">
                  <Image 
                    src={`/img/avatars/avatar_${i + 10}.jpg`} 
                    alt="Player" 
                    width={24}
                    height={24}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <div className="w-6 h-6 rounded-full bg-jacarta-700 border-2 border-jacarta-800 flex items-center justify-center text-xs text-white">+8</div>
            </div>
            
            <div className="text-jacarta-300 text-xs flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Chapter 1 of 8</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Glowing border effect */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-xl opacity-50"
        style={{
          boxShadow: "0 0 15px rgba(112, 57, 255, 0.3), 0 0 30px rgba(112, 57, 255, 0.1) inset",
          border: "1px solid rgba(112, 57, 255, 0.3)"
        }}
      ></div>
    </div>
  );
};

export default function CreatorSection() {
  const user = useUserCookie();
  const sectionRef = useRef(null);
  const [particles, setParticles] = useState([]);

  // Add custom animation CSS
  useEffect(() => {
    if (!document.querySelector('#creator-section-styles')) {
      const style = document.createElement('style');
      style.id = 'creator-section-styles';
      style.innerHTML = `
        @keyframes magical-spin {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(90deg); }
          50% { transform: rotate(180deg); }
          75% { transform: rotate(270deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes particle-out {
          0% { transform-origin: center; transform: translateX(0) scale(0); opacity: 1; }
          100% { transform-origin: center; transform: translateX(30px) scale(1); opacity: 0; }
        }
        
        .animate-magical-spin {
          animation-name: magical-spin;
          animation-duration: 4s;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        
        .animate-pulse-slow {
          animation-name: pulse-slow;
          animation-duration: 3s;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        
        .animate-particle-out {
          animation-name: particle-out;
          animation-duration: 2s;
          animation-timing-function: ease-out;
          animation-iteration-count: infinite;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Generate particle positions and animation params on client only to avoid
  // hydration mismatch (Math.random() must not run during SSR)
  useEffect(() => {
    const generated = Array.from({ length: 5 }).map(() => ({
      width: `${Math.random() * 300 + 100}px`,
      height: `${Math.random() * 300 + 100}px`,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 20 + 10}s`,
      animationDelay: `${Math.random() * 5}s`,
    }));
    setParticles(generated);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-24 bg-jacarta-900"
    >
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <Image
          src="/img/gradient_dark.jpg"
          alt="background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Subtle animated particles (generated on client to avoid SSR/client mismatch) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-accent/5 blur-3xl"
            style={{
              width: p.width,
              height: p.height,
              top: p.top,
              left: p.left,
              animationName: "pulse-slow",
              animationDuration: p.animationDuration,
              animationDelay: p.animationDelay,
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
            }}
          />
        ))}
      </div>

      <div className="container relative z-10">
        <div className="mx-auto max-w-2xl mb-12 md:mb-16 text-center px-4 md:px-0">
          <h2 className="font-display text-3xl md:text-5xl text-white mb-4 md:mb-6">
            Your Stories,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-600">
              Amplified
            </span>
          </h2>
          <p className="text-jacarta-300 text-base md:text-lg max-w-xl mx-auto">
            Transform your creative writing into immersive interactive
            experiences that captivate players and generate revenue
          </p>
          <a
            href="https://discord.com/invite/d5mFt689kF"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex mt-4 items-center gap-2 px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] transition-colors rounded-lg shadow-lg hover:shadow-[#5865F2]/20 group"
          >
            <svg
              className="w-6 h-6 text-white transition-transform group-hover:scale-110"
              viewBox="0 0 71 55"
              fill="currentColor"
            >
              <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" />
            </svg>
            <span className="text-white font-semibold">Join Our Discord</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 mb-12 md:mb-16 px-4 md:px-0">
          <BenefitCard
            icon={<MdAttachMoney className="text-white text-2xl" />}
            title="Fair Revenue Model"
            description="Earn up to 60% revenue share when players enjoy your interactive experiences"
            delay={100}
          />
          <BenefitCard
            icon={<MdEdit className="text-white text-2xl" />}
            title="Creative Control"
            description="Maintain rights to your original work while expanding its reach and potential"
            delay={300}
          />
          <BenefitCard
            icon={
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="discord"
                className="text-white fill-white p-2 cursor-pointer text-2xl"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
              >
                <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"></path>
              </svg>
            }
            isLink={true}
            title="Supportive Community"
            description="Join fellow writers experimenting with the future of interactive storytelling"
            delay={500}
          />
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 bg-gradient-to-br from-jacarta-800 to-jacarta-900/95 backdrop-blur-lg rounded-xl p-6 md:p-8 border border-jacarta-700/50 shadow-2xl mx-4 md:mx-0 overflow-hidden relative">
          {/* Subtle light rays in the background */}
          <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
            <div className="absolute -inset-x-1/4 top-0 h-px w-3/4 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
            <div className="absolute -inset-y-1/4 right-0 h-3/4 w-px bg-gradient-to-b from-transparent via-accent to-transparent"></div>
            <div className="absolute -inset-x-1/4 bottom-0 h-px w-3/4 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
            <div className="absolute -inset-y-1/4 left-0 h-3/4 w-px bg-gradient-to-b from-transparent via-accent to-transparent"></div>
          </div>


          <div className="flex flex-col items-center">
            <div className="w-full flex md:flex-row md:justify-between gap-4 md:gap-6 flex-col ">
              <CreatorProfile
                user={user}
                profileImage="/img/Lauren.png"
                name="Lauren Gouin"
                quote="Having your work published or produced by the entertainment industry can feel inaccessible if you don't have the right connections.
                  <br/> OpenBook is acting like a bridge over those barriers, it honours storytelling and initiates a friendship between writers and the technical aptitude of AI."
                description='Narrative Designer, Author of "Anathema"'
                buttonText="Join Now"
                showButton={false}
                className="my-8"
              />

              <CreatorProfile
                user={user}
                profileImage="/img/Saad.png"
                name="Saad M."
                quote="As a writer, I've spent years crafting stories, all the while loving Open-World RPGs. OpenBook bridges both passions. The reader, choice after choice, discovers my original writing as she takes decisions. My characters have a mind of their own, which I designed and wrote. It really shows in how they take action in the story. The Path-Finding Ai-Engine knows how to distribute my plot hooks in the story. <br/><br/>
                OpenBook helps to self-publish for free, write new types of stories and expand my audience to gamers"
                description="Writer & narrative designer, Games"
                buttonText=""
                showButton={false}
                className="my-8"
              />
            </div>
            <Link
              href={user ? "/create" : "#"}
              data-bs-toggle={!user ? "modal" : undefined}
              data-bs-target={!user ? "#loginModalForCreating" : undefined}
              className="inline-block hidden sm:block"
            >
              <Button className="group flex items-center gap-2 md:gap-3 bg-gradient-to-r from-accent to-purple-600 hover:from-accent-dark hover:to-purple-700 transform transition-all duration-300 hover:-translate-y-1 text-sm md:text-base py-2 md:py-3 px-5 md:px-6 shadow-lg shadow-accent/20">
                <HiSparkles className="text-xl md:text-2xl transition-transform group-hover:rotate-12" />
                <span>Start Creating</span>
              </Button>
            </Link>

          </div>

          
          {/* <div className="w-full lg:w-1/2 h-[400px] md:h-[380px] relative mt-8 lg:mt-0">
            <StoryTransformation />
          </div> */}
        </div>
      </div>
    </section>
  );
}
