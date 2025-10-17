import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Shield, Sword, Package, Star, StarOff, Loader2, User, Zap, Award, Heart, BookOpen } from 'lucide-react';

const mockCharacter = {
  name: "Jag",
  image: null,
  level: 2,
  class: "Fighter",
  HP: 16,
  max_hp: 16,
  AC: 10,
  abilities: {
    strength: { score: 16, modifier: 3 },
    dexterity: { score: 10, modifier: 0 },
    constitution: { score: 16, modifier: 3 },
    intelligence: { score: 8, modifier: -1 },
    wisdom: { score: 12, modifier: 1 },
    charisma: { score: 7, modifier: -2 },
  },
  skills: {
    Athletics: { modifier: 3 },
    Intimidation: { modifier: -2 },
    Perception: { modifier: 1 },
    Survival: { modifier: 1 },
  },
  actions: {
    "Great Sword Attack": 1,
    "Second Wind": 1,
    "Action Surge": 1,
  }
};

const mockInventory = [
  {
    item_id: 1,
    item_name: "Great Sword",
    category: "weapon_2h",
    equipable: true,
    equipped: true,
    quantity: 1,
  },
  {
    item_id: 2,
    item_name: "Magnifying Glass",
    category: "equipment",
    equipable: false,
    equipped: false,
    quantity: 1,
  },
  {
    item_id: 3,
    item_name: "Chain Mail",
    category: "armor",
    equipable: true,
    equipped: false,
    quantity: 1,
  },
  {
    item_id: 4,
    item_name: "Health Potion",
    category: "consumable",
    equipable: false,
    equipped: false,
    quantity: 2,
  },
  {
    item_id: 5,
    item_name: "Rope",
    category: "equipment",
    equipable: false,
    equipped: false,
    quantity: 1,
  },
  {
    item_id: 6,
    item_name: "Torch",
    category: "equipment",
    equipable: false,
    equipped: false,
    quantity: 3,
  },
];

const mockStoryData = {
  GP: 0,
  inventory: mockInventory,
};

