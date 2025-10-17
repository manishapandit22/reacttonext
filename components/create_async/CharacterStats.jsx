import React, { useState, useEffect } from "react";
import { AlertTriangle, X, HelpCircle, Sword, Shield, Zap, Target, Eye, Heart } from "lucide-react";
import { useGameContext } from '../../contexts/GameContext';

const CharacterCreatorModal = ({ isOpen, setIsOpen, character, npcImage, onSave }) => {
  const { gameData,setGameData } = useGameContext();
  const [level, setLevel] = useState(1);
  const [characterClass, setCharacterClass] = useState("Fighter");
  const [gender, setGender] = useState("Male");
  const [pointsPool, setPointsPool] = useState(60);
  const [pointsUsed, setPointsUsed] = useState(0);
  const [abilities, setAbilities] = useState(null);
  const [presetMode, setPresetMode] = useState(false);
  const [background, setBackground] = useState("");
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [characterImage, setCharacterImage] = useState(null);

  const abilityDescriptions = {
    Strength: "Governs raw power: melee hit chance and damage, grappling, jumping, breaking objects, and how much gear you can carry.",
    Dexterity: "Controls agility: armor class, initiative, stealth, acrobatics, finesse or ranged weapon attacks, and dodging traps.",
    Constitution: "Measures toughness: your hit‑point total, resistance to poison or fatigue, and concentration on ongoing spells.",
    Intelligence: "Reflects knowledge: recalling lore, solving puzzles, understanding languages or magic theory, and certain investigation checks.",
    Wisdom: "Represents perception and intuition: spotting hidden threats, reading tracks, resisting charm, and guiding divine or nature magic.",
    Charisma: "Embodies force of personality: persuading or deceiving NPCs, rallying allies, channeling divine power, and intimidating foes"
  };

  const abilityIcons = {
    Strength: Sword,
    Dexterity: Target,
    Constitution: Shield,
    Intelligence: Eye,
    Wisdom: Heart,
    Charisma: Zap
  };


  const classPresets = {
    Default: {
      1: { Strength: 10, Dexterity: 10, Constitution: 10, Intelligence: 10, Wisdom: 10, Charisma: 10 },
      2: { Strength: 11, Dexterity: 11, Constitution: 11, Intelligence: 11, Wisdom: 11, Charisma: 11 },
      3: { Strength: 12, Dexterity: 12, Constitution: 12, Intelligence: 12, Wisdom: 12, Charisma: 12 },
      4: { Strength: 13, Dexterity: 13, Constitution: 13, Intelligence: 13, Wisdom: 13, Charisma: 13 },
      5: { Strength: 13, Dexterity: 13, Constitution: 13, Intelligence: 13, Wisdom: 13, Charisma: 13 },
      6: { Strength: 14, Dexterity: 14, Constitution: 14, Intelligence: 14, Wisdom: 14, Charisma: 14 },
      7: { Strength: 14, Dexterity: 14, Constitution: 14, Intelligence: 14, Wisdom: 14, Charisma: 14 },
      8: { Strength: 14, Dexterity: 14, Constitution: 14, Intelligence: 14, Wisdom: 14, Charisma: 14 },
      9: { Strength: 14, Dexterity: 14, Constitution: 14, Intelligence: 14, Wisdom: 14, Charisma: 14 },
      10: { Strength: 14, Dexterity: 14, Constitution: 14, Intelligence: 14, Wisdom: 14, Charisma: 14 }
    },
    Fighter: {
      1: { Strength: 14, Dexterity: 10, Constitution: 14, Intelligence: 8, Wisdom: 7, Charisma: 7 },
      2: { Strength: 16, Dexterity: 10, Constitution: 16, Intelligence: 8, Wisdom: 7, Charisma: 7 },
      3: { Strength: 18, Dexterity: 10, Constitution: 18, Intelligence: 8, Wisdom: 7, Charisma: 7 },
      4: { Strength: 19, Dexterity: 12, Constitution: 19, Intelligence: 8, Wisdom: 7, Charisma: 7 },
      5: { Strength: 20, Dexterity: 13, Constitution: 20, Intelligence: 8, Wisdom: 7, Charisma: 7 },
      6: { Strength: 20, Dexterity: 14, Constitution: 20, Intelligence: 9, Wisdom: 7, Charisma: 8 },
      7: { Strength: 20, Dexterity: 15, Constitution: 20, Intelligence: 9, Wisdom: 8, Charisma: 8 },
      8: { Strength: 20, Dexterity: 16, Constitution: 20, Intelligence: 9, Wisdom: 9, Charisma: 8 },
      9: { Strength: 20, Dexterity: 16, Constitution: 20, Intelligence: 9, Wisdom: 10, Charisma: 8 },
      10: { Strength: 20, Dexterity: 17, Constitution: 20, Intelligence: 9, Wisdom: 10, Charisma: 8 }
    },
    Barbarian: {
      1: { Strength: 15, Dexterity: 10, Constitution: 15, Intelligence: 6, Wisdom: 9, Charisma: 5 },
      2: { Strength: 17, Dexterity: 10, Constitution: 17, Intelligence: 6, Wisdom: 9, Charisma: 5 },
      3: { Strength: 19, Dexterity: 10, Constitution: 19, Intelligence: 6, Wisdom: 9, Charisma: 5 },
      4: { Strength: 20, Dexterity: 11, Constitution: 20, Intelligence: 6, Wisdom: 10, Charisma: 5 },
      5: { Strength: 20, Dexterity: 12, Constitution: 20, Intelligence: 6, Wisdom: 11, Charisma: 6 },
      6: { Strength: 20, Dexterity: 13, Constitution: 20, Intelligence: 6, Wisdom: 12, Charisma: 7 },
      7: { Strength: 20, Dexterity: 14, Constitution: 20, Intelligence: 7, Wisdom: 13, Charisma: 7 },
      8: { Strength: 20, Dexterity: 15, Constitution: 20, Intelligence: 7, Wisdom: 13, Charisma: 7 },
      9: { Strength: 20, Dexterity: 16, Constitution: 20, Intelligence: 7, Wisdom: 13, Charisma: 8 },
      10: { Strength: 20, Dexterity: 16, Constitution: 20, Intelligence: 7, Wisdom: 13, Charisma: 8 }
    },
    Paladin: {
      1: { Strength: 13, Dexterity: 8, Constitution: 12, Intelligence: 8, Wisdom: 7, Charisma: 12 },
      2: { Strength: 15, Dexterity: 8, Constitution: 12, Intelligence: 8, Wisdom: 7, Charisma: 14 },
      3: { Strength: 17, Dexterity: 8, Constitution: 12, Intelligence: 8, Wisdom: 7, Charisma: 16 },
      4: { Strength: 17, Dexterity: 10, Constitution: 14, Intelligence: 8, Wisdom: 7, Charisma: 16 },
      5: { Strength: 18, Dexterity: 10, Constitution: 15, Intelligence: 8, Wisdom: 7, Charisma: 17 },
      6: { Strength: 19, Dexterity: 11, Constitution: 15, Intelligence: 8, Wisdom: 7, Charisma: 18 },
      7: { Strength: 20, Dexterity: 11, Constitution: 15, Intelligence: 8, Wisdom: 7, Charisma: 19 },
      8: { Strength: 20, Dexterity: 11, Constitution: 17, Intelligence: 8, Wisdom: 7, Charisma: 19 },
      9: { Strength: 20, Dexterity: 12, Constitution: 17, Intelligence: 8, Wisdom: 7, Charisma: 19 },
      10: { Strength: 20, Dexterity: 12, Constitution: 17, Intelligence: 8, Wisdom: 7, Charisma: 20 }
    },
    Ranger: {
      1: { Strength: 8, Dexterity: 14, Constitution: 12, Intelligence: 7, Wisdom: 13, Charisma: 6 },
      2: { Strength: 8, Dexterity: 16, Constitution: 12, Intelligence: 7, Wisdom: 15, Charisma: 6 },
      3: { Strength: 8, Dexterity: 18, Constitution: 14, Intelligence: 7, Wisdom: 15, Charisma: 6 },
      4: { Strength: 9, Dexterity: 19, Constitution: 15, Intelligence: 7, Wisdom: 16, Charisma: 6 },
      5: { Strength: 9, Dexterity: 20, Constitution: 16, Intelligence: 7, Wisdom: 17, Charisma: 6 },
      6: { Strength: 9, Dexterity: 20, Constitution: 17, Intelligence: 7, Wisdom: 18, Charisma: 7 },
      7: { Strength: 10, Dexterity: 20, Constitution: 17, Intelligence: 8, Wisdom: 18, Charisma: 7 },
      8: { Strength: 10, Dexterity: 20, Constitution: 18, Intelligence: 8, Wisdom: 19, Charisma: 7 },
      9: { Strength: 10, Dexterity: 20, Constitution: 18, Intelligence: 9, Wisdom: 19, Charisma: 7 },
      10: { Strength: 10, Dexterity: 20, Constitution: 18, Intelligence: 9, Wisdom: 20, Charisma: 7 }
    },
    Rogue: {
      1: { Strength: 5, Dexterity: 15, Constitution: 12, Intelligence: 13, Wisdom: 8, Charisma: 7 },
      2: { Strength: 5, Dexterity: 18, Constitution: 13, Intelligence: 13, Wisdom: 8, Charisma: 7 },
      3: { Strength: 5, Dexterity: 20, Constitution: 13, Intelligence: 15, Wisdom: 8, Charisma: 7 },
      4: { Strength: 5, Dexterity: 20, Constitution: 14, Intelligence: 17, Wisdom: 8, Charisma: 8 },
      5: { Strength: 5, Dexterity: 20, Constitution: 15, Intelligence: 18, Wisdom: 8, Charisma: 9 },
      6: { Strength: 5, Dexterity: 20, Constitution: 16, Intelligence: 18, Wisdom: 9, Charisma: 10 },
      7: { Strength: 5, Dexterity: 20, Constitution: 16, Intelligence: 19, Wisdom: 9, Charisma: 11 },
      8: { Strength: 5, Dexterity: 20, Constitution: 16, Intelligence: 20, Wisdom: 9, Charisma: 12 },
      9: { Strength: 5, Dexterity: 20, Constitution: 16, Intelligence: 20, Wisdom: 10, Charisma: 12 },
      10: { Strength: 5, Dexterity: 20, Constitution: 17, Intelligence: 20, Wisdom: 10, Charisma: 12 }
    },
    Priest: {
      1: { Strength: 12, Dexterity: 8, Constitution: 12, Intelligence: 7, Wisdom: 14, Charisma: 7 },
      2: { Strength: 12, Dexterity: 8, Constitution: 14, Intelligence: 7, Wisdom: 16, Charisma: 7 },
      3: { Strength: 14, Dexterity: 8, Constitution: 14, Intelligence: 7, Wisdom: 18, Charisma: 7 },
      4: { Strength: 15, Dexterity: 9, Constitution: 14, Intelligence: 7, Wisdom: 19, Charisma: 8 },
      5: { Strength: 16, Dexterity: 9, Constitution: 15, Intelligence: 7, Wisdom: 20, Charisma: 8 },
      6: { Strength: 16, Dexterity: 10, Constitution: 16, Intelligence: 7, Wisdom: 20, Charisma: 9 },
      7: { Strength: 16, Dexterity: 11, Constitution: 17, Intelligence: 7, Wisdom: 20, Charisma: 9 },
      8: { Strength: 17, Dexterity: 11, Constitution: 17, Intelligence: 8, Wisdom: 20, Charisma: 9 },
      9: { Strength: 17, Dexterity: 11, Constitution: 17, Intelligence: 8, Wisdom: 20, Charisma: 10 },
      10: { Strength: 17, Dexterity: 11, Constitution: 18, Intelligence: 8, Wisdom: 20, Charisma: 10 }
    }
  };

  const poolByLevel = {
    1: 60,
    2: 64,
    3: 68,
    4: 72,
    5: 75,
    6: 78,
    7: 80,
    8: 82,
    9: 83,
    10: 84
  };

  const classDescriptions = {
    Default: "A versatile character with balanced attributes. Choose this class to create a custom character with unique strengths and abilities.",
    Fighter: "Built around raw Strength (or occasionally Dexterity) and hardy Constitution. Fighters excel at any straight‑up physical contest.",
    Barbarian: "Fueled by towering Strength and an iron Constitution, the Barbarian is an unarmored juggernaut whose rage turns pain into momentum.",
    Paladin: "A Paladin marries Strength with commanding Charisma. Clad in plate and guided by oath‑bound conviction.",
    Ranger: "Leaning on Dexterity and sharp‑eyed Wisdom, Rangers are agile wilderness skirmishers.",
    Rogue: "Driven by razor Dexterity plus a dose of intellect or charm, Rogues specialize in timing and precision.",
    Priest: "Priests focus on devout Wisdom, backed by healthy Constitution. They channel divine energy to heal wounds."
  };

  const classIcons = {
    Default: "👤",
    Fighter: "⚔️",
    Barbarian: "🪓",
    Paladin: "🛡️",
    Ranger: "🏹",
    Rogue: "🗡️",
    Priest: "✨"
  };

  useEffect(() => {
    if (character && character.playable) {
      setCharacterClass(character.class || "Fighter");
      setGender(character.gender || "Male");
      setLevel(character.level || 1);
      setBackground(character.background || "");
      
      if (character.abilities) {
        const abilityScores = {};
        Object.entries(character.abilities).forEach(([key, value]) => {
          abilityScores[key] = typeof value === 'object' ? value.score : value;
        });
        setAbilities(abilityScores);
        setPresetMode(true);
      } else if (character.characterSheet && character.characterSheet.abilities) {
        const abilityScores = {};
        Object.entries(character.characterSheet.abilities).forEach(([key, value]) => {
          abilityScores[key] = typeof value === 'object' ? value.score : value;
        });
        setAbilities(abilityScores);
        setPresetMode(true);
      } else {
        const selectedClass = character.class || "Fighter";
        const selectedLevel = character.level || 1;
        setAbilities(classPresets[selectedClass][selectedLevel]);
        setPresetMode(true);
      }
    } else {
      resetForm();
    }
  }, [character, isOpen]);

  useEffect(() => {
    if (npcImage && Array.isArray(npcImage) && npcImage[0]?.images?.[0]?.file) {
      const file = npcImage[0].images[0].file;
      const reader = new FileReader();
      reader.onload = () => {
        setCharacterImage(reader.result);
      };
      reader.onerror = () => {
        console.error("Failed to read the file");
        setCharacterImage(null);
      };
      reader.readAsDataURL(file);
    } else {
      setCharacterImage(null);
    }
  }, [npcImage]);

  useEffect(() => {
    setPointsPool(poolByLevel[level]);
    if (presetMode || !abilities) {
      setAbilities({ ...classPresets[characterClass][level] });
    }
  }, [level, characterClass, presetMode]);

  useEffect(() => {
    if (abilities) {
      const total = Object.values(abilities).reduce((sum, value) => sum + (value || 0), 0);
      setPointsUsed(total);
    }
  }, [abilities]);

  const handleAbilityChange = (ability, value) => {
    if (presetMode) return;

    const newValue = Math.max(3, Math.min(20, parseInt(value) || 3));
    const currentTotal = Object.values(abilities).reduce((sum, v) => sum + (v || 0), 0) - abilities[ability];
    const newTotal = currentTotal + newValue;

    if (newTotal <= pointsPool || newValue < abilities[ability]) {
      setAbilities({
        ...abilities,
        [ability]: newValue
      });
    }
  };

  const getModifier = (score) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : mod;
  };

  const toggleMode = () => {
    setPresetMode(!presetMode);
    if (!presetMode) {
      setAbilities({ ...classPresets[characterClass][level] });
    }
  };

  const resetForm = () => {
    setCharacterClass("Fighter");
    setGender("Male");
    setLevel(1);
    setBackground("");
    setPresetMode(true);
    setAbilities({ ...classPresets["Fighter"][1] });
    setPointsPool(poolByLevel[1]);
    setPointsUsed(Object.values(classPresets["Fighter"][1]).reduce((sum, v) => sum + v, 0));
    setCharacterImage(null);
  };

  const remainingPoints = pointsPool - pointsUsed;
  const isCharacterComplete = remainingPoints >= 0 && abilities !== null;

  const saveCharacter = () => {
    if (!isCharacterComplete) return;

    const formattedAbilities = Object.entries(abilities).reduce((acc, [key, value]) => {
      acc[key] = {
        score: value,
        modifier: Math.floor((value - 10) / 2)
      };
      return acc;
    }, {});

    const characterData = {
      gender,
      class: characterClass,
      level,
      abilities: formattedAbilities,
      HP: 10 + Math.floor((abilities.Constitution - 10) / 2) * level,
      max_hp: 10 + Math.floor((abilities.Constitution - 10) / 2) * level,
      AC: 10 + Math.floor((abilities.Dexterity - 10) / 2),
      background,
      playable: true,
      name: character?.name || '',
      image_url: characterImage || character?.images?.[0]?.file || ''
    };

    let npcIndex = -1;
    if (character?.id !== undefined) {
      npcIndex = gameData.npcs.findIndex(npc => npc.id === character.id);
    }
    if (npcIndex === -1 && character?.name) {
      npcIndex = gameData.npcs.findIndex(npc => npc.name === character.name);
    }
    if (npcIndex === -1 && character?.index !== undefined) {
      npcIndex = character.index;
    }

    const updatedNpcForSave = npcIndex !== -1
      ? {
          ...gameData.npcs[npcIndex],
          playable: true,
          class: characterClass,
          gender: gender,
          level: level,
          abilities: formattedAbilities,
          HP: characterData.HP,
          max_hp: characterData.max_hp,
          AC: characterData.AC,
          background: background,
          characterSheet: characterData,
        }
      : null;

    setGameData(prevGameData => {
      const updatedNpcs = [...prevGameData.npcs];
      if (npcIndex !== -1 && npcIndex < updatedNpcs.length) {
        updatedNpcs[npcIndex] = updatedNpcForSave || updatedNpcs[npcIndex];
      }
      return {
        ...prevGameData,
        npcs: updatedNpcs
      };
    });

    if (typeof onSave === 'function' && npcIndex !== -1 && updatedNpcForSave) {
      onSave(npcIndex, updatedNpcForSave);
    }

    setIsOpen(false);
  };

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activeTooltip && !e.target.closest('.tooltip-trigger')) {
        setActiveTooltip(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeTooltip]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="character-creator-title"
    >
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-5xl transform overflow-hidden rounded-2xl bg-gray-900 border border-purple-500/30 shadow-2xl transition-all">
          <div className="flex items-center justify-between p-6 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
            <h3
              id="character-creator-title"
              className="text-2xl font-bold text-white flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                <span className="text-white text-lg">⚡</span>
              </div>
              {character && character.playable ? "Edit Character" : "Create New Character"}
            </h3>
            <button
              type="button"
              className="text-gray-400 hover:text-white transition-colors duration-200 p-2"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-6 bg-gray-900">
            <div className="mb-8">
              <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">⚔️</span>
                Choose Your Class
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.keys(classPresets).map((classOption) => (
                  <div
                    key={classOption}
                    onClick={() => {
                      setCharacterClass(classOption);
                      if (presetMode) {
                        setAbilities({ ...classPresets[classOption][level] });
                      }
                      if (character && character.index !== undefined) {
                        setGameData(prevGameData => {
                          const updatedNpcs = [...prevGameData.npcs];
                          if (updatedNpcs[character.index]) {
                            updatedNpcs[character.index] = {
                              ...updatedNpcs[character.index],
                              class: classOption
                            };
                          }
                          return {
                            ...prevGameData,
                            npcs: updatedNpcs
                          };
                        });
                      }
                    }}
                    className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${characterClass === classOption
                      ? 'border-purple-500 bg-gradient-to-br from-purple-900/40 to-blue-900/40 shadow-lg shadow-purple-500/20'
                      : 'border-gray-700 hover:border-purple-400 bg-gray-800/50'
                      }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{classIcons[classOption]}</div>
                      <h3 className="font-bold text-white text-lg mb-1">{classOption}</h3>
                      <p className="text-sm text-gray-300 leading-tight">{classDescriptions[classOption]}</p>
                    </div>
                    {characterClass === classOption && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Level ({level})
                </label>
                <div className="relative">
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                      style={{ width: `${(level / 10) * 100}%` }}
                    ></div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={level}
                    onChange={(e) => setLevel(parseInt(e.target.value))}
                    className="absolute top-0 w-full h-3 opacity-0 cursor-pointer"
                  />
                  <div className="mt-2 flex justify-between text-xs text-gray-400">
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700">
              <div className="flex items-center gap-6">
                <span className="text-sm font-medium text-gray-300">
                  Points Pool: <span className="text-blue-400 font-bold">{pointsPool}</span>
                </span>
                <span className="text-sm font-medium text-gray-300">
                  Used: <span className="text-orange-400 font-bold">{pointsUsed}</span>
                </span>
                <span className={`text-sm font-medium ${remainingPoints >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                  Remaining: <span className="font-bold">{remainingPoints}</span>
                </span>
              </div>
              <div className="flex items-center gap-3 relative">
                <div className="relative group">
                  <span className="text-sm font-medium text-gray-300 cursor-help">Default Mode (untick for Custom input)</span>
                  <div className="absolute hidden group-hover:block z-20 w-72 p-3 bg-gray-800 rounded-lg shadow-xl border border-purple-500/30 text-sm text-gray-200 left-0 transform -translate-x-1/2 mt-2">
                    Untick this if you wish to carefully design your character template by customizing stats and staying away from well-established character types/archetypes.
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 bg-gray-800 border-t border-l border-purple-500/30"></div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={presetMode}
                    onChange={toggleMode}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">⚡</span>
                Abilities
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {abilities && Object.keys(abilities).map((ability) => {
                  const IconComponent = abilityIcons[ability] || HelpCircle;
                  return (
                    <div
                      key={ability}
                      className="p-4 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-purple-500/50 transition-all duration-200"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2 tooltip-trigger">
                          <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
                            <IconComponent className="h-4 w-4 text-purple-400" />
                          </div>
                          <div>
                            <label className="font-medium text-gray-200 text-sm uppercase tracking-wide">{ability}</label>
                            <div
                              className="relative cursor-help"
                              onMouseEnter={() => setActiveTooltip(ability)}
                              onMouseLeave={() => setActiveTooltip(null)}
                            >
                              <HelpCircle className="h-3 w-3 text-gray-500 inline ml-1" />
                              {activeTooltip === ability && (
                                <div className="absolute z-50 w-72 p-3 bg-gray-800 rounded-lg shadow-xl border border-purple-500/30 text-sm text-gray-200 left-0 transform -translate-x-1/2 mt-2">
                                  {abilityDescriptions[ability]}
                                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 bg-gray-800 border-t border-l border-purple-500/30"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">{abilities[ability]}</div>
                        <div className="text-sm text-gray-400">
                          {getModifier(abilities[ability])}
                        </div>
                        <input
                          type="number"
                          value={abilities[ability] || ''}
                          onChange={(e) => handleAbilityChange(ability, e.target.value)}
                          min="3"
                          max="20"
                          disabled={presetMode}
                          className={`w-full mt-2 p-2 text-center border rounded-lg ${presetMode
                            ? 'bg-gray-700 border-gray-600 text-gray-400'
                            : 'bg-gray-800 border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                            } outline-none transition-all duration-200`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Background Story
              </label>
              <textarea
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="w-full p-4 border border-gray-700 rounded-lg bg-gray-800 text-white h-32 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                placeholder="Tell us about your character's history and motivations..."
              />
            </div>

            {remainingPoints < 0 && (
              <div className="flex items-center p-4 mb-6 text-red-400 rounded-lg bg-gray-800 animate-pulse">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">
                  You've exceeded your ability point pool by {Math.abs(remainingPoints)} points.
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 bg-gradient-to-r from-purple-900/20 to-blue-900/20 px-6 py-4 border-t border-purple-500/20">
            <button
              type="button"
              className="py-2 px-4 bg-gradient-to-tr from-jacarta-600 to bg-jacarta-700 hover:bg-gray-600 text-white rounded transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`py-2 px-4 rounded transition-all duration-200 ${isCharacterComplete
                ? 'bg-purple-600 hover:bg-purple-700 text-white transform hover:scale-105'
                : ' text-gray-400 bg-gradient-to-tr from-jacarta-600 to bg-jacarta-700 cursor-not-allowed'
                }`}
              disabled={!isCharacterComplete}
              onClick={saveCharacter}
            >
              {character && character.playable ? "Update Character" : "Create Character"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreatorModal;