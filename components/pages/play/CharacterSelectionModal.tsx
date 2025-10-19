import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Sword, ArrowLeft, ChevronRight, Sparkles } from 'lucide-react';
import useAxiosWithAuth from '@/hooks/useAxiosWithAuth';
import { toast } from 'react-toastify';

const CharacterSelectionModal = ({setStoryId, fetchStoryData, story, storyId, game, isOpen, setIsOpen, setHasNewCharacter, handleGetGameStories, setSelectedStory, gameId }) => {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [characters, setCharacters] = useState([]);
  const tooltipRef = useRef(null);
  const containerRef = useRef(null);

  const tooltipStyle = useMemo(() => ({
    left: `${tooltipPosition.x}px`,
    top: `${tooltipPosition.y}px`,
    transform: 'translateY(-50%)'
  }), [tooltipPosition.x, tooltipPosition.y]);

  const mouseStyle = useMemo(() => ({
    left: `${mousePosition.x - 8}px`,
    top: `${mousePosition.y - 8}px`,
    opacity: hoveredCard ? 1 : 0
  }), [mousePosition.x, mousePosition.y, hoveredCard]);

  const classIcons = {
    Default: "👤",
    Fighter: "⚔️",
    Barbarian: "🪓",
    Paladin: "🛡️",
    Ranger: "🏹",
    Rogue: "🗡️",
    Priest: "✨"
  };

  const getClassIcon = (characterClass) => {
    return classIcons[characterClass] || classIcons.Default;
  };

  const defaultCharacterTemplate = {
    id: 'default',
    name: 'Unknown Character',
    description: 'No description available',
    icon: <Sword className="w-6 h-6" />,
    role: 'Adventurer',
    class: 'Default',
    difficulty: 'Beginner',
    primaryStat: 'Strength',
    tooltip: 'A versatile character ready for any challenge.',
    pros: ['Balanced stats', 'Adaptable', 'Easy to learn'],
    cons: ['No specialization', 'Limited advanced abilities'],
    stats: {
      strength: 14,
      dexterity: 12,
      constitution: 13,
      intelligence: 10,
      wisdom: 11,
      charisma: 10
    },
    level: 1,
    hp: 10,
    maxHp: 10,
    ac: 15,
    images: [],
    actions: [
      { name: 'Basic Attack', uses: '∞', type: 'Combat', description: 'Deal standard damage to an enemy' },
      { name: 'Defend', uses: 2, type: 'Defense', description: 'Reduce incoming damage for one turn' }
    ]
  };

  const processCharacters = useMemo(() => {
    const npcs = game?.game_npc && Array.isArray(game.game_npc) ? game.game_npc : [];

    const playableCharacters = npcs
      .filter(npc => npc?.is_playable)
      .map((npc, index) => {
        const template = npc.character_template && typeof npc.character_template === 'object' && !Array.isArray(npc.character_template)
          ? npc.character_template
          : {};

        let processedStats = {};
        if (template.abilities && typeof template.abilities === 'object') {
          Object.entries(template.abilities).forEach(([key, value]) => {
            const statName = key.toLowerCase();
            processedStats[statName] = typeof value === 'object' && value.score ? value.score : (typeof value === 'number' ? value : defaultCharacterTemplate.stats[statName] || 10);
          });
        } else {
          processedStats = { ...defaultCharacterTemplate.stats };
        }

        const characterClass = template.class || defaultCharacterTemplate.class;
        const primaryStat = template.class ? template.class : defaultCharacterTemplate.primaryStat;

        const getClassTraits = (className) => {
          const classTraits = {
            'Paladin': {
              tooltip: 'A holy warrior combining martial prowess with divine magic.',
              pros: ['High defense', 'Healing abilities', 'Divine magic'],
              cons: ['Limited spell slots', 'Strict moral code'],
              difficulty: 'Intermediate'
            },
            'Fighter': {
              tooltip: 'A master of martial combat and weapon expertise.',
              pros: ['High damage output', 'Weapon mastery', 'Tactical combat'],
              cons: ['Limited magic', 'Range limitations'],
              difficulty: 'Beginner'
            },
            'Barbarian': {
              tooltip: 'A fierce warrior driven by primal rage and strength.',
              pros: ['High health', 'Rage abilities', 'Physical dominance'],
              cons: ['Low defense when raging', 'Limited skills'],
              difficulty: 'Beginner'
            },
            'Ranger': {
              tooltip: 'A skilled tracker and archer with nature magic.',
              pros: ['Ranged combat', 'Tracking abilities', 'Nature magic'],
              cons: ['Lower health', 'Resource management'],
              difficulty: 'Intermediate'
            },
            'Rogue': {
              tooltip: 'A cunning scout specializing in stealth and precision.',
              pros: ['High damage', 'Stealth abilities', 'Lock picking'],
              cons: ['Low health', 'Light armor only'],
              difficulty: 'Advanced'
            },
            'Priest': {
              tooltip: 'A divine spellcaster focused on healing and support.',
              pros: ['Powerful healing', 'Divine magic', 'Party support'],
              cons: ['Low physical combat', 'Spell dependency'],
              difficulty: 'Intermediate'
            }
          };
          
          return classTraits[className] || {
            tooltip: defaultCharacterTemplate.tooltip,
            pros: defaultCharacterTemplate.pros,
            cons: defaultCharacterTemplate.cons,
            difficulty: defaultCharacterTemplate.difficulty
          };
        };

        const classTraits = getClassTraits(characterClass);

        const iconElement = (
          <div className="text-2xl">
            {getClassIcon(characterClass)}
          </div>
        );

        return {
          ...defaultCharacterTemplate,
          id: npc.id,
          name: npc.npc_name || defaultCharacterTemplate.name,
          description: npc.npc_description || defaultCharacterTemplate.description,
          images: Array.isArray(npc.npc_images) ? npc.npc_images : [],
          stats: processedStats,
          class: characterClass,
          role: characterClass, 
          difficulty: classTraits.difficulty,
          primaryStat: primaryStat,
          tooltip: classTraits.tooltip,
          pros: classTraits.pros,
          cons: classTraits.cons,
          level: template.level || defaultCharacterTemplate.level,
          hp: template.HP || template.hp || defaultCharacterTemplate.hp,
          maxHp: template.max_hp || template.HP || template.hp || defaultCharacterTemplate.maxHp,
          ac: template.AC || template.ac || defaultCharacterTemplate.ac,
          actions: template.actions || defaultCharacterTemplate.actions,
          icon: iconElement,
          background: template.background || '',
          gender: template.gender || ''
        };
      });

    return playableCharacters;
  }, [game?.game_npc]);

  useEffect(() => {
    setCharacters(processCharacters);
    return(()=>setCharacters(null))
  }, [processCharacters]);

   useEffect(() => {
    if (!isOpen) {
      setSelectedCharacter(null);
      setShowStats(false);
      setHoveredCard(null);
      setIsTransitioning(false);
      setShowTooltip(false);
      setTooltipPosition({ x: 0, y: 0 });
      setMousePosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current && !showStats) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });

        if (hoveredCard && showTooltip) {
          setTooltipPosition({
            x: e.clientX - rect.left + 20,
            y: e.clientY - rect.top - 10
          });
        }
      }
    };

    if (containerRef.current && !showStats) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
      return () => {
        if (containerRef.current) {
          containerRef.current.removeEventListener('mousemove', handleMouseMove);
        }
      };
    }

  }, [hoveredCard, showTooltip, showStats]);

  const handleCharacterSelect = (character) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedCharacter(character);
      setShowStats(true);
      setIsTransitioning(false);
      setHoveredCard(null);
      setShowTooltip(false);
    }, 300);
  };

  const { axiosInstance } = useAxiosWithAuth();

  const handleConfirm = async () => {
    if (!selectedCharacter) {
      console.error("No character selected");
      return;
    }

    try {
      const res = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/story/select-npc/`,
        {
          // story_id: storyId,
          npc_id: selectedCharacter.id,
          game_id: game.game_id
        }
      );
      if (res.status === 200) {
        const newStoryId = res.data.success.data.story_id;
        
        setIsOpen(false);
        // console.log("The story id from modal", newStoryId)
        
        // Update story ID and fetch story data
        setStoryId(newStoryId);
        await fetchStoryData(newStoryId);
        
        // Refresh stories list to include the new story
        const updatedStories = await handleGetGameStories(gameId);
        
        // Find and select the new story
        const newStory = updatedStories.find(story => story.story_id === newStoryId);
        if (newStory) {
          setSelectedStory(newStory);
        }
        
        toast.success("Character Selected Successfully", { autoClose: 2000 });
        setHasNewCharacter(true);
      }
    } catch (error) {
      toast.error("Failed to select character", { autoClose: 2000 });
      console.error("Error selecting character:", error);
    }
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowStats(false);
      setSelectedCharacter(null);
      setIsTransitioning(false);
    }, 300);
  };

  const handleCardHover = (character) => {
    if (!showStats) {
      setHoveredCard(character.id);
      setShowTooltip(true);
    }
  };

  const handleCardLeave = () => {
    setHoveredCard(null);
    setShowTooltip(false);
  };

  const getStatModifier = (stat) => {
    const modifier = Math.floor((stat - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  const getRoleColor = (role) => {
    const colors = {
      'Paladin': 'text-yellow-200 bg-gradient-to-r from-yellow-600/20 to-yellow-500/10 border-yellow-500/30',
      'Fighter': 'text-red-200 bg-gradient-to-r from-red-600/20 to-red-500/10 border-red-500/30',
      'Barbarian': 'text-orange-200 bg-gradient-to-r from-orange-600/20 to-orange-500/10 border-orange-500/30',
      'Ranger': 'text-green-200 bg-gradient-to-r from-green-600/20 to-green-500/10 border-green-500/30',
      'Rogue': 'text-purple-200 bg-gradient-to-r from-purple-600/20 to-purple-500/10 border-purple-500/30',
      'Priest': 'text-blue-200 bg-gradient-to-r from-blue-600/20 to-blue-500/10 border-blue-500/30',
      'Adventurer': 'text-blue-200 bg-gradient-to-r from-blue-600/20 to-blue-500/10 border-blue-500/30'
    };
    return colors[role] || 'text-slate-200 bg-gradient-to-r from-slate-600/20 to-slate-500/10 border-slate-500/30';
  };

  const getProxiedImage = (url, width, height) => {
    if (!url) return '';
    const params = new URLSearchParams({ src: url, focus: 'top', fit: 'cover', format: 'webp' });
    if (width) params.set('width', String(width));
    if (height) params.set('height', String(height));
    return `/api/image/proxy?${params.toString()}`;
  };

  const currentTooltipCharacter = characters.find(c => c.id === hoveredCard);

  if (!isOpen) return null;

  return (
    <>
      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.3); }
          50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.6), 0 0 30px rgba(139, 92, 246, 0.4); }
        }
        @keyframes rainbow-border {
          0% {
            background: linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3);
          }
          14.28% {
            background: linear-gradient(45deg, #9400d3, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082);
          }
          28.57% {
            background: linear-gradient(45deg, #4b0082, #9400d3, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff);
          }
          42.86% {
            background: linear-gradient(45deg, #0000ff, #4b0082, #9400d3, #ff0000, #ff7f00, #ffff00, #00ff00);
          }
          57.14% {
            background: linear-gradient(45deg, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000, #ff7f00, #ffff00);
          }
          71.43% {
            background: linear-gradient(45deg, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000, #ff7f00);
          }
          85.71% {
            background: linear-gradient(45deg, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000);
          }
          100% {
            background: linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3);
          }
        }
        @keyframes rainbow-slide {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 400% 50%;
          }
        }
        .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse 2s ease-in-out infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-rainbow-border { animation: rainbow-spin 12s linear infinite; }
        
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center;
        }
        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.6),
            0 0 0 1px rgba(139, 92, 246, 0.2),
            0 0 20px rgba(139, 92, 246, 0.15);
        }
        
        .rainbow-border-wrapper {
          position: relative;
          padding: 2px;
          border-radius: 16px;
          background: linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000);
          background-size: 400% 400%;
          animation: rainbow-slide 12s linear infinite;
        }
        
        .rainbow-border-wrapper:hover {
          animation-duration: 3s;
        }
        
        .rainbow-border-content {
          background: rgba(17, 24, 39, 1);
          border-radius: 14px;
          height: 100%;
          width: 100%;
          backdrop-filter: blur(20px);
        }
        
        .stat-bar {
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          background: linear-gradient(90deg, rgba(139, 92, 246, 0.9), rgba(168, 85, 247, 0.7));
        }
        
        .tooltip-enter {
          animation: scaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glass-effect {
          backdrop-filter: blur(20px);
          background: rgba(17, 24, 39, 0.85);
          border: 1px solid rgba(75, 85, 99, 0.3);
        }
        
        .bg-dark-gradient {
          background: linear-gradient(135deg, 
            rgba(6, 12, 34, 0.98) 0%,
            rgba(17, 24, 39, 0.95) 50%,
            rgba(31, 41, 55, 0.92) 100%);
        }
        
        .card-shimmer {
          position: relative;
          overflow: hidden;
        }
        
        .card-shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          transition: left 0.5s;
        }
        
        .card-shimmer:hover::before {
          left: 100%;
        }
      `}</style>

      <div
        ref={containerRef}
        className="fixed inset-0 bg-dark-gradient backdrop-blur-md flex items-center justify-center z-[9999] p-4"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/3 rounded-full animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-indigo-500/3 rounded-full animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-3/4 w-20 h-20 bg-violet-500/3 rounded-full animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="glass-effect rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in border border-gray-600/30">

          <div className="relative bg-gradient-to-r from-gray-900/80 to-gray-800/80 border-b border-gray-600/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-100 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-400 animate-pulse-slow" />
                  {showStats ? selectedCharacter?.name : 'Choose Your Character'}
                </h1>
                <p className="text-gray-300 mt-1">
                  {showStats ? 'Review character details and abilities' : 'Select a character to begin your adventure'}
                </p>
              </div>
              {/* <button
                onClick={() => setIsOpen(false)}
                className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 hover:rotate-90 group"
              >
                <X className="w-5 h-5 text-gray-400 group-hover:text-gray-200 transition-colors" />
              </button> */}
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>

              {!showStats ? (
                <div className="animate-fade-in">
                  {characters.length === 0 ? (
                    <div className="text-center text-gray-300">
                      No playable characters available.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {characters.map((character, index) => (
                        <div
                          key={character.id}
                          className="rainbow-border-wrapper card-hover animate-slide-up"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div
                            onClick={() => handleCharacterSelect(character)}
                            onMouseEnter={() => handleCardHover(character)}
                            onMouseLeave={handleCardLeave}
                            className="rainbow-border-content card-shimmer group cursor-pointer p-6 h-full"
                          >
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <div className="relative flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-700/60 to-gray-800/60 rounded-xl flex items-center justify-center group-hover:from-purple-600/20 group-hover:to-purple-700/20 transition-all duration-300 border border-gray-600/30">
                                  {character.icon}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-100 group-hover:text-purple-100 transition-colors duration-300">
                                    {character.name}
                                  </h3>
                                  <p className="text-sm text-gray-400">{character.class}</p>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-all duration-300 group-hover:translate-x-1" />
                            </div>

                            {character.images?.length > 0 && (
                              <div className="mb-4">
                                <img
                                  src={getProxiedImage(character.images[0].url, 800, 700)}
                                  alt={character.images[0].name}
                                  className="w-full h-40 md:h-48 object-cover rounded-lg"
                                  loading="lazy"
                                />
                              </div>
                            )}

                            <p className="text-gray-200 text-sm mb-4 leading-relaxed">
                              {character.description.length > 200 ? `${character.description.substring(0, 200)}...` : character.description}
                            </p>

                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getRoleColor(character.role)}`}>
                                  {character.role}
                                </span>
                              </div>
                              {/* Difficulty removed */}
                            </div>

                            <div className="pt-4 border-t border-gray-600/30 flex justify-between text-xs text-gray-400">
                              <div className="text-center">
                                <div className="text-gray-100 font-medium">{character.hp}</div>
                                <div className="text-gray-500">HP</div>
                              </div>
                              <div className="text-center">
                                <div className="text-gray-100 font-medium">{character.ac}</div>
                                <div className="text-gray-500">AC</div>
                              </div>
                              <div className="text-center">
                                <div className="text-gray-100 font-medium">{character.level}</div>
                                <div className="text-gray-500">Level</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="animate-fade-in">
                  <button
                    onClick={handleBack}
                    className="flex items-center space-x-2 text-gray-300 hover:text-gray-100 mb-6 transition-all duration-200 hover:translate-x-1 group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    <span>Back to selection</span>
                  </button>
                  
                  <button
                   onClick={handleConfirm}
                   className="w-full mb-6 flex items-center justify-center gap-2 text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-3.5 bg-accent animate-gradient overflow-hidden !bg-clip-border transition-all text-center shadow-md ease-linear hover:shadow-lg hover:bg-accent-dark shadow-accent/20 duration-300 text-white hover:translate-y-[-2px] rounded-xl font-medium"
                 >
                  Select {selectedCharacter.name}
                 </button>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-1">
                      <div className="glass-effect rounded-xl p-6 sticky top-0">
                        <div className="text-center mb-6">
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-600/30 to-purple-700/30 rounded-xl flex items-center justify-center mx-auto mb-4 animate-glow border border-purple-500/20">
                            {selectedCharacter.icon}
                          </div>
                          <h2 className="text-2xl font-semibold text-gray-100 mb-1">
                            {selectedCharacter.name}
                          </h2>
                          {selectedCharacter.images?.length > 0 && (
                            <div className="mb-4">
                              <img
                                src={getProxiedImage(selectedCharacter.images[0].url, 1000, 500)}
                                alt={selectedCharacter.images[0].name}
                                className="w-full h-56 object-cover rounded-lg"
                                loading="lazy"
                              />
                            </div>
                          )}
                          <p className="text-gray-200 mb-4">
                            {selectedCharacter.description.length > 200 ? `${selectedCharacter.description.substring(0, 200)}...` : selectedCharacter.description}
                          </p>

                          <div className="space-y-2">
                            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(selectedCharacter.role)}`}>
                              {selectedCharacter.class}
                            </div>
                            {/* Difficulty removed */}
                            {selectedCharacter.background && (
                              <p className="text-sm text-gray-400">Background: {selectedCharacter.background}</p>
                            )}
                            {selectedCharacter.gender && (
                              <p className="text-sm text-gray-400">Gender: {selectedCharacter.gender}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-100 mb-1">{selectedCharacter.hp}</div>
                            <div className="text-xs text-gray-400 uppercase tracking-wide">Hit Points</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-100 mb-1">{selectedCharacter.ac}</div>
                            <div className="text-xs text-gray-400 uppercase tracking-wide">Armor Class</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-100 mb-1">{selectedCharacter.level}</div>
                            <div className="text-xs text-gray-400 uppercase tracking-wide">Level</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                      <div className="glass-effect rounded-xl p-6 border border-gray-600/30">
                        <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                          Ability Scores
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {Object.entries(selectedCharacter.stats).map(([stat, value], index) => (
                            <div key={stat} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                              <div className="text-2xl font-bold text-gray-100 mb-1">{value}</div>
                              <div className="text-sm text-gray-200 mb-2 capitalize">{stat}</div>
                              <div className="text-xs text-gray-300 mb-2">
                                {getStatModifier(value)}
                              </div>
                              <div className="w-full bg-gray-700/60 rounded-full h-2 overflow-hidden">
                                <div
                                  className="stat-bar h-2 rounded-full"
                                  style={{
                                    width: `${(value / 20) * 100}%`,
                                    animationDelay: `${index * 0.2}s`
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="glass-effect rounded-xl p-6 border border-gray-600/30">
                        <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                          Actions & Abilities
                        </h3>
                        <div className="space-y-3">
                          {selectedCharacter.actions.map((action, index) => (
                            <div
                              key={index}
                              className="group flex items-start justify-between p-4 glass-effect rounded-lg border border-white/5 hover:border-purple-500/20 transition-all duration-300 animate-slide-up"
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-medium text-white group-hover:text-purple-200 transition-colors">
                                    {action.name}
                                  </h4>
                                  <span className="px-2 py-0.5 bg-slate-700/50 text-slate-300 text-xs rounded border border-white/10">
                                    {action.type}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">
                                  {action.description}
                                </p>
                              </div>
                              <div className="ml-4 text-right">
                                <div className="text-sm font-medium text-white">
                                  {action.uses === '∞' ? '∞' : action.uses}
                                </div>
                                <div className="text-xs text-slate-400">uses</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {showTooltip && currentTooltipCharacter && (
          <div
            ref={tooltipRef}
            className="fixed pointer-events-none z-[60] tooltip-enter"
            style={tooltipStyle}
          >
            <div className="glass-effect rounded-lg p-4 max-w-sm border border-white/20 shadow-2xl">
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600/30 to-purple-700/30 rounded-lg flex items-center justify-center border border-purple-500/20">
                  {React.cloneElement(currentTooltipCharacter.icon, {
                    className: "w-4 h-4 text-purple-300"
                  })}
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">
                    {currentTooltipCharacter.name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {currentTooltipCharacter.role}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                {currentTooltipCharacter.tooltip}
              </p>

              <div className="space-y-2">
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <div className="w-1 h-1 bg-green-400 rounded-full" />
                    <span className="text-xs text-green-300 font-medium">Strengths</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-0.5">
                    {currentTooltipCharacter.pros.map((pro, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        <span className="text-green-400">•</span>
                        <span>{pro}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <div className="w-1 h-1 bg-orange-400 rounded-full" />
                    <span className="text-xs text-orange-300 font-medium">Challenges</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-0.5">
                    {currentTooltipCharacter.cons.map((con, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        <span className="text-orange-400">•</span>
                        <span>{con}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2">
                <div className="w-2 h-2 bg-slate-800/80 border-l border-t border-white/20 rotate-45" />
              </div>
            </div>
          </div>
        )}

        <div
          className="fixed pointer-events-none z-[55] w-4 h-4 rounded-full bg-gradient-to-r from-purple-500/30 to-purple-600/30 blur-sm transition-all duration-100 ease-out"
          style={mouseStyle}
        />
        <div
          className="fixed pointer-events-none z-[55] w-2 h-2 rounded-full bg-purple-400/60 transition-all duration-75 ease-out"
          style={{
            left: `${mousePosition.x - 4}px`,
            top: `${mousePosition.y - 4}px`,
            opacity: hoveredCard ? 1 : 0
          }}
        />
      </div>
    </>
  );
};

export default CharacterSelectionModal;