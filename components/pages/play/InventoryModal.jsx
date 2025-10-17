import React, { useState, useEffect } from 'react';
import { X, Search, Shield, Sword, Package, Info, Star, StarOff, Loader2 } from 'lucide-react';
import useAxiosWithAuth from '@/hooks/useAxiosWithAuth';

const InventoryModal = ({ isOpen, setIsOpen, storyData, storyId, selectedCategory, setSelectedCategory, onInventoryUpdate, onUserInteraction, fetchStoryData }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [equipmentLoading, setEquipmentLoading] = useState({});
  const [equipFeedback, setEquipFeedback] = useState({});
  const inventory = storyData?.inventory || [];
  const [isVisible, setIsVisible] = useState(false);

const handleEquipToggle = async (item) => {
  if (!item || !item.equipable) return;
  
  const itemId = item.item_id;
  const isCurrentlyEquipped = item.equipped || false;
  const action = isCurrentlyEquipped ? 'unequip' : 'equip';
  
  if (!isCurrentlyEquipped && !canEquipItem(item)) {
    const restrictions = getEquipmentRestrictions();
    let errorMessage = '';
    
    if (item.category === 'armor' && restrictions.equippedArmor >= 1) {
      errorMessage = 'Cannot equip: Only 1 armor piece allowed';
    } else if (item.category === 'weapon_2h' && (restrictions.equippedTwoHandedWeapons >= 1 || restrictions.equippedWeapons > 0)) {
      errorMessage = 'Cannot equip: Two-handed weapon conflicts with existing weapons';
    } else if ((item.category === 'weapon' || item.category === 'weapon_1h') && restrictions.equippedTwoHandedWeapons > 0) {
      errorMessage = 'Cannot equip: Two-handed weapon already equipped';
    } else if ((item.category === 'weapon' || item.category === 'weapon_1h') && restrictions.equippedWeapons >= 2) {
      errorMessage = 'Cannot equip: Maximum 2 weapons allowed';
    } else {
      errorMessage = 'Cannot equip this item';
    }
    
    setEquipFeedback(prev => ({
      ...prev,
      [itemId]: { type: 'error', message: errorMessage }
    }));
    
    setTimeout(() => {
      setEquipFeedback(prev => ({
        ...prev,
        [itemId]: null
      }));
    }, 3000);
    
    return;
  }
  
  setEquipmentLoading(prev => ({ ...prev, [itemId]: true }));
  setEquipFeedback(prev => ({ ...prev, [itemId]: null }));
  
  try {
    const response = await axiosInstance.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/equipment/manage/`,
      {
        story_id: storyId?.story_id,
        item_id: itemId,
        action: action
      }
    );
    
    if (response.data && response.status === 200) {
      const successMessage = action === 'equip' 
        ? `${item.item_name} equipped successfully!` 
        : `${item.item_name} unequipped successfully!`;
        
      setEquipFeedback(prev => ({
        ...prev,
        [itemId]: { type: 'success', message: successMessage }
      }));
      
      if (onInventoryUpdate && typeof onInventoryUpdate === 'function') {
        onInventoryUpdate();
      }

      if (fetchStoryData && typeof fetchStoryData === 'function') {
  fetchStoryData(storyId?.story_id);
}

      if (onUserInteraction && typeof onUserInteraction === 'function') {
        onUserInteraction('equipment_toggle', {
          item: item.item_name,
          action: action,
          category: item.category
        });
      }
      
      setTimeout(() => {
        setEquipFeedback(prev => ({
          ...prev,
          [itemId]: null
        }));
      }, 2000);
      
    } else {
      throw new Error('Unexpected response format');
    }
  } catch (error) {
    console.error('Equipment toggle error:', error);
    
    let errorMessage = 'Failed to update equipment';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    setEquipFeedback(prev => ({
      ...prev,
      [itemId]: { type: 'error', message: errorMessage }
    }));
    
    setTimeout(() => {
      setEquipFeedback(prev => ({
        ...prev,
        [itemId]: null
      }));
    }, 4000);
  } finally {
    setEquipmentLoading(prev => ({ ...prev, [itemId]: false }));
  }
};

  const getEquipmentRestrictions = () => {
    const equippedArmor = inventory.filter(item => 
      item.equipped && item.category === 'armor'
    ).length;
    
    const equippedWeapons = inventory.filter(item => 
      item.equipped && (item.category === 'weapon' || item.category === 'weapon_1h' || item.category === 'weapon_2h')
    ).length;
    
    const equippedTwoHandedWeapons = inventory.filter(item => 
      item.equipped && item.category === 'weapon_2h'
    ).length;

    return {
      canEquipArmor: equippedArmor < 1,
      canEquipWeapon: equippedWeapons < 2,
      canEquipTwoHandedWeapon: equippedTwoHandedWeapons < 1,
      equippedArmor,
      equippedWeapons,
      equippedTwoHandedWeapons
    };
  };

  const canEquipItem = (item) => {
    if (!item.equipable) return false;
    if (item.equipped) return true; 
    
    const restrictions = getEquipmentRestrictions();
    
    if (item.category === 'armor') {
      return restrictions.canEquipArmor;
    }
    
    if (item.category === 'weapon_2h') {
      return restrictions.canEquipTwoHandedWeapon && restrictions.equippedWeapons === 0;
    }
    
    if (item.category === 'weapon' || item.category === 'weapon_1h') {
      return restrictions.canEquipWeapon && restrictions.equippedTwoHandedWeapons === 0;
    }
    
    return true; 
  };

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
      case 'equipment_1h':
      case 'equipment_2h':
        return 'Equipment';
      case 'other':
        return 'Other';
      default:
        return item.category.charAt(0).toUpperCase() + item.category.slice(1);
    }
  };

  const filteredInventory = inventory
    .filter(item => (item.quantity === undefined || item.quantity > 0))
    .filter(item =>
      !searchTerm || item.item_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(item =>
      (selectedCategory ?? 'All') === 'All' || getNormalizedCategory(item) === selectedCategory
    );

  const { axiosInstance } = useAxiosWithAuth();

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


  const parseProperties = (properties) => {
    if (!properties) return null;
    if (typeof properties === 'string') {
      try {
        return JSON.parse(properties);
      } catch (e) {
        console.warn('Failed to parse properties:', properties);
        return null;
      }
    }
    return properties;
  };

  useEffect(() => {
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
  }, [inventory, searchTerm, selectedCategory]);

  const categories = ['All', ...new Set(inventory
    .filter(item => (item.quantity === undefined || item.quantity > 0))
    .map(item => getNormalizedCategory(item))
  )];

   if (!isOpen) return null;

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'weapon':
      case 'weapon_1h':
      case 'weapon_2h':
        return <Sword className="h-4 w-4" />;
      case 'armor':
        return <Shield className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const StatBlock = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">{label}</span>
      <span className="text-gray-600 dark:text-gray-400 font-mono text-sm">{value || 'N/A'}</span>
    </div>
  );

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setShowItemDetails(true);
  };

  const handleBackToList = () => {
    setShowItemDetails(false);
    setSelectedItem(null);
  };

  const getItemDescription = (item) => {
    if (!item) return 'No description available';
    if (item.description) return item.description;
    const properties = parseProperties(item.properties);
    if (properties?.description) return properties.description;
    return 'No description available';
  };

  const getArmorClassDisplay = (item) => {
    if (!item) return 'N/A';
    const properties = parseProperties(item.properties);
    if (properties?.base_ac) {
      return `${properties.base_ac}`;
    }
    if (properties?.armor_class) {
      const ac = properties.armor_class;
      if (typeof ac === 'object' && ac.base !== null && ac.base !== undefined) {
        return `${ac.base}${ac.dex_bonus ? ' (+Dex)' : ''}`;
      }
    }
    if (item.armor_class !== null && item.armor_class !== undefined) {
      return item.armor_class.toString();
    }
    return 'N/A';
  };

  const getDamageDice = (item) => {
    if (!item) return null;
    if (item.damage_dice) return item.damage_dice;
    const properties = parseProperties(item.properties);
    return properties?.damage_dice || null;
  };

  const getDamageType = (item) => {
    if (!item) return null;
    if (item.damage_type) return item.damage_type;
    const properties = parseProperties(item.properties);
    return properties?.damage_type || null;
  };

  const getRange = (item) => {
    if (!item) return null;
    if (item.range) return item.range;
    const properties = parseProperties(item.properties);
    return properties?.range || null;
  };

  const getStealthDisadvantage = (item) => {
    if (!item) return false;
    if (item.stealth_disadvantage !== null && item.stealth_disadvantage !== undefined) {
      return item.stealth_disadvantage;
    }
    const properties = parseProperties(item.properties);
    return properties?.stealth_disadvantage || false;
  };

  const getACBonus = (item) => {
    if (!item) return null;
    const properties = parseProperties(item.properties);
    return properties?.ac_bonus || null;
  };

  const getMaterial = (item) => {
    if (!item) return null;
    const properties = parseProperties(item.properties);
    return properties?.material || null;
  };

  const getHealth = (item) => {
    if (!item) return null;
    if (item.health) return item.health;
    const properties = parseProperties(item.properties);
    return properties?.health || null;
  };

  const formatPropertyName = (key) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderPropertiesTable = (properties, item) => {
    if (!properties || typeof properties !== 'object') return null;
    
    const excludedFields = [
      '_logged_by',
      '_generated_by',
      'armor_class',
      'base_ac',
      'damage_dice',
      'damage_type',
      'range',
      'stealth_disadvantage',
      'ac_bonus',
      'material',
      'description',
      'health',
      'weight' 
    ];
    
    const entries = Object.entries(properties).filter(([key, value]) => {
      return !excludedFields.includes(key) && 
             value !== null && 
             value !== undefined && 
             value !== '';
    });
    
    if (entries.length === 0) return null;
    
    return (
      <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-black/20">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Properties</p>
        <table className="w-full text-xs text-left text-gray-600 dark:text-gray-400 font-mono">
          <tbody>
            {entries.map(([key, value]) => (
              <tr key={key} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                <td className="pr-2 py-1 font-semibold text-purple-700 dark:text-purple-300 align-top">
                  {formatPropertyName(key)}
                </td>
                <td className="py-1 break-all">
                  {typeof value === 'object' && value !== null
                    ? <pre className="whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                    : String(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const EquipToggle = ({ isEquipped, isLoading, onToggle, feedback, disabled, disabledReason }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onToggle}
        disabled={disabled || isLoading}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${disabled && !isEquipped 
            ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-50' 
            : isEquipped 
              ? 'bg-green/80 hover:bg-green' 
              : 'bg-gray-200 hover:bg-gray-300'
          }
          ${isLoading ? 'pointer-events-none' : ''}
        `}
        role="switch"
        aria-checked={isEquipped}
        title={disabled && !isEquipped ? disabledReason : (isEquipped ? 'Unequip' : 'Equip')}
      >
        <span className="sr-only">{isEquipped ? 'Unequip' : 'Equip'}</span>
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 
            transition duration-200 ease-in-out flex items-center justify-center
            ${isEquipped ? 'translate-x-5' : 'translate-x-0'}
          `}
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin text-gray-600" />
          ) : isEquipped ? (
            <Star className="h-3 w-3 text-green fill-current" />
          ) : (
            <StarOff className="h-3 w-3 text-gray-400" />
          )}
        </span>
      </button>
      
      {feedback && (
        <div className={`text-xs px-2 py-1 rounded max-w-32 text-center break-words ${
          feedback.type === 'success' 
            ? 'text-green dark:text-green/40 bg-green dark:bg-green/20' 
            : 'text-red-600 dark:text-red-500 bg-red-500 dark:bg-red-700/20'
        }`}>
          {feedback.message}
        </div>
      )}
      
      {disabled && !isEquipped && disabledReason && (
        <div className="text-xs text-red-500 dark:text-red-500 text-center max-w-24 break-words">
          {disabledReason}
        </div>
      )}
    </div>
  );
};

  const ItemDetails = ({ item }) => {
    if (!item) return null;
    const description = getItemDescription(item);
    const isEquippable = item.equipable || false;
    const isEquipped = item.equipped || false;
    const canEquip = canEquipItem(item);
    const properties = parseProperties(item.properties);
    const damageDice = getDamageDice(item);
    const damageType = getDamageType(item);
    const range = getRange(item);
    const acBonus = getACBonus(item);
    const material = getMaterial(item);
    const health = getHealth(item);

    const showQuantity = item.quantity === undefined || item.quantity > 0;
    const showItemId = showQuantity && item.item_id;

    const isLoading = equipmentLoading[item.item_id];
    const feedback = equipFeedback[item.item_id];
    
    let disabledReason = null;
    if (isEquippable && !isEquipped && !canEquip) {
      if (item.category === 'armor') {
        disabledReason = 'Only 1 armor allowed';
      } else if (item.category === 'weapon_2h') {
        disabledReason = 'Two-handed weapon - only 1 allowed';
      } else if (item.category === 'weapon' || item.category === 'weapon_1h') {
        const restrictions = getEquipmentRestrictions();
        if (restrictions.equippedTwoHandedWeapons > 0) {
          disabledReason = 'Cannot equip with two-handed weapon';
        } else {
          disabledReason = 'Only 2 weapons allowed';
        }
      }
    }

    return (
      <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-gray-200/10 dark:border-purple-900/20 shadow-md">
        <div className="md:hidden mb-4">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-purple-500 hover:text-purple-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to inventory
          </button>
        </div>
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200/20 dark:border-gray-800/30">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 text-purple-500 dark:text-purple-400">
            {getCategoryIcon(item.category)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white break-words">{item.item_name || 'Unknown Item'}</h3>
              {isEquippable && (
                <div className="flex items-center gap-1">
                  {isEquipped ? (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" title="Equipped" />
                  ) : (
                    <StarOff className="h-4 w-4 text-gray-400" title="Not equipped" />
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{item.category?.replace(/_/g, ' ') || 'unknown'}</p>
              {isEquippable && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isEquipped
                    ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                    : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                  }`}>
                  {isEquipped ? 'Equipped' : 'Unequipped'}
                </span>
              )}
            </div>
          </div>
          {isEquippable && (
          <div className="flex flex-col items-center my-4">
            <EquipToggle
              isEquipped={isEquipped}
              isLoading={isLoading}
              onToggle={(e) => {
              e.stopPropagation();
              handleEquipToggle(item);
              }}
              feedback={feedback}
              disabled={!canEquip}
              disabledReason={disabledReason}
            />
          </div>
        )}
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-black/20">
              <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
              <p className="font-semibold text-amber-600 dark:text-amber-500 text-sm">{item.price || 0} gp</p>
            </div>
            {showQuantity && (
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-black/20">
                <p className="text-xs text-gray-500 dark:text-gray-400">Quantity</p>
                <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{item.quantity || 1}</p>
              </div>
            )}
         </div>
          
          {/* Damage Dice Section */}
          {damageDice && (
            <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-black/20">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Damage Dice</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm font-mono">{damageDice}</p>
            </div>
          )}

          {/* Health Section */}
          {health && (
            <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-black/20">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Health</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm">{health}</p>
            </div>
          )}

          {/* Description Section - Only show once */}
          {description && description !== 'No description available' && (
            <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-black/20">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
              <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed pr-2">{description}</p>
              </div>
            </div>
          )}
          
          {material && (
            <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-black/20">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Material</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed capitalize">{material}</p>
            </div>
          )}
          
          {(item.category?.includes('weapon') || damageDice || damageType || range) && (
            <div className="space-y-2 mt-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Sword className="h-4 w-4 text-purple-500" /> Weapon Details
              </h4>
              <div className="bg-gray-50 dark:bg-black/20 rounded-lg p-3">
                {damageType && <StatBlock label="Damage Type" value={damageType} />}
                {range && <StatBlock label="Range" value={range} />}
                {item.weapon_category && <StatBlock label="Weapon Type" value={item.weapon_category?.replace(/_/g, ' ')} />}
              </div>
            </div>
          )}
          
          {(item.category === 'armor' || item.armor_class || properties?.base_ac) && (
            <div className="space-y-2 mt-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-500" /> Armor Details
              </h4>
              <div className="bg-gray-50 dark:bg-black/20 rounded-lg p-3">
                <StatBlock
                  label="Armor Class"
                  value={getArmorClassDisplay(item)}
                />
                {item.str_minimum && <StatBlock label="Min Strength" value={item.str_minimum} />}
                <StatBlock
                  label="Stealth"
                  value={getStealthDisadvantage(item) ? 'Disadvantage' : 'Normal'}
                />
              </div>
            </div>
          )}
          {(item.category?.includes('equipment') || acBonus) && (
            <div className="space-y-2 mt-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Package className="h-4 w-4 text-purple-500" /> Equipment Details
              </h4>
              <div className="bg-gray-50 dark:bg-black/20 rounded-lg p-3">
                {acBonus && <StatBlock label="AC Bonus" value={`+${acBonus}`} />}
              </div>
            </div>
          )}
          {renderPropertiesTable(properties, item)}
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[4050] overflow-y-auto flex items-start sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
      <div className="flex items-start sm:items-center justify-center p-2 sm:p-4 w-full h-full min-h-screen sm:min-h-0">
        <div
          className={`relative w-full max-w-5xl transform rounded-t-2xl sm:rounded-2xl bg-white/5 dark:bg-gray-900/50 backdrop-blur-md border border-gray-200/20 dark:border-purple-900/20 shadow-2xl transition-all duration-300 overflow-hidden mt-1 sm:mt-0 max-h-[100dvh] sm:max-h-[calc(100vh-1rem)] flex flex-col h-[100dvh] sm:h-auto ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          <div className="flex items-center justify-between p-3 sm:p-5 border-b border-gray-200/10 dark:border-gray-800/30 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 sticky top-0 z-10">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
              {storyData?.name ? `${storyData.name}'s Inventory` : 'Inventory'}
            </h2>
            <div className='flex items-center gap-2 sm:gap-4'>
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-600 dark:text-amber-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                <span className='font-medium text-xs sm:text-sm'>Currency: </span>
                <span className='font-bold text-xs sm:text-sm'>{storyData?.GP || 0}</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full bg-gray-200/20 hover:bg-gray-200/30 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-200/20 dark:border-gray-700/30"
                aria-label="Close"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 flex flex-col min-h-0">
            {inventory && inventory.length > 0 ? (
              <>
                <div className={`p-3 sm:p-4 border-b border-gray-200/10 dark:border-gray-800/30 bg-white/5 dark:bg-black/20 ${showItemDetails ? 'hidden md:block' : ''}`}>
                              <div className="flex flex-col gap-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200/20 dark:border-gray-800/30 rounded-lg bg-white/5 dark:bg-black/20 text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Equipment Status Display */}
                <div className="flex gap-2 text-xs">
                  {(() => {
                    const restrictions = getEquipmentRestrictions();
                    return (
                      <>
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          <Shield className="h-3 w-3" />
                          <span>Armor: {restrictions.equippedArmor}/1</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-red-500/10 text-red-600 dark:text-red-400">
                          <Sword className="h-3 w-3" />
                          <span>Weapons: {restrictions.equippedWeapons}/2</span>
                        </div>
                        {restrictions.equippedTwoHandedWeapons > 0 && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400">
                            <Sword className="h-3 w-3" />
                            <span>2H Weapon</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    <div className="flex gap-2 min-w-max">
                      {categories.map(category => (
                        <button
                          key={category}
                          onClick={() => typeof setSelectedCategory === 'function' && setSelectedCategory(category)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 flex-shrink-0
                            ${(selectedCategory ?? 'All') === category
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-200/10 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300 hover:bg-gray-200/20 dark:hover:bg-gray-800/50'
                            }`}
                        >
                          {category === 'All' ? <Package className="h-3.5 w-3.5" /> : getCategoryIcon(category)}
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-1 min-h-0 flex-col md:flex-row">
                <div className={`w-full min-w-0 border-r border-gray-200/10 dark:border-gray-800/30 flex-1 md:flex-none ${showItemDetails ? 'md:w-1/3' : 'md:w-2/3'} ${showItemDetails ? 'hidden md:block' : ''} flex flex-col min-h-0 h-full`}>
                  <div className="h-full min-h-0 max-h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 p-2 md:p-0">
                    {filteredInventory.length > 0 ? (
                      filteredInventory.map((item, index) => {
                        const isEquippable = item.equipable || false;
                        const isEquipped = item.equipped || false;
                        const isLoading = equipmentLoading[item.item_id];
                        const feedback = equipFeedback[item.item_id];
                        const canEquip = canEquipItem(item);
                        const restrictions = getEquipmentRestrictions();
                        
                        // Determine disabled reason
                        let disabledReason = null;
                        if (isEquippable && !isEquipped && !canEquip) {
                          if (item.category === 'armor') {
                            disabledReason = 'Only 1 armor allowed';
                          } else if (item.category === 'weapon_2h') {
                            disabledReason = 'Two-handed weapon - only 1 allowed';
                          } else if (item.category === 'weapon' || item.category === 'weapon_1h') {
                            if (restrictions.equippedTwoHandedWeapons > 0) {
                              disabledReason = 'Cannot equip with two-handed weapon';
                            } else {
                              disabledReason = 'Only 2 weapons allowed';
                            }
                          }
                        }
                        
                        if (item.quantity !== undefined && item.quantity === 0) return null;
                        return (
                          <div
                            key={`${item.item_name}-${index}`}
                            className={`p-3 border-b border-gray-200/10 dark:border-gray-800/30 hover:bg-white/5 dark:hover:bg-white/5 transition-colors
                              ${selectedItem === item ? 'bg-white/10 dark:bg-white/5' : ''}`}
                          >
                            <div className="flex items-center justify-end gap-3">
                              <div
                                className={`p-2 rounded-lg flex-shrink-0 cursor-pointer ${
                                  item.category?.includes('weapon') ? 'bg-red-500/10 text-red-500' :
                                  item.category === 'armor' ? 'bg-blue-500/10 text-blue-500' :
                                  item.category?.includes('equipment') ? 'bg-green-500/10 text-green-500' :
                                  'bg-purple-500/10 text-purple-500'
                                }`}
                                onClick={() => handleItemSelect(item)}
                              >
                                {getCategoryIcon(item.category)}
                              </div>
                              <div
                                className="flex-grow min-w-0 cursor-pointer"
                                onClick={() => handleItemSelect(item)}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <div
                                    className="font-medium text-gray-800 dark:text-white truncate text-sm cursor-pointer relative group"
                                    title={item.item_name || 'Unknown Item'}
                                  >
                                    {item.item_name || 'Unknown Item'}
                                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-20 hidden group-hover:flex px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-black/90 shadow-lg whitespace-pre-line max-w-xs break-words pointer-events-none">
                                      {item.item_name || 'Unknown Item'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{item.category?.replace(/_/g, ' ') || 'unknown'}</span>
                                  {item.quantity !== undefined && item.quantity > 0 && (
                                    <span className="text-xs font-medium bg-gray-200/50 dark:bg-gray-800/50 px-2 py-0.5 rounded-full flex-shrink-0">
                                      x{item.quantity}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isEquippable && (
                                <div className="flex flex-col items-center w-1/2">
                                  <EquipToggle
                                    isEquipped={isEquipped}
                                    isLoading={isLoading}
                                    onToggle={(e) => {
                                      e.stopPropagation();
                                      handleEquipToggle(item);
                                    }}
                                    feedback={feedback}
                                    disabled={!canEquip}
                                    disabledReason={disabledReason}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center gap-2">
                        <Info className="h-8 w-8 text-gray-400" />
                        <p className="text-sm">No items found</p>
                        {searchTerm && (
                          <button
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedCategory('All');
                            }}
                            className="text-purple-500 hover:text-purple-600 text-sm mt-1"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className={`w-full min-w-0 bg-white/5 dark:bg-black/10 flex-1 ${showItemDetails ? '' : 'hidden md:block'} flex flex-col min-h-0 h-full`}>
                  <div className="h-full min-h-0 max-h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 p-2 md:p-0">
                    <div className="p-3 sm:p-5">
                      {selectedItem ? (
                        <ItemDetails item={selectedItem} />
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6">
                          <div className="p-4 rounded-full bg-gray-100/10 dark:bg-gray-800/20 mb-4">
                            <Info className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm sm:text-base">
                            Select an item to view details
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                            Your inventory contains {inventory.filter(item => (item.quantity === undefined || item.quantity > 0)).length} items
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 flex-1 h-full min-h-0">
              <div className="p-6 rounded-full bg-gray-100/10 dark:bg-gray-800/20 mb-4">
                <Package className="h-10 w-10 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                No Inventory Available
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md text-sm sm:text-base">
                Create a character to access your inventory and collect items during your adventure.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>

    </div>
  );
}

export default InventoryModal;