import React, { useState, useEffect } from "react";
import { Shield, Sword, Crosshair, SkipForward, Heart, Star, Award } from "lucide-react";

// interface Notification {
//   message: string;
//   type: "info" | "combat" | "reward" | "system";
// }

// interface RPGGameHUDProps {
//   onMeleeAttack: () => void;
//   onRangedAttack: () => void;
//   isPlayerTurn: boolean;
//   isMoving: boolean;
//   characterState: string;
// }

// const RPGGameHUD: React.FC<RPGGameHUDProps> = ({
//   onMeleeAttack,
//   onRangedAttack,
//   isPlayerTurn,
//   isMoving,
//   characterState,
// }) => {
//   const [actionPoints, setActionPoints] = useState<number>(5);
//   const [playerLevel, setPlayerLevel] = useState<number>(1);
//   const [experience, setExperience] = useState<number>(75);
//   const [notification, setNotification] = useState<Notification | null>(null);
//   const [showTutorial, setShowTutorial] = useState<boolean>(true);
//   const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
//   const [isSkillsOpen, setIsSkillsOpen] = useState<boolean>(false);
//   const [health, setHealth] = useState<number>(100);
//   const [mana, setMana] = useState<number>(80);
//   const [isGameMenuOpen, setIsGameMenuOpen] = useState<boolean>(false);
//   const [currentQuest, setCurrentQuest] = useState<string>("Find the Ancient Artifact");
//   const [questProgress, setQuestProgress] = useState<number>(2);
//   const [questTotal, setQuestTotal] = useState<number>(5);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setShowTutorial(false);
//     }, 5000);
    
//     return () => clearTimeout(timer);
//   }, []);

//   const displayNotification = (message: string, type: Notification["type"] = "info") => {
//     setNotification({ message, type });
//     setTimeout(() => setNotification(null), 3000);
//   };

//   const handleMeleeAttack = () => {
//     if (!isPlayerTurn || isMoving || characterState === "MELEE" || characterState === "RANGED") return;
//     displayNotification("Melee attack!", "combat");
//     setActionPoints(prev => Math.max(0, prev - 2));
//     onMeleeAttack();
//   };

//   const handleRangedAttack = () => {
//     if (!isPlayerTurn || isMoving || characterState === "MELEE" || characterState === "RANGED") return;
//     displayNotification("Ranged attack!", "combat");
//     setActionPoints(prev => Math.max(0, prev - 3));
//     onRangedAttack();
//   };

//   const handleEndTurn = () => {
//     if (!isPlayerTurn || isMoving) return;
//     displayNotification("Ending turn...", "system");
//     setActionPoints(5);
//   };

//   const toggleInventory = () => {
//     setIsInventoryOpen(!isInventoryOpen);
//     if (isSkillsOpen) setIsSkillsOpen(false);
//   };

//   const toggleSkills = () => {
//     setIsSkillsOpen(!isSkillsOpen);
//     if (isInventoryOpen) setIsInventoryOpen(false);
//   };

//   const toggleGameMenu = () => {
//     setIsGameMenuOpen(!isGameMenuOpen);
//   };

//   return (
//     <div className="absolute inset-0 pointer-events-none font-[Cinzel] flex flex-col">
//       <div className="pointer-events-auto flex justify-between items-center p-4 bg-gradient-to-b from-black to-transparent">
//         <div className="flex items-center">
//           <div className="flex flex-col mr-6">
//             <div className="flex items-center">
//               <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center p-1">
//                 <div className="absolute inset-0 rounded-full border-2 border-amber-300 opacity-50"></div>
//                 <span className="text-white font-bold text-xl">{playerLevel}</span>
//               </div>
//               <div className="ml-3">
//                 <h3 className="text-amber-300 font-bold text-lg">Hero Knight</h3>
//                 <div className="flex items-center">
//                   <div className="h-2 w-32 bg-gray-800 rounded-full overflow-hidden">
//                     <div 
//                       className="h-full bg-gradient-to-r from-amber-400 to-amber-600" 
//                       style={{ width: `${experience}%` }}
//                     ></div>
//                   </div>
//                   <span className="text-xs text-gray-400 ml-2">XP {experience}/100</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="bg-gray-900 bg-opacity-80 p-2 rounded-lg border border-gray-700">
//             <div className="text-xs text-gray-400">Current Quest</div>
//             <div className="text-amber-200 font-medium">{currentQuest}</div>
//             <div className="flex items-center mt-1">
//               <div className="h-1 w-24 bg-gray-800 rounded-full overflow-hidden">
//                 <div 
//                   className="h-full bg-amber-500" 
//                   style={{ width: `${(questProgress/questTotal) * 100}%` }}
//                 ></div>
//               </div>
//               <span className="text-xs text-gray-400 ml-2">{questProgress}/{questTotal}</span>
//             </div>
//           </div>
//         </div>

