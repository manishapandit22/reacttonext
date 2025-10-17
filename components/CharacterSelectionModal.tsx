import React, { useState, useEffect } from 'react';
import { X, Sword, Shield, Target, Zap, Star, ArrowRight, Sparkles, Crown, Heart } from 'lucide-react';

const CharacterSelectionModal = ({ 
  isOpen, 
  onClose, 
  onCharacterSelect,
  availableCharacters = []
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [hoveredCharacter, setHoveredCharacter] = useState(null);
  const [animationPhase, setAnimationPhase] = useState('entering');

  useEffect(() => {
    if (isOpen) {
      setAnimationPhase('entering');
      setTimeout(() => setAnimationPhase('active'), 100);
    } else {
      setAnimationPhase('exiting');
    }
  }, [isOpen]);

  const generateRandomStats = () => ({
    str: Math.floor(Math.random() * 12) + 8, 
    dex: Math.floor(Math.random() * 12) + 8,
    con: Math.floor(Math.random() * 12) + 8,
    int: Math.floor(Math.random() * 12) + 8,
    wis: Math.floor(Math.random() * 12) + 8,
    cha: Math.floor(Math.random() * 12) + 8
  });

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'from-amber-400 via-yellow-500 to-orange-600';
      case 'epic': return 'from-purple-500 via-violet-600 to-indigo-700';
      case 'rare': return 'from-blue-400 via-cyan-500 to-teal-600';
      default: return 'from-slate-400 via-gray-500 to-zinc-600';
    }
  };

  const getElementIcon = (element) => {
    switch (element) {
      case 'light': return <Star className="w-4 h-4 text-yellow-300" />;
      case 'nature': return <Shield className="w-4 h-4 text-green-300" />;
      case 'wind': return <Target className="w-4 h-4 text-sky-300" />;
      case 'shadow': return <Zap className="w-4 h-4 text-purple-300" />;
      default: return <Sword className="w-4 h-4 text-red-300" />;
    }
  };

  const getStatModifier = (stat) => {
    const modifier = Math.floor((stat - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  const StatDisplay = ({ label, value }) => (
    <div className="flex flex-col items-center p-2 bg-black/30 rounded-lg border border-white/10">
      <div className="text-xs text-white/60 uppercase tracking-wide font-medium">{label}</div>
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-xs text-cyan-300 font-medium">{getStatModifier(value)}</div>
    </div>
  );

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    setTimeout(() => {
      onCharacterSelect(character);
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 transition-all duration-500 ${
      animationPhase === 'active' ? 'backdrop-blur-md bg-black/40' : 'backdrop-blur-none bg-black/0'
    }`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-80 sm:h-80 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className={`relative w-full max-w-7xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl transition-all duration-700 transform ${
        animationPhase === 'active' 
          ? 'scale-100 opacity-100 translate-y-0' 
          : 'scale-95 opacity-0 translate-y-8'
      }`} 
      style={{ 
        background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 50%, rgba(15,23,42,0.95) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}>
        
        <div className="relative p-4 sm:p-6 lg:p-8 border-b border-white/10">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/10 hover:bg-red-500/20 transition-all duration-200 group"
          >
            <X className="w-5 h-5 text-white group-hover:text-red-300 group-hover:rotate-90 transition-all duration-200" />
          </button>
          
          <div className="text-center pr-12">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-300 to-red-400 bg-clip-text text-transparent">
                Choose Your Hero
              </h1>
              <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
            </div>
            <p className="text-white/70 text-sm sm:text-base lg:text-lg">Forge your legend, shape your destiny</p>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {availableCharacters.map((character, index) => {
              const stats = generateRandomStats();
              return (
                <div
                  key={character.id}
                  className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border transition-all duration-500 cursor-pointer transform hover:scale-105 active:scale-95 ${
                    selectedCharacter?.id === character.id 
                      ? 'border-cyan-400/50 shadow-lg shadow-cyan-400/25 ring-2 ring-cyan-400/30' 
                      : 'border-white/20 hover:border-white/40'
                  } ${animationPhase === 'active' ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 50%, rgba(30,41,59,0.8) 100%)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    animationDelay: `${index * 100}ms`
                  }}
                  onMouseEnter={() => setHoveredCharacter({...character, stats})}
                  onMouseLeave={() => setHoveredCharacter(null)}
                  onClick={() => handleCharacterSelect({...character, stats})}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(character.rarity)} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className="relative h-32 sm:h-40 lg:h-48 bg-gradient-to-b from-white/5 to-black/20 flex items-center justify-center overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-t ${getRarityColor(character.rarity)} opacity-20`} />
                    <div className="text-4xl sm:text-5xl lg:text-6xl opacity-80 group-hover:scale-110 transition-transform duration-300 filter drop-shadow-lg">
                      {character.displayIcon || '⚔️'}
                    </div>
                    
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gradient-to-r ${getRarityColor(character.rarity)} text-white shadow-lg`}>
                      {character.rarity}
                    </div>
                    
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/20">
                      {getElementIcon(character.element)}
                      <span className="text-white/90 text-xs capitalize font-medium">{character.element}</span>
                    </div>

                    {character.isEnemy && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-red-500/80 backdrop-blur-sm border border-red-400/50">
                        <span className="text-white text-xs font-bold">ENEMY</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 sm:p-4 space-y-3">
                    <div className="text-center">
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-200 transition-colors truncate">
                        {character.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/60 font-medium">{character.class}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                      <StatDisplay label="STR" value={stats.str} />
                      <StatDisplay label="DEX" value={stats.dex} />
                      <StatDisplay label="CON" value={stats.con} />
                      <StatDisplay label="INT" value={stats.int} />
                      <StatDisplay label="WIS" value={stats.wis} />
                      <StatDisplay label="CHA" value={stats.cha} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <p className="text-xs text-white/50 uppercase tracking-wide font-medium">Abilities</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {character.abilities?.slice(0, 3).map((ability, i) => (
                          <span key={i} className="px-2 py-1 text-xs bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/20 rounded-md text-cyan-200 font-medium">
                            {ability}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="w-full mt-3 py-2 sm:py-3 px-4 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-500/40 hover:to-blue-500/40 border border-cyan-400/40 rounded-lg text-white font-bold text-sm sm:text-base transition-all duration-200 group-hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg">
                      <Heart className="w-4 h-4" />
                      Select Hero
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {hoveredCharacter && (
          <div className="hidden lg:block absolute bottom-4 left-4 right-4 p-4 rounded-2xl border border-white/20 bg-gradient-to-r from-black/40 to-slate-800/40 backdrop-blur-md transform transition-all duration-300 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-bold text-white">{hoveredCharacter.name}</h4>
                  <span className="text-sm text-white/60">•</span>
                  <span className="text-sm text-cyan-300 font-medium">{hoveredCharacter.class}</span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">{hoveredCharacter.description}</p>
              </div>
              <div className="flex items-center gap-4 ml-4">
                <div className="text-center">
                  <div className="text-2xl mb-1">{hoveredCharacter.displayIcon}</div>
                  <div className="text-xs text-white/50">Level 1</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default CharacterSelectionModal;