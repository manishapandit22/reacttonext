"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const ForPlayers = () => {
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [demoStep, setDemoStep] = useState(0);
  const [animateTree, setAnimateTree] = useState(false);

  useEffect(() => {
    // Animate the outcome tree when component mounts
    const timer = setTimeout(() => {
      setAnimateTree(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleChoiceSelect = (choice) => {
    setSelectedChoice(choice);
    setDemoStep(1);
  };

  const resetDemo = () => {
    setSelectedChoice(null);
    setDemoStep(0);
  };

  // Demo content for the interactive elements
  const demoContent = [
    {
      scene: "You stand before the ancient ruins, its weathered stone archway looming ahead. Strange symbols glow with an eerie blue light along the entrance.",
      choices: [
        { id: "investigate", text: "Investigate the symbols" },
        { id: "enter", text: "Enter without touching anything" },
        { id: "retreat", text: "Retreat and return later" },
      ],
    },
    {
      outcomes: {
        investigate: {
          text: "You trace your fingers along the symbols. They pulse brighter at your touch, and ancient knowledge flows into your mind. You've gained +1 Arcane Insight and unlocked a hidden map to the treasure chamber.",
          consequence: "Knowledge gained, but triggered magical alarm",
          relationship: "+1 Respect from your scholarly companion",
          item: "Hidden Map"
        },
        enter: {
          text: "You carefully step through the archway, avoiding the glowing symbols. The passage remains silent, and you've successfully entered undetected. The way ahead branches into three dark corridors.",
          consequence: "Safer path, but less information gained",
          relationship: "+1 Trust from your cautious companion",
          item: "None"
        },
        retreat: {
          text: "You decide to gather more information before proceeding. Returning to the nearby village, you learn from locals about the deadly traps that have claimed many adventurers. You'll return better prepared.",
          consequence: "Delay, but better preparation",
          relationship: "-1 Impatience from your bold companion",
          item: "Local Map"
        }
      }
    }
  ];

  return (
    <section className="relative pb-24">
      {/* Background Elements */}
      <div className="container mx-auto px-4">
        {/* Accessibility Features */}
        <div className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-8xl mx-auto">
            {/* Text-to-speech */}
            <div className="rounded-xl border border-jacarta-100 bg-white p-8 text-center transition-shadow hover:shadow-xl dark:border-jacarta-700 dark:bg-jacarta-700">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-lg bg-accent/10">
                <svg className="h-8 w-8 fill-accent" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z" />
                </svg>
              </div>
              <h5 className="mb-2 font-display text-lg text-jacarta-700 dark:text-white">Play By Voice</h5>
              <p className="dark:text-jacarta-300">Speak to chat and text to speech</p>
            </div>
            
            {/* Customizable text */}
            <div className="rounded-xl border border-jacarta-100 bg-white p-8 text-center transition-shadow hover:shadow-xl dark:border-jacarta-700 dark:bg-jacarta-700">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-lg bg-accent/10">
                <svg className="h-8 w-8 fill-accent" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M2,20V22H22V20H13V5H16V3H8V5H11V20H2M17,15H19V13H17V15M15,11H19V9H15V11M19,13H15V19H19V13Z" />
                </svg>
              </div>
              <h5 className="mb-2 font-display text-lg text-jacarta-700 dark:text-white">Game Engine</h5>
              <p className="dark:text-jacarta-300">Rules = Risks = Stakes!</p>
            </div>
            
            {/* Save progress */}
            <div className="rounded-xl border border-jacarta-100 bg-white p-8 text-center transition-shadow hover:shadow-xl dark:border-jacarta-700 dark:bg-jacarta-700">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-lg bg-accent/10">
                <svg className="h-8 w-8 fill-accent" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M17,3H5C3.89,3 3,3.9 3,5V19C3,20.1 3.89,21 5,21H19C20.1,21 21,20.1 21,19V7L17,3M19,19H5V5H16.17L19,7.83V19M12,12C10.34,12 9,13.34 9,15C9,16.66 10.34,18 12,18C13.66,18 15,16.66 15,15C15,13.34 13.66,12 12,12M6,6H15V10H6V6Z" />
                </svg>
              </div>
              <h5 className="mb-2 font-display text-lg text-jacarta-700 dark:text-white">Cross-Device Progress</h5>
              <p className="dark:text-jacarta-300">Save progress and continue across devices</p>
            </div>
          </div>
        </div>
        
        {/* Visual Split-screen Demo */}
        <div className="mb-24 max-w-8xl mx-auto">
          <div className="rounded-2xl overflow-hidden  relative shadow-lg">
            {/* <div className="grid grid-cols-1 md:grid-cols-2"> */}
              {/* Left side - Path A */}
              {/* <div className="bg-gradient-to-br from-purple-900/90 to-jacarta-900 p-8 md:p-12 relative">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                  <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-purple-600/20 rounded-full blur-xl"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-accent/10 rounded-full blur-xl"></div>
                </div>
                
                <div className="relative z-10">
                  <h4 className="text-white text-xl font-semibold mb-4">Path A: Diplomacy</h4>
                  
                  <div className="prose prose-invert max-w-none mb-6">
                    <p>You chose to negotiate with the rival faction. Through careful diplomacy and strategic concessions, you forge an unexpected alliance. The combined forces are now strong enough to face the coming threat.</p>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-white text-sm">Gained valuable allies</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-white text-sm">Avoided bloodshed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <span className="text-white text-sm">Made political concessions</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                    <h5 className="text-accent mb-2 text-sm font-semibold">Future Impact</h5>
                    <p className="text-white text-sm">The alliance will bring peace and prosperity to the region, but some hardliners question your loyalty.</p>
                  </div>
                </div>
              </div> */}
              
              {/* Right side - Path B */}
              {/* <div className="bg-gradient-to-br from-blue-900/90 to-jacarta-900 p-8 md:p-12 relative">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                  <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-blue-600/20 rounded-full blur-xl"></div>
                  <div className="absolute bottom-1/3 left-1/3 w-40 h-40 bg-purple-500/10 rounded-full blur-xl"></div>
                </div>
                
                <div className="relative z-10">
                  <h4 className="text-white text-xl font-semibold mb-4">Path B: Confrontation</h4>
                  
                  <div className="prose prose-invert max-w-none mb-6">
                    <p>You chose to confront the rival faction. After a swift and decisive battle, your forces emerge victorious. You now control the entire region, but at what cost?</p>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-white text-sm">Complete control of the region</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-white text-sm">Gained valuable resources</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <span className="text-white text-sm">Heavy casualties</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                    <h5 className="text-accent mb-2 text-sm font-semibold">Future Impact</h5>
                    <p className="text-white text-sm">Your forces are weakened for the coming threat, and the families of the fallen demand justice.</p>
                  </div>
                </div>
              </div> */}
            {/* </div> */}
            
            {/* Overlay with prompt */}
            <div className=" flex items-center justify-center bg-jacarta-900/80 backdrop-blur-sm z-20">
              <div className="text-center max-w-md mx-auto p-6 rounded-lg bg-jacarta-800/95 border border-jacarta-600">
                <h3 className="text-white text-2xl font-semibold mb-6">Make Your Choice</h3>
                <p className="text-white mb-8">The rival faction has approached your borders. How will you respond to their presence?</p>
                
                <div className="flex flex-col  md:flex-row gap-4 justify-center w-full px-4">
                  <Link href={'/create'} className=" text-base w-full px-6  py-3 rounded-md font-medium text-white md:w-1/2 bg-accent transition-all text-center shadow-md ease-linear hover:shadow-lg hover:bg-accent-dark shadow-accent/20 duration-300 hover:translate-y-[-2px] hidden sm:block">
                  Create A Game
                  </Link>
                  <Link href={'/games'} className=" text-base px-6 w-full  py-3 font-medium animate-gradient--no-text-fill animate-gradient overflow-hidden !bg-clip-border transition-all text-center shadow-md ease-linear hover:shadow-lg hover:bg-accent-dark shadow-accent/20 rounded-md text-white md:w-1/2 duration-300 hover:translate-y-[-2px]">
                    Play A Game
                  </Link>
                </div>
                
                {/* <p className="text-jacarta-300 mt-6 text-sm">Each choice leads to a different story path with unique consequences</p> */}
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA */}
        {/* <div className="text-center">
          <a href="#"
            className="inline-block rounded-full bg-gradient-to-r from-accent to-purple-600 py-4 px-10 text-center font-semibold text-white shadow-accent-volume transition-all hover:shadow-accent-volume-lg hover:scale-105 text-lg"
          >
            Browse All Games
          </a>
        </div> */}
      </div>
    </section>
  );
};

export default ForPlayers;
