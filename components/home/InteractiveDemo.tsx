"use client";
import { useState, useEffect, useRef, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSparkles } from "react-icons/hi2";
import { FaArrowRight, FaBookOpen, FaQuoteLeft, FaFeatherAlt } from "react-icons/fa";
import Button from '../ui/Button';

// Story narrative content
const storyContent = {
  intro: {
    text: "The ancient temple stands before you, its stone facade weathered by centuries of neglect. Strange symbols glow with a faint blue light around the entrance.",
    choices: [
      { id: 'enter', text: 'Enter the temple cautiously', nextScene: 'temple' },
      { id: 'inspect', text: 'Inspect the glowing symbols', nextScene: 'symbols' },
      { id: 'leave', text: 'Leave and return with backup', nextScene: 'leave' }
    ]
  },
  temple: {
    text: "The temple interior is vast and dimly lit. Moonlight streams through cracks in the ceiling, illuminating a central altar. You hear faint whispers echoing from deeper chambers.",
    choices: [
      { id: 'altar', text: 'Approach the altar', nextScene: 'altar' },
      { id: 'follow', text: 'Follow the whispers', nextScene: 'whispers' },
      { id: 'explore', text: 'Explore the side passages', nextScene: 'passages' }
    ]
  },
  symbols: {
    text: "As you study the ancient markings, they pulse with energy. You recognize fragments of an old language that speaks of guardians and a sealed power. The symbols seem to form a sequence.",
    choices: [
      { id: 'touch', text: 'Touch the symbols in sequence', nextScene: 'sequence' },
      { id: 'record', text: 'Record the symbols in your journal', nextScene: 'journal' },
      { id: 'enter_after', text: 'Enter the temple now', nextScene: 'temple' }
    ]
  },
  altar: {
    text: "Upon the altar rests an ancient artifact - a small crystalline orb that emits a soft blue glow. It seems to pulse in rhythm with your heartbeat.",
    choices: [
      { id: 'take', text: 'Take the orb', nextScene: 'orb_taken' },
      { id: 'study', text: 'Study the orb without touching it', nextScene: 'orb_study' },
      { id: 'leave_altar', text: 'Leave the altar undisturbed', nextScene: 'leave_altar' }
    ]
  },
  whispers: {
    text: "Following the whispers, you discover a hidden chamber where ghostly figures appear to be locked in an eternal council. They seem unaware of your presence as they debate in an ancient tongue.",
    choices: [
      { id: 'listen', text: 'Listen carefully to their debate', nextScene: 'council_listen' },
      { id: 'announce', text: 'Announce your presence', nextScene: 'council_announce' },
      { id: 'retreat', text: 'Retreat quietly', nextScene: 'temple' }
    ]
  },
  leave: {
    text: "You decide to return with more equipment and possibly allies. As you turn to leave, the glowing symbols fade, and you hear what sounds like a disappointed sigh from within the temple.",
    choices: [
      { id: 'reconsider', text: 'Reconsider and enter anyway', nextScene: 'temple' },
      { id: 'village', text: 'Return to the nearby village', nextScene: 'intro' },
      { id: 'camp', text: 'Make camp and wait until morning', nextScene: 'camp' }
    ]
  }
};

