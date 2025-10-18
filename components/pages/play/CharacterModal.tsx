import React, { useState, useEffect, useCallback } from 'react';
import { X, Shield, Sword, User, Zap, Award, Heart, BookOpen } from 'lucide-react';

const CharacterModal = ({ isOpen, setIsOpen, character, abilityDeltas = {} }) => {
 
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const handleEscapeKey = useCallback((e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  }, [handleClose]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  if (!isOpen) return null;

  const StatBlock = ({ label, value, icon }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
        {icon && <span className="text-purple-500">{icon}</span>}
        {label}
      </span>
      <span className="text-gray-600 dark:text-gray-400 font-mono">{value}</span>
    </div>
  );

  const Section = ({ title, icon, children, color = "purple" }) => {
    const colorClasses = {
      purple: "from-purple-500/20 to-purple-600/20 text-purple-500",
      blue: "from-blue-500/20 to-blue-600/20 text-blue-500",
      red: "from-red-500/20 to-red-600/20 text-red-500",
      green: "from-green/20 to-green-600/20 text-green",
      amber: "from-amber-500/20 to-amber-600/20 text-amber-500"
    };
    
    return (
      <div className="mt-4 bg-white/5 backdrop-blur-sm rounded-xl border border-gray-200/10 dark:border-purple-900/20 shadow-md overflow-hidden">
        <div className={`flex items-center gap-2 p-3 border-b border-gray-200/20 dark:border-gray-800/30 bg-gradient-to-r ${colorClasses[color]}`}>
          <div className="p-1.5 rounded-lg bg-white/10">
            {icon}
          </div>
          <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
            {title}
          </h4>
        </div>
        <div className="p-3 sm:p-4">{children}</div>
      </div>
    );
  };

  const formatModifier = (modifier) => {
    const numModifier = Number(modifier);
    
    if (numModifier >= 0) {
      return `+${numModifier}`;
    } else {
      return String(numModifier);
    }
  };

  const AbilityScore = ({ ability, stats }) => {
    const getAbilityIcon = (ability) => {
      switch(ability.toLowerCase()) {
        case 'strength': return <Zap size={14} className="sm:w-4 sm:h-4" />;
        case 'dexterity': return <Award size={14} className="sm:w-4 sm:h-4" />;
        case 'constitution': return <Heart size={14} className="sm:w-4 sm:h-4" />;
        case 'intelligence': return <BookOpen size={14} className="sm:w-4 sm:h-4" />;
        case 'wisdom': return <Award size={14} className="sm:w-4 sm:h-4" />;
        case 'charisma': return <User size={14} className="sm:w-4 sm:h-4" />;
        default: return <Award size={14} className="sm:w-4 sm:h-4" />;
      }
    };
    const delta = abilityDeltas?.[ability] || 0;
    const modifier = Number(stats.modifier);
    
    return (
      <div className="p-2 sm:p-3 rounded-lg bg-gray-50 dark:bg-black/20 flex flex-col items-center relative">
        <div className="p-1.5 sm:p-2 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 text-purple-500 mb-1">
          {getAbilityIcon(ability)}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium text-center">{ability.slice(0, 3)}</p>
        <p className={`text-xs sm:text-sm font-medium ${modifier >= 0 ? 'text-green' : 'text-red-500'}`}>
          {formatModifier(modifier)}
        </p>
        <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">{stats.score}</p>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-[3050] overflow-y-auto flex items-start sm:items-center justify-center" 
      role="dialog" 
      aria-modal="true"
      aria-labelledby="character-modal-title"
      onKeyDown={handleEscapeKey}
      onClick={handleBackdropClick}
    >
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`} />
      
      <div className="flex min-h-full items-start sm:items-center justify-center p-2 sm:p-4 w-full">
        <div 
          className={`relative w-full max-w-4xl transform rounded-t-2xl sm:rounded-2xl bg-white/5 dark:bg-gray-900/50 backdrop-blur-md border border-gray-200/20 dark:border-purple-900/20 shadow-2xl transition-all duration-300 overflow-hidden mt-8 sm:mt-0 ${
            isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{ maxHeight: 'calc(100vh - 2rem)' }}
        >
          {character?.name ? (
            <>
              {/* Character Header */}
              <div className="relative">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 to-transparent"></div>
                
                <div className="relative flex flex-col md:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-6 pt-12 sm:pt-6">
                  {/* Close button - Fixed positioning for mobile */}
                  <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all duration-200 z-10 shadow-lg border border-white/20"
                    aria-label="Close modal"
                    type="button"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  
                  {/* Character Image */}
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 blur-md opacity-30"></div>
                    <div className="relative z-10">
                      {
                        character.image && character.image.url ? (
                        <img
                        src={character.image?.url || character.image }
                        alt={`${character.name}'s portrait`}
                        width={164}
                        loading='lazy'
                        height={164}
                        className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white/20 shadow-xl"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      /> 
                        )
                        : 
                        (
                          <img 
                          src={"/img/hero/badge.png"}
                          alt={`${character.name}'s portrait`}
                          width={164}
                          loading='lazy'
                          height={164}
                          className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white/20 shadow-xl"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                          />
                        )
                      }
                    </div>
                  </div>
                  
                  {/* Character Info */}
                  <div className="text-center">
                    <h3 
                      id="character-modal-title"
                      className="text-2xl sm:text-3xl md:text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 leading-tight"
                    >
                      {character.name}
                    </h3>
                    <p className="text-base sm:text-lg text-gray-300 mb-2 sm:mb-3">
                      Level {character.level} {character.class}
                    </p>
                    
                    {/* Character Stats */}
                    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                      <div className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-500 flex items-center gap-1.5">
                        <Heart size={14} className="sm:w-4 sm:h-4" />
                        <span className="font-medium text-sm sm:text-base">HP: </span>
                        <span className="text-sm sm:text-base">{character.HP}/{character.max_hp}</span>
                      </div>
                      
                      <div className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-500 flex items-center gap-1.5">
                        <Shield size={14} className="sm:w-4 sm:h-4" />
                        <span className="font-medium text-sm sm:text-base">AC: </span>
                        <span className="text-sm sm:text-base">{character.AC || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Character Content */}
              <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700" 
                   style={{ maxHeight: 'calc(100vh - 280px)' }}>
                {/* Abilities */}
                {character.abilities && Object.keys(character.abilities).length > 0 && (
                  <Section title="Abilities" icon={<Zap size={16} className="sm:w-[18px] sm:h-[18px]" />} color="purple">
                    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
                      {Object.entries(character.abilities).map(([ability, stats]) => (
                        <AbilityScore key={ability} ability={ability} stats={stats} />
                      ))}
                    </div>
                  </Section>
                )}

                {/* Actions */}
                {character.actions && Object.keys(character.actions).length > 0 && (
                  <Section title="Actions" icon={<Sword size={16} className="sm:w-[18px] sm:h-[18px]" />} color="red">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {Object.entries(character.actions).map(([action, count]) => (
                        <div key={action} className="p-2.5 sm:p-3 rounded-lg bg-gray-50 dark:bg-black/20">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Action</p>
                          <div className="flex justify-between items-center">
                            <p className="font-medium text-gray-800 dark:text-white text-sm sm:text-base truncate pr-2">{action}</p>
                            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-xs sm:text-sm font-medium flex-shrink-0">
                              {count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Skills */}
                {character.skills && Object.keys(character.skills).length > 0 && (
                  <Section title="Skills" icon={<Award size={16} className="sm:w-[18px] sm:h-[18px]" />} color="green">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {Object.entries(character.skills).map(([skill, stats]) => {
                        const modifier = Number(stats.modifier);
                        return (
                          <div key={skill} className="p-2.5 sm:p-3 rounded-lg bg-gray-50 dark:bg-black/20">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Skill</p>
                            <div className="flex justify-between items-center">
                              <p className="font-medium text-gray-800 dark:text-white text-sm sm:text-base truncate pr-2">{skill}</p>
                              <span className={`px-2 py-0.5 rounded-full ${
                                modifier >= 0 
                                  ? 'bg-green/10 text-green' 
                                  : 'bg-red-500/10 text-red-500'
                              } text-xs sm:text-sm font-medium flex-shrink-0`}>
                                {formatModifier(modifier)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Base Score: {stats.score}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </Section>
                )}
                
                {/* Character Details */}
                <Section title="Character Details" icon={<User size={16} className="sm:w-[18px] sm:h-[18px]" />} color="blue">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {character.gender && (
                      <div className="p-2.5 sm:p-3 rounded-lg bg-gray-50 dark:bg-black/20">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
                        <p className="font-medium text-gray-800 dark:text-white text-sm sm:text-base">{character.gender}</p>
                      </div>
                    )}
                    {character.background && (
                      <div className="p-2.5 sm:p-3 rounded-lg bg-gray-50 dark:bg-black/20">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Background</p>
                        <p className="font-medium text-gray-800 dark:text-white text-sm sm:text-base">{character.background}</p>
                      </div>
                    )}
                  </div>
                </Section>
              </div>
            </>
          ) : (
            <div className="relative flex flex-col items-center justify-center py-12 sm:py-16 px-4">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all duration-200 shadow-lg border border-white/20"
                aria-label="Close modal"
                type="button"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              
              <div className="p-4 sm:p-6 rounded-full bg-gray-100/10 dark:bg-gray-800/20 mb-4">
                <User className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                No Character Available
              </p>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 text-center max-w-md px-2">
                Create a character to access your character sheet and begin your adventure.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterModal;