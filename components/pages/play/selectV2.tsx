import React, { useState, useEffect } from 'react';
import { X, Sword, Shield, Target, Zap, Wand2, Heart, Star, TrendingUp, User, Activity, ChevronRight } from 'lucide-react';

const CharacterSelectionv2 = ({ isOpen, setIsOpen, gameCharacters = [] }) => {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const defaultCharacters = [
    {
      id: 'fighter',
      name: 'Fighter',
      icon: <Sword className="w-12 h-12" />,
      description: 'Built around raw Strength (or occasionally Dexterity) and hardy Constitution. Fighters excel at any straight-up physical contest.',
      specialty: 'Melee Combat',
      difficulty: 'Beginner',
      color: 'from-rose-500 to-pink-600',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
      accentColor: 'rose',
      stats: {
        strength: 16,
        dexterity: 12,
        constitution: 15,
        intelligence: 10,
        wisdom: 13,
        charisma: 8
      },
      level: 1,
      hp: 12,
      maxHp: 12,
      ac: 16,
      actions: [
        { name: 'Second Wind', uses: 1, description: 'Recover health in combat' },
        { name: 'Action Surge', uses: 1, description: 'Take an additional action' }
      ]
    },
    {
      id: 'barbarian',
      name: 'Barbarian',
      icon: <Shield className="w-12 h-12" />,
      description: 'Fueled by towering Strength and an iron Constitution, the Barbarian is an unarmored juggernaut whose rage turns pain into momentum.',
      specialty: 'Tank & Damage',
      difficulty: 'Intermediate',
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      accentColor: 'orange',
      stats: {
        strength: 17,
        dexterity: 13,
        constitution: 16,
        intelligence: 8,
        wisdom: 12,
        charisma: 10
      },
      level: 1,
      hp: 14,
      maxHp: 14,
      ac: 13,
      actions: [
        { name: 'Rage', uses: 2, description: 'Enter a battle frenzy for extra damage' },
        { name: 'Reckless Attack', uses: 999, description: 'Attack with advantage but vulnerability' }
      ]
    },
    {
      id: 'paladin',
      name: 'Paladin',
      icon: <Heart className="w-12 h-12" />,
      description: 'A Paladin marries Strength with commanding Charisma. Clad in plate and guided by oath-bound conviction.',
      specialty: 'Support & Defense',
      difficulty: 'Advanced',
      color: 'from-yellow-400 to-amber-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      accentColor: 'yellow',
      stats: {
        strength: 16,
        dexterity: 10,
        constitution: 14,
        intelligence: 11,
        wisdom: 13,
        charisma: 15
      },
      level: 1,
      hp: 11,
      maxHp: 11,
      ac: 18,
      actions: [
        { name: 'Lay on Hands', uses: 5, description: 'Heal yourself or allies with divine power' },
        { name: 'Divine Sense', uses: 4, description: 'Detect celestial, fiend, or undead presence' }
      ]
    },
    {
      id: 'ranger',
      name: 'Ranger',
      icon: <Target className="w-12 h-12" />,
      description: 'Leaning on Dexterity and sharp-eyed Wisdom, Rangers are agile wilderness skirmishers.',
      specialty: 'Ranged Combat',
      difficulty: 'Intermediate',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      accentColor: 'emerald',
      stats: {
        strength: 12,
        dexterity: 16,
        constitution: 13,
        intelligence: 11,
        wisdom: 15,
        charisma: 10
      },
      level: 1,
      hp: 10,
      maxHp: 10,
      ac: 14,
      actions: [
        { name: 'Favored Enemy', uses: 999, description: 'Bonus damage against specific creature types' },
        { name: 'Natural Explorer', uses: 999, description: 'Navigate difficult terrain with ease' }
      ]
    },
    {
      id: 'rogue',
      name: 'Rogue',
      icon: <Zap className="w-12 h-12" />,
      description: 'Driven by razor Dexterity plus a dose of intellect or charm, Rogues specialize in timing and precision.',
      specialty: 'Stealth & Precision',
      difficulty: 'Advanced',
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/20',
      accentColor: 'violet',
      stats: {
        strength: 10,
        dexterity: 17,
        constitution: 12,
        intelligence: 14,
        wisdom: 13,
        charisma: 11
      },
      level: 1,
      hp: 9,
      maxHp: 9,
      ac: 13,
      actions: [
        { name: 'Sneak Attack', uses: 999, description: 'Deal extra damage from advantageous positions' },
        { name: 'Thieves Cant', uses: 999, description: 'Communicate in secret thieves language' }
      ]
    },
    {
      id: 'priest',
      name: 'Priest',
      icon: <Wand2 className="w-12 h-12" />,
      description: 'Priests focus on devout Wisdom, backed by healthy Constitution. They channel divine energy to heal wounds.',
      specialty: 'Healing & Magic',
      difficulty: 'Expert',
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
      accentColor: 'cyan',
      stats: {
        strength: 12,
        dexterity: 10,
        constitution: 14,
        intelligence: 13,
        wisdom: 18,
        charisma: 16
      },
      level: 4,
      hp: 32,
      maxHp: 32,
      ac: 12,
      actions: [
        { name: 'Sacred Flame', uses: 999, description: 'Divine fire damages enemies' },
        { name: 'Guiding Bolt', uses: 6, description: 'Radiant bolt that marks targets' },
        { name: 'Channel Divinity', uses: 1, description: 'Powerful divine intervention' },
        { name: 'Healing Word', uses: 6, description: 'Instantly heal allies at range' }
      ]
    }
  ];

  const characters = gameCharacters.length > 0 ? gameCharacters : defaultCharacters;

  const handleMouseMove = (e) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleCharacterSelect = (character) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedCharacter(character);
      setShowStats(true);
      setIsTransitioning(false);
    }, 200);
  };

  const handleConfirm = () => {
    if (selectedCharacter) {
      setIsOpen({
        selectedClass: selectedCharacter.name,
        selectedGender: 'middle',
        character: selectedCharacter
      });
    }
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowStats(false);
      setSelectedCharacter(null);
      setIsTransitioning(false);
    }, 200);
  };

  const getStatModifier = (stat) => {
    const modifier = Math.floor((stat - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-emerald-400 bg-emerald-500/20';
      case 'Intermediate': return 'text-amber-400 bg-amber-500/20';
      case 'Advanced': return 'text-orange-400 bg-orange-500/20';
      case 'Expert': return 'text-red-400 bg-red-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const StatBar = ({ label, value, maxValue = 20, color }) => (
    <div className="group">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-slate-400">{getStatModifier(value)}</span>
          <span className="text-sm font-bold text-white bg-slate-700 px-2 py-0.5 rounded text-xs">{value}</span>
        </div>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div 
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700 ease-out shadow-sm`}
          style={{ 
            width: `${(value / maxValue) * 100}%`,
            boxShadow: `0 0 8px ${color.includes('rose') ? '#f43f5e' : color.includes('orange') ? '#fb923c' : color.includes('yellow') ? '#fbbf24' : color.includes('emerald') ? '#10b981' : color.includes('violet') ? '#8b5cf6' : '#06b6d4'}40`
          }}
        />
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl max-w-7xl w-full max-h-[95vh] overflow-hidden border border-slate-700/50 shadow-2xl">
        <div className="relative bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-8 border-b border-slate-700/50">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white tracking-tight">
                {showStats ? selectedCharacter?.name : 'Choose Your Character'}
              </h1>
              <p className="text-slate-400 text-lg font-medium">
                {showStats ? 'Review abilities and confirm your selection' : 'Select a class that matches your preferred playstyle'}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-all duration-200 p-3 hover:bg-slate-800/50 rounded-xl group"
            >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
        </div>

        <div className={`p-8 overflow-y-auto max-h-[calc(95vh-180px)] transition-all duration-200 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          {!showStats ? (
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-semibold text-white">Available Classes</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">Each class offers unique gameplay mechanics, strengths, and tactical approaches to combat and exploration.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {characters.map((character, index) => (
                  <div
                    key={character.id}
                    className="group relative"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onMouseEnter={() => setHoveredCard(character.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onMouseMove={handleMouseMove}
                    onClick={() => handleCharacterSelect(character)}
                  >
                    <div className={`relative ${character.bgColor} ${character.borderColor} border rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20 backdrop-blur-sm`}>
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${character.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                      
                      <div className="relative space-y-4">
                        <div className="flex justify-center">
                          <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${character.color} group-hover:scale-110 transition-transform duration-300`}>
                            <div className="text-white">
                              {character.icon}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-center space-y-2">
                          <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
                            {character.name}
                          </h3>
                          
                          <div className="flex items-center justify-center gap-3">
                            <span className="text-sm font-medium text-slate-300">{character.specialty}</span>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(character.difficulty)}`}>
                              {character.difficulty}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-slate-400 text-sm leading-relaxed text-center">
                          {character.description}
                        </p>
                        
                        <div className="flex justify-between pt-4 border-t border-slate-700/50">
                          <div className="text-center space-y-1">
                            <div className="flex items-center justify-center gap-1">
                              <Heart className="w-3 h-3 text-red-400" />
                              <span className="text-xs font-medium text-slate-400">Health</span>
                            </div>
                            <span className="text-sm font-bold text-white">{character.hp}</span>
                          </div>
                          <div className="text-center space-y-1">
                            <div className="flex items-center justify-center gap-1">
                              <Shield className="w-3 h-3 text-blue-400" />
                              <span className="text-xs font-medium text-slate-400">Armor</span>
                            </div>
                            <span className="text-sm font-bold text-white">{character.ac}</span>
                          </div>
                          <div className="text-center space-y-1">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400" />
                              <span className="text-xs font-medium text-slate-400">Level</span>
                            </div>
                            <span className="text-sm font-bold text-white">{character.level}</span>
                          </div>
                        </div>

                        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${character.color} flex items-center justify-center`}>
                            <ChevronRight className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col lg:flex-row items-start gap-8">
                <div className="flex-shrink-0">
                  <div className={`relative w-32 h-32 rounded-3xl bg-gradient-to-br ${selectedCharacter.color} p-1 group`}>
                    <div className="w-full h-full bg-slate-800 rounded-[22px] flex items-center justify-center group-hover:bg-slate-750 transition-colors duration-300">
                      <div className="text-white">
                        {React.cloneElement(selectedCharacter.icon, { className: "w-16 h-16" })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-grow space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-bold text-white tracking-tight">{selectedCharacter.name}</h2>
                    <div className="flex items-center gap-4 text-lg">
                      <span className="text-slate-300">Level {selectedCharacter.level}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300">{selectedCharacter.specialty}</span>
                    </div>
                  </div>
                  
                  <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">{selectedCharacter.description}</p>
                  
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 px-4 py-2 rounded-xl">
                      <Heart className="w-5 h-5 text-red-400" />
                      <span className="font-semibold text-white">HP: {selectedCharacter.hp}/{selectedCharacter.maxHp}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 px-4 py-2 rounded-xl">
                      <Shield className="w-5 h-5 text-blue-400" />
                      <span className="font-semibold text-white">AC: {selectedCharacter.ac}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${selectedCharacter.bgColor} ${selectedCharacter.borderColor} border px-4 py-2 rounded-xl`}>
                      <Star className="w-5 h-5" />
                      <span className="font-semibold text-white">{selectedCharacter.difficulty}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <User className="w-6 h-6 text-slate-400" />
                    <h3 className="text-2xl font-bold text-white">Ability Scores</h3>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 space-y-4">
                    {Object.entries(selectedCharacter.stats).map(([stat, value]) => (
                      <StatBar 
                        key={stat}
                        label={stat.charAt(0).toUpperCase() + stat.slice(1)}
                        value={value}
                        color={selectedCharacter.color}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Activity className="w-6 h-6 text-slate-400" />
                    <h3 className="text-2xl font-bold text-white">Actions & Abilities</h3>
                  </div>
                  <div className="space-y-3">
                    {selectedCharacter.actions.map((action, index) => (
                      <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:bg-slate-800/70 transition-colors duration-200 group">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-lg text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all duration-300">{action.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-medium">Uses:</span>
                            <span className={`font-bold px-2 py-1 rounded-lg text-xs ${action.uses === 999 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                              {action.uses === 999 ? '∞' : action.uses}
                            </span>
                          </div>
                        </div>
                        {action.description && (
                          <p className="text-slate-400 text-sm leading-relaxed">{action.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-6 border-t border-slate-700/50">
                <button
                  onClick={handleBack}
                  className="px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all duration-200 font-semibold text-white hover:scale-105 border border-slate-600/50"
                >
                  Back to Selection
                </button>
                <button
                  onClick={handleConfirm}
                  className={`px-8 py-3 bg-gradient-to-r ${selectedCharacter.color} hover:scale-105 rounded-xl transition-all duration-200 font-bold text-white shadow-lg hover:shadow-xl relative overflow-hidden group`}
                >
                  <span className="relative z-10">Confirm {selectedCharacter.name}</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </div>
            </div>
          )}
        </div>

        {hoveredCard && !showStats && (
          <div 
            className="fixed pointer-events-none z-[60] bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-xl p-3 shadow-2xl"
            style={{
              left: tooltipPosition.x + 15,
              top: tooltipPosition.y - 10,
            }}
          >
            <div className="text-white text-sm space-y-1">
              <div className="font-bold">
                {characters.find(c => c.id === hoveredCard)?.name}
              </div>
              <div className="text-slate-400 text-xs">
                Click to view detailed information
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterSelectionv2;