const GameSidebar = ({
  isOpen,
  setIsOpen,
}) => {
  const storyData = mockStoryData;
  const character = mockCharacter;

  const [activeTab, setActiveTab] = useState('character');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [equipmentLoading, setEquipmentLoading] = useState({});
  const [equipFeedback, setEquipFeedback] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  const inventory = storyData?.inventory || [];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
      setShowItemDetails(false);
      setSelectedItem(null);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getNormalizedCategory = (item) => {
    if (!item || !item.category) return 'Other';
    const category = item.category.toLowerCase();
    switch (category) {
      case 'weapon':
      case 'weapon_1h':
      case 'weapon_2h':
        return 'Weapon';
      case 'armor':
        return 'Armor';
      case 'equipment':
      case 'equipment_1h':
      case 'equipment_2h':
        return 'Equipment';
      case 'consumable':
        return 'Consumable';
      case 'other':
        return 'Other';
      default:
        return item.category.charAt(0).toUpperCase() + item.category.slice(1);
    }
  };

  const filteredInventory = useMemo(() => {
    let filtered = [...inventory];
    if (searchTerm && searchTerm.trim()) {
      filtered = filtered.filter(item =>
        item?.item_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => {
        const itemCategory = getNormalizedCategory(item);
        return itemCategory === selectedCategory;
      });
    }
    filtered = filtered.filter(item => (item.quantity === undefined || item.quantity > 0));
    return filtered;
  }, [inventory, searchTerm, selectedCategory]);

  const categories = useMemo(() => [
    'All',
    ...Array.from(
      new Set(
        inventory
          .filter(item => (item.quantity === undefined || item.quantity > 0))
          .map(item => getNormalizedCategory(item))
      )
    ),
  ], [inventory]);

  const handleEquipToggle = async (item) => {
    if (!item.equipable) return;
    const itemId = item.item_id;
    setEquipmentLoading(prev => ({ ...prev, [itemId]: true }));

    setTimeout(() => {
      const updatedInventory = inventory.map(invItem =>
        invItem.item_id === itemId
          ? { ...invItem, equipped: !invItem.equipped }
          : invItem
      );
      storyData.inventory = updatedInventory;
      setEquipFeedback(prev => ({
        ...prev,
        [itemId]: !item.equipped ? 'equipped' : 'unequipped'
      }));
      setEquipmentLoading(prev => ({ ...prev, [itemId]: false }));
      setTimeout(() => {
        setEquipFeedback(prev => ({
          ...prev,
          [itemId]: null
        }));
      }, 1500);
    }, 600);
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'weapon':
      case 'weapon_1h':
      case 'weapon_2h':
        return <Sword className="h-4 w-4" />;
      case 'armor':
        return <Shield className="h-4 w-4" />;
      case 'consumable':
        return <Heart className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getAbilityIcon = (ability) => {
    switch (ability.toLowerCase()) {
      case 'strength': return <Zap size={14} className="text-red-400" />;
      case 'dexterity': return <Award size={14} className="text-green-400" />;
      case 'constitution': return <Heart size={14} className="text-red-400" />;
      case 'intelligence': return <BookOpen size={14} className="text-blue-400" />;
      case 'wisdom': return <Award size={14} className="text-yellow-400" />;
      case 'charisma': return <User size={14} className="text-purple-400" />;
      default: return <Award size={14} className="text-gray-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1050] flex">
      <div
        className="flex-1 bg-black/80 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      <div className={`w-96 bg-gradient-to-b from-slate-900 via-slate-800 to-black text-white shadow-2xl transform transition-transform duration-300 ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      } overflow-hidden flex flex-col border-l-2 border-purple-500/30`}>

        <div className="relative h-48 border-b-2 border-purple-500/30">
          <img
            src="https://media.istockphoto.com/id/688410346/vector/chinese-style-fantasy-scenes.jpg?s=2048x2048&w=is&k=20&c=FFVZk7bzXKtBspWKtpQE8lfl8NqN4q8nVzB7iXctpzY="
            alt="Fantasy Scene"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'center' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors border border-purple-500/30 z-10"
          >
            <X className="h-5 w-5 text-purple-300" />
          </button>
          <div className="relative  z-10 flex flex-col items-center justify-end h-full pb-4">
            {/* <div className="w-16 h-16 mb-2 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center border-2 border-yellow-400/50 shadow-lg">
              <User className="h-8 w-8 text-white" />
            </div> */}
            <div className="text-lg font-bold text-white drop-shadow-lg">
              {character.name}
            </div>
            <div className="text-sm text-yellow-200 mt-1">
              Level {character.level} {character.class}
            </div>
            <div className="mt-2 text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-1">
                DAGONHOLD v2
              </h1>
              <p className="text-sm text-purple-200 italic">
                a v2 exploration of the 'survivor of dagonhold'
              </p>
            </div>
          </div>
        </div>

        <div className="flex border-b-2 border-purple-500/30 bg-black/30">
          <button
            onClick={() => setActiveTab('character')}
            className={`flex-1 flex items-center justify-center gap-2 p-4 transition-all ${
              activeTab === 'character'
                ? 'bg-purple-600/30 text-white border-b-2 border-purple-400'
                : 'text-purple-300 hover:text-white hover:bg-purple-600/20'
            }`}
          >
            <User className="h-4 w-4" />
            Character
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 flex items-center justify-center gap-2 p-4 transition-all ${
              activeTab === 'inventory'
                ? 'bg-purple-600/30 text-white border-b-2 border-purple-400'
                : 'text-purple-300 hover:text-white hover:bg-purple-600/20'
            }`}
          >
            <Package className="h-4 w-4" />
            Inventory
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'character' && (
            <div className="p-6 space-y-6">
              {character?.name ? (
                <>
                  <div className="flex justify-center gap-6 mb-6">
                    <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-lg border border-red-500/30">
                      <Heart className="h-5 w-5 text-red-400" />
                      <span className="text-white font-bold">{character.HP}/{character.max_hp}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-lg border border-blue-500/30">
                      <Shield className="h-5 w-5 text-blue-400" />
                      <span className="text-white font-bold">AC: {character.AC || 10}</span>
                    </div>
                  </div>
                  {character.abilities && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-300">
                        <Zap className="h-5 w-5" />
                        Abilities
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(character.abilities).map(([ability, stats]) => (
                          <div key={ability} className="bg-black/40 rounded-lg p-4 text-center border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                            <div className="mb-2">
                              {getAbilityIcon(ability)}
                            </div>
                            <div className="text-xs text-purple-300 uppercase font-semibold mb-1">{ability.slice(0, 3)}</div>
                            <div className="text-2xl font-bold text-white mb-1">{stats.score}</div>
                            <div className={`text-sm px-2 py-1 rounded ${
                              stats.modifier >= 0 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {stats.modifier >= 0 ? '+' : ''}{stats.modifier}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {character.skills && Object.keys(character.skills).length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-300">
                        <Award className="h-5 w-5" />
                        Skills
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(character.skills).map(([skill, stats]) => (
                          <div key={skill} className="bg-black/40 rounded-lg p-4 flex justify-between items-center border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                            <span className="text-white font-medium">{skill}</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                              stats.modifier >= 0 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {stats.modifier >= 0 ? '+' : ''}{stats.modifier}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {character.actions && Object.keys(character.actions).length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-300">
                        <Sword className="h-5 w-5" />
                        Actions
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(character.actions).map(([action, count]) => (
                          <div key={action} className="bg-black/40 rounded-lg p-4 flex justify-between items-center border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                            <span className="text-white font-medium">{action}</span>
                            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm font-bold border border-purple-500/30">
                              {count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center border border-purple-500/30">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400">No character available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-purple-500/30 bg-black/30">
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold text-lg">Currency: {storyData?.GP || 0}</span>
                </div>
              </div>
              <div className="p-4 border-b border-purple-500/30 bg-black/20">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="p-4 border-b border-purple-500/30 bg-black/20">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all font-medium ${
                        selectedCategory === category
                          ? 'bg-purple-600 text-white border border-purple-400'
                          : 'bg-black/50 text-purple-300 hover:bg-black/70 border border-purple-500/30'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item, index) => {
                    const isEquippable = item.equipable || false;
                    const isEquipped = item.equipped || false;
                    const isLoading = equipmentLoading[item.item_id];

                    return (
                      <div key={`${item.item_name}-${index}`} className="p-4 border-b border-purple-500/20 hover:bg-black/30 transition-colors">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className={`p-3 rounded-lg ${
                            item.category?.includes('weapon') ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            item.category === 'armor' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            item.category === 'consumable' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          }`}>
                            {getCategoryIcon(item.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-white text-lg truncate">{item.item_name}</div>
                            <div className="text-sm text-purple-300 capitalize truncate">{item.category.replace('_', ' ')}</div>
                            {item.quantity !== undefined && (
                              <div className="text-xs text-gray-400 mt-1">Quantity: {item.quantity}</div>
                            )}
                          </div>
                          {isEquippable && (
                            <button
                              onClick={() => handleEquipToggle(item)}
                              disabled={isLoading}
                              aria-label={isEquipped ? 'Unequip item' : 'Equip item'}
                              className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-all border ${
                                isEquipped
                                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-yellow-500/30'
                                  : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 border-gray-500/30'
                              }`}
                            >
                              {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : isEquipped ? (
                                <Star className="h-5 w-5 fill-current" />
                              ) : (
                                <StarOff className="h-5 w-5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    <Package className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                    <p className="text-lg">No items found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
      `}</style>
    </div>
  );
};

export default GameSidebar;