//         <div className="flex space-x-3">
//           <button onClick={toggleInventory} className="group bg-gray-900 bg-opacity-80 hover:bg-gray-800 p-2 rounded-lg border border-gray-700 transition-all">
//             <span className="text-gray-400 group-hover:text-amber-300 text-sm">Inventory [I]</span>
//           </button>
//           <button onClick={toggleSkills} className="group bg-gray-900 bg-opacity-80 hover:bg-gray-800 p-2 rounded-lg border border-gray-700 transition-all">
//             <span className="text-gray-400 group-hover:text-amber-300 text-sm">Skills [K]</span>
//           </button>
//           <button onClick={toggleGameMenu} className="group bg-gray-900 bg-opacity-80 hover:bg-gray-800 p-2 rounded-lg border border-gray-700 transition-all">
//             <span className="text-gray-400 group-hover:text-amber-300 text-sm">Menu [Esc]</span>
//           </button>
//         </div>
//       </div>

//       <div className="absolute top-24 left-4 bg-gray-900 bg-opacity-70 p-3 rounded-lg border border-gray-800">
//         <div className="flex items-center mb-2">
//           <Heart size={16} className="text-red-500 mr-2" />
//           <div className="h-3 w-32 bg-gray-800 rounded-full overflow-hidden">
//             <div 
//               className="h-full bg-gradient-to-r from-red-800 to-red-500" 
//               style={{ width: `${health}%` }}
//             ></div>
//           </div>
//           <span className="text-xs text-gray-300 ml-2">{health}/100</span>
//         </div>
//         <div className="flex items-center">
//           <Star size={16} className="text-blue-400 mr-2" />
//           <div className="h-3 w-32 bg-gray-800 rounded-full overflow-hidden">
//             <div 
//               className="h-full bg-gradient-to-r from-blue-800 to-blue-500" 
//               style={{ width: `${mana}%` }}
//             ></div>
//           </div>
//           <span className="text-xs text-gray-300 ml-2">{mana}/100</span>
//         </div>
//       </div>

//       <div className="pointer-events-auto mt-auto p-4">
//         <div className="flex justify-center mb-4">
//           {notification && (
//             <div className={`bg-gray-900 bg-opacity-90 px-4 py-2 rounded-full border ${
//               notification.type === 'combat' ? 'border-red-600 text-red-400' : 
//               notification.type === 'reward' ? 'border-amber-600 text-amber-400' : 
//               'border-blue-600 text-blue-400'
//             }`}>
//               {notification.message}
//             </div>
//           )}
//         </div>

//         <div className="flex justify-between items-center">
//           <div className="flex flex-col">
//             <div className="bg-gray-900 bg-opacity-80 p-2 rounded-lg border border-gray-700">
//               <div className="text-sm text-amber-400">{isPlayerTurn ? "Your Turn" : "Enemy Turn"}</div>
//               <div className="flex mt-1">
//                 {[...Array(5)].map((_, i) => (
//                   <div
//                     key={i}
//                     className={`w-4 h-4 rounded-full mr-1 ${
//                       i < actionPoints ? "bg-amber-500" : "bg-gray-700"
//                     }`}
//                   ></div>
//                 ))}
//                 <span className="text-xs text-gray-400 ml-1">AP</span>
//               </div>
//             </div>
//           </div>

//           <div className="flex space-x-3">
//             <button
//               onClick={handleMeleeAttack}
//               disabled={!isPlayerTurn || isMoving || characterState === "MELEE" || characterState === "RANGED" || actionPoints < 2}
//               className={`group flex flex-col items-center justify-center w-16 h-16 rounded-full ${
//                 isPlayerTurn && actionPoints >= 2 && !isMoving && characterState !== "MELEE" && characterState !== "RANGED"
//                   ? "bg-gradient-to-br from-red-700 to-red-900 hover:from-red-600 hover:to-red-800"
//                   : "bg-gray-900 opacity-50 cursor-not-allowed"
//               } transition-all`}
//             >
//               <Sword size={24} className="text-white mb-1" />
//               <span className="text-xs text-white">Melee</span>
//             </button>

//             <button
//               onClick={handleRangedAttack}
//               disabled={!isPlayerTurn || isMoving || characterState === "MELEE" || characterState === "RANGED" || actionPoints < 3}
//               className={`group flex flex-col items-center justify-center w-16 h-16 rounded-full ${
//                 isPlayerTurn && actionPoints >= 3 && !isMoving && characterState !== "MELEE" && characterState !== "RANGED"
//                   ? "bg-gradient-to-br from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800"
//                   : "bg-gray-900 opacity-50 cursor-not-allowed"
//               } transition-all`}
//             >
//               <Crosshair size={24} className="text-white mb-1" />
//               <span className="text-xs text-white">Ranged</span>
//             </button>

//             <button
//               onClick={handleEndTurn}
//               disabled={!isPlayerTurn || isMoving}
//               className={`group flex flex-col items-center justify-center w-16 h-16 rounded-full ${
//                 isPlayerTurn && !isMoving
//                   ? "bg-gradient-to-br from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800"
//                   : "bg-gray-900 opacity-50 cursor-not-allowed"
//               } transition-all`}
//             >
//               <SkipForward size={24} className="text-white mb-1" />
//               <span className="text-xs text-white">End</span>
//             </button>
//           </div>

//           <div className="bg-gray-900 bg-opacity-80 p-2 rounded-lg border border-gray-700 text-sm text-gray-300 max-w-xs">
//             <strong className="text-amber-400">Tip:</strong> Click on your character to show movement options, then select a highlighted tile to move.
//           </div>
//         </div>
//       </div>

//       {showTutorial && (
//         <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
//           <div className="bg-gray-900 p-6 rounded-lg border border-amber-600 max-w-lg">
//             <h2 className="text-amber-400 text-2xl font-bold mb-4">Welcome, Hero!</h2>
//             <ul className="space-y-3 text-gray-300">
//               <li className="flex items-start">
//                 <Award className="text-amber-500 mr-2 mt-1 flex-shrink-0" size={18} />
//                 <span>Use <strong>WASD</strong> or <strong>Arrow Keys</strong> to move your character on the grid.</span>
//               </li>
//               <li className="flex items-start">
//                 <Award className="text-amber-500 mr-2 mt-1 flex-shrink-0" size={18} />
//                 <span>Press <strong>M</strong> for melee attacks or <strong>R</strong> for ranged attacks.</span>
//               </li>
//               <li className="flex items-start">
//                 <Award className="text-amber-500 mr-2 mt-1 flex-shrink-0" size={18} />
//                 <span>Click your character to see available movement tiles.</span>
//               </li>
//               <li className="flex items-start">
//                 <Award className="text-amber-500 mr-2 mt-1 flex-shrink-0" size={18} />
//                 <span>Use <strong>1-4</strong> keys to trigger different effects.</span>
//               </li>
//             </ul>
//             <button 
//               onClick={() => setShowTutorial(false)}
//               className="mt-6 bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded-lg w-full transition-colors"
//             >
//               Got it!
//             </button>
//           </div>
//         </div>
//       )}

//       {isInventoryOpen && (
//         <div className="absolute right-4 top-20 pointer-events-auto bg-gray-900 bg-opacity-95 p-4 rounded-lg border border-gray-700 w-64">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-amber-400 font-bold">Inventory</h3>
//             <button onClick={toggleInventory} className="text-gray-400 hover:text-white">×</button>
//           </div>
//           <div className="grid grid-cols-4 gap-2">
//             {[...Array(12)].map((_, i) => (
//               <div key={i} className="w-12 h-12 bg-gray-800 rounded border border-gray-700 flex items-center justify-center">
//                 {i === 0 && <Sword size={20} className="text-gray-400" />}
//                 {i === 1 && <Shield size={20} className="text-gray-400" />}
//               </div>
//             ))}
//           </div>
//           <div className="mt-4 text-sm text-gray-400">
//             <div className="flex justify-between mb-1">
//               <span>Gold:</span>
//               <span className="text-amber-400">250</span>
//             </div>
//             <div className="flex justify-between">
//               <span>Carrying:</span>
//               <span>5/20</span>
//             </div>
//           </div>
//         </div>
//       )}