// Error boundary component to catch any errors in the demo
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("InteractiveDemo error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-[#0f0f23] rounded-lg border border-accent/20">
          <h3 className="text-xl font-display text-white mb-4">Something went wrong</h3>
          <p className="text-white/70 mb-4">We&apos;re experiencing some technical difficulties with the interactive demo.</p>
          <button 
            onClick={() => this.setState({ hasError: false })} 
            className="px-4 py-2 bg-accent rounded-lg text-white"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function InteractiveDemo() {
  // State management
  const [currentScene, setCurrentScene] = useState('intro');
  const [previousScene, setPreviousScene] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showWriterMode, setShowWriterMode] = useState(false);
  const [playerStats, setPlayerStats] = useState({
    courage: 50,
    wisdom: 50,
    curiosity: 50
  });
  const [choiceHistory, setChoiceHistory] = useState([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const demoContainerRef = useRef(null);

  // Ensure we have a valid scene
  useEffect(() => {
    // Validate that currentScene exists in storyContent
    if (!storyContent[currentScene]) {
      console.error(`Scene '${currentScene}' not found in storyContent`);
      setCurrentScene('intro'); // Reset to a known valid scene
    }
  }, [currentScene]);

  // Handle scene transitions
  const handleChoiceSelection = (choice) => {
    setSelectedChoice(choice.id);
    setIsTransitioning(true);
    
    // Update player stats based on choice
    const newStats = {...playerStats};
    
    if (choice.id.includes('explore') || choice.id.includes('follow')) {
      newStats.curiosity = Math.min(100, newStats.curiosity + 15);
    }
    
    if (choice.id.includes('leave') || choice.id.includes('retreat')) {
      newStats.courage = Math.max(10, newStats.courage - 10);
    }
    
    if (choice.id.includes('study') || choice.id.includes('inspect') || choice.id.includes('record')) {
      newStats.wisdom = Math.min(100, newStats.wisdom + 15);
    }
    
    if (choice.id.includes('enter') || choice.id.includes('approach') || choice.id.includes('announce')) {
      newStats.courage = Math.min(100, newStats.courage + 15);
    }
    
    setPlayerStats(newStats);
    
    // Record choice in history
    setChoiceHistory(prev => [...prev, {
      scene: currentScene,
      choiceId: choice.id,
      choiceText: choice.text
    }]);
    
    // Calculate progress
    setProgressPercentage(prev => Math.min(100, prev + 15));

    // Transition to next scene
    setTimeout(() => {
      setPreviousScene(currentScene);
      setCurrentScene(choice.nextScene);
      setSelectedChoice(null);
      setIsTransitioning(false);
    }, 1000);
  };

  // Handle reset demo
  const resetDemo = () => {
    setPreviousScene(null);
    setCurrentScene('intro');
    setSelectedChoice(null);
    setIsTransitioning(false);
    setPlayerStats({
      courage: 50,
      wisdom: 50,
      curiosity: 50
    });
    setChoiceHistory([]);
    setProgressPercentage(0);
  };

  // Toggle writer mode
  const toggleWriterMode = () => {
    setShowWriterMode(prev => !prev);
  };

  // Dismiss tutorial
  const dismissTutorial = () => {
    setShowTutorial(false);
  };

  // Effect for fancy particle background
  useEffect(() => {
    if (!demoContainerRef.current) return;

    // Create canvas for particles
    const canvas = document.createElement('canvas');
    canvas.className = 'absolute inset-0 -z-10';
    demoContainerRef.current.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    const resizeCanvas = () => {
      if (demoContainerRef.current) {
        canvas.width = demoContainerRef.current.offsetWidth;
        canvas.height = demoContainerRef.current.offsetHeight;
      }
    };

    // Initialize particles
    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor(canvas.width / 20); // Responsive particle count
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.5,
          color: `rgba(112, 57, 255, ${Math.random() * 0.2 + 0.1})`,
          speedX: Math.random() * 0.5 - 0.25,
          speedY: Math.random() * 0.5 - 0.25
        });
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Boundary check
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };

    // Set up and start animation
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    initParticles();
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      if (demoContainerRef.current && demoContainerRef.current.contains(canvas)) {
        demoContainerRef.current.removeChild(canvas);
      }
    };
  }, []);

  return (
    <ErrorBoundary>
      <section className="relative py-16 md:py-20 lg:py-24 overflow-hidden bg-gradient-to-b from-[#0b0b19] to-[#141428]">
        {/* Ambient lighting */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[10%] w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-accent/5 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[10%] left-[10%] w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-purple-500/5 rounded-full blur-[150px]"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-4">
              <span className="relative inline-block">
                <span className="relative z-10">Experience</span>
                <span className="absolute -bottom-1 left-0 right-0 h-3 bg-accent/30 -z-0"></span>
              </span> Interactive Storytelling
            </h2>
            <p className="text-lg text-white/70 max-w-3xl mx-auto">
              Try a sample adventure below to see how your choices shape the narrative. No sign-up required.
            </p>
          </div>
          
          <div 
            ref={demoContainerRef}
            className="relative max-w-5xl mx-auto bg-[#0f0f23]/80 backdrop-blur-md rounded-2xl border border-accent/20 shadow-[0_0_50px_rgba(112,57,255,0.1)] overflow-hidden"
          >
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
              <motion.div 
                className="h-full bg-accent" 
                initial={{ width: '0%' }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            {/* Tutorial overlay */}
            <AnimatePresence>
              {showTutorial && (
                <motion.div 
                  className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-6 md:p-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="max-w-md text-center">
                    <HiSparkles className="text-accent text-3xl sm:text-4xl mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-2 sm:mb-4">Interactive Story Demo</h3>
                    <p className="text-white/80 text-sm sm:text-base mb-4 sm:mb-6">
                      This mini-adventure lets you experience how stories come alive on OpenBook.Games. Each choice you make shapes the narrative and affects your character traits.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8 text-center">
                      <div className="p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-2">
                          <FaBookOpen className="text-accent text-xs sm:text-sm" />
                        </div>
                        <p className="text-white text-sm sm:text-base font-semibold">Read the story</p>
                      </div>
                      <div className="p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-2">
                          <FaArrowRight className="text-accent text-xs sm:text-sm" />
                        </div>
                        <p className="text-white text-sm sm:text-base font-semibold">Make choices</p>
                      </div>
                      <div className="p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-2">
                          <FaFeatherAlt className="text-accent text-xs sm:text-sm" />
                        </div>
                        <p className="text-white text-sm sm:text-base font-semibold">Shape the story</p>
                      </div>
                    </div>
                    <Button
                      className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base bg-accent hover:bg-accent-dark mx-auto"
                      onClick={dismissTutorial}
                    >
                      Begin Your Adventure
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex flex-col lg:flex-row h-full min-h-[400px] lg:min-h-[500px]">
              {/* Story panel */}
              <div className="w-full lg:w-3/5 p-4 sm:p-6 md:p-8 flex flex-col">
                {/* Scene title */}
                <div className="mb-3 md:mb-4 flex items-center">
                  <div className="mr-2 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-accent/20">
                    <FaBookOpen className="text-accent text-xs sm:text-sm" />
                  </div>
                  <h3 className="font-display text-lg sm:text-xl text-white">
                    The Lost Temple
                  </h3>
                </div>
                
                {/* Story text with animated transitions */}
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentScene}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6 md:mb-8 flex-grow"
                  >
                    <div className="prose prose-invert max-w-none">
                      <FaQuoteLeft className="text-accent/50 mb-2 text-sm sm:text-base" />
                      <p className="text-white/90 text-base sm:text-lg leading-relaxed">
                        {storyContent[currentScene]?.text || "Loading story content..."}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
                
                {/* Choices */}
                <div className="space-y-2 sm:space-y-3">
                  <h4 className="text-white/70 text-xs sm:text-sm uppercase tracking-wider mb-1 sm:mb-2">What will you do?</h4>
                  {(storyContent[currentScene]?.choices || []).map((choice) => (
                    <motion.button
                      key={choice.id}
                      onClick={() => handleChoiceSelection(choice)}
                      className={`group w-full text-left flex items-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-300 ${selectedChoice === choice.id ? 'bg-accent text-white' : 'bg-white/5 hover:bg-accent/20 text-white'} border-l-4 ${selectedChoice === choice.id ? 'border-white' : 'border-accent'}`}
                      disabled={isTransitioning}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaArrowRight className={`mr-2 sm:mr-3 text-xs sm:text-sm ${selectedChoice === choice.id ? 'text-white' : 'text-accent'} group-hover:text-white transition-colors`} />
                      <span className="text-sm sm:text-base">{choice.text}</span>
                    </motion.button>
                  ))}
                  <div className="pt-3 sm:pt-4 flex justify-between text-xs sm:text-sm">
                    <button 
                      onClick={resetDemo}
                      className="text-white/60 hover:text-accent underline underline-offset-4 transition-colors"
                    >
                      Restart Story
                    </button>
                    <button 
                      onClick={toggleWriterMode}
                      className="text-white/60 hover:text-accent underline underline-offset-4 transition-colors"
                    >
                      {showWriterMode ? 'Hide Writer Mode' : 'Show Writer Mode'}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Stats panel */}
              <AnimatePresence>
                {showWriterMode ? (
                  <motion.div 
                    className="w-full lg:w-2/5 border-t lg:border-t-0 lg:border-l border-white/10 bg-black/20 p-4 sm:p-6 md:p-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="h-full flex flex-col">
                      <h3 className="font-display text-xl text-white mb-4 flex items-center">
                        <FaFeatherAlt className="text-accent mr-2" />
                        Writer&apos;s Studio
                      </h3>
                      
                      <div className="mb-6 rounded-lg border border-white/10 bg-black/30 p-4">
                        <h4 className="text-white/70 text-sm uppercase tracking-wider mb-2">Narrative Structure</h4>
                        <div className="text-white/80 text-sm">
                          <p>Current scene: <span className="text-accent">{currentScene}</span></p>
                          <p>Previous scene: <span className="text-white">{previousScene || 'None'}</span></p>
                          <p>Branching paths: <span className="text-white">{storyContent[currentScene]?.choices?.length || 0}</span></p>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h4 className="text-white/70 text-sm uppercase tracking-wider mb-2">Character Development</h4>
                        <div className="space-y-3">
                          {Object.entries(playerStats).map(([stat, value]) => (
                            <div key={stat} className="">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-white/80 capitalize">{stat}</span>
                                <span className="text-accent">{value}/100</span>
                              </div>
                              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full bg-accent" 
                                  initial={{ width: '50%' }}
                                  animate={{ width: `${value}%` }}
                                  transition={{ duration: 0.5 }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex-grow overflow-auto">
                        <h4 className="text-white/70 text-sm uppercase tracking-wider mb-2">Player Choice History</h4>
                        {choiceHistory.length > 0 ? (
                          <div className="space-y-2 text-sm">
                            {choiceHistory.map((choice, i) => (
                              <div key={i} className="p-2 rounded bg-white/5 border-l-2 border-accent/50">
                                <p className="text-white/50">Scene: <span className="text-white/80">{choice.scene}</span></p>
                                <p className="text-white/80">&quot;{choice.choiceText}&quot;</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-white/50 italic">No choices made yet.</p>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-white/60 text-sm">See how player choices affect narrative paths and character development. Use this data to create more engaging interactive fiction.</p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="w-full lg:w-2/5 border-t lg:border-t-0 lg:border-l border-white/10 bg-black/20 p-4 sm:p-6 md:p-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="h-full flex flex-col">
                      <h3 className="font-display text-xl text-white mb-6">Adventure Stats</h3>
                      
                      <div className="mb-6">
                        <h4 className="text-white/70 text-sm uppercase tracking-wider mb-2">Your Character</h4>
                        <div className="space-y-3">
                          {Object.entries(playerStats).map(([stat, value]) => (
                            <div key={stat} className="">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-white/80 capitalize">{stat}</span>
                                <span className="text-accent">{value}/100</span>
                              </div>
                              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full bg-accent" 
                                  initial={{ width: '50%' }}
                                  animate={{ width: `${value}%` }}
                                  transition={{ duration: 0.5 }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mb-6 p-4 rounded-lg border border-white/10 bg-black/30">
                        <div className="flex items-start">
                          <div className="mt-1 flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
                            <HiSparkles className="text-accent text-sm" />
                          </div>
                          <div className="ml-4">
                            <h4 className="text-white font-semibold">Adventure Progress</h4>
                            <p className="text-white/60 text-sm">Explore more of the temple to unlock new paths and discoveries.</p>
                            <div className="mt-2 h-2 w-full bg-white/10 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-accent to-purple-600" 
                                initial={{ width: '0%' }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                            <p className="text-right text-xs text-white/60 mt-1">{progressPercentage}% complete</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="rounded-lg border border-white/10 bg-black/30 p-4">
                        <h4 className="text-white/70 text-sm uppercase tracking-wider mb-2">Adventure Log</h4>
                        <div className="text-white/80 text-sm space-y-1">
                          {choiceHistory.length > 0 ? (
                            <div className="max-h-[150px] overflow-y-auto space-y-2 pr-2">
                              {choiceHistory.map((choice, i) => (
                                <div key={i} className="text-white/80">
                                  <span className="text-accent">&gt;</span> {choice.choiceText}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-white/50 italic">Your adventure is just beginning...</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-auto pt-6">
                        <div className="text-center">
                          <button 
                            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent hover:text-white transition-colors"
                            onClick={toggleWriterMode}
                          >
                            <FaFeatherAlt className="mr-2" />
                            Switch to Writer Mode
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="mt-12 md:mt-16 text-center">
            <h3 className="text-2xl font-display font-bold text-white mb-4">Ready to create your own interactive story?</h3>
            <p className="text-white/70 max-w-2xl mx-auto mb-8">Sign up now to start crafting adventures that readers can play through. Our AI-powered tools make it easy.</p>
            <Button className="px-8 py-3 bg-accent hover:bg-accent-dark mx-auto">
              <HiSparkles className="mr-2" />
              Start Creating
            </Button>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}
