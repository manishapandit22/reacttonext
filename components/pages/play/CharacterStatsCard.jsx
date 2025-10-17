import { Shield, Heart, Zap, Award, BookOpen, User } from 'lucide-react';
import React from 'react'

export default function CharacterStatsCard({ character, click }) {
    // const isStagingOrBackstage = (typeof window !== 'undefined' && (process.env.VERCEL_ENV === 'staging' || window.location.origin === 'https://backstage.openbook.games')) || process.env.VERCEL_ENV === 'staging';
    // if (!isStagingOrBackstage) return null;
    if (!character) return null;

    const formatModifier = (modifier) => {
        const numModifier = Number(modifier);
        
        if (numModifier >= 0) {
            return `+${numModifier}`;
        } else {
            return String(numModifier);
        }
    };

    return (
        <div onClick={click} className="w-full cursor-pointer bg-transparent rounded-lg shadow-lg p-2 flex flex-col items-center text-center">
            <div className="flex items-center gap-3 mb-2">
                    {
                        character.image && character.image.url ? (
                        <img
                        src={character.image?.url || character.image }
                        alt={`${character.name}'s portrait`}
                        loading='lazy'
                        className="w-20 h-20 rounded-full object-cover border-2 border-purple-500 shadow"
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
                          loading='lazy'
                          className="w-20 h-20 rounded-full object-cover border-2 border-purple-500 shadow"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                          />
                        )
                      }
                <div className="flex flex-col items-start">
                    <span className="font-bold text-white text-base bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                        {character.name}
                    </span>
                    <span className="text-xs text-gray-300 mt-0.5">
                        Lv {character.level} {character.class}
                    </span>
                    <div className="flex gap-2 mt-2 justify-center mb-2">
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-semibold">
                            <Heart size={14} /> {character.HP}/{character.max_hp}
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-semibold">
                            <Shield size={14} /> AC:{character.AC || '-'}
                        </div>
                    </div>
                </div>
            </div>
            {character.abilities && (
                <div className="flex gap-2 justify-center mt-1">
                    {Object.entries(character.abilities).map(([ability, stats]) => {
                        const modifier = Number(stats.modifier);
                        return (
                            <div key={ability} className="flex flex-col items-center px-2 bg-gray-900 rounded-lg">
                                <span className={`text-xs font-medium ${modifier >= 0 ? 'text-green' : 'text-red'}`}>
                                    {formatModifier(modifier)}
                                </span>
                                <span className="text-xs text-gray-400 uppercase font-medium">{ability.slice(0, 3)}</span>
                                <span className="font-bold text-white text-sm">{stats.score}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}