//       {isSkillsOpen && (
//         <div className="absolute right-4 top-20 pointer-events-auto bg-gray-900 bg-opacity-95 p-4 rounded-lg border border-gray-700 w-64">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-amber-400 font-bold">Skills</h3>
//             <button onClick={toggleSkills} className="text-gray-400 hover:text-white">×</button>
//           </div>
//           <div className="space-y-3">
//             <div className="flex items-center">
//               <div className="w-10 h-10 rounded-full bg-red-900 flex items-center justify-center mr-3">
//                 <Sword size={18} className="text-red-400" />
//               </div>
//               <div>
//                 <div className="text-sm text-white font-medium">Mighty Strike</div>
//                 <div className="text-xs text-gray-400">3 AP - 150% damage</div>
//               </div>
//             </div>
//             <div className="flex items-center">
//               <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center mr-3">
//                 <Shield size={18} className="text-blue-400" />
//               </div>
//               <div>
//                 <div className="text-sm text-white font-medium">Defend</div>
//                 <div className="text-xs text-gray-400">2 AP - 50% damage reduction</div>
//               </div>
//             </div>
//             <div className="flex items-center opacity-50">
//               <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center mr-3">
//                 <Crosshair size={18} className="text-purple-400" />
//               </div>
//               <div>
//                 <div className="text-sm text-white font-medium">Multi Shot</div>
//                 <div className="text-xs text-gray-400">5 AP - Unlocks at level 3</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {isGameMenuOpen && (
//         <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center pointer-events-auto">
//           <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 w-80">
//             <h2 className="text-amber-400 text-xl font-bold mb-6 text-center">Game Menu</h2>
//             <div className="space-y-3">
//               <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors">
//                 Continue
//               </button>
//               <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors">
//                 Save Game
//               </button>
//               <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors">
//                 Load Game
//               </button>
//               <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors">
//                 Settings
//               </button>
//               <button className="w-full bg-red-900 hover:bg-red-800 text-white py-2 rounded-lg transition-colors">
//                 Exit Game
//               </button>
//             </div>
//             <button
//               onClick={toggleGameMenu}
//               className="mt-6 w-full bg-transparent border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white py-2 rounded-lg transition-colors"
//             >
//               Close Menu
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="absolute bottom-4 right-4 pointer-events-auto w-40 h-40 bg-gray-900 bg-opacity-70 rounded-lg overflow-hidden border border-gray-700">
//         <div className="absolute inset-0 p-1">
//           <div className="relative w-full h-full">
//             <div className="absolute inset-2 grid grid-cols-8 grid-rows-8 gap-px">
//               {[...Array(64)].map((_, i) => (
//                 <div 
//                   key={i} 
//                   className={`
//                     ${i === 36 ? 'bg-amber-500' : 'bg-gray-700'}
//                     ${i === 38 ? 'bg-red-600' : ''}
//                     ${[10, 11, 12, 18, 20, 26, 27, 28].includes(i) ? 'bg-gray-500' : ''}
//                   `}
//                 ></div>
//               ))}
//             </div>
//           </div>
//         </div>
//         <div className="absolute inset-0 pointer-events-none border-4 border-transparent hover:border-amber-500 transition-colors"></div>
//       </div>
//     </div>
//   );
// };

// export default RPGGameHUD;


