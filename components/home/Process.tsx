"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

export default function Process() {
  const [email, setEmail] = useState("");
  const [activeStep, setActiveStep] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const typingRef = useRef(null);
  const mockupRef = useRef(null);


  // Handle email subscription
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter an email address", {
        style: { backgroundColor: "#242957", color: "white" },
      });
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/news/subscribe/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.status === 201) {
        toast.success(data.message, {
          style: { backgroundColor: "#242957", color: "white" },
        });
        setEmail(""); // Clear email input after successful subscription
      } else {
        toast.error(data.message || "Something went wrong", {
          style: { backgroundColor: "#242957", color: "white" },
        });
      }
    } catch (error) {
      toast.error("Failed to subscribe. Please try again later.", {
        style: { backgroundColor: "#242957", color: "white" },
      });
    }
  };

  const steps = [
    {
      id: 1,
      title: "Design Your World",
      description: "Our AI engine comprehends your creative vision and adapts to your unique tone and style, while always honoring your established creative boundaries.",
      detail: "Define precise parameters for your world's rules, character arcs, and narrative tone—creating a framework the AI must respect throughout the creative process."
    },
    {
      id: 2,
      title: "Amplify Your Narrative",
      description: "Elevate your storytelling while maintaining complete creative ownership. Our AI seamlessly adapts to your distinctive voice—it's still authentically your creation, just enhanced.",
      detail: "Fine-tune, guide, and shape narrative development with intuitive tools that respect your established creative boundaries and fulfill your artistic vision."
    },
    {
      id: 3,
      title: "Publish and Earn",
      description: "Share your immersive creation with an eager audience of players while earning up to 60% revenue share—all while retaining full ownership of your creative rights.",
      detail: "Monitor player decisions to understand how they experience your world and leverage these valuable insights to refine and enhance your storytelling approach."
    }
  ];

  // Typing effect for the description
  useEffect(() => {
    if (typingRef.current) clearTimeout(typingRef.current);
    
    const currentStep = steps.find(step => step.id === activeStep);
    if (!currentStep) return;
    
    setIsTyping(true);
    setCurrentText("");
    
    let i = 0;
    const typeWriter = () => {
      if (i < currentStep.description.length) {
        setCurrentText(prev => prev + currentStep.description.charAt(i));
        i++;
        typingRef.current = setTimeout(typeWriter, 20);
      } else {
        setIsTyping(false);
      }
    };
    
    typeWriter();
    
    return () => {
      if (typingRef.current) clearTimeout(typingRef.current);
    };
  }, [activeStep]);

  // Mockup animation
  useEffect(() => {
    if (mockupRef.current) {
      mockupRef.current.classList.remove('animate-in');
      setTimeout(() => {
        if (mockupRef.current) mockupRef.current.classList.add('animate-in');
      }, 50);
    }
  }, [activeStep]);

  return (
    <>
    <style jsx>
      {`
      @keyframes float-1 {
        0%, 100% { transform: translateY(0) translateX(0); }
        25% { transform: translateY(-10px) translateX(5px); }
        50% { transform: translateY(-5px) translateX(10px); }
        75% { transform: translateY(5px) translateX(5px); }
      }
      @keyframes float-2 {
        0%, 100% { transform: translateY(0) translateX(0); }
        25% { transform: translateY(10px) translateX(-5px); }
        50% { transform: translateY(5px) translateX(-10px); }
        75% { transform: translateY(-5px) translateX(-5px); }
      }
      @keyframes float-3 {
        0%, 100% { transform: translateY(0) translateX(0); }
        25% { transform: translateY(-7px) translateX(-7px); }
        50% { transform: translateY(7px) translateX(7px); }
        75% { transform: translateY(7px) translateX(-7px); }
      }
      @keyframes float-4 {
        0%, 100% { transform: translateY(0) translateX(0); }
        25% { transform: translateY(7px) translateX(7px); }
        50% { transform: translateY(-7px) translateX(-7px); }
        75% { transform: translateY(-7px) translateX(7px); }
      }
      .animate-float-1 { animation: float-1 8s ease-in-out infinite; }
      .animate-float-2 { animation: float-2 9s ease-in-out infinite; }
      .animate-float-3 { animation: float-3 10s ease-in-out infinite; }
      .animate-float-4 { animation: float-4 11s ease-in-out infinite; }
      
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 5px 1px rgba(17, 161, 253, 0.2); }
        50% { box-shadow: 0 0 12px 3px rgba(17, 161, 253, 0.4); }
      }
      .animate-glow { animation: glow 3s ease-in-out infinite; }
      
      @keyframes pulse-border {
        0%, 100% { border-color: rgba(88, 101, 242, 0.5); }
        50% { border-color: rgba(138, 101, 242, 0.9); }
      }
      .animate-pulse-border { animation: pulse-border 3s ease-in-out infinite; }
      
      @keyframes pulse-slow {
        0%, 100% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(1.05); opacity: 0.9; }
      }
      .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
      
      .hexagon {
        position: relative;
        width: 100%;
        height: 100%;
        transition: all 0.3s ease;
        clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-size: 0.7rem;
        font-weight: 600;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
      }
      
      .hexagon:after {
        content: '';
        position: absolute;
        top: 1px; 
        left: 1px;
        right: 1px;
        bottom: 1px;
        clip-path: polygon(50% 2%, 98% 26%, 98% 74%, 50% 98%, 2% 74%, 2% 26%);
        background: rgba(0, 0, 0, 0.2);
        z-index: -1;
      }
      
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      
      @keyframes floatingText {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }
      
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      .magic-text {
        background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6);
        background-size: 300% 100%;
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: gradientShift 8s ease infinite;
      }
      
      .story-container {
        position: relative;
        overflow: visible !important;
        padding: 0 4px;
      }
      
      .story-container p,
      .story-container h5,
      .story-container div {
        overflow: visible;
      }
      
      .story-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 100%;
        background: linear-gradient(90deg, rgba(20, 30, 48, 0.1), rgba(79, 70, 229, 0.05), rgba(20, 30, 48, 0.1));
        background-size: 200% 100%;
        animation: shimmer 8s infinite linear;
        pointer-events: none;
      }
      
      .story-glow {
        box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
        position: relative;
        z-index: 1;
        overflow: hidden;
      }
      
      .story-glow::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(45deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0), rgba(139, 92, 246, 0.1));
        z-index: -1;
        border-radius: inherit;
        pointer-events: none;
      }
      
      .ornate-border {
        position: relative;
      }
      
      .ornate-border::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent);
        pointer-events: none;
      }
      
      .ornate-border::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent);
        pointer-events: none;
      }
      
      .magical-particle {
        position: absolute;
        width: 3px;
        height: 3px;
        background-color: #8b5cf6;
        border-radius: 50%;
        pointer-events: none;
        opacity: 0.6;
        filter: blur(1px);
        animation: floatingText 5s ease-in-out infinite;
      }
      
      .particle-star {
        position: absolute;
        width: 3px;
        height: 3px;
        background-color: white;
        border-radius: 50%;
        opacity: 0.8;
        box-shadow: 0 0 6px 1px rgba(79, 70, 229, 0.6);
        animation: twinkle 4s infinite alternate ease-in-out;
      }
      
      @keyframes twinkle {
        0%, 100% { opacity: 0.3; transform: scale(0.8); }
        50% { opacity: 0.8; transform: scale(1.2); }
      }
      
      .delay-0 { animation-delay: 0s; }
      .delay-500 { animation-delay: 0.5s; }
      .delay-1000 { animation-delay: 1s; }
      .delay-1500 { animation-delay: 1.5s; }
      .delay-2000 { animation-delay: 2s; }
      .delay-2500 { animation-delay: 2.5s; }
      .delay-3000 { animation-delay: 3s; }
      .delay-3500 { animation-delay: 3.5s; }
      .delay-4000 { animation-delay: 4s; }
      .delay-4500 { animation-delay: 4.5s; }
      .delay-5000 { animation-delay: 5s; }
      .delay-5500 { animation-delay: 5.5s; }
      .delay-6000 { animation-delay: 6s; }
      
      .delay-random-1 { animation-delay: 0.3s; }
      .delay-random-2 { animation-delay: 1.7s; }
      .delay-random-3 { animation-delay: 2.5s; }
      .delay-random-4 { animation-delay: 3.2s; }
      .delay-random-5 { animation-delay: 4.1s; }
      
      .text-reveal {
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
        display: inline-block;
        padding-left: 0.05em;
      }
      
      .animate-text-reveal {
        animation: text-reveal 0.8s cubic-bezier(0.77, 0, 0.175, 1) forwards;
      }
      
      @keyframes text-reveal {
        0% {
          transform: translateY(100%);
          opacity: 0;
        }
        100% {
          transform: translateY(0);
          opacity: 1;
        }
      }
      `}
    </style>

    <section className="relative py-24 bg-gradient-to-b from-jacarta-900 to-jacarta-800">
      <div className="absolute inset-0 bg-[url('/img/gradient_dark.jpg')] opacity-30 bg-cover bg-center mix-blend-overlay pointer-events-none"></div>
      
      <div className="container relative z-10">
        {/* Main heading */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl text-white mb-4">
            Create in <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-600 font-bold">Three Simple Steps</span>
            <span className="block mt-2 text-xl md:text-2xl font-normal italic text-gray-200">(You Remain in Control)</span>
          </h2>
          <p className="text-xl text-gray-300 font-semibold mt-4 tracking-wide flex items-center justify-center">
            <span className="inline-block w-8 h-[1px] bg-accent mr-3"></span>
            Transform • Amplify • Flourish
            <span className="inline-block w-8 h-[1px] bg-accent ml-3"></span>
          </p>
        </div>
        
        {/* Step navigation */}
        <div className="container">
          <ul className="steps-nav flex items-center justify-center mb-6 relative z-10">
            {steps.map((step, index) => (
              <li key={index} className="mx-2 relative">
                <button
                  onClick={() => setActiveStep(
                    ()=>{
                      setActiveStep((prev)=>prev = step.id)
                    }
                  )}
                  className={`relative group flex flex-col items-center transition-all duration-300 ${activeStep === step.id ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
                >
                  <div 
                    className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all duration-300 border-2 backdrop-blur-sm ${activeStep === step.id 
                      ? 'border-accent/80 bg-gradient-to-b from-accent/30 to-accent/10 text-white shadow-lg shadow-accent/20' 
                      : 'border-jacarta-400/30 bg-jacarta-800/80 text-gray-400 group-hover:border-gray-400 group-hover:text-white'}`}
                  >
                    <span className="text-lg font-bold">{index + 1}</span>
                    {activeStep === step.id && (
                      <div className="absolute -inset-1 rounded-full border border-accent/50 animate-pulse-slow"></div>
                    )}
                  </div>
                  <span 
                    className={`text-sm font-medium transition-all duration-300 ${activeStep === step.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}
                    >
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className="absolute left-[calc(100%+0.5rem)] top-7 w-8 h-[2px] bg-gradient-to-r from-accent/60 to-transparent"></div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Step content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left side - Text content */}
          <div className="bg-jacarta-800 bg-opacity-70 backdrop-blur-sm p-8 rounded-2xl border border-jacarta-700 shadow-xl transition-all duration-500 hover:shadow-accent/5 group relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute -top-24 -right-24 w-40 h-40 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/15 transition-all duration-700"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/15 transition-all duration-700"></div>
            
            {steps.map((step) => (
              <div 
                key={step.id} 
                className={`transition-opacity duration-500 relative z-10 ${activeStep === step.id ? 'opacity-100' : 'opacity-0 hidden'}`}
              >
                <div className="flex items-center mb-6">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-accent to-accent-dark mr-4 text-white font-bold text-lg shadow-lg shadow-accent/20">{step.id}</span>
                  <h3 className="font-display text-2xl md:text-3xl text-white font-bold">
                    {step.title}
                  </h3>
                </div>
                
                <div className="min-h-[110px] mb-8">
                  <p className="text-gray-200 text-lg leading-relaxed mb-4 pl-2 border-l-2 border-jacarta-600 py-1">
                    {isTyping && activeStep === step.id ? (
                      <span className="text-reveal animate-text-reveal">{currentText}<span className="animate-pulse text-accent">|</span></span>
                    ) : (
                      step.description
                    )}
                  </p>
                </div>
                
                <div className="p-5 bg-jacarta-900 bg-opacity-80 rounded-lg border-l-4 border-accent shadow-inner transform transition-transform duration-300 hover:translate-x-1 hover:shadow-accent/10">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-accent mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                    <p className="text-gray-300 leading-relaxed">
                      <span className="text-accent font-semibold">Pro Tip: </span>
                      {step.detail}
                    </p>
                  </div>
                </div>
                
                {/* New feature badge for step 3 */}
                {step.id === 3 && (
                  <div className="mt-6 bg-gradient-to-r from-purple-600/20 to-accent/20 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium mr-2 rounded bg-accent text-white">NEW</span>
                      <p className="text-white font-medium">Revenue sharing up to 60%</p>
                    </div>
                    <p className="text-gray-300 text-sm">Our enhanced revenue model now offers creators up to 60% share of all earnings, putting more money in your pocket while you retain full creative ownership.</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right side - Software Mockups */}
          <div 
            ref={mockupRef}
            className="relative h-[450px] animate-in transition-all duration-700 overflow-hidden"
          >
            {/* Step 1: Design Your World Mockup */}
            <div className={`absolute inset-0 transition-opacity duration-500 ${activeStep === 1 ? 'opacity-100 z-10' : 'opacity-0 -z-10'}`}>
              <div className="bg-jacarta-900 rounded-xl border border-jacarta-700 shadow-2xl overflow-hidden h-full relative">
                {/* Ambient particles effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                  <div className="absolute w-full h-full">
                    {[...Array(20)].map((_, i) => (
                      <div 
                        key={i}
                        className={`absolute rounded-full bg-accent/20 blur-sm animate-float-${i % 4 + 1} delay-${i*500}`}
                        style={{
                          width: `${Math.random() * 10 + 4}px`,
                          height: `${Math.random() * 10 + 4}px`,
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* App Header */}
                <div className="bg-gradient-to-r from-jacarta-800 to-jacarta-900 px-4 py-3 border-b border-jacarta-700 flex justify-between items-center sticky top-0 z-10">
                  <div className="flex items-center">
                    <h5 className="text-white font-semibold text-sm">World Parameters</h5>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 rounded-md hover:bg-jacarta-700/50 text-gray-400 hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                    </button>
                    <button className="p-1 rounded-md hover:bg-jacarta-700/50 text-gray-400 hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" /></svg>
                    </button>
                    <button className="p-1 rounded-md hover:bg-jacarta-700/50 text-gray-400 hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L11 10.586V7z" clipRule="evenodd" /></svg>
                    </button>
                  </div>
                </div>
                
                {/* App Content */}
                <div className="p-5 grid grid-cols-2 gap-5 h-[calc(100%-48px)] relative z-10">
                  {/* Left side - World settings */}
                  <div className="bg-jacarta-800/90 backdrop-blur-sm rounded-lg flex flex-col overflow-hidden shadow-lg shadow-jacarta-900/30 border border-jacarta-700/50 animate-pulse-border relative">
                    {/* Toolbar */}
                    <div className="bg-gradient-to-r from-jacarta-900 to-jacarta-800 px-4 py-2 border-b border-jacarta-700 flex justify-between items-center sticky top-0 z-10">
                      <div className="flex items-center">
                        <h5 className="text-white font-semibold text-sm">World Parameters</h5>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 rounded-md hover:bg-jacarta-700/50 text-gray-400 hover:text-white transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                        </button>
                        <button className="p-1 rounded-md hover:bg-jacarta-700/50 text-gray-400 hover:text-white transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" /></svg>
                        </button>
                        <button className="p-1 rounded-md hover:bg-jacarta-700/50 text-gray-400 hover:text-white transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L11 10.586V7z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Creative mode toggle */}
                    <div className="bg-jacarta-900/60 px-4 py-2 flex justify-between items-center">
                      <span className="text-xs text-accent">Creative Mode</span>
                      <div className="relative">
                        <div className="w-10 h-5 rounded-full bg-jacarta-700 flex items-center px-0.5 cursor-pointer">
                          <div className="w-4 h-4 rounded-full bg-accent absolute transform translate-x-5 transition-transform duration-300 shadow-sm"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-4 flex-grow overflow-auto">
                      {/* Parameter item */}
                      <div className="bg-jacarta-900/70 backdrop-blur-sm rounded-lg p-3 border-l-2 border-purple-500 hover:translate-x-1 transform transition-transform duration-300 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="flex justify-between relative z-10">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-purple-400 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" /></svg>
                            <span className="text-purple-400 text-sm font-medium">Setting</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs px-1.5 py-0.5 bg-purple-900/60 text-purple-300 rounded">Core</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                          </div>
                        </div>
                        <div className="relative z-10 mt-2">
                          <div className="flex items-center">
                            <p className="text-white text-sm font-medium">Medieval fantasy kingdom</p>
                            <button className="ml-2 p-0.5 rounded text-gray-400 hover:text-purple-400 transition-colors">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                            </button>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">Kingdom with ancient magic and noble houses</div>
                        </div>
                        <div className="mt-3 flex justify-between items-center relative z-10">
                          <span className="text-xs text-gray-500">AI Enhancement:</span>
                          <div className="relative w-10 h-5 rounded-full flex items-center bg-accent cursor-pointer animate-glow">
                            <span className="absolute w-4 h-4 rounded-full bg-white transform translate-x-5 shadow-md"></span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Parameter item - Character Type */}
                      <div className="bg-jacarta-900/70 backdrop-blur-sm rounded-lg p-3 border-l-2 border-blue-500 hover:translate-x-1 transform transition-transform duration-300 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="flex justify-between relative z-10">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-blue-400 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            <span className="text-blue-400 text-sm font-medium">Character Type</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs px-1.5 py-0.5 bg-blue-900/60 text-blue-300 rounded">Primary</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                          </div>
                        </div>
                        <div className="relative z-10 mt-2">
                          <div className="flex items-center">
                            <p className="text-white text-sm font-medium">Wise old wizard</p>
                            <button className="ml-2 p-0.5 rounded text-gray-400 hover:text-blue-400 transition-colors">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                            </button>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">Ancient mage with mysterious powers</div>
                        </div>
                        <div className="mt-3 flex justify-between items-center relative z-10">
                          <span className="text-xs text-gray-500">AI Enhancement:</span>
                          <div className="relative w-10 h-5 rounded-full flex items-center bg-accent cursor-pointer animate-glow">
                            <span className="absolute w-4 h-4 rounded-full bg-white transform translate-x-5 shadow-md"></span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Parameter item - Magic Rule */}
                      <div className="bg-jacarta-900/70 backdrop-blur-sm rounded-lg p-3 border-l-2 border-amber-500 hover:translate-x-1 transform transition-transform duration-300 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="flex justify-between relative z-10">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-amber-400 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" /></svg>
                            <span className="text-amber-400 text-sm font-medium">Magic Rule</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs px-1.5 py-0.5 bg-amber-900/60 text-amber-300 rounded">Creative Boundary</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          </div>
                        </div>
                        <div className="relative z-10 mt-2">
                          <div className="flex items-center">
                            <p className="text-white text-sm font-medium">Magic requires specific crystals</p>
                            <button className="ml-2 p-0.5 rounded text-gray-400 hover:text-amber-400 transition-colors">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                            </button>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">Crystal-bound magic system with limitations</div>
                        </div>
                        <div className="mt-3 flex justify-between items-center relative z-10">
                          <span className="text-xs text-gray-500">AI Enhancement:</span>
                          <div className="relative w-10 h-5 rounded-full flex items-center bg-jacarta-700 cursor-pointer">
                            <span className="absolute w-4 h-4 rounded-full bg-white transform translate-x-1 shadow-md"></span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Parameter item - Narrative Tone */}
                      <div className="bg-jacarta-900/70 backdrop-blur-sm rounded-lg p-3 border-l-2 border-green-500 hover:translate-x-1 transform transition-transform duration-300 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="flex justify-between relative z-10">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-green-400 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a1 1 0 11-2 0 1 1 0 012 0zM7 4a1 1 0 011 1v3a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1h2zm4 2a1 1 0 011 1v3a1 1 0 01-1 1H7a1 1 0 01-1-1V6a1 1 0 011-1h2v2zm2-1a1 1 0 011-1H7a1 1 0 01-1-1v-3a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1z" clipRule="evenodd" /></svg>
                            <span className="text-green-400 text-sm font-medium">Narrative Tone</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs px-1.5 py-0.5 bg-green-900/60 text-green-300 rounded">Atmosphere</span>
                          </div>
                        </div>
                        <div className="relative z-10 mt-2">
                          <div className="flex items-center">
                            <p className="text-white text-sm font-medium">Dark, mysterious atmosphere</p>
                            <button className="ml-2 p-0.5 rounded text-gray-400 hover:text-green-400 transition-colors">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                            </button>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">Foreboding ambiance with secrets to uncover</div>
                        </div>
                        <div className="mt-3 flex justify-between items-center relative z-10">
                          <span className="text-xs text-gray-500">AI Enhancement:</span>
                          <div className="relative w-10 h-5 rounded-full flex items-center bg-accent cursor-pointer animate-glow">
                            <span className="absolute w-4 h-4 rounded-full bg-white transform translate-x-5 shadow-md"></span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-jacarta-700">
                        <button className="w-full py-2 rounded bg-gradient-to-r from-accent to-purple-600 hover:from-accent-dark hover:to-purple-700 text-white text-sm font-medium transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-lg hover:shadow-accent/20 flex items-center justify-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                          Save Creative Boundaries
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Visual representation */}
                  <div className="bg-jacarta-800/70 backdrop-blur-sm rounded-lg overflow-hidden border border-jacarta-700/50 animate-pulse-border flex flex-col shadow-lg">
                    {/* Toolbar */}
                    <div className="bg-gradient-to-r from-jacarta-900 to-jacarta-800 px-4 py-2 border-b border-jacarta-700 flex justify-between items-center">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-accent mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        <h4 className="text-white font-medium text-sm">World Visualization</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 rounded bg-jacarta-700 hover:bg-accent/80 transition-colors text-white">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                        </button>
                      </div>
                    </div>
                  
                    {/* World visualization */}
                    <div className="relative flex-grow bg-gradient-to-br from-jacarta-900 via-jacarta-800 to-jacarta-900 rounded-b-xl border border-t-0 border-jacarta-700 overflow-hidden">
                      {/* Background ambient effects */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute w-full h-full">
                          {[...Array(20)].map((_, i) => (
                            <div 
                              key={i}
                              className={`absolute rounded-full bg-blue-600/5 animate-float-${i % 4 + 1} delay-${i*500}`}
                              style={{
                                width: `${Math.random() * 10 + 4}px`,
                                height: `${Math.random() * 10 + 4}px`,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                              }}
                            ></div>
                          ))}
                        </div>
                      
                        {/* Background grid pattern */}
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.8),transparent_65%)]">
                          <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                          </svg>
                        </div>
                      </div>
                    
                      {/* Hexagonal World Map */}
                      <div className="relative w-full h-full flex items-center justify-center">
                        <div className="relative w-[90%] max-w-[400px] aspect-square">
                          {/* Central Hexagon - Main World */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[45%] h-[45%] animate-pulse-slow overflow-visible">
                            <div className="hexagon bg-gradient-to-br from-blue-600/40 to-purple-700/40 border border-accent/40 shadow-lg shadow-accent/20">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-white text-sm font-bold text-center">WORLD<br/>CORE</div>
                              </div>
                            </div>
                          </div>
                        
                          {/* Outer Regions - Hexagonal Layout */}
                          <div className="absolute top-[5%] left-1/2 w-[30%] h-[30%]">
                            <div className="hexagon bg-blue-500/20 border border-blue-500/40 hover:bg-blue-500/30 transition-colors cursor-pointer group">
                              <div className="absolute inset-0 flex items-center justify-center text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">NORTH</div>
                            </div>
                          </div>
                        
                          <div className="absolute top-[25%] right-[5%] w-[30%] h-[30%]">
                            <div className="hexagon bg-purple-500/20 border border-purple-500/40 hover:bg-purple-500/30 transition-colors cursor-pointer group">
                              <div className="absolute inset-0 flex items-center justify-center text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">EAST</div>
                            </div>
                          </div>
                        
                          <div className="absolute bottom-[25%] right-[5%] w-[30%] h-[30%]">
                            <div className="hexagon bg-green-500/20 border border-green-500/40 hover:bg-green-500/30 transition-colors cursor-pointer group">
                              <div className="absolute inset-0 flex items-center justify-center text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">SOUTH</div>
                            </div>
                          </div>
                        
                          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-[30%] h-[30%]">
                            <div className="hexagon bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 transition-colors cursor-pointer group">
                              <div className="absolute inset-0 flex items-center justify-center text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">WEST</div>
                            </div>
                          </div>
                        
                          <div className="absolute bottom-[25%] left-[5%] w-[30%] h-[30%]">
                            <div className="hexagon bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 transition-colors cursor-pointer group">
                              <div className="absolute inset-0 flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">SW</div>
                            </div>
                          </div>
                        
                          <div className="absolute top-[25%] left-[5%] w-[30%] h-[30%]">
                            <div className="hexagon bg-teal-500/20 border border-teal-500/40 hover:bg-teal-500/30 transition-colors cursor-pointer group">
                              <div className="absolute inset-0 flex items-center justify-center text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity">NW</div>
                            </div>
                          </div>
                        
                          {/* Connection lines - Using divs instead of SVG paths */}
                          <div className="absolute top-[20%] left-1/2 h-[15%] w-[2px] bg-gradient-to-b from-blue-400/50 to-transparent transform -translate-x-1/2 rotate-0"></div>
                          <div className="absolute top-[30%] right-[30%] h-[2px] w-[15%] bg-gradient-to-r from-transparent to-purple-400/50 transform rotate-[30deg] origin-left"></div>
                          <div className="absolute top-[40%] right-[20%] h-[15%] w-[2px] bg-gradient-to-b from-purple-400/50 to-green-400/50 transform rotate-[-60deg] origin-top"></div>
                          <div className="absolute bottom-[40%] right-[20%] h-[15%] w-[2px] bg-gradient-to-b from-green-400/50 to-amber-400/50 transform rotate-[60deg] origin-bottom"></div>
                          <div className="absolute bottom-5 left-1/2 h-[15%] w-[2px] bg-gradient-to-b from-transparent to-amber-400/50 transform -translate-x-1/2 rotate-0"></div>
                          <div className="absolute bottom-[40%] left-[20%] h-[15%] w-[2px] bg-gradient-to-b from-red-400/50 to-amber-400/50 transform rotate-[60deg] origin-bottom"></div>
                          <div className="absolute top-[40%] left-[20%] h-[15%] w-[2px] bg-gradient-to-b from-teal-400/50 to-red-400/50 transform rotate-[-60deg] origin-top"></div>
                          <div className="absolute top-[30%] left-[30%] h-[2px] w-[15%] bg-gradient-to-l from-transparent to-teal-400/50 transform rotate-[-30deg] origin-right"></div>
                        </div>
                      </div>
                    
                      {/* Region information panel */}
                      <div className="absolute bottom-5 left-0 right-0 mx-5 bg-jacarta-800/80 backdrop-blur-sm rounded-xl p-3 border border-jacarta-700">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-accent mr-2"></div>
                            <h4 className="text-white font-medium text-sm">Region: Northern Mountains</h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-1 rounded bg-jacarta-700 hover:bg-accent/80 transition-colors text-white">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">A vast mountain range with ancient ruins, towering peaks, and hidden valleys covered in mist. Home to dwarven cities and abandoned mines.</div>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-1">Climate:</span>
                            <span className="text-blue-400">Cold</span>
                          </div>
                          <div className="flex items-center whitespace-nowrap">
                            <span className="text-gray-500 mr-1">Resources:</span>
                            <span className="text-amber-400">Metals</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-1">Danger:</span>
                            <span className="text-red-500">★★★</span><span className="text-gray-700">★★</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Amplify your narrative Mockup */}
            <div className={`absolute inset-0 transition-opacity duration-500 ${activeStep === 2 ? 'opacity-100 z-10' : 'opacity-0 -z-10'}`}>
              <div className="bg-jacarta-900 rounded-xl border border-jacarta-700 shadow-2xl overflow-hidden h-full relative">
                {/* Background magical effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="magical-particle" style={{top: '10%', left: '20%'}}></div>
                  <div className="magical-particle" style={{top: '45%', left: '15%'}}></div>
                  <div className="magical-particle" style={{top: '75%', left: '25%'}}></div>
                  <div className="magical-particle" style={{top: '25%', left: '80%'}}></div>
                  <div className="magical-particle" style={{top: '60%', left: '85%'}}></div>
                  <div className="magical-particle" style={{top: '80%', left: '70%'}}></div>
                </div>
                
                {/* App Header */}
                <div className="bg-gradient-to-r from-jacarta-800 to-jacarta-900 px-4 py-3 border-b border-jacarta-700 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <h4 className="text-white font-medium text-sm">Story Transformation Studio</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center px-2 py-1 rounded-md bg-jacarta-800 border border-jacarta-700">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
                      <span className="text-xs text-gray-300">Project: Dark Legends</span>
                    </div>
                    <button className="p-1.5 rounded-md bg-jacarta-800 border border-jacarta-700 hover:bg-jacarta-700 transition-colors">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1 1 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1 1 0 012.287.947c1.372.836 2.942-.734 2.106-2.106a1 1 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1 1 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1 1 0 01-2.287-.947c1.372.836 2.942-.734 2.106-2.106a1 1 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1 1 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1 1 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                    </button>
                  </div>
                </div>
                
                {/* App Content */}
                <div className="p-5 grid grid-cols-2 gap-5 h-[calc(100%-48px)]">
                  {/* Left side - Manuscript */}
                  <div className="bg-jacarta-800 bg-opacity-80 rounded-lg p-4 flex flex-col h-full relative overflow-hidden story-container story-glow">
                    <div className="floating-particles">
                      <div className="particle delay-0" style={{top: '10%', left: '20%', width: '15px', height: '15px'}}></div>
                      <div className="particle delay-2000" style={{top: '40%', left: '80%', width: '10px', height: '10px'}}></div>
                      <div className="particle delay-4000" style={{top: '70%', left: '30%', width: '12px', height: '12px'}}></div>
                      <div className="particle delay-6000" style={{top: '25%', left: '50%', width: '8px', height: '8px'}}></div>
                      <div className="particle delay-3000" style={{top: '85%', left: '15%', width: '14px', height: '14px'}}></div>
                    </div>
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-jacarta-800 to-transparent z-10"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-jacarta-800 to-transparent z-10"></div>
                    
                    {/* Background decorative elements */}
                    <div className="absolute -top-24 -right-24 w-40 h-40 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/15 transition-all duration-700"></div>
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/15 transition-all duration-700"></div>
                    
                    <h5 className="text-white font-semibold mb-3 border-b border-jacarta-700 pb-2 sticky top-0 bg-jacarta-800 z-20 flex items-center">
                      <svg className="w-4 h-4 text-accent mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                      Your Manuscript
                      <div className="ml-auto flex space-x-1">
                        <button className="p-1 rounded bg-jacarta-700 hover:bg-accent/80 transition-colors text-white">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                        </button>
                      </div>
                    </h5>
                    
                    <div className="space-y-4 flex-grow overflow-auto text-gray-300 text-sm custom-scrollbar">
                      <p className="magic-text font-medium">The old wizard gazed at the crumbling parchment, his eyes narrowing as he deciphered the ancient script. &quot;The shadows speak truth,&quot; he whispered, his voice barely audible in the silent chamber.</p>
                      
                      <p>Elara stepped forward, her hand instinctively reaching for the dagger at her belt. &quot;What does it mean?&quot; she asked, her voice steady despite the chill that ran down her spine.</p>
                      
                      <p>&quot;It means,&quot; the wizard replied, turning to face her, &quot;that our journey must take us to the moonlit castle ruins. The prophecy speaks of a guardian who sleeps beneath stone and stars.&quot;</p>
                      
                      <p className="bg-jacarta-900 p-2 rounded border-l-2 border-accent my-4">The hero discovers ancient prophecy hidden within the castle&apos;s forgotten archives.</p>
                      
                      <p>&quot;And if we wake this guardian?&quot; Elara questioned, though she suspected she already knew the answer.</p>
                      
                      <p>The wizard&apos;s expression darkened. &quot;Then we either gain a powerful ally... or unleash a force we cannot hope to control.&quot;</p>
                    </div>
                  </div>

                  {/* Right side - Interactive elements */}
                  <div className="flex flex-col gap-4">
                    <div className="bg-jacarta-800 bg-opacity-80 rounded-lg p-4 story-glow relative overflow-hidden">
                      <div className="floating-particles">
                        <div className="particle delay-1000" style={{top: '20%', left: '10%', width: '12px', height: '12px'}}></div>
                        <div className="particle delay-3500" style={{top: '60%', left: '75%', width: '8px', height: '8px'}}></div>
                        <div className="particle delay-5000" style={{top: '40%', left: '40%', width: '10px', height: '10px'}}></div>
                      </div>
                      <div className="absolute top-5 right-5 w-32 h-32 bg-purple-500/10 rounded-full blur-xl pointer-events-none"></div>
                      <h5 className="text-white font-semibold mb-3 border-b border-jacarta-700 pb-2 flex items-center">
                        <svg className="w-4 h-4 text-purple-400 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 012.287.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                        AI Suggestions
                        <div className="flex items-center ml-auto">
                          <div className="text-xs text-purple-400 mr-2 px-1.5 py-0.5 bg-purple-500/20 rounded">2 New</div>
                        </div>
                      </h5>
                      
                      <div className="space-y-3">
                        <div className="bg-gradient-to-r from-jacarta-900/80 to-jacarta-900/90 rounded-lg p-3 border-l-2 border-accent hover:shadow-lg hover:shadow-accent/10 transition-shadow ornate-border">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-accent text-sm font-medium">Scene Expansion</span>
                            <div className="flex space-x-2">
                              <button className="p-1 rounded-md bg-jacarta-700 hover:bg-accent transition-colors">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                              </button>
                            </div>
                          </div>
                          <p className="text-white text-sm">Add description of the ancient runes glowing on the parchment as the wizard reads.</p>
                          <div className="mt-2 flex justify-between items-center">
                            <div className="flex space-x-1">
                              <button className="px-2 py-1 rounded-md bg-green-900/50 text-green-400 text-xs hover:bg-green-800/50 transition-colors">Accept</button>
                              <button className="px-2 py-1 rounded-md bg-red-900/50 text-red-400 text-xs hover:bg-red-800/50 transition-colors">Decline</button>
                            </div>
                            <div className="flex items-center">
                              <svg className="w-3 h-3 text-purple-400 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                              <span className="text-xs text-gray-500">AI Enhanced</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-jacarta-900 rounded-lg p-3 border-l-2 border-purple-500">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-purple-400 text-sm font-medium">Dialog Option</span>
                            <div className="flex space-x-2">
                              <button className="p-1 rounded-md bg-jacarta-700 hover:bg-accent transition-colors">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                              </button>
                            </div>
                          </div>
                          <p className="text-white text-sm">The wizard&apos;s eyes flash with ancient power: &quot;Some secrets were meant to stay buried.&quot;</p>
                          <div className="mt-2 flex justify-between items-center">
                            <div className="flex space-x-1">
                              <button className="px-2 py-1 rounded-md bg-green-900/50 text-green-400 text-xs hover:bg-green-800/50 transition-colors">Accept</button>
                              <button className="px-2 py-1 rounded-md bg-red-900/50 text-red-400 text-xs hover:bg-red-800/50 transition-colors">Decline</button>
                            </div>
                            <span className="text-xs text-gray-500">AI Enhanced</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Game world visualization */}
                    <div className="bg-gradient-to-b from-jacarta-900 to-jacarta-800 rounded-lg overflow-hidden relative flex flex-col h-[320px] border border-jacarta-700/50 group transition-all hover:border-accent/30 story-glow">
                      {/* Ambient background */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute w-full h-full opacity-80">
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-600/30 to-transparent"></div>
                          
                          {/* Starry background with tiny stars */}
                          {[...Array(50)].map((_, i) => (
                            <div 
                              key={i}
                              className="absolute rounded-full bg-white"
                              style={{
                                width: `${Math.random() * 2 + 1}px`,
                                height: `${Math.random() * 2 + 1}px`,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                opacity: Math.random() * 0.5 + 0.3,
                                animation: `pulse-slow ${Math.random() * 4 + 3}s infinite ${Math.random() * 5}s`
                              }}
                            ></div>
                          ))}
                          
                          {/* Larger glowing stars */}
                          {[...Array(5)].map((_, i) => (
                            <div 
                              key={`glow-${i}`}
                              className="absolute rounded-full"
                              style={{
                                width: `${Math.random() * 3 + 2}px`,
                                height: `${Math.random() * 3 + 2}px`,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                background: `radial-gradient(circle, ${['rgba(99,102,241,0.8)', 'rgba(139,92,246,0.8)', 'rgba(236,72,153,0.8)'][i % 3]} 0%, transparent 70%)`,
                                boxShadow: `0 0 4px ${['rgba(99,102,241,0.5)', 'rgba(139,92,246,0.5)', 'rgba(236,72,153,0.5)'][i % 3]}`,
                                opacity: 0.7,
                                filter: 'blur(1px)',
                                animation: `pulse-slow ${Math.random() * 3 + 2}s infinite ${Math.random() * 3}s`
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Top toolbar */}
                      <div className="bg-gradient-to-r from-jacarta-900 to-jacarta-800 px-4 py-2 border-b border-jacarta-700 flex justify-between items-center z-10">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-accent mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                          <h4 className="text-white font-semibold text-sm">Game World Visualization</h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400 px-1.5 py-0.5 bg-jacarta-700/50 rounded">Scene 12: The Ancient Ruins</span>
                          <button className="p-1 rounded-md text-accent hover:bg-jacarta-700/50 hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {/* Game scene preview */}
                      <div className="flex-grow p-4 flex items-center justify-center relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-3/4 h-3/4 relative transition-transform group-hover:scale-105 duration-700">
                            {/* 3D scene representation */}
                            <div className="absolute inset-0 bg-gradient-to-r from-jacarta-900/90 via-purple-900/30 to-jacarta-900/90 rounded-lg overflow-hidden border border-jacarta-700/40">
                              {/* Castle ruins silhouette */}
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4/5 h-2/3">
                                <svg viewBox="0 0 100 70" className="w-full h-full text-jacarta-700" fill="currentColor">
                                  <path d="M0,70 L100,70 L100,50 L95,50 L95,45 L90,45 L90,50 L85,50 L85,40 L80,40 L80,50 L75,50 L75,45 L70,45 L70,55 L65,55 L65,45 L60,45 L60,40 L55,40 L55,45 L50,45 L50,35 L45,35 L45,45 L40,45 L40,55 L35,55 L35,50 L30,50 L30,40 L25,40 L25,50 L20,50 L20,45 L15,45 L15,50 L10,50 L10,55 L5,55 L5,60 L0,60 Z" />
                                </svg>
                              </div>
                              
                              {/* Moon */}
                              <div className="absolute top-8 right-8 w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 opacity-80 shadow-glow-sm"></div>
                              
                              {/* Magic runes */}
                              <div className="absolute bottom-10 left-10 w-8 h-8 text-accent opacity-80 animate-pulse-slow">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4v16m8-8H4m4-4l8 8m0-8l-8 8" />
                                </svg>
                              </div>
                              
                              <div className="absolute top-16 left-20 w-6 h-6 text-purple-400 opacity-70 animate-pulse-slow delay-1000">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
                                  <circle cx="12" cy="12" r="10" strokeWidth="1" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v8m-4-4h8" />
                                </svg>
                              </div>
                              
                              {/* Character indicator */}
                              <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-accent shadow-glow-md z-10 animate-pulse"></div>
                            </div>
                            
                            {/* Interactive hotspots */}
                            <div className="absolute top-10 left-12 w-5 h-5 rounded-full border-2 border-purple-400 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" title="Ancient Artifact">
                              <span className="absolute -top-10 bg-jacarta-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Ancient Artifact</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                            </div>
                            
                            <div className="absolute top-1/3 right-16 w-5 h-5 rounded-full border-2 border-accent flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" title="Hidden Entrance">
                              <span className="absolute -top-10 bg-jacarta-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Hidden Entrance</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Info overlays */}
                        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                          <div className="bg-jacarta-900/80 backdrop-blur-sm text-xs px-2 py-1 rounded text-gray-300 border border-jacarta-700/50">
                            <span className="text-accent">Exploration</span> • Day 3 • Scene 12
                          </div>
                          
                          <div className="bg-jacarta-900/80 backdrop-blur-sm text-xs px-2 py-1 rounded text-gray-300 border border-jacarta-700/50 flex items-center">
                            <svg className="w-3 h-3 text-accent mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            Quest: <span className="text-accent ml-1">The Lost Grimoire</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Game statistics */}
                    <div className="bg-jacarta-800/90 rounded-lg p-4 story-glow">
                      <h5 className="text-white font-semibold mb-3 flex items-center">
                        <svg className="w-4 h-4 text-accent mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                        Game Statistics
                      </h5>

                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="bg-jacarta-900/80 rounded p-2 text-center">
                          <div className="text-xs text-gray-400">Scenes</div>
                          <div className="text-accent font-semibold">24</div>
                        </div>
                        <div className="bg-jacarta-900/80 rounded p-2 text-center">
                          <div className="text-xs text-gray-400">Characters</div>
                          <div className="text-accent font-semibold">6</div>
                        </div>
                        <div className="bg-jacarta-900/80 rounded p-2 text-center">
                          <div className="text-xs text-gray-400">Choices</div>
                          <div className="text-accent font-semibold">18</div>
                        </div>
                        <div className="bg-jacarta-900/80 rounded p-2 text-center">
                          <div className="text-xs text-gray-400">Endings</div>
                          <div className="text-accent font-semibold">4</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-gray-400">Transformation progress</span>
                          <span className="text-accent">68%</span>
                        </div>
                        <div className="w-full bg-jacarta-900 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-accent to-purple-600" style={{width: '68%'}}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 pt-1">
                          <span>Manuscript</span>
                          <span>Interactive Game</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Publish and earn Mockup */}
            <div className={`absolute inset-0 transition-opacity duration-500 ${activeStep === 3 ? 'opacity-100 z-10' : 'opacity-0 -z-10'}`}>
              <div className="bg-jacarta-900 rounded-xl border border-jacarta-700 shadow-2xl overflow-hidden h-full relative">
                {/* Ambient particles effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                  <div className="particle-star delay-0" style={{top: '10%', left: '20%'}}></div>
                  <div className="particle-star delay-2000" style={{top: '25%', left: '85%'}}></div>
                  <div className="particle-star delay-3000" style={{top: '60%', left: '15%'}}></div>
                  <div className="particle-star delay-1000" style={{top: '75%', left: '80%'}}></div>
                  <div className="particle-star delay-4000" style={{top: '40%', left: '50%'}}></div>
                </div>
                <div className="grid grid-cols-2 gap-8 h-full">
                  <div className="bg-jacarta-800/80 backdrop-blur-sm rounded-xl border border-jacarta-700/50 p-5 h-full shadow-lg shadow-accent/10 flex flex-col">
                    <h3 className="text-white text-xl font-semibold mb-4 flex items-center">
                      <svg className="w-5 h-5 text-accent mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1h-5a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011 1v12a1 1 0 01-1 1H15a1 1 0 01-1-1V4z" /></svg>
                      Publisher Dashboard
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="bg-jacarta-900/80 rounded-lg p-3 border border-jacarta-700/50">
                        <p className="text-gray-400 text-xs mb-1">Monthly Revenue</p>
                        <p className="text-white text-xl font-bold">$3,750</p>
                        <div className="flex items-center text-green-400 text-xs mt-1">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 01-1 1H7a1 1 0 01-1-1V7a1 1 0 011-1zm0 10a1 1 0 100-2 1 1 0 000 2z" /></svg>
                          +18% from last month
                        </div>
                      </div>
                      <div className="bg-jacarta-900/80 rounded-lg p-3 border border-jacarta-700/50">
                        <p className="text-gray-400 text-xs mb-1">Active Players</p>
                        <p className="text-white text-xl font-bold">1,250</p>
                        <div className="flex items-center text-green-400 text-xs mt-1">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 01-1 1H7a1 1 0 01-1-1V7a1 1 0 011-1zm0 10a1 1 0 100-2 1 1 0 000 2z" /></svg>
                          +24% from last month
                        </div>
                      </div>
                    </div>
                    <div className="mb-5">
                      <div className="flex justify-between mb-1">
                        <p className="text-xs text-gray-400">Game Completion Rate</p>
                        <p className="text-xs text-white">68%</p>
                      </div>
                      <div className="h-2 bg-jacarta-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-accent to-purple-600 rounded-full" style={{width: '68%'}}></div>
                      </div>
                    </div>
                    <div className="mb-5">
                      <div className="flex justify-between text-xs mb-1">
                        <p className="text-gray-400">Player Retention</p>
                        <p className="text-xs text-white">82%</p>
                      </div>
                      <div className="h-2 bg-jacarta-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-teal-400 rounded-full" style={{width: '82%'}}></div>
                      </div>
                    </div>
                    <div className="mt-auto">
                      <h4 className="text-white text-base font-semibold mb-3">Revenue Breakdown</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <div className="w-[8px] h-[8px] rounded-full bg-accent mr-3"></div>
                          <div className="flex-grow">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-300">Game Purchases</span>
                              <span className="text-white">45%</span>
                            </div>
                            <div className="h-1.5 bg-jacarta-700 rounded-full mt-1">
                              <div className="h-full bg-accent rounded-full" style={{width: '45%'}}></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-[8px] h-[8px] rounded-full bg-purple-500 mr-3"></div>
                          <div className="flex-grow">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-300">Premium Choices</span>
                              <span className="text-white">30%</span>
                            </div>
                            <div className="h-1.5 bg-jacarta-700 rounded-full mt-1">
                              <div className="h-full bg-purple-500 rounded-full" style={{width: '30%'}}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-jacarta-800/80 backdrop-blur-sm rounded-xl border border-jacarta-700/50 overflow-hidden shadow-lg">
                    <div className="bg-gradient-to-r from-jacarta-900 to-jacarta-800 px-4 py-3 border-b border-jacarta-700 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <h4 className="text-white font-medium text-sm">Game Storefront</h4>
                      </div>
                      <div className="flex space-x-1">
                        <button className="p-1 rounded hover:bg-jacarta-700/50 text-gray-400 hover:text-white">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                        </button>
                        <button className="p-1 rounded hover:bg-jacarta-700/50 text-gray-400 hover:text-white">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /></svg>
                        </button>
                      </div>
                    </div>
                    <div className="relative p-4 flex flex-col h-[calc(100%-48px)]">
                      <div className="grid grid-cols-3 gap-3 flex-1">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="rounded-lg overflow-hidden group cursor-pointer shadow-sm hover:shadow-accent/20 transition-all">
                            <div className="aspect-[3/4] relative overflow-hidden bg-jacarta-900 flex items-center justify-center">
                              <div className="absolute inset-0 bg-gradient-to-t from-jacarta-900 to-transparent z-10"></div>
                              <div className="text-accent text-5xl opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 011 9.236V15a1 1 0 01-.553.894l-4 2A1 1 0 018 17v-5.586a1 1 0 00-.553-.894l4-2z" />
                                </svg>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 p-2 z-20">
                                <h6 className="text-white text-sm font-semibold truncate">Realm Quest {i+1}</h6>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-300">${(i+1)*3.99}</span>
                                  <div className="flex items-center">
                                    <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    <span className="text-xs text-gray-300 ml-1">{4.0 + i*0.3}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-3 border border-dashed border-accent/40 rounded-lg flex items-center justify-center group cursor-pointer hover:bg-jacarta-700/30 transition-all">
                        <div className="text-center">
                          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-lg shadow-purple-700/30 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 001 1h5a1 1 0 001-1v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                          </div>
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Create New Game</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        {/* <div className="mt-16 text-center">
          <div className="mt-4 p-3 rounded-lg cursor-pointer transition-all duration-300 relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-accent to-purple-600 opacity-90 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblRyYW5zZm9ybT0ic2NhbGUoMSkiPjxwYXRoIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKSIgZD0iTTAgMGg1djVIMHptMTAgMGg1djVoLTV6TTAgMTBoNXY1SDB6bTEwIDBoNXY1aC01eiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-10 group-hover:opacity-15 transition-opacity"></div>
            <div className="relative z-10 flex items-center justify-center py-3">
            <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-lg shadow-purple-700/30 group-hover:scale-110 transition-transform duration-300">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 001 1h5a1 1 0 001-1v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            </div>
            <span className="text-base font-bold text-white tracking-wide group-hover:tracking-wider transition-all duration-300">START YOUR GAME</span>
            </div>
            </div>
            </div>
            </div> */}

        {/* Email subscription */}
        <div className="mt-20">
          {/* <p className="mx-auto max-w-2xl text-center text-lg text-gray-300 mb-6">
            Join our mailing list to stay in the loop with our newest feature
            releases, Game drops, and tips and tricks for navigating Kraken
            </p>
            
            <div className="mx-auto max-w-md text-center">
            <form onSubmit={handleSubmit} className="relative">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full rounded-full border border-jacarta-600 py-3 px-4 bg-jacarta-700 text-white placeholder-gray-400 focus:ring-accent focus:border-accent"
                />
                <button
                type="submit"
                className="absolute top-2 right-2 rtl:left-2 rtl:right-auto rounded-full bg-accent px-6 py-2 font-display text-sm text-white hover:bg-accent-dark transition-colors duration-200"
                >
                Subscribe
                </button>
                </form>
                </div> */}
          
          <div className="mx-auto mt-7 max-w-md text-center flex justify-center mt-[80px]">
            <a 
            href="https://discord.com/invite/d5mFt689kF"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex mt-4 items-center gap-2 px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] transition-colors rounded-lg shadow-lg hover:shadow-[#5865F2]/20 group"
          >
            <svg className="w-8 h-8 text-white transition-transform group-hover:scale-110" viewBox="0 0 71 55" fill="currentColor">
              <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
            </svg>
            <span className="text-white font-semibold">Join Our Discord</span>
          </a> 
          </div>
        </div>
      </div>
    </section>
              </>
  );
}