const RPGGameHUD = ({ 
  onMeleeAttack, 
  onRangedAttack, 
  onSpeak,
  isPlayerTurn, 
  isMoving, 
  characterState,
  selectedPiece,
  selectedCharacter,
  isEnemyTurn = false
}) => {
  const [actionPoints, setActionPoints] = useState(5);
  const [notification, setNotification] = useState(null);
  
  const displayNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleMeleeAttack = () => {
    if (!isPlayerTurn || isMoving || characterState === "attack" || characterState === "RANGED" || !selectedPiece) {
      console.log("Melee attack blocked:", { isPlayerTurn, isMoving, characterState, selectedPiece });
      return;
    }
    displayNotification("Melee attack!", "combat");
    setActionPoints(prev => Math.max(0, prev - 2));
    onMeleeAttack();
  };

  const handleRangedAttack = () => {
    if (!isPlayerTurn || isMoving || characterState === "attack" || characterState === "RANGED" || !selectedPiece) {
      console.log("Ranged attack blocked:", { isPlayerTurn, isMoving, characterState, selectedPiece });
      return;
    }
    displayNotification("Ranged attack!", "combat");
    setActionPoints(prev => Math.max(0, prev - 3));
    onRangedAttack();
  };
  
  const handleSpeak = () => {
    if (!isPlayerTurn || isMoving || !selectedPiece) {
      console.log("Speak action blocked:", { isPlayerTurn, isMoving, selectedPiece });
      return;
    }
    displayNotification(`${selectedCharacter?.id || 'Character'} is speaking...`, "info");
    setActionPoints(prev => Math.max(0, prev - 1));
    onSpeak();
  };

  const handleEndTurn = () => {
    if (!isPlayerTurn || isMoving) return;
    displayNotification("Ending turn...", "system");
    setActionPoints(5);
  };

  return (
    <div className="absolute inset-0 pointer-events-none font-sans flex flex-col">
      <div className="pointer-events-auto flex justify-between items-center p-4 bg-gradient-to-b from-black to-transparent">
        <div className="flex items-center">
          <div className="bg-gray-900 bg-opacity-80 p-2 rounded-lg border border-gray-700">
            <div className="text-xs text-gray-400">Current Game</div>
            <div className="text-amber-200 font-medium">Openbook Interactive Mode</div>
          </div>
        </div>
      </div>

      <div className="pointer-events-auto mt-auto p-4">
        <div className="flex justify-center mb-4">
          {notification && (
            <div className={`bg-gray-900 bg-opacity-90 px-4 py-2 rounded-full border ${
              notification.type === 'combat' ? 'border-red-600 text-red-400' : 
              notification.type === 'reward' ? 'border-amber-600 text-amber-400' : 
              'border-blue-600 text-blue-400'
            }`}>
              {notification.message}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <div className="bg-gray-900 bg-opacity-80 p-2 rounded-lg border border-gray-700">
              <div className="text-sm text-amber-400">
                {isPlayerTurn ? "Your Turn" : isEnemyTurn ? "Enemy Moving..." : "Enemy Turn"}
              </div>
              <div className="flex mt-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full mr-1 ${
                      i < actionPoints ? "bg-amber-500" : "bg-gray-700"
                    }`}
                  ></div>
                ))}
                <span className="text-xs text-gray-400 ml-1">AP</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleMeleeAttack}
              disabled={!isPlayerTurn || isMoving || characterState === "attack" || characterState === "RANGED" || actionPoints < 2 || !selectedPiece}
              className={`group flex flex-col items-center justify-center w-16 h-16 rounded-full ${
                isPlayerTurn && actionPoints >= 2 && !isMoving && characterState !== "attack" && characterState !== "RANGED" && selectedPiece
                  ? "bg-gradient-to-br from-red-700 to-red-900 hover:from-red-600 hover:to-red-800"
                  : "bg-gray-900 opacity-50 cursor-not-allowed"
              } transition-all`}
            >
              <svg className="w-6 h-6 text-white mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 17.5L3 6L3 3L6 3L17.5 14.5" />
                <path d="M13 19L19 13" />
                <path d="M16 16L20 20" />
                <path d="M19 21L21 19" />
              </svg>
              <span className="text-xs text-white">Melee</span>
            </button>

            <button
              onClick={handleRangedAttack}
              disabled={!isPlayerTurn || isMoving || characterState === "attack" || characterState === "RANGED" || actionPoints < 3 || !selectedPiece}
              className={`group flex flex-col items-center justify-center w-16 h-16 rounded-full ${
                isPlayerTurn && actionPoints >= 3 && !isMoving && characterState !== "attack" && characterState !== "RANGED" && selectedPiece
                  ? "bg-gradient-to-br from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800"
                  : "bg-gray-900 opacity-50 cursor-not-allowed"
              } transition-all`}
            >
              <svg className="w-6 h-6 text-white mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
              <span className="text-xs text-white">Ranged</span>
            </button>
            
            {/* New Speak Button */}
            <button
              onClick={handleSpeak}
              disabled={!isPlayerTurn || isMoving || !selectedPiece || actionPoints < 1}
              className={`group flex flex-col items-center justify-center w-16 h-16 rounded-full ${
                isPlayerTurn && actionPoints >= 1 && !isMoving && selectedPiece
                  ? "bg-gradient-to-br from-green-700 to-green-900 hover:from-green-600 hover:to-green-800"
                  : "bg-gray-900 opacity-50 cursor-not-allowed"
              } transition-all`}
            >
              <svg className="w-6 h-6 text-white mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              <span className="text-xs text-white">Speak</span>
            </button>

            <button
              onClick={handleEndTurn}
              disabled={!isPlayerTurn || isMoving}
              className={`group flex flex-col items-center justify-center w-16 h-16 rounded-full ${
                isPlayerTurn && !isMoving
                  ? "bg-gradient-to-br from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800"
                  : "bg-gray-900 opacity-50 cursor-not-allowed"
              } transition-all`}
            >
              <svg className="w-6 h-6 text-white mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 4 15 12 5 20 5 4" />
                <line x1="19" y1="5" x2="19" y2="19" />
              </svg>
              <span className="text-xs text-white">End</span>
            </button>
          </div>

          <div className="bg-gray-900 bg-opacity-80 p-2 rounded-lg border border-gray-700 text-sm text-gray-300 max-w-xs">
            {selectedCharacter ? (
              <>
                <strong className="text-amber-400">{selectedCharacter.id}</strong>
                <div className="text-xs mt-1">{selectedCharacter.speechText?.substring(0, 30)}...</div>
              </>
            ) : (
              <>
                <strong className="text-amber-400">Tip:</strong> Click on a piece to show movement options
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RPGGameHUD;